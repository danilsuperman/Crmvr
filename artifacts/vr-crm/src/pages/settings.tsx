import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useListZones,
  useListSessionTypes,
  useCreateZone,
  useUpdateZone,
  useDeleteZone,
  useCreateSessionType,
  useUpdateSessionType,
  useDeleteSessionType,
  getListZonesQueryKey,
  getListSessionTypesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Clock } from "lucide-react";
import { toast } from "sonner";

const ZONE_COLORS = ["#6366f1","#8b5cf6","#ec4899","#f59e0b","#10b981","#3b82f6","#ef4444","#06b6d4"];

export default function Settings() {
  const queryClient = useQueryClient();
  const { data: zones = [], isLoading: isLoadingZones } = useListZones();
  const { data: sessionTypes = [], isLoading: isLoadingSessionTypes } = useListSessionTypes();

  // Zone modal
  const [zoneModal, setZoneModal] = useState<{ open: boolean; id?: number; name: string; color: string; capacity: string; openTime: string; closeTime: string }>({
    open: false, name: "", color: "#6366f1", capacity: "10", openTime: "10:00", closeTime: "22:00",
  });

  // Session modal
  const [sessionModal, setSessionModal] = useState<{ open: boolean; id?: number; name: string; color: string; minDuration: string }>({
    open: false, name: "", color: "#8b5cf6", minDuration: "30",
  });

  const createZone = useCreateZone({ mutation: { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListZonesQueryKey() }); toast.success("Зона добавлена"); setZoneModal(z => ({...z, open: false})); }, onError: () => toast.error("Ошибка") } });
  const updateZone = useUpdateZone({ mutation: { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListZonesQueryKey() }); toast.success("Зона обновлена"); setZoneModal(z => ({...z, open: false})); }, onError: () => toast.error("Ошибка") } });
  const deleteZone = useDeleteZone({ mutation: { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListZonesQueryKey() }); toast.success("Зона удалена"); }, onError: () => toast.error("Ошибка") } });

  const createSession = useCreateSessionType({ mutation: { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListSessionTypesQueryKey() }); toast.success("Тип сеанса добавлен"); setSessionModal(s => ({...s, open: false})); }, onError: () => toast.error("Ошибка") } });
  const updateSession = useUpdateSessionType({ mutation: { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListSessionTypesQueryKey() }); toast.success("Тип обновлён"); setSessionModal(s => ({...s, open: false})); }, onError: () => toast.error("Ошибка") } });
  const deleteSession = useDeleteSessionType({ mutation: { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListSessionTypesQueryKey() }); toast.success("Тип удалён"); }, onError: () => toast.error("Ошибка") } });

  const handleZoneSave = () => {
    if (!zoneModal.name.trim()) { toast.error("Введите название зоны"); return; }
    const data = { name: zoneModal.name, color: zoneModal.color, capacity: Number(zoneModal.capacity) || 10, openTime: zoneModal.openTime, closeTime: zoneModal.closeTime };
    if (zoneModal.id) updateZone.mutate({ id: zoneModal.id, data });
    else createZone.mutate({ data });
  };

  const handleSessionSave = () => {
    if (!sessionModal.name.trim()) { toast.error("Введите название типа"); return; }
    const data = { name: sessionModal.name, color: sessionModal.color, minDuration: Number(sessionModal.minDuration) || 30 };
    if (sessionModal.id) updateSession.mutate({ id: sessionModal.id, data });
    else createSession.mutate({ data });
  };

  return (
    <div className="flex flex-col h-full z-10">
      <header className="h-14 border-b border-border/50 flex items-center px-4 md:px-6 bg-card/50 backdrop-blur-sm shrink-0">
        <h1 className="text-lg font-bold font-mono">Настройки</h1>
      </header>

      <div className="flex-1 p-4 md:p-6 overflow-auto pb-20 md:pb-6">
        <Tabs defaultValue="zones" className="w-full max-w-4xl">
          <TabsList className="mb-4 bg-muted/30 border border-border/50 h-9">
            <TabsTrigger value="zones" className="text-xs">Зоны</TabsTrigger>
            <TabsTrigger value="sessions" className="text-xs">Типы сеансов</TabsTrigger>
            <TabsTrigger value="system" className="text-xs">Система</TabsTrigger>
          </TabsList>

          <TabsContent value="zones" className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-base font-semibold">Зоны парка</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Управляйте VR-зонами и игровыми пространствами.</p>
              </div>
              <Button
                size="sm"
                className="h-8 gap-1.5 text-xs"
                onClick={() => setZoneModal({ open: true, name: "", color: "#6366f1", capacity: "10", openTime: "10:00", closeTime: "22:00" })}
                data-testid="button-add-zone"
              >
                <Plus className="w-3.5 h-3.5" /> Добавить зону
              </Button>
            </div>

            <div className="grid gap-2">
              {isLoadingZones ? (
                <div className="flex items-center justify-center h-20">
                  <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                </div>
              ) : zones.map((zone) => (
                <Card key={zone.id} className="bg-card/30 border-border/50">
                  <CardHeader className="py-3 px-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: zone.color }} />
                        <div>
                          <CardTitle className="text-sm">{zone.name}</CardTitle>
                          <CardDescription className="text-xs">Вместимость: {zone.capacity} чел. · {zone.openTime || "10:00"}–{zone.closeTime || "22:00"}</CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        <Button
                          variant="ghost" size="icon" className="h-7 w-7"
                          onClick={() => setZoneModal({ open: true, id: zone.id, name: zone.name, color: zone.color, capacity: String(zone.capacity), openTime: zone.openTime || "10:00", closeTime: zone.closeTime || "22:00" })}
                          data-testid={`button-edit-zone-${zone.id}`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => deleteZone.mutate({ id: zone.id })}
                          data-testid={`button-delete-zone-${zone.id}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="sessions" className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-base font-semibold">Типы сеансов</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Настройте виды и продолжительность игровых сеансов.</p>
              </div>
              <Button
                size="sm"
                className="h-8 gap-1.5 text-xs"
                onClick={() => setSessionModal({ open: true, name: "", color: "#8b5cf6", minDuration: "30" })}
                data-testid="button-add-session"
              >
                <Plus className="w-3.5 h-3.5" /> Добавить тип
              </Button>
            </div>

            <div className="grid gap-2">
              {isLoadingSessionTypes ? (
                <div className="flex items-center justify-center h-20">
                  <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                </div>
              ) : sessionTypes.map((st) => (
                <Card key={st.id} className="bg-card/30 border-border/50">
                  <CardHeader className="py-3 px-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: st.color }} />
                        <div>
                          <CardTitle className="text-sm">{st.name}</CardTitle>
                          <CardDescription className="text-xs flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Мин. {st.minDuration} мин
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        <Button
                          variant="ghost" size="icon" className="h-7 w-7"
                          onClick={() => setSessionModal({ open: true, id: st.id, name: st.name, color: st.color, minDuration: String(st.minDuration) })}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => deleteSession.mutate({ id: st.id })}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="system">
            <Card className="bg-card/30 border-border/50">
              <CardHeader>
                <CardTitle className="text-base">Системные настройки</CardTitle>
                <CardDescription>Общая конфигурация парка.</CardDescription>
              </CardHeader>
              <div className="px-6 pb-6">
                <p className="text-sm text-muted-foreground">Рабочие часы и глобальные настройки — скоро.</p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Zone modal */}
      <Dialog open={zoneModal.open} onOpenChange={(o) => setZoneModal((z) => ({ ...z, open: o }))}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{zoneModal.id ? "Редактировать зону" : "Новая зона"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Название</Label>
              <Input className="h-9 text-sm" value={zoneModal.name} onChange={(e) => setZoneModal((z) => ({ ...z, name: e.target.value }))} placeholder="VR Arena" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Цвет</Label>
              <div className="flex gap-2 flex-wrap">
                {ZONE_COLORS.map((c) => (
                  <button key={c} className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${zoneModal.color === c ? "border-white scale-110" : "border-transparent"}`} style={{ backgroundColor: c }} onClick={() => setZoneModal((z) => ({ ...z, color: c }))} />
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Вместимость</Label>
                <Input className="h-9 text-sm" type="number" min="1" value={zoneModal.capacity} onChange={(e) => setZoneModal((z) => ({ ...z, capacity: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Открытие</Label>
                <Input className="h-9 text-xs" type="time" value={zoneModal.openTime} onChange={(e) => setZoneModal((z) => ({ ...z, openTime: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Закрытие</Label>
                <Input className="h-9 text-xs" type="time" value={zoneModal.closeTime} onChange={(e) => setZoneModal((z) => ({ ...z, closeTime: e.target.value }))} />
              </div>
            </div>
            <Button className="w-full" onClick={handleZoneSave} disabled={createZone.isPending || updateZone.isPending}>
              {zoneModal.id ? "Сохранить" : "Добавить зону"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Session modal */}
      <Dialog open={sessionModal.open} onOpenChange={(o) => setSessionModal((s) => ({ ...s, open: o }))}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{sessionModal.id ? "Редактировать тип" : "Новый тип сеанса"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Название</Label>
              <Input className="h-9 text-sm" value={sessionModal.name} onChange={(e) => setSessionModal((s) => ({ ...s, name: e.target.value }))} placeholder="VR Arena" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Цвет</Label>
              <div className="flex gap-2 flex-wrap">
                {ZONE_COLORS.map((c) => (
                  <button key={c} className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${sessionModal.color === c ? "border-white scale-110" : "border-transparent"}`} style={{ backgroundColor: c }} onClick={() => setSessionModal((s) => ({ ...s, color: c }))} />
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Мин. длительность (мин)</Label>
              <Input className="h-9 text-sm" type="number" min="5" value={sessionModal.minDuration} onChange={(e) => setSessionModal((s) => ({ ...s, minDuration: e.target.value }))} />
            </div>
            <Button className="w-full" onClick={handleSessionSave} disabled={createSession.isPending || updateSession.isPending}>
              {sessionModal.id ? "Сохранить" : "Добавить тип"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
