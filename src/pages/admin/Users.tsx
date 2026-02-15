import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Shield, ShieldAlert, User } from "lucide-react";

interface UserProfile {
    id: string; // profile id
    user_id: string;
    email: string;
    display_name: string | null;
    created_at: string;
    role?: 'admin' | 'user';
}

const Users = () => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            // Fetch profiles
            const { data: profiles, error: profilesError } = await supabase
                .from("profiles")
                .select("*");

            if (profilesError) throw profilesError;

            // Fetch roles
            const { data: roles, error: rolesError } = await supabase
                .from("user_roles")
                .select("*");

            if (rolesError) throw rolesError;

            // Merge data
            const mergedUsers = profiles.map(profile => {
                const userRole = roles.find(r => r.user_id === profile.user_id);
                return {
                    ...profile,
                    role: userRole?.role || 'user'
                };
            });

            setUsers(mergedUsers);
        } catch (error) {
            console.error("Error fetching users:", error);
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    const toggleRole = async (userId: string, currentRole: string) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        const confirmMessage = currentRole === 'admin'
            ? "Are you sure you want to remove admin privileges?"
            : "Are you sure you want to make this user an Admin?";

        if (!confirm(confirmMessage)) return;

        try {
            // Check if role entry exists
            const { data: existingRole } = await supabase
                .from("user_roles")
                .select("*")
                .eq("user_id", userId)
                .single();

            if (existingRole) {
                const { error } = await supabase
                    .from("user_roles")
                    .update({ role: newRole })
                    .eq("user_id", userId);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from("user_roles")
                    .insert([{ user_id: userId, role: newRole }]);
                if (error) throw error;
            }

            toast.success(`User role updated to ${newRole}`);
            fetchUsers();
        } catch (error) {
            console.error("Error updating role:", error);
            toast.error("Failed to update role");
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">User Management</h1>

            <div className="card-glass rounded-lg overflow-hidden">
                <div className="p-4 border-b border-border/50">
                    <h2 className="font-semibold">Registered Users ({users.length})</h2>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-muted-foreground">Loading...</div>
                ) : (
                    <div className="divide-y divide-border/50">
                        {users.map((user) => (
                            <div key={user.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-secondary/20 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                                        <User className="w-5 h-5 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="font-medium">{user.display_name || "Unnamed User"}</p>
                                        <p className="text-sm text-muted-foreground">{user.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${user.role === 'admin'
                                            ? "bg-primary/20 text-primary"
                                            : "bg-secondary text-muted-foreground"
                                        }`}>
                                        {user.role?.toUpperCase() || "USER"}
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => toggleRole(user.user_id, user.role || 'user')}
                                        className={user.role === 'admin' ? "text-destructive hover:text-destructive" : ""}
                                    >
                                        {user.role === 'admin' ? (
                                            <>
                                                <ShieldAlert className="w-4 h-4 mr-2" />
                                                Revoke Admin
                                            </>
                                        ) : (
                                            <>
                                                <Shield className="w-4 h-4 mr-2" />
                                                Make Admin
                                            </>
                                        )}
                                    </Button>
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
