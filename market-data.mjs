const market = (process.env.ZAFEED_MARKET || "US").toUpperCase();
const symbol = (process.env.ZAFEED_SYMBOL || "NASDAQ:AAPL").toUpperCase();
const mode = process.argv[2] || "catalog";
const site = "https://www.zafeed.com";

async function main() {
  if (mode === "catalog") {
    const response = await fetch(site + "/api/v1/public/symbols", { signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const { data } = await response.json();
    console.log(JSON.stringify(data.filter(row => row.m.toUpperCase() === market), null, 2));
    return;
  }

  const key = process.env.ZAFEED_API_KEY;
  if (!key) throw new Error("Set ZAFEED_API_KEY for the selected market.");

  if (mode === "stream") {
    const base = new URL(process.env.ZAFEED_WS_BASE_URL);
    if (base.protocol !== "wss:") throw new Error("Use a wss:// stream origin.");
    const url = new URL("/v1/stream", base);
    url.searchParams.set("key", key);
    const socket = new WebSocket(url);
    let ready = false;
    const timer = setTimeout(() => {
      socket.close();
      if (!ready) process.exitCode = 1;
    }, 15000);
    socket.addEventListener("message", ({ data }) => {
      const message = JSON.parse(data);
      console.log(JSON.stringify(message));
      if (message.type === "welcome") {
        socket.send(JSON.stringify({ op: "subscribe", id: "1", market, symbols: [symbol] }));
      } else if (message.type === "subscribed") {
        ready = true;
      } else if (message.type === "error") {
        process.exitCode = 1;
        socket.close();
      }
    });
    socket.addEventListener("error", () => {
      console.error("WebSocket connection failed. Check the stream URL and market Key.");
      process.exitCode = 1;
    });
    socket.addEventListener("close", ({ code, reason }) => {
      clearTimeout(timer);
      if (!ready || code !== 1000) {
        console.error(`WebSocket closed: ${code} ${reason}`);
        process.exitCode = 1;
      }
    });
    return;
  }

  const base = new URL(process.env.ZAFEED_HTTP_BASE_URL);
  if (base.protocol !== "https:") throw new Error("Use an https:// REST origin.");
  const params = new URLSearchParams({ market });
  if (mode === "quotes") params.set("symbols", symbol);
  else if (mode === "klines") {
    params.set("symbol", symbol);
    params.set("interval", "1d");
    params.set("limit", "10");
  } else if (mode === "snapshot") {
    params.set("venue", symbol.split(":")[0]);
    params.set("limit", "10");
  } else throw new Error("Choose catalog, quotes, klines, snapshot or stream.");
  const url = new URL(`/v1/${mode}`, base);
  url.search = params;
  const response = await fetch(url, { headers: { "X-API-Key": key }, signal: AbortSignal.timeout(15000), redirect: "error" });
  const body = await response.text();
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${body}`);
  console.log(body);
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
