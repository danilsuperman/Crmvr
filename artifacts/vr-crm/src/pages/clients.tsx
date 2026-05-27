import { useState } from "react";
import { useListClients } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Phone, Calendar, ChevronRight, Send, Users, Download, Filter, MessageSquare, Clock, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useLocalStorage } from "@/lib/store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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

type Campaign = {
  id: number;
  name: string;
  channel: string;
  segment: string;
  message: string;
  status: "draft" | "sent" | "scheduled";
  sentAt?: string;
  recipientCount: number;
};

const SEGMENT_LABELS: Record<string, string> = {
  all: "Все клиенты",
  vip: "VIP (10+ визитов)",
  inactive: "Неактивные (30+ дней)",
  new: "Новые (1 визит)",
};

const CHANNEL_LABELS: Record<string, string> = {
  whatsapp: "WhatsApp",
  sms: "SMS",
  email: "Email",
  telegram: "Telegram",
};

const MSG_TEMPLATES: Record<string, string> = {
  all: "Привет, {имя}! 👋 Новые игры уже ждут тебя в VR Park. Забронируй сеанс сегодня со скидкой 10% по промокоду VRPARK10. До встречи! 🎮",
  vip: "Привет, {имя}! Ты наш VIP-гость 💎 Специально для тебя — персональная скидка 20% на следующий визит. Промокод: VIP20. Ждём!",
  inactive: "Привет, {имя}! Скучаем по тебе 😊 Давно не виделись — возвращайся в VR Park! Дарим тебе купон -15% на любой сеанс. Промокод: COME15",
  new: "Привет, {имя}! Рады познакомиться 🎉 Для новых друзей у нас есть подарок — второй визит со скидкой 25%. Промокод: WELCOME25",
};

function getSegmentCount(segment: string, clients: typeof MOCK_CLIENTS_DATA): number {
  const now = new Date();
  switch (segment) {
    case "all": return clients.length;
    case "vip": return clients.filter(c => c.visitCount >= 10).length;
    case "inactive": return clients.filter(c => {
      const diff = (now.getTime() - new Date(c.lastVisit).getTime()) / 86400000;
      return diff >= 30;
    }).length;
    case "new": return clients.filter(c => c.visitCount <= 1).length;
    default: return 0;
  }
}

