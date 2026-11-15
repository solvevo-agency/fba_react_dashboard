import { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Search,
  CheckCircle2,
  Ban,
  Eye,
  Trash2,
  AlertTriangle,
  GraduationCap,
  Calendar,
  Loader2,
  RefreshCw,
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

        <div className="w-44 shrink-0">
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
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg flex items-center justify-between pr-6">
              <span>Academic Dossier</span>
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
              Learner enrollment, progress evaluation, and BACB compliance status
            </DialogDescription>
          </DialogHeader>

          {isLoadingDetail ? (
            <div className="py-12 flex flex-col items-center justify-center text-xs text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin text-primary mb-2" />
              Loading academic dossier details...
            </div>
          ) : selectedStudentDetail ? (
            <div className="space-y-4 py-2 text-xs">
              <div className="flex items-center gap-3 p-3.5 bg-muted/30 border rounded-xl">
                <Avatar className="h-12 w-12 ring-1 ring-border">
                  {selectedStudentDetail.avatar && (
                    <AvatarImage src={resolveMediaUrl(selectedStudentDetail.avatar)} />
                  )}
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                    {selectedStudentDetail.first_name.charAt(0)}
                    {selectedStudentDetail.last_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-bold text-sm text-foreground">
                    {selectedStudentDetail.full_name}
                  </h4>
                  <p className="text-muted-foreground text-xs">{selectedStudentDetail.email}</p>
                  <p className="font-mono text-[11px] text-primary mt-0.5">
                    BACB Account ID:{' '}
                    {selectedStudentDetail.bacb_id &&
                    selectedStudentDetail.bacb_id !== 'Not yet assigned'
                      ? selectedStudentDetail.bacb_id
                      : 'Not yet assigned'}
                  </p>
                </div>
              </div>

              <div className="space-y-2 border rounded-xl p-3.5 bg-background">
                <div className="flex justify-between items-center py-1 border-b">
                  <span className="text-muted-foreground">Enrolled Program:</span>
                  <span className="font-semibold text-foreground text-right max-w-[200px]">
                    {selectedStudentDetail.has_bought_course
                      ? selectedStudentDetail.primary_course
                      : 'Not yet enrolled'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b">
                  <span className="text-muted-foreground">Curriculum Completion:</span>
                  <span className="font-bold text-primary font-mono">
                    {selectedStudentDetail.has_bought_course
                      ? `${selectedStudentDetail.progress_percentage}%`
                      : 'Not yet'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b">
                  <span className="text-muted-foreground">Phone Number:</span>
                  <span className="text-foreground">{selectedStudentDetail.phone}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b">
                  <span className="text-muted-foreground">Registration Date:</span>
                  <span className="text-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    {selectedStudentDetail.created_at}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-muted-foreground">Last Portal Activity:</span>
                  <span className="text-foreground">{selectedStudentDetail.last_login_at}</span>
                </div>
              </div>

              {/* Subscribed Course Dossier if enrolled */}
              {selectedStudentDetail.enrolled_courses &&
                selectedStudentDetail.enrolled_courses.length > 0 && (
                  <div className="space-y-2 border rounded-xl p-3.5 bg-muted/10">
                    <p className="font-semibold text-xs text-foreground">Course Access History</p>
                    <div className="space-y-2">
                      {selectedStudentDetail.enrolled_courses.map((c) => (
                        <div
                          key={c.subscription_id}
                          className="p-2 border rounded-md bg-background text-[11px] space-y-1"
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-foreground truncate max-w-[190px]">
                              {c.course_title}
                            </span>
                            <Badge variant="outline" className="text-[10px] bg-primary/5">
                              {c.tier_name}
                            </Badge>
                          </div>
                          <div className="flex justify-between text-muted-foreground text-[10px]">
                            <span>Access: {c.duration}</span>
                            <span>Valid: {c.valid_until}</span>
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
