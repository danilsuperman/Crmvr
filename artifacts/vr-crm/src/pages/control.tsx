import { useState } from "react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useLocalStorage } from "@/lib/store";
import {
  Wifi, Battery, Thermometer, Clock, AlertTriangle, CheckCircle2,
  Circle, Loader2, Gamepad2, ChevronRight, Monitor
} from "lucide-react";

type DeviceStatus = "idle" | "active" | "preparing" | "offline" | "low_battery" | "error";

interface StoredDevice {
  id: string;
  name: string;
  zone: string;
  status: DeviceStatus;
  battery: number;
  temp: number;
  wifi: number;
  model: string;
}

interface SettingsZone {
  id: number;
  name: string;
  color: string;
  capacity: number;
  openTime: string;
  closeTime: string;
}

interface Device {
  id: string;
  name: string;
  status: DeviceStatus;
  game: string | null;
  battery: number;
  temp: number;
  wifi: number;
  sessionTimer: number | null;
  zone: string;
}

interface Zone {
  name: string;
  color: string;
  devices: Device[];
}

// Simulated live session state keyed by device ID
// In a real system this would come from the API
const MOCK_SESSION_STATE: Record<string, { game: string | null; sessionTimer: number | null }> = {
  a1: { game: "Beat Saber", sessionTimer: 1234 },
  a2: { game: null, sessionTimer: null },
  a3: { game: "Superhot VR", sessionTimer: null },
  a4: { game: null, sessionTimer: null },
  b1: { game: "Pistol Whip", sessionTimer: 2891 },
  b2: { game: "Pistol Whip", sessionTimer: 2891 },
  b3: { game: null, sessionTimer: null },
  s1: { game: "Half-Life: Alyx", sessionTimer: 4512 },
  s2: { game: null, sessionTimer: null },
  r1: { game: "GT7 VR", sessionTimer: 891 },
  r2: { game: null, sessionTimer: null },
  p1: { game: null, sessionTimer: null },
  p2: { game: "Horizon VR", sessionTimer: null },
  m1: { game: "Amusement Park", sessionTimer: 3200 },
  m2: { game: null, sessionTimer: null },
};

const DEFAULT_SETTINGS_ZONES: SettingsZone[] = [
  { id: 1, name: "Arena A", color: "#6366f1", capacity: 4, openTime: "10:00", closeTime: "22:00" },
  { id: 2, name: "Arena B", color: "#8b5cf6", capacity: 4, openTime: "10:00", closeTime: "22:00" },
  { id: 3, name: "VR Solo", color: "#ec4899", capacity: 1, openTime: "10:00", closeTime: "22:00" },
  { id: 4, name: "Racing Zone", color: "#f59e0b", capacity: 2, openTime: "12:00", closeTime: "22:00" },
  { id: 5, name: "PS5", color: "#3b82f6", capacity: 2, openTime: "10:00", closeTime: "23:00" },
  { id: 6, name: "Motion", color: "#10b981", capacity: 1, openTime: "11:00", closeTime: "21:00" },
];

