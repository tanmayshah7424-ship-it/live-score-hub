import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

export const WorldClock = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (date: Date, timeZone: string) => {
        return date.toLocaleTimeString("en-US", {
            timeZone,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
        });
    };

    return (
        <div className="hidden lg:flex items-center gap-4 px-4 py-1 bg-secondary/30 rounded-full border border-border/50 text-xs font-mono text-muted-foreground ml-auto mr-4">
            <Clock className="w-3 h-3 text-primary" />
            <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
                    UTC <span className="text-foreground font-bold">{formatTime(time, "UTC")}</span>
                </span>
                <span className="w-px h-3 bg-border" />
                <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500/50" />
                    IST <span className="text-foreground font-bold">{formatTime(time, "Asia/Kolkata")}</span>
                </span>
            </div>
        </div>
    );
};
