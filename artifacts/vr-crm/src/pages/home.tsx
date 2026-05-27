import { useState, useMemo, useCallback, useEffect } from "react";
import { format, addDays, subDays } from "date-fns";
import { ru } from "date-fns/locale";
import {
  useListZones,
  useListBookings,
  useListSessionTypes,
  useCreateBooking,
  useUpdateBooking,
  useDeleteBooking,
  useListPackages,
  getListBookingsQueryKey,
} from "@workspace/api-client-react";
import { useLocalStorage } from "@/lib/store";
import {
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Plus,
  RefreshCw,
  LayoutGrid,
  Map as MapIcon,
  Trash2,
  Package,
  Copy,
  Check,
  Link2,
  CreditCard,
  Zap,
  Bell,
  MessageSquare,
  Send,
  Users,
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
import { DatePicker } from "@/components/ui/date-picker";
import { EventDashboard } from "@/components/booking/event-dashboard";
import { useQueryClient } from "@tanstack/react-query";

type ViewMode = "grid" | "map";

const ROW_H = 60;
const TIME_COL_W = 64;
const ZONE_COL_W = 180;

function getStatusColor(status: string) {
  switch (status) {
    case "confirmed": return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
    case "pending": return "bg-amber-500/20 text-amber-300 border-amber-500/30";
    case "cancelled": return "bg-red-500/20 text-red-400 border-red-500/30";
    case "event": return "bg-blue-500/20 text-blue-300 border-blue-500/30";
    case "prepaid": return "bg-sky-500/20 text-sky-300 border-sky-500/30";
    default: return "bg-muted text-muted-foreground border-border";
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "confirmed": return "Подтверждено";
    case "pending": return "Ожидание";
    case "cancelled": return "Отменено";
    case "event": return "Мероприятие";
    case "prepaid": return "Предоплачено";
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
  isEvent: boolean;
  packageId: string;
  customEvent: boolean;
  customEventZoneIds: number[];
  zoneSessionTypes: Record<number, string>;
  reminderBefore24h: boolean;
  reminderBefore2h: boolean;
  reminderBefore30m: boolean;
  paidAmount: string;
  clientEmail: string;
  clientTelegram: string;
  clientBirthday: string;
  clientDetailNotes: string;
}

type Booking = {
  id: number;
  clientId: number | null;
  clientName: string | null;
  clientPhone: string | null;
  zoneId: number | null;
  zoneName: string | null;
  zoneColor: string | null;
  sessionTypeId: number | null;
  sessionTypeName: string | null;
  sessionTypeColor: string | null;
  packageId: number | null;
  startTime: string;
  endTime: string;
  guestsCount: number;
  status: string;
  notes: string | null;
  adminName: string | null;
  paidAmount?: number;
  reminders?: { before24h?: boolean; before2h?: boolean; before30m?: boolean };
};

const EMPTY_FORM: BookingFormState = {
  date: format(new Date(), "yyyy-MM-dd"),
  startTime: "12:00",
  endTime: "14:00",
  zoneId: "",
  sessionTypeId: "",
  clientName: "",
  clientPhone: "",
  guestsCount: "2",
  status: "confirmed",
  notes: "",
  adminName: "",
  isEvent: false,
  packageId: "",
  customEvent: false,
  customEventZoneIds: [],
  zoneSessionTypes: {},
  reminderBefore24h: false,
  reminderBefore2h: true,
  reminderBefore30m: false,
  paidAmount: "",
  clientEmail: "",
  clientTelegram: "",
  clientBirthday: "",
  clientDetailNotes: "",
};

function SendMessageForm({
  clientName, clientPhone, date, startTime, endTime, zoneName,
  payLink, prepayAmount, total, onClose,
}: {
  clientName: string; clientPhone: string; date: string;
  startTime: string; endTime: string; zoneName: string;
  payLink?: string; prepayAmount: number; total: number; onClose: () => void;
}) {
  const dateStr = date ? format(new Date(date + "T12:00:00"), "d MMMM", { locale: ru }) : "";
  const defaultMsg = [
    `Здравствуйте, ${clientName || "Гость"}! 👋`,
    ``,
    `Подтверждаем вашу бронь в VR Park:`,
    `📅 ${dateStr}, ${startTime}–${endTime}`,
    zoneName ? `🎮 Зона: ${zoneName}` : null,
    total > 0 ? `💰 Сумма: ${total.toLocaleString("ru")} ₽` : null,
    prepayAmount > 0 ? `💳 Предоплата: ${prepayAmount.toLocaleString("ru")} ₽` : null,
    payLink ? `` : null,
    payLink ? `Ссылка для оплаты:` : null,
    payLink ? payLink : null,
    ``,
    `Ждём вас! До встречи 🚀`,
  ].filter(l => l !== null).join("\n");

  const [msg, setMsg] = useState(defaultMsg);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(msg).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-3 pt-2">
      {clientPhone && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-sky-500/8 border border-sky-500/20">
          <span className="text-[10px] text-muted-foreground">Получатель:</span>
          <span className="text-sm font-semibold">{clientName}</span>
          <span className="text-xs text-muted-foreground font-mono">{clientPhone}</span>
        </div>
      )}
      <div className="space-y-1.5">
        <Label className="text-xs">Текст сообщения</Label>
        <textarea
          className="w-full text-sm border border-border/50 rounded-lg p-2.5 bg-card/30 resize-none focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground"
          rows={10}
          value={msg}
          onChange={e => setMsg(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <Button variant="outline" className="flex-1 h-9 text-xs" onClick={onClose}>Закрыть</Button>
        <Button
          className="flex-1 h-9 text-xs gap-1.5"
          onClick={handleCopy}
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Скопировано!" : "Копировать текст"}
        </Button>
      </div>
      <p className="text-[10px] text-muted-foreground text-center">
        Отправьте скопированный текст клиенту через WhatsApp, Telegram или SMS
      </p>
    </div>
  );
}

export default function Home() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("map");
  const dateStr = format(currentDate, "yyyy-MM-dd");

  const MOCK_ZONES_HOME = [
    { id: 1, name: "Arena A", color: "#6366f1", capacity: 4, openTime: "10:00", closeTime: "22:00" },
    { id: 2, name: "Arena B", color: "#8b5cf6", capacity: 4, openTime: "10:00", closeTime: "22:00" },
    { id: 3, name: "VR Solo", color: "#ec4899", capacity: 1, openTime: "10:00", closeTime: "22:00" },
    { id: 4, name: "Racing Zone", color: "#f59e0b", capacity: 2, openTime: "12:00", closeTime: "22:00" },
    { id: 5, name: "PS5", color: "#3b82f6", capacity: 2, openTime: "10:00", closeTime: "23:00" },
  ];
  const MOCK_SESSION_TYPES_HOME = [
    { id: 1, name: "Стандарт 30 мин", color: "#6366f1", minDuration: 30, price: 1200 },
    { id: 2, name: "Стандарт 60 мин", color: "#8b5cf6", minDuration: 60, price: 2000 },
    { id: 3, name: "VIP 90 мин", color: "#f59e0b", minDuration: 90, price: 3500 },
    { id: 4, name: "Максимальный 120 мин", color: "#10b981", minDuration: 120, price: 4800 },
  ];
  const MOCK_PACKAGES_HOME = [
    { id: 1, name: "День рождения VIP", description: "Всё включено", maxGuests: 8, zoneIds: [1, 3], price: 15000 },
    { id: 2, name: "Корпоратив Standard", description: "Командный тимбилдинг", maxGuests: 20, zoneIds: [1, 2, 4], price: 35000 },
    { id: 3, name: "Full Park", description: "Весь парк в ваше распоряжение", maxGuests: 50, zoneIds: [1, 2, 3, 4, 5], price: 80000 },
  ];

  // Price per person per session type (₽)
  const SESSION_PRICE: Record<number, number> = {
    1: 1200,  // Стандарт 30 мин
    2: 2000,  // Стандарт 60 мин
    3: 3500,  // VIP 90 мин
    4: 4800,  // Максимальный 120 мин
  };

  // Flat package prices (₽)
  const PACKAGE_PRICE: Record<number, number> = {
    1: 35000, // День рождения VIP
    2: 45000, // Корпоратив Standard
  };
  const MOCK_BOOKINGS_HOME = [
    { id: 101, clientId: 1, clientName: "Андрей Смирнов", clientPhone: "+7 916 123-45-67", zoneId: 1, zoneName: "Arena A", zoneColor: "#6366f1", sessionTypeId: 2, sessionTypeName: "Стандарт 60 мин", sessionTypeColor: "#8b5cf6", packageId: null, startTime: `${dateStr}T10:00:00.000Z`, endTime: `${dateStr}T11:00:00.000Z`, guestsCount: 4, status: "confirmed", notes: null, adminName: "Анна" },
    { id: 102, clientId: 2, clientName: "Мария Козлова", clientPhone: "+7 903 987-65-43", zoneId: 2, zoneName: "Arena B", zoneColor: "#8b5cf6", sessionTypeId: 1, sessionTypeName: "Стандарт 30 мин", sessionTypeColor: "#6366f1", packageId: null, startTime: `${dateStr}T11:00:00.000Z`, endTime: `${dateStr}T12:00:00.000Z`, guestsCount: 3, status: "confirmed", notes: null, adminName: null },
    { id: 103, clientId: 3, clientName: "Дмитрий Новиков", clientPhone: "+7 926 555-12-34", zoneId: 3, zoneName: "VR Solo", zoneColor: "#ec4899", sessionTypeId: 2, sessionTypeName: "Стандарт 60 мин", sessionTypeColor: "#8b5cf6", packageId: null, startTime: `${dateStr}T12:00:00.000Z`, endTime: `${dateStr}T13:00:00.000Z`, guestsCount: 1, status: "pending", notes: "Первый раз", adminName: null },
    { id: 104, clientId: 4, clientName: "Елена Петрова", clientPhone: "+7 985 432-10-98", zoneId: 1, zoneName: "Arena A", zoneColor: "#6366f1", sessionTypeId: 3, sessionTypeName: "VIP 90 мин", sessionTypeColor: "#f59e0b", packageId: null, startTime: `${dateStr}T14:00:00.000Z`, endTime: `${dateStr}T15:30:00.000Z`, guestsCount: 4, status: "confirmed", notes: null, adminName: "Михаил" },
    { id: 105, clientId: 5, clientName: "Группа «Ракета»", clientPhone: "+7 965 876-54-32", zoneId: 4, zoneName: "Racing Zone", zoneColor: "#f59e0b", sessionTypeId: 2, sessionTypeName: "Стандарт 60 мин", sessionTypeColor: "#8b5cf6", packageId: null, startTime: `${dateStr}T15:00:00.000Z`, endTime: `${dateStr}T16:00:00.000Z`, guestsCount: 2, status: "confirmed", notes: null, adminName: null },
    { id: 106, clientId: 6, clientName: "Иван Сидоров", clientPhone: "+7 965 111-22-33", zoneId: 5, zoneName: "PS5", zoneColor: "#3b82f6", sessionTypeId: 1, sessionTypeName: "Стандарт 30 мин", sessionTypeColor: "#6366f1", packageId: null, startTime: `${dateStr}T16:00:00.000Z`, endTime: `${dateStr}T17:00:00.000Z`, guestsCount: 2, status: "confirmed", notes: null, adminName: null },
    { id: 107, clientId: 7, clientName: "Наталья Волкова", clientPhone: "+7 911 234-56-78", zoneId: 2, zoneName: "Arena B", zoneColor: "#8b5cf6", sessionTypeId: 2, sessionTypeName: "Стандарт 60 мин", sessionTypeColor: "#8b5cf6", packageId: null, startTime: `${dateStr}T17:00:00.000Z`, endTime: `${dateStr}T18:30:00.000Z`, guestsCount: 4, status: "confirmed", notes: null, adminName: null },
  ];

  useListZones();
  const [zones] = useLocalStorage("vrpark_zones", MOCK_ZONES_HOME);
  const isLoadingZones = false;
  const refetchZones = () => {};

  useListSessionTypes();
  const [sessionTypes] = useLocalStorage("vrpark_session_types", MOCK_SESSION_TYPES_HOME);

  // Zone constructor meta — which session types are available per zone
  const [zoneConstructorMeta] = useLocalStorage<Record<string, { sessionTypeIds?: number[] }>>(
    "vrpark_zone_constructor_meta", {}
  );

  // Returns session types available for a given zone id.
  // Falls back to all session types if no assignment is configured.
  const sessionTypesForZone = (zoneId: number | string) => {
    const ids = zoneConstructorMeta[String(zoneId)]?.sessionTypeIds;
    if (!ids || ids.length === 0) return sessionTypes;
    return sessionTypes.filter(st => ids.includes(st.id));
  };

  useListPackages();
  const [packages] = useLocalStorage("vrpark_packages", MOCK_PACKAGES_HOME);

  const { data: rawBookings = [], refetch } = useListBookings(
    { date: dateStr },
    { query: { queryKey: getListBookingsQueryKey({ date: dateStr }) } }
  );
  const [allLocalBookings, setAllLocalBookings] = useLocalStorage<Record<string, Booking[]>>("vrpark_bookings", {});
  const localDateBookings = allLocalBookings[dateStr];
  const bookings = localDateBookings !== undefined ? localDateBookings : MOCK_BOOKINGS_HOME;
  const isLoadingBookings = false;

  const queryClient = useQueryClient();

  const isToday = format(new Date(), "yyyy-MM-dd") === dateStr;

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

  // Slot lookup: "HH:MM" -> index
  const slotIndex = useMemo(() => {
    const map: Map<string, number> = new Map([]);
    timeSlots.forEach((s, i) => map.set(s, i));
    return map;
  }, [timeSlots]);

  // Grid bookings with slot positions
  const gridBookings = useMemo(() => {
    return bookings
      .filter((b) => b.status !== "cancelled")
      .map((b) => {
        const start = new Date(b.startTime);
        const end = new Date(b.endTime);
        const startHH = start.getUTCHours().toString().padStart(2, "0");
        const startMM = start.getUTCMinutes() < 30 ? "00" : "30";
        const startSlot = `${startHH}:${startMM}`;
        const durationMin = (end.getTime() - start.getTime()) / 60000;
        const durationSlots = Math.max(1, Math.ceil(durationMin / 30));
        return { ...b, startSlot, durationSlots };
      });
  }, [bookings]);

  type GridBooking = (typeof gridBookings)[number];

  // Group event bookings by packageId
  const eventGroups = useMemo(() => {
    const groups: Map<number, GridBooking[]> = new Map([]);
    for (const b of gridBookings) {
      if (b.packageId !== null && b.packageId !== undefined && b.status === "event") {
        if (!groups.has(b.packageId)) groups.set(b.packageId, []);
        groups.get(b.packageId)!.push(b);
      }
    }
    return groups;
  }, [gridBookings]);

  // IDs of bookings that are part of event groups (hidden from individual display)
  const eventBookingIds = useMemo(() => {
    const ids: Set<number> = new Set();
    eventGroups.forEach((group: GridBooking[]) => group.forEach((b: GridBooking) => ids.add(b.id)));
    return ids;
  }, [eventGroups]);

  // Now line top
  const nowLineTop = useMemo(() => {
    if (!isToday) return null;
    const slotStart = 10 * 60;
    const slotEnd = 22 * 60;
    if (nowMinutes < slotStart || nowMinutes > slotEnd) return null;
    const diff = nowMinutes - slotStart;
    return (diff / 30) * ROW_H;
  }, [isToday, nowMinutes]);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showClientDetails, setShowClientDetails] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [prepayPercent, setPrepayPercent] = useState(30);
  const [customPrepay, setCustomPrepay] = useState("");
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [linkGenerating, setLinkGenerating] = useState(false);
  const [sendMsgOpen, setSendMsgOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<BookingFormState>(EMPTY_FORM);

  useEffect(() => {
    if (form.paidAmount && Number(form.paidAmount) > 0 && !form.isEvent) {
      setForm(f => f.status !== "prepaid" ? { ...f, status: "prepaid" } : f);
    }
  }, [form.paidAmount, form.isEvent]);

  // Event dashboard state
  const [eventDashPkgId, setEventDashPkgId] = useState<number | null>(null);

  const openNewBooking = useCallback((zoneId?: number, time?: string) => {
    setEditingId(null);
    setForm({
      ...EMPTY_FORM,
      date: dateStr,
      startTime: time || "12:00",
      endTime: time
        ? (() => {
            const [h, m] = time.split(":").map(Number);
            const endMin = h * 60 + m + 120;
            return `${Math.floor(endMin / 60).toString().padStart(2, "0")}:${(endMin % 60).toString().padStart(2, "0")}`;
          })()
        : "14:00",
      zoneId: zoneId?.toString() || "",
    });
    setIsModalOpen(true);
  }, [dateStr]);

  const openEditBooking = useCallback((b: Booking) => {
    const start = new Date(b.startTime);
    const end = new Date(b.endTime);
    setEditingId(b.id);
    setForm({
      date: format(start, "yyyy-MM-dd"),
      startTime: format(start, "HH:mm"),
      endTime: format(end, "HH:mm"),
      zoneId: b.zoneId?.toString() || "",
      sessionTypeId: b.sessionTypeId?.toString() || "",
      clientName: b.clientName || "",
      clientPhone: b.clientPhone || "",
      guestsCount: b.guestsCount.toString(),
      status: b.status,
      notes: b.notes || "",
      adminName: b.adminName || "",
      isEvent: b.status === "event",
      packageId: b.packageId?.toString() || "",
      customEvent: false,
      customEventZoneIds: [],
      zoneSessionTypes: {},
      reminderBefore24h: (b as any).reminders?.before24h ?? false,
      reminderBefore2h: (b as any).reminders?.before2h ?? true,
      reminderBefore30m: (b as any).reminders?.before30m ?? false,
      paidAmount: (b as any).paidAmount?.toString() ?? "",
    });
    setIsModalOpen(true);
  }, []);

  const handleCellClick = useCallback((time: string, zoneId: number) => {
    openNewBooking(zoneId, time);
  }, [openNewBooking]);

  const invalidateBookings = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: getListBookingsQueryKey({ date: dateStr }) });
  }, [queryClient, dateStr]);

  useCreateBooking({});
  useUpdateBooking({});
  useDeleteBooking({});

  const handleSubmit = useCallback(() => {
    if (!form.clientName.trim()) {
      toast.error("Введите имя клиента");
      return;
    }
    const startISO = `${form.date}T${form.startTime}:00.000Z`;
    const endISO = `${form.date}T${form.endTime}:00.000Z`;

    const makeBooking = (zoneId?: number): Booking => {
      const zone = zones.find((z) => z.id === zoneId);
      const sessionType = sessionTypes.find((st) => st.id === Number(form.sessionTypeId));
      return {
        id: Date.now() + Math.floor(Math.random() * 100000),
        clientId: null,
        clientName: form.clientName,
        clientPhone: form.clientPhone || null,
        zoneId: zoneId ?? (form.zoneId ? Number(form.zoneId) : null),
        zoneName: zone?.name ?? null,
        zoneColor: zone?.color ?? null,
        sessionTypeId: sessionType?.id ?? null,
        sessionTypeName: sessionType?.name ?? null,
        sessionTypeColor: sessionType?.color ?? null,
        packageId: form.isEvent && form.packageId ? Number(form.packageId) : null,
        startTime: startISO,
        endTime: endISO,
        guestsCount: parseInt(form.guestsCount) || 1,
        status: form.isEvent ? "event" : (form.status as Booking["status"]),
        notes: form.notes || null,
        adminName: form.adminName || null,
        paidAmount: form.paidAmount ? Number(form.paidAmount) : 0,
        reminders: { before24h: form.reminderBefore24h, before2h: form.reminderBefore2h, before30m: form.reminderBefore30m },
      };
    };

    const bookingDate = form.date;
    const existingForDate =
      allLocalBookings[bookingDate] !== undefined
        ? allLocalBookings[bookingDate]
        : bookingDate === dateStr
        ? [...MOCK_BOOKINGS_HOME]
        : [];

    if (editingId !== null) {
      const updated = makeBooking(form.zoneId ? Number(form.zoneId) : undefined);
      setAllLocalBookings((prev) => ({
        ...prev,
        [bookingDate]: (prev[bookingDate] !== undefined ? prev[bookingDate] : existingForDate).map(
          (b) => (b.id === editingId ? { ...b, ...updated, id: editingId } : b)
        ),
      }));
      toast.success("Бронь обновлена");
      setIsModalOpen(false);
      return;
    }

    if (form.isEvent && form.packageId) {
      const pkg = packages.find((p) => p.id === Number(form.packageId));
      const zoneIds = pkg?.zoneIds ?? [];
      if (zoneIds.length === 0) {
        toast.error("Выберите пакет с зонами");
        return;
      }
      const newBookings = zoneIds.map((zid, i) => ({ ...makeBooking(zid), id: Date.now() + i }));
      setAllLocalBookings((prev) => ({
        ...prev,
        [bookingDate]: [...existingForDate, ...newBookings],
      }));
      toast.success("Мероприятие создано");
      setIsModalOpen(false);
      return;
    }

    const newBooking = makeBooking(form.zoneId ? Number(form.zoneId) : undefined);
    setAllLocalBookings((prev) => ({
      ...prev,
      [bookingDate]: [...existingForDate, newBooking],
    }));
    toast.success("Бронь создана");
    setIsModalOpen(false);
  }, [form, editingId, packages, zones, sessionTypes, allLocalBookings, dateStr, setAllLocalBookings]);

  const selectedPkg = packages.find((p) => p.id === Number(form.packageId));

  // ── Price helper — reads from st.price first, falls back to SESSION_PRICE ─
  const stPrice = (stId: number) => {
    const st = sessionTypes.find(s => s.id === stId);
    return (st as any)?.price ?? SESSION_PRICE[stId] ?? 0;
  };

  // ── Booking amount calculation (per zone breakdown) ──────────────────────
  const bookingCalc = useMemo(() => {
    const guests = parseInt(form.guestsCount) || 1;
    const [sh, sm] = form.startTime.split(":").map(Number);
    const [eh, em] = form.endTime.split(":").map(Number);
    const durationMin = Math.max(0, (eh * 60 + em) - (sh * 60 + sm));

    if (form.isEvent) {
      // ── Custom (hand-built) event ────────────────────────────────────────
      if (form.customEvent) {
        if (form.customEventZoneIds.length === 0) return null;
        const zoneLines = form.customEventZoneIds.map(zid => {
          const zone = zones.find(z => z.id === zid);
          const stId = Number(form.zoneSessionTypes[zid] ?? "") || 0;
          const st = stId ? sessionTypes.find(s => s.id === stId) : null;
          const pricePerPerson = stId ? stPrice(stId) : 0;
          const subtotal = pricePerPerson * guests;
          return { zoneId: zid, zoneName: zone?.name ?? `Зона ${zid}`, zoneColor: zone?.color, st, pricePerPerson, subtotal };
        });
        const total = zoneLines.reduce((s, l) => s + l.subtotal, 0);
        return { type: "custom_event" as const, total, guests, durationMin, zoneLines };
      }

      // ── Standard package — price comes directly from pkg.price ───────────
      if (form.packageId) {
        const pkg = packages.find(p => p.id === Number(form.packageId));
        if (!pkg) return null;
        const pkgPrice = (pkg as any).price || PACKAGE_PRICE[pkg.id] || 0;
        const zoneLines = (pkg.zoneIds ?? []).map(zid => {
          const zone = zones.find(z => z.id === zid);
          return { zoneId: zid, zoneName: zone?.name ?? `Зона ${zid}`, zoneColor: zone?.color, st: null, pricePerPerson: 0, subtotal: 0 };
        });
        return { type: "package" as const, total: pkgPrice, guests, durationMin, zoneLines, pkgPrice };
      }

      return null;
    }

    if (form.sessionTypeId) {
      const stId = Number(form.sessionTypeId);
      const st = sessionTypes.find(s => s.id === stId);
      const zone = zones.find(z => z.id === Number(form.zoneId));
      const pricePerPerson = stPrice(stId);
      const subtotal = pricePerPerson * guests;
      const zoneLines = [{ zoneId: Number(form.zoneId), zoneName: zone?.name ?? "Зона", zoneColor: zone?.color, st, pricePerPerson, subtotal }];
      return { type: "session" as const, total: subtotal, guests, durationMin, zoneLines };
    }

    if (durationMin > 0) {
      const pricePerPerson = Math.round(durationMin * 40);
      const zone = zones.find(z => z.id === Number(form.zoneId));
      const subtotal = pricePerPerson * guests;
      const zoneLines = [{ zoneId: Number(form.zoneId), zoneName: zone?.name ?? "Зона", zoneColor: zone?.color, st: null, pricePerPerson, subtotal }];
      return { type: "time" as const, total: subtotal, guests, durationMin, zoneLines };
    }

    return null;
  }, [form.sessionTypeId, form.packageId, form.isEvent, form.customEvent,
      form.customEventZoneIds, form.guestsCount,
      form.startTime, form.endTime, form.zoneId, form.zoneSessionTypes,
      zones, sessionTypes, packages]);

  const prepayAmount = bookingCalc ? Math.round(bookingCalc.total * prepayPercent / 100) : 0;

  const handleGenerateLink = () => {
    const clientSlug = form.clientName.trim().toLowerCase().replace(/[^а-яёa-z0-9]/gi, "-").replace(/-+/g, "-") || "client";
    const token = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const fullLink = `https://pay.vrpark.co/book/${clientSlug}-${token}`;
    setGeneratedLink(null);
    setLinkGenerating(true);
    setLinkCopied(false);
    let i = 0;
    const step = () => {
      i++;
      setGeneratedLink(fullLink.slice(0, i));
      if (i < fullLink.length) setTimeout(step, 18);
      else setLinkGenerating(false);
    };
    step();
  };

  const handleCopyPayLink = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink).catch(() => {});
    toast.success("Ссылка скопирована в буфер");
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2500);
  };

  // Event dashboard data
  const eventDashData = useMemo(() => {
    if (eventDashPkgId === null) return null;
    const group = eventGroups.get(eventDashPkgId);
    const pkg = packages.find((p) => p.id === eventDashPkgId);
    if (!group || !pkg) return null;
    return { bookings: group, pkg };
  }, [eventDashPkgId, eventGroups, packages]);

  // Form date object (for custom picker)
  const formDate = useMemo(() => {
    const [y, m, d] = form.date.split("-").map(Number);
    return new Date(y, m - 1, d);
  }, [form.date]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="h-14 border-b border-border/50 flex items-center gap-2 px-3 md:px-4 bg-card/50 backdrop-blur-sm shrink-0 z-20">
        {/* Date nav */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentDate((d) => subDays(d, 1))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <DatePicker
            value={currentDate}
            onChange={setCurrentDate}
            align="left"
            trigger={
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-muted/60 transition-colors">
                {format(currentDate, "d MMM, yyyy", { locale: ru })}
                {isToday && (
                  <span className="text-[10px] text-primary font-semibold uppercase tracking-wider">
                    Сегодня
                  </span>
                )}
              </button>
            }
          />

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentDate((d) => addDays(d, 1))}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* View mode toggle */}
        <div className="hidden sm:flex items-center gap-0.5 bg-muted/30 rounded-lg p-0.5 border border-border/40 ml-1">
          <button
            onClick={() => setViewMode("map")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200",
              viewMode === "map"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <MapIcon className="w-3.5 h-3.5" />
            Карта
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200",
              viewMode === "grid"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Сетка
          </button>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => refetch()}
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
          <Button
            size="sm"
            className="h-8 text-xs gap-1.5"
            onClick={() => openNewBooking()}
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
              bookings={bookings.map((b) => ({ ...b, zoneId: b.zoneId ?? null }))}
              onBookingClick={(id) => {
                const b = bookings.find((x) => x.id === id);
                if (b) {
                  if (b.packageId != null && b.status === "event") {
                    setEventDashPkgId(b.packageId ?? null);
                  } else {
                    openEditBooking(b as Booking);
                  }
                }
              }}
              onZoneClick={(zoneId) => openNewBooking(zoneId)}
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
              <div style={{ minWidth: TIME_COL_W + zones.length * ZONE_COL_W }}>
                {/* Zone header row */}
                <div
                  className="flex border-b border-border/50 sticky top-0 bg-background/95 backdrop-blur z-20"
                  style={{ minWidth: TIME_COL_W + zones.length * ZONE_COL_W }}
                >
                  <div style={{ width: TIME_COL_W }} className="shrink-0 border-r border-border/30 p-2" />
                  {zones.map((zone) => (
                    <div
                      key={zone.id}
                      style={{ width: ZONE_COL_W }}
                      className="shrink-0 p-3 text-center border-r border-border/30"
                    >
                      <div className="flex items-center justify-center gap-2 font-semibold text-sm">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: zone.color }} />
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
                        <div style={{ width: TIME_COL_W }} className="flex justify-end pr-1">
                          <div className="w-2 h-2 rounded-full bg-red-500" />
                        </div>
                        <div className="flex-1 h-px bg-red-500/70" />
                      </div>
                    </div>
                  )}

                  {/* Time rows */}
                  {timeSlots.map((time, rowIdx) => {
                    const slotMinutes =
                      parseInt(time.split(":")[0]) * 60 + parseInt(time.split(":")[1]);
                    const isPast = isToday && slotMinutes < nowMinutes - 30;

                    return (
                      <div
                        key={time}
                        className={cn(
                          "flex border-b border-border/20",
                          isPast && "opacity-50"
                        )}
                        style={{ height: ROW_H }}
                      >
                        <div
                          style={{ width: TIME_COL_W }}
                          className="shrink-0 border-r border-border/20 flex items-start justify-center pt-1"
                        >
                          <span className="text-[10px] font-mono text-muted-foreground">{time}</span>
                        </div>
                        {zones.map((zone) => (
                          <div
                            key={`${time}-${zone.id}`}
                            style={{ width: ZONE_COL_W }}
                            className="shrink-0 border-r border-border/20 relative cursor-pointer hover:bg-primary/5 transition-colors"
                            onClick={() => handleCellClick(time, zone.id)}
                          />
                        ))}
                      </div>
                    );
                  })}

                  {/* Regular booking cards (not event bookings) */}
                  {gridBookings
                    .filter((b) => !eventBookingIds.has(b.id))
                    .map((booking) => {
                      const zoneIdx = zones.findIndex((z) => z.id === booking.zoneId);
                      if (zoneIdx < 0) return null;
                      const slotIdx = slotIndex.get(booking.startSlot) ?? 0;
                      const top = slotIdx * ROW_H + 2;
                      const left = TIME_COL_W + zoneIdx * ZONE_COL_W + 2;
                      const height = booking.durationSlots * ROW_H - 4;

                      return (
                        <div
                          key={booking.id}
                          className={cn(
                            "absolute rounded-lg border overflow-hidden shadow-sm p-2 cursor-pointer z-10",
                            "hover:shadow-md hover:z-20 transition-all duration-150",
                            getStatusColor(booking.status)
                          )}
                          style={{
                            top,
                            left,
                            width: ZONE_COL_W - 4,
                            height: Math.max(height, 28),
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditBooking(booking as Booking);
                          }}
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
                          {booking.durationSlots > 2 && booking.clientPhone && (
                            <div className="text-[10px] opacity-60 mt-0.5 truncate">
                              {booking.clientPhone}
                            </div>
                          )}
                          {(booking as any).paidAmount > 0 && (
                            <div className="text-[10px] text-emerald-400 mt-0.5 font-semibold">
                              ✓ {(booking as any).paidAmount.toLocaleString("ru")} ₽
                            </div>
                          )}
                        </div>
                      );
                    })}

                  {/* Event overlays */}
                  {Array.from(eventGroups.entries()).map(([pkgId, group]) => {
                    const pkg = packages.find((p) => p.id === pkgId);
                    if (!pkg || pkg.zoneIds.length === 0) return null;

                    const zoneIndices = pkg.zoneIds
                      .map((zid) => zones.findIndex((z) => z.id === zid))
                      .filter((i) => i >= 0)
                      .sort((a, b) => a - b);

                    if (zoneIndices.length === 0) return null;

                    const rep = group[0];
                    const slotIdx = slotIndex.get(rep.startSlot) ?? 0;
                    const top = slotIdx * ROW_H;
                    const leftIdx = zoneIndices[0];
                    const rightIdx = zoneIndices[zoneIndices.length - 1];
                    const left = TIME_COL_W + leftIdx * ZONE_COL_W;
                    const width = (rightIdx - leftIdx + 1) * ZONE_COL_W;
                    const height = rep.durationSlots * ROW_H;

                    const start = new Date(rep.startTime);
                    const end = new Date(rep.endTime);

                    return (
                      <div
                        key={`event-${pkgId}`}
                        className="absolute z-20 cursor-pointer"
                        style={{ top, left, width, height }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setEventDashPkgId(pkgId);
                        }}
                      >
                        <div
                          className={cn(
                            "w-full h-full rounded-xl border-2 border-blue-500/50",
                            "bg-blue-500/10 backdrop-blur-sm",
                            "hover:bg-blue-500/20 hover:border-blue-400/70 transition-all duration-200",
                            "flex flex-col p-3 overflow-hidden shadow-lg",
                            "relative"
                          )}
                        >
                          {/* Top color bar */}
                          <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-400 rounded-t-xl" />

                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-lg">🎉</span>
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-sm text-blue-200 truncate">
                                {rep.clientName || "Мероприятие"}
                              </div>
                              <div className="text-[10px] text-blue-300/70 font-semibold">
                                {pkg.name}
                              </div>
                            </div>
                            <div className="shrink-0 text-[10px] bg-blue-500/30 text-blue-300 px-2 py-0.5 rounded-full font-semibold border border-blue-500/40">
                              {rep.guestsCount} гост.
                            </div>
                          </div>

                          <div className="text-[10px] text-blue-300/60 mb-1">
                            {pkg.zoneIds
                              .map((zid) => zones.find((z) => z.id === zid)?.name)
                              .filter(Boolean)
                              .join(" · ")}
                          </div>

                          <div className="flex items-center gap-1.5 text-xs text-blue-300/80 font-mono mt-auto">
                            {format(start, "HH:mm")} – {format(end, "HH:mm")}
                          </div>

                          <div className="text-[9px] text-blue-300/40 mt-0.5 uppercase tracking-wider">
                            Нажмите для подробностей
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Booking Modal (create / edit) */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base">
              {editingId ? "Редактировать бронь" : "Новая бронь"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-3 py-2">
            {/* Date + time row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Дата</Label>
                <DatePicker
                  value={formDate}
                  onChange={(d) => setForm((f) => ({ ...f, date: format(d, "yyyy-MM-dd") }))}
                  align="left"
                  trigger={
                    <button className="w-full h-8 px-2 rounded-md border border-input bg-background text-xs text-left hover:bg-muted/30 transition-colors">
                      {format(formDate, "d MMM", { locale: ru })}
                    </button>
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Начало</Label>
                <Input
                  type="time"
                  className="h-8 text-xs"
                  value={form.startTime}
                  onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Конец</Label>
                <Input
                  type="time"
                  className="h-8 text-xs"
                  value={form.endTime}
                  onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
                />
              </div>
            </div>

            {/* Event checkbox */}
            <div className="flex items-center gap-3 py-1 px-3 rounded-lg bg-blue-500/8 border border-blue-500/20">
              <input
                id="is-event"
                type="checkbox"
                checked={form.isEvent}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    isEvent: e.target.checked,
                    status: e.target.checked ? "event" : "confirmed",
                    packageId: "",
                  }))
                }
                className="w-4 h-4 accent-blue-500"
              />
              <label htmlFor="is-event" className="flex items-center gap-2 text-xs font-semibold cursor-pointer select-none text-blue-300">
                <Package className="w-3.5 h-3.5" />
                Мероприятие (пакет)
              </label>
            </div>

            {/* Event block */}
            {form.isEvent && (
              <div className="space-y-2.5">
                {/* Toggle: standard package vs custom */}
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-blue-500/8 rounded-lg border border-blue-500/20">
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, customEvent: false, packageId: "", zoneSessionTypes: {} }))}
                    className={cn(
                      "py-1.5 rounded-md text-xs font-semibold transition-all",
                      !form.customEvent
                        ? "bg-blue-500/25 text-blue-300 shadow-sm"
                        : "text-muted-foreground hover:text-blue-300"
                    )}
                  >
                    Выбрать пакет
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, customEvent: true, packageId: "", zoneSessionTypes: {} }))}
                    className={cn(
                      "py-1.5 rounded-md text-xs font-semibold transition-all flex items-center justify-center gap-1",
                      form.customEvent
                        ? "bg-purple-500/25 text-purple-300 shadow-sm"
                        : "text-muted-foreground hover:text-purple-300"
                    )}
                  >
                    <Zap className="w-3 h-3" /> Составить уникальное
                  </button>
                </div>

                {/* ── Standard package ── */}
                {!form.customEvent && (
                  <div className="space-y-2">
                    <Select
                      value={form.packageId}
                      onValueChange={(v) => {
                        const pkg = packages.find((p) => p.id === Number(v));
                        setForm((f) => ({
                          ...f,
                          packageId: v,
                          guestsCount: pkg ? pkg.maxGuests.toString() : f.guestsCount,
                          zoneSessionTypes: {},
                        }));
                      }}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Выберите пакет из настроек" />
                      </SelectTrigger>
                      <SelectContent>
                        {packages.map((p) => (
                          <SelectItem key={p.id} value={p.id.toString()}>
                            <span className="font-medium">{p.name}</span>
                            {(p as any).price > 0 && (
                              <span className="ml-2 text-muted-foreground">— {((p as any).price as number).toLocaleString("ru")} ₽</span>
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Package info card — read-only, from settings */}
                    {selectedPkg && (
                      <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-3 text-[11px] text-blue-300 space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-bold text-[13px] text-blue-200">{selectedPkg.name}</p>
                            {(selectedPkg as any).description && (
                              <p className="text-blue-300/70 mt-0.5">{(selectedPkg as any).description}</p>
                            )}
                          </div>
                          {(() => {
                            const displayPrice = (selectedPkg as any).price || PACKAGE_PRICE[selectedPkg.id] || 0;
                            return displayPrice > 0 ? (
                              <span className="shrink-0 text-lg font-black text-emerald-400 tabular-nums">
                                {displayPrice.toLocaleString("ru")} ₽
                              </span>
                            ) : (
                              <span className="shrink-0 text-sm text-muted-foreground">цена не указана</span>
                            );
                          })()}
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {selectedPkg.zoneIds.map(zid => {
                            const z = zones.find(zn => zn.id === zid);
                            return (
                              <span key={zid} className="flex items-center gap-1 px-2 py-0.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-[10px] font-medium">
                                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: z?.color ?? "#6366f1" }} />
                                {z?.name ?? `Зона ${zid}`}
                              </span>
                            );
                          })}
                        </div>
                        <div className="text-[10px] text-blue-300/60 flex items-center gap-3">
                          <span>Макс. {selectedPkg.maxGuests} гостей</span>
                          <span>· {selectedPkg.zoneIds.length} {selectedPkg.zoneIds.length === 1 ? "зона" : selectedPkg.zoneIds.length < 5 ? "зоны" : "зон"}</span>
                          <span className="text-amber-400/70">Фиксированная цена</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── Custom event ── */}
                {form.customEvent && (
                  <div className="space-y-3 rounded-lg border border-purple-500/20 bg-purple-500/5 p-3">
                    <p className="text-[10px] font-semibold text-purple-300/80 uppercase tracking-wider">Выберите зоны</p>
                    <div className="flex flex-wrap gap-1.5">
                      {zones.map(zone => {
                        const isChosen = form.customEventZoneIds.includes(zone.id);
                        return (
                          <button
                            key={zone.id}
                            type="button"
                            onClick={() => {
                              setForm(f => {
                                const ids = isChosen
                                  ? f.customEventZoneIds.filter(id => id !== zone.id)
                                  : [...f.customEventZoneIds, zone.id];
                                const zst = { ...f.zoneSessionTypes };
                                if (isChosen) delete zst[zone.id];
                                return { ...f, customEventZoneIds: ids, zoneSessionTypes: zst };
                              });
                            }}
                            className={cn(
                              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all",
                              isChosen
                                ? "border-purple-500/50 bg-purple-500/15 text-purple-300"
                                : "border-border/50 text-muted-foreground hover:border-purple-500/40 hover:text-purple-300"
                            )}
                          >
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: zone.color }} />
                            {zone.name}
                          </button>
                        );
                      })}
                    </div>

                    {/* Per-zone session type selectors */}
                    {form.customEventZoneIds.length > 0 && (
                      <div className="space-y-2 pt-1 border-t border-purple-500/15">
                        <p className="text-[10px] font-semibold text-purple-300/70 uppercase tracking-wider">Тип сеанса по зонам</p>
                        {form.customEventZoneIds.map(zid => {
                          const zone = zones.find(z => z.id === zid);
                          const avail = sessionTypesForZone(zid);
                          return (
                            <div key={zid} className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: zone?.color ?? "#6366f1" }} />
                              <span className="w-20 truncate text-purple-200 font-medium text-[11px]">{zone?.name ?? `Зона ${zid}`}</span>
                              <Select
                                value={form.zoneSessionTypes[zid] ?? ""}
                                onValueChange={(v) => setForm(f => ({ ...f, zoneSessionTypes: { ...f.zoneSessionTypes, [zid]: v } }))}
                              >
                                <SelectTrigger className="h-7 text-[11px] flex-1 bg-purple-500/10 border-purple-500/30">
                                  <SelectValue placeholder="Выбрать сеанс" />
                                </SelectTrigger>
                                <SelectContent>
                                  {avail.map(st => (
                                    <SelectItem key={st.id} value={st.id.toString()} className="text-xs">
                                      {st.name} — {((st as any).price ?? SESSION_PRICE[st.id] ?? 0).toLocaleString("ru")} ₽/чел.
                                    </SelectItem>
                                  ))}
                                  {avail.length === 0 && (
                                    <div className="px-3 py-2 text-xs text-muted-foreground">Нет доступных сеансов</div>
                                  )}
                                </SelectContent>
                              </Select>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Zone + session type (only if not event) */}
            {!form.isEvent && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Зона</Label>
                  <Select value={form.zoneId} onValueChange={(v) => setForm((f) => ({ ...f, zoneId: v, sessionTypeId: "" }))}>
                    <SelectTrigger className="h-8 text-xs">
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
                  <Select value={form.sessionTypeId} onValueChange={(v) => setForm((f) => ({ ...f, sessionTypeId: v }))}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Выберите тип" />
                    </SelectTrigger>
                    <SelectContent>
                      {sessionTypesForZone(form.zoneId).map((st) => (
                        <SelectItem key={st.id} value={st.id.toString()}>
                          {st.name} — {((st as any).price ?? SESSION_PRICE[st.id] ?? 0).toLocaleString("ru")} ₽/чел.
                        </SelectItem>
                      ))}
                      {sessionTypesForZone(form.zoneId).length === 0 && (
                        <div className="px-3 py-2 text-xs text-muted-foreground">Нет доступных сеансов для этой зоны</div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Client name */}
            <div className="space-y-1.5">
              <Label className="text-xs">Имя клиента *</Label>
              <Input
                className="h-8 text-xs"
                placeholder="Полное имя"
                value={form.clientName}
                onChange={(e) => setForm((f) => ({ ...f, clientName: e.target.value }))}
              />
            </div>

            {/* Phone + guests */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Телефон</Label>
                <Input
                  className="h-8 text-xs"
                  placeholder="+7 xxx xxx-xx-xx"
                  value={form.clientPhone}
                  onChange={(e) => setForm((f) => ({ ...f, clientPhone: e.target.value }))}
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
                />
              </div>
            </div>

            {/* Detailed client info toggle */}
            <div className="rounded-lg border border-border/40 bg-muted/5 overflow-hidden">
              <button
                type="button"
                onClick={() => setShowClientDetails(v => !v)}
                className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-muted/10 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-semibold">Подробная информация о клиенте</span>
                  {(form.clientEmail || form.clientTelegram || form.clientBirthday || form.clientDetailNotes) && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </div>
                {showClientDetails
                  ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
                  : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                }
              </button>
              {showClientDetails && (
                <div className="px-3 pb-3 space-y-2.5 border-t border-border/30 pt-3">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Email</Label>
                      <Input
                        className="h-8 text-xs"
                        placeholder="email@example.com"
                        value={form.clientEmail}
                        onChange={e => setForm(f => ({ ...f, clientEmail: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Telegram</Label>
                      <Input
                        className="h-8 text-xs"
                        placeholder="@username"
                        value={form.clientTelegram}
                        onChange={e => setForm(f => ({ ...f, clientTelegram: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Дата рождения</Label>
                    <Input
                      className="h-8 text-xs"
                      placeholder="например: 15 июля 1990"
                      value={form.clientBirthday}
                      onChange={e => setForm(f => ({ ...f, clientBirthday: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Заметки о клиенте</Label>
                    <textarea
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs min-h-[60px] resize-none focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
                      placeholder="Предпочтения, аллергии, особые пожелания..."
                      value={form.clientDetailNotes}
                      onChange={e => setForm(f => ({ ...f, clientDetailNotes: e.target.value }))}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Status + admin (not for events) */}
            {!form.isEvent && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Статус</Label>
                  <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="confirmed">Подтверждено</SelectItem>
                      <SelectItem value="pending">Ожидание</SelectItem>
                      <SelectItem value="prepaid">Предоплачено</SelectItem>
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
                  />
                </div>
              </div>
            )}
            {form.isEvent && (
              <div className="space-y-1.5">
                <Label className="text-xs">Администратор</Label>
                <Input
                  className="h-8 text-xs"
                  placeholder="Имя администратора"
                  value={form.adminName}
                  onChange={(e) => setForm((f) => ({ ...f, adminName: e.target.value }))}
                />
              </div>
            )}

            {/* Notes */}
            <div className="space-y-1.5">
              <Label className="text-xs">Заметки</Label>
              <Input
                className="h-8 text-xs"
                placeholder="Дополнительные примечания"
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </div>

            {/* Reminders */}
            <div className="space-y-2 py-2 px-3 rounded-lg bg-muted/10 border border-border/30">
              <div className="flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-amber-400" />
                <p className="text-xs font-semibold">Напоминания клиенту</p>
              </div>
              <div className="flex flex-wrap gap-4">
                {[
                  { key: "reminderBefore24h" as const, label: "За 24 часа" },
                  { key: "reminderBefore2h" as const, label: "За 2 часа" },
                  { key: "reminderBefore30m" as const, label: "За 30 минут" },
                ].map(r => (
                  <label key={r.key} className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form[r.key]}
                      onChange={e => setForm(f => ({ ...f, [r.key]: e.target.checked }))}
                      className="w-3.5 h-3.5 accent-primary rounded"
                    />
                    <span className="text-xs text-muted-foreground">{r.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Paid amount */}
            <div className="space-y-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Внесено оплаты (₽)</Label>
                <Input
                  className="h-8 text-xs"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={form.paidAmount}
                  onChange={e => setForm(f => ({ ...f, paidAmount: e.target.value }))}
                />
              </div>
              {form.paidAmount && Number(form.paidAmount) > 0 && bookingCalc ? (
                <div className="rounded-lg bg-sky-500/8 border border-sky-500/20 px-3 py-2.5 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Внесена предоплата</span>
                    <span className="font-semibold text-sky-400">+{Number(form.paidAmount).toLocaleString("ru")} ₽</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Итого к оплате</span>
                    <span className="font-medium">{bookingCalc.total.toLocaleString("ru")} ₽</span>
                  </div>
                  <div className="w-full bg-muted/30 rounded-full h-1.5">
                    <div
                      className="bg-sky-400 h-1.5 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (Number(form.paidAmount) / bookingCalc.total) * 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <span className="text-muted-foreground">Остаток при визите</span>
                    <span className={cn("font-bold", bookingCalc.total - Number(form.paidAmount) <= 0 ? "text-emerald-400" : "text-amber-400")}>
                      {Math.max(0, bookingCalc.total - Number(form.paidAmount)).toLocaleString("ru")} ₽
                    </span>
                  </div>
                </div>
              ) : form.paidAmount && Number(form.paidAmount) > 0 ? (
                <span className="text-xs font-semibold text-sky-400">✓ Предоплата: {Number(form.paidAmount).toLocaleString("ru")} ₽</span>
              ) : (
                <span className="text-xs text-muted-foreground/60">Оплата не внесена</span>
              )}
            </div>

            {/* ── Price summary block ───────────────────────────────── */}
            {bookingCalc && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3 space-y-3">
                {/* Header */}
                <div className="flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-400">Расчёт стоимости</span>
                  {bookingCalc.durationMin > 0 && (
                    <span className="ml-auto text-[10px] text-muted-foreground">
                      {bookingCalc.durationMin >= 60
                        ? `${Math.floor(bookingCalc.durationMin / 60)} ч ${bookingCalc.durationMin % 60 > 0 ? `${bookingCalc.durationMin % 60} мин` : ""}`.trim()
                        : `${bookingCalc.durationMin} мин`}
                    </span>
                  )}
                </div>

                {/* Per-zone breakdown */}
                <div className="space-y-1.5">
                  {bookingCalc.zoneLines.map((line, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      {line.zoneColor && (
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: line.zoneColor }} />
                      )}
                      <span className="flex-1 truncate font-medium">{line.zoneName}</span>
                      {line.st && (
                        <span className="text-[10px] text-muted-foreground hidden sm:inline truncate max-w-[90px]">{line.st.name}</span>
                      )}
                      <span className="text-muted-foreground">
                        {line.pricePerPerson > 0
                          ? `${line.pricePerPerson.toLocaleString("ru")} × ${bookingCalc.guests}`
                          : <span className="text-amber-400/70">—</span>}
                      </span>
                      <span className={cn("font-bold shrink-0 w-16 text-right", line.subtotal > 0 ? "text-foreground" : "text-muted-foreground/50")}>
                        {line.subtotal > 0 ? `${line.subtotal.toLocaleString("ru")} ₽` : "0 ₽"}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="flex items-center justify-between pt-2 border-t border-emerald-500/20">
                  <span className="text-sm font-bold">Итого</span>
                  <span className="text-2xl font-black text-emerald-400 tabular-nums">
                    {bookingCalc.total.toLocaleString("ru")} ₽
                  </span>
                </div>

                {/* Prepay % selector */}
                <div className="space-y-2">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Предоплата</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {[10, 25, 50, 100].map(pct => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => { setPrepayPercent(pct); setCustomPrepay(""); }}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-xs font-bold border transition-all",
                          prepayPercent === pct && customPrepay === ""
                            ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                            : "border-border/50 text-muted-foreground hover:border-emerald-500/40 hover:text-emerald-400"
                        )}
                      >
                        {pct}%
                      </button>
                    ))}
                    <div className="flex items-center gap-1 flex-1 min-w-[80px]">
                      <input
                        type="number"
                        min="1"
                        max="100"
                        placeholder="Свой %"
                        value={customPrepay}
                        onChange={e => {
                          const v = e.target.value;
                          setCustomPrepay(v);
                          const n = parseInt(v);
                          if (n >= 1 && n <= 100) setPrepayPercent(n);
                        }}
                        className={cn(
                          "w-full h-7 px-2 text-xs rounded-lg border bg-transparent focus:outline-none transition-all",
                          customPrepay
                            ? "border-emerald-500/50 text-emerald-400"
                            : "border-border/50 text-muted-foreground placeholder:text-muted-foreground/40"
                        )}
                      />
                    </div>
                  </div>

                  {/* Prepay amount display */}
                  <div className="flex items-center justify-between rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2">
                    <div>
                      <p className="text-xs font-semibold">К оплате сейчас ({prepayPercent}%)</p>
                      <p className="text-[10px] text-muted-foreground">Остаток {(bookingCalc.total - prepayAmount).toLocaleString("ru")} ₽ — на месте</p>
                    </div>
                    <span className="text-lg font-black text-emerald-400 tabular-nums">
                      {prepayAmount.toLocaleString("ru")} ₽
                    </span>
                  </div>
                </div>

                {/* Generate link */}
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full h-8 text-xs gap-1.5 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                    onClick={handleGenerateLink}
                    disabled={linkGenerating}
                  >
                    {linkGenerating ? (
                      <><Zap className="w-3.5 h-3.5 animate-pulse" /> Генерируется...</>
                    ) : (
                      <><Link2 className="w-3.5 h-3.5" /> Сгенерировать ссылку предоплаты</>
                    )}
                  </Button>

                  {/* Animated link display */}
                  {(generatedLink || linkGenerating) && (
                    <div className="rounded-lg border border-emerald-500/20 bg-card/40 p-2.5">
                      <p className="text-[9px] text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Ссылка для клиента</p>
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-[11px] text-emerald-400 flex-1 break-all leading-relaxed">
                          {generatedLink}
                          {linkGenerating && (
                            <span className="inline-block w-0.5 h-3 bg-emerald-400 ml-0.5 animate-pulse align-middle" />
                          )}
                        </p>
                        {!linkGenerating && generatedLink && (
                          <button
                            type="button"
                            onClick={handleCopyPayLink}
                            className={cn(
                              "shrink-0 w-7 h-7 rounded-lg border flex items-center justify-center transition-all",
                              linkCopied
                                ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-400"
                                : "border-border/50 text-muted-foreground hover:border-emerald-500/40 hover:text-emerald-400"
                            )}
                          >
                            {linkCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        )}
                      </div>
                      {!linkGenerating && generatedLink && (
                        <p className="text-[9px] text-muted-foreground/60 mt-1.5">
                          Предоплата {prepayPercent}% · {prepayAmount.toLocaleString("ru")} ₽ · действует 24 ч
                        </p>
                      )}
                    </div>
                  )}

                  {generatedLink && !linkGenerating && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full h-8 text-xs gap-1.5 border-sky-500/30 text-sky-400 hover:bg-sky-500/10"
                      onClick={() => setSendMsgOpen(true)}
                      disabled={!form.clientName.trim()}
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> Отправить сообщение клиенту
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 mt-1">
              {editingId !== null && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-9 gap-1.5"
                  onClick={() => {
                    if (confirm("Удалить бронь?")) {
                      const existing = allLocalBookings[dateStr] !== undefined ? allLocalBookings[dateStr] : [...MOCK_BOOKINGS_HOME];
                      setAllLocalBookings((prev) => ({ ...prev, [dateStr]: existing.filter((b) => b.id !== editingId) }));
                      toast.success("Бронь удалена");
                      setIsModalOpen(false);
                    }
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              )}
              <Button
                className="flex-1"
                onClick={handleSubmit}
              >
                {editingId
                  ? "Сохранить изменения"
                  : form.isEvent && selectedPkg
                  ? `Создать для ${selectedPkg.zoneIds.length} зон`
                  : "Создать бронь"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Send Message Dialog */}
      <Dialog open={sendMsgOpen} onOpenChange={setSendMsgOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-sky-400" /> Сообщение клиенту
            </DialogTitle>
          </DialogHeader>
          <SendMessageForm
            clientName={form.clientName}
            clientPhone={form.clientPhone}
            date={form.date}
            startTime={form.startTime}
            endTime={form.endTime}
            zoneName={zones.find(z => z.id === Number(form.zoneId))?.name ?? ""}
            payLink={generatedLink ?? undefined}
            prepayAmount={prepayAmount}
            total={bookingCalc?.total ?? 0}
            onClose={() => setSendMsgOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Event Dashboard */}
      {eventDashData && (
        <EventDashboard
          bookings={eventDashData.bookings as Parameters<typeof EventDashboard>[0]["bookings"]}
          pkg={eventDashData.pkg as Parameters<typeof EventDashboard>[0]["pkg"]}
          zones={zones}
          onClose={() => setEventDashPkgId(null)}
          onEditBooking={(b) => {
            setEventDashPkgId(null);
            openEditBooking(b as Booking);
          }}
        />
      )}
    </div>
  );
}
