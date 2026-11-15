import { Outlet } from 'react-router-dom';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

export function AuthLayout() {
  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-muted/40 relative">
      {/* Top right floating theme switcher */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <Outlet />
      </main>

      <footer className="py-4 text-center text-xs text-muted-foreground border-t bg-background/50">
        Future Behavior Analysis (FBA) &copy; {new Date().getFullYear()} &bull; Super Admin Portal
      </footer>
    </div>
  );
}

