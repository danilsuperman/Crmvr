import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLocalStorage } from "@/lib/store";
import {
  Globe, TrendingUp, Users, Cpu, Zap, AlertTriangle,
  CheckCircle2, Circle, Battery, Wifi, ChevronRight,
  BarChart3, Package, Gamepad2, Star, ArrowUpRight,
  MapPin, Plus, Settings, DollarSign, Activity
} from "lucide-react";
import { Link } from "wouter";

type Park = { id: string; name: string; city: string; status: "online" | "offline"; devices: number; color: string };

const DEFAULT_PARKS: Park[] = [
  { id: "main", name: "VR Park Moscow", city: "Москва", status: "online", devices: 12, color: "#6366f1" },
  { id: "p2", name: "VR Park Dubai", city: "Дубай", status: "online", devices: 8, color: "#3b82f6" },
  { id: "p3", name: "Cyber Arena SPb", city: "СПб", status: "offline", devices: 6, color: "#8b5cf6" },
];

const PARK_METRICS: Record<string, { revenue: number; guests: number; bookings: number; load: number; activeDevices: number; alerts: number; topGame: string }> = {
  main: { revenue: 142800, guests: 1248, bookings: 312, load: 78, activeDevices: 9, alerts: 1, topGame: "Beat Saber" },
  p2: { revenue: 98500, guests: 841, bookings: 198, load: 65, activeDevices: 5, alerts: 0, topGame: "GT7 VR" },
  p3: { revenue: 0, guests: 0, bookings: 0, load: 0, activeDevices: 0, alerts: 3, topGame: "—" },
};

const GLOBAL_ALERTS = [
  { park: "Cyber Arena SPb", msg: "3 устройства offline", severity: "error" as const, time: "10 мин назад" },
  { park: "VR Park Moscow", msg: "Headset A-4 — слабый заряд", severity: "warn" as const, time: "25 мин назад" },
  { park: "VR Park Dubai", msg: "Обновление прошивки доступно", severity: "info" as const, time: "1 ч назад" },
];

const TOP_GAMES_NETWORK = [
  { name: "Beat Saber", bookings: 312, parks: 3, pct: 28 },
  { name: "Zombie Arena", bookings: 245, parks: 2, pct: 22 },
  { name: "GT7 VR", bookings: 198, parks: 2, pct: 18 },
  { name: "Half-Life: Alyx", bookings: 156, parks: 1, pct: 14 },
];

const TOP_PACKAGES_NETWORK = [
  { name: "День рождения VIP", bookings: 89, parks: 2, revenue: 1335000 },
  { name: "Корпоратив Standard", bookings: 43, parks: 3, revenue: 1505000 },
  { name: "Full Park", bookings: 12, parks: 1, revenue: 960000 },
];

