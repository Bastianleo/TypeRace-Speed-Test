import { MultiplayerLobby } from "@/features/multiplayer/components/MultiplayerLobby";

export const metadata = {
  title: "Multiplayer — TypeRace",
};

export default function MultiplayerPage() {
  return (
    <div className="flex flex-col gap-8 px-4 py-10 sm:px-8">
      <div className="mx-auto w-full max-w-4xl">
        <MultiplayerLobby />
      </div>
    </div>
  );
}
