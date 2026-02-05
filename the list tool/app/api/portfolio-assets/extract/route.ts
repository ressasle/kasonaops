
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

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = file.type;

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are an expert financial data analyst. 
      Extract the portfolio assets from the uploaded document (PDF, CSV, or Image).
      Return a JSON object with a key "data" containing an array of assets.
      
      For each asset, extract:
      - stock_name: The name of the holding (company name)
      - ticker: The ticker symbol if available, otherwise null
      - isin: The ISIN number (12 characters) if available, otherwise null
      - amount: The numeric value of the holding/market value (number)
      - currency: The currency code (e.g., USD, EUR)
      - asset_class: Classify into 'Stocks', 'Crypto', 'ETF', or 'Other'
      - sector: The industry sector if available, otherwise null
      - shares: Number of shares/units if available (number)
      - price: Current price per unit if available (number)

      Example output format:
      {
        "data": [
          {
            "stock_name": "Apple Inc.",
            "ticker": "AAPL",
            "isin": "US0378331005",
            "amount": 15000.50,
            "currency": "USD",
            "asset_class": "Equity",
            "sector": "Technology",
            "shares": 100,
            "price": 150.00
          }
        ]
      }
      
      Only return valid JSON. Do not include markdown formatting or code blocks.
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

    // Clean up markdown if Gemini adds it (it often does despite instructions)
    const jsonString = text.replace(/```json\n?|\n?```/g, "").trim();

    let parsedData;
    try {
      parsedData = JSON.parse(jsonString);
    } catch (e) {
      console.error("Failed to parse Gemini response:", text);
      return NextResponse.json({ error: "Failed to parse AI response", raw: text }, { status: 500 });
    }

    return NextResponse.json({ data: parsedData.data || [] });
  } catch (error) {
    console.error("Extraction error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Extraction failed" },
      { status: 500 }
    );
  }
}
