import { NavLink } from 'react-router-dom';
import { navigationSections } from './navConfig';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 left-0 w-[290px] bg-sidebar text-sidebar-foreground border-r shadow-2xl flex flex-col z-50 animate-in slide-in-from-left duration-200">
        {/* Drawer Header */}
        <div className="h-[var(--navbar-height)] flex items-center justify-between px-5 border-b shrink-0">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="FBA Logo" className="h-8 w-8 object-contain" />
            <div className="flex flex-col">
              <span className="font-bold text-sm text-foreground">FBA Admin</span>
              <span className="text-[10px] font-semibold text-primary uppercase">Super Portal</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full"
            aria-label="Close drawer"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto custom-scrollbar py-3 px-3 space-y-4">
          {navigationSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <div className="px-3 pt-1 pb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                  {section.title}
                </span>
              </div>

              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    end={item.exact}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-xs font-semibold'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      )
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto text-[10px] font-semibold bg-primary/10 text-primary px-1.5 py-0.2 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t text-xs text-muted-foreground text-center shrink-0">
          Future Behavior Analysis &copy; {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}
