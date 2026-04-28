import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import PatientRecord from "@/lib/models/PatientRecord";
import mongoose from "mongoose";

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    await connectToDatabase();

    // Await params to avoid Next.js 15 async access warnings
    const resolvedParams = await params;
    const { id } = resolvedParams;

    // 1. Safety Check: Is this even a valid MongoDB ID format?
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid Report ID format" },
        { status: 400 },
      );
    }

    // 2. Lookup the record
    const record = await PatientRecord.findById(id);

    // 3. Handle Not Found gracefully
    if (!record) {
      return NextResponse.json(
        { success: false, message: "Report not found in the database" },
        { status: 404 },
      );
    }

    // 4. Success
    return NextResponse.json({ success: true, data: record });
  } catch (error) {
    console.error("Fetch Report Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error while fetching report" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    await connectToDatabase();

    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id)
      return NextResponse.json(
        { success: false, message: "Missing ID" },
        { status: 400 },
      );

    const deletedRecord = await PatientRecord.findByIdAndDelete(id);

    if (!deletedRecord) {
      return NextResponse.json(
        { success: false, message: "Report not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Report deleted successfully",
    });
  } catch (error) {
    console.error("Delete Report Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error while deleting report" },
      { status: 500 },
    );
  }
}
