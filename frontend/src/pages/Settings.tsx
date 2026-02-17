import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Lock, CheckCircle } from "lucide-react";

const Settings = () => {
    const { user, logout } = useAuth();
    const [nameForm, setNameForm] = useState({ name: user?.name || "" });
    const [passwordForm, setPasswordForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
    const [message, setMessage] = useState({ type: "", text: "" });
    const [loading, setLoading] = useState(false);

    const handleUpdateName = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: "", text: "" });

        try {
            const res = await api.patch("/auth/profile", { name: nameForm.name });
            localStorage.setItem("user", JSON.stringify(res.data.user));
            setMessage({ type: "success", text: "Name updated successfully! Refreshing..." });
            setTimeout(() => window.location.reload(), 1500);
        } catch (err: any) {
            setMessage({ type: "error", text: err.response?.data?.message || "Failed to update name" });
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage({ type: "", text: "" });

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setMessage({ type: "error", text: "New passwords do not match" });
            return;
        }

        setLoading(true);

        try {
            await api.post("/auth/change-password", {
                oldPassword: passwordForm.oldPassword,
                newPassword: passwordForm.newPassword,
            });
            setMessage({ type: "success", text: "Password changed successfully! Please login again." });
            setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
            setTimeout(() => {
                logout();
                window.location.href = "/login";
            }, 2000);
        } catch (err: any) {
            setMessage({ type: "error", text: err.response?.data?.message || "Failed to change password" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background py-12">
            <div className="container max-w-2xl">
                <h1 className="text-3xl font-bold mb-8">Account Settings</h1>

                {message.text && (
                    <div className={`mb-6 p-4 rounded-lg ${message.type === "success" ? "bg-green-500/10 border border-green-500/30 text-green-500" : "bg-red-500/10 border border-red-500/30 text-red-500"}`}>
                        <div className="flex items-center gap-2">
                            {message.type === "success" && <CheckCircle className="w-5 h-5" />}
                            <p className="font-medium">{message.text}</p>
                        </div>
                    </div>
                )}

                {/* Profile Section */}
                <div className="card-glass rounded-xl p-6 mb-6 space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                        <User className="w-6 h-6 text-primary" />
                        <h2 className="text-xl font-bold">Profile Information</h2>
                    </div>
                    <form onSubmit={handleUpdateName} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Name</Label>
                            <Input
                                value={nameForm.name}
                                onChange={(e) => setNameForm({ name: e.target.value })}
                                required
                                className="bg-secondary/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input value={user?.email} disabled className="bg-secondary/30" />
                            <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                        </div>
                        <div className="space-y-2">
                            <Label>Role</Label>
                            <Input value={user?.role.toUpperCase()} disabled className="bg-secondary/30" />
                        </div>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Updating..." : "Update Name"}
                        </Button>
                    </form>
                </div>

                {/* Password Section */}
                <div className="card-glass rounded-xl p-6 space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                        <Lock className="w-6 h-6 text-primary" />
                        <h2 className="text-xl font-bold">Change Password</h2>
                    </div>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Current Password</Label>
                            <Input
                                type="password"
                                value={passwordForm.oldPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                                required
                                className="bg-secondary/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>New Password</Label>
                            <Input
                                type="password"
                                value={passwordForm.newPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                required
                                minLength={6}
                                className="bg-secondary/50"
                            />
                            <p className="text-xs text-muted-foreground">Minimum 6 characters</p>
                        </div>
                        <div className="space-y-2">
                            <Label>Confirm New Password</Label>
                            <Input
                                type="password"
                                value={passwordForm.confirmPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                required
                                className="bg-secondary/50"
                            />
                        </div>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Changing..." : "Change Password"}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Settings;
