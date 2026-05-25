import { useState } from "react";
import { User, Lock, CreditCard, Star, Building2, Camera, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useLocalStorage } from "@/lib/store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const TARIFF_PLANS = [
  { id: "free", name: "Бесплатный", price: 0, tag: "", maxParks: 1, maxEmployees: 3, color: "border-border/50 bg-card/20" },
  { id: "basic", name: "Базовый", price: 2990, tag: "", maxParks: 1, maxEmployees: 10, color: "border-blue-500/40 bg-blue-500/5" },
  { id: "pro", name: "Профессиональный", price: 7990, tag: "Популярный", maxParks: 5, maxEmployees: 50, color: "border-primary/40 bg-primary/5" },
  { id: "enterprise", name: "Корпоративный", price: 0, tag: "Под запрос", maxParks: 999, maxEmployees: 999, color: "border-violet-500/40 bg-violet-500/5" },
] as const;

const TARIFF_SECTIONS = [
  { key: "bookings", label: "Бронирования" },
  { key: "analytics", label: "Аналитика" },
  { key: "devices", label: "Устройства" },
  { key: "clients", label: "Клиенты" },
  { key: "constructor", label: "Конструктор" },
  { key: "salary", label: "Зарплата" },
  { key: "network", label: "Сеть парков" },
] as const;

