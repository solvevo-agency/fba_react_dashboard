import { useState, useEffect, useCallback } from 'react';
import {
  Mail,
  Download,
  CheckCircle2,
  MessageSquare,
  Users,
  Eye,
  Trash2,
  AlertTriangle,
  Calendar,
  Search,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  inquiryApi,
  type ContactInquiryItem,
  type NewsletterSubscriberItem,
  type InquiryMetrics,
} from '@/services/inquiryApi';
import { getApiErrorMessage } from '@/services/api';

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<ContactInquiryItem[]>([]);
  const [newsletters, setNewsletters] = useState<NewsletterSubscriberItem[]>([]);
  const [metrics, setMetrics] = useState<InquiryMetrics>({
    total_inquiries: 0,
    pending_inquiries: 0,
    responded_inquiries: 0,
    newsletter_subscribers: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'inquiries' | 'newsletter'>('inquiries');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected inquiry for view modal
  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiryItem | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Delete modals
  const [inquiryToDelete, setInquiryToDelete] = useState<ContactInquiryItem | null>(null);
  const [subscriberToDelete, setSubscriberToDelete] = useState<NewsletterSubscriberItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load inquiries, newsletters, and metrics from backend
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [metricsData, inquiriesData, newslettersData] = await Promise.all([
        inquiryApi.getMetrics(),
        inquiryApi.getAllInquiries(searchQuery),
        inquiryApi.getAllNewsletters(searchQuery),
      ]);
      setMetrics(metricsData);
      setInquiries(inquiriesData);
      setNewsletters(newslettersData);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load inquiries and subscribers'));
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Mark inquiry as responded
  const handleMarkResponded = async (id: number) => {
    try {
      setIsUpdatingStatus(true);
      const updated = await inquiryApi.updateInquiryStatus(id, 1);

      setInquiries((prev) =>
        prev.map((inq) => (inq.id === id ? updated : inq))
      );

      if (selectedInquiry?.id === id) {
        setSelectedInquiry(updated);
      }

      // Refresh metrics
      const updatedMetrics = await inquiryApi.getMetrics();
      setMetrics(updatedMetrics);

      toast.success('Inquiry marked as responded');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to update inquiry status'));
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Delete Contact Inquiry
  const handleConfirmDeleteInquiry = async () => {
    if (!inquiryToDelete) return;
    const targetId = inquiryToDelete.id;

    try {
      setIsDeleting(true);
      await inquiryApi.deleteInquiry(targetId);

      setInquiries((prev) => prev.filter((inq) => inq.id !== targetId));

      if (selectedInquiry?.id === targetId) {
        setSelectedInquiry(null);
      }

      // Refresh metrics
      const updatedMetrics = await inquiryApi.getMetrics();
      setMetrics(updatedMetrics);

      toast.success('Contact inquiry deleted successfully');
      setInquiryToDelete(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to delete inquiry'));
    } finally {
      setIsDeleting(false);
    }
  };

  // Delete Newsletter Subscriber
  const handleConfirmDeleteSubscriber = async () => {
    if (!subscriberToDelete) return;
    const targetId = subscriberToDelete.id;

    try {
      setIsDeleting(true);
      await inquiryApi.deleteNewsletter(targetId);

      setNewsletters((prev) => prev.filter((sub) => sub.id !== targetId));

      // Refresh metrics
      const updatedMetrics = await inquiryApi.getMetrics();
      setMetrics(updatedMetrics);

      toast.success('Newsletter subscriber removed');
      setSubscriberToDelete(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to remove subscriber'));
    } finally {
      setIsDeleting(false);
    }
  };

  // Export Newsletter Subscribers to CSV
  const handleExportCsv = () => {
    if (newsletters.length === 0) {
      toast.info('No newsletter subscribers to export');
      return;
    }

    const headers = ['ID', 'Email', 'Joined Date', 'Status'];
    const rows = newsletters.map((sub) => [
      sub.id,
      `"${sub.email}"`,
      sub.date,
      sub.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `fba_newsletter_subscribers_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${newsletters.length} newsletter subscribers to CSV`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Mail className="h-6 w-6 text-primary shrink-0" />
            Contacts & Newsletter
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Manage incoming contact messages, lead requests, and newsletter subscribers
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

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="border shadow-xs">
          <CardHeader className="p-4 pb-1">
            <CardDescription className="text-xs font-medium">Total Inquiries</CardDescription>
            <CardTitle className="text-2xl font-bold">{metrics.total_inquiries}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-primary" />
              Incoming inquiries from contact forms
            </p>
          </CardContent>
        </Card>

        <Card className="border shadow-xs">
          <CardHeader className="p-4 pb-1">
            <CardDescription className="text-xs font-medium">Pending Response</CardDescription>
            <CardTitle className="text-2xl font-bold text-amber-500">
              {metrics.pending_inquiries}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
              Awaiting admin reply
            </p>
          </CardContent>
        </Card>

        <Card className="border shadow-xs">
          <CardHeader className="p-4 pb-1">
            <CardDescription className="text-xs font-medium">Newsletter Audience</CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {metrics.newsletter_subscribers}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              Subscribers receiving course updates
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs System: TabsList placed OUTSIDE TabsContent so tabs NEVER vanish */}
      <Tabs
        defaultValue="inquiries"
        value={activeTab}
        onValueChange={(val) => {
          setActiveTab(val as 'inquiries' | 'newsletter');
        }}
        className="space-y-4"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <TabsList className="bg-muted p-1">
            <TabsTrigger value="inquiries" className="text-xs gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" /> Contacts ({metrics.total_inquiries})
            </TabsTrigger>
            <TabsTrigger value="newsletter" className="text-xs gap-1.5">
              <Users className="h-3.5 w-3.5" /> Newsletter ({metrics.newsletter_subscribers})
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder={
                  activeTab === 'inquiries'
                    ? 'Search by name, email, phone...'
                    : 'Search subscriber email...'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-xs h-9 placeholder:text-xs"
              />
            </div>

            {activeTab === 'newsletter' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCsv}
                className="gap-1.5 text-xs h-9 shrink-0"
                title="Download CSV of all subscribers"
              >
                <Download className="h-3.5 w-3.5" />
                Export CSV
              </Button>
            )}
          </div>
        </div>

        {/* Tab 1: Contacts / Inquiries */}
        <TabsContent value="inquiries" className="space-y-4 m-0">
          <Card className="border shadow-xs overflow-hidden">
            <div className="overflow-x-auto w-full">
              <Table className="min-w-[750px] w-full text-xs">
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead className="min-w-[240px] whitespace-nowrap text-xs font-semibold">
                      Name & Email
                    </TableHead>
                    <TableHead className="min-w-[180px] whitespace-nowrap text-xs font-semibold">
                      Contact / Phone Number
                    </TableHead>
                    <TableHead className="min-w-[130px] whitespace-nowrap text-xs font-semibold">
                      Date
                    </TableHead>
                    <TableHead className="min-w-[110px] whitespace-nowrap text-xs font-semibold">
                      Status
                    </TableHead>
                    <TableHead className="w-[120px] min-w-[120px] whitespace-nowrap text-xs font-semibold text-right">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center text-xs text-muted-foreground">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary mb-2" />
                        Loading contact messages...
                      </TableCell>
                    </TableRow>
                  ) : inquiries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-28 text-center text-xs text-muted-foreground">
                        No contact inquiries match your query.
                      </TableCell>
                    </TableRow>
                  ) : (
                    inquiries.map((inq) => (
                      <TableRow key={inq.id} className="hover:bg-muted/30 transition-colors">
                        {/* Name & Email */}
                        <TableCell className="whitespace-nowrap">
                          <div className="space-y-0.5">
                            <span className="font-semibold text-foreground text-xs block">
                              {inq.name}
                            </span>
                            <span className="text-[11px] text-muted-foreground font-mono block">
                              {inq.email}
                            </span>
                          </div>
                        </TableCell>

                        {/* Phone */}
                        <TableCell className="whitespace-nowrap text-xs font-mono text-muted-foreground">
                          {inq.phone}
                        </TableCell>

                        {/* Date */}
                        <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                          {inq.created_at}
                        </TableCell>

                        {/* Status */}
                        <TableCell className="whitespace-nowrap">
                          {inq.status === 'new' ? (
                            <Badge
                              variant="outline"
                              className="bg-primary/10 text-primary border-primary/20 text-[11px] font-medium pointer-events-none"
                            >
                              New
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[11px] font-medium gap-1 pointer-events-none"
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              Responded
                            </Badge>
                          )}
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedInquiry(inq)}
                              className="h-8 px-2.5 text-xs gap-1.5 text-foreground hover:bg-muted"
                              title="View message details"
                            >
                              <Eye className="h-3.5 w-3.5 text-primary" />
                              View
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setInquiryToDelete(inq)}
                              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                              title="Delete inquiry"
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
        </TabsContent>

        {/* Tab 2: Newsletter Subscribers */}
        <TabsContent value="newsletter" className="space-y-4 m-0">
          <Card className="border shadow-xs overflow-hidden">
            <div className="overflow-x-auto w-full">
              <Table className="min-w-[650px] w-full text-xs">
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead className="min-w-[260px] whitespace-nowrap text-xs font-semibold">
                      Subscribed Email
                    </TableHead>
                    <TableHead className="min-w-[140px] whitespace-nowrap text-xs font-semibold">
                      Joined Date
                    </TableHead>
                    <TableHead className="min-w-[120px] whitespace-nowrap text-xs font-semibold">
                      Status
                    </TableHead>
                    <TableHead className="w-[80px] min-w-[80px] whitespace-nowrap text-xs font-semibold text-right">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-32 text-center text-xs text-muted-foreground">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary mb-2" />
                        Loading subscribers...
                      </TableCell>
                    </TableRow>
                  ) : newsletters.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-28 text-center text-xs text-muted-foreground">
                        No newsletter subscribers found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    newsletters.map((sub) => (
                      <TableRow key={sub.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="text-xs font-mono font-medium text-foreground whitespace-nowrap">
                          {sub.email}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {sub.date}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <Badge
                            variant="outline"
                            className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[11px] font-medium pointer-events-none"
                          >
                            Subscribed
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSubscriberToDelete(sub)}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            title="Remove subscriber"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Inquiry Detail Modal */}
      <Dialog
        open={selectedInquiry !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedInquiry(null);
        }}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg flex items-center justify-between pr-6">
              <span>Contact Message Details</span>
              {selectedInquiry && (
                <Badge
                  variant="outline"
                  className={
                    selectedInquiry.status === 'new'
                      ? 'bg-primary/10 text-primary border-primary/20 text-xs'
                      : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs'
                  }
                >
                  {selectedInquiry.status === 'new' ? 'New Message' : 'Responded'}
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Complete submission received from website contact form
            </DialogDescription>
          </DialogHeader>

          {selectedInquiry && (
            <div className="space-y-4 py-2 text-xs">
              {/* Contact Information Card */}
              <div className="border rounded-xl p-3.5 bg-muted/30 space-y-2">
                <div className="flex justify-between items-center py-0.5 border-b pb-2">
                  <span className="text-muted-foreground">Full Name:</span>
                  <span className="font-bold text-foreground text-sm">{selectedInquiry.name}</span>
                </div>
                <div className="flex justify-between items-center py-0.5 border-b pb-2">
                  <span className="text-muted-foreground">Email Address:</span>
                  <span className="font-mono text-foreground">{selectedInquiry.email}</span>
                </div>
                <div className="flex justify-between items-center py-0.5 border-b pb-2">
                  <span className="text-muted-foreground">Phone / Contact:</span>
                  <span className="font-mono text-foreground">{selectedInquiry.phone}</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-muted-foreground">Submission Date:</span>
                  <span className="text-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    {selectedInquiry.created_at}
                  </span>
                </div>
              </div>

              {/* Inquiry Subject & Full Message */}
              <div className="border rounded-xl p-4 bg-background space-y-2">
                <div className="border-b pb-2">
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                    Subject Line:
                  </span>
                  <h4 className="font-bold text-sm text-foreground mt-0.5">
                    {selectedInquiry.subject}
                  </h4>
                </div>

                <div className="pt-1 space-y-1">
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                    Message Body:
                  </span>
                  <p className="text-xs leading-relaxed text-foreground whitespace-pre-line bg-muted/20 p-3 rounded-lg border">
                    {selectedInquiry.message}
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 pt-2">
            {selectedInquiry && selectedInquiry.status === 'new' && (
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={() => handleMarkResponded(selectedInquiry.id)}
                disabled={isUpdatingStatus}
                className="h-9 text-xs font-medium gap-1.5"
              >
                {isUpdatingStatus && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <CheckCircle2 className="h-3.5 w-3.5" />
                Mark as Responded
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSelectedInquiry(null)}
              className="h-9 text-xs"
            >
              Close
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => {
                if (selectedInquiry) {
                  setInquiryToDelete(selectedInquiry);
                }
              }}
              className="h-9 text-xs font-medium gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Inquiry Confirmation Modal */}
      <Dialog
        open={inquiryToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setInquiryToDelete(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Delete Contact Inquiry
            </DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to permanently delete this contact submission? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {inquiryToDelete && (
            <div className="border rounded-lg p-3 bg-muted/20 space-y-1.5 my-2 text-xs">
              <p className="font-semibold text-foreground">From: {inquiryToDelete.name}</p>
              <p className="text-[11px] text-muted-foreground">{inquiryToDelete.email}</p>
              <p className="text-[11px] text-muted-foreground line-clamp-2 italic pt-1 border-t">
                &ldquo;{inquiryToDelete.subject}&rdquo;
              </p>
            </div>
          )}

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setInquiryToDelete(null)}
              disabled={isDeleting}
              className="h-9 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleConfirmDeleteInquiry}
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

      {/* Delete Newsletter Subscriber Modal */}
      <Dialog
        open={subscriberToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setSubscriberToDelete(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Remove Newsletter Subscriber
            </DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to remove this email address from the newsletter audience?
            </DialogDescription>
          </DialogHeader>

          {subscriberToDelete && (
            <div className="border rounded-lg p-3 bg-muted/20 space-y-1 my-2 text-xs">
              <p className="font-mono font-semibold text-foreground">{subscriberToDelete.email}</p>
              <p className="text-[11px] text-muted-foreground">Joined: {subscriberToDelete.date}</p>
            </div>
          )}

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSubscriberToDelete(null)}
              disabled={isDeleting}
              className="h-9 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleConfirmDeleteSubscriber}
              disabled={isDeleting}
              className="h-9 text-xs font-medium gap-1.5"
            >
              {isDeleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <Trash2 className="h-3.5 w-3.5" />
              Remove Subscriber
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
