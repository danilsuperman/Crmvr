import { useState, useRef, useEffect } from "react";
import { Bot, Send, Zap, BookOpen, Users, Star, Calendar, MessageSquare, CheckCircle2, Clock, TrendingUp, Settings, Play, Pause, RefreshCw, Brain, Sparkles, ChevronRight, Plus, Trash2, Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useLocalStorage } from "@/lib/store";

type ChatMsg = { role: "bot" | "user" | "system"; text: string; time: string };
type BotRule = { id: string; trigger: string; action: string; active: boolean };
type BotScenario = { id: string; name: string; icon: string; desc: string; active: boolean };

const DEMO_HISTORY: ChatMsg[] = [
  { role: "system", text: "AI Администратор подключён и готов к работе", time: "09:00" },
  { role: "user",  text: "Привет! Сколько стоит 1 час VR?", time: "14:32" },
  { role: "bot",   text: "Привет! 👋 Час VR-игры:\n• 1 человек — 1 200 ₽/30 мин\n• 2 000 ₽/час\n• VIP 90 мин — 3 500 ₽\n\nЕсть пакеты со скидкой до 20%. Хотите узнать подробнее или сразу забронировать? 🎮", time: "14:32" },
  { role: "user",  text: "Есть ли места на пятницу вечером?", time: "14:33" },
  { role: "bot",   text: "Пятница 6 июня — свободные слоты:\n🕕 18:00 — Arena A (4 чел.)\n🕖 19:00 — Arena B (4 чел.)\n🕗 20:00 — VR Solo (1 чел.)\n\nСделать предварительную бронь? Для этого нужно ваше имя и номер телефона 📋", time: "14:33" },
  { role: "user",  text: "Да, запиши на 19:00, Arena B. Иванов Артём, +7 999 123-45-67", time: "14:34" },
  { role: "bot",   text: "✅ Бронь оформлена!\n\n📅 Пятница, 6 июня, 19:00\n🎮 Arena B — 4 места\n👤 Иванов Артём\n📞 +7 999 123-45-67\n\nЗа 2 часа пришлю напоминание. Предоплата 30% — по ссылке: vrpark.co/pay/INV-2847 💳", time: "14:34" },
];

const DEFAULT_RULES: BotRule[] = [
  { id: "r1", trigger: "Вопрос о ценах",          action: "Отправить прайс-лист",           active: true },
  { id: "r2", trigger: "Запрос на бронирование",  action: "Открыть форму бронирования",      active: true },
  { id: "r3", trigger: "Нет ответа 5 мин",        action: "Уведомить живого администратора", active: true },
  { id: "r4", trigger: "Вопрос про возраст/детей", action: "FAQ — возраст и правила",         active: true },
  { id: "r5", trigger: "Жалоба / недовольство",   action: "Эскалация к менеджеру + тег",    active: true },
  { id: "r6", trigger: "Слово «скидка» / «акция»", action: "Актуальные промо + купон",       active: false },
];

const DEFAULT_SCENARIOS: BotScenario[] = [
  { id: "sc1", name: "Приветствие",      icon: "👋", desc: "Встречает гостей, рассказывает об услугах", active: true },
  { id: "sc2", name: "Подбор игры",      icon: "🎮", desc: "Расспрашивает о предпочтениях и рекомендует игры", active: true },
  { id: "sc3", name: "Бронирование",     icon: "📅", desc: "Полный цикл: дата → зона → оплата → подтверждение", active: true },
  { id: "sc4", name: "Консультация",     icon: "💬", desc: "Отвечает на FAQ: цены, возраст, правила, парковка", active: true },
  { id: "sc5", name: "Возврат клиента",  icon: "🔄", desc: "Напоминает ушедшим клиентам, предлагает скидку", active: false },
  { id: "sc6", name: "День рождения",    icon: "🎂", desc: "Поздравляет с ДР, предлагает персональный бонус", active: true },
  { id: "sc7", name: "Сбор отзывов",     icon: "⭐", desc: "После сессии запрашивает отзыв и оценку", active: false },
];

const BOT_STATS = [
  { label: "Диалогов сегодня", value: "34", icon: MessageSquare, color: "text-blue-400" },
  { label: "Бронирований",     value: "11", icon: BookOpen,      color: "text-emerald-400" },
  { label: "Время ответа",     value: "2с", icon: Clock,         color: "text-amber-400" },
  { label: "Довольных",        value: "96%", icon: Star,         color: "text-violet-400" },
];

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      {[0, 150, 300].map(d => (
        <span key={d} className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: `${d}ms` }} />
      ))}
    </div>
  );
}

