import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  X, ArrowLeft, ArrowRight, Check, Wand2, Hand, Package,
  Users, Clock, ChevronRight, Gamepad2, Star, Calendar,
  CheckCircle2, Phone, Mail, MessageSquare, Sparkles,
  MapPin, Zap, ChevronDown
} from "lucide-react";

// ─── DATA ─────────────────────────────────────────────────────────────────────

const ZONES = [
  { id: "a", name: "Arena A", desc: "Многопользовательская VR-арена для до 4 игроков", capacity: 4, age: "10+", color: "#6366f1", games: ["Beat Saber", "Superhot VR", "Pistol Whip"] },
  { id: "b", name: "Arena B", desc: "Командная зона с командными играми", capacity: 4, age: "10+", color: "#8b5cf6", games: ["Pistol Whip", "Walkabout Mini Golf"] },
  { id: "s", name: "VR Solo", desc: "Одиночные приключения в лучших VR-играх", capacity: 1, age: "7+", color: "#ec4899", games: ["Half-Life: Alyx", "Asgard's Wrath"] },
  { id: "r", name: "Racing Zone", desc: "Гоночные VR-симуляторы с полным погружением", capacity: 2, age: "14+", color: "#f59e0b", games: ["GT7 VR", "Gran Turismo"] },
];

const GAMES: Record<string, { name: string; genre: string; age: string; players: string; duration: string; desc: string }[]> = {
  a: [
    { name: "Beat Saber", genre: "Ритм", age: "7+", players: "1-4", duration: "30 мин", desc: "Рубите блоки под музыку — идеально для группы!" },
    { name: "Superhot VR", genre: "Экшен", age: "12+", players: "1", duration: "30 мин", desc: "Время движется только когда двигаетесь вы." },
    { name: "Pistol Whip", genre: "Шутер", age: "12+", players: "1-4", duration: "30 мин", desc: "Музыкальный экшен-шутер с ритмом." },
  ],
  b: [
    { name: "Pistol Whip", genre: "Шутер", age: "12+", players: "1-4", duration: "30 мин", desc: "Музыкальный экшен-шутер." },
    { name: "Walkabout Mini Golf", genre: "Спорт", age: "7+", players: "1-4", duration: "45 мин", desc: "Расслабляющий мини-гольф в VR." },
  ],
  s: [
    { name: "Half-Life: Alyx", genre: "Шутер", age: "16+", players: "1", duration: "60+ мин", desc: "Лучший VR-опыт от Valve." },
    { name: "Asgard's Wrath", genre: "RPG", age: "14+", players: "1", duration: "45 мин", desc: "Эпические приключения в мире Norse." },
  ],
  r: [
    { name: "GT7 VR", genre: "Гонки", age: "14+", players: "1", duration: "30 мин", desc: "Лучший гоночный симулятор в VR." },
    { name: "Gran Turismo", genre: "Гонки", age: "12+", players: "1", duration: "30 мин", desc: "Классический Gran Turismo в VR-режиме." },
  ],
};

const PACKAGES = [
  { id: "pk1", name: "День рождения VIP", icon: "🎉", type: "Birthday", price: 15000, guests: "до 8 чел", duration: "3 ч", zones: ["Arena A", "VR Solo"], games: 3, desc: "Полная программа праздника в VR — незабываемо!" },
  { id: "pk2", name: "Корпоратив Standard", icon: "💼", type: "Corporate", price: 35000, guests: "до 20 чел", duration: "4 ч", zones: ["Arena A", "Arena B", "Racing"], games: 5, desc: "Тимбилдинг и командный дух в виртуальной реальности." },
  { id: "pk3", name: "Horror Night", icon: "👻", type: "Special", price: 8000, guests: "до 4 чел", duration: "2 ч", zones: ["Arena A", "VR Solo"], games: 2, desc: "Страшные игры, атмосфера ужаса, 18+." },
  { id: "pk4", name: "Full Park", icon: "🏟️", type: "Premium", price: 80000, guests: "любое", duration: "8 ч", zones: ["Все зоны"], games: 10, desc: "Весь VR-парк в полное распоряжение." },
];

