import { Match, Team, Player, ScoreEvent } from "@/types/sports";

export const teams: Team[] = [
  { id: "t1", name: "Mumbai Indians", shortName: "MI", logo: "🏏", sport: "cricket" },
  { id: "t2", name: "Chennai Super Kings", shortName: "CSK", logo: "🦁", sport: "cricket" },
  { id: "t3", name: "Royal Challengers", shortName: "RCB", logo: "👑", sport: "cricket" },
  { id: "t4", name: "Delhi Capitals", shortName: "DC", logo: "🦅", sport: "cricket" },
  { id: "t5", name: "Manchester United", shortName: "MUN", logo: "⚽", sport: "football" },
  { id: "t6", name: "Liverpool FC", shortName: "LIV", logo: "⚽", sport: "football" },
  { id: "t7", name: "LA Lakers", shortName: "LAL", logo: "🏀", sport: "basketball" },
  { id: "t8", name: "Golden State Warriors", shortName: "GSW", logo: "🏀", sport: "basketball" },
  { id: "t9", name: "Kolkata Knight Riders", shortName: "KKR", logo: "⚔️", sport: "cricket" },
  { id: "t10", name: "Barcelona FC", shortName: "BAR", logo: "⚽", sport: "football" },
];

export const players: Player[] = [
  { id: "p1", name: "Rohit Sharma", teamId: "t1", role: "Batsman", sport: "cricket", stats: { runs: 10480, avg: 48.96, sr: 140.2 } },
  { id: "p2", name: "Jasprit Bumrah", teamId: "t1", role: "Bowler", sport: "cricket", stats: { wickets: 145, economy: 7.39, avg: 23.5 } },
  { id: "p3", name: "MS Dhoni", teamId: "t2", role: "Wicketkeeper", sport: "cricket", stats: { runs: 5243, avg: 39.2, sr: 135.2 } },
  { id: "p4", name: "Virat Kohli", teamId: "t3", role: "Batsman", sport: "cricket", stats: { runs: 7263, avg: 37.25, sr: 130.4 } },
  { id: "p5", name: "Marcus Rashford", teamId: "t5", role: "Forward", sport: "football", stats: { goals: 131, assists: 57 } },
  { id: "p6", name: "Mohamed Salah", teamId: "t6", role: "Forward", sport: "football", stats: { goals: 214, assists: 92 } },
  { id: "p7", name: "LeBron James", teamId: "t7", role: "Forward", sport: "basketball", stats: { points: 40474, rebounds: 10908 } },
  { id: "p8", name: "Stephen Curry", teamId: "t8", role: "Guard", sport: "basketball", stats: { points: 23067, threes: 3747 } },
];

export const matches: Match[] = [
  {
    id: "m1", sport: "cricket", tournament: "IPL 2026", status: "live",
    venue: "Wankhede Stadium, Mumbai", date: "2026-02-11T14:00:00Z",
    teamA: teams[0], teamB: teams[1],
    scoreA: "185/4", scoreB: "142/3", summary: "CSK need 44 runs from 28 balls",
    overs: "15.2",
  },
  {
    id: "m2", sport: "football", tournament: "Premier League", status: "live",
    venue: "Old Trafford, Manchester", date: "2026-02-11T20:00:00Z",
    teamA: teams[4], teamB: teams[5],
    scoreA: "2", scoreB: "1", summary: "Man Utd leading • 72'",
    minute: "72",
  },
  {
    id: "m3", sport: "basketball", tournament: "NBA Season", status: "live",
    venue: "Crypto.com Arena, LA", date: "2026-02-11T03:00:00Z",
    teamA: teams[6], teamB: teams[7],
    scoreA: "98", scoreB: "102", summary: "Q4 • 4:32 remaining",
  },
  {
    id: "m4", sport: "cricket", tournament: "IPL 2026", status: "upcoming",
    venue: "Eden Gardens, Kolkata", date: "2026-02-12T14:00:00Z",
    teamA: teams[2], teamB: teams[3],
    scoreA: "-", scoreB: "-", summary: "Match starts tomorrow",
  },
  {
    id: "m5", sport: "football", tournament: "La Liga", status: "upcoming",
    venue: "Camp Nou, Barcelona", date: "2026-02-13T21:00:00Z",
    teamA: teams[9], teamB: teams[4],
    scoreA: "-", scoreB: "-", summary: "Upcoming fixture",
  },
  {
    id: "m6", sport: "cricket", tournament: "IPL 2026", status: "completed",
    venue: "Chinnaswamy Stadium, Bangalore", date: "2026-02-10T14:00:00Z",
    teamA: teams[2], teamB: teams[8],
    scoreA: "204/5", scoreB: "198/8", summary: "RCB won by 6 runs",
  },
  {
    id: "m7", sport: "football", tournament: "Premier League", status: "completed",
    venue: "Anfield, Liverpool", date: "2026-02-09T17:00:00Z",
    teamA: teams[5], teamB: teams[4],
    scoreA: "3", scoreB: "0", summary: "Liverpool dominated",
  },
];

export const scoreEvents: ScoreEvent[] = [
  { id: "e1", matchId: "m1", timestamp: "15.2", description: "Dhoni smashes a SIX over long-on!", type: "six", value: 6 },
  { id: "e2", matchId: "m1", timestamp: "15.1", description: "Single to deep midwicket", type: "run", value: 1 },
  { id: "e3", matchId: "m1", timestamp: "14.6", description: "FOUR! Cover drive by Jadeja", type: "boundary", value: 4 },
  { id: "e4", matchId: "m1", timestamp: "14.5", description: "Dot ball, good length outside off", type: "run", value: 0 },
  { id: "e5", matchId: "m1", timestamp: "14.4", description: "WICKET! Caught at slip, Uthappa departs", type: "wicket", value: 0 },
  { id: "e6", matchId: "m1", timestamp: "14.3", description: "Two runs, pushed to long-off", type: "run", value: 2 },
  { id: "e7", matchId: "m2", timestamp: "72'", description: "GOAL! Rashford volleys it in! 2-1", type: "goal", value: 1 },
  { id: "e8", matchId: "m2", timestamp: "65'", description: "Yellow card - Robertson for a late tackle", type: "foul", value: 0 },
  { id: "e9", matchId: "m2", timestamp: "54'", description: "GOAL! Salah equalizes from a corner! 1-1", type: "goal", value: 1 },
  { id: "e10", matchId: "m2", timestamp: "23'", description: "GOAL! Bruno Fernandes free kick! 1-0", type: "goal", value: 1 },
];
