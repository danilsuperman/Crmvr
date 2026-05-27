import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useLocalStorage } from "@/lib/store";
import {
  X, ArrowLeft, ArrowRight, Check, Wand2, Hand, Package,
  Users, Clock, ChevronLeft, ChevronRight, Gamepad2, Star, Calendar,
  CheckCircle2, Phone, Mail, MessageSquare, Sparkles,
  MapPin, Zap, ChevronDown, Play, Image, Film, CreditCard,
} from "lucide-react";
import { format, addDays, subDays, startOfMonth, endOfMonth, startOfWeek, isSameMonth, isSameDay, isToday, addMonths, subMonths } from "date-fns";
import { ru as ruLocale } from "date-fns/locale";

// ─── TYPES ────────────────────────────────────────────────────────────────────

type DescBlock = { id: string; type: "h1" | "h2" | "p" | "bullet"; text: string };
type ZoneMedia = { photos: string[]; videoUrl: string; descBlocks: DescBlock[] };
type PkgMedia = { photos: string[]; videoUrl: string; descBlocks: DescBlock[]; scenario: string };
type PageDetail = { title: string; subtitle: string; descBlocks: DescBlock[]; photos: string[]; videoUrl: string };

// ─── DEFAULT DATA ─────────────────────────────────────────────────────────────

const DEFAULT_ZONES = [
  { id: "a", name: "Arena A", description: "Многопользовательская VR-арена для 4 игроков", capacity: 4, ageLimit: 10, enabled: true, color: "#6366f1", priceFrom: 1200 },
  { id: "b", name: "Arena B", description: "Командная игровая зона", capacity: 4, ageLimit: 10, enabled: true, color: "#8b5cf6", priceFrom: 1200 },
  { id: "s", name: "VR Solo", description: "Одиночные VR-приключения", capacity: 1, ageLimit: 7, enabled: true, color: "#ec4899", priceFrom: 800 },
  { id: "r", name: "Racing Zone", description: "Гоночные симуляторы с полным погружением", capacity: 2, ageLimit: 14, enabled: true, color: "#f59e0b", priceFrom: 1500 },
];

const DEFAULT_ZONE_GAMES: Record<string, Array<{ name: string; genre: string; age: string; players: string; duration: string; desc: string }>> = {
  a: [
    { name: "Beat Saber", genre: "Ритм", age: "7+", players: "1-4", duration: "30 мин", desc: "Рубите блоки под музыку — идеально для группы!" },
    { name: "Pistol Whip", genre: "Шутер", age: "12+", players: "1-4", duration: "30 мин", desc: "Музыкальный экшен-шутер." },
  ],
  b: [
    { name: "Pistol Whip", genre: "Шутер", age: "12+", players: "1-4", duration: "30 мин", desc: "Музыкальный экшен-шутер." },
    { name: "Walkabout Mini Golf", genre: "Спорт", age: "7+", players: "1-4", duration: "45 мин", desc: "Расслабляющий мини-гольф в VR." },
  ],
  s: [
    { name: "Half-Life: Alyx", genre: "Шутер", age: "16+", players: "1", duration: "60+ мин", desc: "Лучший VR-опыт от Valve." },
  ],
  r: [
    { name: "GT7 VR", genre: "Гонки", age: "14+", players: "1", duration: "30 мин", desc: "Лучший гоночный симулятор в VR." },
  ],
};

const DEFAULT_PACKAGES = [
  { id: "pk1", name: "День рождения VIP", type: "Birthday", price: 15000, guests: "до 8 чел", duration: "3 ч", zones: ["Arena A", "Lounge"], games: 3, desc: "Все включено для незабываемого праздника в VR!", enabled: true },
  { id: "pk2", name: "Корпоратив Standard", type: "Corporate", price: 35000, guests: "до 20 чел", duration: "4 ч", zones: ["Arena A", "Arena B"], games: 5, desc: "Командный тимбилдинг в виртуальной реальности.", enabled: true },
  { id: "pk3", name: "Horror Night", type: "Horror", price: 8000, guests: "до 4 чел", duration: "2 ч", zones: ["Arena A", "VR Solo"], games: 2, desc: "Страшные игры, атмосфера ужаса 18+.", enabled: true },
  { id: "pk4", name: "Full Park", type: "Premium", price: 80000, guests: "любое", duration: "8 ч", zones: ["Все зоны"], games: 10, desc: "Весь VR-парк в полное распоряжение.", enabled: true },
];

const TIME_SLOTS = ["11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];

const DEFAULT_SESSION_TYPES_WIDGET = [
  { id: 1, name: "Стандарт 30 мин", color: "#6366f1", minDuration: 30, price: 1200 },
  { id: 2, name: "Стандарт 60 мин", color: "#8b5cf6", minDuration: 60, price: 2000 },
  { id: 3, name: "VIP 90 мин", color: "#f59e0b", minDuration: 90, price: 3500 },
  { id: 4, name: "Максимальный 120 мин", color: "#10b981", minDuration: 120, price: 4800 },
];
const AUTO_QUESTIONS = [
  { q: "Сколько вас будет?", options: ["1 человек", "2-3 человека", "4-8 человек", "9+ человек"] },
  { q: "Возраст участников?", options: ["Дети 7-12 лет", "Подростки 13-17", "Взрослые 18+", "Смешанная группа"] },
  { q: "Что предпочитаете?", options: ["Что-нибудь весёлое", "Экшен и стрельба", "Гонки и скорость", "Страшное и острое"] },
  { q: "Бюджет на группу?", options: ["до 3 000 ₽", "3 000 — 10 000 ₽", "10 000 — 30 000 ₽", "без ограничений"] },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function ZonePlaceholderBg({ color, photo }: { color: string; photo?: string }) {
  if (photo) return <img src={photo} alt="" className="w-full h-full object-cover" />;
  return (
    <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${color}30 0%, ${color}60 100%)` }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: color + "40" }}>
        <Zap className="w-5 h-5" style={{ color }} />
      </div>
    </div>
  );
}

function PkgPlaceholderBg({ type, photo }: { type: string; photo?: string }) {
  const icons: Record<string, string> = { Birthday: "🎉", Corporate: "💼", Horror: "👻", Tournament: "🏆", Premium: "🏟️" };
  const colors: Record<string, string> = { Birthday: "#ec4899", Corporate: "#3b82f6", Horror: "#6366f1", Tournament: "#f59e0b", Premium: "#10b981" };
  const color = colors[type] || "#6366f1";
  if (photo) return <img src={photo} alt="" className="w-full h-full object-cover" />;
  return (
    <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${color}20 0%, ${color}50 100%)` }}>
      <span className="text-3xl">{icons[type] || "🎮"}</span>
    </div>
  );
}

