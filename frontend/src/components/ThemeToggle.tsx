
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
        >
            <span className="text-xl">🌗</span>
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
}
