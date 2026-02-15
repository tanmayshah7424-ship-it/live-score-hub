import { matches } from "@/data/mockData";
import { MatchCard } from "@/components/MatchCard";
import { useFavorites } from "@/hooks/useFavorites";
import { Header } from "@/components/Header";
import { Zap, Calendar, CheckCircle, TrendingUp, Users, Trophy } from "lucide-react";
import { LiveIndicator } from "@/components/LiveBadge";

const Index = () => {
  const { isFav, toggle } = useFavorites();

  const liveMatches = matches.filter((m) => m.status === "live");
  const upcomingMatches = matches.filter((m) => m.status === "upcoming");
  const completedMatches = matches.filter((m) => m.status === "completed");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6 space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl card-glass p-8 md:p-12">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                Live Sports Updates
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">
              Live <span className="text-gradient">Scores</span>
              <br />
              <span className="text-muted-foreground text-2xl sm:text-3xl md:text-4xl">
                Real-time Updates
              </span>
            </h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl">
              Track live scores across Cricket, Football & Basketball. Never miss a moment of the action.
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 pt-6 max-w-xl">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Zap className="w-4 h-4 text-live" />
                  <p className="text-2xl font-bold font-mono text-live">{liveMatches.length}</p>
                </div>
                <p className="text-xs text-muted-foreground">Live Now</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <p className="text-2xl font-bold font-mono">{upcomingMatches.length}</p>
                </div>
                <p className="text-xs text-muted-foreground">Upcoming</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Trophy className="w-4 h-4 text-primary" />
                  <p className="text-2xl font-bold font-mono">{matches.length}</p>
                </div>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </div>
        </div>

        {/* Live Matches */}
        {liveMatches.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-live/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-live" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Live Now</h2>
                  <p className="text-sm text-muted-foreground">Happening right now</p>
                </div>
              </div>
              <LiveIndicator />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {liveMatches.map((m) => (
                <MatchCard key={m.id} match={m} isFav={isFav(m.id)} onToggleFav={toggle} />
              ))}
            </div>
          </section>
        )}

        {/* Upcoming Matches */}
        {upcomingMatches.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Upcoming Matches</h2>
                <p className="text-sm text-muted-foreground">Scheduled fixtures</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingMatches.map((m) => (
                <MatchCard key={m.id} match={m} isFav={isFav(m.id)} onToggleFav={toggle} />
              ))}
            </div>
          </section>
        )}

        {/* Recent Results */}
        {completedMatches.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Recent Results</h2>
                <p className="text-sm text-muted-foreground">Completed matches</p>
              </div>
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
