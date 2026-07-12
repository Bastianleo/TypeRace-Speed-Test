import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const sessionCookie = request.headers.get("cookie")?.split("; ")
      .find(row => row.startsWith("user_session="))
      ?.split("=")[1];

    if (!sessionCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (sessionCookie.startsWith("mock:")) {
      return NextResponse.json({
        stats: {
          completedTests: 0,
          bestWpm: 0,
          avgWpm: 0,
          avgAccuracy: 0,
          totalTimeMinutes: 0,
          level: 1,
          xp: 0,
        }
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionCookie }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const results = await prisma.typingResult.findMany({
      where: { userId: user.id }
    });

    const completedTests = results.length;
    const bestWpm = completedTests > 0 ? Math.max(...results.map(r => r.wpm)) : 0;
    const avgWpm = completedTests > 0 ? Math.round(results.reduce((acc, r) => acc + r.wpm, 0) / completedTests) : 0;
    const avgAccuracy = completedTests > 0 ? parseFloat((results.reduce((acc, r) => acc + r.accuracy, 0) / completedTests).toFixed(1)) : 0;
    const totalTimeSeconds = results.reduce((acc, r) => acc + r.durationSeconds, 0);
    const totalTimeMinutes = Math.round(totalTimeSeconds / 60);

    return NextResponse.json({
      stats: {
        completedTests,
        bestWpm,
        avgWpm,
        avgAccuracy,
        totalTimeMinutes,
        level: user.level,
        xp: user.xp,
      }
    });
  } catch (error) {
    console.error("Fetch profile stats error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
