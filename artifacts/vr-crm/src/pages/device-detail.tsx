import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, Wifi, Battery, Thermometer, Play, Square, RefreshCw,
  MessageSquare, Video, VideoOff, Gamepad2, Clock, AlertTriangle,
  CheckCircle2, Circle, Loader2, Monitor, Send, X, ChevronRight,
  Calendar, Hash, Cpu, MapPin, Volume2, VolumeX, Maximize2
} from "lucide-react";

type DeviceStatus = "idle" | "active" | "preparing" | "offline" | "low_battery" | "error";

const ALL_DEVICES: Record<string, {
  id: string; name: string; status: DeviceStatus; game: string | null;
  battery: number; temp: number; wifi: number; sessionTimer: number | null;
  zone: string; model: string; serial: string; ip: string; firmware: string;
}> = {
  "a1": { id: "a1", name: "Headset A-1", status: "active", game: "Beat Saber", battery: 78, temp: 42, wifi: 85, sessionTimer: 1234, zone: "Arena A", model: "Meta Quest 3", serial: "SN-MQ3-00112", ip: "192.168.1.101", firmware: "v62.0.0" },
  "a2": { id: "a2", name: "Headset A-2", status: "idle", game: null, battery: 95, temp: 38, wifi: 92, sessionTimer: null, zone: "Arena A", model: "Meta Quest 3", serial: "SN-MQ3-00113", ip: "192.168.1.102", firmware: "v62.0.0" },
  "a3": { id: "a3", name: "Headset A-3", status: "preparing", game: "Superhot VR", battery: 61, temp: 39, wifi: 78, sessionTimer: null, zone: "Arena A", model: "Meta Quest 3", serial: "SN-MQ3-00114", ip: "192.168.1.103", firmware: "v61.0.0" },
  "a4": { id: "a4", name: "Headset A-4", status: "offline", game: null, battery: 12, temp: 35, wifi: 0, sessionTimer: null, zone: "Arena A", model: "Meta Quest 3", serial: "SN-MQ3-00115", ip: "192.168.1.104", firmware: "v60.0.0" },
  "b1": { id: "b1", name: "Headset B-1", status: "active", game: "Pistol Whip", battery: 55, temp: 44, wifi: 90, sessionTimer: 2891, zone: "Arena B", model: "Pico 4", serial: "SN-P4-00201", ip: "192.168.1.111", firmware: "v5.8.0" },
  "b2": { id: "b2", name: "Headset B-2", status: "active", game: "Pistol Whip", battery: 60, temp: 43, wifi: 88, sessionTimer: 2891, zone: "Arena B", model: "Pico 4", serial: "SN-P4-00202", ip: "192.168.1.112", firmware: "v5.8.0" },
  "b3": { id: "b3", name: "Headset B-3", status: "low_battery", game: null, battery: 8, temp: 37, wifi: 75, sessionTimer: null, zone: "Arena B", model: "Pico 4", serial: "SN-P4-00203", ip: "192.168.1.113", firmware: "v5.7.0" },
  "s1": { id: "s1", name: "Solo-1", status: "active", game: "Half-Life: Alyx", battery: 82, temp: 41, wifi: 94, sessionTimer: 4512, zone: "VR Solo", model: "Meta Quest Pro", serial: "SN-MQP-00301", ip: "192.168.1.121", firmware: "v62.0.0" },
  "s2": { id: "s2", name: "Solo-2", status: "idle", game: null, battery: 100, temp: 36, wifi: 97, sessionTimer: null, zone: "VR Solo", model: "Meta Quest Pro", serial: "SN-MQP-00302", ip: "192.168.1.122", firmware: "v62.0.0" },
  "r1": { id: "r1", name: "Racing-1", status: "active", game: "GT7 VR", battery: 71, temp: 48, wifi: 82, sessionTimer: 891, zone: "Racing", model: "PS VR2", serial: "SN-PV2-00401", ip: "192.168.1.131", firmware: "v2.0.0" },
  "r2": { id: "r2", name: "Racing-2", status: "error", game: null, battery: 45, temp: 62, wifi: 40, sessionTimer: null, zone: "Racing", model: "PS VR2", serial: "SN-PV2-00402", ip: "192.168.1.132", firmware: "v2.0.0" },
  "p1": { id: "p1", name: "PS5-VR2 #1", status: "idle", game: null, battery: 100, temp: 37, wifi: 99, sessionTimer: null, zone: "PS5", model: "PS VR2", serial: "SN-PV2-00501", ip: "192.168.1.141", firmware: "v2.1.0" },
  "p2": { id: "p2", name: "PS5-VR2 #2", status: "preparing", game: "Horizon VR", battery: 88, temp: 39, wifi: 91, sessionTimer: null, zone: "PS5", model: "PS VR2", serial: "SN-PV2-00502", ip: "192.168.1.142", firmware: "v2.1.0" },
  "m1": { id: "m1", name: "Motion-1", status: "active", game: "Amusement Park", battery: 66, temp: 45, wifi: 86, sessionTimer: 3200, zone: "Motion", model: "Meta Quest 3", serial: "SN-MQ3-00601", ip: "192.168.1.151", firmware: "v62.0.0" },
  "m2": { id: "m2", name: "Motion-2", status: "idle", game: null, battery: 93, temp: 37, wifi: 89, sessionTimer: null, zone: "Motion", model: "Meta Quest 3", serial: "SN-MQ3-00602", ip: "192.168.1.152", firmware: "v62.0.0" },
};

