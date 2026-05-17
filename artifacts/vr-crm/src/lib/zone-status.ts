export type ZoneStatus =
  | "free"
  | "active"
  | "waiting"
  | "cleaning"
  | "delayed"
  | "overdue"
  | "technical_issue";

export interface ZoneState {
  status: ZoneStatus;
  activeBooking: {
    id: number;
    clientName: string | null;
    clientPhone: string | null;
    guestsCount: number;
    sessionTypeName: string | null;
    sessionTypeColor: string | null;
    startTime: string;
    endTime: string;
    notes: string | null;
    status: string;
  } | null;
  nextBooking: {
    id: number;
    clientName: string | null;
    guestsCount: number;
    startTime: string;
    endTime: string;
    status: string;
  } | null;
  minutesRemaining: number | null;
  minutesUntilNext: number | null;
  minutesOverdue: number | null;
  occupancyPercent: number;
}

export function computeZoneState(
  zone: { id: number; capacity: number },
  bookings: Array<{
    id: number;
    zoneId: number | null;
    clientName: string | null;
    clientPhone: string | null;
    guestsCount: number;
    sessionTypeName: string | null;
    sessionTypeColor: string | null;
    startTime: string;
    endTime: string;
    notes: string | null;
    status: string;
  }>,
  now: Date
): ZoneState {
  const zoneBookings = bookings.filter(
    (b) => b.zoneId === zone.id && b.status !== "cancelled"
  );

  // Check if any booking is currently within its time window
  const currentlyRunning = zoneBookings.find((b) => {
    const start = new Date(b.startTime);
    const end = new Date(b.endTime);
    return start <= now && end >= now;
  });

  if (currentlyRunning) {
    const end = new Date(currentlyRunning.endTime);
    const minutesRemaining = Math.max(
      0,
      Math.floor((end.getTime() - now.getTime()) / 60000)
    );
    const occupancyPercent = Math.round(
      (currentlyRunning.guestsCount / Math.max(zone.capacity, 1)) * 100
    );
    const nextBooking = getNextBooking(zoneBookings, now);
    return {
      status: "active",
      activeBooking: currentlyRunning,
      nextBooking,
      minutesRemaining,
      minutesUntilNext: nextBooking
        ? Math.floor(
            (new Date(nextBooking.startTime).getTime() - now.getTime()) / 60000
          )
        : null,
      minutesOverdue: null,
      occupancyPercent,
    };
  }

  // Delayed: booking started in the past but status is pending (group hasn't arrived)
  const delayed = zoneBookings.find((b) => {
    const start = new Date(b.startTime);
    const end = new Date(b.endTime);
    return b.status === "pending" && start < now && end > now;
  });

  if (delayed) {
    const start = new Date(delayed.startTime);
    const minutesOverdue = Math.floor(
      (now.getTime() - start.getTime()) / 60000
    );
    return {
      status: "delayed",
      activeBooking: delayed,
      nextBooking: null,
      minutesRemaining: null,
      minutesUntilNext: null,
      minutesOverdue,
      occupancyPercent: 0,
    };
  }

  // Overdue: booking's end time passed within last 30 min, and no new booking yet
  const recentlyEnded = zoneBookings
    .filter((b) => {
      const end = new Date(b.endTime);
      const diff = now.getTime() - end.getTime();
      return diff > 0 && diff <= 30 * 60 * 1000;
    })
    .sort(
      (a, b) =>
        new Date(b.endTime).getTime() - new Date(a.endTime).getTime()
    )[0];

  if (recentlyEnded) {
    const end = new Date(recentlyEnded.endTime);
    const minutesSinceEnd = Math.floor(
      (now.getTime() - end.getTime()) / 60000
    );
    const nextBooking = getNextBooking(zoneBookings, now);
    // Within 15 min → cleaning, 15-30 min → free (but we still show it briefly)
    const status: ZoneStatus = minutesSinceEnd <= 15 ? "cleaning" : "free";
    return {
      status,
      activeBooking: null,
      nextBooking,
      minutesRemaining: null,
      minutesUntilNext: nextBooking
        ? Math.floor(
            (new Date(nextBooking.startTime).getTime() - now.getTime()) / 60000
          )
        : null,
      minutesOverdue: null,
      occupancyPercent: 0,
    };
  }

  // Upcoming within 15 min → waiting for guests
  const nextBooking = getNextBooking(zoneBookings, now);
  const minutesUntilNext = nextBooking
    ? Math.floor(
        (new Date(nextBooking.startTime).getTime() - now.getTime()) / 60000
      )
    : null;

  if (nextBooking && minutesUntilNext !== null && minutesUntilNext <= 15) {
    return {
      status: "waiting",
      activeBooking: null,
      nextBooking,
      minutesRemaining: null,
      minutesUntilNext,
      minutesOverdue: null,
      occupancyPercent: 0,
    };
  }

  return {
    status: "free",
    activeBooking: null,
    nextBooking,
    minutesRemaining: null,
    minutesUntilNext,
    minutesOverdue: null,
    occupancyPercent: 0,
  };
}

