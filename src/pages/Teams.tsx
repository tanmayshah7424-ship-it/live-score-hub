import { teams } from "@/data/mockData";
import { Header } from "@/components/Header";
import { Shield, Users, Trophy, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Teams = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold">Teams</h1>
              <p className="text-sm text-muted-foreground">
                Browse all teams and their statistics
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="card-glass rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-primary" />
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Teams</p>
              </div>
              <p className="text-2xl font-bold font-mono">{teams.length}</p>
            </div>
            <div className="card-glass rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-blue-400" />
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Players</p>
              </div>
              <p className="text-2xl font-bold font-mono">
                {teams.reduce((acc, t) => acc + (t.players || 0), 0)}
              </p>
            </div>
            <div className="card-glass rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Matches</p>
              </div>
              <p className="text-2xl font-bold font-mono">
                {teams.reduce((acc, t) => acc + (t.matchesPlayed || 0), 0)}
              </p>
            </div>
            <div className="card-glass rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Win Rate</p>
              </div>
              <p className="text-2xl font-bold font-mono">
                {teams.length > 0
                  ? Math.round(
                    (teams.reduce((acc, t) => acc + (t.wins || 0), 0) /
                      teams.reduce((acc, t) => acc + (t.matchesPlayed || 1), 0)) *
                    100
                  )
                  : 0}
                %
              </p>
            </div>
          </div>
        </div>

        {/* Teams Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {teams.map((team, idx) => (
            <div
              key={team.id}
              onClick={() => navigate(`/team/${team.id}`)}
              className="card-glass rounded-xl p-6 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:glow group animate-slide-up"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              {/* Team Logo/Badge */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                  {team.logo}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg truncate">{team.name}</h3>
                  <p className="text-sm text-muted-foreground">{team.shortName}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Matches</span>
                  <span className="font-semibold font-mono">{team.matchesPlayed || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Wins</span>
                  <span className="font-semibold font-mono text-win">{team.wins || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Players</span>
                  <span className="font-semibold font-mono">{team.players || 0}</span>
                </div>
              </div>

              {/* Win Rate Bar */}
              <div className="mt-4 pt-4 border-t border-border/50">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-muted-foreground">Win Rate</span>
                  <span className="font-bold">
                    {team.matchesPlayed
                      ? Math.round(((team.wins || 0) / team.matchesPlayed) * 100)
                      : 0}
                    %
                  </span>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-green-400 transition-all duration-500"
                    style={{
                      width: `${team.matchesPlayed
                          ? ((team.wins || 0) / team.matchesPlayed) * 100
                          : 0
                        }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Teams;
