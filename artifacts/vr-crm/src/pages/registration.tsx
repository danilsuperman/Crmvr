import { useState, useRef, useCallback } from "react";
import { WidgetPreview } from "@/components/widget-preview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useLocalStorage } from "@/lib/store";
import {
  Plus, Code2, Link2, Copy, Check, Eye, Trash2, Pencil,
  Image, Film, Users, AlertCircle, Gamepad2, Clock,
  Wand2, Hand, Package, Star, TrendingUp, BarChart3, Filter,
  Globe, Layout, Layers, Zap, Settings2, BarChart2, BookOpen,
  Flame, Target, ArrowUpRight, ExternalLink, Play, Heart,
  Share2, Calendar, DollarSign, CheckCircle2, Monitor, Sparkles,
  X, ArrowLeft, Download, Upload, Type, AlignLeft, List, Heading,
  ChevronRight, ChevronDown, ChevronUp, Video, PlusCircle,
  FileImage, GripVertical, MoreVertical
} from "lucide-react";
import { toast } from "sonner";

// ─── TYPES ────────────────────────────────────────────────────────────────────

type DescBlock = { id: string; type: "h1" | "h2" | "p" | "bullet"; text: string };
type ZoneMedia = { photos: string[]; videoUrl: string; descBlocks: DescBlock[] };
type GameMedia = { coverImage?: string; descBlocks: DescBlock[] };
type PkgMedia = { photos: string[]; videoUrl: string; descBlocks: DescBlock[]; scenario: string };
type PageDetail = { title: string; subtitle: string; descBlocks: DescBlock[]; photos: string[]; videoUrl: string; zoneIds?: number[] };
type SettingsZone = { id: number; name: string; color: string; capacity: number; openTime: string; closeTime: string };

// ─── DATA CONSTANTS ────────────────────────────────────────────────────────────

const DEFAULT_PAGES = [
  { id: "p1", name: "Главная страница бронирования", status: "published", views: 3241, conversion: 14.2, updated: "25.05.2026", type: "Универсальная" },
  { id: "p2", name: "Детский день рождения", status: "published", views: 1829, conversion: 21.5, updated: "24.05.2026", type: "День рождения" },
  { id: "p3", name: "Корпоратив VR", status: "draft", views: 0, conversion: 0, updated: "22.05.2026", type: "Корпоратив" },
  { id: "p4", name: "Horror Night Special", status: "published", views: 892, conversion: 31.1, updated: "20.05.2026", type: "Horror Night" },
];

const PAGE_TYPES = [
  { id: "universal", name: "Универсальная", icon: Globe, desc: "Подходит для любого посетителя" },
  { id: "birthday", name: "День рождения", icon: Star, desc: "Яркий детский дизайн с пакетами" },
  { id: "corp", name: "Корпоратив", icon: Users, desc: "Строгий B2B стиль, командные пакеты" },
  { id: "tournament", name: "Турнир", icon: Target, desc: "Соревновательный формат" },
  { id: "horror", name: "Horror Night", icon: Flame, desc: "Тёмная атмосфера, взрослая аудитория" },
  { id: "fullpark", name: "Full Park", icon: Layout, desc: "Аренда всего парка" },
  { id: "custom", name: "Custom", icon: Sparkles, desc: "Свой дизайн с нуля" },
];

const PAGE_TYPE_NAMES: Record<string, string> = {
  universal: "Универсальная", birthday: "День рождения", corp: "Корпоратив",
  tournament: "Турнир", horror: "Horror Night", fullpark: "Full Park", custom: "Custom",
};

const DEFAULT_ZONES = [
  { id: "a", name: "Arena A", description: "Многопользовательская VR-арена для 4 игроков", capacity: 4, ageLimit: 10, enabled: true, color: "#6366f1" },
  { id: "b", name: "Arena B", description: "Командная игровая зона", capacity: 4, ageLimit: 10, enabled: true, color: "#8b5cf6" },
  { id: "s", name: "VR Solo", description: "Одиночные VR-приключения", capacity: 1, ageLimit: 7, enabled: true, color: "#ec4899" },
  { id: "r", name: "Racing", description: "Гоночные симуляторы в VR", capacity: 2, ageLimit: 14, enabled: false, color: "#f59e0b" },
  { id: "p", name: "PS5", description: "Эксклюзивы PlayStation VR2", capacity: 2, ageLimit: 12, enabled: true, color: "#3b82f6" },
  { id: "m", name: "Motion", description: "Полноценные движущиеся кабины", capacity: 1, ageLimit: 10, enabled: false, color: "#10b981" },
];

const DEFAULT_GAMES = [
  { id: "g1", name: "Beat Saber", genre: "Ритм", players: "1-4", duration: "30 мин", age: "7+", horror: false, desc: "Лучшая VR-ритм игра всех времён", enabled: true },
  { id: "g2", name: "Pistol Whip", genre: "Шутер", players: "1-4", duration: "30 мин", age: "12+", horror: false, desc: "Музыкальный экшен-шутер", enabled: true },
  { id: "g3", name: "Half-Life: Alyx", genre: "Шутер", players: "1", duration: "60+ мин", age: "16+", horror: true, desc: "Флагман VR-игр от Valve", enabled: true },
  { id: "g4", name: "GT7 VR", genre: "Гонки", players: "1", duration: "30 мин", age: "14+", horror: false, desc: "Лучший гоночный симулятор", enabled: true },
  { id: "g5", name: "Zombie Arena", genre: "Шутер", players: "1-4", duration: "30 мин", age: "16+", horror: true, desc: "Кооперативная зомби-защита", enabled: true },
  { id: "g6", name: "Walkabout Mini Golf", genre: "Спорт", players: "1-4", duration: "45 мин", age: "7+", horror: false, desc: "Расслабляющий мини-гольф", enabled: true },
];

const DEFAULT_PACKAGES = [
  { id: "pk1", name: "День рождения VIP", type: "Birthday", price: 15000, guests: "до 8 чел", duration: "3 ч", zones: ["Arena A", "Lounge"], games: 3, desc: "Все включено для незабываемого праздника", enabled: true },
  { id: "pk2", name: "Корпоратив Standard", type: "Corporate", price: 35000, guests: "до 20 чел", duration: "4 ч", zones: ["Arena A", "Arena B", "Racing"], games: 5, desc: "Командный тимбилдинг в VR", enabled: true },
  { id: "pk3", name: "Турнир Full", type: "Tournament", price: 50000, guests: "до 32 чел", duration: "5 ч", zones: ["Arena A", "Arena B"], games: 2, desc: "Организованный VR-турнир", enabled: true },
  { id: "pk4", name: "Full Park", type: "Full Park", price: 80000, guests: "любое", duration: "8 ч", zones: ["Все зоны"], games: 10, desc: "Весь парк в ваше распоряжение", enabled: false },
];

const DEFAULT_SCENARIOS = [
  { id: "sc1", name: "Horror Night", icon: "👻", desc: "Страшные игры, тёмная атмосфера", tags: ["16+", "Horror", "Adults"], favorite: false },
  { id: "sc2", name: "Kids Party", icon: "🎉", desc: "Яркие детские игры, безопасно", tags: ["7+", "Family", "Kids"], favorite: true },
  { id: "sc3", name: "Competitive Pack", icon: "🏆", desc: "PvP игры, турнирные режимы", tags: ["14+", "PvP", "Competitive"], favorite: false },
  { id: "sc4", name: "Relax Experience", icon: "🌿", desc: "Спокойные игры, атмосфера релакса", tags: ["All ages", "Casual"], favorite: false },
];

const DEFAULT_QUESTIONS = [
  { id: "q1", q: "Сколько человек?", type: "number", required: true },
  { id: "q2", q: "Возраст участников?", type: "select", options: ["Дети 7-12", "Подростки 13-17", "Взрослые 18+", "Смешанная группа"], required: true },
  { id: "q3", q: "Бюджет на группу?", type: "select", options: ["до 3 000 ₽", "3 000 — 10 000 ₽", "10 000 — 30 000 ₽", "без ограничений"], required: false },
  { id: "q4", q: "Дата визита?", type: "date", required: true },
];

