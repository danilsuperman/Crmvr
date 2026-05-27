import { useState } from "react";
import { useLocalStorage } from "@/lib/store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useListZones,
  useListSessionTypes,
  useListPackages,
  useCreateZone,
  useUpdateZone,
  useDeleteZone,
  useCreateSessionType,
  useUpdateSessionType,
  useDeleteSessionType,
  useCreatePackage,
  useUpdatePackage,
  useDeletePackage,
  getListZonesQueryKey,
  getListSessionTypesQueryKey,
  getListPackagesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Clock, Package, Users, MessageSquare, DollarSign, Shield, UserPlus, CheckCircle2, Layers, Minus, Star, Brain, Bot, Trophy, Heart, Gamepad2, Bell, Mail, CreditCard, Zap, Building2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const MOCK_USERS = [
  { id: 1, name: "Дмитрий Козлов", email: "admin@vrpark.co", role: "Owner", status: "active" },
  { id: 2, name: "Анна Петрова", email: "anna@vrpark.co", role: "Administrator", status: "active" },
  { id: 3, name: "Михаил Сидоров", email: "misha@vrpark.co", role: "Operator", status: "active" },
  { id: 4, name: "Светлана Иванова", email: "sveta@vrpark.co", role: "Cashier", status: "inactive" },
  { id: 5, name: "Алексей Новиков", email: "alex@vrpark.co", role: "Technician", status: "active" },
];

const ROLES = ["Owner", "Administrator", "Operator", "Cashier", "Technician"];

const ROLE_PERMISSIONS: Record<string, Record<string, boolean>> = {
  Owner: { finances: true, devices: true, analytics: true, bookings: true, settings: true },
  Administrator: { finances: true, devices: true, analytics: true, bookings: true, settings: true },
  Operator: { finances: false, devices: true, analytics: false, bookings: true, settings: false },
  Cashier: { finances: true, devices: false, analytics: false, bookings: true, settings: false },
  Technician: { finances: false, devices: true, analytics: false, bookings: false, settings: false },
};

const ZONE_COLORS = ["#6366f1","#8b5cf6","#ec4899","#f59e0b","#10b981","#3b82f6","#ef4444","#06b6d4"];

const TARIFF_PLANS = [
  { id: "start", name: "START", emoji: "🟢", price: 3000, baseObjects: 1, baseEmployees: 2,
    features: ["1 объект", "Базовая CRM", "Расписание сессий", "До 2 сотрудников", "Базовая аналитика"],
    color: "border-white/10 bg-muted/10", activeColor: "border-emerald-500/50 bg-emerald-500/8 ring-1 ring-emerald-500/30" },
  { id: "pro", name: "PRO", emoji: "🟡", price: 8100, baseObjects: 3, baseEmployees: 10,
    features: ["До 3 объектов", "Расширенная CRM", "Онлайн-бронь + оплаты", "До 10 сотрудников", "Аналитика загрузки", "Интеграции"],
    color: "border-white/10 bg-muted/10", activeColor: "border-indigo-500/50 bg-indigo-500/8 ring-1 ring-indigo-500/30", badge: "Популярный" },
  { id: "enterprise", name: "ENTERPRISE", emoji: "🔴", price: 24000, baseObjects: 10, baseEmployees: 50,
    features: ["До 10 объектов", "Сеть VR-клубов", "До 50+ сотрудников", "Расширенная аналитика сети", "Управление филиалами", "API доступ"],
    color: "border-white/10 bg-muted/10", activeColor: "border-violet-500/50 bg-violet-500/8 ring-1 ring-violet-500/30" },
] as const;

const MODULES_LIST = [
  { id: "payments", icon: CreditCard, label: "Онлайн оплата", desc: "Stripe / ЮKassa для приёма платежей", pricePerObj: 1500, fixed: false },
  { id: "sms_notify", icon: Mail, label: "Рассылки и оповещения", desc: "SMS / WhatsApp уведомления клиентам", pricePerObj: 1500, fixed: false },
  { id: "messaging", icon: MessageSquare, label: "Общение внутри платформы", desc: "Интеграция ТГ, Макс, WhatsApp", pricePerObj: 1500, fixed: false },
  { id: "auto_notify", icon: Bell, label: "Авто-уведомления", desc: "Напоминания о брони, переносах, скидках", pricePerObj: 1500, fixed: false },
  { id: "ai_consult", icon: Brain, label: "AI Консалтинг", desc: "Прогноз загрузки, акции, «счастливые часы»", pricePerObj: 1500, fixed: false },
  { id: "guest_cabinet", icon: Users, label: "Личный кабинет гостя", desc: "Бронь, история, бонусы, достижения", pricePerObj: 1500, fixed: false },
  { id: "leagues", icon: Trophy, label: "Система лиг / рейтингов", desc: "Турниры, лидерборды, сезоны, ранги", pricePerObj: 500, fixed: false },
  { id: "loyalty", icon: Heart, label: "Лояльность / подписка", desc: "VIP, кешбек, подписные часы, бонусы", pricePerObj: 1000, fixed: false },
  { id: "ai_admin", icon: Bot, label: "AI Администратор", desc: "Отвечает гостям, бронирует, консультирует", price: 5000, pricePerObj: 0, fixed: true },
  { id: "vr_launcher", icon: Gamepad2, label: "VR Launcher / Lobby System", desc: "VR-лобби, список игр, защита от выхода в SteamVR", price: 3000, pricePerObj: 0, fixed: true },
];

function calcObjectCost(extra: number): number {
  if (extra <= 0) return 0;
  if (extra <= 5) return extra * 2000;
  if (extra <= 10) return extra * 1800;
  return extra * 1600;
}
function calcEmployeeCost(extra: number): number {
  if (extra <= 0) return 0;
  if (extra <= 10) return extra * 400;
  if (extra <= 30) return extra * 300;
  return extra * 200;
}

