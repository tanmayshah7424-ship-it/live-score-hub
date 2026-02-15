import { matches } from "@/data/mockData";
import { MatchCard } from "@/components/MatchCard";
import { useFavorites } from "@/hooks/useFavorites";
import { Header } from "@/components/Header";
import { Trophy, Filter, Zap, Calendar, CheckCircle } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type FilterType = "all" | "live" | "upcoming" | "completed";

const Matches = () => {
  const { isFav, toggle } = useFavorites();
  const [filter, setFilter] = useState<FilterType>("all");

  const filteredMatches = matches.filter((m) => {
    if (filter === "all") return true;
    return m.status === filter;
  });

  const liveCount = matches.filter((m) => m.status === "live").length;
  const upcomingCount = matches.filter((m) => m.status === "upcoming").length;
  const completedCount = matches.filter((m) => m.status === "completed").length;

  const filters: { value: FilterType; label: string; icon: any; count: number; color: string }[] = [
    { value: "all", label: "All Matches", icon: Trophy, count: matches.length, color: "text-foreground" },
    { value: "live", label: "Live", icon: Zap, count: liveCount, color: "text-live" },
    { value: "upcoming", label: "Upcoming", icon: Calendar, count: upcomingCount, color: "text-blue-400" },
    { value: "completed", label: "Completed", icon: CheckCircle, count: completedCount, color: "text-muted-foreground" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6 space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold">Matches</h1>
              <p className="text-sm text-muted-foreground">
                Browse all matches across all sports
              </p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="card-glass rounded-xl p-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {filters.map((f) => {
                const Icon = f.icon;
                const isActive = filter === f.value;
                return (
                  <button
                    key={f.value}
                    onClick={() => setFilter(f.value)}
                    className={cn(
                      "flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                        : "hover:bg-secondary text-muted-foreground"
                    )}
                  >
                    <Icon className={cn("w-4 h-4", isActive ? "" : f.color)} />
                    <span className="hidden sm:inline">{f.label}</span>
                    <span className="sm:hidden">{f.label.split(" ")[0]}</span>
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-bold",
                        isActive
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-secondary text-foreground"
                      )}
                    >
                      {f.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Matches Grid */}
        {filteredMatches.length === 0 ? (
          <div className="card-glass rounded-xl p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <Filter className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No matches found</h3>
            <p className="text-sm text-muted-foreground">
              Try selecting a different filter
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMatches.map((m, idx) => (
              <div
                key={m.id}
                className="animate-slide-up"
                style={{ animationDelay: `${idx * 30}ms` }}
              >
                <MatchCard match={m} isFav={isFav(m.id)} onToggleFav={toggle} />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Matches;
