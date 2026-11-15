import { useState, useEffect, useCallback } from 'react';
import {
  CreditCard,
  Search,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  paymentApi,
  type PaymentListItem,
  type PaymentMetrics,
} from '@/services/paymentApi';
import { getApiErrorMessage } from '@/services/api';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentListItem[]>([]);
  const [metrics, setMetrics] = useState<PaymentMetrics>({
    total_gross_revenue: 0,
    monthly_revenue: 0,
    completed_invoices: 0,
    failed_invoices: 0,
    total_transactions: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Delete modal state
  const [paymentToDelete, setPaymentToDelete] = useState<PaymentListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load payments & metrics from backend API
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [metricsData, paymentsData] = await Promise.all([
        paymentApi.getMetrics(),
        paymentApi.getAll(searchQuery),
      ]);
      setMetrics(metricsData);
      setPayments(paymentsData);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load payments'));
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Confirm delete transaction
  const handleConfirmDelete = async () => {
    if (!paymentToDelete) return;

    try {
      setIsDeleting(true);
      await paymentApi.delete(paymentToDelete.id);
      setPayments((prev) => prev.filter((p) => p.id !== paymentToDelete.id));

      // Refresh metrics
      const updatedMetrics = await paymentApi.getMetrics();
      setMetrics(updatedMetrics);

      toast.success('Payment transaction record deleted');
      setPaymentToDelete(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to delete transaction'));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-primary" />
            Payments & Stripe Billing Engine
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Monitor real-time Stripe checkout transactions, customer invoices, and billing history
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadData}
          disabled={isLoading}
          className="h-8 text-xs gap-1.5 self-end sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 border shadow-xs">
          <span className="text-xs text-muted-foreground font-medium">Total Gross Revenue</span>
          <p className="text-xl font-bold mt-1 text-foreground">
            ${metrics.total_gross_revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </Card>
        <Card className="p-4 border shadow-xs">
          <span className="text-xs text-muted-foreground font-medium">Monthly Revenue (30d)</span>
          <p className="text-xl font-bold mt-1 text-emerald-600">
            +${metrics.monthly_revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </Card>
        <Card className="p-4 border shadow-xs">
          <span className="text-xs text-muted-foreground font-medium">Successful Payments</span>
          <p className="text-xl font-bold mt-1 text-primary">{metrics.completed_invoices}</p>
        </Card>
        <Card className="p-4 border shadow-xs">
          <span className="text-xs text-muted-foreground font-medium">Failed Transactions</span>
          <p className="text-xl font-bold mt-1 text-destructive">{metrics.failed_invoices ?? 0}</p>
        </Card>
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search invoice, student name, course..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8 text-xs h-9 placeholder:text-xs"
        />
      </div>

      {/* Table with Horizontal Scroll */}
      <Card className="border shadow-xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <Table className="min-w-[1050px] w-full text-xs">
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-[190px] min-w-[190px] whitespace-nowrap text-xs font-semibold">
                  Invoice & Transaction
                </TableHead>
                <TableHead className="min-w-[190px] whitespace-nowrap text-xs font-semibold">
                  Customer
                </TableHead>
                <TableHead className="min-w-[260px] whitespace-nowrap text-xs font-semibold">
                  Course Program
                </TableHead>
                <TableHead className="min-w-[130px] whitespace-nowrap text-xs font-semibold">
                  Amount
                </TableHead>
                <TableHead className="min-w-[160px] whitespace-nowrap text-xs font-semibold">
                  Payment Method
                </TableHead>
                <TableHead className="min-w-[160px] whitespace-nowrap text-xs font-semibold">
                  Date
                </TableHead>
                <TableHead className="min-w-[120px] whitespace-nowrap text-xs font-semibold">
                  Status
                </TableHead>
                <TableHead className="w-[80px] min-w-[80px] whitespace-nowrap text-xs font-semibold text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-xs text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary mb-2" />
                    Loading Stripe transaction records...
                  </TableCell>
                </TableRow>
              ) : payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-28 text-center text-xs text-muted-foreground">
                    No payment records match your search query.
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((payment) => {
                  const invoiceUrl =
                    payment.stripe_invoice_url ||
                    `https://dashboard.stripe.com/test/payments/${payment.stripe_payment_id}`;

                  return (
                    <TableRow key={payment.id} className="hover:bg-muted/30 transition-colors">
                      {/* Simple Invoice ID that navigates directly to invoice details */}
                      <TableCell className="whitespace-nowrap">
                        <a
                          href={invoiceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1 group"
                          title="Open invoice details in Stripe"
                        >
                          <span>{payment.invoice_id}</span>
                          <ExternalLink className="h-3 w-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                        </a>
                      </TableCell>

                      <TableCell className="whitespace-nowrap">
                        <div className="space-y-0.5">
                          <p className="text-xs font-semibold text-foreground">
                            {payment.student_name}
                          </p>
                          <p className="text-[11px] text-muted-foreground">{payment.student_email}</p>
                        </div>
                      </TableCell>

                      <TableCell className="whitespace-nowrap">
                        <p
                          className="text-xs text-foreground font-medium max-w-[250px] truncate"
                          title={payment.course_title}
                        >
                          {payment.course_title}
                        </p>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {payment.tier_name}
                        </span>
                      </TableCell>

                      <TableCell className="whitespace-nowrap">
                        <span className="text-xs font-bold font-mono text-foreground">
                          ${payment.amount.toFixed(2)}{' '}
                          <span className="text-[10px] font-normal text-muted-foreground">
                            {payment.currency}
                          </span>
                        </span>
                      </TableCell>

                      {/* Payment Method: Simple Stripe */}
                      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-medium text-foreground">Stripe</span>
                        </div>
                      </TableCell>

                      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                        {payment.date}
                      </TableCell>

                      {/* Only Succeeded or Failed status */}
                      <TableCell className="whitespace-nowrap">
                        {payment.status === 'succeeded' ? (
                          <Badge
                            variant="outline"
                            className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[11px] font-medium gap-1 pointer-events-none"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            Succeeded
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-destructive/10 text-destructive border-destructive/20 text-[11px] font-medium gap-1 pointer-events-none"
                          >
                            <AlertCircle className="h-3 w-3" />
                            Failed
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="text-right whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setPaymentToDelete(payment)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          title="Delete transaction record"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={paymentToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPaymentToDelete(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Delete Payment Transaction
            </DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to delete this payment record from the billing ledger?
            </DialogDescription>
          </DialogHeader>

          {paymentToDelete && (
            <div className="border rounded-lg p-3 bg-muted/20 space-y-1.5 my-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-foreground">
                  {paymentToDelete.student_name}
                </span>
                <span className="font-mono font-bold text-foreground">
                  ${paymentToDelete.amount.toFixed(2)} {paymentToDelete.currency}
                </span>
              </div>
              <p className="text-muted-foreground">{paymentToDelete.student_email}</p>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t font-mono">
                <span>{paymentToDelete.invoice_id}</span>
                <span>{paymentToDelete.date}</span>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPaymentToDelete(null)}
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
