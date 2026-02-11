import { teams, players } from "@/data/mockData";
import { Header } from "@/components/Header";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { FavoriteButton, useFavorites } from "@/hooks/useFavorites";

const sportFilters = ["all", "cricket", "football", "basketball"] as const;

const Teams = () => {
  const [sport, setSport] = useState<string>("all");
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const { isFav, toggle } = useFavorites();

  const filtered = teams.filter((t) => sport === "all" || t.sport === sport);
  const teamPlayers = selectedTeam ? players.filter((p) => p.teamId === selectedTeam) : [];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6 space-y-6">
        <h1 className="text-2xl font-bold">Teams & Players</h1>

        <div className="flex flex-wrap gap-2">
          {sportFilters.map((s) => (
            <button
              key={s}
              onClick={() => { setSport(s); setSelectedTeam(null); }}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors",
                sport === s ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filtered.map((team) => (
            <button
              key={team.id}
              onClick={() => setSelectedTeam(selectedTeam === team.id ? null : team.id)}
              className={cn(
                "card-glass rounded-lg p-4 text-center transition-all hover:scale-105",
                selectedTeam === team.id && "ring-2 ring-primary glow"
              )}
            >
              <div className="text-3xl mb-2">{team.logo}</div>
              <p className="font-semibold text-sm">{team.shortName}</p>
              <p className="text-xs text-muted-foreground truncate">{team.name}</p>
              <div className="mt-2 flex justify-center">
                <FavoriteButton id={team.id} isFav={isFav(team.id)} onToggle={toggle} />
              </div>
            </button>
          ))}
        </div>

        {selectedTeam && teamPlayers.length > 0 && (
          <section className="animate-slide-up">
            <h2 className="text-lg font-bold mb-3">Players</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {teamPlayers.map((player) => (
                <div key={player.id} className="card-glass rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{player.name}</p>
                    <p className="text-xs text-muted-foreground">{player.role}</p>
                  </div>
                  <div className="text-right">
                    {Object.entries(player.stats).slice(0, 2).map(([key, val]) => (
                      <p key={key} className="text-xs">
                        <span className="text-muted-foreground capitalize">{key}:</span>{" "}
                        <span className="font-mono font-semibold">{val}</span>
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {selectedTeam && teamPlayers.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-6">No players listed for this team.</p>
        )}
      </main>
    </div>
  );
};

export default Teams;
