import { useState, useMemo } from "react";
import { Trophy, Medal, Crown, Swords, Star, Users, Plus, Trash2, Calendar, ChevronDown, ChevronUp, Zap, TrendingUp, Gift, Award, Target, Clock, Shield, CheckCircle2, AlertTriangle, UserCheck, Ban, Search, X, Edit2, Gamepad2, Filter } from "lucide-react";
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

// ─── Types ──────────────────────────────────────────────────────────────────

type Season = {
  id: string; name: string; start: string; end: string; active: boolean;
  prize: string; games: string[];
};

type VRPlayer = {
  id: string; nickname: string; elo: number; matches: number; wins: number;
  kills: number; verified: boolean; linkedPhone?: string; primaryGame: string;
  lastSeen: string; teamId?: string;
};

type League = {
  id: string; name: string; game: string; seasonId: string;
  system: "elo" | "points" | "kills"; minMatches: number;
  playersCount: number; matchesCount: number; leaderNick?: string; active: boolean;
};

type GameSession = {
  id: string; game: string; date: string; leagueId?: string;
  results: { nickname: string; kills: number; place: number }[];
};

type Team = {
  id: string; name: string; company?: string; playerNicks: string[];
  matches: number; wins: number; elo: number;
};

type Tournament = {
  id: string; name: string; game: string; date: string;
  players: number; maxPlayers: number; prize: string;
  status: "upcoming" | "active" | "finished";
};

// ─── Mock data ───────────────────────────────────────────────────────────────

const GAMES = ["Breachers", "Contractors", "Pavlov", "Arizona Sunshine", "VR Арена", "Racing Zone"];

const DEFAULT_SEASONS: Season[] = [
  { id: "s1", name: "Весна 2026", start: "2026-03-01", end: "2026-05-31", active: false, prize: "Абонемент 10ч + Мерч", games: ["Breachers", "Contractors"] },
  { id: "s2", name: "Лето 2026",  start: "2026-06-01", end: "2026-08-31", active: true,  prize: "VIP-статус 3 месяца",  games: ["Breachers", "Contractors", "Pavlov", "Arizona Sunshine"] },
];

const DEFAULT_PLAYERS: VRPlayer[] = [
  { id: "p1", nickname: "GhostHunter", elo: 2140, matches: 142, wins: 78, kills: 1851, verified: true,  linkedPhone: "+7 916 123-45-67", primaryGame: "Breachers",   lastSeen: "2026-06-01" },
  { id: "p2", nickname: "M4x",         elo: 1980, matches: 97,  wins: 61, kills: 1420, verified: true,  linkedPhone: "+7 903 987-65-43", primaryGame: "Breachers",   lastSeen: "2026-06-01" },
  { id: "p3", nickname: "Sniper_VR",   elo: 1750, matches: 58,  wins: 32, kills: 890,  verified: true,  primaryGame: "Pavlov",           lastSeen: "2026-05-30" },
  { id: "p4", nickname: "AlexVR",      elo: 1540, matches: 41,  wins: 21, kills: 540,  verified: true,  primaryGame: "Contractors",      lastSeen: "2026-05-28" },
  { id: "p5", nickname: "Tank",        elo: 1320, matches: 28,  wins: 14, kills: 380,  verified: false, primaryGame: "Breachers",        lastSeen: "2026-05-25" },
  { id: "p6", nickname: "Doctor",      elo: 1100, matches: 19,  wins: 8,  kills: 210,  verified: false, primaryGame: "Contractors",      lastSeen: "2026-05-22" },
  { id: "p7", nickname: "NightRaider", elo: 2350, matches: 201, wins: 124,kills: 2740, verified: true,  linkedPhone: "+7 977 345-67-89", primaryGame: "Pavlov",       lastSeen: "2026-06-02" },
  { id: "p8", nickname: "Fury",        elo: 890,  matches: 12,  wins: 5,  kills: 140,  verified: false, primaryGame: "Arizona Sunshine", lastSeen: "2026-05-15" },
];

const DEFAULT_LEAGUES: League[] = [
  { id: "l1", name: "Лига Breachers",    game: "Breachers",   seasonId: "s2", system: "elo", minMatches: 5, playersCount: 47,  matchesCount: 312, leaderNick: "NightRaider", active: true },
  { id: "l2", name: "Лига Contractors",  game: "Contractors", seasonId: "s2", system: "elo", minMatches: 5, playersCount: 29,  matchesCount: 198, leaderNick: "GhostHunter", active: true },
  { id: "l3", name: "Лига Pavlov",       game: "Pavlov",      seasonId: "s2", system: "elo", minMatches: 3, playersCount: 18,  matchesCount: 94,  leaderNick: "Sniper_VR",   active: true },
  { id: "l4", name: "Лига Arizona",      game: "Arizona Sunshine", seasonId: "s2", system: "kills", minMatches: 3, playersCount: 12, matchesCount: 61, leaderNick: "GhostHunter", active: true },
  { id: "l5", name: "Весенняя Breachers",game: "Breachers",   seasonId: "s1", system: "elo", minMatches: 5, playersCount: 38,  matchesCount: 256, leaderNick: "GhostHunter", active: false },
];

const DEFAULT_SESSIONS: GameSession[] = [
  { id: "gs1", game: "Breachers",   date: "2026-06-02", leagueId: "l1", results: [{ nickname: "GhostHunter", kills: 18, place: 1 }, { nickname: "M4x", kills: 15, place: 2 }, { nickname: "Tank", kills: 7, place: 3 }] },
  { id: "gs2", game: "Pavlov",      date: "2026-06-01", leagueId: "l3", results: [{ nickname: "Sniper_VR", kills: 22, place: 1 }, { nickname: "NightRaider", kills: 19, place: 2 }, { nickname: "AlexVR", kills: 12, place: 3 }] },
  { id: "gs3", game: "Contractors", date: "2026-05-31", leagueId: "l2", results: [{ nickname: "NightRaider", kills: 16, place: 1 }, { nickname: "Doctor", kills: 9, place: 2 }, { nickname: "Fury", kills: 6, place: 3 }] },
  { id: "gs4", game: "Breachers",   date: "2026-05-30", leagueId: "l1", results: [{ nickname: "M4x", kills: 20, place: 1 }, { nickname: "GhostHunter", kills: 17, place: 2 }, { nickname: "AlexVR", kills: 8, place: 3 }] },
];

