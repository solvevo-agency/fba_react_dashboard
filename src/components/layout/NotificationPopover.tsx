import { useState } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  CreditCard,
  GraduationCap,
  Award,
  Sparkles,
  Clock,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

export interface NotificationItem {
  id: string;
  type: 'enrollment' | 'payment' | 'quiz' | 'certificate' | 'system';
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'enrollment',
    title: 'New Student Enrolled',
    description: 'Sarah Jenkins registered and enrolled in 40-Hour RBT Training.',
    timestamp: '5 mins ago',
    isRead: false,
  },
  {
    id: 'notif-2',
    type: 'payment',
    title: 'Payment Received',
    description: 'Stripe processed a payment of $149.00 from Michael Scott.',
    timestamp: '22 mins ago',
    isRead: false,
  },
  {
    id: 'notif-3',
    type: 'quiz',
    title: 'Quiz Completed',
    description: 'Emily Blunt passed Assessment 3 (Verbal Operants) with 92%.',
    timestamp: '1 hour ago',
    isRead: false,
  },
  {
    id: 'notif-4',
    type: 'certificate',
    title: 'Certificate Issued',
    description: 'Official BACB certificate FBA-2026-0842 generated for David Miller.',
    timestamp: '3 hours ago',
    isRead: true,
  },
  {
    id: 'notif-5',
    type: 'system',
    title: 'System Automated Backup',
    description: 'Relational database schema backup completed successfully.',
    timestamp: '6 hours ago',
    isRead: true,
  },
];

export function NotificationPopover() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllAsRead = () => {
    if (unreadCount === 0) return;
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
    toast.success('All notifications marked as read');
  };

  const handleToggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isRead: !item.isRead } : item))
    );
  };

  const handleClearAll = () => {
    setNotifications([]);
    toast.info('Notifications cleared');
  };

  const getNotificationIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'enrollment':
        return <GraduationCap className="h-4 w-4 text-primary" />;
      case 'payment':
        return <CreditCard className="h-4 w-4 text-emerald-500" />;
      case 'quiz':
        return <Award className="h-4 w-4 text-amber-500" />;
      case 'certificate':
        return <Sparkles className="h-4 w-4 text-indigo-500" />;
      case 'system':
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:text-foreground"
          aria-label="View notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[360px] sm:w-[400px] p-0 shadow-lg border bg-popover"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/40">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold tracking-tight">Notifications</h4>
            {unreadCount > 0 ? (
              <Badge variant="default" className="text-[10px] px-1.5 py-0 h-4 rounded-full">
                {unreadCount} new
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 rounded-full">
                All read
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
                title="Mark all as read"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Mark read</span>
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClearAll}
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                title="Clear all"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Notification Items List */}
        <div className="max-h-[360px] overflow-y-auto divide-y divide-border/60">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <Bell className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="mt-2 text-sm font-medium text-foreground">No notifications</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                You are all caught up with your admin alerts.
              </p>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => handleToggleRead(item.id)}
                className={`flex items-start gap-3 p-3.5 cursor-pointer transition-colors hover:bg-muted/50 ${
                  !item.isRead ? 'bg-primary/[0.03]' : ''
                }`}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted/80 ring-1 ring-border/50 mt-0.5">
                  {getNotificationIcon(item.type)}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={`text-xs font-semibold truncate ${
                        !item.isRead ? 'text-foreground font-bold' : 'text-foreground/90'
                      }`}
                    >
                      {item.title}
                    </p>
                    <span className="text-[10px] text-muted-foreground shrink-0 flex items-center gap-1">
                      {item.timestamp}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {!item.isRead && (
                  <span
                    className="h-2 w-2 rounded-full bg-primary shrink-0 self-center"
                    title="Unread"
                  />
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <>
            <Separator />
            <div className="p-2 text-center bg-muted/20">
              <span className="text-[11px] text-muted-foreground flex items-center justify-center gap-1">
                <Check className="h-3 w-3 text-emerald-500" /> Click any item to toggle read state
              </span>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}

