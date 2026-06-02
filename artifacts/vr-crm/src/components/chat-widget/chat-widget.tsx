import { useState, useRef, useEffect, useCallback } from "react";
import { Brain, Send, X, Minus, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocalStorage } from "@/lib/store";

type Msg = { role: "ai" | "user"; text: string };

const INITIAL_MESSAGES: Msg[] = [
  { role: "ai", text: "Привет! Я AI-консультант вашего VR-парка. Спросите меня о загрузке, выручке, акциях или бронированиях — отвечу мгновенно." },
];

const AI_REPLIES: Record<string, string> = {
  загрузка: "Текущая загрузка парка — 71%. Пик ожидается в пятницу 18:00–21:00 (97%). Слабые слоты: Вт–Чт 10:00–14:00 (23%).",
  выручка: "За эту неделю выручка +8% к прошлой. Наибольший прирост дала Arena A в выходные. Рекомендую запустить Happy Hours в среду.",
  акция: "Лучшая акция сейчас — скидка 20% в будни 10:00–14:00. Прогнозирую +34% загрузки и +22 000 ₽/мес.",
  брон: "Сегодня 8 активных броней. Ближайшая — Arena A в 16:00 (Елена Петрова, 4 гостя). Есть свободные слоты в VR Solo и PS5.",
  клиент: "В базе 124 клиента. 12 не возвращались 30+ дней — рекомендую рассылку с купоном -15%.",
  бот: "AI-бот сейчас обрабатывает входящие запросы. Последний диалог: 14:35. Всего сегодня 23 диалога.",
};

function getReply(text: string): string {
  const lower = text.toLowerCase();
  for (const [key, val] of Object.entries(AI_REPLIES)) {
    if (lower.includes(key)) return val;
  }
  return "Анализирую данные парка... Рекомендую проверить раздел «AI Консалтинг» для детального анализа. Что именно вас интересует — загрузка, выручка или клиенты?";
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useLocalStorage<Msg[]>("vrpark_widget_chat", INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const dragStart = useRef<{ mx: number; my: number; px: number; py: number } | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (open && !minimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open, minimized]);

  const send = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    setMessages(m => [...m, { role: "user", text }]);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(m => [...m, { role: "ai", text: getReply(text) }]);
    }, 1200 + Math.random() * 600);
  }, [input, setMessages]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    dragStart.current = { mx: e.clientX, my: e.clientY, px: pos.x, py: pos.y };
    setDragging(true);
    e.preventDefault();
  }, [pos]);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      if (!dragStart.current) return;
      const dx = e.clientX - dragStart.current.mx;
      const dy = e.clientY - dragStart.current.my;
      setPos({ x: dragStart.current.px + dx, y: dragStart.current.py + dy });
    };
    const onUp = () => { setDragging(false); dragStart.current = null; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [dragging]);

  return (
    <>
      {open && (
        <div
          ref={panelRef}
          className={cn(
            "fixed z-50 flex flex-col rounded-2xl border border-border/60 shadow-2xl bg-card/95 backdrop-blur-md",
            "transition-all duration-200",
            minimized ? "h-12 w-72" : "w-80 h-[480px] sm:w-96"
          )}
          style={{
            bottom: `${(isMobile ? 72 : 24) - pos.y}px`,
            right: `${(isMobile ? 16 : 24) - pos.x}px`,
            userSelect: dragging ? "none" : undefined,
          }}
        >
          {/* Header (drag handle) */}
          <div
            className="flex items-center gap-2 px-3 py-2.5 border-b border-border/40 cursor-grab active:cursor-grabbing shrink-0 rounded-t-2xl bg-muted/20"
            onMouseDown={handleMouseDown}
          >
            <div className="w-7 h-7 rounded-lg bg-violet-500/15 border border-violet-500/20 flex items-center justify-center shrink-0">
              <Brain className="w-3.5 h-3.5 text-violet-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold leading-none">AI Консультант</p>
              {!minimized && <p className="text-[10px] text-muted-foreground mt-0.5">Онлайн · VR Park</p>}
            </div>
            <button
              onMouseDown={e => e.stopPropagation()}
              onClick={() => setMinimized(m => !m)}
              className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              onMouseDown={e => e.stopPropagation()}
              onClick={() => setOpen(false)}
              className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {!minimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {messages.map((msg, i) => (
                  <div key={i} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                    {msg.role === "ai" && (
                      <div className="w-5 h-5 rounded-full bg-violet-500/15 border border-violet-500/20 flex items-center justify-center shrink-0 mr-1.5 mt-0.5">
                        <Brain className="w-2.5 h-2.5 text-violet-400" />
                      </div>
                    )}
                    <div className={cn(
                      "max-w-[82%] rounded-2xl px-3 py-2 text-[11px] leading-relaxed",
                      msg.role === "ai"
                        ? "bg-muted/40 border border-border/30 text-foreground"
                        : "bg-primary text-primary-foreground"
                    )}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {typing && (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-violet-500/15 border border-violet-500/20 flex items-center justify-center shrink-0">
                      <Brain className="w-2.5 h-2.5 text-violet-400" />
                    </div>
                    <div className="bg-muted/40 border border-border/30 rounded-2xl px-3 py-2 flex items-center gap-1">
                      {[0, 150, 300].map(d => (
                        <span key={d} className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: `${d}ms` }} />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick suggestions */}
              <div className="px-3 pb-1 flex gap-1 flex-wrap">
                {["Загрузка сейчас", "Слабые слоты", "Акции"].map(q => (
                  <button
                    key={q}
                    onClick={() => setInput(q)}
                    className="text-[10px] px-2 py-0.5 rounded-full border border-border/40 text-muted-foreground hover:bg-muted/20 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Input */}
              <div className="p-3 pt-1 border-t border-border/40 flex gap-2">
                <input
                  className="flex-1 h-8 rounded-lg border border-border/50 bg-muted/10 px-3 text-xs placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50"
                  placeholder="Спросите AI..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && send()}
                />
                <button
                  onClick={send}
                  disabled={!input.trim() || typing}
                  className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 hover:bg-primary/90 transition-colors shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-[4.5rem] md:bottom-6 right-4 md:right-6 z-50 w-12 h-12 rounded-full bg-violet-600 text-white shadow-lg hover:bg-violet-500 transition-all hover:scale-105 active:scale-95 flex items-center justify-center"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-background" />
        </button>
      )}
    </>
  );
}
