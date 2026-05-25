import { useState } from "react";
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
  X
} from "lucide-react";
import { toast } from "sonner";

// ─── DATA CONSTANTS ────────────────────────────────────────────────────────────

const DEFAULT_PAGES = [
  { id: "p1", name: "Главная страница бронирования", status: "published", views: 3241, conversion: 14.2, updated: "25.05.2026", type: "Универсальная" },
  { id: "p2", name: "Детский день рождения", status: "published", views: 1829, conversion: 21.5, updated: "24.05.2026", type: "День рождения" },
  { id: "p3", name: "Корпоратив VR", status: "draft", views: 0, conversion: 0, updated: "22.05.2026", type: "Корпоратив" },
  { id: "p4", name: "Horror Night Special", status: "published", views: 892, conversion: 31.1, updated: "20.05.2026", type: "Horror Night" },
];

const PAGE_TYPES = [
  { id: "universal", name: "Универсальная", icon: Globe, desc: "Подходит для любого посетителя" },
  { id: "birthday", name: "Детский день рождения", icon: Star, desc: "Яркий детский дизайн с пакетами" },
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

const PAGE_BLOCKS = [
  { id: "hero", name: "Hero Section", desc: "Видео/фото фон, заголовок, CTA", icon: Monitor },
  { id: "carousel", name: "Карусель фото", desc: "Галерея зон и геймплея", icon: Image },
  { id: "video", name: "Видео блок", desc: "Трейлер, промо, showcase", icon: Film },
  { id: "map", name: "Карта парка", desc: "Интерактивная схема зон", icon: Layers },
  { id: "zones", name: "Блок зон", desc: "Карточки всех зон", icon: Layout },
  { id: "games", name: "Блок игр", desc: "Карточки игр с фильтрами", icon: Gamepad2 },
  { id: "packages", name: "Блок пакетов", desc: "Карточки пакетов с ценами", icon: Package },
  { id: "reviews", name: "Блок отзывов", desc: "Отзывы реальных клиентов", icon: Star },
  { id: "faq", name: "FAQ", desc: "Вопросы и ответы", icon: BookOpen },
  { id: "cta", name: "CTA Block", desc: "Кнопка бронирования", icon: Zap },
];

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
  { id: "sc5", name: "Cyber Drift", icon: "🚗", desc: "Только гонки, адреналин", tags: ["14+", "Racing"], favorite: false },
  { id: "sc6", name: "VR Date", icon: "💜", desc: "Романтический VR-вечер для двоих", tags: ["Adults", "Couple"], favorite: false },
];

const DEFAULT_QUESTIONS = [
  { id: "q1", q: "Сколько человек?", type: "number", required: true },
  { id: "q2", q: "Возраст участников?", type: "select", options: ["Дети 7-12", "Подростки 13-17", "Взрослые 18+", "Смешанная группа"], required: true },
  { id: "q3", q: "Бюджет на группу?", type: "select", options: ["до 3 000 ₽", "3 000 — 10 000 ₽", "10 000 — 30 000 ₽", "без ограничений"], required: false },
  { id: "q4", q: "Дата визита?", type: "date", required: true },
  { id: "q5", q: "Страшное / не страшное?", type: "toggle", required: false },
  { id: "q6", q: "Опыт в VR?", type: "select", required: false },
];

const DEFAULT_WARNINGS = [
  { id: "w1", warn: "Для игры нужно минимум 4 игрока", active: true },
  { id: "w2", warn: "Зона недоступна в выбранное время", active: true },
  { id: "w3", warn: "Возраст 16+ — уточните наличие взрослых", active: true },
  { id: "w4", warn: "Группа слишком большая для зоны", active: false },
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
  abandoned: 38,
  topCombos: ["Arena A + Racing", "Arena A + Arena B", "Solo VR + Lounge"],
};

