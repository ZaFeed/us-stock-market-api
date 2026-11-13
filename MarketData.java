import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Locale;

class MarketData {
    static String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    public static void main(String[] args) throws Exception {
        String mode = args.length == 0 ? "catalog" : args[0];
        String market = System.getenv().getOrDefault("ZAFEED_MARKET", "US").toUpperCase(Locale.ROOT);
        String symbol = System.getenv().getOrDefault("ZAFEED_SYMBOL", "NASDAQ:AAPL").toUpperCase(Locale.ROOT);
        String url = "https://www.zafeed.com/api/v1/public/symbols";
        String key = null;
        if (!mode.equals("catalog")) {
            String base = System.getenv().getOrDefault("ZAFEED_HTTP_BASE_URL", "").replaceAll("/+$", "");
            key = System.getenv("ZAFEED_API_KEY");
            if (!base.startsWith("https://") || key == null || key.isEmpty()) {
                throw new IllegalArgumentException("Set ZAFEED_HTTP_BASE_URL (HTTPS) and ZAFEED_API_KEY.");
            }
            String query = switch (mode) {
                case "quotes" -> "symbols=" + encode(symbol);
                case "klines" -> "symbol=" + encode(symbol) + "&interval=1d&limit=10";
                case "snapshot" -> "venue=" + encode(symbol.split(":", 2)[0]) + "&limit=10";
                default -> throw new IllegalArgumentException("Choose catalog, quotes, klines or snapshot.");
            };
            url = base + "/v1/" + mode + "?market=" + encode(market) + "&" + query;
        }
        HttpRequest.Builder request = HttpRequest.newBuilder(URI.create(url)).timeout(Duration.ofSeconds(15));
        if (key != null) request.header("X-API-Key", key);
        HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();
        HttpResponse<String> response = client.send(request.build(), HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() != 200) {
            System.err.println("HTTP " + response.statusCode() + ": " + response.body());
            System.exit(1);
        }
        System.out.println(response.body());
    }
}
