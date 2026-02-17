export type Team = {
    id: string;
    name: string;
    short_name: string | null;
    logo_url: string | null;
    created_at: string;
};

export type Player = {
    id: string;
    name: string;
    team_id: string | null;
    position: string | null;
    number: number | null;
    created_at: string;
};

export type Match = {
    id: string;
    home_team_id: string | null;
    away_team_id: string | null;
    start_time: string;
    status: 'scheduled' | 'live' | 'finished';
    score_home: number | null;
    score_away: number | null;
    current_time: string | null;
    created_at: string;
};
