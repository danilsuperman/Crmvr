import { useState, useEffect } from "react";
import { Brain, TrendingUp, TrendingDown, AlertTriangle, Zap, Clock, Users, Star, Gift, Send, RefreshCw, ChevronRight, Sparkles, BarChart2, CalendarClock, Bell, MessageSquare, PartyPopper, ArrowUpRight, Play, Pause, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useLocalStorage } from "@/lib/store";

const PEAK_HOURS = [
  { hour: "10:00", load: 15, day: "Вт" },
  { hour: "11:00", load: 28, day: "Вт" },
  { hour: "12:00", load: 35, day: "Вт" },
  { hour: "13:00", load: 42, day: "Вт" },
  { hour: "14:00", load: 38, day: "Вт" },
  { hour: "15:00", load: 55, day: "Вт" },
  { hour: "16:00", load: 72, day: "Вт" },
  { hour: "17:00", load: 88, day: "Вт" },
  { hour: "18:00", load: 97, day: "Вт" },
  { hour: "19:00", load: 100, day: "Вт" },
  { hour: "20:00", load: 95, day: "Вт" },
  { hour: "21:00", load: 78, day: "Вт" },
  { hour: "22:00", load: 45, day: "Вт" },
];

const WEEK_LOAD = [
  { day: "Пн", load: 45, trend: "low" },
  { day: "Вт", load: 62, trend: "mid" },
  { day: "Ср", load: 41, trend: "low" },
  { day: "Чт", load: 55, trend: "mid" },
  { day: "Пт", load: 83, trend: "high" },
  { day: "Сб", load: 98, trend: "peak" },
  { day: "Вс", load: 91, trend: "peak" },
];

const AI_INSIGHTS = [
  {
    id: "peak1",
    type: "peak",
    icon: TrendingUp,
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
    title: "Пик в пятницу 18:00–21:00",
    desc: "Ожидается 97% загрузка. Arena A и B будут перегружены — нет свободных слотов.",
    action: "Добавить зону",
    priority: "high",
  },
  {
    id: "low1",
    type: "low",
    icon: TrendingDown,
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
    title: "Низкая загрузка: Вт–Чт 10:00–14:00",
    desc: "Средняя загрузка 23%. Потенциально упущенная выручка ~18 000 ₽/нед.",
    action: "Запустить акцию",
    priority: "medium",
  },
  {
    id: "overload1",
    type: "overload",
    icon: AlertTriangle,
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/20",
    title: "Перегруз VR Solo в субботу",
    desc: "7 запросов на 1 зону. 3 клиента уходят без брони — потеря ~6 300 ₽.",
    action: "Перераспределить",
    priority: "high",
  },
  {
    id: "return1",
    type: "return",
    icon: Users,
    color: "text-violet-400",
    bg: "bg-violet-500/10 border-violet-500/20",
    title: "12 клиентов не возвращались 30+ дней",
    desc: "По историческим данным 65% ответят на акционное предложение «скучаем по тебе».",
    action: "Создать рассылку",
    priority: "medium",
  },
];

const RECOMMENDATIONS = [
  {
    id: "promo1",
    category: "Акция",
    icon: Gift,
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    title: "Скидка 20% в будни 10:00–14:00",
    desc: "AI прогнозирует +34% загрузки в тихие часы. Потенциальный прирост выручки +22 000 ₽/мес.",
    effort: "Авто",
    impact: "+22 000 ₽",
  },
  {
    id: "schedule1",
    category: "Расписание",
    icon: CalendarClock,
    color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    title: "Добавить слоты в пятницу с 21:30",
    desc: "Спрос не удовлетворён после 21:00. Дополнительные 2 слота = ~8 400 ₽/нед.",
    effort: "Ручное",
    impact: "+8 400 ₽",
  },
  {
    id: "happy1",
    category: "Счастливые часы",
    icon: PartyPopper,
    color: "text-pink-400 bg-pink-500/10 border-pink-500/20",
    title: "«Happy Hours» среда 15:00–17:00",
    desc: "Самый пустой слот недели. Формат 2+1 бесплатно поднимет загрузку до 70%.",
    effort: "Авто",
    impact: "+14 500 ₽",
  },
  {
    id: "transfer1",
    category: "Перенос",
    icon: ArrowUpRight,
    color: "text-violet-400 bg-violet-500/10 border-violet-500/20",
    title: "Переносить субботние брони на пятницу",
    desc: "Предложить клиентам с субботы 19:00 перенести на пятницу 19:00 за бонус 200 ₽.",
    effort: "Полуавто",
    impact: "Снизит перегруз",
  },
];

