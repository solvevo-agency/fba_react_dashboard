import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './ThemeToggle';
import { UserMenu } from './UserMenu';
import { NotificationPopover } from './NotificationPopover';
import { useLocation } from 'react-router-dom';
import { navigationItems } from './navConfig';

interface NavbarProps {
  onOpenMobileDrawer: () => void;
}

export function Navbar({ onOpenMobileDrawer }: NavbarProps) {
  const location = useLocation();

  // Compute current page title from active path
  const currentNav = navigationItems.find((item) =>
    item.exact
      ? location.pathname === item.path
      : location.pathname.startsWith(item.path)
  );

  let pageTitle = currentNav?.label || 'Super Admin Dashboard';
  if (location.pathname === '/dashboard/profile') {
    pageTitle = 'My Profile';
  } else if (location.pathname === '/dashboard/courses/create') {
    pageTitle = 'Create New Course';
  } else if (location.pathname.startsWith('/dashboard/courses/edit')) {
    pageTitle = 'Edit Course';
  }

  return (
    <header className="h-[var(--navbar-height)] border-b bg-background/95 backdrop-blur-xs sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6">
      {/* Left: Mobile hamburger & Page Title */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenMobileDrawer}
          className="lg:hidden text-muted-foreground hover:text-foreground"
          aria-label="Open mobile navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-2">
          <h1 className="text-base sm:text-lg font-semibold tracking-tight text-foreground line-clamp-1">
            {pageTitle}
          </h1>
        </div>
      </div>

      {/* Right: Actions, Theme, Notifications & User Menu */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Notification Popover */}
        <NotificationPopover />

        {/* Theme Switcher */}
        <ThemeToggle />

        <div className="h-4 w-[1px] bg-border mx-1" />

        {/* User Profile Dropdown */}
        <UserMenu />
      </div>
    </header>
  );
}

