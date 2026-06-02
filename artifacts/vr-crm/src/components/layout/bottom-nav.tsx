import { useState } from "react";
import {
  BookOpen, Users, Monitor, BarChart3, MoreHorizontal,
  MessageSquare, Camera, LayoutTemplate, Trophy, Heart,
  Smartphone, Brain, Bot, Settings, X, Globe,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

const mainItems = [
  { href: "/dashboard", icon: BookOpen, label: "Брони" },
  { href: "/control", icon: Monitor, label: "Управление" },
  { href: "/clients", icon: Users, label: "Клиенты" },
  { href: "/analytics", icon: BarChart3, label: "Аналитика" },
];

const menuItems = [
  { href: "/inbox", icon: MessageSquare, label: "Сообщения" },
  { href: "/cameras", icon: Camera, label: "Камеры" },
  { href: "/registration", icon: LayoutTemplate, label: "Конструктор" },
  { href: "/leagues", icon: Trophy, label: "Лиги и рейтинги" },
  { href: "/loyalty", icon: Heart, label: "Лояльность" },
  { href: "/guest-portal", icon: Smartphone, label: "Кабинет гостя" },
  { href: "/ai-consulting", icon: Brain, label: "AI Консалтинг" },
  { href: "/ai-admin", icon: Bot, label: "AI Администратор" },
  { href: "/knowledge", icon: BookOpen, label: "База знаний" },
  { href: "/network", icon: Globe, label: "Сеть парков" },
  { href: "/settings", icon: Settings, label: "Настройки" },
];

export function BottomNav() {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isMenuSectionActive = menuItems.some(
    (item) => location === item.href || location.startsWith(item.href)
  );

  return (
    <>
      {/* Slide-up menu overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden" onClick={() => setMenuOpen(false)}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />

          {/* Drawer */}
          <div
            className="absolute bottom-0 left-0 right-0 bg-background border-t border-border rounded-t-2xl pb-safe"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
            </div>

            {/* Title */}
            <div className="flex items-center justify-between px-4 py-2">
              <span className="text-sm font-semibold">Меню</span>
              <button
                onClick={() => setMenuOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Grid of menu items */}
            <div className="grid grid-cols-3 gap-1 px-3 pb-6">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  location === item.href ||
                  (item.href !== "/" && location.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                  >
                    <div
                      className={cn(
                        "flex flex-col items-center justify-center gap-1.5 py-3.5 rounded-xl transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted/40 hover:text-foreground active:bg-muted/60"
                      )}
                    >
                      <Icon className={cn("w-5 h-5", isActive && "drop-shadow-[0_0_6px_currentColor]")} />
                      <span className="text-[10px] font-medium leading-tight text-center px-1">
                        {item.label}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bottom nav bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex md:hidden border-t border-border bg-background/95 backdrop-blur-md">
        {mainItems.map((item) => {
          const isActive =
            location === item.href ||
            (item.href !== "/" && location.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="flex-1">
              <div
                className={cn(
                  "relative flex flex-col items-center justify-center gap-1 py-3 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground active:text-foreground"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive && "drop-shadow-[0_0_6px_currentColor]")} />
                <span className={cn("text-[10px] font-medium leading-none", isActive ? "text-primary" : "text-muted-foreground")}>
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute bottom-0 w-6 h-0.5 bg-primary rounded-t-full" />
                )}
              </div>
            </Link>
          );
        })}

        {/* Меню button */}
        <button className="flex-1" onClick={() => setMenuOpen(true)}>
          <div
            className={cn(
              "relative flex flex-col items-center justify-center gap-1 py-3 transition-colors w-full",
              isMenuSectionActive ? "text-primary" : "text-muted-foreground active:text-foreground"
            )}
          >
            <MoreHorizontal
              className={cn("w-5 h-5", isMenuSectionActive && "drop-shadow-[0_0_6px_currentColor]")}
            />
            <span className={cn("text-[10px] font-medium leading-none", isMenuSectionActive ? "text-primary" : "text-muted-foreground")}>
              Меню
            </span>
            {isMenuSectionActive && (
              <div className="absolute bottom-0 w-6 h-0.5 bg-primary rounded-t-full" />
            )}
          </div>
        </button>
      </nav>
    </>
  );
}
