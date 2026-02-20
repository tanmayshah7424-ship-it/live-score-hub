import { useEffect, useState } from "react";

import { useAuth } from "@/contexts/AuthContext";
import { favoritesAPI, notificationsAPI, matchesAPI } from "@/api/endpoints";
import { useSocket } from "@/contexts/SocketContext";
import { useNavigate } from "react-router-dom";
import { User, Heart, Bell, Activity, Trophy } from "lucide-react";
import { CricbuzzWidget } from "@/components/CricbuzzWidget";

const UserDashboard = () => {
    const { user } = useAuth();
    const { socket, connected } = useSocket();
    const navigate = useNavigate();
    const [favorites, setFavorites] = useState<any[]>([]);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [liveCount, setLiveCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [favRes, notifRes, liveRes] = await Promise.all([
                    favoritesAPI.getAll(),
                    notificationsAPI.getAll(),
                    matchesAPI.getLive(),
                ]);
                setFavorites(favRes.data);
                setNotifications(notifRes.data);
                setLiveCount(liveRes.data.length);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (!socket) return;
        socket.on("notification:new", (notif: any) => {
            setNotifications((prev) => [notif, ...prev]);
        });
        return () => { socket.off("notification:new"); };
    }, [socket]);

    const markRead = async (id: string) => {
        try {
            await notificationsAPI.markRead(id);
            setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, read: true } : n));
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <main className="container py-12 flex justify-center">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <main className="container py-6 space-y-6">
                {/* Profile Header */}
                <div className="card-glass rounded-xl p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">{user?.name}</h1>
                            <p className="text-sm text-muted-foreground">{user?.email}</p>
                        </div>
                        <div className="ml-auto flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${connected ? "bg-green-400" : "bg-red-400"}`} />
                            <span className="text-xs text-muted-foreground">{connected ? "Live" : "Offline"}</span>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="card-glass rounded-xl p-4 text-center">
                        <Activity className="w-6 h-6 mx-auto mb-2 text-live" />
                        <p className="text-2xl font-bold font-mono">{liveCount}</p>
                        <p className="text-xs text-muted-foreground">Live Now</p>
                    </div>
                    <div className="card-glass rounded-xl p-4 text-center">
                        <Heart className="w-6 h-6 mx-auto mb-2 text-pink-400" />
                        <p className="text-2xl font-bold font-mono">{favorites.length}</p>
                        <p className="text-xs text-muted-foreground">Favorites</p>
                    </div>
                    <div className="card-glass rounded-xl p-4 text-center">
                        <Bell className="w-6 h-6 mx-auto mb-2 text-amber-400" />
                        <p className="text-2xl font-bold font-mono">{notifications.filter((n) => !n.read).length}</p>
                        <p className="text-xs text-muted-foreground">Unread</p>
                    </div>
                </div>

                {/* Cricbuzz Widgets */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <CricbuzzWidget type="recent" className="card-glass border-0" />
                    <CricbuzzWidget type="live" className="card-glass border-0" />
                </div>

                {/* Notifications */}
                <div className="card-glass rounded-xl p-6 space-y-4">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <Bell className="w-5 h-5 text-primary" />
                        Notifications
                    </h2>
                    {notifications.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">No notifications</p>
                    ) : (
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {notifications.slice(0, 20).map((n) => (
                                <div
                                    key={n._id}
                                    onClick={() => markRead(n._id)}
                                    className={`px-4 py-3 rounded-lg cursor-pointer transition-colors text-sm ${n.read ? "bg-secondary/30 text-muted-foreground" : "bg-primary/5 border border-primary/20"
                                        }`}
                                >
                                    <p className="font-medium">{n.title}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{n.message}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default UserDashboard;