const DEFAULT_TEAMS: Team[] = [
  { id: "tm1", name: "Alpha Squad", company: "Сбербанк",     playerNicks: ["GhostHunter", "M4x", "Tank"],    matches: 22, wins: 15, elo: 1950 },
  { id: "tm2", name: "VR Wolves",   company: "Яндекс",       playerNicks: ["NightRaider", "Sniper_VR"],       matches: 31, wins: 19, elo: 2100 },
  { id: "tm3", name: "Nexus",       company: "",              playerNicks: ["AlexVR", "Doctor", "Fury"],       matches: 14, wins: 7,  elo: 1250 },
];

const DEFAULT_TOURNAMENTS: Tournament[] = [
  { id: "t1", name: "Гран-при Лето 2026",   game: "Breachers",   date: "2026-07-05", players: 8,  maxPlayers: 16, prize: "5 000 ₽ + трофей",    status: "upcoming" },
  { id: "t2", name: "Pavlov Open",           game: "Pavlov",      date: "2026-06-15", players: 6,  maxPlayers: 8,  prize: "3 сессии бесплатно",   status: "upcoming" },
  { id: "t3", name: "Breachers Spring Cup",  game: "Breachers",   date: "2026-05-15", players: 12, maxPlayers: 12, prize: "2 000 ₽",              status: "finished" },
];

const DEFAULT_EXCLUDED: string[] = ["Guest", "Player", "Player1", "Player2", "QuestUser", "Admin", "Test", "Unknown", "AAA", "123"];
const EXCLUDED_PATTERNS = ["Guest*", "Player*", "Test*", "Admin*", "Unknown*", "Quest*"];

