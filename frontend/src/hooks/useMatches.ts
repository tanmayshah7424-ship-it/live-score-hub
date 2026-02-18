import { useQuery, useQueryClient } from "@tanstack/react-query";
import { matchesAPI, liveAPI } from "@/api/endpoints";
import { useEffect } from "react";
import { useSocket } from "@/contexts/SocketContext";

export const useMatches = () => {
    const queryClient = useQueryClient();
    const { socket } = useSocket();

    const fetchMatches = async () => {
        const [live, upcoming, completed, external, cricApiCurrent, cricApiUpcoming] = await Promise.all([
            matchesAPI.getLive().catch(() => ({ data: [] })),
            matchesAPI.getUpcoming().catch(() => ({ data: [] })),
            matchesAPI.getAll({ status: "completed" }).catch(() => ({ data: [] })),
            liveAPI.getAll().catch(() => ({ data: [] })),
            liveAPI.getCricketCurrentMatches().catch(() => ({ data: [] })),
            liveAPI.getCricketMatchesList().catch(() => ({ data: [] })),
        ]);

        const normalizeMatch = (m: any) => {
            const teams = m.name.split(" vs ");
            const homeTeam = teams[0] || "Unknown";
            const awayTeam = (teams[1] || "").split(",")[0] || "Unknown";

            let homeScore = "-";
            let awayScore = "-";

            if (m.score && Array.isArray(m.score)) {
                const homeInn = m.score.find((s: any) => s.inning.includes(homeTeam));
                const awayInn = m.score.find((s: any) => s.inning.includes(awayTeam));
                if (homeInn) homeScore = `${homeInn.r}/${homeInn.w} (${homeInn.o})`;
                if (awayInn) awayScore = `${awayInn.r}/${awayInn.w} (${awayInn.o})`;
            }

            const homeInfo = m.teamInfo?.find((t: any) => t.name.includes(homeTeam));
            const awayInfo = m.teamInfo?.find((t: any) => t.name.includes(awayTeam));

            return {
                id: m.id,
                sport: "cricket",
                tournament: m.matchType || "International",
                status: m.status === "Match not started" ? "upcoming" : m.status.toLowerCase(), // Normalize status
                venue: m.venue,
                date: new Date(m.dateTimeGMT).toLocaleDateString(),
                time: new Date(m.dateTimeGMT).toLocaleTimeString(),
                homeTeam,
                awayTeam,
                homeScore,
                awayScore,
                homeBadge: homeInfo?.img || "",
                awayBadge: awayInfo?.img || "",
                source: "cricapi"
            };
        };

        const currentNormalized = (cricApiCurrent.data || []).map(normalizeMatch);
        // Filter upcoming to avoid duplicates if they appear in both lists (though unlikely with this API structure)
        const upcomingNormalized = (cricApiUpcoming.data || [])
            .map(normalizeMatch)
            .filter((m: any) => m.status === 'upcoming' || m.status.includes('not started'));

        return {
            live: live.data,
            upcoming: upcoming.data,
            completed: completed.data,
            external: [...external.data, ...currentNormalized, ...upcomingNormalized],
        };
    };

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ["matches"],
        queryFn: fetchMatches,
        refetchInterval: 10000, // Poll every 10s as fallback
    });

    // innovative: Optimistic updates via Socket.IO
    useEffect(() => {
        if (!socket) return;

        const handleScoreUpdate = (update: any) => {
            queryClient.setQueryData(["matches"], (old: any) => {
                if (!old) return old;

                // Helper to update specific match list
                const updateList = (list: any[]) => list.map(m => (m._id === update._id || m.id === update.id ? { ...m, ...update } : m));

                const isExternal = update.source === "cricapi" || update.source === "thesportsdb";

                if (isExternal) {
                    return { ...old, external: updateList(old.external) };
                } else {
                    return {
                        ...old,
                        live: updateList(old.live),
                        upcoming: updateList(old.upcoming), // In case status changes
                        completed: updateList(old.completed),
                    };
                }
            });
        };

        const handleStatusChange = () => {
            refetch(); // Safest to refetch on status change (e.g. Upcoming -> Live)
        };

        socket.on("score:update", handleScoreUpdate);
        socket.on("match:status", handleStatusChange);

        return () => {
            socket.off("score:update", handleScoreUpdate);
            socket.off("match:status", handleStatusChange);
        };
    }, [socket, queryClient, refetch]);

    return {
        liveMatches: data?.live || [],
        upcomingMatches: data?.upcoming || [],
        completedMatches: data?.completed || [],
        externalMatches: data?.external || [],
        loading: isLoading,
        error,
    };
};