export default function Settings() {
  const queryClient = useQueryClient();
  const MOCK_ZONES_DATA = [
    { id: 1, name: "Arena A", color: "#6366f1", capacity: 4, openTime: "10:00", closeTime: "22:00" },
    { id: 2, name: "Arena B", color: "#8b5cf6", capacity: 4, openTime: "10:00", closeTime: "22:00" },
    { id: 3, name: "VR Solo", color: "#ec4899", capacity: 1, openTime: "10:00", closeTime: "22:00" },
    { id: 4, name: "Racing Zone", color: "#f59e0b", capacity: 2, openTime: "12:00", closeTime: "22:00" },
    { id: 5, name: "PS5", color: "#3b82f6", capacity: 2, openTime: "10:00", closeTime: "23:00" },
    { id: 6, name: "Motion", color: "#10b981", capacity: 1, openTime: "11:00", closeTime: "21:00" },
  ];
  const MOCK_SESSION_TYPES_DATA = [
    { id: 1, name: "Стандарт 30 мин", color: "#6366f1", minDuration: 30, price: 1200 },
    { id: 2, name: "Стандарт 60 мин", color: "#8b5cf6", minDuration: 60, price: 2000 },
    { id: 3, name: "VIP 90 мин", color: "#f59e0b", minDuration: 90, price: 3500 },
    { id: 4, name: "Максимальный 120 мин", color: "#10b981", minDuration: 120, price: 4800 },
  ];
  const MOCK_PACKAGES_DATA = [
    { id: 1, name: "День рождения VIP", description: "Всё включено, до 8 чел.", maxGuests: 8, zoneIds: [1, 3], price: 15000 },
    { id: 2, name: "Корпоратив Standard", description: "Командный тимбилдинг", maxGuests: 20, zoneIds: [1, 2, 4], price: 35000 },
    { id: 3, name: "Full Park", description: "Весь парк в ваше распоряжение", maxGuests: 50, zoneIds: [1, 2, 3, 4, 5, 6], price: 80000 },
  ];

  useListZones();
  const isLoadingZones = false;
  const [zones, setZones] = useLocalStorage("vrpark_zones", MOCK_ZONES_DATA);

  // Zone constructor meta (for session type → zone distribution)
  const [settingsConstructorMeta, setSettingsConstructorMeta] = useLocalStorage<Record<string, { description?: string; ageLimit?: number; enabled?: boolean; sessionTypeIds?: number[] }>>("vrpark_zone_constructor_meta", {});

  // Role permissions state
  const [rolePermissions, setRolePermissions] = useLocalStorage<Record<string, Record<string, boolean>>>("vrpark_role_permissions", ROLE_PERMISSIONS);
  const [permSaved, setPermSaved] = useState(false);

  // Users state
  const [users, setUsers] = useState(MOCK_USERS);
  const [selectedRole, setSelectedRole] = useState("Owner");
  const [userModal, setUserModal] = useState<{ open: boolean; name: string; email: string; password: string; role: string }>({ open: false, name: "", email: "", password: "", role: "Operator" });

  // SMS state
  const [smsProvider, setSmsProvider] = useState("smsru");
  const [smsApiKey, setSmsApiKey] = useState("");
  const [smsSendConfirm, setSmsSendConfirm] = useState(true);
  const [smsSendReminder, setSmsSendReminder] = useState(true);
  const [smsSaved, setSmsSaved] = useState(false);

  // Salary state
  const [salaryMode, setSalaryMode] = useState<"fixed" | "hourly" | "percent" | "mixed">("fixed");
  const [salaryFixed, setSalaryFixed] = useState("2000");
  const [salaryHourly, setSalaryHourly] = useState("300");
  const [salaryPercent, setSalaryPercent] = useState("5");
  const [salaryMixedFixed, setSalaryMixedFixed] = useState("1500");
  const [salaryMixedPercent, setSalaryMixedPercent] = useState("3");
  useListSessionTypes();
  const isLoadingSessionTypes = false;
  const [sessionTypes, setSessionTypes] = useLocalStorage("vrpark_session_types", MOCK_SESSION_TYPES_DATA);

  useListPackages();
  const isLoadingPackages = false;
  const [packages, setPackages] = useLocalStorage("vrpark_packages", MOCK_PACKAGES_DATA);
  const [tariff, setTariff] = useLocalStorage("vrpark_tariff", {
    plan: "pro" as "start" | "pro" | "enterprise",
    extraObjects: 0,
    extraEmployees: 0,
    modules: [] as string[],
  });
  const [paySettings, setPaySettings] = useLocalStorage("vrpark_pay_settings", {
    activeProvider: "yukassa",
    connectedProviders: [] as string[],
    prepayPercent: 30,
    linkExpiryHours: 24,
    autoCancelHours: 48,
  });
  const [payApiKeys, setPayApiKeys] = useState<Record<string, { key: string; secret: string; merchant: string }>>({});
  const [openProvider, setOpenProvider] = useState<string | null>(null);
  const [channelSettings, setChannelSettings] = useLocalStorage("vrpark_channel_settings", {
    connected: [] as string[],
  });
  const [channelOpen, setChannelOpen] = useState<string | null>(null);

  // Zone modal
  const [zoneModal, setZoneModal] = useState<{
    open: boolean; id?: number;
    name: string; color: string; capacity: string; openTime: string; closeTime: string;
  }>({ open: false, name: "", color: "#6366f1", capacity: "10", openTime: "10:00", closeTime: "22:00" });

  // Session modal
  const [sessionModal, setSessionModal] = useState<{
    open: boolean; id?: number;
    name: string; color: string; minDuration: string; price: string;
  }>({ open: false, name: "", color: "#8b5cf6", minDuration: "30", price: "" });

  // Package modal
  const [pkgModal, setPkgModal] = useState<{
    open: boolean; id?: number;
    name: string; description: string; maxGuests: string; zoneIds: number[]; price: string;
  }>({ open: false, name: "", description: "", maxGuests: "10", zoneIds: [], price: "" });

  // Mutations — Zones
  const createZone = useCreateZone({ mutation: { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListZonesQueryKey() }); toast.success("Зона добавлена"); setZoneModal(z => ({ ...z, open: false })); }, onError: () => toast.error("Ошибка") } });
  const updateZone = useUpdateZone({ mutation: { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListZonesQueryKey() }); toast.success("Зона обновлена"); setZoneModal(z => ({ ...z, open: false })); }, onError: () => toast.error("Ошибка") } });
  const deleteZone = useDeleteZone({ mutation: { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListZonesQueryKey() }); toast.success("Зона удалена"); }, onError: () => toast.error("Ошибка") } });

  // Mutations — Session types
  const createSession = useCreateSessionType({ mutation: { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListSessionTypesQueryKey() }); toast.success("Тип добавлен"); setSessionModal(s => ({ ...s, open: false })); }, onError: () => toast.error("Ошибка") } });
  const updateSession = useUpdateSessionType({ mutation: { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListSessionTypesQueryKey() }); toast.success("Тип обновлён"); setSessionModal(s => ({ ...s, open: false })); }, onError: () => toast.error("Ошибка") } });
  const deleteSession = useDeleteSessionType({ mutation: { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListSessionTypesQueryKey() }); toast.success("Тип удалён"); }, onError: () => toast.error("Ошибка") } });

  // Mutations — Packages
  const createPkg = useCreatePackage({ mutation: { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListPackagesQueryKey() }); toast.success("Пакет добавлен"); setPkgModal(p => ({ ...p, open: false })); }, onError: () => toast.error("Ошибка") } });
  const updatePkg = useUpdatePackage({ mutation: { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListPackagesQueryKey() }); toast.success("Пакет обновлён"); setPkgModal(p => ({ ...p, open: false })); }, onError: () => toast.error("Ошибка") } });
  const deletePkg = useDeletePackage({ mutation: { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListPackagesQueryKey() }); toast.success("Пакет удалён"); }, onError: () => toast.error("Ошибка") } });

  const handleZoneSave = () => {
    if (!zoneModal.name.trim()) { toast.error("Введите название зоны"); return; }
    const entry = { name: zoneModal.name, color: zoneModal.color, capacity: Number(zoneModal.capacity) || 10, openTime: zoneModal.openTime, closeTime: zoneModal.closeTime };
    if (zoneModal.id) {
      setZones((zs) => zs.map((z) => z.id === zoneModal.id ? { ...z, ...entry } : z));
      toast.success("Зона обновлена");
    } else {
      setZones((zs) => [...zs, { id: Date.now(), ...entry }]);
      toast.success("Зона добавлена");
    }
    setZoneModal((z) => ({ ...z, open: false }));
  };

  const handleSessionSave = () => {
    if (!sessionModal.name.trim()) { toast.error("Введите название типа"); return; }
    const entry = { name: sessionModal.name, color: sessionModal.color, minDuration: Number(sessionModal.minDuration) || 30, price: Number(sessionModal.price) || 0 };
    if (sessionModal.id) {
      setSessionTypes((ss) => ss.map((s) => s.id === sessionModal.id ? { ...s, ...entry } : s));
      toast.success("Тип обновлён");
    } else {
      setSessionTypes((ss) => [...ss, { id: Date.now(), ...entry }]);
      toast.success("Тип добавлен");
    }
    setSessionModal((s) => ({ ...s, open: false }));
  };

  const handlePkgSave = () => {
    if (!pkgModal.name.trim()) { toast.error("Введите название пакета"); return; }
    const entry = { name: pkgModal.name, description: pkgModal.description || "", zoneIds: pkgModal.zoneIds, maxGuests: Number(pkgModal.maxGuests) || 10, price: Number(pkgModal.price) || 0 };
    if (pkgModal.id) {
      setPackages((ps) => ps.map((p) => p.id === pkgModal.id ? { ...p, ...entry } : p));
      toast.success("Пакет обновлён");
    } else {
      setPackages((ps) => [...ps, { id: Date.now(), ...entry }]);
      toast.success("Пакет добавлен");
    }
    setPkgModal((p) => ({ ...p, open: false }));
  };

  const toggleZoneInPkg = (zoneId: number) => {
    setPkgModal((p) => ({
      ...p,
      zoneIds: p.zoneIds.includes(zoneId)
        ? p.zoneIds.filter((id) => id !== zoneId)
        : [...p.zoneIds, zoneId],
    }));
  };

  return (
    <div className="flex flex-col h-full z-10">
      <header className="h-14 border-b border-border/50 flex items-center px-4 md:px-6 bg-card/50 backdrop-blur-sm shrink-0">
        <h1 className="text-lg font-bold font-mono">Настройки</h1>
      </header>

      <div className="flex-1 p-4 md:p-6 overflow-auto pb-20 md:pb-6">
        <Tabs defaultValue="zones" className="w-full max-w-4xl">
          <TabsList className="mb-4 bg-muted/30 border border-border/50 h-9 flex-wrap gap-1">
            <TabsTrigger value="zones" className="text-xs">Зоны</TabsTrigger>
            <TabsTrigger value="sessions" className="text-xs">Типы сеансов</TabsTrigger>
            <TabsTrigger value="packages" className="text-xs">Пакеты</TabsTrigger>
            <TabsTrigger value="users" className="text-xs">Пользователи</TabsTrigger>
            <TabsTrigger value="sms" className="text-xs">SMS</TabsTrigger>
            <TabsTrigger value="salary" className="text-xs">Зарплата</TabsTrigger>
            <TabsTrigger value="system" className="text-xs">Система</TabsTrigger>
            <TabsTrigger value="channels" className="text-xs flex items-center gap-1"><MessageSquare className="w-3 h-3" /> Каналы</TabsTrigger>
            <TabsTrigger value="payments" className="text-xs flex items-center gap-1"><CreditCard className="w-3 h-3" /> Оплаты</TabsTrigger>
            <TabsTrigger value="tariff" className="text-xs flex items-center gap-1"><Star className="w-3 h-3" /> Тариф</TabsTrigger>
          </TabsList>

          {/* Zones tab */}
          <TabsContent value="zones" className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-base font-semibold">Зоны парка</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Управляйте VR-зонами и игровыми пространствами.</p>
              </div>
              <Button
                size="sm" className="h-8 gap-1.5 text-xs"
                onClick={() => setZoneModal({ open: true, name: "", color: "#6366f1", capacity: "10", openTime: "10:00", closeTime: "22:00" })}
              >
                <Plus className="w-3.5 h-3.5" /> Добавить зону
              </Button>
            </div>

            <div className="grid gap-2">
              {isLoadingZones ? (
                <div className="flex items-center justify-center h-20">
                  <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                </div>
              ) : zones.map((zone) => (
                <Card key={zone.id} className="bg-card/30 border-border/50">
                  <CardHeader className="py-3 px-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: zone.color }} />
                        <div>
                          <CardTitle className="text-sm">{zone.name}</CardTitle>
                          <CardDescription className="text-xs">Вместимость: {zone.capacity} чел. · {zone.openTime || "10:00"}–{zone.closeTime || "22:00"}</CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        <Button variant="ghost" size="icon" className="h-7 w-7"
                          onClick={() => setZoneModal({ open: true, id: zone.id, name: zone.name, color: zone.color, capacity: String(zone.capacity), openTime: zone.openTime || "10:00", closeTime: zone.closeTime || "22:00" })}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => { if (confirm("Удалить зону?")) { setZones((zs) => zs.filter((z) => z.id !== zone.id)); toast.success("Зона удалена"); } }}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Session types tab */}
          <TabsContent value="sessions" className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-base font-semibold">Типы сеансов</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Настройте виды и продолжительность игровых сеансов.</p>
              </div>
              <Button
                size="sm" className="h-8 gap-1.5 text-xs"
                onClick={() => setSessionModal({ open: true, name: "", color: "#8b5cf6", minDuration: "30", price: "" })}
              >
                <Plus className="w-3.5 h-3.5" /> Добавить тип
              </Button>
            </div>

            <div className="grid gap-2">
              {isLoadingSessionTypes ? (
                <div className="flex items-center justify-center h-20">
                  <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                </div>
              ) : sessionTypes.map((st) => (
                <Card key={st.id} className="bg-card/30 border-border/50">
                  <CardHeader className="py-3 px-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: st.color }} />
                        <div>
                          <CardTitle className="text-sm">{st.name}</CardTitle>
                          <CardDescription className="text-xs flex items-center gap-2">
                            <Clock className="w-3 h-3" /> Мин. {st.minDuration} мин
                            {(st as any).price ? <span className="text-green-500 font-semibold">{(st as any).price.toLocaleString("ru")} ₽</span> : null}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        <Button variant="ghost" size="icon" className="h-7 w-7"
                          onClick={() => setSessionModal({ open: true, id: st.id, name: st.name, color: st.color, minDuration: String(st.minDuration), price: String((st as any).price || "") })}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => { if (confirm("Удалить тип сеанса?")) { setSessionTypes((ss) => ss.filter((s) => s.id !== st.id)); toast.success("Тип удалён"); } }}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>

            {/* Zone distribution matrix */}
            <Card className="bg-card/30 border-border/50">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm flex items-center gap-2"><Layers className="w-4 h-4" /> Распределение по зонам</CardTitle>
                <CardDescription className="text-xs">Выберите, в каких зонах доступен каждый тип сеанса. Виджет бронирования автоматически покажет только подходящие варианты.</CardDescription>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                {sessionTypes.length === 0 || zones.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Добавьте зоны и типы сеансов для настройки распределения.</p>
                ) : (
                  <div className="space-y-3">
                    {sessionTypes.map(st => {
                      const assignedZoneIds = zones.filter(z => (settingsConstructorMeta[String(z.id)]?.sessionTypeIds ?? []).includes(st.id)).map(z => z.id);
                      return (
                        <div key={st.id} className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: st.color }} />
                            <span className="text-xs font-medium">{st.name}</span>
                            {assignedZoneIds.length === 0 && <span className="text-[10px] text-muted-foreground/60 ml-auto">все зоны</span>}
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {zones.map(zone => {
                              const assigned = assignedZoneIds.includes(zone.id);
                              return (
                                <button
                                  key={zone.id}
                                  onClick={() => {
                                    const zoneKey = String(zone.id);
                                    const current = settingsConstructorMeta[zoneKey]?.sessionTypeIds ?? [];
                                    const updated = assigned
                                      ? current.filter(id => id !== st.id)
                                      : [...current, st.id];
                                    setSettingsConstructorMeta(prev => ({
                                      ...prev,
                                      [zoneKey]: { ...(prev[zoneKey] ?? {}), sessionTypeIds: updated },
                                    }));
                                    toast.success(assigned ? `Убрано из ${zone.name}` : `Добавлено в ${zone.name}`);
                                  }}
                                  className={cn(
                                    "flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] font-medium transition-all",
                                    assigned
                                      ? "border-primary/50 bg-primary/10 text-primary"
                                      : "border-border/50 bg-card/20 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                                  )}
                                >
                                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: zone.color }} />
                                  {zone.name}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                    <p className="text-[10px] text-muted-foreground pt-1">Если зона не выбрана — тип доступен во всех зонах.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Packages tab */}
          <TabsContent value="packages" className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-base font-semibold">Пакеты мероприятий</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Создайте пакеты для дней рождений, турниров и других событий. Пакет определяет зоны и максимальное число гостей.
                </p>
              </div>
              <Button
                size="sm" className="h-8 gap-1.5 text-xs"
                onClick={() => setPkgModal({ open: true, name: "", description: "", maxGuests: "10", zoneIds: [], price: "" })}
              >
                <Plus className="w-3.5 h-3.5" /> Добавить пакет
              </Button>
            </div>

            <div className="grid gap-3">
              {isLoadingPackages ? (
                <div className="flex items-center justify-center h-20">
                  <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                </div>
              ) : packages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 border border-dashed border-border/50 rounded-xl text-muted-foreground">
                  <Package className="w-8 h-8 mb-2 opacity-40" />
                  <p className="text-sm">Пакеты не созданы</p>
                  <p className="text-xs mt-0.5 opacity-70">Нажмите «Добавить пакет» чтобы начать</p>
                </div>
              ) : packages.map((pkg) => {
                const pkgZones = (pkg.zoneIds as number[]).map((id) => zones.find((z) => z.id === id)).filter(Boolean);
                return (
                  <Card key={pkg.id} className="bg-card/30 border-border/50">
                    <CardHeader className="py-3 px-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center shrink-0 mt-0.5">
                            <Package className="w-4 h-4 text-blue-400" />
                          </div>
                          <div className="min-w-0">
                            <CardTitle className="text-sm">{pkg.name}</CardTitle>
                            {pkg.description && (
                              <CardDescription className="text-xs mt-0.5">{pkg.description}</CardDescription>
                            )}
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              <span className="flex items-center gap-1 text-[10px] bg-muted/40 px-2 py-0.5 rounded-full text-muted-foreground">
                                <Users className="w-2.5 h-2.5" />
                                Макс. {pkg.maxGuests} гост.
                              </span>
                              {pkgZones.map((z) => z && (
                                <span
                                  key={z.id}
                                  className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                                  style={{ backgroundColor: z.color + "20", color: z.color }}
                                >
                                  {z.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <Button
                            variant="ghost" size="icon" className="h-7 w-7"
                            onClick={() => setPkgModal({
                              open: true,
                              id: pkg.id,
                              name: pkg.name,
                              description: pkg.description || "",
                              maxGuests: pkg.maxGuests.toString(),
                              zoneIds: pkg.zoneIds as number[],
                              price: String((pkg as any).price || ""),
                            })}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => { if (confirm("Удалить пакет?")) { setPackages((ps) => ps.filter((p) => p.id !== pkg.id)); toast.success("Пакет удалён"); } }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Users tab */}
          <TabsContent value="users" className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-base font-semibold">Пользователи и роли</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Управляйте доступом сотрудников к CRM.</p>
              </div>
              <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={() => setUserModal({ open: true, name: "", email: "", password: "", role: "Operator" })}>
                <UserPlus className="w-3.5 h-3.5" /> Добавить
              </Button>
            </div>

            <div className="grid gap-2">
              {users.map((user) => (
                <Card key={user.id} className="bg-card/30 border-border/50">
                  <CardContent className="py-3 px-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                          {user.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{user.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="outline" className="text-[10px]">{user.role}</Badge>
                        <Badge variant={user.status === "active" ? "default" : "secondary"} className="text-[10px]">
                          {user.status === "active" ? "Активен" : "Неактивен"}
                        </Badge>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setUsers(us => us.filter(u => u.id !== user.id))}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-card/30 border-border/50">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm flex items-center gap-2"><Shield className="w-4 h-4" /> Права доступа по ролям</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-3">
                <div className="flex gap-2 flex-wrap mb-2">
                  {ROLES.map((r) => (
                    <button key={r} onClick={() => setSelectedRole(r)} className={cn("text-xs px-2.5 py-1 rounded-md border transition-colors", selectedRole === r ? "bg-primary text-primary-foreground border-primary" : "border-border/50 text-muted-foreground hover:bg-muted/30")}>
                      {r}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { key: "finances", label: "Финансы", desc: "Доступ к финансам и выручке" },
                    { key: "devices", label: "Устройства", desc: "Управление устройствами" },
                    { key: "analytics", label: "Аналитика", desc: "Просмотр отчётов и данных" },
                    { key: "bookings", label: "Бронирования", desc: "Создание и изменение броней" },
                    { key: "settings", label: "Настройки", desc: "Доступ к настройкам CRM" },
                  ].map((perm) => {
                    const has = rolePermissions[selectedRole]?.[perm.key] ?? false;
                    return (
                      <div key={perm.key} className={cn("flex items-center justify-between p-2.5 rounded-lg border text-xs gap-3", has ? "border-green-500/30 bg-green-500/5" : "border-border/50 bg-card/20")}>
                        <div className="min-w-0">
                          <p className={cn("font-medium", has ? "text-green-400" : "text-foreground")}>{perm.label}</p>
                          <p className="text-[10px] text-muted-foreground/60 truncate">{perm.desc}</p>
                        </div>
                        <Switch
                          checked={has}
                          onCheckedChange={val => setRolePermissions(prev => ({
                            ...prev,
                            [selectedRole]: { ...(prev[selectedRole] ?? {}), [perm.key]: val }
                          }))}
                        />
                      </div>
                    );
                  })}
                </div>
                <Button size="sm" className="h-7 text-xs w-full mt-1" variant="outline" onClick={() => { setPermSaved(true); toast.success("Права сохранены"); setTimeout(() => setPermSaved(false), 2000); }}>
                  {permSaved ? <><CheckCircle2 className="w-3 h-3 mr-1.5" />Сохранено</>  : "Сохранить права доступа"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SMS tab */}
          <TabsContent value="sms" className="space-y-4">
            <div>
              <h2 className="text-base font-semibold">SMS подтверждение</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Настройте отправку SMS при бронировании.</p>
            </div>

            <Card className="bg-card/30 border-border/50">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Провайдер SMS</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  {["smsru", "turbosms", "twilio"].map((p) => (
                    <button key={p} onClick={() => setSmsProvider(p)} className={cn("p-3 rounded-xl border text-xs font-medium transition-all capitalize", smsProvider === p ? "border-primary bg-primary/10 text-primary" : "border-border/50 bg-card/20 text-muted-foreground hover:bg-muted/20")}>
                      {p === "smsru" ? "SMS.ru" : p === "turbosms" ? "TurboSMS" : "Twilio"}
                    </button>
                  ))}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">API ключ</Label>
                  <Input className="h-8 text-sm font-mono" type="password" placeholder="Введите API ключ..." value={smsApiKey} onChange={(e) => setSmsApiKey(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">SMS-подтверждение при бронировании</Label>
                    <Switch checked={smsSendConfirm} onCheckedChange={setSmsSendConfirm} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Напоминание о сеансе</Label>
                    <Switch checked={smsSendReminder} onCheckedChange={setSmsSendReminder} />
                  </div>
                </div>
                <Button className="w-full h-8 text-xs" onClick={() => { setSmsSaved(true); toast.success("SMS настройки сохранены"); setTimeout(() => setSmsSaved(false), 2000); }}>
                  {smsSaved ? "Сохранено!" : "Сохранить настройки"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Salary tab */}
          <TabsContent value="salary" className="space-y-4">
            <div>
              <h2 className="text-base font-semibold">Подсчёт зарплаты</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Настройте режим расчёта зарплаты сотрудников.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {([
                { mode: "fixed", label: "Фиксированная", sub: "₽ / смена" },
                { mode: "hourly", label: "Почасовая", sub: "₽ / час" },
                { mode: "percent", label: "Процент", sub: "% от выручки" },
                { mode: "mixed", label: "Смешанная", sub: "ставка + %" },
              ] as const).map((m) => (
                <button key={m.mode} onClick={() => setSalaryMode(m.mode)} className={cn("p-3 rounded-xl border text-left transition-all", salaryMode === m.mode ? "border-primary bg-primary/10" : "border-border/50 bg-card/20 hover:bg-muted/20")}>
                  <p className={cn("text-xs font-semibold", salaryMode === m.mode ? "text-primary" : "text-foreground")}>{m.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{m.sub}</p>
                </button>
              ))}
            </div>

            <Card className="bg-card/30 border-border/50">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm flex items-center gap-2"><DollarSign className="w-4 h-4" /> Параметры расчёта</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-3">
                {salaryMode === "fixed" && (
                  <div className="space-y-1.5">
                    <Label className="text-xs">Ставка за смену (₽)</Label>
                    <Input className="h-8 text-sm" type="number" value={salaryFixed} onChange={(e) => setSalaryFixed(e.target.value)} />
                    <p className="text-[10px] text-muted-foreground">Пример: {Number(salaryFixed).toLocaleString("ru")} ₽ / смена</p>
                  </div>
                )}
                {salaryMode === "hourly" && (
                  <div className="space-y-1.5">
                    <Label className="text-xs">Ставка в час (₽)</Label>
                    <Input className="h-8 text-sm" type="number" value={salaryHourly} onChange={(e) => setSalaryHourly(e.target.value)} />
                    <p className="text-[10px] text-muted-foreground">Пример: {Number(salaryHourly).toLocaleString("ru")} ₽ / час × 8 = {(Number(salaryHourly) * 8).toLocaleString("ru")} ₽ / смена</p>
                  </div>
                )}
                {salaryMode === "percent" && (
                  <div className="space-y-1.5">
                    <Label className="text-xs">Процент от выручки (%)</Label>
                    <Input className="h-8 text-sm" type="number" value={salaryPercent} onChange={(e) => setSalaryPercent(e.target.value)} />
                    <p className="text-[10px] text-muted-foreground">Пример: {salaryPercent}% от 72 000 ₽ = {(72000 * Number(salaryPercent) / 100).toLocaleString("ru")} ₽</p>
                  </div>
                )}
                {salaryMode === "mixed" && (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Фиксированная часть (₽ / смена)</Label>
                      <Input className="h-8 text-sm" type="number" value={salaryMixedFixed} onChange={(e) => setSalaryMixedFixed(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Процент от выручки (%)</Label>
                      <Input className="h-8 text-sm" type="number" value={salaryMixedPercent} onChange={(e) => setSalaryMixedPercent(e.target.value)} />
                    </div>
                    <p className="text-[10px] text-muted-foreground">Пример: {Number(salaryMixedFixed).toLocaleString("ru")} ₽ + {salaryMixedPercent}% от 72 000 ₽ = {(Number(salaryMixedFixed) + 72000 * Number(salaryMixedPercent) / 100).toLocaleString("ru")} ₽</p>
                  </div>
                )}
                <Button className="w-full h-8 text-xs" onClick={() => toast.success("Настройки зарплаты сохранены")}>
                  Сохранить
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System tab */}
          <TabsContent value="system">
            <Card className="bg-card/30 border-border/50">
              <CardHeader>
                <CardTitle className="text-base">Системные настройки</CardTitle>
                <CardDescription>Общая конфигурация парка.</CardDescription>
              </CardHeader>
              <div className="px-6 pb-6">
                <p className="text-sm text-muted-foreground">Рабочие часы и глобальные настройки — скоро.</p>
              </div>
            </Card>
          </TabsContent>

          {/* Channels tab */}
          <TabsContent value="channels" className="space-y-5">
            {/* Provider cards */}
            <div>
              <h2 className="text-sm font-semibold mb-1">Мессенджеры и каналы</h2>
              <p className="text-xs text-muted-foreground mb-4">Подключите мессенджеры для единого Inbox</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: "telegram",  label: "Telegram",   icon: "TG", color: "text-sky-400 bg-sky-500/10 border-sky-500/20",      desc: "Бот через token + webhook", fields: ["Bot Token", "Webhook URL"] },
                  { id: "whatsapp",  label: "WhatsApp",   icon: "WA", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", desc: "Meta Cloud API — номер + токен", fields: ["Phone ID", "Access Token"] },
                  { id: "instagram", label: "Instagram",  icon: "IG", color: "text-pink-400 bg-pink-500/10 border-pink-500/20",    desc: "Business account + Meta разрешения", fields: ["App ID", "Access Token"] },
                  { id: "viber",     label: "Viber",      icon: "VI", color: "text-violet-400 bg-violet-500/10 border-violet-500/20", desc: "API ключ + webhook", fields: ["API Key", "Webhook URL"] },
                  { id: "max",       label: "MAX",        icon: "MX", color: "text-orange-400 bg-orange-500/10 border-orange-500/20", desc: "Маркетплейс МТС — ключ + webhook", fields: ["API Key", "Webhook URL"] },
                  { id: "webchat",   label: "Web Chat",   icon: "WC", color: "text-blue-400 bg-blue-500/10 border-blue-500/20",    desc: "Встраиваемый виджет на сайт", fields: ["Widget ID", "Domain"] },
                ].map(ch => {
                  const connected = channelSettings.connected.includes(ch.id);
                  const expanded = channelOpen === ch.id;
                  return (
                    <div key={ch.id} className={cn("rounded-xl border transition-all", connected ? "border-emerald-500/30 bg-emerald-500/5" : "border-border/50 bg-card/20")}>
                      <div className="flex items-center gap-3 p-3">
                        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs border shrink-0", ch.color)}>{ch.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold">{ch.label}</p>
                            {connected && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">подключено</span>}
                          </div>
                          <p className="text-[10px] text-muted-foreground">{ch.desc}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {connected && (
                            <button onClick={() => setChannelOpen(expanded ? null : ch.id)} className="text-[10px] px-2 py-1 rounded-lg border border-border/50 hover:bg-muted/20 text-muted-foreground">
                              {expanded ? "Скрыть" : "Настройки"}
                            </button>
                          )}
                          <Switch checked={connected} onCheckedChange={() => setChannelSettings(s => ({
                            ...s,
                            connected: s.connected.includes(ch.id) ? s.connected.filter(x => x !== ch.id) : [...s.connected, ch.id],
                          }))} />
                        </div>
                      </div>
                      {expanded && connected && (
                        <div className="border-t border-border/30 p-3 space-y-2">
                          {ch.fields.map(f => (
                            <div key={f} className="space-y-1">
                              <Label className="text-[10px]">{f}</Label>
                              <Input className="h-7 text-xs font-mono" placeholder={f === "Bot Token" ? "123456:AABBCCddee..." : f === "Access Token" ? "EAABsbCs..." : "..."} />
                            </div>
                          ))}
                          <Button size="sm" className="h-7 text-xs w-full" onClick={() => toast.success(`${ch.label} — подключение проверено ✓`)}>
                            Тест подключения
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Routing rules */}
            <Card className="bg-card/30 border-border/50">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm flex items-center gap-2"><Zap className="w-4 h-4" /> Маршрутизация диалогов</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-2">
                {[
                  { channel: "Instagram", manager: "Менеджер 1" },
                  { channel: "WhatsApp",  manager: "Менеджер 2" },
                  { channel: "Telegram",  manager: "Общий чат" },
                ].map((r, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg border border-border/40 bg-card/20">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-semibold">{r.channel}</span>
                        <span className="text-muted-foreground">→</span>
                        <span className="text-primary font-medium">{r.manager}</span>
                      </div>
                    </div>
                    <button className="text-muted-foreground hover:text-foreground"><Pencil className="w-3 h-3" /></button>
                    <button className="text-muted-foreground hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
                  </div>
                ))}
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1 mt-1">
                  <Plus className="w-3 h-3" /> Добавить правило
                </Button>
              </CardContent>
            </Card>

            {/* Auto-rules */}
            <Card className="bg-card/30 border-border/50">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm flex items-center gap-2"><Bot className="w-4 h-4 text-violet-400" /> Автоматические правила</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-2">
                {[
                  { trigger: "Сообщение содержит «цена»", action: "Тег «горячий лид»", active: true },
                  { trigger: "Нет ответа 10 минут", action: "Уведомить администратора", active: true },
                  { trigger: "Ночное время (22:00–9:00)", action: "Автоответ с графиком работы", active: false },
                  { trigger: "Новый диалог", action: "Приветственное сообщение", active: true },
                ].map((rule, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg border border-border/40 bg-card/20">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{rule.trigger}</p>
                      <p className="text-[10px] text-muted-foreground">→ {rule.action}</p>
                    </div>
                    <Switch checked={rule.active} onCheckedChange={() => {}} />
                  </div>
                ))}
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1 mt-1">
                  <Plus className="w-3 h-3" /> Добавить правило
                </Button>
              </CardContent>
            </Card>

            {/* Templates */}
            <Card className="bg-card/30 border-border/50">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm">Шаблоны сообщений</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-2">
                {[
                  { name: "Приветствие", text: "Здравствуйте! Добро пожаловать в VR Park 🎮 Чем могу помочь?" },
                  { name: "Прайс", text: "Наши тарифы: 30 мин — 1200₽/чел, 60 мин — 2000₽/чел, VIP 90 мин — 3500₽/чел." },
                  { name: "Бронирование", text: "Для бронирования укажите дату, время и количество гостей." },
                  { name: "Акция", text: "🎉 Скидка 15% в будни с 10:00 до 14:00 — только по предоплате онлайн!" },
                  { name: "FAQ — возраст", text: "Минимальный возраст для VR — 7 лет. Дети до 14 лет — только с родителями." },
                ].map((t, i) => (
                  <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg border border-border/40 bg-card/20">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-primary">{t.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{t.text}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button className="text-muted-foreground hover:text-foreground"><Pencil className="w-3 h-3" /></button>
                      <button className="text-muted-foreground hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  </div>
                ))}
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1 mt-1">
                  <Plus className="w-3 h-3" /> Добавить шаблон
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments tab */}
          <TabsContent value="payments" className="space-y-4">
            <div>
              <h2 className="text-sm font-semibold mb-1">Платёжные системы</h2>
              <p className="text-xs text-muted-foreground mb-4">Подключите провайдера для приёма онлайн-оплат и генерации ссылок</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: "yukassa", name: "ЮKassa", desc: "Российский лидер онлайн-платежей", icon: "Ю", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
                  { id: "stripe", name: "Stripe", desc: "Международные платежи, карты Visa/MC", icon: "S", color: "text-violet-400 bg-violet-500/10 border-violet-500/20" },
                  { id: "tbank", name: "Т-Банк", desc: "Платежи через Тинькофф", icon: "Т", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
                  { id: "sber", name: "СберПей", desc: "Сбербанк онлайн-оплата", icon: "С", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
                  { id: "cloud", name: "CloudPayments", desc: "Подписки и эквайринг", icon: "C", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
                  { id: "robokassa", name: "Robokassa", desc: "Гибкий эквайринг для бизнеса", icon: "R", color: "text-pink-400 bg-pink-500/10 border-pink-500/20" },
                ].map(p => {
                  const connected = paySettings.connectedProviders.includes(p.id);
                  const isMain = paySettings.activeProvider === p.id;
                  const expanded = openProvider === p.id;
                  return (
                    <div key={p.id} className={cn("rounded-xl border transition-all", connected ? "border-emerald-500/30 bg-emerald-500/5" : "border-border/50 bg-card/20")}>
                      <div className="flex items-center gap-3 p-3">
                        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm border shrink-0", p.color)}>
                          {p.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold">{p.name}</p>
                            {connected && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">подключено</span>}
                            {isMain && connected && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/20">основной</span>}
                          </div>
                          <p className="text-[10px] text-muted-foreground">{p.desc}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {connected && (
                            <button onClick={() => setOpenProvider(expanded ? null : p.id)} className="text-[10px] px-2 py-1 rounded-lg border border-border/50 hover:bg-muted/20 text-muted-foreground">
                              {expanded ? "Свернуть" : "Ключи"}
                            </button>
                          )}
                          <Switch checked={connected} onCheckedChange={() => setPaySettings(s => ({
                            ...s,
                            connectedProviders: s.connectedProviders.includes(p.id)
                              ? s.connectedProviders.filter(x => x !== p.id)
                              : [...s.connectedProviders, p.id],
                          }))} />
                        </div>
                      </div>
                      {expanded && connected && (
                        <div className="border-t border-border/30 p-3 space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <Label className="text-[10px]">API Key</Label>
                              <Input className="h-7 text-xs font-mono" placeholder="sk_live_..." value={payApiKeys[p.id]?.key ?? ""} onChange={e => setPayApiKeys(k => ({ ...k, [p.id]: { ...k[p.id], key: e.target.value } }))} />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[10px]">Secret Key</Label>
                              <Input className="h-7 text-xs font-mono" type="password" placeholder="••••••••" value={payApiKeys[p.id]?.secret ?? ""} onChange={e => setPayApiKeys(k => ({ ...k, [p.id]: { ...k[p.id], secret: e.target.value } }))} />
                            </div>
                            <div className="space-y-1 col-span-2">
                              <Label className="text-[10px]">Merchant ID</Label>
                              <Input className="h-7 text-xs font-mono" placeholder="merchant_12345" value={payApiKeys[p.id]?.merchant ?? ""} onChange={e => setPayApiKeys(k => ({ ...k, [p.id]: { ...k[p.id], merchant: e.target.value } }))} />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" className="h-7 text-xs flex-1" onClick={() => toast.success(`${p.name} — подключение проверено`)}>Тест подключения</Button>
                            {!isMain && <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setPaySettings(s => ({ ...s, activeProvider: p.id }))}>Основной</Button>}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <Card className="bg-card/30 border-border/50">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm">Параметры оплаты</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Предоплата по умолчанию (%)</Label>
                    <div className="flex items-center gap-2">
                      <input type="range" min="10" max="100" step="5" value={paySettings.prepayPercent}
                        onChange={e => setPaySettings(s => ({ ...s, prepayPercent: Number(e.target.value) }))}
                        className="flex-1 accent-primary h-1.5" />
                      <span className="text-sm font-bold w-10 text-right tabular-nums">{paySettings.prepayPercent}%</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Срок действия ссылки (ч.)</Label>
                    <div className="flex items-center gap-2">
                      <input type="range" min="1" max="72" step="1" value={paySettings.linkExpiryHours}
                        onChange={e => setPaySettings(s => ({ ...s, linkExpiryHours: Number(e.target.value) }))}
                        className="flex-1 accent-primary h-1.5" />
                      <span className="text-sm font-bold w-10 text-right tabular-nums">{paySettings.linkExpiryHours}ч</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card/20">
                  <div>
                    <p className="text-xs font-medium">Автоотмена брони</p>
                    <p className="text-[10px] text-muted-foreground">Отменять бронь если оплата не поступила через {paySettings.autoCancelHours || 48}ч</p>
                  </div>
                  <Switch checked={paySettings.autoCancelHours > 0} onCheckedChange={v => setPaySettings(s => ({ ...s, autoCancelHours: v ? 48 : 0 }))} />
                </div>
                <Button className="w-full h-8 text-xs" onClick={() => toast.success("Настройки оплаты сохранены")}>
                  Сохранить настройки
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tariff constructor tab */}
          <TabsContent value="tariff" className="space-y-5">
            {(() => {
              const plan = TARIFF_PLANS.find(p => p.id === tariff.plan) ?? TARIFF_PLANS[1];
              const totalObjects = plan.baseObjects + tariff.extraObjects;
              const totalEmployees = plan.baseEmployees + tariff.extraEmployees;
              const objCost = calcObjectCost(tariff.extraObjects);
              const empCost = calcEmployeeCost(tariff.extraEmployees);
              const moduleCost = MODULES_LIST.reduce((sum, m) => {
                if (!(tariff.modules ?? []).includes(m.id)) return sum;
                if (m.fixed) return sum + ((m as any).price ?? 0);
                return sum + m.pricePerObj * totalObjects;
              }, 0);
              const total = plan.price + objCost + empCost + moduleCost;

              const toggleModule = (id: string) => {
                setTariff(t => ({
                  ...t,
                  modules: t.modules.includes(id) ? t.modules.filter(x => x !== id) : [...t.modules, id],
                }));
              };
              const changeExtra = (field: "extraObjects" | "extraEmployees", delta: number) => {
                setTariff(t => ({ ...t, [field]: Math.max(0, t[field] + delta) }));
              };

              return (
                <>
                  {/* Step 1: Plan selection */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] flex items-center justify-center font-bold">1</span>
                      Базовая подписка
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {TARIFF_PLANS.map(p => {
                        const active = tariff.plan === p.id;
                        return (
                          <button
                            key={p.id}
                            onClick={() => setTariff(t => ({ ...t, plan: p.id as any, extraObjects: 0, extraEmployees: 0 }))}
                            className={cn("relative rounded-xl border p-4 text-left transition-all", active ? p.activeColor : "border-border/50 bg-card/20 hover:border-border")}
                          >
                            {(p as any).badge && (
                              <span className="absolute -top-2 left-3 px-2 py-0.5 rounded-full bg-indigo-600 text-[10px] font-bold text-white">{(p as any).badge}</span>
                            )}
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <span className="text-base">{p.emoji}</span>
                              <span className={cn("text-xs font-bold uppercase tracking-widest", active ? "text-foreground" : "text-muted-foreground")}>{p.name}</span>
                            </div>
                            <div className="flex items-end gap-1 mb-2">
                              <span className="text-2xl font-black">{p.price.toLocaleString("ru")}</span>
                              <span className="text-xs text-muted-foreground mb-0.5">₽ / мес</span>
                            </div>
                            <ul className="space-y-1">
                              {p.features.map(f => (
                                <li key={f} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                  <CheckCircle2 className={cn("w-3 h-3 shrink-0", active ? "text-emerald-400" : "text-muted-foreground/40")} />
                                  {f}
                                </li>
                              ))}
                            </ul>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 2: Objects and Employees */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] flex items-center justify-center font-bold">2</span>
                      Конструктор ресурсов
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Objects */}
                      <div className="rounded-xl border border-border/50 bg-card/20 p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Building2 className="w-4 h-4 text-blue-400" />
                          <div>
                            <p className="text-sm font-semibold">Объекты</p>
                            <p className="text-[10px] text-muted-foreground">VR-клубы / залы</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs text-muted-foreground">Включено в тариф: <strong className="text-foreground">{plan.baseObjects}</strong></span>
                          <div className="flex items-center gap-2">
                            <button onClick={() => changeExtra("extraObjects", -1)} disabled={tariff.extraObjects === 0}
                              className="w-7 h-7 rounded-lg border border-border/50 bg-muted/20 flex items-center justify-center hover:bg-muted/40 disabled:opacity-30 transition-colors">
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center font-bold text-sm">{totalObjects}</span>
                            <button onClick={() => changeExtra("extraObjects", 1)}
                              className="w-7 h-7 rounded-lg border border-border/50 bg-muted/20 flex items-center justify-center hover:bg-muted/40 transition-colors">
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <div className="text-[10px] text-muted-foreground space-y-0.5 border-t border-border/30 pt-2">
                          <div className="flex justify-between"><span>1–5 доп. объектов</span><span>2 000 ₽ / шт.</span></div>
                          <div className="flex justify-between"><span>6–10 доп. объектов</span><span>1 800 ₽ / шт.</span></div>
                          <div className="flex justify-between"><span>10+ доп. объектов</span><span>1 600 ₽ / шт.</span></div>
                        </div>
                        {tariff.extraObjects > 0 && (
                          <div className="mt-2 flex items-center justify-between text-xs font-semibold">
                            <span className="text-muted-foreground">+{tariff.extraObjects} объектов</span>
                            <span className="text-blue-400">+{objCost.toLocaleString("ru")} ₽</span>
                          </div>
                        )}
                      </div>

                      {/* Employees */}
                      <div className="rounded-xl border border-border/50 bg-card/20 p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Users className="w-4 h-4 text-violet-400" />
                          <div>
                            <p className="text-sm font-semibold">Сотрудники</p>
                            <p className="text-[10px] text-muted-foreground">Операторы и администраторы</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs text-muted-foreground">Включено в тариф: <strong className="text-foreground">{plan.baseEmployees}</strong></span>
                          <div className="flex items-center gap-2">
                            <button onClick={() => changeExtra("extraEmployees", -1)} disabled={tariff.extraEmployees === 0}
                              className="w-7 h-7 rounded-lg border border-border/50 bg-muted/20 flex items-center justify-center hover:bg-muted/40 disabled:opacity-30 transition-colors">
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center font-bold text-sm">{totalEmployees}</span>
                            <button onClick={() => changeExtra("extraEmployees", 1)}
                              className="w-7 h-7 rounded-lg border border-border/50 bg-muted/20 flex items-center justify-center hover:bg-muted/40 transition-colors">
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <div className="text-[10px] text-muted-foreground space-y-0.5 border-t border-border/30 pt-2">
                          <div className="flex justify-between"><span>1–10 доп. сотрудников</span><span>400 ₽ / чел.</span></div>
                          <div className="flex justify-between"><span>11–30 доп. сотрудников</span><span>300 ₽ / чел.</span></div>
                          <div className="flex justify-between"><span>30+ доп. сотрудников</span><span>200 ₽ / чел.</span></div>
                        </div>
                        {tariff.extraEmployees > 0 && (
                          <div className="mt-2 flex items-center justify-between text-xs font-semibold">
                            <span className="text-muted-foreground">+{tariff.extraEmployees} сотрудников</span>
                            <span className="text-violet-400">+{empCost.toLocaleString("ru")} ₽</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Step 3: Modules */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] flex items-center justify-center font-bold">3</span>
                      Дополнительные модули
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {MODULES_LIST.map(mod => {
                        const active = (tariff.modules ?? []).includes(mod.id);
                        const modPrice = mod.fixed
                          ? ((mod as any).price ?? 0)
                          : mod.pricePerObj * totalObjects;
                        return (
                          <button
                            key={mod.id}
                            onClick={() => toggleModule(mod.id)}
                            className={cn(
                              "flex items-start gap-3 p-3 rounded-xl border text-left transition-all",
                              active
                                ? "border-primary/50 bg-primary/8 ring-1 ring-primary/20"
                                : "border-border/50 bg-card/20 hover:border-border"
                            )}
                          >
                            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border transition-colors",
                              active ? "bg-primary/15 border-primary/30" : "bg-muted/20 border-border/40")}>
                              <mod.icon className={cn("w-4 h-4", active ? "text-primary" : "text-muted-foreground")} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <p className={cn("text-xs font-semibold leading-tight", active ? "text-foreground" : "text-muted-foreground")}>{mod.label}</p>
                                <span className={cn("text-[11px] font-bold shrink-0", active ? "text-primary" : "text-muted-foreground/70")}>
                                  {modPrice.toLocaleString("ru")} ₽
                                </span>
                              </div>
                              <p className="text-[10px] text-muted-foreground/70 mt-0.5 leading-tight">{mod.desc}</p>
                              <p className="text-[10px] text-muted-foreground/50 mt-0.5">
                                {mod.fixed ? "фикс." : `${mod.pricePerObj.toLocaleString("ru")} ₽ × ${totalObjects} объект${totalObjects === 1 ? "" : totalObjects < 5 ? "а" : "ов"}`}
                              </p>
                            </div>
                            {active && <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-bold flex items-center gap-2">
                        <Zap className="w-4 h-4 text-primary" /> Итого к оплате
                      </p>
                      <p className="text-xl font-black text-primary">{total.toLocaleString("ru")} ₽<span className="text-xs font-normal text-muted-foreground ml-1">/ мес</span></p>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground border-t border-border/30 pt-3">
                      <div className="flex justify-between"><span>Базовый тариф {plan.name}</span><span className="text-foreground font-medium">{plan.price.toLocaleString("ru")} ₽</span></div>
                      {tariff.extraObjects > 0 && <div className="flex justify-between"><span>+{tariff.extraObjects} объектов</span><span className="text-blue-400 font-medium">+{objCost.toLocaleString("ru")} ₽</span></div>}
                      {tariff.extraEmployees > 0 && <div className="flex justify-between"><span>+{tariff.extraEmployees} сотрудников</span><span className="text-violet-400 font-medium">+{empCost.toLocaleString("ru")} ₽</span></div>}
                      {(tariff.modules ?? []).map(mid => {
                        const m = MODULES_LIST.find(x => x.id === mid);
                        if (!m) return null;
                        const mp = m.fixed ? ((m as any).price ?? 0) : m.pricePerObj * totalObjects;
                        return <div key={mid} className="flex justify-between"><span>{m.label}</span><span className="text-primary/80 font-medium">+{mp.toLocaleString("ru")} ₽</span></div>;
                      })}
                    </div>
                    <Button className="w-full mt-3 h-8 text-xs" onClick={() => toast.success("Тариф сохранён")}>
                      Сохранить тариф
                    </Button>
                  </div>
                </>
              );
            })()}
          </TabsContent>
        </Tabs>
      </div>

      {/* Zone modal */}
      <Dialog open={zoneModal.open} onOpenChange={(o) => setZoneModal((z) => ({ ...z, open: o }))}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{zoneModal.id ? "Редактировать зону" : "Новая зона"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Название</Label>
              <Input className="h-9 text-sm" value={zoneModal.name} onChange={(e) => setZoneModal((z) => ({ ...z, name: e.target.value }))} placeholder="VR Arena" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Цвет</Label>
              <div className="flex gap-2 flex-wrap">
                {ZONE_COLORS.map((c) => (
                  <button key={c} className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${zoneModal.color === c ? "border-white scale-110" : "border-transparent"}`} style={{ backgroundColor: c }} onClick={() => setZoneModal((z) => ({ ...z, color: c }))} />
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Вместимость</Label>
                <Input className="h-9 text-sm" type="number" min="1" value={zoneModal.capacity} onChange={(e) => setZoneModal((z) => ({ ...z, capacity: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Открытие</Label>
                <Input className="h-9 text-xs" type="time" value={zoneModal.openTime} onChange={(e) => setZoneModal((z) => ({ ...z, openTime: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Закрытие</Label>
                <Input className="h-9 text-xs" type="time" value={zoneModal.closeTime} onChange={(e) => setZoneModal((z) => ({ ...z, closeTime: e.target.value }))} />
              </div>
            </div>
            <Button className="w-full" onClick={handleZoneSave}>
              {zoneModal.id ? "Сохранить" : "Добавить зону"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Session modal */}
      <Dialog open={sessionModal.open} onOpenChange={(o) => setSessionModal((s) => ({ ...s, open: o }))}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{sessionModal.id ? "Редактировать тип" : "Новый тип сеанса"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Название</Label>
              <Input className="h-9 text-sm" value={sessionModal.name} onChange={(e) => setSessionModal((s) => ({ ...s, name: e.target.value }))} placeholder="Стандарт" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Цвет</Label>
              <div className="flex gap-2 flex-wrap">
                {ZONE_COLORS.map((c) => (
                  <button key={c} className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${sessionModal.color === c ? "border-white scale-110" : "border-transparent"}`} style={{ backgroundColor: c }} onClick={() => setSessionModal((s) => ({ ...s, color: c }))} />
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Мин. длительность (мин)</Label>
              <Input className="h-9 text-sm" type="number" min="5" value={sessionModal.minDuration} onChange={(e) => setSessionModal((s) => ({ ...s, minDuration: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Стоимость (₽)</Label>
              <Input className="h-9 text-sm" type="number" min="0" placeholder="0" value={sessionModal.price} onChange={(e) => setSessionModal((s) => ({ ...s, price: e.target.value }))} />
            </div>
            <Button className="w-full" onClick={handleSessionSave}>
              {sessionModal.id ? "Сохранить" : "Добавить тип"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Package modal */}
      <Dialog open={pkgModal.open} onOpenChange={(o) => setPkgModal((p) => ({ ...p, open: o }))}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{pkgModal.id ? "Редактировать пакет" : "Новый пакет мероприятия"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Название пакета</Label>
              <Input
                className="h-9 text-sm"
                value={pkgModal.name}
                onChange={(e) => setPkgModal((p) => ({ ...p, name: e.target.value }))}
                placeholder="День рождения VIP"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Описание</Label>
              <Input
                className="h-9 text-sm"
                value={pkgModal.description}
                onChange={(e) => setPkgModal((p) => ({ ...p, description: e.target.value }))}
                placeholder="Включает банкетный зал и VR-арену"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Макс. гостей</Label>
              <Input
                className="h-9 text-sm"
                type="number"
                min="1"
                value={pkgModal.maxGuests}
                onChange={(e) => setPkgModal((p) => ({ ...p, maxGuests: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Зоны пакета</Label>
              <div className="flex flex-wrap gap-2">
                {zones.map((zone) => {
                  const selected = pkgModal.zoneIds.includes(zone.id);
                  return (
                    <button
                      key={zone.id}
                      onClick={() => toggleZoneInPkg(zone.id)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                        selected
                          ? "border-primary bg-primary/15 text-primary"
                          : "border-border/50 bg-muted/20 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: zone.color }}
                      />
                      {zone.name}
                    </button>
                  );
                })}
              </div>
              {pkgModal.zoneIds.length > 0 && (
                <p className="text-[10px] text-muted-foreground">
                  Выбрано: {pkgModal.zoneIds.length} зон
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Стоимость пакета (₽)</Label>
              <Input
                className="h-9 text-sm"
                type="number"
                min="0"
                placeholder="15000"
                value={pkgModal.price}
                onChange={(e) => setPkgModal((p) => ({ ...p, price: e.target.value }))}
              />
            </div>
            <Button className="w-full mt-1" onClick={handlePkgSave}>
              {pkgModal.id ? "Сохранить" : "Создать пакет"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* User modal */}
      <Dialog open={userModal.open} onOpenChange={(o) => setUserModal((u) => ({ ...u, open: o }))}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Добавить пользователя</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Имя</Label>
              <Input className="h-9 text-sm" value={userModal.name} onChange={(e) => setUserModal((u) => ({ ...u, name: e.target.value }))} placeholder="Иван Иванов" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Email</Label>
              <Input className="h-9 text-sm" type="email" value={userModal.email} onChange={(e) => setUserModal((u) => ({ ...u, email: e.target.value }))} placeholder="ivan@vrpark.co" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Пароль</Label>
              <Input className="h-9 text-sm" type="password" value={userModal.password} onChange={(e) => setUserModal((u) => ({ ...u, password: e.target.value }))} placeholder="••••••••" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Роль</Label>
              <Select value={userModal.role} onValueChange={(v) => setUserModal((u) => ({ ...u, role: v }))}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={() => {
              if (!userModal.name.trim() || !userModal.email.trim()) { toast.error("Заполните имя и email"); return; }
              setUsers(us => [...us, { id: Date.now(), name: userModal.name, email: userModal.email, role: userModal.role, status: "active" }]);
              toast.success("Пользователь добавлен");
              setUserModal((u) => ({ ...u, open: false }));
            }}>
              Добавить пользователя
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
