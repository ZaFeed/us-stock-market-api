const [mode = "catalog", ...requested] = process.argv.slice(2);
const symbols = requested.length ? requested.map(s => s.toUpperCase()) : ["NASDAQ:AAPL", "NYSE:JPM"];
const valid = /^(NASDAQ|NYSE|AMEX):[A-Z0-9][A-Z0-9.-]*$/;
if (!["catalog", "quotes"].includes(mode) || !symbols.every(s => valid.test(s))) {
  throw new Error("Usage: node us-watchlist.mjs [catalog|quotes] [NASDAQ:AAPL NYSE:JPM ...]");
}

if (mode === "catalog") {
  const response = await fetch("https://www.zafeed.com/api/v1/public/symbols", { signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`Catalog HTTP ${response.status}`);
  const { data } = await response.json();
  const listed = new Set(data.filter(row => row.m.toUpperCase() === "US").map(row => row.api));
  console.log(JSON.stringify(symbols.map(symbol => ({ symbol, inSampleCatalog: listed.has(symbol) })), null, 2));
} else {
  const base = new URL(process.env.ZAFEED_HTTP_BASE_URL || "");
  const key = process.env.ZAFEED_API_KEY;
  if (base.protocol !== "https:" || base.username || base.password || !key) {
    throw new Error("Set the assigned HTTPS origin and US market Key.");
  }
  const url = new URL("/v1/quotes", base);
  url.search = new URLSearchParams({ market: "US", symbols: symbols.join(",") });
  const response = await fetch(url, { headers: { "X-API-Key": key }, redirect: "error", signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`Quote HTTP ${response.status}`);
  console.log(JSON.stringify(await response.json(), null, 2));
}
