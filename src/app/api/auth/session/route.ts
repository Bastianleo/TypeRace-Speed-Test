import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const sessionCookie = request.headers.get("cookie")?.split("; ")
      .find(row => row.startsWith("user_session="))
      ?.split("=")[1];

    if (!sessionCookie) {
      return NextResponse.json({ user: null });
    }

    let user = null;

    if (sessionCookie.startsWith("mock:")) {
      const parts = sessionCookie.split(":");
      const username = parts[1] || "Player";
      const email = parts[2] || `${username}@example.com`;
      const country = parts[3] || "🌍";
      
      user = {
        id: sessionCookie,
        username,
        email,
        displayName: username,
        country,
        level: 1,
        xp: 0,
        createdAt: new Date().toISOString(),
      };
    } else {
      try {
        user = await prisma.user.findUnique({
          where: { id: sessionCookie },
        });
      } catch (_dbError) {
        console.warn("Database session check failed, falling back to basic mock user.");
        user = {
          id: sessionCookie,
          username: "Player",
          email: "player@example.com",
          displayName: "Player",
          country: "🌍",
          level: 1,
          xp: 0,
          createdAt: new Date().toISOString(),
        };
      }
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Auth session error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