const AUTO_QUESTIONS = [
  { q: "Сколько вас будет?", options: ["1 человек", "2-3 человека", "4-8 человек", "9+ человек"] },
  { q: "Возраст участников?", options: ["Дети 7-12 лет", "Подростки 13-17", "Взрослые 18+", "Смешанная группа"] },
  { q: "Что предпочитаете?", options: ["Что-нибудь весёлое", "Экшен и стрельба", "Гонки и скорость", "Страшное и острое"] },
  { q: "Бюджет на группу?", options: ["до 3 000 ₽", "3 000 — 10 000 ₽", "10 000 — 30 000 ₽", "без ограничений"] },
];

const TIME_SLOTS = ["11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];

const AVAILABILITY: Record<string, string[]> = {
  "11:00": ["13:00", "13:30", "14:00", "16:00", "17:00"],
  "12:00": ["14:00", "15:00", "16:30", "18:00", "19:00"],
  "13:00": ["11:00", "15:00", "16:00", "17:00", "19:00"],
};

function getFreeSlots(dateStr: string) {
  const base = AVAILABILITY[dateStr] || TIME_SLOTS.slice(0, 6);
  return base;
}

// ─── SUB-SCREENS ──────────────────────────────────────────────────────────────

function ModeScreen({ onSelect }: { onSelect: (mode: "auto" | "manual" | "package") => void }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
        <div className="text-center">
          <div className="text-4xl mb-3">🎮</div>
          <h2 className="text-xl font-bold">Забронировать VR</h2>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-xs">Выберите удобный способ бронирования</p>
        </div>
        <div className="grid gap-3 w-full max-w-sm">
          <button onClick={() => onSelect("auto")} className="group p-4 rounded-2xl border border-border/50 bg-card/40 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all text-left">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center shrink-0">
                <Wand2 className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-semibold">Подобрать автоматически</p>
                <p className="text-xs text-muted-foreground mt-0.5">Ответьте на 4 вопроса — мы найдём лучший вариант</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-muted-foreground ml-auto mt-1 shrink-0 transition-colors" />
            </div>
          </button>
          <button onClick={() => onSelect("manual")} className="group p-4 rounded-2xl border border-border/50 bg-card/40 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all text-left">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center shrink-0">
                <Hand className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-semibold">Собрать вручную</p>
                <p className="text-xs text-muted-foreground mt-0.5">Выберите зону, игры и время самостоятельно</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-muted-foreground ml-auto mt-1 shrink-0 transition-colors" />
            </div>
          </button>
          <button onClick={() => onSelect("package")} className="group p-4 rounded-2xl border border-border/50 bg-card/40 hover:border-green-500/50 hover:bg-green-500/5 transition-all text-left">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/15 flex items-center justify-center shrink-0">
                <Package className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm font-semibold">Выбрать пакет</p>
                <p className="text-xs text-muted-foreground mt-0.5">День рождения, корпоратив, Horror Night — готово!</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-muted-foreground ml-auto mt-1 shrink-0 transition-colors" />
            </div>
          </button>
        </div>
      </div>
      <div className="p-4 text-center">
        <p className="text-[10px] text-muted-foreground/50">VR Park · Онлайн-бронирование · vrpark.co</p>
      </div>
    </div>
  );
}

