import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Plus,
  Search,
  BookOpen,
  Clock,
  Layers,
  MoreVertical,
  Edit,
  Trash2,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { toast } from 'sonner';
import { courseApi, type Course, type CourseStats } from '@/services/courseApi';
import { resolveMediaUrl } from '@/components/ui/video-upload-dropzone';
import { getApiErrorMessage } from '@/services/api';

export default function CoursesPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<CourseStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Delete modal state
  const [deleteCourseId, setDeleteCourseId] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [coursesData, statsData] = await Promise.all([
        courseApi.getAll(),
        courseApi.getStats(),
      ]);
      setCourses(coursesData);
      setStats(statsData);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load courses'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredCourses = courses.filter((course) => {
    const q = searchQuery.toLowerCase();
    return (
      course.title.toLowerCase().includes(q) ||
      course.instructor_name.toLowerCase().includes(q) ||
      course.course_uid.toLowerCase().includes(q)
    );
  });

  const handleDeleteCourse = async (id: number) => {
    try {
      setIsDeleting(true);
      const res = await courseApi.delete(id);
      setCourses((prev) => prev.filter((c) => c.id !== id));
      setDeleteCourseId(null);
      toast.success(`Course "${res.title}" deleted successfully`);

      // Refresh stats
      courseApi.getStats().then(setStats).catch(() => {});
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to delete course'));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            Courses & Curriculum Engine
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Manage comprehensive 40-hour BACB-aligned courses, modules, lessons, quizzes, and pricing plans
          </p>
        </div>

        <Button
          onClick={() => navigate('/dashboard/courses/create')}
          className="gap-2 font-medium shrink-0 shadow-xs"
        >
          <Plus className="h-4 w-4" />
          Create New Course
        </Button>
      </div>

      {/* 3 Metric Cards Row (Clean, no publish/draft tracking needed) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Total Courses</span>
            <BookOpen className="h-4 w-4 text-primary" />
          </div>
          <p className="text-xl font-bold mt-1 text-foreground">
            {stats ? stats.total_courses : courses.length}
          </p>
        </Card>

        <Card className="p-4 border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Curriculum Modules</span>
            <Layers className="h-4 w-4 text-indigo-500" />
          </div>
          <p className="text-xl font-bold mt-1 text-foreground">
            {stats
              ? stats.total_modules
              : courses.reduce((acc, c) => acc + (c.total_modules || 0), 0)}
          </p>
        </Card>

        <Card className="p-4 border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Curriculum Video Hours</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-xl font-bold mt-1 text-foreground">
            {stats
              ? `${stats.total_video_hours} hrs`
              : `${Math.round(courses.reduce((acc, c) => acc + (c.total_video_length || 0), 0) / 60)} hrs`}
          </p>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search by title, instructor, or UID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>
      </div>

      {/* Course Cards Grid */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground font-medium">Loading course directory...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredCourses.length === 0 ? (
            <div className="col-span-full p-12 text-center border rounded-xl bg-muted/20">
              <GraduationCap className="h-10 w-10 text-muted-foreground mx-auto" />
              <p className="text-sm font-semibold mt-2 text-foreground">No courses found</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Click &quot;Create New Course&quot; above to publish your first BACB curriculum.
              </p>
            </div>
          ) : (
            filteredCourses.map((course) => (
              <Card
                key={course.id}
                className="overflow-hidden border shadow-xs hover:shadow-md transition-shadow flex flex-col group"
              >
                <div className="relative h-44 bg-muted overflow-hidden">
                  <img
                    src={
                      resolveMediaUrl(course.banner_image || course.thumbnail) ||
                      '/placeholder-course.jpg'
                    }
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {course.tiers && course.tiers.length > 0 && (
                    <div className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-xs text-white text-[11px] px-2.5 py-0.5 rounded-md font-mono flex items-center gap-1">
                      <span>${Number(course.tiers[0]?.final_price || 0).toFixed(2)}</span>
                      <span>&bull;</span>
                      <span className="font-sans font-medium">{course.tiers[0]?.tier_name}</span>
                    </div>
                  )}
                </div>

                <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-semibold text-primary uppercase">
                        {course.course_uid}
                      </span>
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-amber-500" />
                        {course.tiers?.length || 1} Pricing Plan
                        {(course.tiers?.length || 1) > 1 ? 's' : ''}
                      </span>
                    </div>
                    <h3 className="font-semibold text-sm sm:text-base line-clamp-2 text-foreground leading-snug">
                      {course.title}
                    </h3>
                  </div>

                  <div className="space-y-3 pt-2 border-t">
                    {/* Instructor */}
                    <div className="flex items-center gap-2">
                      <img
                        src={resolveMediaUrl(course.instructor_avatar)}
                        alt={course.instructor_name}
                        className="h-6 w-6 rounded-full object-cover ring-1 ring-border"
                      />
                      <span className="text-xs text-muted-foreground truncate">
                        {course.instructor_name}
                      </span>
                    </div>

                    {/* Modules & Lessons & Duration */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                      <span className="flex items-center gap-1">
                        <Layers className="h-3.5 w-3.5 text-primary" />
                        {course.total_modules} Modules
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3.5 w-3.5 text-primary" />
                        {course.total_lessons} Lessons
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-primary" />
                        {Math.floor(course.total_video_length / 60)}h{' '}
                        {course.total_video_length % 60}m
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/dashboard/courses/edit/${course.id}`)}
                      className="h-8 text-xs gap-1.5"
                    >
                      <Edit className="h-3.5 w-3.5" />
                      Manage Course
                    </Button>

                    <div className="flex items-center gap-1">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem
                            onClick={() => navigate(`/dashboard/courses/edit/${course.id}`)}
                            className="cursor-pointer text-xs"
                          >
                            <Edit className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                            Full Curriculum Editor
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setDeleteCourseId(course.id)}
                            className="cursor-pointer text-xs text-destructive focus:bg-destructive/10 focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-3.5 w-3.5" />
                            Delete Course
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteCourseId !== null} onOpenChange={() => setDeleteCourseId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Course Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this course? This will remove all child modules, lessons, and linked resources permanently.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={isDeleting}
              onClick={() => setDeleteCourseId(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={isDeleting}
              onClick={() => deleteCourseId && handleDeleteCourse(deleteCourseId)}
            >
              {isDeleting ? 'Deleting...' : 'Delete Permanently'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
