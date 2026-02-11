import { Star, StarOff } from "lucide-react";
import { useState, useEffect } from "react";

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("sportsFavorites") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("sportsFavorites", JSON.stringify(favorites));
  }, [favorites]);

  const toggle = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const isFav = (id: string) => favorites.includes(id);

  return { favorites, toggle, isFav };
}

export function FavoriteButton({ id, isFav, onToggle }: { id: string; isFav: boolean; onToggle: (id: string) => void }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onToggle(id); }}
      className="p-1 rounded-md transition-colors hover:bg-secondary"
      aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
    >
      {isFav ? (
        <Star className="w-4 h-4 fill-primary text-primary" />
      ) : (
        <StarOff className="w-4 h-4 text-muted-foreground" />
      )}
    </button>
  );
}
