import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, CheckCircle } from "lucide-react";

const ResetPassword = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);

        try {
            await api.post(`/auth/reset-password/${token}`, { password });
            setSuccess(true);
            setTimeout(() => navigate("/login"), 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to reset password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="card-glass rounded-2xl p-8 space-y-6">
                    <div className="text-center space-y-2">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                            <Lock className="w-8 h-8 text-primary" />
                        </div>
                        <h1 className="text-2xl font-bold">Reset Password</h1>
                        <p className="text-muted-foreground">Enter your new password</p>
                    </div>

                    {success ? (
                        <div className="space-y-4">
                            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                                <div className="flex items-center gap-3 text-green-500">
                                    <CheckCircle className="w-5 h-5" />
                                    <div>
                                        <p className="font-medium">Password Reset Successful!</p>
                                        <p className="text-sm mt-1">Redirecting to login...</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/30 text-red-500 rounded-lg p-3 text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="password">New Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="bg-secondary/50"
                                    placeholder="Minimum 6 characters"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="bg-secondary/50"
                                    placeholder="Re-enter password"
                                />
                            </div>

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? "Resetting..." : "Reset Password"}
                            </Button>

                            <Link to="/login" className="block text-center text-muted-foreground hover:text-foreground transition-colors">
                                Back to Login
                            </Link>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
