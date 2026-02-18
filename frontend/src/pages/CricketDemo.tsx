import { useState } from "react";
import { useCricketTeams, useCricketPlayers, useCricketCountries, useCricketSeries, useCricketMatchesList, useCricketCurrentMatches } from "@/hooks/useCricket";

const CricketDemo = () => {
    const [activeTab, setActiveTab] = useState<'countries' | 'teams' | 'series' | 'matches'>('series');

    return (
        <div className="container py-10 space-y-8 min-h-screen">
            <h1 className="text-3xl font-bold">🏏 Cricket API Full Suite Demo</h1>

            {/* Tabs */}
            <div className="flex gap-4 border-b pb-2 overflow-x-auto">
                {['series', 'matches', 'countries', 'teams'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`px-4 py-2 rounded-t-lg font-medium capitalize ${activeTab === tab ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="bg-card border rounded-lg p-6 min-h-[500px]">
                {activeTab === 'series' && <SeriesSection />}
                {activeTab === 'matches' && <MatchesSection />}
                {activeTab === 'countries' && <CountriesSection />}
                {activeTab === 'teams' && <TeamsSection />}
            </div>
        </div>
    );
};

// --- Sub-components ---

const SeriesSection = () => {
    const { data: series, isLoading } = useCricketSeries();

    if (isLoading) return <p>Loading series...</p>;

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Cricket Series</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {series?.map((s: any) => (
                    <div key={s.id} className="p-4 border rounded bg-secondary/10 hover:bg-secondary/20 transition-colors">
                        <h3 className="font-bold truncate">{s.name}</h3>
                        <div className="text-sm text-muted-foreground flex justify-between mt-2">
                            <span>Starts: {s.startDate}</span>
                            <span>Ends: {s.endDate}</span>
                        </div>
                        <div className="mt-2 text-xs bg-accent/50 p-1 rounded inline-block">
                            Matches: {s.matches} | ODI: {s.odi} | T20: {s.t20} | Test: {s.test}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const MatchesSection = () => {
    const { data: current, isLoading: loadCurrent } = useCricketCurrentMatches();
    const { data: all, isLoading: loadAll } = useCricketMatchesList();

    if (loadCurrent && loadAll) return <p>Loading matches...</p>;

    return (
        <div className="space-y-8">
            {/* Current Matches */}
            <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Current / Live Matches
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {current?.map((m: any) => (
                        <div key={m.id} className="p-4 border rounded bg-green-500/5 border-green-500/20">
                            <h3 className="font-bold">{m.name}</h3>
                            <p className="text-sm text-muted-foreground">{m.status}</p>
                            <p className="text-sm mt-1">{m.venue}</p>
                            <div className="mt-2 text-xs font-mono bg-background p-2 rounded">
                                {m.score ? (
                                    m.score.map((s: any, i: number) => <div key={i}>{s.inning}: {s.r}/{s.w} ({s.o})</div>)
                                ) : 'Score not available'}
                            </div>
                        </div>
                    ))}
                    {current?.length === 0 && <p className="text-muted-foreground">No live matches at the moment.</p>}
                </div>
            </div>

            {/* All Matches */}
            <div>
                <h2 className="text-xl font-semibold mb-4">Recent / Upcoming Matches</h2>
                <div className="h-96 overflow-y-auto border rounded p-2 bg-background space-y-2">
                    {all?.map((m: any) => (
                        <div key={m.id} className="p-3 border-b last:border-0 flex justify-between items-center hover:bg-accent/50 gap-4">
                            <div>
                                <p className="font-medium">{m.name}</p>
                                <p className="text-xs text-muted-foreground">{m.dateTimeGMT} | {m.matchType?.toUpperCase()}</p>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded ${m.matchStarted ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                {m.status}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const CountriesSection = () => {
    const { data: countries, isLoading } = useCricketCountries();
    if (isLoading) return <p>Loading countries...</p>;

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {countries?.map((c: any) => (
                <div key={c.id} className="p-3 border rounded text-center hover:shadow-sm transition-shadow">
                    <img src={c.genericFlag} alt={c.name} className="w-12 h-12 mx-auto mb-2 object-contain" />
                    <p className="text-sm font-medium">{c.name}</p>
                </div>
            ))}
        </div>
    );
};

const TeamsSection = () => {
    const { data: teams, isLoading } = useCricketTeams();
    const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
    const { data: players } = useCricketPlayers(selectedTeam || undefined);

    if (isLoading) return <p>Loading teams...</p>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 h-[600px] overflow-y-auto border rounded p-2">
                {teams?.map((team: any) => (
                    <div
                        key={team.id}
                        onClick={() => setSelectedTeam(team.id)}
                        className={`p-3 rounded cursor-pointer flex items-center gap-3 mb-2 ${selectedTeam === team.id ? 'bg-primary/10 border-primary border' : 'hover:bg-accent'}`}
                    >
                        <img src={team.img} alt={team.title} className="w-8 h-8 object-contain" />
                        <p className="text-sm font-medium">{team.title}</p>
                    </div>
                ))}
            </div>

            <div className="md:col-span-2 border rounded p-4">
                <h3 className="text-lg font-bold mb-4">Players</h3>
                {selectedTeam ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-[550px] overflow-y-auto">
                        {players?.map((p: any) => (
                            <div key={p.id} className="flex items-center gap-3 p-2 bg-secondary/10 rounded">
                                <img src={p.img} alt={p.name} className="w-10 h-10 rounded-full bg-background object-cover" />
                                <div>
                                    <p className="font-medium text-sm">{p.name}</p>
                                    <p className="text-xs text-muted-foreground">{p.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                        Select a team to view players
                    </div>
                )}
            </div>
        </div>
    );
};

export default CricketDemo;
