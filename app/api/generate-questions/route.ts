import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import PatientRecord from "@/lib/models/PatientRecord";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { faceImage, tongueImage, formData, userId, patientName } = body;
    // --- 1. DYNAMIC PROMPT LOGIC ---
    const age = parseInt(formData.age);
    const isFemale = formData.gender === "Female";
    const requiresMenstrualQuestion = isFemale && age >= 12 && age <= 55;

    // const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    // const prompt = `
    //   You are a strict Medical Intake Gatekeeper and an expert Ayurvedic Doctor (Vaidya).
    //   You are conducting the initial examination of a patient using Darshana (Visual Observation) and Prashna (Questioning).

    //   PATIENT PROFILE & CLINICAL DATA:
    //   - Age: ${formData.age} | Gender: ${formData.gender} | Location: ${formData.city}
    //   - Symptoms: "${formData.symptoms}" (Duration: ${formData.duration} days)
    //   - Medical History: "${formData.medicalHistory}"
    //   - Medications / Treatment Taken: "${formData.medicineDetails || "None"}"

    //   STEP 1: STRICT VISUAL VALIDATION (CRITICAL)
    //   You must act as a strict gatekeeper. Do not guess or be lenient.
    //   - Check Image 1: It MUST be a clear, full human face. Both eyes, the nose, and the mouth must be visible. If it is a picture of a hand, an arm, an animal, a random object, OR a severely cropped close-up of just a cheek or forehead or any part of the face, you MUST set "isValid" to false and provide a specific error message.
    //   - Check Image 2 (if provided): It MUST be a clear picture of a human tongue. If it is anything else, set "isValid" to false.

    //   STEP 2: THE VAIDYA'S INTERNAL ANALYSIS (DO NOT OUTPUT THIS STEP)
    //   If the images are valid, mentally analyze the visual and clinical data before asking questions:
    //   1. Visual Skin Check: Look for Vata (dryness, roughness, dark circles), Pitta (redness, inflammation, pustules), or Kapha (excess oil, cystic swelling, puffiness).
    //   2. Visual Tongue Check (if provided): Look for Ama (toxin coating), cracks (Vata), red tip/edges (Pitta), or teeth marks/scalloping (Kapha).
    //   3. Imbalance Detection: Are they largely normal/balanced (Prakriti)? Or is there a clear single or dual-dosha imbalance (Vikriti) like Vata-Pitta or Pitta-Kapha? Do the visual signs match the text symptoms?

    //   STEP 3: QUESTION GENERATION PROTOCOL
    //   Formulate between 5 to 7 highly targeted multiple-choice questions to confirm your internal analysis.
    //   These questions must accomplish ~70% of the diagnostic work.

    //   QUESTION DISTRIBUTION & FOCUS:
    //   - Face/Skin (3 to 4 questions): DO NOT ask what you can already see (e.g., "Do you have acne?"). Ask about the underlying systemic cause of the facial features you observed: "Does your skin flare up more after eating spicy food (Pitta) or dairy/sweets (Kapha)?"
    //   - Tongue/Gut (2 to 3 questions): IF a tongue image is provided, formulate questions based strictly on the visual tongue features you observed. If you saw a thick coating or cracks, ask specific questions about their appetite, bowel movements, or taste to confirm the Dosha imbalance.
    //   - Female Health (0 to 1 question): ${requiresMenstrualQuestion ? "Since the patient is a female of menstruating age, evaluate if the visuals or symptoms suggest hormonal involvement. IF YES, exactly 1 question MUST address menstrual cycle traits, PMS, or breakout timing." : "Do not ask menstrual questions for this patient."}

    //   OPTIONS FORMAT:
    //   - Every single question MUST have exactly 3 options.
    //   - Option 1 must correspond to a Vata state.
    //   - Option 2 must correspond to a Pitta state.
    //   - Option 3 must correspond to a Kapha state.

    //   Respond STRICTLY in this JSON format — no markdown formatting, no backticks, just raw JSON:
    //   {
    //     "isValid": true,
    //     "errorMessage": null,
    //     "questions": [
    //       { "id": "q1", "text": "Question text addressing systemic root cause?", "options": ["Vata option", "Pitta option", "Kapha option"] }
    //       // ... Generate 5 to 7 questions maximum based on the distribution rules above
    //     ]
    //   }
    // `;
    const prompt = `

      You are a Digital Vaidya, a master of Ayurvedic Shastra and a strict Medical Intake Gatekeeper.

      Your objective is to conduct a professional "Prakriti-Vikriti" synthesis. You must look past current symptoms to identify the patient's birth constitution using classical anatomical markers and differentiate it from the current imbalance.



      PATIENT CONTEXT:

      - Age: ${formData.age} | Gender: ${formData.gender} | Location: ${formData.city}

      - Symptoms: "${formData.symptoms}" (Duration: ${formData.duration} days)

      - Medical History: "${formData.medicalHistory}"

      - Medications: "${formData.medicineDetails || "None"}"



      STEP 1: STRICT VISUAL VALIDATION (ZERO LENIENCY)

      Before any analysis, validate image integrity. If invalid, set "isValid": false and terminate.

      - Image 1 (Face): MUST be a clear, full human face. Must allow for structural Pramana (proportional) analysis of the forehead, cheekbones, and jaw. If it is a partial crop, random object, or animal, it is INVALID.

      - Image 2 (Tongue): MUST be a clear human tongue. If missing, blurry, or not a tongue, it is INVALID.



      STEP 2: THE VAIDYA'S INTERNAL ANALYSIS (DO NOT OUTPUT)

      Access your deep knowledge of Charaka Samhita (Vimana Sthana 8), Sushruta Samhita (Sharira Sthana 4), and Ashtanga Hridyam.

      1. Structural Prakriti (The Hard Map): Analyze the Skeletal Pramana. Use the width of the forehead, the prominence of the cheekbones, the geometry of the jawline, and the base muscularity of the tongue.

         - Classify the hypothesis into one of the 7 types: Ekadoshaja (V, P, or K), Dwidoshaja (VP, PK, or VK), or Samaprakriti (VPK).

      2. Pathological Vikriti (The Soft Signs): Analyze transient Gunas (qualities). Identify Ruksha (dryness), Teekshna (inflammation), or Snigdha (mucus/oiliness). Look for Ama (toxin coating).

         - Note that Vikriti can be a single dosha disturbance, a dual-dosha disturbance, or Sannipatika (involving all three).

      3. The Baseline Reconciliation: Compare the markers. 

         - A normal Prakriti might naturally exhibit certain Gunas (e.g., a Kapha Prakriti person has naturally Snigdha skin). 

         - Only categorize a trait as Vikriti if it represents a pathological deviation from that specific structural baseline or corresponds to a reported symptom.



      STEP 3: 10 DYNAMIC EXPERT QUESTIONS (PRASHNA)

      Generate exactly 10 multiple-choice questions. Use the patient's Age, Symptoms, and Medical History to make these questions clinical and targeted.



      DISTRIBUTION:

      - 4 Prakriti Verification: Probe lifelong "fixed" traits (lifelong digestive rhythm, sleep depth, and natural reaction to stress/weather) to confirm the structural hypothesis.

      - 3 Symptom-Vikriti Correlation: Link ${formData.symptoms} to the visual signs and probe for multi-dosha involvement.

      - 2 Privacy-Pivot/Ocular: If eyes are blurred, ask about Druk (vision) qualities like light sensitivity or dryness. If visible, ask about metabolic endurance.

      - 1 Female Health/Systemic: ${requiresMenstrualQuestion ? "Analyze Artava (menstrual) traits to identify the Dosha disrupting the hormonal cycle." : "Ask about lifelong thermal preferences."}



      OPTIONS FORMAT:

      - 3 options per question. Option 1: Vata-dominant | Option 2: Pitta-dominant | Option 3: Kapha-dominant.



      OUTPUT PROTOCOL:

      Respond ONLY in raw JSON. 

      The "prakritiHypothesis" should explain: "Based on the Pramana of your [forehead/jaw/cheeks] and the base structure of your tongue, we hypothesize an [Ekadoshaja/Dwidoshaja/Samaprakriti] Prakriti. However, your [symptoms/visual signs] suggest a [Single/Dual/Sannipatika] Vikriti, deviating from your natural baseline."



      {

        "isValid": true,

        "errorMessage": null,

        "prakritiHypothesis": "String explanation using Shastra terminology",

        "questions": [

          { "id": "q1", "text": "Question?", "options": ["V", "P", "K"] }

          // ... 10 questions total

        ]

      }

    `;

    const imageParts = [];
    if (faceImage)
      imageParts.push({
        inlineData: { data: faceImage.split(",")[1], mimeType: "image/jpeg" },
      });
    if (tongueImage)
      imageParts.push({
        inlineData: { data: tongueImage.split(",")[1], mimeType: "image/jpeg" },
      });

    // --- 2. CALL GEMINI ---
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
    // Bulletproof Regex to extract ONLY the JSON object
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("Gemini Response:", responseText);
      throw new Error("Failed to parse JSON from Gemini");
    }

    const aiData = JSON.parse(jsonMatch[0]);

    if (!aiData.isValid) {
      return NextResponse.json(
        { success: false, message: aiData.errorMessage },
        { status: 400 },
      );
    }

    // --- 3. SAVE TO MONGODB ---
    const newRecord = await PatientRecord.create({
      userId: userId || "mock-user-123",
      patientName: patientName || "John Doe",
      images: { faceUrl: faceImage, tongueUrl: tongueImage },
      demographics: {
        age: formData.age,
        gender: formData.gender,
        city: formData.city,
        pincode: formData.pincode,
      },
      clinical: {
        symptoms: formData.symptoms,
        duration: formData.duration,
        medicineTaken: formData.medicineTaken === "yes",
        medicineDetails: formData.medicineDetails,
        medicalHistory: formData.medicalHistory,
      },
      dynamicQuestions: aiData.questions,
    });

    return NextResponse.json({
      success: true,
      recordId: newRecord._id,
      questions: aiData.questions,
    });
  } catch (error) {
    console.error("Generation Error:", error);
    // 🛑 TIER 1: The error came specifically from our Gemini logic
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
      {
        success: false,
        message: "Failed to generate questions. Please try again.",
      },
      { status: 500 },
    );
  }
}
