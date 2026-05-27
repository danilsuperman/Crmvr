import { useState } from "react";
import { useParams, Link } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft, Phone, Mail, MessageSquare, Star, Calendar, CreditCard,
  Gamepad2, Users, Baby, Cake, UtensilsCrossed, TrendingUp, AlertTriangle,
  Bot, Sparkles, Heart, Trophy, Clock, Zap, Edit2, Save, X, ChevronDown, ChevronUp
} from "lucide-react";
import { toast } from "sonner";

// ─── MOCK CLIENT DATA ──────────────────────────────────────────────────────────

const MOCK_CLIENT = {
  id: 1,
  name: "Иван Петров",
  phone: "+7 916 123-45-67",
  email: "ivan.petrov@email.com",
  telegram: "@ivan_petrov",
  whatsapp: true,
  instagram: "@ivan.vr",
  status: "VIP" as const,
  tags: ["Семья", "Постоянный"],
  totalVisits: 17,
  ltv: 84500,
  avgCheck: 4970,
  lastVisit: "3 дня назад",
  since: "Март 2024",
  birthday: "15 июля",

  aiSummary: "Любит соревновательные VR-игры. Чаще приходит по выходным с семьёй. Обычно берёт две зоны на 3–4 часа. Высокая вероятность брони на день рождения ребёнка. Средний чек выше среднего.",

  visits: [
    { date: "14 мая", zone: "Arena A", duration: "1 ч", amount: 4500, company: "Семья", status: "confirmed" },
    { date: "2 мая", zone: "Racing Zone", duration: "30 мин", amount: 1800, company: "Друзья", status: "confirmed" },
    { date: "23 апреля", zone: "Пакет VIP", duration: "3 ч", amount: 35000, company: "ДР сына", status: "confirmed" },
    { date: "10 марта", zone: "Arena B", duration: "1 ч", amount: 4200, company: "Семья", status: "confirmed" },
    { date: "1 февраля", zone: "VR Solo", duration: "30 мин", amount: 1200, company: "Один", status: "confirmed" },
  ],

  games: [
    { name: "Beat Saber", count: 12, icon: "🎵" },
    { name: "Zombie Arena", count: 7, icon: "🧟" },
    { name: "Racing VR", count: 5, icon: "🏎️" },
    { name: "Pistol Whip", count: 4, icon: "🔫" },
    { name: "VR Dino", count: 3, icon: "🦕" },
  ],

  favoriteZones: ["Arena A", "Racing Zone", "VIP комната"],

  children: [
    { name: "Никита", age: 8, birthday: "12 августа", favoriteGames: ["VR Dino", "Cartoon Arena"] },
    { name: "Соня", age: 5, birthday: "3 марта", favoriteGames: ["VR Dino"] },
  ],

  events: [
    { year: "2025", desc: "Детский день рождения — Никита 8 лет", items: ["VIP комната", "Аниматор", "Пицца × 3"] },
    { year: "2024", desc: "Корпоратив команды (8 чел.)", items: ["Arena A + Arena B", "Пакет Standard"] },
  ],

  kitchen: {
    favorites: ["Пицца Пепперони", "Наггетсы", "Кола 0.5"],
    avgCheck: 2300,
    totalSpent: 18400,
  },

  finances: {
    total: 84500,
    avgCheck: 4970,
    games: 48600,
    kitchen: 18400,
    events: 35000,
    other: 2500,
  },

  feedback: [
    { type: "negative", date: "Фев 2025", text: "Жарко в VIP комнате, долго ждали инструктора" },
    { type: "positive", date: "Янв 2025", text: "Отличная атмосфера, дети были в восторге!" },
  ],

  messages: [
    { channel: "telegram", text: "Сколько стоит Arena A на выходные?", time: "14:32", from: "client" },
    { channel: "whatsapp", text: "Подтвердили бронь на субботу!", time: "Вчера", from: "operator" },
  ],

  ai: {
    repeatProb: 87,
    churnRisk: "Низкий",
    suggestions: [
      "Семейный пакет на выходные — скидка 10%",
      "Скидка на ДР ребёнка (август)",
      "Новая Racing игра — персональный инвайт",
    ],
    nextVisitPrediction: "Ближайшие 2 недели",
  },
};

// ─── CHANNEL BADGE ─────────────────────────────────────────────────────────────

