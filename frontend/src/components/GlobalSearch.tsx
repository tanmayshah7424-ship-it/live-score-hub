import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Loader2, Trophy, Users, User, Calendar } from "lucide-react";
import { searchAPI } from "@/api/endpoints";
import { cn } from "@/lib/utils";

interface SearchResult {
    live: any[];
    upcoming: any[];
    finished: any[];
    teams: any[];
    players: any[];
    series: any[];
}

export function GlobalSearch() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Debounce logic
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.length >= 2) {
                performSearch(query);
            } else {
                setResults(null);
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [query]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const performSearch = async (q: string) => {
        setLoading(true);
        setIsOpen(true);
        try {
            const res = await searchAPI.search(q);
            setResults(res.data);
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (path: string) => {
        setIsOpen(false);
        setQuery("");
        navigate(path);
    };

    return (
        <div ref={wrapperRef} className="relative w-full max-w-md hidden md:block">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.length >= 2 && setIsOpen(true)}
                    placeholder="Search matches, teams, players..."
                    className="w-full bg-secondary/50 border border-transparent focus:border-primary rounded-full py-2 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-muted-foreground/70"
                />
                {loading && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-primary" />
                )}
            </div>

            {isOpen && results && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-card/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl overflow-hidden z-50 max-h-[80vh] overflow-y-auto">
                    {/* Live Matches */}
                    {results.live.length > 0 && (
                        <div className="p-2">
                            <h3 className="text-xs font-bold text-muted-foreground uppercase px-2 mb-1 flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-live animate-pulse" /> Live Now
                            </h3>
                            {results.live.map((m: any) => (
                                <div
                                    key={m._id}
                                    onClick={() => handleSelect(`/match/${m._id}`)}
                                    className="p-2 hover:bg-secondary/50 rounded-lg cursor-pointer flex justify-between items-center group"
                                >
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-sm group-hover:text-primary transition-colors">
                                            {m.teamA.shortName} vs {m.teamB.shortName}
                                        </span>
                                        <span className="text-xs text-muted-foreground">{m.tournament}</span>
                                    </div>
                                    <span className="text-xs font-mono font-bold text-live">{m.scoreA}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Upcoming Matches */}
                    {results.upcoming.length > 0 && (
                        <div className="p-2 border-t border-border/50">
                            <h3 className="text-xs font-bold text-muted-foreground uppercase px-2 mb-1 flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> Upcoming
                            </h3>
                            {results.upcoming.map((m: any) => (
                                <div
                                    key={m._id}
                                    onClick={() => handleSelect(`/match/${m._id}`)}
                                    className="p-2 hover:bg-secondary/50 rounded-lg cursor-pointer"
                                >
                                    <p className="text-sm font-medium">{m.teamA.shortName} vs {m.teamB.shortName}</p>
                                    <p className="text-xs text-muted-foreground">{new Date(m.date).toLocaleDateString()}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Teams */}
                    {results.teams.length > 0 && (
                        <div className="p-2 border-t border-border/50">
                            <h3 className="text-xs font-bold text-muted-foreground uppercase px-2 mb-1 flex items-center gap-1">
                                <Users className="w-3 h-3" /> Teams
                            </h3>
                            {results.teams.map((t: any) => (
                                <div
                                    key={t._id}
                                    onClick={() => handleSelect(`/team/${t._id}`)}
                                    className="p-2 hover:bg-secondary/50 rounded-lg cursor-pointer flex items-center gap-3"
                                >
                                    <span className="text-xl">{t.logo || '🛡️'}</span>
                                    <span className="text-sm font-medium">{t.name}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Players */}
                    {results.players.length > 0 && (
                        <div className="p-2 border-t border-border/50">
                            <h3 className="text-xs font-bold text-muted-foreground uppercase px-2 mb-1 flex items-center gap-1">
                                <User className="w-3 h-3" /> Players
                            </h3>
                            {results.players.map((p: any) => (
                                <div
                                    key={p._id}
                                    onClick={() => handleSelect(`/player/${p._id}`)}
                                    className="p-2 hover:bg-secondary/50 rounded-lg cursor-pointer flex items-center gap-3"
                                >
                                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                        {p.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{p.name}</p>
                                        <p className="text-[10px] text-muted-foreground">{p.teamId?.name}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* No Results */}
                    {!loading &&
                        (!results.live.length && !results.upcoming.length && !results.teams.length && !results.players.length) && (
                            <div className="p-8 text-center text-muted-foreground text-sm">
                                No results found for "{query}"
                            </div>
                        )}
                </div>
            )}
        </div>
    );
}
