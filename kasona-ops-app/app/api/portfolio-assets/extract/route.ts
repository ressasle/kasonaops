import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GOOGLE_AI_STUDIO_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GOOGLE_AI_STUDIO_API_KEY is not set" },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const fileType = formData.get("fileType") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = file.type;

    // Initialize Gemini with 2.0 Flash model
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Build context-aware prompt based on file type
    const fileContext = getFileTypeContext(fileType, mimeType);

    const prompt = `
${EXTRACTION_SYSTEM_PROMPT}

${fileContext}

${EXTRACTION_OUTPUT_FORMAT}
`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType,
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();

    // Clean up markdown if Gemini adds it
    const jsonString = text
      .replace(/```json\n?/g, "")
      .replace(/\n?```/g, "")
      .trim();

    let parsedData;
    try {
      parsedData = JSON.parse(jsonString);
    } catch (e) {
      console.error("Failed to parse Gemini response:", text);
      return NextResponse.json(
        {
          error: "Failed to parse AI response",
          raw: text,
          hint: "The AI response was not valid JSON. Please try again or use a clearer document."
        },
        { status: 500 }
      );
    }

    // Validate and enrich the response
    const validatedData = validateAndEnrichAssets(parsedData.data || []);

    return NextResponse.json({
      data: validatedData,
      extraction_note: parsedData.extraction_note || generateExtractionNote(validatedData),
    });
  } catch (error) {
    console.error("Extraction error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Extraction failed" },
      { status: 500 }
    );
  }
}

// ============================================================================
// SYSTEM PROMPT - Comprehensive and flexible extraction instructions
// ============================================================================

const EXTRACTION_SYSTEM_PROMPT = `
You are an expert financial data analyst specializing in portfolio extraction from diverse document formats.
Your task is to extract ALL portfolio holdings/investments from the provided document with maximum accuracy.

## CORE PRINCIPLES

1. **BE FLEXIBLE**: Documents come in many formats (bank statements, broker exports, app screenshots, handwritten notes).
   - Do NOT require a specific format
   - Adapt to whatever structure is present
   - Extract what you can, mark what's uncertain

2. **BE COMPREHENSIVE**: Extract ALL visible holdings, even if some data is missing.
   - A partial extraction is better than no extraction
   - Never skip an asset just because one field is unclear

3. **BE HELPFUL**: When data is ambiguous or incomplete, provide guidance.
   - Mark items that need human review
   - Explain what's missing or unclear
   - Suggest what the user should look up

## EXTRACTION RULES

### Required Fields (extract if visible, mark if missing):
- **stock_name**: The name of the asset/company/cryptocurrency
  - Look for: Company names, ETF names, crypto names, fund names
  - Common patterns: "Apple Inc.", "MSCI World ETF", "Bitcoin", "DWS Top Dividende"

- **asset_class**: Classify the investment type
  - Options: "Stocks", "ETF", "Crypto", "Funds", "Bonds", "Other"
  - Crypto indicators: Bitcoin, Ethereum, BTC, ETH, crypto wallet apps, Coinbase, Binance
  - ETF indicators: "ETF" in name, ISIN starting with IE/LU, index tracking names
  - Stock indicators: Individual company names, "Inc.", "AG", "GmbH", "Corp"

### Optional Fields (extract if visible):
- **ticker**: Stock symbol (e.g., AAPL, MSFT, BTC-USD)
- **isin**: 12-character code starting with 2 letters (e.g., US0378331005)
- **currency**: EUR, USD, CHF, GBP, etc.
- **sector**: Technology, Healthcare, Finance, Energy, Consumer, etc.

### DO NOT Extract (we handle these separately):
- Position size / number of shares
- Current value / market value
- Purchase price / cost basis
- Profit/loss percentages

## CONFIDENCE SCORING

For each extracted asset, assign a confidence level:
- **high**: Clear, unambiguous data that matches expected patterns
- **medium**: Data is visible but format is unusual or partially obscured
- **low**: Guessing based on context, or critical data is missing

## REVIEW FLAGS

Set needs_review = true when:
- Asset name is unclear or abbreviated
- Asset class cannot be determined
- ISIN/ticker format looks incorrect
- Data might be duplicated
- Screenshot is blurry or cropped

Provide a review_note explaining what the user should check.

## LANGUAGE HANDLING

- Documents may be in German, English, or other languages
- Common German terms:
  - "Depot" / "Depotauszug" = Portfolio statement
  - "Wertpapier" / "Bezeichnung" = Security / Name
  - "Aktie" = Stock
  - "Anleihe" = Bond
  - "Stück" = Shares
  - "Währung" = Currency
  - "Krypto" = Crypto
`;

