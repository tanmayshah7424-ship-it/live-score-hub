import { Heart, User } from "lucide-react";
import { useState, useEffect } from "react";
import { favoritesAPI } from "@/api/endpoints";
import { useToast } from "@/hooks/use-toast";

interface PlayerCardProps {
    player: any;
    isFavorite?: boolean;
    onToggleFavorite?: () => void;
}

export function PlayerCard({ player, isFavorite: initialIsFavorite = false, onToggleFavorite }: PlayerCardProps) {
    const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
    const { toast } = useToast();

    useEffect(() => {
        setIsFavorite(initialIsFavorite);
    }, [initialIsFavorite]);

    const handleToggleFavorite = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const res = await favoritesAPI.togglePlayer(player._id);
            setIsFavorite(res.data.favorited);

            toast({
                title: res.data.favorited ? "Added to Favorites" : "Removed from Favorites",
                description: `${player.name} has been ${res.data.favorited ? "added to" : "removed from"} your favorites.`,
            });

            if (onToggleFavorite) {
                onToggleFavorite();
            }
        } catch (error) {
            console.error("Failed to toggle favorite", error);
            toast({
                title: "Error",
                description: "Failed to update favorites",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="card-glass rounded-xl p-6 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:glow group animate-slide-up relative">
            <button
                onClick={handleToggleFavorite}
                className="absolute top-4 right-4 z-10 p-2 hover:bg-white/10 rounded-full transition-colors"
                title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
                <Heart
                    className={`w-5 h-5 transition-colors ${isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground hover:text-red-500"
                        }`}
                />
            </button>

            <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center overflow-hidden border-2 border-primary/20">
                    {player.thumb ? (
                        <img src={player.thumb} alt={player.name} className="w-full h-full object-cover" />
                    ) : (
                        <User className="w-8 h-8 text-muted-foreground" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg truncate">{player.name}</h3>
                    <p className="text-sm text-muted-foreground truncate">{player.team}</p>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Sport</span>
                    <span className="font-medium">{player.sport || "Cricket"}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Position</span>
                    <span className="font-medium">{player.position || "N/A"}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Nationality</span>
                    <span className="font-medium">{player.nationality || "N/A"}</span>
                </div>
            </div>
        </div>
    );
}
