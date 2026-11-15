import { useState, useEffect, useCallback } from 'react';
import {
  instructorApi,
  type Instructor,
  type InstructorStats,
} from '@/services/instructorApi';
import { getApiErrorMessage } from '@/services/api';
import {
  UserCheck,
  Plus,
  Search,
  Mail,
  GraduationCap,
  Award,
  MoreVertical,
  Trash2,
  Edit,
  Sparkles,
  BookOpen,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ImageUploadDropzone } from '@/components/ui/image-upload-dropzone';
import { toast } from 'sonner';

export default function InstructorsPage() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [stats, setStats] = useState<InstructorStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'lead' | 'regular'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(null);

  const [formData, setFormData] = useState<{
    name: string;
    designation: string;
    email: string;
    avatar: string;
    bio: string;
    instructor_type: 'lead' | 'regular';
  }>({
    name: '',
    designation: '',
    email: '',
    avatar: '',
    bio: '',
    instructor_type: 'lead',
  });

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [instructorsData, statsData] = await Promise.all([
        instructorApi.getAll(),
        instructorApi.getStats(),
      ]);
      setInstructors(instructorsData);
      setStats(statsData);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load instructors'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Client-side instant search across name, designation, and email
  const filteredInstructors = instructors.filter((inst) => {
    const matchesSearch =
      inst.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole =
      roleFilter === 'all' || (inst.instructor_type || 'lead') === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleOpenModal = (instructor?: Instructor) => {
    if (instructor) {
      setEditingInstructor(instructor);
      setFormData({
        name: instructor.name,
        designation: instructor.designation,
        email: instructor.email || '',
        avatar: instructor.avatar || '',
        bio: instructor.bio || '',
        instructor_type: instructor.instructor_type || 'lead',
      });
    } else {
      setEditingInstructor(null);
      setFormData({
        name: '',
        designation: '',
        email: '',
        avatar: '',
        bio: '',
        instructor_type: 'lead',
      });
    }
    setModalOpen(true);
  };

  const handleSaveInstructor = async () => {
    if (!formData.name.trim()) {
      toast.error('Instructor name is required');
      return;
    }
    if (!formData.designation.trim()) {
      toast.error('Designation is required');
      return;
    }

    try {
      setIsSaving(true);
      if (editingInstructor) {
        const updated = await instructorApi.update(editingInstructor.id, formData);
        setInstructors((prev) =>
          prev.map((item) => (item.id === editingInstructor.id ? updated : item))
        );
        toast.success(`Instructor "${updated.name}" updated successfully`);
      } else {
        const created = await instructorApi.create(formData);
        setInstructors((prev) => [created, ...prev]);
        toast.success(`Instructor "${created.name}" registered successfully`);
      }

      // Refresh stats
      instructorApi.getStats().then(setStats).catch(() => {});
      setModalOpen(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to save instructor'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteInstructor = async (id: number) => {
    try {
      setDeletingId(id);
      const res = await instructorApi.delete(id);
      setInstructors((prev) => prev.filter((i) => i.id !== id));
      toast.success(`Instructor "${res.name}" removed successfully`);

      // Refresh stats
      instructorApi.getStats().then(setStats).catch(() => {});
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to delete instructor'));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <UserCheck className="h-6 w-6 text-primary" />
            Faculty & Instructors Directory
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Manage Lead Course Instructors (featured on courses) and Regular Lesson Teachers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={isLoading}
            className="gap-1.5 text-xs h-9"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            onClick={() => handleOpenModal()}
            className="gap-2 font-medium shrink-0 shadow-sm h-9 text-xs sm:text-sm"
          >
            <Plus className="h-4 w-4" />
            Add Instructor
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Total Instructors</span>
            <UserCheck className="h-4 w-4 text-primary" />
          </div>
          <p className="text-xl font-bold mt-1 text-foreground">
            {stats ? stats.total : instructors.length}
          </p>
        </Card>

        <Card className="p-4 border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Lead Instructors</span>
            <Sparkles className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-xl font-bold mt-1 text-foreground">
            {stats
              ? stats.lead
              : instructors.filter((i) => (i.instructor_type || 'lead') === 'lead').length}
          </p>
        </Card>

        <Card className="p-4 border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Lesson Teachers</span>
            <BookOpen className="h-4 w-4 text-indigo-500" />
          </div>
          <p className="text-xl font-bold mt-1 text-foreground">
            {stats
              ? stats.regular
              : instructors.filter((i) => i.instructor_type === 'regular').length}
          </p>
        </Card>

        <Card className="p-4 border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Active Status</span>
            <Award className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-xl font-bold mt-1 text-foreground">
            {stats ? stats.verified_percent : '100% Verified'}
          </p>
        </Card>
      </div>

      {/* Search & Role Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search by name, designation, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs sm:text-sm h-9 placeholder:text-xs placeholder:text-muted-foreground/50"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto self-start sm:self-auto overflow-x-auto">
          {(
            [
              { id: 'all', label: 'All' },
              { id: 'lead', label: 'Lead Instructors' },
              { id: 'regular', label: 'Lesson Teachers' },
            ] as const
          ).map((tab) => (
            <Button
              key={tab.id}
              variant={roleFilter === tab.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setRoleFilter(tab.id)}
              className="text-xs h-8 shrink-0"
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Instructors Grid with Direct Image & Proper Name Display */}
      {isLoading ? (
        <div className="p-16 text-center border rounded-xl bg-card">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-sm font-semibold mt-3 text-foreground">Loading instructors...</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Connecting to Super Admin Faculty directory
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredInstructors.length === 0 ? (
            <div className="col-span-full p-12 text-center border rounded-xl bg-muted/20">
              <UserCheck className="h-10 w-10 text-muted-foreground mx-auto" />
              <p className="text-sm font-semibold mt-2 text-foreground">No instructors found</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Try adjusting your search query or filter selection.
              </p>
            </div>
          ) : (
            filteredInstructors.map((instructor) => {
              const isLead = (instructor.instructor_type || 'lead') === 'lead';
              const isDeleting = deletingId === instructor.id;

              return (
                <Card
                  key={instructor.id}
                  className="border shadow-xs hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between group"
                >
                  <div>
                    {/* Direct Image Preview taking full width with height 48 */}
                    <div className="relative h-48 w-full bg-muted overflow-hidden">
                      <img
                        src={
                          instructor.avatar ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80'
                        }
                        alt={instructor.name}
                        className="w-full h-full object-cover object-[center_top] transition-transform duration-300 group-hover:scale-105"
                      />

                      {/* Simple, Clear Instructor Role Tag */}
                      <div className="absolute top-3 left-3">
                        {isLead ? (
                          <Badge className="bg-primary text-primary-foreground font-semibold text-[10px] tracking-wide uppercase shadow-sm">
                            Lead Course Instructor
                          </Badge>
                        ) : (
                          <Badge className="bg-neutral-900/80 backdrop-blur-xs text-white border-white/20 font-semibold text-[10px] tracking-wide uppercase shadow-sm">
                            Lesson Teacher
                          </Badge>
                        )}
                      </div>

                      {/* Action Dropdown Menu */}
                      <div className="absolute top-2 right-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="secondary"
                              size="icon"
                              disabled={isDeleting}
                              className="h-7 w-7 rounded-full bg-black/60 hover:bg-black/80 text-white border-0 backdrop-blur-xs"
                            >
                              {isDeleting ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <MoreVertical className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-36">
                            <DropdownMenuItem
                              onClick={() => handleOpenModal(instructor)}
                              className="cursor-pointer text-xs"
                            >
                              <Edit className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                              Edit Profile
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteInstructor(instructor.id)}
                              className="cursor-pointer text-xs text-destructive focus:bg-destructive/10 focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-3.5 w-3.5" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Card Content with Full, Unclipped Name */}
                    <CardContent className="p-4 space-y-3">
                      <div className="space-y-1">
                        <h3 className="font-bold text-base text-foreground leading-snug break-words">
                          {instructor.name}
                        </h3>
                        <p className="text-xs font-medium text-primary leading-tight">
                          {instructor.designation}
                        </p>
                      </div>

                      {/* Bio */}
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {instructor.bio || 'No biographical information provided.'}
                      </p>

                      {/* Contact Email & Course Count */}
                      <div className="pt-2.5 border-t space-y-1.5 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="truncate">{instructor.email || 'No email provided'}</span>
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <span className="flex items-center gap-1.5 font-medium text-foreground">
                            <GraduationCap className="h-3.5 w-3.5 text-primary" />
                            {instructor.courses_count} Course
                            {instructor.courses_count === 1 ? '' : 's'} Taught
                          </span>
                          <Badge
                            variant="outline"
                            className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px]"
                          >
                            Verified
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </div>

                  {/* Bottom Quick Action Bar */}
                  <div className="p-3 pt-2 border-t bg-muted/10 flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenModal(instructor)}
                      className="h-7 text-xs gap-1.5 w-full font-medium"
                    >
                      <Edit className="h-3 w-3" />
                      Manage Instructor Profile
                    </Button>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Add / Edit Instructor Modal (Fully Responsive & Scrollable) */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg w-[95vw] sm:w-full max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-xl">
          <DialogHeader className="px-6 pt-5 pb-3 border-b">
            <DialogTitle className="text-base sm:text-lg">
              {editingInstructor ? 'Edit Faculty Profile' : 'Add New Instructor'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Configure faculty credentials, course lead permissions, and profile picture.
            </DialogDescription>
          </DialogHeader>

          {/* Scrollable Form Body */}
          <div className="overflow-y-auto px-6 py-4 space-y-4 flex-1 text-xs sm:text-sm">
            {/* Instructor Role Selection (Shadcn Select) */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Instructor Role Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.instructor_type}
                onValueChange={(val: 'regular' | 'lead') =>
                  setFormData({ ...formData, instructor_type: val })
                }
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select faculty role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular" className="text-xs">
                    Regular Lesson Teacher (Session Specialist)
                  </SelectItem>
                  <SelectItem value="lead" className="text-xs">
                    Lead Course Instructor (Featured on Full Course)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Full Name */}
            <div className="space-y-1.5">
              <Label htmlFor="inst_name" className="text-xs font-semibold">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="inst_name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="text-xs sm:text-sm h-9 placeholder:text-xs placeholder:text-muted-foreground/50"
              />
            </div>

            {/* Designation */}
            <div className="space-y-1.5">
              <Label htmlFor="inst_desig" className="text-xs font-semibold">
                Designation & Role <span className="text-destructive">*</span>
              </Label>
              <Input
                id="inst_desig"
                placeholder="Enter your designation"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="text-xs sm:text-sm h-9 placeholder:text-xs placeholder:text-muted-foreground/50"
              />
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <Label htmlFor="inst_email" className="text-xs font-semibold">
                Email Address
              </Label>
              <Input
                id="inst_email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="text-xs sm:text-sm h-9 placeholder:text-xs placeholder:text-muted-foreground/50"
              />
            </div>

            {/* Direct Image Upload Dropzone (Takes full width with height 52-60) */}
            <div className="pt-2 border-t">
              <ImageUploadDropzone
                label="Instructor Display Picture"
                value={formData.avatar}
                onChange={(val) => setFormData({ ...formData, avatar: val })}
                onUploadFile={(file) => instructorApi.uploadAvatar(file)}
                aspectRatio="wide"
              />
            </div>

            {/* Biography */}
            <div className="space-y-1.5 pt-2 border-t">
              <Label htmlFor="inst_bio" className="text-xs font-semibold">
                Biography & Experience
              </Label>
              <textarea
                id="inst_bio"
                rows={3}
                className="w-full rounded-md border border-input bg-background p-2.5 text-xs sm:text-sm placeholder:text-xs placeholder:text-muted-foreground/50"
                placeholder="Enter your biography and experience"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              />
            </div>
          </div>

          {/* Sticky Dialog Footer */}
          <DialogFooter className="px-6 py-3 border-t bg-muted/20 gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              disabled={isSaving}
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={isSaving}
              onClick={handleSaveInstructor}
              className="shadow-sm gap-1.5"
            >
              {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {editingInstructor ? 'Update Instructor' : 'Save Instructor'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