export default function Profile() {
  const [profile, setProfile] = useLocalStorage("vrpark_profile", {
    surname: "Козлов",
    firstName: "Дмитрий",
    patronymic: "Александрович",
    phone: "+7 (999) 123-45-67",
    email: "admin@vrpark.co",
    position: "Владелец",
    avatar: "",
    parkName: "VR Park Moscow",
    city: "Москва",
    bio: "",
    recoveryEmail: "admin@vrpark.co",
  });
  const [profileSaved, setProfileSaved] = useState(false);
  const [parkSaved, setParkSaved] = useState(false);

  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwSaving, setPwSaving] = useState(false);

  const [payment, setPayment] = useLocalStorage("vrpark_payment", {
    cardNumber: "",
    expiry: "",
    holder: "",
    autoPayment: false,
  });
  const [paymentSaved, setPaymentSaved] = useState(false);

  const [tariff, setTariff] = useLocalStorage("vrpark_tariff", {
    plan: "pro" as "free" | "basic" | "pro" | "enterprise",
    maxParks: 5,
    maxEmployees: 50,
    sections: { bookings: true, analytics: true, devices: true, clients: true, constructor: true, salary: true, network: false },
  });

  const fullName = [profile.surname, profile.firstName, profile.patronymic].filter(Boolean).join(" ") || "—";

  return (
    <div className="flex flex-col h-full z-10">
      <header className="h-14 border-b border-border/50 flex items-center px-4 md:px-6 bg-card/50 backdrop-blur-sm shrink-0">
        <h1 className="text-lg font-bold font-mono">Профиль</h1>
      </header>

      <div className="flex-1 overflow-auto pb-20 md:pb-6">
        {/* Profile hero */}
        <div className="px-4 md:px-6 pt-5 pb-4 flex items-center gap-4">
          <div className="relative shrink-0">
            <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center text-xl font-bold text-primary border-2 border-primary/20 overflow-hidden">
              {profile.avatar
                ? <img src={profile.avatar} className="w-full h-full object-cover" alt="avatar" />
                : (profile.firstName || "А").charAt(0)}
            </div>
            <button className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-sm hover:bg-primary/90 transition-colors">
              <Camera className="w-2.5 h-2.5" />
            </button>
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-base leading-tight">{fullName}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{profile.position} · {profile.email}</p>
          </div>
        </div>

        <div className="px-4 md:px-6">
          <Tabs defaultValue="personal" className="w-full max-w-2xl">
            <TabsList className="mb-4 bg-muted/30 border border-border/50 h-9 flex-wrap gap-1">
              <TabsTrigger value="personal" className="text-xs flex items-center gap-1.5">
                <User className="w-3 h-3" /> Личные данные
              </TabsTrigger>
              <TabsTrigger value="security" className="text-xs flex items-center gap-1.5">
                <Lock className="w-3 h-3" /> Безопасность
              </TabsTrigger>
              <TabsTrigger value="park" className="text-xs flex items-center gap-1.5">
                <Building2 className="w-3 h-3" /> Парк
              </TabsTrigger>
              <TabsTrigger value="payment" className="text-xs flex items-center gap-1.5">
                <CreditCard className="w-3 h-3" /> Платежи
              </TabsTrigger>
              <TabsTrigger value="tariff" className="text-xs flex items-center gap-1.5">
                <Star className="w-3 h-3" /> Тариф
              </TabsTrigger>
            </TabsList>

            {/* Personal */}
            <TabsContent value="personal" className="space-y-4">
              <Card className="bg-card/30 border-border/50">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm">ФИО</CardTitle>
                  <CardDescription className="text-xs">Полное имя, отображаемое в системе</CardDescription>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Фамилия</Label>
                      <Input className="h-8 text-sm" value={profile.surname} onChange={e => setProfile(p => ({ ...p, surname: e.target.value }))} placeholder="Козлов" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Имя</Label>
                      <Input className="h-8 text-sm" value={profile.firstName} onChange={e => setProfile(p => ({ ...p, firstName: e.target.value }))} placeholder="Дмитрий" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Отчество</Label>
                      <Input className="h-8 text-sm" value={profile.patronymic} onChange={e => setProfile(p => ({ ...p, patronymic: e.target.value }))} placeholder="Александрович" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Должность</Label>
                      <Input className="h-8 text-sm" value={profile.position} onChange={e => setProfile(p => ({ ...p, position: e.target.value }))} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Телефон</Label>
                      <Input className="h-8 text-sm" type="tel" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} />
                    </div>
                    <div className="col-span-2 space-y-1.5">
                      <Label className="text-xs">Email</Label>
                      <Input className="h-8 text-sm" type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} />
                    </div>
                  </div>
                  <Button className="w-full h-8 text-xs" onClick={() => { setProfileSaved(true); toast.success("Личные данные сохранены"); setTimeout(() => setProfileSaved(false), 2000); }}>
                    {profileSaved ? "Сохранено!" : "Сохранить данные"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security */}
            <TabsContent value="security" className="space-y-4">
              <Card className="bg-card/30 border-border/50">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm">Смена пароля</CardTitle>
                  <CardDescription className="text-xs">Для смены введите текущий и новый пароль</CardDescription>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Текущий пароль</Label>
                    <Input className="h-8 text-sm" type="password" placeholder="••••••••" value={pwForm.current} onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Новый пароль</Label>
                      <Input className="h-8 text-sm" type="password" placeholder="••••••••" value={pwForm.next} onChange={e => setPwForm(f => ({ ...f, next: e.target.value }))} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Подтверждение</Label>
                      <Input className="h-8 text-sm" type="password" placeholder="••••••••" value={pwForm.confirm} onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} />
                    </div>
                  </div>
                  {pwForm.next && pwForm.confirm && pwForm.next !== pwForm.confirm && (
                    <p className="text-[11px] text-destructive">Пароли не совпадают</p>
                  )}
                  <Button className="w-full h-8 text-xs" disabled={!pwForm.current || !pwForm.next || pwForm.next !== pwForm.confirm || pwSaving} onClick={() => { setPwSaving(true); setTimeout(() => { setPwSaving(false); setPwForm({ current: "", next: "", confirm: "" }); toast.success("Пароль успешно изменён"); }, 1000); }}>
                    {pwSaving ? "Сохранение..." : "Изменить пароль"}
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-card/30 border-border/50">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm">Восстановление пароля</CardTitle>
                  <CardDescription className="text-xs">Ссылка для сброса будет отправлена на указанный email</CardDescription>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Email для восстановления</Label>
                    <Input className="h-8 text-sm" type="email" value={profile.recoveryEmail} onChange={e => setProfile(p => ({ ...p, recoveryEmail: e.target.value }))} />
                  </div>
                  <Button variant="outline" className="w-full h-8 text-xs" onClick={() => toast.success(`Инструкция отправлена на ${profile.recoveryEmail}`)}>
                    Отправить ссылку для восстановления
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Park */}
            <TabsContent value="park" className="space-y-4">
              <Card className="bg-card/30 border-border/50">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm">Данные парка</CardTitle>
                  <CardDescription className="text-xs">Информация о вашем VR-парке</CardDescription>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Название парка</Label>
                      <Input className="h-8 text-sm" value={profile.parkName} onChange={e => setProfile(p => ({ ...p, parkName: e.target.value }))} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Город</Label>
                      <Input className="h-8 text-sm" value={profile.city} onChange={e => setProfile(p => ({ ...p, city: e.target.value }))} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">О парке</Label>
                    <textarea
                      className="w-full text-sm border border-border/50 rounded-lg p-2.5 bg-card/30 resize-none focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground"
                      rows={4}
                      value={profile.bio}
                      onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
                      placeholder="Расскажите о вашем VR-парке..."
                    />
                  </div>
                  <Button className="w-full h-8 text-xs" onClick={() => { setParkSaved(true); toast.success("Данные парка сохранены"); setTimeout(() => setParkSaved(false), 2000); }}>
                    {parkSaved ? "Сохранено!" : "Сохранить"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payment */}
            <TabsContent value="payment" className="space-y-4">
              <Card className="bg-card/30 border-border/50">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm">Платёжные данные</CardTitle>
                  <CardDescription className="text-xs">Карта для оплаты тарифа</CardDescription>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-3">
                  {payment.cardNumber && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-primary/10 to-violet-500/10 border border-primary/20">
                      <CreditCard className="w-5 h-5 text-primary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-mono font-medium">•••• •••• •••• {payment.cardNumber.replace(/\s/g, "").slice(-4) || "——"}</p>
                        <p className="text-xs text-muted-foreground">{payment.holder || "—"} · {payment.expiry || "—"}</p>
                      </div>
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <Label className="text-xs">Номер карты</Label>
                    <Input
                      className="h-8 text-sm font-mono"
                      placeholder="0000 0000 0000 0000"
                      maxLength={19}
                      value={payment.cardNumber}
                      onChange={e => setPayment(p => ({ ...p, cardNumber: e.target.value.replace(/\D/g, "").replace(/(\d{4})/g, "$1 ").trim().slice(0, 19) }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Срок действия</Label>
                      <Input
                        className="h-8 text-sm font-mono"
                        placeholder="MM/YY"
                        maxLength={5}
                        value={payment.expiry}
                        onChange={e => { let v = e.target.value.replace(/\D/g, ""); if (v.length >= 2) v = v.slice(0, 2) + "/" + v.slice(2, 4); setPayment(p => ({ ...p, expiry: v })); }}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Имя на карте</Label>
                      <Input className="h-8 text-sm" placeholder="DMITRY KOZLOV" value={payment.holder} onChange={e => setPayment(p => ({ ...p, holder: e.target.value.toUpperCase() }))} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/30 border-border/50">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm">Автоплатёж</CardTitle>
                  <CardDescription className="text-xs">Автоматическое списание при окончании тарифного периода</CardDescription>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Автоплатёж {payment.autoPayment ? "включён" : "выключен"}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Карта будет списана автоматически</p>
                    </div>
                    <Switch checked={payment.autoPayment} onCheckedChange={val => setPayment(p => ({ ...p, autoPayment: val }))} />
                  </div>
                </CardContent>
              </Card>

              <Button className="w-full h-8 text-xs" onClick={() => { setPaymentSaved(true); toast.success("Платёжные данные сохранены"); setTimeout(() => setPaymentSaved(false), 2000); }}>
                {paymentSaved ? "Сохранено!" : "Сохранить платёжные данные"}
              </Button>
            </TabsContent>

            {/* Tariff */}
            <TabsContent value="tariff" className="space-y-4">
              <Card className="bg-card/30 border-border/50">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm">Выбор тарифа</CardTitle>
                  <CardDescription className="text-xs">Текущий тариф определяет доступные функции</CardDescription>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="grid grid-cols-2 gap-2">
                    {TARIFF_PLANS.map(plan => (
                      <button
                        key={plan.id}
                        onClick={() => setTariff(t => ({
                          ...t,
                          plan: plan.id,
                          maxParks: plan.maxParks === 999 ? t.maxParks : plan.maxParks,
                          maxEmployees: plan.maxEmployees === 999 ? t.maxEmployees : plan.maxEmployees,
                        }))}
                        className={cn("relative p-3 rounded-xl border text-left transition-all", plan.color, tariff.plan === plan.id ? "ring-2 ring-primary/60" : "hover:opacity-80")}
                      >
                        {plan.tag && (
                          <span className="absolute top-1.5 right-1.5 text-[9px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-semibold">{plan.tag}</span>
                        )}
                        <p className={cn("text-xs font-semibold", tariff.plan === plan.id ? "text-primary" : "")}>{plan.name}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {plan.price === 0
                            ? (plan.id === "enterprise" ? "По договору" : "Бесплатно")
                            : `${plan.price.toLocaleString("ru")} ₽/мес`}
                        </p>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/30 border-border/50">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm">Лимиты</CardTitle>
                  <CardDescription className="text-xs">Максимальное количество парков и сотрудников</CardDescription>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Макс. парков</Label>
                      <div className="flex gap-2 items-center">
                        <Input className="h-8 text-sm" type="number" min="1" max="100" value={tariff.maxParks} onChange={e => setTariff(t => ({ ...t, maxParks: Number(e.target.value) || 1 }))} />
                        <span className="text-xs text-muted-foreground shrink-0">шт.</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Макс. сотрудников</Label>
                      <div className="flex gap-2 items-center">
                        <Input className="h-8 text-sm" type="number" min="1" max="500" value={tariff.maxEmployees} onChange={e => setTariff(t => ({ ...t, maxEmployees: Number(e.target.value) || 1 }))} />
                        <span className="text-xs text-muted-foreground shrink-0">чел.</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/30 border-border/50">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm">Доступные разделы</CardTitle>
                  <CardDescription className="text-xs">Настройте, какие разделы CRM доступны на текущем тарифе</CardDescription>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {TARIFF_SECTIONS.map(sec => {
                      const active = tariff.sections[sec.key as keyof typeof tariff.sections] ?? false;
                      return (
                        <button
                          key={sec.key}
                          onClick={() => setTariff(t => ({ ...t, sections: { ...t.sections, [sec.key]: !active } }))}
                          className={cn(
                            "flex items-center gap-1.5 p-2.5 rounded-lg border text-xs transition-all text-left",
                            active
                              ? "border-green-500/40 bg-green-500/8 text-green-400"
                              : "border-border/50 bg-card/20 text-muted-foreground/60"
                          )}
                        >
                          <CheckCircle2 className={cn("w-3.5 h-3.5 shrink-0", active ? "text-green-400" : "text-muted-foreground/30")} />
                          {sec.label}
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Button className="w-full h-8 text-xs" onClick={() => toast.success("Тариф сохранён")}>
                Сохранить тариф
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
