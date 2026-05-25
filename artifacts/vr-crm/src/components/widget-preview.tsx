import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useLocalStorage } from "@/lib/store";
import {
  X, ArrowLeft, ArrowRight, Check, Wand2, Hand, Package,
  Users, Clock, ChevronRight, Gamepad2, Star, Calendar,
  CheckCircle2, Phone, Mail, MessageSquare, Sparkles,
  MapPin, Zap, ChevronDown, Play, Image, Film,
} from "lucide-react";

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

function LandingScreen({ pageDetail, onBook }: { pageDetail: PageDetail; onBook: () => void }) {
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

      <div className="p-4 border-t border-border/30">
        <Button className="w-full" onClick={onBook}>
          Забронировать <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
        <p className="text-[10px] text-center text-muted-foreground/50 mt-2">VR Park · Онлайн-бронирование</p>
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
  const games = DEFAULT_ZONE_GAMES[zone.id] || [];

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

// ─── MANUAL FLOW ──────────────────────────────────────────────────────────────

function ManualFlow({ onBack }: { onBack: () => void }) {
  const [storedZones] = useLocalStorage("vrpark_widget_zones", DEFAULT_ZONES);
  const [storedZoneMedia] = useLocalStorage<Record<string, ZoneMedia>>("vrpark_zone_media", {});
  const [step, setStep] = useState<"zones" | "zone-detail" | "datetime" | "contact" | "done">("zones");
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [guests, setGuests] = useState("2");
  const [contact, setContact] = useState({ name: "", phone: "", email: "", comment: "" });
  const [submitting, setSubmitting] = useState(false);

  const activeZones = storedZones.filter(z => z.enabled);
  const zone = activeZones.find(z => z.id === selectedZoneId);
  const zoneMedia = selectedZoneId ? (storedZoneMedia[selectedZoneId] ?? { photos: [], videoUrl: "", descBlocks: [] }) : { photos: [], videoUrl: "", descBlocks: [] };

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

  if (step === "datetime") return (
    <div className="flex flex-col h-full p-5 overflow-auto">
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => { setSelectedZoneId(null); setStep("zones"); }} className="p-1 hover:bg-muted/40 rounded-lg"><ArrowLeft className="w-4 h-4 text-muted-foreground" /></button>
        <div>
          <p className="text-xs text-muted-foreground">{zone?.name}</p>
          <h3 className="text-sm font-semibold">Дата и время</h3>
        </div>
      </div>
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
                <button key={t} disabled={busy} onClick={() => setSelectedTime(t)} className={cn("h-9 rounded-lg border text-xs font-mono font-medium transition-all", busy ? "border-border/20 bg-muted/10 text-muted-foreground/30 line-through cursor-not-allowed" : selectedTime === t ? "border-primary bg-primary text-primary-foreground" : "border-border/50 bg-card/30 hover:border-primary/40")}>
                  {t}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <Button className="mt-4 w-full text-sm" disabled={!selectedTime} onClick={() => setStep("contact")}>
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
        <div className="space-y-1.5">
          <Label className="text-xs flex items-center gap-1"><MessageSquare className="w-3 h-3" />Комментарий</Label>
          <Input className="h-9 text-sm" placeholder="Пожелания..." value={contact.comment} onChange={e => setContact(c => ({ ...c, comment: e.target.value }))} />
        </div>
        <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 space-y-1.5 text-xs">
          <p className="font-semibold text-sm">Итог</p>
          {[{ l: "Зона", v: zone?.name }, { l: "Дата", v: selectedDate || "Сегодня" }, { l: "Время", v: selectedTime }, { l: "Гостей", v: guests }].map(item => (
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
  const [selectedDate, setSelectedDate] = useState("");
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
    <div className="flex flex-col h-full p-5 overflow-auto">
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => { setSelectedPkgId(null); setStep("list"); }} className="p-1 hover:bg-muted/40 rounded-lg"><ArrowLeft className="w-4 h-4 text-muted-foreground" /></button>
        <div>
          <p className="text-xs text-muted-foreground">{pkg?.name}</p>
          <h3 className="text-sm font-semibold">Дата и время</h3>
        </div>
      </div>
      <div className="space-y-4 flex-1">
        <div className="space-y-2">
          <Label className="text-xs flex items-center gap-1"><Calendar className="w-3 h-3" /> Дата</Label>
          <Input type="date" className="h-9 text-sm" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label className="text-xs flex items-center gap-1"><Clock className="w-3 h-3" /> Время</Label>
          <div className="grid grid-cols-3 gap-2">
            {TIME_SLOTS.slice(0, 9).map(t => (
              <button key={t} onClick={() => setSelectedTime(t)} className={cn("h-9 rounded-lg border text-xs font-mono font-medium transition-all", selectedTime === t ? "border-primary bg-primary text-primary-foreground" : "border-border/50 bg-card/30 hover:border-primary/40")}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>
      <Button className="mt-4 w-full" disabled={!selectedTime} onClick={() => setStep("contact")}>
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
          {[{ l: "Пакет", v: pkg?.name }, { l: "Дата", v: selectedDate || "Сегодня" }, { l: "Время", v: selectedTime }].map(item => (
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

  const [screen, setScreen] = useState<"landing" | "mode" | "auto" | "manual" | "package">("landing");

  return (
    <div className="w-full h-[600px] bg-background border border-border/50 rounded-2xl overflow-hidden shadow-2xl flex flex-col relative">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-600 z-10" />

      {screen === "landing" && (
        <LandingScreen pageDetail={pageDetail as PageDetail} onBook={() => setScreen("mode")} />
      )}
      {screen === "mode" && (
        <ModeScreen onSelect={setScreen} onBack={() => setScreen("landing")} />
      )}
      {screen === "auto" && (
        <AutoFlow onDone={() => setScreen("manual")} onBack={() => setScreen("mode")} />
      )}
      {screen === "manual" && (
        <ManualFlow onBack={() => setScreen("mode")} />
      )}
      {screen === "package" && (
        <PackageFlow onBack={() => setScreen("mode")} />
      )}
    </div>
  );
}
