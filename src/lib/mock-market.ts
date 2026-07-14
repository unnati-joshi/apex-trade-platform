// Deterministic pseudo-market data. Seeded per symbol so numbers are stable
// across renders and users. Replaces a live provider until real market keys
// are wired. All widgets read from here through the same shape a real provider
// would return, so swapping is a one-file change.

export interface Quote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePct: number;
  volume: number;
  marketCap: number;
  sector: string;
}

export interface Candle {
  t: number; // unix seconds
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
}

const UNIVERSE: Array<Omit<Quote, "price" | "change" | "changePct" | "volume" | "marketCap">> = [
  { symbol: "AAPL", name: "Apple Inc.", sector: "Technology" },
  { symbol: "MSFT", name: "Microsoft Corp.", sector: "Technology" },
  { symbol: "NVDA", name: "NVIDIA Corp.", sector: "Semiconductors" },
  { symbol: "GOOGL", name: "Alphabet Inc.", sector: "Communication Services" },
  { symbol: "META", name: "Meta Platforms", sector: "Communication Services" },
  { symbol: "AMZN", name: "Amazon.com Inc.", sector: "Consumer Discretionary" },
  { symbol: "TSLA", name: "Tesla Inc.", sector: "Automotive" },
  { symbol: "AMD", name: "Advanced Micro Devices", sector: "Semiconductors" },
  { symbol: "AVGO", name: "Broadcom Inc.", sector: "Semiconductors" },
  { symbol: "NFLX", name: "Netflix Inc.", sector: "Communication Services" },
  { symbol: "JPM", name: "JPMorgan Chase", sector: "Financials" },
  { symbol: "V", name: "Visa Inc.", sector: "Financials" },
  { symbol: "MA", name: "Mastercard Inc.", sector: "Financials" },
  { symbol: "BRK.B", name: "Berkshire Hathaway", sector: "Financials" },
  { symbol: "XOM", name: "Exxon Mobil", sector: "Energy" },
  { symbol: "CVX", name: "Chevron Corp.", sector: "Energy" },
  { symbol: "JNJ", name: "Johnson & Johnson", sector: "Healthcare" },
  { symbol: "PFE", name: "Pfizer Inc.", sector: "Healthcare" },
  { symbol: "UNH", name: "UnitedHealth Group", sector: "Healthcare" },
  { symbol: "PG", name: "Procter & Gamble", sector: "Consumer Staples" },
  { symbol: "KO", name: "Coca-Cola Co.", sector: "Consumer Staples" },
  { symbol: "DIS", name: "Walt Disney Co.", sector: "Communication Services" },
  { symbol: "BA", name: "Boeing Co.", sector: "Industrials" },
  { symbol: "GE", name: "General Electric", sector: "Industrials" },
  { symbol: "SPY", name: "SPDR S&P 500 ETF", sector: "ETF" },
  { symbol: "QQQ", name: "Invesco QQQ ETF", sector: "ETF" },
  { symbol: "BTC", name: "Bitcoin", sector: "Crypto" },
  { symbol: "ETH", name: "Ethereum", sector: "Crypto" },
  { symbol: "SOL", name: "Solana", sector: "Crypto" },
];

function hash(str: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  }
  return h >>> 0;
}
function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function basePrice(symbol: string): number {
  if (symbol === "BTC") return 68420;
  if (symbol === "ETH") return 3480;
  if (symbol === "SOL") return 172;
  if (symbol === "SPY") return 548;
  if (symbol === "QQQ") return 482;
  const r = mulberry32(hash(symbol));
  return 30 + r() * 480;
}

export function getQuote(symbol: string): Quote {
  const meta =
    UNIVERSE.find((u) => u.symbol === symbol) ??
    { symbol, name: symbol, sector: "Unknown" };
  // Rotate the drift every ~5 min bucket so the "market" moves subtly on refresh
  // but stays stable inside a session.
  const bucket = Math.floor(Date.now() / (5 * 60_000));
  const r = mulberry32(hash(symbol + ":" + bucket));
  const price = +(basePrice(symbol) * (1 + (r() - 0.5) * 0.02)).toFixed(2);
  const changePct = +((r() - 0.48) * 4).toFixed(2);
  const change = +((price * changePct) / 100).toFixed(2);
  const volume = Math.floor(500_000 + r() * 40_000_000);
  const marketCap = Math.floor(price * (10e6 + r() * 3e9));
  return { ...meta, price, change, changePct, volume, marketCap };
}

export function listUniverse(): Quote[] {
  return UNIVERSE.map((u) => getQuote(u.symbol));
}

export function searchSymbols(q: string): Quote[] {
  const s = q.trim().toUpperCase();
  if (!s) return listUniverse().slice(0, 8);
  return listUniverse()
    .filter((x) => x.symbol.includes(s) || x.name.toUpperCase().includes(s))
    .slice(0, 12);
}

export function topMovers(): { gainers: Quote[]; losers: Quote[]; volume: Quote[] } {
  const all = listUniverse();
  return {
    gainers: [...all].sort((a, b) => b.changePct - a.changePct).slice(0, 6),
    losers: [...all].sort((a, b) => a.changePct - b.changePct).slice(0, 6),
    volume: [...all].sort((a, b) => b.volume - a.volume).slice(0, 6),
  };
}

export function candles(symbol: string, count = 90): Candle[] {
  const r = mulberry32(hash(symbol + ":candles"));
  const out: Candle[] = [];
  let last = basePrice(symbol);
  const now = Math.floor(Date.now() / 1000);
  for (let i = count - 1; i >= 0; i--) {
    const drift = (r() - 0.5) * 0.03;
    const o = last;
    const c = +(o * (1 + drift)).toFixed(2);
    const h = +(Math.max(o, c) * (1 + r() * 0.012)).toFixed(2);
    const l = +(Math.min(o, c) * (1 - r() * 0.012)).toFixed(2);
    const v = Math.floor(200_000 + r() * 8_000_000);
    out.push({ t: now - i * 86400, o, h, l, c, v });
    last = c;
  }
  return out;
}

export const INDICES = ["SPY", "QQQ", "BTC", "ETH"] as const;
