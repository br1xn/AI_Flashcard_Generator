// app/api/generate-flashcards.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateFlashcards(textInput: string, count = 5) {
  if (!textInput?.trim()) throw new Error("Please enter some text to generate flashcards.");

  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing Gemini API key in .env (EXPO_PUBLIC_GEMINI_API_KEY)");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
Generate exactly ${count} flashcards from the following text.
Each flashcard must include:
- question (clear and specific)
- short_answer (1-2 sentences)
- long_answer (3-5 sentences, explanatory)

Return ONLY valid JSON in this EXACT format:
{
  "flashcards": [
    {"question": "...", "short_answer": "...", "long_answer": "..."}
  ]
}

Content:
${textInput}
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const rawText = await response.text();

  // cleanup common artifacts
  const cleaned = rawText
    .replace(/```(?:json)?/g, "")    // remove ``` or ```json
    .replace(/\\\(/g, "(")           // fix escaped parentheses
    .replace(/\\\)/g, ")")
    .replace(/\r\n/g, "\n")
    .trim();

  // Sometimes the model returns extra explanation before/after the JSON.
  // Extract the first {...} block if needed:
  let jsonText = cleaned;
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    jsonText = cleaned.slice(firstBrace, lastBrace + 1);
  }

  try {
    const data = JSON.parse(jsonText);
    if (!data || !Array.isArray(data.flashcards)) {
      throw new Error("Missing flashcards array");
    }
    return data.flashcards;
  } catch (err) {
    console.error("❌ Parse error:", err);
    console.error("🧾 Raw output snippet:", jsonText.slice(0, 400));
    throw new Error("Failed to parse AI response. Please try again with clearer content.");
  }
}
