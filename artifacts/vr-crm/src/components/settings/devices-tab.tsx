import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useLocalStorage } from "@/lib/store";
import {
  Plus, Search, Wifi, Battery, Thermometer, Cpu, Clock,
  Gamepad2, Filter, Pencil, Check, ArrowLeft, ArrowRight,
  CheckCircle2, Star, MapPin, Users
} from "lucide-react";
import { toast } from "sonner";

type DeviceStatus = "idle" | "active" | "preparing" | "offline" | "low_battery" | "error";
type Device = { id: string; name: string; zone: string; status: DeviceStatus; battery: number; temp: number; wifi: number; model: string };
type SettingsZone = { id: number; name: string; color: string; capacity: number; openTime: string; closeTime: string };

const MOCK_DEVICES: Device[] = [
  { id: "a1", name: "Headset A-1", zone: "Arena A", status: "active", battery: 78, temp: 42, wifi: 85, model: "Meta Quest 3" },
  { id: "a2", name: "Headset A-2", zone: "Arena A", status: "idle", battery: 95, temp: 38, wifi: 92, model: "Meta Quest 3" },
  { id: "a3", name: "Headset A-3", zone: "Arena A", status: "preparing", battery: 61, temp: 39, wifi: 78, model: "Meta Quest 3" },
  { id: "a4", name: "Headset A-4", zone: "Arena A", status: "offline", battery: 12, temp: 35, wifi: 0, model: "Meta Quest 3" },
  { id: "b1", name: "Headset B-1", zone: "Arena B", status: "active", battery: 55, temp: 44, wifi: 90, model: "Pico 4" },
  { id: "b2", name: "Headset B-2", zone: "Arena B", status: "active", battery: 60, temp: 43, wifi: 88, model: "Pico 4" },
  { id: "b3", name: "Headset B-3", zone: "Arena B", status: "low_battery", battery: 8, temp: 37, wifi: 75, model: "Pico 4" },
  { id: "s1", name: "Solo-1", zone: "VR Solo", status: "active", battery: 82, temp: 41, wifi: 94, model: "Meta Quest Pro" },
  { id: "s2", name: "Solo-2", zone: "VR Solo", status: "idle", battery: 100, temp: 36, wifi: 97, model: "Meta Quest Pro" },
  { id: "r1", name: "Racing-1", zone: "Racing Zone", status: "active", battery: 71, temp: 48, wifi: 82, model: "PS VR2" },
  { id: "r2", name: "Racing-2", zone: "Racing Zone", status: "error", battery: 45, temp: 62, wifi: 40, model: "PS VR2" },
  { id: "p1", name: "PS5-VR2 #1", zone: "PS5", status: "idle", battery: 100, temp: 37, wifi: 99, model: "PS VR2" },
  { id: "p2", name: "PS5-VR2 #2", zone: "PS5", status: "preparing", battery: 88, temp: 39, wifi: 91, model: "PS VR2" },
  { id: "m1", name: "Motion-1", zone: "Motion", status: "active", battery: 66, temp: 45, wifi: 86, model: "Meta Quest 3" },
  { id: "m2", name: "Motion-2", zone: "Motion", status: "idle", battery: 93, temp: 37, wifi: 89, model: "Meta Quest 3" },
];

const MOCK_SESSIONS = [
  { id: "s1", device: "Headset A-1", zone: "Arena A", game: "Beat Saber", start: "14:30", end: null, status: "active", duration: "45 мин" },
  { id: "s2", device: "Headset B-1", zone: "Arena B", game: "Pistol Whip", start: "14:00", end: null, status: "active", duration: "1 ч 15 мин" },
  { id: "s3", device: "Solo-1", zone: "VR Solo", game: "Half-Life: Alyx", start: "13:30", end: null, status: "active", duration: "1 ч 45 мин" },
  { id: "s4", device: "Racing-2", zone: "Racing Zone", game: "GT7 VR", start: "13:00", end: "13:45", status: "error", duration: "45 мин" },
  { id: "s5", device: "Headset A-2", zone: "Arena A", game: "Superhot VR", start: "12:00", end: "12:30", status: "completed", duration: "30 мин" },
  { id: "s6", device: "PS5-VR2 #1", zone: "PS5", game: "Horizon VR", start: "11:00", end: "12:00", status: "completed", duration: "1 ч" },
  { id: "s7", device: "Motion-1", zone: "Motion", game: "Amusement Park", start: "10:00", end: "10:30", status: "completed", duration: "30 мин" },
];

