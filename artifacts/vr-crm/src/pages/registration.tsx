import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  Code2, Link2, Copy, Check, Wand2, Hand, Package, Image, Film,
  Users, AlertCircle, Gamepad2, Clock, ChevronRight, Eye
} from "lucide-react";
import { toast } from "sonner";

const MOCK_ZONES = [
  { id: "a", name: "Arena A", description: "Многопользовательская VR-арена для 4 игроков", capacity: 4, ageLimit: 10, enabled: true },
  { id: "b", name: "Arena B", description: "Командная игровая зона", capacity: 4, ageLimit: 10, enabled: true },
  { id: "s", name: "VR Solo", description: "Одиночные VR-приключения", capacity: 1, ageLimit: 7, enabled: true },
  { id: "r", name: "Racing", description: "Гоночные симуляторы в VR", capacity: 2, ageLimit: 14, enabled: false },
  { id: "p", name: "PS5", description: "Эксклюзивы PlayStation VR2", capacity: 2, ageLimit: 12, enabled: true },
  { id: "m", name: "Motion", description: "Полноценные движущиеся кабины", capacity: 1, ageLimit: 10, enabled: false },
];

const MOCK_GAMES = [
  { id: "g1", name: "Beat Saber", genre: "Ритм", players: "1-4", duration: "30 мин", poster: null, description: "Лучшая VR-ритм игра" },
  { id: "g2", name: "Pistol Whip", genre: "Шутер", players: "1-4", duration: "30 мин", poster: null, description: "Музыкальный экшен-шутер" },
  { id: "g3", name: "Half-Life: Alyx", genre: "Шутер", players: "1", duration: "60+ мин", poster: null, description: "Флагман VR-игр от Valve" },
  { id: "g4", name: "GT7 VR", genre: "Гонки", players: "1", duration: "30 мин", poster: null, description: "Лучший гоночный симулятор" },
  { id: "g5", name: "Walkabout Mini Golf", genre: "Спорт", players: "1-4", duration: "45 мин", poster: null, description: "Расслабляющий мини-гольф" },
];

const BOOKING_STEPS = ["Выбор зоны", "Выбор даты", "Выбор игры", "Данные", "Оплата", "SMS"];

