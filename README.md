# US Stock Market API Examples for Nasdaq and NYSE

**美股行情 API 接入示例**

For the US market, ZaFeed uses `market=US` with symbols such as `NASDAQ:AAPL` and `NYSE:JPM`. Use the US market Key for both Nasdaq and NYSE symbols.

US stock quotes, Nasdaq and NYSE stock symbols, historical OHLC and WebSocket through ZaFeed. This repository contains client examples for the ZaFeed API, with public catalog lookups and authenticated REST requests.

[ZaFeed 官网](https://www.zafeed.com/) · [API Quick Start](https://www.zafeed.com/docs-guide.html) · [Markets & Pricing](https://www.zafeed.com/pricing.html) · [Symbol Directory](https://www.zafeed.com/symbols.html) · [Trading Calendar](https://www.zafeed.com/calendar.html)

## United States exchanges and ticker symbols · 交易所与标的代码

Market code: `US`. Public catalog exchange codes: **NASDAQ, NYSE, AMEX**. Time zone: `America/New_York`.

| ZaFeed symbol | Instrument | Currency |
| --- | --- | --- |
| `NASDAQ:AAPL` | Apple Inc. | USD |
| `NASDAQ:AMZN` | Amazon.com | USD |
| `NYSE:JPM` | JPMorgan Chase | USD |
| `NASDAQ:MSFT` | Microsoft | USD |
| `NASDAQ:NVDA` | NVIDIA | USD |
| `NASDAQ:TSLA` | Tesla | USD |

## Run a public catalog request · 无需 Key 查询标的

| Language | Run |
| --- | --- |
| Python 3 | `python3 market_data.py catalog` |
| Node.js 22+ | `node market-data.mjs catalog` |
| Go | `go run market_data.go catalog` |
| Java 17+ | `java MarketData.java catalog` |
| cURL | `bash market-data.sh catalog` |

Python, Node.js and Go filter the public response by market. Java and cURL print the full public response. The catalog returns sample symbol metadata.

## Connect to quotes, candles and exchange snapshots · 连接行情接口

Set `ZAFEED_HTTP_BASE_URL` to the HTTPS origin assigned for your data service, and `ZAFEED_API_KEY` to a Key for the selected market. The scripts default to `US` and `NASDAQ:AAPL`. Set `ZAFEED_MARKET` and `ZAFEED_SYMBOL` together when switching markets.

```bash
python3 market_data.py quotes
node market-data.mjs klines
go run market_data.go snapshot
java MarketData.java quotes
bash market-data.sh klines
```

- [Stock quotes API](https://www.zafeed.com/docs-quote.html) uses `symbols` for a comma-separated list.
- [Historical OHLC API](https://www.zafeed.com/docs-kline.html) uses `symbol`, `interval` and `limit`.
- [Exchange snapshot API](https://www.zafeed.com/docs-exchange.html) can filter by `venue` and returns a pagination cursor when available.

## Subscribe with WebSocket · WebSocket 订阅

Set `ZAFEED_WS_BASE_URL` to your assigned `wss://` origin and use the same market Key.

```bash
node market-data.mjs stream
```

The example waits for `welcome`, sends `subscribe`, and reads messages for up to 15 seconds. A subscription acknowledgement can arrive before a quote update. See the [WebSocket protocol](https://www.zafeed.com/docs-ws.html).

**Availability · 接入状态:** The public catalog commands were checked against ZaFeed. Authenticated REST and WebSocket require a provisioned data service endpoint and matching market Key. 实时报价、历史 K 线和推送需要已开通的接口地址及对应市场 Key。

**Support · 技术支持:** [support@zafeed.net](mailto:support@zafeed.net)
