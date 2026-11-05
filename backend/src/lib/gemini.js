import { GoogleGenAI } from "@google/genai";

let _ai = null;

export function getGeminiClient() {
  if (!_ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "PASTE_YOUR_AIzaSy_KEY_HERE") {
      throw new Error("GEMINI_API_KEY is not set in environment variables.");
    }
    _ai = new GoogleGenAI({ apiKey });
  }
  return _ai;
}

export default getGeminiClient;

