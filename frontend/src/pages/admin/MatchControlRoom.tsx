import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { matchesAPI, commentaryAPI } from "@/api/endpoints";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Activity, Send, Zap, Trophy, Clock } from "lucide-react";

const MatchControlRoom = () => {
    const { id } = useParams<{ id: string }>();
    const [match, setMatch] = useState<any>(null);
    const [commentary, setCommentary] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [scoreForm, setScoreForm] = useState({ scoreA: "", scoreB: "", summary: "", overs: "", minute: "" });
    const [commentaryForm, setCommentaryForm] = useState({ timestamp: "", description: "", type: "general", value: 0 });


    const fetchData = async () => {
        if (!id) return;
        try {
            const [mRes, cRes] = await Promise.all([matchesAPI.getById(id), commentaryAPI.getByMatch(id)]);
            setMatch(mRes.data);
            setCommentary(cRes.data);
            setScoreForm({
                scoreA: mRes.data.scoreA || "", scoreB: mRes.data.scoreB || "",
                summary: mRes.data.summary || "", overs: mRes.data.overs || "", minute: mRes.data.minute || "",
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [id]);

    const updateScore = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;
        try {
            const res = await matchesAPI.updateScore(id, scoreForm);
            setMatch(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const addCommentary = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;
        try {
            await commentaryAPI.create({ ...commentaryForm, matchId: id });
            setCommentaryForm({ timestamp: "", description: "", type: "general", value: 0 });
            const res = await commentaryAPI.getByMatch(id);
            setCommentary(res.data);
        } catch (err) {
            console.error(err);
        }
    };



    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!match) return <p className="text-center text-muted-foreground py-8">Match not found</p>;

    return (
        <div className="space-y-6">
            {/* Match Header */}
            <div className="card-glass rounded-xl p-5">
                <div className="flex items-center gap-3 mb-4">
                    <Zap className="w-6 h-6 text-primary" />
                    <h1 className="text-2xl font-bold">Match Control Room</h1>
                    <span className="text-xs font-bold text-live bg-live/10 px-2 py-1 rounded-full ml-auto">
                        {match.status.toUpperCase()}
                    </span>
                </div>
                <div className="flex items-center gap-4 justify-center">
                    <div className="text-center">
                        <span className="text-3xl block">{match.teamA?.logo}</span>
                        <p className="font-semibold mt-1">{match.teamA?.shortName}</p>
                    </div>
                    <div className="text-center px-6">
                        <p className="text-3xl font-mono font-bold text-primary">{match.scoreA} - {match.scoreB}</p>
                        <p className="text-xs text-muted-foreground mt-1">{match.summary}</p>
                    </div>
                    <div className="text-center">
                        <span className="text-3xl block">{match.teamB?.logo}</span>
                        <p className="font-semibold mt-1">{match.teamB?.shortName}</p>
                    </div>
                </div>
            </div>

            {/* Match Status Control */}
            <div className="card-glass rounded-xl p-5 space-y-4">
                <h2 className="font-bold flex items-center gap-2"><Trophy className="w-5 h-5 text-primary" /> Match Status</h2>
                <div className="flex flex-wrap gap-3">
                    <Button
                        variant={match.status === "live" ? "default" : "outline"}
                        className="gap-2"
                        onClick={() => matchesAPI.updateStatus(id!, "live").then((res) => setMatch(res.data))}
                        disabled={match.status === "live"}
                    >
                        <Zap className="w-4 h-4" /> Start Match (Live)
                    </Button>
                    <Button
                        variant={match.status === "completed" ? "default" : "outline"}
                        className="gap-2"
                        onClick={() => matchesAPI.updateStatus(id!, "completed").then((res) => setMatch(res.data))}
                        disabled={match.status === "completed"}
                    >
                        <Trophy className="w-4 h-4" /> Finish Match
                    </Button>
                    <Button
                        variant="outline"
                        className="gap-2 text-muted-foreground hover:text-foreground"
                        onClick={() => matchesAPI.updateStatus(id!, "upcoming").then((res) => setMatch(res.data))}
                        disabled={match.status === "upcoming"}
                    >
                        <Clock className="w-4 h-4" /> Reset to Upcoming
                    </Button>
                    <Button
                        variant="destructive"
                        className="gap-2 ml-auto"
                        onClick={() => {
                            if (confirm("Are you sure you want to abandon this match?")) {
                                matchesAPI.updateStatus(id!, "abandoned").then((res) => setMatch(res.data));
                            }
                        }}
                    >
                        Abandon Match
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Score Update */}
                <form onSubmit={updateScore} className="card-glass rounded-xl p-5 space-y-4">
                    <h2 className="font-bold flex items-center gap-2"><Activity className="w-5 h-5 text-primary" /> Update Score</h2>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs">{match.teamA?.shortName} Score</Label>
                            <Input value={scoreForm.scoreA} onChange={(e) => setScoreForm({ ...scoreForm, scoreA: e.target.value })} className="bg-secondary/50" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">{match.teamB?.shortName} Score</Label>
                            <Input value={scoreForm.scoreB} onChange={(e) => setScoreForm({ ...scoreForm, scoreB: e.target.value })} className="bg-secondary/50" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs">Summary</Label>
                        <Input value={scoreForm.summary} onChange={(e) => setScoreForm({ ...scoreForm, summary: e.target.value })} className="bg-secondary/50" placeholder="Match summary..." />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs">Overs</Label>
                            <Input value={scoreForm.overs} onChange={(e) => setScoreForm({ ...scoreForm, overs: e.target.value })} className="bg-secondary/50" placeholder="15.2" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Minute</Label>
                            <Input value={scoreForm.minute} onChange={(e) => setScoreForm({ ...scoreForm, minute: e.target.value })} className="bg-secondary/50" placeholder="72" />
                        </div>
                    </div>
                    <Button type="submit" className="w-full gap-2"><Zap className="w-4 h-4" /> Push Score Update</Button>
                </form>

                {/* Commentary */}
                <form onSubmit={addCommentary} className="card-glass rounded-xl p-5 space-y-4">
                    <h2 className="font-bold flex items-center gap-2"><Send className="w-5 h-5 text-primary" /> Add Commentary</h2>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs">Timestamp</Label>
                            <Input value={commentaryForm.timestamp} onChange={(e) => setCommentaryForm({ ...commentaryForm, timestamp: e.target.value })} className="bg-secondary/50" placeholder="15.2 or 72'" required />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Type</Label>
                            <select value={commentaryForm.type} onChange={(e) => setCommentaryForm({ ...commentaryForm, type: e.target.value })} className="w-full rounded-md bg-secondary/50 border border-input px-3 py-2 text-sm">
                                <option value="general">General</option>
                                <option value="run">Run</option>
                                <option value="boundary">Boundary</option>
                                <option value="six">Six</option>
                                <option value="wicket">Wicket</option>
                                <option value="goal">Goal</option>
                                <option value="foul">Foul</option>
                            </select>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs">Description</Label>
                        <Input value={commentaryForm.description} onChange={(e) => setCommentaryForm({ ...commentaryForm, description: e.target.value })} className="bg-secondary/50" placeholder="FOUR! Cover drive..." required />
                    </div>
                    <Button type="submit" className="w-full gap-2"><Send className="w-4 h-4" /> Add Commentary</Button>
                </form>
            </div>



            {/* Commentary Feed */}
            <div className="card-glass rounded-xl p-5 space-y-3">
                <h2 className="font-bold">Commentary Feed ({commentary.length})</h2>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                    {commentary.map((c) => (
                        <div key={c._id} className="bg-secondary/30 rounded-lg px-4 py-2 text-sm flex items-center gap-3">
                            <span className="font-mono text-xs text-muted-foreground w-12 shrink-0">{c.timestamp}</span>
                            <span>{c.description}</span>
                            <span className="text-xs text-muted-foreground ml-auto">{c.type}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MatchControlRoom;
