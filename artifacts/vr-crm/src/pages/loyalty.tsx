import { useState, useMemo } from "react";
import { Star, Gift, Crown, Repeat, CreditCard, Percent, Plus, Trash2, CheckCircle2, Zap, Users, TrendingUp, Heart, Clock, Medal, Edit2, X, GripVertical } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useLocalStorage } from "@/lib/store";

type LoyaltyTier = {
  id: string; name: string; minPoints: number; discount: number;
  color: string; icon: string; perks: string[]; active: boolean;
  cashbackPercent: number;
};
type Subscription = { id: string; name: string; hoursPerMonth: number; price: number; bonusHours: number; active: boolean; color: string };
type PromoCode = { id: string; code: string; discount: number; type: "percent" | "fixed"; uses: number; maxUses: number; active: boolean };
type TierForm = { name: string; minPoints: string; discount: string; cashbackPercent: string; color: string; icon: string; perks: string[] };

const DEFAULT_TIERS: LoyaltyTier[] = [
  { id: "t1", name: "Стандарт", minPoints: 0,    discount: 0,  cashbackPercent: 2, color: "#6b7280", icon: "⭐", perks: ["Накопление бонусов", "Доступ к акциям"], active: true },
  { id: "t2", name: "Серебро",  minPoints: 1000, discount: 5,  cashbackPercent: 3, color: "#94a3b8", icon: "🥈", perks: ["Скидка 5%", "Приоритет бронирования", "Спецпредложения"], active: true },
  { id: "t3", name: "Золото",   minPoints: 3000, discount: 10, cashbackPercent: 5, color: "#f59e0b", icon: "🥇", perks: ["Скидка 10%", "Бонус +10% к часам", "Бесплатный гардероб", "Ранний доступ"], active: true },
  { id: "t4", name: "VIP",      minPoints: 7000, discount: 15, cashbackPercent: 7, color: "#6366f1", icon: "👑", perks: ["Скидка 15%", "VIP-зона", "Бесплатные напитки", "Персональный менеджер", "Безлимит 1 раз/мес"], active: true },
];

const DEFAULT_SUBS: Subscription[] = [
  { id: "s1", name: "Старт",    hoursPerMonth: 4,  price: 3200,  bonusHours: 0, active: true,  color: "#6b7280" },
  { id: "s2", name: "Базовый",  hoursPerMonth: 8,  price: 5600,  bonusHours: 1, active: true,  color: "#3b82f6" },
  { id: "s3", name: "Активный", hoursPerMonth: 16, price: 9800,  bonusHours: 2, active: true,  color: "#6366f1" },
  { id: "s4", name: "VIP",      hoursPerMonth: 30, price: 16500, bonusHours: 5, active: true,  color: "#f59e0b" },
];

const DEFAULT_PROMOS: PromoCode[] = [
  { id: "p1", code: "WELCOME20", discount: 20,  type: "percent", uses: 14, maxUses: 100, active: true },
  { id: "p2", code: "BDAY500",   discount: 500, type: "fixed",   uses: 7,  maxUses: 50,  active: true },
  { id: "p3", code: "SUMMER15",  discount: 15,  type: "percent", uses: 31, maxUses: 200, active: false },
];

const DEFAULT_CASHBACK_TEXTS = [
  "Начисляется на следующий день после оплаты",
  "Срок действия бонусов — 90 дней",
  "Оплата бонусами — до 50% от суммы заказа",
  "Не применяется совместно с промокодом",
];

const EMPTY_TIER_FORM: TierForm = { name: "", minPoints: "", discount: "0", cashbackPercent: "2", color: "#6366f1", icon: "⭐", perks: [] };
const PRESET_COLORS = ["#6b7280", "#94a3b8", "#3b82f6", "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#ef4444"];
const PRESET_ICONS = ["⭐", "🥈", "🥇", "👑", "💎", "🔥", "🚀", "🎮", "🏆"];

