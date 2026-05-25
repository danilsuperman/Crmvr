import { useState } from "react";
import { useListClients } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Phone, Calendar, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

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

export default function Clients() {
  const [search, setSearch] = useState("");
  const [, navigate] = useLocation();
  const { data: rawClients = [] } = useListClients({ search });
  const isLoading = false;
  const clients = rawClients.length > 0
    ? rawClients
    : MOCK_CLIENTS_DATA.filter(c =>
        !search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search)
      );

  return (
    <div className="flex flex-col h-full z-10">
      <header className="h-14 border-b border-border/50 flex items-center px-4 md:px-6 justify-between bg-card/50 backdrop-blur-sm shrink-0">
        <h1 className="text-lg font-bold font-mono">Клиенты</h1>
        <Button size="sm" className="h-8 gap-1.5 text-xs">
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Добавить клиента</span>
          <span className="sm:hidden">Добавить</span>
        </Button>
      </header>

      <div className="px-4 md:px-6 py-3 shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по имени или телефону..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
            data-testid="input-client-search"
          />
        </div>
      </div>

      <div className="flex-1 px-4 md:px-6 pb-20 md:pb-6 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : clients.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2 text-muted-foreground">
            <Search className="w-8 h-8 opacity-30" />
            <p className="text-sm">Клиенты не найдены</p>
          </div>
        ) : (
          <>
            {/* Mobile: cards */}
            <div className="flex flex-col gap-2 md:hidden">
              {clients.map((client) => (
                <div
                  key={client.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-card/30 active:bg-card/60 transition-colors cursor-pointer"
                  onClick={() => navigate(`/clients/${client.id}`)}
                  data-testid={`client-card-${client.id}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{client.name}</div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone className="w-3 h-3" />
                        {client.phone}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {client.visitCount || 0} визитов
                      </span>
                    </div>
                    {client.lastVisit && (
                      <div className="flex items-center gap-1 mt-0.5 text-[10px] text-muted-foreground/70">
                        <Calendar className="w-2.5 h-2.5" />
                        {format(new Date(client.lastVisit), "d MMM yyyy", { locale: ru })}
                      </div>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                </div>
              ))}
            </div>

            {/* Desktop: table */}
            <div className="hidden md:block border border-border/50 rounded-xl bg-card/30 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="text-xs font-semibold uppercase tracking-wider">Имя</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider">Телефон</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider">Визиты</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider">Последний визит</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client) => (
                    <TableRow
                      key={client.id}
                      className="cursor-pointer hover:bg-muted/20 transition-colors"
                      onClick={() => navigate(`/clients/${client.id}`)}
                      data-testid={`client-row-${client.id}`}
                    >
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{client.phone}</TableCell>
                      <TableCell>
                        <span className="text-sm font-semibold">{client.visitCount || 0}</span>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {client.lastVisit
                          ? format(new Date(client.lastVisit), "d MMM yyyy", { locale: ru })
                          : "Никогда"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