function getNextBooking(
  bookings: Array<{ startTime: string; endTime: string; clientName: string | null; guestsCount: number; id: number; status: string }>,
  now: Date
) {
  const future = bookings
    .filter((b) => new Date(b.startTime) > now)
    .sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
  return future[0] || null;
}

export const STATUS_CONFIG: Record<
  ZoneStatus,
  {
    label: string;
    color: string;
    bg: string;
    border: string;
    glow: string;
    pulse: boolean;
  }
> = {
  free: {
    label: "Свободно",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    glow: "shadow-emerald-500/10",
    pulse: false,
  },
  active: {
    label: "Идёт игра",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/30",
    glow: "shadow-cyan-500/20",
    pulse: false,
  },
  waiting: {
    label: "Ожидают гостей",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/30",
    glow: "shadow-violet-500/10",
    pulse: true,
  },
  cleaning: {
    label: "Уборка",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    glow: "shadow-amber-500/10",
    pulse: false,
  },
  delayed: {
    label: "Группа опаздывает",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/40",
    glow: "shadow-red-500/20",
    pulse: true,
  },
  overdue: {
    label: "Просрочка",
    color: "text-red-400",
    bg: "bg-red-500/15",
    border: "border-red-500/50",
    glow: "shadow-red-500/30",
    pulse: true,
  },
  technical_issue: {
    label: "Тех. проблема",
    color: "text-red-500",
    bg: "bg-red-900/20",
    border: "border-red-500/60",
    glow: "shadow-red-500/30",
    pulse: true,
  },
};

export function computeActivityFeed(
  bookings: Array<{
    id: number;
    zoneId: number | null;
    zoneName: string | null;
    clientName: string | null;
    guestsCount: number;
    startTime: string;
    endTime: string;
    status: string;
  }>,
  now: Date
): Array<{ id: string; message: string; time: Date; type: "info" | "warn" | "success" | "error" }> {
  const items: Array<{ id: string; message: string; time: Date; type: "info" | "warn" | "success" | "error" }> = [];

  for (const b of bookings) {
    if (b.status === "cancelled") continue;
    const start = new Date(b.startTime);
    const end = new Date(b.endTime);
    const zone = b.zoneName || "Zone";
    const client = b.clientName || "Group";

    // Started within last 30 min
    const sinceStart = now.getTime() - start.getTime();
    if (sinceStart > 0 && sinceStart < 30 * 60 * 1000 && end > now) {
      items.push({
        id: `start-${b.id}`,
        message: `${zone} — сеанс начался: ${client}`,
        time: start,
        type: "success",
      });
    }

    // Ended within last 20 min
    const sinceEnd = now.getTime() - end.getTime();
    if (sinceEnd > 0 && sinceEnd < 20 * 60 * 1000) {
      items.push({
        id: `end-${b.id}`,
        message: `${zone} — сеанс завершён, уборка`,
        time: end,
        type: "info",
      });
    }

    // Starting in next 15 min
    const untilStart = start.getTime() - now.getTime();
    if (untilStart > 0 && untilStart < 15 * 60 * 1000) {
      items.push({
        id: `arriving-${b.id}`,
        message: `${zone} — ${client} прибывает через ${Math.floor(untilStart / 60000)} мин`,
        time: new Date(now.getTime() - 10000),
        type: "info",
      });
    }

    // Late group
    if (b.status === "pending" && start < now && end > now) {
      const lateMin = Math.floor(sinceStart / 60000);
      items.push({
        id: `late-${b.id}`,
        message: `${zone} — ${client} опаздывает на ${lateMin} мин`,
        time: start,
        type: "warn",
      });
    }
  }

  return items.sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 20);
}