export default function Loyalty() {
  const [tiers, setTiers] = useLocalStorage<LoyaltyTier[]>("vrpark_loyalty_tiers", DEFAULT_TIERS);
  const [subs, setSubs] = useLocalStorage<Subscription[]>("vrpark_subscriptions", DEFAULT_SUBS);
  const [promos, setPromos] = useLocalStorage<PromoCode[]>("vrpark_promos", DEFAULT_PROMOS);
  const [cashbackEnabled, setCashbackEnabled] = useLocalStorage("vrpark_cashback_enabled", true);
  const [cashbackTexts, setCashbackTexts] = useLocalStorage<string[]>("vrpark_cashback_texts", DEFAULT_CASHBACK_TEXTS);
  const [tab, setTab] = useState<"tiers" | "subscriptions" | "promos" | "cashback">("tiers");

  // Promo dialog
  const [addPromoOpen, setAddPromoOpen] = useState(false);
  const [promoForm, setPromoForm] = useState({ code: "", discount: "", type: "percent" as "percent" | "fixed", maxUses: "100" });

  // Subscription dialog
  const [addSubOpen, setAddSubOpen] = useState(false);
  const [subForm, setSubForm] = useState({ name: "", hoursPerMonth: "", price: "", bonusHours: "", color: "#6366f1" });

  // Tier dialog
  const [tierDialogOpen, setTierDialogOpen] = useState(false);
  const [editingTierId, setEditingTierId] = useState<string | null>(null);
  const [tierForm, setTierForm] = useState<TierForm>(EMPTY_TIER_FORM);
  const [newPerk, setNewPerk] = useState("");

  // Cashback inline edit
  const [editingCashbackTierId, setEditingCashbackTierId] = useState<string | null>(null);
  const [cashbackEditVal, setCashbackEditVal] = useState("");
  const [editingTextIdx, setEditingTextIdx] = useState<number | null>(null);
  const [editingTextVal, setEditingTextVal] = useState("");
  const [newCashbackText, setNewCashbackText] = useState("");

  const totalClients = 247;
  const tierDist = [38, 89, 94, 26];

  // Promo actions
  const addPromo = () => {
    if (!promoForm.code.trim() || !promoForm.discount) { toast.error("Заполните поля"); return; }
    setPromos(ps => [...ps, { id: `p_${Date.now()}`, code: promoForm.code.toUpperCase(), discount: Number(promoForm.discount), type: promoForm.type, uses: 0, maxUses: Number(promoForm.maxUses), active: true }]);
    toast.success(`Промокод ${promoForm.code.toUpperCase()} создан`);
    setPromoForm({ code: "", discount: "", type: "percent", maxUses: "100" });
    setAddPromoOpen(false);
  };

  // Subscription actions
  const addSub = () => {
    if (!subForm.name.trim() || !subForm.price) { toast.error("Заполните поля"); return; }
    setSubs(ss => [...ss, { id: `s_${Date.now()}`, name: subForm.name, hoursPerMonth: Number(subForm.hoursPerMonth) || 8, price: Number(subForm.price), bonusHours: Number(subForm.bonusHours) || 0, active: true, color: subForm.color }]);
    toast.success(`Подписка «${subForm.name}» добавлена`);
    setSubForm({ name: "", hoursPerMonth: "", price: "", bonusHours: "", color: "#6366f1" });
    setAddSubOpen(false);
  };

  // Tier actions
  const openAddTier = () => {
    setEditingTierId(null);
    setTierForm(EMPTY_TIER_FORM);
    setNewPerk("");
    setTierDialogOpen(true);
  };

  const openEditTier = (tier: LoyaltyTier) => {
    setEditingTierId(tier.id);
    setTierForm({ name: tier.name, minPoints: String(tier.minPoints), discount: String(tier.discount), cashbackPercent: String(tier.cashbackPercent ?? 2), color: tier.color, icon: tier.icon, perks: [...tier.perks] });
    setNewPerk("");
    setTierDialogOpen(true);
  };

  const saveTier = () => {
    if (!tierForm.name.trim()) { toast.error("Введите название уровня"); return; }
    if (editingTierId) {
      setTiers(ts => ts.map(t => t.id === editingTierId ? { ...t, name: tierForm.name, minPoints: Number(tierForm.minPoints) || 0, discount: Number(tierForm.discount) || 0, cashbackPercent: Number(tierForm.cashbackPercent) || 0, color: tierForm.color, icon: tierForm.icon, perks: tierForm.perks } : t));
      toast.success("Уровень обновлён");
    } else {
      const newTier: LoyaltyTier = { id: `t_${Date.now()}`, name: tierForm.name, minPoints: Number(tierForm.minPoints) || 0, discount: Number(tierForm.discount) || 0, cashbackPercent: Number(tierForm.cashbackPercent) || 0, color: tierForm.color, icon: tierForm.icon, perks: tierForm.perks, active: true };
      setTiers(ts => [...ts, newTier]);
      toast.success(`Уровень «${tierForm.name}» добавлен`);
    }
    setTierDialogOpen(false);
  };

  const deleteTier = (id: string) => {
    if (!confirm("Удалить уровень?")) return;
    setTiers(ts => ts.filter(t => t.id !== id));
    setTierDialogOpen(false);
    toast.success("Уровень удалён");
  };

  const addPerk = () => {
    if (!newPerk.trim()) return;
    setTierForm(f => ({ ...f, perks: [...f.perks, newPerk.trim()] }));
    setNewPerk("");
  };

  // Cashback % inline save
  const saveCashbackPercent = (tierId: string) => {
    const val = Number(cashbackEditVal);
    if (isNaN(val) || val < 0 || val > 100) { toast.error("Введите корректный %"); return; }
    setTiers(ts => ts.map(t => t.id === tierId ? { ...t, cashbackPercent: val } : t));
    setEditingCashbackTierId(null);
    toast.success("Кешбек обновлён");
  };

  const sortedTiers = useMemo(() => [...tiers].sort((a, b) => a.minPoints - b.minPoints), [tiers]);

  return (
    <div className="flex flex-col h-full">
      <header className="h-14 border-b border-border/50 flex items-center justify-between px-4 md:px-6 bg-card/50 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-pink-500/15 border border-pink-500/20 flex items-center justify-center">
            <Heart className="w-4 h-4 text-pink-400" />
          </div>
          <div>
            <h1 className="text-sm font-bold leading-none">Система лояльности</h1>
            <p className="text-[10px] text-muted-foreground mt-0.5">VIP · Подписки · Бонусы · Кешбек</p>
          </div>
        </div>
        <div className="flex gap-2">
          {tab === "tiers" && (
            <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={openAddTier}>
              <Plus className="w-3.5 h-3.5" /> Добавить уровень
            </Button>
          )}
          {tab === "promos" && (
            <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={() => setAddPromoOpen(true)}>
              <Plus className="w-3.5 h-3.5" /> Промокод
            </Button>
          )}
          {tab === "subscriptions" && (
            <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={() => setAddSubOpen(true)}>
              <Plus className="w-3.5 h-3.5" /> Подписка
            </Button>
          )}
        </div>
      </header>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-4 md:px-6 pt-4">
        {[
          { icon: Users,      label: "Клиентов",          value: totalClients, color: "text-blue-400" },
          { icon: Crown,      label: "VIP участников",    value: tierDist[3],  color: "text-amber-400" },
          { icon: Repeat,     label: "Активных подписок", value: 42,           color: "text-violet-400" },
          { icon: TrendingUp, label: "Кешбек выдан",      value: "12 400 ₽",  color: "text-emerald-400" },
        ].map((s, i) => (
          <div key={i} className="rounded-xl border border-border/50 bg-card/20 p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <s.icon className={cn("w-3.5 h-3.5", s.color)} />
              <span className="text-[10px] text-muted-foreground">{s.label}</span>
            </div>
            <p className="text-xl font-black">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 px-4 md:px-6 pt-3 pb-0 shrink-0 overflow-x-auto">
        {([
          { key: "tiers",         icon: Medal,      label: "Уровни" },
          { key: "subscriptions", icon: Repeat,     label: "Подписки" },
          { key: "promos",        icon: Percent,    label: "Промокоды" },
          { key: "cashback",      icon: CreditCard, label: "Кешбек" },
        ] as const).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap", tab === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted/20")}>
            <t.icon className="w-3.5 h-3.5" /> {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-6 pt-4 pb-20 md:pb-6 space-y-3">

        {/* TIERS */}
        {tab === "tiers" && (
          <>
            {sortedTiers.map((tier, i) => (
              <Card key={tier.id} className={cn("border-border/50 transition-all", tier.active ? "bg-card/30" : "bg-muted/5 opacity-60")}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl border border-border/40 bg-muted/20 flex items-center justify-center text-xl shrink-0">{tier.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="text-sm font-bold" style={{ color: tier.color }}>{tier.name}</p>
                        <span className="text-[10px] text-muted-foreground">от {tier.minPoints.toLocaleString()} очков</span>
                        {tier.discount > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">−{tier.discount}%</span>}
                        {(tier.cashbackPercent ?? 0) > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/20">{tier.cashbackPercent}% кешбек</span>}
                        <span className="text-[10px] text-muted-foreground ml-auto">{tierDist[i] ?? 0} клиентов</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {tier.perks.map(p => (
                          <span key={p} className="text-[10px] px-2 py-0.5 rounded-full border border-border/40 bg-muted/10 text-muted-foreground flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />{p}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => openEditTier(tier)}
                        className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
                        title="Редактировать уровень"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <Switch checked={tier.active} onCheckedChange={v => setTiers(ts => ts.map(x => x.id === tier.id ? { ...x, active: v } : x))} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {tiers.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
                <Medal className="w-10 h-10 opacity-20" />
                <p className="text-sm">Уровни не созданы</p>
                <Button size="sm" onClick={openAddTier}><Plus className="w-3.5 h-3.5 mr-1.5" /> Добавить первый уровень</Button>
              </div>
            )}
          </>
        )}

        {/* SUBSCRIPTIONS */}
        {tab === "subscriptions" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {subs.map(sub => (
              <Card key={sub.id} className={cn("border-border/50 transition-all relative overflow-hidden", sub.active ? "bg-card/30" : "opacity-50")}>
                <div className="absolute top-0 left-0 right-0 h-0.5" style={{ backgroundColor: sub.color }} />
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold">{sub.name}</p>
                    <Switch checked={sub.active} onCheckedChange={v => setSubs(ss => ss.map(x => x.id === sub.id ? { ...x, active: v } : x))} />
                  </div>
                  <p className="text-2xl font-black">{sub.price.toLocaleString()} ₽<span className="text-sm font-normal text-muted-foreground">/мес</span></p>
                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex items-center gap-2"><Clock className="w-3 h-3 text-muted-foreground" /><span>{sub.hoursPerMonth}ч в месяц</span></div>
                    {sub.bonusHours > 0 && <div className="flex items-center gap-2"><Gift className="w-3 h-3 text-emerald-400" /><span className="text-emerald-400">+{sub.bonusHours}ч бонус</span></div>}
                    <div className="flex items-center gap-2"><Zap className="w-3 h-3 text-primary" /><span>Переносятся до 50%</span></div>
                  </div>
                  <p className="text-[10px] text-muted-foreground">≈ {Math.round(sub.price / sub.hoursPerMonth)} ₽/ч (экономия до 20%)</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* PROMOS */}
        {tab === "promos" && (
          <div className="space-y-2">
            {promos.map(p => (
              <div key={p.id} className={cn("rounded-xl border p-3 flex items-center gap-3", p.active ? "border-border/50 bg-card/20" : "border-border/30 bg-muted/5 opacity-50")}>
                <div className={cn("w-9 h-9 rounded-xl border flex items-center justify-center shrink-0", p.active ? "bg-emerald-500/10 border-emerald-500/20" : "bg-muted/20 border-border/30")}>
                  <Percent className={cn("w-4 h-4", p.active ? "text-emerald-400" : "text-muted-foreground")} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-bold font-mono">{p.code}</code>
                    <span className="text-xs font-bold text-emerald-400">−{p.discount}{p.type === "percent" ? "%" : " ₽"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-0.5">
                    <span>Использований: {p.uses}/{p.maxUses}</span>
                    <div className="flex-1 h-1 rounded-full bg-muted/20"><div className="h-full rounded-full bg-primary/50" style={{ width: `${Math.min(100, (p.uses / p.maxUses) * 100)}%` }} /></div>
                  </div>
                </div>
                <Switch checked={p.active} onCheckedChange={v => setPromos(ps => ps.map(x => x.id === p.id ? { ...x, active: v } : x))} />
                <Button variant="ghost" size="icon" className="h-7 w-7 p-0 text-destructive shrink-0" onClick={() => { if (confirm("Удалить промокод?")) { setPromos(ps => ps.filter(x => x.id !== p.id)); toast.success("Удалено"); } }}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* CASHBACK */}
        {tab === "cashback" && (
          <>
            {/* Enable toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-card/20">
              <div>
                <p className="text-sm font-semibold">Кешбек-программа</p>
                <p className="text-xs text-muted-foreground">Возврат % от каждой оплаты на бонусный счёт</p>
              </div>
              <Switch checked={cashbackEnabled} onCheckedChange={v => { setCashbackEnabled(v); toast.success(v ? "Кешбек включён" : "Кешбек отключён"); }} />
            </div>

            {/* Cashback % per tier — editable */}
            <Card className="bg-card/30 border-border/50">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-violet-400" /> Ставки кешбека по уровням
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-2">
                {sortedTiers.map(tier => (
                  <div key={tier.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-border/30 bg-muted/5">
                    <span className="text-base w-6 shrink-0">{tier.icon}</span>
                    <span className="text-sm font-medium flex-1" style={{ color: tier.color }}>{tier.name}</span>
                    {editingCashbackTierId === tier.id ? (
                      <div className="flex items-center gap-1.5">
                        <Input
                          autoFocus
                          type="number"
                          min="0"
                          max="100"
                          className="h-7 w-16 text-xs text-right"
                          value={cashbackEditVal}
                          onChange={e => setCashbackEditVal(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter") saveCashbackPercent(tier.id); if (e.key === "Escape") setEditingCashbackTierId(null); }}
                        />
                        <span className="text-xs text-muted-foreground">%</span>
                        <button onClick={() => saveCashbackPercent(tier.id)} className="text-[10px] px-2 py-1 rounded bg-primary/20 text-primary hover:bg-primary/30 transition-colors">✓</button>
                        <button onClick={() => setEditingCashbackTierId(null)} className="text-[10px] px-2 py-1 rounded bg-muted/20 text-muted-foreground hover:bg-muted/30 transition-colors">✕</button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold" style={{ color: tier.color }}>{tier.cashbackPercent ?? 0}% кешбек</span>
                        <button
                          onClick={() => { setEditingCashbackTierId(tier.id); setCashbackEditVal(String(tier.cashbackPercent ?? 0)); }}
                          className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Rules text — editable */}
            <Card className="bg-card/30 border-border/50">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm flex items-center gap-2"><Zap className="w-4 h-4 text-amber-400" />Правила кешбека</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-2">
                {cashbackTexts.map((text, i) => (
                  <div key={i} className="flex items-start gap-2 group">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    {editingTextIdx === i ? (
                      <div className="flex-1 flex items-center gap-1.5">
                        <input
                          autoFocus
                          className="flex-1 text-xs bg-transparent border-b border-primary outline-none"
                          value={editingTextVal}
                          onChange={e => setEditingTextVal(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === "Enter") { setCashbackTexts(ts => ts.map((t, j) => j === i ? editingTextVal.trim() || t : t)); setEditingTextIdx(null); }
                            if (e.key === "Escape") setEditingTextIdx(null);
                          }}
                        />
                        <button onClick={() => { setCashbackTexts(ts => ts.map((t, j) => j === i ? editingTextVal.trim() || t : t)); setEditingTextIdx(null); }} className="text-[10px] text-primary">✓</button>
                        <button onClick={() => setEditingTextIdx(null)} className="text-[10px] text-muted-foreground">✕</button>
                      </div>
                    ) : (
                      <div className="flex-1 flex items-start justify-between gap-1">
                        <span className="text-xs text-muted-foreground">{text}</span>
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button onClick={() => { setEditingTextIdx(i); setEditingTextVal(text); }} className="w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"><Edit2 className="w-2.5 h-2.5" /></button>
                          <button onClick={() => { if (confirm("Удалить правило?")) setCashbackTexts(ts => ts.filter((_, j) => j !== i)); }} className="w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"><X className="w-2.5 h-2.5" /></button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    className="flex-1 h-7 rounded-md border border-dashed border-border/50 bg-transparent px-2.5 text-xs focus:outline-none focus:border-primary placeholder:text-muted-foreground/50"
                    placeholder="Добавить правило..."
                    value={newCashbackText}
                    onChange={e => setNewCashbackText(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && newCashbackText.trim()) { setCashbackTexts(ts => [...ts, newCashbackText.trim()]); setNewCashbackText(""); } }}
                  />
                  <button
                    onClick={() => { if (newCashbackText.trim()) { setCashbackTexts(ts => [...ts, newCashbackText.trim()]); setNewCashbackText(""); } }}
                    className="w-7 h-7 rounded-md bg-primary/15 border border-primary/20 text-primary flex items-center justify-center hover:bg-primary/25 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Promo Dialog */}
      <Dialog open={addPromoOpen} onOpenChange={setAddPromoOpen}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader><DialogTitle>Новый промокод</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1"><Label className="text-xs">Код</Label><Input className="h-8 font-mono text-sm uppercase" placeholder="SUMMER20" value={promoForm.code} onChange={e => setPromoForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1"><Label className="text-xs">Скидка</Label><Input type="number" className="h-8 text-sm" placeholder="15" value={promoForm.discount} onChange={e => setPromoForm(f => ({ ...f, discount: e.target.value }))} /></div>
              <div className="space-y-1">
                <Label className="text-xs">Тип</Label>
                <Select value={promoForm.type} onValueChange={v => setPromoForm(f => ({ ...f, type: v as "percent" | "fixed" }))}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="percent">%</SelectItem><SelectItem value="fixed">₽</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1"><Label className="text-xs">Макс. использований</Label><Input type="number" className="h-8 text-sm" placeholder="100" value={promoForm.maxUses} onChange={e => setPromoForm(f => ({ ...f, maxUses: e.target.value }))} /></div>
          </div>
          <div className="flex gap-2 mt-2">
            <Button variant="outline" className="flex-1 h-9" onClick={() => setAddPromoOpen(false)}>Отмена</Button>
            <Button className="flex-1 h-9" onClick={addPromo}>Создать</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Subscription Dialog */}
      <Dialog open={addSubOpen} onOpenChange={setAddSubOpen}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader><DialogTitle>Новая подписка</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1"><Label className="text-xs">Название</Label><Input className="h-8 text-sm" placeholder="Премиум" value={subForm.name} onChange={e => setSubForm(f => ({ ...f, name: e.target.value }))} autoFocus /></div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1"><Label className="text-xs">Часов/мес</Label><Input type="number" className="h-8 text-sm" placeholder="12" value={subForm.hoursPerMonth} onChange={e => setSubForm(f => ({ ...f, hoursPerMonth: e.target.value }))} /></div>
              <div className="space-y-1"><Label className="text-xs">Цена ₽/мес</Label><Input type="number" className="h-8 text-sm" placeholder="7500" value={subForm.price} onChange={e => setSubForm(f => ({ ...f, price: e.target.value }))} /></div>
            </div>
            <div className="space-y-1"><Label className="text-xs">Бонус часов</Label><Input type="number" className="h-8 text-sm" placeholder="0" value={subForm.bonusHours} onChange={e => setSubForm(f => ({ ...f, bonusHours: e.target.value }))} /></div>
          </div>
          <div className="flex gap-2 mt-2">
            <Button variant="outline" className="flex-1 h-9" onClick={() => setAddSubOpen(false)}>Отмена</Button>
            <Button className="flex-1 h-9" onClick={addSub}>Создать</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tier Dialog */}
      <Dialog open={tierDialogOpen} onOpenChange={setTierDialogOpen}>
        <DialogContent className="sm:max-w-sm max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm">{editingTierId ? "Редактировать уровень" : "Новый уровень"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            {/* Name */}
            <div className="space-y-1.5">
              <Label className="text-xs">Название *</Label>
              <Input autoFocus className="h-8 text-sm" placeholder="Платина" value={tierForm.name} onChange={e => setTierForm(f => ({ ...f, name: e.target.value }))} />
            </div>

            {/* Icon picker */}
            <div className="space-y-1.5">
              <Label className="text-xs">Иконка</Label>
              <div className="flex items-center gap-2">
                <Input className="h-8 text-sm w-20 text-center" value={tierForm.icon} onChange={e => setTierForm(f => ({ ...f, icon: e.target.value }))} />
                <div className="flex flex-wrap gap-1">
                  {PRESET_ICONS.map(ic => (
                    <button key={ic} type="button" onClick={() => setTierForm(f => ({ ...f, icon: ic }))} className={cn("w-7 h-7 rounded-md text-base flex items-center justify-center transition-colors", tierForm.icon === ic ? "bg-primary/20 ring-1 ring-primary" : "bg-muted/20 hover:bg-muted/40")}>{ic}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Color picker */}
            <div className="space-y-1.5">
              <Label className="text-xs">Цвет</Label>
              <div className="flex items-center gap-2">
                <input type="color" className="w-8 h-8 rounded cursor-pointer border border-border/50" value={tierForm.color} onChange={e => setTierForm(f => ({ ...f, color: e.target.value }))} />
                <div className="flex flex-wrap gap-1">
                  {PRESET_COLORS.map(c => (
                    <button key={c} type="button" onClick={() => setTierForm(f => ({ ...f, color: c }))} className={cn("w-6 h-6 rounded-full border-2 transition-transform", tierForm.color === c ? "border-foreground scale-110" : "border-transparent hover:scale-105")} style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
            </div>

            {/* Numeric fields */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="space-y-1.5">
                <Label className="text-xs">От очков</Label>
                <Input type="number" className="h-8 text-xs" placeholder="0" value={tierForm.minPoints} onChange={e => setTierForm(f => ({ ...f, minPoints: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Скидка %</Label>
                <Input type="number" className="h-8 text-xs" placeholder="0" min="0" max="100" value={tierForm.discount} onChange={e => setTierForm(f => ({ ...f, discount: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Кешбек %</Label>
                <Input type="number" className="h-8 text-xs" placeholder="2" min="0" max="100" value={tierForm.cashbackPercent} onChange={e => setTierForm(f => ({ ...f, cashbackPercent: e.target.value }))} />
              </div>
            </div>

            {/* Perks */}
            <div className="space-y-2">
              <Label className="text-xs">Привилегии</Label>
              {tierForm.perks.length > 0 && (
                <div className="space-y-1">
                  {tierForm.perks.map((p, i) => (
                    <div key={i} className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-muted/10 border border-border/30">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span className="text-xs flex-1">{p}</span>
                      <button type="button" onClick={() => setTierForm(f => ({ ...f, perks: f.perks.filter((_, j) => j !== i) }))} className="text-muted-foreground hover:text-red-400 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-1.5">
                <Input
                  className="h-8 text-xs flex-1"
                  placeholder="Добавить привилегию..."
                  value={newPerk}
                  onChange={e => setNewPerk(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addPerk(); } }}
                />
                <button type="button" onClick={addPerk} className="w-8 h-8 rounded-md bg-primary/15 border border-primary/20 text-primary flex items-center justify-center hover:bg-primary/25 transition-colors flex-shrink-0">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-3">
            {editingTierId && (
              <Button variant="destructive" size="sm" className="h-9 gap-1.5" onClick={() => deleteTier(editingTierId)}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
            <Button variant="outline" className="flex-1 h-9" onClick={() => setTierDialogOpen(false)}>Отмена</Button>
            <Button className="flex-1 h-9" onClick={saveTier}>{editingTierId ? "Сохранить" : "Создать"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
