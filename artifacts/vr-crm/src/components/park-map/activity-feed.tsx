import { motion, AnimatePresence } from "framer-motion";
import { Activity, CheckCircle2, AlertTriangle, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface ActivityItem {
  id: string;
  message: string;
  time: Date;
  type: "info" | "warn" | "success" | "error";
}

interface ActivityFeedProps {
  items: ActivityItem[];
}

const TYPE_CONFIG = {
  info: {
    icon: Info,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    dot: "bg-blue-400",
  },
  success: {
    icon: CheckCircle2,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    dot: "bg-emerald-400",
  },
  warn: {
    icon: AlertTriangle,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    dot: "bg-amber-400",
  },
  error: {
    icon: XCircle,
    color: "text-red-400",
    bg: "bg-red-500/10",
    dot: "bg-red-400",
  },
};

export function ActivityFeed({ items }: ActivityFeedProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 shrink-0">
        <Activity className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Activity
        </span>
        {items.length > 0 && (
          <span className="ml-auto text-[10px] text-muted-foreground">
            {items.length} events
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 gap-2">
            <Activity className="w-6 h-6 text-muted-foreground/30" />
            <p className="text-xs text-muted-foreground/50">No activity yet</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {items.map((item, i) => {
              const cfg = TYPE_CONFIG[item.type];
              const Icon = cfg.icon;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ delay: i * 0.03, duration: 0.2 }}
                  className="flex items-start gap-3 px-4 py-3 border-b border-border/30 hover:bg-muted/10 transition-colors"
                  data-testid={`activity-item-${item.id}`}
                >
                  <div className={cn("p-1 rounded-md shrink-0 mt-0.5", cfg.bg)}>
                    <Icon className={cn("w-3 h-3", cfg.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground/80 leading-snug">
                      {item.message}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {formatDistanceToNow(item.time, { addSuffix: true })}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
