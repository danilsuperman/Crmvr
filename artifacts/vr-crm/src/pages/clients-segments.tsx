import { useState } from "react";
import { useLocation } from "wouter";
import { useLocalStorage } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Plus, Users, ChevronLeft, Filter, Star, ArrowRight, Trash2 } from "lucide-react";
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

const BUILT_IN_SEGMENTS = [
  {
    id: "all",
    name: "Все клиенты",
    icon: "👥",
    color: "#6366f1",
    description: "Полная база клиентов без фильтров",
    criteria: "Без ограничений",
    filter: (_c: typeof MOCK_CLIENTS_DATA[0]) => true,
  },
  {
    id: "vip",
    name: "VIP",
    icon: "💎",
    color: "#f59e0b",
    description: "Постоянные гости с 10 и более визитами",
    criteria: "10+ визитов",
    filter: (c: typeof MOCK_CLIENTS_DATA[0]) => c.visitCount >= 10,
  },
  {
    id: "regular",
    name: "Постоянные",
    icon: "⭐",
    color: "#8b5cf6",
    description: "Гости с 3–9 визитами",
    criteria: "3–9 визитов",
    filter: (c: typeof MOCK_CLIENTS_DATA[0]) => c.visitCount >= 3 && c.visitCount < 10,
  },
  {
    id: "new",
    name: "Новые",
    icon: "🌟",
    color: "#10b981",
    description: "Первый или единственный визит",
    criteria: "1 визит",
    filter: (c: typeof MOCK_CLIENTS_DATA[0]) => c.visitCount <= 1,
  },
  {
    id: "inactive",
    name: "Неактивные",
    icon: "😴",
    color: "#ef4444",
    description: "Не посещали более 30 дней — требуют внимания",
    criteria: "Последний визит 30+ дней назад",
    filter: (c: typeof MOCK_CLIENTS_DATA[0]) => {
      const diff = (Date.now() - new Date(c.lastVisit).getTime()) / 86400000;
      return diff >= 30;
    },
  },
];

export default function ClientsSegments() {
  const [, navigate] = useLocation();
  const [allClients] = useLocalStorage("vrpark_clients", MOCK_CLIENTS_DATA);
  const [customSegments, setCustomSegments] = useLocalStorage<CustomSegment[]>("vrpark_custom_segments", []);

  const deleteSegment = (id: number) => {
    if (!confirm("Удалить сегмент?")) return;
    setCustomSegments(prev => prev.filter(s => s.id !== id));
    toast.success("Сегмент удалён");
  };

  return (
    <div className="flex flex-col h-full">
      <header className="h-14 border-b border-border/50 flex items-center px-4 md:px-6 justify-between bg-card/50 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/clients")}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Клиенты</span>
          </button>
          <span className="text-muted-foreground/40">/</span>
          <h1 className="text-lg font-bold font-mono">Сегменты</h1>
        </div>
        <Button
          size="sm"
          className="h-8 gap-1.5 text-xs"
          onClick={() => navigate("/clients/segments/new")}
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Новый сегмент</span>
          <span className="sm:hidden">Создать</span>
        </Button>
      </header>

      <div className="flex-1 overflow-auto px-4 md:px-6 py-5 pb-20 md:pb-6 space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Стандартные сегменты</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {BUILT_IN_SEGMENTS.map(seg => {
              const count = allClients.filter(seg.filter).length;
              return (
                <div
                  key={seg.id}
                  className="rounded-xl border border-border/50 bg-card/30 p-4 cursor-pointer hover:border-primary/40 hover:bg-card/50 transition-all group"
                  onClick={() => navigate(`/clients?segment=${seg.id}`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                      style={{ backgroundColor: seg.color + "20" }}
                    >
                      {seg.icon}
                    </div>
                    <span className="text-2xl font-black tabular-nums" style={{ color: seg.color }}>
                      {count}
                    </span>
                  </div>
                  <p className="text-sm font-semibold mb-0.5">{seg.name}</p>
                  <p className="text-xs text-muted-foreground mb-2.5">{seg.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground/70 bg-muted/30 px-2 py-0.5 rounded-full">
                      {seg.criteria}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">Пользовательские сегменты</h2>
            </div>
            <span className="text-xs text-muted-foreground">{customSegments.length}</span>
          </div>

          {customSegments.length === 0 ? (
            <div
              className="rounded-xl border border-dashed border-border/50 bg-card/10 p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary/40 hover:bg-card/20 transition-all"
              onClick={() => navigate("/clients/segments/new")}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Plus className="w-5 h-5 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Создайте первый сегмент</p>
                <p className="text-xs text-muted-foreground mt-1">Объедините клиентов по любым критериям для рассылок и анализа</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {customSegments.map(seg => {
                const clientsCount = allClients.filter(c => {
                  const cr = seg.criteria;
                  if (cr.minVisits !== undefined && c.visitCount < cr.minVisits) return false;
                  if (cr.maxVisits !== undefined && c.visitCount > cr.maxVisits) return false;
                  if (cr.inactiveDays !== undefined) {
                    const diff = (Date.now() - new Date(c.lastVisit).getTime()) / 86400000;
                    if (diff < cr.inactiveDays) return false;
                  }
                  if (cr.activeInDays !== undefined) {
                    const diff = (Date.now() - new Date(c.lastVisit).getTime()) / 86400000;
                    if (diff > cr.activeInDays) return false;
                  }
                  return true;
                }).length;
                return (
                  <div key={seg.id} className="rounded-xl border border-border/50 bg-card/30 p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: seg.color + "20" }}>
                        <Users className="w-4 h-4" style={{ color: seg.color }} />
                      </div>
                      <span className="text-2xl font-black tabular-nums" style={{ color: seg.color }}>
                        {clientsCount}
                      </span>
                    </div>
                    <p className="text-sm font-semibold mb-0.5">{seg.name}</p>
                    <p className="text-xs text-muted-foreground mb-3">{seg.description || "Пользовательский сегмент"}</p>
                    <div className="flex items-center gap-2">
                      <button
                        className="flex-1 h-7 rounded-lg border border-border/50 text-xs text-muted-foreground hover:border-primary/40 hover:text-primary transition-all"
                        onClick={() => navigate(`/clients?segment=custom_${seg.id}`)}
                      >
                        Показать клиентов
                      </button>
                      <button
                        className="h-7 w-7 rounded-lg border border-red-500/30 text-red-400/70 hover:bg-red-500/10 hover:border-red-500/50 flex items-center justify-center transition-all"
                        onClick={() => deleteSegment(seg.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
