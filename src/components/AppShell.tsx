import { Header } from "@/components/Header";
import { ShortlistProvider } from "@/components/ShortlistProvider";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ShortlistProvider>
      <div className="fixed inset-0 -z-10 bg-[#0c0f1a]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-orange-500/6 rounded-full blur-3xl" />
      </div>
      <Header />
      {children}
    </ShortlistProvider>
  );
}
