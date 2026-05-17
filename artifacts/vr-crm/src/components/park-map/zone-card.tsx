import { motion, AnimatePresence } from "framer-motion";
import { Users, Clock, ChevronRight, Zap, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { ZoneState, STATUS_CONFIG } from "@/lib/zone-status";
import { format } from "date-fns";

interface ZoneCardProps {
  zone: {
    id: number;
    name: string;
    color: string;
    capacity: number;
  };
  state: ZoneState;
  now: Date;
  onClick: () => void;
  onDoubleClick: () => void;
}

function formatTimer(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return `${h}h ${m.toString().padStart(2, "0")}m`;
  return `${m}m`;
}

function formatTime(iso: string): string {
  return format(new Date(iso), "HH:mm");
}

export function ZoneCard({ zone, state, now, onClick, onDoubleClick }: ZoneCardProps) {
  const cfg = STATUS_CONFIG[state.status];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      data-testid={`zone-card-${zone.id}`}
      className={cn(
        "relative flex flex-col rounded-xl border cursor-pointer select-none overflow-hidden",
        "bg-card/60 backdrop-blur-sm transition-all duration-500",
        cfg.border,
        `shadow-lg ${cfg.glow}`,
        "hover:scale-[1.02] hover:shadow-xl active:scale-[0.99]",
        "min-h-[200px] p-4 gap-3"
      )}
    >
      {/* Pulsing overlay for urgent states */}
      {cfg.pulse && (
        <motion.div
          className={cn("absolute inset-0 rounded-xl", cfg.bg)}
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Zone color accent bar at top */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl"
        style={{ backgroundColor: zone.color }}
      />

      {/* Header row */}
      <div className="relative flex items-start justify-between z-10">
        <div className="flex items-center gap-2">
          <div
            className="w-2.5 h-2.5 rounded-full shrink-0 mt-0.5"
            style={{ backgroundColor: zone.color }}
          />
          <span className="font-semibold text-sm text-foreground leading-tight">
            {zone.name}
          </span>
        </div>
        <StatusBadge status={state.status} cfg={cfg} />
      </div>

      {/* Timer / main metric */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center py-2">
        {state.status === "active" && state.minutesRemaining !== null && (
          <motion.div
            key="active-timer"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="text-3xl font-mono font-bold text-cyan-400 tabular-nums tracking-tight">
              {formatTimer(state.minutesRemaining)}
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider">
              осталось
            </div>
          </motion.div>
        )}

        {state.status === "delayed" && state.minutesOverdue !== null && (
          <motion.div
            key="delayed-timer"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="text-3xl font-mono font-bold text-red-400 tabular-nums tracking-tight">
              +{state.minutesOverdue}m
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider">
              опоздание
            </div>
          </motion.div>
        )}

        {state.status === "waiting" && state.minutesUntilNext !== null && (
          <motion.div
            key="waiting-timer"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="text-3xl font-mono font-bold text-violet-400 tabular-nums tracking-tight">
              {state.minutesUntilNext}m
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider">
              до прихода
            </div>
          </motion.div>
        )}

        {state.status === "cleaning" && (
          <motion.div
            key="cleaning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <Sparkles className="w-8 h-8 text-amber-400 mx-auto mb-1" />
            <div className="text-xs text-amber-400 uppercase tracking-wider">
              Уборка
            </div>
          </motion.div>
        )}

        {state.status === "free" && (
          <motion.div
            key="free"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <Zap className="w-8 h-8 text-emerald-400 mx-auto mb-1 opacity-60" />
            <div className="text-xs text-emerald-400 uppercase tracking-wider">
              Свободно
            </div>
          </motion.div>
        )}
      </div>

      {/* Middle info row */}
      <div className="relative z-10 flex items-center justify-between text-xs">
        {state.activeBooking ? (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="w-3 h-3" />
            <span className="font-medium text-foreground/80">
              {state.activeBooking.guestsCount}
            </span>
            <span>/ {zone.capacity}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="w-3 h-3" />
            <span>макс {zone.capacity}</span>
          </div>
        )}

        {state.activeBooking?.sessionTypeName && (
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
            style={{
              backgroundColor: (state.activeBooking.sessionTypeColor || "#6366f1") + "25",
              color: state.activeBooking.sessionTypeColor || "#a5b4fc",
            }}
          >
            {state.activeBooking.sessionTypeName}
          </span>
        )}
      </div>

      {/* Client name (if active) */}
      {state.activeBooking?.clientName && (
        <div className="relative z-10 text-xs font-medium text-foreground/70 truncate">
          {state.activeBooking.clientName}
        </div>
      )}

      {/* Occupancy bar */}
      {state.status === "active" && (
        <div className="relative z-10">
          <div className="h-1 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: zone.color }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(state.occupancyPercent, 100)}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>
      )}

      {/* Next booking footer */}
      {state.nextBooking && state.status !== "waiting" && (
        <div className="relative z-10 flex items-center gap-1.5 text-[10px] text-muted-foreground border-t border-border/50 pt-2 mt-auto">
          <Clock className="w-3 h-3 shrink-0" />
          <span>Следующий: {formatTime(state.nextBooking.startTime)}</span>
          {state.nextBooking.clientName && (
            <>
              <ChevronRight className="w-2.5 h-2.5 shrink-0" />
              <span className="truncate">{state.nextBooking.clientName}</span>
            </>
          )}
        </div>
      )}

      {/* Hover overlay for quick preview */}
      <div className={cn(
        "absolute inset-0 rounded-xl z-20 opacity-0 hover:opacity-100 transition-opacity duration-200",
        "bg-gradient-to-t from-black/60 via-transparent to-transparent",
        "flex items-end p-3 pointer-events-none"
      )}>
        {state.activeBooking && (
          <div className="text-xs text-white/80 space-y-0.5">
            {state.activeBooking.clientPhone && (
              <div>{state.activeBooking.clientPhone}</div>
            )}
            {state.activeBooking.notes && (
              <div className="text-white/60 truncate">{state.activeBooking.notes}</div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function StatusBadge({
  status,
  cfg,
}: {
  status: string;
  cfg: (typeof STATUS_CONFIG)[keyof typeof STATUS_CONFIG];
}) {
  return (
    <motion.span
      key={status}
      initial={{ opacity: 0, x: 4 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full",
        cfg.color,
        cfg.bg
      )}
    >
      {cfg.label}
    </motion.span>
  );
}
