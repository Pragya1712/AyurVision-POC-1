import { GoogleGenerativeAI, Part } from "@google/generative-ai"; // Import 'Part' here

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function generateDiagnosis(
  patientData: string,
  faceImageBase64: string,
) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `You are an expert Ayurvedic practitioner. Analyze this patient data: ${patientData}. Look at the attached image for visual cues of Dosha imbalance. 
  Return ONLY a valid JSON object matching this exact structure: 
  {
    "dominantDosha": "string (e.g., Pitta-Kapha)",
    "confidenceScore": number (0-100),
    "diagnosisSummary": "string (1-2 sentences of clinical reasoning)",
    "recommendedDiet": ["string array of 3 diet tips"],
    "lifestyleAdvice": ["string array of 3 lifestyle tips"]
  }`;

  // Fix: Use the proper type instead of 'any'
  const parts: Array<string | Part> = [prompt];

  if (faceImageBase64) {
    parts.push({
      inlineData: { data: faceImageBase64, mimeType: "image/jpeg" },
    });
  }

  const result = await model.generateContent(parts);
  const responseText = result.response.text();
  const cleanJson = responseText.replace(/```json\n?|```/g, "").trim();

  return JSON.parse(cleanJson);
}
