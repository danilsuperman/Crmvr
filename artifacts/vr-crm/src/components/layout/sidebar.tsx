import { Home, Users, Calendar, Settings, User } from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: Home, label: "Mission Control" },
  { href: "/clients", icon: Users, label: "Clients" },
  { href: "/events", icon: Calendar, label: "Events" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-16 md:w-64 border-r border-border bg-sidebar h-full flex flex-col transition-all duration-300">
      <div className="h-16 flex items-center justify-center md:justify-start md:px-6 border-b border-border">
        <div className="w-8 h-8 rounded bg-primary flex items-center justify-center font-bold text-primary-foreground text-xl">
          V
        </div>
        <span className="hidden md:inline-block ml-3 font-semibold text-lg tracking-tight">
          VR Park
        </span>
      </div>

      <nav className="flex-1 py-6 flex flex-col gap-2 px-3">
        {navItems.map((item) => {
          const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href} className="block">
              <div
                className={cn(
                  "flex items-center justify-center md:justify-start h-10 md:px-3 rounded-md transition-colors cursor-pointer group hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70"
                )}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-primary" : "")} />
                <span className="hidden md:block ml-3 font-medium text-sm">
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute left-0 w-1 h-8 bg-primary rounded-r-md" />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border">
        <Link href="/profile" className="block">
          <div className={cn(
            "flex items-center justify-center md:justify-start h-10 md:px-3 rounded-md transition-colors cursor-pointer hover:bg-sidebar-accent",
            location.startsWith("/profile") ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/70"
          )}>
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center overflow-hidden border border-border">
              <User className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="hidden md:block ml-3 overflow-hidden">
              <p className="text-sm font-medium truncate">Admin User</p>
              <p className="text-xs text-muted-foreground truncate">admin@vrpark.co</p>
            </div>
          </div>
        </Link>
      </div>
    </aside>
  );
}