const AUTO_ACTIONS = [
  { id: "aa1", icon: Send, label: "Рассылка «Возврат клиента»", desc: "Клиентам без визитов 30+ дней → купон -15%", active: true, runs: 3, lastRun: "Сегодня 09:00" },
  { id: "aa2", icon: PartyPopper, label: "Счастливые часы (авто)", desc: "Вт–Чт 10:00–14:00 → скидка 20% в виджете", active: true, runs: 12, lastRun: "Вт 10:00" },
  { id: "aa3", icon: Bell, label: "Уведомление о пике", desc: "За 48ч до пика → напомнить клиентам о брони", active: false, runs: 0, lastRun: "—" },
  { id: "aa4", icon: Star, label: "Акция «День рождения»", desc: "За 3 дня до ДР → персональная скидка 25%", active: true, runs: 7, lastRun: "Вчера 12:00" },
  { id: "aa5", icon: MessageSquare, label: "Авто-ответ на незабронированных", desc: "Клиент смотрел слоты но не забронировал → напоминание", active: false, runs: 0, lastRun: "—" },
];

const CHAT_HISTORY = [
  { role: "ai", text: "Привет! Я анализирую данные вашего парка в реальном времени. На этой неделе загрузка +8% по сравнению с прошлой. Хотите узнать что делать дальше?" },
  { role: "user", text: "Что сделать чтобы увеличить выручку в среду?" },
  { role: "ai", text: "Среда — самый слабый день (41% загрузка). Рекомендую:\n\n1. 🎉 Happy Hours 15:00–17:00 с форматом «2+1 бесплатно» — прогноз +14 500 ₽/мес\n2. 📩 Рассылка постоянным клиентам с персональным кодом\n3. 📅 Добавить корпоративный пакет на среду со скидкой 15%\n\nЗапустить автоматически?" },
];

