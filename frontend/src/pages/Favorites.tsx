import { useState, useEffect } from "react";
import { favoritesAPI } from "@/api/endpoints";
import { TeamCard } from "@/components/TeamCard";
import { PlayerCard } from "@/components/PlayerCard";
import { Heart } from "lucide-react";

export default function Favorites() {
  const [favorites, setFavorites] = useState<{ teams: any[]; players: any[] }>({ teams: [], players: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const response = await favoritesAPI.getAll();
      setFavorites(response.data);
    } catch (error) {
      console.error("Failed to load favorites", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading favorites...</div>;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center gap-3">
        <Heart className="w-8 h-8 text-red-500 fill-red-500" />
        <h1 className="text-3xl font-bold">My Favorites</h1>
      </div>

      {favorites.teams.length === 0 && favorites.players.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No favorites yet. Start by exploring teams and players!</p>
        </div>
      ) : (
        <>
          {favorites.teams.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold mb-4">Favorite Teams</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.teams.map((team) => (
                  <TeamCard key={team._id} team={team} onToggleFavorite={loadFavorites} />
                ))}
              </div>
            </section>
          )}

          {favorites.players.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold mb-4">Favorite Players</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.players.map((player) => (
                  <PlayerCard key={player._id} player={player} onToggleFavorite={loadFavorites} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
