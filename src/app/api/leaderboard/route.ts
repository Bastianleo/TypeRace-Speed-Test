import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode") || "wpm"; // wpm or accuracy
    const period = searchParams.get("period") || "alltime"; // alltime, weekly, monthly

    // Date filter
    const now = new Date();
    let dateFilter = {};
    if (period === "weekly") {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { gte: oneWeekAgo } };
    } else if (period === "monthly") {
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { gte: oneMonthAgo } };
    }

    // Query top 100 results matching criteria
    const rawResults = await prisma.typingResult.findMany({
      where: {
        ...dateFilter,
      },
      include: {
        User: {
          select: {
            username: true,
            country: true,
          },
        },
      },
      orderBy:
        mode === "accuracy"
          ? [
              { accuracy: "desc" },
              { wpm: "desc" },
            ]
          : [
              { wpm: "desc" },
              { accuracy: "desc" },
            ],
      take: 100,
    });

    // Deduplicate to get the single best result per user
    const uniqueUserResults: typeof rawResults = [];
    const seenUserIds = new Set<string>();

    for (const res of rawResults) {
      if (!seenUserIds.has(res.userId)) {
        seenUserIds.add(res.userId);
        uniqueUserResults.push(res);
      }
      if (uniqueUserResults.length >= 10) {
        break;
      }
    }

    const leaderboard = uniqueUserResults.map((r, index) => ({
      rank: index + 1,
      username: r.User.username,
      country: r.User.country || "🌍",
      wpm: r.wpm,
      accuracy: r.accuracy,
      language: r.language,
    }));

    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error("Fetch leaderboard error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
