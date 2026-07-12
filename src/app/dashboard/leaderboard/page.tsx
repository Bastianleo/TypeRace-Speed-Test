import { LeaderboardTable } from "@/features/leaderboard/components/LeaderboardTable";

export const metadata = {
  title: "Leaderboard — TypeRace",
};

export default function LeaderboardPage() {
  return (
    <div className="flex flex-col gap-8 px-4 py-10 sm:px-8">
      <div className="mx-auto w-full max-w-4xl">
        <LeaderboardTable />
      </div>
    </div>
  );
}