// ============================================================================
// FILE TYPE SPECIFIC CONTEXT
// ============================================================================

function getFileTypeContext(fileType: string | null, mimeType: string): string {
  if (mimeType.includes("pdf") || fileType === "pdf") {
    return `
## DOCUMENT TYPE: PDF Statement

This appears to be a PDF document, likely a bank/broker statement.

### Common PDF Statement Formats:
- **German Banks** (DKB, ING, Commerzbank, Deutsche Bank):
  - Headers: "Bezeichnung", "WKN", "ISIN", "Stück", "Kurs", "Wert"
  - Often include custody account number ("Depotnummer")
  
- **International Brokers** (Interactive Brokers, Degiro, Trade Republic):
  - May use English headers: "Symbol", "Position", "Quantity", "Value"
  - Often include unrealized P&L

### PDF-Specific Tips:
- Look for table structures with column headers
- Holdings are usually listed in rows
- Watch for page breaks that might split a table
- Footer often contains totals (ignore these for extraction)
`;
  }

  if (mimeType.includes("image") || fileType === "image") {
    return `
## DOCUMENT TYPE: Screenshot/Image

This is an image file, likely a screenshot from a trading app or portfolio view.

### Common App Screenshot Formats:
- **Mobile Banking Apps** (N26, Revolut, Trade Republic):
  - Clean list view with asset names and values
  - May show % changes
  - Often have colorful icons for each asset

- **Crypto Wallets** (Coinbase, Binance, Kraken):
  - List of crypto holdings with icons
  - Shows coin names and values
  - May include price changes

- **Broker Apps** (TradeRepublic, Scalable, eToro):
  - Portfolio view with positions
  - May include sparkline charts
  - Filter tabs for asset types

### Image-Specific Tips:
- Read text carefully, OCR may not be perfect
- App icons can help identify asset class (crypto icons, stock logos)
- Ignore UI elements like navigation bars, buttons
- Focus on the main content area
`;
  }

  // CSV files shouldn't reach here (handled client-side), but just in case
  return `
## DOCUMENT TYPE: Spreadsheet/Table Data

This appears to be structured data (possibly CSV converted to PDF/image).

### Tips:
- Look for column headers in the first row
- Map columns to our fields based on header names
- Handle different separator formats
`;
}

// ============================================================================
// OUTPUT FORMAT SPECIFICATION  
// ============================================================================

const EXTRACTION_OUTPUT_FORMAT = `
## OUTPUT FORMAT

Return a valid JSON object with this exact structure:

{
  "data": [
    {
      "stock_name": "Apple Inc.",
      "ticker": "AAPL",
      "isin": "US0378331005",
      "currency": "USD",
      "asset_class": "Stocks",
      "sector": "Technology",
      "confidence": "high",
      "needs_review": false,
      "review_note": null
    },
    {
      "stock_name": "Bitcoin",
      "ticker": "BTC",
      "isin": null,
      "currency": "EUR",
      "asset_class": "Crypto",
      "sector": null,
      "confidence": "high",
      "needs_review": false,
      "review_note": null
    },
    {
      "stock_name": "Unknown Fund XY",
      "ticker": null,
      "isin": "LU1234567890",
      "currency": "EUR",
      "asset_class": "Funds",
      "sector": null,
      "confidence": "low",
      "needs_review": true,
      "review_note": "Name partially visible, please verify. ISIN suggests Luxembourg-domiciled fund."
    }
  ],
  "extraction_note": "Extracted 3 assets from broker statement. 1 item needs review due to unclear name."
}

IMPORTANT:
- Return ONLY valid JSON, no markdown code blocks
- Use null for missing optional fields, never empty strings
- Always include confidence and needs_review for each asset
- Include extraction_note summarizing what was found
`;

