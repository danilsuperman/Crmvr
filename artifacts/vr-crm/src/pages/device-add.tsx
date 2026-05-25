import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useLocalStorage } from "@/lib/store";
import {
  ArrowLeft, ArrowRight, Check, Cpu, Wifi, MapPin, CheckCircle2,
  Star, ChevronRight, Users
} from "lucide-react";

type SettingsZone = { id: number; name: string; color: string; capacity: number; openTime: string; closeTime: string };

const DEVICE_TYPES = [
  {
    id: "pico4e",
    name: "Pico 4 Enterprise",
    desc: "Корпоративное управление, расширенный MDM",
    recommended: true,
    support: "Полная поддержка",
  },
  {
    id: "pico4",
    name: "Pico 4",
    desc: "Стандартная модель, полная поддержка",
    recommended: false,
    support: "Полная поддержка",
  },
  {
    id: "piconeo",
    name: "Pico Neo",
    desc: "Корпоративная серия Pico",
    recommended: false,
    support: "Полная поддержка",
  },
  {
    id: "mq3",
    name: "Meta Quest 3",
    desc: "Частичное управление через MDM",
    recommended: false,
    support: "Частичная поддержка",
  },
  {
    id: "mq2",
    name: "Meta Quest 2",
    desc: "Ограниченная поддержка API Meta",
    recommended: false,
    support: "Ограниченная поддержка",
  },
];

const DEFAULT_SETTINGS_ZONES: SettingsZone[] = [
  { id: 1, name: "Arena A", color: "#6366f1", capacity: 4, openTime: "10:00", closeTime: "22:00" },
  { id: 2, name: "Arena B", color: "#8b5cf6", capacity: 4, openTime: "10:00", closeTime: "22:00" },
  { id: 3, name: "VR Solo", color: "#ec4899", capacity: 1, openTime: "10:00", closeTime: "22:00" },
  { id: 4, name: "Racing Zone", color: "#f59e0b", capacity: 2, openTime: "12:00", closeTime: "22:00" },
  { id: 5, name: "PS5", color: "#3b82f6", capacity: 2, openTime: "10:00", closeTime: "23:00" },
  { id: 6, name: "Motion", color: "#10b981", capacity: 1, openTime: "11:00", closeTime: "21:00" },
];