export default function Clients() {
  const [search, setSearch] = useState("");
  const [, navigate] = useLocation();
  useListClients({ search });
  const isLoading = false;

  const [allClients, setAllClients] = useLocalStorage<typeof MOCK_CLIENTS_DATA>("vrpark_clients", MOCK_CLIENTS_DATA);
  const [campaigns, setCampaigns] = useLocalStorage<Campaign[]>("vrpark_campaigns", []);

  const clients = allClients.filter(
    (c) =>
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  const [addOpen, setAddOpen] = useState(false);
  const [clientForm, setClientForm] = useState({ name: "", phone: "" });

  const [mailingOpen, setMailingOpen] = useState(false);
  const [mailingForm, setMailingForm] = useState({
    name: "",
    channel: "whatsapp",
    segment: "all",
    message: MSG_TEMPLATES.all,
    scheduled: false,
    scheduleDate: "",
    scheduleTime: "10:00",
  });

  const handleAddClient = () => {
    if (!clientForm.name.trim()) { toast.error("Введите имя клиента"); return; }
    const newClient = {
      id: Date.now(),
      name: clientForm.name.trim(),
      phone: clientForm.phone.trim(),
      visitCount: 0,
      lastVisit: new Date().toISOString(),
    };
    setAllClients((prev) => [newClient, ...prev]);
    toast.success(`Клиент "${clientForm.name}" добавлен`);
    setClientForm({ name: "", phone: "" });
    setAddOpen(false);
  };

  const handleSegmentChange = (seg: string) => {
    setMailingForm(f => ({ ...f, segment: seg, message: MSG_TEMPLATES[seg] || f.message }));
  };

  const handleSendMailing = () => {
    if (!mailingForm.name.trim()) { toast.error("Введите название кампании"); return; }
    const recipientCount = getSegmentCount(mailingForm.segment, allClients);
    const campaign: Campaign = {
      id: Date.now(),
      name: mailingForm.name,
      channel: mailingForm.channel,
      segment: mailingForm.segment,
      message: mailingForm.message,
      status: mailingForm.scheduled ? "scheduled" : "sent",
      sentAt: mailingForm.scheduled ? undefined : new Date().toISOString(),
      recipientCount,
    };
    setCampaigns(prev => [campaign, ...prev]);
    setMailingOpen(false);
    setMailingForm({ name: "", channel: "whatsapp", segment: "all", message: MSG_TEMPLATES.all, scheduled: false, scheduleDate: "", scheduleTime: "10:00" });
    toast.success(mailingForm.scheduled ? `Рассылка запланирована для ${recipientCount} клиентов` : `Рассылка отправлена ${recipientCount} клиентам`);
  };

  const recipientCount = getSegmentCount(mailingForm.segment, allClients);

  return (
    <div className="flex flex-col h-full z-10">
      <header className="h-14 border-b border-border/50 flex items-center px-4 md:px-6 justify-between bg-card/50 backdrop-blur-sm shrink-0">
        <h1 className="text-lg font-bold font-mono">Клиенты</h1>
        <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={() => setAddOpen(true)}>
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Добавить клиента</span>
          <span className="sm:hidden">Добавить</span>
        </Button>
      </header>

      {/* Quick actions */}
      <div className="px-4 md:px-6 pt-3 pb-0 shrink-0">
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1.5 text-xs border-primary/30 text-primary hover:bg-primary/10"
            onClick={() => setMailingOpen(true)}
          >
            <Send className="w-3.5 h-3.5" /> Создать рассылку
          </Button>
          <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs" onClick={() => toast.info("Сегменты клиентов: VIP, Новые, Неактивные")}>
            <Filter className="w-3.5 h-3.5" /> Сегменты
          </Button>
          <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs" onClick={() => toast.success("Экспорт начат (CSV)")}>
            <Download className="w-3.5 h-3.5" /> Экспорт
          </Button>
          {campaigns.length > 0 && (
            <div className="flex items-center gap-1.5 ml-auto text-xs text-muted-foreground">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{campaigns.length} кампани{campaigns.length === 1 ? "я" : campaigns.length < 5 ? "и" : "й"}</span>
            </div>
          )}
        </div>
      </div>

      {/* Campaign history (if any) */}
      {campaigns.length > 0 && (
        <div className="px-4 md:px-6 pt-2 shrink-0">
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {campaigns.slice(0, 5).map(c => (
              <div key={c.id} className={cn(
                "shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs",
                c.status === "sent" ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-400" :
                  "border-amber-500/30 bg-amber-500/5 text-amber-400"
              )}>
                {c.status === "sent" ? <CheckCircle2 className="w-3 h-3 shrink-0" /> : <Clock className="w-3 h-3 shrink-0" />}
                <span className="font-medium truncate max-w-[120px]">{c.name}</span>
                <span className="text-muted-foreground shrink-0">{c.recipientCount} чел.</span>
              </div>
            ))}
          </div>
        </div>
      )}

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

      {/* Add Client Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Новый клиент</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Имя</Label>
              <Input
                className="h-8 text-sm"
                placeholder="Иван Иванов"
                value={clientForm.name}
                onChange={(e) => setClientForm((f) => ({ ...f, name: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && handleAddClient()}
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Телефон</Label>
              <Input
                className="h-8 text-sm"
                placeholder="+7 900 000-00-00"
                value={clientForm.phone}
                onChange={(e) => setClientForm((f) => ({ ...f, phone: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && handleAddClient()}
              />
            </div>
            <Button onClick={handleAddClient}>Добавить клиента</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mailing Dialog */}
      <Dialog open={mailingOpen} onOpenChange={setMailingOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm">
              <Send className="w-4 h-4 text-primary" /> Создать рассылку
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {/* Name */}
            <div className="space-y-1.5">
              <Label className="text-xs">Название кампании *</Label>
              <Input
                className="h-8 text-sm"
                placeholder="Акция «Возвращайся!»"
                value={mailingForm.name}
                onChange={e => setMailingForm(f => ({ ...f, name: e.target.value }))}
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Channel */}
              <div className="space-y-1.5">
                <Label className="text-xs">Канал</Label>
                <Select value={mailingForm.channel} onValueChange={v => setMailingForm(f => ({ ...f, channel: v }))}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="telegram">Telegram</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Segment */}
              <div className="space-y-1.5">
                <Label className="text-xs">Сегмент получателей</Label>
                <Select value={mailingForm.segment} onValueChange={handleSegmentChange}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все клиенты</SelectItem>
                    <SelectItem value="vip">VIP (10+ визитов)</SelectItem>
                    <SelectItem value="inactive">Неактивные 30+ дн.</SelectItem>
                    <SelectItem value="new">Новые (1 визит)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Recipients count badge */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/8 border border-primary/20">
              <Users className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="text-xs text-muted-foreground">Получателей:</span>
              <span className="text-sm font-bold text-primary">{recipientCount}</span>
              <span className="text-xs text-muted-foreground">— {SEGMENT_LABELS[mailingForm.segment]}</span>
            </div>

            {/* Message */}
            <div className="space-y-1.5">
              <Label className="text-xs">Текст сообщения</Label>
              <textarea
                className="w-full text-sm border border-border/50 rounded-lg p-2.5 bg-card/30 resize-none focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground/50"
                rows={5}
                value={mailingForm.message}
                onChange={e => setMailingForm(f => ({ ...f, message: e.target.value }))}
                placeholder="Текст вашего сообщения..."
              />
              <p className="text-[10px] text-muted-foreground">Используйте {"{имя}"} для персонализации</p>
            </div>

            {/* Schedule toggle */}
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border/40 bg-card/20">
              <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium">Запланировать отправку</p>
                <p className="text-[10px] text-muted-foreground">Отправить в указанное время</p>
              </div>
              <Switch checked={mailingForm.scheduled} onCheckedChange={v => setMailingForm(f => ({ ...f, scheduled: v }))} />
            </div>

            {mailingForm.scheduled && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Дата</Label>
                  <Input type="date" className="h-8 text-xs" value={mailingForm.scheduleDate} onChange={e => setMailingForm(f => ({ ...f, scheduleDate: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Время</Label>
                  <Input type="time" className="h-8 text-xs" value={mailingForm.scheduleTime} onChange={e => setMailingForm(f => ({ ...f, scheduleTime: e.target.value }))} />
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1 h-9 text-sm" onClick={() => setMailingOpen(false)}>Отмена</Button>
              <Button className="flex-1 h-9 text-sm gap-1.5" onClick={handleSendMailing} disabled={!mailingForm.name.trim() || recipientCount === 0}>
                <Send className="w-3.5 h-3.5" />
                {mailingForm.scheduled ? "Запланировать" : `Отправить (${recipientCount})`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