function AutoFlow({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);

  if (showResult) {
    return (
      <div className="flex flex-col h-full p-6">
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <div className="text-center">
            <p className="text-xs text-primary font-medium mb-1">🎯 Рекомендуем:</p>
            <h3 className="text-lg font-bold">Arena A + VR Solo</h3>
            <p className="text-xs text-muted-foreground mt-1">Beat Saber, Pistol Whip</p>
          </div>
          <div className="w-full max-w-xs space-y-2">
            <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
              <p className="text-xs text-muted-foreground">На основе ваших ответов</p>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {answers.map((a, i) => <Badge key={i} variant="outline" className="text-[10px]">{a}</Badge>)}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-card/40 border border-border/50"><p className="text-muted-foreground">Длительность</p><p className="font-semibold mt-0.5">60 мин</p></div>
              <div className="p-2.5 rounded-lg bg-card/40 border border-border/50"><p className="text-muted-foreground">Цена</p><p className="font-semibold mt-0.5">от 3 500 ₽</p></div>
            </div>
          </div>
        </div>
        <Button className="w-full" onClick={onDone}>Забронировать этот вариант</Button>
      </div>
    );
  }

  const q = AUTO_QUESTIONS[step];
  return (
    <div className="flex flex-col h-full p-5">
      {/* Progress */}
      <div className="flex gap-1.5 mb-6">
        {AUTO_QUESTIONS.map((_, i) => (
          <div key={i} className={cn("h-1 flex-1 rounded-full transition-all", i <= step ? "bg-primary" : "bg-muted/30")} />
        ))}
      </div>
      <div className="flex-1">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Вопрос {step + 1} из {AUTO_QUESTIONS.length}</p>
        <h3 className="text-base font-semibold mb-4">{q.q}</h3>
        <div className="grid gap-2">
          {q.options.map((opt) => (
            <button key={opt} onClick={() => {
              const newAnswers = [...answers, opt];
              setAnswers(newAnswers);
              if (step < AUTO_QUESTIONS.length - 1) setStep(s => s + 1);
              else setShowResult(true);
            }} className="p-3 text-left rounded-xl border border-border/50 bg-card/30 hover:border-primary/50 hover:bg-primary/5 transition-all text-sm">
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ManualFlow({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState<"zone" | "game" | "datetime" | "contact" | "done">("zone");
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [guests, setGuests] = useState("2");
  const [contact, setContact] = useState({ name: "", phone: "", email: "", comment: "" });
  const [submitting, setSubmitting] = useState(false);

  const zone = ZONES.find(z => z.id === selectedZone);
  const games = selectedZone ? GAMES[selectedZone] || [] : [];
  const slots = getFreeSlots(selectedTime || "12:00");

  const handleBook = () => {
    setSubmitting(true);
    setTimeout(() => { setSubmitting(false); setStep("done"); }, 1200);
  };

  if (step === "done") {
    return (
      <div className="flex flex-col h-full items-center justify-center p-6 gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-green-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold">Бронь подтверждена! 🎮</h3>
          <p className="text-sm text-muted-foreground mt-1">Ждём вас в VR Park, {contact.name || "гость"}</p>
        </div>
        <div className="w-full max-w-xs space-y-2 text-xs">
          {[
            { label: "Зона", val: zone?.name },
            { label: "Игра", val: selectedGame },
            { label: "Дата", val: selectedDate || "Сегодня" },
            { label: "Время", val: selectedTime },
            { label: "Гостей", val: guests },
          ].map(item => (
            <div key={item.label} className="flex justify-between p-2 rounded-lg bg-card/40 border border-border/50">
              <span className="text-muted-foreground">{item.label}</span>
              <span className="font-medium">{item.val || "—"}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">SMS с подтверждением отправлено на {contact.phone || "ваш номер"}</p>
      </div>
    );
  }

  if (step === "zone") return (
    <div className="flex flex-col h-full p-5 overflow-auto">
      <h3 className="text-base font-semibold mb-1">Выберите зону</h3>
      <p className="text-xs text-muted-foreground mb-4">Какой VR-опыт вас интересует?</p>
      <div className="space-y-2 flex-1">
        {ZONES.map(z => (
          <button key={z.id} onClick={() => { setSelectedZone(z.id); setStep("game"); }} className={cn("w-full text-left p-4 rounded-2xl border transition-all", selectedZone === z.id ? "border-primary bg-primary/8" : "border-border/50 bg-card/30 hover:border-primary/40")}>
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 rounded-full mt-1 shrink-0" style={{ backgroundColor: z.color }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{z.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{z.desc}</p>
                <div className="flex gap-2 mt-1.5 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-0.5"><Users className="w-3 h-3" />до {z.capacity} чел.</span>
                  <span className="flex items-center gap-0.5"><Zap className="w-3 h-3" />{z.age}</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground/30 mt-1 shrink-0" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  if (step === "game") return (
    <div className="flex flex-col h-full p-5 overflow-auto">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: zone?.color }} />
        <span className="text-xs font-medium text-muted-foreground">{zone?.name}</span>
      </div>
      <h3 className="text-base font-semibold mb-1">Выберите игру</h3>
      <p className="text-xs text-muted-foreground mb-4">Что будем играть?</p>
      <div className="space-y-2 flex-1">
        {games.map(g => (
          <button key={g.name} onClick={() => { setSelectedGame(g.name); setStep("datetime"); }} className="w-full text-left p-4 rounded-2xl border border-border/50 bg-card/30 hover:border-primary/40 transition-all">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Gamepad2 className="w-4 h-4 text-primary/60" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{g.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{g.desc}</p>
                <div className="flex gap-2 mt-1 text-[10px] text-muted-foreground">
                  <Badge variant="outline" className="text-[10px]">{g.genre}</Badge>
                  <span className="flex items-center gap-0.5"><Users className="w-3 h-3" />{g.players}</span>
                  <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{g.duration}</span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
      <Button variant="outline" size="sm" className="mt-3 gap-1 text-xs" onClick={() => setStep("zone")}>
        <ArrowLeft className="w-3.5 h-3.5" /> Назад
      </Button>
    </div>
  );

  if (step === "datetime") return (
    <div className="flex flex-col h-full p-5 overflow-auto">
      <h3 className="text-base font-semibold mb-4">Дата и время</h3>
      <div className="space-y-4 flex-1">
        <div className="space-y-2">
          <Label className="text-xs flex items-center gap-1"><Calendar className="w-3 h-3" /> Дата</Label>
          <Input type="date" className="h-9 text-sm" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Количество гостей</Label>
          <div className="flex gap-2">
            {["1", "2", "3", "4"].map(n => (
              <button key={n} onClick={() => setGuests(n)} className={cn("flex-1 h-9 rounded-lg border text-sm font-medium transition-all", guests === n ? "border-primary bg-primary text-primary-foreground" : "border-border/50 bg-card/30 hover:border-primary/40")}>
                {n}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-xs flex items-center gap-1"><Clock className="w-3 h-3" /> Свободное время</Label>
          <div className="grid grid-cols-3 gap-2">
            {TIME_SLOTS.slice(0, 9).map(t => {
              const busy = ["12:30", "14:30", "16:30"].includes(t);
              return (
                <button key={t} disabled={busy} onClick={() => setSelectedTime(t)} className={cn("h-9 rounded-lg border text-xs font-mono font-medium transition-all",
                  busy ? "border-border/20 bg-muted/10 text-muted-foreground/30 line-through cursor-not-allowed" :
                  selectedTime === t ? "border-primary bg-primary text-primary-foreground" :
                  "border-border/50 bg-card/30 hover:border-primary/40"
                )}>
                  {t}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => setStep("game")}><ArrowLeft className="w-3.5 h-3.5" /></Button>
        <Button className="flex-1 text-sm" disabled={!selectedTime} onClick={() => setStep("contact")}>
          Далее <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );

  if (step === "contact") return (
    <div className="flex flex-col h-full p-5 overflow-auto">
      <h3 className="text-base font-semibold mb-1">Контактные данные</h3>
      <p className="text-xs text-muted-foreground mb-4">Заполните, чтобы мы могли подтвердить бронь</p>
      <div className="flex-1 space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs flex items-center gap-1"><Users className="w-3 h-3" />Имя *</Label>
          <Input className="h-9 text-sm" placeholder="Ваше имя" value={contact.name} onChange={e => setContact(c => ({ ...c, name: e.target.value }))} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs flex items-center gap-1"><Phone className="w-3 h-3" />Телефон *</Label>
          <Input className="h-9 text-sm" type="tel" placeholder="+7 (___) ___-__-__" value={contact.phone} onChange={e => setContact(c => ({ ...c, phone: e.target.value }))} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs flex items-center gap-1"><Mail className="w-3 h-3" />Email</Label>
          <Input className="h-9 text-sm" type="email" placeholder="email@example.com" value={contact.email} onChange={e => setContact(c => ({ ...c, email: e.target.value }))} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs flex items-center gap-1"><MessageSquare className="w-3 h-3" />Комментарий</Label>
          <Input className="h-9 text-sm" placeholder="Пожелания, особые условия..." value={contact.comment} onChange={e => setContact(c => ({ ...c, comment: e.target.value }))} />
        </div>
        {/* Order summary */}
        <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 space-y-1.5 text-xs">
          <p className="font-semibold text-sm">Итог бронирования</p>
          {[{ l: "Зона", v: zone?.name }, { l: "Игра", v: selectedGame }, { l: "Время", v: `${selectedDate || "Сегодня"} · ${selectedTime}` }, { l: "Гостей", v: guests }].map(item => (
            <div key={item.l} className="flex justify-between"><span className="text-muted-foreground">{item.l}</span><span className="font-medium">{item.v}</span></div>
          ))}
          <div className="border-t border-primary/20 pt-1.5 flex justify-between font-semibold text-sm text-primary">
            <span>Итого</span><span>от 2 500 ₽</span>
          </div>
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <Button variant="outline" size="sm" className="gap-1" onClick={() => setStep("datetime")}><ArrowLeft className="w-3.5 h-3.5" /></Button>
        <Button className="flex-1" disabled={!contact.name || !contact.phone || submitting} onClick={handleBook}>
          {submitting ? <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2" /> : null}
          {submitting ? "Бронируем..." : "Забронировать"}
        </Button>
      </div>
    </div>
  );

  return null;
}

function PackageFlow({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState<"list" | "detail" | "datetime" | "contact" | "done">("list");
  const [selectedPkg, setSelectedPkg] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [contact, setContact] = useState({ name: "", phone: "", email: "" });
  const [submitting, setSubmitting] = useState(false);

  const pkg = PACKAGES.find(p => p.id === selectedPkg);

  const handleBook = () => {
    setSubmitting(true);
    setTimeout(() => { setSubmitting(false); setStep("done"); }, 1200);
  };

  if (step === "done") return (
    <div className="flex flex-col h-full items-center justify-center p-6 gap-4 text-center">
      <div className="w-16 h-16 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center">
        <CheckCircle2 className="w-8 h-8 text-green-400" />
      </div>
      <div>
        <h3 className="text-lg font-bold">Бронь подтверждена! 🎉</h3>
        <p className="text-sm text-muted-foreground mt-1">Пакет «{pkg?.name}» забронирован, {contact.name || "гость"}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{selectedDate || "Сегодня"} · {selectedTime}</p>
      </div>
      <p className="text-xs text-muted-foreground">SMS с подтверждением отправлено на {contact.phone || "ваш номер"}</p>
    </div>
  );

  if (step === "list") return (
    <div className="flex flex-col h-full p-5 overflow-auto">
      <h3 className="text-base font-semibold mb-1">Выберите пакет</h3>
      <p className="text-xs text-muted-foreground mb-4">Готовые предложения для любого события</p>
      <div className="space-y-3 flex-1">
        {PACKAGES.map(p => (
          <button key={p.id} onClick={() => { setSelectedPkg(p.id); setStep("detail"); }} className="w-full text-left p-4 rounded-2xl border border-border/50 bg-card/30 hover:border-primary/40 transition-all">
            <div className="flex items-start gap-3">
              <span className="text-2xl">{p.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">{p.name}</p>
                  <p className="text-sm font-bold text-primary">{p.price.toLocaleString("ru")} ₽</p>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{p.desc}</p>
                <div className="flex gap-3 mt-1.5 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-0.5"><Users className="w-3 h-3" />{p.guests}</span>
                  <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{p.duration}</span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  if (step === "detail") return (
    <div className="flex flex-col h-full p-5 overflow-auto">
      <div className="flex-1">
        <div className="text-center mb-4">
          <span className="text-4xl">{pkg?.icon}</span>
          <h3 className="text-lg font-bold mt-2">{pkg?.name}</h3>
          <p className="text-xs text-muted-foreground">{pkg?.desc}</p>
          <p className="text-xl font-bold text-primary mt-2">{pkg?.price.toLocaleString("ru")} ₽</p>
        </div>
        <div className="space-y-2 mb-4">
          {[
            { label: "Гостей", value: pkg?.guests },
            { label: "Длительность", value: pkg?.duration },
            { label: "Игр в программе", value: `${pkg?.games} игры` },
          ].map(item => (
            <div key={item.label} className="flex justify-between p-2.5 rounded-lg bg-card/40 border border-border/50 text-sm">
              <span className="text-muted-foreground text-xs">{item.label}</span>
              <span className="font-medium text-xs">{item.value}</span>
            </div>
          ))}
          <div className="p-2.5 rounded-lg bg-card/40 border border-border/50">
            <p className="text-xs text-muted-foreground mb-1.5">Зоны</p>
            <div className="flex flex-wrap gap-1.5">
              {pkg?.zones.map(z => <Badge key={z} variant="outline" className="text-[10px]">{z}</Badge>)}
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="gap-1" onClick={() => setStep("list")}><ArrowLeft className="w-3.5 h-3.5" /></Button>
        <Button className="flex-1" onClick={() => setStep("datetime")}>Выбрать дату <ArrowRight className="w-4 h-4 ml-1" /></Button>
      </div>
    </div>
  );

  if (step === "datetime") return (
    <div className="flex flex-col h-full p-5 overflow-auto">
      <h3 className="text-base font-semibold mb-4">Дата и время</h3>
      <div className="space-y-4 flex-1">
        <div className="space-y-2">
          <Label className="text-xs flex items-center gap-1"><Calendar className="w-3 h-3" />Дата</Label>
          <Input type="date" className="h-9 text-sm" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label className="text-xs flex items-center gap-1"><Clock className="w-3 h-3" />Время начала</Label>
          <div className="grid grid-cols-3 gap-2">
            {TIME_SLOTS.slice(0, 9).map(t => {
              const busy = ["13:30", "15:30"].includes(t);
              return (
                <button key={t} disabled={busy} onClick={() => setSelectedTime(t)} className={cn("h-9 rounded-lg border text-xs font-mono font-medium transition-all",
                  busy ? "border-border/20 bg-muted/10 text-muted-foreground/30 line-through cursor-not-allowed" :
                  selectedTime === t ? "border-primary bg-primary text-primary-foreground" :
                  "border-border/50 bg-card/30 hover:border-primary/40"
                )}>
                  {t}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <Button variant="outline" size="sm" onClick={() => setStep("detail")}><ArrowLeft className="w-3.5 h-3.5" /></Button>
        <Button className="flex-1" disabled={!selectedTime} onClick={() => setStep("contact")}>Далее <ArrowRight className="w-4 h-4 ml-1" /></Button>
      </div>
    </div>
  );

  if (step === "contact") return (
    <div className="flex flex-col h-full p-5 overflow-auto">
      <h3 className="text-base font-semibold mb-4">Контактные данные</h3>
      <div className="flex-1 space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Имя *</Label>
          <Input className="h-9 text-sm" placeholder="Ваше имя" value={contact.name} onChange={e => setContact(c => ({ ...c, name: e.target.value }))} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Телефон *</Label>
          <Input className="h-9 text-sm" type="tel" placeholder="+7 (___) ___-__-__" value={contact.phone} onChange={e => setContact(c => ({ ...c, phone: e.target.value }))} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Email</Label>
          <Input className="h-9 text-sm" type="email" placeholder="email@example.com" value={contact.email} onChange={e => setContact(c => ({ ...c, email: e.target.value }))} />
        </div>
        <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs space-y-1">
          <p className="font-semibold text-sm">Итог</p>
          <div className="flex justify-between"><span className="text-muted-foreground">Пакет</span><span className="font-medium">{pkg?.name}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Дата</span><span className="font-medium">{selectedDate || "Сегодня"} · {selectedTime}</span></div>
          <div className="flex justify-between font-semibold text-primary border-t border-primary/20 pt-1 text-sm"><span>Итого</span><span>{pkg?.price.toLocaleString("ru")} ₽</span></div>
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <Button variant="outline" size="sm" onClick={() => setStep("datetime")}><ArrowLeft className="w-3.5 h-3.5" /></Button>
        <Button className="flex-1" disabled={!contact.name || !contact.phone || submitting} onClick={handleBook}>
          {submitting ? <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2" /> : null}
          {submitting ? "Бронируем..." : "Оплатить и забронировать"}
        </Button>
      </div>
    </div>
  );

  return null;
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export function WidgetPreview({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<"select" | "auto" | "manual" | "package">("select");
  const [autoContact, setAutoContact] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      {/* Phone-like frame */}
      <div className="relative w-full max-w-sm h-[680px] bg-background border border-border/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Widget header */}
        <div className="h-12 bg-primary/10 border-b border-border/50 flex items-center px-4 gap-2 shrink-0">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-bold">VR Park · Бронирование</span>
          <div className="ml-auto flex items-center gap-2">
            {mode !== "select" && (
              <button onClick={() => setMode("select")} className="text-[10px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-0.5">
                <ArrowLeft className="w-3 h-3" /> Режим
              </button>
            )}
            <button onClick={onClose} className="w-6 h-6 rounded-full bg-muted/40 flex items-center justify-center hover:bg-muted/60 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {mode === "select" && <ModeScreen onSelect={setMode} />}
          {mode === "auto" && (
            autoContact ? (
              <ManualFlow onBack={() => { setAutoContact(false); setMode("select"); }} />
            ) : (
              <AutoFlow onDone={() => setAutoContact(true)} />
            )
          )}
          {mode === "manual" && <ManualFlow onBack={() => setMode("select")} />}
          {mode === "package" && <PackageFlow onBack={() => setMode("select")} />}
        </div>

        {/* Footer */}
        <div className="h-8 border-t border-border/30 flex items-center justify-center shrink-0 bg-card/30">
          <p className="text-[9px] text-muted-foreground/40">vrpark.co · Онлайн-бронирование</p>
        </div>
      </div>
    </div>
  );
}
