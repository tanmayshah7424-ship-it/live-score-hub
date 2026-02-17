import { useEffect, useState } from "react";
import { playersAPI, teamsAPI } from "@/api/endpoints";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, X } from "lucide-react";

const PlayersAdmin = () => {
    const [players, setPlayers] = useState<any[]>([]);
    const [teams, setTeams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState({ name: "", teamId: "", role: "", sport: "cricket" });

    useEffect(() => {
        Promise.all([playersAPI.getAll(), teamsAPI.getAll()])
            .then(([pRes, tRes]) => {
                setPlayers(pRes.data);
                setTeams(tRes.data);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const resetForm = () => {
        setForm({ name: "", teamId: "", role: "", sport: "cricket" });
        setEditingId(null);
        setShowForm(false);
    };

    const fetchPlayers = async () => {
        const res = await playersAPI.getAll();
        setPlayers(res.data);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await playersAPI.update(editingId, form);
            } else {
                await playersAPI.create(form);
            }
            resetForm();
            fetchPlayers();
        } catch (err) {
            console.error(err);
        }
    };

    const handleEdit = (p: any) => {
        setForm({ name: p.name, teamId: p.teamId?._id || p.teamId, role: p.role, sport: p.sport });
        setEditingId(p._id);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this player?")) return;
        try {
            await playersAPI.remove(id);
            fetchPlayers();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Manage Players</h1>
                <Button onClick={() => { resetForm(); setShowForm(true); }} className="gap-2">
                    <Plus className="w-4 h-4" /> Add Player
                </Button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="card-glass rounded-xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold">{editingId ? "Edit Player" : "New Player"}</h2>
                        <button type="button" onClick={resetForm}><X className="w-5 h-5" /></button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Name</Label>
                            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="bg-secondary/50" />
                        </div>
                        <div className="space-y-2">
                            <Label>Team</Label>
                            <select value={form.teamId} onChange={(e) => setForm({ ...form, teamId: e.target.value })} required className="w-full rounded-md bg-secondary/50 border border-input px-3 py-2 text-sm">
                                <option value="">Select team</option>
                                {teams.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label>Role</Label>
                            <Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} required placeholder="Forward, Batsman, Guard..." className="bg-secondary/50" />
                        </div>
                        <div className="space-y-2">
                            <Label>Sport</Label>
                            <select value={form.sport} onChange={(e) => setForm({ ...form, sport: e.target.value })} className="w-full rounded-md bg-secondary/50 border border-input px-3 py-2 text-sm">
                                <option value="cricket">Cricket</option>
                                <option value="football">Football</option>
                                <option value="basketball">Basketball</option>
                                <option value="tennis">Tennis</option>
                            </select>
                        </div>
                    </div>
                    <Button type="submit">{editingId ? "Update" : "Create"} Player</Button>
                </form>
            )}

            {loading ? (
                <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="space-y-2">
                    {players.map((p) => (
                        <div key={p._id} className="card-glass rounded-lg p-4 flex items-center gap-4">
                            <div className="flex-1">
                                <p className="font-semibold">{p.name}</p>
                                <p className="text-xs text-muted-foreground">{p.role} • {p.teamId?.name || "No team"} • {p.sport}</p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm" onClick={() => handleEdit(p)}>
                                    <Pencil className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDelete(p._id)} className="text-destructive hover:text-destructive">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PlayersAdmin;