const DEFAULT_DEVICES: StoredDevice[] = [
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

function formatTimer(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

const statusConfig: Record<DeviceStatus, { label: string; color: string; dot: string }> = {
  idle: { label: "Простой", color: "text-muted-foreground", dot: "bg-muted-foreground/40" },
  active: { label: "Активен", color: "text-green-400", dot: "bg-green-400" },
  preparing: { label: "Подготовка", color: "text-yellow-400", dot: "bg-yellow-400" },
  offline: { label: "Оффлайн", color: "text-muted-foreground/40", dot: "bg-muted-foreground/20" },
  low_battery: { label: "Слабый заряд", color: "text-orange-400", dot: "bg-orange-400" },
  error: { label: "Ошибка", color: "text-red-400", dot: "bg-red-400" },
};

function DeviceCard({ device, onClick }: { device: Device; onClick: () => void }) {
  const sc = statusConfig[device.status];
  const isOnline = device.status !== "offline";

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-3 rounded-xl border transition-all hover:scale-[1.01] hover:shadow-lg group cursor-pointer",
        device.status === "active" ? "border-green-500/30 bg-green-500/5 hover:border-green-500/50" :
        device.status === "error" ? "border-red-500/30 bg-red-500/5 hover:border-red-500/50" :
        device.status === "low_battery" ? "border-orange-500/30 bg-orange-500/5 hover:border-orange-500/50" :
        device.status === "offline" ? "border-border/30 bg-card/10 opacity-60 hover:opacity-80" :
        "border-border/50 bg-card/30 hover:border-primary/40"
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className={cn("w-2 h-2 rounded-full shrink-0", sc.dot, device.status === "active" && "animate-pulse")} />
          <span className="text-xs font-semibold truncate">{device.name}</span>
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-muted-foreground shrink-0 mt-0.5 transition-colors" />
      </div>

      <div className={cn("flex items-center gap-1 text-[10px] font-medium mb-2", sc.color)}>
        {device.status === "active" && <CheckCircle2 className="w-3 h-3" />}
        {device.status === "preparing" && <Loader2 className="w-3 h-3 animate-spin" />}
        {(device.status === "error" || device.status === "low_battery") && <AlertTriangle className="w-3 h-3" />}
        {(device.status === "idle" || device.status === "offline") && <Circle className="w-3 h-3" />}
        <span>{sc.label}</span>
      </div>

      {device.game && (
        <p className="text-[10px] text-muted-foreground mb-1.5 truncate flex items-center gap-1">
          <Gamepad2 className="w-3 h-3 shrink-0" /> {device.game}
        </p>
      )}

      {device.sessionTimer !== null && (
        <p className="text-[10px] text-primary mb-1.5 flex items-center gap-1 font-mono font-bold">
          <Clock className="w-3 h-3 shrink-0" /> {formatTimer(device.sessionTimer)}
        </p>
      )}

      <div className="flex items-center gap-2 mt-1.5 pt-1.5 border-t border-border/30">
        <span className={cn("flex items-center gap-0.5 text-[10px]", device.battery < 20 ? "text-red-400 font-bold" : "text-muted-foreground")}>
          <Battery className="w-3 h-3" /> {device.battery}%
        </span>
        <span className={cn("flex items-center gap-0.5 text-[10px]", device.temp > 55 ? "text-red-400 font-bold" : "text-muted-foreground")}>
          <Thermometer className="w-3 h-3" /> {device.temp}°C
        </span>
        {isOnline && (
          <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
            <Wifi className="w-3 h-3" /> {device.wifi}%
          </span>
        )}
      </div>
    </button>
  );
}

export default function Control() {
  const [, navigate] = useLocation();

  const [settingsZones] = useLocalStorage<SettingsZone[]>("vrpark_zones", DEFAULT_SETTINGS_ZONES);
  const [storedDevices] = useLocalStorage<StoredDevice[]>("vrpark_devices", DEFAULT_DEVICES);

  // Map stored devices to control center Device format (merge with session state)
  const controlDevices: Device[] = storedDevices.map(d => {
    const session = MOCK_SESSION_STATE[d.id] ?? { game: null, sessionTimer: null };
    return {
      id: d.id,
      name: d.name,
      zone: d.zone,
      status: d.status,
      battery: d.battery,
      temp: d.temp,
      wifi: d.wifi,
      game: d.status === "active" ? session.game : null,
      sessionTimer: d.status === "active" ? session.sessionTimer : null,
    };
  });

  // Group devices by zone, using settings zones as the structure
  const zones: Zone[] = settingsZones.map(sz => ({
    name: sz.name,
    color: sz.color,
    devices: controlDevices.filter(d => d.zone === sz.name),
  }));

  // Devices not assigned to any settings zone (e.g. newly added with old zone name)
  const knownZoneNames = new Set(settingsZones.map(z => z.name));
  const unassigned = controlDevices.filter(d => !knownZoneNames.has(d.zone));

  const allDevices = controlDevices;
  const activeDevices = allDevices.filter(d => d.status === "active").length;
  const errorDevices = allDevices.filter(d => d.status === "error" || d.status === "low_battery").length;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="h-14 border-b border-border/50 flex items-center px-4 md:px-6 bg-card/50 backdrop-blur-sm shrink-0 gap-4">
        <h1 className="text-lg font-bold font-mono">Центр управления</h1>
        <div className="flex items-center gap-3 ml-auto flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span>{activeDevices} активных</span>
          </div>
          {errorDevices > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-orange-400">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{errorDevices} требуют внимания</span>
            </div>
          )}
          <Badge variant="outline" className="text-[10px]">{allDevices.length} устройств</Badge>
        </div>
      </header>

      <div className="flex-1 p-4 md:p-6 overflow-auto pb-20 md:pb-6 space-y-6">
        {zones.map((zone) => (
          <div key={zone.name}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: zone.color }} />
              <h2 className="text-sm font-semibold">{zone.name}</h2>
              <span className="text-[10px] text-muted-foreground">
                {zone.devices.filter(d => d.status === "active").length}/{zone.devices.length} активных
              </span>
            </div>
            {zone.devices.length === 0 ? (
              <p className="text-xs text-muted-foreground/50 ml-5">Нет устройств в этой зоне</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                {zone.devices.map((device) => (
                  <DeviceCard
                    key={device.id}
                    device={device}
                    onClick={() => navigate(`/control/${device.id}`)}
                  />
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Devices with unrecognized zones */}
        {unassigned.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full bg-muted-foreground/40" />
              <h2 className="text-sm font-semibold text-muted-foreground">Без зоны</h2>
              <span className="text-[10px] text-muted-foreground">{unassigned.length} устр.</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
              {unassigned.map((device) => (
                <DeviceCard
                  key={device.id}
                  device={device}
                  onClick={() => navigate(`/control/${device.id}`)}
                />
              ))}
            </div>
          </div>
        )}

        {allDevices.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <Monitor className="w-8 h-8 mb-2 opacity-40" />
            <p className="text-sm">Нет устройств. Добавьте их в разделе Устройства.</p>
          </div>
        )}
      </div>
    </div>
  );
}
