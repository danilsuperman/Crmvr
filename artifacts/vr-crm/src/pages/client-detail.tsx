import { useState, useMemo } from "react";
import { useParams, Link } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronLeft, Phone, Mail, MessageSquare, Star, Calendar, CreditCard,
  Gamepad2, Users, Baby, Cake, UtensilsCrossed, TrendingUp, AlertTriangle,
  Bot, Sparkles, Heart, Trophy, Clock, Zap, Edit2, Save, X, ChevronDown, ChevronUp,
  Plus, Trash2, StickyNote, Send, Gift, Crown
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useLocalStorage } from "@/lib/store";

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

type Child = { name: string; birthday: string };
type Note = { id: number; text: string; createdAt: string };

type LoyaltyTier = {
  id: string | number; name: string; minPoints: number; discount: number;
  cashbackPercent: number; color: string; icon: string; perks: string[]; active: boolean;
};
type StoredClient = {
  id: number; name: string; phone: string; visitCount?: number; lastVisit?: string;
  loyaltyPoints?: number; bonusBalance?: number;
};

const DEFAULT_CLIENTS: StoredClient[] = [
  { id: 1, name: "Андрей Смирнов",  phone: "+7 916 123-45-67", visitCount: 12, loyaltyPoints: 3200, bonusBalance: 450 },
  { id: 2, name: "Мария Козлова",   phone: "+7 903 987-65-43", visitCount: 8,  loyaltyPoints: 1800, bonusBalance: 220 },
  { id: 3, name: "Дмитрий Новиков", phone: "+7 926 555-12-34", visitCount: 3,  loyaltyPoints: 450,  bonusBalance: 50  },
  { id: 4, name: "Елена Петрова",   phone: "+7 985 432-10-98", visitCount: 25, loyaltyPoints: 7500, bonusBalance: 1200 },
  { id: 5, name: "Иван Сидоров",    phone: "+7 965 876-54-32", visitCount: 1,  loyaltyPoints: 0,    bonusBalance: 0   },
  { id: 6, name: "Наталья Волкова", phone: "+7 911 234-56-78", visitCount: 7,  loyaltyPoints: 1500, bonusBalance: 180 },
  { id: 7, name: "Алексей Морозов", phone: "+7 977 345-67-89", visitCount: 15, loyaltyPoints: 4200, bonusBalance: 680 },
  { id: 8, name: "Светлана Орлова", phone: "+7 999 456-78-90", visitCount: 4,  loyaltyPoints: 850,  bonusBalance: 90  },
];

const DEFAULT_LOYALTY_TIERS: LoyaltyTier[] = [
  { id: "t1", name: "Стандарт", minPoints: 0,    discount: 0,  cashbackPercent: 2, color: "#6b7280", icon: "⭐", perks: ["Накопление бонусов", "Доступ к акциям"], active: true },
  { id: "t2", name: "Серебро",  minPoints: 1000, discount: 5,  cashbackPercent: 3, color: "#94a3b8", icon: "🥈", perks: ["Скидка 5%", "Приоритет бронирования", "Спецпредложения"], active: true },
  { id: "t3", name: "Золото",   minPoints: 3000, discount: 10, cashbackPercent: 5, color: "#f59e0b", icon: "🥇", perks: ["Скидка 10%", "Бонус +10% к часам", "Бесплатный гардероб", "Ранний доступ"], active: true },
  { id: "t4", name: "VIP",      minPoints: 7000, discount: 15, cashbackPercent: 7, color: "#6366f1", icon: "👑", perks: ["Скидка 15%", "VIP-зона", "Бесплатные напитки", "Персональный менеджер", "Безлимит 1 раз/мес"], active: true },
];

