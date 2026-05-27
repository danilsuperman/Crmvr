import { useState } from "react";
import { Star, Gift, Crown, Repeat, CreditCard, Percent, Plus, Trash2, CheckCircle2, Zap, Users, TrendingUp, Heart, Clock, Medal } from "lucide-react";
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

type LoyaltyTier = { id: string; name: string; minPoints: number; discount: number; color: string; icon: string; perks: string[]; active: boolean };
type Subscription = { id: string; name: string; hoursPerMonth: number; price: number; bonusHours: number; active: boolean; color: string };
type PromoCode = { id: string; code: string; discount: number; type: "percent" | "fixed"; uses: number; maxUses: number; active: boolean };

const DEFAULT_TIERS: LoyaltyTier[] = [
  { id: "t1", name: "Стандарт",  minPoints: 0,    discount: 0,  color: "#6b7280", icon: "⭐",  perks: ["Накопление бонусов", "Доступ к акциям"], active: true },
  { id: "t2", name: "Серебро",   minPoints: 1000, discount: 5,  color: "#94a3b8", icon: "🥈", perks: ["Скидка 5%", "Приоритет бронирования", "Спецпредложения"], active: true },
  { id: "t3", name: "Золото",    minPoints: 3000, discount: 10, color: "#f59e0b", icon: "🥇", perks: ["Скидка 10%", "Бонус +10% к часам", "Бесплатный гардероб", "Ранний доступ"], active: true },
  { id: "t4", name: "VIP",       minPoints: 7000, discount: 15, color: "#6366f1", icon: "👑", perks: ["Скидка 15%", "VIP-зона", "Бесплатные напитки", "Персональный менеджер", "Безлимит 1 раз/мес"], active: true },
];

const DEFAULT_SUBS: Subscription[] = [
  { id: "s1", name: "Старт",    hoursPerMonth: 4,  price: 3200,  bonusHours: 0, active: true,  color: "#6b7280" },
  { id: "s2", name: "Базовый",  hoursPerMonth: 8,  price: 5600,  bonusHours: 1, active: true,  color: "#3b82f6" },
  { id: "s3", name: "Активный", hoursPerMonth: 16, price: 9800,  bonusHours: 2, active: true,  color: "#6366f1" },
  { id: "s4", name: "VIP",      hoursPerMonth: 30, price: 16500, bonusHours: 5, active: true,  color: "#f59e0b" },
];

const DEFAULT_PROMOS: PromoCode[] = [
  { id: "p1", code: "WELCOME20", discount: 20, type: "percent", uses: 14, maxUses: 100, active: true },
  { id: "p2", code: "BDAY500",   discount: 500, type: "fixed",  uses: 7,  maxUses: 50,  active: true },
  { id: "p3", code: "SUMMER15",  discount: 15, type: "percent", uses: 31, maxUses: 200, active: false },
];

const CASHBACK_RULES = [
  { tier: "Стандарт", percent: 2,  color: "text-slate-400" },
  { tier: "Серебро",  percent: 3,  color: "text-slate-300" },
  { tier: "Золото",   percent: 5,  color: "text-amber-400" },
  { tier: "VIP",      percent: 7,  color: "text-violet-400" },
];

