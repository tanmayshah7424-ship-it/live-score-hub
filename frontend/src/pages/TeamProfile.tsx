import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { teamsAPI } from "@/api/endpoints";
import { ArrowLeft, MapPin, Trophy, Users, Calendar, Activity, User } from "lucide-react";
import { TeamCard } from "@/components/TeamCard";

const TeamProfile = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [team, setTeam] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("squad");

    useEffect(() => {
        if (!id) return;
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await teamsAPI.getById(id);
                setTeam(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex justify-center items-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!team) {
        return (
            <div className="min-h-screen bg-background flex flex-col justify-center items-center text-muted-foreground">
                <p>Team not found</p>
                <button onClick={() => navigate(-1)} className="mt-4 text-primary hover:underline">Go Back</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-12">
            <main className="container py-6 space-y-6">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="w-4 h-4" /> Back
                </button>

                {/* Banner */}
                <div className="card-glass rounded-xl p-6 sm:p-8 animate-slide-up relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                    <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
                        <div className="w-24 h-24 sm:w-32 sm:h-32 text-6xl flex items-center justify-center bg-secondary/50 rounded-2xl shadow-lg border border-border/50">
                            {team.logo || '🛡️'}
                        </div>
                        <div className="text-center sm:text-left space-y-2 flex-1">
                            <h1 className="text-3xl sm:text-4xl font-bold">{team.name}</h1>
                            {team.shortName && <p className="text-xl text-muted-foreground font-mono">{team.shortName}</p>}

                            <div className="flex flex-wrap justify-center sm:justify-start gap-4 pt-2 text-sm text-muted-foreground">
                                {team.captain && (
                                    <div className="flex items-center gap-1.5 bg-secondary/30 px-3 py-1.5 rounded-full">
                                        <User className="w-4 h-4 text-primary" />
                                        <span>Captain: <span className="text-foreground font-medium">{team.captain}</span></span>
                                    </div>
                                )}
                                {team.coach && (
                                    <div className="flex items-center gap-1.5 bg-secondary/30 px-3 py-1.5 rounded-full">
                                        <Users className="w-4 h-4 text-blue-400" />
                                        <span>Coach: <span className="text-foreground font-medium">{team.coach}</span></span>
                                    </div>
                                )}
                                {team.foundedYear && (
                                    <div className="flex items-center gap-1.5 bg-secondary/30 px-3 py-1.5 rounded-full">
                                        <Calendar className="w-4 h-4 text-green-400" />
                                        <span>Est: <span className="text-foreground font-medium">{team.foundedYear}</span></span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-2xl font-bold">{team.matchesPlayed || 0}</p>
                                <p className="text-xs text-muted-foreground uppercase">Matches</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-green-500">{team.wins || 0}</p>
                                <p className="text-xs text-muted-foreground uppercase">Wins</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-amber-500">#{team.ranking || '-'}</p>
                                <p className="text-xs text-muted-foreground uppercase">Rank</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 border-b border-border/50 overflow-x-auto pb-1">
                    {['squad', 'matches', 'stats'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors relative ${activeTab === tab
                                    ? "text-primary bg-primary/5"
                                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                                }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary animate-in fade-in zoom-in" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="animate-slide-up delay-75">
                    {activeTab === 'squad' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {team.playersList && team.playersList.length > 0 ? (
                                team.playersList.map((player: any) => (
                                    <div
                                        key={player._id}
                                        onClick={() => navigate(`/player/${player._id}`)}
                                        className="card-glass p-4 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-lg font-bold text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                                                {player.playerImg ? (
                                                    <img src={player.playerImg} alt="" className="w-full h-full rounded-full object-cover" />
                                                ) : player.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold group-hover:text-primary transition-colors">{player.name}</p>
                                                <p className="text-xs text-muted-foreground capitalize">{player.role}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full py-12 text-center text-muted-foreground">
                                    No players found in this squad.
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'matches' && (
                        <div className="space-y-6">
                            {/* Live Matches */}
                            {team.matches?.live?.length > 0 && (
                                <div className="space-y-3">
                                    <h3 className="text-sm font-bold text-live flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-live animate-pulse" /> LIVE NOW
                                    </h3>
                                    {team.matches.live.map((m: any) => (
                                        <MatchRow key={m._id} match={m} navigate={navigate} />
                                    ))}
                                </div>
                            )}

                            {/* Upcoming */}
                            {team.matches?.upcoming?.length > 0 && (
                                <div className="space-y-3">
                                    <h3 className="text-sm font-bold text-blue-400 flex items-center gap-2">
                                        <Calendar className="w-4 h-4" /> UPCOMING
                                    </h3>
                                    {team.matches.upcoming.map((m: any) => (
                                        <MatchRow key={m._id} match={m} navigate={navigate} />
                                    ))}
                                </div>
                            )}

                            {/* Recent */}
                            {team.matches?.recent?.length > 0 && (
                                <div className="space-y-3">
                                    <h3 className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                                        <History className="w-4 h-4" /> RECENT RESULTS
                                    </h3>
                                    {team.matches.recent.map((m: any) => (
                                        <MatchRow key={m._id} match={m} navigate={navigate} />
                                    ))}
                                </div>
                            )}

                            {(!team.matches?.live?.length && !team.matches?.upcoming?.length && !team.matches?.recent?.length) && (
                                <div className="text-center py-12 text-muted-foreground">
                                    No match data available.
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'stats' && (
                        <div className="text-center py-12 text-muted-foreground card-glass rounded-xl">
                            <Activity className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>Detailed team statistics feature coming soon.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

const MatchRow = ({ match, navigate }: { match: any, navigate: any }) => (
    <div
        onClick={() => navigate(`/match/${match._id}`)}
        className="card-glass p-4 rounded-xl hover:bg-white/5 transition-colors cursor-pointer flex justify-between items-center"
    >
        <div className="flex-1">
            <div className="flex items-center gap-3">
                <span className="font-bold">{match.teamA.shortName}</span>
                <span className="text-xs text-muted-foreground">vs</span>
                <span className="font-bold">{match.teamB.shortName}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{match.tournament} • {match.venue}</p>
        </div>
        <div className="text-right">
            {match.status === 'live' ? (
                <span className="text-live font-bold font-mono text-sm">{match.scoreA || '0/0'} - {match.scoreB || '0/0'}</span>
            ) : match.status === 'completed' ? (
                <span className="text-muted-foreground text-xs font-medium">{match.summary || 'Result unavailable'}</span>
            ) : (
                <span className="text-blue-400 text-xs font-medium">{new Date(match.date).toLocaleDateString()}</span>
            )}
        </div>
    </div>
);

import { History } from "lucide-react";

export default TeamProfile;