const MOCK_GAMES = [
  { id: "g1", name: "Beat Saber", version: "1.34.0" },
  { id: "g2", name: "Superhot VR", version: "2.1.1" },
  { id: "g3", name: "Pistol Whip", version: "3.0.5" },
  { id: "g4", name: "Half-Life: Alyx", version: "1.5.0" },
  { id: "g5", name: "GT7 VR", version: "2.0.0" },
  { id: "g6", name: "Horizon VR", version: "1.0.0" },
  { id: "g7", name: "Amusement Park", version: "1.2.3" },
  { id: "g8", name: "Walkabout Mini Golf", version: "4.1.0" },
];

const MOCK_SESSIONS = [
  { date: "25.05.2026 14:30", duration: "45 мин", game: "Beat Saber", errors: false },
  { date: "25.05.2026 13:00", duration: "30 мин", game: "Pistol Whip", errors: true, errorText: "Перегрев" },
  { date: "25.05.2026 11:20", duration: "60 мин", game: "Half-Life: Alyx", errors: false },
  { date: "24.05.2026 18:00", duration: "30 мин", game: "Superhot VR", errors: false },
  { date: "24.05.2026 15:30", duration: "45 мин", game: "Beat Saber", errors: false },
];

const statusConfig: Record<DeviceStatus, { label: string; color: string; dot: string }> = {
  idle: { label: "Простой", color: "text-muted-foreground", dot: "bg-muted-foreground/40" },
  active: { label: "Активен", color: "text-green-400", dot: "bg-green-400" },
  preparing: { label: "Подготовка", color: "text-yellow-400", dot: "bg-yellow-400" },
  offline: { label: "Оффлайн", color: "text-muted-foreground/40", dot: "bg-muted-foreground/20" },
  low_battery: { label: "Слабый заряд", color: "text-orange-400", dot: "bg-orange-400" },
  error: { label: "Ошибка", color: "text-red-400", dot: "bg-red-400" },
};

