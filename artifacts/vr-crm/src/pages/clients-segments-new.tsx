import { useState } from "react";
import { useLocation } from "wouter";
import { useLocalStorage } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Users, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const MOCK_CLIENTS_DATA = [
  { id: 1, name: "Андрей Смирнов", phone: "+7 916 123-45-67", visitCount: 12, lastVisit: "2026-05-24T10:00:00Z" },
  { id: 2, name: "Мария Козлова", phone: "+7 903 987-65-43", visitCount: 8, lastVisit: "2026-05-23T15:30:00Z" },
  { id: 3, name: "Дмитрий Новиков", phone: "+7 926 555-12-34", visitCount: 3, lastVisit: "2026-05-20T12:00:00Z" },
  { id: 4, name: "Елена Петрова", phone: "+7 985 432-10-98", visitCount: 25, lastVisit: "2026-05-25T11:00:00Z" },
  { id: 5, name: "Иван Сидоров", phone: "+7 965 876-54-32", visitCount: 1, lastVisit: "2026-05-18T16:00:00Z" },
  { id: 6, name: "Наталья Волкова", phone: "+7 911 234-56-78", visitCount: 7, lastVisit: "2026-05-22T14:00:00Z" },
  { id: 7, name: "Алексей Морозов", phone: "+7 977 345-67-89", visitCount: 15, lastVisit: "2026-05-21T10:30:00Z" },
  { id: 8, name: "Светлана Орлова", phone: "+7 999 456-78-90", visitCount: 4, lastVisit: "2026-05-19T13:00:00Z" },
];

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#ef4444", "#06b6d4"];

type CustomSegment = {
  id: number;
  name: string;
  description: string;
  color: string;
  criteria: {
    minVisits?: number;
    maxVisits?: number;
    inactiveDays?: number;
    activeInDays?: number;
  };
  createdAt: string;
};

export default function ClientsSegmentNew() {
  const [, navigate] = useLocation();
  const [allClients] = useLocalStorage("vrpark_clients", MOCK_CLIENTS_DATA);
  const [customSegments, setCustomSegments] = useLocalStorage<CustomSegment[]>("vrpark_custom_segments", []);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [minVisits, setMinVisits] = useState("");
  const [maxVisits, setMaxVisits] = useState("");
  const [inactiveDays, setInactiveDays] = useState("");
  const [activeInDays, setActiveInDays] = useState("");

  const matchCount = allClients.filter(c => {
    if (minVisits && c.visitCount < Number(minVisits)) return false;
    if (maxVisits && c.visitCount > Number(maxVisits)) return false;
    if (inactiveDays) {
      const diff = (Date.now() - new Date(c.lastVisit).getTime()) / 86400000;
      if (diff < Number(inactiveDays)) return false;
    }
    if (activeInDays) {
      const diff = (Date.now() - new Date(c.lastVisit).getTime()) / 86400000;
      if (diff > Number(activeInDays)) return false;
    }
    return true;
  }).length;

  const handleCreate = () => {
    if (!name.trim()) { toast.error("Введите название сегмента"); return; }
    const newSeg: CustomSegment = {
      id: Date.now(),
      name: name.trim(),
      description: description.trim(),
      color,
      criteria: {
        ...(minVisits ? { minVisits: Number(minVisits) } : {}),
        ...(maxVisits ? { maxVisits: Number(maxVisits) } : {}),
        ...(inactiveDays ? { inactiveDays: Number(inactiveDays) } : {}),
        ...(activeInDays ? { activeInDays: Number(activeInDays) } : {}),
      },
      createdAt: new Date().toISOString(),
    };
    setCustomSegments(prev => [newSeg, ...prev]);
    toast.success(`Сегмент «${name}» создан — ${matchCount} клиентов`);
    navigate("/clients/segments");
  };

  return (
    <div className="flex flex-col h-full">
      <header className="h-14 border-b border-border/50 flex items-center px-4 md:px-6 justify-between bg-card/50 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/clients/segments")}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Сегменты</span>
          </button>
          <span className="text-muted-foreground/40">/</span>
          <h1 className="text-lg font-bold font-mono">Новый сегмент</h1>
        </div>
      </header>

      <div className="flex-1 overflow-auto px-4 md:px-6 py-5 pb-20 md:pb-6">
        <div className="max-w-lg space-y-6">
          <div className="rounded-xl border border-border/50 bg-card/30 p-4 flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: color + "20" }}>
              <Users className="w-6 h-6" style={{ color }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{name || "Название сегмента"}</p>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{description || "Описание сегмента"}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-2xl font-black" style={{ color }}>{matchCount}</p>
              <p className="text-[10px] text-muted-foreground">клиентов</p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-semibold">Основная информация</h2>
            <div className="space-y-1.5">
              <Label className="text-xs">Название *</Label>
              <Input
                className="h-9"
                placeholder="Например: Дорогие клиенты"
                value={name}
                onChange={e => setName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Описание</Label>
              <Input
                className="h-9"
                placeholder="Краткое описание сегмента"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Цвет</Label>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={cn(
                      "w-8 h-8 rounded-full border-2 transition-all",
                      color === c ? "border-white scale-110 shadow-lg" : "border-transparent hover:scale-105 opacity-70 hover:opacity-100"
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-semibold">Критерии фильтрации</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Оставьте пустыми поля, которые не нужны</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Минимум визитов</Label>
                <Input
                  className="h-9"
                  type="number"
                  min="0"
                  placeholder="Напр. 5"
                  value={minVisits}
                  onChange={e => setMinVisits(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Максимум визитов</Label>
                <Input
                  className="h-9"
                  type="number"
                  min="0"
                  placeholder="Напр. 20"
                  value={maxVisits}
                  onChange={e => setMaxVisits(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Неактивен X+ дней</Label>
                <Input
                  className="h-9"
                  type="number"
                  min="0"
                  placeholder="Напр. 30"
                  value={inactiveDays}
                  onChange={e => setInactiveDays(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Активен в последние X дней</Label>
                <Input
                  className="h-9"
                  type="number"
                  min="0"
                  placeholder="Напр. 7"
                  value={activeInDays}
                  onChange={e => setActiveInDays(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-primary/8 border border-primary/20">
              <Eye className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="text-xs text-muted-foreground">Под критерии попадают:</span>
              <span className="text-sm font-bold text-primary">{matchCount}</span>
              <span className="text-xs text-muted-foreground">из {allClients.length} клиентов</span>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1 h-9" onClick={() => navigate("/clients/segments")}>
              Отмена
            </Button>
            <Button className="flex-1 h-9" onClick={handleCreate} disabled={!name.trim()}>
              Создать сегмент
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
