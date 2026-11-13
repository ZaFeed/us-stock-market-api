#!/usr/bin/env bash
set -euo pipefail

market="${ZAFEED_MARKET:-US}"
symbol="${ZAFEED_SYMBOL:-NASDAQ:AAPL}"
mode="${1:-catalog}"

if [[ "$mode" == catalog ]]; then
  curl -fsS --max-time 15 https://www.zafeed.com/api/v1/public/symbols
  exit
fi

: "${ZAFEED_HTTP_BASE_URL:?Set the HTTPS REST origin}"
: "${ZAFEED_API_KEY:?Set the market Key}"
[[ "$ZAFEED_HTTP_BASE_URL" == https://* ]] || { echo "Use an https:// REST origin" >&2; exit 1; }

case "$mode" in
  quotes) params=(--data-urlencode "symbols=$symbol") ;;
  klines) params=(--data-urlencode "symbol=$symbol" --data-urlencode 'interval=1d' --data-urlencode 'limit=10') ;;
  snapshot) params=(--data-urlencode "venue=${symbol%%:*}" --data-urlencode 'limit=10') ;;
  *) echo "Choose catalog, quotes, klines or snapshot" >&2; exit 1 ;;
esac

curl --fail-with-body --silent --show-error --max-time 15   --header "X-API-Key: $ZAFEED_API_KEY" --get   --data-urlencode "market=$market" "${params[@]}" "${ZAFEED_HTTP_BASE_URL%/}/v1/$mode"
