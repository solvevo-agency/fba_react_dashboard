import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/app/providers/ThemeProvider';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle color theme"
            className="text-muted-foreground hover:text-foreground"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 transition-transform hover:rotate-45" />
            ) : (
              <Moon className="h-4 w-4 transition-transform hover:-rotate-12" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Switch to {theme === 'dark' ? 'Light' : 'Dark'} mode</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

