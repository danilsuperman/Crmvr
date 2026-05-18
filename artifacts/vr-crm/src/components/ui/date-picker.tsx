import { useState, useRef, useEffect } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { ru } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  trigger: React.ReactNode;
  align?: "left" | "right" | "center";
}

export function DatePicker({ value, onChange, trigger, align = "left" }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(value);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const monthStart = startOfMonth(viewMonth);
  const monthEnd = endOfMonth(monthStart);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });

  const days: Date[] = [];
  let d = calStart;
  while (d <= monthEnd || days.length % 7 !== 0) {
    days.push(d);
    d = addDays(d, 1);
    if (days.length > 42) break;
  }

  const DOW = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

  const alignClass =
    align === "right"
      ? "right-0"
      : align === "center"
      ? "left-1/2 -translate-x-1/2"
      : "left-0";

  return (
    <div className="relative" ref={ref}>
      <div
        onClick={() => setOpen((v) => !v)}
        className="cursor-pointer"
      >
        {trigger}
      </div>

      {open && (
        <div
          className={cn(
            "absolute top-full mt-2 z-50 w-72",
            "bg-card border border-border/70 rounded-xl shadow-2xl p-3",
            alignClass
          )}
        >
          {/* Month nav */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setViewMonth(subMonths(viewMonth, 1))}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-semibold capitalize">
              {format(viewMonth, "LLLL yyyy", { locale: ru })}
            </span>
            <button
              onClick={() => setViewMonth(addMonths(viewMonth, 1))}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Day of week headers */}
          <div className="grid grid-cols-7 mb-1">
            {DOW.map((d) => (
              <div
                key={d}
                className="text-center text-[10px] font-semibold text-muted-foreground py-1"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-y-0.5">
            {days.map((day, idx) => {
              const inMonth = isSameMonth(day, viewMonth);
              const selected = isSameDay(day, value);
              const today = isToday(day);

              return (
                <button
                  key={idx}
                  onClick={() => {
                    onChange(day);
                    setOpen(false);
                  }}
                  className={cn(
                    "h-8 w-8 mx-auto rounded-lg text-xs font-medium transition-all duration-150",
                    !inMonth && "text-muted-foreground/30",
                    inMonth && !selected && !today && "hover:bg-muted/60 text-foreground",
                    today && !selected && "text-primary font-bold ring-1 ring-primary/40",
                    selected && "bg-primary text-primary-foreground shadow-sm",
                  )}
                >
                  {format(day, "d")}
                </button>
              );
            })}
          </div>

          {/* Today shortcut */}
          <div className="mt-2 pt-2 border-t border-border/40 flex justify-center">
            <button
              onClick={() => {
                const t = new Date();
                onChange(t);
                setViewMonth(t);
                setOpen(false);
              }}
              className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Сегодня
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
