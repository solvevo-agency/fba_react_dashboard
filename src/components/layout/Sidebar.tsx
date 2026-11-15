import { NavLink } from 'react-router-dom';
import { navigationSections } from './navConfig';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({ collapsed, onToggleCollapse }: SidebarProps) {
  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-300 relative z-30 select-none h-screen sticky top-0 shrink-0',
        collapsed ? 'w-[66px] min-w-[66px]' : 'w-[250px] min-w-[250px]'
      )}
    >
      {/* Brand Header */}
      <div
        className={cn(
          'h-16 flex items-center border-b gap-3 overflow-hidden shrink-0 transition-all duration-200',
          collapsed ? 'justify-center px-0' : 'px-4'
        )}
      >
        <img
          src="/logo.png"
          alt="FBA Logo"
          className="h-8 w-8 object-contain shrink-0"
        />
        {!collapsed && (
          <div className="flex flex-col transition-opacity duration-200 min-w-0">
            <span className="font-bold text-sm leading-tight text-foreground tracking-tight truncate">
              FBA Admin
            </span>
            <span className="text-[10px] font-medium text-primary uppercase tracking-wider truncate">
              Super Portal
            </span>
          </div>
        )}
      </div>

      {/* Navigation List */}
      <div
        className={cn(
          'flex-1 overflow-y-auto custom-scrollbar py-3 space-y-4 transition-all duration-200',
          collapsed ? 'px-2' : 'px-3'
        )}
      >
        {navigationSections.map((section, idx) => (
          <div key={section.title} className="space-y-1.5">
            {!collapsed && (
              <div className="px-3 pt-1 pb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                  {section.title}
                </span>
              </div>
            )}
            {collapsed && idx > 0 && <div className="h-[1px] bg-border/40 mx-2 my-2" />}

            {section.items.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  end={item.exact}
                  title={item.label}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center rounded-lg text-xs font-medium transition-all relative group',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-xs font-semibold'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                      collapsed
                        ? 'h-10 w-10 mx-auto justify-center'
                        : 'gap-3 px-3 py-2.5'
                    )
                  }
                >
                  <Icon className="h-5 w-5 shrink-0" />

                  {!collapsed && <span className="truncate">{item.label}</span>}

                  {!collapsed && item.badge && (
                    <span className="ml-auto text-[10px] font-semibold bg-primary/10 text-primary px-1.5 py-0.2 rounded-full">
                      {item.badge}
                    </span>
                  )}

                  {/* Floating tooltip on hover when collapsed */}
                  {collapsed && (
                    <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-popover text-popover-foreground text-xs font-medium rounded-md shadow-lg border whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                      {item.label}
                    </div>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      {/* Collapse Toggle Footer */}
      <div className="p-3 border-t flex items-center justify-center shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className={cn(
            'flex items-center text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors',
            collapsed ? 'h-9 w-9 p-0 justify-center' : 'w-full gap-2 justify-start px-3'
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 shrink-0" />
              <span>Collapse Sidebar</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
