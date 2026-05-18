import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useListZones,
  useListSessionTypes,
  useListPackages,
  useCreateZone,
  useUpdateZone,
  useDeleteZone,
  useCreateSessionType,
  useUpdateSessionType,
  useDeleteSessionType,
  useCreatePackage,
  useUpdatePackage,
  useDeletePackage,
  getListZonesQueryKey,
  getListSessionTypesQueryKey,
  getListPackagesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Clock, Package, Users } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const ZONE_COLORS = ["#6366f1","#8b5cf6","#ec4899","#f59e0b","#10b981","#3b82f6","#ef4444","#06b6d4"];

export default function Settings() {
  const queryClient = useQueryClient();
  const { data: zones = [], isLoading: isLoadingZones } = useListZones();
  const { data: sessionTypes = [], isLoading: isLoadingSessionTypes } = useListSessionTypes();
  const { data: packages = [], isLoading: isLoadingPackages } = useListPackages();

  // Zone modal
  const [zoneModal, setZoneModal] = useState<{
    open: boolean; id?: number;
    name: string; color: string; capacity: string; openTime: string; closeTime: string;
  }>({ open: false, name: "", color: "#6366f1", capacity: "10", openTime: "10:00", closeTime: "22:00" });

  // Session modal
  const [sessionModal, setSessionModal] = useState<{
    open: boolean; id?: number;
    name: string; color: string; minDuration: string;
  }>({ open: false, name: "", color: "#8b5cf6", minDuration: "30" });

  // Package modal
  const [pkgModal, setPkgModal] = useState<{
    open: boolean; id?: number;
    name: string; description: string; maxGuests: string; zoneIds: number[];
  }>({ open: false, name: "", description: "", maxGuests: "10", zoneIds: [] });

  // Mutations — Zones
  const createZone = useCreateZone({ mutation: { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListZonesQueryKey() }); toast.success("Зона добавлена"); setZoneModal(z => ({ ...z, open: false })); }, onError: () => toast.error("Ошибка") } });
  const updateZone = useUpdateZone({ mutation: { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListZonesQueryKey() }); toast.success("Зона обновлена"); setZoneModal(z => ({ ...z, open: false })); }, onError: () => toast.error("Ошибка") } });
  const deleteZone = useDeleteZone({ mutation: { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListZonesQueryKey() }); toast.success("Зона удалена"); }, onError: () => toast.error("Ошибка") } });

  // Mutations — Session types
  const createSession = useCreateSessionType({ mutation: { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListSessionTypesQueryKey() }); toast.success("Тип добавлен"); setSessionModal(s => ({ ...s, open: false })); }, onError: () => toast.error("Ошибка") } });
  const updateSession = useUpdateSessionType({ mutation: { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListSessionTypesQueryKey() }); toast.success("Тип обновлён"); setSessionModal(s => ({ ...s, open: false })); }, onError: () => toast.error("Ошибка") } });
  const deleteSession = useDeleteSessionType({ mutation: { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListSessionTypesQueryKey() }); toast.success("Тип удалён"); }, onError: () => toast.error("Ошибка") } });

  // Mutations — Packages
  const createPkg = useCreatePackage({ mutation: { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListPackagesQueryKey() }); toast.success("Пакет добавлен"); setPkgModal(p => ({ ...p, open: false })); }, onError: () => toast.error("Ошибка") } });
  const updatePkg = useUpdatePackage({ mutation: { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListPackagesQueryKey() }); toast.success("Пакет обновлён"); setPkgModal(p => ({ ...p, open: false })); }, onError: () => toast.error("Ошибка") } });
  const deletePkg = useDeletePackage({ mutation: { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListPackagesQueryKey() }); toast.success("Пакет удалён"); }, onError: () => toast.error("Ошибка") } });

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

  const handlePkgSave = () => {
    if (!pkgModal.name.trim()) { toast.error("Введите название пакета"); return; }
    const data = {
      name: pkgModal.name,
      description: pkgModal.description || undefined,
      zoneIds: pkgModal.zoneIds,
      maxGuests: Number(pkgModal.maxGuests) || 10,
    };
    if (pkgModal.id) updatePkg.mutate({ id: pkgModal.id, data });
    else createPkg.mutate({ data });
  };

  const toggleZoneInPkg = (zoneId: number) => {
    setPkgModal((p) => ({
      ...p,
      zoneIds: p.zoneIds.includes(zoneId)
        ? p.zoneIds.filter((id) => id !== zoneId)
        : [...p.zoneIds, zoneId],
    }));
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
            <TabsTrigger value="packages" className="text-xs">Пакеты</TabsTrigger>
            <TabsTrigger value="system" className="text-xs">Система</TabsTrigger>
          </TabsList>

          {/* Zones tab */}
          <TabsContent value="zones" className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-base font-semibold">Зоны парка</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Управляйте VR-зонами и игровыми пространствами.</p>
              </div>
              <Button
                size="sm" className="h-8 gap-1.5 text-xs"
                onClick={() => setZoneModal({ open: true, name: "", color: "#6366f1", capacity: "10", openTime: "10:00", closeTime: "22:00" })}
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
                        <Button variant="ghost" size="icon" className="h-7 w-7"
                          onClick={() => setZoneModal({ open: true, id: zone.id, name: zone.name, color: zone.color, capacity: String(zone.capacity), openTime: zone.openTime || "10:00", closeTime: zone.closeTime || "22:00" })}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => deleteZone.mutate({ id: zone.id })}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Session types tab */}
          <TabsContent value="sessions" className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-base font-semibold">Типы сеансов</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Настройте виды и продолжительность игровых сеансов.</p>
              </div>
              <Button
                size="sm" className="h-8 gap-1.5 text-xs"
                onClick={() => setSessionModal({ open: true, name: "", color: "#8b5cf6", minDuration: "30" })}
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
                        <Button variant="ghost" size="icon" className="h-7 w-7"
                          onClick={() => setSessionModal({ open: true, id: st.id, name: st.name, color: st.color, minDuration: String(st.minDuration) })}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => deleteSession.mutate({ id: st.id })}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Packages tab */}
          <TabsContent value="packages" className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-base font-semibold">Пакеты мероприятий</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Создайте пакеты для дней рождений, турниров и других событий. Пакет определяет зоны и максимальное число гостей.
                </p>
              </div>
              <Button
                size="sm" className="h-8 gap-1.5 text-xs"
                onClick={() => setPkgModal({ open: true, name: "", description: "", maxGuests: "10", zoneIds: [] })}
              >
                <Plus className="w-3.5 h-3.5" /> Добавить пакет
              </Button>
            </div>

            <div className="grid gap-3">
              {isLoadingPackages ? (
                <div className="flex items-center justify-center h-20">
                  <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                </div>
              ) : packages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 border border-dashed border-border/50 rounded-xl text-muted-foreground">
                  <Package className="w-8 h-8 mb-2 opacity-40" />
                  <p className="text-sm">Пакеты не созданы</p>
                  <p className="text-xs mt-0.5 opacity-70">Нажмите «Добавить пакет» чтобы начать</p>
                </div>
              ) : packages.map((pkg) => {
                const pkgZones = (pkg.zoneIds as number[]).map((id) => zones.find((z) => z.id === id)).filter(Boolean);
                return (
                  <Card key={pkg.id} className="bg-card/30 border-border/50">
                    <CardHeader className="py-3 px-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center shrink-0 mt-0.5">
                            <Package className="w-4 h-4 text-blue-400" />
                          </div>
                          <div className="min-w-0">
                            <CardTitle className="text-sm">{pkg.name}</CardTitle>
                            {pkg.description && (
                              <CardDescription className="text-xs mt-0.5">{pkg.description}</CardDescription>
                            )}
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              <span className="flex items-center gap-1 text-[10px] bg-muted/40 px-2 py-0.5 rounded-full text-muted-foreground">
                                <Users className="w-2.5 h-2.5" />
                                Макс. {pkg.maxGuests} гост.
                              </span>
                              {pkgZones.map((z) => z && (
                                <span
                                  key={z.id}
                                  className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                                  style={{ backgroundColor: z.color + "20", color: z.color }}
                                >
                                  {z.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <Button
                            variant="ghost" size="icon" className="h-7 w-7"
                            onClick={() => setPkgModal({
                              open: true,
                              id: pkg.id,
                              name: pkg.name,
                              description: pkg.description || "",
                              maxGuests: pkg.maxGuests.toString(),
                              zoneIds: pkg.zoneIds as number[],
                            })}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => deletePkg.mutate({ id: pkg.id })}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* System tab */}
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
              <Input className="h-9 text-sm" value={sessionModal.name} onChange={(e) => setSessionModal((s) => ({ ...s, name: e.target.value }))} placeholder="Стандарт" />
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

      {/* Package modal */}
      <Dialog open={pkgModal.open} onOpenChange={(o) => setPkgModal((p) => ({ ...p, open: o }))}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{pkgModal.id ? "Редактировать пакет" : "Новый пакет мероприятия"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Название пакета</Label>
              <Input
                className="h-9 text-sm"
                value={pkgModal.name}
                onChange={(e) => setPkgModal((p) => ({ ...p, name: e.target.value }))}
                placeholder="День рождения VIP"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Описание</Label>
              <Input
                className="h-9 text-sm"
                value={pkgModal.description}
                onChange={(e) => setPkgModal((p) => ({ ...p, description: e.target.value }))}
                placeholder="Включает банкетный зал и VR-арену"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Макс. гостей</Label>
              <Input
                className="h-9 text-sm"
                type="number"
                min="1"
                value={pkgModal.maxGuests}
                onChange={(e) => setPkgModal((p) => ({ ...p, maxGuests: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Зоны пакета</Label>
              <div className="flex flex-wrap gap-2">
                {zones.map((zone) => {
                  const selected = pkgModal.zoneIds.includes(zone.id);
                  return (
                    <button
                      key={zone.id}
                      onClick={() => toggleZoneInPkg(zone.id)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                        selected
                          ? "border-primary bg-primary/15 text-primary"
                          : "border-border/50 bg-muted/20 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: zone.color }}
                      />
                      {zone.name}
                    </button>
                  );
                })}
              </div>
              {pkgModal.zoneIds.length > 0 && (
                <p className="text-[10px] text-muted-foreground">
                  Выбрано: {pkgModal.zoneIds.length} зон
                </p>
              )}
            </div>
            <Button className="w-full mt-1" onClick={handlePkgSave} disabled={createPkg.isPending || updatePkg.isPending}>
              {pkgModal.id ? "Сохранить" : "Создать пакет"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
