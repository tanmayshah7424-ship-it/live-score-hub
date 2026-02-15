import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Link from "react-router-dom"; // Verify if needed or remove
import Index from "./pages/Index";
import { ProtectedRoute } from "./components/ProtectedRoute";
import MatchDetail from "./pages/MatchDetail";
import Matches from "./pages/Matches";
import Teams from "./pages/Teams";
import History from "./pages/History";
import Favorites from "./pages/Favorites";
import SearchPage from "./pages/SearchPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import { AdminLayout } from "./components/admin/AdminLayout";
import TeamsAdmin from "./pages/admin/Teams";
import PlayersAdmin from "./pages/admin/Players";
import MatchesAdmin from "./pages/admin/Matches";
import UsersAdmin from "./pages/admin/Users";
import UserDashboard from "./pages/UserDashboard";
import MatchControlRoom from "./pages/admin/MatchControlRoom";

import { useAuth } from "./contexts/AuthContext";

const DebugAuth = () => {
  const { user, isAdmin, loading } = useAuth();
  return (
    <div className="p-10">
      <h1>Auth Debugger</h1>
      <pre>{JSON.stringify({ user: user?.email, isAdmin, loading }, null, 2)}</pre>
    </div>
  );
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/match/:id" element={<MatchDetail />} />
            <Route path="/matches" element={<Matches />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <History />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/favorites"
              element={
                <ProtectedRoute>
                  <Favorites />
                </ProtectedRoute>
              }
            />
            <Route path="/admin-debug" element={<DebugAuth />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="teams" element={<TeamsAdmin />} />
              <Route path="players" element={<PlayersAdmin />} />
              <Route path="matches" element={<MatchesAdmin />} />
              <Route path="matches/:id/control" element={<MatchControlRoom />} />
              <Route path="users" element={<UsersAdmin />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
