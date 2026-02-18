import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { matchesAPI, commentaryAPI, liveAPI } from "@/api/endpoints";
import { useSocket } from "@/contexts/SocketContext";
import { Activity, MapPin, Clock, Trophy, Users, FileText, Info } from "lucide-react";

// Helper to detect UUID (CricAPI ID) vs MongoID
const isCricApiId = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: any;
  label: string;
}

const TabButton = ({ active, onClick, icon: Icon, label }: TabButtonProps) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${active
      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
      : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
      }`}
  >
    <Icon className="w-4 h-4" />
    {label}
  </button>
);

const MatchDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("info");

  // Local Data
  const [localMatch, setLocalMatch] = useState<any>(null);
  const [commentary, setCommentary] = useState<any[]>([]);

  // CricAPI Data
  const [cricMatch, setCricMatch] = useState<any>(null);
  const [scorecard, setScorecard] = useState<any>(null);
  const [squad, setSquad] = useState<any>(null);

  const { socket } = useSocket();
  const isExternal = id ? isCricApiId(id) : false;

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        if (isExternal) {
          // CricAPI Fetch
          const [infoRes, scoreRes, squadRes] = await Promise.all([
            liveAPI.getMatchInfo(id).catch(() => ({ data: null })),
            liveAPI.getScorecard(id).catch(() => ({ data: null })),
            liveAPI.getSquad(id).catch(() => ({ data: null })),
          ]);

          // If info fails, try to find it in the live list cache via getAll
          // (Not implemented here, assuming direct fetch works or we handle null)

          setCricMatch(infoRes.data?.data || null);
          setScorecard(scoreRes.data?.data || null);
          setSquad(squadRes.data?.data || null);

        } else {
          // Local Fetch
          const [mRes, cRes] = await Promise.all([
            matchesAPI.getById(id),
            commentaryAPI.getByMatch(id),
          ]);
          setLocalMatch(mRes.data);
          setCommentary(cRes.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isExternal]);

  // Socket logic (existing)
  useEffect(() => {
    if (!socket || !id || isExternal) return; // Only for local matches for now

    socket.emit("match:join", id);
    socket.on("score:update", (updated: any) => {
      if (updated._id === id) setLocalMatch(updated);
    });
    socket.on("commentary:new", (event: any) => {
      if (event.matchId === id) setCommentary((prev) => [event, ...prev]);
    });
    socket.on("match:status", (updated: any) => {
      if (updated._id === id) setLocalMatch(updated);
    });

    return () => {
      socket.emit("match:leave", id);
      socket.off("score:update");
      socket.off("commentary:new");
      socket.off("match:status");
    };
  }, [socket, id, isExternal]);


  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container py-12 flex justify-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </main>
      </div>
    );
  }

  const match = isExternal ? cricMatch : localMatch;

  if (!match) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container py-12 text-center text-muted-foreground">Match not found</main>
      </div>
    );
  }

  // Normalization for display
  const display = isExternal ? {
    name: match.name,
    tournament: match.matchType?.toUpperCase() || "MATCH", // CricAPI matchType (odi, t20)
    venue: match.venue,
    status: match.status,
    date: match.date,
    teamA: {
      name: match.teams?.[0] || "Team A",
      short: match.teamInfo?.[0]?.shortname || match.teams?.[0]?.slice(0, 3).toUpperCase(),
      img: match.teamInfo?.[0]?.img || ""
    },
    teamB: {
      name: match.teams?.[1] || "Team B",
      short: match.teamInfo?.[1]?.shortname || match.teams?.[1]?.slice(0, 3).toUpperCase(),
      img: match.teamInfo?.[1]?.img || ""
    },
    scoreA: match.score?.find((s: any) => s.inning.includes(match.teams?.[0]))?.r + "/" + match.score?.find((s: any) => s.inning.includes(match.teams?.[0]))?.w || "0/0",
    scoreB: match.score?.find((s: any) => s.inning.includes(match.teams?.[1]))?.r + "/" + match.score?.find((s: any) => s.inning.includes(match.teams?.[1]))?.w || "0/0",
    oversA: match.score?.find((s: any) => s.inning.includes(match.teams?.[0]))?.o,
    oversB: match.score?.find((s: any) => s.inning.includes(match.teams?.[1]))?.o,
  } : {
    name: `${localMatch.teamA.name} vs ${localMatch.teamB.name}`,
    tournament: localMatch.tournament,
    venue: localMatch.venue,
    status: localMatch.status,
    date: localMatch.date,
    teamA: { name: localMatch.teamA.name, short: localMatch.teamA.shortName, img: localMatch.teamA.logo },
    teamB: { name: localMatch.teamB.name, short: localMatch.teamB.shortName, img: localMatch.teamB.logo },
    scoreA: localMatch.scoreA,
    scoreB: localMatch.scoreB,
    oversA: localMatch.overs, // Assuming local match has generic overs field not split
    oversB: null
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container py-6 space-y-6">
        {/* Match Header */}
        <div className="card-glass rounded-xl p-6 space-y-8 animate-slide-up">
          {/* Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full border bg-primary/10 text-primary border-primary/20">
                {display.tournament}
              </span>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                <MapPin className="w-3 h-3" />
                {display.venue}
              </div>
            </div>

            {/* Live Indicator */}
            {display.status?.toLowerCase() === "live" || display.status === "In Progress" || display.status === "Tea Break" || display.status === "Innings Break" ? (
              <span className="flex items-center gap-1.5 text-sm font-bold text-live px-3 py-1 rounded-full bg-live/10 border border-live/30">
                <span className="w-2 h-2 rounded-full bg-live animate-live-pulse" />
                {display.status?.toUpperCase() || "LIVE"}
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground px-3 py-1 rounded-full bg-secondary">
                {display.status === "Match not started" || display.status === "upcoming" ? <Clock className="w-3 h-3" /> : <Trophy className="w-3 h-3" />}
                {display.status?.toUpperCase()}
              </span>
            )}
          </div>

          {/* Scores */}
          <div className="grid grid-cols-3 items-center gap-4">
            {/* Team A */}
            <div className="text-center space-y-4">
              <div className="relative inline-block">
                {display.teamA.img ? (
                  <img src={display.teamA.img} alt={display.teamA.name} className="w-16 h-16 sm:w-20 sm:h-20 object-contain mx-auto" />
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-secondary rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                    {display.teamA.short?.[0]}
                  </div>
                )}
              </div>
              <div>
                <p className="font-bold text-lg leading-none">{display.teamA.short}</p>
                <p className="text-xs text-muted-foreground mt-1 hidden sm:block">{display.teamA.name}</p>
              </div>
            </div>

            {/* Score Center */}
            <div className="text-center space-y-2">
              <div className="flex flex-col items-center gap-1">
                <span className="text-4xl sm:text-5xl font-mono font-bold tracking-tight">
                  {display.scoreA?.split(" ")[0] || "0/0"}
                </span>
                <span className="text-sm text-muted-foreground font-mono">
                  {display.oversA ? `(${display.oversA})` : ""}
                </span>
              </div>
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest py-1">VS</div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-4xl sm:text-5xl font-mono font-bold tracking-tight text-muted-foreground/70">
                  {display.scoreB?.split(" ")[0] || "0/0"}
                </span>
                <span className="text-sm text-muted-foreground font-mono">
                  {display.oversB ? `(${display.oversB})` : ""}
                </span>
              </div>
              {/* Status Text */}
              <p className="text-xs text-primary font-medium mt-2">{display.status}</p>
            </div>

            {/* Team B */}
            <div className="text-center space-y-4">
              <div className="relative inline-block">
                {display.teamB.img ? (
                  <img src={display.teamB.img} alt={display.teamB.name} className="w-16 h-16 sm:w-20 sm:h-20 object-contain mx-auto" />
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-secondary rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                    {display.teamB.short?.[0]}
                  </div>
                )}
              </div>
              <div>
                <p className="font-bold text-lg leading-none">{display.teamB.short}</p>
                <p className="text-xs text-muted-foreground mt-1 hidden sm:block">{display.teamB.name}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <TabButton active={activeTab === "info"} onClick={() => setActiveTab("info")} icon={Info} label="Info" />
          <TabButton active={activeTab === "scorecard"} onClick={() => setActiveTab("scorecard")} icon={FileText} label="Scorecard" />
          <TabButton active={activeTab === "squads"} onClick={() => setActiveTab("squads")} icon={Users} label="Squads" />
          {!isExternal && <TabButton active={activeTab === "commentary"} onClick={() => setActiveTab("commentary")} icon={Activity} label="Commentary" />}
        </div>

        {/* Tab Content */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === "info" && (
            <div className="card-glass rounded-xl p-6">
              <h3 className="font-bold mb-4">Match Info</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="p-4 rounded-lg bg-secondary/30 space-y-1">
                  <span className="text-muted-foreground text-xs">Date</span>
                  <p className="font-medium">{new Date(display.date).toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-lg bg-secondary/30 space-y-1">
                  <span className="text-muted-foreground text-xs">Venue</span>
                  <p className="font-medium">{display.venue}</p>
                </div>
                <div className="p-4 rounded-lg bg-secondary/30 space-y-1">
                  <span className="text-muted-foreground text-xs">Toss</span>
                  <p className="font-medium">{isExternal ? (match.tossWinner ? `${match.tossWinner} chose to ${match.tossChoice}` : "-") : "-"}</p>
                </div>
                <div className="p-4 rounded-lg bg-secondary/30 space-y-1">
                  <span className="text-muted-foreground text-xs">Series</span>
                  <p className="font-medium">{display.tournament}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "scorecard" && (
            <div className="space-y-4">
              {isExternal ? (
                scorecard?.scorecard?.map((inning: any, idx: number) => (
                  <div key={idx} className="card-glass rounded-xl p-6">
                    <h3 className="font-bold mb-4 flex justify-between items-center">
                      <span>{inning.inning}</span>
                      <span className="text-primary">{inning.runs}/{inning.wickets} ({inning.overs})</span>
                    </h3>
                    {/* Simple Batsmen List */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-secondary/50">
                          <tr>
                            <th className="px-3 py-2">Batter</th>
                            <th className="px-3 py-2 text-right">R</th>
                            <th className="px-3 py-2 text-right">B</th>
                            <th className="px-3 py-2 text-right">4s</th>
                            <th className="px-3 py-2 text-right">6s</th>
                            <th className="px-3 py-2 text-right">SR</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                          {inning.batsman?.map((b: any, i: number) => (
                            <tr key={i} className="hover:bg-white/5">
                              <td className="px-3 py-2 font-medium">
                                <span
                                  onClick={() => {
                                    if (b.id) {
                                      navigate(`/player/${b.id}`);
                                    } else {
                                      // Search by name in Player Stats
                                      navigate(`/player-stats?name=${encodeURIComponent(b.name)}`);
                                    }
                                  }}
                                  className="cursor-pointer hover:text-primary transition-colors hover:underline"
                                >
                                  {b.name}
                                </span>
                                <span className="text-xs text-muted-foreground ml-1">{b.dismissal}</span>
                              </td>
                              <td className="px-3 py-2 text-right font-bold">{b.r}</td>
                              <td className="px-3 py-2 text-right text-muted-foreground">{b.b}</td>
                              <td className="px-3 py-2 text-right text-muted-foreground">{b["4s"]}</td>
                              <td className="px-3 py-2 text-right text-muted-foreground">{b["6s"]}</td>
                              <td className="px-3 py-2 text-right text-muted-foreground">{b.sr}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))
              ) : (
                <div className="card-glass p-8 text-center text-muted-foreground">
                  Scorecard available via admin updates only for local matches.
                </div>
              )}
            </div>
          )}

          {activeTab === "squads" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isExternal ? (
                squad?.map((teamSquad: any, idx: number) => (
                  <div key={idx} className="card-glass rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border/50">
                      <h3 className="font-bold text-lg">{teamSquad.teamName}</h3>
                      <span className="text-xs bg-secondary px-2 py-1 rounded-md text-muted-foreground">{teamSquad.players?.length} Players</span>
                    </div>
                    <div className="space-y-2">
                      {teamSquad.players?.map((p: any, i: number) => (
                        <div
                          key={i}
                          onClick={() => {
                            if (p.id) {
                              navigate(`/player/${p.id}`);
                            } else {
                              navigate(`/player-stats?name=${encodeURIComponent(p.name)}`);
                            }
                          }}
                          className="flex items-center gap-3 p-2 rounded-lg transition-colors hover:bg-white/5 cursor-pointer group"
                        >
                          {p.role === "Captain" && <span className="text-xs bg-yellow-500/10 text-yellow-500 px-1.5 py-0.5 rounded">C</span>}
                          {p.role === "Wicketkeeper" && <span className="text-xs bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded">WK</span>}
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${p.id ? "group-hover:text-primary transition-colors" : ""}`}>{p.name}</p>
                            <p className="text-xs text-muted-foreground">{p.battingStyle || p.bowlingStyle}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 card-glass p-8 text-center text-muted-foreground">
                  Squads not loaded for this match.
                </div>
              )}
            </div>
          )}

          {activeTab === "commentary" && !isExternal && (
            <div className="card-glass rounded-xl p-6">
              {/* Existing Commentary Logic */}
              {commentary.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No commentary yet</p>
              ) : (
                <div className="space-y-2">
                  {commentary.map((event: any) => (
                    <div key={event._id} className="border-l-4 rounded-r-lg px-4 py-3 bg-secondary/10 border-primary">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-muted-foreground w-12 shrink-0">{event.timestamp}</span>
                        <span className="text-sm">{event.description}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MatchDetail;


