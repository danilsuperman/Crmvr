import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  MessageSquare, Search, Filter, Send, Paperclip, Smile, Phone,
  MoreHorizontal, CheckCheck, Check, Bot, Zap, Star, Tag,
  Calendar, CreditCard, User, ChevronRight, Sparkles, X, Plus,
  Clock, AlertCircle, Image, Mic
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// ─── TYPES ────────────────────────────────────────────────────────────────────

type Channel = "telegram" | "whatsapp" | "instagram" | "viber" | "webchat";
type ConvStatus = "new" | "active" | "closed";
type Tag = "lead" | "client" | "booking" | "conflict" | "paid" | "unpaid";

interface Message {
  id: string;
  text: string;
  from: "client" | "operator" | "ai";
  time: string;
  channel: Channel;
  read: boolean;
}

interface Conversation {
  id: string;
  clientName: string;
  clientPhone: string;
  channel: Channel;
  status: ConvStatus;
  tags: Tag[];
  lastMessage: string;
  lastTime: string;
  unread: number;
  assignedTo: string;
  messages: Message[];
  ltv: number;
  visits: number;
  aiSummary: string;
  aiStage: string;
  aiProb: number;
}

// ─── MOCK DATA ─────────────────────────────────────────────────────────────────

const CONVS: Conversation[] = [
  {
    id: "c1", clientName: "Иван Петров", clientPhone: "+7 916 123-45-67",
    channel: "telegram", status: "new", tags: ["lead"],
    lastMessage: "Сколько стоит VR на 4 человека?", lastTime: "14:32", unread: 2,
    assignedTo: "", ltv: 0, visits: 0,
    aiSummary: "Новый лид. Интересуется ценами на групповую игру. Высокая вероятность брони.",
    aiStage: "Первичный контакт", aiProb: 68,
    messages: [
      { id: "m1", text: "Привет! Хочу узнать про VR", from: "client", time: "14:28", channel: "telegram", read: true },
      { id: "m2", text: "Добрый день! Рады помочь 🎮 Что вас интересует?", from: "operator", time: "14:29", channel: "telegram", read: true },
      { id: "m3", text: "Сколько стоит VR на 4 человека?", from: "client", time: "14:32", channel: "telegram", read: false },
    ],
  },
  {
    id: "c2", clientName: "Мария Сидорова", clientPhone: "+7 903 987-65-43",
    channel: "whatsapp", status: "active", tags: ["client", "booking"],
    lastMessage: "Отлично, подтвердите время 18:00", lastTime: "13:15", unread: 0,
    assignedTo: "Анна П.", ltv: 45000, visits: 9,
    aiSummary: "Постоянный клиент. Бронирует для семьи с детьми. Средний чек 5000₽.",
    aiStage: "Бронирование", aiProb: 92,
    messages: [
      { id: "m1", text: "Мария, добрый день! Есть места на сегодня в 18:00", from: "operator", time: "12:40", channel: "whatsapp", read: true },
      { id: "m2", text: "Дети 7 и 10 лет, подойдёт?", from: "client", time: "12:55", channel: "whatsapp", read: true },
      { id: "m3", text: "Конечно! Arena A идеально для детей 7+ 🎮", from: "operator", time: "13:00", channel: "whatsapp", read: true },
      { id: "m4", text: "Отлично, подтвердите время 18:00", from: "client", time: "13:15", channel: "whatsapp", read: true },
    ],
  },
  {
    id: "c3", clientName: "Алексей Новиков", clientPhone: "+7 925 555-11-22",
    channel: "instagram", status: "active", tags: ["lead", "paid"],
    lastMessage: "Ссылку на оплату получил, оплачу сейчас", lastTime: "12:50", unread: 1,
    assignedTo: "Дмитрий К.", ltv: 12000, visits: 3,
    aiSummary: "Молодой клиент, предпочитает Horror Night. Активен в выходные.",
    aiStage: "Оплата", aiProb: 88,
    messages: [
      { id: "m1", text: "Хочу забронировать Horror Night на субботу", from: "client", time: "12:20", channel: "instagram", read: true },
      { id: "m2", text: "Пришлите ссылку на оплату предоплаты", from: "client", time: "12:35", channel: "instagram", read: true },
      { id: "m3", text: "Держите! pay.vrpark.co/horror-sat", from: "operator", time: "12:44", channel: "instagram", read: true },
      { id: "m4", text: "Ссылку на оплату получил, оплачу сейчас", from: "client", time: "12:50", channel: "instagram", read: false },
    ],
  },
  {
    id: "c4", clientName: "Светлана Козлова", clientPhone: "+7 912 777-33-99",
    channel: "telegram", status: "active", tags: ["conflict"],
    lastMessage: "Это неприемлемо! Я ждала 40 минут!", lastTime: "11:05", unread: 3,
    assignedTo: "Анна П.", ltv: 28000, visits: 6,
    aiSummary: "Недовольный клиент. Жалоба на долгое ожидание. Требует внимания руководства.",
    aiStage: "Конфликт", aiProb: 30,
    messages: [
      { id: "m1", text: "Это неприемлемо! Я ждала 40 минут!", from: "client", time: "11:05", channel: "telegram", read: false },
      { id: "m2", text: "Куда смотрит ваш персонал?!", from: "client", time: "11:06", channel: "telegram", read: false },
      { id: "m3", text: "Хочу возврат денег", from: "client", time: "11:08", channel: "telegram", read: false },
    ],
  },
  {
    id: "c5", clientName: "Андрей Мельников", clientPhone: "+7 999 444-88-00",
    channel: "webchat", status: "closed", tags: ["client", "paid"],
    lastMessage: "Спасибо! Отличный вечер провели", lastTime: "Вчера", unread: 0,
    assignedTo: "Дмитрий К.", ltv: 8500, visits: 2,
    aiSummary: "Доволен визитом. Высокая вероятность повторного визита.",
    aiStage: "Завершён", aiProb: 75,
    messages: [
      { id: "m1", text: "Спасибо! Отличный вечер провели", from: "client", time: "21:30", channel: "webchat", read: true },
      { id: "m2", text: "Рады видеть вас снова! 🎮", from: "operator", time: "21:32", channel: "webchat", read: true },
    ],
  },
];

