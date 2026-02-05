import { callMcpTool } from "@/lib/mcp/client";

type EodSearchResult = {
  Code?: string;
  Name?: string;
  Exchange?: string;
  Country?: string;
  Currency?: string;
  Isin?: string;
  Type?: string;
  ISIN?: string;
  Ticker?: string;
};

type EodExchangeTicker = {
  Code?: string;
  Exchange?: string;
  Name?: string;
  Country?: string;
  Currency?: string;
  Type?: string;
  ISIN?: string;
  Isin?: string;
};

type EodFundamentals = {
  General?: {
    Code?: string;
    Name?: string;
    Exchange?: string;
    CurrencyCode?: string;
    CurrencyName?: string;
    CountryName?: string;
    CountryISO?: string;
    ISIN?: string;
    Sector?: string;
    Industry?: string;
    Description?: string;
    Type?: string;
    WebURL?: string;
    Website?: string;
    WebsiteURL?: string;
    LogoURL?: string;
    Logo?: string;
    FiscalYearEnd?: string;
    Listings?: Record<string, unknown>;
    OtherListings?: Record<string, unknown>;
    [key: string]: unknown;
  };
  Officers?: Record<string, unknown> | Array<Record<string, unknown>>;
};

export async function getStocksFromSearch(query: string) {
  return callMcpTool<EodSearchResult[]>("get_stocks_from_search", {
    query,
    limit: 25,
    fmt: "json"
  });
}

export async function getExchangeTickers(exchangeCode: string) {
  return callMcpTool<EodExchangeTicker[]>("get_exchange_tickers", {
    exchange_code: exchangeCode,
    fmt: "json"
  });
}

export async function getFundamentalsData(ticker: string) {
  const data = await callMcpTool<any>("get_fundamentals_data", {
    ticker,
    fmt: "json",
    include_financials: false,
    sections: ["General", "Officers"]
  });

  // Handle nested stringified JSON in 'result' property if present
  if (data && typeof data.result === "string") {
    try {
      return JSON.parse(data.result) as EodFundamentals;
    } catch (e) {
      console.error("Failed to parse nested EODHD result:", e);
      return data as EodFundamentals;
    }
  }

  return data as EodFundamentals;
}