export default function Network() {
  const [parks] = useLocalStorage<Park[]>("vrpark_parks", DEFAULT_PARKS);
  const [currentParkId, setCurrentParkId] = useLocalStorage<string>("vrpark_current_park", "main");
  const [filterStatus, setFilterStatus] = useState<"all" | "online" | "offline">("all");

  const totalRevenue = parks.reduce((s, p) => s + (PARK_METRICS[p.id]?.revenue ?? 0), 0);
  const totalGuests = parks.reduce((s, p) => s + (PARK_METRICS[p.id]?.guests ?? 0), 0);
  const totalDevices = parks.reduce((s, p) => s + p.devices, 0);
  const totalActive = parks.reduce((s, p) => s + (PARK_METRICS[p.id]?.activeDevices ?? 0), 0);
  const onlineParks = parks.filter(p => p.status === "online").length;
  const totalAlerts = parks.reduce((s, p) => s + (PARK_METRICS[p.id]?.alerts ?? 0), 0);

  const filteredParks = parks.filter(p => filterStatus === "all" || p.status === filterStatus);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="h-14 border-b border-border/50 flex items-center px-4 md:px-6 bg-card/50 backdrop-blur-sm shrink-0 gap-3">
        <Globe className="w-5 h-5 text-primary shrink-0" />
        <h1 className="text-lg font-bold">Сеть парков</h1>
        <Badge variant="outline" className="text-[10px]">{onlineParks}/{parks.length} online</Badge>
        {totalAlerts > 0 && (
          <Badge variant="destructive" className="text-[10px]">{totalAlerts} alert{totalAlerts > 1 ? "s" : ""}</Badge>
        )}
        <div className="ml-auto flex gap-2">
          <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Добавить парк
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-4 md:p-6 pb-20 md:pb-6 space-y-5">

        {/* Global stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Выручка (месяц)", value: `${(totalRevenue / 1000).toFixed(0)}K ₽`, icon: DollarSign, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
            { label: "Гостей (месяц)", value: totalGuests.toLocaleString("ru"), icon: Users, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
            { label: "Устройств всего", value: `${totalActive}/${totalDevices}`, icon: Cpu, color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20" },
            { label: "Парков online", value: `${onlineParks}/${parks.length}`, icon: Globe, color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
          ].map(s => (
            <Card key={s.label} className={cn("border", s.bg)}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <s.icon className={cn("w-4 h-4", s.color)} />
                  <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground/40" />
                </div>
                <p className={cn("text-xl font-black font-mono", s.color)}>{s.value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Network load heatmap */}
        <Card className="bg-card/30 border-border/50">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Загрузка сети
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-2">
            {parks.map(park => {
              const metrics = PARK_METRICS[park.id];
              const load = metrics?.load ?? 0;
              return (
                <div key={park.id} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: park.color }} />
                  <span className="text-xs w-36 truncate shrink-0">{park.name}</span>
                  <div className="flex-1 h-2 bg-muted/30 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${load}%`, backgroundColor: park.color + (load > 80 ? "ff" : "99") }}
                    />
                  </div>
                  <span className="text-xs font-mono text-muted-foreground w-8 text-right shrink-0">{load}%</span>
                  {park.status === "offline" && <Badge variant="secondary" className="text-[9px] shrink-0">offline</Badge>}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Parks grid */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">Парки</h2>
            <div className="flex gap-1">
              {(["all", "online", "offline"] as const).map(f => (
                <button key={f} onClick={() => setFilterStatus(f)} className={cn("px-2.5 py-1 text-[10px] rounded-lg border transition-colors", filterStatus === f ? "bg-primary text-primary-foreground border-primary" : "border-border/50 text-muted-foreground hover:bg-muted/30")}>
                  {f === "all" ? "Все" : f === "online" ? "Online" : "Offline"}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredParks.map(park => {
              const metrics = PARK_METRICS[park.id] ?? { revenue: 0, guests: 0, bookings: 0, load: 0, activeDevices: 0, alerts: 0, topGame: "—" };
              return (
                <Card
                  key={park.id}
                  className={cn(
                    "border transition-all cursor-pointer hover:shadow-lg group",
                    park.id === currentParkId ? "border-primary/50 bg-primary/5" : "border-border/50 bg-card/30 hover:border-primary/30"
                  )}
                  onClick={() => setCurrentParkId(park.id)}
                >
                  <CardHeader className="pb-2 pt-4 px-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: park.color + "20", border: `1px solid ${park.color}40` }}>
                          <Globe className="w-4 h-4" style={{ color: park.color }} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{park.name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{park.city}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className={cn("w-2 h-2 rounded-full", park.status === "online" ? "bg-green-400 animate-pulse" : "bg-muted-foreground/40")} />
                        <span className="text-[10px] text-muted-foreground">{park.status === "online" ? "Online" : "Offline"}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded-lg bg-muted/20 border border-border/30">
                        <p className="text-muted-foreground text-[10px]">Выручка</p>
                        <p className="font-bold text-green-400">{(metrics.revenue / 1000).toFixed(0)}K ₽</p>
                      </div>
                      <div className="p-2 rounded-lg bg-muted/20 border border-border/30">
                        <p className="text-muted-foreground text-[10px]">Гостей</p>
                        <p className="font-bold">{metrics.guests.toLocaleString("ru")}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-muted/20 border border-border/30">
                        <p className="text-muted-foreground text-[10px]">Устройств</p>
                        <p className="font-bold">{metrics.activeDevices}/{park.devices}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-muted/20 border border-border/30">
                        <p className="text-muted-foreground text-[10px]">Броней</p>
                        <p className="font-bold">{metrics.bookings}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-muted/30 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${metrics.load}%`, backgroundColor: park.color }} />
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground">{metrics.load}%</span>
                    </div>

                    {metrics.alerts > 0 && (
                      <div className="flex items-center gap-1.5 text-[10px] text-orange-400">
                        <AlertTriangle className="w-3 h-3" />
                        {metrics.alerts} alert{metrics.alerts > 1 ? "s" : ""}
                      </div>
                    )}

                    <div className="flex gap-2 pt-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 h-7 text-[10px]"
                        onClick={e => { e.stopPropagation(); setCurrentParkId(park.id); }}
                      >
                        {park.id === currentParkId ? "Текущий" : "Переключиться"}
                      </Button>
                      <Link href="/control" onClick={e => e.stopPropagation()}>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Bottom row: Alerts + Top Games + Top Packages */}
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Global Alerts */}
          <Card className="bg-card/30 border-border/50">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-400" />
                Проблемы сети
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-2">
              {GLOBAL_ALERTS.map((alert, i) => (
                <div key={i} className={cn("flex items-start gap-2.5 p-2.5 rounded-lg border", alert.severity === "error" ? "bg-red-500/5 border-red-500/20" : alert.severity === "warn" ? "bg-orange-500/5 border-orange-500/20" : "bg-blue-500/5 border-blue-500/20")}>
                  <AlertTriangle className={cn("w-3.5 h-3.5 shrink-0 mt-0.5", alert.severity === "error" ? "text-red-400" : alert.severity === "warn" ? "text-orange-400" : "text-blue-400")} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium">{alert.msg}</p>
                    <p className="text-[10px] text-muted-foreground">{alert.park} · {alert.time}</p>
                  </div>
                </div>
              ))}
              {GLOBAL_ALERTS.length === 0 && (
                <div className="flex items-center justify-center h-12 text-xs text-muted-foreground gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  Всё работает нормально
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Games */}
          <Card className="bg-card/30 border-border/50">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm flex items-center gap-2"><Gamepad2 className="w-4 h-4" />Топ игры сети</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-2">
              {TOP_GAMES_NETWORK.map((g, i) => (
                <div key={g.name} className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-muted-foreground w-4 shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium truncate">{g.name}</span>
                      <span className="text-muted-foreground shrink-0 ml-2">{g.bookings}</span>
                    </div>
                    <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
                      <div className="h-full bg-violet-500 rounded-full" style={{ width: `${g.pct}%` }} />
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground w-8 text-right shrink-0">{g.pct}%</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Top Packages */}
          <Card className="bg-card/30 border-border/50">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm flex items-center gap-2"><Package className="w-4 h-4" />Топ пакеты</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-2">
              {TOP_PACKAGES_NETWORK.map((p, i) => (
                <div key={p.name} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/20 border border-border/30">
                  <span className="text-[10px] font-mono text-muted-foreground w-4 shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{p.name}</p>
                    <p className="text-[10px] text-muted-foreground">{p.bookings} броней · {p.parks} парк{p.parks > 1 ? "а" : ""}</p>
                  </div>
                  <p className="text-xs font-bold text-green-400 shrink-0">{(p.revenue / 1000).toFixed(0)}K</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
