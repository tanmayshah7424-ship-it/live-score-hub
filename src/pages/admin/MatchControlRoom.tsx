import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Play, Pause, Square, Send, Clock, Hash, Trophy, Shield, Activity, Zap } from "lucide-react";
import { format } from "date-fns";

// Type definitions (local since they are missing in global types)
type MatchEvent = {
    id: string;
    match_id: string;
    type: string;
    description: string;
    score_update: any;
    created_at: string;
};

export default function MatchControlRoom() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [match, setMatch] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState<MatchEvent[]>([]);

    // Score State
    const [homeScore, setHomeScore] = useState("");
    const [awayScore, setAwayScore] = useState("");

    // Event State
    const [eventType, setEventType] = useState("run");
    const [eventDesc, setEventDesc] = useState("");
    const [runValue, setRunValue] = useState("0");

    useEffect(() => {
        fetchMatch();
        fetchEvents();
    }, [id]);

    const fetchMatch = async () => {
        const { data, error } = await supabase
            .from("matches")
            .select(`
        *,
        home_team:teams!home_team_id(name),
        away_team:teams!away_team_id(name)
      `)
            .eq("id", id)
            .single();

        if (error) {
            console.error(error);
            toast.error("Failed to load match");
            navigate("/admin/matches");
        } else {
            setMatch(data);
            setHomeScore(String(data.score_home ?? 0));
            setAwayScore(String(data.score_away ?? 0));
        }
        setLoading(false);
    };

    const fetchEvents = async () => {
        const { data, error } = await (supabase as any)
            .from("match_events")
            .select("*")
            .eq("match_id", id)
            .order("created_at", { ascending: false })
            .limit(20);

        if (!error && data) {
            setEvents(data);
        }
    };

    const updateStatus = async (status: string) => {
        const { error } = await (supabase as any)
            .from("matches")
            .update({ status })
            .eq("id", id);

        if (error) toast.error("Failed to update status");
        else {
            toast.success(`Match is now ${status}`);
            setMatch({ ...match, status });
        }
    };

    const updateScore = async (newHome?: string, newAway?: string) => {
        const finalHome = newHome ?? homeScore;
        const finalAway = newAway ?? awayScore;

        const { error } = await (supabase as any)
            .from("matches")
            .update({
                score_home: finalHome,
                score_away: finalAway,
                current_time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            })
            .eq("id", id);

        if (error) toast.error("Failed to update score");
        else {
            toast.success("Score updated");
            setHomeScore(finalHome);
            setAwayScore(finalAway);
        }
    };

    const pushEvent = async (customType?: string, customValue?: number, customDesc?: string) => {
        const typeToUse = customType || eventType;
        const valueToUse = customValue !== undefined ? customValue : parseInt(runValue || "0");
        const descToUse = customDesc || eventDesc;

        if (!descToUse) return toast.error("Description required");

        // 1. Create Event
        const { data, error: eventError } = await (supabase as any)
            .from("match_events")
            .insert({
                match_id: id,
                type: typeToUse,
                description: descToUse,
                score_update: { runs: valueToUse }
            })
            .select() // Select to get the created item back
            .single();

        if (eventError) {
            toast.error("Failed to add event");
            return;
        }

        // 2. Optimistic Update for UI List
        if (data) {
            setEvents([data, ...events]);
        }


        // 3. Auto-update score logic (simplified)
        // If it's a run or boundary, we assume we add to the batting team. 
        // For this demo, let's just trigger a toast if it's a quick action, user still manually updates global score or we assume Home team batting for MVP.
        // *To stay safe and not break data, we won't auto-increment team IDs without knowing who is batting.*

        toast.success("Event pushed to timeline");
        if (!customType) {
            setEventDesc("");
            setRunValue("0");
        }
    };

    // Quick Actions Helper
    const handleQuickAction = (label: string, value: number, type: string) => {
        const desc = `${label}`;
        pushEvent(type, value, desc);
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!match) return <div className="p-8">Match not found</div>;

    return (
        <div className="min-h-screen bg-background pb-12">
            {/* Top Bar */}
            <header className="border-b border-border/50 sticky top-0 bg-background/80 backdrop-blur-md z-50">
                <div className="container py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" onClick={() => navigate("/admin/matches")}>
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back
                        </Button>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-live animate-pulse" />
                            <span className="text-sm font-bold uppercase tracking-wider text-live">Control Room</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {new Date().toLocaleTimeString()}
                    </div>
                </div>
            </header>

            <div className="container py-8 space-y-8 animate-slide-up">

                {/* Scoreboard Header */}
                <div className="relative overflow-hidden rounded-2xl card-glass p-8 border-primary/20">
                    <div className="absolute inset-0 bg-gradient-to-r from-background via-primary/5 to-background" />

                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 items-center gap-8 text-center md:text-left">
                        {/* Home Team */}
                        <div className="flex flex-col items-center md:items-start gap-2">
                            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Home Team</h2>
                            <h1 className="text-3xl md:text-5xl font-bold font-mono text-gradient">{match.home_team?.name}</h1>
                            <div className="bg-primary/10 px-4 py-2 rounded-lg border border-primary/20 mt-2">
                                <span className="text-4xl font-mono font-bold">{homeScore}</span>
                            </div>
                        </div>

                        {/* VS / Status */}
                        <div className="flex flex-col items-center justify-center gap-4">
                            <div className="text-2xl font-bold text-muted-foreground/30 font-mono">VS</div>
                            <div className={`px-4 py-1.5 rounded-full border flex items-center gap-2 ${match.status === 'live'
                                    ? 'bg-live/10 border-live/30 text-live animate-live-pulse'
                                    : 'bg-secondary border-border text-muted-foreground'
                                }`}>
                                <div className={`w-2 h-2 rounded-full ${match.status === 'live' ? 'bg-live' : 'bg-muted-foreground'}`} />
                                <span className="text-xs font-bold uppercase">{match.status}</span>
                            </div>
                        </div>

                        {/* Away Team */}
                        <div className="flex flex-col items-center md:items-end gap-2">
                            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Away Team</h2>
                            <h1 className="text-3xl md:text-5xl font-bold font-mono text-blue-400">{match.away_team?.name}</h1>
                            <div className="bg-blue-500/10 px-4 py-2 rounded-lg border border-blue-500/20 mt-2">
                                <span className="text-4xl font-mono font-bold">{awayScore}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Control Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* LEFT COLUMN: Controls & Status */}
                    <div className="space-y-6">
                        {/* Status Controls */}
                        <Card className="card-glass border-border/50">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium uppercase text-muted-foreground flex items-center gap-2">
                                    <Activity className="w-4 h-4" /> Match Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex gap-3">
                                <Button
                                    onClick={() => updateStatus("live")}
                                    variant={match.status === "live" ? "default" : "outline"}
                                    className={`flex-1 ${match.status === "live" ? "bg-live hover:bg-red-600 text-white border-0 shadow-lg shadow-live/20" : ""}`}
                                >
                                    <Play className="w-4 h-4 mr-2" /> Live
                                </Button>
                                <Button
                                    onClick={() => updateStatus("paused")}
                                    variant={match.status === "paused" ? "default" : "outline"}
                                    className="flex-1"
                                >
                                    <Pause className="w-4 h-4 mr-2" /> Pause
                                </Button>
                                <Button
                                    onClick={() => updateStatus("completed")}
                                    variant={match.status === "completed" ? "default" : "outline"}
                                    className="flex-1"
                                >
                                    <Square className="w-4 h-4 mr-2" /> End
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Manual Score Input */}
                        <Card className="card-glass border-border/50">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium uppercase text-muted-foreground flex items-center gap-2">
                                    <Hash className="w-4 h-4" /> Manual Score Correction
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-xs mb-1.5 block">{match.home_team?.name}</Label>
                                        <Input
                                            value={homeScore}
                                            onChange={(e) => setHomeScore(e.target.value)}
                                            className="font-mono text-lg bg-secondary/50"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs mb-1.5 block">{match.away_team?.name}</Label>
                                        <Input
                                            value={awayScore}
                                            onChange={(e) => setAwayScore(e.target.value)}
                                            className="font-mono text-lg bg-secondary/50"
                                        />
                                    </div>
                                </div>
                                <Button onClick={() => updateScore()} className="w-full" variant="outline">
                                    Update Scoreboard
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* CENTER COLUMN: Event Input & Quick Actions */}
                    <div className="space-y-6">
                        {/* Quick Actions */}
                        <Card className="card-glass border-primary/20">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-yellow-400" />
                                    Quick Events
                                </CardTitle>
                                <CardDescription>One-click timeline updates</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-4 gap-3">
                                    <Button onClick={() => handleQuickAction("1 Run", 1, "run")} variant="secondary" className="font-mono text-lg h-14 hover:bg-primary hover:text-primary-foreground transition-colors">1</Button>
                                    <Button onClick={() => handleQuickAction("2 Runs", 2, "run")} variant="secondary" className="font-mono text-lg h-14 hover:bg-primary hover:text-primary-foreground transition-colors">2</Button>
                                    <Button onClick={() => handleQuickAction("4 Runs", 4, "boundary")} variant="secondary" className="font-mono text-lg h-14 bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white">4</Button>
                                    <Button onClick={() => handleQuickAction("6 Runs", 6, "boundary")} variant="secondary" className="font-mono text-lg h-14 bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500 hover:text-white">6</Button>

                                    <Button onClick={() => handleQuickAction("Wicket!", 0, "wicket")} variant="secondary" className="col-span-2 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-600 hover:text-white h-12">OUT</Button>
                                    <Button onClick={() => handleQuickAction("Wide", 1, "extra")} variant="secondary" className="col-span-1 h-12 text-muted-foreground">WD</Button>
                                    <Button onClick={() => handleQuickAction("No Ball", 1, "extra")} variant="secondary" className="col-span-1 h-12 text-muted-foreground">NB</Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Custom Event Form */}
                        <Card className="card-glass border-border/50">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium uppercase text-muted-foreground">Custom Event</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label className="text-xs">Type</Label>
                                    <Select value={eventType} onValueChange={setEventType}>
                                        <SelectTrigger className="bg-secondary/50">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="run">Run / Point</SelectItem>
                                            <SelectItem value="wicket">Wicket / Out</SelectItem>
                                            <SelectItem value="boundary">Boundary (4/6)</SelectItem>
                                            <SelectItem value="goal">Goal</SelectItem>
                                            <SelectItem value="foul">Foul / Card</SelectItem>
                                            <SelectItem value="extra">Extra / Wide</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-4 gap-4">
                                    <div className="col-span-3">
                                        <Label className="text-xs">Description</Label>
                                        <Input
                                            value={eventDesc}
                                            onChange={(e) => setEventDesc(e.target.value)}
                                            placeholder="Commentary..."
                                            className="bg-secondary/50"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs">Val</Label>
                                        <Input
                                            type="number"
                                            value={runValue}
                                            onChange={(e) => setRunValue(e.target.value)}
                                            className="bg-secondary/50"
                                        />
                                    </div>
                                </div>
                                <Button onClick={() => pushEvent()} className="w-full">
                                    <Send className="w-4 h-4 mr-2" /> Push Custom
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* RIGHT COLUMN: Event Feed */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Trophy className="w-5 h-5 text-primary" />
                            <h3 className="font-bold">Match Timeline</h3>
                        </div>
                        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                            {events.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed border-border/50 rounded-xl">
                                    No events yet. Start the match!
                                </div>
                            ) : (
                                events.map((event) => (
                                    <div key={event.id} className="p-3 rounded-lg bg-card border border-border/50 hover:bg-secondary/50 transition-colors animate-slide-up flex gap-3">
                                        <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border ${event.type === 'wicket' ? 'bg-red-500/10 border-red-500/30 text-red-500' :
                                                event.type === 'boundary' ? 'bg-blue-500/10 border-blue-500/30 text-blue-500' :
                                                    'bg-primary/10 border-primary/30 text-primary'
                                            }`}>
                                            {event.type === 'wicket' ? 'W' :
                                                event.type === 'boundary' ? event.score_update.runs :
                                                    event.score_update.runs > 0 ? event.score_update.runs : '•'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium">{event.description}</p>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                                <Clock className="w-3 h-3" />
                                                {format(new Date(event.created_at), 'HH:mm:ss')} • <span className="uppercase">{event.type}</span>
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