const CH: Record<string, { label: string; color: string }> = {
  telegram:  { label: "TG",  color: "text-sky-400 bg-sky-500/10 border-sky-500/30" },
  whatsapp:  { label: "WA",  color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
  instagram: { label: "IG",  color: "text-pink-400 bg-pink-500/10 border-pink-500/30" },
};

function Section({ title, icon: Icon, children, defaultOpen = true }: {
  title: string; icon: React.ComponentType<any>; children: React.ReactNode; defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-border/50 bg-card/20 overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/10 transition-colors">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-semibold">{title}</span>
        </div>
        {open ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

// ─── MAIN ──────────────────────────────────────────────────────────────────────

export default function ClientDetail() {
  const params = useParams<{ id: string }>();
  const client = MOCK_CLIENT;
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: client.name, phone: client.phone, email: client.email });

  const statusColor = client.status === "VIP"
    ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
    : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="h-14 border-b border-border/50 flex items-center px-4 justify-between bg-card/50 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-2">
          <Link href="/clients">
            <button className="w-8 h-8 rounded-lg hover:bg-muted/20 flex items-center justify-center">
              <ChevronLeft className="w-4 h-4" />
            </button>
          </Link>
          <div>
            <h1 className="text-sm font-bold leading-tight">{client.name}</h1>
            <p className="text-[10px] text-muted-foreground">{client.totalVisits} визитов · с {client.since}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full border", statusColor)}>{client.status}</span>
          {editing ? (
            <>
              <Button size="sm" className="h-7 text-xs gap-1" onClick={() => { setEditing(false); toast.success("Сохранено"); }}>
                <Save className="w-3.5 h-3.5" /> Сохранить
              </Button>
              <button onClick={() => setEditing(false)} className="w-7 h-7 rounded-lg hover:bg-muted/20 flex items-center justify-center">
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </>
          ) : (
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => setEditing(true)}>
              <Edit2 className="w-3.5 h-3.5" /> Редактировать
            </Button>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-auto p-4 md:p-6 pb-20 md:pb-6">
        <div className="max-w-4xl mx-auto">

          {/* Top hero block */}
          <div className="rounded-xl border border-border/50 bg-card/30 p-4 mb-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Avatar + info */}
              <div className="flex items-start gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/40 to-violet-500/40 flex items-center justify-center text-xl font-black shrink-0">
                  {client.name.split(" ").map(w => w[0]).join("")}
                </div>
                <div>
                  {editing ? (
                    <div className="space-y-1.5">
                      <Input className="h-7 text-sm font-bold" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                      <Input className="h-7 text-xs" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                      <Input className="h-7 text-xs" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                    </div>
                  ) : (
                    <>
                      <h2 className="text-base font-black">{client.name}</h2>
                      <div className="flex flex-col gap-0.5 mt-1">
                        <a href={`tel:${client.phone}`} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5">
                          <Phone className="w-3 h-3" /> {client.phone}
                        </a>
                        <a href={`mailto:${client.email}`} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5">
                          <Mail className="w-3 h-3" /> {client.email}
                        </a>
                        <p className="text-xs text-sky-400 flex items-center gap-1.5">
                          <MessageSquare className="w-3 h-3" /> {client.telegram}
                        </p>
                      </div>
                      <div className="flex gap-1.5 mt-2">
                        {client.tags.map(t => (
                          <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted/30 border border-border/40 font-medium">{t}</span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* KPI metrics */}
              <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:ml-auto">
                {[
                  { label: "Визитов", value: client.totalVisits, color: "text-primary" },
                  { label: "LTV", value: `${(client.ltv / 1000).toFixed(0)}к₽`, color: "text-emerald-400" },
                  { label: "Ср. чек", value: `${(client.avgCheck / 1000).toFixed(1)}к₽`, color: "text-blue-400" },
                  { label: "Посл. визит", value: client.lastVisit, color: "text-muted-foreground" },
                ].map(m => (
                  <div key={m.label} className="rounded-xl bg-card/40 border border-border/30 p-2.5 text-center">
                    <p className={cn("text-lg font-black", m.color)}>{m.value}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{m.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Channel connections */}
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/30">
              <span className="text-[10px] text-muted-foreground">Каналы:</span>
              {[
                { ch: "telegram", active: !!client.telegram, label: client.telegram },
                { ch: "whatsapp", active: client.whatsapp, label: "WhatsApp" },
                { ch: "instagram", active: !!client.instagram, label: client.instagram },
              ].map(c => c.active && (
                <span key={c.ch} className={cn("text-[10px] px-1.5 py-0.5 rounded border font-semibold", CH[c.ch]?.color)}>
                  {CH[c.ch]?.label} {c.label}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* LEFT column */}
            <div className="lg:col-span-2 space-y-4">

              {/* Block 1: AI Summary */}
              <div className="rounded-xl border border-violet-500/30 bg-violet-500/5 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-violet-400" />
                  <span className="text-sm font-semibold text-violet-400">AI-сводка</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{client.aiSummary}</p>
              </div>

              {/* Block 2: Visit history */}
              <Section title="История посещений" icon={Calendar}>
                <div className="space-y-2">
                  {client.visits.map((v, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-card/30 border border-border/30 text-xs">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold">{v.date}</span>
                          <span className="text-muted-foreground">{v.zone}</span>
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="w-3 h-3" />{v.duration}
                          </span>
                          <span className="text-muted-foreground">{v.company}</span>
                        </div>
                      </div>
                      <span className="font-bold text-emerald-400 shrink-0 ml-2">{v.amount.toLocaleString("ru")} ₽</span>
                    </div>
                  ))}
                </div>
              </Section>

              {/* Block 3: Games */}
              <Section title="Игры и активности" icon={Gamepad2}>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground mb-2">Любимые игры</p>
                  {client.games.map((g, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-base">{g.icon}</span>
                      <div className="flex-1">
                        <div className="flex justify-between text-xs mb-0.5">
                          <span className="font-medium">{g.name}</span>
                          <span className="text-muted-foreground">{g.count}×</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted/20">
                          <div className="h-full rounded-full bg-primary/60" style={{ width: `${(g.count / client.games[0].count) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-1.5 mt-3 flex-wrap">
                    <p className="text-[10px] text-muted-foreground mr-1">Любимые зоны:</p>
                    {client.favoriteZones.map(z => (
                      <span key={z} className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium">{z}</span>
                    ))}
                  </div>
                </div>
              </Section>

              {/* Block 9: Messages mini-inbox */}
              <Section title="Сообщения" icon={MessageSquare} defaultOpen={false}>
                <div className="space-y-2">
                  {client.messages.map((m, i) => (
                    <div key={i} className={cn("flex gap-2 items-start", m.from === "operator" ? "flex-row-reverse" : "")}>
                      <div className={cn("text-[9px] font-bold px-1 py-0.5 rounded border shrink-0",
                        CH[m.channel]?.color
                      )}>{CH[m.channel]?.label}</div>
                      <div className={cn("rounded-xl px-3 py-2 text-xs max-w-[80%]",
                        m.from === "client" ? "bg-card/50 border border-border/40" : "bg-primary/10 border border-primary/20"
                      )}>
                        {m.text}
                        <div className="text-[9px] text-muted-foreground mt-0.5">{m.time}</div>
                      </div>
                    </div>
                  ))}
                  <Link href="/inbox">
                    <button className="w-full text-xs text-primary hover:underline py-1">Открыть полный Inbox →</button>
                  </Link>
                </div>
              </Section>

            </div>

            {/* RIGHT column */}
            <div className="space-y-4">

              {/* Block 4: Family */}
              <Section title="Семья и дети" icon={Baby}>
                <div className="space-y-2.5">
                  {client.children.map((child, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-card/30 border border-border/30">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold">{child.name}</span>
                        <span className="text-[10px] text-muted-foreground">{child.age} лет</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1 mb-1">
                        <Cake className="w-3 h-3" /> {child.birthday}
                      </p>
                      <div className="flex gap-1 flex-wrap">
                        {child.favoriteGames.map(g => (
                          <span key={g} className="text-[9px] px-1 py-0.5 rounded bg-muted/20 border border-border/30">{g}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Section>

              {/* Block 5: Events / Birthdays */}
              <Section title="События и ДР" icon={Cake} defaultOpen={false}>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/8 border border-amber-500/20">
                    <Cake className="w-3.5 h-3.5 text-amber-400" />
                    <div>
                      <p className="text-[10px] font-semibold text-amber-400">ДР клиента</p>
                      <p className="text-[10px] text-muted-foreground">{client.birthday}</p>
                    </div>
                  </div>
                  {client.events.map((e, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-card/30 border border-border/30">
                      <p className="text-[10px] font-semibold mb-1">{e.year} — {e.desc}</p>
                      {e.items.map(item => (
                        <p key={item} className="text-[10px] text-muted-foreground">· {item}</p>
                      ))}
                    </div>
                  ))}
                </div>
              </Section>

              {/* Block 6: Kitchen */}
              <Section title="Кухня и покупки" icon={UtensilsCrossed} defaultOpen={false}>
                <div className="space-y-2">
                  {client.kitchen.favorites.map(f => (
                    <div key={f} className="flex items-center gap-2 text-xs">
                      <span className="text-sm">🍕</span>
                      <span>{f}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-xs border-t border-border/30 pt-2 mt-2">
                    <span className="text-muted-foreground">Ср. чек кухни</span>
                    <span className="font-bold">{client.kitchen.avgCheck.toLocaleString("ru")} ₽</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Всего на кухне</span>
                    <span className="font-bold text-emerald-400">{client.kitchen.totalSpent.toLocaleString("ru")} ₽</span>
                  </div>
                </div>
              </Section>

              {/* Block 7: Finances */}
              <Section title="Финансы" icon={CreditCard}>
                <div className="space-y-1.5">
                  {[
                    { label: "Всего потрачено", value: client.finances.total, bold: true, color: "text-emerald-400" },
                    { label: "Средний чек", value: client.finances.avgCheck, bold: false, color: "" },
                    { label: "Игры", value: client.finances.games, bold: false, color: "text-primary/80" },
                    { label: "Кухня", value: client.finances.kitchen, bold: false, color: "text-amber-400/80" },
                    { label: "Мероприятия", value: client.finances.events, bold: false, color: "text-violet-400/80" },
                  ].map(f => (
                    <div key={f.label} className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{f.label}</span>
                      <span className={cn(f.bold ? "font-black text-sm" : "font-semibold", f.color)}>
                        {f.value.toLocaleString("ru")} ₽
                      </span>
                    </div>
                  ))}
                </div>
              </Section>

              {/* Block 8: Feedback */}
              <Section title="Обратная связь" icon={AlertTriangle} defaultOpen={false}>
                <div className="space-y-2">
                  {client.feedback.map((f, i) => (
                    <div key={i} className={cn("p-2.5 rounded-lg border text-xs",
                      f.type === "negative" ? "bg-red-500/5 border-red-500/20" : "bg-emerald-500/5 border-emerald-500/20"
                    )}>
                      <div className="flex items-center gap-1 mb-1">
                        {f.type === "negative" ? <AlertTriangle className="w-3 h-3 text-red-400" /> : <Heart className="w-3 h-3 text-emerald-400" />}
                        <span className={cn("text-[10px] font-semibold", f.type === "negative" ? "text-red-400" : "text-emerald-400")}>
                          {f.type === "negative" ? "Жалоба" : "Отзыв"} · {f.date}
                        </span>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">{f.text}</p>
                    </div>
                  ))}
                </div>
              </Section>

              {/* Block 10: AI predictions */}
              <div className="rounded-xl border border-violet-500/30 bg-violet-500/5 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Bot className="w-4 h-4 text-violet-400" />
                  <span className="text-sm font-semibold text-violet-400">AI-прогнозы</span>
                </div>
                <div className="space-y-2.5">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Вероятность повторного визита</span>
                      <span className="font-black text-emerald-400">{client.ai.repeatProb}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted/20">
                      <div className="h-full rounded-full bg-emerald-400" style={{ width: `${client.ai.repeatProb}%` }} />
                    </div>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Риск ухода</span>
                    <span className="font-semibold text-emerald-400">{client.ai.churnRisk}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Следующий визит</span>
                    <span className="font-semibold">{client.ai.nextVisitPrediction}</span>
                  </div>
                  <div className="border-t border-violet-500/20 pt-2.5">
                    <p className="text-[10px] font-semibold text-violet-400 mb-1.5">Что предложить:</p>
                    <div className="space-y-1">
                      {client.ai.suggestions.map((s, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-[11px]">
                          <Sparkles className="w-3 h-3 text-violet-400 shrink-0" />
                          <span>{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