function renderBlocks(blocks: DescBlock[]) {
  return blocks.map(b => {
    if (b.type === "h1") return <p key={b.id} className="text-sm font-bold text-foreground">{b.text}</p>;
    if (b.type === "h2") return <p key={b.id} className="text-xs font-semibold text-foreground">{b.text}</p>;
    if (b.type === "bullet") return <p key={b.id} className="text-xs text-muted-foreground flex gap-1.5"><span>•</span>{b.text}</p>;
    return <p key={b.id} className="text-xs text-muted-foreground leading-relaxed">{b.text}</p>;
  });
}

// ─── LANDING SCREEN ───────────────────────────────────────────────────────────

function LandingScreen({ pageDetail, onSelect }: { pageDetail: PageDetail; onSelect: (mode: "auto" | "manual" | "package") => void }) {
  const [photoIdx, setPhotoIdx] = useState(0);
  const photos = pageDetail.photos;

  return (
    <div className="flex flex-col h-full">
      <div className="relative overflow-hidden shrink-0" style={{ height: photos.length > 0 ? 160 : 100 }}>
        {photos.length > 0 ? (
          <>
            <img src={photos[photoIdx]} alt="" className="w-full h-full object-cover" />
            {photos.length > 1 && (
              <>
                <button onClick={() => setPhotoIdx(i => (i - 1 + photos.length) % photos.length)} className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center text-white text-xs">‹</button>
                <button onClick={() => setPhotoIdx(i => (i + 1) % photos.length)} className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center text-white text-xs">›</button>
                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                  {photos.map((_, i) => <div key={i} className={cn("w-1.5 h-1.5 rounded-full", i === photoIdx ? "bg-white" : "bg-white/40")} />)}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="text-3xl mb-1">🎮</div>
              <p className="text-sm font-bold">{pageDetail.title || "VR Park"}</p>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4">
          {photos.length > 0 && (
            <>
              <h2 className="text-sm font-bold text-white drop-shadow">{pageDetail.title || "VR-приключения"}</h2>
              {pageDetail.subtitle && <p className="text-xs text-white/80 drop-shadow">{pageDetail.subtitle}</p>}
            </>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-3">
        {photos.length === 0 && (
          <div>
            <h2 className="text-base font-bold">{pageDetail.title || "VR-приключения"}</h2>
            {pageDetail.subtitle && <p className="text-xs text-muted-foreground mt-0.5">{pageDetail.subtitle}</p>}
          </div>
        )}

        {pageDetail.videoUrl && (
          <div className="h-20 rounded-xl bg-muted/30 border border-border/50 flex items-center justify-center gap-2 text-xs text-muted-foreground cursor-pointer hover:bg-muted/40 transition-colors">
            <div className="w-8 h-8 rounded-full bg-red-500/80 flex items-center justify-center">
              <Play className="w-4 h-4 text-white ml-0.5" />
            </div>
            <span>Смотреть видео</span>
          </div>
        )}

        {pageDetail.descBlocks.length > 0 && (
          <div className="space-y-1.5">{renderBlocks(pageDetail.descBlocks)}</div>
        )}

        {pageDetail.descBlocks.length === 0 && !pageDetail.videoUrl && (
          <p className="text-xs text-muted-foreground leading-relaxed">
            Лучший VR-опыт в городе. Зоны, игры, пакеты — всё для незабываемого отдыха. Бронируйте прямо сейчас!
          </p>
        )}

        <div className="grid grid-cols-3 gap-2 text-center">
          {[{ v: "6+", l: "зон" }, { v: "30+", l: "игр" }, { v: "от 800₽", l: "/ сеанс" }].map(s => (
            <div key={s.l} className="bg-card/40 border border-border/50 rounded-xl p-2">
              <p className="text-sm font-bold text-primary">{s.v}</p>
              <p className="text-[10px] text-muted-foreground">{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 pt-0 space-y-2">
        <p className="text-xs font-semibold text-muted-foreground mb-1">Как хотите забронировать?</p>
        <button onClick={() => onSelect("auto")} className="group w-full p-3 rounded-xl border border-border/50 bg-card/40 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all text-left">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center shrink-0">
              <Wand2 className="w-4 h-4 text-purple-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold">Подобрать автоматически</p>
              <p className="text-[10px] text-muted-foreground">Ответьте на вопросы — найдём лучший вариант</p>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-muted-foreground shrink-0" />
          </div>
        </button>
        <button onClick={() => onSelect("manual")} className="group w-full p-3 rounded-xl border border-border/50 bg-card/40 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all text-left">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center shrink-0">
              <Hand className="w-4 h-4 text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold">Выбрать вручную</p>
              <p className="text-[10px] text-muted-foreground">Выберите зону с описанием и играми</p>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-muted-foreground shrink-0" />
          </div>
        </button>
        <button onClick={() => onSelect("package")} className="group w-full p-3 rounded-xl border border-border/50 bg-card/40 hover:border-green-500/50 hover:bg-green-500/5 transition-all text-left">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-500/15 flex items-center justify-center shrink-0">
              <Package className="w-4 h-4 text-green-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold">Выбрать пакет</p>
              <p className="text-[10px] text-muted-foreground">День рождения, корпоратив, Horror Night</p>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-muted-foreground shrink-0" />
          </div>
        </button>
        <p className="text-[10px] text-center text-muted-foreground/50 pt-1">VR Park · Онлайн-бронирование</p>
      </div>
    </div>
  );
}

// ─── MODE SCREEN ──────────────────────────────────────────────────────────────

function ModeScreen({ onSelect, onBack }: { onSelect: (mode: "auto" | "manual" | "package") => void; onBack: () => void }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-4 border-b border-border/30">
        <button onClick={onBack} className="p-1 hover:bg-muted/40 rounded-lg transition-colors">
          <ArrowLeft className="w-4 h-4 text-muted-foreground" />
        </button>
        <h2 className="text-sm font-semibold">Выберите способ бронирования</h2>
      </div>
      <div className="flex-1 flex flex-col p-4 gap-3">
        <button onClick={() => onSelect("auto")} className="group p-4 rounded-2xl border border-border/50 bg-card/40 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all text-left">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center shrink-0">
              <Wand2 className="w-5 h-5 text-purple-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">Подобрать автоматически</p>
              <p className="text-xs text-muted-foreground mt-0.5">Ответьте на 4 вопроса — мы найдём лучший вариант</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-muted-foreground mt-1 shrink-0" />
          </div>
        </button>
        <button onClick={() => onSelect("manual")} className="group p-4 rounded-2xl border border-border/50 bg-card/40 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all text-left">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center shrink-0">
              <Hand className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">Выбрать вручную</p>
              <p className="text-xs text-muted-foreground mt-0.5">Выберите зону, ознакомьтесь с описанием и играми</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-muted-foreground mt-1 shrink-0" />
          </div>
        </button>
        <button onClick={() => onSelect("package")} className="group p-4 rounded-2xl border border-border/50 bg-card/40 hover:border-green-500/50 hover:bg-green-500/5 transition-all text-left">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/15 flex items-center justify-center shrink-0">
              <Package className="w-5 h-5 text-green-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">Выбрать пакет</p>
              <p className="text-xs text-muted-foreground mt-0.5">День рождения, корпоратив, Horror Night — готово!</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-muted-foreground mt-1 shrink-0" />
          </div>
        </button>
      </div>
    </div>
  );
}

// ─── AUTO FLOW ────────────────────────────────────────────────────────────────

function AutoFlow({ onDone, onBack }: { onDone: () => void; onBack: () => void }) {
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
      <div className="flex items-center gap-2 mb-5">
        <button onClick={step === 0 ? onBack : () => setStep(s => s - 1)} className="p-1 hover:bg-muted/40 rounded-lg">
          <ArrowLeft className="w-4 h-4 text-muted-foreground" />
        </button>
        <div className="flex gap-1.5 flex-1">
          {AUTO_QUESTIONS.map((_, i) => (
            <div key={i} className={cn("h-1 flex-1 rounded-full transition-all", i <= step ? "bg-primary" : "bg-muted/30")} />
          ))}
        </div>
      </div>
      <div className="flex-1">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Вопрос {step + 1} из {AUTO_QUESTIONS.length}</p>
        <h3 className="text-base font-semibold mb-4">{q.q}</h3>
        <div className="grid gap-2">
          {q.options.map(opt => (
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

// ─── ZONE DETAIL ──────────────────────────────────────────────────────────────

function ZoneDetail({
  zone, zoneMedia, onBook, onBack
}: {
  zone: typeof DEFAULT_ZONES[0];
  zoneMedia: ZoneMedia;
  onBook: () => void;
  onBack: () => void;
}) {
  const [photoIdx, setPhotoIdx] = useState(0);
  const photos = zoneMedia.photos;

  // Load real games from localStorage; filter by zone if zoneIds assigned, fall back to static defaults
  const [storedGames] = useLocalStorage<Array<{ id: string; name: string; genre: string; age: string; players: string; duration: string; desc: string; enabled: boolean; zoneIds?: number[] }>>("vrpark_games", []);
  const enabledStoredGames = storedGames.filter(g => g.enabled);
  const zoneNumericId = typeof zone.id === "string" ? parseInt(zone.id) : zone.id;
  const gamesForZone = enabledStoredGames.filter(g =>
    !g.zoneIds || g.zoneIds.length === 0 || g.zoneIds.includes(zoneNumericId)
  );
  const games = enabledStoredGames.length > 0
    ? gamesForZone
    : (DEFAULT_ZONE_GAMES[zone.id] || []);

  return (
    <div className="flex flex-col h-full">
      <div className="relative shrink-0 overflow-hidden" style={{ height: 140 }}>
        {photos.length > 0 ? (
          <>
            <img src={photos[photoIdx]} alt="" className="w-full h-full object-cover" />
            {photos.length > 1 && (
              <>
                <button onClick={() => setPhotoIdx(i => (i - 1 + photos.length) % photos.length)} className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center text-white text-xs">‹</button>
                <button onClick={() => setPhotoIdx(i => (i + 1) % photos.length)} className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center text-white text-xs">›</button>
              </>
            )}
          </>
        ) : (
          <ZonePlaceholderBg color={zone.color} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
        <button onClick={onBack} className="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center">
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>
        <div className="absolute bottom-3 left-4">
          <div className="flex items-center gap-1.5 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: zone.color }} />
            <span className="text-[10px] text-white/70 font-mono">ЗОНА</span>
          </div>
          <h2 className="text-base font-bold text-white">{zone.name}</h2>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        <div className="flex gap-3">
          <div className="flex items-center gap-1 text-xs text-muted-foreground"><Users className="w-3.5 h-3.5" />до {zone.capacity} чел.</div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground"><Zap className="w-3.5 h-3.5" />{zone.ageLimit}+</div>
          {zoneMedia.videoUrl && <div className="flex items-center gap-1 text-xs text-indigo-400"><Film className="w-3.5 h-3.5" />Видео</div>}
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">{zone.description}</p>

        {zoneMedia.descBlocks.length > 0 && (
          <div className="space-y-1.5">{renderBlocks(zoneMedia.descBlocks)}</div>
        )}

        {zoneMedia.videoUrl && (
          <div className="h-16 rounded-xl bg-muted/30 border border-border/50 flex items-center justify-center gap-2 text-xs text-muted-foreground cursor-pointer hover:bg-muted/40 transition-colors">
            <div className="w-7 h-7 rounded-full bg-red-500/80 flex items-center justify-center">
              <Play className="w-3.5 h-3.5 text-white ml-0.5" />
            </div>
            <span>Смотреть видео зоны</span>
          </div>
        )}

        {games.length > 0 && (
          <div>
            <p className="text-xs font-semibold mb-2">Игры в этой зоне</p>
            <div className="space-y-2">
              {games.map(g => (
                <div key={g.name} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-card/40 border border-border/50">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Gamepad2 className="w-4 h-4 text-primary/60" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold">{g.name}</p>
                    <div className="flex gap-2 mt-0.5 text-[10px] text-muted-foreground">
                      <Badge variant="outline" className="text-[9px] px-1.5 py-0">{g.genre}</Badge>
                      <span>{g.players} игр.</span>
                      <span>{g.duration}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Стоимость сеанса</p>
              <p className="text-lg font-black text-primary">от {zone.priceFrom?.toLocaleString("ru") || "1 200"} ₽</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground">Длительность</p>
              <p className="text-sm font-semibold">30–90 мин</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-border/30">
        <Button className="w-full" onClick={onBook}>
          Забронировать эту зону <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

// ─── WIDGET DATE PICKER ───────────────────────────────────────────────────────

function WidgetDatePicker({ value, onChange }: { value: Date; onChange: (d: Date) => void }) {
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(value);
  const monthStart = startOfMonth(viewMonth);
  const monthEnd = endOfMonth(monthStart);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const days: Date[] = [];
  let d = calStart;
  while (d <= monthEnd || days.length % 7 !== 0) {
    days.push(d);
    d = addDays(d, 1);
    if (days.length > 42) break;
  }
  const DOW = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <button onClick={() => onChange(subDays(value, 1))} className="w-8 h-8 rounded-lg border border-border/50 bg-card/30 hover:bg-muted/40 flex items-center justify-center shrink-0 transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button onClick={() => setOpen(v => !v)} className="flex-1 h-8 rounded-lg border border-border/50 bg-card/30 hover:bg-primary/5 hover:border-primary/40 text-sm font-medium transition-all flex items-center justify-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-primary/60" />
          <span className="capitalize">{format(value, "d MMMM, EEE", { locale: ruLocale })}</span>
        </button>
        <button onClick={() => onChange(addDays(value, 1))} className="w-8 h-8 rounded-lg border border-border/50 bg-card/30 hover:bg-muted/40 flex items-center justify-center shrink-0 transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      {open && (
        <div className="bg-card border border-border/70 rounded-xl p-2.5">
          <div className="flex items-center justify-between mb-2">
            <button onClick={() => setViewMonth(subMonths(viewMonth, 1))} className="w-6 h-6 rounded flex items-center justify-center hover:bg-muted/50 text-muted-foreground">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-semibold capitalize">{format(viewMonth, "LLLL yyyy", { locale: ruLocale })}</span>
            <button onClick={() => setViewMonth(addMonths(viewMonth, 1))} className="w-6 h-6 rounded flex items-center justify-center hover:bg-muted/50 text-muted-foreground">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-7 mb-1">
            {DOW.map(d => <div key={d} className="text-center text-[9px] font-medium text-muted-foreground py-0.5">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-y-0.5">
            {days.map((day, idx) => {
              const inMonth = isSameMonth(day, viewMonth);
              const selected = isSameDay(day, value);
              const today = isToday(day);
              return (
                <button key={idx} onClick={() => { onChange(day); setViewMonth(day); setOpen(false); }} className={cn(
                  "h-7 w-7 mx-auto rounded text-[11px] font-medium transition-all",
                  !inMonth && "text-muted-foreground/20",
                  inMonth && !selected && !today && "hover:bg-muted/50",
                  today && !selected && "text-primary font-bold ring-1 ring-primary/30",
                  selected && "bg-primary text-primary-foreground",
                )}>
                  {format(day, "d")}
                </button>
              );
            })}
          </div>
          <div className="mt-2 pt-1.5 border-t border-border/40 flex justify-center">
            <button onClick={() => { const t = new Date(); onChange(t); setViewMonth(t); setOpen(false); }} className="text-[11px] text-primary hover:text-primary/80 font-medium">
              Сегодня
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MANUAL FLOW ──────────────────────────────────────────────────────────────

type SettingsZoneRaw = { id: number; name: string; color: string; capacity: number; openTime: string; closeTime: string };
const DEFAULT_SETTINGS_ZONES_WIDGET: SettingsZoneRaw[] = [
  { id: 1, name: "Arena A", color: "#6366f1", capacity: 4, openTime: "10:00", closeTime: "22:00" },
  { id: 2, name: "Arena B", color: "#8b5cf6", capacity: 4, openTime: "10:00", closeTime: "22:00" },
  { id: 3, name: "VR Solo", color: "#ec4899", capacity: 1, openTime: "10:00", closeTime: "22:00" },
  { id: 4, name: "Racing Zone", color: "#f59e0b", capacity: 2, openTime: "12:00", closeTime: "22:00" },
  { id: 5, name: "PS5 Zone", color: "#3b82f6", capacity: 4, openTime: "10:00", closeTime: "22:00" },
  { id: 6, name: "Motion", color: "#10b981", capacity: 4, openTime: "10:00", closeTime: "22:00" },
];

function ManualFlow({ onBack }: { onBack: () => void }) {
  const [rawSettingsZones] = useLocalStorage<SettingsZoneRaw[]>("vrpark_zones", DEFAULT_SETTINGS_ZONES_WIDGET);
  const [constructorMeta] = useLocalStorage<Record<string, { description: string; ageLimit: number; enabled: boolean; sessionTypeIds?: number[]; price?: number; priceMode?: "per_person" | "per_hour" }>>("vrpark_zone_constructor_meta", {});
  const [storedZoneMedia] = useLocalStorage<Record<string, ZoneMedia>>("vrpark_zone_media", {});
  const [sessionTypes] = useLocalStorage<Array<{ id: number; name: string; color: string; minDuration: number; price?: number }>>("vrpark_session_types", DEFAULT_SESSION_TYPES_WIDGET);

  // Merge settings zones with constructor meta into the shape the widget expects
  const storedZones = rawSettingsZones.map(z => {
    const key = String(z.id);
    const meta = constructorMeta[key] ?? { description: "", ageLimit: 7, enabled: true };
    return {
      id: key,
      name: z.name,
      color: z.color,
      capacity: z.capacity,
      description: meta.description || `${z.name} — VR-зона вашего парка`,
      ageLimit: meta.ageLimit ?? 7,
      enabled: meta.enabled ?? true,
      priceFrom: 1200,
    };
  });

  const [step, setStep] = useState<"zones" | "zone-detail" | "datetime" | "contact" | "done" | "payment">("zones");
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [sessionTypeId, setSessionTypeId] = useState<number | null>(null);
  const [guests, setGuests] = useState("1");
  const [contact, setContact] = useState({ name: "", phone: "", email: "", comment: "" });
  const [submitting, setSubmitting] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const activeZones = storedZones.filter(z => z.enabled);
  const zone = activeZones.find(z => z.id === selectedZoneId);
  const zoneMedia = selectedZoneId ? (storedZoneMedia[selectedZoneId] ?? { photos: [], videoUrl: "", descBlocks: [] }) : { photos: [], videoUrl: "", descBlocks: [] };

  const handleBook = () => {
    setSubmitting(true);
    setTimeout(() => { setSubmitting(false); setStep("done"); }, 1200);
  };

  const handlePrepayBook = () => {
    setSubmitting(true);
    setTimeout(() => { setSubmitting(false); setStep("payment"); }, 1000);
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
            { label: "Дата", val: format(selectedDate, "d MMMM", { locale: ruLocale }) },
            { label: "Время", val: selectedTime },
            { label: "Гостей", val: guests },
            { label: "Сеанс", val: sessionTypeId ? sessionTypes.find(s => s.id === sessionTypeId)?.name : undefined },
          ].filter(item => item.val).map(item => (
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

  if (step === "payment") {
    const st = sessionTypeId ? sessionTypes.find(s => s.id === sessionTypeId) : null;
    const stPriceMode = (st as any)?.priceMode ?? "per_person";
    const stPriceVal = st?.price ?? 1200;
    const guestsNum = parseInt(guests) || 1;
    const total = stPriceMode === "per_zone_time" ? stPriceVal : stPriceVal * guestsNum;
    const prepay = Math.round(total * 0.3);
    const payLink = `https://pay.vrpark.co/prepay?amount=${prepay}&zone=${encodeURIComponent(zone?.name ?? "")}&time=${selectedTime}`;
    return (
      <div className="flex flex-col h-full items-center justify-center p-6 gap-5 text-center">
        <div className="w-16 h-16 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
          <CreditCard className="w-8 h-8 text-amber-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold">Бронь зарезервирована!</h3>
          <p className="text-sm text-muted-foreground mt-1">Внесите предоплату для подтверждения</p>
        </div>
        <div className="w-full space-y-2 text-xs">
          <div className="flex justify-between p-2.5 rounded-lg bg-card/40 border border-border/50">
            <span className="text-muted-foreground">Зона</span>
            <span className="font-medium">{zone?.name}</span>
          </div>
          <div className="flex justify-between p-2.5 rounded-lg bg-card/40 border border-border/50">
            <span className="text-muted-foreground">Дата и время</span>
            <span className="font-medium">{format(selectedDate, "d MMM", { locale: ruLocale })}, {selectedTime}</span>
          </div>
          <div className="flex justify-between p-2.5 rounded-lg bg-card/40 border border-border/50">
            <span className="text-muted-foreground">Итого</span>
            <span className="font-semibold text-primary">{total.toLocaleString("ru")} ₽</span>
          </div>
          <div className="flex justify-between p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <span className="text-amber-400 font-semibold">Предоплата 30%</span>
            <span className="font-black text-amber-400 text-sm">{prepay.toLocaleString("ru")} ₽</span>
          </div>
        </div>
        <a
          href={payLink}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)]"
        >
          <CreditCard className="w-4 h-4" />
          Перейти к оплате {prepay.toLocaleString("ru")} ₽
        </a>
        <button onClick={() => setStep("contact")} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          ← Вернуться к форме
        </button>
      </div>
    );
  }

  if (step === "zone-detail" && zone) {
    return (
      <ZoneDetail
        zone={zone as typeof DEFAULT_ZONES[0]}
        zoneMedia={zoneMedia}
        onBook={() => setStep("datetime")}
        onBack={() => { setSelectedZoneId(null); setStep("zones"); }}
      />
    );
  }

  if (step === "zones") return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-4 border-b border-border/30">
        <button onClick={onBack} className="p-1 hover:bg-muted/40 rounded-lg"><ArrowLeft className="w-4 h-4 text-muted-foreground" /></button>
        <div>
          <h3 className="text-sm font-semibold">Выберите зону</h3>
          <p className="text-xs text-muted-foreground">Нажмите на карточку чтобы узнать подробнее</p>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-3 space-y-2">
        {activeZones.map(z => {
          const media = storedZoneMedia[z.id] ?? { photos: [], videoUrl: "", descBlocks: [] };
          return (
            <button
              key={z.id}
              onClick={() => { setSelectedZoneId(z.id); setStep("zone-detail"); }}
              className="w-full text-left rounded-2xl border border-border/50 bg-card/30 hover:border-primary/40 hover:bg-card/60 transition-all overflow-hidden group"
            >
              <div className="h-24 overflow-hidden">
                <ZonePlaceholderBg color={(z as any).color || "#6366f1"} photo={media.photos[0]} />
              </div>
              <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{z.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">{z.description}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-muted-foreground shrink-0 mt-0.5 transition-colors" />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex gap-2 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-0.5"><Users className="w-3 h-3" />до {z.capacity} чел.</span>
                    <span className="flex items-center gap-0.5"><Zap className="w-3 h-3" />{z.ageLimit}+</span>
                  </div>
                  <p className="text-sm font-bold text-primary">от {(z as any).priceFrom?.toLocaleString("ru") || "1 200"} ₽</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  if (step === "datetime") {
    const zoneMeta = selectedZoneId ? constructorMeta[selectedZoneId] : null;
    const zoneSessionTypeIds = zoneMeta?.sessionTypeIds;
    const availableSessionTypes = (zoneSessionTypeIds && zoneSessionTypeIds.length > 0)
      ? sessionTypes.filter(st => zoneSessionTypeIds.includes(st.id))
      : sessionTypes;
    const guestOptions = Array.from({ length: Math.max(zone?.capacity ?? 4, 1) }, (_, i) => String(i + 1));
    return (
      <div className="flex flex-col h-full p-4 overflow-auto">
        <div className="flex items-center gap-2 mb-3">
          <button onClick={() => { setSelectedZoneId(null); setStep("zones"); }} className="p-1 hover:bg-muted/40 rounded-lg"><ArrowLeft className="w-4 h-4 text-muted-foreground" /></button>
          <div>
            <p className="text-xs text-muted-foreground">{zone?.name}</p>
            <h3 className="text-sm font-semibold">Дата и время</h3>
          </div>
        </div>
        <div className="space-y-3 flex-1">
          <div className="space-y-1.5">
            <Label className="text-xs flex items-center gap-1"><Calendar className="w-3 h-3" /> Дата</Label>
            <WidgetDatePicker value={selectedDate} onChange={d => { setSelectedDate(d); setSelectedTime(null); }} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Количество гостей</Label>
            <div className="flex gap-1.5 flex-wrap">
              {guestOptions.map(n => (
                <button key={n} onClick={() => setGuests(n)} className={cn("h-8 min-w-[2rem] px-3 rounded-lg border text-sm font-medium transition-all", guests === n ? "border-primary bg-primary text-primary-foreground" : "border-border/50 bg-card/30 hover:border-primary/40")}>
                  {n}
                </button>
              ))}
            </div>
          </div>
          {availableSessionTypes.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1"><Zap className="w-3 h-3" /> Тип сеанса</Label>
              <div className="space-y-1">
                {availableSessionTypes.map(st => {
                  const stPriceMode = (st as any).priceMode ?? "per_person";
                  const stPriceVal = st.price ?? 0;
                  const guestsNum = parseInt(guests) || 1;
                  const lineTotal = stPriceMode === "per_zone_time" ? stPriceVal : stPriceVal * guestsNum;
                  return (
                    <button key={st.id} onClick={() => setSessionTypeId(st.id === sessionTypeId ? null : st.id)} className={cn(
                      "w-full flex items-center justify-between p-2 rounded-xl border text-xs font-medium transition-all",
                      sessionTypeId === st.id ? "border-primary bg-primary/10 text-primary" : "border-border/50 bg-card/30 hover:border-primary/40"
                    )}>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: st.color }} />
                        <span>{st.name}</span>
                      </div>
                      {stPriceVal > 0 && (
                        <div className="text-right">
                          <span className="font-bold">{lineTotal.toLocaleString("ru")} ₽</span>
                          <span className="text-[10px] text-muted-foreground ml-1">
                            {stPriceMode === "per_zone_time" ? "за зону" : `×${guestsNum}`}
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              {/* Running total when session selected */}
              {sessionTypeId && (() => {
                const st = availableSessionTypes.find(s => s.id === sessionTypeId);
                if (!st || !st.price) return null;
                const stPriceMode = (st as any).priceMode ?? "per_person";
                const guestsNum = parseInt(guests) || 1;
                const total = stPriceMode === "per_zone_time" ? st.price : st.price * guestsNum;
                const prepay = Math.round(total * 0.3);
                return (
                  <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-emerald-500/8 border border-emerald-500/20 mt-1">
                    <div>
                      <p className="text-[10px] text-muted-foreground">Итого · предоплата 30%</p>
                      <p className="text-xs font-bold text-emerald-400">{prepay.toLocaleString("ru")} ₽ сейчас</p>
                    </div>
                    <p className="text-lg font-black text-emerald-400 tabular-nums">{total.toLocaleString("ru")} ₽</p>
                  </div>
                );
              })()}
            </div>
          )}
          <div className="space-y-1.5">
            <Label className="text-xs flex items-center gap-1"><Clock className="w-3 h-3" /> Свободное время</Label>
            <div className="grid grid-cols-3 gap-1.5">
              {TIME_SLOTS.slice(0, 9).map(t => {
                const busy = ["12:30", "14:30", "16:30"].includes(t);
                return (
                  <button key={t} disabled={busy} onClick={() => setSelectedTime(t)} className={cn("h-8 rounded-lg border text-xs font-mono font-medium transition-all", busy ? "border-border/20 bg-muted/10 text-muted-foreground/30 line-through cursor-not-allowed" : selectedTime === t ? "border-primary bg-primary text-primary-foreground" : "border-border/50 bg-card/30 hover:border-primary/40")}>
                    {t}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <Button className="mt-3 w-full text-sm" disabled={!selectedTime} onClick={() => setStep("contact")}>
          Далее <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    );
  }

  if (step === "contact") return (
    <div className="flex flex-col h-full p-5 overflow-auto">
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => setStep("datetime")} className="p-1 hover:bg-muted/40 rounded-lg"><ArrowLeft className="w-4 h-4 text-muted-foreground" /></button>
        <h3 className="text-sm font-semibold">Контактные данные</h3>
      </div>
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
          <Input className="h-9 text-sm" placeholder="Пожелания..." value={contact.comment} onChange={e => setContact(c => ({ ...c, comment: e.target.value }))} />
        </div>
        <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 space-y-1.5 text-xs">
          <p className="font-semibold text-sm">Итог</p>
          {[
            { l: "Зона", v: zone?.name },
            { l: "Дата", v: format(selectedDate, "d MMMM", { locale: ruLocale }) },
            { l: "Время", v: selectedTime },
            { l: "Гостей", v: guests },
            { l: "Сеанс", v: sessionTypeId ? sessionTypes.find(s => s.id === sessionTypeId)?.name : undefined },
          ].filter(item => item.v).map(item => (
            <div key={item.l} className="flex justify-between"><span className="text-muted-foreground">{item.l}</span><span className="font-medium">{item.v}</span></div>
          ))}
          {(() => {
            const st = sessionTypeId ? sessionTypes.find(s => s.id === sessionTypeId) : null;
            const basePrice = st?.price ?? 1200;
            const guestsNum = parseInt(guests) || 1;
            const total = basePrice * guestsNum;
            const prepay30 = Math.round(total * 0.3);
            return (
              <>
                <div className="border-t border-primary/20 pt-1.5 flex justify-between font-semibold text-sm text-primary">
                  <span>Итого</span>
                  <span>{total.toLocaleString("ru")} ₽</span>
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Предоплата 30%</span>
                  <span className="font-medium text-amber-400">{prepay30.toLocaleString("ru")} ₽</span>
                </div>
              </>
            );
          })()}
        </div>
      </div>
      <div className="flex flex-col gap-2 mt-4">
        {/* Prepay button — prominent, always visible when phone filled */}
        {contact.name && contact.phone && (() => {
          const st = sessionTypeId ? sessionTypes.find(s => s.id === sessionTypeId) : null;
          const stPriceMode = (st as any)?.priceMode ?? "per_person";
          const stPriceVal = st?.price ?? 1200;
          const guestsNum = parseInt(guests) || 1;
          const total = stPriceMode === "per_zone_time" ? stPriceVal : stPriceVal * guestsNum;
          const prepay = Math.round(total * 0.3);
          return (
            <button
              disabled={submitting}
              onClick={handlePrepayBook}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-amber-500/50 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-all font-semibold disabled:opacity-50"
            >
              <span className="flex items-center gap-1.5 text-xs">
                {submitting ? <div className="w-3.5 h-3.5 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" /> : <CreditCard className="w-4 h-4" />}
                Внести предоплату
              </span>
              <span className="text-base font-black tabular-nums">{prepay.toLocaleString("ru")} ₽</span>
            </button>
          );
        })()}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1" onClick={() => setStep("datetime")}><ArrowLeft className="w-3.5 h-3.5" /></Button>
          <Button className="flex-1" disabled={!contact.name || !contact.phone || submitting} onClick={handleBook}>
            {submitting ? <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2" /> : null}
            {submitting ? "Бронируем..." : "Забронировать полностью"}
          </Button>
        </div>
      </div>
    </div>
  );

  return null;
}

// ─── PACKAGE DETAIL ───────────────────────────────────────────────────────────

function PackageDetail({
  pkg, pkgMedia, onBook, onBack
}: {
  pkg: typeof DEFAULT_PACKAGES[0];
  pkgMedia: PkgMedia;
  onBook: () => void;
  onBack: () => void;
}) {
  const [photoIdx, setPhotoIdx] = useState(0);
  const photos = pkgMedia.photos;

  return (
    <div className="flex flex-col h-full">
      <div className="relative shrink-0 overflow-hidden" style={{ height: 140 }}>
        {photos.length > 0 ? (
          <>
            <img src={photos[photoIdx]} alt="" className="w-full h-full object-cover" />
            {photos.length > 1 && (
              <>
                <button onClick={() => setPhotoIdx(i => (i - 1 + photos.length) % photos.length)} className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center text-white text-xs">‹</button>
                <button onClick={() => setPhotoIdx(i => (i + 1) % photos.length)} className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center text-white text-xs">›</button>
              </>
            )}
          </>
        ) : (
          <PkgPlaceholderBg type={pkg.type} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
        <button onClick={onBack} className="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center">
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>
        <div className="absolute bottom-3 left-4 right-4">
          <Badge variant="outline" className="text-[10px] mb-1 bg-background/50 backdrop-blur">{pkg.type}</Badge>
          <h2 className="text-base font-bold text-white">{pkg.name}</h2>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        <div className="flex gap-3 flex-wrap">
          <div className="flex items-center gap-1 text-xs text-muted-foreground"><Users className="w-3.5 h-3.5" />{pkg.guests}</div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="w-3.5 h-3.5" />{pkg.duration}</div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground"><Gamepad2 className="w-3.5 h-3.5" />{pkg.games} игр</div>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">{pkg.desc}</p>

        {pkgMedia.descBlocks.length > 0 && (
          <div className="space-y-1.5">{renderBlocks(pkgMedia.descBlocks)}</div>
        )}

        {pkgMedia.scenario && (
          <div className="p-3 rounded-xl bg-muted/20 border border-border/50">
            <p className="text-xs font-semibold mb-2 flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-yellow-500" />Сценарий мероприятия</p>
            <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">{pkgMedia.scenario}</p>
          </div>
        )}

        {pkgMedia.videoUrl && (
          <div className="h-16 rounded-xl bg-muted/30 border border-border/50 flex items-center justify-center gap-2 text-xs text-muted-foreground cursor-pointer hover:bg-muted/40 transition-colors">
            <div className="w-7 h-7 rounded-full bg-red-500/80 flex items-center justify-center">
              <Play className="w-3.5 h-3.5 text-white ml-0.5" />
            </div>
            <span>Видео о пакете</span>
          </div>
        )}

        {pkg.zones.length > 0 && (
          <div>
            <p className="text-xs font-semibold mb-1.5">Включённые зоны</p>
            <div className="flex flex-wrap gap-1.5">
              {pkg.zones.map(z => <Badge key={z} variant="outline" className="text-[10px]">{z}</Badge>)}
            </div>
          </div>
        )}

        <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Стоимость пакета</p>
              <p className="text-xl font-black text-primary">{pkg.price.toLocaleString("ru")} ₽</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground">Длительность</p>
              <p className="text-sm font-semibold">{pkg.duration}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-border/30">
        <Button className="w-full" onClick={onBook}>
          Забронировать этот пакет <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

// ─── PACKAGE FLOW ─────────────────────────────────────────────────────────────

function PackageFlow({ onBack }: { onBack: () => void }) {
  const [storedPackages] = useLocalStorage("vrpark_constructor_packages", DEFAULT_PACKAGES);
  const [storedPkgMedia] = useLocalStorage<Record<string, PkgMedia>>("vrpark_pkg_media", {});
  const [step, setStep] = useState<"list" | "detail" | "datetime" | "contact" | "done">("list");
  const [selectedPkgId, setSelectedPkgId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [contact, setContact] = useState({ name: "", phone: "", email: "" });
  const [submitting, setSubmitting] = useState(false);

  const activePackages = storedPackages.filter((p: any) => p.enabled !== false);
  const pkg = activePackages.find((p: any) => p.id === selectedPkgId) as typeof DEFAULT_PACKAGES[0] | undefined;
  const pkgMedia: PkgMedia = selectedPkgId ? (storedPkgMedia[selectedPkgId] ?? { photos: [], videoUrl: "", descBlocks: [], scenario: "" }) : { photos: [], videoUrl: "", descBlocks: [], scenario: "" };

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
        <h3 className="text-lg font-bold">Бронь подтверждена! 🎮</h3>
        <p className="text-sm text-muted-foreground mt-1">Ждём вас, {contact.name || "гость"}!</p>
        <p className="text-xs text-muted-foreground mt-0.5">{pkg?.name}</p>
      </div>
      <p className="text-xs text-muted-foreground">SMS с подтверждением отправлено</p>
    </div>
  );

  if (step === "detail" && pkg) {
    return (
      <PackageDetail
        pkg={pkg}
        pkgMedia={pkgMedia}
        onBook={() => setStep("datetime")}
        onBack={() => { setSelectedPkgId(null); setStep("list"); }}
      />
    );
  }

  if (step === "list") return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-4 border-b border-border/30">
        <button onClick={onBack} className="p-1 hover:bg-muted/40 rounded-lg"><ArrowLeft className="w-4 h-4 text-muted-foreground" /></button>
        <div>
          <h3 className="text-sm font-semibold">Выберите пакет</h3>
          <p className="text-xs text-muted-foreground">Нажмите для подробного описания</p>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-3 space-y-2">
        {activePackages.map((p: any) => {
          const media: PkgMedia = storedPkgMedia[p.id] ?? { photos: [], videoUrl: "", descBlocks: [], scenario: "" };
          return (
            <button
              key={p.id}
              onClick={() => { setSelectedPkgId(p.id); setStep("detail"); }}
              className="w-full text-left rounded-2xl border border-border/50 bg-card/30 hover:border-primary/40 hover:bg-card/60 transition-all overflow-hidden group"
            >
              <div className="h-20 overflow-hidden">
                <PkgPlaceholderBg type={p.type} photo={media.photos[0]} />
              </div>
              <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold">{p.name}</p>
                      <Badge variant="outline" className="text-[9px] shrink-0">{p.type}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{p.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-muted-foreground shrink-0 mt-0.5 transition-colors" />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex gap-2 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-0.5"><Users className="w-3 h-3" />{p.guests}</span>
                    <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{p.duration}</span>
                  </div>
                  <p className="text-sm font-bold text-green-500">{p.price.toLocaleString("ru")} ₽</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  if (step === "datetime") return (
    <div className="flex flex-col h-full p-4 overflow-auto">
      <div className="flex items-center gap-2 mb-3">
        <button onClick={() => { setSelectedPkgId(null); setStep("list"); }} className="p-1 hover:bg-muted/40 rounded-lg"><ArrowLeft className="w-4 h-4 text-muted-foreground" /></button>
        <div>
          <p className="text-xs text-muted-foreground">{pkg?.name}</p>
          <h3 className="text-sm font-semibold">Дата и время</h3>
        </div>
      </div>
      <div className="space-y-3 flex-1">
        <div className="space-y-1.5">
          <Label className="text-xs flex items-center gap-1"><Calendar className="w-3 h-3" /> Дата</Label>
          <WidgetDatePicker value={selectedDate} onChange={d => { setSelectedDate(d); setSelectedTime(null); }} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs flex items-center gap-1"><Clock className="w-3 h-3" /> Свободное время</Label>
          <div className="grid grid-cols-3 gap-1.5">
            {TIME_SLOTS.slice(0, 9).map(t => (
              <button key={t} onClick={() => setSelectedTime(t)} className={cn("h-8 rounded-lg border text-xs font-mono font-medium transition-all", selectedTime === t ? "border-primary bg-primary text-primary-foreground" : "border-border/50 bg-card/30 hover:border-primary/40")}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>
      <Button className="mt-3 w-full" disabled={!selectedTime} onClick={() => setStep("contact")}>
        Далее <ArrowRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );

  if (step === "contact") return (
    <div className="flex flex-col h-full p-5 overflow-auto">
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => setStep("datetime")} className="p-1 hover:bg-muted/40 rounded-lg"><ArrowLeft className="w-4 h-4 text-muted-foreground" /></button>
        <h3 className="text-sm font-semibold">Контактные данные</h3>
      </div>
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
        <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 space-y-1.5 text-xs">
          <p className="font-semibold text-sm">Итог</p>
          {[{ l: "Пакет", v: pkg?.name }, { l: "Дата", v: format(selectedDate, "d MMMM", { locale: ruLocale }) }, { l: "Время", v: selectedTime }].map(item => (
            <div key={item.l} className="flex justify-between"><span className="text-muted-foreground">{item.l}</span><span className="font-medium">{item.v}</span></div>
          ))}
          <div className="border-t border-primary/20 pt-1.5 flex justify-between font-semibold text-sm text-primary">
            <span>Итого</span><span>{pkg?.price?.toLocaleString("ru")} ₽</span>
          </div>
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <Button variant="outline" size="sm" onClick={() => setStep("datetime")}><ArrowLeft className="w-3.5 h-3.5" /></Button>
        <Button className="flex-1" disabled={!contact.name || !contact.phone || submitting} onClick={handleBook}>
          {submitting ? <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2" /> : null}
          {submitting ? "Бронируем..." : "Забронировать"}
        </Button>
      </div>
    </div>
  );

  return null;
}

// ─── MAIN WIDGET ──────────────────────────────────────────────────────────────

export function WidgetPreview() {
  const [pageDetails] = useLocalStorage<Record<string, { title: string; subtitle: string; descBlocks: Array<{id: string; type: string; text: string}>; photos: string[]; videoUrl: string }>>("vrpark_page_details", {});
  const [pages] = useLocalStorage<Array<{ id: string; name: string; status: string }>>("vrpark_pages", [{ id: "p1", name: "Главная", status: "published" }]);

  const firstPublishedPage = pages.find(p => p.status === "published");
  const pageDetail = firstPublishedPage ? (pageDetails[firstPublishedPage.id] ?? { title: "", subtitle: "", descBlocks: [], photos: [], videoUrl: "" }) : { title: "", subtitle: "", descBlocks: [], photos: [], videoUrl: "" };

  const [screen, setScreen] = useState<"landing" | "auto" | "manual" | "package">("landing");

  return (
    <div className="w-full h-[600px] bg-background border border-border/50 rounded-2xl overflow-hidden shadow-2xl flex flex-col relative">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-600 z-10" />

      {screen === "landing" && (
        <LandingScreen pageDetail={pageDetail as PageDetail} onSelect={setScreen} />
      )}
      {screen === "auto" && (
        <AutoFlow onDone={() => setScreen("manual")} onBack={() => setScreen("landing")} />
      )}
      {screen === "manual" && (
        <ManualFlow onBack={() => setScreen("landing")} />
      )}
      {screen === "package" && (
        <PackageFlow onBack={() => setScreen("landing")} />
      )}
    </div>
  );
}
