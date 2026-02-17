import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { notificationsAPI } from "@/api/endpoints";
import { useSocket } from "@/contexts/SocketContext";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface Notification {
    _id: string;
    type: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
}

export function NotificationPanel() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const { socket } = useSocket();
    const { toast } = useToast();

    useEffect(() => {
        loadNotifications();
        loadUnreadCount();
    }, []);

    useEffect(() => {
        if (!socket) return;

        const handleNewNotification = (notification: any) => {
            toast({
                title: notification.title,
                description: notification.message,
            });
            loadNotifications();
            loadUnreadCount();
        };

        socket.on('notification:new', handleNewNotification);

        return () => {
            socket.off('notification:new', handleNewNotification);
        };
    }, [socket, toast]);

    const loadNotifications = async () => {
        try {
            const response = await notificationsAPI.getAll();
            setNotifications(response.data.slice(0, 10)); // Show last 10
        } catch (error) {
            console.error('Failed to load notifications:', error);
        }
    };

    const loadUnreadCount = async () => {
        try {
            const response = await notificationsAPI.getUnreadCount();
            setUnreadCount(response.data.count);
        } catch (error) {
            console.error('Failed to load unread count:', error);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            await notificationsAPI.markRead(id);
            loadNotifications();
            loadUnreadCount();
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
                <Bell className="w-5 h-5 text-muted-foreground" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Panel */}
                    <div className="absolute right-0 top-12 w-96 max-h-[500px] bg-card/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
                        <div className="p-4 border-b border-border flex items-center justify-between">
                            <h3 className="font-semibold">Notifications</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-secondary rounded"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="max-h-[400px] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground">
                                    <Bell className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                    <p>No notifications</p>
                                </div>
                            ) : (
                                notifications.map((notif) => (
                                    <div
                                        key={notif._id}
                                        className={`p-4 border-b border-border hover:bg-secondary/50 transition-colors ${!notif.read ? 'bg-blue-500/5' : ''
                                            }`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1">
                                                <p className="font-semibold text-sm">
                                                    {notif.title}
                                                </p>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {notif.message}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-2">
                                                    {formatDistanceToNow(new Date(notif.createdAt), {
                                                        addSuffix: true,
                                                    })}
                                                </p>
                                            </div>
                                            {!notif.read && (
                                                <button
                                                    onClick={() => markAsRead(notif._id)}
                                                    className="text-xs text-green-500 hover:underline"
                                                >
                                                    Mark read
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