const RANKS = [
  { name: "Новичок",  min: 0,    max: 999,   color: "text-slate-400",   bg: "bg-slate-500/10 border-slate-500/20",     icon: "🎮" },
  { name: "Боец",     min: 1000, max: 1499,  color: "text-blue-400",    bg: "bg-blue-500/10 border-blue-500/20",       icon: "⚔️" },
  { name: "Ветеран",  min: 1500, max: 1999,  color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", icon: "🛡️" },
  { name: "Мастер",   min: 2000, max: 2499,  color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/20",     icon: "🏆" },
  { name: "Чемпион",  min: 2500, max: 99999, color: "text-violet-400",  bg: "bg-violet-500/10 border-violet-500/20",   icon: "👑" },
];

function getRank(elo: number) {
  return RANKS.find(r => elo >= r.min && elo <= r.max) ?? RANKS[0];
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function Leagues() {
  const [seasons, setSeasons] = useLocalStorage<Season[]>("vrpark_seasons_v2", DEFAULT_SEASONS);
  const [players, setPlayers] = useLocalStorage<VRPlayer[]>("vrpark_players", DEFAULT_PLAYERS);
  const [leagues, setLeagues] = useLocalStorage<League[]>("vrpark_leagues", DEFAULT_LEAGUES);
  const [sessions, setSessions] = useLocalStorage<GameSession[]>("vrpark_sessions", DEFAULT_SESSIONS);
  const [teams, setTeams] = useLocalStorage<Team[]>("vrpark_teams", DEFAULT_TEAMS);
  const [tournaments, setTournaments] = useLocalStorage<Tournament[]>("vrpark_tournaments", DEFAULT_TOURNAMENTS);
  const [excluded, setExcluded] = useLocalStorage<string[]>("vrpark_excluded_nicks", DEFAULT_EXCLUDED);

  const [tab, setTab] = useState<"leaderboard" | "players" | "leagues" | "sessions" | "teams" | "seasons" | "settings">("leaderboard");

  // filters
  const [gameFilter, setGameFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [expandedPlayer, setExpandedPlayer] = useState<string | null>(null);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  // dialogs
  const [addPlayerOpen, setAddPlayerOpen] = useState(false);
  const [playerForm, setPlayerForm] = useState({ nickname: "", primaryGame: "Breachers", linkedPhone: "" });
  const [addLeagueOpen, setAddLeagueOpen] = useState(false);
  const [leagueForm, setLeagueForm] = useState({ name: "", game: "Breachers", seasonId: "s2", system: "elo" as League["system"], minMatches: "5" });
  const [addSeasonOpen, setAddSeasonOpen] = useState(false);
  const [seasonForm, setSeasonForm] = useState({ name: "", start: "", end: "", prize: "", games: [] as string[] });
  const [addTournOpen, setAddTournOpen] = useState(false);
  const [tournForm, setTournForm] = useState({ name: "", game: "Breachers", date: "", maxPlayers: "16", prize: "" });
  const [addTeamOpen, setAddTeamOpen] = useState(false);
  const [teamForm, setTeamForm] = useState({ name: "", company: "", nicks: "" });
  const [newExcluded, setNewExcluded] = useState("");
  const [addSessionOpen, setAddSessionOpen] = useState(false);
  const [sessionForm, setSessionForm] = useState({ game: "Breachers", leagueId: "", results: "" });
  const [mergeOpen, setMergeOpen] = useState(false);
  const [mergeNick, setMergeNick] = useState("");
  const [mergeTarget, setMergeTarget] = useState("");

  const activeSeason = seasons.find(s => s.active);

  // Leaderboard sorted by ELO, respecting game filter
  const filteredLeaderboard = useMemo(() => {
    let list = [...players].sort((a, b) => b.elo - a.elo);
    if (gameFilter !== "all") list = list.filter(p => p.primaryGame === gameFilter);
    if (search) list = list.filter(p => p.nickname.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [players, gameFilter, search]);

  // ── Actions ─────────────────────────────────────────────────────────────────

  const addPlayer = () => {
    if (!playerForm.nickname.trim()) { toast.error("Введите никнейм"); return; }
    const nick = playerForm.nickname.trim();
    const isExcluded = excluded.some(e => e.toLowerCase() === nick.toLowerCase()) ||
      EXCLUDED_PATTERNS.some(p => { const prefix = p.replace("*", ""); return nick.toLowerCase().startsWith(prefix.toLowerCase()); });
    if (isExcluded) { toast.error(`Ник «${nick}» в списке исключений`); return; }
    if (players.find(p => p.nickname.toLowerCase() === nick.toLowerCase())) { toast.error("Игрок с таким ником уже есть"); return; }
    setPlayers(ps => [...ps, {
      id: `p_${Date.now()}`, nickname: nick, elo: 1000, matches: 0, wins: 0, kills: 0,
      verified: !!playerForm.linkedPhone, linkedPhone: playerForm.linkedPhone || undefined,
      primaryGame: playerForm.primaryGame, lastSeen: new Date().toISOString().slice(0, 10),
    }]);
    toast.success(`Игрок «${nick}» добавлен`);
    setPlayerForm({ nickname: "", primaryGame: "Breachers", linkedPhone: "" });
    setAddPlayerOpen(false);
  };

  const verifyPlayer = (id: string) => {
    setPlayers(ps => ps.map(p => p.id === id ? { ...p, verified: true } : p));
    toast.success("Игрок подтверждён");
  };

  const deletePlayer = (id: string) => {
    if (!confirm("Удалить игрока из базы?")) return;
    setPlayers(ps => ps.filter(p => p.id !== id));
    toast.success("Игрок удалён");
  };

  const addLeague = () => {
    if (!leagueForm.name.trim()) { toast.error("Введите название"); return; }
    setLeagues(ls => [...ls, {
      id: `l_${Date.now()}`, name: leagueForm.name, game: leagueForm.game,
      seasonId: leagueForm.seasonId, system: leagueForm.system,
      minMatches: Number(leagueForm.minMatches), playersCount: 0, matchesCount: 0, active: true,
    }]);
    toast.success(`Лига «${leagueForm.name}» создана`);
    setLeagueForm({ name: "", game: "Breachers", seasonId: activeSeason?.id ?? "s2", system: "elo", minMatches: "5" });
    setAddLeagueOpen(false);
  };

  const addSeason = () => {
    if (!seasonForm.name.trim() || !seasonForm.start || !seasonForm.end) { toast.error("Заполните поля"); return; }
    setSeasons(ss => [...ss, {
      id: `s_${Date.now()}`, name: seasonForm.name, start: seasonForm.start,
      end: seasonForm.end, prize: seasonForm.prize, games: seasonForm.games, active: false,
    }]);
    toast.success(`Сезон «${seasonForm.name}» создан`);
    setSeasonForm({ name: "", start: "", end: "", prize: "", games: [] });
    setAddSeasonOpen(false);
  };

  const addTournament = () => {
    if (!tournForm.name.trim()) { toast.error("Введите название"); return; }
    setTournaments(ts => [...ts, {
      id: `t_${Date.now()}`, name: tournForm.name, game: tournForm.game || "Breachers",
      date: tournForm.date || new Date().toISOString().slice(0, 10),
      players: 0, maxPlayers: Number(tournForm.maxPlayers), prize: tournForm.prize || "—", status: "upcoming",
    }]);
    toast.success(`Турнир «${tournForm.name}» создан`);
    setTournForm({ name: "", game: "Breachers", date: "", maxPlayers: "16", prize: "" });
    setAddTournOpen(false);
  };

  const addTeam = () => {
    if (!teamForm.name.trim()) { toast.error("Введите название команды"); return; }
    const nicks = teamForm.nicks.split(",").map(s => s.trim()).filter(Boolean);
    setTeams(ts => [...ts, { id: `tm_${Date.now()}`, name: teamForm.name, company: teamForm.company, playerNicks: nicks, matches: 0, wins: 0, elo: 1000 }]);
    toast.success(`Команда «${teamForm.name}» создана`);
    setTeamForm({ name: "", company: "", nicks: "" });
    setAddTeamOpen(false);
  };

  const addSession = () => {
    const lines = sessionForm.results.trim().split("\n").filter(Boolean);
    const results = lines.map((line, i) => {
      const parts = line.split(/\s+/);
      const kills = parseInt(parts[parts.length - 1]) || 0;
      const nickname = parts.slice(0, -1).join(" ");
      return { nickname, kills, place: i + 1 };
    });
    if (!results.length) { toast.error("Введите результаты"); return; }
    setSessions(ss => [...ss, {
      id: `gs_${Date.now()}`, game: sessionForm.game, date: new Date().toISOString().slice(0, 10),
      leagueId: sessionForm.leagueId || undefined, results,
    }]);
    // Update player stats
    setPlayers(ps => ps.map(p => {
      const r = results.find(r => r.nickname.toLowerCase() === p.nickname.toLowerCase());
      if (!r) return p;
      const won = r.place === 1 ? 1 : 0;
      const eloChange = r.place === 1 ? 30 : r.place === 2 ? 15 : r.place <= 3 ? 5 : -10;
      return { ...p, matches: p.matches + 1, wins: p.wins + won, kills: p.kills + r.kills, elo: Math.max(500, p.elo + eloChange), lastSeen: new Date().toISOString().slice(0, 10), verified: p.verified || p.matches + 1 >= 3 };
    }));
    toast.success("Сессия записана, ELO обновлён");
    setSessionForm({ game: "Breachers", leagueId: "", results: "" });
    setAddSessionOpen(false);
  };

  const addExcluded = () => {
    const nick = newExcluded.trim();
    if (!nick) return;
    if (excluded.includes(nick)) { toast.error("Уже в списке"); return; }
    setExcluded(e => [...e, nick]);
    setNewExcluded("");
    toast.success(`«${nick}» добавлен в исключения`);
  };

  const mergePlayers = () => {
    if (!mergeNick || !mergeTarget) { toast.error("Выберите ников"); return; }
    if (mergeNick === mergeTarget) { toast.error("Один и тот же игрок"); return; }
    const from = players.find(p => p.nickname === mergeNick);
    const to = players.find(p => p.nickname === mergeTarget);
    if (!from || !to) { toast.error("Игроки не найдены"); return; }
    setPlayers(ps => ps
      .filter(p => p.nickname !== mergeNick)
      .map(p => p.nickname === mergeTarget ? {
        ...p, matches: p.matches + from.matches, wins: p.wins + from.wins,
        kills: p.kills + from.kills, elo: Math.round((p.elo + from.elo) / 2),
      } : p)
    );
    toast.success(`«${mergeNick}» объединён с «${mergeTarget}»`);
    setMergeOpen(false);
    setMergeNick(""); setMergeTarget("");
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  const tabItems = [
    { key: "leaderboard", icon: Crown,    label: "Лидерборд" },
    { key: "players",     icon: Users,    label: "Игроки" },
    { key: "leagues",     icon: Swords,   label: "Лиги" },
    { key: "sessions",    icon: Gamepad2, label: "Сессии" },
    { key: "teams",       icon: Shield,   label: "Команды" },
    { key: "seasons",     icon: Calendar, label: "Сезоны" },
    { key: "settings",    icon: Ban,      label: "Настройки" },
  ] as const;

  const totalMatches = sessions.length;
  const verifiedCount = players.filter(p => p.verified).length;
  const activeLeagues = leagues.filter(l => l.active).length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="h-14 border-b border-border/50 flex items-center justify-between px-4 md:px-6 bg-card/50 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/20 flex items-center justify-center">
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h1 className="text-sm font-bold leading-none">Лиги и рейтинги</h1>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {activeSeason ? `Активный сезон: ${activeSeason.name}` : "Нет активного сезона"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {tab === "players"  && <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={() => setAddPlayerOpen(true)}><Plus className="w-3.5 h-3.5" />Игрок</Button>}
          {tab === "leagues"  && <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={() => setAddLeagueOpen(true)}><Plus className="w-3.5 h-3.5" />Лига</Button>}
          {tab === "seasons"  && <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={() => setAddSeasonOpen(true)}><Plus className="w-3.5 h-3.5" />Сезон</Button>}
          {tab === "teams"    && <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={() => setAddTeamOpen(true)}><Plus className="w-3.5 h-3.5" />Команда</Button>}
          {tab === "sessions" && <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={() => setAddSessionOpen(true)}><Plus className="w-3.5 h-3.5" />Сессия</Button>}
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 px-4 md:px-6 pt-3">
        {[
          { icon: Users,    label: "Игроков",  value: players.length,  color: "text-blue-400" },
          { icon: UserCheck,label: "Верифиц.", value: verifiedCount,    color: "text-emerald-400" },
          { icon: Swords,   label: "Лиг",      value: activeLeagues,   color: "text-amber-400" },
          { icon: Gamepad2, label: "Сессий",   value: totalMatches,    color: "text-violet-400" },
        ].map((s, i) => (
          <div key={i} className="rounded-xl border border-border/50 bg-card/20 p-2.5">
            <div className="flex items-center gap-1 mb-1">
              <s.icon className={cn("w-3 h-3", s.color)} />
              <span className="text-[9px] text-muted-foreground">{s.label}</span>
            </div>
            <p className="text-lg font-black">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 px-4 md:px-6 pt-2 pb-0 shrink-0 overflow-x-auto">
        {tabItems.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
              tab === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted/20"
            )}
          >
            <t.icon className="w-3.5 h-3.5" />{t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-6 pt-3 pb-20 md:pb-6 space-y-3">

        {/* ── LEADERBOARD ── */}
        {tab === "leaderboard" && (
          <>
            {/* Search + filter */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input className="h-8 text-xs pl-8" placeholder="Поиск по нику..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <Select value={gameFilter} onValueChange={setGameFilter}>
                <SelectTrigger className="h-8 text-xs w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все игры</SelectItem>
                  {GAMES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Top-3 podium */}
            {filteredLeaderboard.length >= 3 && (
              <div className="grid grid-cols-3 gap-2">
                {filteredLeaderboard.slice(0, 3).map((p, i) => {
                  const rank = getRank(p.elo);
                  const podiumColors = ["bg-amber-500/15 border-amber-500/30", "bg-slate-500/10 border-slate-400/20", "bg-orange-600/10 border-orange-600/20"];
                  return (
                    <div key={p.id} className={cn("rounded-2xl border p-3 text-center space-y-1", podiumColors[i])}>
                      <div className="text-xl">{rank.icon}</div>
                      <p className="text-xs font-bold truncate">{p.nickname}</p>
                      <p className="text-base font-black tabular-nums">{p.elo.toLocaleString()} ELO</p>
                      <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full border font-bold inline-block", rank.bg, rank.color)}>{rank.name}</span>
                      <p className="text-[10px] text-muted-foreground">{p.wins}В · {p.kills}K</p>
                      {p.verified && <span className="text-[9px] text-emerald-400 flex items-center justify-center gap-0.5"><CheckCircle2 className="w-2.5 h-2.5" />верифицирован</span>}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Full list */}
            <Card className="bg-card/30 border-border/50">
              <CardContent className="px-3 py-2 space-y-1">
                {filteredLeaderboard.map((p, i) => {
                  const rank = getRank(p.elo);
                  const expanded = expandedPlayer === p.id;
                  const maxElo = filteredLeaderboard[0]?.elo ?? 1;
                  return (
                    <div key={p.id}>
                      <button
                        className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-muted/10 transition-all text-left"
                        onClick={() => setExpandedPlayer(expanded ? null : p.id)}
                      >
                        <span className={cn("text-xs font-black w-5 text-center shrink-0", i < 3 ? "text-amber-400" : "text-muted-foreground/40")}>#{i + 1}</span>
                        <div className="w-7 h-7 rounded-full bg-muted/20 border border-border/30 flex items-center justify-center text-xs font-bold shrink-0">
                          {p.nickname[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <p className="text-xs font-semibold truncate">{p.nickname}</p>
                            <span className={cn("text-[8px] px-1 py-0.5 rounded-full border shrink-0", rank.bg, rank.color)}>{rank.name}</span>
                            {p.verified && <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400 shrink-0" />}
                          </div>
                          <div className="w-full h-1 rounded-full bg-muted/20">
                            <div className="h-full rounded-full bg-primary/60 transition-all" style={{ width: `${(p.elo / maxElo) * 100}%` }} />
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-black tabular-nums">{p.elo.toLocaleString()}</p>
                          <p className="text-[9px] text-muted-foreground">ELO</p>
                        </div>
                        {expanded ? <ChevronUp className="w-3 h-3 text-muted-foreground shrink-0" /> : <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0" />}
                      </button>
                      {expanded && (
                        <div className="grid grid-cols-4 gap-1.5 pb-2 px-2 ml-14">
                          {[
                            { label: "Матчей",  value: p.matches },
                            { label: "Побед",   value: p.wins },
                            { label: "Убийств", value: p.kills },
                            { label: "Игра",    value: p.primaryGame.split(" ")[0] },
                          ].map(s => (
                            <div key={s.label} className="rounded-lg bg-muted/10 border border-border/30 p-1.5 text-center">
                              <p className="text-xs font-bold">{s.value}</p>
                              <p className="text-[9px] text-muted-foreground">{s.label}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
                {filteredLeaderboard.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">Нет игроков</div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* ── PLAYERS ── */}
        {tab === "players" && (
          <>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input className="h-8 text-xs pl-8" placeholder="Поиск по нику или телефону..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <Button size="sm" variant="outline" className="h-8 text-xs gap-1" onClick={() => setMergeOpen(true)}>
                <UserCheck className="w-3.5 h-3.5" />Объединить
              </Button>
            </div>

            <div className="space-y-2">
              {players
                .filter(p => !search || p.nickname.toLowerCase().includes(search.toLowerCase()) || (p.linkedPhone && p.linkedPhone.includes(search)))
                .sort((a, b) => b.elo - a.elo)
                .map(p => {
                  const rank = getRank(p.elo);
                  return (
                    <Card key={p.id} className={cn("border-border/50 bg-card/20", !p.verified && "border-amber-500/20 bg-amber-500/5")}>
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-muted/30 border border-border/40 flex items-center justify-center text-sm font-bold shrink-0">
                            {p.nickname[0].toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="text-sm font-bold">{p.nickname}</p>
                              <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full border font-bold", rank.bg, rank.color)}>{rank.icon} {rank.name}</span>
                              {p.verified
                                ? <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-0.5"><CheckCircle2 className="w-2.5 h-2.5" />Верифицирован</span>
                                : <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center gap-0.5"><AlertTriangle className="w-2.5 h-2.5" />Не верифицирован</span>
                              }
                            </div>
                            <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-0.5 flex-wrap">
                              <span>{p.elo} ELO</span>
                              <span>{p.matches} матч.</span>
                              <span>{p.wins} побед</span>
                              <span>{p.kills} убийств</span>
                              <span>{p.primaryGame}</span>
                              {p.linkedPhone && <span className="text-emerald-400">{p.linkedPhone}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {!p.verified && p.matches >= 3 && (
                              <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10" onClick={() => verifyPlayer(p.id)}>
                                <CheckCircle2 className="w-3 h-3" />Верифицировать
                              </Button>
                            )}
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => deletePlayer(p.id)}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                        {!p.verified && p.matches < 3 && (
                          <p className="text-[10px] text-muted-foreground mt-1.5 ml-12">
                            Нужно ещё {3 - p.matches} {3 - p.matches === 1 ? "матч" : "матча"} для верификации
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </>
        )}

        {/* ── LEAGUES ── */}
        {tab === "leagues" && (
          <>
            <div className="flex gap-2">
              <Select value={gameFilter} onValueChange={setGameFilter}>
                <SelectTrigger className="h-8 text-xs flex-1"><SelectValue placeholder="Все игры" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все игры</SelectItem>
                  {GAMES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              {leagues
                .filter(l => gameFilter === "all" || l.game === gameFilter)
                .map(league => {
                  const season = seasons.find(s => s.id === league.seasonId);
                  const systemLabels = { elo: "ELO рейтинг", points: "Очки", kills: "Убийства" };
                  return (
                    <Card key={league.id} className={cn("border-border/50", league.active ? "bg-card/30" : "bg-muted/5 opacity-60")}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={cn("w-10 h-10 rounded-xl border flex items-center justify-center shrink-0", league.active ? "bg-amber-500/10 border-amber-500/20" : "bg-muted/20 border-border/30")}>
                            <Swords className={cn("w-4 h-4", league.active ? "text-amber-400" : "text-muted-foreground")} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-0.5">
                              <p className="text-sm font-bold">{league.name}</p>
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">{league.game}</span>
                              <span className="text-[10px] text-muted-foreground">{season?.name ?? "—"}</span>
                            </div>
                            <div className="flex items-center gap-4 text-[10px] text-muted-foreground flex-wrap">
                              <span className="flex items-center gap-1"><Users className="w-3 h-3" />{league.playersCount} игроков</span>
                              <span className="flex items-center gap-1"><Target className="w-3 h-3" />{league.matchesCount} матчей</span>
                              <span className="flex items-center gap-1"><Zap className="w-3 h-3" />{systemLabels[league.system]}</span>
                              <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />мин. {league.minMatches} матчей</span>
                            </div>
                            {league.leaderNick && (
                              <p className="text-[10px] text-amber-400 mt-1 flex items-center gap-1"><Crown className="w-3 h-3" />Лидер: {league.leaderNick}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <Switch checked={league.active} onCheckedChange={v => { setLeagues(ls => ls.map(l => l.id === league.id ? { ...l, active: v } : l)); toast.success(v ? "Лига активирована" : "Лига приостановлена"); }} />
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => { if (confirm("Удалить лигу?")) { setLeagues(ls => ls.filter(l => l.id !== league.id)); toast.success("Удалено"); } }}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              {leagues.filter(l => gameFilter === "all" || l.game === gameFilter).length === 0 && (
                <div className="text-center py-12 text-muted-foreground space-y-2">
                  <Swords className="w-8 h-8 mx-auto opacity-20" />
                  <p className="text-sm">Нет лиг</p>
                  <Button size="sm" variant="outline" onClick={() => setAddLeagueOpen(true)}><Plus className="w-3.5 h-3.5 mr-1" />Создать первую</Button>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── SESSIONS ── */}
        {tab === "sessions" && (
          <div className="space-y-2">
            {sessions.slice().reverse().map(s => {
              const expanded = expandedSession === s.id;
              const league = leagues.find(l => l.id === s.leagueId);
              const winner = s.results[0];
              return (
                <Card key={s.id} className="bg-card/30 border-border/50">
                  <CardContent className="p-3">
                    <button className="w-full flex items-center gap-3 text-left" onClick={() => setExpandedSession(expanded ? null : s.id)}>
                      <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                        <Gamepad2 className="w-4 h-4 text-violet-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <p className="text-xs font-bold">{s.game}</p>
                          {league && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">{league.name}</span>}
                        </div>
                        <p className="text-[10px] text-muted-foreground">{s.date} · {s.results.length} игроков · 🏆 {winner?.nickname} ({winner?.kills} убийств)</p>
                      </div>
                      {expanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
                    </button>
                    {expanded && (
                      <div className="mt-2 space-y-1 ml-12">
                        {s.results.map((r, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            <span className={cn("w-5 text-center font-bold", i === 0 ? "text-amber-400" : i === 1 ? "text-slate-400" : "text-muted-foreground/50")}>#{r.place}</span>
                            <span className="flex-1 font-medium">{r.nickname}</span>
                            <span className="text-muted-foreground">{r.kills} убийств</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
            {sessions.length === 0 && (
              <div className="text-center py-12 text-muted-foreground space-y-2">
                <Gamepad2 className="w-8 h-8 mx-auto opacity-20" />
                <p className="text-sm">Нет записей сессий</p>
                <Button size="sm" variant="outline" onClick={() => setAddSessionOpen(true)}><Plus className="w-3.5 h-3.5 mr-1" />Добавить первую</Button>
              </div>
            )}
          </div>
        )}

        {/* ── TEAMS ── */}
        {tab === "teams" && (
          <div className="space-y-2">
            {teams.sort((a, b) => b.elo - a.elo).map((team, i) => (
              <Card key={team.id} className="bg-card/30 border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-sm font-black text-blue-400 shrink-0">
                      #{i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <p className="text-sm font-bold">{team.name}</p>
                        {team.company && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted/20 border border-border/30 text-muted-foreground">{team.company}</span>}
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                        <span>{team.matches} матчей</span>
                        <span>{team.wins} побед</span>
                        <span className="text-amber-400 font-bold">{team.elo} ELO</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {team.playerNicks.map(n => (
                          <span key={n} className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary">{n}</span>
                        ))}
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive shrink-0" onClick={() => { if (confirm("Удалить команду?")) { setTeams(ts => ts.filter(t => t.id !== team.id)); toast.success("Удалено"); } }}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {teams.length === 0 && (
              <div className="text-center py-12 text-muted-foreground space-y-2">
                <Shield className="w-8 h-8 mx-auto opacity-20" />
                <p className="text-sm">Нет команд</p>
                <Button size="sm" variant="outline" onClick={() => setAddTeamOpen(true)}><Plus className="w-3.5 h-3.5 mr-1" />Создать первую</Button>
              </div>
            )}
          </div>
        )}

        {/* ── SEASONS ── */}
        {tab === "seasons" && (
          <div className="space-y-2">
            {seasons.map(s => (
              <Card key={s.id} className={cn("border-border/50", s.active ? "bg-primary/5 border-primary/20" : "bg-card/20")}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={cn("w-10 h-10 rounded-xl border flex items-center justify-center shrink-0", s.active ? "bg-amber-500/15 border-amber-500/25" : "bg-muted/20 border-border/30")}>
                      <Calendar className={cn("w-4 h-4", s.active ? "text-amber-400" : "text-muted-foreground")} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <p className="text-sm font-bold">{s.name}</p>
                        {s.active && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">Активный</span>}
                      </div>
                      <p className="text-[11px] text-muted-foreground">{s.start} — {s.end}</p>
                      {s.prize && <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5"><Gift className="w-3 h-3" />{s.prize}</p>}
                      {s.games.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {s.games.map(g => (
                            <span key={g} className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">{g}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <Switch checked={s.active} onCheckedChange={v => {
                      setSeasons(ss => ss.map(x => x.id === s.id ? { ...x, active: v } : x));
                      toast.success(v ? "Сезон активирован" : "Сезон приостановлен");
                    }} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* ── SETTINGS (Excluded + Ranks + Scoring) ── */}
        {tab === "settings" && (
          <>
            {/* Excluded nicks */}
            <Card className="bg-card/30 border-border/50">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm flex items-center gap-2"><Ban className="w-4 h-4 text-red-400" />Исключённые никнеймы</CardTitle>
                <p className="text-[10px] text-muted-foreground">Игроки с такими никами не попадают в статистику и рейтинг</p>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-3">
                <div className="flex gap-1.5">
                  <Input className="h-8 text-xs flex-1" placeholder="Guest, Player1, Unknown..." value={newExcluded} onChange={e => setNewExcluded(e.target.value)} onKeyDown={e => { if (e.key === "Enter") addExcluded(); }} />
                  <Button size="sm" className="h-8 px-3 text-xs" onClick={addExcluded}><Plus className="w-3.5 h-3.5" /></Button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {excluded.map(nick => (
                    <span key={nick} className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400">
                      {nick}
                      <button onClick={() => { setExcluded(e => e.filter(n => n !== nick)); toast.success(`«${nick}» удалён из исключений`); }} className="hover:text-red-200 transition-colors">
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="pt-1 border-t border-border/30">
                  <p className="text-[10px] text-muted-foreground mb-2">Шаблоны автоисключения (всё начинающееся с...)</p>
                  <div className="flex flex-wrap gap-1.5">
                    {EXCLUDED_PATTERNS.map(p => (
                      <span key={p} className="text-[10px] px-2 py-1 rounded-full bg-muted/20 border border-border/30 text-muted-foreground">{p}</span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ranks */}
            <Card className="bg-card/30 border-border/50">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm flex items-center gap-2"><Medal className="w-4 h-4 text-amber-400" />Система рангов (ELO)</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-2">
                {RANKS.map(r => (
                  <div key={r.name} className={cn("rounded-xl border p-3 flex items-center gap-3", r.bg)}>
                    <span className="text-2xl w-8">{r.icon}</span>
                    <div className="flex-1">
                      <p className={cn("text-xs font-bold", r.color)}>{r.name}</p>
                      <p className="text-[10px] text-muted-foreground">{r.min.toLocaleString()} – {r.max >= 99999 ? "∞" : r.max.toLocaleString()} ELO</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Игроков</p>
                      <p className="text-sm font-bold">{players.filter(p => p.elo >= r.min && p.elo <= r.max).length}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* ELO change rules */}
            <Card className="bg-card/30 border-border/50">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm flex items-center gap-2"><Zap className="w-4 h-4 text-amber-400" />Изменение ELO за сессию</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-1.5">
                {[
                  { action: "1-е место",             points: "+30 ELO",  color: "text-amber-400" },
                  { action: "2-е место",             points: "+15 ELO",  color: "text-emerald-400" },
                  { action: "3-е место",             points: "+5 ELO",   color: "text-blue-400" },
                  { action: "4-е место и ниже",      points: "−10 ELO",  color: "text-red-400" },
                  { action: "Турнирная победа",      points: "+100 ELO", color: "text-violet-400" },
                  { action: "Верификация игрока",    points: "Условие: 3+ матча / телефон / QR", color: "text-muted-foreground" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg border border-border/30 bg-card/10">
                    <span className="text-xs">{item.action}</span>
                    <span className={cn("text-xs font-bold", item.color)}>{item.points}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </>
        )}

      </div>

      {/* ── Dialogs ─────────────────────────────────────────────────────────── */}

      {/* Add Player */}
      <Dialog open={addPlayerOpen} onOpenChange={setAddPlayerOpen}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader><DialogTitle>Добавить игрока</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1"><Label className="text-xs">Никнейм в игре *</Label><Input autoFocus className="h-8 text-sm" placeholder="GhostHunter" value={playerForm.nickname} onChange={e => setPlayerForm(f => ({ ...f, nickname: e.target.value }))} /></div>
            <div className="space-y-1">
              <Label className="text-xs">Основная игра</Label>
              <Select value={playerForm.primaryGame} onValueChange={v => setPlayerForm(f => ({ ...f, primaryGame: v }))}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{GAMES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label className="text-xs">Телефон (для верификации)</Label><Input className="h-8 text-sm" placeholder="+7 999..." value={playerForm.linkedPhone} onChange={e => setPlayerForm(f => ({ ...f, linkedPhone: e.target.value }))} /></div>
          </div>
          <div className="flex gap-2 mt-2">
            <Button variant="outline" className="flex-1 h-9" onClick={() => setAddPlayerOpen(false)}>Отмена</Button>
            <Button className="flex-1 h-9" onClick={addPlayer}>Добавить</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add League */}
      <Dialog open={addLeagueOpen} onOpenChange={setAddLeagueOpen}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader><DialogTitle>Создать лигу</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1"><Label className="text-xs">Название *</Label><Input autoFocus className="h-8 text-sm" placeholder="Лига Breachers" value={leagueForm.name} onChange={e => setLeagueForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="space-y-1"><Label className="text-xs">Игра</Label>
              <Select value={leagueForm.game} onValueChange={v => setLeagueForm(f => ({ ...f, game: v }))}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{GAMES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label className="text-xs">Сезон</Label>
              <Select value={leagueForm.seasonId} onValueChange={v => setLeagueForm(f => ({ ...f, seasonId: v }))}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{seasons.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1"><Label className="text-xs">Система рейтинга</Label>
                <Select value={leagueForm.system} onValueChange={v => setLeagueForm(f => ({ ...f, system: v as League["system"] }))}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="elo">ELO</SelectItem>
                    <SelectItem value="points">Очки</SelectItem>
                    <SelectItem value="kills">Убийства</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label className="text-xs">Мин. матчей</Label><Input type="number" className="h-8 text-xs" value={leagueForm.minMatches} onChange={e => setLeagueForm(f => ({ ...f, minMatches: e.target.value }))} /></div>
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            <Button variant="outline" className="flex-1 h-9" onClick={() => setAddLeagueOpen(false)}>Отмена</Button>
            <Button className="flex-1 h-9" onClick={addLeague}>Создать</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Season */}
      <Dialog open={addSeasonOpen} onOpenChange={setAddSeasonOpen}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader><DialogTitle>Новый сезон</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1"><Label className="text-xs">Название *</Label><Input autoFocus className="h-8 text-sm" placeholder="Осень 2026" value={seasonForm.name} onChange={e => setSeasonForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1"><Label className="text-xs">Начало</Label><Input type="date" className="h-8 text-xs" value={seasonForm.start} onChange={e => setSeasonForm(f => ({ ...f, start: e.target.value }))} /></div>
              <div className="space-y-1"><Label className="text-xs">Конец</Label><Input type="date" className="h-8 text-xs" value={seasonForm.end} onChange={e => setSeasonForm(f => ({ ...f, end: e.target.value }))} /></div>
            </div>
            <div className="space-y-1"><Label className="text-xs">Приз сезона</Label><Input className="h-8 text-sm" placeholder="VIP-статус + мерч" value={seasonForm.prize} onChange={e => setSeasonForm(f => ({ ...f, prize: e.target.value }))} /></div>
            <div className="space-y-1.5">
              <Label className="text-xs">Игры сезона</Label>
              <div className="flex flex-wrap gap-1.5">
                {GAMES.map(g => (
                  <button key={g} type="button" onClick={() => setSeasonForm(f => ({ ...f, games: f.games.includes(g) ? f.games.filter(x => x !== g) : [...f.games, g] }))}
                    className={cn("text-[10px] px-2 py-1 rounded-full border transition-colors", seasonForm.games.includes(g) ? "bg-primary/20 border-primary/40 text-primary" : "bg-muted/10 border-border/30 text-muted-foreground hover:bg-muted/20")}>
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            <Button variant="outline" className="flex-1 h-9" onClick={() => setAddSeasonOpen(false)}>Отмена</Button>
            <Button className="flex-1 h-9" onClick={addSeason}>Создать</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Team */}
      <Dialog open={addTeamOpen} onOpenChange={setAddTeamOpen}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader><DialogTitle>Создать команду</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1"><Label className="text-xs">Название команды *</Label><Input autoFocus className="h-8 text-sm" placeholder="Alpha Squad" value={teamForm.name} onChange={e => setTeamForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="space-y-1"><Label className="text-xs">Компания / корпоратив</Label><Input className="h-8 text-sm" placeholder="Сбербанк" value={teamForm.company} onChange={e => setTeamForm(f => ({ ...f, company: e.target.value }))} /></div>
            <div className="space-y-1"><Label className="text-xs">Никнеймы участников (через запятую)</Label><Input className="h-8 text-sm" placeholder="GhostHunter, M4x, Tank" value={teamForm.nicks} onChange={e => setTeamForm(f => ({ ...f, nicks: e.target.value }))} /></div>
          </div>
          <div className="flex gap-2 mt-2">
            <Button variant="outline" className="flex-1 h-9" onClick={() => setAddTeamOpen(false)}>Отмена</Button>
            <Button className="flex-1 h-9" onClick={addTeam}>Создать</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Session */}
      <Dialog open={addSessionOpen} onOpenChange={setAddSessionOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Записать сессию</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1"><Label className="text-xs">Игра</Label>
                <Select value={sessionForm.game} onValueChange={v => setSessionForm(f => ({ ...f, game: v }))}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{GAMES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label className="text-xs">Лига</Label>
                <Select value={sessionForm.leagueId} onValueChange={v => setSessionForm(f => ({ ...f, leagueId: v }))}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Без лиги</SelectItem>
                    {leagues.filter(l => l.active).map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Результаты (каждый игрок на новой строке: Ник Убийства)</Label>
              <textarea
                className="w-full h-28 text-xs rounded-md border border-input bg-background px-3 py-2 font-mono resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                placeholder={"GhostHunter 18\nM4x 15\nSniper_VR 10\nTank 7"}
                value={sessionForm.results}
                onChange={e => setSessionForm(f => ({ ...f, results: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            <Button variant="outline" className="flex-1 h-9" onClick={() => setAddSessionOpen(false)}>Отмена</Button>
            <Button className="flex-1 h-9" onClick={addSession}>Записать</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Merge Players */}
      <Dialog open={mergeOpen} onOpenChange={setMergeOpen}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader><DialogTitle>Объединить игроков</DialogTitle></DialogHeader>
          <p className="text-xs text-muted-foreground">Если один игрок использует два разных ника — объедините их. Статистика первого прибавится ко второму.</p>
          <div className="space-y-3 mt-2">
            <div className="space-y-1"><Label className="text-xs">Удалить (источник)</Label>
              <Select value={mergeNick} onValueChange={setMergeNick}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Выберите ник..." /></SelectTrigger>
                <SelectContent>{players.map(p => <SelectItem key={p.id} value={p.nickname}>{p.nickname}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label className="text-xs">Объединить с (цель)</Label>
              <Select value={mergeTarget} onValueChange={setMergeTarget}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Выберите ник..." /></SelectTrigger>
                <SelectContent>{players.filter(p => p.nickname !== mergeNick).map(p => <SelectItem key={p.id} value={p.nickname}>{p.nickname}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            <Button variant="outline" className="flex-1 h-9" onClick={() => setMergeOpen(false)}>Отмена</Button>
            <Button className="flex-1 h-9 bg-amber-500 hover:bg-amber-600" onClick={mergePlayers}>Объединить</Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
