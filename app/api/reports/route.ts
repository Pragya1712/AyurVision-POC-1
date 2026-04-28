import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import PatientRecord from "@/lib/models/PatientRecord";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-ayurveda-key";

export async function GET(req: Request) {
  try {
    await connectToDatabase();

    // 1. Extract the Token from the Authorization Header
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: No token provided" },
        { status: 401 },
      );
    }

    // Get just the token string (removes the "Bearer " part)
    const token = authHeader.split(" ")[1];

    // 2. Verify the Token mathematically
    let decodedToken;
    try {
      // This decrypts the token back into { id, name, email }
      decodedToken = jwt.verify(token, JWT_SECRET) as {
        id: string;
        name: string;
        email: string;
      };
    } catch (err) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Invalid or expired token" },
        { status: 403 },
      );
    }

    // 3. ONLY fetch records where the userId matches the ID from the secure token!
    const records = await PatientRecord.find({ userId: decodedToken.id })
      .select("-images") // We exclude images here so the history list loads lightning fast
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: records });
  } catch (error) {
    console.error("Fetch Reports Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
