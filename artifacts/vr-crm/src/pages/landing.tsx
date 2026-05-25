import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useLocalStorage } from "@/lib/store";
import {
  Monitor, Cpu, BarChart3, Globe, Zap, Shield, Play, ChevronRight,
  Check, Star, Users, Clock, Wifi, Smartphone, ArrowRight, Menu, X,
  Activity, Gamepad2, TrendingUp, Battery, Radio, RotateCcw, Layers,
  Package, Calendar, DollarSign, MapPin, Bell, Eye, RefreshCw,
  ChevronDown, Twitter, Github, MessageSquare, LogIn, UserPlus, Mail, Lock, User,
} from "lucide-react";

// ─── AUTH ─────────────────────────────────────────────────────────────────────

type AuthUser = { id: string; name: string; email: string; password: string };
type AuthSession = { userId: string; name: string; email: string } | null;

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function GlowButton({ children, variant = "primary", className = "", onClick, type = "button" }: {
  children: React.ReactNode; variant?: "primary" | "secondary" | "ghost";
  className?: string; onClick?: () => void; type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={cn(
        "relative inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300",
        variant === "primary" && "bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:shadow-[0_0_50px_rgba(99,102,241,0.7)] hover:scale-[1.02]",
        variant === "secondary" && "bg-white/5 hover:bg-white/10 text-white border border-white/20 hover:border-white/40 backdrop-blur-sm",
        variant === "ghost" && "text-white/70 hover:text-white",
        className
      )}
    >
      {children}
    </button>
  );
}

function SectionBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 mb-4">
      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
      {children}
    </span>
  );
}

function SectionTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={cn("text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight", className)}>
      {children}
    </h2>
  );
}

function GradientText({ children }: { children: React.ReactNode }) {
  return <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">{children}</span>;
}

// ─── AUTH MODAL ───────────────────────────────────────────────────────────────

function AuthModal({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: () => void }) {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [authUsers, setAuthUsers] = useLocalStorage<AuthUser[]>("vrpark_auth_users", []);
  const [, setSession] = useLocalStorage<AuthSession>("vrpark_auth_session", null);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      const user = authUsers.find(u => u.email === form.email && u.password === form.password);
      if (user) {
        setSession({ userId: user.id, name: user.name, email: user.email });
        setLoading(false);
        onSuccess();
      } else {
        setError("Неверный email или пароль");
        setLoading(false);
      }
    }, 600);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) { setError("Введите имя"); return; }
    if (!form.email.includes("@")) { setError("Введите корректный email"); return; }
    if (form.password.length < 6) { setError("Пароль должен быть не менее 6 символов"); return; }
    if (form.password !== form.confirm) { setError("Пароли не совпадают"); return; }
    if (authUsers.find(u => u.email === form.email)) { setError("Пользователь с таким email уже существует"); return; }
    setLoading(true);
    setTimeout(() => {
      const newUser: AuthUser = { id: `u_${Date.now()}`, name: form.name, email: form.email, password: form.password };
      setAuthUsers(us => [...us, newUser]);
      setSession({ userId: newUser.id, name: newUser.name, email: newUser.email });
      setLoading(false);
      onSuccess();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-[#0d0f1e] border border-white/15 rounded-2xl shadow-2xl overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-600" />
        <div className="p-6 pt-7">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">V</div>
                <span className="font-bold text-white text-sm">VR Park OS</span>
              </div>
              <p className="text-xs text-white/50">Управление VR-парком</p>
            </div>
            <button onClick={onClose} className="text-white/40 hover:text-white transition-colors p-1">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex rounded-xl overflow-hidden border border-white/10 mb-5 bg-white/3">
            {(["login", "register"] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(""); }}
                className={cn("flex-1 py-2 text-sm font-semibold transition-all", tab === t ? "bg-indigo-600 text-white" : "text-white/50 hover:text-white")}
              >
                {t === "login" ? "Войти" : "Регистрация"}
              </button>
            ))}
          </div>

          {tab === "login" ? (
            <form onSubmit={handleLogin} className="space-y-3">
              <div>
                <label className="text-xs text-white/50 mb-1 block flex items-center gap-1"><Mail className="w-3 h-3" />Email</label>
                <input
                  type="email" required autoComplete="email"
                  placeholder="your@email.com"
                  value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-indigo-500/60 focus:bg-white/8 transition-all"
                />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block flex items-center gap-1"><Lock className="w-3 h-3" />Пароль</label>
                <input
                  type="password" required autoComplete="current-password"
                  placeholder="••••••••"
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-indigo-500/60 focus:bg-white/8 transition-all"
                />
              </div>
              {error && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
              <button type="submit" disabled={loading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)] flex items-center justify-center gap-2">
                {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <LogIn className="w-4 h-4" />}
                {loading ? "Входим..." : "Войти в аккаунт"}
              </button>
              <p className="text-center text-xs text-white/30">
                Нет аккаунта?{" "}
                <button type="button" onClick={() => { setTab("register"); setError(""); }} className="text-indigo-400 hover:text-indigo-300">
                  Зарегистрироваться
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="text-xs text-white/50 mb-1 block flex items-center gap-1"><User className="w-3 h-3" />Имя</label>
                <input
                  type="text" required autoComplete="name"
                  placeholder="Ваше имя"
                  value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-indigo-500/60 focus:bg-white/8 transition-all"
                />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block flex items-center gap-1"><Mail className="w-3 h-3" />Email</label>
                <input
                  type="email" required autoComplete="email"
                  placeholder="your@email.com"
                  value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-indigo-500/60 focus:bg-white/8 transition-all"
                />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block flex items-center gap-1"><Lock className="w-3 h-3" />Пароль</label>
                <input
                  type="password" required autoComplete="new-password"
                  placeholder="Минимум 6 символов"
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-indigo-500/60 focus:bg-white/8 transition-all"
                />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">Повторите пароль</label>
                <input
                  type="password" required
                  placeholder="••••••••"
                  value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-indigo-500/60 focus:bg-white/8 transition-all"
                />
              </div>
              {error && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
              <button type="submit" disabled={loading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)] flex items-center justify-center gap-2">
                {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <UserPlus className="w-4 h-4" />}
                {loading ? "Создаём аккаунт..." : "Создать аккаунт"}
              </button>
              <p className="text-center text-xs text-white/30">
                Уже есть аккаунт?{" "}
                <button type="button" onClick={() => { setTab("login"); setError(""); }} className="text-indigo-400 hover:text-indigo-300">
                  Войти
                </button>
              </p>
            </form>
          )}
          <p className="text-center text-[10px] text-white/20 mt-4">
            Создавая аккаунт вы соглашаетесь с Terms of Service и Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── MOCK UI COMPONENTS ───────────────────────────────────────────────────────