const AI_REPLIES: Record<string, string[]> = {
  "Сколько стоит VR на 4 человека?": [
    "Стандарт 30 мин — 4 800₽ (4×1200₽)",
    "VIP 90 мин — 14 000₽ (4×3500₽)",
    "Предложить бронь на сегодня",
  ],
  "default": ["Уточнить детали брони", "Отправить прайс-лист", "Предложить свободное время"],
};

const TEMPLATES = [
  { label: "Приветствие", text: "Здравствуйте! Добро пожаловать в VR Park 🎮 Чем могу помочь?" },
  { label: "Прайс", text: "Наши тарифы: 30 мин — 1200₽/чел, 60 мин — 2000₽/чел, 90 мин VIP — 3500₽/чел." },
  { label: "Бронирование", text: "Для бронирования укажите дату, время и количество гостей." },
  { label: "Ссылка оплаты", text: "Ссылка для оплаты предоплаты (30%): pay.vrpark.co/book" },
];

// ─── CHANNEL HELPERS ───────────────────────────────────────────────────────────

const CHANNEL_META: Record<Channel, { label: string; color: string; bg: string; short: string }> = {
  telegram:  { label: "Telegram",   color: "text-sky-400",    bg: "bg-sky-500/15 border-sky-500/30",    short: "TG" },
  whatsapp:  { label: "WhatsApp",   color: "text-emerald-400",bg: "bg-emerald-500/15 border-emerald-500/30", short: "WA" },
  instagram: { label: "Instagram",  color: "text-pink-400",   bg: "bg-pink-500/15 border-pink-500/30",  short: "IG" },
  viber:     { label: "Viber",      color: "text-violet-400", bg: "bg-violet-500/15 border-violet-500/30", short: "VI" },
  webchat:   { label: "Web Chat",   color: "text-blue-400",   bg: "bg-blue-500/15 border-blue-500/30",  short: "WC" },
};

