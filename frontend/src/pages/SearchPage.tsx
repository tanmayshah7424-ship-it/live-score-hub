import { useEffect, useState } from "react";

import { teamsAPI, matchesAPI } from "@/api/endpoints";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [teams, setTeams] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([teamsAPI.getAll(), matchesAPI.getAll()])
      .then(([tRes, mRes]) => {
        setTeams(tRes.data);
        setMatches(mRes.data);
      })
      .catch(console.error);
  }, []);

  const q = query.toLowerCase();
  const filteredTeams = teams.filter((t) => t.name.toLowerCase().includes(q) || t.shortName.toLowerCase().includes(q));
  const filteredMatches = matches.filter((m) =>
    m.tournament?.toLowerCase().includes(q) ||
    m.teamA?.name?.toLowerCase().includes(q) ||
    m.teamB?.name?.toLowerCase().includes(q) ||
    m.venue?.toLowerCase().includes(q)
  );

  return (
    <div className="min-h-screen bg-background">
      <main className="container py-6 space-y-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search teams, matches, tournaments..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 bg-secondary/50 text-lg h-12"
            autoFocus
          />
        </div>

        {query && (
          <>
            {filteredTeams.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-lg font-bold text-muted-foreground">Teams</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredTeams.map((t) => (
                    <div
                      key={t._id}
                      onClick={() => navigate(`/team/${t._id}`)}
                      className="card-glass rounded-lg p-4 flex items-center gap-3 cursor-pointer hover:glow transition-all"
                    >
                      <span className="text-2xl">{t.logo}</span>
                      <div>
                        <p className="font-semibold">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.sport}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {filteredMatches.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-lg font-bold text-muted-foreground">Matches</h2>
                <div className="space-y-2">
                  {filteredMatches.map((m) => (
                    <div
                      key={m._id}
                      onClick={() => navigate(`/match/${m._id}`)}
                      className="card-glass rounded-lg p-4 cursor-pointer hover:glow transition-all flex items-center gap-3"
                    >
                      <span className="text-lg">{m.teamA?.logo}</span>
                      <span className="font-semibold">{m.teamA?.shortName} vs {m.teamB?.shortName}</span>
                      <span className="text-lg">{m.teamB?.logo}</span>
                      <span className="text-xs text-muted-foreground ml-auto">{m.tournament}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {filteredTeams.length === 0 && filteredMatches.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No results for "{query}"</p>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default SearchPage;
