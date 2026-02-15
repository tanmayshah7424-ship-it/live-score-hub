import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Star, Clock, Calendar } from "lucide-react";

import { StatusBadge } from "@/components/LiveBadge";

export default function UserDashboard() {
    const { user, isAdmin } = useAuth();
    const [favorites, setFavorites] = useState<any[]>([]);
    const [liveMatches, setLiveMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    const fetchDashboardData = async () => {
        try {
            // Fetch favorites
            const { data: favs } = await (supabase as any)
                .from('favorites')
                .select(`
          *,
          teams:team_id(name, logo_url),
          players:player_id(name, team_id)
        `)
                .eq('user_id', user?.id);

            if (favs) setFavorites(favs);

            // Fetch live matches
            const { data: matches } = await supabase
                .from('matches')
                .select(`
          *,
          home_team:teams!home_team_id(name, logo_url, short_name),
          away_team:teams!away_team_id(name, logo_url, short_name)
        `)
                .eq('status', 'live');

            if (matches) setLiveMatches(matches);

        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="container py-8 space-y-8">
                {/* Welcome Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">My Dashboard</h1>
                        <p className="text-muted-foreground">Welcome back, {user?.email}</p>
                    </div>
                    <div className="flex gap-2">
                        {isAdmin && (
                            <Link to="/admin">
                                <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                                    <Trophy className="w-4 h-4 mr-2" />
                                    Admin Panel
                                </Button>
                            </Link>
                        )}
                        <Link to="/matches">
                            <Button>Browse Matches</Button>
                        </Link>
                    </div>
                </div>

                {/* Live Matches Section */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-2 h-2 rounded-full bg-live animate-pulse" />
                        <h2 className="text-xl font-semibold">Live Now</h2>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[1, 2].map((i) => (
                                <div key={i} className="h-40 rounded-xl bg-secondary/50 animate-pulse" />
                            ))}
                        </div>
                    ) : liveMatches.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {liveMatches.map((match) => (
                                <Link key={match.id} to={`/match/${match.id}`}>
                                    <Card className="card-glass hover:border-primary/50 transition-colors cursor-pointer">
                                        <CardContent className="p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <StatusBadge status="live" />
                                                <span className="text-xs text-muted-foreground font-mono">
                                                    {match.current_time || "In Progress"}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between gap-4">
                                                <div className="text-center">
                                                    <p className="font-bold text-lg">{match.home_team?.short_name || match.home_team?.name}</p>
                                                    <p className="text-3xl font-mono font-bold text-primary">{match.score_home}</p>
                                                </div>
                                                <div className="text-sm font-bold text-muted-foreground">VS</div>
                                                <div className="text-center">
                                                    <p className="font-bold text-lg">{match.away_team?.short_name || match.away_team?.name}</p>
                                                    <p className="text-3xl font-mono font-bold text-primary">{match.score_away}</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <Card className="card-glass border-dashed">
                            <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                                <Trophy className="w-12 h-12 mb-4 opacity-20" />
                                <p>No live matches right now</p>
                                <Link to="/matches" className="text-primary hover:underline text-sm mt-2">
                                    Check schedule
                                </Link>
                            </CardContent>
                        </Card>
                    )}
                </section>

                {/* Favorites Section */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Star className="w-5 h-5 text-yellow-500" />
                        <h2 className="text-xl font-semibold">My Favorites</h2>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[1].map((i) => (
                                <div key={i} className="h-24 rounded-xl bg-secondary/50 animate-pulse" />
                            ))}
                        </div>
                    ) : favorites.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {favorites.map((fav) => (
                                <Card key={fav.id} className="card-glass">
                                    <CardContent className="p-4 flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                                            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                        </div>
                                        <div>
                                            <p className="font-bold">
                                                {fav.teams?.name || fav.players?.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {fav.teams ? 'Team' : 'Player'}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="card-glass border-dashed">
                            <CardContent className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                                <Star className="w-8 h-8 mb-3 opacity-20" />
                                <p className="text-sm">You haven't followed any teams or players yet</p>
                                <Link to="/teams" className="text-primary hover:underline text-xs mt-1">
                                    Find teams to follow
                                </Link>
                            </CardContent>
                        </Card>
                    )}
                </section>

                {/* Recent/History Section */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <History className="w-5 h-5 text-muted-foreground" />
                        <h2 className="text-xl font-semibold">Recent History</h2>
                    </div>
                    <Card className="card-glass">
                        <CardContent className="p-6 text-center text-muted-foreground text-sm">
                            No recent activity to show.
                        </CardContent>
                    </Card>
                </section>

            </main>
        </div>
    );
}

function History(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M12 7v5l4 2" />
        </svg>
    )
}
