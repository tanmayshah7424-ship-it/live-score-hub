import { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Shield, Users, Trophy, BarChart3, TrendingUp, Activity, Calendar, UserPlus, Zap, Target } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

interface Stats {
  users: number;
  matches: number;
  liveMatches: number;
  teams: number;
}

interface RecentActivity {
  type: 'user' | 'team' | 'match';
  description: string;
  timestamp: string;
}

const AdminDashboard = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<Stats>({
    users: 0,
    matches: 0,
    liveMatches: 0,
    teams: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchRecentActivity();
  }, []);

  const fetchStats = async () => {
    const results = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('matches').select('*', { count: 'exact', head: true }),
      supabase.from('matches').select('*', { count: 'exact', head: true }).eq('status', 'live'),
      supabase.from('teams').select('*', { count: 'exact', head: true }),
    ]);

    setStats({
      users: results[0].count || 0,
      matches: results[1].count || 0,
      liveMatches: results[2].count || 0,
      teams: results[3].count || 0
    });
    setLoading(false);
  };

  const fetchRecentActivity = async () => {
    try {
      const activities: RecentActivity[] = [];

      const { data: recentUsers } = await supabase
        .from('profiles')
        .select('display_name, email, created_at')
        .order('created_at', { ascending: false })
        .limit(3);

      recentUsers?.forEach(u => {
        activities.push({
          type: 'user',
          description: `${u.display_name || u.email} joined`,
          timestamp: u.created_at
        });
      });

      const { data: recentTeams } = await supabase
        .from('teams')
        .select('name, created_at')
        .order('created_at', { ascending: false })
        .limit(3);

      recentTeams?.forEach(t => {
        activities.push({
          type: 'team',
          description: `Team "${t.name}" created`,
          timestamp: t.created_at
        });
      });

      const { data: recentMatches } = await supabase
        .from('matches')
        .select('*, home_team:teams!home_team_id(name), away_team:teams!away_team_id(name)')
        .order('created_at', { ascending: false })
        .limit(3);

      recentMatches?.forEach((m: any) => {
        activities.push({
          type: 'match',
          description: `Match scheduled: ${m.home_team?.name} vs ${m.away_team?.name}`,
          timestamp: m.created_at
        });
      });

      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setRecentActivity(activities.slice(0, 5));
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) return <Navigate to="/" replace />;

  const statCards = [
    {
      icon: Users,
      label: "Total Users",
      value: stats.users,
      change: "+12% this month",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20"
    },
    {
      icon: Trophy,
      label: "Total Matches",
      value: stats.matches,
      change: "All time",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20"
    },
    {
      icon: Zap,
      label: "Live Matches",
      value: stats.liveMatches,
      change: "Currently active",
      color: "text-live",
      bgColor: "bg-live/10",
      borderColor: "border-live/20"
    },
    {
      icon: Shield,
      label: "Teams",
      value: stats.teams,
      change: "Registered",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20"
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user': return UserPlus;
      case 'team': return Shield;
      case 'match': return Trophy;
      default: return Activity;
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl card-glass p-6 md:p-8 border-l-4 border-l-primary">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center ring-2 ring-primary/20">
            <Shield className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Welcome back, manage your ScoreHub platform
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <Card
            key={i}
            className={`card-glass border ${stat.borderColor} hover:scale-[1.02] transition-all duration-300 animate-slide-up`}
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold font-mono">{stat.value}</p>
                <p className="text-sm font-semibold text-foreground">{stat.label}</p>
                <p className="text-xs text-muted-foreground">{stat.change}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card className="card-glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Quick Actions
            </CardTitle>
            <CardDescription>Manage your platform efficiently</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Matches", to: "/admin/matches", icon: Trophy, color: "from-green-500/20 to-green-500/5 hover:from-green-500/30 hover:to-green-500/10 border-green-500/20" },
                { label: "Teams", to: "/admin/teams", icon: Shield, color: "from-purple-500/20 to-purple-500/5 hover:from-purple-500/30 hover:to-purple-500/10 border-purple-500/20" },
                { label: "Players", to: "/admin/players", icon: Users, color: "from-blue-500/20 to-blue-500/5 hover:from-blue-500/30 hover:to-blue-500/10 border-blue-500/20" },
                { label: "Users", to: "/admin/users", icon: UserPlus, color: "from-orange-500/20 to-orange-500/5 hover:from-orange-500/30 hover:to-orange-500/10 border-orange-500/20" }
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.label}
                    to={action.to}
                    className={`flex flex-col items-center justify-center gap-3 p-5 rounded-xl bg-gradient-to-br ${action.color} border transition-all duration-200 group`}
                  >
                    <Icon className="w-7 h-7 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-bold">{action.label}</span>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="card-glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest updates across the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
              ) : (
                recentActivity.map((activity, idx) => {
                  const Icon = getActivityIcon(activity.type);
                  return (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 ring-2 ring-primary/20">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{activity.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(activity.timestamp), 'MMM d, yyyy • HH:mm')}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Overview */}
      <Card className="card-glass border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Platform Overview
          </CardTitle>
          <CardDescription>Key metrics and insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Match Completion Rate</p>
              <div className="flex items-end gap-2">
                <p className="text-2xl font-bold">
                  {stats.matches > 0 ? Math.round(((stats.matches - stats.liveMatches) / stats.matches) * 100) : 0}%
                </p>
                <p className="text-xs text-muted-foreground mb-1">of total matches</p>
              </div>
              <div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-primary to-green-400 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${stats.matches > 0 ? ((stats.matches - stats.liveMatches) / stats.matches) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Average Players per Team</p>
              <div className="flex items-end gap-2">
                <p className="text-2xl font-bold">
                  {stats.teams > 0 ? '~15' : '0'}
                </p>
                <p className="text-xs text-muted-foreground mb-1">players</p>
              </div>
              <div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-purple-400 h-2.5 rounded-full w-3/4 transition-all duration-500" />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Active Users</p>
              <div className="flex items-end gap-2">
                <p className="text-2xl font-bold">{stats.users}</p>
                <p className="text-xs text-muted-foreground mb-1">registered</p>
              </div>
              <div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-pink-400 h-2.5 rounded-full w-full transition-all duration-500" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
