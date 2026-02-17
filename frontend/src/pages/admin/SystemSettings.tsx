import { useState, useEffect } from "react";
import { systemAPI, notificationsAPI } from "@/api/endpoints";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Settings as SettingsIcon, Radio, Bell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SystemSettings() {
    const [apiMode, setApiMode] = useState("api");
    const [notificationTitle, setNotificationTitle] = useState("");
    const [notificationMessage, setNotificationMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const response = await systemAPI.getSettings();
            setApiMode(response.data.apiMode);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to load settings",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSettings = async () => {
        try {
            await systemAPI.updateSettings({ apiMode });
            toast({
                title: "Success",
                description: "Settings saved successfully",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to save settings",
                variant: "destructive",
            });
        }
    };

    const handleBroadcastNotification = async () => {
        if (!notificationTitle.trim() || !notificationMessage.trim()) {
            toast({
                title: "Error",
                description: "Please enter both title and message",
                variant: "destructive",
            });
            return;
        }

        try {
            await notificationsAPI.sendSystem({
                title: notificationTitle,
                message: notificationMessage,
            });
            toast({
                title: "Success",
                description: "Notification broadcasted to all users",
            });
            setNotificationTitle("");
            setNotificationMessage("");
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to broadcast notification",
                variant: "destructive",
            });
        }
    };

    if (loading) {
        return <div className="p-6">Loading...</div>;
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center gap-3">
                <SettingsIcon className="w-8 h-8 text-green-500" />
                <div>
                    <h1 className="text-3xl font-bold">System Settings</h1>
                    <p className="text-muted-foreground mt-1">
                        Configure system-wide settings and broadcast notifications
                    </p>
                </div>
            </div>

            {/* API Mode Setting */}
            <div className="card-glass p-6 rounded-xl space-y-4">
                <div className="flex items-center gap-2">
                    <Radio className="w-5 h-5 text-green-500" />
                    <h2 className="text-xl font-semibold">Data Source Mode</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                    Choose whether to fetch live match data from external APIs or use manual scoring
                </p>

                <div className="flex gap-4">
                    <button
                        onClick={() => setApiMode("api")}
                        className={`flex-1 p-4 rounded-lg border-2 transition-all ${apiMode === "api"
                            ? "border-green-500 bg-green-500/10"
                            : "border-border hover:border-green-500/50"
                            }`}
                    >
                        <div className="text-left">
                            <p className="font-semibold">API Mode</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Fetch data from API-Sports and CricAPI
                            </p>
                        </div>
                    </button>
                    <button
                        onClick={() => setApiMode("manual")}
                        className={`flex-1 p-4 rounded-lg border-2 transition-all ${apiMode === "manual"
                            ? "border-green-500 bg-green-500/10"
                            : "border-border hover:border-green-500/50"
                            }`}
                    >
                        <div className="text-left">
                            <p className="font-semibold">Manual Mode</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Manual scoring through admin control room
                            </p>
                        </div>
                    </button>
                </div>

                <Button onClick={handleSaveSettings} className="bg-green-500 hover:bg-green-600">
                    Save Settings
                </Button>
            </div>

            {/* Broadcast Notification */}
            <div className="card-glass p-6 rounded-xl space-y-4">
                <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-green-500" />
                    <h2 className="text-xl font-semibold">Broadcast Notification</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                    Send a system-wide notification to all connected users
                </p>

                <div className="space-y-4">
                    <div>
                        <Label htmlFor="notification-title">Title</Label>
                        <Input
                            id="notification-title"
                            value={notificationTitle}
                            onChange={(e) => setNotificationTitle(e.target.value)}
                            placeholder="Enter notification title..."
                            className="mt-1"
                        />
                    </div>

                    <div>
                        <Label htmlFor="notification-message">Message</Label>
                        <Input
                            id="notification-message"
                            value={notificationMessage}
                            onChange={(e) => setNotificationMessage(e.target.value)}
                            placeholder="Enter notification message..."
                            className="mt-1"
                        />
                    </div>

                    <Button onClick={handleBroadcastNotification} className="bg-blue-500 hover:bg-blue-600">
                        <Bell className="w-4 h-4 mr-2" />
                        Broadcast to All Users
                    </Button>
                </div>
            </div>
        </div>
    );
}
