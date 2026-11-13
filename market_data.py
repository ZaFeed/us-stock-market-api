import json
import os
import sys
from urllib.error import HTTPError
from urllib.parse import urlencode, urlsplit
from urllib.request import HTTPRedirectHandler, Request, build_opener, urlopen

SITE = "https://www.zafeed.com"
MARKET = os.environ.get("ZAFEED_MARKET", "US").upper()
SYMBOL = os.environ.get("ZAFEED_SYMBOL", "NASDAQ:AAPL").upper()

class RejectRedirects(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None

def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else "catalog"
    if mode == "catalog":
        request = Request(SITE + "/api/v1/public/symbols", headers={"User-Agent": "ZaFeed-Market-Examples/1.0", "Accept": "application/json"})
        with urlopen(request, timeout=15) as response:
            rows = json.load(response)["data"]
        print(json.dumps([x for x in rows if x["m"].upper() == MARKET], ensure_ascii=False, indent=2))
        return

    host = os.environ.get("ZAFEED_HTTP_BASE_URL", "").rstrip("/")
    key = os.environ.get("ZAFEED_API_KEY")
    if urlsplit(host).scheme != "https" or not urlsplit(host).hostname or not key:
        raise SystemExit("Set ZAFEED_HTTP_BASE_URL (HTTPS) and ZAFEED_API_KEY.")
    params = {"market": MARKET}
    if mode == "quotes":
        params["symbols"] = SYMBOL
    elif mode == "klines":
        params.update(symbol=SYMBOL, interval="1d", limit=10)
    elif mode == "snapshot":
        params.update(venue=SYMBOL.split(":", 1)[0], limit=10)
    else:
        raise SystemExit("Choose catalog, quotes, klines or snapshot.")
    request = Request(f"{host}/v1/{mode}?{urlencode(params)}", headers={"X-API-Key": key})
    try:
        with build_opener(RejectRedirects()).open(request, timeout=15) as response:
            print(response.read().decode())
    except HTTPError as error:
        print(error.read().decode(), file=sys.stderr)
        raise SystemExit(f"HTTP {error.code}")

if __name__ == "__main__":
    main()
