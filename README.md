# Build a US Stock Watchlist with Nasdaq and NYSE Symbols

A US watchlist can contain both `NASDAQ:AAPL` and `NYSE:JPM`. With ZaFeed, both use `market=US` and a US market Key. Keep the exchange prefix so the quote response can be matched to the original watchlist entry.

美股自选列表示例：在同一次请求里查询纳斯达克和纽交所股票，并保留每个标的的交易所前缀。

## Resolve the watchlist first

Node.js 22 or later; no installation or credentials needed for this step:

```bash
node us-watchlist.mjs
```

The script checks each requested identifier against ZaFeed's public directory. It prints which symbols the sample catalog contains. A missing sample is a reason to check the [symbol directory](https://www.zafeed.com/symbols.html?market=us), not proof of a delisting.

## Request one batch of quotes

Set `ZAFEED_HTTP_BASE_URL` and `ZAFEED_API_KEY` from your provisioned US service:

```bash
node us-watchlist.mjs quotes NASDAQ:AAPL NYSE:JPM
```

The script encodes the complete comma-separated `symbols` parameter for [`GET /v1/quotes`](https://www.zafeed.com/docs-quote.html). It refuses redirects so the market Key stays with the configured origin. The public lookup was tested; live quotes require an active US entitlement.

For a watchlist UI, keep the exchange-qualified ID as the row key and do not replace a previous quote with zero when a response omits that symbol. Display timestamps using `America/New_York`; a fixed UTC offset will be wrong for part of the year. For early closes, use the calendar for the actual listing venue: [Nasdaq](https://www.nasdaq.com/market-activity/stock-market-holiday-schedule) or [NYSE](https://www.nyse.com/trade/hours-calendars).

The [shared ZaFeed quickstart](https://github.com/ZaFeed/stock-market-data-api) has single-request examples in Python, Go, Java and cURL. For a streaming watchlist, see [subscription messages and acknowledgements](https://www.zafeed.com/docs-ws.html).
