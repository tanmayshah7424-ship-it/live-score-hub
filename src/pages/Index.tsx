import { matches } from "@/data/mockData";
import { MatchCard } from "@/components/MatchCard";
import { useFavorites } from "@/hooks/useFavorites";
import { Header } from "@/components/Header";
import { Zap, Calendar, CheckCircle } from "lucide-react";

const Index = () => {
  const { isFav, toggle } = useFavorites();

  const liveMatches = matches.filter((m) => m.status === "live");
  const upcomingMatches = matches.filter((m) => m.status === "upcoming");
  const completedMatches = matches.filter((m) => m.status === "completed");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6 space-y-8">
        {/* Hero */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold">
            Live <span className="text-gradient">Scores</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            Real-time updates across Cricket, Football & Basketball
          </p>
        </div>

        {/* Live */}
        {liveMatches.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-live" />
              <h2 className="text-lg font-bold">Live Now</h2>
              <span className="w-2 h-2 rounded-full bg-live animate-live-pulse" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {liveMatches.map((m) => (
                <MatchCard key={m.id} match={m} isFav={isFav(m.id)} onToggleFav={toggle} />
              ))}
            </div>
          </section>
        )}

        {/* Upcoming */}
        {upcomingMatches.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-lg font-bold">Upcoming</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingMatches.map((m) => (
                <MatchCard key={m.id} match={m} isFav={isFav(m.id)} onToggleFav={toggle} />
              ))}
            </div>
          </section>
        )}

        {/* Recent */}
        {completedMatches.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-lg font-bold">Recent Results</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedMatches.map((m) => (
                <MatchCard key={m.id} match={m} isFav={isFav(m.id)} onToggleFav={toggle} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Index;
