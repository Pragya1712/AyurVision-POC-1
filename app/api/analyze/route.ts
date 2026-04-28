import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Report from "@/lib/models/Report";
import { generateDiagnosis } from "@/lib/services/aiService";

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const formData = await req.formData();

    const age = formData.get("age");
    const gender = formData.get("gender");
    const symptoms = formData.get("symptoms");
    const faceImage = formData.get("faceImage") as File;
    const userId = (formData.get("userId") as string) || "guest-user";

    let base64Image = "";
    if (faceImage && faceImage.size > 0) {
      const buffer = Buffer.from(await faceImage.arrayBuffer());
      base64Image = buffer.toString("base64");
    }

    const aiResult = await generateDiagnosis(
      `Age: ${age}, Gender: ${gender}, Symptoms: ${symptoms}`,
      base64Image,
    );

    const today = new Date();
    const ayuId = `AYU-${today.getFullYear()}${(today.getMonth() + 1).toString().padStart(2, "0")}${today.getDate()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newReport = await Report.create({
      patientId: ayuId,
      userId: userId,
      patientDetails: { age, gender, symptoms },
      diagnosis: aiResult,
    });

    return NextResponse.json({ success: true, reportId: newReport._id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
