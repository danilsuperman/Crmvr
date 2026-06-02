import { useState } from "react";
import { BookOpen, Plus, Edit2, Trash2, Lock, Unlock, CheckCircle2, Circle, Search, GraduationCap, Shield, Gamepad2, ShoppingCart, Users2, Video, Type, MoveUp, MoveDown, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocalStorage } from "@/lib/store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

export type ContentBlock = {
  id: string;
  type: "text" | "video";
  content: string;
};

export type Article = {
  id: number;
  title: string;
  content: string;
  blocks: ContentBlock[];
  category: string;
  difficulty: "easy" | "medium" | "hard";
  readTime: number;
  required: boolean;
};

export type ReadState = Record<number, boolean>;

export const CATEGORIES = [
  { id: "onboarding", label: "Новый сотрудник", icon: GraduationCap, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  { id: "games", label: "Игры и оборудование", icon: Gamepad2, color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  { id: "sales", label: "Продажи и сервис", icon: ShoppingCart, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  { id: "safety", label: "Безопасность", icon: Shield, color: "text-red-400 bg-red-500/10 border-red-500/20" },
  { id: "hr", label: "Команда и HR", icon: Users2, color: "text-violet-400 bg-violet-500/10 border-violet-500/20" },
];

export const DEFAULT_ARTICLES: Article[] = [
  { id: 1, title: "Добро пожаловать в VR Park!", content: "", category: "onboarding", difficulty: "easy", readTime: 5, required: true, blocks: [{ id: "b1", type: "text", content: "Это ваш первый день. Познакомьтесь с командой, получите форму и пройдите инструктаж по безопасности. В этом документе вы найдёте всё необходимое для начала работы: распорядок дня, контакты коллег и первые шаги." }] },
  { id: 2, title: "Как открыть и закрыть парк", content: "", category: "onboarding", difficulty: "easy", readTime: 7, required: true, blocks: [{ id: "b1", type: "text", content: "Процедура открытия:\n1) Проверить все устройства на наличие зарядки.\n2) Запустить управляющее ПО.\n3) Проверить чистоту зон.\n4) Включить освещение и музыку.\n5) Принять кассу.\n\nЗакрытие: обратная последовательность + оформление кассового отчёта." }] },
  { id: 3, title: "Структура компании и контакты", content: "", category: "onboarding", difficulty: "easy", readTime: 3, required: true, blocks: [{ id: "b1", type: "text", content: "Руководитель: Дмитрий Козлов (admin@vrpark.co)\nСтарший администратор: Анна Смирнова\nТехник: Михаил Петров\n\nГрафик работы: 10:00 – 22:00 ежедневно. Смены по 10 часов." }] },
  { id: 4, title: "Гарнитуры Meta Quest 3 — полное руководство", content: "", category: "games", difficulty: "medium", readTime: 12, required: true, blocks: [
    { id: "b1", type: "text", content: "Meta Quest 3 — основное устройство парка. Зарядка занимает 2–2.5 часа, полный заряд держит 3 часа непрерывной игры." },
    { id: "b2", type: "video", content: "https://www.youtube.com/watch?v=tOI5e3OBk4o" },
    { id: "b3", type: "text", content: "Настройка для клиента:\n1. Надеть гарнитуру\n2. Настроить IPD (расстояние между линзами)\n3. Провести граничные линии безопасного пространства\n4. Запустить нужное приложение\n\nЧастые проблемы: перегрев — отключить на 10 мин, расплывчатая картинка — откалибровать IPD." },
  ]},
  { id: 5, title: "Топ-10 игр в нашем парке", content: "", category: "games", difficulty: "easy", readTime: 6, required: false, blocks: [{ id: "b1", type: "text", content: "1. Beat Saber — самая популярная, подходит всем возрастам\n2. Superhot VR — для продвинутых\n3. Resident Evil 4 VR — только 18+\n4. Star Wars: Squadrons\n5. Walkabout Mini Golf\n6. Moss — семейная\n7. Until You Fall\n8. Pistol Whip\n9. The Room VR\n10. Lone Echo 2" }] },
  { id: 6, title: "Уход за оборудованием", content: "", category: "games", difficulty: "medium", readTime: 8, required: true, blocks: [{ id: "b1", type: "text", content: "Ежедневно:\n• Протирать линзы специальной салфеткой\n• Дезинфицировать накладки для лица\n• Заряжать контроллеры\n\nЕженедельно:\n• Глубокая чистка ремней\n• Проверка кабелей и зарядных устройств\n• Обновление прошивки\n\nЗапрещено: использовать спирт на линзах, оставлять устройства без заряда." }] },
  { id: 7, title: "Техника продаж — от брони до допродажи", content: "", category: "sales", difficulty: "medium", readTime: 10, required: true, blocks: [{ id: "b1", type: "text", content: "Основной скрипт встречи клиента:\n1. Тёплое приветствие: «Добро пожаловать в VR Park!»\n2. Уточнить опыт: «Вы уже пробовали VR?»\n3. Подобрать игру по интересам\n4. Предложить апгрейд: «Хотите попробовать VIP-сеанс на 90 минут?»\n\nДопродажи: фото на память, сувениры, следующее бронирование со скидкой 10%." }] },
  { id: 8, title: "Работа с конфликтными клиентами", content: "", category: "sales", difficulty: "hard", readTime: 8, required: false, blocks: [{ id: "b1", type: "text", content: "Правило LAST:\nL — Listen (Слушать без перебиваний)\nA — Apologize (Извиниться за неудобства)\nS — Solve (Предложить решение)\nT — Thank (Поблагодарить за обратную связь)\n\nЕсли клиент требует компенсацию — предложить бесплатный сеанс до 30 минут. Если ситуация выходит из-под контроля — привлечь руководителя." }] },
  { id: 9, title: "Правила безопасности в VR-зонах", content: "", category: "safety", difficulty: "easy", readTime: 5, required: true, blocks: [{ id: "b1", type: "text", content: "Обязательные правила:\n1. Всегда объяснять клиенту границы безопасного пространства\n2. Не оставлять детей до 10 лет без присмотра\n3. Предупреждать об эпилепсии: VR нельзя людям с фотосенситивной эпилепсией\n4. Снимать очки, кольца и острые предметы перед сеансом\n5. При плохом самочувствии — немедленно снять гарнитуру\n\nПожарный выход: левая дверь от зоны Arena A." }] },
  { id: 10, title: "Первая помощь при VR-дискомфорте", content: "", category: "safety", difficulty: "medium", readTime: 6, required: true, blocks: [{ id: "b1", type: "text", content: "Симптомы VR-укачивания: тошнота, головокружение, потливость.\n\nДействия:\n1. Аккуратно снять гарнитуру\n2. Посадить клиента, дать воды\n3. Направить взгляд на статичный объект\n4. Свежий воздух — проветрить помещение\n5. Если симптомы не проходят 10 минут — вызвать скорую\n\nПрофилактика: рекомендовать новичкам начинать с 15–20 минут." }] },
  { id: 11, title: "Корпоративная культура и ценности", content: "", category: "hr", difficulty: "easy", readTime: 4, required: false, blocks: [{ id: "b1", type: "text", content: "Наши ценности:\n🎮 Инновации — мы внедряем лучшие технологии\n❤️ Забота — каждый клиент уходит с улыбкой\n🤝 Команда — мы поддерживаем друг друга\n🏆 Результат — нас интересует качество, не количество\n\nДресс-код: фирменная футболка, тёмные брюки/джинсы, закрытая обувь." }] },
  { id: 12, title: "Оценка работы и бонусы", content: "", category: "hr", difficulty: "easy", readTime: 5, required: false, blocks: [{ id: "b1", type: "text", content: "KPI администратора:\n• NPS (оценка клиентов) — цель 9+\n• Допродажи — цель 20% от сеансов\n• Пунктуальность — 0 опозданий\n\nБонусы:\n• За месяц без нарушений — +5 000 ₽\n• За каждые 10 допродаж — +500 ₽\n• Лучший сотрудник месяца — +3 000 ₽ и диплом" }] },
];

const DIFF_LABEL: Record<Article["difficulty"], { label: string; cls: string }> = {
  easy: { label: "Легко", cls: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  medium: { label: "Средне", cls: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  hard: { label: "Сложно", cls: "text-red-400 bg-red-500/10 border-red-500/20" },
};

type ArticleForm = {
  title: string;
  category: string;
  difficulty: Article["difficulty"];
  readTime: number;
  required: boolean;
  blocks: ContentBlock[];
};

const EMPTY_FORM: ArticleForm = {
  title: "",
  category: "onboarding",
  difficulty: "easy",
  readTime: 5,
  required: false,
  blocks: [{ id: "b_init", type: "text", content: "" }],
};

function mkId() { return "b_" + Math.random().toString(36).slice(2, 9); }

export default function Knowledge() {
  const [articles, setArticles] = useLocalStorage<Article[]>("vrpark_knowledge_articles", DEFAULT_ARTICLES);
  const [readState, setReadState] = useLocalStorage<ReadState>("vrpark_knowledge_read", {});
  const [adminMode, setAdminMode] = useLocalStorage("vrpark_knowledge_admin", true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ArticleForm>(EMPTY_FORM);

  const totalRequired = articles.filter(a => a.required).length;
  const readRequired = articles.filter(a => a.required && readState[a.id]).length;
  const totalRead = Object.values(readState).filter(Boolean).length;
  const progress = totalRequired > 0 ? Math.round((readRequired / totalRequired) * 100) : 0;

  const filtered = articles.filter(a =>
    !search || a.title.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (a: Article) => {
    setEditingId(a.id);
    setForm({
      title: a.title,
      category: a.category,
      difficulty: a.difficulty,
      readTime: a.readTime,
      required: a.required,
      blocks: a.blocks?.length ? a.blocks : [{ id: "b_init", type: "text", content: a.content || "" }],
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) { toast.error("Введите название"); return; }
    const cleanBlocks = form.blocks.filter(b => b.content.trim());
    if (editingId !== null) {
      setArticles(arr => arr.map(a => a.id === editingId ? { ...a, title: form.title, category: form.category, difficulty: form.difficulty, readTime: form.readTime, required: form.required, blocks: cleanBlocks, content: "" } : a));
      toast.success("Статья обновлена");
    } else {
      const newArticle: Article = { id: Date.now(), title: form.title, content: "", category: form.category, difficulty: form.difficulty, readTime: form.readTime, required: form.required, blocks: cleanBlocks };
      setArticles(arr => [...arr, newArticle]);
      toast.success("Статья добавлена");
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: number) => {
    if (!confirm("Удалить статью?")) return;
    setArticles(arr => arr.filter(a => a.id !== id));
    toast.success("Статья удалена");
  };

  // Block editor helpers
  const addBlock = (type: "text" | "video") => setForm(f => ({ ...f, blocks: [...f.blocks, { id: mkId(), type, content: "" }] }));
  const updateBlock = (id: string, content: string) => setForm(f => ({ ...f, blocks: f.blocks.map(b => b.id === id ? { ...b, content } : b) }));
  const removeBlock = (id: string) => setForm(f => ({ ...f, blocks: f.blocks.filter(b => b.id !== id) }));
  const moveBlock = (id: string, dir: -1 | 1) => setForm(f => {
    const idx = f.blocks.findIndex(b => b.id === id);
    if (idx < 0) return f;
    const newBlocks = [...f.blocks];
    const target = idx + dir;
    if (target < 0 || target >= newBlocks.length) return f;
    [newBlocks[idx], newBlocks[target]] = [newBlocks[target], newBlocks[idx]];
    return { ...f, blocks: newBlocks };
  });

  return (
    <div className="flex flex-col h-full z-10">
      <header className="h-14 border-b border-border/50 flex items-center justify-between px-4 md:px-6 bg-card/50 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-bold leading-none">База знаний</h1>
            <p className="text-[10px] text-muted-foreground mt-0.5">Обучение и стандарты работы</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {adminMode ? <Unlock className="w-3.5 h-3.5 text-amber-400" /> : <Lock className="w-3.5 h-3.5 text-muted-foreground" />}
            <span className="text-xs text-muted-foreground hidden sm:inline">Редактор</span>
            <Switch checked={adminMode} onCheckedChange={setAdminMode} />
          </div>
          {adminMode && (
            <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={openAdd}>
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Добавить статью</span>
            </Button>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-auto px-4 md:px-6 py-4 pb-20 md:pb-6 space-y-4">
        {/* Progress banner */}
        <div className="rounded-xl border border-border/50 bg-card/30 p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 flex items-center justify-center shrink-0"
            style={{ borderColor: progress >= 100 ? "#10b981" : progress >= 50 ? "#f59e0b" : "#6366f1" }}>
            <span className="text-xs font-black" style={{ color: progress >= 100 ? "#10b981" : progress >= 50 ? "#f59e0b" : "#6366f1" }}>{progress}%</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">Прогресс обучения</p>
            <p className="text-xs text-muted-foreground mt-0.5">Обязательных: {readRequired}/{totalRequired} · Всего: {totalRead}/{articles.length}</p>
            <div className="mt-2 h-1.5 rounded-full bg-muted/20 overflow-hidden">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
          {progress >= 100 && <div className="shrink-0 text-emerald-400 flex items-center gap-1 text-xs font-semibold"><CheckCircle2 className="w-4 h-4" /> Готов!</div>}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Поиск по статьям..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all">
          <TabsList className="mb-4 bg-muted/30 border border-border/50 h-auto flex-nowrap gap-0.5 overflow-x-auto w-full justify-start">
            <TabsTrigger value="all" className="text-xs shrink-0">Все ({articles.length})</TabsTrigger>
            {CATEGORIES.map(cat => (
              <TabsTrigger key={cat.id} value={cat.id} className="text-xs shrink-0">
                {cat.label} ({articles.filter(a => a.category === cat.id).length})
              </TabsTrigger>
            ))}
          </TabsList>

          {["all", ...CATEGORIES.map(c => c.id)].map(catId => (
            <TabsContent key={catId} value={catId} className="space-y-2 mt-0">
              {filtered.filter(a => catId === "all" || a.category === catId).map(article => {
                const isRead = !!readState[article.id];
                const cat = CATEGORIES.find(c => c.id === article.category);
                const diff = DIFF_LABEL[article.difficulty];
                const hasVideo = article.blocks?.some(b => b.type === "video");
                return (
                  <div key={article.id} className={cn("rounded-xl border transition-all", isRead ? "border-border/30 bg-card/20" : "border-border/50 bg-card/30")}>
                    <div className="p-3 flex flex-col gap-2">
                      {/* Row 1: icon + title/badges + admin actions */}
                      <div className="flex items-start gap-3">
                        <div className={cn("w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 mt-0.5", cat?.color ?? "")}>
                          {cat && <cat.icon className={cn("w-4 h-4", cat.color.split(" ")[0])} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold leading-snug line-clamp-2">{article.title}</p>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            {article.required && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0">Обязательно</span>}
                            {hasVideo && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0 flex items-center gap-1"><Video className="w-2.5 h-2.5" />Видео</span>}
                          </div>
                        </div>
                        {adminMode && (
                          <div className="flex items-center gap-0.5 shrink-0">
                            <button onClick={e => { e.stopPropagation(); openEdit(article); }} className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors">
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={e => { e.stopPropagation(); handleDelete(article.id); }} className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                      {/* Row 2: meta + check + read */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          <span className={cn("px-1.5 py-0.5 rounded-full border", diff.cls)}>{diff.label}</span>
                          <span>{article.readTime} мин.</span>
                          <span>{article.blocks?.length ?? 1} {(article.blocks?.length ?? 1) === 1 ? "блок" : "блока"}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            title={isRead ? "Отметить как непрочитанное" : "Отметить как прочитанное"}
                            onClick={e => { e.stopPropagation(); setReadState(s => ({ ...s, [article.id]: !isRead })); toast.success(isRead ? "Отмечено как непрочитанное" : "Отмечено как прочитанное"); }}
                            className="rounded-full transition-all hover:scale-110 active:scale-95"
                          >
                            {isRead
                              ? <CheckCircle2 className="w-4 h-4 text-emerald-400 hover:text-emerald-300" />
                              : <Circle className="w-4 h-4 text-muted-foreground/40 hover:text-emerald-400/70" />
                            }
                          </button>
                          <Link href={`/knowledge/${article.id}`}>
                            <button
                              onClick={() => setReadState(s => ({ ...s, [article.id]: true }))}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
                            >
                              Читать <ChevronRight className="w-3 h-3" />
                            </button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {filtered.filter(a => catId === "all" || a.category === catId).length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                  <BookOpen className="w-8 h-8 opacity-30" />
                  <p className="text-sm">{search ? "Статьи не найдены" : "В этом разделе пока нет статей"}</p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm">{editingId ? "Редактировать статью" : "Новая статья"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {/* Basic info */}
            <div className="space-y-1.5">
              <Label className="text-xs">Заголовок *</Label>
              <Input className="h-8 text-sm" placeholder="Название статьи" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} autoFocus />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Раздел</Label>
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Сложность</Label>
                <Select value={form.difficulty} onValueChange={v => setForm(f => ({ ...f, difficulty: v as Article["difficulty"] }))}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Легко</SelectItem>
                    <SelectItem value="medium">Средне</SelectItem>
                    <SelectItem value="hard">Сложно</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Время чтения (мин.)</Label>
                <Input className="h-8 text-xs" type="number" min="1" value={form.readTime} onChange={e => setForm(f => ({ ...f, readTime: Number(e.target.value) }))} />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Switch checked={form.required} onCheckedChange={v => setForm(f => ({ ...f, required: v }))} />
                  <span className="text-xs">Обязательная</span>
                </label>
              </div>
            </div>

            {/* Content blocks */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Содержание статьи</Label>
                <p className="text-[10px] text-muted-foreground">{form.blocks.length} {form.blocks.length === 1 ? "блок" : "блока"}</p>
              </div>

              <div className="space-y-2">
                {form.blocks.map((block, idx) => (
                  <div key={block.id} className={cn("rounded-xl border p-3 space-y-2", block.type === "video" ? "border-blue-500/30 bg-blue-500/5" : "border-border/50 bg-card/20")}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {block.type === "text"
                          ? <><Type className="w-3.5 h-3.5 text-muted-foreground" /><span className="text-[10px] font-semibold text-muted-foreground uppercase">Текст</span></>
                          : <><Video className="w-3.5 h-3.5 text-blue-400" /><span className="text-[10px] font-semibold text-blue-400 uppercase">Видео</span></>}
                        <span className="text-[9px] text-muted-foreground/50 ml-1">#{idx + 1}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => moveBlock(block.id, -1)} disabled={idx === 0} className="w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 hover:bg-muted/30">
                          <MoveUp className="w-3 h-3" />
                        </button>
                        <button onClick={() => moveBlock(block.id, 1)} disabled={idx === form.blocks.length - 1} className="w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 hover:bg-muted/30">
                          <MoveDown className="w-3 h-3" />
                        </button>
                        <button onClick={() => removeBlock(block.id)} className="w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {block.type === "text" ? (
                      <textarea
                        className="w-full text-sm border border-border/50 rounded-lg p-2.5 bg-background/50 resize-none focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground/50 min-h-[80px]"
                        placeholder="Текст блока..."
                        value={block.content}
                        onChange={e => updateBlock(block.id, e.target.value)}
                        rows={4}
                      />
                    ) : (
                      <div className="space-y-2">
                        <Input
                          className="h-8 text-xs"
                          placeholder="YouTube, Vimeo или прямая ссылка на видео..."
                          value={block.content}
                          onChange={e => updateBlock(block.id, e.target.value)}
                        />
                        {block.content && (
                          <p className="text-[10px] text-blue-400">
                            {block.content.includes("youtube") || block.content.includes("youtu.be") ? "📺 YouTube" :
                             block.content.includes("vimeo") ? "🎬 Vimeo" : "🔗 Прямая ссылка"}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 flex-1 border-border/50" onClick={() => addBlock("text")}>
                  <Type className="w-3.5 h-3.5" /> Добавить текст
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 flex-1 border-blue-500/30 text-blue-400 hover:bg-blue-500/10" onClick={() => addBlock("video")}>
                  <Video className="w-3.5 h-3.5" /> Добавить видео
                </Button>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1 h-9 text-sm" onClick={() => setDialogOpen(false)}>Отмена</Button>
              <Button className="flex-1 h-9 text-sm" onClick={handleSave}>{editingId ? "Сохранить" : "Добавить"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