const DEFAULT_WARNINGS = [
  { id: "w1", warn: "Для игры нужно минимум 4 игрока", active: true },
  { id: "w2", warn: "Зона недоступна в выбранное время", active: true },
  { id: "w3", warn: "Возраст 16+ — уточните наличие взрослых", active: true },
];

const ANALYTICS_DATA = {
  pages: [
    { name: "Главная бронирования", views: 3241, bookings: 461, conversion: 14.2, trend: +12 },
    { name: "Horror Night", views: 892, bookings: 278, conversion: 31.1, trend: +44 },
    { name: "День рождения", views: 1829, bookings: 393, conversion: 21.5, trend: +8 },
  ],
  topGames: [
    { name: "Beat Saber", bookings: 312, pct: 28 },
    { name: "Zombie Arena", bookings: 245, pct: 22 },
    { name: "Half-Life: Alyx", bookings: 198, pct: 18 },
  ],
};

const GENRE_OPTIONS = ["Ритм", "Шутер", "Гонки", "Спорт", "Экшен", "Приключение", "Головоломка"];
const AGE_OPTIONS = ["7+", "12+", "14+", "16+", "18+"];
const PKG_TYPES = ["Birthday", "Corporate", "Tournament", "Full Park", "Custom"];
const bookingUrl = "https://book.vrpark.co/widget/abc123";
const iframeCode = `<iframe src="${bookingUrl}" width="100%" height="700" frameborder="0" />`;
const embedCode = `<script src="https://cdn.vrpark.co/widget.js" data-key="abc123"></script>`;

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function SectionHeader({ title, desc, action }: { title: string; desc?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-4">
      <div>
        <h2 className="text-base font-semibold">{title}</h2>
        {desc && <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>}
      </div>
      {action}
    </div>
  );
}

// ─── RICH EDITOR ──────────────────────────────────────────────────────────────

const BLOCK_TYPES = [
  { type: "h1", label: "Заголовок H1", icon: Heading, preview: "text-base font-bold" },
  { type: "h2", label: "Заголовок H2", icon: Heading, preview: "text-sm font-semibold" },
  { type: "p", label: "Абзац", icon: AlignLeft, preview: "text-sm" },
  { type: "bullet", label: "Пункт списка", icon: List, preview: "text-sm" },
] as const;

