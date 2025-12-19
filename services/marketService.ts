
import { GoogleGenAI } from "@google/genai";

const PRICE_STORAGE_KEY = 'whizrock_manual_prices';

export const getStoredPrices = (): { [key: string]: number } => {
  const stored = localStorage.getItem(PRICE_STORAGE_KEY);
  return stored ? JSON.parse(stored) : {};
};

export const updateStoredPrice = (stockId: string, price: number) => {
  const prices = getStoredPrices();
  prices[stockId.toUpperCase()] = price;
  localStorage.setItem(PRICE_STORAGE_KEY, JSON.stringify(prices));
  return prices;
};

/**
 * Manually fetches a live price for a specific stock using Gemini Search.
 * This is user-triggered only to avoid background costs.
 */
export const syncPriceViaWeb = async (stockId: string): Promise<{ price: number, sources: any[] }> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Using gemini-3-flash for the fastest and most cost-effective search call
    const prompt = `What is the current trading price of ${stockId} (NSE/BSE) in INR today? 
    Return ONLY a JSON object: {"price": number}.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "{}";
    const jsonMatch = text.match(/\{.*\}/s);
    const data = jsonMatch ? JSON.parse(jsonMatch[0]) : { price: 0 };
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    if (data.price > 0) {
      updateStoredPrice(stockId, data.price);
    }

    return { price: data.price, sources };
  } catch (error) {
    console.error("Manual Sync Error:", error);
    return { price: 0, sources: [] };
  }
};

export const fetchStockPrices = async (stockIds: string[]) => {
  const prices = getStoredPrices();
  return { 
    prices, 
    sources: [], 
    lastUpdated: Date.now() 
  };
};
