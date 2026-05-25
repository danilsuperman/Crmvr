import { useState } from "react";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Plus, Search, Wifi, Battery, Thermometer, Cpu, Clock,
  Gamepad2, Users, Filter
} from "lucide-react";

const MOCK_DEVICES = [
  { id: "a1", name: "Headset A-1", zone: "Arena A", status: "active", battery: 78, temp: 42, wifi: 85, model: "Meta Quest 3" },
  { id: "a2", name: "Headset A-2", zone: "Arena A", status: "idle", battery: 95, temp: 38, wifi: 92, model: "Meta Quest 3" },
  { id: "a3", name: "Headset A-3", zone: "Arena A", status: "preparing", battery: 61, temp: 39, wifi: 78, model: "Meta Quest 3" },
  { id: "a4", name: "Headset A-4", zone: "Arena A", status: "offline", battery: 12, temp: 35, wifi: 0, model: "Meta Quest 3" },
  { id: "b1", name: "Headset B-1", zone: "Arena B", status: "active", battery: 55, temp: 44, wifi: 90, model: "Pico 4" },
  { id: "b2", name: "Headset B-2", zone: "Arena B", status: "active", battery: 60, temp: 43, wifi: 88, model: "Pico 4" },
  { id: "b3", name: "Headset B-3", zone: "Arena B", status: "low_battery", battery: 8, temp: 37, wifi: 75, model: "Pico 4" },
  { id: "s1", name: "Solo-1", zone: "VR Solo", status: "active", battery: 82, temp: 41, wifi: 94, model: "Meta Quest Pro" },
  { id: "s2", name: "Solo-2", zone: "VR Solo", status: "idle", battery: 100, temp: 36, wifi: 97, model: "Meta Quest Pro" },
  { id: "r1", name: "Racing-1", zone: "Racing", status: "active", battery: 71, temp: 48, wifi: 82, model: "PS VR2" },
  { id: "r2", name: "Racing-2", zone: "Racing", status: "error", battery: 45, temp: 62, wifi: 40, model: "PS VR2" },
  { id: "p1", name: "PS5-VR2 #1", zone: "PS5", status: "idle", battery: 100, temp: 37, wifi: 99, model: "PS VR2" },
  { id: "p2", name: "PS5-VR2 #2", zone: "PS5", status: "preparing", battery: 88, temp: 39, wifi: 91, model: "PS VR2" },
  { id: "m1", name: "Motion-1", zone: "Motion", status: "active", battery: 66, temp: 45, wifi: 86, model: "Meta Quest 3" },
  { id: "m2", name: "Motion-2", zone: "Motion", status: "idle", battery: 93, temp: 37, wifi: 89, model: "Meta Quest 3" },
];

const MOCK_SESSIONS = [
  { id: "s1", device: "Headset A-1", zone: "Arena A", game: "Beat Saber", start: "14:30", end: null, status: "active", duration: "45 мин" },
  { id: "s2", device: "Headset B-1", zone: "Arena B", game: "Pistol Whip", start: "14:00", end: null, status: "active", duration: "1 ч 15 мин" },
  { id: "s3", device: "Solo-1", zone: "VR Solo", game: "Half-Life: Alyx", start: "13:30", end: null, status: "active", duration: "1 ч 45 мин" },
  { id: "s4", device: "Racing-2", zone: "Racing", game: "GT7 VR", start: "13:00", end: "13:45", status: "error", duration: "45 мин" },
  { id: "s5", device: "Headset A-2", zone: "Arena A", game: "Superhot VR", start: "12:00", end: "12:30", status: "completed", duration: "30 мин" },
  { id: "s6", device: "PS5-VR2 #1", zone: "PS5", game: "Horizon VR", start: "11:00", end: "12:00", status: "completed", duration: "1 ч" },
  { id: "s7", device: "Motion-1", zone: "Motion", game: "Amusement Park", start: "10:00", end: "10:30", status: "completed", duration: "30 мин" },
];

const ZONES_GAMES: Record<string, { game: string; multiplayer: boolean; recommended: boolean }[]> = {
  "Arena A": [
    { game: "Beat Saber", multiplayer: true, recommended: true },
    { game: "Superhot VR", multiplayer: false, recommended: true },
    { game: "Pistol Whip", multiplayer: true, recommended: false },
  ],
  "Arena B": [
    { game: "Pistol Whip", multiplayer: true, recommended: true },
    { game: "Walkabout Mini Golf", multiplayer: true, recommended: true },
  ],
  "VR Solo": [
    { game: "Half-Life: Alyx", multiplayer: false, recommended: true },
    { game: "Asgard's Wrath", multiplayer: false, recommended: false },
  ],
  "Racing": [
    { game: "GT7 VR", multiplayer: false, recommended: true },
  ],
  "PS5": [
    { game: "Horizon VR", multiplayer: false, recommended: true },
    { game: "Gran Turismo 7 VR", multiplayer: false, recommended: false },
  ],
  "Motion": [
    { game: "Amusement Park", multiplayer: false, recommended: true },
  ],
};

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
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

  const filtered = MOCK_DEVICES.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.zone.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || d.status === filterStatus;
    return matchSearch && matchStatus;
  });

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
                <Input
                  placeholder="Поиск устройств..."
                  className="pl-8 h-8 text-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="h-8 text-xs w-full sm:w-40">
                  <Filter className="w-3 h-3 mr-1.5" />
                  <SelectValue />
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
                    "flex items-center gap-3 p-3 rounded-xl border transition-colors",
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
                      <div key={s.id} className={cn(
                        "flex items-center gap-3 p-3 rounded-xl border",
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
            {Object.entries(ZONES_GAMES).map(([zone, games]) => (
              <div key={zone} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">{zone}</h3>
                  <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1">
                    <Plus className="w-3 h-3" /> Добавить игру
                  </Button>
                </div>
                <div className="grid gap-1.5">
                  {games.map((g, i) => (
                    <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg border border-border/50 bg-card/30">
                      <Gamepad2 className="w-4 h-4 text-primary/60 shrink-0" />
                      <p className="text-sm flex-1">{g.game}</p>
                      <div className="flex items-center gap-1.5">
                        {g.multiplayer && (
                          <Badge variant="outline" className="text-[10px] gap-0.5">
                            <Users className="w-2.5 h-2.5" /> Multi
                          </Badge>
                        )}
                        {g.recommended && (
                          <Badge className="text-[10px] bg-primary/20 text-primary border-primary/30">Рек.</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
