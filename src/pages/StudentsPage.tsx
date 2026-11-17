import { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Search,
  Download,
  CheckCircle2,
  Ban,
  Eye,
  Trash2,
  AlertTriangle,
  GraduationCap,
  Calendar,
  Loader2,
  RefreshCw,
  Clock,
  BookOpen,
  Award,
  CheckCircle,
  XCircle,
  Hourglass,
  FileText,
  Layers,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  studentApi,
  type StudentListItem,
  type StudentMetrics,
  type StudentDetail,
} from '@/services/studentApi';
import { getApiErrorMessage } from '@/services/api';
import { resolveMediaUrl } from '@/components/ui/video-upload-dropzone';

export default function StudentsPage() {
  const [students, setStudents] = useState<StudentListItem[]>([]);
  const [metrics, setMetrics] = useState<StudentMetrics>({
    total_registered: 0,
    active_trainees: 0,
    graduated_students: 0,
    suspended_accounts: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | '1' | '2'>('all');

  // Dialog states
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<StudentDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const [studentToToggleStatus, setStudentToToggleStatus] = useState<StudentListItem | null>(null);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);

  const [studentToDelete, setStudentToDelete] = useState<StudentListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Fetch metrics & student list from backend API
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [metricsData, studentsData] = await Promise.all([
        studentApi.getMetrics(),
        studentApi.getAll(searchQuery, statusFilter),
      ]);
      setMetrics(metricsData);
      setStudents(studentsData);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load students'));
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Open Academic Dossier and fetch full details
  const handleOpenDossier = async (studentId: number) => {
    setSelectedStudentId(studentId);
    try {
      setIsLoadingDetail(true);
      const detail = await studentApi.getById(studentId);
      setSelectedStudentDetail(detail);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load academic dossier'));
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // Confirm Suspend / Reactivate action via modal
  const handleConfirmStatusToggle = async () => {
    if (!studentToToggleStatus) return;

    try {
      setIsStatusUpdating(true);
      const newStatus = studentToToggleStatus.status === 1 ? 2 : 1;
      const res = await studentApi.updateStatus(studentToToggleStatus.id, newStatus);

      setStudents((prev) =>
        prev.map((s) => (s.id === studentToToggleStatus.id ? { ...s, status: newStatus } : s))
      );

      // If viewing in modal, update there too
      if (selectedStudentDetail?.id === studentToToggleStatus.id) {
        setSelectedStudentDetail({ ...selectedStudentDetail, status: newStatus });
      }

      // Refresh metrics counts
      const updatedMetrics = await studentApi.getMetrics();
      setMetrics(updatedMetrics);

      toast.success(res.message);
      setStudentToToggleStatus(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to update account status'));
    } finally {
      setIsStatusUpdating(false);
    }
  };

  // Confirm Delete action via modal
  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;

    try {
      setIsDeleting(true);
      const targetId = studentToDelete.id;
      await studentApi.delete(targetId);

      setStudents((prev) => prev.filter((s) => s.id !== targetId));

      if (selectedStudentId === targetId) {
        setSelectedStudentId(null);
        setSelectedStudentDetail(null);
      }

      // Refresh metrics counts
      const updatedMetrics = await studentApi.getMetrics();
      setMetrics(updatedMetrics);

      toast.success(`Student account for ${studentToDelete.full_name} deleted`);
      setStudentToDelete(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to delete student account'));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportToWord = async () => {
    setIsExporting(true);
    try {
      // Fetch complete student records from backend
      const allData = await studentApi.getAll();
      const exportList = allData && allData.length > 0 ? allData : students;

      if (!exportList || exportList.length === 0) {
        toast.info('No student records available to export.');
        return;
      }

      const generatedDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      const rowsHtml = exportList
        .map(
          (s, idx) => `
        <tr>
          <td style="text-align: center;">${idx + 1}</td>
          <td><strong>${s.full_name}</strong></td>
          <td>${s.email}</td>
          <td>${s.phone || 'N/A'}</td>
          <td style="font-family: monospace;">${s.bacb_id || 'Not assigned'}</td>
          <td>${s.primary_course || 'Not enrolled'}</td>
          <td style="text-align: center; font-weight: bold; color: ${s.progress_percentage === 100 ? '#059669' : '#2563eb'};">
            ${s.has_bought_course ? `${s.progress_percentage}%` : '0%'}
          </td>
          <td style="text-align: center; font-weight: bold; color: ${s.status === 1 ? '#059669' : '#dc2626'};">
            ${s.status === 1 ? 'ACTIVE' : s.status === 2 ? 'SUSPENDED' : 'UNVERIFIED'}
          </td>
          <td style="text-align: center;">${s.created_at}</td>
          <td style="text-align: center;">${s.last_login_at}</td>
        </tr>`
        )
        .join('');

      const docContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset='utf-8'>
          <title>FBA Students Academic & Training Roster Report</title>
          <style>
            body {
              font-family: Calibri, 'Segoe UI', Arial, sans-serif;
              font-size: 11pt;
              color: #1f2937;
              margin: 24px;
            }
            .header {
              border-bottom: 3px double #741b07;
              padding-bottom: 12px;
              margin-bottom: 16px;
            }
            h1 {
              color: #741b07;
              font-size: 22pt;
              margin: 0 0 4px 0;
            }
            .subtitle {
              color: #4b5563;
              font-size: 12pt;
              margin: 0 0 8px 0;
            }
            .meta {
              font-size: 10pt;
              color: #6b7280;
            }
            .summary-box {
              background-color: #f9fafb;
              border: 1px solid #e5e7eb;
              border-radius: 6px;
              padding: 12px 16px;
              margin-bottom: 20px;
            }
            .summary-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 6px;
            }
            .summary-table td {
              padding: 6px 12px;
              border: none;
              font-size: 10.5pt;
            }
            table.data-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 16px;
              font-size: 9.5pt;
            }
            table.data-table th {
              background-color: #741b07;
              color: #ffffff;
              font-weight: bold;
              border: 1px solid #581607;
              padding: 8px 6px;
              text-align: left;
            }
            table.data-table td {
              border: 1px solid #e5e7eb;
              padding: 8px 6px;
              vertical-align: middle;
            }
            table.data-table tr:nth-child(even) {
              background-color: #f9fafb;
            }
            .footer {
              margin-top: 30px;
              padding-top: 10px;
              border-top: 1px solid #e5e7eb;
              font-size: 9pt;
              color: #9ca3af;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Futures Behavior Analysis (FBA)</h1>
            <p class="subtitle">Official Student Trainees & Compliance Roster Report</p>
            <p class="meta">Generated: ${generatedDate} | Total Records Exported: ${exportList.length}</p>
          </div>

          <div class="summary-box">
            <strong>Roster Summary Metrics:</strong>
            <table class="summary-table">
              <tr>
                <td><strong>Total Registered:</strong> ${metrics.total_registered}</td>
                <td><strong>Active Trainees:</strong> ${metrics.active_trainees}</td>
                <td><strong>Course Graduated:</strong> ${metrics.graduated_students}</td>
                <td><strong>Suspended Accounts:</strong> ${metrics.suspended_accounts}</td>
              </tr>
            </table>
          </div>

          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 30px; text-align: center;">#</th>
                <th>Student Full Name</th>
                <th>Email Address</th>
                <th>Phone Number</th>
                <th>BACB Account ID</th>
                <th>Enrolled Course Program</th>
                <th style="text-align: center;">Progress</th>
                <th style="text-align: center;">Status</th>
                <th style="text-align: center;">Registered</th>
                <th style="text-align: center;">Last Active</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <div class="footer">
            <p>Futures Behavior Analysis • 40-Hour RBT Training Curriculum Management System</p>
            <p>Confidential • For Super Admin & Compliance Auditing Use Only</p>
          </div>
        </body>
        </html>
      `;

      const blob = new Blob(['\ufeff' + docContent], {
        type: 'application/msword;charset=utf-8',
      });
      const url = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      const filename = `FBA_Students_Roster_Report_${new Date().toISOString().split('T')[0]}.doc`;

      downloadLink.href = url;
      downloadLink.download = filename;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(url);

      toast.success(`Exported ${exportList.length} student records to Word / Docs`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export students data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="h-6 w-6 text-primary shrink-0" />
            Students & User Management
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Monitor registered trainees, progress percentages, BACB IDs, and portal access
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border shadow-xs">
          <CardHeader className="p-4 pb-1">
            <CardDescription className="text-xs font-medium">Total Registered</CardDescription>
            <CardTitle className="text-2xl font-bold">{metrics.total_registered}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-primary" />
              Registered student accounts
            </p>
          </CardContent>
        </Card>

        <Card className="border shadow-xs">
          <CardHeader className="p-4 pb-1">
            <CardDescription className="text-xs font-medium">Active Trainees</CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {metrics.active_trainees}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-[11px] text-emerald-600/90 dark:text-emerald-400/90 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Portal access enabled
            </p>
          </CardContent>
        </Card>

        <Card className="border shadow-xs">
          <CardHeader className="p-4 pb-1">
            <CardDescription className="text-xs font-medium">Course Graduated</CardDescription>
            <CardTitle className="text-2xl font-bold text-primary">
              {metrics.graduated_students}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
              <GraduationCap className="h-3.5 w-3.5 text-primary" />
              100% curriculum completed
            </p>
          </CardContent>
        </Card>

        <Card className="border shadow-xs">
          <CardHeader className="p-4 pb-1">
            <CardDescription className="text-xs font-medium">Suspended Accounts</CardDescription>
            <CardTitle className="text-2xl font-bold text-destructive">
              {metrics.suspended_accounts}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
              Access temporarily blocked
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search by student name, email, BACB ID, or course..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs h-9 placeholder:text-xs"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="w-40 shrink-0">
            <Select
              value={statusFilter}
              onValueChange={(val) => setStatusFilter(val as 'all' | '1' | '2')}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">
                  All Trainees
                </SelectItem>
                <SelectItem value="1" className="text-xs">
                  Active Only
                </SelectItem>
                <SelectItem value="2" className="text-xs">
                  Suspended
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportToWord}
            disabled={isExporting}
            className="h-9 text-[10px] gap-1.5 shrink-0 bg-background hover:bg-muted"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-3.5 w-3.5 text-primary" />
                Export All Data
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Responsive Students Table with Horizontal Scroll */}
      <Card className="border shadow-xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <Table className="min-w-[1050px] w-full text-xs">
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="min-w-[220px] whitespace-nowrap text-xs font-semibold">
                  Student Trainee
                </TableHead>
                <TableHead className="min-w-[130px] whitespace-nowrap text-xs font-semibold">
                  BACB ID
                </TableHead>
                <TableHead className="min-w-[260px] whitespace-nowrap text-xs font-semibold">
                  Enrolled Course
                </TableHead>
                <TableHead className="min-w-[160px] whitespace-nowrap text-xs font-semibold">
                  Curriculum Progress
                </TableHead>
                <TableHead className="min-w-[110px] whitespace-nowrap text-xs font-semibold">
                  Status
                </TableHead>
                <TableHead className="min-w-[120px] whitespace-nowrap text-xs font-semibold">
                  Last Active
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
                    Loading registered student records...
                  </TableCell>
                </TableRow>
              ) : students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-28 text-center text-xs text-muted-foreground">
                    No students match your search criteria.
                  </TableCell>
                </TableRow>
              ) : (
                students.map((student) => (
                  <TableRow key={student.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 ring-1 ring-border">
                          {student.avatar && (
                            <AvatarImage src={resolveMediaUrl(student.avatar)} />
                          )}
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                            {student.first_name.charAt(0)}
                            {student.last_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-0.5 min-w-0">
                          <p className="font-semibold text-xs text-foreground">
                            {student.full_name}
                          </p>
                          <p className="text-[11px] text-muted-foreground">{student.email}</p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="whitespace-nowrap">
                      {student.bacb_id && student.bacb_id !== 'Not yet assigned' ? (
                        <Badge variant="outline" className="font-mono text-[10px] pointer-events-none">
                          {student.bacb_id}
                        </Badge>
                      ) : (
                        <span className="text-[11px] text-muted-foreground italic">Not yet</span>
                      )}
                    </TableCell>

                    <TableCell className="whitespace-nowrap">
                      {student.has_bought_course ? (
                        <p
                          className="text-xs font-medium text-foreground max-w-[260px] truncate"
                          title={student.primary_course}
                        >
                          {student.primary_course}
                        </p>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-[10px] text-muted-foreground bg-muted/40 font-normal pointer-events-none"
                        >
                          Not yet enrolled
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className="whitespace-nowrap">
                      {student.has_bought_course ? (
                        <div className="w-32 space-y-1">
                          <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
                            <span>{student.progress_percentage}% completed</span>
                          </div>
                          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                student.progress_percentage === 100
                                  ? 'bg-emerald-500'
                                  : 'bg-primary'
                              }`}
                              style={{ width: `${student.progress_percentage}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-[11px] text-muted-foreground italic">Not yet</span>
                      )}
                    </TableCell>

                    <TableCell className="whitespace-nowrap">
                      {student.status === 1 ? (
                        <Badge
                          variant="outline"
                          className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[11px] font-medium gap-1 pointer-events-none"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          Active
                        </Badge>
                      ) : student.status === 2 ? (
                        <Badge
                          variant="outline"
                          className="bg-destructive/10 text-destructive border-destructive/20 text-[11px] font-medium gap-1 pointer-events-none"
                        >
                          <Ban className="h-3 w-3" />
                          Suspended
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[11px] font-medium gap-1 pointer-events-none"
                        >
                          Unverified
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {student.last_login_at}
                    </TableCell>

                    <TableCell className="text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDossier(student.id)}
                          className="h-8 px-2 text-xs gap-1"
                          title="View academic dossier"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setStudentToToggleStatus(student)}
                          className={`h-8 w-8 transition-colors ${
                            student.status === 1
                              ? 'text-muted-foreground hover:text-destructive hover:bg-destructive/10'
                              : 'text-muted-foreground hover:text-emerald-600 hover:bg-emerald-500/10'
                          }`}
                          title={student.status === 1 ? 'Suspend account access' : 'Reactivate account'}
                        >
                          {student.status === 1 ? (
                            <Ban className="h-3.5 w-3.5" />
                          ) : (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          )}
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setStudentToDelete(student)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          title="Delete student account"
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

      {/* Student Academic Dossier Dialog */}
      <Dialog
        open={selectedStudentId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedStudentId(null);
            setSelectedStudentDetail(null);
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-xl font-bold flex items-center justify-between pr-6">
              <span className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                Student Academic Dossier & Compliance
              </span>
              {selectedStudentDetail && (
                <Badge
                  variant="outline"
                  className={
                    selectedStudentDetail.status === 1
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs'
                      : 'bg-destructive/10 text-destructive border-destructive/20 text-xs'
                  }
                >
                  {selectedStudentDetail.status === 1 ? 'Active Trainee' : 'Suspended'}
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Detailed learner curriculum progression, quiz attempts, module evaluations, and BACB compliance status
            </DialogDescription>
          </DialogHeader>

          {isLoadingDetail ? (
            <div className="py-16 flex flex-col items-center justify-center text-xs text-muted-foreground">
              <Loader2 className="h-7 w-7 animate-spin text-primary mb-2" />
              Loading academic dossier details...
            </div>
          ) : selectedStudentDetail ? (
            <div className="space-y-5 py-2 text-xs">
              {/* Profile Card & BACB Account */}
              <div className="p-4 bg-muted/20 border rounded-xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <Avatar className="h-14 w-14 ring-1 ring-border shrink-0">
                      {selectedStudentDetail.avatar && (
                        <AvatarImage src={resolveMediaUrl(selectedStudentDetail.avatar)} />
                      )}
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-base">
                        {selectedStudentDetail.first_name.charAt(0)}
                        {selectedStudentDetail.last_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-bold text-base text-foreground">
                        {selectedStudentDetail.full_name}
                      </h3>
                      <p className="text-muted-foreground text-xs">{selectedStudentDetail.email}</p>
                      <p className="text-muted-foreground text-xs mt-0.5">Phone: {selectedStudentDetail.phone}</p>
                    </div>
                  </div>

                  <div className="sm:text-right bg-background/80 border p-2.5 rounded-lg">
                    <p className="text-[11px] text-muted-foreground font-medium">BACB Applicant Account ID</p>
                    <p className="font-mono text-sm font-bold text-primary mt-0.5">
                      {selectedStudentDetail.bacb_id && selectedStudentDetail.bacb_id !== 'Not yet assigned'
                        ? selectedStudentDetail.bacb_id
                        : 'Not yet assigned'}
                    </p>
                  </div>
                </div>

                {/* Training Eligibility Status Banner */}
                {selectedStudentDetail.eligibility && (
                  <div className="pt-2 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground font-medium">Training Eligibility:</span>
                      <Badge
                        className={
                          selectedStudentDetail.eligibility.badge === 'certified'
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                            : selectedStudentDetail.eligibility.badge === 'eligible'
                            ? 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30'
                            : selectedStudentDetail.eligibility.badge === 'on_track'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : selectedStudentDetail.eligibility.badge === 'expired'
                            ? 'bg-destructive/15 text-destructive border border-destructive/30'
                            : 'bg-muted text-muted-foreground border'
                        }
                      >
                        {selectedStudentDetail.eligibility.status}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground italic">
                      {selectedStudentDetail.eligibility.description}
                    </p>
                  </div>
                )}
              </div>

              {/* 4 Key Metrics Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* 1. Course Completion */}
                <div className="border rounded-xl p-3 bg-card shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                    <span>Curriculum</span>
                    <BookOpen className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="text-lg font-extrabold text-foreground font-mono">
                    {selectedStudentDetail.has_bought_course
                      ? `${selectedStudentDetail.progress_percentage}%`
                      : '0%'}
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-primary h-1.5 rounded-full transition-all"
                      style={{
                        width: `${selectedStudentDetail.has_bought_course ? selectedStudentDetail.progress_percentage : 0}%`,
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {selectedStudentDetail.completed_lessons_count} of {selectedStudentDetail.total_lessons_count} lessons done
                  </p>
                </div>

                {/* 2. Training Hours & Minutes */}
                <div className="border rounded-xl p-3 bg-card shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                    <span>Training Hours</span>
                    <Clock className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="text-lg font-extrabold text-foreground font-mono">
                    {selectedStudentDetail.training_hours?.formatted || '0 hrs 00 mins'}
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-1.5 rounded-full transition-all"
                      style={{
                        width: `${selectedStudentDetail.training_hours?.percentage || 0}%`,
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate">
                    Target: {selectedStudentDetail.training_hours?.target_formatted || '40 hrs 00 mins'}
                  </p>
                </div>

                {/* 3. Modules Progress */}
                <div className="border rounded-xl p-3 bg-card shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                    <span>Modules</span>
                    <Layers className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="text-lg font-extrabold text-foreground font-mono">
                    {selectedStudentDetail.completed_modules_count ?? 0} / {selectedStudentDetail.total_modules_count ?? 0}
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-primary h-1.5 rounded-full transition-all"
                      style={{
                        width: `${
                          selectedStudentDetail.total_modules_count
                            ? Math.round(
                                ((selectedStudentDetail.completed_modules_count ?? 0) /
                                  selectedStudentDetail.total_modules_count) *
                                  100
                              )
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {selectedStudentDetail.incomplete_modules_count ?? 0} incomplete
                  </p>
                </div>

                {/* 4. Training Deadline */}
                <div className="border rounded-xl p-3 bg-card shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                    <span>BACB Deadline</span>
                    <Hourglass className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="text-lg font-extrabold text-foreground font-mono">
                    {selectedStudentDetail.has_bought_course
                      ? `${selectedStudentDetail.deadline_info?.days_remaining ?? 180} Days`
                      : 'N/A'}
                  </div>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium truncate">
                    {selectedStudentDetail.deadline_info?.compliance_status || '180 days limit'}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    Due: {selectedStudentDetail.deadline_info?.deadline_date || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Enrollment & Training Dates Strip */}
              <div className="border rounded-xl p-3.5 bg-muted/10 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    Enrollment & Training Timeline
                  </p>
                  <span className="text-[10px] text-muted-foreground italic">
                    180-Day Rule: Must complete in ≥ 5 days and ≤ 180 days
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-[11px]">
                  <div className="p-2 border rounded-lg bg-background">
                    <p className="text-[10px] text-muted-foreground">Registration Date</p>
                    <p className="font-semibold text-foreground mt-0.5">{selectedStudentDetail.created_at}</p>
                  </div>
                  <div className="p-2 border rounded-lg bg-background">
                    <p className="text-[10px] text-muted-foreground">Training Start Date</p>
                    <p className="font-semibold text-foreground mt-0.5">
                      {selectedStudentDetail.training_start_date || selectedStudentDetail.enrollment_date || 'Not started'}
                    </p>
                  </div>
                  <div className="p-2 border rounded-lg bg-background">
                    <p className="text-[10px] text-muted-foreground">Training End Date</p>
                    <p className="font-semibold text-foreground mt-0.5">
                      {selectedStudentDetail.training_end_date || (selectedStudentDetail.has_bought_course ? 'In Progress' : 'N/A')}
                    </p>
                  </div>
                  <div className="p-2 border rounded-lg bg-background">
                    <p className="text-[10px] text-muted-foreground">BACB 180-Day Deadline</p>
                    <p className="font-semibold text-foreground mt-0.5">
                      {selectedStudentDetail.deadline_info?.deadline_date || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Completed & Incomplete Modules */}
              <div className="border rounded-xl p-3.5 bg-background space-y-2.5">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-primary" />
                    Course Modules Progress ({selectedStudentDetail.completed_modules_count ?? 0} Completed / {selectedStudentDetail.incomplete_modules_count ?? 0} Incomplete)
                  </p>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    Program: {selectedStudentDetail.primary_course}
                  </span>
                </div>

                {selectedStudentDetail.modules_progress && selectedStudentDetail.modules_progress.length > 0 ? (
                  <div className="space-y-2">
                    {selectedStudentDetail.modules_progress.map((m) => (
                      <div
                        key={m.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 border rounded-lg bg-muted/15"
                      >
                        <div className="space-y-0.5">
                          <p className="font-semibold text-foreground text-xs">{m.title}</p>
                          <p className="text-[10px] text-muted-foreground">
                            Lessons: {m.completed_lessons} of {m.total_lessons} completed ({m.progress_percentage}%)
                          </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="w-24 bg-muted rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-primary h-1.5 rounded-full"
                              style={{ width: `${m.progress_percentage}%` }}
                            />
                          </div>
                          <Badge
                            variant="outline"
                            className={
                              m.status === 'Completed'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px]'
                                : m.status === 'In Progress'
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px]'
                                : 'bg-muted text-muted-foreground text-[10px]'
                            }
                          >
                            {m.status === 'Completed' && <CheckCircle2 className="h-3 w-3 mr-1 inline" />}
                            {m.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-muted-foreground italic py-1">
                    {selectedStudentDetail.has_bought_course
                      ? 'No module progress data recorded yet.'
                      : 'Learner is not enrolled in any course yet. Modules will appear upon enrollment.'}
                  </p>
                )}
              </div>

              {/* Quiz Scores & Attempts */}
              <div className="border rounded-xl p-3.5 bg-background space-y-2.5">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-primary" />
                    Quiz Scores & Attempts
                  </p>
                  {selectedStudentDetail.quiz_attempts && selectedStudentDetail.quiz_attempts.length > 0 && (
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {selectedStudentDetail.quizzes_passed_count ?? 0} Passed / {selectedStudentDetail.quizzes_failed_count ?? 0} Failed
                    </span>
                  )}
                </div>

                {selectedStudentDetail.quiz_attempts && selectedStudentDetail.quiz_attempts.length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader className="bg-muted/40">
                        <TableRow className="text-[10px]">
                          <TableHead className="py-1.5">Quiz / Assessment</TableHead>
                          <TableHead className="py-1.5">Module</TableHead>
                          <TableHead className="py-1.5 text-center">Attempt</TableHead>
                          <TableHead className="py-1.5 text-center">Score</TableHead>
                          <TableHead className="py-1.5 text-center">Result</TableHead>
                          <TableHead className="py-1.5 text-right">Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedStudentDetail.quiz_attempts.map((qa) => (
                          <TableRow key={qa.id} className="text-[11px]">
                            <TableCell className="py-2 font-medium">{qa.quiz_title}</TableCell>
                            <TableCell className="py-2 text-muted-foreground text-[10px]">{qa.module_title}</TableCell>
                            <TableCell className="py-2 text-center font-mono">Attempt {qa.attempt_number}</TableCell>
                            <TableCell className="py-2 text-center font-mono font-bold">
                              {qa.score_percentage}%
                              <span className="text-[9px] text-muted-foreground block font-normal">
                                ({qa.correct_answers}/{qa.total_questions} correct)
                              </span>
                            </TableCell>
                            <TableCell className="py-2 text-center">
                              <Badge
                                variant="outline"
                                className={
                                  qa.is_passed
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px]'
                                    : 'bg-destructive/10 text-destructive border-destructive/20 text-[10px]'
                                }
                              >
                                {qa.is_passed ? 'PASSED' : 'FAILED'}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-2 text-right text-muted-foreground text-[10px]">
                              {qa.created_at}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-[11px] text-muted-foreground italic py-1">
                    No quiz assessments attempted yet.
                  </p>
                )}
              </div>

              {/* Certificate Issuance History */}
              <div className="border rounded-xl p-3.5 bg-background space-y-2.5">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                    <Award className="h-3.5 w-3.5 text-primary" />
                    Certificate Issuance History
                  </p>
                </div>

                {selectedStudentDetail.certificates_history && selectedStudentDetail.certificates_history.length > 0 ? (
                  <div className="space-y-2">
                    {selectedStudentDetail.certificates_history.map((c) => (
                      <div
                        key={c.id}
                        className="p-3 border rounded-lg bg-emerald-500/5 border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold font-mono text-xs text-foreground">{c.cert_uid}</span>
                            <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px]">
                              {c.status.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground text-[11px]">{c.course_title}</p>
                          <p className="text-muted-foreground text-[10px]">
                            Training Time Logged: {c.training_time} Hours | Issued On: {c.issue_date}
                          </p>
                        </div>
                        <div className="text-[11px] sm:text-right font-mono text-muted-foreground">
                          BACB ID: {c.applicant_bacb_id || 'N/A'}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : selectedStudentDetail.certificates && selectedStudentDetail.certificates.length > 0 ? (
                  <div className="space-y-2">
                    {selectedStudentDetail.certificates.map((c) => (
                      <div
                        key={c.id}
                        className="p-2.5 border rounded-lg bg-emerald-500/5 border-emerald-500/20 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-mono font-bold text-xs">{c.certificate_number}</p>
                          <p className="text-[11px] text-muted-foreground">{c.course_title}</p>
                        </div>
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 text-[10px]">
                          Issued {c.issue_date}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-muted-foreground italic py-1">
                    No certificate issued yet. Certificate will be generated automatically upon 100% course and quiz completion.
                  </p>
                )}
              </div>

              {/* Subscribed Course Access History */}
              {selectedStudentDetail.enrolled_courses && selectedStudentDetail.enrolled_courses.length > 0 && (
                <div className="border rounded-xl p-3.5 bg-muted/10 space-y-2">
                  <p className="font-semibold text-xs text-foreground">Course Access & Subscription Records</p>
                  <div className="space-y-2">
                    {selectedStudentDetail.enrolled_courses.map((c) => (
                      <div
                        key={c.subscription_id}
                        className="p-2.5 border rounded-md bg-background text-[11px] flex flex-col sm:flex-row sm:items-center justify-between gap-1.5"
                      >
                        <div>
                          <span className="font-semibold text-foreground mr-2">{c.course_title}</span>
                          <Badge variant="outline" className="text-[10px] bg-primary/5">
                            {c.tier_name}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-muted-foreground text-[10px]">
                          <span>Duration: {c.duration}</span>
                          <span>Valid Until: {c.valid_until}</span>
                          <Badge
                            className={
                              c.status === 'Active'
                                ? 'bg-emerald-500/10 text-emerald-600 text-[10px]'
                                : 'bg-muted text-muted-foreground text-[10px]'
                            }
                          >
                            {c.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}

          <DialogFooter className="pt-2">
            <Button
              size="sm"
              onClick={() => {
                setSelectedStudentId(null);
                setSelectedStudentDetail(null);
              }}
              className="h-9 text-xs font-medium"
            >
              Close Dossier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend / Reactivate Confirmation Modal */}
      <Dialog
        open={studentToToggleStatus !== null}
        onOpenChange={(open) => {
          if (!open) setStudentToToggleStatus(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle
              className={`text-base sm:text-lg flex items-center gap-2 ${
                studentToToggleStatus?.status === 1
                  ? 'text-destructive'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {studentToToggleStatus?.status === 1 ? (
                <>
                  <Ban className="h-5 w-5" />
                  Suspend Student Account
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5" />
                  Reactivate Student Account
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {studentToToggleStatus?.status === 1
                ? 'Are you sure you want to suspend this student account? The student will be temporarily blocked from logging in to their portal and accessing courses.'
                : 'Are you sure you want to reactivate access for this student account? The student will immediately regain access to their portal and courses.'}
            </DialogDescription>
          </DialogHeader>

          {studentToToggleStatus && (
            <div className="border rounded-lg p-3 bg-muted/20 space-y-1.5 my-2 text-xs">
              <p className="font-semibold text-foreground">{studentToToggleStatus.full_name}</p>
              <p className="text-muted-foreground">{studentToToggleStatus.email}</p>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t">
                <span>BACB ID: {studentToToggleStatus.bacb_id}</span>
                <span>
                  {studentToToggleStatus.has_bought_course
                    ? `${studentToToggleStatus.progress_percentage}% completed`
                    : 'Not yet enrolled'}
                </span>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setStudentToToggleStatus(null)}
              disabled={isStatusUpdating}
              className="h-9 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant={studentToToggleStatus?.status === 1 ? 'destructive' : 'default'}
              size="sm"
              onClick={handleConfirmStatusToggle}
              disabled={isStatusUpdating}
              className={`h-9 text-xs font-medium gap-1.5 ${
                studentToToggleStatus?.status !== 1
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : ''
              }`}
            >
              {isStatusUpdating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {studentToToggleStatus?.status === 1 ? 'Confirm Suspension' : 'Confirm Reactivation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={studentToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setStudentToDelete(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Delete Student Account
            </DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to permanently delete this student trainee record? This will revoke
              all course access and delete their academic progress data.
            </DialogDescription>
          </DialogHeader>

          {studentToDelete && (
            <div className="border rounded-lg p-3 bg-muted/20 space-y-1.5 my-2 text-xs">
              <p className="font-semibold text-foreground">{studentToDelete.full_name}</p>
              <p className="text-muted-foreground">{studentToDelete.email}</p>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t">
                <span>BACB ID: {studentToDelete.bacb_id}</span>
                <span>
                  {studentToDelete.has_bought_course
                    ? `${studentToDelete.progress_percentage}% completed`
                    : 'Not yet enrolled'}
                </span>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setStudentToDelete(null)}
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
