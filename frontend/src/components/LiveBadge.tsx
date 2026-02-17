import { cn } from "@/lib/utils";
import { Circle } from "lucide-react";

interface LiveBadgeProps {
  className?: string;
}

export function LiveBadge({ className }: LiveBadgeProps) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-live/15 text-live border border-live/30", className)}>
      <Circle className="w-2 h-2 fill-current animate-live-pulse" />
      Live
    </span>
  );
}

export function StatusBadge({ status }: { status: "live" | "upcoming" | "completed" | "finished" }) {
  const normalizedStatus = status === "completed" ? "finished" : status;

  if (normalizedStatus === "live") return <LiveBadge />;

  const variants = {
    upcoming: {
      bg: "bg-blue-500/10",
      text: "text-blue-400",
      border: "border-blue-500/30",
      label: "UPCOMING",
    },
    finished: {
      bg: "bg-muted",
      text: "text-muted-foreground",
      border: "border-border",
      label: "FINISHED",
    },
  };

  const variant = variants[normalizedStatus as keyof typeof variants];

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border",
        variant.bg,
        variant.text,
        variant.border
      )}
    >
      {variant.label}
    </span>
  );
}

interface LiveIndicatorProps {
  className?: string;
}

export function LiveIndicator({ className }: LiveIndicatorProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative flex items-center justify-center">
        <div className="absolute w-3 h-3 bg-live rounded-full animate-ping opacity-75" />
        <div className="relative w-2 h-2 bg-live rounded-full" />
      </div>
      <span className="text-sm font-bold text-live uppercase tracking-wider">
        Live
      </span>
    </div>
  );
}
