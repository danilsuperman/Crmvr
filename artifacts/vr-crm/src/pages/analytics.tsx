import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import { TrendingUp, TrendingDown, Users, Calendar, Clock, DollarSign, BarChart3 } from "lucide-react";

const revenueData = [
  { day: "Пн", revenue: 42000, checks: 14 },
  { day: "Вт", revenue: 38000, checks: 12 },
  { day: "Ср", revenue: 55000, checks: 18 },
  { day: "Чт", revenue: 48000, checks: 16 },
  { day: "Пт", revenue: 72000, checks: 24 },
  { day: "Сб", revenue: 95000, checks: 31 },
  { day: "Вс", revenue: 88000, checks: 28 },
];

const monthlyData = [
  { month: "Янв", revenue: 820000, fot: 180000, profit: 640000 },
  { month: "Фев", revenue: 750000, fot: 175000, profit: 575000 },
  { month: "Мар", revenue: 910000, fot: 185000, profit: 725000 },
  { month: "Апр", revenue: 870000, fot: 180000, profit: 690000 },
  { month: "Май", revenue: 438000, fot: 90000, profit: 348000 },
];

const zoneLoadData = [
  { name: "Arena A", load: 78, sessions: 142, avgTime: 38 },
  { name: "Arena B", load: 65, sessions: 98, avgTime: 45 },
  { name: "VR Solo", load: 82, sessions: 61, avgTime: 54 },
  { name: "Racing", load: 55, sessions: 44, avgTime: 32 },
  { name: "PS5", load: 48, sessions: 38, avgTime: 60 },
  { name: "Motion", load: 71, sessions: 55, avgTime: 28 },
];

const peakHoursData = [
  { hour: "10:00", visits: 8 },
  { hour: "11:00", visits: 14 },
  { hour: "12:00", visits: 22 },
  { hour: "13:00", visits: 28 },
  { hour: "14:00", visits: 35 },
  { hour: "15:00", visits: 42 },
  { hour: "16:00", visits: 38 },
  { hour: "17:00", visits: 45 },
  { hour: "18:00", visits: 52 },
  { hour: "19:00", visits: 48 },
  { hour: "20:00", visits: 35 },
  { hour: "21:00", visits: 22 },
];

const gamesPopularity = [
  { name: "Beat Saber", value: 28 },
  { name: "Pistol Whip", value: 22 },
  { name: "Half-Life: Alyx", value: 18 },
  { name: "GT7 VR", value: 14 },
  { name: "Другие", value: 18 },
];

const PIE_COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

const clientTypes = [
  { name: "Новые", value: 38 },
  { name: "Повторные", value: 62 },
];

