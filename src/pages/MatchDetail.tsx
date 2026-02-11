import { useParams, Link } from "react-router-dom";
import { matches, scoreEvents } from "@/data/mockData";
import { Header } from "@/components/Header";
import { StatusBadge } from "@/components/LiveBadge";
import { ScoreTimeline } from "@/components/ScoreTimeline";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const MatchDetail = () => {
  const { id } = useParams();
  const match = matches.find((m) => m.id === id);
  const events = scoreEvents.filter((e) => e.matchId === id);

  if (!match) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-12 text-center">
          <p className="text-muted-foreground">Match not found</p>
          <Link to="/" className="text-primary text-sm mt-2 inline-block">← Back to home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6 max-w-2xl space-y-6">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        {/* Scoreboard */}
        <div className="card-glass rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <StatusBadge status={match.status} />
            <span className="text-xs text-muted-foreground">{match.tournament}</span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="text-center flex-1">
              <div className="text-3xl mb-1">{match.teamA.logo}</div>
              <p className="font-bold">{match.teamA.shortName}</p>
              <p className={cn("font-mono text-2xl font-bold mt-1", match.status === "live" && "text-primary animate-score-pop")}>
                {match.scoreA}
              </p>
            </div>

            <div className="text-muted-foreground font-bold text-xl">vs</div>

            <div className="text-center flex-1">
              <div className="text-3xl mb-1">{match.teamB.logo}</div>
              <p className="font-bold">{match.teamB.shortName}</p>
              <p className={cn("font-mono text-2xl font-bold mt-1", match.status === "live" && "text-primary animate-score-pop")}>
                {match.scoreB}
              </p>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground">{match.summary}</p>
          <p className="text-center text-xs text-muted-foreground/60">{match.venue}</p>
        </div>

        {/* Timeline */}
        {events.length > 0 && <ScoreTimeline events={events} />}
        {events.length === 0 && (
          <div className="card-glass rounded-lg p-6 text-center text-muted-foreground text-sm">
            No ball-by-ball data available for this match yet.
          </div>
        )}
      </main>
    </div>
  );
};

export default MatchDetail;
