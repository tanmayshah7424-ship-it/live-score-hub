import { matches } from "@/data/mockData";
import { MatchCard } from "@/components/MatchCard";
import { useFavorites } from "@/hooks/useFavorites";
import { Header } from "@/components/Header";

const History = () => {
  const { isFav, toggle } = useFavorites();
  const completed = matches.filter((m) => m.status === "completed");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6 space-y-6">
        <h1 className="text-2xl font-bold">Match History</h1>
        {completed.length === 0 ? (
          <p className="text-center py-12 text-muted-foreground">No completed matches yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {completed.map((m) => (
              <MatchCard key={m.id} match={m} isFav={isFav(m.id)} onToggleFav={toggle} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default History;
