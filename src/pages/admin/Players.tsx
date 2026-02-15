import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Team, Player } from "@/types/database.extensions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, User } from "lucide-react";
import { toast } from "sonner";

const Players = () => {
    const [players, setPlayers] = useState<(Player & { team: Team | null })[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);

    // Form initial state
    const [name, setName] = useState("");
    const [teamId, setTeamId] = useState("");
    const [position, setPosition] = useState("");
    const [number, setNumber] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [teamsResponse, playersResponse] = await Promise.all([
                supabase.from("teams").select("*").order("name"),
                supabase.from("players").select(`
          *,
          team:teams(*)
        `).order("name")
            ]);

            if (teamsResponse.error) throw teamsResponse.error;
            if (playersResponse.error) throw playersResponse.error;

            setTeams(teamsResponse.data as unknown as Team[]);
            setPlayers(playersResponse.data as unknown as (Player & { team: Team | null })[]);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const handleAddPlayer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !teamId) return;

        setIsSubmitting(true);
        try {
            // Manual type casting for supabase insert as types are not updated in library
            const { error } = await supabase
                .from("players")
                .insert([{
                    name,
                    team_id: teamId,
                    position: position || null,
                    number: number ? parseInt(number) : null
                }]);

            if (error) throw error;

            toast.success("Player added successfully");
            setName("");
            setNumber("");
            setPosition("");
            fetchData();
        } catch (error) {
            console.error("Error adding player:", error);
            toast.error("Failed to add player");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeletePlayer = async (id: string) => {
        if (!confirm("Are you sure you want to delete this player?")) return;

        try {
            const { error } = await supabase
                .from("players")
                .delete()
                .eq("id", id);

            if (error) throw error;

            toast.success("Player deleted");
            fetchData();
        } catch (error) {
            console.error("Error deleting player:", error);
            toast.error("Failed to delete player");
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Player Management</h1>

            <div className="card-glass p-6 rounded-lg">
                <h2 className="text-lg font-semibold mb-4">Add New Player</h2>
                <form onSubmit={handleAddPlayer} className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full space-y-2">
                        <Input
                            placeholder="Player Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="flex-1 w-full space-y-2">
                        <Select value={teamId} onValueChange={setTeamId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Team" />
                            </SelectTrigger>
                            <SelectContent>
                                {teams.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="w-full md:w-32 space-y-2">
                        <Input
                            placeholder="Pos (e.g. ST)"
                            value={position}
                            onChange={(e) => setPosition(e.target.value)}
                        />
                    </div>
                    <div className="w-full md:w-24 space-y-2">
                        <Input
                            placeholder="No."
                            type="number"
                            value={number}
                            onChange={(e) => setNumber(e.target.value)}
                        />
                    </div>
                    <Button type="submit" disabled={isSubmitting}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add
                    </Button>
                </form>
            </div>

            <div className="card-glass rounded-lg overflow-hidden">
                <div className="p-4 border-b border-border/50">
                    <h2 className="font-semibold">Players ({players.length})</h2>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-muted-foreground">Loading...</div>
                ) : (
                    <div className="divide-y divide-border/50">
                        {players.map((player) => (
                            <div key={player.id} className="p-4 flex items-center justify-between hover:bg-secondary/20 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                                        <User className="w-4 h-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <div className="font-medium">{player.name}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {player.team?.name || 'No Team'} • {player.position || 'N/A'} • #{player.number || '-'}
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => handleDeletePlayer(player.id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Players;
