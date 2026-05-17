import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import {
  useGetClient,
  useUpdateClient,
  getGetClientQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Save, Phone, Users, Calendar } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<string, string> = {
  confirmed: "Подтверждено",
  pending: "Ожидание",
  cancelled: "Отменено",
  event: "Мероприятие",
};

const STATUS_COLORS: Record<string, string> = {
  confirmed: "bg-emerald-500/20 text-emerald-400",
  pending: "bg-amber-500/20 text-amber-400",
  cancelled: "bg-red-500/20 text-red-400",
  event: "bg-blue-500/20 text-blue-400",
};

export default function ClientDetail() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id || "0", 10);
  const queryClient = useQueryClient();

  const { data: client, isLoading } = useGetClient(id, {
    query: { enabled: !!id, queryKey: getGetClientQueryKey(id) },
  });

  const updateClient = useUpdateClient();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    notes: "",
  });

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || "",
        phone: client.phone || "",
        notes: client.notes || "",
      });
    }
  }, [client]);

  const handleSave = () => {
    updateClient.mutate(
      { id, data: formData },
      {
        onSuccess: () => {
          toast.success("Клиент обновлён");
          queryClient.invalidateQueries({ queryKey: getGetClientQueryKey(id) });
        },
        onError: () => toast.error("Не удалось сохранить"),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full z-10">
        <header className="h-14 border-b border-border/50 flex items-center px-4 gap-3 bg-card/50 backdrop-blur-sm">
          <Link href="/clients">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <span className="text-sm text-muted-foreground">Загрузка...</span>
          </div>
        </header>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full z-10">
      <header className="h-14 border-b border-border/50 flex items-center px-4 justify-between bg-card/50 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-2">
          <Link href="/clients">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-base font-bold leading-tight">{client?.name || "Клиент"}</h1>
            {client && (
              <p className="text-xs text-muted-foreground">{client.visitCount || 0} визитов</p>
            )}
          </div>
        </div>
        <Button
          size="sm"
          className="h-8 gap-1.5 text-xs"
          onClick={handleSave}
          disabled={updateClient.isPending}
          data-testid="button-save-client"
        >
          <Save className="w-3.5 h-3.5" />
          {updateClient.isPending ? "Сохранение..." : "Сохранить"}
        </Button>
      </header>

      <div className="flex-1 p-4 md:p-6 overflow-auto pb-20 md:pb-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Personal info */}
          <div className="border border-border/50 bg-card/30 p-4 rounded-xl space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Личные данные
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Имя</Label>
                <Input
                  className="h-9 text-sm"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  data-testid="input-client-name"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Телефон</Label>
                <Input
                  className="h-9 text-sm"
                  value={formData.phone}
                  onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                  data-testid="input-client-phone"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs">Заметки</Label>
                <Input
                  className="h-9 text-sm"
                  value={formData.notes}
                  onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
                  placeholder="Комментарий об клиенте..."
                  data-testid="input-client-notes"
                />
              </div>
            </div>
          </div>

          {/* Booking history */}
          <div className="border border-border/50 bg-card/30 p-4 rounded-xl">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              История броней
            </h2>
            {client?.bookings?.length ? (
              <div className="space-y-2">
                {client.bookings.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between p-3 border border-border/40 rounded-lg bg-card/40"
                    data-testid={`booking-history-${b.id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className="text-sm font-medium">
                          {format(new Date(b.startTime), "d MMMM yyyy", { locale: ru })}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                        {b.zoneName && <span>{b.zoneName}</span>}
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {b.guestsCount}
                        </span>
                        <span>
                          {format(new Date(b.startTime), "HH:mm")} —{" "}
                          {format(new Date(b.endTime), "HH:mm")}
                        </span>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0",
                        STATUS_COLORS[b.status] || "bg-muted/40 text-muted-foreground"
                      )}
                    >
                      {STATUS_LABELS[b.status] || b.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground">
                <Calendar className="w-8 h-8 opacity-20" />
                <p className="text-sm">Броней пока нет</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