const DEVICE_MODELS = ["Meta Quest 3", "Meta Quest 2", "Meta Quest Pro", "Pico 4", "Pico 4 Enterprise", "Pico Neo 3", "PS VR2", "HTC Vive Focus 3"];

const DEVICE_TYPES = [
  { id: "pico4e", name: "Pico 4 Enterprise", desc: "Корпоративное управление, расширенный MDM", recommended: true, support: "Полная поддержка" },
  { id: "pico4", name: "Pico 4", desc: "Стандартная модель, полная поддержка", recommended: false, support: "Полная поддержка" },
  { id: "mq3", name: "Meta Quest 3", desc: "Частичное управление через MDM", recommended: false, support: "Частичная поддержка" },
  { id: "mq2", name: "Meta Quest 2", desc: "Ограниченная поддержка API Meta", recommended: false, support: "Ограниченная поддержка" },
  { id: "psvr2", name: "PS VR2", desc: "PlayStation VR2, ограниченное MDM", recommended: false, support: "Ограниченная поддержка" },
];

const DEFAULT_SETTINGS_ZONES: SettingsZone[] = [
  { id: 1, name: "Arena A", color: "#6366f1", capacity: 4, openTime: "10:00", closeTime: "22:00" },
  { id: 2, name: "Arena B", color: "#8b5cf6", capacity: 4, openTime: "10:00", closeTime: "22:00" },
  { id: 3, name: "VR Solo", color: "#ec4899", capacity: 1, openTime: "10:00", closeTime: "22:00" },
  { id: 4, name: "Racing Zone", color: "#f59e0b", capacity: 2, openTime: "12:00", closeTime: "22:00" },
  { id: 5, name: "PS5", color: "#3b82f6", capacity: 2, openTime: "10:00", closeTime: "23:00" },
  { id: 6, name: "Motion", color: "#10b981", capacity: 1, openTime: "11:00", closeTime: "21:00" },
];

const statusConfig: Record<DeviceStatus, { label: string; color: string; dot: string }> = {
  idle: { label: "Простой", color: "text-muted-foreground", dot: "bg-muted-foreground/40" },
  active: { label: "Активен", color: "text-green-400", dot: "bg-green-400" },
  preparing: { label: "Подготовка", color: "text-yellow-400", dot: "bg-yellow-400" },
  offline: { label: "Оффлайн", color: "text-muted-foreground/40", dot: "bg-muted-foreground/20" },
  low_battery: { label: "Слабый заряд", color: "text-orange-400", dot: "bg-orange-400" },
  error: { label: "Ошибка", color: "text-red-400", dot: "bg-red-400" },
};

