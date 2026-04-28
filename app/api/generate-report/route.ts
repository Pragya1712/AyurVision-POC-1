import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import PatientRecord from "@/lib/models/PatientRecord";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.NEXT_PUBLIC_GEMINI_API_KEY || "",
);

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { recordId, answers } = await req.json();

    // 1. Fetch the patient record
    const record = await PatientRecord.findById(recordId);
    if (!record) {
      return NextResponse.json(
        { success: false, message: "Record not found" },
        { status: 404 },
      );
    }

    // 2. Save the user's answers to the DB
    record.answers = answers;
    record.markModified("answers");

    // 3. Prepare the Gemini Prompt
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const prompt = `
      You are an expert Ayurvedic Doctor (Vaidya) analyzing a skin condition. 
      Analyze the uploaded skin image(s) and the patient's Q&A answers carefully.
      Patient Answers: ${JSON.stringify(answers)}
      Patient Symptoms: ${record.clinical.symptoms}
      Duration: ${record.clinical.duration} days.
      Location: ${record.demographics.city}, Pincode: ${record.demographics.pincode || "N/A"}

      Your goal is to provide a comprehensive Ayurvedic insights report using Tridosha theory (Vata, Pitta, Kapha).
      
      ⚠️ CRITICAL INSTRUCTIONS:
      - Respond with ONLY valid JSON — no markdown, no explanation outside the JSON object.
      - DOSHA CALCULATION: Calculate Vata, Pitta, Kapha percentages dynamically (60% visual, 40% Q&A). They MUST sum to exactly 100.
      - DIAGNOSIS CONFIDENCE: Calculate a dynamic integer (0-100) reflecting your certainty.
      - TONGUE ANALYSIS (Jihva Pariksha): If a tongue image is provided, analyze its coating, color, and moisture dynamically. State clearly if the tongue is healthy or imbalanced. If Ama (toxins) or poor Agni (digestion) are visible, you MUST include specific remedies (like tongue scraping, warm water, digestive spices) in the "recommendations" and "daily_routine" sections.
      - Always provide EXACTLY 3 diagnoses.
      
      Required JSON format (replace placeholders with your calculated data):
      {
        "reportId": "AYU-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}${String(new Date().getDate()).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}",
        "doshas": { "vata": <calculated_integer>, "pitta": <calculated_integer>, "kapha": <calculated_integer> },
        "tongue_analysis": {
          "provided": <boolean_true_if_tongue_image_exists>,
          "observations": ["Dynamic observation 1 (e.g., yellowish coating at the base)", "Dynamic observation 2"],
          "agni_state": "Assessment of digestive fire. If healthy, state it.",
          "ama_state": "Assessment of toxins. If none, state the tongue is clear.",
          "dosha_correlation": "Explain how the tongue findings match or differ from the facial skin Dosha imbalance. (e.g., 'The Pitta heat on the face is confirmed by the red tip of the tongue')."
        },
        "diagnoses": [
          { "condition": "Primary Condition", "confidence": <calculated_integer>, "description": "Explanation" },
          { "condition": "Secondary Condition", "confidence": <calculated_integer>, "description": "Explanation" },
          { "condition": "Tertiary Condition", "confidence": <calculated_integer>, "description": "Explanation" }
        ],
        "recommendations": {
          "immediate": ["action 1"],
          "selfCare": ["tip 1"],
          "lifestyle": ["mod 1"]
        },
        "daily_routine": [
          {"heading": "Morning", "detail": "Description (Include tongue scraping if Ama is present)"},
          {"heading": "Evening", "detail": "Description"}
        ],
        "yoga_asanas": [
          {"heading": "Asana Name", "detail": "Description"}
        ],
        "herbs": [
          {"heading": "Herb Name (Sanskrit / English)", "detail": "Explain WHY this herb is chosen."}
        ],
        "herb_usage": [
          {"heading": "Herb Name", "detail": "Provide EXACT step-by-step preparation and dosage."}
        ],
        "summary": { "overview": "Comprehensive Ayurvedic summary" },
        "awareness": "Educational Ayurvedic awareness...",
        "disclaimer": "This is an AI-assisted Ayurvedic preliminary assessment..."
      }
    `;

    const imageParts = [];
    if (record.images.faceUrl) {
      imageParts.push({
        inlineData: {
          data: record.images.faceUrl.split(",")[1],
          mimeType: "image/jpeg",
        },
      });
    }
    if (record.images.tongueUrl) {
      imageParts.push({
        inlineData: {
          data: record.images.tongueUrl.split(",")[1],
          mimeType: "image/jpeg",
        },
      });
    }

    // 4. Call Gemini
    const result = await model.generateContent([prompt, ...imageParts]);
    const responseText = result.response.text();

    // 5. Bulletproof Regex to extract ONLY the JSON object
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("Gemini Response:", responseText);
      throw new Error("Failed to parse JSON from Gemini");
    }

    const finalReportData = JSON.parse(jsonMatch[0]);

    // 6. Save Final Report to MongoDB
    record.finalReport = finalReportData;
    record.markModified("finalReport");
    await record.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Final Generation Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to generate final report." },
      { status: 500 },
    );
  }
}
