import { useState } from "react";
import { useLocation } from "wouter";
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
  Gamepad2, Users, Filter, Pencil, Check
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

export default function Devices() {
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [devices, setDevices] = useLocalStorage<Device[]>("vrpark_devices", MOCK_DEVICES);
  const [settingsZones] = useLocalStorage<SettingsZone[]>("vrpark_zones", DEFAULT_SETTINGS_ZONES);
  const [editDevice, setEditDevice] = useState<Device | null>(null);
  const [editForm, setEditForm] = useState<Partial<Device>>({});

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

  const zoneNames = settingsZones.map(z => z.name);

  return (
    <div className="flex flex-col h-full">
      <header className="h-14 border-b border-border/50 flex items-center px-4 md:px-6 bg-card/50 backdrop-blur-sm shrink-0">
        <h1 className="text-lg font-bold font-mono">Устройства</h1>
      </header>

      <div className="flex-1 p-4 md:p-6 overflow-auto pb-20 md:pb-6">
        <Tabs defaultValue="devices" className="w-full">
          <TabsList className="mb-4 bg-muted/30 border border-border/50 h-9">
            <TabsTrigger value="devices" className="text-xs">Устройства</TabsTrigger>
            <TabsTrigger value="sessions" className="text-xs">Сессии</TabsTrigger>
            <TabsTrigger value="games" className="text-xs">Игры по зонам</TabsTrigger>
          </TabsList>

          {/* Devices tab */}
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
              <Button size="sm" className="h-8 gap-1.5 text-xs shrink-0" onClick={() => navigate("/devices/add")}>
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
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
                      onClick={e => openEdit(device, e)}
                      title="Редактировать"
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

          {/* Sessions tab */}
          <TabsContent value="sessions" className="space-y-4">
            <div className="grid gap-2">
              {["active", "error", "completed"].map((statusGroup) => {
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

          {/* Games by zones tab */}
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
      </div>

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
              <Input
                className="h-9 text-sm"
                value={editForm.name ?? ""}
                onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
              />
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
    </div>
  );
}
