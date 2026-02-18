import { useQuery } from "@tanstack/react-query";
import { liveAPI } from "@/api/endpoints";

// Countries
export const useCricketCountries = () => {
    return useQuery({
        queryKey: ["cricket", "countries"],
        queryFn: async () => {
            const res = await liveAPI.getCricketCountries();
            return res.data;
        },
    });
};

// Teams (Legacy/RapidAPI)
export const useCricketTeams = () => {
    return useQuery({
        queryKey: ["cricket", "teams"],
        queryFn: async () => {
            const res = await liveAPI.getCricketTeams();
            return res.data;
        },
    });
};

export const useCricketPlayers = (teamId?: string) => {
    return useQuery({
        queryKey: ["cricket", "players", teamId],
        queryFn: async () => {
            const res = await liveAPI.getCricketPlayers(teamId);
            return res.data;
        },
        enabled: !!teamId,
    });
};

// --- New Full Suite Hooks ---

export const useCricketSeries = (search?: string) => {
    return useQuery({
        queryKey: ["cricket", "series", search],
        queryFn: async () => {
            const res = await liveAPI.getCricketSeries(search);
            return res.data;
        },
    });
};

export const useCricketMatchesList = () => {
    return useQuery({
        queryKey: ["cricket", "matches", "list"],
        queryFn: async () => {
            const res = await liveAPI.getCricketMatchesList();
            return res.data;
        },
    });
};

export const useCricketCurrentMatches = () => {
    return useQuery({
        queryKey: ["cricket", "matches", "current"],
        queryFn: async () => {
            const res = await liveAPI.getCricketCurrentMatches();
            return res.data;
        },
        refetchInterval: 30000,
    });
};

export const useCricketMatchDetail = (id?: string) => {
    return useQuery({
        queryKey: ["cricket", "match", id],
        queryFn: async () => {
            if (!id) return null;
            const res = await liveAPI.getCricketMatchDetail(id);
            return res.data;
        },
        enabled: !!id,
    });
};

export const useCricketScorecard = (id?: string) => {
    return useQuery({
        queryKey: ["cricket", "scorecard", id],
        queryFn: async () => {
            if (!id) return null;
            const res = await liveAPI.getCricketMatchScorecard(id);
            return res.data;
        },
        enabled: !!id,
    });
};
