// import { NextResponse } from "next/server";
// import { connectToDatabase } from "@/lib/mongodb";
// import PatientRecord from "@/lib/models/PatientRecord";
// import { GoogleGenerativeAI } from "@google/generative-ai";

// const genAI = new GoogleGenerativeAI(
//   process.env.NEXT_PUBLIC_GEMINI_API_KEY || "",
// );

// export async function POST(req: Request) {
//   try {
//     await connectToDatabase();
//     const body = await req.json();
//     const { faceImage, tongueImage, formData, userId, patientName } = body;

//     // --- 1. DYNAMIC PROMPT LOGIC ---
//     const age = parseInt(formData.age);
//     const isFemale = formData.gender === "Female";
//     const requiresMenstrualQuestion = isFemale && age >= 12 && age <= 55;

//     const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

//     const prompt = `
//       You are an expert Ayurvedic Doctor (Vaidya) and AI diagnostic validator.
//       I am providing a patient's clinical data and images.
//       Patient: Age ${formData.age}, Gender: ${formData.gender}. City: ${formData.city}.
//       Symptoms: "${formData.symptoms}". Duration: ${formData.duration} days.
//       Medical History: "${formData.medicalHistory}".

//       Step 1: VALIDATION
//       - Look at Image 1. Is it a human face? If not, fail validation.
//       - Look at Image 2 (if provided). Is it a human tongue? If not, fail validation.

//       Step 2: DYNAMIC QUESTION GENERATION
//       If valid, look carefully at the skin condition visible in the image.
//       Generate exactly 5 targeted multiple-choice questions to assess the underlying Dosha imbalance (Vata/Pitta/Kapha) based on the visual skin condition and the provided clinical details.

//       ${requiresMenstrualQuestion ? "- IMPORTANT: Since the patient is a female of menstruating age, exactly one of the questions MUST address hormonal/menstrual health or cycle patterns related to skin breakouts." : ""}

//       - Each question MUST have exactly 3 options: one Vata-type answer, one Pitta-type answer, and one Kapha-type answer.

//       Respond STRICTLY in this JSON format without markdown blocks or backticks:
//       {
//         "isValid": boolean,
//         "errorMessage": "If invalid, say 'Please upload a proper face/tongue image.' Else null.",
//         "questions": [
//           { "id": "q1", "text": "Question text?", "options": ["Vata option", "Pitta option", "Kapha option"] },
//           { "id": "q2", "text": "...", "options": ["...", "...", "..."] },
//           { "id": "q3", "text": "...", "options": ["...", "...", "..."] },
//           { "id": "q4", "text": "...", "options": ["...", "...", "..."] },
//           { "id": "q5", "text": "...", "options": ["...", "...", "..."] }
//         ]
//       }
//     `;

//     const imageParts = [];
//     if (faceImage)
//       imageParts.push({
//         inlineData: { data: faceImage.split(",")[1], mimeType: "image/jpeg" },
//       });
//     if (tongueImage)
//       imageParts.push({
//         inlineData: { data: tongueImage.split(",")[1], mimeType: "image/jpeg" },
//       });

//     // --- 2. CALL GEMINI ---
//     const result = await model.generateContent([prompt, ...imageParts]);
//     const responseText = result.response.text();

//     const cleanJson = responseText
//       .replace(/```json/g, "")
//       .replace(/```/g, "")
//       .trim();
//     const aiData = JSON.parse(cleanJson);

//     if (!aiData.isValid) {
//       return NextResponse.json(
//         { success: false, message: aiData.errorMessage },
//         { status: 400 },
//       );
//     }