function MockCRMGrid() {
  const zones = [
    { name: "Arena A", status: "ИДЁТ ИГРА", color: "#6366f1", time: "47m", player: "Андрей С." },
    { name: "Arena B", status: "СВОБОДНО", color: "#8b5cf6", time: null, player: null },
    { name: "VR Solo", status: "ИДЁТ ИГРА", color: "#ec4899", time: "12m", player: "Мария К." },
    { name: "Racing", status: "СВОБОДНО", color: "#f59e0b", time: null, player: null },
    { name: "PS5", status: "ИДЁТ ИГРА", color: "#3b82f6", time: "28m", player: "Дмитрий Н." },
    { name: "Motion", status: "ОБСЛУЖ.", color: "#10b981", time: null, player: null },
  ];

  return (
    <div className="bg-[#0a0c16]/90 border border-white/10 rounded-2xl p-4 backdrop-blur-xl shadow-2xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs font-mono text-white/60">LIVE · 25 мая 2026 · 14:27</span>
        </div>
        <div className="flex gap-1.5">
          <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-mono">3/6 зон</span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-green-500/20 text-green-400 border border-green-500/30 font-mono">8 гостей</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {zones.map((z) => (
          <div key={z.name} className={cn("rounded-xl p-3 border transition-all", z.status === "ИДЁТ ИГРА" ? "border-opacity-40 bg-opacity-10" : "border-white/5 bg-white/3")} style={z.status === "ИДЁТ ИГРА" ? { borderColor: z.color + "60", backgroundColor: z.color + "12" } : {}}>
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: z.color }} />
              <span className="text-[10px] font-semibold text-white/70">{z.name}</span>
            </div>
            <p className={cn("text-[9px] font-bold font-mono tracking-wider", z.status === "ИДЁТ ИГРА" ? "text-green-400" : z.status === "ОБСЛУЖ." ? "text-yellow-400" : "text-white/30")}>
              {z.status}
            </p>
            {z.time && <p className="text-lg font-bold font-mono text-white mt-1">{z.time}</p>}
            {z.player && <p className="text-[9px] text-white/40 truncate">{z.player}</p>}
            {!z.time && <p className="text-xs text-white/15 mt-1">——</p>}
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-white/5 grid grid-cols-3 gap-2">
        {[
          { label: "Выручка сегодня", value: "48 200 ₽", trend: "+14%" },
          { label: "Загрузка", value: "68%", trend: "↑" },
          { label: "Сеансов", value: "24", trend: "" },
        ].map((s) => (
          <div key={s.label} className="text-center">
            <p className="text-base font-bold text-white font-mono">{s.value}</p>
            <p className="text-[9px] text-white/30">{s.label}</p>
            {s.trend && <p className="text-[9px] text-green-400 font-semibold">{s.trend}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function MockDeviceCard({ name, battery, status, game }: { name: string; battery: number; status: "active" | "idle" | "charging"; game?: string }) {
  return (
    <div className={cn("rounded-xl border p-3 transition-all", status === "active" ? "border-indigo-500/40 bg-indigo-500/10" : status === "charging" ? "border-green-500/30 bg-green-500/8" : "border-white/10 bg-white/3")}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-white">{name}</span>
        <div className="flex items-center gap-1">
          <Battery className="w-3 h-3 text-white/40" />
          <span className={cn("text-[10px] font-mono", battery > 50 ? "text-green-400" : battery > 20 ? "text-yellow-400" : "text-red-400")}>{battery}%</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 mb-2">
        <div className={cn("w-1.5 h-1.5 rounded-full", status === "active" ? "bg-green-400 animate-pulse" : status === "charging" ? "bg-yellow-400" : "bg-white/20")} />
        <span className={cn("text-[10px]", status === "active" ? "text-green-400" : status === "charging" ? "text-yellow-400" : "text-white/30")}>
          {status === "active" ? "В игре" : status === "charging" ? "Зарядка" : "Свободен"}
        </span>
      </div>
      {game && <p className="text-[10px] text-white/50 truncate font-mono">{game}</p>}
      <div className="flex gap-1 mt-2">
        {[Play, RotateCcw, Eye, MessageSquare].map((Icon, i) => (
          <button key={i} className="w-6 h-6 rounded bg-white/5 hover:bg-white/15 flex items-center justify-center transition-colors">
            <Icon className="w-3 h-3 text-white/50" />
          </button>
        ))}
      </div>
    </div>
  );
}

function MockBookingWidget() {
  return (
    <div className="bg-[#0d0f1e]/95 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
      <div className="bg-gradient-to-r from-indigo-600/30 to-violet-600/20 p-4 border-b border-white/10">
        <p className="text-sm font-bold text-white">Забронировать VR-приключение</p>
        <p className="text-xs text-white/50">VR Park · Москва, Садовая 12</p>
      </div>
      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          {["Авто", "Вручную", "Пакет"].map((m, i) => (
            <button key={m} className={cn("flex-1 py-2 rounded-lg text-xs font-semibold transition-all", i === 0 ? "bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]" : "bg-white/5 text-white/50 border border-white/10")}>
              {m}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <p className="text-[10px] text-white/40 mb-1">Сколько человек?</p>
            <div className="flex gap-1">
              {[1,2,3,4,5,6].map((n) => (
                <div key={n} className={cn("w-6 h-6 rounded text-[10px] font-bold flex items-center justify-center", n === 4 ? "bg-indigo-600 text-white" : "bg-white/5 text-white/30")}>{n}</div>
              ))}
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <p className="text-[10px] text-white/40 mb-1.5">Выбери дату</p>
            <div className="flex gap-1">
              {["Сб 24", "Вс 25", "Пн 26", "Вт 27"].map((d, i) => (
                <div key={d} className={cn("flex-1 py-1 rounded text-[9px] font-semibold text-center", i === 1 ? "bg-indigo-600 text-white" : "bg-white/5 text-white/30")}>{d}</div>
              ))}
            </div>
          </div>
          <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-3">
            <p className="text-[10px] text-indigo-400 font-semibold mb-1">✨ Рекомендуем для 4 человек:</p>
            <p className="text-xs text-white font-semibold">Arena A · Beat Saber Tournament</p>
            <p className="text-[10px] text-white/50">2 час · от 3 200 ₽</p>
          </div>
        </div>
        <button className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)]">
          Забронировать →
        </button>
      </div>
    </div>
  );
}

function MockAnalytics() {
  const bars = [45, 72, 58, 89, 95, 67, 81, 74, 92, 68, 79, 88];
  return (
    <div className="bg-[#0a0c16]/90 border border-white/10 rounded-2xl p-5 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-bold text-white">Аналитика парка</p>
          <p className="text-xs text-white/40">Май 2026</p>
        </div>
        <div className="flex gap-3 text-xs">
          <span className="text-green-400 font-semibold">↑ +23% выручка</span>
          <span className="text-indigo-400 font-semibold">68% загрузка</span>
        </div>
      </div>
      <div className="flex items-end gap-1 h-20 mb-3">
        {bars.map((h, i) => (
          <div key={i} className="flex-1 rounded-sm" style={{ height: `${h}%`, backgroundColor: i === 4 ? "#6366f1" : i === 8 ? "#8b5cf6" : `rgba(99,102,241,${0.2 + (h / 100) * 0.4})` }} />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/5">
        {[
          { label: "Топ игра", value: "Beat Saber", sub: "312 сеансов" },
          { label: "Брошено броней", value: "12%", sub: "-8% к пр. мес" },
          { label: "Uptime", value: "99.8%", sub: "все устройства" },
        ].map((s) => (
          <div key={s.label} className="bg-white/3 rounded-lg p-2 text-center">
            <p className="text-sm font-bold text-white font-mono">{s.value}</p>
            <p className="text-[9px] text-white/40">{s.label}</p>
            <p className="text-[9px] text-indigo-400">{s.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SECTIONS ────────────────────────────────────────────────────────────────

function Header({ onEnterApp, onOpenAuth }: { onEnterApp: () => void; onOpenAuth: () => void }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [session] = useLocalStorage<AuthSession>("vrpark_auth_session", null);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#070910]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-sm shadow-[0_0_20px_rgba(99,102,241,0.5)]">V</div>
          <span className="font-bold text-white text-lg tracking-tight">VR Park OS</span>
          <span className="hidden sm:inline text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 font-mono">BETA</span>
        </div>

        <nav className="hidden md:flex items-center gap-1 ml-4">
          {["Возможности", "Устройства", "Бронирование", "Аналитика", "Для сетей", "Цены"].map((item) => (
            <button key={item} className="px-3 py-1.5 text-sm text-white/60 hover:text-white rounded-lg hover:bg-white/5 transition-all">
              {item}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2 ml-auto">
          {session ? (
            <button onClick={onEnterApp} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all text-xs text-white/70 hover:text-white">
              <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[10px] font-bold">{session.name[0]}</div>
              {session.name}
            </button>
          ) : (
            <button onClick={onOpenAuth} className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white/70 hover:text-white border border-white/15 hover:border-white/30 bg-white/3 hover:bg-white/8 transition-all">
              <LogIn className="w-3.5 h-3.5" />
              Вход
            </button>
          )}
          <GlowButton variant="primary" className="text-xs px-4 py-2" onClick={onEnterApp}>
            Попробовать бесплатно
            <ArrowRight className="w-3.5 h-3.5" />
          </GlowButton>
          <button className="md:hidden text-white/60 hover:text-white p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-white/5 bg-[#070910]/95 px-4 py-4 space-y-1">
          {["Возможности", "Устройства", "Бронирование", "Аналитика", "Для сетей", "Цены"].map((item) => (
            <button key={item} className="w-full text-left px-3 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-all">
              {item}
            </button>
          ))}
          <div className="pt-2 border-t border-white/5 space-y-2">
            {!session && (
              <button onClick={onOpenAuth} className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white/70 border border-white/15 rounded-xl hover:bg-white/5 transition-all">
                <LogIn className="w-4 h-4" />Войти
              </button>
            )}
            <GlowButton variant="primary" className="w-full justify-center text-sm py-2.5" onClick={onEnterApp}>
              Попробовать бесплатно
            </GlowButton>
          </div>
        </div>
      )}
    </header>
  );
}

function HeroSection({ onEnterApp, onOpenAuth }: { onEnterApp: () => void; onOpenAuth: () => void }) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 md:px-6 pt-20 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "4s" }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "6s", animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-600/5 rounded-full blur-3xl" />
        <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" style={{ animation: "scanline 8s linear infinite" }} />
      </div>

      <div className="relative max-w-7xl w-full mx-auto">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/25 bg-indigo-500/10 text-indigo-400 text-xs font-semibold mb-6 animate-pulse" style={{ animationDuration: "3s" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Realtime · 47 парков онлайн · 1 248 гостей сейчас
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-none mb-6">
            Операционная система
            <br />
            <GradientText>для VR-парков</GradientText>
          </h1>

          <p className="text-base md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed mb-8">
            Брони, устройства, VR-шлемы, аналитика,
            онлайн-запись и управление парком —
            <br className="hidden md:block" />
            в одной realtime системе.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <GlowButton variant="primary" className="px-8 py-3.5 text-base" onClick={onEnterApp}>
              <Play className="w-4 h-4" />
              Попробовать бесплатно
            </GlowButton>
            <GlowButton variant="secondary" className="px-8 py-3.5 text-base" onClick={onOpenAuth}>
              <LogIn className="w-4 h-4" />
              Войти
            </GlowButton>
          </div>
          <p className="text-xs text-white/30 mt-4">Бесплатно 14 дней · Без кредитной карты · Настройка за 1 день</p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600/20 via-violet-600/20 to-cyan-600/20 rounded-2xl blur-xl" />
          <div className="relative"><MockCRMGrid /></div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown className="w-5 h-5 text-white/30" />
      </div>

      <style>{`
        @keyframes scanline { 0% { top: -2%; } 100% { top: 102%; } }
      `}</style>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    { icon: Calendar, title: "Бронирование", color: "from-indigo-500 to-indigo-700", glow: "rgba(99,102,241,0.3)", items: ["Realtime-сетка броней", "Карта парка", "Мультизоны", "Онлайн-оплата"] },
    { icon: Cpu, title: "VR-шлемы", color: "from-violet-500 to-violet-700", glow: "rgba(139,92,246,0.3)", items: ["Telemetry", "Запуск игр", "Streaming", "Remote control"] },
    { icon: Globe, title: "Online Booking", color: "from-pink-500 to-rose-700", glow: "rgba(236,72,153,0.3)", items: ["VR-конструктор", "Пакеты", "AI рекомендации", "Embed виджет"] },
    { icon: BarChart3, title: "Аналитика", color: "from-cyan-500 to-blue-700", glow: "rgba(6,182,212,0.3)", items: ["Загрузка", "Выручка", "Популярность игр", "Воронка броней"] },
    { icon: Layers, title: "Управление сетью", color: "from-amber-500 to-orange-700", glow: "rgba(245,158,11,0.3)", items: ["Multi-location", "Роли сотрудников", "Устройства", "Финансы"] },
  ];
  return (
    <section className="relative py-28 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <SectionBadge>Возможности</SectionBadge>
          <SectionTitle>Всё что нужно<br /><GradientText>VR-парку</GradientText></SectionTitle>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {features.map((f) => (
            <div key={f.title} className="group relative bg-white/3 hover:bg-white/6 border border-white/8 hover:border-white/15 rounded-2xl p-5 transition-all duration-500 cursor-default overflow-hidden">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" style={{ background: `radial-gradient(circle at 50% 0%, ${f.glow} 0%, transparent 70%)` }} />
              <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br mb-4 flex items-center justify-center shadow-lg relative", f.color)}>
                <f.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-sm font-bold text-white mb-3 relative">{f.title}</h3>
              <ul className="space-y-1.5 relative">
                {f.items.map((item) => (
                  <li key={item} className="flex items-center gap-1.5 text-xs text-white/50 group-hover:text-white/70 transition-colors">
                    <Check className="w-3 h-3 text-indigo-400 shrink-0" />{item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function LiveOpsSection() {
  return (
    <section className="relative py-28 px-4 md:px-6 overflow-hidden">
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <SectionBadge>Live Operations</SectionBadge>
            <SectionTitle className="mb-6">Контролируйте весь парк<br /><GradientText>в realtime</GradientText></SectionTitle>
            <p className="text-white/60 text-lg leading-relaxed mb-8">Следите за всеми зонами, запускайте игры, контролируйте устройства, видьте проблемы до того, как их увидит клиент.</p>
            <ul className="space-y-3">
              {[
                { icon: MapPin, text: "Интерактивная карта парка с live-статусами" },
                { icon: Activity, text: "Мониторинг всех устройств в реальном времени" },
                { icon: Bell, text: "Умные оповещения — опоздания, проблемы, загрузка" },
                { icon: RefreshCw, text: "Автоматическая ротация команд и зон" },
              ].map((item) => (
                <li key={item.text} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center shrink-0 mt-0.5">
                    <item.icon className="w-4 h-4 text-indigo-400" />
                  </div>
                  <p className="text-white/70 text-sm leading-relaxed pt-1.5">{item.text}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-indigo-600/10 rounded-3xl blur-2xl" />
            <div className="relative"><MockCRMGrid /></div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DeviceSection() {
  return (
    <section className="relative py-28 px-4 md:px-6 overflow-hidden">
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <div className="order-2 lg:order-1 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <MockDeviceCard name="Pico 4 #1" battery={87} status="active" game="Beat Saber · 32m" />
              <MockDeviceCard name="Quest 3 #2" battery={62} status="active" game="Half-Life · 18m" />
              <MockDeviceCard name="Pico 4 #3" battery={15} status="charging" />
              <MockDeviceCard name="Quest 3 #4" battery={95} status="idle" />
            </div>
            <div className="bg-[#0a0c16]/90 border border-white/10 rounded-2xl p-4">
              <p className="text-xs font-semibold text-white/60 mb-3 font-mono">QUICK ACTIONS</p>
              <div className="grid grid-cols-4 gap-2">
                {[{ icon: Play, label: "Запуск", color: "text-green-400" }, { icon: Eye, label: "Stream", color: "text-indigo-400" }, { icon: RotateCcw, label: "Reboot", color: "text-yellow-400" }, { icon: MessageSquare, label: "Msg", color: "text-violet-400" }].map((a) => (
                  <button key={a.label} className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-white/3 hover:bg-white/8 border border-white/8 hover:border-white/15 transition-all group">
                    <a.icon className={cn("w-4 h-4", a.color)} />
                    <span className="text-[10px] text-white/40 group-hover:text-white/70">{a.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <SectionBadge>VR Device Control</SectionBadge>
            <SectionTitle className="mb-6">Управление VR-шлемами<br /><GradientText>прямо из CRM</GradientText></SectionTitle>
            <p className="text-white/60 text-lg leading-relaxed mb-8">Pico 4, Quest 3, PSVR2 — все устройства под контролем. Запускайте игры, смотрите стрим, управляйте батареями.</p>
            <div className="grid grid-cols-2 gap-3">
              {[{ icon: Gamepad2, text: "Запуск любой игры удалённо" }, { icon: Radio, text: "Live streaming с шлема" }, { icon: Battery, text: "Battery & telemetry" }, { icon: MessageSquare, text: "Overlay сообщения" }, { icon: RotateCcw, text: "Remote reboot" }, { icon: Eye, text: "Мониторинг контента" }].map((item) => (
                <div key={item.text} className="flex items-center gap-2 text-sm text-white/60">
                  <item.icon className="w-4 h-4 text-violet-400 shrink-0" />{item.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BookingSection({ onEnterApp }: { onEnterApp: () => void }) {
  return (
    <section className="relative py-28 px-4 md:px-6 overflow-hidden">
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(99,102,241,0.07) 0%, transparent 70%)" }} />
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <SectionBadge>Online Booking</SectionBadge>
          <SectionTitle>Не форма записи.<br /><GradientText>Конструктор VR-приключений.</GradientText></SectionTitle>
          <p className="text-white/60 text-lg max-w-2xl mx-auto mt-4">Три режима бронирования в одном виджете — автоматический, ручной и пакетный.</p>
        </div>
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <div className="space-y-6">
            {[
              { icon: Zap, label: "Подобрать автоматически", color: "indigo", desc: "CRM задаёт 5 вопросов и предлагает идеальный вариант для группы" },
              { icon: Layers, label: "Собрать вручную", color: "violet", desc: "Как Steam — клиент выбирает зоны, игры и время шаг за шагом" },
              { icon: Package, label: "Выбрать пакет", color: "pink", desc: "Готовые пакеты Birthday, Corporate, Tournament, Full Park" },
            ].map((mode, i) => (
              <div key={mode.label} className="flex gap-4 p-4 rounded-2xl border border-white/8 bg-white/3 hover:bg-white/6 hover:border-white/15 transition-all group cursor-default">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", mode.color === "indigo" ? "bg-indigo-500/20 border border-indigo-500/30" : mode.color === "violet" ? "bg-violet-500/20 border border-violet-500/30" : "bg-pink-500/20 border border-pink-500/30")}>
                  <mode.icon className={cn("w-5 h-5", mode.color === "indigo" ? "text-indigo-400" : mode.color === "violet" ? "text-violet-400" : "text-pink-400")} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white mb-1">{mode.label}</p>
                  <p className="text-xs text-white/50 leading-relaxed">{mode.desc}</p>
                </div>
                <div className="ml-auto text-xs font-mono text-white/20 group-hover:text-white/40 pt-1">0{i + 1}</div>
              </div>
            ))}
            <GlowButton variant="primary" className="w-full justify-center py-3.5 text-sm" onClick={onEnterApp}>
              Открыть конструктор <ArrowRight className="w-4 h-4" />
            </GlowButton>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-violet-600/10 rounded-3xl blur-2xl" />
            <div className="relative"><MockBookingWidget /></div>
          </div>
        </div>
      </div>
    </section>
  );
}

function EventSection() {
  const types = [
    { icon: "🎉", name: "День рождения", color: "from-pink-500/20 to-rose-500/10 border-pink-500/25" },
    { icon: "🏆", name: "Турнир", color: "from-amber-500/20 to-orange-500/10 border-amber-500/25" },
    { icon: "👔", name: "Корпоратив", color: "from-blue-500/20 to-cyan-500/10 border-blue-500/25" },
    { icon: "🌐", name: "Full Park", color: "from-indigo-500/20 to-violet-500/10 border-indigo-500/25" },
  ];
  return (
    <section className="relative py-28 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <SectionBadge>Event Builder</SectionBadge>
          <SectionTitle>Создавайте мероприятия<br /><GradientText>любого масштаба</GradientText></SectionTitle>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {types.map((t) => (
            <div key={t.name} className={cn("bg-gradient-to-b border rounded-2xl p-6 text-center hover:scale-[1.02] transition-transform cursor-default", t.color)}>
              <div className="text-4xl mb-3">{t.icon}</div>
              <p className="font-semibold text-white text-sm">{t.name}</p>
            </div>
          ))}
        </div>
        <div className="bg-[#0a0c16]/90 border border-white/10 rounded-2xl p-5">
          <p className="text-xs font-mono text-white/40 mb-3">TIMELINE · Корпоратив 22 чел · 4 зоны · 16:00 — 20:00</p>
          <div className="space-y-2">
            {[
              { time: "16:00", zones: ["Arena A", "Racing Zone", "VR Solo", "PS5"] },
              { time: "17:30", zones: ["Racing Zone", "Arena A", "PS5", "VR Solo"] },
              { time: "19:00", zones: ["Arena B", "VR Solo", "Arena A", "Racing Zone"] },
            ].map((row) => (
              <div key={row.time} className="flex gap-2 items-center">
                <span className="text-xs font-mono text-white/30 w-12 shrink-0">{row.time}</span>
                {row.zones.map((zone, i) => (
                  <div key={i} className="flex-1 py-1.5 rounded-lg text-center text-[10px] font-semibold bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 truncate px-1">{zone}</div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function AnalyticsSection() {
  return (
    <section className="relative py-28 px-4 md:px-6 overflow-hidden">
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-600/8 rounded-full blur-3xl" />
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <SectionBadge>Аналитика</SectionBadge>
            <SectionTitle className="mb-6">Понимайте, как<br /><GradientText>работает ваш парк</GradientText></SectionTitle>
            <p className="text-white/60 text-lg leading-relaxed mb-8">Не скучные таблицы. Живые графики, heatmaps, воронки броней и инсайты о каждой зоне.</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Загрузка парка", value: "68%", trend: "↑ +12%" },
                { label: "Выручка / мес", value: "1.2M ₽", trend: "↑ +23%" },
                { label: "Брошено броней", value: "12%", trend: "↓ -8%" },
                { label: "Топ игра", value: "Beat Saber", trend: "312 сеансов" },
              ].map((s) => (
                <div key={s.label} className="bg-white/3 border border-white/8 rounded-xl p-3">
                  <p className="text-xl font-black text-white font-mono">{s.value}</p>
                  <p className="text-[10px] text-white/40 mt-0.5">{s.label}</p>
                  <p className="text-[10px] text-indigo-400 font-semibold mt-1">{s.trend}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-cyan-600/8 rounded-3xl blur-2xl" />
            <div className="relative"><MockAnalytics /></div>
          </div>
        </div>
      </div>
    </section>
  );
}

function NetworkSection() {
  return (
    <section className="relative py-28 px-4 md:px-6">
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 100%, rgba(99,102,241,0.08) 0%, transparent 60%)" }} />
      <div className="max-w-7xl mx-auto text-center">
        <SectionBadge>Для сетей парков</SectionBadge>
        <SectionTitle className="mb-4">Управляйте сетью<br /><GradientText>VR-парков</GradientText></SectionTitle>
        <p className="text-white/60 text-lg max-w-2xl mx-auto mb-14">Одна панель для всей сети. Единая аналитика, сотрудники, устройства и финансы.</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-4xl mx-auto">
          {[
            { icon: MapPin, label: "Multi-location", desc: "Все парки в одном интерфейсе" },
            { icon: BarChart3, label: "Единая аналитика", desc: "Сводные отчёты по сети" },
            { icon: Cpu, label: "Все устройства", desc: "Централизованный контроль" },
            { icon: Users, label: "Сотрудники", desc: "Роли и права доступа" },
            { icon: DollarSign, label: "Финансы", desc: "Выручка по каждому парку" },
          ].map((f) => (
            <div key={f.label} className="bg-white/3 border border-white/8 rounded-2xl p-4 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all group">
              <f.icon className="w-7 h-7 text-indigo-400 mx-auto mb-3" />
              <p className="text-xs font-semibold text-white mb-1">{f.label}</p>
              <p className="text-[10px] text-white/40 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MobileSection() {
  return (
    <section className="relative py-28 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <div className="flex justify-center">
            <div className="relative w-56">
              <div className="absolute -inset-8 bg-indigo-600/15 rounded-full blur-3xl" />
              <div className="relative bg-[#0a0c16] border border-white/15 rounded-[2rem] overflow-hidden shadow-2xl">
                <div className="h-6 bg-[#0d0f1e] flex items-center justify-center">
                  <div className="w-16 h-1 rounded-full bg-white/20" />
                </div>
                <div className="p-3 space-y-2">
                  <div className="bg-white/3 border border-white/8 rounded-xl p-3">
                    <p className="text-[10px] font-mono text-indigo-400 mb-2">LIVE · 3/6 зон</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {["Arena A", "VR Solo", "PS5", "Racing"].map((z, i) => (
                        <div key={z} className={cn("rounded-lg p-1.5 text-center text-[8px] font-semibold border", i % 2 === 0 ? "bg-indigo-500/15 border-indigo-500/25 text-indigo-300" : "bg-white/3 border-white/8 text-white/30")}>{z}</div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white/3 border border-white/8 rounded-xl p-2.5">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                      <p className="text-[9px] text-yellow-400 font-semibold">Оповещение</p>
                    </div>
                    <p className="text-[9px] text-white/60">Quest #3 — низкий заряд (8%)</p>
                  </div>
                  <div className="bg-indigo-500/10 border border-indigo-500/25 rounded-xl p-2.5">
                    <p className="text-[9px] text-white/60">Сеансов сегодня</p>
                    <p className="text-lg font-black text-white font-mono">24</p>
                    <p className="text-[9px] text-green-400">↑ +3 к вчера</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <SectionBadge>Mobile Experience</SectionBadge>
            <SectionTitle className="mb-6">Управляйте парком<br /><GradientText>с телефона</GradientText></SectionTitle>
            <p className="text-white/60 text-lg leading-relaxed mb-8">Полноценный мобильный интерфейс. Всё что нужно — у вас в кармане, где бы вы ни находились.</p>
            <div className="space-y-3">
              {[
                { icon: Monitor, text: "Live dashboard с загрузкой парка" },
                { icon: Bell, text: "Push-уведомления о критичных событиях" },
                { icon: Cpu, text: "Управление устройствами прямо с телефона" },
                { icon: Smartphone, text: "PWA + нативное мобильное приложение" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-3">
                  <item.icon className="w-4 h-4 text-indigo-400 shrink-0" />
                  <p className="text-sm text-white/60">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function IntegrationsSection() {
  const integrations = [
    { name: "Pico 4", type: "VR", icon: "🥽" }, { name: "Quest 3", type: "VR", icon: "🎮" },
    { name: "PSVR2", type: "VR", icon: "🕹️" }, { name: "Telegram", type: "Notify", icon: "✈️" },
    { name: "SMS", type: "Notify", icon: "💬" }, { name: "Webhooks", type: "API", icon: "🔗" },
    { name: "REST API", type: "API", icon: "⚡" }, { name: "YooMoney", type: "Оплата", icon: "💳" },
    { name: "Stripe", type: "Оплата", icon: "💰" },
  ];
  return (
    <section className="relative py-28 px-4 md:px-6">
      <div className="max-w-7xl mx-auto text-center">
        <SectionBadge>Интеграции</SectionBadge>
        <SectionTitle className="mb-4">Подключается<br /><GradientText>ко всему</GradientText></SectionTitle>
        <p className="text-white/60 text-lg max-w-xl mx-auto mb-14">Pico, Quest, SMS, Telegram, API, платёжные системы — всё работает из коробки</p>
        <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
          {integrations.map((int) => (
            <div key={int.name} className="flex items-center gap-2.5 px-4 py-2.5 bg-white/3 border border-white/8 rounded-xl hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all">
              <span className="text-lg">{int.icon}</span>
              <div className="text-left">
                <p className="text-xs font-semibold text-white leading-none">{int.name}</p>
                <p className="text-[10px] text-white/40">{int.type}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SocialProofSection() {
  const reviews = [
    { name: "Алексей, VR World", city: "Москва", stars: 5, text: "Запустили за один день. Бронирования выросли на 40% за первый месяц — клиенты могут записаться онлайн в любое время." },
    { name: "Настя, CyberArena", city: "СПб", stars: 5, text: "Управление шлемами через CRM — это то чего нам не хватало. Больше никаких бумажек и путаницы со сменами." },
    { name: "Дима, VR Club", city: "Казань", stars: 5, text: "Конструктор мероприятий просто огонь. Корпоративы стало делать в 3 раза быстрее." },
  ];
  return (
    <section className="relative py-28 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <SectionBadge>Отзывы</SectionBadge>
          <SectionTitle>VR-парки, которые<br /><GradientText>уже работают</GradientText></SectionTitle>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14 max-w-2xl mx-auto">
          {[{ value: "47+", label: "парков в системе" }, { value: "99.8%", label: "uptime" }, { value: "1.2M+", label: "сеансов контролировано" }, { value: "40%", label: "рост конверсии" }].map((s) => (
            <div key={s.label} className="text-center p-4 bg-white/3 border border-white/8 rounded-2xl">
              <p className="text-2xl font-black text-white font-mono">{s.value}</p>
              <p className="text-[11px] text-white/40 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {reviews.map((r) => (
            <div key={r.name} className="bg-white/3 border border-white/8 rounded-2xl p-5 hover:border-indigo-500/25 transition-colors">
              <div className="flex mb-3">
                {Array.from({ length: r.stars }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-sm text-white/70 leading-relaxed mb-4">"{r.text}"</p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-xs font-bold">{r.name[0]}</div>
                <div>
                  <p className="text-xs font-semibold text-white">{r.name}</p>
                  <p className="text-[10px] text-white/40">{r.city}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection({ onEnterApp }: { onEnterApp: () => void }) {
  const plans = [
    { name: "Starter", price: "4 900", period: "/ мес", desc: "Для небольших парков до 6 зон", color: "border-white/10", cta: "Начать бесплатно", features: ["До 6 зон", "2 пользователя", "Online booking", "Базовая аналитика", "Email поддержка"], featured: false },
    { name: "Pro", price: "14 900", period: "/ мес", desc: "Для среднего парка с командой", color: "border-indigo-500/50", cta: "Попробовать Pro", features: ["Неограничено зон", "10 пользователей", "Управление шлемами", "Расширенная аналитика", "Telegram/SMS", "Приоритетная поддержка"], featured: true },
    { name: "Network", price: "По запросу", period: "", desc: "Для сетей от 3+ парков", color: "border-white/10", cta: "Обсудить", features: ["Все парки", "Неограничено пользователей", "Единая аналитика сети", "Кастомный брендинг", "API", "Выделенный менеджер"], featured: false },
  ];
  return (
    <section className="relative py-28 px-4 md:px-6">
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(99,102,241,0.06) 0%, transparent 70%)" }} />
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <SectionBadge>Тарифы</SectionBadge>
          <SectionTitle>Честные цены<br /><GradientText>без скрытых платежей</GradientText></SectionTitle>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div key={plan.name} className={cn("relative bg-white/3 border rounded-2xl p-6 flex flex-col", plan.color, plan.featured && "bg-indigo-500/8 shadow-[0_0_50px_rgba(99,102,241,0.2)]")}>
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full">Популярный</span>
                </div>
              )}
              <p className="text-sm font-bold text-white/60 mb-1">{plan.name}</p>
              <div className="flex items-end gap-1 mb-2">
                <span className="text-3xl font-black text-white">{plan.price}</span>
                <span className="text-white/40 text-sm mb-1">{plan.period}</span>
              </div>
              <p className="text-xs text-white/40 mb-6">{plan.desc}</p>
              <ul className="space-y-2.5 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-white/70">
                    <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <GlowButton variant={plan.featured ? "primary" : "secondary"} className="w-full justify-center" onClick={onEnterApp}>{plan.cta}</GlowButton>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);
  const faqs = [
    { q: "Поддерживается ли Meta Quest 3?", a: "Да, Quest 2, Quest 3 и Quest Pro поддерживаются из коробки. Pico 4 и PSVR2 — тоже." },
    { q: "Нужен ли свой сервер?", a: "Нет. VR Park OS — облачный сервис. Всё работает в браузере. Никакой установки и IT-администрирования." },
    { q: "Как подключаются VR-шлемы?", a: "Через наш агент на шлеме (APK для Android-based устройств). Установка занимает 5 минут на каждый шлем." },
    { q: "Есть ли мобильное приложение?", a: "Да, iOS и Android. Доступно в AppStore и Google Play. Также есть PWA-версия — просто добавьте сайт на экран." },
    { q: "Как работает стриминг с шлема?", a: "Через WebRTC — прямо в браузере, без дополнительного ПО. Задержка менее 100мс в локальной сети." },
    { q: "Как быстро можно запустить?", a: "Базовую настройку — брони, зоны, онлайн-запись — можно сделать за 1 рабочий день. Подключение шлемов — ещё 2-3 часа." },
  ];
  return (
    <section className="relative py-28 px-4 md:px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <SectionBadge>FAQ</SectionBadge>
          <SectionTitle>Частые<br /><GradientText>вопросы</GradientText></SectionTitle>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden hover:border-white/15 transition-colors">
              <button className="w-full flex items-center justify-between px-5 py-4 text-left" onClick={() => setOpen(open === i ? null : i)}>
                <span className="text-sm font-semibold text-white pr-4">{faq.q}</span>
                <ChevronDown className={cn("w-4 h-4 text-white/40 shrink-0 transition-transform", open === i && "rotate-180")} />
              </button>
              {open === i && (
                <div className="px-5 pb-4 pt-0">
                  <p className="text-sm text-white/60 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTASection({ onEnterApp }: { onEnterApp: () => void }) {
  return (
    <section className="relative py-36 px-4 md:px-6 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/12 rounded-full blur-3xl" />
        <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      </div>
      <div className="relative max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/25 bg-indigo-500/10 text-indigo-400 text-xs font-semibold mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Доступно уже сейчас · 14 дней бесплатно
        </div>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight mb-6">
          Постройте VR-парк<br /><GradientText>нового поколения</GradientText>
        </h2>
        <p className="text-xl text-white/60 max-w-2xl mx-auto leading-relaxed mb-10">
          От бронирования до управления устройствами — вся инфраструктура VR-парка в одной системе.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <GlowButton variant="primary" className="px-10 py-4 text-base" onClick={onEnterApp}>
            <Zap className="w-5 h-5" />Попробовать бесплатно
          </GlowButton>
          <GlowButton variant="secondary" className="px-10 py-4 text-base">
            Запросить демо<ArrowRight className="w-4 h-4" />
          </GlowButton>
        </div>
        <p className="text-xs text-white/30 mt-6">Без кредитной карты · Настройка за 1 день · Поддержка 24/7</p>
      </div>
    </section>
  );
}

function Footer() {
  const cols = [
    { title: "Продукт", links: ["Возможности", "Цены", "Интеграции", "Changelog"], hrefs: ["#features", "/pricing", "#integrations", "#changelog"] },
    { title: "Компания", links: ["О нас", "Контакты", "Партнёрам", "Карьера"] },
    { title: "Ресурсы", links: ["Документация", "API Reference", "Поддержка", "Статус"] },
    { title: "Legal", links: ["Privacy Policy", "Terms of Service", "Cookie Policy"] },
  ];
  return (
    <footer className="border-t border-white/5 py-16 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-sm">V</div>
              <span className="font-bold text-white">VR Park OS</span>
            </div>
            <p className="text-xs text-white/40 leading-relaxed mb-4">Операционная система для современных VR-парков</p>
            <div className="flex gap-2">
              {[Twitter, Github, MessageSquare].map((Icon, i) => (
                <button key={i} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/8 flex items-center justify-center transition-colors">
                  <Icon className="w-3.5 h-3.5 text-white/50" />
                </button>
              ))}
            </div>
          </div>
          {cols.map((col) => (
            <div key={col.title}>
              <p className="text-xs font-bold text-white/80 uppercase tracking-wider mb-4">{col.title}</p>
              <ul className="space-y-2.5">
                {col.links.map((link, i) => {
                  const href = (col as any).hrefs?.[i] ?? "#";
                  return (
                    <li key={link}>
                      <a href={href} className="text-sm text-white/40 hover:text-white/80 transition-colors">{link}</a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">© 2026 VR Park OS. Все права защищены.</p>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <p className="text-xs text-white/30 font-mono">All systems operational · 99.8% uptime</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function Landing() {
  const [, navigate] = useLocation();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [session] = useLocalStorage<AuthSession>("vrpark_auth_session", null);

  const goToApp = () => navigate("/dashboard");
  const openAuth = () => setAuthModalOpen(true);
  const handleAuthSuccess = () => { setAuthModalOpen(false); navigate("/dashboard"); };

  return (
    <div className="min-h-screen bg-[#070910] text-white overflow-x-hidden">
      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} onSuccess={handleAuthSuccess} />
      <Header onEnterApp={goToApp} onOpenAuth={openAuth} />
      <HeroSection onEnterApp={goToApp} onOpenAuth={openAuth} />
      <FeaturesSection />
      <LiveOpsSection />
      <DeviceSection />
      <BookingSection onEnterApp={goToApp} />
      <EventSection />
      <AnalyticsSection />
      <NetworkSection />
      <MobileSection />
      <IntegrationsSection />
      <SocialProofSection />
      <PricingSection onEnterApp={goToApp} />
      <FAQSection />
      <FinalCTASection onEnterApp={goToApp} />
      <Footer />
    </div>
  );
}
