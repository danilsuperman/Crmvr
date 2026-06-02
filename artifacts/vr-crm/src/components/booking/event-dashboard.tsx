import { useState } from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { X, Users, Clock, MapPin, FileText, Package, Trash2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookingRow {
  id: number;
  clientName: string | null;
  clientPhone: string | null;
  zoneId: number | null;
  zoneName: string | null;
  zoneColor: string | null;
  guestsCount: number;
  startTime: string;
  endTime: string;
  status: string;
  notes: string | null;
  adminName: string | null;
  packageId: number | null;
}

interface EventPackage {
  id: number;
  name: string;
  description: string | null;
  zoneIds: number[];
  maxGuests: number;
}

interface Zone {
  id: number;
  name: string;
  color: string;
  capacity: number;
}

interface EventDashboardProps {
  bookings: BookingRow[];
  pkg: EventPackage;
  zones: Zone[];
  onClose: () => void;
  onEditBooking: (booking: BookingRow) => void;
  onDelete?: () => void;
}

function statusLabel(s: string) {
  switch (s) {
    case "confirmed": return "Подтверждено";
    case "pending": return "Ожидание";
    case "cancelled": return "Отменено";
    case "event": return "Мероприятие";
    default: return s;
  }
}

function statusColor(s: string) {
  switch (s) {
    case "confirmed": return "text-emerald-400 bg-emerald-500/15 border-emerald-500/30";
    case "pending": return "text-amber-400 bg-amber-500/15 border-amber-500/30";
    case "cancelled": return "text-red-400 bg-red-500/15 border-red-500/30";
    case "event": return "text-blue-400 bg-blue-500/15 border-blue-500/30";
    default: return "text-muted-foreground bg-muted/30 border-border";
  }
}

export function EventDashboard({ bookings, pkg, zones, onClose, onEditBooking, onDelete }: EventDashboardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const rep = bookings[0];
  if (!rep) return null;

  const start = new Date(rep.startTime);
  const end = new Date(rep.endTime);
  const durationMin = Math.round((end.getTime() - start.getTime()) / 60000);
  const durationH = Math.floor(durationMin / 60);
  const durationM = durationMin % 60;
  const durationStr = durationH > 0
    ? `${durationH}ч${durationM > 0 ? ` ${durationM}м` : ""}`
    : `${durationM}м`;

  const pkgZones = zones.filter((z) => pkg.zoneIds.includes(z.id));

  const stageLabels = [
    { time: format(start, "HH:mm"), label: "Сбор гостей" },
    { time: format(new Date(start.getTime() + 15 * 60000), "HH:mm"), label: "Инструктаж" },
    { time: format(new Date(start.getTime() + 30 * 60000), "HH:mm"), label: "Начало игры" },
    { time: format(end, "HH:mm"), label: "Завершение" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-4xl max-h-[92vh] md:max-h-[90vh] bg-card border border-border/70 rounded-t-2xl md:rounded-2xl shadow-2xl overflow-hidden flex flex-col">

        {/* Header */}
        <div
          className="px-4 md:px-5 py-3 md:py-4 border-b border-border/50 flex items-start justify-between shrink-0"
          style={{ borderTopColor: "transparent", background: `linear-gradient(135deg, ${pkg.zoneIds.length > 0 ? (zones.find(z => z.id === pkg.zoneIds[0])?.color ?? "#6366f1") + "20" : "#6366f120"}, transparent)` }}
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <Package className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider">Мероприятие</span>
            </div>
            <h2 className="text-base md:text-lg font-bold leading-snug truncate">
              🎉 {rep.clientName || "Гости"} · {rep.guestsCount} гостей
            </h2>
            <div className="text-xs md:text-sm text-muted-foreground mt-0.5 truncate">
              {pkg.name} · {format(start, "d MMMM, HH:mm", { locale: ru })} – {format(end, "HH:mm")}
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            {onDelete && (
              <button
                onClick={() => setConfirmDelete(true)}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-500/20 text-muted-foreground hover:text-red-400 transition-colors"
                title="Удалить мероприятие"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Delete confirmation bar */}
        {confirmDelete && (
          <div className="shrink-0 px-4 md:px-5 py-3 bg-red-500/10 border-b border-red-500/30 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <div className="flex items-start gap-2 text-sm text-red-300 flex-1">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span className="text-xs">Удалить мероприятие и все связанные брони? Это действие необратимо.</span>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <button
                onClick={() => setConfirmDelete(false)}
                className="h-7 px-3 rounded-lg text-xs font-semibold border border-border/50 text-muted-foreground hover:bg-muted/40 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={() => { onDelete?.(); setConfirmDelete(false); }}
                className="h-7 px-3 rounded-lg text-xs font-semibold bg-red-500/20 border border-red-500/50 text-red-300 hover:bg-red-500/30 transition-colors"
              >
                Удалить
              </button>
            </div>
          </div>
        )}

        {/* Content — vertical stack on mobile, 3-column on desktop */}
        <div className="flex flex-col md:flex-row flex-1 overflow-auto md:overflow-hidden divide-y md:divide-y-0 md:divide-x divide-border/40">

          {/* Timeline — horizontal scroll on mobile, vertical on desktop */}
          <div className="shrink-0 px-4 py-3 md:p-4 md:w-52 md:overflow-y-auto">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 md:mb-3">
              Таймлайн
            </h3>
            {/* Mobile: horizontal pills row */}
            <div className="flex gap-0 overflow-x-auto md:hidden pb-1">
              {stageLabels.map((s, i) => (
                <div key={i} className="flex items-center shrink-0">
                  <div className="flex flex-col items-center px-3 first:pl-0">
                    <div className="text-[10px] font-mono text-primary font-bold">{s.time}</div>
                    <div className="w-2 h-2 rounded-full bg-primary my-1 shrink-0" />
                    <div className="text-[10px] text-foreground/70 text-center whitespace-nowrap">{s.label}</div>
                  </div>
                  {i < stageLabels.length - 1 && (
                    <div className="h-px w-6 bg-border/50 self-center mb-4 shrink-0" />
                  )}
                </div>
              ))}
            </div>
            {/* Desktop: vertical stack */}
            <div className="hidden md:block space-y-0">
              {stageLabels.map((s, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1 shrink-0" />
                    {i < stageLabels.length - 1 && (
                      <div className="w-px flex-1 bg-border/50 my-1" style={{ minHeight: 28 }} />
                    )}
                  </div>
                  <div className="pb-4">
                    <div className="text-xs font-mono text-primary font-bold">{s.time}</div>
                    <div className="text-xs text-foreground/80 mt-0.5">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Zones */}
          <div className="px-4 py-3 md:p-4 md:flex-1 md:overflow-y-auto">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 md:mb-3">
              Зоны мероприятия
            </h3>
            <div className="grid grid-cols-2 gap-2 md:gap-3">
              {pkgZones.map((zone) => {
                const zoneBooking = bookings.find((b) => b.zoneId === zone.id);
                return (
                  <div
                    key={zone.id}
                    className="rounded-xl border border-border/60 bg-muted/20 p-2.5 md:p-3 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => zoneBooking && onEditBooking(zoneBooking)}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: zone.color }} />
                      <span className="font-semibold text-xs md:text-sm truncate">{zone.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Users className="w-3 h-3 shrink-0" />
                      <span>до {zone.capacity} чел.</span>
                    </div>
                    {zoneBooking && (
                      <div className={cn(
                        "mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block border",
                        statusColor(zoneBooking.status)
                      )}>
                        {statusLabel(zoneBooking.status)}
                      </div>
                    )}
                  </div>
                );
              })}
              {pkgZones.length === 0 && (
                <p className="col-span-2 text-xs text-muted-foreground">Зоны не назначены</p>
              )}
            </div>
          </div>

          {/* Details — 2-col grid on mobile, vertical stack on desktop */}
          <div className="shrink-0 px-4 py-3 md:p-4 md:w-56 md:overflow-y-auto">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 md:mb-3">
              Детали
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-1 gap-2 md:gap-0 md:space-y-3">
              <div className="flex items-start gap-2">
                <Users className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <div className="text-[10px] text-muted-foreground">Гостей</div>
                  <div className="text-sm font-semibold">{rep.guestsCount} / {pkg.maxGuests}</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <div className="text-[10px] text-muted-foreground">Длительность</div>
                  <div className="text-sm font-semibold">{durationStr}</div>
                </div>
              </div>
              {rep.clientPhone && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <div className="text-[10px] text-muted-foreground">Телефон</div>
                    <div className="text-sm font-semibold">{rep.clientPhone}</div>
                  </div>
                </div>
              )}
              {rep.adminName && (
                <div className="flex items-start gap-2">
                  <FileText className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <div className="text-[10px] text-muted-foreground">Администратор</div>
                    <div className="text-sm font-semibold">{rep.adminName}</div>
                  </div>
                </div>
              )}
              {rep.notes && (
                <div className="col-span-2 md:col-span-1 rounded-lg bg-muted/30 border border-border/40 p-2.5">
                  <div className="text-[10px] text-muted-foreground mb-1">Заметки</div>
                  <div className="text-xs">{rep.notes}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
