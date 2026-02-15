import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { StatusBadge } from "@/components/LiveBadge";
import { ScoreTimeline } from "@/components/ScoreTimeline";
import { LiveChat } from "@/components/LiveChat";
import { ArrowLeft, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const MatchDetail = () => {
  const { id } = useParams();
  const [match, setMatch] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Initial Data
  useEffect(() => {
    if (id) {
      fetchMatchData();
      fetchEvents();
    }
  }, [id]);

  // Realtime Subscriptions
  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel(`match_detail:${id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "matches", filter: `id=eq.${id}` },
        (payload) => {
          setMatch((prev: any) => ({ ...prev, ...payload.new }));
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "match_events", filter: `match_id=eq.${id}` },
        (payload) => {
          setEvents((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const fetchMatchData = async () => {
    const { data, error } = await supabase
      .from("matches")
      .select(`
                *,
                home_team:teams!home_team_id(*),
                away_team:teams!away_team_id(*)
            `)
      .eq("id", id)
      .single();

    if (error) console.error("Error fetching match:", error);
    else setMatch(data);
    setLoading(false);
  };

  const fetchEvents = async () => {
    const { data, error } = await (supabase as any)
      .from("match_events")
      .select("*")
      .eq("match_id", id)
      .order("created_at", { ascending: false });

    if (error) console.error("Error fetching events:", error);
    else setEvents(data || []);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-12 text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-12 text-center">
          <p className="text-muted-foreground">Match not found</p>
          <Link to="/matches" className="text-primary text-sm mt-2 inline-block">← Back to matches</Link>
        </div>
      </div>
    );
  }

  // Transform events for ScoreTimeline
  const timelineEvents = events.map(e => ({
    id: e.id,
    matchId: id!,
    type: e.type,
    description: e.description,
    timestamp: format(new Date(e.created_at), "HH:mm:ss"),
    value: e.score_update?.runs || 0
  }));

  return (
    <div className="min-h-screen bg-background pb-12">
      <Header />
      <main className="container py-6 max-w-4xl space-y-6">
        <Link to="/matches" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Matches
        </Link>

        {/* Scoreboard */}
        <div className="card-glass rounded-xl p-6 md:p-8 space-y-6 border-t-4 border-t-primary shadow-lg">
          <div className="flex items-center justify-between">
            <StatusBadge status={match.status} />
            <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {match.current_time || format(new Date(match.start_time), "MMM d, HH:mm")}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 md:gap-12">
            {/* Home Team */}
            <div className="text-center flex-1">
              {match.home_team?.logo_url ? (
                <img src={match.home_team.logo_url} alt={match.home_team.name} className="w-16 h-16 mx-auto mb-3 object-contain" />
              ) : (
                <div className="w-16 h-16 mx-auto mb-3 bg-secondary rounded-full flex items-center justify-center text-2xl font-bold">
                  {match.home_team?.name?.substring(0, 1)}
                </div>
              )}
              <h2 className="font-bold text-lg md:text-xl truncate">{match.home_team?.name}</h2>
              <p className={cn("font-mono text-4xl md:text-5xl font-bold mt-2", match.status === "live" && "text-primary animate-pulse")}>
                {match.score_home ?? 0}
              </p>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-muted-foreground font-bold text-xl mb-1">VS</span>
              {match.status === 'scheduled' && (
                <span className="text-xs bg-secondary px-2 py-1 rounded-full text-muted-foreground">
                  Starts {format(new Date(match.start_time), "HH:mm")}
                </span>
              )}
            </div>

            {/* Away Team */}
            <div className="text-center flex-1">
              {match.away_team?.logo_url ? (
                <img src={match.away_team.logo_url} alt={match.away_team.name} className="w-16 h-16 mx-auto mb-3 object-contain" />
              ) : (
                <div className="w-16 h-16 mx-auto mb-3 bg-secondary rounded-full flex items-center justify-center text-2xl font-bold">
                  {match.away_team?.name?.substring(0, 1)}
                </div>
              )}
              <h2 className="font-bold text-lg md:text-xl truncate">{match.away_team?.name}</h2>
              <p className={cn("font-mono text-4xl md:text-5xl font-bold mt-2", match.status === "live" && "text-primary animate-pulse")}>
                {match.score_away ?? 0}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Commentary / Timeline */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 bg-primary rounded-full" />
              <h3 className="font-bold text-lg">Match Commentary</h3>
            </div>

            {timelineEvents.length > 0 ? (
              <ScoreTimeline events={timelineEvents} />
            ) : (
              <div className="card-glass rounded-lg p-8 text-center text-muted-foreground">
                <p>No events recorded yet.</p>
                {match.status === 'scheduled' && <p className="text-sm mt-1">Commentary will start when match begins.</p>}
              </div>
            )}
          </div>

          {/* Live Chat */}
          <div>
            <LiveChat matchId={id!} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default MatchDetail;
