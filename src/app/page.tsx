import dynamic from "next/dynamic";

const Wizard = dynamic(() => import("@/components/Wizard").then((m) => ({ default: m.Wizard })), {
  loading: () => (
    <div className="max-w-6xl mx-auto px-4 py-16 flex justify-center">
      <span className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
    </div>
  ),
});

export default function Home() {
  return (
    <main className="flex-1 relative min-h-screen">
      <Wizard />
    </main>
  );
}
