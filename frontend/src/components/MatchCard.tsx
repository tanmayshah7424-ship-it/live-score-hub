import { Match } from "@/types/sports";
import { StatusBadge } from "./LiveBadge";
import { FavoriteButton } from "@/hooks/useFavorites";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface MatchCardProps {
  match: Match;
  isFav: boolean;
  onToggleFav: (id: string) => void;
}

const sportColors: Record<string, string> = {
  cricket: "border-l-sport-cricket",
  football: "border-l-sport-football",
  basketball: "border-l-sport-basketball",
  tennis: "border-l-sport-tennis",
};

export function MatchCard({ match, isFav, onToggleFav }: MatchCardProps) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/match/${match.id}`)}
      className={cn(
        "card-glass rounded-lg p-4 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:glow border-l-4 animate-slide-up",
        sportColors[match.sport] || "border-l-primary",
        match.status === "live" && "ring-1 ring-live/20"
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <StatusBadge status={match.status} />
          <span className="text-xs text-muted-foreground">{match.tournament}</span>
        </div>
        <FavoriteButton id={match.id} isFav={isFav} onToggle={onToggleFav} />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {match.teamA.logo ? (
              <img src={match.teamA.logo} alt={match.teamA.shortName} className="w-8 h-8 object-contain" />
            ) : (
              <span className="text-xl">🛡️</span>
            )}
            <span className="font-semibold text-lg">{match.teamA.shortName}</span>
          </div>
          <span className={cn("font-mono font-bold text-2xl", match.status === "live" && "text-primary animate-pulse")}>
            {match.scoreA}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {match.teamB.logo ? (
              <img src={match.teamB.logo} alt={match.teamB.shortName} className="w-8 h-8 object-contain" />
            ) : (
              <span className="text-xl">🛡️</span>
            )}
            <span className="font-semibold text-lg">{match.teamB.shortName}</span>
          </div>
          <span className={cn("font-mono font-bold text-2xl", match.status === "live" && "text-primary animate-pulse")}>
            {match.scoreB}
          </span>
        </div>
      </div>

      <p className="mt-3 text-xs text-muted-foreground truncate">{match.summary}</p>
      {
        match.venue && (
          <p className="mt-1 text-xs text-muted-foreground/60 truncate">{match.venue}</p>
        )
      }
    </div >
  );
}
