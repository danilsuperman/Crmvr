import { useState, useMemo } from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { useLocalStorage } from "@/lib/store";
import { toast } from "sonner";
import {
  Home, Calendar, Gamepad2, Heart, Users, Star, Gift, Zap, ChevronRight,
  Copy, Send, QrCode, ExternalLink, Clock, MapPin, Trophy, TrendingUp,
  Baby, Plus, X, Check, Sparkles, Bell, ChevronLeft, Crown, Shield,
  Play, BarChart3, Target, Award, Flame, User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_CLIENTS_FB = [
  { id: 1, name: "Андрей Смирнов",  phone: "+7 916 123-45-67", visitCount: 12, loyaltyPoints: 3200, bonusBalance: 450  },
  { id: 2, name: "Мария Козлова",   phone: "+7 903 987-65-43", visitCount: 8,  loyaltyPoints: 1800, bonusBalance: 220  },
  { id: 3, name: "Дмитрий Новиков", phone: "+7 926 555-12-34", visitCount: 3,  loyaltyPoints: 450,  bonusBalance: 50   },
  { id: 4, name: "Елена Петрова",   phone: "+7 985 432-10-98", visitCount: 25, loyaltyPoints: 7500, bonusBalance: 1200 },
  { id: 5, name: "Алексей Морозов", phone: "+7 977 345-67-89", visitCount: 15, loyaltyPoints: 4200, bonusBalance: 680  },
];

const DEFAULT_TIERS_FB = [
  { id: "t1", name: "Стандарт", minPoints: 0,    discount: 0,  cashbackPercent: 2, color: "#6b7280", icon: "⭐" },
  { id: "t2", name: "Серебро",  minPoints: 1000, discount: 5,  cashbackPercent: 3, color: "#94a3b8", icon: "🥈" },
  { id: "t3", name: "Золото",   minPoints: 3000, discount: 10, cashbackPercent: 5, color: "#f59e0b", icon: "🥇" },
  { id: "t4", name: "VIP",      minPoints: 7000, discount: 15, cashbackPercent: 7, color: "#6366f1", icon: "👑" },
];

const GAME_LIBRARY = [
  { name: "Beat Saber",    icon: "🎵", genre: "Ритм",    rating: 4.9 },
  { name: "Zombie Arena",  icon: "🧟", genre: "Шутер",   rating: 4.7 },
  { name: "Racing VR",     icon: "🏎️", genre: "Гонки",   rating: 4.6 },
  { name: "Pistol Whip",   icon: "🔫", genre: "Экшн",    rating: 4.8 },
  { name: "VR Dino",       icon: "🦕", genre: "Семейный",rating: 4.5 },
  { name: "Superhot VR",   icon: "🔥", genre: "Стратегия",rating: 4.9 },
  { name: "Thrill of Fight",icon: "🥊",genre: "Спорт",   rating: 4.6 },
  { name: "Among Us VR",   icon: "👾", genre: "Социальный",rating: 4.4 },
];

function getClientTier(points: number) {
  return [...DEFAULT_TIERS_FB].sort((a, b) => b.minPoints - a.minPoints).find(t => points >= t.minPoints) ?? DEFAULT_TIERS_FB[0];
}

function getNextTier(points: number) {
  return DEFAULT_TIERS_FB.find(t => t.minPoints > points) ?? null;
}

type GuestTab = "home" | "bookings" | "games" | "loyalty" | "family";

// ─── Sub-components ───────────────────────────────────────────────────────────

function BookingCard({ compact }: { compact?: boolean }) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateStr = format(tomorrow, "d MMMM", { locale: ru });

  return (
    <div className={cn(
      "rounded-2xl p-4 bg-gradient-to-br from-violet-600/25 to-indigo-600/15 border border-violet-500/30",
      compact && "p-3"
    )}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold uppercase tracking-widest text-violet-400">Ближайшая бронь</span>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium">Подтверждена</span>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-base font-black text-foreground">Arena A</p>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3" />{dateStr}</span>
            <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />19:00 — 20:00</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" />4 игрока</span>
            <span className="text-xs text-muted-foreground">· Стандарт 60 мин</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-black text-emerald-400">4 800 ₽</p>
          <p className="text-[10px] text-muted-foreground">оплачено</p>
        </div>
      </div>
      {!compact && (
        <div className="flex gap-2 mt-3">
          <button className="flex-1 h-8 rounded-xl text-xs font-medium bg-violet-500/15 border border-violet-500/30 text-violet-300 hover:bg-violet-500/25 transition-colors">Перенести</button>
          <button className="flex-1 h-8 rounded-xl text-xs font-medium bg-muted/20 border border-border/40 text-muted-foreground hover:bg-muted/30 transition-colors">Отменить</button>
        </div>
      )}
    </div>
  );
}

