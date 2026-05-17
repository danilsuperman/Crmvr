import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { format, addDays, subDays } from "date-fns";
import {
  useListZones,
  useListBookings,
  useListSessionTypes,
  useCreateBooking,
  useUpdateBooking,
  getListBookingsQueryKey,
} from "@workspace/api-client-react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  RefreshCw,
  Calendar as CalendarIcon,
  LayoutGrid,
  Map,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ParkMap } from "@/components/park-map/park-map";
import { useQueryClient } from "@tanstack/react-query";

type ViewMode = "grid" | "map";

function getStatusColor(status: string) {
  switch (status) {
    case "confirmed":
      return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    case "pending":
      return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    case "cancelled":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    case "event":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "confirmed": return "Подтверждено";
    case "pending": return "Ожидание";
    case "cancelled": return "Отменено";
    case "event": return "Мероприятие";
    default: return status;
  }
}

interface BookingFormState {
  date: string;
  startTime: string;
  endTime: string;
  zoneId: string;
  sessionTypeId: string;
  clientName: string;
  clientPhone: string;
  guestsCount: string;
  status: string;
  notes: string;
  adminName: string;
}

export default function Home() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("map");
  const dateStr = format(currentDate, "yyyy-MM-dd");

  const { data: zones = [], isLoading: isLoadingZones } = useListZones();
  const { data: sessionTypes = [] } = useListSessionTypes();
  const {
    data: bookings = [],
    isLoading: isLoadingBookings,
    refetch,
  } = useListBookings(
    { date: dateStr },
    { query: { queryKey: getListBookingsQueryKey({ date: dateStr }) } }
  );

  const queryClient = useQueryClient();

  // Now-line state
  const [nowMinutes, setNowMinutes] = useState(() => {
    const n = new Date();
    return n.getHours() * 60 + n.getMinutes();
  });
  useEffect(() => {
    const id = setInterval(() => {
      const n = new Date();
      setNowMinutes(n.getHours() * 60 + n.getMinutes());
    }, 60000);
    return () => clearInterval(id);
  }, []);

  const timeSlots = useMemo(() => {
    const slots: string[] = [];
    for (let i = 10; i <= 22; i++) {
      slots.push(`${i.toString().padStart(2, "0")}:00`);
      if (i !== 22) slots.push(`${i.toString().padStart(2, "0")}:30`);
    }
    return slots;
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{
    time: string;
    zoneId: number;
  } | null>(null);
  const [form, setForm] = useState<BookingFormState>({
    date: dateStr,
    startTime: "12:00",
    endTime: "13:00",
    zoneId: "",
    sessionTypeId: "",
    clientName: "",
    clientPhone: "",
    guestsCount: "2",
    status: "confirmed",
    notes: "",
    adminName: "",
  });

  const createBooking = useCreateBooking({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getListBookingsQueryKey({ date: dateStr }),
        });
        toast.success("Бронь создана");
        setIsModalOpen(false);
      },
      onError: (err: unknown) => {
        const msg =
          (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
          "Не удалось создать бронь";
        toast.error(msg);
      },
    },
  });

  const handleCellClick = useCallback(
    (time: string, zoneId: number) => {
      const [h, m] = time.split(":").map(Number);
      const endH = Math.floor((h * 60 + m + 60) / 60);
      const endM = (h * 60 + m + 60) % 60;
      setSelectedCell({ time, zoneId });
      setForm({
        date: dateStr,
        startTime: time,
        endTime: `${endH.toString().padStart(2, "0")}:${endM.toString().padStart(2, "0")}`,
        zoneId: zoneId.toString(),
        sessionTypeId: "",
        clientName: "",
        clientPhone: "",
        guestsCount: "2",
        status: "confirmed",
        notes: "",
        adminName: "",
      });
      setIsModalOpen(true);
    },
    [dateStr]
  );

  const handleSubmit = () => {
    if (!form.clientName.trim()) {
      toast.error("Введите имя клиента");
      return;
    }
    const startISO = `${form.date}T${form.startTime}:00.000Z`;
    const endISO = `${form.date}T${form.endTime}:00.000Z`;
    createBooking.mutate({
      data: {
        clientName: form.clientName,
        clientPhone: form.clientPhone || undefined,
        zoneId: form.zoneId ? Number(form.zoneId) : undefined,
        sessionTypeId: form.sessionTypeId ? Number(form.sessionTypeId) : undefined,
        startTime: startISO,
        endTime: endISO,
        guestsCount: Number(form.guestsCount) || 1,
        status: form.status as "confirmed" | "pending" | "cancelled" | "event",
        notes: form.notes || undefined,
        adminName: form.adminName || undefined,
      },
    });
  };

  const openNewBooking = useCallback(() => {
    setSelectedCell(null);
    setForm({
      date: dateStr,
      startTime: "12:00",
      endTime: "13:00",
      zoneId: "",
      sessionTypeId: "",
      clientName: "",
      clientPhone: "",
      guestsCount: "2",
      status: "confirmed",
      notes: "",
      adminName: "",
    });
    setIsModalOpen(true);
  }, [dateStr]);

  // Grid: derive booking positions
  const gridBookings = useMemo(() => {
    return bookings.map((b) => {
      const start = new Date(b.startTime);
      const end = new Date(b.endTime);
      const startHour = start.getUTCHours();
      const startMin = start.getUTCMinutes();
      const endHour = end.getUTCHours();
      const endMin = end.getUTCMinutes();
      const startSlot = `${startHour.toString().padStart(2, "0")}:${startMin === 0 ? "00" : "30"}`;
      const durationSlots = Math.max(
        1,
        Math.round(((endHour * 60 + endMin) - (startHour * 60 + startMin)) / 30)
      );
      return { ...b, startSlot, durationSlots };
    });
  }, [bookings]);

  // Today's "now" line position in the grid (rows of 30min, each 60px high)
  const nowLineTop = useMemo(() => {
    const gridStartMinutes = 10 * 60; // 10:00
    const currentDayStr = format(currentDate, "yyyy-MM-dd");
    const todayStr = format(new Date(), "yyyy-MM-dd");
    if (currentDayStr !== todayStr) return null;
    const diff = nowMinutes - gridStartMinutes;
    if (diff < 0) return null;
    return (diff / 30) * 60; // 60px per slot
  }, [nowMinutes, currentDate]);

  const isToday = format(currentDate, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Top bar */}
      <header className="h-14 border-b border-border/50 flex items-center px-4 gap-3 shrink-0 bg-background/80 backdrop-blur">
        {/* Date nav */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentDate(subDays(currentDate, 1))}
            data-testid="button-prev-day"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <button
            className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border/50 bg-card/30 hover:bg-card/60 transition-colors text-sm font-medium"
            onClick={() => setCurrentDate(new Date())}
            data-testid="button-date"
          >
            <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground" />
            {format(currentDate, "d MMM, yyyy")}
            {isToday && (
              <span className="text-[10px] text-primary font-semibold uppercase tracking-wider ml-1">
                Сегодня
              </span>
            )}
          </button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentDate(addDays(currentDate, 1))}
            data-testid="button-next-day"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Mode switcher — center */}
        <div className="flex-1 flex justify-center">
          <div className="flex items-center rounded-lg border border-border/50 p-0.5 bg-card/30">
            <button
              onClick={() => setViewMode("grid")}
              data-testid="button-mode-grid"
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200",
                viewMode === "grid"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Сетка</span>
            </button>
            <button
              onClick={() => setViewMode("map")}
              data-testid="button-mode-map"
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200",
                viewMode === "map"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Map className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Живая карта</span>
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => refetch()}
            data-testid="button-refresh"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
          {!isToday && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs hidden sm:flex"
              onClick={() => setCurrentDate(new Date())}
              data-testid="button-today"
            >
              Сегодня
            </Button>
          )}
          <Button
            size="sm"
            className="h-8 text-xs gap-1.5"
            onClick={openNewBooking}
            data-testid="button-new-booking"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Новая бронь</span>
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {viewMode === "map" ? (
          isLoadingZones || isLoadingBookings ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
                  Загрузка парка...
                </p>
              </div>
            </div>
          ) : (
            <ParkMap
              zones={zones}
              bookings={bookings}
              onBookingClick={(id) => {
                // Could open booking detail
                toast.info(`Booking #${id}`);
              }}
              onZoneClick={(zoneId, time) => {
                handleCellClick(time || format(new Date(), "HH:00"), zoneId);
              }}
            />
          )
        ) : (
          /* Grid mode */
          <div className="h-full overflow-auto bg-card/20">
            {isLoadingZones || isLoadingBookings ? (
              <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
                    Загрузка сетки...
                  </p>
                </div>
              </div>
            ) : (
              <div className="inline-block min-w-full">
                {/* Zone header row */}
                <div className="flex border-b border-border/50 sticky top-0 bg-background/95 backdrop-blur z-20">
                  <div className="w-16 shrink-0 border-r border-border/30 p-2" />
                  {zones.map((zone) => (
                    <div
                      key={zone.id}
                      className="flex-1 min-w-[180px] p-3 text-center border-r border-border/30"
                    >
                      <div className="flex items-center justify-center gap-2 font-semibold text-sm">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: zone.color }}
                        />
                        {zone.name}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider">
                        Макс: {zone.capacity}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Grid body */}
                <div className="relative">
                  {/* Now line */}
                  {nowLineTop !== null && (
                    <div
                      className="absolute left-0 right-0 z-30 pointer-events-none"
                      style={{ top: nowLineTop }}
                    >
                      <div className="flex items-center">
                        <div className="w-16 shrink-0 flex justify-end pr-1">
                          <div className="w-2 h-2 rounded-full bg-red-500" />
                        </div>
                        <div className="flex-1 h-px bg-red-500/70" />
                      </div>
                    </div>
                  )}

                  {timeSlots.map((time, rowIdx) => {
                    const slotMinutes =
                      parseInt(time.split(":")[0]) * 60 + parseInt(time.split(":")[1]);
                    const isPast =
                      isToday && slotMinutes < nowMinutes - 30;

                    return (
                      <div
                        key={time}
                        className={cn(
                          "flex border-b border-border/20 group",
                          isPast && "opacity-50"
                        )}
                        style={{ height: 60 }}
                      >
                        {/* Time label */}
                        <div className="w-16 shrink-0 border-r border-border/20 flex items-start justify-center pt-1">
                          <span className="text-[10px] font-mono text-muted-foreground">
                            {time}
                          </span>
                        </div>

                        {/* Zone cells */}
                        {zones.map((zone) => {
                          const slotBookings = gridBookings.filter(
                            (b) =>
                              b.zoneId === zone.id && b.startSlot === time
                          );

                          return (
                            <div
                              key={`${time}-${zone.id}`}
                              className="flex-1 min-w-[180px] border-r border-border/20 relative cursor-pointer hover:bg-primary/5 transition-colors"
                              onClick={() => handleCellClick(time, zone.id)}
                              data-testid={`cell-${time}-${zone.id}`}
                            >
                              {slotBookings.map((booking) => (
                                <div
                                  key={booking.id}
                                  className={cn(
                                    "absolute left-1 right-1 top-1 rounded-lg border overflow-hidden z-10 shadow-sm p-2",
                                    getStatusColor(booking.status)
                                  )}
                                  style={{
                                    height: booking.durationSlots * 60 - 8,
                                    minHeight: 28,
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toast.info(
                                      `${booking.clientName || "Booking"} — ${booking.status}`
                                    );
                                  }}
                                  data-testid={`booking-card-${booking.id}`}
                                >
                                  <div className="font-semibold text-xs truncate leading-tight">
                                    {booking.clientName || "Гость"}
                                  </div>
                                  {booking.durationSlots > 1 && (
                                    <div className="text-[10px] opacity-70 flex items-center gap-1.5 mt-0.5">
                                      <span>{booking.guestsCount} гост.</span>
                                      <span>·</span>
                                      <span>{getStatusLabel(booking.status)}</span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* New Booking Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Новая бронь</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Дата</Label>
                <Input
                  type="date"
                  className="h-8 text-xs"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  data-testid="input-booking-date"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Начало</Label>
                <Input
                  type="time"
                  className="h-8 text-xs"
                  value={form.startTime}
                  onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                  data-testid="input-booking-start"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Конец</Label>
                <Input
                  type="time"
                  className="h-8 text-xs"
                  value={form.endTime}
                  onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
                  data-testid="input-booking-end"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Зона</Label>
                <Select
                  value={form.zoneId}
                  onValueChange={(v) => setForm((f) => ({ ...f, zoneId: v }))}
                >
                  <SelectTrigger className="h-8 text-xs" data-testid="select-zone">
                    <SelectValue placeholder="Выберите зону" />
                  </SelectTrigger>
                  <SelectContent>
                    {zones.map((z) => (
                      <SelectItem key={z.id} value={z.id.toString()}>
                        {z.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Тип сеанса</Label>
                <Select
                  value={form.sessionTypeId}
                  onValueChange={(v) => setForm((f) => ({ ...f, sessionTypeId: v }))}
                >
                  <SelectTrigger className="h-8 text-xs" data-testid="select-session-type">
                    <SelectValue placeholder="Выберите тип" />
                  </SelectTrigger>
                  <SelectContent>
                    {sessionTypes.map((st) => (
                      <SelectItem key={st.id} value={st.id.toString()}>
                        {st.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Имя клиента *</Label>
              <Input
                className="h-8 text-xs"
                placeholder="Полное имя"
                value={form.clientName}
                onChange={(e) => setForm((f) => ({ ...f, clientName: e.target.value }))}
                data-testid="input-client-name"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Телефон</Label>
                <Input
                  className="h-8 text-xs"
                  placeholder="+7 xxx xxx-xx-xx"
                  value={form.clientPhone}
                  onChange={(e) => setForm((f) => ({ ...f, clientPhone: e.target.value }))}
                  data-testid="input-client-phone"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Гостей</Label>
                <Input
                  className="h-8 text-xs"
                  type="number"
                  min="1"
                  value={form.guestsCount}
                  onChange={(e) => setForm((f) => ({ ...f, guestsCount: e.target.value }))}
                  data-testid="input-guests"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Статус</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}
                >
                  <SelectTrigger className="h-8 text-xs" data-testid="select-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="confirmed">Подтверждено</SelectItem>
                    <SelectItem value="pending">Ожидание</SelectItem>
                    <SelectItem value="event">Мероприятие</SelectItem>
                    <SelectItem value="cancelled">Отменено</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Администратор</Label>
                <Input
                  className="h-8 text-xs"
                  placeholder="Имя администратора"
                  value={form.adminName}
                  onChange={(e) => setForm((f) => ({ ...f, adminName: e.target.value }))}
                  data-testid="input-admin"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Заметки</Label>
              <Input
                className="h-8 text-xs"
                placeholder="Дополнительные примечания"
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                data-testid="input-notes"
              />
            </div>

            <Button
              className="w-full mt-1"
              onClick={handleSubmit}
              disabled={createBooking.isPending}
              data-testid="button-submit-booking"
            >
              {createBooking.isPending ? "Создание..." : "Создать бронь"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
