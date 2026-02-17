import { useState, useEffect } from "react";
import { authAPI } from "@/api/endpoints";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, UserX, UserCheck, Trash2, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
}

export default function ManageAdmins() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const { user: currentUser } = useAuth();
    const { toast } = useToast();

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const response = await authAPI.getUsers();
            setUsers(response.data);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to load users",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePromoteToAdmin = async (userId: string) => {
        try {
            await authAPI.updateUserRole(userId, "admin");
            toast({
                title: "Success",
                description: "User promoted to admin",
            });
            loadUsers();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to promote user",
                variant: "destructive",
            });
        }
    };

    const handleDemoteToUser = async (userId: string) => {
        try {
            await authAPI.updateUserRole(userId, "user");
            toast({
                title: "Success",
                description: "Admin demoted to user",
            });
            loadUsers();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to demote admin",
                variant: "destructive",
            });
        }
    };

    const handleDeleteUser = async (userId: string, userName: string) => {
        if (!confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
            return;
        }

        try {
            await authAPI.deleteUser(userId);
            toast({
                title: "Success",
                description: "User deleted successfully",
            });
            loadUsers();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to delete user",
                variant: "destructive",
            });
        }
    };

    const getRoleBadge = (role: string) => {
        if (role === "superadmin") {
            return (
                <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500">
                    <Crown className="w-3 h-3 mr-1" />
                    SUPERADMIN
                </Badge>
            );
        }
        if (role === "admin") {
            return (
                <Badge className="bg-green-500">
                    <Shield className="w-3 h-3 mr-1" />
                    ADMIN
                </Badge>
            );
        }
        return <Badge variant="secondary">USER</Badge>;
    };

    if (loading) {
        return <div className="p-6">Loading...</div>;
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Manage Admins</h1>
                    <p className="text-muted-foreground mt-1">
                        Promote users to admin or manage existing administrators
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card-glass p-4 rounded-xl">
                    <p className="text-sm text-muted-foreground">Total Users</p>
                    <p className="text-2xl font-bold">{users.length}</p>
                </div>
                <div className="card-glass p-4 rounded-xl">
                    <p className="text-sm text-muted-foreground">Admins</p>
                    <p className="text-2xl font-bold">
                        {users.filter((u) => u.role === "admin").length}
                    </p>
                </div>
                <div className="card-glass p-4 rounded-xl">
                    <p className="text-sm text-muted-foreground">Regular Users</p>
                    <p className="text-2xl font-bold">
                        {users.filter((u) => u.role === "user").length}
                    </p>
                </div>
            </div>

            {/* Users Table */}
            <div className="card-glass rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-secondary/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                    Role
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {users.map((user) => (
                                <tr key={user._id} className="hover:bg-secondary/30">
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-medium">{user.name}</p>
                                            <p className="text-sm text-muted-foreground">{user.email}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            {user.role === "user" && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => handlePromoteToAdmin(user._id)}
                                                    className="bg-green-500 hover:bg-green-600"
                                                >
                                                    <UserCheck className="w-4 h-4 mr-1" />
                                                    Promote to Admin
                                                </Button>
                                            )}
                                            {user.role === "admin" && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleDemoteToUser(user._id)}
                                                    >
                                                        <UserX className="w-4 h-4 mr-1" />
                                                        Demote
                                                    </Button>
                                                    {user._id !== currentUser?._id && (
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => handleDeleteUser(user._id, user.name)}
                                                        >
                                                            <Trash2 className="w-4 h-4 mr-1" />
                                                            Delete
                                                        </Button>
                                                    )}
                                                </>
                                            )}
                                            {user.role === "superadmin" && (
                                                <Badge variant="outline" className="text-xs">
                                                    Protected
                                                </Badge>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
