import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Award,
  Search,
  Download,
  Eye,
  Trash2,
  Save,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { ImageUploadDropzone } from '@/components/ui/image-upload-dropzone';
import { toast } from 'sonner';
import {
  certificateApi,
  type CertificateItem,
  type CertificateMetadata,
  type CertificateMetrics,
} from '@/services/certificateApi';

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [metrics, setMetrics] = useState<CertificateMetrics>({
    total: 0,
    valid: 0,
    revoked: 0,
  });
  const [loading, setLoading] = useState(true);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'valid' | 'revoked'>('all');
  const [previewCert, setPreviewCert] = useState<CertificateItem | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  // Template Settings state: exactly 5 metadata fields
  const [templateSettings, setTemplateSettings] = useState<CertificateMetadata>({
    organization_name: '',
    assist_trainer_name: '',
    assist_trainer_cert_id: '',
    trainer_signature: '',
    watermark: '',
  });

  // Fetch certificate metadata, metrics, and certificates from backend
  const loadCertificates = useCallback(async (search = '', status = 'all') => {
    try {
      const data = await certificateApi.getAll(search, status);
      setCertificates(data || []);
    } catch {
      toast.error('Failed to load certificates from backend');
    }
  }, []);

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const [metaRes, metricsRes, certsRes] = await Promise.all([
        certificateApi.getMetadata().catch(() => null),
        certificateApi.getMetrics().catch(() => null),
        certificateApi.getAll().catch(() => []),
      ]);

      if (metaRes) {
        setTemplateSettings({
          id: metaRes.id,
          organization_name: metaRes.organization_name || '',
          assist_trainer_name: metaRes.assist_trainer_name || '',
          assist_trainer_cert_id: metaRes.assist_trainer_cert_id || '',
          trainer_signature: metaRes.trainer_signature || '',
          watermark: metaRes.watermark || '',
        });
      }

      if (metricsRes) {
        setMetrics(metricsRes);
      }

      setCertificates(certsRes || []);
    } catch {
      toast.error('Failed to load certificate registry data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Handle live search / filter with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      loadCertificates(searchQuery, statusFilter);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter, loadCertificates]);

  const handleToggleStatus = async (id: number) => {
    const targetCert = certificates.find((c) => c.id === id);
    if (!targetCert) return;

    const newStatus: 'valid' | 'revoked' = targetCert.status === 'valid' ? 'revoked' : 'valid';

    try {
      const updated = await certificateApi.updateStatus(id, newStatus);
      toast.success(
        newStatus === 'valid'
          ? `Certificate ${targetCert.cert_uid} re-verified in public registry`
          : `Certificate ${targetCert.cert_uid} revoked in public registry`
      );

      setCertificates((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updated } : c))
      );

      // Refresh metrics from backend
      const updatedMetrics = await certificateApi.getMetrics().catch(() => null);
      if (updatedMetrics) {
        setMetrics(updatedMetrics);
      }
    } catch {
      toast.error('Failed to update certificate status');
    }
  };

  const handleDeleteCert = async (id: number) => {
    const targetCert = certificates.find((c) => c.id === id);
    if (!targetCert) return;

    if (!confirm(`Are you sure you want to delete certificate ${targetCert.cert_uid}?`)) {
      return;
    }

    try {
      await certificateApi.delete(id);
      toast.success(`Certificate ${targetCert.cert_uid} deleted successfully`);
      setCertificates((prev) => prev.filter((c) => c.id !== id));

      const updatedMetrics = await certificateApi.getMetrics().catch(() => null);
      if (updatedMetrics) {
        setMetrics(updatedMetrics);
      }
    } catch {
      toast.error('Failed to delete certificate');
    }
  };

  const handleSaveTemplate = async () => {
    setSavingTemplate(true);
    try {
      const updated = await certificateApi.updateMetadata(templateSettings);
      setTemplateSettings(updated);
      toast.success('Certificate template headers, signatures & seal updated successfully');
    } catch {
      toast.error('Failed to save certificate template settings');
    } finally {
      setSavingTemplate(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!previewCert || !certificateRef.current) return;
    setIsDownloading(true);

    const safeName = (previewCert.applicant_name || 'Certificate')
      .trim()
      .replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${safeName}_Certificate.pdf`;

    try {
      // Ensure html2pdf is available
      const getHtml2Pdf = async () => {
        if ((window as any).html2pdf) return (window as any).html2pdf;
        return new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
          script.onload = () => resolve((window as any).html2pdf);
          script.onerror = reject;
          document.head.appendChild(script);
        });
      };

      const html2pdf = await getHtml2Pdf().catch(() => null);

      if (html2pdf) {
        const opt = {
          margin: [0.15, 0.15, 0.15, 0.15],
          filename,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, logging: false },
          jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' },
        };
        await html2pdf().set(opt).from(certificateRef.current).save();
        toast.success('Certificate downloaded successfully');
      } else {
        // Fallback: Landscape print dialog to save as PDF
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          const certHtml = certificateRef.current.outerHTML;
          printWindow.document.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>${previewCert.applicant_name} - Certificate</title>
                <style>
                  @page { size: landscape; margin: 10mm; }
                  * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                  body { margin: 0; padding: 0; font-family: sans-serif; background: transparent; }
                </style>
              </head>
              <body>
                ${certHtml}
                <script>
                  window.onload = function() {
                    window.focus();
                    window.print();
                    setTimeout(function() { window.close(); }, 500);
                  };
                </script>
              </body>
            </html>
          `);
          printWindow.document.close();
        }
      }
    } catch (err) {
      console.error('Download certificate error:', err);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleUploadAssetFile = async (file: File): Promise<string> => {
    const res = await certificateApi.uploadAsset(file);
    return res.url;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Award className="h-6 w-6 text-primary shrink-0" />
            RBT Training Certificates & Verification & Verification Registry
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Issue 40-hour RBT certificates, configure template metadata & signatures, and verify graduates
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadInitialData}
          disabled={loading}
          className="h-9 text-xs gap-1.5"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Registry
        </Button>
      </div>

      {/* Metrics Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="border shadow-xs">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs font-medium">Total Registered</CardDescription>
            <CardTitle className="text-2xl font-bold">{metrics.total}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5 text-primary" />
              Recorded in database
            </p>
          </CardContent>
        </Card>

        <Card className="border shadow-xs">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs font-medium">Verified Active</CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {metrics.valid}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-[11px] text-emerald-600/90 dark:text-emerald-400/90 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Valid for BACB exam applications
            </p>
          </CardContent>
        </Card>

        <Card className="border shadow-xs">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs font-medium">Revoked / Suspended</CardDescription>
            <CardTitle className="text-2xl font-bold text-destructive">
              {metrics.revoked}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
              Blocked from verification lookup
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="issued" className="space-y-4">
        <TabsList className="bg-muted p-1">
          <TabsTrigger value="issued" className="text-xs">
            Issued Registry ({certificates.length})
          </TabsTrigger>
          <TabsTrigger value="settings" className="text-xs">
            Template & Metadata Settings
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Issued Certificates */}
        <TabsContent value="issued" className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search by graduate, UID, BACB ID, or course..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs sm:text-sm placeholder:text-xs"
              />
            </div>

            <div className="w-44 shrink-0">
              <Select
                value={statusFilter}
                onValueChange={(val) => setStatusFilter(val as 'all' | 'valid' | 'revoked')}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">All Statuses</SelectItem>
                  <SelectItem value="valid" className="text-xs">Verified Active</SelectItem>
                  <SelectItem value="revoked" className="text-xs">Revoked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Horizontally scrollable responsive table */}
          <Card className="border shadow-xs overflow-hidden">
            <div className="overflow-x-auto w-full">
              <Table className="min-w-[1050px] w-full text-xs">
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-[170px] min-w-[170px] whitespace-nowrap text-xs font-semibold">
                      Certificate UID
                    </TableHead>
                    <TableHead className="min-w-[180px] whitespace-nowrap text-xs font-semibold">
                      Graduate Trainee
                    </TableHead>
                    <TableHead className="min-w-[140px] whitespace-nowrap text-xs font-semibold">
                      BACB Trainee ID
                    </TableHead>
                    <TableHead className="min-w-[260px] whitespace-nowrap text-xs font-semibold">
                      Course Program
                    </TableHead>
                    <TableHead className="min-w-[170px] whitespace-nowrap text-xs font-semibold">
                      Training Period
                    </TableHead>
                    <TableHead className="min-w-[180px] whitespace-nowrap text-xs font-semibold">
                      Supervising Trainer
                    </TableHead>
                    <TableHead className="min-w-[110px] whitespace-nowrap text-xs font-semibold">
                      Issue Date
                    </TableHead>
                    <TableHead className="min-w-[110px] whitespace-nowrap text-xs font-semibold">
                      Registry Status
                    </TableHead>
                    <TableHead className="w-[140px] min-w-[140px] whitespace-nowrap text-xs font-semibold text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="h-32 text-center text-muted-foreground text-xs">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          <span>Loading certificates from registry...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : certificates.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="h-32 text-center text-muted-foreground text-xs">
                        No certificates recorded in database.
                      </TableCell>
                    </TableRow>
                  ) : (
                    certificates.map((cert) => (
                      <TableRow key={cert.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-mono text-xs font-bold text-primary whitespace-nowrap">
                          {cert.cert_uid}
                        </TableCell>

                        <TableCell className="whitespace-nowrap font-medium text-foreground">
                          {cert.applicant_name}
                        </TableCell>

                        <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                          <span className="bg-muted px-2 py-0.5 rounded border text-[11px]">
                            {cert.applicant_bacb_id || 'N/A'}
                          </span>
                        </TableCell>

                        <TableCell className="whitespace-nowrap">
                          <span className="font-medium text-foreground line-clamp-1 max-w-[280px]" title={cert.course_title}>
                            {cert.course_title}
                          </span>
                        </TableCell>

                        <TableCell className="text-muted-foreground whitespace-nowrap text-[11px]">
                          <div>
                            <span className="font-semibold text-foreground">
                              {cert.training_time ? `${cert.training_time} hrs` : '40.0 hrs'}
                            </span>
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {cert.training_start && cert.training_end
                              ? `${cert.training_start} to ${cert.training_end}`
                              : cert.issue_date}
                          </div>
                        </TableCell>

                        <TableCell className="text-muted-foreground whitespace-nowrap text-xs">
                          <div className="font-medium text-foreground">
                            {cert.trainer_name || 'N/A'}
                          </div>
                          <div className="text-[10px] text-muted-foreground font-mono">
                            {cert.trainer_certification || ''}
                          </div>
                        </TableCell>

                        <TableCell className="text-muted-foreground whitespace-nowrap text-xs">
                          {cert.issue_date}
                        </TableCell>

                        <TableCell className="whitespace-nowrap">
                          {cert.status === 'valid' ? (
                            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-medium gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="text-[11px] font-medium gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              Revoked
                            </Badge>
                          )}
                        </TableCell>

                        <TableCell className="text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setPreviewCert(cert)}
                              className="h-8 px-2 text-xs gap-1"
                              title="View certificate dossier"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              View
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleToggleStatus(cert.id)}
                              className={`h-8 w-8 ${
                                cert.status === 'valid'
                                  ? 'text-muted-foreground hover:text-destructive'
                                  : 'text-muted-foreground hover:text-emerald-600'
                              }`}
                              title={cert.status === 'valid' ? 'Revoke certificate' : 'Reactivate certificate'}
                            >
                              {cert.status === 'valid' ? (
                                <RotateCcw className="h-3.5 w-3.5" />
                              ) : (
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              )}
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteCert(cert.id)}
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              title="Delete certificate permanently"
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

        {/* Tab 2: Template Settings (Metadata - 5 Fields Only) */}
        <TabsContent value="settings" className="space-y-5">
          <Card className="border shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Certificate Template Setup & Metadata
              </CardTitle>
              <CardDescription className="text-xs">
                Configure official organization name, assistant trainer name & certificate ID, responsible trainer signature, and certificate watermark seal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Text Information Fields (3 Fields) */}
              <div className="space-y-4">
                {/* Field 1: Organization Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="meta_org_name" className="text-xs font-semibold">
                    Organization Name (if applicable)
                  </Label>
                  <Input
                    id="meta_org_name"
                    placeholder="e.g. Futures Behavior Analysis"
                    value={templateSettings.organization_name || ''}
                    onChange={(e) =>
                      setTemplateSettings({ ...templateSettings, organization_name: e.target.value })
                    }
                    className="h-9 text-xs sm:text-sm placeholder:text-xs"
                  />
                </div>

                {/* Fields 2 & 3: Assistant Trainer Name & Certificate ID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="meta_assist_trainer_name" className="text-xs font-semibold">
                      Assistant Trainer Name
                    </Label>
                    <Input
                      id="meta_assist_trainer_name"
                      placeholder="e.g. Marcus Vance, MS"
                      value={templateSettings.assist_trainer_name || ''}
                      onChange={(e) =>
                        setTemplateSettings({ ...templateSettings, assist_trainer_name: e.target.value })
                      }
                      className="h-9 text-xs sm:text-sm placeholder:text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="meta_assist_trainer_cert_id" className="text-xs font-semibold">
                      Assistant Trainer Certificate ID
                    </Label>
                    <Input
                      id="meta_assist_trainer_cert_id"
                      placeholder="e.g. BCBA #1-15-20194"
                      value={templateSettings.assist_trainer_cert_id || ''}
                      onChange={(e) =>
                        setTemplateSettings({ ...templateSettings, assist_trainer_cert_id: e.target.value })
                      }
                      className="h-9 text-xs sm:text-sm placeholder:text-xs"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Responsible trainer name and certification # are auto-populated from each course&apos;s lead instructor.
                </p>
              </div>

              {/* Upload Fields (2 Fields: Signature and Watermark) */}
              <div className="border-t pt-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Field 4: Responsible Trainer Signature */}
                  <div className="space-y-2">
                    <ImageUploadDropzone
                      value={templateSettings.trainer_signature || ''}
                      onChange={(url) =>
                        setTemplateSettings({ ...templateSettings, trainer_signature: url })
                      }
                      onUploadFile={handleUploadAssetFile}
                      aspectRatio="wide"
                      label="Upload Trainer Signature"
                    />
                  </div>

                  {/* Field 5: Certificate Watermark */}
                  <div className="space-y-2">
                    <ImageUploadDropzone
                      value={templateSettings.watermark || ''}
                      onChange={(url) =>
                        setTemplateSettings({ ...templateSettings, watermark: url })
                      }
                      onUploadFile={handleUploadAssetFile}
                      aspectRatio="wide"
                      label="Upload Watermark Seal"
                    />
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-2 flex justify-end">
                <Button
                  onClick={handleSaveTemplate}
                  disabled={savingTemplate}
                  className="gap-2 font-medium h-9 text-xs sm:text-sm"
                >
                  {savingTemplate ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Metadata Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Official Certificate Preview Modal (Exact Client Design) */}
      <Dialog open={previewCert !== null} onOpenChange={() => setPreviewCert(null)}>
        <DialogContent className="max-w-4xl w-[96vw] max-h-[95vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="pb-3 border-b flex flex-row items-center justify-between">
            <div>
              <DialogTitle className="text-base sm:text-lg flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Certificate Preview & Verification Record
              </DialogTitle>
              <DialogDescription className="text-xs">
                Official BACB 40-Hour Training Certificate issued for {previewCert?.applicant_name}
              </DialogDescription>
            </div>
            <Badge
              className={
                previewCert?.status === 'valid'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs'
                  : 'bg-destructive/10 text-destructive border border-destructive/20 text-xs'
              }
            >
              {previewCert?.status === 'valid' ? 'VERIFIED & ACTIVE' : 'REVOKED'}
            </Badge>
          </DialogHeader>

          {previewCert && (
            <div className="py-2">
              {/* Outer certificate frame with rich gradient border matching image */}
              <div
                ref={certificateRef}
                className="w-full rounded-lg p-4 sm:p-6 shadow-xl"
                style={{
                  background: 'linear-gradient(135deg, #741b07 0%, #a73215 50%, #581607 100%)',
                }}
              >
                {/* Inner white certificate sheet with double border */}
                <div className="relative bg-white text-zinc-900 border-4 border-double border-zinc-900 p-6 sm:p-10 rounded-sm overflow-hidden min-h-[460px] flex flex-col justify-between select-none">
                  {/* Watermark in center background */}
                  {previewCert.watermark || templateSettings.watermark ? (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                      <img
                        src={previewCert.watermark || templateSettings.watermark || ''}
                        alt="Watermark"
                        className="max-h-64 max-w-[280px] object-contain opacity-10"
                      />
                    </div>
                  ) : (
                    <div
                      className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 text-7xl sm:text-9xl font-black text-zinc-400/25 tracking-widest uppercase transform -rotate-12 select-none"
                      style={{ fontFamily: 'Arial, sans-serif' }}
                    >
                      EXAMPLE
                    </div>
                  )}

                  <div className="relative z-10 space-y-6">
                    {/* Header: Course Title Certificate */}
                    <div className="text-center pb-2">
                      <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-zinc-950 font-serif">
                        {previewCert.course_title.toLowerCase().includes('certificate')
                          ? previewCert.course_title
                          : `${previewCert.course_title} Certificate`}
                      </h1>
                    </div>

                    {/* Section 1: Applicant Information */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                      <div>
                        <div className="border-b-[1.5px] border-zinc-900 min-h-[28px] pb-1 flex items-end px-1">
                          <span className="text-sm sm:text-base font-bold text-zinc-950">
                            {previewCert.applicant_name}
                          </span>
                        </div>
                        <p className="text-[11px] font-semibold text-zinc-700 mt-1 flex items-center gap-1">
                          Name of RBT Applicant
                          <span className="inline-flex items-center justify-center h-3 w-3 rounded-full border border-zinc-500 text-[9px] text-zinc-600 font-bold leading-none">
                            i
                          </span>
                        </p>
                      </div>

                      <div>
                        <div className="border-b-[1.5px] border-zinc-900 min-h-[28px] pb-1 flex items-end px-1 font-mono">
                          <span className="text-sm sm:text-base font-bold text-zinc-950">
                            {previewCert.applicant_bacb_id || 'N/A'}
                          </span>
                        </div>
                        <p className="text-[11px] font-semibold text-zinc-700 mt-1 flex items-center gap-1">
                          RBT Applicant BACB ID:
                          <span className="inline-flex items-center justify-center h-3 w-3 rounded-full border border-zinc-500 text-[9px] text-zinc-600 font-bold leading-none">
                            i
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Section 2: Training Information */}
                    <div className="pt-2">
                      <h2 className="text-center text-sm sm:text-base font-bold text-zinc-950 mb-3 font-serif">
                        Training Information
                      </h2>
                      <div className="grid grid-cols-3 gap-4 text-center sm:text-left">
                        <div>
                          <div className="border-b-[1.5px] border-zinc-900 min-h-[28px] pb-1 flex items-end justify-center sm:justify-start px-1 font-mono text-xs sm:text-sm font-semibold text-zinc-900">
                            {previewCert.training_start || 'N/A'}
                          </div>
                          <p className="text-[10px] sm:text-[11px] font-semibold text-zinc-700 mt-1">
                            Training Start Date:
                          </p>
                        </div>

                        <div className="text-center">
                          <div className="border-b-[1.5px] border-zinc-900 min-h-[28px] pb-1 flex items-end justify-center px-1 font-mono text-xs sm:text-sm font-semibold text-zinc-900">
                            {previewCert.training_time_display || '40:00'}
                          </div>
                          <p className="text-[10px] sm:text-[11px] font-semibold text-zinc-700 mt-1 flex items-center justify-center gap-1">
                            Time to Complete:
                            <span className="inline-flex items-center justify-center h-3 w-3 rounded-full border border-zinc-500 text-[9px] text-zinc-600 font-bold leading-none">
                              i
                            </span>
                          </p>
                        </div>

                        <div>
                          <div className="border-b-[1.5px] border-zinc-900 min-h-[28px] pb-1 flex items-end justify-center sm:justify-start px-1 font-mono text-xs sm:text-sm font-semibold text-zinc-900">
                            {previewCert.training_end || 'N/A'}
                          </div>
                          <p className="text-[10px] sm:text-[11px] font-semibold text-zinc-700 mt-1">
                            Training End Date:
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Trainer Information */}
                    <div className="pt-2">
                      <h2 className="text-center text-sm sm:text-base font-bold text-zinc-950 mb-3 font-serif">
                        Trainer Information
                      </h2>

                      {/* Row 1: Responsible Trainer */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <div className="border-b-[1.5px] border-zinc-900 min-h-[30px] pb-1 flex items-end px-1 text-xs sm:text-sm font-semibold text-zinc-950">
                            {previewCert.trainer_name || 'Dr. Jennifer Adams, BCBA-D'}
                          </div>
                          <p className="text-[10px] sm:text-[11px] font-semibold text-zinc-700 mt-1">
                            Responsible Trainer Name:
                          </p>
                        </div>

                        <div>
                          <div className="border-b-[1.5px] border-zinc-900 min-h-[30px] pb-1 flex items-end px-1 font-mono text-xs sm:text-sm font-semibold text-zinc-950">
                            {previewCert.trainer_certification || 'BCBA-D #1-12-11894'}
                          </div>
                          <p className="text-[10px] sm:text-[11px] font-semibold text-zinc-700 mt-1">
                            Responsible Trainer Certification #:
                          </p>
                        </div>

                        <div>
                          <div className="border-b-[1.5px] border-zinc-900 min-h-[30px] pb-1 flex items-end justify-center px-1">
                            {previewCert.trainer_signature || templateSettings.trainer_signature ? (
                              <img
                                src={previewCert.trainer_signature || templateSettings.trainer_signature || ''}
                                alt="Signature"
                                className="max-h-8 max-w-[130px] object-contain"
                              />
                            ) : (
                              <span className="text-[11px] font-serif italic text-zinc-500">
                                Official Digital Signature
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] sm:text-[11px] font-semibold text-zinc-700 mt-1">
                            Responsible Trainer Signature:
                          </p>
                        </div>
                      </div>

                      {/* Row 2: Assistant & Organization */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
                        <div>
                          <div className="border-b-[1.5px] border-zinc-900 min-h-[28px] pb-1 flex items-end px-1 text-xs sm:text-sm text-zinc-900">
                            {[
                              previewCert.assist_trainer_name || templateSettings.assist_trainer_name,
                              previewCert.assist_trainer_cert_id || templateSettings.assist_trainer_cert_id,
                            ]
                              .filter(Boolean)
                              .join(', ')}
                          </div>
                          <p className="text-[10px] sm:text-[11px] font-semibold text-zinc-700 mt-1">
                            Assistant Trainer(s) Names and Certification Numbers (if applicable):
                          </p>
                        </div>

                        <div>
                          <div className="border-b-[1.5px] border-zinc-900 min-h-[28px] pb-1 flex items-end px-1 text-xs sm:text-sm font-medium text-zinc-900">
                            {previewCert.organization_name || templateSettings.organization_name || 'Futures Behavior Analysis'}
                          </div>
                          <p className="text-[10px] sm:text-[11px] font-semibold text-zinc-700 mt-1">
                            Organization Name (if applicable):
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Disclaimer Footer */}
                    <div className="pt-4 text-center text-[10px] sm:text-[12px] text-zinc-600 leading-tight">
                      <p>
                       This training program is designed to meet the 2026 training eligibility requirement for RBT certification.
                      </p>
                      <p> The training is offered independent of the BACB.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 pt-2 border-t mt-2">
            <Button variant="outline" size="sm" onClick={() => setPreviewCert(null)} className="h-9 text-xs">
              Close Preview
            </Button>
            <Button
              size="sm"
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="gap-1.5 h-9 text-xs font-medium"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="h-3.5 w-3.5" />
                  Download
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
