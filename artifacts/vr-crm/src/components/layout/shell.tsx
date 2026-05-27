import { Sidebar } from "./sidebar";
import { BottomNav } from "./bottom-nav";
import { ChatWidget } from "@/components/chat-widget/chat-widget";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-background text-foreground selection:bg-primary/30">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />
        {children}
      </main>
      <BottomNav />
      <ChatWidget />
    </div>
  );
}