export default function ClientDetail() {
  const params = useParams<{ id: string }>();
  const client = MOCK_CLIENT;
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: client.name, phone: client.phone, email: client.email });

  // Loyalty data from localStorage
  const [allClients] = useLocalStorage<StoredClient[]>("vrpark_clients", DEFAULT_CLIENTS);
  const [loyaltyTiers] = useLocalStorage<LoyaltyTier[]>("vrpark_loyalty_tiers", DEFAULT_LOYALTY_TIERS);

  const { loyaltyClient, currentTier, nextTier } = useMemo(() => {
    const normalize = (p: string) => p.replace(/\D/g, "").slice(-7);
    const lsClient = allClients.find(c => normalize(c.phone) === normalize(client.phone));
    if (!lsClient) return { loyaltyClient: null, currentTier: null, nextTier: null };

    const activeTiers = loyaltyTiers.filter(t => t.active).sort((a, b) => a.minPoints - b.minPoints);
    const pts = lsClient.loyaltyPoints ?? 0;
    const cur = [...activeTiers].filter(t => pts >= t.minPoints).pop() ?? null;
    const nxt = activeTiers.find(t => t.minPoints > pts) ?? null;
    return { loyaltyClient: lsClient, currentTier: cur, nextTier: nxt };
  }, [allClients, loyaltyTiers, client.phone]);

  // Children state
  const [children, setChildren] = useState<Child[]>(
    client.children.map(c => ({ name: c.name, birthday: c.birthday }))
  );
  const [childModal, setChildModal] = useState(false);
  const [childForm, setChildForm] = useState<Child>({ name: "", birthday: "" });
  const [editChildIdx, setEditChildIdx] = useState<number | null>(null);

  const openAddChild = () => {
    setEditChildIdx(null);
    setChildForm({ name: "", birthday: "" });
    setChildModal(true);
  };
  const openEditChild = (i: number) => {
    setEditChildIdx(i);
    setChildForm({ ...children[i] });
    setChildModal(true);
  };
  const saveChild = () => {
    if (!childForm.name.trim()) return;
    if (editChildIdx !== null) {
      setChildren(prev => prev.map((c, i) => i === editChildIdx ? childForm : c));
      toast.success("Данные ребёнка обновлены");
    } else {
      setChildren(prev => [...prev, childForm]);
      toast.success("Ребёнок добавлен");
    }
    setChildModal(false);
  };
  const deleteChild = (i: number) => {
    setChildren(prev => prev.filter((_, idx) => idx !== i));
    toast.success("Удалено");
  };

  // Notes state
  const [notes, setNotes] = useState<Note[]>([
    { id: 1, text: "Клиент предпочитает зону Arena A. Аллергия на арахис — учитывать при заказе еды.", createdAt: "14 мая 2026" },
  ]);
  const [noteInput, setNoteInput] = useState("");
  const addNote = () => {
    const text = noteInput.trim();
    if (!text) return;
    setNotes(prev => [...prev, {
      id: Date.now(),
      text,
      createdAt: format(new Date(), "d MMMM yyyy", { locale: ru }),
    }]);
    setNoteInput("");
    toast.success("Заметка добавлена");
  };
  const deleteNote = (id: number) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

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

              {/* Block: Loyalty */}
              <Section title="Программа лояльности" icon={Heart}>
                {loyaltyClient ? (
                  <div className="space-y-3">
                    {/* Current tier */}
                    {currentTier ? (
                      <div
                        className="flex items-center gap-3 p-3 rounded-xl border"
                        style={{ borderColor: currentTier.color + "50", backgroundColor: currentTier.color + "15" }}
                      >
                        <span className="text-2xl">{currentTier.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-black" style={{ color: currentTier.color }}>{currentTier.name}</span>
                            {currentTier.discount > 0 && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted/30 border border-border/40 font-semibold text-muted-foreground">−{currentTier.discount}%</span>
                            )}
                            {currentTier.cashbackPercent > 0 && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 font-semibold text-emerald-400">{currentTier.cashbackPercent}% кешбек</span>
                            )}
                          </div>
                          {currentTier.perks.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {currentTier.perks.map(p => (
                                <span key={p} className="text-[9px] text-muted-foreground/70 bg-muted/20 px-1.5 py-0.5 rounded-md">✓ {p}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl border border-border/40 bg-card/30 text-xs text-muted-foreground text-center">
                        Уровень не присвоен
                      </div>
                    )}

                    {/* Points + bonus balance */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2.5 rounded-xl bg-card/40 border border-border/30 text-center">
                        <p className="text-base font-black text-primary">{(loyaltyClient.loyaltyPoints ?? 0).toLocaleString("ru")}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Баллов</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-card/40 border border-border/30 text-center">
                        <p className="text-base font-black text-amber-400">{(loyaltyClient.bonusBalance ?? 0).toLocaleString("ru")} ₽</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Бонус-баланс</p>
                      </div>
                    </div>

                    {/* Progress to next tier */}
                    {nextTier && (
                      <div>
                        <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                          <span>До уровня <span className="font-semibold" style={{ color: nextTier.color }}>{nextTier.icon} {nextTier.name}</span></span>
                          <span>{(loyaltyClient.loyaltyPoints ?? 0).toLocaleString("ru")} / {nextTier.minPoints.toLocaleString("ru")} баллов</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted/20 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${Math.min(100, ((loyaltyClient.loyaltyPoints ?? 0) / nextTier.minPoints) * 100)}%`,
                              backgroundColor: nextTier.color,
                            }}
                          />
                        </div>
                      </div>
                    )}
                    {!nextTier && currentTier && (
                      <div className="text-[10px] text-center text-amber-400/80 flex items-center justify-center gap-1">
                        <Crown className="w-3 h-3" /> Максимальный уровень достигнут
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground/50 text-center py-3">
                    Клиент не найден в базе лояльности.<br />
                    <span className="text-[10px]">Добавьте клиента в разделе «Клиенты»</span>
                  </p>
                )}
              </Section>

              {/* Block 4: Family */}
              <Section title="Семья и дети" icon={Baby}>
                <div className="space-y-2.5">
                  {children.map((child, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-card/30 border border-border/30 group">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold">{child.name}</span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEditChild(i)} className="w-5 h-5 rounded flex items-center justify-center hover:bg-muted/40 text-muted-foreground hover:text-foreground transition-colors">
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button onClick={() => deleteChild(i)} className="w-5 h-5 rounded flex items-center justify-center hover:bg-red-500/20 text-muted-foreground hover:text-red-400 transition-colors">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      {child.birthday && (
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Cake className="w-3 h-3" /> {child.birthday}
                        </p>
                      )}
                    </div>
                  ))}
                  {children.length === 0 && (
                    <p className="text-xs text-muted-foreground/50 text-center py-2">Нет данных о детях</p>
                  )}
                  <button
                    onClick={openAddChild}
                    className="w-full h-8 rounded-lg border border-dashed border-border/50 text-xs text-muted-foreground hover:border-primary/40 hover:text-primary transition-all flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Добавить ребёнка
                  </button>
                </div>
              </Section>

              {/* Children modal */}
              {childModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setChildModal(false)} />
                  <div className="relative z-10 w-full max-w-sm bg-card border border-border/70 rounded-2xl shadow-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold">{editChildIdx !== null ? "Изменить данные" : "Добавить ребёнка"}</h3>
                      <button onClick={() => setChildModal(false)} className="w-7 h-7 rounded-lg hover:bg-muted/40 flex items-center justify-center text-muted-foreground">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Имя *</Label>
                        <Input
                          className="h-8 text-xs"
                          placeholder="Имя ребёнка"
                          value={childForm.name}
                          onChange={e => setChildForm(p => ({ ...p, name: e.target.value }))}
                          onKeyDown={e => e.key === "Enter" && saveChild()}
                          autoFocus
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Дата рождения</Label>
                        <Input
                          className="h-8 text-xs"
                          placeholder="например: 12 августа 2016"
                          value={childForm.birthday}
                          onChange={e => setChildForm(p => ({ ...p, birthday: e.target.value }))}
                          onKeyDown={e => e.key === "Enter" && saveChild()}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" onClick={() => setChildModal(false)}>Отмена</Button>
                      <Button size="sm" className="flex-1 h-8 text-xs" onClick={saveChild} disabled={!childForm.name.trim()}>
                        <Save className="w-3.5 h-3.5 mr-1.5" /> Сохранить
                      </Button>
                    </div>
                  </div>
                </div>
              )}

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

              {/* Block: Notes */}
              <Section title="Заметки" icon={StickyNote}>
                <div className="space-y-2.5">
                  {notes.map(note => (
                    <div key={note.id} className="p-3 rounded-lg bg-card/30 border border-border/30 group relative">
                      <p className="text-xs leading-relaxed pr-6">{note.text}</p>
                      <p className="text-[10px] text-muted-foreground/50 mt-1.5">{note.createdAt}</p>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="absolute top-2 right-2 w-5 h-5 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-muted-foreground hover:text-red-400 transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {notes.length === 0 && (
                    <p className="text-xs text-muted-foreground/50 text-center py-2">Нет заметок</p>
                  )}
                  <div className="flex gap-2">
                    <Textarea
                      className="text-xs min-h-[64px] resize-none flex-1"
                      placeholder="Добавить заметку..."
                      value={noteInput}
                      onChange={e => setNoteInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) addNote();
                      }}
                    />
                    <button
                      onClick={addNote}
                      disabled={!noteInput.trim()}
                      className="w-9 h-9 mt-auto rounded-lg border border-border/50 flex items-center justify-center text-muted-foreground hover:border-primary/40 hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[10px] text-muted-foreground/40">Ctrl+Enter для быстрой отправки</p>
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