export default function DeviceAdd() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1);
  const [settingsZones] = useLocalStorage<SettingsZone[]>("vrpark_zones", DEFAULT_SETTINGS_ZONES);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [deviceName, setDeviceName] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [ipAddress, setIpAddress] = useState("");
  const [selectedZone, setSelectedZone] = useState<string>("none");

  const canNext1 = !!selectedType;
  const canNext2 = deviceName.trim().length > 0;
  const canNext3 = true;

  const selectedTypeDef = DEVICE_TYPES.find(t => t.id === selectedType);
  const selectedZoneName = selectedZone === "none" ? null : selectedZone;
  const finalName = deviceName || (selectedTypeDef?.name ?? "");

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="h-14 border-b border-border/50 flex items-center px-4 md:px-6 bg-card/50 backdrop-blur-sm shrink-0 gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => step > 1 ? setStep(s => s - 1) : navigate("/devices")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-base font-bold">Подключить шлем</h1>
          <p className="text-[10px] text-muted-foreground">Регистрация нового VR-устройства в системе</p>
        </div>
      </header>

      {/* Progress */}
      <div className="px-4 md:px-6 py-3 border-b border-border/50 bg-card/20">
        <div className="flex items-center gap-2 max-w-2xl mx-auto">
          {[
            { n: 1, label: "Тип устройства" },
            { n: 2, label: "Данные шлема" },
            { n: 3, label: "Сеть и зона" },
            { n: 4, label: "Подключение" },
          ].map((s, i, arr) => (
            <div key={s.n} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-1 flex-1">
                <div className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all",
                  step > s.n ? "bg-green-500 border-green-500 text-white" :
                  step === s.n ? "bg-primary border-primary text-primary-foreground" :
                  "bg-transparent border-border/50 text-muted-foreground"
                )}>
                  {step > s.n ? <Check className="w-3.5 h-3.5" /> : s.n}
                </div>
                <span className={cn("text-[9px] text-center leading-tight hidden sm:block", step === s.n ? "text-foreground font-medium" : "text-muted-foreground")}>
                  {s.label}
                </span>
              </div>
              {i < arr.length - 1 && (
                <div className={cn("h-0.5 flex-1 mx-1 rounded-full transition-all", step > s.n ? "bg-green-500" : "bg-border/50")} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-6 pb-20 md:pb-6">
        <div className="max-w-2xl mx-auto">

          {/* Step 1: Device Type */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-semibold">Выберите тип устройства</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Выберите модель VR-шлема, который хотите добавить в систему</p>
              </div>
              <div className="grid gap-2">
                {DEVICE_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={cn(
                      "w-full text-left p-4 rounded-xl border transition-all hover:border-primary/50",
                      selectedType === type.id
                        ? "border-primary bg-primary/8"
                        : "border-border/50 bg-card/30"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all",
                        selectedType === type.id ? "border-primary bg-primary" : "border-border/50"
                      )}>
                        {selectedType === type.id && <Check className="w-3 h-3 text-primary-foreground" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{type.name}</span>
                          {type.recommended && (
                            <Badge className="text-[9px] h-4 gap-0.5 px-1.5 bg-primary/20 text-primary border-primary/30">
                              <Star className="w-2.5 h-2.5" /> Рекомендуется
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{type.desc}</p>
                        <p className={cn("text-[10px] mt-1",
                          type.support === "Полная поддержка" ? "text-green-400" :
                          type.support === "Частичная поддержка" ? "text-yellow-400" : "text-red-400"
                        )}>{type.support}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <Button className="w-full gap-2" disabled={!canNext1} onClick={() => setStep(2)}>
                Далее <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Step 2: Device Data */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-semibold">Данные устройства</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Введите информацию о новом шлеме</p>
              </div>

              {selectedTypeDef && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-primary/5 border border-primary/20">
                  <Cpu className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">{selectedTypeDef.name}</span>
                  <button className="ml-auto text-[10px] text-muted-foreground hover:text-foreground" onClick={() => setStep(1)}>Изменить</button>
                </div>
              )}

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">
                    Название шлема <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    className="h-10 text-sm"
                    placeholder="Имя, которое будет отображаться в системе"
                    value={deviceName}
                    onChange={(e) => setDeviceName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Серийный номер</Label>
                  <Input
                    className="h-10 text-sm font-mono"
                    placeholder="SN-XXXX-XXXXX"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 gap-2" onClick={() => setStep(1)}>
                  <ArrowLeft className="w-4 h-4" /> Назад
                </Button>
                <Button className="flex-1 gap-2" disabled={!canNext2} onClick={() => setStep(3)}>
                  Далее <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Network & Zone */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-semibold">Сетевые настройки</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Настройте сеть и зону размещения</p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs flex items-center gap-1">
                  <Wifi className="w-3 h-3" /> IP-адрес устройства
                </Label>
                <Input
                  className="h-10 text-sm font-mono"
                  placeholder="192.168.1.xxx"
                  value={ipAddress}
                  onChange={(e) => setIpAddress(e.target.value)}
                />
                <p className="text-[10px] text-muted-foreground">Введите статический IP, назначенный шлему в локальной сети VR-парка</p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Зона размещения
                </Label>
                <div className="grid gap-2">
                  {/* No zone option */}
                  <button
                    onClick={() => setSelectedZone("none")}
                    className={cn(
                      "w-full text-left p-3 rounded-xl border transition-all",
                      selectedZone === "none" ? "border-primary bg-primary/8" : "border-border/50 bg-card/20 hover:border-primary/30"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                        selectedZone === "none" ? "border-primary bg-primary" : "border-border/50"
                      )}>
                        {selectedZone === "none" && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">Без зоны</p>
                        <p className="text-xs text-muted-foreground">Назначить позже</p>
                      </div>
                    </div>
                  </button>
                  {/* Zones from settings */}
                  {settingsZones.map((zone) => (
                    <button
                      key={zone.id}
                      onClick={() => setSelectedZone(zone.name)}
                      className={cn(
                        "w-full text-left p-3 rounded-xl border transition-all",
                        selectedZone === zone.name ? "border-primary bg-primary/8" : "border-border/50 bg-card/20 hover:border-primary/30"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                          selectedZone === zone.name ? "border-primary bg-primary" : "border-border/50"
                        )}>
                          {selectedZone === zone.name && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: zone.color }} />
                            <p className="text-sm font-medium">{zone.name}</p>
                          </div>
                          <p className="text-xs text-muted-foreground">Вместимость: {zone.capacity} · {zone.openTime}–{zone.closeTime}</p>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground shrink-0">
                          <Users className="w-3 h-3" /> {zone.capacity} мест
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 gap-2" onClick={() => setStep(2)}>
                  <ArrowLeft className="w-4 h-4" /> Назад
                </Button>
                <Button className="flex-1 gap-2" onClick={() => setStep(4)}>
                  Подключить <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Done */}
          {step === 4 && (
            <div className="space-y-6 text-center">
              <div className="flex flex-col items-center gap-3 pt-4">
                <div className="w-16 h-16 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Устройство зарегистрировано!</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    <span className="font-medium text-foreground">{finalName}</span> добавлен в систему
                    {selectedZoneName && (
                      <> · <span className="text-primary">{selectedZoneName}</span></>
                    )}
                  </p>
                </div>
              </div>

              <div className="text-left p-4 rounded-xl border border-border/50 bg-card/30 space-y-3">
                <p className="text-sm font-semibold">Следующие шаги:</p>
                <div className="space-y-3">
                  {[
                    { n: 1, text: "Включите VR-шлем и подключите к локальной сети парка" },
                    { n: 2, text: "Установите VR Agent на устройство" },
                    { n: 3, text: "Введите адрес сервера CRM в настройках агента" },
                    { n: 4, text: "Устройство автоматически появится в системе как активное" },
                  ].map((step) => (
                    <div key={step.n} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/15 text-primary text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {step.n}
                      </div>
                      <p className="text-sm text-muted-foreground">{step.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {ipAddress && (
                <div className="p-3 rounded-xl border border-border/50 bg-card/20 text-left">
                  <p className="text-[10px] text-muted-foreground mb-1">Адрес CRM-сервера для настройки агента</p>
                  <p className="text-sm font-mono font-medium">http://crm.vrpark.local/api/agent</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => navigate("/devices")}>
                  К списку устройств
                </Button>
                <Button className="flex-1 gap-2" onClick={() => navigate("/control")}>
                  <Cpu className="w-4 h-4" /> Центр управления
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
