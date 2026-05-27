import { useState } from "react";
import { Trophy, Medal, Crown, Swords, Star, Users, Plus, Trash2, Calendar, ChevronDown, ChevronUp, Zap, TrendingUp, Gift, Award, Target, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useLocalStorage } from "@/lib/store";

type Season = { id: string; name: string; start: string; end: string; active: boolean; prize: string };
type Player = { id: string; name: string; score: number; rank: number; wins: number; hours: number; badge: string };
type Tournament = { id: string; name: string; game: string; date: string; players: number; maxPlayers: number; prize: string; status: "upcoming" | "active" | "finished" };

const DEFAULT_SEASONS: Season[] = [
  { id: "s1", name: "Сезон 1 — Весна 2026", start: "2026-03-01", end: "2026-05-31", active: true, prize: "Абонемент 10ч + Мерч" },
  { id: "s2", name: "Сезон 2 — Лето 2026", start: "2026-06-01", end: "2026-08-31", active: false, prize: "VIP-статус 3 месяца" },
];

const DEFAULT_LEADERBOARD: Player[] = [
  { id: "p1", name: "Иван К.",       score: 4820, rank: 1, wins: 23, hours: 48, badge: "👑" },
  { id: "p2", name: "Мария Д.",      score: 4210, rank: 2, wins: 19, hours: 41, badge: "🥈" },
  { id: "p3", name: "Алексей В.",    score: 3990, rank: 3, wins: 17, hours: 38, badge: "🥉" },
  { id: "p4", name: "Сергей П.",     score: 3650, rank: 4, wins: 14, hours: 32, badge: "⚔️" },
  { id: "p5", name: "Наталья Р.",    score: 3440, rank: 5, wins: 12, hours: 29, badge: "⚔️" },
  { id: "p6", name: "Дмитрий М.",    score: 3100, rank: 6, wins: 11, hours: 26, badge: "🎮" },
  { id: "p7", name: "Елена С.",      score: 2870, rank: 7, wins: 9,  hours: 22, badge: "🎮" },
  { id: "p8", name: "Олег Б.",       score: 2540, rank: 8, wins: 8,  hours: 19, badge: "🎮" },
];

const DEFAULT_TOURNAMENTS: Tournament[] = [
  { id: "t1", name: "Гран-при Arena A", game: "VR Арена — Командный бой", date: "2026-06-07", players: 8, maxPlayers: 16, prize: "5 000 ₽ + трофей", status: "upcoming" },
  { id: "t2", name: "Скоростной заезд", game: "Racing Zone", date: "2026-05-31", players: 6, maxPlayers: 8, prize: "3 сессии бесплатно", status: "active" },
  { id: "t3", name: "VR Solo Cup", game: "VR Solo — Одиночный", date: "2026-05-15", players: 12, maxPlayers: 12, prize: "2 000 ₽", status: "finished" },
];

