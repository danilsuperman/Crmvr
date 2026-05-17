import { useState } from "react";
import { useListClients } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Phone, Calendar, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

export default function Clients() {
  const [search, setSearch] = useState("");
  const [, navigate] = useLocation();
  const { data: clients = [], isLoading } = useListClients({ search });

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
