import { useState } from "react";
import { Camera, Wifi, WifiOff, Users, Activity, AlertTriangle, Eye, Maximize2, RefreshCw, Brain, TrendingUp, Clock, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const CAMERAS = [
  { id: "c1", name: "Arena A — вход", zone: "Arena A", zoneColor: "#6366f1", status: "online", people: 3, activity: "высокая", fps: 30, res: "1080p", ai: true, alerts: [] },
  { id: "c2", name: "Arena A — обзор", zone: "Arena A", zoneColor: "#6366f1", status: "online", people: 3, activity: "высокая", fps: 30, res: "1080p", ai: true, alerts: [] },
  { id: "c3", name: "Arena B — вход", zone: "Arena B", zoneColor: "#8b5cf6", status: "online", people: 4, activity: "высокая", fps: 25, res: "1080p", ai: true, alerts: [] },
  { id: "c4", name: "Arena B — обзор", zone: "Arena B", zoneColor: "#8b5cf6", status: "online", people: 4, activity: "высокая", fps: 25, res: "1080p", ai: false, alerts: [] },
  { id: "c5", name: "VR Solo", zone: "VR Solo", zoneColor: "#ec4899", status: "online", people: 1, activity: "средняя", fps: 30, res: "4K", ai: true, alerts: [] },
  { id: "c6", name: "Racing Zone", zone: "Racing Zone", zoneColor: "#f59e0b", status: "online", people: 2, activity: "высокая", fps: 60, res: "1080p", ai: true, alerts: ["Перегрев шлема"] },
  { id: "c7", name: "Ресепшн", zone: "Ресепшн", zoneColor: "#10b981", status: "online", people: 2, activity: "низкая", fps: 15, res: "720p", ai: false, alerts: [] },
  { id: "c8", name: "Склад", zone: "Склад", zoneColor: "#6b7280", status: "offline", people: 0, activity: "нет сигнала", fps: 0, res: "—", ai: false, alerts: ["Нет сигнала"] },
];

const AI_STATS = [
  { icon: Users, label: "Посетителей сейчас", value: "17", change: "+3 за час", color: "text-blue-400" },
  { icon: Activity, label: "Загрузка парка", value: "78%", change: "Высокая", color: "text-emerald-400" },
  { icon: TrendingUp, label: "Пиковое время", value: "18:00–20:00", change: "Прогноз AI", color: "text-violet-400" },
  { icon: AlertTriangle, label: "Инцидентов", value: "1", change: "Требует внимания", color: "text-amber-400" },
];

const INCIDENTS = [
  { time: "15:42", zone: "Racing Zone", type: "warning", msg: "Перегрев шлема #3 — рекомендована замена" },
  { time: "14:10", zone: "Arena A", type: "info", msg: "Загрузка зоны снизилась до 25% — возможна промо-акция" },
  { time: "13:55", zone: "Ресепшн", type: "info", msg: "AI: наплыв гостей ожидается в 16:00 (+12 чел.)" },
];

function CameraCard({ cam, expanded, onExpand }: { cam: typeof CAMERAS[0]; expanded: boolean; onExpand: () => void }) {
  const [refreshing, setRefreshing] = useState(false);

  const refresh = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  return (
    <div
      onClick={onExpand}
      className={cn(
        "rounded-xl border bg-card/30 overflow-hidden cursor-pointer transition-all hover:border-primary/40 group",
        cam.status === "offline" ? "border-border/30 opacity-60" : "border-border/50",
        expanded ? "border-primary/50 ring-1 ring-primary/20" : ""
      )}
    >
      {/* Camera preview */}
      <div className="relative bg-black/80" style={{ aspectRatio: "16/9" }}>
        {cam.status === "online" ? (
          <div
            className="w-full h-full flex items-center justify-center relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${cam.zoneColor}15 0%, ${cam.zoneColor}30 100%)` }}
          >
            {/* Simulated camera view */}
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 20px, ${cam.zoneColor}40 20px, ${cam.zoneColor}40 21px),
                repeating-linear-gradient(90deg, transparent, transparent 20px, ${cam.zoneColor}40 20px, ${cam.zoneColor}40 21px)`
            }} />
            <Camera className="w-8 h-8 opacity-20" style={{ color: cam.zoneColor }} />
            {/* People dots */}
            {Array.from({ length: cam.people }).map((_, i) => (
              <div
                key={i}
                className="absolute w-5 h-5 rounded-full flex items-center justify-center border-2"
                style={{
                  backgroundColor: cam.zoneColor + "30",
                  borderColor: cam.zoneColor + "80",
                  left: `${20 + i * 22}%`,
                  top: `${35 + (i % 2) * 20}%`,
                }}
              >
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cam.zoneColor }} />
              </div>
            ))}
            {/* Live pulse */}
            <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 rounded-full px-1.5 py-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] text-white font-mono">LIVE</span>
            </div>
            {cam.ai && (
              <div className="absolute top-2 right-8 bg-violet-600/80 rounded-full px-1.5 py-0.5">
                <span className="text-[9px] text-white font-semibold flex items-center gap-0.5"><Brain className="w-2.5 h-2.5" /> AI</span>
              </div>
            )}
            {cam.alerts.length > 0 && (
              <div className="absolute bottom-2 left-2 bg-amber-600/90 rounded-full px-1.5 py-0.5 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-white" />
                <span className="text-[9px] text-white font-medium">{cam.alerts[0]}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <WifiOff className="w-7 h-7 text-muted-foreground/40" />
            <span className="text-xs text-muted-foreground/50">Нет сигнала</span>
          </div>
        )}
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={refresh} className="w-6 h-6 rounded-lg bg-black/60 flex items-center justify-center hover:bg-black/80">
            <RefreshCw className={cn("w-3 h-3 text-white/70", refreshing && "animate-spin")} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onExpand(); }} className="w-6 h-6 rounded-lg bg-black/60 flex items-center justify-center hover:bg-black/80">
            <Maximize2 className="w-3 h-3 text-white/70" />
          </button>
        </div>
      </div>

      {/* Camera info */}
      <div className="p-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-semibold leading-tight truncate">{cam.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: cam.zoneColor }} />
              <span className="text-[10px] text-muted-foreground truncate">{cam.zone}</span>
            </div>
          </div>
          <div className={cn("w-1.5 h-1.5 rounded-full shrink-0 mt-1.5", cam.status === "online" ? "bg-emerald-400" : "bg-red-500")} />
        </div>
        <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-0.5"><Users className="w-2.5 h-2.5" />{cam.people}</span>
          <span className="flex items-center gap-0.5"><Eye className="w-2.5 h-2.5" />{cam.res}</span>
          {cam.status === "online" && <span className="flex items-center gap-0.5"><Zap className="w-2.5 h-2.5" />{cam.fps}fps</span>}
        </div>
      </div>
    </div>
  );
}

export default function Cameras() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "online" | "ai" | "alerts">("all");

  const filtered = CAMERAS.filter(c => {
    if (filter === "online") return c.status === "online";
    if (filter === "ai") return c.ai;
    if (filter === "alerts") return c.alerts.length > 0;
    return true;
  });

  const onlineCount = CAMERAS.filter(c => c.status === "online").length;
  const totalPeople = CAMERAS.reduce((s, c) => s + c.people, 0);
  const alertCount = CAMERAS.reduce((s, c) => s + c.alerts.length, 0);

  return (
    <div className="flex flex-col h-full">
      <header className="h-14 border-b border-border/50 flex items-center px-4 md:px-6 bg-card/50 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <h1 className="text-lg font-bold font-mono">Камеры</h1>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-muted-foreground">{onlineCount}/{CAMERAS.length} онлайн</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {alertCount > 0 && (
            <Badge variant="destructive" className="text-xs gap-1">
              <AlertTriangle className="w-3 h-3" /> {alertCount} инцидент
            </Badge>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-auto p-4 md:p-6 pb-20 md:pb-6">

        {/* AI stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {AI_STATS.map(stat => (
            <div key={stat.label} className="rounded-xl border border-border/50 bg-card/30 p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <stat.icon className={cn("w-3.5 h-3.5", stat.color)} />
                <span className="text-[10px] text-muted-foreground leading-tight">{stat.label}</span>
              </div>
              <p className="text-lg font-black">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{stat.change}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 mb-4">
          {(["all", "online", "ai", "alerts"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                filter === f
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border/50 bg-card/20 text-muted-foreground hover:border-border"
              )}
            >
              {f === "all" ? `Все (${CAMERAS.length})` : f === "online" ? `Онлайн (${onlineCount})` : f === "ai" ? "AI камеры" : `Инциденты (${alertCount})`}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <Brain className="w-3 h-3 text-violet-400" />
            <span>AI-мониторинг активен</span>
          </div>
        </div>

        {/* Camera grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
          {filtered.map(cam => (
            <CameraCard
              key={cam.id}
              cam={cam}
              expanded={expandedId === cam.id}
              onExpand={() => setExpandedId(expandedId === cam.id ? null : cam.id)}
            />
          ))}
        </div>

        {/* Incidents log */}
        <div className="rounded-xl border border-border/50 bg-card/20 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">AI-лог событий</h2>
            </div>
            <span className="text-[10px] text-muted-foreground">Сегодня</span>
          </div>
          <div className="divide-y divide-border/20">
            {INCIDENTS.map((inc, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3">
                <div className={cn("w-1.5 h-1.5 rounded-full mt-1.5 shrink-0", inc.type === "warning" ? "bg-amber-400" : "bg-blue-400")} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-mono text-muted-foreground">{inc.time}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted/40 text-muted-foreground">{inc.zone}</span>
                  </div>
                  <p className="text-xs text-foreground/80">{inc.msg}</p>
                </div>
                {inc.type === "warning" && (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
