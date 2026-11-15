import { useState, useEffect, useCallback } from 'react';
import {
  Layers,
  Search,
  Trash2,
  CheckCircle2,
  RotateCcw,
  AlertTriangle,
  Ban,
  Clock,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  subscriptionApi,
  type SubscriptionListItem,
  type SubscriptionMetrics,
} from '@/services/subscriptionApi';
import { getApiErrorMessage } from '@/services/api';

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionListItem[]>([]);
  const [metrics, setMetrics] = useState<SubscriptionMetrics>({
    total_subscriptions: 0,
    active_passes: 0,
    lifetime_passes: 0,
    revoked_inactive: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'cancelled'>('all');

  // Status toggle confirmation modal
  const [subToToggleStatus, setSubToToggleStatus] = useState<SubscriptionListItem | null>(null);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);

  // Delete confirmation modal
  const [subToDelete, setSubToDelete] = useState<SubscriptionListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load subscriptions and metrics from backend API
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [metricsData, subsData] = await Promise.all([
        subscriptionApi.getMetrics(),
        subscriptionApi.getAll(searchQuery, statusFilter),
      ]);
      setMetrics(metricsData);
      setSubscriptions(subsData);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load subscriptions'));
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Confirm Suspend / Active toggle
  const handleConfirmStatusToggle = async () => {
    if (!subToToggleStatus) return;

    try {
      setIsStatusUpdating(true);
      const newStatusCode = subToToggleStatus.status === 'active' ? 3 : 1;
      const res = await subscriptionApi.updateStatus(subToToggleStatus.id, newStatusCode);

      const newStatus = newStatusCode === 1 ? 'active' : 'cancelled';
      setSubscriptions((prev) =>
        prev.map((s) =>
          s.id === subToToggleStatus.id ? { ...s, status: newStatus, status_code: newStatusCode } : s
        )
      );

      // Refresh metrics
      const updatedMetrics = await subscriptionApi.getMetrics();
      setMetrics(updatedMetrics);

      toast.success(res.message);
      setSubToToggleStatus(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to update subscription status'));
    } finally {
      setIsStatusUpdating(false);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!subToDelete) return;

    try {
      setIsDeleting(true);
      const targetId = subToDelete.id;
      await subscriptionApi.delete(targetId);

      setSubscriptions((prev) => prev.filter((s) => s.id !== targetId));

      // Refresh metrics
      const updatedMetrics = await subscriptionApi.getMetrics();
      setMetrics(updatedMetrics);

      toast.success('Subscription record deleted successfully');
      setSubToDelete(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to delete subscription'));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Layers className="h-6 w-6 text-primary shrink-0" />
            Subscriptions & Course Access Gate
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Manage student course enrollments, Stripe checkout billing, and manual access overrides
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={isLoading}
            className="h-8 text-xs gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border shadow-xs">
          <CardHeader className="p-4 pb-1">
            <CardDescription className="text-xs font-medium">Total Subscriptions</CardDescription>
            <CardTitle className="text-2xl font-bold">{metrics.total_subscriptions}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-primary" />
              Recorded platform enrollments
            </p>
          </CardContent>
        </Card>

        <Card className="border shadow-xs">
          <CardHeader className="p-4 pb-1">
            <CardDescription className="text-xs font-medium">Active Access Passes</CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {metrics.active_passes}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-[11px] text-emerald-600/90 dark:text-emerald-400/90 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Authorized student portals
            </p>
          </CardContent>
        </Card>

        <Card className="border shadow-xs">
          <CardHeader className="p-4 pb-1">
            <CardDescription className="text-xs font-medium">Lifetime Passes</CardDescription>
            <CardTitle className="text-2xl font-bold text-primary">
              {metrics.lifetime_passes}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-primary" />
              Never expiring access
            </p>
          </CardContent>
        </Card>

        <Card className="border shadow-xs">
          <CardHeader className="p-4 pb-1">
            <CardDescription className="text-xs font-medium">Revoked / Inactive</CardDescription>
            <CardTitle className="text-2xl font-bold text-destructive">
              {metrics.revoked_inactive}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
              Suspended or expired
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search by student, email, course, or tier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs h-9 placeholder:text-xs"
          />
        </div>

        <div className="w-44 shrink-0">
          <Select
            value={statusFilter}
            onValueChange={(val) => setStatusFilter(val as 'all' | 'active' | 'cancelled')}
          >
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">
                All Statuses
              </SelectItem>
              <SelectItem value="active" className="text-xs">
                Active Only
              </SelectItem>
              <SelectItem value="cancelled" className="text-xs">
                Revoked Only
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Subscriptions Table with Horizontal Scroll */}
      <Card className="border shadow-xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <Table className="min-w-[1050px] w-full text-xs">
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="min-w-[200px] whitespace-nowrap text-xs font-semibold">
                  Student Trainee
                </TableHead>
                <TableHead className="min-w-[260px] whitespace-nowrap text-xs font-semibold">
                  Course
                </TableHead>
                <TableHead className="min-w-[130px] whitespace-nowrap text-xs font-semibold">
                  Amount / Fee
                </TableHead>
                <TableHead className="min-w-[120px] whitespace-nowrap text-xs font-semibold">
                  Status
                </TableHead>
                <TableHead className="min-w-[130px] whitespace-nowrap text-xs font-semibold">
                  Start Date
                </TableHead>
                <TableHead className="min-w-[130px] whitespace-nowrap text-xs font-semibold">
                  Plan Tier
                </TableHead>
                <TableHead className="w-[120px] min-w-[120px] whitespace-nowrap text-xs font-semibold text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-xs text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary mb-2" />
                    Loading course subscription records...
                  </TableCell>
                </TableRow>
              ) : subscriptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-28 text-center text-xs text-muted-foreground">
                    No subscriptions match your search query or filter.
                  </TableCell>
                </TableRow>
              ) : (
                subscriptions.map((sub) => (
                  <TableRow key={sub.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="whitespace-nowrap">
                      <div className="space-y-0.5">
                        <p className="text-xs font-semibold text-foreground">{sub.student_name}</p>
                        <p className="text-[11px] text-muted-foreground">{sub.student_email}</p>
                      </div>
                    </TableCell>

                    <TableCell className="whitespace-nowrap">
                      <div className="space-y-1">
                        <p
                          className="text-xs font-medium text-foreground max-w-[260px] truncate"
                          title={sub.course_title}
                        >
                          {sub.course_title}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell className="whitespace-nowrap text-xs font-mono font-bold text-foreground">
                      {sub.price === 0 ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          Admin Free
                        </span>
                      ) : (
                        `$${sub.price.toFixed(2)}`
                      )}
                    </TableCell>

                    <TableCell className="whitespace-nowrap">
                      {sub.status === 'active' ? (
                        <Badge
                          variant="outline"
                          className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[11px] font-medium gap-1 pointer-events-none"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          Active
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-destructive/10 text-destructive border-destructive/20 text-[11px] font-medium gap-1 pointer-events-none"
                        >
                          <Ban className="h-3 w-3" />
                          Revoked
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {sub.start_date}
                    </TableCell>

                    <TableCell className="whitespace-nowrap text-xs font-mono text-muted-foreground">
                      <Badge variant="outline" className="text-[10px] bg-muted/30 pointer-events-none">
                        {sub.tier_name}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSubToToggleStatus(sub)}
                          className={`h-8 w-8 transition-colors ${
                            sub.status === 'active'
                              ? 'text-muted-foreground hover:text-destructive hover:bg-destructive/10'
                              : 'text-muted-foreground hover:text-emerald-600 hover:bg-emerald-500/10'
                          }`}
                          title={sub.status === 'active' ? 'Revoke course access' : 'Reactivate access'}
                        >
                          {sub.status === 'active' ? (
                            <Ban className="h-3.5 w-3.5" />
                          ) : (
                            <RotateCcw className="h-3.5 w-3.5" />
                          )}
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSubToDelete(sub)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          title="Delete subscription record"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Suspend / Reactivate Confirmation Modal */}
      <Dialog
        open={subToToggleStatus !== null}
        onOpenChange={(open) => {
          if (!open) setSubToToggleStatus(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle
              className={`text-base sm:text-lg flex items-center gap-2 ${
                subToToggleStatus?.status === 'active'
                  ? 'text-destructive'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {subToToggleStatus?.status === 'active' ? (
                <>
                  <Ban className="h-5 w-5" />
                  Revoke Course Access
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5" />
                  Reactivate Course Access
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {subToToggleStatus?.status === 'active'
                ? `Are you sure you want to revoke course access for ${subToToggleStatus?.student_name}? The student will no longer be able to open lessons or take quizzes in "${subToToggleStatus?.course_title}".`
                : `Are you sure you want to reactivate access for ${subToToggleStatus?.student_name}? The student will immediately regain access to "${subToToggleStatus?.course_title}".`}
            </DialogDescription>
          </DialogHeader>

          {subToToggleStatus && (
            <div className="border rounded-lg p-3 bg-muted/20 space-y-1.5 my-2 text-xs">
              <p className="font-semibold text-foreground">{subToToggleStatus.student_name}</p>
              <p className="text-muted-foreground">{subToToggleStatus.student_email}</p>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t">
                <span>Course: {subToToggleStatus.course_title}</span>
                <span className="font-mono">{subToToggleStatus.tier_name}</span>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSubToToggleStatus(null)}
              disabled={isStatusUpdating}
              className="h-9 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant={subToToggleStatus?.status === 'active' ? 'destructive' : 'default'}
              size="sm"
              onClick={handleConfirmStatusToggle}
              disabled={isStatusUpdating}
              className={`h-9 text-xs font-medium gap-1.5 ${
                subToToggleStatus?.status !== 'active'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : ''
              }`}
            >
              {isStatusUpdating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {subToToggleStatus?.status === 'active' ? 'Revoke Access' : 'Reactivate Access'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={subToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setSubToDelete(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Delete Subscription Record
            </DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to permanently delete this subscription record? The student will lose
              course access.
            </DialogDescription>
          </DialogHeader>

          {subToDelete && (
            <div className="border rounded-lg p-3 bg-muted/20 space-y-1.5 my-2 text-xs">
              <p className="font-semibold text-foreground">{subToDelete.student_name}</p>
              <p className="text-muted-foreground">{subToDelete.student_email}</p>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t">
                <span>Course: {subToDelete.course_title}</span>
                <span className="font-mono">{subToDelete.tier_name}</span>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSubToDelete(null)}
              disabled={isDeleting}
              className="h-9 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="h-9 text-xs font-medium gap-1.5"
            >
              {isDeleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <Trash2 className="h-3.5 w-3.5" />
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
