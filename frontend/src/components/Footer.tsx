import { WorldClock } from "./WorldClock";

export function Footer() {
    return (
        <footer className="border-t border-border bg-background/80 backdrop-blur-xl py-4">
            <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-xs text-muted-foreground text-center md:text-left">
                    &copy; {new Date().getFullYear()} ScoreHub Live. All rights reserved.
                </p>

                <WorldClock />
            </div>
        </footer>
    );
}
