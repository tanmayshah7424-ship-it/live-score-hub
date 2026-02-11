import { matches, teams } from "@/data/mockData";
import { MatchCard } from "@/components/MatchCard";
import { useFavorites } from "@/hooks/useFavorites";
import { Header } from "@/components/Header";

const Favorites = () => {
  const { favorites, isFav, toggle } = useFavorites();

  const favMatches = matches.filter((m) => favorites.includes(m.id));
  const favTeams = teams.filter((t) => favorites.includes(t.id));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6 space-y-8">
        <h1 className="text-2xl font-bold">Favorites</h1>

        {favMatches.length === 0 && favTeams.length === 0 && (
          <p className="text-center py-12 text-muted-foreground">
            No favorites yet. Star matches or teams to see them here!
          </p>
        )}

        {favTeams.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-3">Teams</h2>
            <div className="flex flex-wrap gap-3">
              {favTeams.map((team) => (
                <div key={team.id} className="card-glass rounded-lg px-4 py-3 flex items-center gap-2">
                  <span className="text-xl">{team.logo}</span>
                  <span className="font-semibold text-sm">{team.name}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {favMatches.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-3">Matches</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {favMatches.map((m) => (
                <MatchCard key={m.id} match={m} isFav={isFav(m.id)} onToggleFav={toggle} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Favorites;
