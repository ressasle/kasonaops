# MCP Config (EODHD)

This project uses the EOD Historical Data MCP server (EODHD MCP) for stock search and fundamentals enrichment.

## Where to set your EODHD API key

You have two supported options:

1) Set it in the MCP server environment (recommended)

Create a `.env` in your local EODHD MCP server repo:

```env
EODHD_API_KEY=YOUR_EODHD_API_KEY
MCP_HOST=127.0.0.1
MCP_PORT=8000
```

Then start the server:

```bash
python server.py
```

2) Pass it from this app (server-side)

Add it to this app's env file so API routes can forward it to the MCP server:

```env
EODHD_API_KEY=YOUR_EODHD_API_KEY
EODHD_MCP_URL=http://127.0.0.1:8000/mcp
```

The app forwards the token via `Authorization: Bearer <EODHD_API_KEY>` when calling the MCP server.

## MCP server config examples

### Claude Desktop (developer config)

```json
{
  "mcpServers": {
    "eodhd-mcp": {
      "command": "python3",
      "args": [
        "/path/to/EODHD_MCP_server/server.py",
        "--stdio"
      ],
      "env": {
        "EODHD_API_KEY": "YOUR_EODHD_API_KEY"
      }
    }
  }
}
```

### ChatGPT MCP (HTTP server)

```text
URL: http://127.0.0.1:8000/mcp
```

## EOD ticker format

EODHD tickers use the format:

```
{SYMBOL}.{EXCHANGE_CODE}
```

Example: `AAPL.US`

## Tools used by this app

- `get_stocks_from_search`
- `get_exchange_tickers`
- `get_fundamentals_data`
