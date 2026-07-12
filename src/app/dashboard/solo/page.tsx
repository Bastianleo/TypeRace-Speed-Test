import { TypingTest } from "@/features/typing-test/components/TypingTest";

export const metadata = {
  title: "Solo Typing — TypeRace",
};

export default function SoloTypingPage() {
  return (
    <div className="flex flex-col gap-8 px-4 py-10 sm:px-8">
      <div className="mx-auto w-full max-w-4xl">
        <h1 className="text-lg font-semibold">Solo Typing</h1>
        <p className="text-sm text-muted-foreground">
          Uji kecepatan dan akurasi mengetik Anda secara real-time.
        </p>
      </div>
      <TypingTest />
    </div>
  );
}
