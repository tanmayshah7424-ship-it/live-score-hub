import { matches, teams, players } from "@/data/mockData";
import { MatchCard } from "@/components/MatchCard";
import { useFavorites } from "@/hooks/useFavorites";
import { Header } from "@/components/Header";
import { useState } from "react";
import { Search as SearchIcon } from "lucide-react";

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const { isFav, toggle } = useFavorites();

  const q = query.toLowerCase().trim();

  const matchResults = q
    ? matches.filter(
        (m) =>
          m.teamA.name.toLowerCase().includes(q) ||
          m.teamB.name.toLowerCase().includes(q) ||
          m.tournament.toLowerCase().includes(q) ||
          m.venue.toLowerCase().includes(q)
      )
    : [];

  const teamResults = q ? teams.filter((t) => t.name.toLowerCase().includes(q) || t.shortName.toLowerCase().includes(q)) : [];
  const playerResults = q ? players.filter((p) => p.name.toLowerCase().includes(q)) : [];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6 space-y-6 max-w-2xl">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search matches, teams, players..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            autoFocus
          />
        </div>

        {q && teamResults.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Teams</h2>
            <div className="flex flex-wrap gap-2">
              {teamResults.map((t) => (
                <div key={t.id} className="card-glass rounded-lg px-3 py-2 flex items-center gap-2 text-sm">
                  <span>{t.logo}</span>
                  <span className="font-medium">{t.name}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {q && playerResults.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Players</h2>
            <div className="space-y-2">
              {playerResults.map((p) => (
                <div key={p.id} className="card-glass rounded-lg px-4 py-3 flex justify-between">
                  <div>
                    <p className="font-medium text-sm">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {q && matchResults.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Matches</h2>
            <div className="grid gap-3">
              {matchResults.map((m) => (
                <MatchCard key={m.id} match={m} isFav={isFav(m.id)} onToggleFav={toggle} />
              ))}
            </div>
          </section>
        )}

        {q && matchResults.length === 0 && teamResults.length === 0 && playerResults.length === 0 && (
          <p className="text-center py-12 text-muted-foreground">No results for "{query}"</p>
        )}
      </main>
    </div>
  );
};

export default SearchPage;
