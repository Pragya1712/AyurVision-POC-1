import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import PatientRecord from "@/lib/models/PatientRecord";
import { GoogleGenerativeAI } from "@google/generative-ai";

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
    const prompt = `
      You are an AI-assisted Ayurvedic Analysis Tool acting with the knowledge of a Master Vaidya (BAMS). You are writing a preliminary, suggestive report integrating classical Shastra knowledge with the patient's modern clinical context.

      PATIENT PROFILE & CLINICAL TEXT DATA:
      - Age: ${record.demographics.age} | Gender: ${record.demographics.gender} | Location: ${record.demographics.city}
      - Symptoms: "${record.clinical.symptoms}" (Duration: ${record.clinical.duration} days)
      - Medical History: "${record.clinical.medicalHistory}"
      - Current Medications (Oral/Topical/Allopathic): "${record.clinical.medicineDetails || "None"}"
      - Q&A Answers: ${JSON.stringify(answers)}

      Follow this EXACT step-by-step workflow. Do not output the steps, just use them to formulate the final JSON.

      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      STEP 1: ROGI PARIKSHA (Clinical Text & Medication Analysis)
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      - Correlate the symptoms to specific Dosha imbalances (Vikriti).
      - CRITICAL MEDICATION ANALYSIS: Analyze "Current Medications" and "Medical History". Evaluate if these treatments are reducing the Vikriti, enhancing it, or causing side effects (e.g., harsh acne creams causing Vata-like dryness). Ensure all subsequent Ayurvedic suggestions are 100% safe to use alongside these specific medications.
      - NO REPETITION RULE: Do not parrot the user's exact symptom words (e.g., repeating "itching" in every section). Use professional synthesis. Mention symptoms only where clinically necessary.

      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      STEP 2: DARSHANA PARIKSHA (Akriti / Facial Visual Analysis)
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      Analyze the provided facial skin image:
      - PRAKRITI (Baseline): Look for "hard" structural Pramana (e.g., jawline geometry, forehead width).
      - VIKRITI (Imbalance): Look for transient "soft" signs (e.g., Ruksha/dryness, Teekshna/redness, Snigdha/acne).

      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      STEP 3: JIHVA PARIKSHA (Tongue Examination)
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      If a tongue image is provided, examine it:
      - PRAKRITI: Observe base muscularity and natural shape.
      - VIKRITI: Evaluate coating (Mala/Ama), color (Varna), and cracks (Sphutana).
      - If Ama is present, you MUST recommend tongue scraping in the daily routine.

      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      STEP 4: SAMPRAPTI (Prakriti vs Vikriti Calculation)
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      - PRAKRITI (Baseline): Combine structural visuals with lifelong traits from Q&A answers to deduce their birth constitution.
      - VIKRITI DOSHAS (Current Imbalance): Calculate EXACT percentages (summing to 100) based on current symptoms, visual signs, and the impact of their medications. This represents the current deviation.
      - NORMAL STATE: If Vikriti strictly aligns with Prakriti and there is no distress, they are "Healthy / Normal".

      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      STEP 5: NIDANA (Indicative Analysis)
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      - NORMAL IS VALID: If balanced, output an empty diagnoses array [].
      - CONFIDENCE RULE: It is NOT compulsory to provide 3 conditions. Provide ONLY the conditions where you are strictly >70% confident (can be 1, 2, 4, etc.).
      - MODERN TERMINOLOGY (MANDATORY): Users do not understand pure Ayurvedic jargon. For every condition, you MUST include its common modern dermatological equivalent in parentheses next to the Ayurvedic term (e.g., "Pittaja Rakta Dushti (Inflammatory Acne / Rosacea)" or "Vataja Charma Vikara (Dry Eczema / Dermatitis)").
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      STEP 6: CHIKITSA (Safe, Suggestive Protocols)
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      - DO NO HARM: Herbs, routines, and Asanas MUST be universally safe and tailored so they do not conflict with reported medications.
      - SUGGESTIVE TONE (MANDATORY): You are an AI, not a diagnostic tool. Frame everything as "traditional supportive care," "suggests," or "indicates." Never use "cure," "prescribe," or "treatment." Explicitly state when a suggestion is safe alongside their current routine.

      Respond STRICTLY in this JSON format — no markdown formatting, no backticks, just raw JSON:
      {
        "reportId": "AYU-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}${String(new Date().getDate()).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}",
        "prakriti_hypothesis": "String indicating deduced baseline (e.g., 'Vata', 'Pitta-Kapha', or 'Tridoshic' Prakriti)",
        "prakriti_explanation": "Exactly 1-2 lines explaining WHY you predicted this specific Prakriti baseline based on their skeletal structure (Pramana) and lifelong Q&A traits.",
        "doshas": { "vata": <integer>, "pitta": <integer>, "kapha": <integer> }, 
        "imbalance_explanation": "Explain the current Vikriti (the dosha percentages above) based on visual signs, current symptoms, and how their medications are impacting it.",
        "tongue_analysis": {
          "provided": <boolean_true_if_tongue_image_exists>,
          "observations": ["Dynamic observation 1", "Dynamic observation 2"],
          "agni_state": "Assessment of digestive fire (Agni).",
          "ama_state": "Assessment of toxins (Ama).",
          "dosha_correlation": "Explain how the tongue findings relate to the facial skin and overall Vikriti."
        },
        "diagnoses": [
          { "condition": "Ayurvedic Name (Modern Common Name)", "confidence": <integer_score>, "description": "Suggestive explanation of the condition." }
        ],
        "recommendations": {
          "immediate": ["Safe, soothing immediate relief suggestion"],
          "selfCare": ["Safe traditional self-care suggestion"],
          "lifestyle": ["Safe lifestyle modification suggestion"]
        },
        "daily_routine": [
          {"heading": "Morning", "detail": "Description (Must explicitly include tongue scraping if Ama is present)"},
          {"heading": "Evening", "detail": "Description"}
        ],
        "yoga_asanas": [
          {"heading": "Safe Asana Name", "detail": "Explain WHY this safe asana helps support their specific state."}
        ],
        "herbs": [
          {"heading": "Safe Herb Name (Sanskrit / English)", "detail": "Explain HOW this mild herb safely supports their state in 1-2 lines."}
        ],
        "herb_usage": [
          {"heading": "Supportive Herbs: [Herb Name]", "detail": "Provide traditional safe preparation. Explicitly note it is safe alongside their current medications."},
          {"heading": "Lepas to Apply: [Lepa Name]", "detail": "Provide external application steps. (Leave out if Lepas are not needed)."}
        ],
        "summary": { "overview": "Exactly 2-3 lines. State the hypothetical Prakriti, explain how the current Vikriti is affecting it based on this AI analysis, and mention if medical treatments are influencing it." },
        "awareness": "Educational Ayurvedic awareness regarding their specific baseline Prakriti and current Vikriti.",
        "disclaimer": "This is an AI-assisted Ayurvedic preliminary assessment and does not replace professional medical diagnosis. Please consult a qualified Vaidya."
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
    // const result = await model.generateContent([prompt, ...imageParts]);
    // const responseText = result.response.text();

    // --- 2. THE SMART SWITCHER LOGIC ---
    let responseText = "";

    try {
      // 🛑 ATTEMPT 1: Primary API Key
      const genAI = new GoogleGenerativeAI(
        process.env.NEXT_PUBLIC_GEMINI_API_KEY || "",
      );
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash-lite",
      });

      const result = await model.generateContent([prompt, ...imageParts]);
      responseText = result.response.text();
    } catch (error) {
      // FIX: Cast to a specific shape instead of 'any' to make the ESLint linter happy!
      const primaryError = error as { message?: string; status?: number };

      console.warn("Primary API Failed:", primaryError.message);

      // Check for 429 Rate Limit
      if (
        primaryError.message?.includes("429") ||
        primaryError.status === 429
      ) {
        console.log("Rate limit hit! Switching to Backup API Key...");
        try {
          // 🟢 ATTEMPT 2: Backup API Key
          const backupGenAI = new GoogleGenerativeAI(
            process.env.GEMINI_API_KEY_BACKUP || "",
          );
          const backupModel = backupGenAI.getGenerativeModel({
            model: "gemini-2.5-flash-lite",
          });

          const backupResult = await backupModel.generateContent([
            prompt,
            ...imageParts,
          ]);
          responseText = backupResult.response.text();
        } catch (backupError) {
          throw new Error("Both API keys failed or rate limited.");
        }
      } else {
        // If it's a 500/503, throw immediately to trigger frontend popup
        throw new Error("AI_OVERLOAD"); // Just throw the original error here
      }
    }

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
    if (error instanceof Error && error.message === "AI_OVERLOAD") {
      return NextResponse.json(
        {
          success: false,
          errorType: "AI_SERVER_OVERLOADED",
          message: "The AI server is experiencing huge traffic.",
        },
        { status: 503 },
      );
    }
    return NextResponse.json(
      { success: false, message: "Failed to generate final report." },
      { status: 500 },
    );
  }
}
