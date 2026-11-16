import { useEffect, useState, useCallback } from 'react';
import {
  Bell,
  CheckCheck,
  CreditCard,
  GraduationCap,
  Award,
  Sparkles,
  Clock,
  Trash2,
  MessageSquare,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { notificationApi, type NotificationItem } from '@/services/notificationApi';
import { getSocket } from '@/services/socket';

const formatTimeAgo = (dateStr: string): string => {
  try {
    const diff = Math.max(0, Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000));
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(dateStr).toLocaleDateString();
  } catch {
    return 'Recently';
  }
};

export function NotificationPopover() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await notificationApi.getAll('all', 1, 30);
      setNotifications(res.data || []);
      setUnreadCount(res.meta?.unread_count ?? 0);
    } catch {
      // Graceful fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    // Connect to Socket.io for instant real-time notifications
    const socket = getSocket();
    socket.emit('join_admin');

    const handleNewNotification = (newNotif: NotificationItem) => {
      setNotifications((prev) => [newNotif, ...prev.filter((n) => n.id !== newNotif.id)]);
      setUnreadCount((prev) => prev + 1);
      toast.info(newNotif.title, {
        description: newNotif.message,
      });
    };

    const handleUnreadCountUpdated = ({ unread_count }: { unread_count: number }) => {
      setUnreadCount(unread_count);
    };

    const handleMarkedRead = ({ id, unread_count }: { id: number; unread_count: number }) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount(unread_count);
    };

    const handleAllMarkedRead = () => {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    };

    const handleDeleted = ({ id, unread_count }: { id: number; unread_count: number }) => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setUnreadCount(unread_count);
    };

    const handleCleared = () => {
      setNotifications([]);
      setUnreadCount(0);
    };

    socket.on('new_notification', handleNewNotification);
    socket.on('unread_count_updated', handleUnreadCountUpdated);
    socket.on('notification_marked_read', handleMarkedRead);
    socket.on('all_notifications_marked_read', handleAllMarkedRead);
    socket.on('notification_deleted', handleDeleted);
    socket.on('all_notifications_cleared', handleCleared);

    return () => {
      socket.off('new_notification', handleNewNotification);
      socket.off('unread_count_updated', handleUnreadCountUpdated);
      socket.off('notification_marked_read', handleMarkedRead);
      socket.off('all_notifications_marked_read', handleAllMarkedRead);
      socket.off('notification_deleted', handleDeleted);
      socket.off('all_notifications_cleared', handleCleared);
    };
  }, [fetchNotifications]);

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((item) => ({ ...item, is_read: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    }
  };

  const handleItemClick = async (item: NotificationItem) => {
    // If unread, mark it as read immediately
    if (!item.is_read) {
      try {
        await notificationApi.markAsRead(item.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, is_read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch {
        // Continue navigation regardless
      }
    }

    // Navigate to related resource if action_url exists
    if (item.action_url) {
      setOpen(false);
      navigate(item.action_url);
    }
  };

  const handleDeleteItem = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    try {
      await notificationApi.delete(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch {
      toast.error('Failed to delete notification');
    }
  };

  const handleClearAll = async () => {
    try {
      await notificationApi.clearAll();
      setNotifications([]);
      setUnreadCount(0);
      toast.info('All notifications cleared');
    } catch {
      toast.error('Failed to clear notifications');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'user_registered':
      case 'enrollment':
        return <GraduationCap className="h-4 w-4 text-primary" />;
      case 'course_enrolled':
      case 'payment':
      case 'subscription_alert':
        return <CreditCard className="h-4 w-4 text-emerald-500" />;
      case 'quiz_result':
      case 'quiz':
        return <Award className="h-4 w-4 text-amber-500" />;
      case 'certificate_issued':
      case 'certificate':
        return <Sparkles className="h-4 w-4 text-indigo-500" />;
      case 'community_post':
      case 'thread_reply':
      case 'thread_upvote':
        return <MessageSquare className="h-4 w-4 text-sky-500" />;
      case 'system_update':
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
        className="w-[360px] sm:w-[420px] p-0 shadow-lg border bg-popover"
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
                title="Clear all notifications"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Notification Items List */}
        <div className="max-h-[380px] overflow-y-auto divide-y divide-border/60">
          {loading && notifications.length === 0 ? (
            <div className="p-8 text-center flex items-center justify-center gap-2 text-muted-foreground text-xs">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span>Loading notifications...</span>
            </div>
          ) : notifications.length === 0 ? (
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
                onClick={() => handleItemClick(item)}
                className={`group flex items-start gap-3 p-3.5 cursor-pointer transition-colors hover:bg-muted/50 ${
                  !item.is_read ? 'bg-primary/[0.04]' : ''
                }`}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted/80 ring-1 ring-border/50 mt-0.5">
                  {getNotificationIcon(item.type)}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={`text-xs font-semibold truncate ${
                        !item.is_read ? 'text-foreground font-bold' : 'text-foreground/90'
                      }`}
                    >
                      {item.title}
                    </p>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {formatTimeAgo(item.created_at)}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {item.message}
                  </p>

                  {item.action_url && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-primary/80 group-hover:text-primary font-medium mt-0.5">
                      View details <ExternalLink className="h-2.5 w-2.5" />
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0 self-center">
                  {!item.is_read && (
                    <span
                      className="h-2 w-2 rounded-full bg-primary"
                      title="Unread"
                    />
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleDeleteItem(e, item.id)}
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                    title="Delete notification"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
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
                Real-time alerts via Socket.IO • Click item to view details
              </span>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
