
-- 1. Portfolios: account type + margin
ALTER TABLE public.portfolios
  ADD COLUMN IF NOT EXISTS account_type text NOT NULL DEFAULT 'cash'
    CHECK (account_type IN ('cash','margin')),
  ADD COLUMN IF NOT EXISTS margin_multiplier numeric NOT NULL DEFAULT 1
    CHECK (margin_multiplier >= 1 AND margin_multiplier <= 4);

-- 2. Holdings: support short side, realized pnl, borrow fees
ALTER TABLE public.holdings
  ADD COLUMN IF NOT EXISTS side text NOT NULL DEFAULT 'long'
    CHECK (side IN ('long','short')),
  ADD COLUMN IF NOT EXISTS realized_pnl numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS borrow_fee_accrued numeric NOT NULL DEFAULT 0;

-- Drop legacy uniques on (portfolio_id, symbol) if any, then add side-aware unique
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.holdings'::regclass
      AND conname = 'holdings_portfolio_id_symbol_key'
  ) THEN
    ALTER TABLE public.holdings DROP CONSTRAINT holdings_portfolio_id_symbol_key;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS holdings_portfolio_symbol_side_uniq
  ON public.holdings(portfolio_id, symbol, side);

-- 3. Atomic paper order placement with validation
CREATE OR REPLACE FUNCTION public.place_paper_order(
  _portfolio_id uuid,
  _symbol text,
  _side text,        -- 'buy' | 'sell'
  _type text,        -- 'market' | 'limit' | 'stop' | 'stop_limit' | 'trailing_stop'
  _tif text,         -- 'day' | 'gtc' | 'ioc' | 'fok'
  _quantity numeric,
  _limit_price numeric,
  _stop_price numeric,
  _mark_price numeric  -- current market price passed by caller for paper fills
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid;
  v_portfolio public.portfolios%ROWTYPE;
  v_long public.holdings%ROWTYPE;
  v_short public.holdings%ROWTYPE;
  v_fill_price numeric;
  v_is_market boolean := (_type = 'market');
  v_notional numeric;
  v_fee numeric;
  v_order_id uuid;
  v_status text;
  v_now timestamptz := now();
  v_new_qty numeric;
  v_new_cost numeric;
  v_realized numeric := 0;
BEGIN
  v_user := auth.uid();
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '42501';
  END IF;

  IF _quantity IS NULL OR _quantity <= 0 THEN
    RAISE EXCEPTION 'Quantity must be positive';
  END IF;
  IF _symbol IS NULL OR length(trim(_symbol)) = 0 THEN
    RAISE EXCEPTION 'Symbol required';
  END IF;
  _symbol := upper(trim(_symbol));

  SELECT * INTO v_portfolio FROM public.portfolios
    WHERE id = _portfolio_id AND user_id = v_user
    FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Portfolio not found';
  END IF;

  -- Determine execution price
  IF v_is_market THEN
    IF _mark_price IS NULL OR _mark_price <= 0 THEN
      RAISE EXCEPTION 'Market price unavailable';
    END IF;
    v_fill_price := _mark_price;
    v_status := 'filled';
  ELSE
    IF _type IN ('limit','stop_limit') AND (_limit_price IS NULL OR _limit_price <= 0) THEN
      RAISE EXCEPTION 'Limit price required';
    END IF;
    IF _type IN ('stop','stop_limit','trailing_stop') AND (_stop_price IS NULL OR _stop_price <= 0) THEN
      RAISE EXCEPTION 'Stop price required';
    END IF;
    v_fill_price := COALESCE(_limit_price, _stop_price);
    v_status := 'open';
  END IF;

  v_notional := v_fill_price * _quantity;
  v_fee := v_notional * 0.0005;

  -- Load existing positions in this symbol
  SELECT * INTO v_long FROM public.holdings
    WHERE portfolio_id = _portfolio_id AND symbol = _symbol AND side = 'long' FOR UPDATE;
  SELECT * INTO v_short FROM public.holdings
    WHERE portfolio_id = _portfolio_id AND symbol = _symbol AND side = 'short' FOR UPDATE;

  -- ============== VALIDATION ==============
  IF _side = 'sell' THEN
    -- Selling reduces long position first; if none, opens/adds to short (margin only)
    IF v_long.id IS NULL OR COALESCE(v_long.quantity, 0) = 0 THEN
      IF v_portfolio.account_type = 'cash' THEN
        RAISE EXCEPTION 'Cash accounts cannot short-sell. You do not hold any %.', _symbol;
      END IF;
      -- margin: short sell opens a short position; check buying power
      IF (v_portfolio.cash_balance * v_portfolio.margin_multiplier) < v_notional THEN
        RAISE EXCEPTION 'Insufficient buying power to short %. Need %, have %.',
          _symbol, v_notional, (v_portfolio.cash_balance * v_portfolio.margin_multiplier);
      END IF;
    ELSIF _quantity > v_long.quantity THEN
      IF v_portfolio.account_type = 'cash' THEN
        RAISE EXCEPTION 'Cannot sell % of % — you only hold %.',
          _quantity, _symbol, v_long.quantity;
      END IF;
      -- margin: partial close + partial short; check buying power for the short leg
      IF (v_portfolio.cash_balance * v_portfolio.margin_multiplier)
         < (v_fill_price * (_quantity - v_long.quantity)) THEN
        RAISE EXCEPTION 'Insufficient buying power for short leg on %.', _symbol;
      END IF;
    END IF;
  ELSIF _side = 'buy' THEN
    -- If there's an open short, this is a buy-to-cover; otherwise a normal long open
    IF v_short.id IS NULL OR COALESCE(v_short.quantity, 0) = 0 THEN
      -- Opening/adding to long: need cash * multiplier
      IF (v_portfolio.cash_balance * v_portfolio.margin_multiplier) < (v_notional + v_fee) THEN
        RAISE EXCEPTION 'Insufficient buying power. Need %, have %.',
          (v_notional + v_fee), (v_portfolio.cash_balance * v_portfolio.margin_multiplier);
      END IF;
    ELSIF _quantity > v_short.quantity THEN
      -- Covering more than short: rest opens a long, needs BP
      IF (v_portfolio.cash_balance * v_portfolio.margin_multiplier)
         < (v_fill_price * (_quantity - v_short.quantity) + v_fee) THEN
        RAISE EXCEPTION 'Insufficient buying power to cover and open long on %.', _symbol;
      END IF;
    END IF;
  ELSE
    RAISE EXCEPTION 'Invalid side %', _side;
  END IF;

  -- ============== INSERT ORDER ==============
  INSERT INTO public.orders(
    user_id, portfolio_id, symbol, side, type, tif, quantity,
    limit_price, stop_price, status, submitted_at, filled_at,
    filled_qty, avg_fill_price
  ) VALUES (
    v_user, _portfolio_id, _symbol, _side, _type, _tif, _quantity,
    _limit_price, _stop_price, v_status, v_now,
    CASE WHEN v_is_market THEN v_now ELSE NULL END,
    CASE WHEN v_is_market THEN _quantity ELSE 0 END,
    CASE WHEN v_is_market THEN v_fill_price ELSE NULL END
  ) RETURNING id INTO v_order_id;

  -- Non-market orders don't touch positions yet
  IF NOT v_is_market THEN
    RETURN jsonb_build_object('order_id', v_order_id, 'status', v_status);
  END IF;

  -- ============== APPLY FILL TO POSITIONS ==============
  IF _side = 'buy' THEN
    -- 1) Cover shorts first
    IF v_short.id IS NOT NULL AND v_short.quantity > 0 THEN
      DECLARE cover_qty numeric := LEAST(v_short.quantity, _quantity);
      BEGIN
        v_realized := v_realized + ((v_short.avg_cost - v_fill_price) * cover_qty);
        IF cover_qty = v_short.quantity THEN
          DELETE FROM public.holdings WHERE id = v_short.id;
        ELSE
          UPDATE public.holdings
            SET quantity = v_short.quantity - cover_qty,
                realized_pnl = v_short.realized_pnl + ((v_short.avg_cost - v_fill_price) * cover_qty)
            WHERE id = v_short.id;
        END IF;
        _quantity := _quantity - cover_qty;
      END;
    END IF;
    -- 2) Any remaining quantity opens/adds to long
    IF _quantity > 0 THEN
      IF v_long.id IS NULL THEN
        INSERT INTO public.holdings(portfolio_id, symbol, quantity, avg_cost, side, asset_class)
        VALUES (_portfolio_id, _symbol, _quantity, v_fill_price, 'long', 'equity');
      ELSE
        v_new_qty := v_long.quantity + _quantity;
        v_new_cost := ((v_long.avg_cost * v_long.quantity) + (v_fill_price * _quantity)) / v_new_qty;
        UPDATE public.holdings SET quantity = v_new_qty, avg_cost = v_new_cost WHERE id = v_long.id;
      END IF;
    END IF;
    -- Cash impact
    UPDATE public.portfolios
      SET cash_balance = cash_balance - v_notional - v_fee + v_realized
      WHERE id = _portfolio_id;

  ELSE -- SELL
    -- 1) Close longs first
    IF v_long.id IS NOT NULL AND v_long.quantity > 0 THEN
      DECLARE close_qty numeric := LEAST(v_long.quantity, _quantity);
      BEGIN
        v_realized := v_realized + ((v_fill_price - v_long.avg_cost) * close_qty);
        IF close_qty = v_long.quantity THEN
          DELETE FROM public.holdings WHERE id = v_long.id;
        ELSE
          UPDATE public.holdings
            SET quantity = v_long.quantity - close_qty,
                realized_pnl = v_long.realized_pnl + ((v_fill_price - v_long.avg_cost) * close_qty)
            WHERE id = v_long.id;
        END IF;
        _quantity := _quantity - close_qty;
      END;
    END IF;
    -- 2) Any remaining quantity opens/adds to short (margin, already validated)
    IF _quantity > 0 THEN
      IF v_short.id IS NULL THEN
        INSERT INTO public.holdings(portfolio_id, symbol, quantity, avg_cost, side, asset_class)
        VALUES (_portfolio_id, _symbol, _quantity, v_fill_price, 'short', 'equity');
      ELSE
        v_new_qty := v_short.quantity + _quantity;
        v_new_cost := ((v_short.avg_cost * v_short.quantity) + (v_fill_price * _quantity)) / v_new_qty;
        UPDATE public.holdings SET quantity = v_new_qty, avg_cost = v_new_cost WHERE id = v_short.id;
      END IF;
    END IF;
    -- Cash impact: sell proceeds add cash; realized on long-close already in proceeds
    UPDATE public.portfolios
      SET cash_balance = cash_balance + v_notional - v_fee
      WHERE id = _portfolio_id;
  END IF;

  INSERT INTO public.notifications(user_id, kind, title, body)
  VALUES (v_user, 'order',
    upper(_side) || ' ' || _quantity::text || ' ' || _symbol,
    _type || ' order filled @ ' || round(v_fill_price::numeric, 2)::text);

  RETURN jsonb_build_object(
    'order_id', v_order_id,
    'status', v_status,
    'fill_price', v_fill_price,
    'realized_pnl', v_realized
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.place_paper_order(uuid, text, text, text, text, numeric, numeric, numeric, numeric) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.place_paper_order(uuid, text, text, text, text, numeric, numeric, numeric, numeric) FROM anon, public;
