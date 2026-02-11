export type Sport = "cricket" | "football" | "basketball" | "tennis";

export interface Team {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  sport: Sport;
}

export interface Player {
  id: string;
  name: string;
  teamId: string;
  role: string;
  sport: Sport;
  stats: Record<string, number | string>;
}

export interface Match {
  id: string;
  sport: Sport;
  tournament: string;
  status: "live" | "upcoming" | "completed";
  venue: string;
  date: string;
  teamA: Team;
  teamB: Team;
  scoreA: string;
  scoreB: string;
  summary: string;
  overs?: string;
  minute?: string;
}

export interface ScoreEvent {
  id: string;
  matchId: string;
  timestamp: string;
  description: string;
  type: "run" | "wicket" | "goal" | "foul" | "point" | "boundary" | "six";
  value: number;
}
