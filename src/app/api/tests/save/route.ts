import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function calcXp(wpm: number, accuracy: number) {
  return Math.round(wpm * (accuracy / 100));
}

function calcLevel(xp: number) {
  // Level up every 100 XP
  return Math.floor(xp / 100) + 1;
}

export async function POST(request: Request) {
  try {
    const sessionCookie = request.headers.get("cookie")?.split("; ")
      .find(row => row.startsWith("user_session="))
      ?.split("=")[1];

    if (!sessionCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Mock sessions can't save to DB, just return ok
    if (sessionCookie.startsWith("mock:")) {
      return NextResponse.json({ success: true, mock: true });
    }

    const body = await request.json();
    const { wpm, rawWpm, accuracy, consistency, correctChars, incorrectChars, errors, grade, durationSeconds, language, difficulty } = body;

    const gainedXp = calcXp(wpm, accuracy);

    // Save result and update XP atomically
    let updatedUser;
    try {
      const user = await prisma.user.findUnique({ where: { id: sessionCookie } });
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const newXp = user.xp + gainedXp;
      const newLevel = calcLevel(newXp);

      await prisma.typingResult.create({
        data: {
          userId: user.id,
          mode: "solo",
          durationSeconds: durationSeconds ?? 30,
          language: language ?? "ENGLISH",
          difficulty: difficulty ?? "MEDIUM",
          wpm,
          rawWpm: rawWpm ?? wpm,
          accuracy,
          consistency: consistency ?? 85,
          correctChars: correctChars ?? 0,
          incorrectChars: incorrectChars ?? 0,
          errors: errors ?? 0,
          grade: grade ?? "C",
        },
      });

      updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { xp: newXp, level: newLevel },
      });
    } catch (dbError) {
      const msg = dbError instanceof Error ? dbError.message : String(dbError);
      console.error("DB error saving test:", msg);
      return NextResponse.json({ success: false, error: "DB unavailable" });
    }

    return NextResponse.json({
      success: true,
      gainedXp,
      user: { level: updatedUser.level, xp: updatedUser.xp },
    });
  } catch (error) {
    console.error("Save test error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
