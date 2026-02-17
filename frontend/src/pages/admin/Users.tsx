import { useState, useEffect } from "react";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Shield, ShieldAlert, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface UserData {
    _id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
}

const Users = () => {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const { isSuperAdmin } = useAuth();

    const fetchUsers = async () => {
        try {
            const res = await api.get("/auth/users");
            setUsers(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const updateRole = async (userId: string, newRole: string) => {
        try {
            await api.patch(`/auth/users/${userId}/role`, { role: newRole });
            fetchUsers();
        } catch (err: any) {
            console.error(err);
            alert(err.response?.data?.message || "Failed to update role");
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">User Management</h1>

            <div className="card-glass rounded-lg overflow-hidden">
                <div className="p-4 border-b border-border/50">
                    <h2 className="font-semibold">Registered Users ({users.length})</h2>
                </div>

                {loading ? (
                    <div className="p-8 flex justify-center">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="divide-y divide-border/50">
                        {users.map((user) => (
                            <div key={user._id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-secondary/20 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                                        {user.role === "superadmin" ? (
                                            <ShieldAlert className="w-5 h-5 text-primary" />
                                        ) : user.role === "admin" ? (
                                            <Shield className="w-5 h-5 text-primary" />
                                        ) : (
                                            <User className="w-5 h-5 text-muted-foreground" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium">{user.name || "Unnamed User"}</p>
                                        <p className="text-sm text-muted-foreground">{user.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${user.role === "superadmin"
                                            ? "bg-primary text-primary-foreground"
                                            : user.role === "admin"
                                                ? "bg-primary/20 text-primary"
                                                : "bg-secondary text-muted-foreground"
                                        }`}>
                                        {user.role?.toUpperCase() || "USER"}
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        Joined {new Date(user.createdAt).toLocaleDateString()}
                                    </span>
                                    {isSuperAdmin && user.role !== "superadmin" && (
                                        <div className="flex gap-2">
                                            {user.role === "admin" ? (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => updateRole(user._id, "user")}
                                                >
                                                    Demote to User
                                                </Button>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    onClick={() => updateRole(user._id, "admin")}
                                                >
                                                    Promote to Admin
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Users;
