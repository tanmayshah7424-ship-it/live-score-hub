import { useState } from "react";
import { Link } from "react-router-dom";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await api.post("/auth/forgot-password", { email });
            setSuccess(true);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to send reset email");
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
                            <Mail className="w-8 h-8 text-primary" />
                        </div>
                        <h1 className="text-2xl font-bold">Forgot Password?</h1>
                        <p className="text-muted-foreground">Enter your email to receive a password reset link</p>
                    </div>

                    {success ? (
                        <div className="space-y-4">
                            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                                <div className="flex items-center gap-3 text-green-500">
                                    <CheckCircle className="w-5 h-5" />
                                    <div>
                                        <p className="font-medium">Email Sent!</p>
                                        <p className="text-sm mt-1">Check your inbox for the password reset link.</p>
                                    </div>
                                </div>
                            </div>
                            <Link to="/login" className="flex items-center justify-center gap-2 text-primary hover:underline">
                                <ArrowLeft className="w-4 h-4" />
                                Back to Login
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/30 text-red-500 rounded-lg p-3 text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="bg-secondary/50"
                                    placeholder="your@email.com"
                                />
                            </div>

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? "Sending..." : "Send Reset Link"}
                            </Button>

                            <Link to="/login" className="flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                                <ArrowLeft className="w-4 h-4" />
                                Back to Login
                            </Link>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
