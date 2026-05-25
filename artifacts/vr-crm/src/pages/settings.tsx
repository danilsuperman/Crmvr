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
import { Plus, Pencil, Trash2, Clock, Package, Users, MessageSquare, DollarSign, Shield, UserPlus, CheckCircle2 } from "lucide-react";
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
    { id: 1, name: "Стандарт 30 мин", color: "#6366f1", minDuration: 30 },
    { id: 2, name: "Стандарт 60 мин", color: "#8b5cf6", minDuration: 60 },
    { id: 3, name: "VIP 90 мин", color: "#f59e0b", minDuration: 90 },
    { id: 4, name: "Максимальный 120 мин", color: "#10b981", minDuration: 120 },
  ];
  const MOCK_PACKAGES_DATA = [
    { id: 1, name: "День рождения VIP", description: "Всё включено, до 8 чел.", maxGuests: 8, zoneIds: [1, 3] },
    { id: 2, name: "Корпоратив Standard", description: "Командный тимбилдинг", maxGuests: 20, zoneIds: [1, 2, 4] },
    { id: 3, name: "Full Park", description: "Весь парк в ваше распоряжение", maxGuests: 50, zoneIds: [1, 2, 3, 4, 5, 6] },
  ];

  useListZones();
  const isLoadingZones = false;
  const [zones, setZones] = useLocalStorage("vrpark_zones", MOCK_ZONES_DATA);

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

  // Zone modal
  const [zoneModal, setZoneModal] = useState<{
    open: boolean; id?: number;
    name: string; color: string; capacity: string; openTime: string; closeTime: string;
  }>({ open: false, name: "", color: "#6366f1", capacity: "10", openTime: "10:00", closeTime: "22:00" });

  // Session modal
  const [sessionModal, setSessionModal] = useState<{
    open: boolean; id?: number;
    name: string; color: string; minDuration: string;
  }>({ open: false, name: "", color: "#8b5cf6", minDuration: "30" });

  // Package modal
  const [pkgModal, setPkgModal] = useState<{
    open: boolean; id?: number;
    name: string; description: string; maxGuests: string; zoneIds: number[];
  }>({ open: false, name: "", description: "", maxGuests: "10", zoneIds: [] });

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
    const entry = { name: sessionModal.name, color: sessionModal.color, minDuration: Number(sessionModal.minDuration) || 30 };
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
    const entry = { name: pkgModal.name, description: pkgModal.description || "", zoneIds: pkgModal.zoneIds, maxGuests: Number(pkgModal.maxGuests) || 10 };
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
                onClick={() => setSessionModal({ open: true, name: "", color: "#8b5cf6", minDuration: "30" })}
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
                          <CardDescription className="text-xs flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Мин. {st.minDuration} мин
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        <Button variant="ghost" size="icon" className="h-7 w-7"
                          onClick={() => setSessionModal({ open: true, id: st.id, name: st.name, color: st.color, minDuration: String(st.minDuration) })}>
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
                onClick={() => setPkgModal({ open: true, name: "", description: "", maxGuests: "10", zoneIds: [] })}
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
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { key: "finances", label: "Финансы" },
                    { key: "devices", label: "Устройства" },
                    { key: "analytics", label: "Аналитика" },
                    { key: "bookings", label: "Бронирования" },
                    { key: "settings", label: "Настройки" },
                  ].map((perm) => {
                    const has = ROLE_PERMISSIONS[selectedRole]?.[perm.key] ?? false;
                    return (
                      <div key={perm.key} className={cn("flex items-center gap-2 p-2 rounded-lg border text-xs", has ? "border-green-500/30 bg-green-500/5 text-green-400" : "border-border/50 bg-card/20 text-muted-foreground/50")}>
                        <CheckCircle2 className={cn("w-3.5 h-3.5 shrink-0", has ? "text-green-400" : "text-muted-foreground/30")} />
                        {perm.label}
                      </div>
                    );
                  })}
                </div>
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