const RANKS = [
  { name: "Новичок",     min: 0,    max: 999,   color: "text-slate-400",  bg: "bg-slate-500/10 border-slate-500/20",  icon: "🎮" },
  { name: "Боец",        min: 1000, max: 2499,  color: "text-blue-400",   bg: "bg-blue-500/10 border-blue-500/20",   icon: "⚔️" },
  { name: "Ветеран",     min: 2500, max: 3999,  color: "text-emerald-400",bg: "bg-emerald-500/10 border-emerald-500/20", icon: "🛡️" },
  { name: "Мастер",      min: 4000, max: 5999,  color: "text-amber-400",  bg: "bg-amber-500/10 border-amber-500/20",  icon: "🏆" },
  { name: "Чемпион",     min: 6000, max: 99999, color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20", icon: "👑" },
];

function getRank(score: number) {
  return RANKS.find(r => score >= r.min && score <= r.max) ?? RANKS[0];
}

export default function Leagues() {
  const [seasons, setSeasons] = useLocalStorage<Season[]>("vrpark_seasons", DEFAULT_SEASONS);
  const [leaderboard] = useLocalStorage<Player[]>("vrpark_leaderboard", DEFAULT_LEADERBOARD);
  const [tournaments, setTournaments] = useLocalStorage<Tournament[]>("vrpark_tournaments", DEFAULT_TOURNAMENTS);
  const [tab, setTab] = useState<"leaderboard" | "tournaments" | "seasons" | "ranks">("leaderboard");
  const [addTournOpen, setAddTournOpen] = useState(false);
  const [tournForm, setTournForm] = useState({ name: "", game: "", date: "", maxPlayers: "16", prize: "" });
  const [expandedPlayer, setExpandedPlayer] = useState<string | null>(null);

  const addTournament = () => {
    if (!tournForm.name.trim()) { toast.error("Введите название"); return; }
    setTournaments(ts => [...ts, {
      id: `t_${Date.now()}`,
      name: tournForm.name,
      game: tournForm.game || "VR Арена",
      date: tournForm.date || new Date().toISOString().slice(0, 10),
      players: 0,
      maxPlayers: Number(tournForm.maxPlayers),
      prize: tournForm.prize || "—",
      status: "upcoming",
    }]);
    toast.success(`Турнир «${tournForm.name}» создан`);
    setTournForm({ name: "", game: "", date: "", maxPlayers: "16", prize: "" });
    setAddTournOpen(false);
  };

  return (
    <div className="flex flex-col h-full">
      <header className="h-14 border-b border-border/50 flex items-center justify-between px-4 md:px-6 bg-card/50 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/20 flex items-center justify-center">
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h1 className="text-sm font-bold leading-none">Лиги и рейтинги</h1>
            <p className="text-[10px] text-muted-foreground mt-0.5">Турниры · Лидерборды · Сезоны · Ранги</p>
          </div>
        </div>
        <div className="flex gap-2">
          {tab === "tournaments" && (
            <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={() => setAddTournOpen(true)}>
              <Plus className="w-3.5 h-3.5" /> Турнир
            </Button>
          )}
        </div>
      </header>

      {/* Tab bar */}
      <div className="flex gap-1 px-4 md:px-6 pt-4 pb-0 shrink-0 overflow-x-auto">
        {([
          { key: "leaderboard", icon: Crown,    label: "Лидерборд" },
          { key: "tournaments", icon: Swords,   label: "Турниры" },
          { key: "seasons",     icon: Calendar, label: "Сезоны" },
          { key: "ranks",       icon: Medal,    label: "Ранги" },
        ] as const).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
              tab === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted/20"
            )}
          >
            <t.icon className="w-3.5 h-3.5" /> {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-6 pt-4 pb-20 md:pb-6 space-y-4">

        {/* LEADERBOARD */}
        {tab === "leaderboard" && (
          <>
            {/* Top-3 podium */}
            <div className="grid grid-cols-3 gap-3">
              {leaderboard.slice(0, 3).map((p, i) => {
                const rank = getRank(p.score);
                const podiumColors = ["bg-amber-500/15 border-amber-500/30", "bg-slate-500/10 border-slate-400/20", "bg-orange-600/10 border-orange-600/20"];
                return (
                  <div key={p.id} className={cn("rounded-2xl border p-3 text-center space-y-1.5", podiumColors[i])}>
                    <div className="text-2xl">{p.badge}</div>
                    <p className="text-xs font-bold truncate">{p.name}</p>
                    <p className="text-lg font-black tabular-nums">{p.score.toLocaleString()}</p>
                    <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full border font-bold", rank.bg, rank.color)}>{rank.icon} {rank.name}</span>
                    <p className="text-[10px] text-muted-foreground">{p.wins} побед · {p.hours}ч</p>
                  </div>
                );
              })}
            </div>

            {/* Full list */}
            <Card className="bg-card/30 border-border/50">
              <CardContent className="px-4 py-3 space-y-1.5">
                {leaderboard.map((p, i) => {
                  const rank = getRank(p.score);
                  const expanded = expandedPlayer === p.id;
                  const maxScore = leaderboard[0].score;
                  return (
                    <div key={p.id}>
                      <button
                        className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted/10 transition-all text-left"
                        onClick={() => setExpandedPlayer(expanded ? null : p.id)}
                      >
                        <span className={cn("text-xs font-black w-6 text-center", i < 3 ? "text-amber-400" : "text-muted-foreground/40")}>#{p.rank}</span>
                        <div className="w-8 h-8 rounded-full bg-muted/20 border border-border/30 flex items-center justify-center text-sm">{p.badge}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-xs font-semibold">{p.name}</p>
                            <span className={cn("text-[9px] px-1 py-0.5 rounded-full border", rank.bg, rank.color)}>{rank.name}</span>
                          </div>
                          <div className="w-full h-1 rounded-full bg-muted/20">
                            <div className="h-full rounded-full bg-primary/60 transition-all" style={{ width: `${(p.score / maxScore) * 100}%` }} />
                          </div>
                        </div>
                        <span className="text-sm font-black tabular-nums text-right">{p.score.toLocaleString()}</span>
                        {expanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
                      </button>
                      {expanded && (
                        <div className="ml-17 ml-[68px] grid grid-cols-3 gap-2 pb-2 px-2">
                          {[
                            { label: "Побед", value: p.wins },
                            { label: "Часов в игре", value: `${p.hours}ч` },
                            { label: "Очков", value: p.score.toLocaleString() },
                          ].map(s => (
                            <div key={s.label} className="rounded-lg bg-muted/10 border border-border/30 p-2 text-center">
                              <p className="text-xs font-bold">{s.value}</p>
                              <p className="text-[10px] text-muted-foreground">{s.label}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </>
        )}

        {/* TOURNAMENTS */}
        {tab === "tournaments" && (
          <div className="space-y-3">
            {tournaments.map(t => {
              const statusMap = {
                upcoming: { label: "Скоро",   cls: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
                active:   { label: "Идёт",    cls: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
                finished: { label: "Завершён", cls: "text-muted-foreground bg-muted/10 border-border/30" },
              };
              const st = statusMap[t.status];
              const fill = Math.round((t.players / t.maxPlayers) * 100);
              return (
                <Card key={t.id} className="bg-card/30 border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={cn("w-10 h-10 rounded-xl border flex items-center justify-center shrink-0", t.status === "active" ? "bg-emerald-500/10 border-emerald-500/20" : "bg-amber-500/10 border-amber-500/20")}>
                        <Swords className={cn("w-4 h-4", t.status === "active" ? "text-emerald-400" : "text-amber-400")} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <p className="text-sm font-bold">{t.name}</p>
                          <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full border", st.cls)}>{st.label}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{t.game}</p>
                        <div className="flex items-center gap-4 mt-2 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{t.date}</span>
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{t.players}/{t.maxPlayers}</span>
                          <span className="flex items-center gap-1"><Gift className="w-3 h-3" />{t.prize}</span>
                        </div>
                        <div className="mt-2 w-full h-1.5 rounded-full bg-muted/20">
                          <div className="h-full rounded-full bg-primary/60" style={{ width: `${fill}%` }} />
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{fill}% заполнено</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {t.status === "upcoming" && (
                          <Button size="sm" className="h-7 text-xs" onClick={() => { setTournaments(ts => ts.map(x => x.id === t.id ? { ...x, status: "active" } : x)); toast.success("Турнир запущен!"); }}>
                            Старт
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => { if (confirm("Удалить турнир?")) { setTournaments(ts => ts.filter(x => x.id !== t.id)); toast.success("Удалено"); } }}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {tournaments.length === 0 && (
              <div className="text-center py-12 text-muted-foreground space-y-2">
                <Swords className="w-8 h-8 mx-auto opacity-20" />
                <p className="text-sm">Нет турниров</p>
                <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setAddTournOpen(true)}><Plus className="w-3.5 h-3.5 mr-1" />Создать первый</Button>
              </div>
            )}
          </div>
        )}

        {/* SEASONS */}
        {tab === "seasons" && (
          <div className="space-y-3">
            {seasons.map(s => (
              <Card key={s.id} className={cn("border-border/50", s.active ? "bg-primary/5 border-primary/20" : "bg-card/20")}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-xl border flex items-center justify-center shrink-0", s.active ? "bg-amber-500/15 border-amber-500/25" : "bg-muted/20 border-border/30")}>
                      <Calendar className={cn("w-4 h-4", s.active ? "text-amber-400" : "text-muted-foreground")} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <p className="text-sm font-bold">{s.name}</p>
                        {s.active && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">Активный</span>}
                      </div>
                      <p className="text-[11px] text-muted-foreground">{s.start} — {s.end}</p>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5"><Gift className="w-3 h-3" />{s.prize}</p>
                    </div>
                    <Switch checked={s.active} onCheckedChange={v => { setSeasons(ss => ss.map(x => x.id === s.id ? { ...x, active: v } : x)); toast.success(v ? "Сезон активирован" : "Сезон приостановлен"); }} />
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={() => {
              const id = `s_${Date.now()}`;
              setSeasons(ss => [...ss, { id, name: `Сезон ${ss.length + 1}`, start: new Date().toISOString().slice(0,10), end: "", active: false, prize: "" }]);
              toast.success("Новый сезон добавлен");
            }}>
              <Plus className="w-3.5 h-3.5" /> Добавить сезон
            </Button>
          </div>
        )}

        {/* RANKS */}
        {tab === "ranks" && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">Система рангов определяет статус игрока на основе накопленных очков. Очки начисляются за сессии, победы в турнирах и активность.</p>
            {RANKS.map(r => (
              <div key={r.name} className={cn("rounded-xl border p-4 flex items-center gap-4", r.bg)}>
                <span className="text-3xl">{r.icon}</span>
                <div className="flex-1">
                  <p className={cn("text-sm font-bold", r.color)}>{r.name}</p>
                  <p className="text-[11px] text-muted-foreground">{r.min.toLocaleString()} – {r.max >= 99999 ? "∞" : r.max.toLocaleString()} очков</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Игроков</p>
                  <p className="text-sm font-bold">{DEFAULT_LEADERBOARD.filter(p => p.score >= r.min && p.score <= r.max).length}</p>
                </div>
              </div>
            ))}
            <Card className="bg-card/30 border-border/50">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm flex items-center gap-2"><Zap className="w-4 h-4 text-amber-400" />Начисление очков</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-2">
                {[
                  { action: "Сессия 30 мин", points: "+50 очков" },
                  { action: "Сессия 60 мин", points: "+120 очков" },
                  { action: "Победа в турнире", points: "+500 очков" },
                  { action: "2-е место турнира", points: "+250 очков" },
                  { action: "Приглашение друга", points: "+100 очков" },
                  { action: "День рождения (визит)", points: "+200 очков" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg border border-border/30 bg-card/10">
                    <span className="text-xs">{item.action}</span>
                    <span className="text-xs font-bold text-emerald-400">{item.points}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Add tournament dialog */}
      <Dialog open={addTournOpen} onOpenChange={setAddTournOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Создать турнир</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1"><Label className="text-xs">Название</Label><Input className="h-8 text-sm" placeholder="Гран-при Arena A" value={tournForm.name} onChange={e => setTournForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="space-y-1"><Label className="text-xs">Игра / зона</Label><Input className="h-8 text-sm" placeholder="VR Арена — Командный бой" value={tournForm.game} onChange={e => setTournForm(f => ({ ...f, game: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1"><Label className="text-xs">Дата</Label><Input type="date" className="h-8 text-xs" value={tournForm.date} onChange={e => setTournForm(f => ({ ...f, date: e.target.value }))} /></div>
              <div className="space-y-1">
                <Label className="text-xs">Макс. игроков</Label>
                <Select value={tournForm.maxPlayers} onValueChange={v => setTournForm(f => ({ ...f, maxPlayers: v }))}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{["4","8","16","32","64"].map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1"><Label className="text-xs">Приз</Label><Input className="h-8 text-sm" placeholder="5 000 ₽ + трофей" value={tournForm.prize} onChange={e => setTournForm(f => ({ ...f, prize: e.target.value }))} /></div>
          </div>
          <div className="flex gap-2 mt-2">
            <Button variant="outline" className="flex-1 h-9 text-sm" onClick={() => setAddTournOpen(false)}>Отмена</Button>
            <Button className="flex-1 h-9 text-sm" onClick={addTournament}>Создать</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