function BonusWidget({ balance, points, tier }: { balance: number; points: number; tier: ReturnType<typeof getClientTier> }) {
  return (
    <div className="rounded-2xl p-4 bg-gradient-to-br from-amber-500/15 to-orange-500/10 border border-amber-500/25">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Бонусы</span>
        <span className="text-lg">{tier.icon}</span>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-black text-amber-400 tabular-nums">{balance.toLocaleString("ru")} ₽</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{points.toLocaleString("ru")} очков · {tier.name}</p>
        </div>
        <button className="h-7 px-3 rounded-xl text-xs font-medium bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:bg-amber-500/30 transition-colors">
          Списать
        </button>
      </div>
    </div>
  );
}

function HomeTab({ client, tier }: { client: typeof MOCK_CLIENTS_FB[0]; tier: ReturnType<typeof getClientTier> }) {
  const nextTier = getNextTier(client.loyaltyPoints);
  const progress = nextTier
    ? Math.min(100, Math.round(((client.loyaltyPoints - tier.minPoints) / (nextTier.minPoints - tier.minPoints)) * 100))
    : 100;

  return (
    <div className="space-y-3">
      <BookingCard />
      <div className="grid grid-cols-2 gap-3">
        <BonusWidget balance={client.bonusBalance} points={client.loyaltyPoints} tier={tier} />
        {/* Promo */}
        <div className="rounded-2xl p-4 bg-gradient-to-br from-pink-500/15 to-rose-500/10 border border-pink-500/25 flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-pink-400">Акция</span>
          <div>
            <p className="text-sm font-bold text-foreground mt-1">−20%</p>
            <p className="text-[10px] text-muted-foreground">VR Arena до 1 июня</p>
          </div>
          <button className="mt-2 h-6 px-2 rounded-lg text-[10px] font-medium bg-pink-500/20 border border-pink-500/30 text-pink-400">Активировать</button>
        </div>
      </div>

      {/* Tier progress */}
      {nextTier && (
        <div className="rounded-2xl p-3.5 bg-muted/10 border border-border/40">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold">До уровня {nextTier.icon} {nextTier.name}</span>
            <span className="text-[10px] text-muted-foreground">{(nextTier.minPoints - client.loyaltyPoints).toLocaleString("ru")} очков</span>
          </div>
          <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1.5">+{nextTier.cashbackPercent - tier.cashbackPercent}% к кешбеку после перехода</p>
        </div>
      )}

      {/* AI recommendations */}
      <div className="rounded-2xl p-3.5 border border-violet-500/20 bg-violet-500/5">
        <div className="flex items-center gap-1.5 mb-2.5">
          <Sparkles className="w-3.5 h-3.5 text-violet-400" />
          <span className="text-xs font-semibold text-violet-300">AI рекомендации</span>
        </div>
        <div className="space-y-2">
          {[
            { icon: "🎮", text: "Новый режим Superhot VR — ты ещё не пробовал!", sub: "Похоже на твой любимый Beat Saber" },
            { icon: "🕐", text: "Завтра свободно в 18:00 в Arena A", sub: "Обычно ты приходишь по вечерам" },
          ].map((r, i) => (
            <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-muted/10 hover:bg-muted/20 transition-colors cursor-pointer">
              <span className="text-base leading-none mt-0.5">{r.icon}</span>
              <div>
                <p className="text-xs font-medium">{r.text}</p>
                <p className="text-[10px] text-muted-foreground">{r.sub}</p>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground mt-0.5 ml-auto shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Favorite games */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Любимые игры</p>
          <button className="text-[10px] text-violet-400 hover:text-violet-300">Все игры →</button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {GAME_LIBRARY.slice(0, 5).map((g, i) => (
            <div key={i} className="shrink-0 w-16 text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-muted/20 border border-border/40 flex items-center justify-center text-2xl hover:border-violet-500/40 transition-colors cursor-pointer mb-1">
                {g.icon}
              </div>
              <p className="text-[9px] text-muted-foreground truncate">{g.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

type Booking = {
  id: number;
  zone: string;
  date: string;
  timeFrom: string;
  timeTo: string;
  guests: number;
  amount: number;
  status: "confirmed" | "pending" | "done";
  comment: string;
};

const ZONES_LIST = ["Arena A", "Arena B", "VR Solo", "Racing Zone", "VIP комната", "PS5"];
const TIMES_LIST = ["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00","22:00"];

const INITIAL_UPCOMING: Booking[] = [
  { id: 1, zone: "Arena A",     date: "2026-05-29", timeFrom: "19:00", timeTo: "20:00", guests: 4, amount: 4800, status: "confirmed", comment: "" },
  { id: 2, zone: "Racing Zone", date: "2026-06-01", timeFrom: "14:00", timeTo: "15:00", guests: 2, amount: 2400, status: "pending",   comment: "" },
];

const INITIAL_PAST: Booking[] = [
  { id: 3, zone: "Arena A",     date: "2026-05-14", timeFrom: "10:00", timeTo: "11:00", guests: 4, amount: 4500, status: "done", comment: "" },
  { id: 4, zone: "VIP комната", date: "2026-04-23", timeFrom: "12:00", timeTo: "15:00", guests: 8, amount: 35000, status: "done", comment: "" },
  { id: 5, zone: "Arena B",     date: "2026-03-10", timeFrom: "17:00", timeTo: "18:00", guests: 4, amount: 4200, status: "done", comment: "" },
];

function fmtDate(iso: string) {
  try {
    return format(new Date(iso), "d MMMM", { locale: ru });
  } catch { return iso; }
}

function StatusBadge({ status }: { status: Booking["status"] }) {
  return (
    <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full border mt-1 inline-block",
      status === "confirmed" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" :
      status === "pending"   ? "bg-amber-500/15 text-amber-400 border-amber-500/30" :
                              "bg-muted/20 text-muted-foreground border-border/40"
    )}>
      {status === "confirmed" ? "Подтверждена" : status === "pending" ? "Ожидает" : "Завершена"}
    </span>
  );
}

function BookingsTab() {
  const [listTab, setListTab] = useState<"upcoming" | "past">("upcoming");
  const [upcomingList, setUpcomingList] = useState<Booking[]>(INITIAL_UPCOMING);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<Partial<Booking>>({});
  const [cancelId, setCancelId] = useState<number | null>(null);

  const startEdit = (b: Booking) => {
    setEditingId(b.id);
    setDraft({ zone: b.zone, date: b.date, timeFrom: b.timeFrom, timeTo: b.timeTo, guests: b.guests, comment: b.comment });
  };

  const saveEdit = (id: number) => {
    setUpcomingList(prev => prev.map(b => b.id === id ? { ...b, ...draft } as Booking : b));
    setEditingId(null);
    setDraft({});
    toast.success("Бронь обновлена");
  };

  const cancelBooking = (id: number) => {
    setUpcomingList(prev => prev.filter(b => b.id !== id));
    setCancelId(null);
    toast.success("Бронь отменена");
  };

  const list = listTab === "upcoming" ? upcomingList : INITIAL_PAST;

  return (
    <div className="space-y-3">
      <button className="w-full h-11 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-sm font-bold text-white flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
        <Plus className="w-4 h-4" /> Новая бронь
      </button>

      <div className="flex rounded-xl overflow-hidden border border-border/40 bg-muted/10">
        {(["upcoming", "past"] as const).map(t => (
          <button key={t} onClick={() => setListTab(t)}
            className={cn("flex-1 h-8 text-xs font-medium transition-colors",
              listTab === t ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"
            )}>
            {t === "upcoming" ? `Предстоящие (${upcomingList.length})` : "История"}
          </button>
        ))}
      </div>

      <div className="space-y-2.5">
        {list.length === 0 && (
          <div className="text-center py-10 text-muted-foreground text-xs">Нет предстоящих броней</div>
        )}
        {list.map(b => {
          const isEditing = editingId === b.id;
          const isConfirming = cancelId === b.id;

          return (
            <div key={b.id}
              className={cn(
                "rounded-2xl border transition-all overflow-hidden",
                isEditing
                  ? "border-violet-500/50 bg-violet-500/5"
                  : "border-border/40 bg-card/30 hover:border-border/60"
              )}
            >
              {/* ── View mode ── */}
              <div className="p-3.5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-bold">{b.zone}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />{fmtDate(b.date)}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />{b.timeFrom}–{b.timeTo}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Users className="w-2.5 h-2.5" />{b.guests} {b.guests === 1 ? "игрок" : b.guests < 5 ? "игрока" : "игроков"}
                      </span>
                      {b.comment && (
                        <span className="text-[10px] text-muted-foreground italic truncate max-w-[120px]">«{b.comment}»</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p className="text-sm font-bold text-emerald-400">{b.amount.toLocaleString("ru")} ₽</p>
                    <StatusBadge status={b.status} />
                  </div>
                </div>

                {/* Action buttons (upcoming only) */}
                {listTab === "upcoming" && !isEditing && !isConfirming && (
                  <div className="flex gap-2 mt-2.5">
                    <button
                      onClick={() => startEdit(b)}
                      className="flex-1 h-7 rounded-xl text-[10px] font-medium bg-violet-500/12 border border-violet-500/30 text-violet-400 hover:bg-violet-500/22 transition-colors flex items-center justify-center gap-1"
                    >
                      <Check className="w-3 h-3" /> Редактировать
                    </button>
                    <button
                      onClick={() => { setCancelId(b.id); setEditingId(null); }}
                      className="h-7 px-3 rounded-xl text-[10px] font-medium bg-muted/15 border border-border/40 text-muted-foreground hover:text-red-400 hover:border-red-500/30 transition-colors"
                    >
                      Отменить
                    </button>
                    <button className="h-7 px-3 rounded-xl text-[10px] font-medium bg-emerald-500/12 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/22 transition-colors">
                      Оплатить
                    </button>
                  </div>
                )}

                {/* Cancel confirm */}
                {isConfirming && (
                  <div className="mt-2.5 p-3 rounded-xl bg-red-500/8 border border-red-500/25 space-y-2">
                    <p className="text-xs font-medium text-red-400">Отменить бронь «{b.zone}» {fmtDate(b.date)}?</p>
                    <div className="flex gap-2">
                      <button onClick={() => setCancelId(null)}
                        className="flex-1 h-7 rounded-xl text-[10px] border border-border/40 text-muted-foreground hover:border-border/60 transition-colors">
                        Нет, оставить
                      </button>
                      <button onClick={() => cancelBooking(b.id)}
                        className="flex-1 h-7 rounded-xl text-[10px] font-bold bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 transition-colors">
                        Да, отменить
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Edit panel ── */}
              {isEditing && (
                <div className="border-t border-violet-500/30 p-3.5 space-y-3 bg-violet-500/5">
                  <p className="text-xs font-bold text-violet-400 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" /> Редактирование брони
                  </p>

                  {/* Zone */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Зона</label>
                    <select
                      value={draft.zone}
                      onChange={e => setDraft(d => ({ ...d, zone: e.target.value }))}
                      className="w-full h-8 px-2.5 rounded-xl bg-background/70 border border-border/50 text-xs focus:outline-none focus:border-violet-500/60 cursor-pointer"
                    >
                      {ZONES_LIST.map(z => <option key={z} value={z}>{z}</option>)}
                    </select>
                  </div>

                  {/* Date */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Дата</label>
                    <input
                      type="date"
                      value={draft.date}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={e => setDraft(d => ({ ...d, date: e.target.value }))}
                      className="w-full h-8 px-2.5 rounded-xl bg-background/70 border border-border/50 text-xs focus:outline-none focus:border-violet-500/60"
                    />
                  </div>

                  {/* Time */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Начало</label>
                      <select
                        value={draft.timeFrom}
                        onChange={e => setDraft(d => ({ ...d, timeFrom: e.target.value }))}
                        className="w-full h-8 px-2.5 rounded-xl bg-background/70 border border-border/50 text-xs focus:outline-none focus:border-violet-500/60 cursor-pointer"
                      >
                        {TIMES_LIST.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Конец</label>
                      <select
                        value={draft.timeTo}
                        onChange={e => setDraft(d => ({ ...d, timeTo: e.target.value }))}
                        className="w-full h-8 px-2.5 rounded-xl bg-background/70 border border-border/50 text-xs focus:outline-none focus:border-violet-500/60 cursor-pointer"
                      >
                        {TIMES_LIST.filter(t => t > (draft.timeFrom ?? "00:00")).map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Guests */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Количество игроков</label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setDraft(d => ({ ...d, guests: Math.max(1, (d.guests ?? 1) - 1) }))}
                        className="w-8 h-8 rounded-xl bg-muted/20 border border-border/40 text-sm font-bold hover:bg-muted/30 transition-colors flex items-center justify-center"
                      >−</button>
                      <span className="text-sm font-bold w-8 text-center">{draft.guests}</span>
                      <button
                        onClick={() => setDraft(d => ({ ...d, guests: Math.min(8, (d.guests ?? 1) + 1) }))}
                        className="w-8 h-8 rounded-xl bg-muted/20 border border-border/40 text-sm font-bold hover:bg-muted/30 transition-colors flex items-center justify-center"
                      >+</button>
                      <span className="text-[10px] text-muted-foreground">макс. 8</span>
                    </div>
                  </div>

                  {/* Comment */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Комментарий</label>
                    <textarea
                      value={draft.comment}
                      onChange={e => setDraft(d => ({ ...d, comment: e.target.value }))}
                      placeholder="Особые пожелания, повод..."
                      rows={2}
                      className="w-full px-2.5 py-2 rounded-xl bg-background/70 border border-border/50 text-xs focus:outline-none focus:border-violet-500/60 resize-none placeholder:text-muted-foreground/40"
                    />
                  </div>

                  {/* Save / Cancel */}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => { setEditingId(null); setDraft({}); }}
                      className="flex-1 h-9 rounded-xl text-xs border border-border/40 text-muted-foreground hover:border-border/60 transition-colors"
                    >
                      Отмена
                    </button>
                    <button
                      onClick={() => saveEdit(b.id)}
                      disabled={!draft.zone || !draft.date || !draft.timeFrom || !draft.timeTo}
                      className="flex-1 h-9 rounded-xl text-xs font-bold bg-violet-500/25 border border-violet-500/50 text-violet-300 hover:bg-violet-500/35 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" /> Сохранить изменения
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function GamesTab({ client }: { client: typeof MOCK_CLIENTS_FB[0] }) {
  const stats = [
    { icon: <Play className="w-4 h-4" />, label: "Игр сыграно", value: "34", color: "text-violet-400" },
    { icon: <Clock className="w-4 h-4" />, label: "Часов в VR", value: "28ч", color: "text-blue-400" },
    { icon: <Trophy className="w-4 h-4" />, label: "Побед", value: "21", color: "text-amber-400" },
    { icon: <Target className="w-4 h-4" />, label: "Достижений", value: "12", color: "text-emerald-400" },
  ];

  const gameHistory = [
    { name: "Beat Saber", date: "14 мая", score: "18 430", rank: 1, icon: "🎵" },
    { name: "Zombie Arena", date: "14 мая", score: "5 210", rank: 3, icon: "🧟" },
    { name: "Racing VR", date: "2 мая", score: "1:42.3", rank: 2, icon: "🏎️" },
    { name: "Pistol Whip", date: "23 апр", score: "32 100", rank: 1, icon: "🔫" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2.5">
        {stats.map((s, i) => (
          <div key={i} className="rounded-2xl p-3.5 bg-muted/10 border border-border/40">
            <div className={cn("mb-1.5", s.color)}>{s.icon}</div>
            <p className={cn("text-xl font-black", s.color)}>{s.value}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Rating block */}
      <div className="rounded-2xl p-3.5 bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-bold text-amber-400">Рейтинг</span>
        </div>
        <div className="space-y-2.5">
          {[
            { label: "Место в парке", value: `#${Math.max(1, 15 - Math.floor(client.visitCount / 2))}`, sub: "из 243 игроков", icon: <MapPin className="w-3 h-3" /> },
            { label: "Место в городе", value: `#${Math.max(1, 48 - client.visitCount)}`, sub: "из 1 248 игроков", icon: <Trophy className="w-3 h-3" /> },
          ].map((r, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">{r.icon}{r.label}</span>
              <div className="text-right">
                <span className="text-sm font-black text-amber-400">{r.value}</span>
                <p className="text-[10px] text-muted-foreground">{r.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top games */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">История игр</p>
        <div className="space-y-2">
          {gameHistory.map((g, i) => (
            <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/10 hover:bg-muted/15 transition-colors">
              <span className="text-xl w-8 text-center shrink-0">{g.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate">{g.name}</p>
                <p className="text-[10px] text-muted-foreground">{g.date}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs font-bold tabular-nums">{g.score}</p>
                <p className={cn("text-[10px]", g.rank === 1 ? "text-amber-400" : g.rank === 2 ? "text-zinc-400" : "text-orange-600")}>
                  {g.rank === 1 ? "🥇" : g.rank === 2 ? "🥈" : "🥉"} место
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LoyaltyTab({ client, tier }: { client: typeof MOCK_CLIENTS_FB[0]; tier: ReturnType<typeof getClientTier> }) {
  const nextTier = getNextTier(client.loyaltyPoints);
  const progress = nextTier
    ? Math.min(100, Math.round(((client.loyaltyPoints - tier.minPoints) / (nextTier.minPoints - tier.minPoints)) * 100))
    : 100;

  const history = [
    { type: "earn", desc: "Визит Arena A", date: "14 мая", amount: +96  },
    { type: "earn", desc: "Кешбек за бронь", date: "2 мая", amount: +72  },
    { type: "spend", desc: "Списание на оплату", date: "23 апр", amount: -500 },
    { type: "earn", desc: "Визит VIP комната", date: "23 апр", amount: +350 },
    { type: "earn", desc: "Кешбек за бронь", date: "10 мар", amount: +84  },
  ];

  const promos = [
    { code: "WELCOME20", desc: "Скидка 20% на любой сеанс", expires: "30 июня", type: "percent", value: 20, active: true },
    { code: "BDAY500", desc: "500 ₽ на день рождения", expires: "15 июля", type: "fixed", value: 500, active: true },
  ];

  return (
    <div className="space-y-4">
      {/* Tier card */}
      <div className="rounded-2xl p-4 border" style={{ borderColor: tier.color + "50", background: tier.color + "12" }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-3xl">{tier.icon}</span>
            <div>
              <p className="text-sm font-black" style={{ color: tier.color }}>{tier.name}</p>
              <p className="text-[10px] text-muted-foreground">Скидка {tier.discount}% · Кешбек {tier.cashbackPercent}%</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-black text-amber-400">{client.loyaltyPoints.toLocaleString("ru")}</p>
            <p className="text-[10px] text-muted-foreground">очков</p>
          </div>
        </div>
        {nextTier && (
          <>
            <div className="h-2 rounded-full bg-black/20 overflow-hidden mb-1.5">
              <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: tier.color }} />
            </div>
            <p className="text-[10px] text-muted-foreground">
              До {nextTier.icon} {nextTier.name}: ещё {(nextTier.minPoints - client.loyaltyPoints).toLocaleString("ru")} очков
            </p>
          </>
        )}
      </div>

      {/* Balance */}
      <div className="rounded-2xl p-3.5 bg-emerald-500/8 border border-emerald-500/25">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Бонусный баланс</p>
            <p className="text-2xl font-black text-emerald-400">{client.bonusBalance.toLocaleString("ru")} ₽</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Можно использовать до 50% от стоимости</p>
          </div>
          <button className="h-9 px-4 rounded-xl text-xs font-bold bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 transition-colors">
            Списать
          </button>
        </div>
      </div>

      {/* Promos */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">Мои промокоды</p>
        <div className="space-y-2">
          {promos.map((p, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-sky-500/8 border border-sky-500/20">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-mono text-xs font-bold text-sky-400">{p.code}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">Активен</span>
                </div>
                <p className="text-xs text-foreground">{p.desc}</p>
                <p className="text-[10px] text-muted-foreground">до {p.expires}</p>
              </div>
              <button className="h-7 px-3 rounded-lg text-[10px] font-bold bg-sky-500/20 border border-sky-500/30 text-sky-400 hover:bg-sky-500/30 transition-colors whitespace-nowrap">
                Применить
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* History */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">История начислений</p>
        <div className="space-y-1.5">
          {history.map((h, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-border/25 last:border-0">
              <div>
                <p className="text-xs font-medium">{h.desc}</p>
                <p className="text-[10px] text-muted-foreground">{h.date}</p>
              </div>
              <span className={cn("text-xs font-bold tabular-nums", h.amount > 0 ? "text-emerald-400" : "text-red-400")}>
                {h.amount > 0 ? "+" : ""}{h.amount} ₽
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FamilyTab() {
  const [addOpen, setAddOpen] = useState(false);
  const [childForm, setChildForm] = useState({ name: "", age: "", birthday: "" });
  const [children, setChildren] = useState([
    { id: 1, name: "Никита", age: 8,  birthday: "12 августа", games: ["VR Dino", "Cartoon Arena"] },
    { id: 2, name: "Соня",   age: 5,  birthday: "3 марта",    games: ["VR Dino"] },
  ]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold">Моя семья</p>
        <button
          onClick={() => setAddOpen(true)}
          className="h-7 px-3 rounded-xl text-xs font-medium bg-violet-500/15 border border-violet-500/30 text-violet-400 hover:bg-violet-500/25 transition-colors flex items-center gap-1"
        >
          <Plus className="w-3 h-3" /> Добавить
        </button>
      </div>

      {addOpen && (
        <div className="rounded-2xl p-4 border border-violet-500/30 bg-violet-500/5 space-y-3">
          <p className="text-xs font-bold text-violet-400">Добавить ребёнка</p>
          {[
            { placeholder: "Имя", field: "name" as const },
            { placeholder: "Возраст", field: "age" as const },
            { placeholder: "Дата рождения (напр. 12 августа)", field: "birthday" as const },
          ].map(f => (
            <input key={f.field} placeholder={f.placeholder} value={childForm[f.field]}
              onChange={e => setChildForm(p => ({ ...p, [f.field]: e.target.value }))}
              className="w-full h-8 px-3 rounded-xl bg-background/60 border border-border/50 text-xs focus:outline-none focus:border-violet-500/50 placeholder:text-muted-foreground/40"
            />
          ))}
          <div className="flex gap-2">
            <button onClick={() => setAddOpen(false)} className="flex-1 h-8 rounded-xl text-xs border border-border/40 text-muted-foreground hover:border-border/60 transition-colors">Отмена</button>
            <button onClick={() => {
              if (!childForm.name.trim()) return;
              setChildren(c => [...c, { id: Date.now(), name: childForm.name, age: Number(childForm.age) || 0, birthday: childForm.birthday, games: [] }]);
              setChildForm({ name: "", age: "", birthday: "" });
              setAddOpen(false);
              toast.success("Ребёнок добавлен");
            }} className="flex-1 h-8 rounded-xl text-xs bg-violet-500/20 border border-violet-500/40 text-violet-400 font-medium hover:bg-violet-500/30 transition-colors">
              Сохранить
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2.5">
        {children.map(c => (
          <div key={c.id} className="rounded-2xl p-3.5 border border-border/40 bg-card/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-500/30 to-rose-500/20 flex items-center justify-center text-lg shrink-0">
                {c.age < 7 ? "👶" : "🧒"}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold">{c.name}</p>
                <p className="text-[10px] text-muted-foreground">{c.age} лет · {c.birthday}</p>
                {c.games.length > 0 && (
                  <div className="flex gap-1 mt-1.5 flex-wrap">
                    {c.games.map(g => (
                      <span key={g} className="text-[9px] px-1.5 py-0.5 rounded-md bg-muted/20 border border-border/40 text-muted-foreground">{g}</span>
                    ))}
                  </div>
                )}
              </div>
              <button className="w-6 h-6 rounded-lg hover:bg-muted/20 flex items-center justify-center"
                onClick={() => setChildren(cs => cs.filter(x => x.id !== c.id))}>
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Family packages promo */}
      <div className="rounded-2xl p-3.5 bg-gradient-to-br from-rose-500/10 to-pink-500/5 border border-rose-500/20">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">🎂</span>
          <p className="text-xs font-bold">Семейные пакеты</p>
        </div>
        <p className="text-xs text-muted-foreground mb-3">Организуй день рождения, корпоратив или просто семейный вечер в VR</p>
        <button className="w-full h-8 rounded-xl text-xs font-medium bg-rose-500/20 border border-rose-500/30 text-rose-400 hover:bg-rose-500/30 transition-colors">
          Посмотреть пакеты
        </button>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function GuestPortal() {
  const [_rawClients] = useLocalStorage<typeof MOCK_CLIENTS_FB>("vrpark_clients", MOCK_CLIENTS_FB);
  const allClients = _rawClients.length > 0 ? _rawClients : MOCK_CLIENTS_FB;

  const [selectedClientId, setSelectedClientId] = useState<number>(allClients[0]?.id ?? 1);
  const [tab, setTab] = useState<GuestTab>("home");
  const [linkCopied, setLinkCopied] = useState(false);

  const client = useMemo(
    () => allClients.find(c => c.id === selectedClientId) ?? allClients[0],
    [allClients, selectedClientId]
  );

  const tier = useMemo(() => getClientTier(client?.loyaltyPoints ?? 0), [client]);

  const portalLink = `https://guest.vrpark.co/${client?.phone.replace(/\D/g, "").slice(-7)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(portalLink).catch(() => {});
    setLinkCopied(true);
    toast.success("Ссылка скопирована");
    setTimeout(() => setLinkCopied(false), 2500);
  };

  const tabs: { id: GuestTab; icon: React.ReactNode; label: string }[] = [
    { id: "home",     icon: <Home className="w-4 h-4" />,       label: "Главная"   },
    { id: "bookings", icon: <Calendar className="w-4 h-4" />,   label: "Брони"     },
    { id: "games",    icon: <Gamepad2 className="w-4 h-4" />,   label: "Игры"      },
    { id: "loyalty",  icon: <Heart className="w-4 h-4" />,      label: "Бонусы"    },
    { id: "family",   icon: <Users className="w-4 h-4" />,      label: "Семья"     },
  ];

  if (!client) return null;

  return (
    <div className="flex flex-col h-full bg-background">

      {/* ── Admin control bar ──────────────────────────────────────────────── */}
      <div className="h-14 border-b border-border/50 bg-card/50 backdrop-blur-sm flex items-center px-4 gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-violet-500/20 flex items-center justify-center">
            <User className="w-3.5 h-3.5 text-violet-400" />
          </div>
          <span className="text-xs font-semibold text-muted-foreground hidden sm:inline">Просмотр от имени:</span>
        </div>

        {/* Client selector */}
        <select
          value={selectedClientId}
          onChange={e => { setSelectedClientId(Number(e.target.value)); setTab("home"); }}
          className="h-7 px-2 rounded-lg bg-muted/20 border border-border/50 text-xs font-medium text-foreground focus:outline-none focus:border-violet-500/50 cursor-pointer max-w-[160px]"
        >
          {allClients.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className={cn(
              "h-7 px-3 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all",
              linkCopied
                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                : "bg-muted/10 border-border/40 text-muted-foreground hover:border-violet-500/40 hover:text-violet-400"
            )}
          >
            {linkCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            <span className="hidden sm:inline">{linkCopied ? "Скопировано" : "Ссылка"}</span>
          </button>
          <button
            onClick={() => toast.info(`Отправка ссылки на ${client.phone}`)}
            className="h-7 px-3 rounded-lg text-xs font-medium bg-muted/10 border border-border/40 text-muted-foreground hover:border-violet-500/40 hover:text-violet-400 transition-all flex items-center gap-1.5"
          >
            <Send className="w-3 h-3" />
            <span className="hidden sm:inline">Отправить</span>
          </button>
          <Link href={`/clients/${client.id}`}>
            <button className="h-7 px-3 rounded-lg text-xs font-medium bg-muted/10 border border-border/40 text-muted-foreground hover:border-border/60 hover:text-foreground transition-all flex items-center gap-1.5">
              <ExternalLink className="w-3 h-3" />
              <span className="hidden sm:inline">Карточка</span>
            </button>
          </Link>
        </div>
      </div>

      {/* ── Portal content ─────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-md mx-auto px-4 pt-4 pb-24">

          {/* Guest header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500/40 to-indigo-500/30 flex items-center justify-center text-lg font-black border border-violet-500/20 shrink-0">
              {client.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-black truncate">{client.name}</h2>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full border font-bold"
                  style={{ color: tier.color, borderColor: tier.color + "60", backgroundColor: tier.color + "18" }}>
                  {tier.icon} {tier.name}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{client.phone} · {client.visitCount} визитов</p>
            </div>
            <button className="w-9 h-9 rounded-2xl bg-muted/15 border border-border/40 flex items-center justify-center hover:bg-muted/25 transition-colors">
              <Bell className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Tab content */}
          <div>
            {tab === "home"     && <HomeTab     client={client} tier={tier} />}
            {tab === "bookings" && <BookingsTab />}
            {tab === "games"    && <GamesTab    client={client} />}
            {tab === "loyalty"  && <LoyaltyTab  client={client} tier={tier} />}
            {tab === "family"   && <FamilyTab   />}
          </div>
        </div>
      </div>

      {/* ── Bottom tab bar (fixed) ──────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-64 right-0 border-t border-border/50 bg-card/90 backdrop-blur-md">
        <div className="max-w-md mx-auto flex">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 transition-colors",
                tab === t.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t.icon}
              <span className="text-[9px] font-medium">{t.label}</span>
              {tab === t.id && <div className="absolute top-0 w-6 h-0.5 rounded-full bg-primary" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
