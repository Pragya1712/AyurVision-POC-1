import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Report from "@/lib/models/Report";

export async function GET() {
  try {
    await connectToDatabase();
    // For the doctor dashboard, fetch all reports
    const patients = await Report.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ patients });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch patients" },
      { status: 500 },
    );
  }
}
