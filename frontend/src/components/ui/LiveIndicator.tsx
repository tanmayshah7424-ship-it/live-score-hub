import { cn } from "@/lib/utils";

interface LiveIndicatorProps {
    className?: string;
}

export function LiveIndicator({ className }: LiveIndicatorProps) {
    return (
        <span className={cn("relative flex h-3 w-3", className)}>
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-live opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-live"></span>
        </span>
    );
}