const GENRE_OPTIONS = ["Ритм", "Шутер", "Гонки", "Спорт", "Экшен", "Приключение", "Головоломка"];
const AGE_OPTIONS = ["7+", "12+", "14+", "16+", "18+"];
const PKG_TYPES = ["Birthday", "Corporate", "Tournament", "Full Park", "Custom"];
const QUESTION_TYPES = ["number", "select", "date", "toggle", "text"];

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

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function Registration() {
  const [showWidget, setShowWidget] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  // Persistent state
  const [pages, setPages] = useLocalStorage("vrpark_pages", DEFAULT_PAGES);
  const [zones, setZones] = useLocalStorage("vrpark_widget_zones", DEFAULT_ZONES);
  const [games, setGames] = useLocalStorage("vrpark_games", DEFAULT_GAMES);
  const [packages, setPackages] = useLocalStorage("vrpark_constructor_packages", DEFAULT_PACKAGES);
  const [scenarios, setScenarios] = useLocalStorage("vrpark_scenarios", DEFAULT_SCENARIOS);
  const [bookingModes, setBookingModes] = useLocalStorage("vrpark_booking_modes", { auto: true, manual: true, package: false });
  const [questions, setQuestions] = useLocalStorage("vrpark_auto_questions", DEFAULT_QUESTIONS);
  const [warnings, setWarnings] = useLocalStorage("vrpark_smart_warnings", DEFAULT_WARNINGS);

  // Pages modal state
  const [newPageOpen, setNewPageOpen] = useState(false);
  const [selectedPageType, setSelectedPageType] = useState<string | null>(null);
  const [newPageName, setNewPageName] = useState("");
  const [editingPage, setEditingPage] = useState<(typeof DEFAULT_PAGES)[0] | null>(null);

  // Games
  const [gameFilter, setGameFilter] = useState("all");
  const [newGameOpen, setNewGameOpen] = useState(false);
  const [gameForm, setGameForm] = useState({ name: "", genre: "Ритм", players: "1-4", duration: "30 мин", age: "7+", horror: false, desc: "" });

  // Packages
  const [pkgOpen, setPkgOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState<(typeof DEFAULT_PACKAGES)[0] | null>(null);
  const [pkgForm, setPkgForm] = useState({ name: "", type: "Birthday", price: "", guests: "до 8 чел", duration: "2 ч", games: "3", desc: "", zones: "" });

  // Scenarios
  const [newScenarioOpen, setNewScenarioOpen] = useState(false);
  const [scenarioForm, setScenarioForm] = useState({ name: "", icon: "🎮", desc: "", tags: "" });

  // Questions
  const [questionOpen, setQuestionOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<(typeof DEFAULT_QUESTIONS)[0] | null>(null);
  const [questionForm, setQuestionForm] = useState({ q: "", type: "select", required: false });

  // Zone inline edit state: track unsaved description/capacity/age per zone
  const [zoneEdits, setZoneEdits] = useState<Record<string, { description: string; capacity: number; ageLimit: number }>>({});

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(key);
    toast.success("Скопировано!");
    setTimeout(() => setCopied(null), 2000);
  };

  const toggleZone = (id: string) =>
    setZones((zs) => zs.map((z) => (z.id === id ? { ...z, enabled: !z.enabled } : z)));

  const getZoneEdit = (z: (typeof DEFAULT_ZONES)[0]) =>
    zoneEdits[z.id] ?? { description: z.description, capacity: z.capacity, ageLimit: z.ageLimit };

  const updateZoneEdit = (id: string, field: string, value: string | number) =>
    setZoneEdits((prev) => ({ ...prev, [id]: { ...getZoneEdit(zones.find((z) => z.id === id)!), [field]: value } }));

  const saveZone = (id: string) => {
    const edit = zoneEdits[id];
    if (!edit) return;
    setZones((zs) => zs.map((z) => (z.id === id ? { ...z, ...edit } : z)));
    setZoneEdits((prev) => { const n = { ...prev }; delete n[id]; return n; });
    toast.success("Зона сохранена");
  };

  const filteredGames = games.filter((g) => {
    if (gameFilter === "horror") return g.horror;
    if (gameFilter === "kids") return g.age === "7+";
    if (gameFilter === "racing") return g.genre === "Гонки";
    if (gameFilter === "multi") return g.players !== "1";
    return true;
  });

  // ── Pages handlers ──────────────────────────────────────────────────────────

  const handleCreatePage = () => {
    if (!selectedPageType || !newPageName.trim()) return;
    const today = new Date();
    const d = `${today.getDate().toString().padStart(2,"0")}.${(today.getMonth()+1).toString().padStart(2,"0")}.${today.getFullYear()}`;
    const newPage = {
      id: `p_${Date.now()}`,
      name: newPageName.trim(),
      status: "draft" as const,
      views: 0,
      conversion: 0,
      updated: d,
      type: PAGE_TYPE_NAMES[selectedPageType] ?? selectedPageType,
    };
    setPages((ps) => [...ps, newPage]);
    toast.success(`Страница "${newPageName}" создана`);
    setNewPageOpen(false);
    setNewPageName("");
    setSelectedPageType(null);
  };

  const handleDeletePage = (id: string) => {
    if (!confirm("Удалить страницу?")) return;
    setPages((ps) => ps.filter((p) => p.id !== id));
    toast.success("Страница удалена");
  };

  const handleTogglePublish = (id: string) => {
    setPages((ps) =>
      ps.map((p) =>
        p.id === id ? { ...p, status: p.status === "published" ? "draft" : "published" } : p
      )
    );
    toast.success("Статус страницы обновлён");
  };

  const handleSavePageName = () => {
    if (!editingPage || !editingPage.name.trim()) return;
    setPages((ps) => ps.map((p) => (p.id === editingPage.id ? { ...p, name: editingPage.name } : p)));
    setEditingPage(null);
    toast.success("Название сохранено");
  };

  // ── Games handlers ──────────────────────────────────────────────────────────

  const handleToggleGame = (id: string) =>
    setGames((gs) => gs.map((g) => (g.id === id ? { ...g, enabled: !g.enabled } : g)));

  const handleDeleteGame = (id: string) => {
    if (!confirm("Удалить игру?")) return;
    setGames((gs) => gs.filter((g) => g.id !== id));
    toast.success("Игра удалена");
  };

  const handleAddGame = () => {
    if (!gameForm.name.trim()) { toast.error("Введите название игры"); return; }
    const newGame = { id: `g_${Date.now()}`, ...gameForm, enabled: true };
    setGames((gs) => [...gs, newGame]);
    toast.success(`Игра "${gameForm.name}" добавлена`);
    setNewGameOpen(false);
    setGameForm({ name: "", genre: "Ритм", players: "1-4", duration: "30 мин", age: "7+", horror: false, desc: "" });
  };

  // ── Packages handlers ───────────────────────────────────────────────────────

  const openNewPkg = () => {
    setEditingPkg(null);
    setPkgForm({ name: "", type: "Birthday", price: "", guests: "до 8 чел", duration: "2 ч", games: "3", desc: "", zones: "" });
    setPkgOpen(true);
  };

  const openEditPkg = (pkg: (typeof DEFAULT_PACKAGES)[0]) => {
    setEditingPkg(pkg);
    setPkgForm({ name: pkg.name, type: pkg.type, price: pkg.price.toString(), guests: pkg.guests, duration: pkg.duration, games: pkg.games.toString(), desc: pkg.desc, zones: pkg.zones.join(", ") });
    setPkgOpen(true);
  };

  const handleSavePkg = () => {
    if (!pkgForm.name.trim()) { toast.error("Введите название пакета"); return; }
    if (editingPkg) {
      setPackages((ps) => ps.map((p) => p.id === editingPkg.id ? {
        ...p, name: pkgForm.name, type: pkgForm.type, price: Number(pkgForm.price) || 0,
        guests: pkgForm.guests, duration: pkgForm.duration, games: Number(pkgForm.games) || 0,
        desc: pkgForm.desc, zones: pkgForm.zones.split(",").map((s) => s.trim()).filter(Boolean),
      } : p));
      toast.success("Пакет обновлён");
    } else {
      setPackages((ps) => [...ps, {
        id: `pk_${Date.now()}`, name: pkgForm.name, type: pkgForm.type,
        price: Number(pkgForm.price) || 0, guests: pkgForm.guests, duration: pkgForm.duration,
        games: Number(pkgForm.games) || 0, desc: pkgForm.desc,
        zones: pkgForm.zones.split(",").map((s) => s.trim()).filter(Boolean), enabled: true,
      }]);
      toast.success(`Пакет "${pkgForm.name}" создан`);
    }
    setPkgOpen(false);
  };

  const handleDeletePkg = (id: string) => {
    if (!confirm("Удалить пакет?")) return;
    setPackages((ps) => ps.filter((p) => p.id !== id));
    toast.success("Пакет удалён");
  };

  const handleTogglePkg = (id: string) =>
    setPackages((ps) => ps.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p)));

  // ── Scenarios handlers ──────────────────────────────────────────────────────

  const handleToggleFavorite = (id: string) =>
    setScenarios((ss) => ss.map((s) => (s.id === id ? { ...s, favorite: !s.favorite } : s)));

  const handleAddScenario = () => {
    if (!scenarioForm.name.trim()) { toast.error("Введите название сценария"); return; }
    setScenarios((ss) => [...ss, {
      id: `sc_${Date.now()}`, name: scenarioForm.name, icon: scenarioForm.icon,
      desc: scenarioForm.desc, tags: scenarioForm.tags.split(",").map((t) => t.trim()).filter(Boolean), favorite: false,
    }]);
    toast.success(`Сценарий "${scenarioForm.name}" создан`);
    setNewScenarioOpen(false);
    setScenarioForm({ name: "", icon: "🎮", desc: "", tags: "" });
  };

  const handleDeleteScenario = (id: string) => {
    if (!confirm("Удалить сценарий?")) return;
    setScenarios((ss) => ss.filter((s) => s.id !== id));
    toast.success("Сценарий удалён");
  };

  // ── Questions handlers ──────────────────────────────────────────────────────

  const openNewQuestion = () => {
    setEditingQuestion(null);
    setQuestionForm({ q: "", type: "select", required: false });
    setQuestionOpen(true);
  };

  const openEditQuestion = (q: (typeof DEFAULT_QUESTIONS)[0]) => {
    setEditingQuestion(q);
    setQuestionForm({ q: q.q, type: q.type, required: q.required });
    setQuestionOpen(true);
  };

  const handleSaveQuestion = () => {
    if (!questionForm.q.trim()) { toast.error("Введите текст вопроса"); return; }
    if (editingQuestion) {
      setQuestions((qs) => qs.map((q) => q.id === editingQuestion.id ? { ...q, ...questionForm } : q));
      toast.success("Вопрос обновлён");
    } else {
      setQuestions((qs) => [...qs, { id: `q_${Date.now()}`, ...questionForm }]);
      toast.success("Вопрос добавлен");
    }
    setQuestionOpen(false);
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions((qs) => qs.filter((q) => q.id !== id));
    toast.success("Вопрос удалён");
  };

  const handleToggleWarning = (id: string) =>
    setWarnings((ws) => ws.map((w) => (w.id === id ? { ...w, active: !w.active } : w)));

  return (
    <div className="flex flex-col h-full">
      {showWidget && <WidgetPreview onClose={() => setShowWidget(false)} />}

      <header className="h-14 border-b border-border/50 flex items-center px-4 md:px-6 bg-card/50 backdrop-blur-sm shrink-0">
        <h1 className="text-lg font-bold font-mono">Конструктор VR-приключений</h1>
        <Badge className="ml-3 text-[10px] bg-primary/20 text-primary border-primary/30">Booking Builder</Badge>
        <Button
          size="sm"
          className="ml-auto h-8 gap-1.5 text-xs bg-primary/90 hover:bg-primary"
          onClick={() => setShowWidget(true)}
        >
          <Play className="w-3.5 h-3.5" />
          Протестировать виджет
        </Button>
      </header>

      <div className="flex-1 overflow-auto pb-20 md:pb-0">
        <Tabs defaultValue="pages" className="h-full flex flex-col">
          <div className="px-4 md:px-6 pt-4 shrink-0">
            <TabsList className="bg-muted/30 border border-border/50 h-9 w-full overflow-x-auto flex-nowrap justify-start gap-0.5">
              <TabsTrigger value="pages" className="text-xs shrink-0"><Layout className="w-3 h-3 mr-1" />Страницы</TabsTrigger>
              <TabsTrigger value="widgets" className="text-xs shrink-0"><Monitor className="w-3 h-3 mr-1" />Виджеты</TabsTrigger>
              <TabsTrigger value="zones" className="text-xs shrink-0"><Layers className="w-3 h-3 mr-1" />Зоны</TabsTrigger>
              <TabsTrigger value="games" className="text-xs shrink-0"><Gamepad2 className="w-3 h-3 mr-1" />Игры</TabsTrigger>
              <TabsTrigger value="packages" className="text-xs shrink-0"><Package className="w-3 h-3 mr-1" />Пакеты</TabsTrigger>
              <TabsTrigger value="scenarios" className="text-xs shrink-0"><Sparkles className="w-3 h-3 mr-1" />Сценарии</TabsTrigger>
              <TabsTrigger value="ux" className="text-xs shrink-0"><Settings2 className="w-3 h-3 mr-1" />Настройки UX</TabsTrigger>
              <TabsTrigger value="analytics" className="text-xs shrink-0"><BarChart2 className="w-3 h-3 mr-1" />Аналитика</TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-auto p-4 md:p-6 pt-4">

            {/* ── PAGES ── */}
            <TabsContent value="pages" className="space-y-4 mt-0">
              <SectionHeader
                title="Booking Landing Pages"
                desc="Создайте страницы бронирования в стиле Steam, Netflix или PS Store"
                action={
                  <Button size="sm" className="h-8 gap-1.5 text-xs shrink-0" onClick={() => setNewPageOpen(true)}>
                    <Plus className="w-3.5 h-3.5" /> Создать страницу
                  </Button>
                }
              />

              {newPageOpen && (
                <Card className="border-primary/30 bg-primary/5">
                  <CardContent className="p-4 space-y-3">
                    <p className="text-sm font-semibold">Выберите тип страницы</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                      {PAGE_TYPES.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setSelectedPageType(t.id)}
                          className={cn(
                            "p-3 rounded-xl border text-left transition-all",
                            selectedPageType === t.id ? "border-primary bg-primary/10" : "border-border/50 bg-card/20 hover:border-primary/40"
                          )}
                        >
                          <t.icon className={cn("w-4 h-4 mb-1.5", selectedPageType === t.id ? "text-primary" : "text-muted-foreground")} />
                          <p className="text-xs font-medium">{t.name}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{t.desc}</p>
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        className="h-8 text-sm flex-1"
                        placeholder="Название страницы..."
                        value={newPageName}
                        onChange={(e) => setNewPageName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleCreatePage()}
                      />
                      <Button size="sm" className="h-8 text-xs gap-1" disabled={!selectedPageType || !newPageName.trim()} onClick={handleCreatePage}>
                        Создать
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => { setNewPageOpen(false); setNewPageName(""); setSelectedPageType(null); }}>Отмена</Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid gap-2">
                {pages.map((page) => (
                  <Card key={page.id} className="bg-card/30 border-border/50 hover:border-primary/30 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          {editingPage?.id === page.id ? (
                            <div className="flex gap-2 mb-2">
                              <Input
                                className="h-7 text-sm flex-1"
                                value={editingPage.name}
                                onChange={(e) => setEditingPage((ep) => ep ? { ...ep, name: e.target.value } : ep)}
                                onKeyDown={(e) => e.key === "Enter" && handleSavePageName()}
                                autoFocus
                              />
                              <Button size="sm" className="h-7 text-xs" onClick={handleSavePageName}>Сохранить</Button>
                              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditingPage(null)}>Отмена</Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <p className="text-sm font-semibold">{page.name}</p>
                              <Badge
                                variant={page.status === "published" ? "default" : "outline"}
                                className={cn("text-[10px] cursor-pointer", page.status === "published" ? "bg-green-500/20 text-green-400 border-green-500/30" : "")}
                                onClick={() => handleTogglePublish(page.id)}
                              >
                                {page.status === "published" ? "Опубликована" : "Черновик"}
                              </Badge>
                              <Badge variant="outline" className="text-[10px]">{page.type}</Badge>
                            </div>
                          )}
                          <div className="flex gap-4 mt-1 text-[10px] text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{page.views.toLocaleString("ru")} просмотров</span>
                            <span className="flex items-center gap-1 text-green-400"><Target className="w-3 h-3" />{page.conversion}% конверсия</span>
                            <span>Обновлено {page.updated}</span>
                          </div>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1" onClick={() => setShowWidget(true)}>
                            <Eye className="w-3 h-3" /> Просмотр
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1" onClick={() => setEditingPage(page)}>
                            <Pencil className="w-3 h-3" /> Редактор
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive" onClick={() => handleDeletePage(page.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="bg-card/30 border-border/50">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm flex items-center gap-2"><Layout className="w-4 h-4 text-primary" /> Блоки визуального редактора</CardTitle>
                  <CardDescription className="text-xs">Drag-and-drop блоки для сборки страницы</CardDescription>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                    {PAGE_BLOCKS.map((block) => (
                      <div key={block.id} className="p-2.5 rounded-xl border border-border/50 bg-card/20 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-grab group">
                        <block.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary mb-1.5 transition-colors" />
                        <p className="text-xs font-medium">{block.name}</p>
                        <p className="text-[10px] text-muted-foreground">{block.desc}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── WIDGETS ── */}
            <TabsContent value="widgets" className="space-y-4 mt-0">
              <SectionHeader title="Embed Виджеты" desc="Встройте форму бронирования на любой сайт или в рекламу" />

              <div className="grid gap-3">
                {[
                  { key: "iframe", icon: Code2, label: "iframe-код", desc: "Полноценный виджет в iframe — идеально для сайта", code: iframeCode },
                  { key: "embed", icon: Code2, label: "JavaScript виджет", desc: "Лёгкий скрипт — загружает виджет автоматически", code: embedCode },
                  { key: "link", icon: Link2, label: "Прямая ссылка", desc: "Отдельная booking-страница — для соцсетей и рекламы", code: bookingUrl },
                ].map((item) => (
                  <Card key={item.key} className="bg-card/30 border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <item.icon className="w-3.5 h-3.5 text-primary" />
                            <span className="text-sm font-semibold">{item.label}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                        <div className="flex gap-1.5">
                          <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1 shrink-0" onClick={() => handleCopy(item.key, item.code)}>
                            {copied === item.key ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                            {copied === item.key ? "Скопировано" : "Копировать"}
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground" onClick={() => toast.info("Открытие в новой вкладке...")}>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                      <div className="bg-muted/20 rounded-lg p-3 border border-border/50">
                        <code className="text-[10px] font-mono text-muted-foreground break-all leading-relaxed">{item.code}</code>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="bg-card/30 border-border/50">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl bg-white flex items-center justify-center shrink-0">
                    <div className="grid grid-cols-3 gap-0.5">
                      {Array.from({ length: 9 }).map((_, i) => (
                        <div key={i} className={cn("w-5 h-5 bg-black/80 rounded-sm", [0,2,4,6,8].includes(i) && "bg-black", [1,3,5,7].includes(i) && "bg-transparent")} />
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">QR-код для бронирования</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Разместите на стойке ресепшена, флаерах или баннерах</p>
                    <Button size="sm" className="mt-2 h-7 text-xs gap-1" onClick={() => toast.success("QR-код скачан")}>Скачать QR-код</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── ZONES ── */}
            <TabsContent value="zones" className="space-y-3 mt-0">
              <SectionHeader title="Настройка зон" desc="Управляйте отображением зон в виджете и на страницах" />
              {zones.map((zone) => {
                const edit = getZoneEdit(zone);
                const hasEdits = zoneEdits[zone.id] !== undefined;
                return (
                  <Card key={zone.id} className={cn("border-border/50 transition-opacity", !zone.enabled && "opacity-60")}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: zone.color }} />
                          <div>
                            <p className="text-sm font-semibold">{zone.name}</p>
                            <p className="text-xs text-muted-foreground">{zone.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant={zone.enabled ? "default" : "outline"} className={cn("text-[10px]", zone.enabled ? "bg-green-500/20 text-green-400 border-green-500/30" : "")}>
                            {zone.enabled ? "Активна" : "Скрыта"}
                          </Badge>
                          <Switch checked={zone.enabled} onCheckedChange={() => toggleZone(zone.id)} />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="space-y-1">
                          <Label className="text-[10px]">Описание</Label>
                          <Input
                            className="h-7 text-xs"
                            value={edit.description}
                            onChange={(e) => updateZoneEdit(zone.id, "description", e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] flex items-center gap-1"><Users className="w-2.5 h-2.5" />Мест</Label>
                          <Input
                            className="h-7 text-xs"
                            type="number"
                            value={edit.capacity}
                            onChange={(e) => updateZoneEdit(zone.id, "capacity", Number(e.target.value))}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] flex items-center gap-1"><AlertCircle className="w-2.5 h-2.5" />Возраст</Label>
                          <Input
                            className="h-7 text-xs"
                            type="number"
                            value={edit.ageLimit}
                            onChange={(e) => updateZoneEdit(zone.id, "ageLimit", Number(e.target.value))}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {hasEdits && (
                          <Button variant="default" size="sm" className="h-7 text-[10px] gap-1" onClick={() => saveZone(zone.id)}>
                            <CheckCircle2 className="w-3 h-3" />Сохранить
                          </Button>
                        )}
                        <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1"><Image className="w-3 h-3" />Фото</Button>
                        <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1"><Film className="w-3 h-3" />Видео</Button>
                        <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1"><Star className="w-3 h-3" />Обложка</Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>

            {/* ── GAMES ── */}
            <TabsContent value="games" className="space-y-4 mt-0">
              <SectionHeader
                title="Библиотека игр"
                desc="Управляйте играми, отображаемыми в виджете"
                action={
                  <Button size="sm" className="h-8 gap-1.5 text-xs shrink-0" onClick={() => setNewGameOpen(true)}>
                    <Plus className="w-3.5 h-3.5" /> Добавить игру
                  </Button>
                }
              />

              <div className="flex gap-2 flex-wrap">
                {[
                  { id: "all", label: "Все" },
                  { id: "horror", label: "🎃 Horror" },
                  { id: "kids", label: "👶 Детские" },
                  { id: "racing", label: "🚗 Гонки" },
                  { id: "multi", label: "👥 Мультиплеер" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setGameFilter(f.id)}
                    className={cn("text-xs px-3 py-1.5 rounded-full border transition-colors", gameFilter === f.id ? "bg-primary text-primary-foreground border-primary" : "border-border/50 text-muted-foreground hover:bg-muted/30")}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="grid gap-3">
                {filteredGames.map((game) => (
                  <Card key={game.id} className={cn("bg-card/30 border-border/50 transition-opacity", !game.enabled && "opacity-60")}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                          <Gamepad2 className="w-5 h-5 text-primary/60" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold">{game.name}</p>
                            <Badge variant="outline" className="text-[10px]">{game.genre}</Badge>
                            {game.horror && <Badge variant="outline" className="text-[10px] text-orange-400 border-orange-500/30">Horror</Badge>}
                            <Badge variant="outline" className="text-[10px]">{game.age}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{game.desc}</p>
                          <div className="flex gap-3 mt-1 text-[10px] text-muted-foreground">
                            <span className="flex items-center gap-0.5"><Users className="w-2.5 h-2.5" />{game.players}</span>
                            <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" />{game.duration}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Switch checked={game.enabled} onCheckedChange={() => handleToggleGame(game.id)} />
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteGame(game.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* ── PACKAGES ── */}
            <TabsContent value="packages" className="space-y-4 mt-0">
              <SectionHeader
                title="Пакеты мероприятий"
                desc="Birthday, Corporate, Tournament и другие готовые предложения"
                action={
                  <Button size="sm" className="h-8 gap-1.5 text-xs shrink-0" onClick={openNewPkg}>
                    <Plus className="w-3.5 h-3.5" /> Новый пакет
                  </Button>
                }
              />
              <div className="grid gap-3 sm:grid-cols-2">
                {packages.map((pkg) => (
                  <Card key={pkg.id} className={cn("bg-card/30 border-border/50 hover:border-primary/30 transition-colors", !pkg.enabled && "opacity-60")}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <p className="text-sm font-semibold">{pkg.name}</p>
                          <Badge variant="outline" className="text-[10px] mt-1">{pkg.type}</Badge>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <p className="text-lg font-bold text-primary">{pkg.price.toLocaleString("ru")} ₽</p>
                          <Switch checked={pkg.enabled} onCheckedChange={() => handleTogglePkg(pkg.id)} />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{pkg.desc}</p>
                      <div className="flex gap-3 text-[10px] text-muted-foreground mb-3">
                        <span className="flex items-center gap-0.5"><Users className="w-3 h-3" />{pkg.guests}</span>
                        <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{pkg.duration}</span>
                        <span className="flex items-center gap-0.5"><Gamepad2 className="w-3 h-3" />{pkg.games} игр</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {pkg.zones.map((z) => (
                          <Badge key={z} variant="outline" className="text-[10px]">{z}</Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1 h-7 text-[10px]" onClick={() => openEditPkg(pkg)}>
                          <Pencil className="w-3 h-3 mr-1" />Редактировать
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive" onClick={() => handleDeletePkg(pkg.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* ── SCENARIOS ── */}
            <TabsContent value="scenarios" className="space-y-4 mt-0">
              <SectionHeader
                title="Готовые сценарии"
                desc="Готовые VR-приключения для разных аудиторий — Horror Night, Kids Party и другие"
                action={
                  <Button size="sm" className="h-8 gap-1.5 text-xs shrink-0" onClick={() => setNewScenarioOpen(true)}>
                    <Plus className="w-3.5 h-3.5" /> Создать сценарий
                  </Button>
                }
              />
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {scenarios.map((sc) => (
                  <Card key={sc.id} className="bg-card/30 border-border/50 hover:border-primary/30 transition-all hover:scale-[1.01]">
                    <CardContent className="p-4">
                      <div className="text-3xl mb-2">{sc.icon}</div>
                      <p className="text-sm font-semibold mb-1">{sc.name}</p>
                      <p className="text-xs text-muted-foreground mb-3">{sc.desc}</p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {sc.tags.map((t) => (
                          <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1 h-7 text-[10px]" onClick={() => setShowWidget(true)}>
                          <Eye className="w-3 h-3 mr-1" />Просмотр
                        </Button>
                        <Button
                          size="sm"
                          variant={sc.favorite ? "default" : "outline"}
                          className={cn("h-7 text-[10px] gap-1", sc.favorite && "bg-pink-500/20 text-pink-400 border-pink-500/30 hover:bg-pink-500/30")}
                          onClick={() => handleToggleFavorite(sc.id)}
                        >
                          <Heart className={cn("w-3 h-3", sc.favorite && "fill-pink-400")} />
                        </Button>
                        <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1" onClick={() => { toast.success(`Сценарий "${sc.name}" применён`); }}>
                          <Share2 className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteScenario(sc.id)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="bg-card/30 border-border/50">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm flex items-center gap-2"><Users className="w-4 h-4 text-primary" />Авто-ротация команд</CardTitle>
                  <CardDescription className="text-xs">Для больших групп CRM автоматически строит ротацию между зонами</CardDescription>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="space-y-2 text-xs">
                    {[
                      { time: "14:00", teamA: "Arena A", teamB: "Racing Zone" },
                      { time: "15:00", teamA: "Racing Zone", teamB: "Arena A" },
                      { time: "16:00", teamA: "Arena B", teamB: "VR Solo" },
                    ].map((row, i) => (
                      <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-muted/20 border border-border/50">
                        <span className="font-mono text-muted-foreground w-12 shrink-0">{row.time}</span>
                        <span className="text-blue-400 flex-1">Team A → {row.teamA}</span>
                        <span className="text-purple-400 flex-1">Team B → {row.teamB}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── UX SETTINGS ── */}
            <TabsContent value="ux" className="space-y-4 mt-0">
              <SectionHeader title="Настройки UX" desc="Управляйте режимами бронирования и поведением виджета" />

              <Card className="bg-card/30 border-border/50">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm">Режимы бронирования</CardTitle>
                  <CardDescription className="text-xs">Включите нужные режимы — можно все сразу или только один</CardDescription>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-3">
                  {[
                    { key: "auto", icon: Wand2, label: "Подобрать автоматически", desc: "CRM задаёт вопросы и предлагает оптимальный вариант", color: "text-purple-400" },
                    { key: "manual", icon: Hand, label: "Собрать вручную", desc: "Клиент выбирает зоны и игры шаг за шагом — как в Steam", color: "text-blue-400" },
                    { key: "package", icon: Package, label: "Выбрать пакет", desc: "Готовые тематические пакеты — Birthday, Corporate, Tournament", color: "text-green-400" },
                  ].map((mode) => (
                    <div key={mode.key} className={cn("flex items-start gap-3 p-3 rounded-xl border transition-all", bookingModes[mode.key as keyof typeof bookingModes] ? "border-primary/30 bg-primary/5" : "border-border/50 bg-card/20")}>
                      <mode.icon className={cn("w-5 h-5 mt-0.5 shrink-0", mode.color)} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{mode.label}</p>
                        <p className="text-xs text-muted-foreground">{mode.desc}</p>
                      </div>
                      <Switch
                        checked={bookingModes[mode.key as keyof typeof bookingModes]}
                        onCheckedChange={(v) => setBookingModes((m) => ({ ...m, [mode.key]: v }))}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-card/30 border-border/50">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm flex items-center gap-2"><Wand2 className="w-4 h-4 text-primary" />Вопросы авто-подбора</CardTitle>
                  <CardDescription className="text-xs">Настройте опрос, по которому CRM подберёт подходящий вариант</CardDescription>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-2">
                  {questions.map((q, i) => (
                    <div key={q.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-border/50 bg-card/20">
                      <span className="w-5 h-5 rounded-full bg-primary/15 text-primary text-[10px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                      <p className="text-sm flex-1">{q.q}</p>
                      <Badge variant="outline" className="text-[10px] shrink-0">{q.type}</Badge>
                      {q.required && <Badge className="text-[10px] bg-red-500/15 text-red-400 border-red-500/30 shrink-0">Обяз.</Badge>}
                      <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => openEditQuestion(q)}><Pencil className="w-3 h-3" /></Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteQuestion(q.id)}><X className="w-3 h-3" /></Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="w-full h-8 text-xs gap-1.5 mt-2" onClick={openNewQuestion}>
                    <Plus className="w-3.5 h-3.5" /> Добавить вопрос
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-card/30 border-border/50">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4 text-primary" />Smart Warnings</CardTitle>
                  <CardDescription className="text-xs">CRM автоматически предупреждает клиента</CardDescription>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-2">
                  {warnings.map((w) => (
                    <div key={w.id} className="flex items-center gap-2 p-2.5 rounded-lg border border-border/50 bg-card/20">
                      <AlertCircle className={cn("w-3.5 h-3.5 shrink-0", w.active ? "text-yellow-400" : "text-muted-foreground/30")} />
                      <p className={cn("text-xs flex-1", w.active ? "" : "text-muted-foreground/50")}>{w.warn}</p>
                      <Switch checked={w.active} onCheckedChange={() => handleToggleWarning(w.id)} />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── ANALYTICS ── */}
            <TabsContent value="analytics" className="space-y-4 mt-0">
              <SectionHeader title="Аналитика конструктора" desc="Конверсия страниц, популярные игры и брошенные брони" />

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Всего бронирований", value: "1 132", trend: "+18%", icon: Calendar, color: "bg-indigo-500/15 text-indigo-400" },
                  { label: "Средняя конверсия", value: "18.6%", trend: "+3.2%", icon: Target, color: "bg-green-500/15 text-green-400" },
                  { label: "Брошенных броней", value: `${ANALYTICS_DATA.abandoned}%`, trend: "-5%", icon: TrendingUp, color: "bg-red-500/15 text-red-400" },
                  { label: "Популярных комбо", value: "3", trend: "", icon: Sparkles, color: "bg-purple-500/15 text-purple-400" },
                ].map((stat) => (
                  <Card key={stat.label} className="bg-card/30 border-border/50">
                    <CardContent className="p-4">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-2", stat.color)}>
                        <stat.icon className="w-4 h-4" />
                      </div>
                      <p className="text-xl font-bold">{stat.value}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{stat.label}</p>
                      {stat.trend && <p className={cn("text-[10px] font-semibold mt-1", stat.trend.startsWith("+") ? "text-green-400" : "text-red-400")}>{stat.trend}</p>}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="bg-card/30 border-border/50">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="w-4 h-4 text-primary" />Конверсия по страницам</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-3">
                  {ANALYTICS_DATA.pages.map((p) => (
                    <div key={p.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium truncate mr-2">{p.name}</span>
                        <div className="flex items-center gap-3 shrink-0 text-[10px] text-muted-foreground">
                          <span>{p.views.toLocaleString("ru")} просм.</span>
                          <span className="text-green-400 font-semibold">{p.conversion}%</span>
                          <span className={cn("flex items-center gap-0.5 font-semibold", p.trend > 0 ? "text-green-400" : "text-red-400")}>
                            <ArrowUpRight className="w-3 h-3" />{p.trend > 0 ? "+" : ""}{p.trend}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full h-1.5 bg-muted/30 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${p.conversion * 3}%` }} />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="grid gap-3 sm:grid-cols-2">
                <Card className="bg-card/30 border-border/50">
                  <CardHeader className="pb-2 pt-4 px-4">
                    <CardTitle className="text-sm flex items-center gap-2"><Gamepad2 className="w-4 h-4 text-primary" />Топ игры</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 space-y-2">
                    {ANALYTICS_DATA.topGames.map((g, i) => (
                      <div key={g.name} className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded-full bg-primary/15 text-primary text-[10px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                        <span className="text-xs flex-1">{g.name}</span>
                        <span className="text-xs text-muted-foreground">{g.bookings} бр.</span>
                        <div className="w-12 h-1.5 bg-muted/30 rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${g.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="bg-card/30 border-border/50">
                  <CardHeader className="pb-2 pt-4 px-4">
                    <CardTitle className="text-sm flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" />Топ комбо-брони</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 space-y-2">
                    {ANALYTICS_DATA.topCombos.map((combo, i) => (
                      <div key={combo} className="flex items-center gap-2 p-2 rounded-lg bg-muted/20 border border-border/50">
                        <span className="w-5 h-5 rounded-full bg-primary/15 text-primary text-[10px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                        <span className="text-xs">{combo}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* ── MODALS ── */}

      {/* Package create/edit modal */}
      <Dialog open={pkgOpen} onOpenChange={setPkgOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingPkg ? "Редактировать пакет" : "Новый пакет"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Название</Label>
                <Input className="h-8 text-sm" placeholder="День рождения VIP" value={pkgForm.name} onChange={(e) => setPkgForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Тип</Label>
                <Select value={pkgForm.type} onValueChange={(v) => setPkgForm((f) => ({ ...f, type: v }))}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{PKG_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Цена (₽)</Label>
                <Input className="h-8 text-sm" type="number" placeholder="15000" value={pkgForm.price} onChange={(e) => setPkgForm((f) => ({ ...f, price: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Гостей</Label>
                <Input className="h-8 text-sm" placeholder="до 8 чел" value={pkgForm.guests} onChange={(e) => setPkgForm((f) => ({ ...f, guests: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Длительность</Label>
                <Input className="h-8 text-sm" placeholder="3 ч" value={pkgForm.duration} onChange={(e) => setPkgForm((f) => ({ ...f, duration: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Игр в пакете</Label>
                <Input className="h-8 text-sm" type="number" placeholder="3" value={pkgForm.games} onChange={(e) => setPkgForm((f) => ({ ...f, games: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Зоны (через запятую)</Label>
                <Input className="h-8 text-sm" placeholder="Arena A, VR Solo" value={pkgForm.zones} onChange={(e) => setPkgForm((f) => ({ ...f, zones: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Описание</Label>
              <Input className="h-8 text-sm" placeholder="Всё включено для незабываемого праздника" value={pkgForm.desc} onChange={(e) => setPkgForm((f) => ({ ...f, desc: e.target.value }))} />
            </div>
            <Button onClick={handleSavePkg}>{editingPkg ? "Сохранить" : "Создать пакет"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Game create modal */}
      <Dialog open={newGameOpen} onOpenChange={setNewGameOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Новая игра</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Название</Label>
              <Input className="h-8 text-sm" placeholder="Beat Saber" value={gameForm.name} onChange={(e) => setGameForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Жанр</Label>
                <Select value={gameForm.genre} onValueChange={(v) => setGameForm((f) => ({ ...f, genre: v }))}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{GENRE_OPTIONS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Возраст</Label>
                <Select value={gameForm.age} onValueChange={(v) => setGameForm((f) => ({ ...f, age: v }))}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{AGE_OPTIONS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Игроки</Label>
                <Input className="h-8 text-sm" placeholder="1-4" value={gameForm.players} onChange={(e) => setGameForm((f) => ({ ...f, players: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Длительность</Label>
                <Input className="h-8 text-sm" placeholder="30 мин" value={gameForm.duration} onChange={(e) => setGameForm((f) => ({ ...f, duration: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Описание</Label>
              <Input className="h-8 text-sm" placeholder="Краткое описание игры" value={gameForm.desc} onChange={(e) => setGameForm((f) => ({ ...f, desc: e.target.value }))} />
            </div>
            <div className="flex items-center gap-3 py-1">
              <Switch checked={gameForm.horror} onCheckedChange={(v) => setGameForm((f) => ({ ...f, horror: v }))} />
              <Label className="text-sm">Horror-игра (18+)</Label>
            </div>
            <Button onClick={handleAddGame}>Добавить игру</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Scenario create modal */}
      <Dialog open={newScenarioOpen} onOpenChange={setNewScenarioOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Новый сценарий</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid grid-cols-4 gap-1 mb-1">
              {["🎮","👻","🎉","🏆","🌿","🚗","💜","⚡","🎯","🌟"].map((em) => (
                <button key={em} onClick={() => setScenarioForm((f) => ({ ...f, icon: em }))} className={cn("p-2 rounded-lg text-xl text-center border transition-all", scenarioForm.icon === em ? "border-primary bg-primary/10" : "border-border/50 hover:bg-muted/30")}>
                  {em}
                </button>
              ))}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Название</Label>
              <Input className="h-8 text-sm" placeholder="Horror Night" value={scenarioForm.name} onChange={(e) => setScenarioForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Описание</Label>
              <Input className="h-8 text-sm" placeholder="Краткое описание сценария" value={scenarioForm.desc} onChange={(e) => setScenarioForm((f) => ({ ...f, desc: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Теги (через запятую)</Label>
              <Input className="h-8 text-sm" placeholder="16+, Horror, Adults" value={scenarioForm.tags} onChange={(e) => setScenarioForm((f) => ({ ...f, tags: e.target.value }))} />
            </div>
            <Button onClick={handleAddScenario}>Создать сценарий</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Question create/edit modal */}
      <Dialog open={questionOpen} onOpenChange={setQuestionOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{editingQuestion ? "Редактировать вопрос" : "Новый вопрос"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Текст вопроса</Label>
              <Input className="h-8 text-sm" placeholder="Сколько человек?" value={questionForm.q} onChange={(e) => setQuestionForm((f) => ({ ...f, q: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Тип ответа</Label>
              <Select value={questionForm.type} onValueChange={(v) => setQuestionForm((f) => ({ ...f, type: v }))}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{QUESTION_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={questionForm.required} onCheckedChange={(v) => setQuestionForm((f) => ({ ...f, required: v }))} />
              <Label className="text-sm">Обязательный вопрос</Label>
            </div>
            <Button onClick={handleSaveQuestion}>{editingQuestion ? "Сохранить" : "Добавить вопрос"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
