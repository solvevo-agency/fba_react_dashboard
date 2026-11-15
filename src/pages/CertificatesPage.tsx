import { useState, useEffect, useCallback } from 'react';
import {
  Award,
  Search,
  Download,
  Eye,
  Trash2,
  Save,
  QrCode,
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
import { Textarea } from '@/components/ui/textarea';
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

  // Template Settings state loaded from backend certificate_metas
  const [templateSettings, setTemplateSettings] = useState<CertificateMetadata>({
    id: 0,
    header_top: '',
    header_middle: '',
    header_bottom: '',
    agency_name: '',
    provider_id: '',
    trainer_name: '',
    trainer_certification: '',
    assist_trainer_name: '',
    trainer_signature: '',
    watermark: '',
    footer: '',
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
        setTemplateSettings(metaRes);
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
            BACB Certificates & Verification Registry
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
                            {cert.trainer_name || templateSettings.trainer_name || 'N/A'}
                          </div>
                          <div className="text-[10px] text-muted-foreground font-mono">
                            {cert.trainer_certification || templateSettings.trainer_certification || ''}
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

        {/* Tab 2: Template Settings (Metadata) */}
        <TabsContent value="settings" className="space-y-5">
          <Card className="border shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                BACB Certificate Template Configuration (Metadata)
              </CardTitle>
              <CardDescription className="text-xs">
                Configure three-tier certificate headers, legal institute credentials, trainer credentials, digital signatures, and watermark seal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Section 1: Certificate Headers */}
              <div className="space-y-3">
                <div className="border-b pb-1.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    1. Three-Tier Certificate Headers
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="header_top" className="text-xs font-semibold">
                      Header: Top (Institution Banner)
                    </Label>
                    <Input
                      id="header_top"
                      placeholder="e.g. Future Behavior Analysis (FBA) Educational Institute"
                      value={templateSettings.header_top || ''}
                      onChange={(e) =>
                        setTemplateSettings({ ...templateSettings, header_top: e.target.value })
                      }
                      className="h-9 text-xs sm:text-sm placeholder:text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="header_middle" className="text-xs font-semibold">
                      Header: Middle (Program Title)
                    </Label>
                    <Input
                      id="header_middle"
                      placeholder="e.g. Registered Behavior Technician 40-Hour Training Program"
                      value={templateSettings.header_middle || ''}
                      onChange={(e) =>
                        setTemplateSettings({ ...templateSettings, header_middle: e.target.value })
                      }
                      className="h-9 text-xs sm:text-sm placeholder:text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="header_bottom" className="text-xs font-semibold">
                      Header: Bottom (Award Heading)
                    </Label>
                    <Input
                      id="header_bottom"
                      placeholder="e.g. Certificate of Professional Competency & Task List 2.0 Completion"
                      value={templateSettings.header_bottom || ''}
                      onChange={(e) =>
                        setTemplateSettings({ ...templateSettings, header_bottom: e.target.value })
                      }
                      className="h-9 text-xs sm:text-sm placeholder:text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Institution & Trainer Credentials */}
              <div className="space-y-3">
                <div className="border-b pb-1.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    2. Institutional & Trainer Credentials
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="agency_name" className="text-xs font-semibold">
                      Accredited Agency / Legal Institute Name
                    </Label>
                    <Input
                      id="agency_name"
                      placeholder="e.g. Future Behavior Analysis (FBA) Educational Institute"
                      value={templateSettings.agency_name || ''}
                      onChange={(e) =>
                        setTemplateSettings({ ...templateSettings, agency_name: e.target.value })
                      }
                      className="h-9 text-xs sm:text-sm placeholder:text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="provider_id" className="text-xs font-semibold">
                      BACB ACE Provider Identification #
                    </Label>
                    <Input
                      id="provider_id"
                      placeholder="e.g. BACB ACE Provider #OP-24-1189"
                      value={templateSettings.provider_id || ''}
                      onChange={(e) =>
                        setTemplateSettings({ ...templateSettings, provider_id: e.target.value })
                      }
                      className="h-9 text-xs sm:text-sm placeholder:text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="trainer_name" className="text-xs font-semibold">
                      Lead Supervising Instructor Name
                    </Label>
                    <Input
                      id="trainer_name"
                      placeholder="e.g. Dr. Jennifer Adams, BCBA-D"
                      value={templateSettings.trainer_name || ''}
                      onChange={(e) =>
                        setTemplateSettings({ ...templateSettings, trainer_name: e.target.value })
                      }
                      className="h-9 text-xs sm:text-sm placeholder:text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="trainer_cert" className="text-xs font-semibold">
                      Lead Trainer Certification Number
                    </Label>
                    <Input
                      id="trainer_cert"
                      placeholder="e.g. BCBA-D #1-12-11894"
                      value={templateSettings.trainer_certification || ''}
                      onChange={(e) =>
                        setTemplateSettings({
                          ...templateSettings,
                          trainer_certification: e.target.value,
                        })
                      }
                      className="h-9 text-xs sm:text-sm placeholder:text-xs"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="assist_trainer_name" className="text-xs font-semibold">
                      Assistant Trainer / Co-Instructor Name (Optional)
                    </Label>
                    <Input
                      id="assist_trainer_name"
                      placeholder="e.g. Marcus Vance, MS, BCBA"
                      value={templateSettings.assist_trainer_name || ''}
                      onChange={(e) =>
                        setTemplateSettings({
                          ...templateSettings,
                          assist_trainer_name: e.target.value,
                        })
                      }
                      className="h-9 text-xs sm:text-sm placeholder:text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Signature & Watermark Uploads */}
              <div className="space-y-3">
                <div className="border-b pb-1.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    3. Digital Signature & Watermark Seal
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <ImageUploadDropzone
                      value={templateSettings.trainer_signature || ''}
                      onChange={(url) =>
                        setTemplateSettings({ ...templateSettings, trainer_signature: url })
                      }
                      onUploadFile={handleUploadAssetFile}
                      aspectRatio="square"
                      label="Supervising Trainer Digital Signature"
                    />
                  </div>

                  <div className="space-y-2">
                    <ImageUploadDropzone
                      value={templateSettings.watermark || ''}
                      onChange={(url) =>
                        setTemplateSettings({ ...templateSettings, watermark: url })
                      }
                      onUploadFile={handleUploadAssetFile}
                      aspectRatio="square"
                      label="Official Institutional Seal / Watermark"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Footer Accreditation Legal Notice */}
              <div className="space-y-3">
                <div className="border-b pb-1.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    4. BACB Compliance Legal Footer
                  </h3>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cert_footer" className="text-xs font-semibold">
                    Accreditation & Curriculum Statement
                  </Label>
                  <Textarea
                    id="cert_footer"
                    rows={3}
                    placeholder="Enter compliance and task list disclaimer text..."
                    value={templateSettings.footer || ''}
                    onChange={(e) =>
                      setTemplateSettings({ ...templateSettings, footer: e.target.value })
                    }
                    className="text-xs placeholder:text-xs resize-none"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Printed at the bottom of all generated certificates in accordance with BACB requirements.
                  </p>
                </div>
              </div>

              {/* Section 5: Automated Public QR Code Registry Badge */}
              <div className="p-4 border rounded-xl bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-primary/10 text-primary shrink-0">
                    <QrCode className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">
                      Automated Public Verification QR Code
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      Each generated certificate embeds an encrypted QR code linking to:
                      <code className="ml-1 text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono">
                        /verify-certificate/:cert_uid
                      </code>
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs font-mono bg-background text-emerald-600 border-emerald-500/30">
                  Registry Engine Active
                </Badge>
              </div>

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
                  Save Template Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Certificate Verification Dossier Dialog (Preview Modal) */}
      <Dialog open={previewCert !== null} onOpenChange={() => setPreviewCert(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg flex items-center justify-between pr-6">
              <span>Certificate Verification Dossier</span>
              <Badge
                className={
                  previewCert?.status === 'valid'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs'
                    : 'bg-destructive/10 text-destructive border border-destructive/20 text-xs'
                }
              >
                {previewCert?.status === 'valid' ? 'VERIFIED & ACTIVE' : 'REVOKED'}
              </Badge>
            </DialogTitle>
            <DialogDescription className="text-xs">
              40-Hour BACB compliance certificate printable preview with embedded credentials
            </DialogDescription>
          </DialogHeader>

          {previewCert && (
            <div className="relative border-4 border-double border-primary/30 p-6 sm:p-8 rounded-xl bg-gradient-to-b from-background via-muted/10 to-muted/30 text-center space-y-5 overflow-hidden">
              {/* Watermark Background Crest if present */}
              {(previewCert.watermark || templateSettings.watermark) && (
                <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                  <img
                    src={previewCert.watermark || templateSettings.watermark || ''}
                    alt="Watermark"
                    className="w-64 h-64 object-contain"
                  />
                </div>
              )}

              {/* Three-Tier Headers */}
              <div className="space-y-1 relative z-10">
                {templateSettings.provider_id && (
                  <Badge variant="outline" className="font-mono text-[10px] tracking-widest uppercase">
                    {templateSettings.provider_id}
                  </Badge>
                )}
                <h3 className="text-base sm:text-lg font-bold tracking-tight text-foreground uppercase">
                  {previewCert.header_top || templateSettings.header_top || ''}
                </h3>
                <p className="text-xs font-semibold text-primary">
                  {previewCert.header_middle || templateSettings.header_middle || ''}
                </p>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider">
                  {previewCert.header_bottom || templateSettings.header_bottom || ''}
                </p>
              </div>

              <div className="pt-1 relative z-10">
                <p className="text-xs text-muted-foreground italic">This is proudly awarded to</p>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight my-1.5 underline decoration-primary decoration-2 underline-offset-4">
                  {previewCert.applicant_name}
                </h2>
                <p className="text-xs font-mono text-muted-foreground">
                  BACB Trainee ID: <span className="font-bold text-foreground">{previewCert.applicant_bacb_id || 'N/A'}</span>
                </p>
              </div>

              <div className="max-w-md mx-auto space-y-1 relative z-10">
                <p className="text-xs text-muted-foreground">
                  for successfully completing the required{' '}
                  <span className="font-bold text-foreground">
                    {previewCert.training_time || 40.0} instructional hours
                  </span>{' '}
                  and passing competency evaluations for:
                </p>
                <p className="font-bold text-sm text-primary pt-0.5">
                  {previewCert.course_title}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Training Conducted:{' '}
                  {previewCert.training_start && previewCert.training_end
                    ? `${previewCert.training_start} to ${previewCert.training_end}`
                    : previewCert.issue_date}
                </p>
              </div>

              {/* Signatures & Seal Section */}
              <div className="pt-4 grid grid-cols-2 gap-4 items-end border-t relative z-10">
                <div className="text-center space-y-1">
                  {(previewCert.trainer_signature || templateSettings.trainer_signature) && (
                    <div className="h-12 flex items-center justify-center">
                      <img
                        src={previewCert.trainer_signature || templateSettings.trainer_signature || ''}
                        alt="Trainer Signature"
                        className="max-h-12 object-contain"
                      />
                    </div>
                  )}
                  <div className="border-t border-muted-foreground/30 pt-1">
                    <p className="text-xs font-bold text-foreground">
                      {previewCert.trainer_name || templateSettings.trainer_name || 'Supervising Trainer'}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-mono">
                      {previewCert.trainer_certification || templateSettings.trainer_certification || ''}
                    </p>
                    <p className="text-[9px] text-muted-foreground">Lead Supervising BCBA</p>
                  </div>
                </div>

                <div className="text-center space-y-1 flex flex-col items-center">
                  <div className="p-1 rounded bg-background border shadow-xs inline-block">
                    <QrCode className="h-10 w-10 text-primary" />
                  </div>
                  <div className="pt-1">
                    <p className="text-[10px] font-mono font-bold text-foreground">
                      UID: {previewCert.cert_uid}
                    </p>
                    <p className="text-[9px] text-muted-foreground">Scan to verify accreditation</p>
                  </div>
                </div>
              </div>

              {/* Footer text */}
              <p className="text-[9px] text-muted-foreground pt-2 border-t leading-relaxed max-w-lg mx-auto relative z-10">
                {previewCert.footer || templateSettings.footer || ''}
              </p>
            </div>
          )}

          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setPreviewCert(null)} className="h-9 text-xs">
              Close
            </Button>
            <Button
              size="sm"
              onClick={() => toast.success(`Downloading PDF for ${previewCert?.cert_uid}...`)}
              className="gap-1.5 h-9 text-xs font-medium"
            >
              <Download className="h-3.5 w-3.5" />
              Download Official PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
