import { useState } from "react";
import { BookOpen, Plus, ChevronDown, ChevronRight, Edit2, Trash2, Lock, Unlock, CheckCircle2, Circle, Search, GraduationCap, Shield, Gamepad2, ShoppingCart, Users2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocalStorage } from "@/lib/store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Article = {
  id: number;
  title: string;
  content: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  readTime: number;
  required: boolean;
};

type ReadState = Record<number, boolean>;

const CATEGORIES = [
  { id: "onboarding", label: "Новый сотрудник", icon: GraduationCap, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  { id: "games", label: "Игры и оборудование", icon: Gamepad2, color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  { id: "sales", label: "Продажи и сервис", icon: ShoppingCart, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  { id: "safety", label: "Безопасность", icon: Shield, color: "text-red-400 bg-red-500/10 border-red-500/20" },
  { id: "hr", label: "Команда и HR", icon: Users2, color: "text-violet-400 bg-violet-500/10 border-violet-500/20" },
];

const DEFAULT_ARTICLES: Article[] = [
  { id: 1, title: "Добро пожаловать в VR Park!", content: "Это ваш первый день. Познакомьтесь с командой, получите форму и пройдите инструктаж по безопасности. В этом документе вы найдёте всё необходимое для начала работы: распорядок дня, контакты коллег и первые шаги.", category: "onboarding", difficulty: "easy", readTime: 5, required: true },
  { id: 2, title: "Как открыть и закрыть парк", content: "Процедура открытия: 1) Проверить все устройства на наличие зарядки. 2) Запустить управляющее ПО. 3) Проверить чистоту зон. 4) Включить освещение и музыку. 5) Принять кассу.\n\nЗакрытие: обратная последовательность + оформление кассового отчёта.", category: "onboarding", difficulty: "easy", readTime: 7, required: true },
  { id: 3, title: "Структура компании и контакты", content: "Руководитель: Дмитрий Козлов (admin@vrpark.co)\nСтарший администратор: Анна Смирнова\nТехник: Михаил Петров\n\nГрафик работы: 10:00 – 22:00 ежедневно. Смены по 10 часов.", category: "onboarding", difficulty: "easy", readTime: 3, required: true },
  { id: 4, title: "Гарнитуры Meta Quest 3 — полное руководство", content: "Meta Quest 3 — основное устройство парка. Зарядка занимает 2–2.5 часа, полный заряд держит 3 часа непрерывной игры.\n\nНастройка для клиента:\n1. Надеть гарнитуру\n2. Настроить IPD (расстояние между линзами)\n3. Провести граничные линии безопасного пространства\n4. Запустить нужное приложение\n\nЧастые проблемы: перегрев — отключить на 10 мин, расплывчатая картинка — откалибровать IPD.", category: "games", difficulty: "medium", readTime: 12, required: true },
  { id: 5, title: "Топ-10 игр в нашем парке", content: "1. Beat Saber — самая популярная, подходит всем возрастам\n2. Superhot VR — для продвинутых\n3. Resident Evil 4 VR — только 18+\n4. Star Wars: Squadrons\n5. Walkabout Mini Golf\n6. Moss — семейная\n7. Until You Fall\n8. Pistol Whip\n9. The Room VR\n10. Lone Echo 2", category: "games", difficulty: "easy", readTime: 6, required: false },
  { id: 6, title: "Уход за оборудованием", content: "Ежедневно:\n• Протирать линзы специальной салфеткой\n• Дезинфицировать накладки для лица\n• Заряжать контроллеры\n\nЕженедельно:\n• Глубокая чистка ремней\n• Проверка кабелей и зарядных устройств\n• Обновление прошивки\n\nЗапрещено: использовать спирт на линзах, оставлять устройства без заряда.", category: "games", difficulty: "medium", readTime: 8, required: true },
  { id: 7, title: "Техника продаж — от брони до допродажи", content: "Основной скрипт встречи клиента:\n1. Тёплое приветствие: «Добро пожаловать в VR Park!\"\n2. Уточнить опыт: «Вы уже пробовали VR?»\n3. Подобрать игру по интересам\n4. Предложить апгрейд: «Хотите попробовать VIP-сеанс на 90 минут?»\n\nДопродажи: фото на память, сувениры, следующее бронирование со скидкой 10%.", category: "sales", difficulty: "medium", readTime: 10, required: true },
  { id: 8, title: "Работа с конфликтными клиентами", content: "Правило LAST:\nL — Listen (Слушать без перебиваний)\nA — Apologize (Извиниться за неудобства)\nS — Solve (Предложить решение)\nT — Thank (Поблагодарить за обратную связь)\n\nЕсли клиент требует компенсацию — предложить бесплатный сеанс до 30 минут. Если ситуация выходит из-под контроля — привлечь руководителя.", category: "sales", difficulty: "hard", readTime: 8, required: false },
  { id: 9, title: "Правила безопасности в VR-зонах", content: "Обязательные правила:\n1. Всегда объяснять клиенту границы безопасного пространства\n2. Не оставлять детей до 10 лет без присмотра\n3. Предупреждать об эпилепсии: VR нельзя людям с фотосенситивной эпилепсией\n4. Снимать очки, кольца и острые предметы перед сеансом\n5. При плохом самочувствии — немедленно снять гарнитуру\n\nПожарный выход: левая дверь от зоны Arena A.", category: "safety", difficulty: "easy", readTime: 5, required: true },
  { id: 10, title: "Первая помощь при VR-дискомфорте", content: "Симптомы VR-укачивания: тошнота, головокружение, потливость.\n\nДействия:\n1. Аккуратно снять гарнитуру\n2. Посадить клиента, дать воды\n3. Направить взгляд на статичный объект\n4. Свежий воздух — проветрить помещение\n5. Если симптомы не проходят 10 минут — вызвать скорую\n\nПрофилактика: рекомендовать новичкам начинать с 15–20 минут.", category: "safety", difficulty: "medium", readTime: 6, required: true },
  { id: 11, title: "Корпоративная культура и ценности", content: "Наши ценности:\n🎮 Инновации — мы внедряем лучшие технологии\n❤️ Забота — каждый клиент уходит с улыбкой\n🤝 Команда — мы поддерживаем друг друга\n🏆 Результат — нас интересует качество, не количество\n\nДресс-код: фирменная футболка, тёмные брюки/джинсы, закрытая обувь.", category: "hr", difficulty: "easy", readTime: 4, required: false },
  { id: 12, title: "Оценка работы и бонусы", content: "KPI администратора:\n• NPS (оценка клиентов) — цель 9+\n• Допродажи — цель 20% от сеансов\n• Пунктуальность — 0 опозданий\n\nБонусы:\n• За месяц без нарушений — +5 000 ₽\n• За каждые 10 допродаж — +500 ₽\n• Лучший сотрудник месяца — +3 000 ₽ и диплом", category: "hr", difficulty: "easy", readTime: 5, required: false },
];

const EMPTY_ARTICLE: Omit<Article, "id"> = {
  title: "",
  content: "",
  category: "onboarding",
  difficulty: "easy",
  readTime: 5,
  required: false,
};

const DIFF_LABEL: Record<Article["difficulty"], { label: string; cls: string }> = {
  easy: { label: "Легко", cls: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  medium: { label: "Средне", cls: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  hard: { label: "Сложно", cls: "text-red-400 bg-red-500/10 border-red-500/20" },
};

export default function Knowledge() {
  const [articles, setArticles] = useLocalStorage<Article[]>("vrpark_knowledge_articles", DEFAULT_ARTICLES);
  const [readState, setReadState] = useLocalStorage<ReadState>("vrpark_knowledge_read", {});
  const [adminMode, setAdminMode] = useLocalStorage("vrpark_knowledge_admin", true);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Omit<Article, "id">>(EMPTY_ARTICLE);

  const markRead = (id: number) => setReadState(s => ({ ...s, [id]: true }));

  const totalRequired = articles.filter(a => a.required).length;
  const readRequired = articles.filter(a => a.required && readState[a.id]).length;
  const totalRead = Object.values(readState).filter(Boolean).length;
  const progress = totalRequired > 0 ? Math.round((readRequired / totalRequired) * 100) : 0;

  const filtered = articles.filter(a =>
    !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.content.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_ARTICLE);
    setDialogOpen(true);
  };

  const openEdit = (a: Article) => {
    setEditingId(a.id);
    setForm({ title: a.title, content: a.content, category: a.category, difficulty: a.difficulty, readTime: a.readTime, required: a.required });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) { toast.error("Введите название"); return; }
    if (editingId !== null) {
      setArticles(arr => arr.map(a => a.id === editingId ? { ...a, ...form } : a));
      toast.success("Статья обновлена");
    } else {
      const newArticle: Article = { ...form, id: Date.now() };
      setArticles(arr => [...arr, newArticle]);
      toast.success("Статья добавлена");
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: number) => {
    if (!confirm("Удалить статью?")) return;
    setArticles(arr => arr.filter(a => a.id !== id));
    if (expandedId === id) setExpandedId(null);
    toast.success("Статья удалена");
  };

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
            <span className="text-xs text-muted-foreground hidden sm:inline">Режим редактора</span>
            <Switch checked={adminMode} onCheckedChange={setAdminMode} />
          </div>
          {adminMode && (
            <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={openAdd}>
              <Plus className="w-3.5 h-3.5" /> Добавить статью
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
            <p className="text-xs text-muted-foreground mt-0.5">
              Обязательных: {readRequired}/{totalRequired} · Всего прочитано: {totalRead}/{articles.length}
            </p>
            <div className="mt-2 h-1.5 rounded-full bg-muted/20 overflow-hidden">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
          {progress >= 100 && (
            <div className="shrink-0 text-emerald-400 flex items-center gap-1 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4" /> Готов к работе!
            </div>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по статьям..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>

        {/* Categories */}
        <Tabs defaultValue="all">
          <TabsList className="mb-4 bg-muted/30 border border-border/50 h-9 flex-wrap gap-0.5">
            <TabsTrigger value="all" className="text-xs">Все ({articles.length})</TabsTrigger>
            {CATEGORIES.map(cat => {
              const count = articles.filter(a => a.category === cat.id).length;
              return (
                <TabsTrigger key={cat.id} value={cat.id} className="text-xs">
                  {cat.label} ({count})
                </TabsTrigger>
              );
            })}
          </TabsList>

          {["all", ...CATEGORIES.map(c => c.id)].map(catId => (
            <TabsContent key={catId} value={catId} className="space-y-2 mt-0">
              {filtered
                .filter(a => catId === "all" || a.category === catId)
                .map(article => {
                  const isExpanded = expandedId === article.id;
                  const isRead = !!readState[article.id];
                  const cat = CATEGORIES.find(c => c.id === article.category);
                  const diff = DIFF_LABEL[article.difficulty];
                  return (
                    <div
                      key={article.id}
                      className={cn(
                        "rounded-xl border transition-all",
                        isRead ? "border-border/30 bg-card/20" : "border-border/50 bg-card/30",
                        isExpanded && "border-primary/30"
                      )}
                    >
                      <div
                        className="flex items-center gap-3 p-3 cursor-pointer"
                        onClick={() => {
                          setExpandedId(isExpanded ? null : article.id);
                          if (!isRead) markRead(article.id);
                        }}
                      >
                        <div className={cn("w-8 h-8 rounded-lg border flex items-center justify-center shrink-0", cat?.color ?? "")}>
                          {cat && <cat.icon className={cn("w-4 h-4", cat.color.split(" ")[0])} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold truncate">{article.title}</p>
                            {article.required && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0">Обязательно</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
                            <span className={cn("px-1.5 py-0.5 rounded-full border", diff.cls)}>{diff.label}</span>
                            <span>{article.readTime} мин.</span>
                            {cat && <span>{cat.label}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {isRead
                            ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            : <Circle className="w-4 h-4 text-muted-foreground/40" />}
                          {adminMode && (
                            <>
                              <button
                                onClick={e => { e.stopPropagation(); openEdit(article); }}
                                className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={e => { e.stopPropagation(); handleDelete(article.id); }}
                                className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </>
                          )}
                          {isExpanded
                            ? <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="px-4 pb-4 border-t border-border/30">
                          <div className="mt-3 text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                            {article.content}
                          </div>
                          {!isRead && (
                            <Button
                              size="sm"
                              className="mt-3 h-8 text-xs gap-1.5"
                              onClick={() => { markRead(article.id); toast.success("Отмечено как прочитанное"); }}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Отметить прочитанным
                            </Button>
                          )}
                        </div>
                      )}
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
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm">{editingId ? "Редактировать статью" : "Новая статья"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Заголовок *</Label>
              <Input className="h-8 text-sm" placeholder="Название статьи" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} autoFocus />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Раздел</Label>
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}
                  </SelectContent>
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
            <div className="space-y-1.5">
              <Label className="text-xs">Содержание</Label>
              <textarea
                className="w-full text-sm border border-border/50 rounded-lg p-2.5 bg-card/30 resize-none focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground/50"
                rows={8}
                placeholder="Текст статьи..."
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              />
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
