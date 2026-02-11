import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { Shield, Users, Trophy, BarChart3 } from "lucide-react";
import { Navigate } from "react-router-dom";

const AdminDashboard = () => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) return null;
  if (!user || !isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6 space-y-6">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Users, label: "Total Users", value: "1,247", change: "+12%" },
            { icon: Trophy, label: "Active Matches", value: "3", change: "Live" },
            { icon: BarChart3, label: "Page Views", value: "45.2K", change: "+8%" },
            { icon: Shield, label: "Admin Actions", value: "28", change: "Today" },
          ].map((stat, i) => (
            <div key={i} className="card-glass rounded-lg p-5">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className="w-5 h-5 text-muted-foreground" />
                <span className="text-xs text-primary font-medium">{stat.change}</span>
              </div>
              <p className="font-mono text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="card-glass rounded-lg p-6">
          <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {["Manage Matches", "Manage Teams", "Manage Players", "View Reports"].map((action) => (
              <button
                key={action}
                className="px-4 py-3 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors"
              >
                {action}
              </button>
            ))}
          </div>
        </div>

        <div className="card-glass rounded-lg p-6">
          <h2 className="text-lg font-bold mb-2">Live Score Update Panel</h2>
          <p className="text-sm text-muted-foreground">
            Select a live match to update scores in real-time. This panel will be fully functional once match data is stored in the database.
          </p>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
