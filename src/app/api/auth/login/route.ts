import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { username, email, country, password, action } = await request.json();
    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }

    let user;
    
    // Hash password with SHA256 if provided
    const passwordHash = password 
      ? crypto.createHash("sha256").update(password).digest("hex") 
      : null;

    try {
      // Try database query
      user = await prisma.user.findUnique({
        where: { username },
      });

      if (action === "register") {
        if (user) {
          return NextResponse.json({ error: "Username sudah terdaftar" }, { status: 400 });
        }
        // Create user with password hash
        user = await prisma.user.create({
          data: {
            username,
            email: email || `${username}@example.com`,
            displayName: username,
            country: country || "🌍",
            passwordHash: passwordHash as any,
          } as any,
        });
      } else {
        // action === "login"
        if (!user) {
          return NextResponse.json({ error: "Username tidak terdaftar" }, { status: 400 });
        }
        
        // Verify password
        const dbUser = user as any;
        if (!dbUser.passwordHash || dbUser.passwordHash !== passwordHash) {
          return NextResponse.json({ error: "Password salah" }, { status: 400 });
        }
      }
    } catch (dbError) {
      const errMsg = dbError instanceof Error ? dbError.message : String(dbError);
      console.error("Database connection failed:", errMsg);
      return NextResponse.json(
        { error: `Database error: ${errMsg}` },
        { status: 500 }
      );
    }

    const response = NextResponse.json({ user });
    
    // Set cookie
    response.cookies.set("user_session", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Auth login error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
