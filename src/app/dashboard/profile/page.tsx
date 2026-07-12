import { ProfileCard } from "@/features/profile/components/ProfileCard";

export const metadata = {
  title: "Profil — TypeRace",
};

export default function ProfilePage() {
  return (
    <div className="flex flex-col gap-8 px-4 py-10 sm:px-8">
      <div className="mx-auto w-full max-w-4xl">
        <ProfileCard />
      </div>
    </div>
  );
}