export function DevicesTab() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [devices, setDevices] = useLocalStorage<Device[]>("vrpark_devices", MOCK_DEVICES);
  const [settingsZones] = useLocalStorage<SettingsZone[]>("vrpark_zones", DEFAULT_SETTINGS_ZONES);
  const [editDevice, setEditDevice] = useState<Device | null>(null);
  const [editForm, setEditForm] = useState<Partial<Device>>({});
  const [addOpen, setAddOpen] = useState(false);
  const [addStep, setAddStep] = useState(1);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [deviceName, setDeviceName] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [ipAddress, setIpAddress] = useState("");
  const [selectedZone, setSelectedZone] = useState<string>("none");

  const filtered = devices.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.zone.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || d.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const openEdit = (device: Device, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditDevice(device);
    setEditForm({ name: device.name, zone: device.zone, model: device.model, status: device.status });
  };

  const handleSaveEdit = () => {
    if (!editDevice) return;
    setDevices(ds => ds.map(d => d.id === editDevice.id ? { ...d, ...editForm } as Device : d));
    toast.success("Устройство обновлено");
    setEditDevice(null);
  };

  const openAddWizard = () => {
    setAddStep(1);
    setSelectedType(null);
    setDeviceName("");
    setSerialNumber("");
    setIpAddress("");
    setSelectedZone("none");
    setAddOpen(true);
  };

  const handleFinishAdd = () => {
    const typeDef = DEVICE_TYPES.find(t => t.id === selectedType);
    const newDevice: Device = {
      id: `d_${Date.now()}`,
      name: deviceName || typeDef?.name || "Новое устройство",
      zone: selectedZone === "none" ? (settingsZones[0]?.name ?? "Arena A") : selectedZone,
      status: "offline",
      battery: 100,
      temp: 35,
      wifi: 0,
      model: typeDef?.name ?? "Meta Quest 3",
    };
    setDevices(ds => [...ds, newDevice]);
    toast.success("Устройство зарегистрировано");
    setAddOpen(false);
  };

  const selectedTypeDef = DEVICE_TYPES.find(t => t.id === selectedType);
  const zoneNames = settingsZones.map(z => z.name);

  const STEPS = ["Тип устройства", "Данные", "Сеть и зона", "Готово"];

  return (
    <div className="space-y-4">
      <Tabs defaultValue="devices" className="w-full">
        <TabsList className="mb-4 bg-muted/30 border border-border/50 h-9">
          <TabsTrigger value="devices" className="text-xs">Устройства</TabsTrigger>
          <TabsTrigger value="sessions" className="text-xs">Сессии</TabsTrigger>
          <TabsTrigger value="games" className="text-xs">Игры по зонам</TabsTrigger>
        </TabsList>

        <TabsContent value="devices" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input placeholder="Поиск устройств..." className="pl-8 h-8 text-sm" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="h-8 text-xs w-full sm:w-40">
                <Filter className="w-3 h-3 mr-1.5" /><SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="active">Активные</SelectItem>
                <SelectItem value="idle">Простой</SelectItem>
                <SelectItem value="offline">Оффлайн</SelectItem>
                <SelectItem value="error">Ошибка</SelectItem>
                <SelectItem value="low_battery">Слабый заряд</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" className="h-8 gap-1.5 text-xs shrink-0" onClick={openAddWizard}>
              <Plus className="w-3.5 h-3.5" /> Добавить устройство
            </Button>
          </div>

          <div className="grid gap-2">
            {filtered.map((device) => {
              const sc = statusConfig[device.status];
              return (
                <div key={device.id} className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border transition-colors group",
                  device.status === "error" ? "border-red-500/30 bg-red-500/5" :
                  device.status === "low_battery" ? "border-orange-500/30 bg-orange-500/5" :
                  "border-border/50 bg-card/30"
                )}>
                  <div className={cn("w-2 h-2 rounded-full shrink-0", sc.dot, device.status === "active" && "animate-pulse")} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold truncate">{device.name}</p>
                      <Badge variant="outline" className="text-[10px] shrink-0">{device.zone}</Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{device.model}</p>
                  </div>
                  <div className={cn("text-xs font-medium shrink-0", sc.color)}>{sc.label}</div>
                  <div className="hidden sm:flex items-center gap-3 text-[10px] text-muted-foreground shrink-0">
                    <span className={cn("flex items-center gap-0.5", device.battery < 20 ? "text-red-400" : "")}>
                      <Battery className="w-3 h-3" /> {device.battery}%
                    </span>
                    <span className={cn("flex items-center gap-0.5", device.temp > 55 ? "text-red-400" : "")}>
                      <Thermometer className="w-3 h-3" /> {device.temp}°C
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Wifi className="w-3 h-3" /> {device.wifi}%
                    </span>
                  </div>
                  <Button
                    variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
                    onClick={e => openEdit(device, e)}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                <Cpu className="w-8 h-8 mb-2 opacity-30" />
                <p className="text-sm">Устройства не найдены</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <div className="grid gap-2">
            {(["active", "error", "completed"] as const).map((statusGroup) => {
              const sessions = MOCK_SESSIONS.filter(s => s.status === statusGroup);
              if (!sessions.length) return null;
              const labels: Record<string, string> = { active: "Активные сессии", error: "Проблемные", completed: "Завершённые" };
              return (
                <div key={statusGroup} className="space-y-2">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{labels[statusGroup]}</h3>
                  {sessions.map(s => (
                    <div key={s.id} className={cn("flex items-center gap-3 p-3 rounded-xl border",
                      s.status === "active" ? "border-green-500/30 bg-green-500/5" :
                      s.status === "error" ? "border-red-500/30 bg-red-500/5" :
                      "border-border/50 bg-card/30"
                    )}>
                      <div className={cn("w-2 h-2 rounded-full shrink-0",
                        s.status === "active" ? "bg-green-400 animate-pulse" :
                        s.status === "error" ? "bg-red-400" : "bg-muted-foreground/30"
                      )} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold truncate">{s.device}</p>
                          <Badge variant="outline" className="text-[10px] shrink-0">{s.zone}</Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Gamepad2 className="w-3 h-3" /> {s.game}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-muted-foreground">{s.start}{s.end ? ` — ${s.end}` : " — сейчас"}</p>
                        <p className="text-[10px] flex items-center gap-0.5 justify-end text-muted-foreground">
                          <Clock className="w-3 h-3" /> {s.duration}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="games" className="space-y-4">
          {settingsZones.map(zone => (
            <div key={zone.id} className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: zone.color }} />
                <h3 className="text-sm font-semibold">{zone.name}</h3>
              </div>
              <div className="p-3 rounded-lg border border-dashed border-border/50 text-xs text-muted-foreground text-center">
                Нет игр для этой зоны
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>

      {/* Edit Device Modal */}
      <Dialog open={!!editDevice} onOpenChange={open => !open && setEditDevice(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-4 h-4" /> Редактировать устройство
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Название</Label>
              <Input className="h-9 text-sm" value={editForm.name ?? ""} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Зона</Label>
              <Select value={editForm.zone ?? ""} onValueChange={v => setEditForm(f => ({ ...f, zone: v }))}>
                <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Выберите зону" /></SelectTrigger>
                <SelectContent>
                  {zoneNames.map(z => <SelectItem key={z} value={z}>{z}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Модель</Label>
              <Select value={editForm.model ?? ""} onValueChange={v => setEditForm(f => ({ ...f, model: v }))}>
                <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Модель устройства" /></SelectTrigger>
                <SelectContent>
                  {DEVICE_MODELS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Статус</Label>
              <Select value={editForm.status ?? ""} onValueChange={v => setEditForm(f => ({ ...f, status: v as DeviceStatus }))}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="idle">Простой</SelectItem>
                  <SelectItem value="active">Активен</SelectItem>
                  <SelectItem value="preparing">Подготовка</SelectItem>
                  <SelectItem value="offline">Оффлайн</SelectItem>
                  <SelectItem value="low_battery">Слабый заряд</SelectItem>
                  <SelectItem value="error">Ошибка</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1 h-9 text-sm" onClick={() => setEditDevice(null)}>Отмена</Button>
              <Button className="flex-1 h-9 text-sm gap-1.5" onClick={handleSaveEdit}>
                <Check className="w-3.5 h-3.5" /> Сохранить
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Device Wizard */}
      <Dialog open={addOpen} onOpenChange={open => { if (!open) setAddOpen(false); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Cpu className="w-4 h-4" /> Подключить устройство
            </DialogTitle>
          </DialogHeader>

          {/* Progress bar */}
          <div className="flex items-center gap-1.5 px-1">
            {STEPS.map((label, i) => {
              const n = i + 1;
              return (
                <div key={n} className="flex items-center flex-1">
                  <div className="flex flex-col items-center gap-0.5 flex-1">
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all",
                      addStep > n ? "bg-green-500 border-green-500 text-white" :
                      addStep === n ? "bg-primary border-primary text-primary-foreground" :
                      "bg-transparent border-border/50 text-muted-foreground"
                    )}>
                      {addStep > n ? <Check className="w-3 h-3" /> : n}
                    </div>
                    <span className={cn("text-[9px] text-center hidden sm:block leading-tight",
                      addStep === n ? "text-foreground font-medium" : "text-muted-foreground"
                    )}>{label}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={cn("h-0.5 flex-1 mx-1 rounded-full transition-all mb-3", addStep > n ? "bg-green-500" : "bg-border/50")} />
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-1">
            {/* Step 1: Device Type */}
            {addStep === 1 && (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">Выберите модель VR-шлема</p>
                <div className="grid gap-2 max-h-64 overflow-y-auto pr-1">
                  {DEVICE_TYPES.map(type => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={cn(
                        "w-full text-left p-3 rounded-xl border transition-all hover:border-primary/50",
                        selectedType === type.id ? "border-primary bg-primary/8" : "border-border/50 bg-card/30"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all",
                          selectedType === type.id ? "border-primary bg-primary" : "border-border/50"
                        )}>
                          {selectedType === type.id && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">{type.name}</span>
                            {type.recommended && (
                              <Badge className="text-[9px] h-4 gap-0.5 px-1.5 bg-primary/20 text-primary border-primary/30">
                                <Star className="w-2.5 h-2.5" /> Рек.
                              </Badge>
                            )}
                          </div>
                          <p className={cn("text-[10px] mt-0.5",
                            type.support === "Полная поддержка" ? "text-green-400" :
                            type.support === "Частичная поддержка" ? "text-yellow-400" : "text-red-400"
                          )}>{type.support}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 pt-1">
                  <Button variant="outline" className="flex-1 h-9 text-sm" onClick={() => setAddOpen(false)}>Отмена</Button>
                  <Button className="flex-1 h-9 text-sm gap-1.5" disabled={!selectedType} onClick={() => setAddStep(2)}>
                    Далее <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Device data */}
            {addStep === 2 && (
              <div className="space-y-3">
                {selectedTypeDef && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/5 border border-primary/20">
                    <Cpu className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-medium">{selectedTypeDef.name}</span>
                    <button className="ml-auto text-[10px] text-muted-foreground hover:text-foreground" onClick={() => setAddStep(1)}>Изменить</button>
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label className="text-xs">Название шлема <span className="text-red-400">*</span></Label>
                  <Input className="h-9 text-sm" placeholder="Headset A-5" value={deviceName} onChange={e => setDeviceName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Серийный номер</Label>
                  <Input className="h-9 text-sm font-mono" placeholder="SN-XXXX-XXXXX" value={serialNumber} onChange={e => setSerialNumber(e.target.value)} />
                </div>
                <div className="flex gap-2 pt-1">
                  <Button variant="outline" className="flex-1 h-9 text-sm gap-1.5" onClick={() => setAddStep(1)}>
                    <ArrowLeft className="w-3.5 h-3.5" /> Назад
                  </Button>
                  <Button className="flex-1 h-9 text-sm gap-1.5" disabled={!deviceName.trim()} onClick={() => setAddStep(3)}>
                    Далее <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Network & Zone */}
            {addStep === 3 && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs flex items-center gap-1"><Wifi className="w-3 h-3" /> IP-адрес устройства</Label>
                  <Input className="h-9 text-sm font-mono" placeholder="192.168.1.xxx" value={ipAddress} onChange={e => setIpAddress(e.target.value)} />
                  <p className="text-[10px] text-muted-foreground">Необязательно — можно назначить позже</p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs flex items-center gap-1"><MapPin className="w-3 h-3" /> Зона размещения</Label>
                  <div className="grid gap-1.5 max-h-48 overflow-y-auto pr-1">
                    <button
                      onClick={() => setSelectedZone("none")}
                      className={cn("w-full text-left p-2.5 rounded-lg border transition-all text-xs",
                        selectedZone === "none" ? "border-primary bg-primary/8" : "border-border/50 bg-card/20 hover:border-primary/30"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <div className={cn("w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0",
                          selectedZone === "none" ? "border-primary bg-primary" : "border-border/50"
                        )}>
                          {selectedZone === "none" && <Check className="w-2 h-2 text-primary-foreground" />}
                        </div>
                        <span className="font-medium">Без зоны</span>
                        <span className="text-muted-foreground text-[10px]">назначить позже</span>
                      </div>
                    </button>
                    {settingsZones.map(zone => (
                      <button
                        key={zone.id}
                        onClick={() => setSelectedZone(zone.name)}
                        className={cn("w-full text-left p-2.5 rounded-lg border transition-all text-xs",
                          selectedZone === zone.name ? "border-primary bg-primary/8" : "border-border/50 bg-card/20 hover:border-primary/30"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <div className={cn("w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0",
                            selectedZone === zone.name ? "border-primary bg-primary" : "border-border/50"
                          )}>
                            {selectedZone === zone.name && <Check className="w-2 h-2 text-primary-foreground" />}
                          </div>
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: zone.color }} />
                          <span className="font-medium">{zone.name}</span>
                          <span className="text-muted-foreground text-[10px] ml-auto flex items-center gap-0.5">
                            <Users className="w-2.5 h-2.5" /> {zone.capacity}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button variant="outline" className="flex-1 h-9 text-sm gap-1.5" onClick={() => setAddStep(2)}>
                    <ArrowLeft className="w-3.5 h-3.5" /> Назад
                  </Button>
                  <Button className="flex-1 h-9 text-sm gap-1.5" onClick={() => setAddStep(4)}>
                    Подключить <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Done */}
            {addStep === 4 && (
              <div className="space-y-4 text-center py-2">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-14 h-14 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center">
                    <CheckCircle2 className="w-7 h-7 text-green-400" />
                  </div>
                  <div>
                    <p className="text-base font-bold">Устройство зарегистрировано!</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      <span className="font-medium text-foreground">{deviceName || selectedTypeDef?.name}</span>
                      {selectedZone !== "none" && <> · <span className="text-primary">{selectedZone}</span></>}
                    </p>
                  </div>
                </div>
                <div className="text-left p-3 rounded-xl border border-border/50 bg-card/30 space-y-2">
                  <p className="text-xs font-semibold">Следующие шаги:</p>
                  {[
                    "Включите VR-шлем и подключите к локальной сети парка",
                    "Установите VR Agent на устройство",
                    "Введите адрес CRM-сервера в настройках агента",
                    "Устройство автоматически появится как активное",
                  ].map((text, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full bg-primary/15 text-primary text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</div>
                      <p className="text-[11px] text-muted-foreground text-left">{text}</p>
                    </div>
                  ))}
                </div>
                <Button className="w-full h-9 text-sm" onClick={handleFinishAdd}>
                  Готово — добавить в список
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