const TAG_META: Record<Tag, { label: string; color: string }> = {
  lead:    { label: "Лид",       color: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  client:  { label: "Клиент",   color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  booking: { label: "Бронь",    color: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  conflict:{ label: "Конфликт", color: "bg-red-500/15 text-red-400 border-red-500/30" },
  paid:    { label: "Оплачено", color: "bg-green-500/15 text-green-400 border-green-500/30" },
  unpaid:  { label: "Не оплач.",color: "bg-rose-500/15 text-rose-400 border-rose-500/30" },
};

function ChannelBadge({ channel, size = "sm" }: { channel: Channel; size?: "xs" | "sm" }) {
  const m = CHANNEL_META[channel];
  return (
    <span className={cn("font-bold border rounded-md", m.color, m.bg,
      size === "xs" ? "text-[9px] px-1 py-0" : "text-[10px] px-1.5 py-0.5"
    )}>
      {m.short}
    </span>
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────

export default function Inbox() {
  const [convs] = useState<Conversation[]>(CONVS);
  const [selectedId, setSelectedId] = useState<string>(CONVS[0].id);
  const [input, setInput] = useState("");
  const [showAI, setShowAI] = useState(true);
  const [showTemplates, setShowTemplates] = useState(false);
  const [filterCh, setFilterCh] = useState<Channel | "all">("all");
  const [filterStatus, setFilterStatus] = useState<ConvStatus | "all">("all");
  const [search, setSearch] = useState("");

  const conv = convs.find(c => c.id === selectedId)!;
  const chMeta = CHANNEL_META[conv.channel];

  const filtered = convs.filter(c => {
    if (filterCh !== "all" && c.channel !== filterCh) return false;
    if (filterStatus !== "all" && c.status !== filterStatus) return false;
    if (search && !c.clientName.toLowerCase().includes(search.toLowerCase()) && !c.lastMessage.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const lastMsg = conv.messages[conv.messages.length - 1];
  const aiReplies = AI_REPLIES[lastMsg?.text] ?? AI_REPLIES["default"];

  const totalUnread = convs.reduce((s, c) => s + c.unread, 0);

  return (
    <div className="flex h-full overflow-hidden">

      {/* ── LEFT: CONVERSATION LIST ────────────────────────────────── */}
      <div className="w-72 shrink-0 border-r border-border/50 flex flex-col bg-card/20">
        {/* Header */}
        <div className="p-3 border-b border-border/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold">Сообщения</h2>
              {totalUnread > 0 && (
                <span className="min-w-[18px] h-[18px] rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center px-1">
                  {totalUnread}
                </span>
              )}
            </div>
            <button className="w-7 h-7 rounded-lg hover:bg-muted/30 flex items-center justify-center">
              <Plus className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Поиск..."
              className="w-full h-7 pl-8 pr-3 text-xs rounded-lg bg-muted/20 border border-border/40 focus:outline-none focus:border-primary/50 placeholder:text-muted-foreground/60"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="px-2 py-2 border-b border-border/20 flex gap-1 flex-wrap">
          {(["all", "telegram", "whatsapp", "instagram"] as const).map(ch => (
            <button key={ch} onClick={() => setFilterCh(ch as any)}
              className={cn("text-[9px] font-semibold px-1.5 py-0.5 rounded border transition-all",
                filterCh === ch ? "bg-primary/20 text-primary border-primary/40" : "text-muted-foreground border-border/30 hover:border-border/60"
              )}>
              {ch === "all" ? "Все" : CHANNEL_META[ch as Channel].short}
            </button>
          ))}
          <div className="w-px bg-border/30 mx-0.5" />
          {(["all", "new", "active", "closed"] as const).map(s => (
            <button key={s} onClick={() => setFilterStatus(s as any)}
              className={cn("text-[9px] font-semibold px-1.5 py-0.5 rounded border transition-all",
                filterStatus === s ? "bg-primary/20 text-primary border-primary/40" : "text-muted-foreground border-border/30 hover:border-border/60"
              )}>
              {s === "all" ? "Все" : s === "new" ? "Новые" : s === "active" ? "Актив." : "Закр."}
            </button>
          ))}
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-auto">
          {filtered.map(c => (
            <button key={c.id} onClick={() => setSelectedId(c.id)}
              className={cn("w-full text-left px-3 py-2.5 border-b border-border/20 hover:bg-muted/10 transition-colors relative",
                selectedId === c.id ? "bg-primary/8 border-l-2 border-l-primary" : ""
              )}>
              <div className="flex items-start gap-2">
                {/* Avatar */}
                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold",
                  c.status === "new" ? "bg-primary/20 text-primary" :
                  c.status === "closed" ? "bg-muted/30 text-muted-foreground" : "bg-violet-500/20 text-violet-400"
                )}>
                  {c.clientName.split(" ").map(w => w[0]).join("").slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="text-xs font-semibold truncate">{c.clientName}</span>
                    <span className="text-[9px] text-muted-foreground shrink-0">{c.lastTime}</span>
                  </div>
                  <div className="flex items-center gap-1 mb-1">
                    <ChannelBadge channel={c.channel} size="xs" />
                    {c.tags.slice(0, 2).map(t => (
                      <span key={t} className={cn("text-[9px] px-1 rounded border font-medium", TAG_META[t].color)}>{TAG_META[t].label}</span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] text-muted-foreground truncate flex-1">{c.lastMessage}</p>
                    {c.unread > 0 && (
                      <span className="ml-1 min-w-[16px] h-4 rounded-full bg-primary text-[9px] font-bold text-primary-foreground flex items-center justify-center px-1 shrink-0">
                        {c.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── CENTER: CHAT ───────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat header */}
        <div className="h-14 border-b border-border/50 flex items-center px-4 gap-3 bg-card/30 shrink-0">
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
              {conv.clientName.split(" ").map(w => w[0]).join("").slice(0, 2)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold truncate">{conv.clientName}</p>
                <ChannelBadge channel={conv.channel} />
                {conv.tags.map(t => (
                  <span key={t} className={cn("text-[10px] px-1.5 py-0.5 rounded-full border font-medium hidden sm:inline", TAG_META[t].color)}>{TAG_META[t].label}</span>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground">{conv.clientPhone} · {conv.assignedTo || "Не назначен"}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
              <Calendar className="w-3.5 h-3.5" /> Бронь
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
              <CreditCard className="w-3.5 h-3.5" /> Оплата
            </Button>
            <button className="w-7 h-7 rounded-lg hover:bg-muted/20 flex items-center justify-center">
              <Phone className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
            <button className="w-7 h-7 rounded-lg hover:bg-muted/20 flex items-center justify-center">
              <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-auto p-4 space-y-3">
          {conv.messages.map(msg => (
            <div key={msg.id} className={cn("flex gap-2", msg.from !== "client" ? "flex-row-reverse" : "")}>
              {msg.from === "client" && (
                <div className="w-7 h-7 rounded-full bg-muted/30 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  {conv.clientName[0]}
                </div>
              )}
              {msg.from === "ai" && (
                <div className="w-7 h-7 rounded-full bg-violet-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5 text-violet-400" />
                </div>
              )}
              <div className={cn("max-w-[70%] space-y-0.5")}>
                <div className={cn("px-3 py-2 rounded-2xl text-sm",
                  msg.from === "client"
                    ? "bg-card/60 border border-border/40 rounded-tl-sm"
                    : msg.from === "ai"
                    ? "bg-violet-500/10 border border-violet-500/20 rounded-tr-sm"
                    : "bg-primary/15 border border-primary/20 rounded-tr-sm"
                )}>
                  {msg.text}
                </div>
                <div className={cn("flex items-center gap-1 text-[10px] text-muted-foreground", msg.from !== "client" ? "flex-row-reverse" : "")}>
                  <span>{msg.time}</span>
                  <ChannelBadge channel={msg.channel} size="xs" />
                  {msg.from === "operator" && (
                    msg.read ? <CheckCheck className="w-3 h-3 text-primary" /> : <Check className="w-3 h-3" />
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* AI suggestion bubble */}
          {showAI && lastMsg?.from === "client" && (
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-violet-500/20 flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              </div>
              <div className="bg-violet-500/8 border border-violet-500/20 rounded-2xl rounded-tl-sm p-3 max-w-[80%]">
                <p className="text-[10px] text-violet-400 font-semibold mb-1.5 flex items-center gap-1"><Bot className="w-3 h-3" /> AI-подсказки</p>
                <div className="space-y-1">
                  {aiReplies.map((r, i) => (
                    <button key={i} onClick={() => setInput(r)}
                      className="block w-full text-left text-xs px-2.5 py-1.5 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 transition-colors">
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Templates panel */}
        {showTemplates && (
          <div className="border-t border-border/30 bg-card/20 p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold">Шаблоны</p>
              <button onClick={() => setShowTemplates(false)}><X className="w-3.5 h-3.5 text-muted-foreground" /></button>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {TEMPLATES.map(t => (
                <button key={t.label} onClick={() => { setInput(t.text); setShowTemplates(false); }}
                  className="text-left px-2.5 py-2 rounded-lg border border-border/40 bg-card/30 hover:border-primary/40 transition-all">
                  <p className="text-[10px] font-semibold text-primary mb-0.5">{t.label}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight line-clamp-2">{t.text}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-border/40 p-3 bg-card/20 shrink-0">
          <div className="flex items-end gap-2">
            <div className="flex-1 bg-card/40 border border-border/50 rounded-xl px-3 py-2">
              <textarea
                value={input} onChange={e => setInput(e.target.value)}
                placeholder="Напишите сообщение..."
                rows={1}
                className="w-full bg-transparent text-sm resize-none focus:outline-none placeholder:text-muted-foreground/50 max-h-24"
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); setInput(""); } }}
              />
              <div className="flex items-center gap-2 mt-1.5">
                <button className="text-muted-foreground hover:text-foreground" onClick={() => setShowTemplates(!showTemplates)}>
                  <Tag className="w-3.5 h-3.5" />
                </button>
                <button className="text-muted-foreground hover:text-foreground">
                  <Paperclip className="w-3.5 h-3.5" />
                </button>
                <button className="text-muted-foreground hover:text-foreground">
                  <Image className="w-3.5 h-3.5" />
                </button>
                <button className="text-muted-foreground hover:text-foreground">
                  <Mic className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setShowAI(!showAI)} className={cn("ml-auto text-[10px] font-semibold flex items-center gap-1 px-2 py-0.5 rounded-full border transition-all",
                  showAI ? "text-violet-400 bg-violet-500/10 border-violet-500/30" : "text-muted-foreground border-border/30"
                )}>
                  <Bot className="w-3 h-3" /> AI
                </button>
              </div>
            </div>
            <Button size="icon" className="h-10 w-10 shrink-0 rounded-xl" disabled={!input.trim()}
              onClick={() => setInput("")}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-[10px] text-muted-foreground">Отвечаем через:</span>
            <ChannelBadge channel={conv.channel} size="xs" />
            <span className={cn("text-[10px] font-medium", chMeta.color)}>{chMeta.label}</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT: CLIENT PANEL ────────────────────────────────────── */}
      <div className="w-64 shrink-0 border-l border-border/50 flex flex-col bg-card/10 overflow-auto">
        {/* Client info */}
        <div className="p-3 border-b border-border/30">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/30 to-violet-500/30 flex items-center justify-center text-sm font-black">
              {conv.clientName.split(" ").map(w => w[0]).join("").slice(0, 2)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold truncate">{conv.clientName}</p>
              <p className="text-[10px] text-muted-foreground">{conv.clientPhone}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-[10px]">
            <div className="rounded-lg bg-card/40 border border-border/30 p-2 text-center">
              <p className="text-base font-black text-primary">{conv.visits}</p>
              <p className="text-muted-foreground">визитов</p>
            </div>
            <div className="rounded-lg bg-card/40 border border-border/30 p-2 text-center">
              <p className="text-base font-black">{conv.ltv > 0 ? `${(conv.ltv / 1000).toFixed(0)}к` : "0"}</p>
              <p className="text-muted-foreground">LTV ₽</p>
            </div>
          </div>
          <div className="flex gap-1 mt-2 flex-wrap">
            {conv.tags.map(t => (
              <span key={t} className={cn("text-[10px] px-1.5 py-0.5 rounded-full border font-medium", TAG_META[t].color)}>{TAG_META[t].label}</span>
            ))}
          </div>
        </div>

        {/* AI Summary */}
        <div className="p-3 border-b border-border/30">
          <p className="text-[10px] font-semibold text-violet-400 flex items-center gap-1 mb-1.5">
            <Sparkles className="w-3 h-3" /> AI-анализ
          </p>
          <p className="text-[10px] text-muted-foreground leading-relaxed mb-2">{conv.aiSummary}</p>
          <div className="space-y-1">
            <div className="flex justify-between text-[10px]">
              <span className="text-muted-foreground">Стадия</span>
              <span className="font-semibold">{conv.aiStage}</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-muted-foreground">Вероятность покупки</span>
              <span className={cn("font-bold", conv.aiProb >= 70 ? "text-emerald-400" : conv.aiProb >= 40 ? "text-amber-400" : "text-red-400")}>
                {conv.aiProb}%
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-muted/20 overflow-hidden mt-1">
              <div className={cn("h-full rounded-full transition-all", conv.aiProb >= 70 ? "bg-emerald-400" : conv.aiProb >= 40 ? "bg-amber-400" : "bg-red-400")}
                style={{ width: `${conv.aiProb}%` }} />
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="p-3 border-b border-border/30">
          <p className="text-[10px] font-semibold text-muted-foreground mb-2">Быстрые действия</p>
          <div className="space-y-1.5">
            {[
              { icon: Calendar, label: "Создать бронь", color: "text-blue-400" },
              { icon: CreditCard, label: "Открыть оплату", color: "text-emerald-400" },
              { icon: User, label: "Назначить менеджера", color: "text-violet-400" },
              { icon: Tag, label: "Добавить тег", color: "text-amber-400" },
            ].map(a => (
              <button key={a.label} className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg border border-border/40 hover:border-primary/40 bg-card/20 hover:bg-card/40 transition-all">
                <a.icon className={cn("w-3.5 h-3.5 shrink-0", a.color)} />
                <span className="text-[11px] font-medium">{a.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Channel connections */}
        <div className="p-3">
          <p className="text-[10px] font-semibold text-muted-foreground mb-2">Каналы клиента</p>
          <div className="space-y-1">
            {(["telegram", "whatsapp", "instagram"] as Channel[]).map(ch => {
              const active = ch === conv.channel;
              const m = CHANNEL_META[ch];
              return (
                <div key={ch} className={cn("flex items-center justify-between px-2 py-1.5 rounded-lg border",
                  active ? `${m.bg} border-current` : "border-border/30 bg-transparent"
                )}>
                  <span className={cn("text-[11px] font-medium", active ? m.color : "text-muted-foreground")}>{m.label}</span>
                  <span className={cn("text-[9px] px-1 py-0.5 rounded font-bold border", active ? `${m.bg} ${m.color}` : "text-muted-foreground/40 border-border/20")}>
                    {active ? "активен" : "—"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