function StatCard({ label, value, sub, trend, icon: Icon, color }: {
  label: string; value: string; sub?: string; trend?: number;
  icon: React.ComponentType<{ className?: string }>; color: string;
}) {
  return (
    <Card className="bg-card/30 border-border/50">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", color)}>
            <Icon className="w-4.5 h-4.5" />
          </div>
          {trend !== undefined && (
            <div className={cn("flex items-center gap-0.5 text-[10px] font-medium", trend >= 0 ? "text-green-400" : "text-red-400")}>
              {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        <p className="text-xl font-bold">{value}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
        {sub && <p className="text-[10px] text-muted-foreground/70 mt-0.5">{sub}</p>}
      </CardContent>
    </Card>
  );
}

export default function Analytics() {
  const [period, setPeriod] = useState<"week" | "month">("week");

  const todayRevenue = 72000;
  const todayFOT = 18000;
  const todayProfit = todayRevenue - todayFOT;

  return (
    <div className="flex flex-col h-full">
      <header className="h-14 border-b border-border/50 flex items-center px-4 md:px-6 bg-card/50 backdrop-blur-sm shrink-0">
        <h1 className="text-lg font-bold font-mono">Аналитика</h1>
      </header>

      <div className="flex-1 p-4 md:p-6 overflow-auto pb-20 md:pb-6">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="mb-4 bg-muted/30 border border-border/50 h-9">
            <TabsTrigger value="general" className="text-xs">Общая</TabsTrigger>
            <TabsTrigger value="zones" className="text-xs">По зонам</TabsTrigger>
            <TabsTrigger value="finances" className="text-xs">Финансы</TabsTrigger>
          </TabsList>

          {/* General analytics */}
          <TabsContent value="general" className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard label="Бронирований (нед.)" value="143" trend={12} icon={Calendar} color="bg-indigo-500/15 text-indigo-400" />
              <StatCard label="Клиентов (нед.)" value="98" trend={8} icon={Users} color="bg-purple-500/15 text-purple-400" />
              <StatCard label="Гостей (нед.)" value="312" trend={5} icon={Users} color="bg-pink-500/15 text-pink-400" />
              <StatCard label="Загрузка парка" value="71%" trend={3} icon={BarChart3} color="bg-blue-500/15 text-blue-400" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-card/30 border-border/50 col-span-2 md:col-span-1">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm">Тип клиентов</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="flex items-center justify-center gap-4">
                    <PieChart width={120} height={120}>
                      <Pie data={clientTypes} cx={55} cy={55} innerRadius={35} outerRadius={55} dataKey="value" paddingAngle={2}>
                        <Cell fill="#6366f1" />
                        <Cell fill="#10b981" />
                      </Pie>
                    </PieChart>
                    <div className="space-y-2">
                      {clientTypes.map((c, i) => (
                        <div key={c.name} className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: i === 0 ? "#6366f1" : "#10b981" }} />
                          <span className="text-xs text-muted-foreground">{c.name}</span>
                          <span className="text-xs font-semibold ml-auto">{c.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/30 border-border/50 col-span-2 md:col-span-1">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm">Популярные игры</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="space-y-2">
                    {gamesPopularity.map((g, i) => (
                      <div key={g.name} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground truncate">{g.name}</span>
                          <span className="font-medium ml-2 shrink-0">{g.value}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${g.value}%`, backgroundColor: PIE_COLORS[i] }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card/30 border-border/50">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm">Бронирования по дням</CardTitle>
              </CardHeader>
              <CardContent className="px-2 pb-4">
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={revenueData} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }} />
                    <Bar dataKey="checks" name="Брони" fill="#6366f1" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Zone analytics */}
          <TabsContent value="zones" className="space-y-4">
            <Card className="bg-card/30 border-border/50">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm">Загрузка зон</CardTitle>
              </CardHeader>
              <CardContent className="px-2 pb-4">
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={zoneLoadData} layout="vertical" margin={{ top: 0, right: 8, left: 50, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} unit="%" />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }} formatter={(v) => [`${v}%`, "Загрузка"]} />
                    <Bar dataKey="load" fill="#8b5cf6" radius={[0, 3, 3, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid gap-2">
              {zoneLoadData.map((z) => (
                <div key={z.name} className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-card/30">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-sm font-semibold">{z.name}</p>
                      <span className={cn("text-xs font-bold", z.load > 75 ? "text-green-400" : z.load > 50 ? "text-yellow-400" : "text-muted-foreground")}>
                        {z.load}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden mb-2">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${z.load}%` }} />
                    </div>
                    <div className="flex gap-4 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {z.sessions} сессий</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Ср. {z.avgTime} мин</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Card className="bg-card/30 border-border/50">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm">Часы пик</CardTitle>
              </CardHeader>
              <CardContent className="px-2 pb-4">
                <ResponsiveContainer width="100%" height={150}>
                  <LineChart data={peakHoursData} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis dataKey="hour" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }} />
                    <Line type="monotone" dataKey="visits" name="Посещений" stroke="#ec4899" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Finances */}
          <TabsContent value="finances" className="space-y-4">
            <div className="flex gap-2">
              <button
                onClick={() => setPeriod("week")}
                className={cn("text-xs px-3 py-1.5 rounded-md border transition-colors", period === "week" ? "bg-primary text-primary-foreground border-primary" : "border-border/50 text-muted-foreground hover:bg-muted/30")}
              >
                Неделя
              </button>
              <button
                onClick={() => setPeriod("month")}
                className={cn("text-xs px-3 py-1.5 rounded-md border transition-colors", period === "month" ? "bg-primary text-primary-foreground border-primary" : "border-border/50 text-muted-foreground hover:bg-muted/30")}
              >
                Месяц
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Выручка сегодня", value: `${todayRevenue.toLocaleString("ru")} ₽`, color: "text-green-400", icon: DollarSign, bg: "bg-green-500/15" },
                { label: "ФОТ сегодня", value: `${todayFOT.toLocaleString("ru")} ₽`, color: "text-yellow-400", icon: Users, bg: "bg-yellow-500/15" },
                { label: "Прибыль сегодня", value: `${todayProfit.toLocaleString("ru")} ₽`, color: "text-blue-400", icon: TrendingUp, bg: "bg-blue-500/15" },
              ].map((item) => (
                <Card key={item.label} className="bg-card/30 border-border/50">
                  <CardContent className="p-3">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-2", item.bg)}>
                      <item.icon className={cn("w-4 h-4", item.color)} />
                    </div>
                    <p className={cn("text-base font-bold", item.color)}>{item.value}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{item.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-card/30 border-border/50">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm">Выручка {period === "week" ? "за неделю" : "за 5 месяцев"}</CardTitle>
              </CardHeader>
              <CardContent className="px-2 pb-4">
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={period === "week" ? revenueData : monthlyData} margin={{ top: 0, right: 8, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis dataKey={period === "week" ? "day" : "month"} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }} formatter={(v: number) => [`${v.toLocaleString("ru")} ₽`]} />
                    <Bar dataKey="revenue" name="Выручка" fill="#6366f1" radius={[3, 3, 0, 0]} />
                    {period === "month" && <Bar dataKey="profit" name="Прибыль" fill="#10b981" radius={[3, 3, 0, 0]} />}
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {period === "month" && (
              <div className="grid gap-2">
                {monthlyData.slice().reverse().map((m) => (
                  <div key={m.month} className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-card/30">
                    <div className="w-10 text-xs font-bold text-muted-foreground">{m.month}</div>
                    <div className="flex-1 grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <p className="text-muted-foreground text-[10px]">Выручка</p>
                        <p className="font-semibold text-green-400">{(m.revenue / 1000).toFixed(0)}k ₽</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-[10px]">ФОТ</p>
                        <p className="font-semibold text-yellow-400">{(m.fot / 1000).toFixed(0)}k ₽</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-[10px]">Прибыль</p>
                        <p className="font-semibold text-blue-400">{(m.profit / 1000).toFixed(0)}k ₽</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Card className="bg-card/30 border-border/50">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm">Средний чек (нед.)</CardTitle>
              </CardHeader>
              <CardContent className="px-2 pb-4">
                <ResponsiveContainer width="100%" height={130}>
                  <LineChart data={revenueData.map(d => ({ ...d, avg: Math.round(d.revenue / d.checks) }))} margin={{ top: 0, right: 8, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${v}₽`} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }} formatter={(v: number) => [`${v.toLocaleString("ru")} ₽`, "Ср. чек"]} />
                    <Line type="monotone" dataKey="avg" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