function LoadBar({ load, color }: { load: number; color: string }) {
  return (
    <div className="w-full h-1.5 rounded-full bg-muted/20 overflow-hidden">
      <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${load}%` }} />
    </div>
  );
}

export default function AiConsulting() {
  const [activeActions, setActiveActions] = useLocalStorage<string[]>("vrpark_ai_active_actions", ["aa1", "aa2", "aa4"]);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState(CHAT_HISTORY);
  const [typing, setTyping] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<string | null>(null);
  const [autoMode, setAutoMode] = useLocalStorage("vrpark_ai_auto_mode", false);

  const toggleAction = (id: string) => {
    setActiveActions(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    setMessages(m => [...m, { role: "user", text: userMsg }]);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(m => [...m, {
        role: "ai",
        text: "Анализирую данные... Вот что я рекомендую на основе текущей загрузки и истории бронирований:\n\n💡 Для максимального эффекта в ближайшие 7 дней — запустите «Счастливые часы» в период низкой загрузки. Это даст прирост +15–20% выручки без дополнительных затрат.\n\nХотите я настрою это автоматически?",
      }]);
    }, 1800);
  };

  const applyRecommendation = (id: string) => {
    toast.success("Рекомендация применена и запущена");
  };

  return (
    <div className="flex flex-col h-full">
      <header className="h-14 border-b border-border/50 flex items-center justify-between px-4 md:px-6 bg-card/50 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
            <Brain className="w-4 h-4 text-violet-400" />
          </div>
          <div>
            <h1 className="text-sm font-bold leading-none">AI Консалтинг</h1>
            <p className="text-[10px] text-muted-foreground mt-0.5">Анализ бизнеса и автоматизация роста</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">Авторежим</span>
          <Switch checked={autoMode} onCheckedChange={v => { setAutoMode(v); toast.success(v ? "Авторежим включён — AI управляет акциями" : "Авторежим отключён"); }} />
          {autoMode && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" />Авто</span>}
        </div>
      </header>

      <div className="flex-1 overflow-auto p-4 md:p-6 space-y-5 pb-20 md:pb-6">

        {/* KPI row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: TrendingUp, label: "Загрузка сейчас", value: "71%", sub: "+8% vs прошлая нед.", color: "text-emerald-400", bg: "bg-emerald-500/10" },
            { icon: Zap, label: "Прогноз пика", value: "Пт 18:00", sub: "97% загрузка", color: "text-amber-400", bg: "bg-amber-500/10" },
            { icon: TrendingDown, label: "Слабое место", value: "Ср 10–14", sub: "23% загрузка", color: "text-blue-400", bg: "bg-blue-500/10" },
            { icon: Users, label: "Клиентов к возврату", value: "12", sub: "Без визита 30+ дн.", color: "text-violet-400", bg: "bg-violet-500/10" },
          ].map((stat, i) => (
            <div key={i} className={cn("rounded-xl border border-border/50 p-3 space-y-1.5", stat.bg.replace("bg-", "bg-") + "/5")}>
              <div className="flex items-center gap-1.5">
                <stat.icon className={cn("w-3.5 h-3.5", stat.color)} />
                <span className="text-[10px] text-muted-foreground">{stat.label}</span>
              </div>
              <p className="text-xl font-black tabular-nums">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground">{stat.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left column: load forecast */}
          <div className="lg:col-span-2 space-y-4">

            {/* Hourly load today */}
            <Card className="bg-card/30 border-border/50">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-primary" /> Загрузка по часам (сегодня)
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="flex items-end gap-1 h-24">
                  {PEAK_HOURS.map((h, i) => {
                    const pct = h.load;
                    const color = pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : pct >= 45 ? "bg-emerald-500" : "bg-blue-500/60";
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1 group cursor-pointer">
                        <div className="relative w-full flex items-end justify-center" style={{ height: 72 }}>
                          <div
                            className={cn("w-full rounded-t-sm transition-all", color)}
                            style={{ height: `${Math.max(4, (pct / 100) * 72)}px` }}
                          />
                        </div>
                        <span className="text-[8px] text-muted-foreground/60 rotate-45 origin-left">{h.hour.slice(0, 2)}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center gap-4 mt-3 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" />Перегруз 90%+</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" />Высокая 70%+</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" />Норма</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500/60" />Низкая</span>
                </div>
              </CardContent>
            </Card>

            {/* Week load */}
            <Card className="bg-card/30 border-border/50">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CalendarClock className="w-4 h-4 text-blue-400" /> Прогноз на неделю
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-2.5">
                {WEEK_LOAD.map((d, i) => {
                  const barColor = d.load >= 90 ? "bg-red-500" : d.load >= 70 ? "bg-amber-500" : d.load >= 50 ? "bg-emerald-500" : "bg-blue-500/60";
                  const label = d.load >= 90 ? { text: "ПИКОВЫЙ", cls: "text-red-400 bg-red-500/10 border-red-500/20" } :
                    d.load >= 70 ? { text: "ВЫСОКИЙ", cls: "text-amber-400 bg-amber-500/10 border-amber-500/20" } :
                    d.load >= 50 ? { text: "НОРМА", cls: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" } :
                    { text: "НИЗКИЙ", cls: "text-blue-400 bg-blue-500/10 border-blue-500/20" };
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs font-bold w-6 text-muted-foreground">{d.day}</span>
                      <div className="flex-1">
                        <LoadBar load={d.load} color={barColor} />
                      </div>
                      <span className="text-xs font-bold tabular-nums w-8 text-right">{d.load}%</span>
                      <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full border", label.cls)}>{label.text}</span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card className="bg-card/30 border-border/50">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" /> Рекомендации AI
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-3">
                {RECOMMENDATIONS.map(rec => (
                  <div key={rec.id} className={cn("rounded-xl border p-3 space-y-2", rec.color.split(" ").slice(1).join(" "))}>
                    <div className="flex items-start gap-3">
                      <div className={cn("w-8 h-8 rounded-lg border flex items-center justify-center shrink-0", rec.color.split(" ").slice(1).join(" "))}>
                        <rec.icon className={cn("w-4 h-4", rec.color.split(" ")[0])} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-xs font-bold">{rec.title}</p>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-background/40 text-muted-foreground border border-border/30">{rec.category}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{rec.desc}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                        <span>Усилие: <span className="font-medium text-foreground">{rec.effort}</span></span>
                        <span>Эффект: <span className="font-bold text-emerald-400">{rec.impact}</span></span>
                      </div>
                      <Button size="sm" className="h-7 text-[11px] gap-1" onClick={() => applyRecommendation(rec.id)}>
                        <Zap className="w-3 h-3" /> Применить
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right column: insights + auto actions + chat */}
          <div className="space-y-4">

            {/* AI Insights */}
            <Card className="bg-card/30 border-border/50">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Brain className="w-4 h-4 text-violet-400" /> AI Видит
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-2">
                {AI_INSIGHTS.map(ins => (
                  <button
                    key={ins.id}
                    onClick={() => setSelectedInsight(selectedInsight === ins.id ? null : ins.id)}
                    className={cn(
                      "w-full text-left rounded-xl border p-3 transition-all",
                      ins.bg,
                      selectedInsight === ins.id ? "ring-1 ring-primary/30" : "hover:opacity-90"
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <ins.icon className={cn("w-3.5 h-3.5 shrink-0 mt-0.5", ins.color)} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold leading-tight">{ins.title}</p>
                        {selectedInsight === ins.id && (
                          <p className="text-[10px] text-muted-foreground mt-1">{ins.desc}</p>
                        )}
                      </div>
                      <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full border shrink-0",
                        ins.priority === "high" ? "text-red-400 bg-red-500/10 border-red-500/20" : "text-amber-400 bg-amber-500/10 border-amber-500/20"
                      )}>{ins.priority === "high" ? "СРОЧНО" : "ВАЖНО"}</span>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Automated actions */}
            <Card className="bg-card/30 border-border/50">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-400" /> Автоматические действия
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-2">
                {AUTO_ACTIONS.map(action => {
                  const isActive = activeActions.includes(action.id);
                  return (
                    <div key={action.id} className={cn("rounded-xl border p-2.5 transition-all", isActive ? "border-emerald-500/25 bg-emerald-500/5" : "border-border/40 bg-card/10")}>
                      <div className="flex items-center gap-2">
                        <div className={cn("w-7 h-7 rounded-lg border flex items-center justify-center shrink-0",
                          isActive ? "bg-emerald-500/15 border-emerald-500/25" : "bg-muted/20 border-border/30"
                        )}>
                          <action.icon className={cn("w-3.5 h-3.5", isActive ? "text-emerald-400" : "text-muted-foreground")} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-semibold leading-tight truncate">{action.label}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{action.desc}</p>
                        </div>
                        <Switch checked={isActive} onCheckedChange={() => { toggleAction(action.id); toast.success(isActive ? `«${action.label}» отключено` : `«${action.label}» запущено`); }} />
                      </div>
                      {isActive && (
                        <div className="flex items-center gap-3 mt-1.5 ml-9 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1 text-emerald-400"><CheckCircle2 className="w-3 h-3" />Активно</span>
                          <span>Запусков: {action.runs}</span>
                          <span>Посл.: {action.lastRun}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* AI Chat */}
            <Card className="bg-card/30 border-border/50">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-sky-400" /> Спросить AI
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-3">
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {messages.map((msg, i) => (
                    <div key={i} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                      {msg.role === "ai" && (
                        <div className="w-6 h-6 rounded-full bg-violet-500/15 border border-violet-500/20 flex items-center justify-center shrink-0 mr-2 mt-0.5">
                          <Brain className="w-3 h-3 text-violet-400" />
                        </div>
                      )}
                      <div className={cn(
                        "max-w-[85%] rounded-2xl px-3 py-2 text-[11px] leading-relaxed whitespace-pre-line",
                        msg.role === "ai"
                          ? "bg-muted/30 border border-border/30 text-foreground"
                          : "bg-primary text-primary-foreground"
                      )}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {typing && (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-violet-500/15 border border-violet-500/20 flex items-center justify-center shrink-0">
                        <Brain className="w-3 h-3 text-violet-400" />
                      </div>
                      <div className="bg-muted/30 border border-border/30 rounded-2xl px-3 py-2 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    className="flex-1 h-8 rounded-lg border border-border/50 bg-muted/10 px-3 text-xs placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50"
                    placeholder="Как увеличить загрузку в среду?"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && sendMessage()}
                  />
                  <Button size="sm" className="h-8 w-8 p-0 shrink-0" onClick={sendMessage} disabled={typing || !chatInput.trim()}>
                    <Send className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {["Что делать в тихие часы?", "Когда пик?", "Запустить акцию"].map(q => (
                    <button key={q} onClick={() => { setChatInput(q); }} className="text-[10px] px-2 py-1 rounded-full border border-border/40 text-muted-foreground hover:bg-muted/20 transition-colors">
                      {q}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
