import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { SummaryPanel } from "./summary-panel";
import { ZoneCard } from "./zone-card";
import { ActivityFeed } from "./activity-feed";
import { computeZoneState, computeActivityFeed } from "@/lib/zone-status";

interface ParkMapProps {
  zones: Array<{ id: number; name: string; color: string; capacity: number }>;
  bookings: Array<{
    id: number;
    zoneId?: number | null;
    zoneName?: string | null;
    clientName?: string | null;
    clientPhone?: string | null;
    guestsCount: number;
    sessionTypeName?: string | null;
    sessionTypeColor?: string | null;
    startTime: string;
    endTime: string;
    notes?: string | null;
    status: string;
  }>;
  onBookingClick: (bookingId: number) => void;
  onZoneClick: (zoneId: number, time?: string) => void;
}

export function ParkMap({ zones, bookings, onBookingClick, onZoneClick }: ParkMapProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(interval);
  }, []);

  const normalizedBookings = useMemo(
    () =>
      bookings.map((b) => ({
        ...b,
        zoneId: b.zoneId ?? null,
        zoneName: b.zoneName ?? null,
        clientName: b.clientName ?? null,
        clientPhone: b.clientPhone ?? null,
        sessionTypeName: b.sessionTypeName ?? null,
        sessionTypeColor: b.sessionTypeColor ?? null,
        notes: b.notes ?? null,
      })),
    [bookings]
  );

  const zoneStates = useMemo(() => {
    const map = new Map();
    for (const zone of zones) {
      map.set(zone.id, computeZoneState(zone, normalizedBookings, now));
    }
    return map;
  }, [zones, normalizedBookings, now]);

  const activityItems = useMemo(
    () => computeActivityFeed(normalizedBookings, now),
    [normalizedBookings, now]
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <SummaryPanel
        zones={zones}
        zoneStates={zoneStates}
        totalBookingsToday={bookings.length}
      />

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-3 md:p-4 pb-20 md:pb-4">
          {zones.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground text-sm">Зоны не настроены</p>
            </div>
          ) : (
            <motion.div
              className="grid gap-3 md:gap-4"
              style={{
                gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              }}
            >
              {zones.map((zone, i) => {
                const state = zoneStates.get(zone.id)!;
                const dayBookings = bookings.filter((b) => b.zoneId === zone.id && b.status !== "cancelled");
                return (
                  <motion.div
                    key={zone.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.35 }}
                  >
                    <ZoneCard
                      zone={zone}
                      state={state}
                      now={now}
                      dayBookings={dayBookings}
                      onClick={() => {
                        if (state.activeBooking) {
                          onBookingClick(state.activeBooking.id);
                        } else {
                          onZoneClick(zone.id);
                        }
                      }}
                      onDoubleClick={() => onZoneClick(zone.id)}
                    />
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>

        <div className="hidden md:flex w-64 shrink-0 border-l border-border/50 bg-background/30 backdrop-blur overflow-hidden flex-col">
          <ActivityFeed items={activityItems} />
        </div>
      </div>
    </div>
  );
}