function RichEditor({
  blocks, onChange, label = "Описание"
}: {
  blocks: DescBlock[];
  onChange: (blocks: DescBlock[]) => void;
  label?: string;
}) {
  const addBlock = (type: DescBlock["type"]) => {
    onChange([...blocks, { id: `b_${Date.now()}`, type, text: "" }]);
  };
  const updateBlock = (id: string, text: string) => {
    onChange(blocks.map(b => b.id === id ? { ...b, text } : b));
  };
  const removeBlock = (id: string) => {
    onChange(blocks.filter(b => b.id !== id));
  };
  const moveBlock = (id: string, dir: -1 | 1) => {
    const idx = blocks.findIndex(b => b.id === id);
    if (idx + dir < 0 || idx + dir >= blocks.length) return;
    const newBlocks = [...blocks];
    [newBlocks[idx], newBlocks[idx + dir]] = [newBlocks[idx + dir], newBlocks[idx]];
    onChange(newBlocks);
  };

  return (
    <div className="space-y-2">
      <Label className="text-xs">{label}</Label>
      {blocks.length === 0 && (
        <div className="flex items-center justify-center h-12 border border-dashed border-border/50 rounded-xl text-muted-foreground text-xs">
          Добавьте блоки контента ниже
        </div>
      )}
      {blocks.map((block, idx) => {
        const config = BLOCK_TYPES.find(b => b.type === block.type);
        return (
          <div key={block.id} className="flex items-start gap-2 group">
            <div className="flex flex-col gap-0.5 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => moveBlock(block.id, -1)} disabled={idx === 0} className="p-0.5 hover:bg-muted/40 rounded disabled:opacity-20">
                <ChevronUp className="w-3 h-3 text-muted-foreground" />
              </button>
              <button onClick={() => moveBlock(block.id, 1)} disabled={idx === blocks.length - 1} className="p-0.5 hover:bg-muted/40 rounded disabled:opacity-20">
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
              </button>
            </div>
            <div className="flex-1 relative">
              <div className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] text-muted-foreground/50 font-mono uppercase">
                {block.type === "h1" ? "H1" : block.type === "h2" ? "H2" : block.type === "bullet" ? "•" : "¶"}
              </div>
              <input
                type="text"
                value={block.text}
                onChange={e => updateBlock(block.id, e.target.value)}
                placeholder={block.type === "h1" ? "Заголовок раздела..." : block.type === "h2" ? "Подзаголовок..." : block.type === "bullet" ? "Пункт списка..." : "Текст абзаца..."}
                className={cn(
                  "w-full pl-7 pr-3 py-2 bg-card/30 border border-border/50 rounded-lg text-xs focus:outline-none focus:border-primary/50 transition-colors",
                  block.type === "h1" && "font-bold text-sm",
                  block.type === "h2" && "font-semibold",
                )}
              />
            </div>
            <button onClick={() => removeBlock(block.id)} className="mt-1.5 p-1.5 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors opacity-0 group-hover:opacity-100">
              <X className="w-3 h-3" />
            </button>
          </div>
        );
      })}
      <div className="flex gap-1.5 flex-wrap">
        {BLOCK_TYPES.map(bt => (
          <button
            key={bt.type}
            onClick={() => addBlock(bt.type as DescBlock["type"])}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium border border-dashed border-border/50 hover:border-primary/40 hover:bg-primary/5 text-muted-foreground hover:text-foreground transition-all"
          >
            <Plus className="w-3 h-3" />
            {bt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── IMAGE UPLOAD ─────────────────────────────────────────────────────────────

function ImageUpload({
  images, onAdd, onRemove, maxImages = 10, label = "Фотографии"
}: {
  images: string[]; onAdd: (dataUrl: string) => void;
  onRemove: (idx: number) => void; maxImages?: number; label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).slice(0, maxImages - images.length).forEach(file => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = e => {
        if (e.target?.result) onAdd(e.target.result as string);
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="space-y-2">
      <Label className="text-xs">{label}</Label>
      <div className="flex flex-wrap gap-2">
        {images.map((src, idx) => (
          <div key={idx} className="relative group w-20 h-16 rounded-lg overflow-hidden border border-border/50">
            <img src={src} alt="" className="w-full h-full object-cover" />
            <button
              onClick={() => onRemove(idx)}
              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        {images.length < maxImages && (
          <button
            onClick={() => inputRef.current?.click()}
            className="w-20 h-16 rounded-lg border-2 border-dashed border-border/50 hover:border-primary/40 hover:bg-primary/5 flex flex-col items-center justify-center gap-1 transition-all text-muted-foreground hover:text-foreground"
          >
            <FileImage className="w-5 h-5" />
            <span className="text-[9px]">Добавить</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={e => handleFiles(e.target.files)}
      />
    </div>
  );
}

function SingleImageUpload({
  image, onSet, onRemove, label = "Обложка"
}: {
  image?: string; onSet: (dataUrl: string) => void; onRemove: () => void; label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleFile = (file: File | null) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = e => { if (e.target?.result) onSet(e.target.result as string); };
    reader.readAsDataURL(file);
  };
  return (
    <div className="space-y-2">
      <Label className="text-xs">{label}</Label>
      {image ? (
        <div className="relative group w-full h-32 rounded-xl overflow-hidden border border-border/50">
          <img src={image} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button onClick={() => inputRef.current?.click()} className="px-3 py-1.5 bg-white/20 backdrop-blur rounded-lg text-xs text-white font-medium">Заменить</button>
            <button onClick={onRemove} className="px-3 py-1.5 bg-red-500/70 rounded-lg text-xs text-white font-medium">Удалить</button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full h-24 rounded-xl border-2 border-dashed border-border/50 hover:border-primary/40 hover:bg-primary/5 flex flex-col items-center justify-center gap-2 transition-all text-muted-foreground hover:text-foreground"
        >
          <FileImage className="w-6 h-6" />
          <span className="text-xs">Загрузить обложку</span>
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files?.[0] || null)} />
    </div>
  );
}

// ─── PAGE EDITOR ──────────────────────────────────────────────────────────────

function PageEditor({
  page, pageDetail, onSave, onBack
}: {
  page: typeof DEFAULT_PAGES[0];
  pageDetail: PageDetail;
  onSave: (detail: PageDetail) => void;
  onBack: () => void;
}) {
  const [tab, setTab] = useState("content");
  const [detail, setDetail] = useState<PageDetail>(pageDetail);
  const [links, setLinks] = useLocalStorage<Array<{ id: string; label: string; url: string }>>(`vrpark_page_links_${page.id}`, []);
  const [settingsZones] = useLocalStorage<SettingsZone[]>("vrpark_zones", []);
  const [newLink, setNewLink] = useState({ label: "", url: "" });
  const [copied, setCopied] = useState<string | null>(null);

  const pageUrl = `https://book.vrpark.co/page/${page.id}`;
  const pageIframe = `<iframe src="${pageUrl}" width="100%" height="700" frameborder="0" />`;
  const pageScript = `<script src="https://cdn.vrpark.co/widget.js" data-page="${page.id}"></script>`;

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSave = () => {
    onSave(detail);
    toast.success("Страница сохранена");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground">{page.type}</p>
          <h2 className="text-base font-semibold truncate">{page.name}</h2>
        </div>
        <Badge variant={page.status === "published" ? "default" : "secondary"} className="text-[10px] shrink-0">
          {page.status === "published" ? "Опубликована" : "Черновик"}
        </Badge>
        <Button size="sm" className="h-8 text-xs" onClick={handleSave}>Сохранить</Button>
      </div>

      <div className="flex gap-1 border-b border-border/50 pb-0">
        {[
          { id: "content", label: "Контент", icon: AlignLeft },
          { id: "widgets", label: "Виджеты и ссылки", icon: Link2 },
          { id: "seo", label: "SEO", icon: Globe },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn("flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-lg transition-colors border-b-2 -mb-px", tab === t.id ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground hover:text-foreground")}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "content" && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Заголовок страницы</Label>
            <Input className="h-9 text-sm" placeholder="VR-приключения начинаются здесь!" value={detail.title} onChange={e => setDetail(d => ({ ...d, title: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Подзаголовок</Label>
            <Input className="h-9 text-sm" placeholder="Бронируй прямо сейчас — без очередей" value={detail.subtitle} onChange={e => setDetail(d => ({ ...d, subtitle: e.target.value }))} />
          </div>
          <RichEditor
            blocks={detail.descBlocks}
            onChange={blocks => setDetail(d => ({ ...d, descBlocks: blocks }))}
            label="Описание страницы"
          />
          <ImageUpload
            images={detail.photos}
            onAdd={photo => setDetail(d => ({ ...d, photos: [...d.photos, photo] }))}
            onRemove={idx => setDetail(d => ({ ...d, photos: d.photos.filter((_, i) => i !== idx) }))}
            label="Фотографии (карусель)"
          />
          <div className="space-y-1.5">
            <Label className="text-xs flex items-center gap-1"><Film className="w-3 h-3" />Видео</Label>
            <Input className="h-9 text-sm" placeholder="https://youtube.com/watch?v=..." value={detail.videoUrl} onChange={e => setDetail(d => ({ ...d, videoUrl: e.target.value }))} />
            {detail.videoUrl && (
              <div className="h-24 bg-muted/20 border border-border/50 rounded-xl flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Play className="w-5 h-5" />
                {detail.videoUrl.slice(0, 50)}{detail.videoUrl.length > 50 ? "..." : ""}
              </div>
            )}
          </div>
          {settingsZones.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-border/50">
              <Label className="text-xs font-semibold flex items-center gap-1.5"><Layers className="w-3.5 h-3.5" />Зоны на этой странице</Label>
              <p className="text-[10px] text-muted-foreground">Выберите зоны, которые посетители увидят при бронировании</p>
              <div className="space-y-1.5">
                {settingsZones.map(zone => (
                  <div key={zone.id} className="flex items-center justify-between p-2.5 rounded-lg bg-card/30 border border-border/50">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: zone.color }} />
                      <span className="text-xs font-medium truncate">{zone.name}</span>
                      <span className="text-[10px] text-muted-foreground shrink-0">до {zone.capacity} чел.</span>
                    </div>
                    <Switch
                      checked={(detail.zoneIds ?? []).includes(zone.id)}
                      onCheckedChange={v => setDetail(d => ({
                        ...d,
                        zoneIds: v
                          ? [...(d.zoneIds ?? []), zone.id]
                          : (d.zoneIds ?? []).filter(id => id !== zone.id),
                      }))}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          <Button className="w-full" onClick={handleSave}>Сохранить контент</Button>
        </div>
      )}

      {tab === "widgets" && (
        <div className="space-y-4">
          <Card className="bg-card/30 border-border/50">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm flex items-center gap-2"><Code2 className="w-4 h-4" />Встроить виджет</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-3">
              {[
                { label: "iframe", key: "iframe", code: pageIframe },
                { label: "JavaScript", key: "js", code: pageScript },
                { label: "Прямая ссылка", key: "link", code: pageUrl },
              ].map(item => (
                <div key={item.key} className="space-y-1.5">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <div className="flex gap-2">
                    <code className="flex-1 text-[10px] bg-muted/40 border border-border/50 rounded-lg px-2 py-1.5 font-mono text-muted-foreground truncate">{item.code}</code>
                    <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={() => handleCopy(item.key, item.code)}>
                      {copied === item.key ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-card/30 border-border/50">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm flex items-center gap-2"><Link2 className="w-4 h-4" />Кастомные ссылки</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-3">
              {links.map(link => (
                <div key={link.id} className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{link.label}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{link.url}</p>
                  </div>
                  <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0 text-destructive" onClick={() => setLinks(ls => ls.filter(l => l.id !== link.id))}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
              <div className="space-y-2 pt-2 border-t border-border/50">
                <Input className="h-8 text-xs" placeholder="Название ссылки" value={newLink.label} onChange={e => setNewLink(l => ({ ...l, label: e.target.value }))} />
                <Input className="h-8 text-xs" placeholder="https://..." value={newLink.url} onChange={e => setNewLink(l => ({ ...l, url: e.target.value }))} />
                <Button size="sm" className="w-full h-8 text-xs" onClick={() => {
                  if (!newLink.label || !newLink.url) return;
                  setLinks(ls => [...ls, { id: `lnk_${Date.now()}`, ...newLink }]);
                  setNewLink({ label: "", url: "" });
                }}>
                  <Plus className="w-3.5 h-3.5 mr-1" />Добавить ссылку
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {tab === "seo" && (
        <div className="space-y-3">
          <Card className="bg-card/30 border-border/50">
            <CardContent className="p-4 space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">SEO Title</Label>
                <Input className="h-9 text-sm" placeholder="VR Park — Онлайн бронирование" defaultValue={page.name} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Meta Description</Label>
                <textarea className="w-full h-20 text-sm bg-card/30 border border-border/50 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-primary/50" placeholder="Забронируйте VR-приключение онлайн..." />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">OG Image (URL)</Label>
                <Input className="h-9 text-sm" placeholder="https://..." />
              </div>
              <Button className="w-full h-8 text-xs" onClick={() => toast.success("SEO настройки сохранены")}>Сохранить SEO</Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function Registration() {
  const [showWidget, setShowWidget] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  // Persistent state
  const [pages, setPages] = useLocalStorage("vrpark_pages", DEFAULT_PAGES);
  const [zones, setZones] = useLocalStorage("vrpark_widget_zones", DEFAULT_ZONES);
  const [games, setGames] = useLocalStorage("vrpark_games", DEFAULT_GAMES);
  const [packages, setPackages] = useLocalStorage("vrpark_constructor_packages", DEFAULT_PACKAGES);
  const [settingsPackages] = useLocalStorage<Array<{ id: number; name: string; description?: string; maxGuests: number; price?: number }>>( "vrpark_packages", []);
  const [scenarios, setScenarios] = useLocalStorage("vrpark_scenarios", DEFAULT_SCENARIOS);
  const [bookingModes, setBookingModes] = useLocalStorage("vrpark_booking_modes", { auto: true, manual: true, package: false });
  const [questions, setQuestions] = useLocalStorage("vrpark_auto_questions", DEFAULT_QUESTIONS);
  const [warnings, setWarnings] = useLocalStorage("vrpark_smart_warnings", DEFAULT_WARNINGS);

  // Settings zones sync for constructor
  const DEFAULT_SETTINGS_ZONES_DATA = [
    { id: 1, name: "Arena A", color: "#6366f1", capacity: 4, openTime: "10:00", closeTime: "22:00" },
    { id: 2, name: "Arena B", color: "#8b5cf6", capacity: 4, openTime: "10:00", closeTime: "22:00" },
    { id: 3, name: "VR Solo", color: "#ec4899", capacity: 1, openTime: "10:00", closeTime: "22:00" },
    { id: 4, name: "Racing Zone", color: "#f59e0b", capacity: 2, openTime: "12:00", closeTime: "22:00" },
    { id: 5, name: "PS5", color: "#3b82f6", capacity: 2, openTime: "10:00", closeTime: "23:00" },
    { id: 6, name: "Motion", color: "#10b981", capacity: 1, openTime: "11:00", closeTime: "21:00" },
  ];
  const [settingsZones, setSettingsZones] = useLocalStorage<SettingsZone[]>("vrpark_zones", DEFAULT_SETTINGS_ZONES_DATA);
  const [constructorZoneMeta, setConstructorZoneMeta] = useLocalStorage<Record<string, { description: string; ageLimit: number; enabled: boolean }>>("vrpark_zone_constructor_meta", {});
  const [addZoneOpen, setAddZoneOpen] = useState(false);
  const [newZoneForm, setNewZoneForm] = useState({ name: "", color: "#6366f1", capacity: 2 });

  const getConstructorMeta = (zoneId: number) =>
    constructorZoneMeta[String(zoneId)] ?? { description: "", ageLimit: 7, enabled: true };
  const updateConstructorMeta = (zoneId: number, updates: Partial<{ description: string; ageLimit: number; enabled: boolean }>) =>
    setConstructorZoneMeta(prev => ({ ...prev, [String(zoneId)]: { ...getConstructorMeta(zoneId), ...updates } }));
  const handleAddNewZone = () => {
    if (!newZoneForm.name.trim()) return;
    const newId = Math.max(0, ...settingsZones.map(z => z.id)) + 1;
    setSettingsZones(zs => [...zs, { id: newId, name: newZoneForm.name.trim(), color: newZoneForm.color, capacity: newZoneForm.capacity, openTime: "10:00", closeTime: "22:00" }]);
    setNewZoneForm({ name: "", color: "#6366f1", capacity: 2 });
    setAddZoneOpen(false);
    toast.success("Зона добавлена");
  };

  // Media state
  const [zoneMedia, setZoneMedia] = useLocalStorage<Record<string, ZoneMedia>>("vrpark_zone_media", {});
  const [gameMedia, setGameMedia] = useLocalStorage<Record<string, GameMedia>>("vrpark_game_media", {});
  const [pkgMedia, setPkgMedia] = useLocalStorage<Record<string, PkgMedia>>("vrpark_pkg_media", {});
  const [pageDetails, setPageDetails] = useLocalStorage<Record<string, PageDetail>>("vrpark_page_details", {});

  // Page editor state
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);

  // Pages modal
  const [newPageOpen, setNewPageOpen] = useState(false);
  const [selectedPageType, setSelectedPageType] = useState<string | null>(null);
  const [newPageName, setNewPageName] = useState("");
  const [editingPage, setEditingPage] = useState<typeof DEFAULT_PAGES[0] | null>(null);

  // Zone expanded state
  const [expandedZone, setExpandedZone] = useState<string | null>(null);
  const [expandedGame, setExpandedGame] = useState<string | null>(null);
  const [expandedPkg, setExpandedPkg] = useState<string | null>(null);

  // Games
  const [gameFilter, setGameFilter] = useState("all");
  const [newGameOpen, setNewGameOpen] = useState(false);
  const [gameForm, setGameForm] = useState({ name: "", genre: "Ритм", players: "1-4", duration: "30 мин", age: "7+", horror: false, desc: "" });

  // Packages
  const [pkgOpen, setPkgOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState<typeof DEFAULT_PACKAGES[0] | null>(null);
  const [pkgForm, setPkgForm] = useState({ name: "", type: "Birthday", price: "", guests: "до 8 чел", duration: "2 ч", games: "3", desc: "", zones: "" });

  // Scenarios
  const [newScenarioOpen, setNewScenarioOpen] = useState(false);
  const [scenarioForm, setScenarioForm] = useState({ name: "", icon: "🎮", desc: "", tags: "" });

  // Questions
  const [questionOpen, setQuestionOpen] = useState(false);
  const [questionForm, setQuestionForm] = useState({ q: "", type: "select", required: false });

  // Zone inline edit
  const [zoneEdits, setZoneEdits] = useState<Record<string, { description: string; capacity: number; ageLimit: number }>>({});

  // Helpers
  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(key);
    toast.success("Скопировано!");
    setTimeout(() => setCopied(null), 2000);
  };

  const getZoneMedia = (id: string): ZoneMedia => zoneMedia[id] ?? { photos: [], videoUrl: "", descBlocks: [] };
  const setZoneMed = (id: string, updater: (m: ZoneMedia) => ZoneMedia) => setZoneMedia(prev => ({ ...prev, [id]: updater(getZoneMedia(id)) }));

  const getGameMedia = (id: string): GameMedia => gameMedia[id] ?? { descBlocks: [] };
  const setGameMed = (id: string, updater: (m: GameMedia) => GameMedia) => setGameMedia(prev => ({ ...prev, [id]: updater(getGameMedia(id)) }));

  const getPkgMedia = (id: string): PkgMedia => pkgMedia[id] ?? { photos: [], videoUrl: "", descBlocks: [], scenario: "" };
  const setPkgMed = (id: string, updater: (m: PkgMedia) => PkgMedia) => setPkgMedia(prev => ({ ...prev, [id]: updater(getPkgMedia(id)) }));

  const getPageDetail = (id: string): PageDetail => pageDetails[id] ?? { title: "", subtitle: "", descBlocks: [], photos: [], videoUrl: "" };
  const setPageDetail = (id: string, detail: PageDetail) => setPageDetails(prev => ({ ...prev, [id]: detail }));

  // Zones
  const toggleZone = (id: string) => setZones(zs => zs.map(z => z.id === id ? { ...z, enabled: !z.enabled } : z));
  const getZoneEdit = (z: typeof DEFAULT_ZONES[0]) => zoneEdits[z.id] ?? { description: z.description, capacity: z.capacity, ageLimit: z.ageLimit };
  const updateZoneEdit = (id: string, field: string, value: string | number) => setZoneEdits(prev => ({ ...prev, [id]: { ...getZoneEdit(zones.find(z => z.id === id)!), [field]: value } }));
  const saveZone = (id: string) => {
    const edit = zoneEdits[id];
    if (!edit) return;
    setZones(zs => zs.map(z => z.id === id ? { ...z, ...edit } : z));
    setZoneEdits(prev => { const n = { ...prev }; delete n[id]; return n; });
    toast.success("Зона сохранена");
  };

  const filteredGames = games.filter(g => {
    if (gameFilter === "horror") return g.horror;
    if (gameFilter === "kids") return g.age === "7+";
    if (gameFilter === "racing") return g.genre === "Гонки";
    if (gameFilter === "multi") return g.players !== "1";
    return true;
  });

  // Pages handlers
  const handleCreatePage = () => {
    if (!selectedPageType || !newPageName.trim()) return;
    const today = new Date();
    const d = `${today.getDate().toString().padStart(2, "0")}.${(today.getMonth() + 1).toString().padStart(2, "0")}.${today.getFullYear()}`;
    const newPage = { id: `p_${Date.now()}`, name: newPageName.trim(), status: "draft" as const, views: 0, conversion: 0, updated: d, type: PAGE_TYPE_NAMES[selectedPageType] ?? selectedPageType };
    setPages(ps => [...ps, newPage]);
    toast.success(`Страница "${newPageName}" создана`);
    setNewPageOpen(false); setNewPageName(""); setSelectedPageType(null);
  };
  const handleDeletePage = (id: string) => { if (!confirm("Удалить страницу?")) return; setPages(ps => ps.filter(p => p.id !== id)); toast.success("Страница удалена"); };
  const handleTogglePublish = (id: string) => { setPages(ps => ps.map(p => p.id === id ? { ...p, status: p.status === "published" ? "draft" : "published" } : p)); toast.success("Статус обновлён"); };

  // Games handlers
  const handleToggleGame = (id: string) => setGames(gs => gs.map(g => g.id === id ? { ...g, enabled: !g.enabled } : g));
  const handleDeleteGame = (id: string) => { if (!confirm("Удалить игру?")) return; setGames(gs => gs.filter(g => g.id !== id)); toast.success("Игра удалена"); };
  const handleAddGame = () => {
    if (!gameForm.name.trim()) { toast.error("Введите название игры"); return; }
    setGames(gs => [...gs, { id: `g_${Date.now()}`, ...gameForm, enabled: true }]);
    toast.success(`Игра "${gameForm.name}" добавлена`);
    setNewGameOpen(false);
    setGameForm({ name: "", genre: "Ритм", players: "1-4", duration: "30 мин", age: "7+", horror: false, desc: "" });
  };

  // Packages handlers
  const openNewPkg = () => { setEditingPkg(null); setPkgForm({ name: "", type: "Birthday", price: "", guests: "до 8 чел", duration: "2 ч", games: "3", desc: "", zones: "" }); setPkgOpen(true); };
  const openEditPkg = (pkg: typeof DEFAULT_PACKAGES[0]) => { setEditingPkg(pkg); setPkgForm({ name: pkg.name, type: pkg.type, price: pkg.price.toString(), guests: pkg.guests, duration: pkg.duration, games: pkg.games.toString(), desc: pkg.desc, zones: pkg.zones.join(", ") }); setPkgOpen(true); };
  const handleSavePkg = () => {
    if (!pkgForm.name.trim()) { toast.error("Введите название пакета"); return; }
    if (editingPkg) {
      setPackages(ps => ps.map(p => p.id === editingPkg.id ? { ...p, name: pkgForm.name, type: pkgForm.type, price: Number(pkgForm.price) || 0, guests: pkgForm.guests, duration: pkgForm.duration, games: Number(pkgForm.games) || 0, desc: pkgForm.desc, zones: pkgForm.zones.split(",").map(s => s.trim()).filter(Boolean) } : p));
      toast.success("Пакет обновлён");
    } else {
      setPackages(ps => [...ps, { id: `pk_${Date.now()}`, name: pkgForm.name, type: pkgForm.type, price: Number(pkgForm.price) || 0, guests: pkgForm.guests, duration: pkgForm.duration, games: Number(pkgForm.games) || 0, desc: pkgForm.desc, zones: pkgForm.zones.split(",").map(s => s.trim()).filter(Boolean), enabled: true }]);
      toast.success("Пакет добавлен");
    }
    setPkgOpen(false);
  };

  const importFromSettings = () => {
    if (settingsPackages.length === 0) { toast.error("В настройках нет пакетов для импорта"); return; }
    let imported = 0;
    settingsPackages.forEach(sp => {
      const exists = packages.find(p => p.name === sp.name);
      if (!exists) {
        setPackages(ps => [...ps, { id: `pk_${Date.now()}_${Math.random()}`, name: sp.name, type: "Birthday", price: sp.price || 0, guests: `до ${sp.maxGuests} чел`, duration: "3 ч", games: 3, desc: sp.description || "", zones: [], enabled: true }]);
        imported++;
      }
    });
    toast.success(imported > 0 ? `Импортировано ${imported} пакетов` : "Все пакеты уже добавлены");
  };

  // ── Selected page rendering ──────────────────────────────────────────────────

  if (showWidget) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className="text-lg font-semibold">Предпросмотр виджета</h1>
          <Button variant="outline" size="sm" onClick={() => setShowWidget(false)}>← Назад</Button>
        </div>
        <div className="flex-1 overflow-auto p-4 flex items-start justify-center bg-muted/20">
          <div className="w-full max-w-sm">
            <WidgetPreview />
          </div>
        </div>
      </div>
    );
  }

  // ── FULL PAGE ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="shrink-0 flex items-center justify-between px-4 md:px-6 py-3 border-b border-border/50 bg-card/30">
        <div>
          <h1 className="text-lg font-bold">Конструктор онлайн-записи</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Настройте страницы, зоны, игры, пакеты и виджет</p>
        </div>
        <Button size="sm" className="gap-1.5 text-xs" onClick={() => setShowWidget(true)}>
          <Eye className="w-3.5 h-3.5" /> Предпросмотр виджета
        </Button>
      </div>

      <Tabs defaultValue="pages" className="flex flex-col flex-1 overflow-hidden min-h-0">
        <div className="shrink-0 px-4 md:px-6 pt-3 border-b border-border/50">
          <TabsList className="h-auto gap-1 w-full flex flex-nowrap overflow-x-auto justify-start bg-transparent p-0 pb-px">
          {[
            { value: "pages", label: "Страницы" },
            { value: "zones", label: "Зоны" },
            { value: "games", label: "Игры" },
            { value: "packages", label: "Пакеты" },
            { value: "auto", label: "Авто-подбор" },
            { value: "widget", label: "Виджет" },
            { value: "analytics", label: "Аналитика" },
          ].map(t => (
            <TabsTrigger key={t.value} value={t.value} className="text-xs shrink-0">{t.label}</TabsTrigger>
          ))}
        </TabsList>
        </div>

        {/* ── PAGES TAB ──────────────────────────────────────────────────────── */}
        <TabsContent value="pages" className="flex-1 overflow-auto p-4 md:p-6 pb-20 md:pb-6 space-y-4 mt-0">
          {selectedPageId ? (() => {
            const page = pages.find(p => p.id === selectedPageId);
            if (!page) return null;
            return (
              <PageEditor
                page={page}
                pageDetail={getPageDetail(page.id)}
                onSave={detail => setPageDetail(page.id, detail)}
                onBack={() => setSelectedPageId(null)}
              />
            );
          })() : (
            <>
              <SectionHeader
                title="Страницы бронирования"
                desc="Каждая страница — отдельный лендинг с виджетом бронирования. Нажмите на страницу чтобы её редактировать."
                action={
                  <Button size="sm" className="h-8 gap-1.5 text-xs shrink-0" onClick={() => setNewPageOpen(true)}>
                    <Plus className="w-3.5 h-3.5" /> Новая страница
                  </Button>
                }
              />
              <div className="grid gap-3">
                {pages.map(page => {
                  const detail = getPageDetail(page.id);
                  const hasContent = detail.title || detail.photos.length > 0 || detail.descBlocks.length > 0;
                  return (
                    <Card
                      key={page.id}
                      className="bg-card/30 border-border/50 hover:border-primary/40 hover:bg-card/50 cursor-pointer transition-all group"
                      onClick={() => setSelectedPageId(page.id)}
                    >
                      <CardHeader className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {detail.photos[0] ? (
                            <img src={detail.photos[0]} alt="" className="w-12 h-10 rounded-lg object-cover shrink-0" />
                          ) : (
                            <div className="w-12 h-10 rounded-lg bg-muted/30 border border-dashed border-border/50 flex items-center justify-center shrink-0">
                              <Image className="w-4 h-4 text-muted-foreground/40" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-semibold truncate">{page.name}</span>
                              <Badge variant={page.status === "published" ? "default" : "secondary"} className="text-[10px]">
                                {page.status === "published" ? "Опубликована" : "Черновик"}
                              </Badge>
                              {hasContent && <Badge variant="outline" className="text-[10px] text-indigo-400 border-indigo-400/30">С контентом</Badge>}
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                              <span>{page.type}</span>
                              {page.views > 0 && <span>{page.views.toLocaleString("ru")} просмотров</span>}
                              {page.conversion > 0 && <span className="text-green-500">{page.conversion}% конверсия</span>}
                            </div>
                            {detail.title && <p className="text-[10px] text-muted-foreground/70 truncate mt-0.5">"{detail.title}"</p>}
                          </div>
                          <div className="flex gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-7 w-7" title={page.status === "published" ? "Снять с публикации" : "Опубликовать"} onClick={() => handleTogglePublish(page.id)}>
                              {page.status === "published" ? <Eye className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" title="Удалить страницу" onClick={() => handleDeletePage(page.id)}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-muted-foreground shrink-0 transition-colors" />
                        </div>
                      </CardHeader>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </TabsContent>

        {/* ── ZONES TAB ──────────────────────────────────────────────────────── */}
        <TabsContent value="zones" className="flex-1 overflow-auto p-4 md:p-6 pb-20 md:pb-6 space-y-4 mt-0">
          <SectionHeader
            title="Зоны VR-парка"
            desc="Зоны синхронизированы с Настройками. Добавьте медиа и описание для каждой зоны — клиенты увидят это при выборе."
            action={
              <Button size="sm" className="h-8 gap-1.5 text-xs shrink-0" onClick={() => setAddZoneOpen(true)}>
                <Plus className="w-3.5 h-3.5" /> Новая зона
              </Button>
            }
          />
          <div className="space-y-3">
            {settingsZones.map(zone => {
              const meta = getConstructorMeta(zone.id);
              const zoneKey = String(zone.id);
              const media = getZoneMedia(zoneKey);
              const isExpanded = expandedZone === zoneKey;
              return (
                <Card key={zone.id} className={cn("border-border/50 transition-all", meta.enabled ? "bg-card/30" : "bg-muted/10 opacity-70")}>
                  <div
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                    onClick={() => setExpandedZone(isExpanded ? null : zoneKey)}
                  >
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: zone.color }} />
                    {media.photos[0] ? (
                      <img src={media.photos[0]} alt="" className="w-10 h-8 rounded object-cover shrink-0" />
                    ) : (
                      <div className="w-10 h-8 rounded bg-muted/30 border border-dashed border-border/30 flex items-center justify-center shrink-0">
                        <Image className="w-3 h-3 text-muted-foreground/30" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">{zone.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {meta.description || `Вместимость: ${zone.capacity} · ${zone.openTime}–${zone.closeTime}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {media.photos.length > 0 && <span className="text-[10px] text-indigo-400">{media.photos.length} фото</span>}
                      <Switch
                        checked={meta.enabled}
                        onCheckedChange={v => updateConstructorMeta(zone.id, { enabled: v })}
                        onClick={e => e.stopPropagation()}
                      />
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-4 border-t border-border/30 pt-4">
                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1">
                          <Label className="text-xs">Описание (виджет)</Label>
                          <Input
                            className="h-8 text-xs"
                            value={meta.description}
                            placeholder="Краткое описание для клиента"
                            onChange={e => updateConstructorMeta(zone.id, { description: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Вместимость</Label>
                          <Input className="h-8 text-xs" type="number" min="1" value={zone.capacity} readOnly />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Возраст от</Label>
                          <Input
                            className="h-8 text-xs"
                            type="number"
                            min="0"
                            value={meta.ageLimit}
                            onChange={e => updateConstructorMeta(zone.id, { ageLimit: Number(e.target.value) })}
                          />
                        </div>
                      </div>

                      <RichEditor
                        blocks={media.descBlocks}
                        onChange={blocks => setZoneMed(zoneKey, m => ({ ...m, descBlocks: blocks }))}
                        label="Подробное описание зоны"
                      />

                      <ImageUpload
                        images={media.photos}
                        onAdd={photo => setZoneMed(zoneKey, m => ({ ...m, photos: [...m.photos, photo] }))}
                        onRemove={idx => setZoneMed(zoneKey, m => ({ ...m, photos: m.photos.filter((_, i) => i !== idx) }))}
                        label="Фотографии зоны"
                      />

                      <div className="space-y-1.5">
                        <Label className="text-xs flex items-center gap-1"><Film className="w-3 h-3" />Видео зоны</Label>
                        <Input
                          className="h-8 text-xs"
                          placeholder="https://youtube.com/watch?v=..."
                          value={media.videoUrl}
                          onChange={e => setZoneMed(zoneKey, m => ({ ...m, videoUrl: e.target.value }))}
                        />
                      </div>

                      <Button size="sm" className="h-8 text-xs" onClick={() => toast.success("Медиа зоны сохранено")}>
                        Сохранить медиа
                      </Button>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          {/* Add Zone Modal */}
          <Dialog open={addZoneOpen} onOpenChange={setAddZoneOpen}>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>Новая зона</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Название <span className="text-destructive">*</span></Label>
                  <Input
                    className="h-9 text-sm"
                    placeholder="Название зоны"
                    value={newZoneForm.name}
                    onChange={e => setNewZoneForm(f => ({ ...f, name: e.target.value }))}
                    autoFocus
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Цвет</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newZoneForm.color}
                      onChange={e => setNewZoneForm(f => ({ ...f, color: e.target.value }))}
                      className="w-9 h-9 rounded cursor-pointer border border-border/50 bg-transparent"
                    />
                    <span className="text-xs text-muted-foreground font-mono">{newZoneForm.color}</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Вместимость</Label>
                  <Input
                    className="h-9 text-sm"
                    type="number"
                    min="1"
                    value={newZoneForm.capacity}
                    onChange={e => setNewZoneForm(f => ({ ...f, capacity: Number(e.target.value) }))}
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <Button variant="outline" className="flex-1 h-9 text-sm" onClick={() => setAddZoneOpen(false)}>Отмена</Button>
                  <Button className="flex-1 h-9 text-sm" onClick={handleAddNewZone} disabled={!newZoneForm.name.trim()}>Добавить</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* ── GAMES TAB ──────────────────────────────────────────────────────── */}
        <TabsContent value="games" className="flex-1 overflow-auto p-4 md:p-6 pb-20 md:pb-6 space-y-4 mt-0">
          <SectionHeader
            title="Игры"
            desc="Добавьте обложки и описания для каждой игры."
            action={
              <Button size="sm" className="h-8 gap-1.5 text-xs shrink-0" onClick={() => setNewGameOpen(true)}>
                <Plus className="w-3.5 h-3.5" /> Добавить игру
              </Button>
            }
          />

          <div className="flex gap-1.5 flex-wrap">
            {[
              { key: "all", label: "Все" },
              { key: "kids", label: "Дети" },
              { key: "horror", label: "Хоррор" },
              { key: "racing", label: "Гонки" },
              { key: "multi", label: "Мультиплеер" },
            ].map(f => (
              <button key={f.key} onClick={() => setGameFilter(f.key)} className={cn("px-3 py-1.5 text-xs rounded-lg border transition-colors", gameFilter === f.key ? "bg-primary text-primary-foreground border-primary" : "border-border/50 text-muted-foreground hover:bg-muted/30")}>
                {f.label}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {filteredGames.map(game => {
              const media = getGameMedia(game.id);
              const isExpanded = expandedGame === game.id;
              return (
                <Card key={game.id} className={cn("border-border/50 transition-all", game.enabled ? "bg-card/30" : "bg-muted/10 opacity-60")}>
                  <div
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                    onClick={() => setExpandedGame(isExpanded ? null : game.id)}
                  >
                    {media.coverImage ? (
                      <img src={media.coverImage} alt="" className="w-12 h-10 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="w-12 h-10 rounded-lg bg-muted/30 border border-dashed border-border/30 flex items-center justify-center shrink-0">
                        <Gamepad2 className="w-4 h-4 text-muted-foreground/30" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold">{game.name}</span>
                        <Badge variant="outline" className="text-[10px]">{game.genre}</Badge>
                        {game.horror && <Badge variant="destructive" className="text-[10px]">18+</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">{game.players} игр. · {game.duration} · {game.age}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Switch checked={game.enabled} onCheckedChange={() => handleToggleGame(game.id)} onClick={e => e.stopPropagation()} />
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={e => { e.stopPropagation(); handleDeleteGame(game.id); }}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-4 border-t border-border/30 pt-4">
                      <SingleImageUpload
                        image={media.coverImage}
                        onSet={img => setGameMed(game.id, m => ({ ...m, coverImage: img }))}
                        onRemove={() => setGameMed(game.id, m => ({ ...m, coverImage: undefined }))}
                        label="Обложка игры"
                      />
                      <RichEditor
                        blocks={media.descBlocks}
                        onChange={blocks => setGameMed(game.id, m => ({ ...m, descBlocks: blocks }))}
                        label="Подробное описание игры"
                      />
                      <Button size="sm" className="h-8 text-xs" onClick={() => toast.success("Медиа игры сохранено")}>
                        Сохранить медиа
                      </Button>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ── PACKAGES TAB ───────────────────────────────────────────────────── */}
        <TabsContent value="packages" className="flex-1 overflow-auto p-4 md:p-6 pb-20 md:pb-6 space-y-4 mt-0">
          <SectionHeader
            title="Пакеты мероприятий"
            desc="Добавьте фотографии, видео, описание сценария. Клиент увидит полную карточку пакета."
            action={
              <div className="flex gap-2 shrink-0">
                <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={importFromSettings}>
                  <Download className="w-3.5 h-3.5" /> Из настроек
                </Button>
                <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={openNewPkg}>
                  <Plus className="w-3.5 h-3.5" /> Добавить
                </Button>
              </div>
            }
          />

          <div className="space-y-3">
            {packages.map(pkg => {
              const media = getPkgMedia(pkg.id);
              const isExpanded = expandedPkg === pkg.id;
              return (
                <Card key={pkg.id} className={cn("border-border/50 transition-all", pkg.enabled ? "bg-card/30" : "bg-muted/10 opacity-60")}>
                  <div
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                    onClick={() => setExpandedPkg(isExpanded ? null : pkg.id)}
                  >
                    {media.photos[0] ? (
                      <img src={media.photos[0]} alt="" className="w-12 h-10 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="w-12 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                        <Package className="w-4 h-4 text-blue-400/60" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold">{pkg.name}</span>
                        <Badge variant="outline" className="text-[10px]">{pkg.type}</Badge>
                        <span className="text-xs text-green-500 font-semibold">{pkg.price.toLocaleString("ru")} ₽</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{pkg.guests} · {pkg.duration}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {media.photos.length > 0 && <span className="text-[10px] text-indigo-400">{media.photos.length} фото</span>}
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={e => { e.stopPropagation(); openEditPkg(pkg); }}><Pencil className="w-3.5 h-3.5" /></Button>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-4 border-t border-border/30 pt-4">
                      <ImageUpload
                        images={media.photos}
                        onAdd={photo => setPkgMed(pkg.id, m => ({ ...m, photos: [...m.photos, photo] }))}
                        onRemove={idx => setPkgMed(pkg.id, m => ({ ...m, photos: m.photos.filter((_, i) => i !== idx) }))}
                        label="Фотографии пакета"
                      />
                      <div className="space-y-1.5">
                        <Label className="text-xs flex items-center gap-1"><Film className="w-3 h-3" />Видео</Label>
                        <Input
                          className="h-8 text-xs"
                          placeholder="https://youtube.com/watch?v=..."
                          value={media.videoUrl}
                          onChange={e => setPkgMed(pkg.id, m => ({ ...m, videoUrl: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Сценарий мероприятия</Label>
                        <textarea
                          className="w-full h-20 text-xs bg-card/30 border border-border/50 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-primary/50"
                          placeholder="Опишите программу мероприятия по шагам: встреча гостей, VR-сеансы, паузы..."
                          value={media.scenario}
                          onChange={e => setPkgMed(pkg.id, m => ({ ...m, scenario: e.target.value }))}
                        />
                      </div>
                      <RichEditor
                        blocks={media.descBlocks}
                        onChange={blocks => setPkgMed(pkg.id, m => ({ ...m, descBlocks: blocks }))}
                        label="Детальное описание пакета"
                      />
                      <Button size="sm" className="h-8 text-xs" onClick={() => toast.success("Медиа пакета сохранено")}>
                        Сохранить медиа
                      </Button>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ── AUTO TAB ───────────────────────────────────────────────────────── */}
        <TabsContent value="auto" className="flex-1 overflow-auto p-4 md:p-6 pb-20 md:pb-6 space-y-4 mt-0">
          <SectionHeader title="Авто-подбор" desc="Настройте алгоритм и вопросы для автоматического подбора." />
          <Card className="bg-card/30 border-border/50">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm">Режимы бронирования</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-2">
              {[
                { key: "auto" as const, icon: Wand2, label: "Авто-подбор", desc: "ИИ подбирает зону и игры по ответам" },
                { key: "manual" as const, icon: Hand, label: "Вручную", desc: "Клиент выбирает сам" },
                { key: "package" as const, icon: Package, label: "Пакеты", desc: "Готовые мероприятия" },
              ].map(mode => (
                <div key={mode.key} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <mode.icon className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{mode.label}</p>
                      <p className="text-xs text-muted-foreground">{mode.desc}</p>
                    </div>
                  </div>
                  <Switch checked={bookingModes[mode.key]} onCheckedChange={v => setBookingModes(bm => ({ ...bm, [mode.key]: v }))} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-card/30 border-border/50">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm flex items-center justify-between">
                <span>Вопросы авто-подбора</span>
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setQuestionOpen(true)}>
                  <Plus className="w-3.5 h-3.5 mr-1" />Вопрос
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-2">
              {questions.map((q, idx) => (
                <div key={q.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/20 border border-border/30">
                  <span className="text-[10px] font-mono text-muted-foreground w-4 shrink-0">{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{q.q}</p>
                    <p className="text-[10px] text-muted-foreground">{q.type}{q.required ? " · Обязательный" : ""}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => setQuestions(qs => qs.filter(x => x.id !== q.id))}>
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-card/30 border-border/50">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm">Умные предупреждения</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-2">
              {warnings.map(w => (
                <div key={w.id} className="flex items-center gap-2">
                  <AlertCircle className={cn("w-4 h-4 shrink-0", w.active ? "text-yellow-500" : "text-muted-foreground/40")} />
                  <p className={cn("text-xs flex-1", !w.active && "text-muted-foreground/40 line-through")}>{w.warn}</p>
                  <Switch checked={w.active} onCheckedChange={v => setWarnings(ws => ws.map(x => x.id === w.id ? { ...x, active: v } : x))} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── WIDGET TAB ─────────────────────────────────────────────────────── */}
        <TabsContent value="widget" className="flex-1 overflow-auto p-4 md:p-6 pb-20 md:pb-6 space-y-4 mt-0">
          <SectionHeader title="Виджет бронирования" desc="Встройте виджет на сайт или используйте прямую ссылку." />
          <Card className="bg-card/30 border-border/50">
            <CardContent className="p-4 space-y-4">
              <div className="p-3 bg-indigo-500/8 border border-indigo-500/20 rounded-xl text-xs text-indigo-400">
                <p className="font-semibold mb-1">💡 Как настроить виджет?</p>
                <p className="text-indigo-400/80">Перейдите во вкладку «Страницы» → нажмите на страницу → настройте контент (заголовок, фото, видео) и скопируйте код виджета для этой страницы.</p>
              </div>
              {[
                { label: "Встроить iframe", key: "iframe", code: iframeCode },
                { label: "JavaScript виджет", key: "js", code: embedCode },
                { label: "Прямая ссылка", key: "link", code: bookingUrl },
              ].map(item => (
                <div key={item.key} className="space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
                  <div className="flex gap-2">
                    <code className="flex-1 text-[10px] bg-muted/40 border border-border/50 rounded-lg px-3 py-2 font-mono text-muted-foreground truncate">{item.code}</code>
                    <Button size="icon" variant="ghost" className="h-9 w-9 shrink-0" onClick={() => handleCopy(item.key, item.code)}>
                      {copied === item.key ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              ))}
              <Button className="w-full gap-2 text-sm" onClick={() => setShowWidget(true)}>
                <Eye className="w-4 h-4" />
                Открыть предпросмотр виджета
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── ANALYTICS TAB ─────────────────────────────────────────────────── */}
        <TabsContent value="analytics" className="flex-1 overflow-auto p-4 md:p-6 pb-20 md:pb-6 space-y-4 mt-0">
          <SectionHeader title="Аналитика виджета" desc="Просмотры, конверсия и популярные игры." />
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: "Просмотров / мес", value: "5 962", trend: "+18%", color: "text-blue-400" },
              { label: "Бронирований", value: "1 132", trend: "+31%", color: "text-green-400" },
              { label: "Конверсия", value: "19%", trend: "+2.4%", color: "text-indigo-400" },
            ].map(s => (
              <Card key={s.label} className="bg-card/30 border-border/50 p-4 text-center">
                <p className={cn("text-2xl font-black font-mono", s.color)}>{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                <p className="text-xs text-green-500 font-semibold mt-1">{s.trend}</p>
              </Card>
            ))}
          </div>
          <Card className="bg-card/30 border-border/50">
            <CardHeader className="pb-2 pt-4 px-4"><CardTitle className="text-sm">Страницы</CardTitle></CardHeader>
            <CardContent className="px-4 pb-4 space-y-2">
              {ANALYTICS_DATA.pages.map(p => (
                <div key={p.name} className="flex items-center gap-3 py-1.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{p.name}</p>
                    <div className="h-1.5 bg-muted/30 rounded-full mt-1 overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${p.conversion * 3}%` }} />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-semibold text-green-400">{p.conversion}%</p>
                    <p className="text-[10px] text-muted-foreground">{p.views.toLocaleString("ru")} просм.</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="bg-card/30 border-border/50">
            <CardHeader className="pb-2 pt-4 px-4"><CardTitle className="text-sm">Топ игр</CardTitle></CardHeader>
            <CardContent className="px-4 pb-4 space-y-2">
              {ANALYTICS_DATA.topGames.map(g => (
                <div key={g.name} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span>{g.name}</span>
                      <span className="text-muted-foreground">{g.bookings} броней</span>
                    </div>
                    <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
                      <div className="h-full bg-violet-500 rounded-full" style={{ width: `${g.pct}%` }} />
                    </div>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground w-8 text-right shrink-0">{g.pct}%</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── DIALOGS ──────────────────────────────────────────────────────────── */}

      {/* New page dialog */}
      <Dialog open={newPageOpen} onOpenChange={setNewPageOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Создать страницу бронирования</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Название страницы</Label>
              <Input className="h-9 text-sm" placeholder="Детский день рождения" value={newPageName} onChange={e => setNewPageName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Тип страницы</Label>
              <div className="grid grid-cols-2 gap-2">
                {PAGE_TYPES.map(pt => (
                  <button key={pt.id} onClick={() => setSelectedPageType(pt.id)} className={cn("text-left p-2.5 rounded-xl border transition-all", selectedPageType === pt.id ? "border-primary bg-primary/10" : "border-border/50 bg-muted/20 hover:bg-muted/40")}>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <pt.icon className={cn("w-3.5 h-3.5", selectedPageType === pt.id ? "text-primary" : "text-muted-foreground")} />
                      <p className={cn("text-xs font-semibold", selectedPageType === pt.id ? "text-primary" : "text-foreground")}>{pt.name}</p>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">{pt.desc}</p>
                  </button>
                ))}
              </div>
            </div>
            <Button className="w-full" disabled={!selectedPageType || !newPageName.trim()} onClick={handleCreatePage}>
              Создать страницу
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* New game dialog */}
      <Dialog open={newGameOpen} onOpenChange={setNewGameOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Добавить игру</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Название игры</Label>
              <Input className="h-9 text-sm" value={gameForm.name} onChange={e => setGameForm(f => ({ ...f, name: e.target.value }))} placeholder="Beat Saber" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Жанр</Label>
                <Select value={gameForm.genre} onValueChange={v => setGameForm(f => ({ ...f, genre: v }))}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>{GENRE_OPTIONS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Возраст</Label>
                <Select value={gameForm.age} onValueChange={v => setGameForm(f => ({ ...f, age: v }))}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>{AGE_OPTIONS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Игроки</Label>
                <Input className="h-9 text-sm" value={gameForm.players} onChange={e => setGameForm(f => ({ ...f, players: e.target.value }))} placeholder="1-4" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Длительность</Label>
                <Input className="h-9 text-sm" value={gameForm.duration} onChange={e => setGameForm(f => ({ ...f, duration: e.target.value }))} placeholder="30 мин" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Описание</Label>
              <Input className="h-9 text-sm" value={gameForm.desc} onChange={e => setGameForm(f => ({ ...f, desc: e.target.value }))} placeholder="Короткое описание..." />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm">Хоррор / 18+</Label>
              <Switch checked={gameForm.horror} onCheckedChange={v => setGameForm(f => ({ ...f, horror: v }))} />
            </div>
            <Button className="w-full" onClick={handleAddGame}>Добавить игру</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Package dialog */}
      <Dialog open={pkgOpen} onOpenChange={setPkgOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>{editingPkg ? "Редактировать пакет" : "Добавить пакет"}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Название</Label>
              <Input className="h-9 text-sm" value={pkgForm.name} onChange={e => setPkgForm(f => ({ ...f, name: e.target.value }))} placeholder="День рождения VIP" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Тип</Label>
                <Select value={pkgForm.type} onValueChange={v => setPkgForm(f => ({ ...f, type: v }))}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>{PKG_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Стоимость (₽)</Label>
                <Input className="h-9 text-sm" type="number" value={pkgForm.price} onChange={e => setPkgForm(f => ({ ...f, price: e.target.value }))} placeholder="15000" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Гости</Label>
                <Input className="h-9 text-sm" value={pkgForm.guests} onChange={e => setPkgForm(f => ({ ...f, guests: e.target.value }))} placeholder="до 8 чел" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Длительность</Label>
                <Input className="h-9 text-sm" value={pkgForm.duration} onChange={e => setPkgForm(f => ({ ...f, duration: e.target.value }))} placeholder="3 ч" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Зоны (через запятую)</Label>
              <Input className="h-9 text-sm" value={pkgForm.zones} onChange={e => setPkgForm(f => ({ ...f, zones: e.target.value }))} placeholder="Arena A, VR Solo" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Описание</Label>
              <Input className="h-9 text-sm" value={pkgForm.desc} onChange={e => setPkgForm(f => ({ ...f, desc: e.target.value }))} placeholder="Короткое описание пакета..." />
            </div>
            <Button className="w-full" onClick={handleSavePkg}>
              {editingPkg ? "Сохранить" : "Создать пакет"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Question dialog */}
      <Dialog open={questionOpen} onOpenChange={setQuestionOpen}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader><DialogTitle>Добавить вопрос</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Вопрос</Label>
              <Input className="h-9 text-sm" value={questionForm.q} onChange={e => setQuestionForm(f => ({ ...f, q: e.target.value }))} placeholder="Сколько человек будет?" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Тип ответа</Label>
              <Select value={questionForm.type} onValueChange={v => setQuestionForm(f => ({ ...f, type: v }))}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["number", "select", "date", "toggle", "text"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm">Обязательный</Label>
              <Switch checked={questionForm.required} onCheckedChange={v => setQuestionForm(f => ({ ...f, required: v }))} />
            </div>
            <Button className="w-full" onClick={() => {
              if (!questionForm.q.trim()) { toast.error("Введите текст вопроса"); return; }
              setQuestions(qs => [...qs, { id: `q_${Date.now()}`, ...questionForm, options: [] }]);
              setQuestionOpen(false);
              setQuestionForm({ q: "", type: "select", required: false });
              toast.success("Вопрос добавлен");
            }}>
              Добавить вопрос
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
