package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"
)

func setting(name, fallback string) string {
	if v := os.Getenv(name); v != "" {
		return v
	}
	return fallback
}

func run() error {
	market := strings.ToUpper(setting("ZAFEED_MARKET", "US"))
	symbol := strings.ToUpper(setting("ZAFEED_SYMBOL", "NASDAQ:AAPL"))
	mode := "catalog"
	if len(os.Args) > 1 {
		mode = os.Args[1]
	}
	endpoint := "https://www.zafeed.com/api/v1/public/symbols"
	key := ""
	if mode != "catalog" {
		base, err := url.Parse(os.Getenv("ZAFEED_HTTP_BASE_URL"))
		key = os.Getenv("ZAFEED_API_KEY")
		if err != nil || base.Scheme != "https" || base.Host == "" || key == "" {
			return fmt.Errorf("set ZAFEED_HTTP_BASE_URL (HTTPS) and ZAFEED_API_KEY")
		}
		query := url.Values{"market": {market}}
		switch mode {
		case "quotes":
			query.Set("symbols", symbol)
		case "klines":
			query.Set("symbol", symbol)
			query.Set("interval", "1d")
			query.Set("limit", "10")
		case "snapshot":
			query.Set("venue", strings.SplitN(symbol, ":", 2)[0])
			query.Set("limit", "10")
		default:
			return fmt.Errorf("choose catalog, quotes, klines or snapshot")
		}
		base.Path = "/v1/" + mode
		base.RawQuery = query.Encode()
		endpoint = base.String()
	}
	request, err := http.NewRequest(http.MethodGet, endpoint, nil)
	if err != nil {
		return err
	}
	if key != "" {
		request.Header.Set("X-API-Key", key)
	}
	client := &http.Client{Timeout: 15 * time.Second, CheckRedirect: func(*http.Request, []*http.Request) error { return http.ErrUseLastResponse }}
	response, err := client.Do(request)
	if err != nil {
		return err
	}
	defer response.Body.Close()
	if response.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(io.LimitReader(response.Body, 8192))
		return fmt.Errorf("%s: %s", response.Status, body)
	}
	if mode == "catalog" {
		var payload struct {
			Data []map[string]any `json:"data"`
		}
		if err := json.NewDecoder(response.Body).Decode(&payload); err != nil {
			return err
		}
		matches := []map[string]any{}
		for _, row := range payload.Data {
			if code, ok := row["m"].(string); ok && strings.EqualFold(code, market) {
				matches = append(matches, row)
			}
		}
		out := json.NewEncoder(os.Stdout)
		out.SetIndent("", "  ")
		return out.Encode(matches)
	}
	_, err = io.Copy(os.Stdout, response.Body)
	return err
}

func main() {
	if err := run(); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}
