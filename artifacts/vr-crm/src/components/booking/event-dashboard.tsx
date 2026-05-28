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
      <div className="relative z-10 w-full max-w-4xl max-h-[90vh] bg-card border border-border/70 rounded-t-2xl md:rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div
          className="px-5 py-4 border-b border-border/50 flex items-start justify-between shrink-0"
          style={{ borderTopColor: "transparent", background: `linear-gradient(135deg, ${pkg.zoneIds.length > 0 ? (zones.find(z => z.id === pkg.zoneIds[0])?.color ?? "#6366f1") + "20" : "#6366f120"}, transparent)` }}
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Package className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Мероприятие</span>
            </div>
            <h2 className="text-lg font-bold">
              🎉 {rep.clientName || "Гости"} · {rep.guestsCount} гостей
            </h2>
            <div className="text-sm text-muted-foreground mt-0.5">
              {pkg.name} · {format(start, "d MMMM, HH:mm", { locale: ru })} – {format(end, "HH:mm")}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
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
          <div className="shrink-0 px-5 py-3 bg-red-500/10 border-b border-red-500/30 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-red-300">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>Удалить мероприятие и все связанные брони? Это действие необратимо.</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
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

        {/* Content */}
        <div className="flex flex-1 overflow-hidden divide-x divide-border/40">
          {/* Left: Timeline */}
          <div className="w-52 shrink-0 p-4 overflow-y-auto">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Таймлайн
            </h3>
            <div className="space-y-0">
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

          {/* Center: Zones */}
          <div className="flex-1 p-4 overflow-y-auto">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Зоны мероприятия
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {pkgZones.map((zone) => {
                const zoneBooking = bookings.find((b) => b.zoneId === zone.id);
                return (
                  <div
                    key={zone.id}
                    className="rounded-xl border border-border/60 bg-muted/20 p-3 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => zoneBooking && onEditBooking(zoneBooking)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: zone.color }} />
                      <span className="font-semibold text-sm">{zone.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Users className="w-3 h-3" />
                      <span>до {zone.capacity} чел.</span>
                    </div>
                    {zoneBooking && (
                      <div className={cn(
                        "mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block border",
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

          {/* Right: Guest info */}
          <div className="w-56 shrink-0 p-4 overflow-y-auto">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Детали
            </h3>
            <div className="space-y-3">
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
                <div className="rounded-lg bg-muted/30 border border-border/40 p-2.5">
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