// ============================================================================
// POST-PROCESSING HELPERS
// ============================================================================

type ExtractedAsset = {
  stock_name: string;
  ticker: string | null;
  isin: string | null;
  currency: string | null;
  asset_class: string;
  sector: string | null;
  confidence: "high" | "medium" | "low";
  needs_review: boolean;
  review_note: string | null;
};

function validateAndEnrichAssets(assets: any[]): ExtractedAsset[] {
  if (!Array.isArray(assets)) return [];

  return assets.map((asset): ExtractedAsset => {
    const validated: ExtractedAsset = {
      stock_name: String(asset.stock_name || asset.name || "").trim(),
      ticker: normalizeNullable(asset.ticker),
      isin: normalizeIsin(asset.isin),
      currency: normalizeCurrency(asset.currency),
      asset_class: normalizeAssetClass(asset.asset_class),
      sector: normalizeNullable(asset.sector),
      confidence: validateConfidence(asset.confidence),
      needs_review: Boolean(asset.needs_review),
      review_note: normalizeNullable(asset.review_note),
    };

    // Additional validation rules
    if (!validated.stock_name) {
      validated.needs_review = true;
      validated.confidence = "low";
      validated.review_note = (validated.review_note || "") + " Missing asset name.";
    }

    // Validate ISIN format
    if (validated.isin && !isValidIsin(validated.isin)) {
      validated.needs_review = true;
      validated.review_note = (validated.review_note || "") + " ISIN format appears incorrect.";
    }

    return validated;
  });
}

function normalizeNullable(value: any): string | null {
  if (value === null || value === undefined || value === "") return null;
  return String(value).trim();
}

function normalizeIsin(value: any): string | null {
  if (!value) return null;
  const cleaned = String(value).trim().toUpperCase().replace(/\s/g, "");
  if (cleaned.length === 12 && /^[A-Z]{2}[A-Z0-9]{10}$/.test(cleaned)) {
    return cleaned;
  }
  return cleaned || null; // Return even if invalid, we'll flag for review
}

function normalizeCurrency(value: any): string | null {
  if (!value) return null;
  const cleaned = String(value).trim().toUpperCase();
  const validCurrencies = ["EUR", "USD", "CHF", "GBP", "JPY", "CAD", "AUD", "SEK", "NOK", "DKK"];
  if (validCurrencies.includes(cleaned)) return cleaned;
  // Try to extract from longer strings like "EUR/USD"
  for (const curr of validCurrencies) {
    if (cleaned.includes(curr)) return curr;
  }
  return null;
}

function normalizeAssetClass(value: any): string {
  if (!value) return "Other";
  const cleaned = String(value).toLowerCase();
  if (cleaned.includes("crypto") || cleaned.includes("krypto")) return "Crypto";
  if (cleaned.includes("etf")) return "ETF";
  if (cleaned.includes("fund") || cleaned.includes("fonds")) return "Funds";
  if (cleaned.includes("stock") || cleaned.includes("equit") || cleaned.includes("aktie")) return "Stocks";
  if (cleaned.includes("bond") || cleaned.includes("anleihe")) return "Bonds";
  return "Other";
}

function validateConfidence(value: any): "high" | "medium" | "low" {
  const valid = ["high", "medium", "low"];
  if (valid.includes(String(value).toLowerCase())) {
    return value.toLowerCase() as "high" | "medium" | "low";
  }
  return "medium";
}

function isValidIsin(isin: string): boolean {
  // Basic ISIN validation: 2 letters + 10 alphanumeric
  return /^[A-Z]{2}[A-Z0-9]{10}$/.test(isin);
}

function generateExtractionNote(assets: ExtractedAsset[]): string {
  const total = assets.length;
  const needsReview = assets.filter(a => a.needs_review).length;
  const highConf = assets.filter(a => a.confidence === "high").length;

  let note = `Extracted ${total} asset${total !== 1 ? "s" : ""}.`;

  if (highConf > 0) {
    note += ` ${highConf} high confidence.`;
  }

  if (needsReview > 0) {
    note += ` ${needsReview} need${needsReview !== 1 ? "" : "s"} review.`;
  }

  return note;
}
