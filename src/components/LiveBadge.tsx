import { cn } from "@/lib/utils";

interface LiveBadgeProps {
  className?: string;
}

export function LiveBadge({ className }: LiveBadgeProps) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-live/15 text-live", className)}>
      <span className="w-1.5 h-1.5 rounded-full bg-live animate-live-pulse" />
      Live
    </span>
  );
}

export function StatusBadge({ status }: { status: "live" | "upcoming" | "completed" }) {
  if (status === "live") return <LiveBadge />;
  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider",
      status === "upcoming" && "bg-secondary text-secondary-foreground",
      status === "completed" && "bg-muted text-muted-foreground"
    )}>
      {status}
    </span>
  );
}
