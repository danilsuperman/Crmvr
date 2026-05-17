import { motion } from "framer-motion";
import { Activity, Users, Clock, AlertTriangle, Zap, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ZoneState } from "@/lib/zone-status";

interface SummaryPanelProps {
  zones: Array<{ id: number; name: string; capacity: number }>;
  zoneStates: Map<number, ZoneState>;
  totalBookingsToday: number;
}

export function SummaryPanel({ zones, zoneStates, totalBookingsToday }: SummaryPanelProps) {
  const states = zones.map((z) => zoneStates.get(z.id));

  const activeZones = states.filter((s) => s?.status === "active").length;
  const freeZones = states.filter((s) => s?.status === "free").length;
  const delayedGroups = states.filter((s) => s?.status === "delayed").length;
  const waitingZones = states.filter((s) => s?.status === "waiting").length;

  const totalGuests = states.reduce((sum, s) => {
    if (s?.activeBooking && s.status === "active") {
      return sum + s.activeBooking.guestsCount;
    }
    return sum;
  }, 0);

  const upcomingCount = states.filter(
    (s) => s?.nextBooking && (s.minutesUntilNext ?? 999) <= 60
  ).length;

  const loadPercent =
    zones.length > 0 ? Math.round((activeZones / zones.length) * 100) : 0;

  const items = [
    {
      icon: Activity,
      label: "Активных зон",
      value: `${activeZones} / ${zones.length}`,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
    },
    {
      icon: Users,
      label: "Гостей сейчас",
      value: totalGuests.toString(),
      color: "text-violet-400",
      bg: "bg-violet-500/10",
    },
    {
      icon: Clock,
      label: "В течение часа",
      value: upcomingCount.toString(),
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      icon: AlertTriangle,
      label: "Опаздывают",
      value: delayedGroups.toString(),
      color: delayedGroups > 0 ? "text-red-400" : "text-muted-foreground",
      bg: delayedGroups > 0 ? "bg-red-500/10" : "bg-muted/10",
    },
    {
      icon: Zap,
      label: "Свободных зон",
      value: freeZones.toString(),
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
  ];

  return (
    <div className="flex items-center gap-3 px-4 py-2 border-b border-border/50 bg-background/40 backdrop-blur shrink-0 overflow-x-auto">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className={cn(
            "flex items-center gap-2.5 px-3 py-1.5 rounded-lg shrink-0",
            item.bg
          )}
          data-testid={`summary-${item.label.toLowerCase().replace(/\s/g, "-")}`}
        >
          <item.icon className={cn("w-3.5 h-3.5", item.color)} />
          <div>
            <div className={cn("text-sm font-bold tabular-nums leading-none", item.color)}>
              {item.value}
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5 leading-none">
              {item.label}
            </div>
          </div>
        </motion.div>
      ))}

      {/* Load bar */}
      <div className="flex items-center gap-2 ml-auto shrink-0">
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Загрузка</span>
        <div className="w-24 h-1.5 rounded-full bg-white/5 overflow-hidden">
          <motion.div
            className={cn(
              "h-full rounded-full",
              loadPercent > 80
                ? "bg-red-500"
                : loadPercent > 50
                ? "bg-amber-500"
                : "bg-emerald-500"
            )}
            initial={{ width: 0 }}
            animate={{ width: `${loadPercent}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        <span className="text-xs font-bold tabular-nums text-foreground/70">
          {loadPercent}%
        </span>
      </div>
    </div>
  );
}
