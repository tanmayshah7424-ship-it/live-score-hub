import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Home, Trophy, Users, History, Star, Search, Menu, X, Target } from "lucide-react";
import { useState } from "react";
import { useSocket } from "@/contexts/SocketContext";
import { LiveMatchTicker } from "./LiveMatchTicker";
import { UserDropdown } from "./UserDropdown";
import { NotificationPanel } from "./NotificationPanel";
import { ThemeToggle } from "./ThemeToggle";
import { GlobalSearch } from "./GlobalSearch";

const navItems = [
  { to: "/", label: "Live", icon: Home, isLive: true },
  { to: "/matches", label: "Matches", icon: Trophy },
  { to: "/teams", label: "Teams", icon: Users },
  { to: "/history", label: "History", icon: History },
  { to: "/favorites", label: "Favorites", icon: Star },
  { to: "/player-stats", label: "Player Stats", icon: Target },
];

export function Header() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { liveMatches } = useSocket();
  const hasLiveMatches = liveMatches && liveMatches.length > 0;

  return (
    // Header Component
    <header className="sticky top-0 z-50">
      {/* Top Bar */}
      <div className="h-12 bg-background/80 border-b border-border backdrop-blur-xl sticky top-0 z-50">
        <div className="container h-full flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-primary-foreground font-bold text-sm">SC</span>
            </div>
            <span className="font-bold text-lg hidden sm:inline text-foreground">
              Score<span className="text-primary">Hub</span>
            </span>
          </Link>

          {/* Live Match Ticker - Desktop */}
          <div className="hidden md:block flex-1 max-w-2xl">
            <LiveMatchTicker />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <GlobalSearch />
            <ThemeToggle />
            <NotificationPanel />
            <div className="hidden md:block">
              <UserDropdown />
            </div>
            <button
              className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <nav className="h-14 bg-background/60 border-b border-border backdrop-blur-md">
        <div className="container h-full">
          <div className="hidden md:flex items-center justify-center gap-2 h-full">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.to;
              const isLiveTab = item.isLive && hasLiveMatches;

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 relative",
                    active
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  )}
                >
                  <Icon className={cn("w-4 h-4", isLiveTab && "animate-pulse text-live")} />
                  {item.label}
                  {isLiveTab && (
                    <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-live rounded-full animate-pulse ring-2 ring-background"></span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-b border-border bg-background/95 backdrop-blur-xl absolute top-12 left-0 right-0 z-40 shadow-lg animate-in slide-in-from-top-2">
          {/* Live Ticker - Mobile */}
          <div className="border-b border-border py-3 px-4">
            <LiveMatchTicker />
          </div>

          {/* Navigation */}
          <nav className="p-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.to;
              const isLiveTab = item.isLive && hasLiveMatches;

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary font-bold"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  )}
                >
                  <Icon className={cn("w-5 h-5", isLiveTab && "animate-pulse text-live")} />
                  {item.label}
                  {isLiveTab && <span className="ml-auto text-xs text-live animate-pulse font-bold">● LIVE</span>}
                </Link>
              );
            })}
          </nav>

          {/* User Section - Mobile */}
          <div className="border-t border-border p-4 bg-secondary/30">
            <UserDropdown />
          </div>
        </div>
      )}
    </header>
  );
}
