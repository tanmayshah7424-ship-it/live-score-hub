import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Match, Team } from "@/types/database.extensions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Play, Pause, Square } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const Matches = () => {
    const [matches, setMatches] = useState<(Match & { home_team: Team, away_team: Team })[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [homeTeamId, setHomeTeamId] = useState("");
    const [awayTeamId, setAwayTeamId] = useState("");
    const [startTime, setStartTime] = useState("");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [teamsResponse, matchesResponse] = await Promise.all([
                supabase.from("teams").select("*").order("name"),
                supabase.from("matches").select(`
          *,
          home_team:teams!home_team_id(*),
          away_team:teams!away_team_id(*)
        `).order("start_time", { ascending: false })
            ]);

            if (teamsResponse.error) throw teamsResponse.error;
            if (matchesResponse.error) throw matchesResponse.error;

            setTeams(teamsResponse.data as unknown as Team[]);
            setMatches(matchesResponse.data as unknown as (Match & { home_team: Team, away_team: Team })[]);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateMatch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!homeTeamId || !awayTeamId || !startTime) {
            toast.error("Please fill all fields");
            return;
        }

        try {
            const { error } = await supabase
                .from("matches")
                .insert([{
                    home_team_id: homeTeamId,
                    away_team_id: awayTeamId,
                    start_time: new Date(startTime).toISOString(),
                    status: 'scheduled'
                }]);

            if (error) throw error;

            toast.success("Match scheduled successfully");
            setHomeTeamId("");
            setAwayTeamId("");
            setStartTime("");
            fetchData();
        } catch (error) {
            console.error("Error creating match:", error);
            toast.error("Failed to create match");
        }
    };

    const updateMatchStatus = async (id: string, status: Match['status']) => {
        try {
            const { error } = await supabase
                .from("matches")
                // @ts-ignore
                .update({ status })
                .eq("id", id);

            if (error) throw error;
            toast.success(`Match marked as ${status}`);
            fetchData();
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error("Failed to update status");
        }
    };

    const updateScore = async (id: string, home: number, away: number) => {
        try {
            const { error } = await supabase
                .from("matches")
                // @ts-ignore
                .update({ score_home: home, score_away: away })
                .eq("id", id);

            if (error) throw error;
            fetchData();
        } catch (error) {
            console.error("Error updating score:", error);
            toast.error("Failed to update score");
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Match Management</h1>

            <div className="card-glass p-6 rounded-lg">
                <h2 className="text-lg font-semibold mb-4">Schedule New Match</h2>
                <form onSubmit={handleCreateMatch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Select value={homeTeamId} onValueChange={setHomeTeamId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Home Team" />
                        </SelectTrigger>
                        <SelectContent>
                            {teams.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                        </SelectContent>
                    </Select>

                    <Select value={awayTeamId} onValueChange={setAwayTeamId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Away Team" />
                        </SelectTrigger>
                        <SelectContent>
                            {teams.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                        </SelectContent>
                    </Select>

                    <Input
                        type="datetime-local"
                        value={startTime}
                        onChange={e => setStartTime(e.target.value)}
                    />

                    <Button type="submit">
                        <Plus className="w-4 h-4 mr-2" />
                        Schedule
                    </Button>
                </form>
            </div>

            <div className="space-y-4">
                {matches.map((match) => (
                    <div key={match.id} className="card-glass p-4 rounded-lg flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1">
                            <div className="text-right flex-1 font-semibold">{match.home_team?.name || 'Unknown'}</div>
                            <div className="px-3 py-1 bg-secondary rounded text-lg font-mono">
                                {match.score_home} - {match.score_away}
                            </div>
                            <div className="text-left flex-1 font-semibold">{match.away_team?.name || 'Unknown'}</div>
                        </div>

                        <div className="flex flex-col items-center gap-1 w-32">
                            <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${match.status === 'live' ? 'bg-red-500/20 text-red-500' :
                                match.status === 'finished' ? 'bg-secondary text-muted-foreground' :
                                    'bg-blue-500/20 text-blue-500'
                                }`}>
                                {match.status}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {format(new Date(match.start_time), 'MMM d, HH:mm')}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Link to={`/admin/matches/${match.id}/control`}>
                                <Button size="sm" variant="outline" className="text-primary border-primary hover:bg-primary/10">
                                    Control Room
                                </Button>
                            </Link>
                            {match.status === 'scheduled' && (
                                <Button size="sm" onClick={() => updateMatchStatus(match.id, 'live')}>
                                    <Play className="w-4 h-4 mr-1" /> Start
                                </Button>
                            )}
                            {match.status === 'live' && (
                                <>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-1 text-xs">
                                            Home:
                                            <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => updateScore(match.id, (match.score_home || 0) + 1, match.score_away || 0)}>+</Button>
                                            <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => updateScore(match.id, (match.score_home || 0) - 1, match.score_away || 0)}>-</Button>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs">
                                            Away:
                                            <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => updateScore(match.id, match.score_home || 0, (match.score_away || 0) + 1)}>+</Button>
                                            <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => updateScore(match.id, match.score_home || 0, (match.score_away || 0) - 1)}>-</Button>
                                        </div>
                                    </div>
                                    <Button size="sm" variant="destructive" onClick={() => updateMatchStatus(match.id, 'finished')}>
                                        <Square className="w-4 h-4 mr-1" /> End
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Matches;
