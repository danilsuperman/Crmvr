import { useState } from "react";
import { useListEvents, useCreateEvent, getListEventsQueryKey } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Calendar as CalendarIcon, Clock, Users, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { toast } from "sonner";

const STATUS_LABELS: Record<string, string> = {
  planned: "Запланировано",
  active: "Активно",
  completed: "Завершено",
  cancelled: "Отменено",
};

const STATUS_COLORS: Record<string, string> = {
  planned: "bg-blue-500/20 text-blue-400",
  active: "bg-emerald-500/20 text-emerald-400",
  completed: "bg-muted/40 text-muted-foreground",
  cancelled: "bg-red-500/20 text-red-400",
};

export default function Events() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { data: events = [], isLoading } = useListEvents();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    guestsCount: "10",
    status: "planned",
    zones: "",
    responsible: "",
  });

  const createEvent = useCreateEvent({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListEventsQueryKey() });
        toast.success("Мероприятие создано");
        setIsModalOpen(false);
      },
      onError: () => toast.error("Не удалось создать мероприятие"),
    },
  });

  const handleSubmit = () => {
    if (!form.title.trim() || !form.startTime || !form.endTime) {
      toast.error("Заполните обязательные поля");
      return;
    }
    createEvent.mutate({
      data: {
        title: form.title,
        description: form.description || undefined,
        startTime: new Date(form.startTime).toISOString(),
        endTime: new Date(form.endTime).toISOString(),
        guestsCount: Number(form.guestsCount) || 10,
        status: form.status as "planned" | "active" | "completed" | "cancelled",
        zones: form.zones || undefined,
        responsible: form.responsible || undefined,
      },
    });
  };

  return (
    <div className="flex flex-col h-full z-10">
      <header className="h-14 border-b border-border/50 flex items-center px-4 md:px-6 justify-between bg-card/50 backdrop-blur-sm shrink-0">
        <h1 className="text-lg font-bold font-mono">Мероприятия</h1>
        <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={() => setIsModalOpen(true)} data-testid="button-new-event">
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Новое мероприятие</span>
          <span className="sm:hidden">Создать</span>
        </Button>
      </header>

      <div className="flex-1 p-4 md:p-6 overflow-auto pb-20 md:pb-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : events.length === 0 ? (
          <div className="h-40 border border-border/50 rounded-xl bg-card/30 flex flex-col items-center justify-center gap-2">
            <CalendarIcon className="w-8 h-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">Мероприятий нет</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {events.map((event) => (
              <Card
                key={event.id}
                className="bg-card/40 hover:bg-card/70 active:bg-card/80 transition-colors border-border/50 cursor-pointer rounded-xl overflow-hidden"
                onClick={() => navigate(`/events/${event.id}`)}
                data-testid={`event-card-${event.id}`}
              >
                <CardHeader className="pb-2 p-4">
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-base leading-snug">{event.title}</CardTitle>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider shrink-0 ${STATUS_COLORS[event.status] || "bg-muted/40 text-muted-foreground"}`}>
                      {STATUS_LABELS[event.status] || event.status}
                    </span>
                  </div>
                  {event.description && (
                    <CardDescription className="line-clamp-2 text-xs mt-1">
                      {event.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="pt-0 px-4 pb-4">
                  <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-3.5 h-3.5" />
                      <span>{format(new Date(event.startTime), "d MMMM yyyy", { locale: ru })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        {format(new Date(event.startTime), "HH:mm")} —{" "}
                        {format(new Date(event.endTime), "HH:mm")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5" />
                      <span>{event.guestsCount} гостей</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-end mt-2">
                    <ChevronRight className="w-4 h-4 text-muted-foreground/40" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Новое мероприятие</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Название *</Label>
              <Input
                className="h-9 text-sm"
                placeholder="День рождения, турнир..."
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                data-testid="input-event-title"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Описание</Label>
              <Input
                className="h-9 text-sm"
                placeholder="Описание мероприятия"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Начало *</Label>
                <Input
                  type="datetime-local"
                  className="h-9 text-xs"
                  value={form.startTime}
                  onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Конец *</Label>
                <Input
                  type="datetime-local"
                  className="h-9 text-xs"
                  value={form.endTime}
                  onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Гостей</Label>
                <Input
                  type="number"
                  className="h-9 text-sm"
                  min="1"
                  value={form.guestsCount}
                  onChange={(e) => setForm((f) => ({ ...f, guestsCount: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Статус</Label>
                <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">Запланировано</SelectItem>
                    <SelectItem value="active">Активно</SelectItem>
                    <SelectItem value="completed">Завершено</SelectItem>
                    <SelectItem value="cancelled">Отменено</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Зоны</Label>
                <Input
                  className="h-9 text-sm"
                  placeholder="VR Arena, Lounge"
                  value={form.zones}
                  onChange={(e) => setForm((f) => ({ ...f, zones: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Ответственный</Label>
                <Input
                  className="h-9 text-sm"
                  placeholder="Администратор"
                  value={form.responsible}
                  onChange={(e) => setForm((f) => ({ ...f, responsible: e.target.value }))}
                />
              </div>
            </div>
            <Button
              className="w-full mt-1"
              onClick={handleSubmit}
              disabled={createEvent.isPending}
              data-testid="button-submit-event"
            >
              {createEvent.isPending ? "Создание..." : "Создать мероприятие"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
