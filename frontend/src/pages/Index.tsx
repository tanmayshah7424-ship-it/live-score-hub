import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy } from "lucide-react";

interface TeamRef {
  _id: string;
  name: string;
  shortName: string;
  logo: string;
  sport: string;
}

interface Match {
  _id: string;
  sport: string;
  tournament: string;
  status: string;
  venue: string;
  date: string;
  teamA: TeamRef;
  teamB: TeamRef;
  scoreA: string;
  scoreB: string;
  summary: string;
  overs?: string;
  minute?: string;
}

// TheSportsDB external match shape
interface ExternalMatch {
  id: string;
  sport: string;
  tournament: string;
  status: string;
  venue: string;
  date: string;
  time: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: string;
  awayScore: string;
  homeBadge: string;
  awayBadge: string;
  source: string;
}

const sportColors: Record<string, string> = {
  cricket: "bg-sport-cricket/10 text-sport-cricket border-sport-cricket/30",
  football: "bg-sport-football/10 text-sport-football border-sport-football/30",
  basketball: "bg-sport-basketball/10 text-sport-basketball border-sport-basketball/30",
  tennis: "bg-sport-tennis/10 text-sport-tennis border-sport-tennis/30",
};

import { useMatches } from "@/hooks/useMatches";

const Index = () => {
  const { liveMatches, upcomingMatches, completedMatches, externalMatches, loading } = useMatches();
  const [activeSport, setActiveSport] = useState("all");
  const navigate = useNavigate();

  // Socket logic is now handled inside useMatches hook!

  // Local match card (for admin-created matches)
  const MatchCard = ({ match }: { match: Match }) => (
    <div
      onClick={() => navigate(`/match/${match._id}`)}
      className="card-glass rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:glow group animate-slide-up relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full pointer-events-none" />

      <div className="flex items-center justify-between mb-6">
        <span className={`text-[10px] font-black tracking-wider px-3 py-1 rounded-full border ${sportColors[match.sport] || ""}`}>
          {match.sport.toUpperCase()}
        </span>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-live animate-live-pulse" />
          <span className="text-xs font-bold text-live tracking-wide">LIVE</span>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between group-hover:translate-x-1 transition-transform gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <span className="text-4xl filter drop-shadow-lg shrink-0">{match.teamA?.logo}</span>
            <span className="font-bold text-lg tracking-tight truncate">{match.teamA?.shortName}</span>
          </div>
          <span className="font-mono font-black text-xl sm:text-2xl text-primary animate-score-pop drop-shadow-glow text-right whitespace-nowrap">
            {match.scoreA}
          </span>
        </div>
        <div className="flex items-center justify-between group-hover:translate-x-1 transition-transform delay-75 gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <span className="text-4xl filter drop-shadow-lg shrink-0">{match.teamB?.logo}</span>
            <span className="font-bold text-lg tracking-tight truncate">{match.teamB?.shortName}</span>
          </div>
          <span className="font-mono font-black text-xl sm:text-2xl text-primary drop-shadow-glow text-right whitespace-nowrap">
            {match.scoreB}
          </span>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground/80">
        <p className="font-medium truncate max-w-[70%]">{match.tournament}</p>
        <p>{match.overs || match.minute || "Live"}</p>
      </div>
    </div>
  );

  // External match card (TheSportsDB + CricAPI data)
  const ExternalMatchCard = ({ match }: { match: ExternalMatch }) => {
    const isCricket = match.sport === "cricket";
    const sportBadge = isCricket
      ? { label: "🏏 CRICKET", classes: sportColors.cricket || "bg-orange-500/10 text-orange-400 border-orange-400/30" }
      : { label: "⚽ FOOTBALL", classes: sportColors.football };

    // CricAPI images are direct URLs; TheSportsDB images support /tiny suffix
    const badgeUrl = (url: string) => {
      if (!url) return "";
      if (match.source === "thesportsdb") return url + "/tiny";
      return url;
    };

    return (
      <div
        onClick={() => navigate(`/match/${match.id}`)}
        className="card-glass rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] cursor-pointer animate-slide-up relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full pointer-events-none" />

        <div className="flex items-center justify-between mb-6">
          <span className={`text-[10px] font-black tracking-wider px-3 py-1 rounded-full border ${sportBadge.classes}`}>
            {sportBadge.label}
          </span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-live animate-live-pulse" />
            <span className="text-xs font-bold text-live tracking-wide">LIVE</span>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between hover:translate-x-1 transition-transform gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {match.homeBadge ? (
                <img src={badgeUrl(match.homeBadge)} alt="" className="w-10 h-10 rounded-sm object-contain shrink-0" />
              ) : (
                <span className="text-4xl shrink-0">{isCricket ? "🏏" : "🏟️"}</span>
              )}
              <span className="font-bold text-lg tracking-tight truncate">{match.homeTeam}</span>
            </div>
            <span className="font-mono font-black text-xl sm:text-2xl text-primary animate-score-pop drop-shadow-glow text-right whitespace-nowrap">
              {match.homeScore}
            </span>
          </div>
          <div className="flex items-center justify-between hover:translate-x-1 transition-transform delay-75 gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {match.awayBadge ? (
                <img src={badgeUrl(match.awayBadge)} alt="" className="w-10 h-10 rounded-sm object-contain shrink-0" />
              ) : (
                <span className="text-4xl shrink-0">{isCricket ? "🏏" : "🏟️"}</span>
              )}
              <span className="font-bold text-lg tracking-tight truncate">{match.awayTeam}</span>
            </div>
            <span className="font-mono font-black text-xl sm:text-2xl text-primary drop-shadow-glow text-right whitespace-nowrap">
              {match.awayScore}
            </span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground/80">
          <p className="font-medium truncate max-w-[70%]">{match.tournament}</p>
          <p>{(match as any).status === 'live' ? 'Live' : match.time?.slice(0, 5)}</p>
        </div>
      </div>
    );
  };

  // Filter for LIVE matches only
  const visibleLiveLocal = liveMatches;
  const visibleLiveExternal = externalMatches.filter((m) => m.status === "live");

  // De-duplication Logic
  const uniqueKeys = new Set();
  const filteredLocal: Match[] = [];
  const filteredExternal: ExternalMatch[] = [];

  // 1. Process Local matches first (they have priority)
  visibleLiveLocal.forEach((m) => {
    const key = `${m.sport}-${m.teamA.name}-${m.teamB.name}`.toLowerCase().replace(/\s+/g, '');
    if (!uniqueKeys.has(key)) {
      uniqueKeys.add(key);
      filteredLocal.push(m);
    }
  });

  // 2. Process External matches, checking against existing keys
  visibleLiveExternal.forEach((m) => {
    // Normalize external names to match local format
    const key = `${m.sport}-${m.homeTeam}-${m.awayTeam}`.toLowerCase().replace(/\s+/g, '');

    // Also try swapping teams (Home vs Away order might differ)
    const reverseKey = `${m.sport}-${m.awayTeam}-${m.homeTeam}`.toLowerCase().replace(/\s+/g, '');

    if (!uniqueKeys.has(key) && !uniqueKeys.has(reverseKey)) {
      uniqueKeys.add(key);
      filteredExternal.push(m);
    }
  });

  const hasLiveMatches = filteredLocal.length > 0 || filteredExternal.length > 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground animate-pulse">Finding live action...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container py-8 space-y-12">
        {/* Dynamic Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-background to-background p-8 border border-primary/20">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl opacity-50 animate-pulse" />

          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-live/10 border border-live/20 text-live text-xs font-bold flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-live opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-live"></span>
                </span>
                LIVE NOW
              </span>
              <span className="text-muted-foreground text-sm font-medium">
                {visibleLiveLocal.length + visibleLiveExternal.length} Matches In Progress
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-foreground via-foreground/90 to-foreground/50">
              GAME TIME
            </h1>
            <p className="text-xl text-muted-foreground max-w-lg">
              Experience the pulse of the game. Real-time scores and updates from around the globe.
            </p>
          </div>
        </div>

        {/* Live Matches Grid */}
        <div className="space-y-8">
          {/* Sport Filter Tabs */}
          <div className="flex bg-secondary/30 p-1.5 rounded-xl border border-border/50 w-fit backdrop-blur-md">
            {["all", "cricket", "football", "basketball", "tennis"].map((sport) => (
              <button
                key={sport}
                onClick={() => setActiveSport(sport)}
                className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all capitalize ${activeSport === sport
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105"
                  : "text-muted-foreground hover:text-foreground hover:bg-primary/10"
                  }`}
              >
                {sport}
              </button>
            ))}
          </div>

          {!hasLiveMatches ? (
            <div className="flex flex-col items-center justify-center py-24 text-center space-y-6">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                <Trophy className="w-24 h-24 text-muted-foreground/20 relative z-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-foreground">No Live Matches</h3>
                <p className="text-muted-foreground max-w-xs mx-auto">
                  The arena is quiet right now. Check "Upcoming" to see what's next on the schedule.
                </p>
              </div>
              <button
                onClick={() => navigate('/matches')}
                className="px-6 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-full font-medium transition-colors border border-border"
              >
                View Upcoming Matches
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* Render Local Live Matches */}
              {filteredLocal
                .filter(m => activeSport === 'all' || m.sport === activeSport)
                .map((match) => (
                  <MatchCard key={match._id} match={match} />
                ))}

              {/* Render External Live Matches */}
              {filteredExternal
                .filter(m => activeSport === 'all' || m.sport === activeSport)
                .map((match) => (
                  <ExternalMatchCard key={match.id} match={match} />
                ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
