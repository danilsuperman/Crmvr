import { useState } from "react";
import { useParams, Link } from "wouter";
import {
  useGetEvent,
  getGetEventQueryKey,
  useAddEventStage,
  useUpdateEventStage,
  useDeleteEventStage,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft, Plus, Clock, Users, MapPin, Trash2, GripVertical } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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

export default function EventDetail() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id || "0", 10);
  const queryClient = useQueryClient();

  const { data: event, isLoading } = useGetEvent(id, {
    query: { enabled: !!id, queryKey: getGetEventQueryKey(id) },
  });

  const [stageModal, setStageModal] = useState<{
    open: boolean; name: string; description: string; durationMinutes: string;
  }>({ open: false, name: "", description: "", durationMinutes: "30" });

  const addStage = useAddEventStage({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetEventQueryKey(id) });
        toast.success("Этап добавлен");
        setStageModal({ open: false, name: "", description: "", durationMinutes: "30" });
      },
      onError: () => toast.error("Ошибка"),
    },
  });

  const deleteStage = useDeleteEventStage({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetEventQueryKey(id) });
        toast.success("Этап удалён");
      },
      onError: () => toast.error("Ошибка"),
    },
  });

  const handleAddStage = () => {
    if (!stageModal.name.trim()) { toast.error("Введите название этапа"); return; }
    addStage.mutate({
      id,
      data: {
        name: stageModal.name,
        description: stageModal.description || undefined,
        durationMinutes: Number(stageModal.durationMinutes) || 30,
        orderIndex: (event?.stages?.length || 0),
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full z-10">
        <header className="h-14 border-b border-border/50 flex items-center px-4 gap-3 bg-card/50 backdrop-blur-sm">
          <Link href="/events">
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

  const totalDuration = event?.stages?.reduce((s, st) => s + (st.durationMinutes || 0), 0) || 0;

  return (
    <div className="flex flex-col h-full z-10">
      <header className="h-14 border-b border-border/50 flex items-center px-4 justify-between bg-card/50 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-2">
          <Link href="/events">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-base font-bold leading-tight truncate max-w-[200px]">
              {event?.title || "Мероприятие"}
            </h1>
            {event && (
              <p className="text-[10px] text-muted-foreground">
                {format(new Date(event.startTime), "d MMMM yyyy", { locale: ru })}
              </p>
            )}
          </div>
        </div>
        {event && (
          <span className={cn("text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider", STATUS_COLORS[event.status] || "bg-muted/40 text-muted-foreground")}>
            {STATUS_LABELS[event.status] || event.status}
          </span>
        )}
      </header>

      <div className="flex-1 p-4 md:p-6 overflow-auto pb-20 md:pb-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Event info */}
          {event && (
            <div className="border border-border/50 bg-card/30 p-4 rounded-xl">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>{format(new Date(event.startTime), "HH:mm")} — {format(new Date(event.endTime), "HH:mm")}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-4 h-4 shrink-0" />
                  <span>{event.guestsCount} гостей</span>
                </div>
                {event.zones && (
                  <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span className="text-xs">{event.zones}</span>
                  </div>
                )}
                {event.description && (
                  <p className="text-sm text-muted-foreground col-span-2">{event.description}</p>
                )}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="border border-border/50 bg-card/30 p-4 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Таймлайн
                </h2>
                {totalDuration > 0 && (
                  <p className="text-xs text-muted-foreground mt-0.5">Итого: {totalDuration} мин</p>
                )}
              </div>
              <Button
                size="sm"
                className="h-7 gap-1 text-xs"
                onClick={() => setStageModal({ open: true, name: "", description: "", durationMinutes: "30" })}
                data-testid="button-add-stage"
              >
                <Plus className="w-3 h-3" /> Этап
              </Button>
            </div>

            {!event?.stages?.length ? (
              <div className="flex flex-col items-center py-8 gap-2 text-muted-foreground">
                <Clock className="w-8 h-8 opacity-20" />
                <p className="text-sm">Этапов пока нет</p>
              </div>
            ) : (
              <div className="space-y-2">
                {event.stages.map((stage, i) => (
                  <div key={stage.id} className="flex items-start gap-3 group" data-testid={`stage-${stage.id}`}>
                    {/* Timeline connector */}
                    <div className="flex flex-col items-center shrink-0 mt-1">
                      <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-primary">{i + 1}</span>
                      </div>
                      {i < (event.stages?.length || 0) - 1 && (
                        <div className="w-px h-full min-h-[16px] bg-border/50 mt-1" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold">{stage.name}</p>
                          {stage.description && (
                            <p className="text-xs text-muted-foreground mt-0.5">{stage.description}</p>
                          )}
                          {stage.durationMinutes && (
                            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {stage.durationMinutes} мин
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost" size="icon" className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                          onClick={() => deleteStage.mutate({ id, stageId: stage.id })}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={stageModal.open} onOpenChange={(o) => setStageModal((s) => ({ ...s, open: o }))}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Новый этап</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Название *</Label>
              <Input className="h-9 text-sm" placeholder="Сбор гостей" value={stageModal.name} onChange={(e) => setStageModal((s) => ({ ...s, name: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Описание</Label>
              <Input className="h-9 text-sm" placeholder="Описание этапа" value={stageModal.description} onChange={(e) => setStageModal((s) => ({ ...s, description: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Длительность (мин)</Label>
              <Input className="h-9 text-sm" type="number" min="1" value={stageModal.durationMinutes} onChange={(e) => setStageModal((s) => ({ ...s, durationMinutes: e.target.value }))} />
            </div>
            <Button className="w-full" onClick={handleAddStage} disabled={addStage.isPending}>
              {addStage.isPending ? "Добавление..." : "Добавить этап"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