//     // --- 3. SAVE TO MONGODB ---
//     const newRecord = await PatientRecord.create({
//       userId: userId || "mock-user-123",
//       patientName: patientName || "John Doe",
//       images: { faceUrl: faceImage, tongueUrl: tongueImage },
//       demographics: {
//         age: formData.age,
//         gender: formData.gender,
//         city: formData.city,
//         pincode: formData.pincode,
//       },
//       clinical: {
//         symptoms: formData.symptoms,
//         duration: formData.duration,
//         medicineTaken: formData.medicineTaken === "yes",
//         medicineDetails: formData.medicineDetails,
//         medicalHistory: formData.medicalHistory,
//       },
//       dynamicQuestions: aiData.questions,
//     });

//     return NextResponse.json({
//       success: true,
//       recordId: newRecord._id,
//       questions: aiData.questions,
//     });
//   } catch (error) {
//     console.error("Generation Error:", error);
//     return NextResponse.json(
//       {
//         success: false,
//         message: "Failed to generate questions. Please try again.",
//       },
//       { status: 500 },
//     );
//   }
// }

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
    const body = await req.json();
    const { faceImage, tongueImage, formData, userId, patientName } = body;

    // --- 1. DYNAMIC PROMPT LOGIC ---
    const age = parseInt(formData.age);
    const isFemale = formData.gender === "Female";
    const requiresMenstrualQuestion = isFemale && age >= 12 && age <= 55;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const prompt = `
      You are a STRICT Medical Intake Gatekeeper and an expert Ayurvedic Doctor (Vaidya).
      I am providing a patient's clinical data and images.
      Patient: Age ${formData.age}, Gender: ${formData.gender}. City: ${formData.city}.
      Symptoms: "${formData.symptoms}". Duration: ${formData.duration} days.
      Medical History: "${formData.medicalHistory}".

      ⚠️ STEP 1: STRICT VISUAL VALIDATION (CRITICAL)
      You must act as a strict gatekeeper. Do not guess or be lenient.
      - Check Image 1: It MUST be a clear, full human face. Both eyes, the nose, and the mouth must be visible. If it is a picture of a hand, an arm, an animal, a random object, OR a severely cropped close-up of just a cheek or forehead or any part of the face, you MUST set "isValid" to false and provide a specific error message.
      - Check Image 2 (if provided): It MUST be a clear picture of a human tongue. If it is anything else, set "isValid" to false.

      STEP 2: DYNAMIC QUESTION GENERATION
      If AND ONLY IF the images pass the strict validation above, look carefully at the visual evidence.
      Generate exactly 5 targeted multiple-choice questions to assess the underlying Dosha imbalance (Vata/Pitta/Kapha).
      
      - Focus heavily on the facial skin condition.
      ${tongueImage ? "- IMPORTANT: A tongue image was provided. You MUST dedicate at least 1 or 2 questions to Jihva Pariksha (Tongue diagnosis), evaluating their digestion (Agni), taste, or gut symptoms based on the coating/color you see on their tongue." : ""}
      ${requiresMenstrualQuestion ? "- IMPORTANT: Since the patient is a female of menstruating age, exactly one of the questions MUST address hormonal/menstrual health or cycle patterns related to skin breakouts." : ""}
      
      - Each question MUST have exactly 3 options: one Vata-type answer, one Pitta-type answer, and one Kapha-type answer.

      Respond STRICTLY in this JSON format:
      {
        "isValid": true or false,
        "errorMessage": "If invalid, explain why. If valid, set to null.",
        "questions": [
          { "id": "q1", "text": "Question text?", "options": ["Vata option", "Pitta option", "Kapha option"] },
          { "id": "q2", "text": "...", "options": ["...", "...", "..."] },
          { "id": "q3", "text": "...", "options": ["...", "...", "..."] },
          { "id": "q4", "text": "...", "options": ["...", "...", "..."] },
          { "id": "q5", "text": "...", "options": ["...", "...", "..."] }
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
    const result = await model.generateContent([prompt, ...imageParts]);
    const responseText = result.response.text();

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
    return NextResponse.json(
      {
        success: false,
        message: "Failed to generate questions. Please try again.",
      },
      { status: 500 },
    );
  }
}
