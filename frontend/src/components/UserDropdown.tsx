import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Heart, Settings, Shield, LogOut } from "lucide-react";

export function UserDropdown() {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();

    if (!user) {
        return (
            <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-colors"
            >
                <User className="w-4 h-4" />
                Login
            </Link>
        );
    }

    // Generate initials from user name
    const initials = user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    // Avatar gradient based on role
    const avatarGradient =
        user.role === "superadmin"
            ? "bg-gradient-to-br from-yellow-500 to-orange-500"
            : user.role === "admin"
                ? "bg-gradient-to-br from-purple-500 to-pink-500"
                : "bg-gradient-to-br from-blue-500 to-cyan-500";

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    className={`w-9 h-9 rounded-full ${avatarGradient} flex items-center justify-center text-white text-sm font-bold border-2 border-transparent hover:border-green-500 transition-all`}
                >
                    {initials}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-card/95 backdrop-blur-xl border-border">
                <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-green-500 mt-1">{user.role.toUpperCase()}</p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link to="/favorites" className="flex items-center gap-2 cursor-pointer">
                        <Heart className="w-4 h-4" />
                        Favorites
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link to="/settings" className="flex items-center gap-2 cursor-pointer">
                        <Settings className="w-4 h-4" />
                        Settings
                    </Link>
                </DropdownMenuItem>
                {isAdmin && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link to="/admin" className="flex items-center gap-2 cursor-pointer text-green-500">
                                <Shield className="w-4 h-4" />
                                Admin Dashboard
                            </Link>
                        </DropdownMenuItem>
                    </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 cursor-pointer text-red-500">
                    <LogOut className="w-4 h-4" />
                    Logout
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
