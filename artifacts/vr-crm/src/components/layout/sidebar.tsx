import { useState, useRef, useEffect } from "react";
import { BookOpen, Users, Settings, User, Cpu, Monitor, LayoutTemplate, BarChart3, Globe, ChevronDown, Plus, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useLocalStorage } from "@/lib/store";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type Park = { id: string; name: string; city: string; status: "online" | "offline"; devices: number; color: string };

const DEFAULT_PARKS: Park[] = [
  { id: "main", name: "VR Park Moscow", city: "Москва", status: "online", devices: 12, color: "#6366f1" },
  { id: "p2", name: "VR Park Dubai", city: "Дубай", status: "online", devices: 8, color: "#3b82f6" },
  { id: "p3", name: "Cyber Arena SPb", city: "СПб", status: "offline", devices: 6, color: "#8b5cf6" },
];

const PARK_COLORS = ["#6366f1", "#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#ef4444", "#06b6d4"];

const navItems = [
  { href: "/dashboard", icon: BookOpen, label: "Брони" },
  { href: "/control", icon: Monitor, label: "Центр управления" },
  { href: "/devices", icon: Cpu, label: "Устройства" },
  { href: "/clients", icon: Users, label: "Клиенты" },
  { href: "/analytics", icon: BarChart3, label: "Аналитика" },
  { href: "/registration", icon: LayoutTemplate, label: "Конструктор" },
  { href: "/settings", icon: Settings, label: "Настройки" },
];

export function Sidebar() {
  const [location] = useLocation();
  const [parks, setParks] = useLocalStorage<Park[]>("vrpark_parks", DEFAULT_PARKS);
  const [currentParkId, setCurrentParkId] = useLocalStorage<string>("vrpark_current_park", "main");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [addParkOpen, setAddParkOpen] = useState(false);
  const [parkForm, setParkForm] = useState({ name: "", city: "" });
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentPark = parks.find(p => p.id === currentParkId) ?? parks[0] ?? DEFAULT_PARKS[0];

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen]);

  const handleAddPark = () => {
    if (!parkForm.name.trim()) return;
    const newPark: Park = {
      id: `park_${Date.now()}`,
      name: parkForm.name.trim(),
      city: parkForm.city.trim() || "Город не указан",
      status: "online",
      devices: 0,
      color: PARK_COLORS[parks.length % PARK_COLORS.length],
    };
    setParks(ps => [...ps, newPark]);
    setCurrentParkId(newPark.id);
    setParkForm({ name: "", city: "" });
    setAddParkOpen(false);
  };

  return (
    <>
      <aside className="hidden md:flex w-16 md:w-64 border-r border-border bg-sidebar h-full flex-col transition-all duration-300">
        {/* Logo */}
        <div className="h-14 flex items-center justify-center md:justify-start md:px-4 border-b border-border shrink-0">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center font-bold text-primary-foreground text-xl shrink-0">V</div>
          <span className="hidden md:inline-block ml-2.5 font-semibold text-base tracking-tight">VR Park OS</span>
        </div>

        {/* Park Switcher */}
        <div className="hidden md:block px-3 py-2 border-b border-border/50 relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(d => !d)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-sidebar-accent transition-colors"
          >
            <div className="w-2 h-2 rounded-full shrink-0 animate-pulse" style={{ backgroundColor: currentPark.color }} />
            <span className="flex-1 text-xs font-semibold text-left truncate">{currentPark.name}</span>
            <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform shrink-0", dropdownOpen && "rotate-180")} />
          </button>

          {dropdownOpen && (
            <div className="absolute left-3 right-3 top-full mt-1 z-50 bg-popover border border-border rounded-xl shadow-xl overflow-hidden">
              <div className="p-1">
                {parks.map(park => (
                  <button
                    key={park.id}
                    onClick={() => { setCurrentParkId(park.id); setDropdownOpen(false); }}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors",
                      park.id === currentParkId ? "bg-primary/10 text-primary" : "hover:bg-sidebar-accent"
                    )}
                  >
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: park.color }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">{park.name}</p>
                      <p className="text-[10px] text-muted-foreground">{park.city} · {park.devices} уст.</p>
                    </div>
                    <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", park.status === "online" ? "bg-green-400" : "bg-muted-foreground/40")} />
                  </button>
                ))}
              </div>
              <div className="border-t border-border/50 p-1">
                <Link href="/network">
                  <button onClick={() => setDropdownOpen(false)} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors">
                    <Globe className="w-3.5 h-3.5" /> Сеть парков
                  </button>
                </Link>
                <button
                  onClick={() => { setDropdownOpen(false); setAddParkOpen(true); }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Добавить парк
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 flex flex-col gap-0.5 px-3 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="block relative">
                <div className={cn("flex items-center justify-center md:justify-start h-9 md:px-3 rounded-md transition-colors cursor-pointer group hover:bg-sidebar-accent hover:text-sidebar-accent-foreground", isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/70")}>
                  <Icon className={cn("w-5 h-5 shrink-0", isActive ? "text-primary" : "")} />
                  <span className="hidden md:block ml-3 font-medium text-sm truncate">{item.label}</span>
                  {isActive && <div className="absolute left-0 w-1 h-8 bg-primary rounded-r-md" />}
                </div>
              </Link>
            );
          })}
          <Link href="/network" className="block relative">
            <div className={cn("flex items-center justify-center md:justify-start h-9 md:px-3 rounded-md transition-colors cursor-pointer hover:bg-sidebar-accent hover:text-sidebar-accent-foreground", location === "/network" ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/70")}>
              <Globe className={cn("w-5 h-5 shrink-0", location === "/network" ? "text-primary" : "")} />
              <span className="hidden md:block ml-3 font-medium text-sm truncate">Сеть парков</span>
              {location === "/network" && <div className="absolute left-0 w-1 h-8 bg-primary rounded-r-md" />}
            </div>
          </Link>
        </nav>

        {/* Profile */}
        <div className="p-3 border-t border-border shrink-0">
          <Link href="/profile" className="block">
            <div className={cn("flex items-center justify-center md:justify-start h-10 md:px-3 rounded-md transition-colors cursor-pointer hover:bg-sidebar-accent", location.startsWith("/profile") ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/70")}>
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center overflow-hidden border border-border shrink-0">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="hidden md:block ml-3 overflow-hidden">
                <p className="text-sm font-medium truncate">Администратор</p>
                <p className="text-xs text-muted-foreground truncate">admin@vrpark.co</p>
              </div>
            </div>
          </Link>
        </div>
      </aside>

      {/* Add Park Modal */}
      <Dialog open={addParkOpen} onOpenChange={setAddParkOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-4 h-4" /> Добавить новый парк
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Название парка <span className="text-destructive">*</span></Label>
              <Input
                className="h-9 text-sm"
                placeholder="VR Park Москва"
                value={parkForm.name}
                onChange={e => setParkForm(f => ({ ...f, name: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && handleAddPark()}
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Город</Label>
              <Input
                className="h-9 text-sm"
                placeholder="Москва"
                value={parkForm.city}
                onChange={e => setParkForm(f => ({ ...f, city: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && handleAddPark()}
              />
            </div>
            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1 h-9 text-sm" onClick={() => { setAddParkOpen(false); setParkForm({ name: "", city: "" }); }}>
                Отмена
              </Button>
              <Button className="flex-1 h-9 text-sm" onClick={handleAddPark} disabled={!parkForm.name.trim()}>
                Добавить парк
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