export default function Registration() {
  const [widgetConfig, setWidgetConfig] = useState({
    logo: "",
    primaryColor: "#6366f1",
    bgColor: "#0f172a",
    title: "Забронировать VR-сеанс",
    subtitle: "Выберите зону и время",
    showZones: true,
    showGames: true,
    steps: BOOKING_STEPS,
  });
  const [zones, setZones] = useState(MOCK_ZONES);
  const [copied, setCopied] = useState<"iframe" | "link" | "embed" | null>(null);

  const bookingUrl = "https://book.vrpark.co/widget/abc123";
  const iframeCode = `<iframe src="${bookingUrl}" width="100%" height="600" frameborder="0" />`;
  const embedCode = `<script src="https://cdn.vrpark.co/widget.js" data-key="abc123"></script>`;

  const handleCopy = (type: "iframe" | "link" | "embed", text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(type);
    toast.success("Скопировано!");
    setTimeout(() => setCopied(null), 2000);
  };

  const toggleZone = (id: string) => {
    setZones(zs => zs.map(z => z.id === id ? { ...z, enabled: !z.enabled } : z));
  };

  return (
    <div className="flex flex-col h-full">
      <header className="h-14 border-b border-border/50 flex items-center px-4 md:px-6 bg-card/50 backdrop-blur-sm shrink-0">
        <h1 className="text-lg font-bold font-mono">Конструктор регистрации</h1>
      </header>

      <div className="flex-1 p-4 md:p-6 overflow-auto pb-20 md:pb-6">
        <Tabs defaultValue="modes" className="w-full">
          <TabsList className="mb-4 bg-muted/30 border border-border/50 h-9 flex-wrap">
            <TabsTrigger value="modes" className="text-xs">Режимы брони</TabsTrigger>
            <TabsTrigger value="widget" className="text-xs">Конструктор</TabsTrigger>
            <TabsTrigger value="zones" className="text-xs">Зоны</TabsTrigger>
            <TabsTrigger value="games" className="text-xs">Игры</TabsTrigger>
            <TabsTrigger value="result" className="text-xs">Результат</TabsTrigger>
          </TabsList>

          {/* Booking modes */}
          <TabsContent value="modes" className="space-y-4">
            <div>
              <h2 className="text-base font-semibold mb-1">Режимы бронирования</h2>
              <p className="text-xs text-muted-foreground mb-4">Выберите, какие варианты будут доступны клиентам в виджете.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { icon: Wand2, title: "Подобрать автоматически", desc: "CRM предложит подходящую зону и время на основе предпочтений и доступности", active: true },
                { icon: Hand, title: "Собрать вручную", desc: "Клиент самостоятельно выбирает зону, время и игру по шагам", active: true },
                { icon: Package, title: "Выбрать пакет", desc: "Готовые тематические пакеты для мероприятий (день рождения, корпоратив)", active: false },
              ].map((mode) => (
                <Card key={mode.title} className={cn("border cursor-pointer transition-all hover:border-primary/50", mode.active ? "border-primary/40 bg-primary/5" : "border-border/50 bg-card/30")}>
                  <CardHeader className="pb-2 pt-4 px-4">
                    <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-2", mode.active ? "bg-primary/20" : "bg-muted/40")}>
                      <mode.icon className={cn("w-4.5 h-4.5", mode.active ? "text-primary" : "text-muted-foreground")} />
                    </div>
                    <CardTitle className="text-sm">{mode.title}</CardTitle>
                    <CardDescription className="text-xs">{mode.desc}</CardDescription>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <Badge variant={mode.active ? "default" : "outline"} className="text-[10px]">
                      {mode.active ? "Включено" : "Выключено"}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-card/30 border-border/50">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm">Шаги виджета</CardTitle>
                <CardDescription className="text-xs">Порядок и состав шагов в воронке бронирования</CardDescription>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="flex flex-wrap gap-2">
                  {BOOKING_STEPS.map((step, i) => (
                    <div key={step} className="flex items-center gap-1.5 text-xs bg-muted/30 border border-border/50 rounded-full px-3 py-1.5">
                      <span className="w-4 h-4 rounded-full bg-primary/20 text-primary text-[10px] flex items-center justify-center font-bold shrink-0">{i + 1}</span>
                      {step}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Widget constructor */}
          <TabsContent value="widget" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-4">
                <Card className="bg-card/30 border-border/50">
                  <CardHeader className="pb-2 pt-4 px-4">
                    <CardTitle className="text-sm">Брендинг</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Заголовок</Label>
                      <Input className="h-8 text-sm" value={widgetConfig.title} onChange={(e) => setWidgetConfig(c => ({ ...c, title: e.target.value }))} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Подзаголовок</Label>
                      <Input className="h-8 text-sm" value={widgetConfig.subtitle} onChange={(e) => setWidgetConfig(c => ({ ...c, subtitle: e.target.value }))} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Основной цвет</Label>
                        <div className="flex items-center gap-2">
                          <input type="color" className="w-8 h-8 rounded cursor-pointer border border-border" value={widgetConfig.primaryColor} onChange={(e) => setWidgetConfig(c => ({ ...c, primaryColor: e.target.value }))} />
                          <Input className="h-8 text-xs flex-1" value={widgetConfig.primaryColor} onChange={(e) => setWidgetConfig(c => ({ ...c, primaryColor: e.target.value }))} />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Фон</Label>
                        <div className="flex items-center gap-2">
                          <input type="color" className="w-8 h-8 rounded cursor-pointer border border-border" value={widgetConfig.bgColor} onChange={(e) => setWidgetConfig(c => ({ ...c, bgColor: e.target.value }))} />
                          <Input className="h-8 text-xs flex-1" value={widgetConfig.bgColor} onChange={(e) => setWidgetConfig(c => ({ ...c, bgColor: e.target.value }))} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card/30 border-border/50">
                  <CardHeader className="pb-2 pt-4 px-4">
                    <CardTitle className="text-sm">Отображение</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 space-y-3">
                    {[
                      { key: "showZones", label: "Показывать зоны" },
                      { key: "showGames", label: "Показывать игры" },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between">
                        <Label className="text-sm">{item.label}</Label>
                        <Switch
                          checked={widgetConfig[item.key as keyof typeof widgetConfig] as boolean}
                          onCheckedChange={(v) => setWidgetConfig(c => ({ ...c, [item.key]: v }))}
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Widget preview */}
              <div>
                <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" /> Предпросмотр виджета
                </p>
                <div className="rounded-xl border border-border/50 overflow-hidden" style={{ backgroundColor: widgetConfig.bgColor }}>
                  <div className="p-4 border-b" style={{ borderColor: widgetConfig.primaryColor + "30" }}>
                    <h3 className="text-sm font-bold text-white">{widgetConfig.title}</h3>
                    <p className="text-xs text-white/60 mt-0.5">{widgetConfig.subtitle}</p>
                  </div>
                  <div className="p-4 space-y-2">
                    {widgetConfig.showZones && zones.filter(z => z.enabled).slice(0, 3).map(z => (
                      <div key={z.id} className="flex items-center justify-between p-2 rounded-lg border" style={{ borderColor: widgetConfig.primaryColor + "40", backgroundColor: widgetConfig.primaryColor + "10" }}>
                        <span className="text-xs text-white">{z.name}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-white/40" />
                      </div>
                    ))}
                    <Button size="sm" className="w-full h-8 text-xs mt-2" style={{ backgroundColor: widgetConfig.primaryColor }}>
                      Забронировать
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Zone settings */}
          <TabsContent value="zones" className="space-y-3">
            {zones.map((zone) => (
              <Card key={zone.id} className={cn("border-border/50 transition-opacity", zone.enabled ? "bg-card/30" : "bg-card/10 opacity-60")}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold">{zone.name}</h3>
                        <Badge variant={zone.enabled ? "default" : "outline"} className="text-[10px]">
                          {zone.enabled ? "Активна" : "Скрыта"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{zone.description}</p>
                    </div>
                    <Switch checked={zone.enabled} onCheckedChange={() => toggleZone(zone.id)} />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1.5">
                      <Label className="text-[10px]">Описание</Label>
                      <Input className="h-7 text-xs" defaultValue={zone.description} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] flex items-center gap-1"><Users className="w-2.5 h-2.5" /> Вместимость</Label>
                      <Input className="h-7 text-xs" type="number" defaultValue={zone.capacity} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] flex items-center gap-1"><AlertCircle className="w-2.5 h-2.5" /> Возраст 18+</Label>
                      <Input className="h-7 text-xs" type="number" defaultValue={zone.ageLimit} />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1">
                      <Image className="w-3 h-3" /> Фото
                    </Button>
                    <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1">
                      <Film className="w-3 h-3" /> Видео
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Games settings */}
          <TabsContent value="games" className="space-y-3">
            {MOCK_GAMES.map((game) => (
              <Card key={game.id} className="bg-card/30 border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <Gamepad2 className="w-5 h-5 text-primary/60" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-semibold">{game.name}</h3>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Badge variant="outline" className="text-[10px]">{game.genre}</Badge>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{game.description}</p>
                      <div className="flex gap-3 mt-1.5 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-0.5"><Users className="w-2.5 h-2.5" /> {game.players}</span>
                        <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> {game.duration}</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1">
                      <Image className="w-3 h-3" /> Постер
                    </Button>
                    <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1">
                      <Film className="w-3 h-3" /> Трейлер
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Result - embed codes */}
          <TabsContent value="result" className="space-y-4">
            <div>
              <h2 className="text-base font-semibold mb-1">Результат</h2>
              <p className="text-xs text-muted-foreground mb-4">Вставьте один из вариантов на ваш сайт или используйте прямую ссылку.</p>
            </div>

            <div className="space-y-3">
              {[
                { type: "iframe" as const, icon: Code2, label: "iframe-код", desc: "Встраивание виджета через HTML iframe", code: iframeCode },
                { type: "embed" as const, icon: Code2, label: "JavaScript виджет", desc: "Лёгкий JS-скрипт с автоматической загрузкой", code: embedCode },
                { type: "link" as const, icon: Link2, label: "Прямая ссылка", desc: "Отдельная страница бронирования", code: bookingUrl },
              ].map((item) => (
                <Card key={item.type} className="bg-card/30 border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <item.icon className="w-3.5 h-3.5 text-primary" />
                          <span className="text-sm font-semibold">{item.label}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-[10px] gap-1 shrink-0"
                        onClick={() => handleCopy(item.type, item.code)}
                      >
                        {copied === item.type ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                        {copied === item.type ? "Скопировано" : "Копировать"}
                      </Button>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
                      <code className="text-[10px] font-mono text-muted-foreground break-all">{item.code}</code>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