function formatTimer(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function DeviceDetail({ params }: { params: { id: string } }) {
  const [, navigate] = useLocation();
  const device = ALL_DEVICES[params.id];

  const [streaming, setStreaming] = useState(false);
  const [muted, setMuted] = useState(false);
  const [msgText, setMsgText] = useState("");
  const [msgSent, setMsgSent] = useState(false);
  const [launchGame, setLaunchGame] = useState<string | null>(null);
  const [showLaunchConfirm, setShowLaunchConfirm] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  if (!device) {
    return (
      <div className="flex flex-col h-full items-center justify-center gap-4">
        <Monitor className="w-12 h-12 text-muted-foreground/30" />
        <p className="text-muted-foreground">Устройство не найдено</p>
        <Button variant="outline" size="sm" onClick={() => navigate("/control")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Назад
        </Button>
      </div>
    );
  }

  const sc = statusConfig[device.status];
  const isOnline = device.status !== "offline";

  const triggerAction = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 2500);
  };

  const sendMessage = () => {
    if (!msgText.trim()) return;
    setMsgSent(true);
    triggerAction(`Сообщение отправлено: "${msgText}"`);
    setTimeout(() => { setMsgSent(false); setMsgText(""); }, 2000);
  };

  return (
    <div className="flex flex-col h-full overflow-auto">
      {/* Header */}
      <header className="h-14 border-b border-border/50 flex items-center px-4 md:px-6 bg-card/50 backdrop-blur-sm shrink-0 gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => navigate("/control")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className={cn("w-2.5 h-2.5 rounded-full shrink-0", sc.dot, device.status === "active" && "animate-pulse")} />
          <h1 className="text-base font-bold truncate">{device.name}</h1>
          <Badge variant="outline" className="text-[10px] shrink-0">{device.zone}</Badge>
          <Badge variant="outline" className={cn("text-[10px] shrink-0", sc.color)}>{sc.label}</Badge>
        </div>
        {actionFeedback && (
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-full animate-in fade-in">
            <CheckCircle2 className="w-3.5 h-3.5" /> {actionFeedback}
          </div>
        )}
      </header>

      <div className="flex-1 p-4 md:p-6 pb-20 md:pb-6 space-y-5 overflow-auto">
        {/* Top row: telemetry + quick info */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className={cn("p-3 rounded-xl border", device.battery < 20 ? "border-red-500/30 bg-red-500/5" : "border-border/50 bg-card/30")}>
            <div className={cn("flex items-center gap-1.5 text-[10px] mb-1", device.battery < 20 ? "text-red-400" : "text-muted-foreground")}>
              <Battery className="w-3.5 h-3.5" /> Батарея
            </div>
            <p className={cn("text-xl font-bold", device.battery < 20 ? "text-red-400" : "")}>{device.battery}%</p>
          </div>
          <div className={cn("p-3 rounded-xl border", device.temp > 55 ? "border-red-500/30 bg-red-500/5" : "border-border/50 bg-card/30")}>
            <div className={cn("flex items-center gap-1.5 text-[10px] mb-1", device.temp > 55 ? "text-red-400" : "text-muted-foreground")}>
              <Thermometer className="w-3.5 h-3.5" /> Температура
            </div>
            <p className={cn("text-xl font-bold", device.temp > 55 ? "text-red-400" : "")}>{device.temp}°C</p>
          </div>
          <div className="p-3 rounded-xl border border-border/50 bg-card/30">
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-1">
              <Wifi className="w-3.5 h-3.5" /> WiFi
            </div>
            <p className="text-xl font-bold">{isOnline ? `${device.wifi}%` : "—"}</p>
          </div>
          <div className="p-3 rounded-xl border border-border/50 bg-card/30">
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-1">
              <Clock className="w-3.5 h-3.5" /> Сессия
            </div>
            <p className="text-xl font-bold font-mono">
              {device.sessionTimer !== null ? formatTimer(device.sessionTimer) : "—"}
            </p>
          </div>
        </div>

        {/* Current game */}
        {device.game && (
          <div className="flex items-center gap-3 p-3 rounded-xl border border-primary/20 bg-primary/5">
            <Gamepad2 className="w-5 h-5 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-muted-foreground">Текущая игра</p>
              <p className="text-sm font-semibold">{device.game}</p>
            </div>
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1 shrink-0" onClick={() => triggerAction("Игра остановлена")}>
              <Square className="w-3 h-3 text-red-400" /> Стоп
            </Button>
          </div>
        )}

        {/* LIVE STREAM */}
        <div className="space-y-2">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Video className="w-4 h-4 text-primary" /> Live Stream
            {streaming && <span className="flex items-center gap-1 text-[10px] text-red-400 font-mono"><span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />LIVE</span>}
          </h2>
          {streaming ? (
            <div className="relative w-full aspect-video rounded-xl bg-black border border-border/50 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 to-blue-900/50" />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Monitor className="w-16 h-16 text-white/10" />
                <p className="text-white/40 text-xs mt-2 font-mono">LIVE FEED · {device.name}</p>
                {device.game && <p className="text-white/25 text-[10px] mt-1">{device.game}</p>}
              </div>
              {/* Controls overlay */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
                <button onClick={() => setMuted(!muted)} className="p-1.5 rounded-lg bg-black/50 text-white/70 hover:text-white transition-colors">
                  {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <div className="flex-1" />
                <button className="p-1.5 rounded-lg bg-black/50 text-white/70 hover:text-white transition-colors">
                  <Maximize2 className="w-4 h-4" />
                </button>
                <Button size="sm" className="h-7 text-[10px] gap-1 bg-red-500/80 hover:bg-red-500 border-0" onClick={() => setStreaming(false)}>
                  <VideoOff className="w-3 h-3" /> Стоп
                </Button>
              </div>
            </div>
          ) : (
            <div className="w-full aspect-video rounded-xl border border-dashed border-border/50 bg-muted/10 flex flex-col items-center justify-center gap-3">
              <VideoOff className="w-10 h-10 text-muted-foreground/20" />
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Трансляция не активна</p>
                <p className="text-xs text-muted-foreground/60 mt-0.5">Нажмите кнопку ниже, чтобы начать</p>
              </div>
              <Button size="sm" className="h-8 text-xs gap-1.5" onClick={() => setStreaming(true)} disabled={!isOnline}>
                <Video className="w-3.5 h-3.5" /> Начать трансляцию
              </Button>
            </div>
          )}
        </div>

        {/* QUICK ACTIONS */}
        <div className="space-y-2">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Cpu className="w-4 h-4 text-primary" /> Быстрые действия
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <Button
              variant="outline"
              className="h-11 text-xs gap-2 justify-start"
              disabled={!isOnline}
              onClick={() => triggerAction("Игра запущена")}
            >
              <Play className="w-4 h-4 text-green-400" />
              <span>Запустить игру</span>
            </Button>
            <Button
              variant="outline"
              className="h-11 text-xs gap-2 justify-start"
              disabled={!isOnline || !device.game}
              onClick={() => triggerAction("Игра остановлена")}
            >
              <Square className="w-4 h-4 text-red-400" />
              <span>Остановить игру</span>
            </Button>
            <Button
              variant="outline"
              className="h-11 text-xs gap-2 justify-start"
              disabled={!isOnline}
              onClick={() => triggerAction("Устройство перезагружается...")}
            >
              <RefreshCw className="w-4 h-4 text-yellow-400" />
              <span>Перезагрузить</span>
            </Button>
            <Button
              variant="outline"
              className="h-11 text-xs gap-2 justify-start"
              disabled={!isOnline}
              onClick={() => triggerAction("Lobby открыт")}
            >
              <Monitor className="w-4 h-4 text-blue-400" />
              <span>Открыть Lobby</span>
            </Button>
            <Button
              variant="outline"
              className={cn("h-11 text-xs gap-2 justify-start", streaming && "border-red-500/30")}
              disabled={!isOnline}
              onClick={() => { setStreaming(!streaming); triggerAction(streaming ? "Трансляция остановлена" : "Трансляция запущена"); }}
            >
              {streaming ? <VideoOff className="w-4 h-4 text-red-400" /> : <Video className="w-4 h-4 text-green-400" />}
              <span>{streaming ? "Стоп трансляция" : "Старт трансляция"}</span>
            </Button>
          </div>
        </div>

        {/* MESSAGE TO HEADSET */}
        <div className="space-y-2">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" /> Сообщение в шлем
          </h2>
          <div className="flex gap-2">
            <input
              className="flex-1 bg-card/50 border border-border/50 rounded-lg px-3 py-2 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50"
              placeholder="Введите сообщение игроку..."
              value={msgText}
              onChange={(e) => setMsgText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              disabled={!isOnline}
            />
            <Button
              size="sm"
              className="h-9 px-3 shrink-0 gap-1.5"
              onClick={sendMessage}
              disabled={!isOnline || !msgText.trim() || msgSent}
            >
              {msgSent ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {["Сеанс заканчивается через 5 мин!", "Пожалуйста, снимите шлем", "Ожидайте оператора"].map((preset) => (
              <button
                key={preset}
                className="text-[10px] px-2.5 py-1 rounded-full border border-border/50 text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors"
                onClick={() => setMsgText(preset)}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* GAME LIBRARY */}
        <div className="space-y-2">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Gamepad2 className="w-4 h-4 text-primary" /> Библиотека игр
          </h2>
          <div className="grid gap-1.5">
            {MOCK_GAMES.map((g) => (
              <div key={g.id} className={cn(
                "flex items-center gap-3 p-2.5 rounded-lg border transition-colors",
                launchGame === g.id ? "border-green-500/40 bg-green-500/5" : "border-border/50 bg-card/20 hover:border-primary/30"
              )}>
                <Gamepad2 className="w-4 h-4 text-primary/50 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{g.name}</p>
                  <p className="text-[10px] text-muted-foreground">v{g.version}</p>
                </div>
                {showLaunchConfirm === g.id ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-muted-foreground">Подтвердить?</span>
                    <Button size="sm" className="h-6 text-[10px] px-2 bg-green-500 hover:bg-green-600 border-0" onClick={() => { setLaunchGame(g.id); setShowLaunchConfirm(null); triggerAction(`Запущено: ${g.name}`); }}>
                      Да
                    </Button>
                    <Button size="sm" variant="ghost" className="h-6 text-[10px] px-1.5" onClick={() => setShowLaunchConfirm(null)}>
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant={launchGame === g.id ? "default" : "outline"}
                    className="h-6 text-[10px] gap-1 px-2 shrink-0"
                    disabled={!isOnline}
                    onClick={() => setShowLaunchConfirm(g.id)}
                  >
                    {launchGame === g.id ? <><CheckCircle2 className="w-2.5 h-2.5" /> Запущена</> : <><Play className="w-2.5 h-2.5" /> Запустить</>}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* SESSION HISTORY */}
        <div className="space-y-2">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" /> История сессий
          </h2>
          <div className="grid gap-1.5">
            {MOCK_SESSIONS.map((s, i) => (
              <div key={i} className={cn(
                "flex items-center gap-3 p-2.5 rounded-lg border",
                s.errors ? "border-red-500/20 bg-red-500/5" : "border-border/50 bg-card/20"
              )}>
                <div>
                  <p className="text-xs font-medium">{s.game}</p>
                  <p className="text-[10px] text-muted-foreground">{s.date} · {s.duration}</p>
                </div>
                <div className="ml-auto shrink-0">
                  {s.errors ? (
                    <Badge variant="destructive" className="text-[10px]">
                      <AlertTriangle className="w-2.5 h-2.5 mr-1" /> {s.errorText}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] text-green-400 border-green-500/30">
                      <CheckCircle2 className="w-2.5 h-2.5 mr-1" /> OK
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DEVICE INFO */}
        <div className="space-y-2">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Hash className="w-4 h-4 text-primary" /> Информация об устройстве
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Модель", value: device.model },
              { label: "Серийный номер", value: device.serial },
              { label: "IP-адрес", value: device.ip },
              { label: "Прошивка", value: device.firmware },
              { label: "Зона", value: device.zone },
              { label: "Статус", value: sc.label },
            ].map((item) => (
              <div key={item.label} className="p-2.5 rounded-lg border border-border/50 bg-card/20">
                <p className="text-[10px] text-muted-foreground">{item.label}</p>
                <p className="text-xs font-medium mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
