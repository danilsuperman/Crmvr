import { useLocation } from "wouter";
import { Check, Zap, Building2, Users, Brain, BarChart3, Plug, MessageSquare, ChevronRight, ArrowLeft, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const BASE_PLANS = [
  {
    id: "start",
    name: "START",
    emoji: "🟢",
    price: "5 900",
    period: "/ мес",
    desc: "Идеально для запуска одного VR-клуба",
    color: "border-white/10 bg-white/3",
    badge: null,
    cta: "Начать бесплатно",
    ctaStyle: "bg-white/10 hover:bg-white/20 text-white border border-white/20",
    features: [
      "1 объект (VR-клуб / зал)",
      "Базовая CRM",
      "Расписание VR-сессий",
      "До 5 сотрудников",
      "Базовая аналитика",
    ],
  },
  {
    id: "pro",
    name: "PRO",
    emoji: "🟡",
    price: "14 900",
    period: "/ мес",
    desc: "Для растущего парка с командой",
    color: "border-indigo-500/50 bg-indigo-950/30",
    badge: "Популярный",
    cta: "Попробовать PRO",
    ctaStyle: "bg-indigo-600 hover:bg-indigo-500 text-white",
    features: [
      "До 3 объектов",
      "Расширенная CRM",
      "Онлайн-бронь + оплаты",
      "До 15 сотрудников",
      "Аналитика загрузки",
      "Интеграции",
    ],
  },
  {
    id: "enterprise",
    name: "ENTERPRISE",
    emoji: "🔴",
    price: "39 900",
    period: "/ мес",
    desc: "Для сетей VR-клубов и франшиз",
    color: "border-white/10 bg-white/3",
    badge: null,
    cta: "Обсудить условия",
    ctaStyle: "bg-white/10 hover:bg-white/20 text-white border border-white/20",
    features: [
      "До 10 объектов",
      "Сеть VR-клубов",
      "До 100+ сотрудников",
      "Расширенная аналитика сети",
      "Управление филиалами",
      "API доступ",
    ],
  },
];

const CONSTRUCTOR_BLOCKS = [
  {
    icon: Building2,
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
    title: "Объекты",
    subtitle: "VR-клубы / залы — главный драйвер роста",
    emoji: "🏢",
    items: [
      { label: "+1 объект", value: "1 500 – 3 500 ₽ / мес" },
      { label: "Пакет 5 объектов", value: "Дешевле на 20%" },
      { label: "10+ объектов", value: "Корпоративный тариф" },
    ],
    note: "Каждый новый VR-клуб = рост вашего MRR",
  },
  {
    icon: Users,
    color: "text-violet-400",
    bg: "bg-violet-500/10 border-violet-500/20",
    title: "Сотрудники",
    subtitle: "Операторы и администраторы",
    emoji: "👥",
    items: [
      { label: "Включено в START", value: "5 чел." },
      { label: "Включено в PRO", value: "15 чел." },
      { label: "Включено в ENTERPRISE", value: "100+" },
      { label: "+1 дополнительный", value: "200 – 400 ₽ / мес" },
    ],
    note: "Маленькие клубы почти не платят. Сети — платят за масштаб.",
  },
];

const MODULE_GROUPS = [
  {
    icon: Brain,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10 border-cyan-500/20",
    title: "AI Модули",
    emoji: "🤖",
    items: [
      { label: "AI прогноз загрузки VR-залов", price: "3 000 ₽" },
      { label: "Оптимизация расписания", price: "4 000 ₽" },
      { label: "Анализ дохода по станциям", price: "3 000 ₽" },
      { label: "Рекомендации по росту выручки", price: "2 000 ₽" },
    ],
  },
  {
    icon: BarChart3,
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
    title: "Бизнес-модули",
    emoji: "💰",
    items: [
      { label: "Динамическое ценообразование", price: "5 000 ₽" },
      { label: "Мульти-филиальная аналитика", price: "6 000 ₽" },
      { label: "Управление франшизой", price: "7 000 ₽" },
    ],
  },
  {
    icon: Plug,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    title: "Интеграции",
    emoji: "🔌",
    items: [
      { label: "Платежи (Stripe / ЮKassa)", price: "1 500 ₽" },
      { label: "API доступ", price: "5 000 ₽" },
      { label: "CRM / ERP интеграции", price: "3 000 – 10 000 ₽" },
    ],
  },
  {
    icon: MessageSquare,
    color: "text-pink-400",
    bg: "bg-pink-500/10 border-pink-500/20",
    title: "Операционка",
    emoji: "📲",
    items: [
      { label: "SMS / WhatsApp уведомления", price: "По пакету" },
      { label: "White-label (под бренд клиента)", price: "+50–120% к тарифу" },
    ],
  },
];

const FAQ = [
  { q: "Можно ли платить только за то, что нужно?", a: "Да. Вы выбираете базовый тариф и добавляете только нужные модули. Ничего лишнего." },
  { q: "Как работает конструктор объектов?", a: "Каждый дополнительный VR-клуб подключается по фиксированной цене. Чем больше объектов — тем ниже цена за штуку (пакетные скидки)." },
  { q: "Есть ли пробный период?", a: "Да, для тарифа START — 14 дней бесплатно. PRO и ENTERPRISE — демо по запросу." },
  { q: "Как считается white-label?", a: "К вашему базовому тарифу прибавляется 50–120% в зависимости от объёма кастомизации бренда." },
];

export default function Pricing() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-[#070910] text-white overflow-x-hidden">

      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#070910]/90 backdrop-blur-xl px-4 md:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="flex items-center gap-1.5 text-white/50 hover:text-white/80 text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" /> На главную
          </button>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-sm">V</div>
          <span className="font-bold text-white">VR Park OS</span>
        </div>
        <button onClick={() => navigate("/dashboard")} className="text-sm px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors">
          Войти в CRM
        </button>
      </nav>

      {/* Hero */}
      <section className="pt-20 pb-16 px-4 md:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-medium mb-6">
          <Star className="w-3 h-3" /> Прозрачные цены — никаких сюрпризов
        </div>
        <h1 className="text-4xl md:text-6xl font-black leading-tight mb-4">
          Платите только за{" "}
          <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">то, что нужно</span>
        </h1>
        <p className="text-white/50 text-lg max-w-2xl mx-auto">
          Базовая подписка + конструктор ресурсов. Масштабируйтесь по мере роста сети.
        </p>
      </section>

      {/* Base Plans */}
      <section className="px-4 md:px-8 pb-20 max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 text-xs text-white/40 uppercase tracking-wider mb-3">
            <span className="w-8 h-px bg-white/20" /> 💳 Базовая подписка <span className="w-8 h-px bg-white/20" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold">Выберите тариф</h2>
          <p className="text-white/40 text-sm mt-2">Фиксированная плата за доступ к платформе</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {BASE_PLANS.map((plan) => (
            <div key={plan.id} className={cn("relative rounded-2xl border p-7 flex flex-col", plan.color)}>
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-indigo-600 text-xs font-bold text-white shadow-lg shadow-indigo-900/40">
                  {plan.badge}
                </div>
              )}
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{plan.emoji}</span>
                  <span className="text-xs font-bold text-white/40 uppercase tracking-widest">{plan.name}</span>
                </div>
                <div className="flex items-end gap-1.5 mb-2">
                  <span className="text-4xl font-black text-white">{plan.price} ₽</span>
                  <span className="text-white/40 text-sm mb-1">{plan.period}</span>
                </div>
                <p className="text-white/50 text-sm">{plan.desc}</p>
              </div>
              <ul className="space-y-2.5 flex-1 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-white/70">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button className={cn("w-full py-2.5 rounded-xl font-semibold text-sm transition-all", plan.ctaStyle)}>
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Constructor Section */}
      <section className="px-4 md:px-8 pb-20 max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 text-xs text-white/40 uppercase tracking-wider mb-3">
            <span className="w-8 h-px bg-white/20" /> 🧩 Конструктор <span className="w-8 h-px bg-white/20" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold">Докупайте ресурсы по мере роста</h2>
          <p className="text-white/40 text-sm mt-2">После выбора тарифа расширяйте возможности точечно</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {CONSTRUCTOR_BLOCKS.map((block) => (
            <div key={block.title} className={cn("rounded-2xl border p-6", block.bg)}>
              <div className="flex items-center gap-3 mb-5">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border", block.bg)}>
                  <block.icon className={cn("w-5 h-5", block.color)} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span>{block.emoji}</span>
                    <h3 className="font-bold text-white">{block.title}</h3>
                  </div>
                  <p className="text-xs text-white/40">{block.subtitle}</p>
                </div>
              </div>
              <div className="space-y-2.5 mb-4">
                {block.items.map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <span className="text-sm text-white/60">{item.label}</span>
                    <span className="text-sm font-semibold text-white">{item.value}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-white/5 border border-white/5">
                <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-white/50">{block.note}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modules Section */}
      <section className="px-4 md:px-8 pb-20 max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 text-xs text-white/40 uppercase tracking-wider mb-3">
            <span className="w-8 h-px bg-white/20" /> 🤖 Модули <span className="w-8 h-px bg-white/20" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold">Ваш App Store внутри CRM</h2>
          <p className="text-white/40 text-sm mt-2">Подключайте только нужные возможности — самая высокая маржа</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {MODULE_GROUPS.map((group) => (
            <div key={group.title} className={cn("rounded-2xl border p-6", group.bg)}>
              <div className="flex items-center gap-3 mb-5">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border", group.bg)}>
                  <group.icon className={cn("w-5 h-5", group.color)} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span>{group.emoji}</span>
                    <h3 className="font-bold text-white">{group.title}</h3>
                  </div>
                </div>
              </div>
              <div className="space-y-0">
                {group.items.map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                    <span className="text-sm text-white/65">{item.label}</span>
                    <span className="text-sm font-bold text-white whitespace-nowrap ml-4">{item.price}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MRR Calculator Banner */}
      <section className="px-4 md:px-8 pb-20 max-w-6xl mx-auto">
        <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/60 to-violet-950/40 p-8 md:p-10 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <p className="text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">Пример расчёта MRR</p>
            <h3 className="text-2xl md:text-3xl font-black mb-3">PRO + 2 доп. объекта + AI модуль</h3>
            <div className="space-y-1.5 text-sm text-white/60">
              <div className="flex justify-between max-w-xs"><span>PRO тариф</span><span className="text-white font-medium">14 900 ₽</span></div>
              <div className="flex justify-between max-w-xs"><span>+2 объекта × 2 500 ₽</span><span className="text-white font-medium">5 000 ₽</span></div>
              <div className="flex justify-between max-w-xs"><span>AI прогноз загрузки</span><span className="text-white font-medium">3 000 ₽</span></div>
              <div className="flex justify-between max-w-xs border-t border-white/10 pt-1.5 mt-1.5"><span className="text-white font-semibold">Итого / мес</span><span className="text-indigo-400 font-black text-base">22 900 ₽</span></div>
            </div>
          </div>
          <div className="shrink-0 text-center">
            <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-900/40">
              Собрать свой пакет <ChevronRight className="w-4 h-4" />
            </button>
            <p className="text-white/30 text-xs mt-2">14 дней бесплатно</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 md:px-8 pb-20 max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold">Частые вопросы</h2>
        </div>
        <div className="space-y-3">
          {FAQ.map((item) => (
            <div key={item.q} className="rounded-xl border border-white/8 bg-white/3 p-5">
              <p className="font-semibold text-white mb-2">{item.q}</p>
              <p className="text-white/50 text-sm leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="px-4 md:px-8 pb-16 text-center">
        <h2 className="text-2xl md:text-4xl font-black mb-3">Готовы начать?</h2>
        <p className="text-white/40 mb-7 text-sm">14 дней бесплатно. Без привязки карты.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => navigate("/dashboard")} className="px-7 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-900/40">
            Попробовать бесплатно
          </button>
          <button onClick={() => navigate("/")} className="px-7 py-3 rounded-xl border border-white/15 hover:border-white/30 text-white/70 hover:text-white text-sm transition-all">
            Узнать больше
          </button>
        </div>
      </section>

      {/* Bottom bar */}
      <div className="border-t border-white/5 py-8 px-4 text-center">
        <p className="text-xs text-white/20">© 2026 VR Park OS. Все права защищены.</p>
      </div>
    </div>
  );
}
