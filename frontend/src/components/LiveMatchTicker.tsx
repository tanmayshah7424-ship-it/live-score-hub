import { useSocket } from "@/contexts/SocketContext";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

interface Match {
    _id: string;
    teamA: { name: string; shortName?: string };
    teamB: { name: string; shortName?: string };
    scoreA?: string;
    scoreB?: string;
    status: string;
    sport: string;
}

export function LiveMatchTicker() {
    const { liveMatches } = useSocket();
    const [displayMatches, setDisplayMatches] = useState<Match[]>([]);

    useEffect(() => {
        if (liveMatches && liveMatches.length > 0) {
            // Duplicate matches for infinite scroll effect
            setDisplayMatches([...liveMatches, ...liveMatches]);
        }
    }, [liveMatches]);

    if (!displayMatches || displayMatches.length === 0) {
        return null;
    }

    return (
        <div className="flex-1 overflow-hidden relative">
            <div className="absolute inset-0 flex items-center">
                <div className="flex gap-8 animate-ticker">
                    {displayMatches.map((match, idx) => {
                        const teamAName = match.teamA?.shortName || match.teamA?.name || "Team A";
                        const teamBName = match.teamB?.shortName || match.teamB?.name || "Team B";
                        const scoreA = match.scoreA || "-";
                        const scoreB = match.scoreB || "-";

                        return (
                            <Link
                                key={`${match._id}-${idx}`}
                                to={`/match/${match._id}`}
                                className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-background/50 border border-border/50 hover:bg-secondary/80 transition-colors whitespace-nowrap shadow-sm"
                            >
                                <span className="text-xs font-semibold">{teamAName}</span>
                                <span className="text-xs font-mono text-primary font-bold">{scoreA}</span>
                                <span className="text-xs text-muted-foreground">-</span>
                                <span className="text-xs font-semibold">{teamBName}</span>
                                <span className="text-xs font-mono text-primary font-bold">{scoreB}</span>
                                <span className="text-[10px] text-live animate-pulse font-bold tracking-wider">● LIVE</span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
