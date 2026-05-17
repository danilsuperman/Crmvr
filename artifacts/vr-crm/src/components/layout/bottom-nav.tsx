import { Home, Users, Calendar, Settings } from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: Home, label: "Главная" },
  { href: "/clients", icon: Users, label: "Клиенты" },
  { href: "/events", icon: Calendar, label: "События" },
  { href: "/settings", icon: Settings, label: "Настройки" },
];

export function BottomNav() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden border-t border-border bg-background/95 backdrop-blur-md safe-area-bottom">
      {navItems.map((item) => {
        const isActive =
          location === item.href ||
          (item.href !== "/" && location.startsWith(item.href));
        const Icon = item.icon;

        return (
          <Link key={item.href} href={item.href} className="flex-1">
            <div
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-3 transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground active:text-foreground"
              )}
              data-testid={`bottom-nav-${item.label}`}
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
    </nav>
  );
}
