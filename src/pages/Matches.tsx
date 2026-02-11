import { matches } from "@/data/mockData";
import { MatchCard } from "@/components/MatchCard";
import { useFavorites } from "@/hooks/useFavorites";
import { Header } from "@/components/Header";
import { useState } from "react";
import { cn } from "@/lib/utils";

const sportFilters = ["all", "cricket", "football", "basketball"] as const;
const statusFilters = ["all", "live", "upcoming", "completed"] as const;

const Matches = () => {
  const { isFav, toggle } = useFavorites();
  const [sport, setSport] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");

  const filtered = matches.filter((m) => {
    if (sport !== "all" && m.sport !== sport) return false;
    if (status !== "all" && m.status !== status) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6 space-y-6">
        <h1 className="text-2xl font-bold">All Matches</h1>

        <div className="flex flex-wrap gap-2">
          {sportFilters.map((s) => (
            <button
              key={s}
              onClick={() => setSport(s)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors",
                sport === s ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              {s}
            </button>
          ))}
          <div className="w-px bg-border mx-1" />
          {statusFilters.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors",
                status === s ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              {s}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No matches found</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((m) => (
              <MatchCard key={m.id} match={m} isFav={isFav(m.id)} onToggleFav={toggle} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Matches;
