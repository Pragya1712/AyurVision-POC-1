// import { NextResponse } from "next/server";
// import { connectToDatabase } from "@/lib/mongodb";
// import User from "@/lib/models/User";

// export async function POST(req: Request) {
//   try {
//     await connectToDatabase();

//     // Parse the JSON body from the Request object
//     const body = await req.json();
//     const { action, name, email, password } = body;

//     if (action === "signup") {
//       // 1. Check if user already exists
//       const existingUser = await User.findOne({ email });
//       if (existingUser) {
//         return NextResponse.json(
//           { success: false, message: "Email already in use." },
//           { status: 400 },
//         );
//       }

//       // 2. Create new user
//       const newUser = await User.create({ name, email, password });
//       return NextResponse.json({
//         success: true,
//         user: { id: newUser._id, name: newUser.name },
//       });
//     }

//     if (action === "login") {
//       // 1. Find user by email
//       const user = await User.findOne({ email });
//       if (!user) {
//         return NextResponse.json(
//           { success: false, message: "User not found." },
//           { status: 404 },
//         );
//       }

//       // 2. Check password
//       if (user.password !== password) {
//         return NextResponse.json(
//           { success: false, message: "Invalid password." },
//           { status: 401 },
//         );
//       }

//       return NextResponse.json({
//         success: true,
//         user: { id: user._id, name: user.name },
//       });
//     }

//     return NextResponse.json(
//       { success: false, message: "Invalid action." },
//       { status: 400 },
//     );
//   } catch (error) {
//     console.error("Auth API Error:", error);
//     return NextResponse.json(
//       { success: false, message: "Server error. Please try again." },
//       { status: 500 },
//     );
//   }
// }

import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/lib/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-ayurveda-key";

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { action, name, email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 },
      );
    }

    let user;

    // --- SIGNUP LOGIC ---
    if (action === "signup") {
      const existingUser = await User.findOne({ email });
      if (existingUser)
        return NextResponse.json(
          { success: false, message: "Email already exists" },
          { status: 400 },
        );

      // Encrypt the password before saving!
      const hashedPassword = await bcrypt.hash(password, 10);
      user = await User.create({ name, email, password: hashedPassword });
    }
    // --- LOGIN LOGIC ---
    else {
      user = await User.findOne({ email });

      // FIX: Check BOTH that the user exists AND that they have a password saved
      if (!user || !user.password) {
        return NextResponse.json(
          { success: false, message: "Invalid credentials" },
          { status: 401 },
        );
      }

      // Now TypeScript knows user.password is definitely a string!
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return NextResponse.json(
          { success: false, message: "Invalid credentials" },
          { status: 401 },
        );
      }
    }

    // Generate Secure Token
    const userPayload = { id: user._id, name: user.name, email: user.email };
    const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: "7d" });

    return NextResponse.json({ success: true, token, user: userPayload });
  } catch (error) {
    console.error("Auth Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
