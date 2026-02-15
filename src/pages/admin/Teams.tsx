import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Team } from "@/types/database.extensions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

const Teams = () => {
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [newTeamName, setNewTeamName] = useState("");
    const [shortName, setShortName] = useState("");
    const [logoUrl, setLogoUrl] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchTeams();
    }, []);

    const fetchTeams = async () => {
        try {
            const { data, error } = await supabase
                .from("teams")
                .select("*")
                .order("name");

            if (error) throw error;
            setTeams(data as unknown as Team[]);
        } catch (error) {
            console.error("Error fetching teams:", error);
            toast.error("Failed to load teams");
        } finally {
            setLoading(false);
        }
    };

    const handleAddTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTeamName.trim()) return;

        setIsSubmitting(true);
        try {
            const { error } = await supabase
                .from("teams")
                .insert([{
                    name: newTeamName,
                    short_name: shortName || null,
                    logo_url: logoUrl || null
                }]);

            if (error) throw error;

            toast.success("Team added successfully");
            setNewTeamName("");
            setShortName("");
            setLogoUrl("");
            fetchTeams();
        } catch (error) {
            console.error("Error adding team:", error);
            toast.error("Failed to add team");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteTeam = async (id: string) => {
        if (!confirm("Are you sure you want to delete this team?")) return;

        try {
            const { error } = await supabase
                .from("teams")
                .delete()
                .eq("id", id);

            if (error) throw error;

            toast.success("Team deleted");
            fetchTeams();
        } catch (error) {
            console.error("Error deleting team:", error);
            toast.error("Failed to delete team");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Teams Management</h1>
            </div>

            <div className="card-glass p-6 rounded-lg">
                <h2 className="text-lg font-semibold mb-4">Add New Team</h2>
                <form onSubmit={handleAddTeam} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                        <Input
                            placeholder="Team Name"
                            value={newTeamName}
                            onChange={(e) => setNewTeamName(e.target.value)}
                        />
                    </div>
                    <Input
                        placeholder="Short Name (e.g. MNC)"
                        value={shortName}
                        onChange={(e) => setShortName(e.target.value)}
                    />
                    <Input
                        placeholder="Logo URL"
                        value={logoUrl}
                        onChange={(e) => setLogoUrl(e.target.value)}
                    />
                    <Button type="submit" disabled={isSubmitting} className="md:col-span-4 w-full md:w-auto">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Team
                    </Button>
                </form>
            </div>

            <div className="card-glass rounded-lg overflow-hidden">
                <div className="p-4 border-b border-border/50">
                    <h2 className="font-semibold">Existing Teams ({teams.length})</h2>
                </div>
                {loading ? (
                    <div className="p-8 text-center text-muted-foreground">Loading...</div>
                ) : teams.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">No teams found. Add one above.</div>
                ) : (
                    <div className="divide-y divide-border/50">
                        {teams.map((team) => (
                            <div key={team.id} className="p-4 flex items-center justify-between hover:bg-secondary/20 transition-colors">
                                <div className="flex items-center gap-3">
                                    {team.logo_url ? (
                                        <img src={team.logo_url} alt={team.name} className="w-8 h-8 object-contain" />
                                    ) : (
                                        <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center text-xs font-bold">
                                            {team.short_name || team.name.substring(0, 2).toUpperCase()}
                                        </div>
                                    )}
                                    <div>
                                        <div className="font-medium">{team.name}</div>
                                        {team.short_name && <div className="text-xs text-muted-foreground">{team.short_name}</div>}
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => handleDeleteTeam(team.id)}
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

export default Teams;