export default function Loyalty() {
  const [tiers, setTiers] = useLocalStorage<LoyaltyTier[]>("vrpark_loyalty_tiers", DEFAULT_TIERS);
  const [subs, setSubs] = useLocalStorage<Subscription[]>("vrpark_subscriptions", DEFAULT_SUBS);
  const [promos, setPromos] = useLocalStorage<PromoCode[]>("vrpark_promos", DEFAULT_PROMOS);
  const [cashbackEnabled, setCashbackEnabled] = useLocalStorage("vrpark_cashback_enabled", true);
  const [tab, setTab] = useState<"tiers" | "subscriptions" | "promos" | "cashback">("tiers");
  const [addPromoOpen, setAddPromoOpen] = useState(false);
  const [promoForm, setPromoForm] = useState({ code: "", discount: "", type: "percent" as "percent" | "fixed", maxUses: "100" });
  const [addSubOpen, setAddSubOpen] = useState(false);
  const [subForm, setSubForm] = useState({ name: "", hoursPerMonth: "", price: "", bonusHours: "", color: "#6366f1" });

  const totalClients = 247;
  const tierDist = [38, 89, 94, 26];

  const addPromo = () => {
    if (!promoForm.code.trim() || !promoForm.discount) { toast.error("Заполните поля"); return; }
    setPromos(ps => [...ps, { id: `p_${Date.now()}`, code: promoForm.code.toUpperCase(), discount: Number(promoForm.discount), type: promoForm.type, uses: 0, maxUses: Number(promoForm.maxUses), active: true }]);
    toast.success(`Промокод ${promoForm.code.toUpperCase()} создан`);
    setPromoForm({ code: "", discount: "", type: "percent", maxUses: "100" });
    setAddPromoOpen(false);
  };

  const addSub = () => {
    if (!subForm.name.trim() || !subForm.price) { toast.error("Заполните поля"); return; }
    setSubs(ss => [...ss, { id: `s_${Date.now()}`, name: subForm.name, hoursPerMonth: Number(subForm.hoursPerMonth) || 8, price: Number(subForm.price), bonusHours: Number(subForm.bonusHours) || 0, active: true, color: subForm.color }]);
    toast.success(`Подписка «${subForm.name}» добавлена`);
    setSubForm({ name: "", hoursPerMonth: "", price: "", bonusHours: "", color: "#6366f1" });
    setAddSubOpen(false);
  };

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
          {tab === "promos" && <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={() => setAddPromoOpen(true)}><Plus className="w-3.5 h-3.5" />Промокод</Button>}
          {tab === "subscriptions" && <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={() => setAddSubOpen(true)}><Plus className="w-3.5 h-3.5" />Подписка</Button>}
        </div>
      </header>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-4 md:px-6 pt-4">
        {[
          { icon: Users,     label: "Клиентов",        value: totalClients, color: "text-blue-400" },
          { icon: Crown,     label: "VIP участников",  value: tierDist[3],  color: "text-amber-400" },
          { icon: Repeat,    label: "Активных подписок", value: 42,         color: "text-violet-400" },
          { icon: TrendingUp, label: "Кешбек выдан",  value: "12 400 ₽",  color: "text-emerald-400" },
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
          { key: "tiers",         icon: Medal,   label: "Уровни" },
          { key: "subscriptions", icon: Repeat,  label: "Подписки" },
          { key: "promos",        icon: Percent, label: "Промокоды" },
          { key: "cashback",      icon: CreditCard, label: "Кешбек" },
        ] as const).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap", tab === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted/20")}>
            <t.icon className="w-3.5 h-3.5" /> {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-6 pt-4 pb-20 md:pb-6 space-y-3">

        {/* TIERS */}
        {tab === "tiers" && tiers.map((tier, i) => (
          <Card key={tier.id} className={cn("border-border/50 transition-all", tier.active ? "bg-card/30" : "bg-muted/5 opacity-60")}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl border border-border/40 bg-muted/20 flex items-center justify-center text-xl shrink-0">{tier.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="text-sm font-bold" style={{ color: tier.color }}>{tier.name}</p>
                    <span className="text-[10px] text-muted-foreground">от {tier.minPoints.toLocaleString()} очков</span>
                    {tier.discount > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">−{tier.discount}%</span>}
                    <span className="text-[10px] text-muted-foreground ml-auto">{tierDist[i]} клиентов</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {tier.perks.map(p => (
                      <span key={p} className="text-[10px] px-2 py-0.5 rounded-full border border-border/40 bg-muted/10 text-muted-foreground flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />{p}
                      </span>
                    ))}
                  </div>
                </div>
                <Switch checked={tier.active} onCheckedChange={v => setTiers(ts => ts.map(x => x.id === tier.id ? { ...x, active: v } : x))} />
              </div>
            </CardContent>
          </Card>
        ))}

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
            <div className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-card/20">
              <div>
                <p className="text-sm font-semibold">Кешбек-программа</p>
                <p className="text-xs text-muted-foreground">Возврат % от каждой оплаты на бонусный счёт</p>
              </div>
              <Switch checked={cashbackEnabled} onCheckedChange={v => { setCashbackEnabled(v); toast.success(v ? "Кешбек включён" : "Кешбек отключён"); }} />
            </div>
            {CASHBACK_RULES.map(r => (
              <div key={r.tier} className="flex items-center justify-between p-3 rounded-xl border border-border/40 bg-card/20">
                <span className="text-sm">{r.tier}</span>
                <span className={cn("text-sm font-bold", r.color)}>{r.percent}% кешбек</span>
              </div>
            ))}
            <Card className="bg-card/30 border-border/50">
              <CardHeader className="pb-2 pt-4 px-4"><CardTitle className="text-sm flex items-center gap-2"><Zap className="w-4 h-4 text-amber-400" />Правила кешбека</CardTitle></CardHeader>
              <CardContent className="px-4 pb-4 space-y-1.5 text-xs text-muted-foreground">
                {["Начисляется на следующий день после оплаты", "Срок действия бонусов — 90 дней", "Оплата бонусами — до 50% от суммы заказа", "Не применяется совместно с промокодом"].map((r, i) => (
                  <div key={i} className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" /><span>{r}</span></div>
                ))}
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Dialog open={addPromoOpen} onOpenChange={setAddPromoOpen}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader><DialogTitle>Новый промокод</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1"><Label className="text-xs">Код</Label><Input className="h-8 font-mono text-sm uppercase" placeholder="SUMMER20" value={promoForm.code} onChange={e => setPromoForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1"><Label className="text-xs">Скидка</Label><Input type="number" className="h-8 text-sm" placeholder="15" value={promoForm.discount} onChange={e => setPromoForm(f => ({ ...f, discount: e.target.value }))} /></div>
              <div className="space-y-1">
                <Label className="text-xs">Тип</Label>
                <Select value={promoForm.type} onValueChange={v => setPromoForm(f => ({ ...f, type: v as any }))}>
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

      <Dialog open={addSubOpen} onOpenChange={setAddSubOpen}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader><DialogTitle>Новая подписка</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1"><Label className="text-xs">Название</Label><Input className="h-8 text-sm" placeholder="Премиум" value={subForm.name} onChange={e => setSubForm(f => ({ ...f, name: e.target.value }))} /></div>
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
    </div>
  );
}