export default function AiAdmin() {
  const [rules, setRules] = useLocalStorage<BotRule[]>("vrpark_bot_rules", DEFAULT_RULES);
  const [scenarios, setScenarios] = useLocalStorage<BotScenario[]>("vrpark_bot_scenarios", DEFAULT_SCENARIOS);
  const [botEnabled, setBotEnabled] = useLocalStorage("vrpark_bot_enabled", true);
  const [autoBook, setAutoBook] = useLocalStorage("vrpark_bot_autobook", true);
  const [tab, setTab] = useState<"chat" | "scenarios" | "rules" | "stats">("chat");
  const [messages, setMessages] = useState<ChatMsg[]>(DEMO_HISTORY);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [testMode, setTestMode] = useState(false);
  const [addRuleOpen, setAddRuleOpen] = useState(false);
  const [ruleForm, setRuleForm] = useState({ trigger: "", action: "" });
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);

  const getBotReply = (text: string): string => {
    const t = text.toLowerCase();
    if (t.includes("цен") || t.includes("стоит") || t.includes("прайс"))
      return "💰 Наши тарифы:\n• 30 мин — 1 200 ₽/чел\n• 60 мин — 2 000 ₽/чел\n• VIP 90 мин — 3 500 ₽/чел\n\nЕсть скидки в будни 10:00–14:00 (-20%). Оформить бронь? 🎮";
    if (t.includes("брон") || t.includes("запис") || t.includes("место"))
      return "📅 Для бронирования уточните:\n1. Дату и время\n2. Количество гостей\n3. Предпочитаемую зону\n\nИли выберите готовый слот на vrpark.co/book 👉";
    if (t.includes("игр") || t.includes("подобр") || t.includes("что поиграть"))
      return "🎮 Расскажите немного о компании:\n• Сколько человек?\n• Есть ли дети?\n• Что нравится: экшен, гонки, совместная игра?\n\nПодберу идеальный вариант!";
    if (t.includes("возраст") || t.includes("дет") || t.includes("лет"))
      return "👶 Возрастные ограничения:\n• От 7 лет — базовые VR игры\n• До 14 лет — только с родителем\n• Гонки — от 10 лет\n\nЕсли есть вопросы, уточните — отвечу!";
    if (t.includes("скидк") || t.includes("акц") || t.includes("промо"))
      return "🎉 Актуальные акции:\n• Будни 10:00–14:00 — скидка 20%\n• День рождения — скидка 25% в день ДР\n• Группа 4+ — каждый 4-й БЕСПЛАТНО\n\nПромокод WELCOME20 — скидка при первом визите!";
    return "Понял вас! Уточните, пожалуйста, что именно вас интересует, и я сразу помогу 😊\n\n• Цены и тарифы\n• Бронирование\n• Подбор игры\n• Акции";
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    const userText = input.trim();
    const now = new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" });
    setInput("");
    setMessages(m => [...m, { role: "user", text: userText, time: now }]);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(m => [...m, { role: "bot", text: getBotReply(userText), time: new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" }) }]);
    }, 1200 + Math.random() * 800);
  };

  const addRule = () => {
    if (!ruleForm.trigger || !ruleForm.action) { toast.error("Заполните поля"); return; }
    setRules(rs => [...rs, { id: `r_${Date.now()}`, trigger: ruleForm.trigger, action: ruleForm.action, active: true }]);
    toast.success("Правило добавлено");
    setRuleForm({ trigger: "", action: "" });
    setAddRuleOpen(false);
  };

  return (
    <div className="flex flex-col h-full">
      <header className="h-14 border-b border-border/50 flex items-center justify-between px-4 md:px-6 bg-card/50 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/20 flex items-center justify-center">
            <Bot className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h1 className="text-sm font-bold leading-none">AI Администратор</h1>
            <p className="text-[10px] text-muted-foreground mt-0.5">Автоответы · Бронирование · Консультации</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:block">Бот</span>
            <Switch checked={botEnabled} onCheckedChange={v => { setBotEnabled(v); toast.success(v ? "AI Администратор запущен" : "Бот приостановлен"); }} />
            {botEnabled && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" />Активен</span>}
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-4 md:px-6 pt-4">
        {BOT_STATS.map((s, i) => (
          <div key={i} className="rounded-xl border border-border/50 bg-card/20 p-3">
            <div className="flex items-center gap-1.5 mb-1.5"><s.icon className={cn("w-3.5 h-3.5", s.color)} /><span className="text-[10px] text-muted-foreground">{s.label}</span></div>
            <p className="text-xl font-black">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 px-4 md:px-6 pt-3 pb-0 shrink-0 overflow-x-auto">
        {([
          { key: "chat",      icon: MessageSquare, label: "Чат (тест)" },
          { key: "scenarios", icon: Brain,         label: "Сценарии" },
          { key: "rules",     icon: Zap,           label: "Правила" },
          { key: "stats",     icon: TrendingUp,    label: "Аналитика" },
        ] as const).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap", tab === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted/20")}>
            <t.icon className="w-3.5 h-3.5" /> {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-hidden px-4 md:px-6 pt-4 pb-4 md:pb-6 flex flex-col gap-3 min-h-0">

        {/* CHAT */}
        {tab === "chat" && (
          <>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Тестовый чат — симулирует диалог с клиентом</p>
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => setMessages(DEMO_HISTORY)}><RefreshCw className="w-3 h-3" />Сбросить</Button>
            </div>
            <div className="flex-1 overflow-auto rounded-xl border border-border/30 bg-white dark:bg-[#1a1a2e] p-3 space-y-3 min-h-0">
              {messages.map((msg, i) => (
                <div key={i} className={cn("flex", msg.role === "user" ? "justify-end" : msg.role === "system" ? "justify-center" : "justify-start")}>
                  {msg.role === "system" ? (
                    <span className="text-[10px] px-3 py-1 rounded-full bg-muted/20 text-muted-foreground border border-border/30">{msg.text}</span>
                  ) : (
                    <>
                      {msg.role === "bot" && (
                        <div className="w-7 h-7 rounded-full bg-blue-500/15 border border-blue-500/20 flex items-center justify-center shrink-0 mr-2 mt-1">
                          <Bot className="w-3.5 h-3.5 text-blue-400" />
                        </div>
                      )}
                      <div className={cn("max-w-[78%] space-y-0.5")}>
                        <div className={cn("rounded-2xl px-3 py-2 text-[12px] leading-relaxed whitespace-pre-line",
                          msg.role === "bot" ? "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100 rounded-tl-sm" : "bg-primary text-primary-foreground rounded-tr-sm"
                        )}>{msg.text}</div>
                        <p className={cn("text-[9px] text-muted-foreground/50", msg.role === "user" ? "text-right" : "text-left")}>{msg.time}</p>
                      </div>
                    </>
                  )}
                </div>
              ))}
              {typing && (
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-blue-500/15 border border-blue-500/20 flex items-center justify-center shrink-0">
                    <Bot className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-tl-sm"><TypingDots /></div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="flex gap-2 shrink-0">
              <input
                className="flex-1 h-9 rounded-xl border border-border/50 bg-muted/10 px-3 text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50"
                placeholder="Напишите сообщение как клиент..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMessage()}
                disabled={typing || !botEnabled}
              />
              <Button className="h-9 w-9 p-0 shrink-0" onClick={sendMessage} disabled={typing || !botEnabled || !input.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5 shrink-0">
              {["Сколько стоит час?", "Есть места на пятницу?", "Что у вас за игры?", "Дети могут?", "Есть скидки?"].map(q => (
                <button key={q} onClick={() => setInput(q)} className="text-[10px] px-2 py-1 rounded-full border border-border/40 text-muted-foreground hover:bg-muted/20 transition-colors">
                  {q}
                </button>
              ))}
            </div>
          </>
        )}

        {/* SCENARIOS */}
        {tab === "scenarios" && (
          <div className="overflow-auto space-y-2">
            <p className="text-xs text-muted-foreground">Включите нужные сценарии — бот будет использовать их при общении с клиентами</p>
            {scenarios.map(sc => (
              <div key={sc.id} className={cn("rounded-xl border p-3 flex items-center gap-3 transition-all", sc.active ? "border-border/50 bg-card/20" : "border-border/30 bg-muted/5 opacity-60")}>
                <span className="text-2xl shrink-0">{sc.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{sc.name}</p>
                  <p className="text-[11px] text-muted-foreground">{sc.desc}</p>
                </div>
                <Switch checked={sc.active} onCheckedChange={v => { setScenarios(ss => ss.map(x => x.id === sc.id ? { ...x, active: v } : x)); toast.success(v ? `«${sc.name}» включён` : `«${sc.name}» выключен`); }} />
              </div>
            ))}
            <div className="rounded-xl border border-border/50 bg-card/20 p-3 space-y-2">
              <p className="text-xs font-semibold flex items-center gap-2"><Settings className="w-3.5 h-3.5" />Настройки автобронирования</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs">Автоматическая бронь</p>
                  <p className="text-[10px] text-muted-foreground">Бот создаёт бронь без участия администратора</p>
                </div>
                <Switch checked={autoBook} onCheckedChange={v => { setAutoBook(v); toast.success(v ? "Автобронирование включено" : "Требуется подтверждение вручную"); }} />
              </div>
            </div>
          </div>
        )}

        {/* RULES */}
        {tab === "rules" && (
          <div className="overflow-auto space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Правила определяют реакцию бота на триггеры</p>
              <Button size="sm" className="h-7 text-xs gap-1" onClick={() => setAddRuleOpen(true)}><Plus className="w-3 h-3" />Добавить</Button>
            </div>
            {rules.map(r => (
              <div key={r.id} className={cn("rounded-xl border p-3 flex items-center gap-3", r.active ? "border-border/50 bg-card/20" : "border-border/30 opacity-50")}>
                <Zap className={cn("w-4 h-4 shrink-0", r.active ? "text-amber-400" : "text-muted-foreground")} />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium truncate">Если: {r.trigger}</p>
                  <p className="text-[10px] text-muted-foreground truncate">→ {r.action}</p>
                </div>
                <Switch checked={r.active} onCheckedChange={v => setRules(rs => rs.map(x => x.id === r.id ? { ...x, active: v } : x))} />
                <Button variant="ghost" size="icon" className="h-7 w-7 p-0 text-destructive" onClick={() => { setRules(rs => rs.filter(x => x.id !== r.id)); toast.success("Правило удалено"); }}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* STATS */}
        {tab === "stats" && (
          <div className="overflow-auto space-y-4">
            <div className="grid grid-cols-1 gap-3">
              {[
                { label: "Всего диалогов (мес)", value: "847", change: "+12%", icon: MessageSquare, color: "text-blue-400" },
                { label: "Успешных бронирований", value: "214", change: "+23%", icon: BookOpen, color: "text-emerald-400" },
                { label: "Эскалаций к менеджеру", value: "38", change: "−18%", icon: Users, color: "text-amber-400" },
                { label: "Средний рейтинг бота", value: "4.8 ★", change: "Стабильно", icon: Star, color: "text-violet-400" },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-card/20">
                  <div className="w-9 h-9 rounded-lg bg-muted/20 border border-border/30 flex items-center justify-center shrink-0">
                    <s.icon className={cn("w-4 h-4", s.color)} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                    <p className="text-xl font-black">{s.value}</p>
                  </div>
                  <span className={cn("text-xs font-semibold", s.change.startsWith("+") ? "text-emerald-400" : s.change.startsWith("−") ? "text-red-400" : "text-muted-foreground")}>{s.change}</span>
                </div>
              ))}
            </div>
            <Card className="bg-card/30 border-border/50">
              <CardHeader className="pb-2 pt-4 px-4"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="w-4 h-4 text-blue-400" />Топ запросов</CardTitle></CardHeader>
              <CardContent className="px-4 pb-4 space-y-2">
                {[
                  { query: "Цены и тарифы",       count: 312, pct: 37 },
                  { query: "Бронирование",         count: 214, pct: 25 },
                  { query: "Подбор игры",          count: 145, pct: 17 },
                  { query: "Возраст / дети",       count: 98,  pct: 12 },
                  { query: "Акции и скидки",       count: 78,  pct: 9  },
                ].map(q => (
                  <div key={q.query} className="space-y-0.5">
                    <div className="flex items-center justify-between text-xs">
                      <span>{q.query}</span>
                      <span className="text-muted-foreground tabular-nums">{q.count}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-muted/20">
                      <div className="h-full rounded-full bg-blue-500/60" style={{ width: `${q.pct}%` }} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <Dialog open={addRuleOpen} onOpenChange={setAddRuleOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Новое правило</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1"><Label className="text-xs">Триггер (если...)</Label><Input className="h-8 text-sm" placeholder="Слово «скидка»" value={ruleForm.trigger} onChange={e => setRuleForm(f => ({ ...f, trigger: e.target.value }))} /></div>
            <div className="space-y-1"><Label className="text-xs">Действие (то...)</Label><Input className="h-8 text-sm" placeholder="Отправить список акций" value={ruleForm.action} onChange={e => setRuleForm(f => ({ ...f, action: e.target.value }))} /></div>
          </div>
          <div className="flex gap-2 mt-2">
            <Button variant="outline" className="flex-1 h-9" onClick={() => setAddRuleOpen(false)}>Отмена</Button>
            <Button className="flex-1 h-9" onClick={addRule}>Добавить</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
