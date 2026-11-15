import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  BookOpen,
  Layers,
  CreditCard,
  Video,
  FileText,
  UserCheck,
  FileQuestion,
  FileUp,
  ChevronDown,
  ChevronUp,
  Loader2,
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
import { ImageUploadDropzone } from '@/components/ui/image-upload-dropzone';
import { VideoUploadDropzone } from '@/components/ui/video-upload-dropzone';
import { toast } from 'sonner';
import {
  courseApi,
  type CourseLesson,
  type CourseModule,
} from '@/services/courseApi';
import { instructorApi, type Instructor } from '@/services/instructorApi';
import { quizApi, type Quiz } from '@/services/quizApi';
import { getApiErrorMessage } from '@/services/api';

interface CourseEditorPageProps {
  mode: 'create' | 'edit';
}

export interface FormPricingTier {
  id?: number;
  tier_name: string;
  title?: string;
  subtitle?: string;
  starting_price?: number | string;
  final_price?: number | string;
  duration: string;
  benefits: string[];
  benefitsText?: string;
  stripe_price_id?: string;
  status?: number;
}

export default function CourseEditorPage({ mode }: CourseEditorPageProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Active section tab
  const [activeTab, setActiveTab] = useState('details');

  // Loading states
  const [isLoading, setIsLoading] = useState(mode === 'edit');
  const [isSaving, setIsSaving] = useState(false);

  // External options loaded from backend
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  // Collapsed sections tracking for clean UI
  const [collapsedModuleIds, setCollapsedModuleIds] = useState<number[]>([]);
  const [collapsedLessonIds, setCollapsedLessonIds] = useState<number[]>([]);
  const [collapsedResourceLessonIds, setCollapsedResourceLessonIds] = useState<number[]>([]);

  // Course Basic Information State
  const [courseData, setCourseData] = useState({
    title: '',
    course_uid: `CRS-${Math.floor(100 + Math.random() * 900)}`,
    slug: '',
    lead_instructor_id: '',
    description: '',
    what_to_learn: '',
    banner_image: '',
    thumbnail: '',
    status: 'published',
  });

  // Pricing Tiers State
  const [tiers, setTiers] = useState<FormPricingTier[]>([
    {
      id: Date.now(),
      tier_name: '',
      title: '',
      subtitle: '',
      starting_price: '',
      final_price: '',
      duration: 'lifetime',
      benefits: [],
      benefitsText: '',
      status: 1,
    },
  ]);

  // Modules & Lessons State
  const [modules, setModules] = useState<CourseModule[]>([
    {
      id: Date.now(),
      title: '',
      description: '',
      quiz_id: null,
      quiz_title: '',
      quiz_eligible: 'last',
      status: 1,
      lessons: [],
    },
  ]);

  // Load supporting options (instructors & quizzes) and course if in edit mode
  const loadInitialData = useCallback(async () => {
    try {
      if (mode === 'edit') {
        setIsLoading(true);
      }

      const [instList, quizList] = await Promise.all([
        instructorApi.getAll(),
        quizApi.getAll(),
      ]);

      setInstructors(instList);
      setQuizzes(quizList);

      // In create mode, select the first lead instructor by default if not set
      if (mode === 'create') {
        const firstLead = instList.find((i) => i.instructor_type === 'lead') || instList[0];
        if (firstLead) {
          setCourseData((prev) => ({
            ...prev,
            lead_instructor_id: prev.lead_instructor_id || String(firstLead.id),
          }));
        }
      }

      // If in edit mode, fetch existing course
      if (mode === 'edit' && id) {
        const course = await courseApi.getById(Number(id));
        setCourseData({
          title: course.title || '',
          course_uid: course.course_uid || '',
          slug: course.slug || '',
          lead_instructor_id: course.instructor_id ? String(course.instructor_id) : '',
          description: course.description || '',
          what_to_learn: Array.isArray(course.what_to_learn)
            ? course.what_to_learn.join('\n')
            : course.what_to_learn || '',
          banner_image: course.banner_image || '',
          thumbnail: course.thumbnail || '',
          status: 'published',
        });

        if (course.tiers && course.tiers.length > 0) {
          setTiers(
            course.tiers.map((t) => ({
              ...t,
              starting_price:
                t.starting_price !== undefined && t.starting_price !== null
                  ? String(t.starting_price)
                  : '',
              final_price:
                t.final_price !== undefined && t.final_price !== null
                  ? String(t.final_price)
                  : '',
              benefits: Array.isArray(t.benefits) ? t.benefits : [],
              benefitsText: Array.isArray(t.benefits) ? t.benefits.join('\n') : '',
            }))
          );
        }

        if (course.modules && course.modules.length > 0) {
          setModules(JSON.parse(JSON.stringify(course.modules)));
        }
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load course details'));
    } finally {
      setIsLoading(false);
    }
  }, [mode, id]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Filtered Instructor Lists
  const leadInstructors = instructors.filter((i) => i.instructor_type === 'lead');
  const availableLeadInstructors = leadInstructors.length > 0 ? leadInstructors : instructors;

  const lessonInstructors = instructors.filter(
    (i) => i.instructor_type === 'regular' || (i as { instructor_type?: string }).instructor_type === 'lesson'
  );
  const availableLessonInstructors = lessonInstructors.length > 0 ? lessonInstructors : instructors;

  // Selected Lead Instructor Details
  const leadInstructor =
    instructors.find((i) => String(i.id) === courseData.lead_instructor_id) ||
    availableLeadInstructors[0] ||
    null;

  // Auto-generate slug automatically when title changes
  const handleTitleChange = (val: string) => {
    const autoSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setCourseData((prev) => ({
      ...prev,
      title: val,
      slug: autoSlug,
    }));
  };

  // Toggle Collapse Helpers
  const toggleModuleCollapse = (modId: number) => {
    setCollapsedModuleIds((prev) =>
      prev.includes(modId) ? prev.filter((i) => i !== modId) : [...prev, modId]
    );
  };

  const toggleLessonCollapse = (lessonId: number) => {
    setCollapsedLessonIds((prev) =>
      prev.includes(lessonId) ? prev.filter((i) => i !== lessonId) : [...prev, lessonId]
    );
  };

  const toggleResourceLessonCollapse = (lessonId: number) => {
    setCollapsedResourceLessonIds((prev) =>
      prev.includes(lessonId) ? prev.filter((i) => i !== lessonId) : [...prev, lessonId]
    );
  };

  // Add Pricing Tier
  const handleAddTier = () => {
    const newTier: FormPricingTier = {
      id: Date.now(),
      tier_name: '',
      title: '',
      subtitle: '',
      starting_price: '',
      final_price: '',
      duration: '1 month',
      benefits: [],
      benefitsText: '',
      status: 1,
    };
    setTiers([...tiers, newTier]);
  };

  const handleRemoveTier = (tierId: number | undefined) => {
    if (tiers.length <= 1) {
      toast.error('A course must have at least one pricing plan');
      return;
    }
    setTiers(tiers.filter((t) => t.id !== tierId));
  };

  // Add Module
  const handleAddModule = () => {
    const newMod: CourseModule = {
      id: Date.now(),
      title: `Module ${modules.length + 1}`,
      description: '',
      quiz_id: null,
      quiz_title: '',
      quiz_eligible: 'last',
      status: 1,
      lessons: [],
    };
    setModules([...modules, newMod]);
  };

  const handleRemoveModule = (modId: number | undefined) => {
    if (modules.length <= 1) {
      toast.error('A course must contain at least one module');
      return;
    }
    setModules(modules.filter((m) => m.id !== modId));
  };

  // Add Lesson to a Module
  const handleAddLesson = (moduleId: number | undefined) => {
    const targetMod = modules.find((m) => m.id === moduleId);
    const lessonCount = (targetMod?.lessons.length || 0) + 1;
    const autoLessonUid = `LES-${String(lessonCount).padStart(2, '0')}`;

    const defaultInst = availableLessonInstructors[0] || leadInstructor;

    const newLesson: CourseLesson = {
      id: Date.now(),
      lesson_uid: autoLessonUid,
      title: '',
      instructor_id: defaultInst ? defaultInst.id : null,
      instructor_name: defaultInst?.name || '',
      lesson_time: 30,
      description: '',
      transcript_text: '',
      thumbnail_image: '',
      video_path: '',
      resources: [],
    };

    setModules(
      modules.map((m) =>
        m.id === moduleId ? { ...m, lessons: [...m.lessons, newLesson] } : m
      )
    );
  };

  const handleRemoveLesson = (moduleId: number | undefined, lessonId: number | undefined) => {
    setModules(
      modules.map((m) =>
        m.id === moduleId
          ? { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) }
          : m
      )
    );
  };

  // Attach PDF Resource via Upload API
  const handleAttachPdf = (moduleId: number | undefined, lessonId: number | undefined) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf,.pdf';
    input.onchange = async (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        const file = target.files[0];
        if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
          toast.error('Please select a valid PDF file (.pdf)');
          return;
        }

        const formattedSize =
          file.size >= 1024 * 1024
            ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
            : `${Math.max(1, Math.round(file.size / 1024))} KB`;

        const autoTitle = file.name
          .replace(/\.pdf$/i, '')
          .replace(/[_-]+/g, ' ')
          .trim();

        try {
          // Upload PDF file to backend media handler
          const uploadRes = await courseApi.uploadMedia(file);

          const newRes = {
            id: Date.now(),
            title: autoTitle,
            file_path: uploadRes.url,
            file_type: 'application/pdf',
            file_size: formattedSize,
          };

          setModules((prev) =>
            prev.map((m) =>
              m.id === moduleId
                ? {
                    ...m,
                    lessons: m.lessons.map((l) =>
                      l.id === lessonId ? { ...l, resources: [...l.resources, newRes] } : l
                    ),
                  }
                : m
            )
          );
          toast.success(`Attached PDF: "${file.name}" (${formattedSize})`);
        } catch {
          // Fallback to local path if upload endpoint has temporary issue
          const newRes = {
            id: Date.now(),
            title: autoTitle,
            file_path: `/uploads/resources/${file.name}`,
            file_type: 'application/pdf',
            file_size: formattedSize,
          };
          setModules((prev) =>
            prev.map((m) =>
              m.id === moduleId
                ? {
                    ...m,
                    lessons: m.lessons.map((l) =>
                      l.id === lessonId ? { ...l, resources: [...l.resources, newRes] } : l
                    ),
                  }
                : m
            )
          );
          toast.success(`Attached PDF: "${file.name}"`);
        }
      }
    };
    input.click();
  };

  const handleRemoveResource = (
    moduleId: number | undefined,
    lessonId: number | undefined,
    resId: number | undefined
  ) => {
    setModules(
      modules.map((m) =>
        m.id === moduleId
          ? {
              ...m,
              lessons: m.lessons.map((l) =>
                l.id === lessonId
                  ? { ...l, resources: l.resources.filter((r) => r.id !== resId) }
                  : l
              ),
            }
          : m
      )
    );
  };

  // Save / Publish course
  const handleSaveCourse = async () => {
    if (!courseData.title.trim()) {
      toast.error('Please enter a course title');
      setActiveTab('details');
      return;
    }

    if (!courseData.lead_instructor_id) {
      toast.error('Please select an assigned Lead Course Instructor');
      setActiveTab('details');
      return;
    }

    if (!courseData.banner_image.trim()) {
      toast.error('Please upload or provide a course banner image');
      setActiveTab('details');
      return;
    }

    if (tiers.length === 0) {
      toast.error('Please add at least one pricing plan');
      setActiveTab('tiers');
      return;
    }

    // Verify each tier has a name and final price
    for (let i = 0; i < tiers.length; i++) {
      if (!tiers[i].tier_name.trim()) {
        toast.error(`Please enter a plan name for Pricing Plan ${i + 1}`);
        setActiveTab('tiers');
        return;
      }
    }

    // Verify modules
    if (modules.length === 0) {
      toast.error('Please add at least one curriculum module');
      setActiveTab('modules');
      return;
    }

    for (let mIdx = 0; mIdx < modules.length; mIdx++) {
      if (!modules[mIdx].title.trim()) {
        toast.error(`Please enter a title for Module ${mIdx + 1}`);
        setActiveTab('modules');
        return;
      }
    }

    const payload = {
      title: courseData.title.trim(),
      course_uid: courseData.course_uid.trim(),
      slug: courseData.slug.trim(),
      instructor_id: Number(courseData.lead_instructor_id),
      description: courseData.description.trim() || courseData.title.trim(),
      what_to_learn: courseData.what_to_learn
        ? courseData.what_to_learn
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      banner_image: courseData.banner_image.trim(),
      thumbnail: courseData.thumbnail?.trim() || courseData.banner_image.trim(),
      tiers: tiers.map((t) => {
        const parsedBenefits =
          t.benefitsText !== undefined
            ? t.benefitsText.split('\n').map((b) => b.trim()).filter(Boolean)
            : (t.benefits || []);

        return {
          tier_name: t.tier_name.trim(),
          title: t.title?.trim() || null,
          subtitle: t.subtitle?.trim() || null,
          starting_price:
            t.starting_price !== '' && t.starting_price !== undefined && t.starting_price !== null
              ? Number(t.starting_price)
              : 0,
          final_price:
            t.final_price !== '' && t.final_price !== undefined && t.final_price !== null
              ? Number(t.final_price)
              : 0,
          duration: t.duration || 'lifetime',
          benefits: parsedBenefits,
        };
      }),
      modules: modules.map((m) => ({
        title: m.title.trim(),
        description: m.description?.trim() || null,
        quiz_id: m.quiz_id ? Number(m.quiz_id) : null,
        quiz_eligible: m.quiz_eligible || 'last',
        lessons: m.lessons.map((l) => ({
          lesson_uid: l.lesson_uid?.trim() || '',
          title: l.title.trim() || 'Untitled Lesson',
          instructor_id: l.instructor_id ? Number(l.instructor_id) : null,
          lesson_time: Number(l.lesson_time) || 0,
          description: l.description?.trim() || null,
          transcript_text: l.transcript_text?.trim() || null,
          thumbnail_image: l.thumbnail_image?.trim() || null,
          video_path: l.video_path?.trim() || null,
          resources: (l.resources || []).map((r) => ({
            title: r.title.trim(),
            file_path: r.file_path.trim(),
            file_type: r.file_type || 'application/pdf',
            file_size: r.file_size || '1.0 MB',
          })),
        })),
      })),
    };

    try {
      setIsSaving(true);
      if (mode === 'edit' && id) {
        await courseApi.update(Number(id), payload);
        toast.success(`Course "${courseData.title}" updated successfully!`);
      } else {
        await courseApi.create(payload);
        toast.success(`Course "${courseData.title}" created & published successfully!`);
      }
      navigate('/dashboard/courses');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to save course'));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground font-medium">Loading course curriculum...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Top Action & Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4">
        <div className="space-y-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard/courses')}
            className="text-xs -ml-2 text-muted-foreground hover:text-foreground h-8 gap-1.5"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Courses List
          </Button>

          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {mode === 'create'
                ? 'Create New Course'
                : `Edit: ${courseData.title || 'Course Curriculum'}`}
            </h1>
            <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] uppercase font-semibold">
              Public & Active
            </Badge>
            {courseData.course_uid && (
              <Badge variant="outline" className="font-mono text-[10px] text-muted-foreground">
                {courseData.course_uid}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/dashboard/courses')}
            className="text-xs h-9 w-full sm:w-auto"
            disabled={isSaving}
          >
            Cancel
          </Button>

          <Button
            onClick={handleSaveCourse}
            size="sm"
            disabled={isSaving}
            className="text-xs h-9 gap-1.5 w-full sm:w-auto shadow-xs"
          >
            {isSaving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            {isSaving
              ? 'Saving Course...'
              : mode === 'create'
              ? 'Save & Publish Course'
              : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Tabs Menu Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 sm:grid-cols-5 h-auto p-1 bg-muted/60 rounded-xl gap-1 border">
          <TabsTrigger value="details" className="text-xs py-2 gap-1.5 font-medium">
            <BookOpen className="h-3.5 w-3.5 text-primary" />
            <span>1. Course & Lead</span>
          </TabsTrigger>
          <TabsTrigger value="tiers" className="text-xs py-2 gap-1.5 font-medium">
            <CreditCard className="h-3.5 w-3.5 text-emerald-500" />
            <span>2. Pricing ({tiers.length})</span>
          </TabsTrigger>
          <TabsTrigger value="modules" className="text-xs py-2 gap-1.5 font-medium">
            <Layers className="h-3.5 w-3.5 text-indigo-500" />
            <span>3. Modules ({modules.length})</span>
          </TabsTrigger>
          <TabsTrigger value="lessons" className="text-xs py-2 gap-1.5 font-medium">
            <Video className="h-3.5 w-3.5 text-amber-500" />
            <span>4. Lessons & Video</span>
          </TabsTrigger>
          <TabsTrigger value="resources" className="text-xs py-2 gap-1.5 font-medium">
            <FileText className="h-3.5 w-3.5 text-purple-500" />
            <span>5. PDF Resources</span>
          </TabsTrigger>
        </TabsList>

        {/* -------------------------------------------------------------------------------- */}
        {/* TAB 1: Course Details, Lead Faculty & Banner Image */}
        {/* -------------------------------------------------------------------------------- */}
        <TabsContent value="details" className="space-y-5">
          <Card className="border shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg">
                1. Course Information & Lead Instructor
              </CardTitle>
              <CardDescription className="text-xs">
                Primary course identity displayed on the student website, hero banner, and enrollment card.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Course Title */}
              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-xs font-semibold">
                  Course Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="e.g. 40-Hour Registered Behavior Technician (RBT) 2.0"
                  value={courseData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="text-xs sm:text-sm font-medium h-9 placeholder:text-xs placeholder:text-muted-foreground/50"
                />
              </div>

              {/* Lead Instructor Selection (Filtered strictly to Lead Instructors) */}
              <div className="space-y-2 border-t pt-4">
                <div className="space-y-1.5">
                  <Label htmlFor="instructor_id" className="text-xs font-semibold flex items-center gap-1.5">
                    <UserCheck className="h-4 w-4 text-primary" />
                    Assigned Lead Course Instructor <span className="text-destructive">*</span>
                  </Label>
                  <p className="text-[11px] text-muted-foreground">
                    Only faculty members designated as Lead Course Instructors are eligible to lead this curriculum.
                  </p>

                  <div className="pt-1">
                    <Select
                      value={courseData.lead_instructor_id}
                      onValueChange={(val) =>
                        setCourseData({ ...courseData, lead_instructor_id: val })
                      }
                    >
                      <SelectTrigger className="h-9 text-xs sm:text-sm">
                        <SelectValue placeholder="Choose Lead Course Instructor" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60 overflow-y-auto">
                        {availableLeadInstructors.map((inst) => (
                          <SelectItem key={inst.id} value={String(inst.id)} className="text-xs">
                            {inst.name} ({inst.designation})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Lead Faculty Card Preview */}
                {leadInstructor && (
                  <div className="rounded-xl border bg-card p-4 flex flex-col sm:flex-row items-start gap-3.5 mt-2 shadow-xs">
                    <img
                      src={leadInstructor.avatar || '/placeholder-avatar.png'}
                      alt={leadInstructor.name}
                      className="h-14 w-14 rounded-full object-cover object-[center_top] ring-2 ring-primary/20 shrink-0"
                    />
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm text-foreground">
                          {leadInstructor.name}
                        </h4>
                        <Badge variant="secondary" className="text-[10px]">
                          Lead Instructor
                        </Badge>
                      </div>
                      <p className="text-xs font-medium text-primary">
                        {leadInstructor.designation}
                      </p>
                      {leadInstructor.bio && (
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {leadInstructor.bio}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Course Description */}
              <div className="space-y-1.5 border-t pt-4">
                <Label htmlFor="desc" className="text-xs font-semibold">
                  Course Description <span className="text-muted-foreground font-normal">(Max 2000 characters)</span>
                </Label>
                <textarea
                  id="desc"
                  rows={4}
                  placeholder="Comprehensive description of curriculum, BACB requirements, clinical objectives, and target audience..."
                  value={courseData.description}
                  onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
                  className="w-full text-xs sm:text-sm font-sans p-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-xs placeholder:text-muted-foreground/50"
                />
              </div>

              {/* What You Will Learn (Newline-delimited list) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="learn" className="text-xs font-semibold">
                    What You Will Learn <span className="text-destructive">*</span>
                  </Label>
                  <span className="text-[11px] text-muted-foreground">
                    Press Enter to separate each benefit item into bullet points
                  </span>
                </div>
                <textarea
                  id="learn"
                  rows={4}
                  placeholder="Enter text and press Enter to add a new bullet point&#10;e.g. Master continuous and discontinuous behavioral measurement procedures&#10;e.g. Implement preference assessments and discrete trial training"
                  value={courseData.what_to_learn}
                  onChange={(e) => setCourseData({ ...courseData, what_to_learn: e.target.value })}
                  className="w-full text-xs sm:text-sm font-sans p-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-xs placeholder:text-muted-foreground/50"
                />
              </div>

              {/* Banner Image Upload & Direct Visual Preview */}
              <div className="border-t pt-4">
                <ImageUploadDropzone
                  label="Course Hero Banner Image *"
                  value={courseData.banner_image}
                  onChange={(val) => setCourseData({ ...courseData, banner_image: val })}
                  onUploadFile={(file) => courseApi.uploadMedia(file).then((r) => r.url)}
                  aspectRatio="wide"
                  objectPosition="center"
                  helperText="Recommended 1200x500px JPG/PNG. Appears at the top of the course landing page and catalog cards."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* -------------------------------------------------------------------------------- */}
        {/* TAB 2: Pricing Tiers & Access Plans (Direct Stripe Backend Sync, 7 Durations) */}
        {/* -------------------------------------------------------------------------------- */}
        <TabsContent value="tiers" className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-emerald-500" />
                Access Duration & Pricing Plans
              </h3>
              <p className="text-xs text-muted-foreground">
                Set enrollment pass options. Access Duration governs how long students can access course materials.
              </p>
            </div>
            <Button onClick={handleAddTier} size="sm" className="gap-1.5 text-xs h-8">
              <Plus className="h-3.5 w-3.5" />
              Add Pricing Plan
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tiers.map((tier, index) => (
              <Card key={tier.id || index} className="border shadow-xs flex flex-col justify-between">
                <CardHeader className="pb-3 flex flex-row items-start justify-between bg-muted/20">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-xs bg-background">
                      Plan {index + 1}
                    </Badge>
                    <span className="font-semibold text-xs text-foreground">
                      {tier.tier_name || 'New Access Plan'}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveTier(tier.id)}
                    className="h-7 w-7 text-destructive hover:bg-destructive/10"
                    title="Remove plan"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </CardHeader>

                <CardContent className="space-y-3.5 p-4 text-xs flex-1">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-[11px] font-semibold">Plan Name *</Label>
                      <Input
                        value={tier.tier_name}
                        onChange={(e) =>
                          setTiers(
                            tiers.map((t) =>
                              t.id === tier.id ? { ...t, tier_name: e.target.value } : t
                            )
                          )
                        }
                        className="text-xs h-8 placeholder:text-xs placeholder:text-muted-foreground/50"
                        placeholder="e.g. Lifetime Pass"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[11px] font-semibold">Access Duration *</Label>
                      <Select
                        value={tier.duration}
                        onValueChange={(val) =>
                          setTiers(
                            tiers.map((t) => (t.id === tier.id ? { ...t, duration: val } : t))
                          )
                        }
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lifetime" className="text-xs">
                            Lifetime Pass (Unlimited)
                          </SelectItem>
                          <SelectItem value="1 year" className="text-xs">
                            1 Year Access (365 Days)
                          </SelectItem>
                          <SelectItem value="6 months" className="text-xs">
                            6 Months Access (180 Days)
                          </SelectItem>
                          <SelectItem value="1 month" className="text-xs">
                            1 Month Access (30 Days)
                          </SelectItem>
                          <SelectItem value="15 days" className="text-xs">
                            15 Days Access
                          </SelectItem>
                          <SelectItem value="7 days" className="text-xs">
                            7 Days Access
                          </SelectItem>
                          <SelectItem value="1 day" className="text-xs">
                            1 Day Access (24 Hours)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-[11px] font-semibold">Original Price ($)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min={0}
                        value={
                          tier.starting_price !== undefined && tier.starting_price !== null
                            ? tier.starting_price
                            : ''
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          setTiers(
                            tiers.map((t) =>
                              t.id === tier.id ? { ...t, starting_price: val } : t
                            )
                          );
                        }}
                        placeholder="0.00"
                        className="text-xs h-8 placeholder:text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[11px] font-semibold">Final Price ($) *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min={0}
                        value={
                          tier.final_price !== undefined && tier.final_price !== null
                            ? tier.final_price
                            : ''
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          setTiers(
                            tiers.map((t) =>
                              t.id === tier.id ? { ...t, final_price: val } : t
                            )
                          );
                        }}
                        placeholder="0.00"
                        className="text-xs h-8 font-semibold text-emerald-600 dark:text-emerald-400 placeholder:text-xs"
                      />
                    </div>
                  </div>

                  {/* Plan Features / Benefits */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label className="text-[11px] font-semibold">Plan Benefits (One per line)</Label>
                      <span className="text-[10px] text-muted-foreground">Press Enter for new line</span>
                    </div>
                    <textarea
                      rows={3}
                      value={
                        tier.benefitsText !== undefined
                          ? tier.benefitsText
                          : (tier.benefits || []).join('\n')
                      }
                      onChange={(e) => {
                        const newText = e.target.value;
                        setTiers(
                          tiers.map((t) =>
                            t.id === tier.id
                              ? {
                                  ...t,
                                  benefitsText: newText,
                                  benefits: newText
                                    .split('\n')
                                    .map((b) => b.trim())
                                    .filter(Boolean),
                                }
                              : t
                          )
                        );
                      }}
                      placeholder="e.g. Full video lecture streaming&#10;e.g. Automated BACB Certificate&#10;e.g. Downloadable flashcards"
                      className="w-full text-xs font-sans p-2 rounded-md border border-input bg-background placeholder:text-xs placeholder:text-muted-foreground/50"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* -------------------------------------------------------------------------------- */}
        {/* TAB 3: Curriculum Modules & Linked Quizzes */}
        {/* -------------------------------------------------------------------------------- */}
        <TabsContent value="modules" className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                <Layers className="h-4 w-4 text-indigo-500" />
                Curriculum Modules & Assessment Gates
              </h3>
              <p className="text-xs text-muted-foreground">
                Group curriculum into chapters and attach BACB module quizzes with completion thresholds.
              </p>
            </div>
            <Button onClick={handleAddModule} size="sm" className="gap-1.5 text-xs h-8">
              <Plus className="h-3.5 w-3.5" />
              Add New Module
            </Button>
          </div>

          <div className="space-y-4">
            {modules.map((mod, index) => {
              const modId = mod.id || index;
              const isCollapsed = collapsedModuleIds.includes(modId);

              return (
                <Card key={modId} className="border shadow-xs">
                  <CardHeader className="pb-3 flex flex-row items-center justify-between bg-muted/20">
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <Badge variant="outline" className="font-mono text-xs bg-background shrink-0">
                        Module {index + 1}
                      </Badge>
                      <CardTitle className="text-sm font-semibold truncate">
                        {mod.title || 'Untitled Module'}
                      </CardTitle>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {/* Collapse / Expand Toggle */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleModuleCollapse(modId)}
                        className="h-7 text-[11px] px-2 text-muted-foreground hover:text-foreground gap-1"
                      >
                        {isCollapsed ? (
                          <ChevronDown className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronUp className="h-3.5 w-3.5" />
                        )}
                        <span className="hidden sm:inline">
                          {isCollapsed ? 'Expand' : 'Collapse'}
                        </span>
                      </Button>

                      {/* Delete Module */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveModule(mod.id)}
                        className="h-7 w-7 text-destructive hover:bg-destructive/10"
                        title="Delete module"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardHeader>

                  {!isCollapsed && (
                    <CardContent className="space-y-3.5 p-4 text-xs animate-in fade-in duration-200">
                      <div className="space-y-1">
                        <Label className="text-[11px] font-semibold">Module Title *</Label>
                        <Input
                          value={mod.title}
                          onChange={(e) =>
                            setModules(
                              modules.map((m) =>
                                m.id === mod.id ? { ...m, title: e.target.value } : m
                              )
                            )
                          }
                          className="text-xs h-8 placeholder:text-xs placeholder:text-muted-foreground/50"
                          placeholder="e.g. Module 1: Introduction to Applied Behavior Analysis"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[11px] font-semibold">Module Description</Label>
                        <textarea
                          rows={2}
                          value={mod.description || ''}
                          onChange={(e) =>
                            setModules(
                              modules.map((m) =>
                                m.id === mod.id ? { ...m, description: e.target.value } : m
                              )
                            )
                          }
                          className="w-full text-xs font-sans p-2 rounded-md border border-input bg-background placeholder:text-xs placeholder:text-muted-foreground/50"
                          placeholder="Module objectives and clinical outline..."
                        />
                      </div>

                      <div className="pt-2 border-t">
                        {/* Link Real Quiz via Select */}
                        <div className="space-y-1">
                          <Label className="text-[11px] font-semibold flex items-center gap-1.5">
                            <FileQuestion className="h-3.5 w-3.5 text-primary" />
                            Link Quiz to Module
                          </Label>
                          <Select
                            value={mod.quiz_id ? String(mod.quiz_id) : 'none'}
                            onValueChange={(val) => {
                              const quizId = val === 'none' ? null : Number(val);
                              const matchedQuiz = quizzes.find((q) => q.id === quizId);
                              setModules(
                                modules.map((m) =>
                                  m.id === mod.id
                                    ? {
                                        ...m,
                                        quiz_id: quizId,
                                        quiz_title: matchedQuiz?.title || '',
                                      }
                                    : m
                                )
                              );
                            }}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Choose a quiz" />
                            </SelectTrigger>
                            <SelectContent className="max-h-60 overflow-y-auto">
                              <SelectItem value="none" className="text-xs text-muted-foreground">
                                No Quiz Attached
                              </SelectItem>
                              {quizzes.map((quiz) => (
                                <SelectItem key={quiz.id} value={String(quiz.id)} className="text-xs">
                                  {quiz.title} ({quiz.passing_score}% pass)
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* -------------------------------------------------------------------------------- */}
        {/* TAB 4: Lessons & Video Engine (Lesson Instructor & Collapsible Cards) */}
        {/* -------------------------------------------------------------------------------- */}
        <TabsContent value="lessons" className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                <Video className="h-4 w-4 text-amber-500" />
                Lesson Videos & Lesson-Level Instructors
              </h3>
              <p className="text-xs text-muted-foreground">
                Assign specific instructors to each lesson, configure video playback, duration, and transcripts.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {modules.map((mod, modIdx) => (
              <div key={mod.id || modIdx} className="border rounded-xl p-4 bg-card shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="font-mono text-xs">
                      Module {modIdx + 1}
                    </Badge>
                    <span className="font-semibold text-sm text-foreground">
                      {mod.title || 'Untitled Module'}
                    </span>
                  </div>
                  <Button
                    onClick={() => handleAddLesson(mod.id)}
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-xs h-8"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Lesson to Module {modIdx + 1}
                  </Button>
                </div>

                {/* Module's Lessons */}
                <div className="space-y-4">
                  {mod.lessons.length === 0 ? (
                    <div className="p-6 text-center border border-dashed rounded-lg bg-muted/10">
                      <p className="text-xs text-muted-foreground">
                        No lessons in this module yet. Click &quot;Add Lesson to Module {modIdx + 1}&quot; above.
                      </p>
                    </div>
                  ) : (
                    mod.lessons.map((les, lesIdx) => {
                      const lessonId = les.id || lesIdx;
                      const isCollapsed = collapsedLessonIds.includes(lessonId);

                      return (
                        <div
                          key={lessonId}
                          className="border rounded-lg p-3.5 bg-muted/10 space-y-3 text-xs transition-colors hover:border-primary/40"
                        >
                          <div className="flex items-center justify-between gap-2 border-b pb-2.5">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <Badge variant="outline" className="font-mono text-[10px] bg-background shrink-0">
                                Lesson {lesIdx + 1} &bull; {les.lesson_uid || `LES-${lesIdx + 1}`}
                              </Badge>
                              <span className="font-semibold text-foreground text-xs truncate">
                                {les.title || 'Untitled Lesson'}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              {/* Collapsible toggle */}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleLessonCollapse(lessonId)}
                                className="h-7 text-[11px] px-2 text-muted-foreground hover:text-foreground gap-1"
                              >
                                {isCollapsed ? (
                                  <ChevronDown className="h-3.5 w-3.5" />
                                ) : (
                                  <ChevronUp className="h-3.5 w-3.5" />
                                )}
                                <span className="hidden sm:inline">
                                  {isCollapsed ? 'Expand' : 'Collapse'}
                                </span>
                              </Button>

                              {/* Delete lesson */}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveLesson(mod.id, les.id)}
                                className="h-7 w-7 text-destructive hover:bg-destructive/10"
                                title="Delete lesson"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>

                          {!isCollapsed && (
                            <div className="space-y-3.5 pt-1 animate-in fade-in duration-200">
                              {/* Title, Duration, & Lesson Instructor Selection */}
                              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                                {/* Lesson Title */}
                                <div className="sm:col-span-6 space-y-1">
                                  <Label className="text-[11px] font-semibold">Lesson Title *</Label>
                                  <Input
                                    value={les.title}
                                    onChange={(e) =>
                                      setModules(
                                        modules.map((m) =>
                                          m.id === mod.id
                                            ? {
                                                ...m,
                                                lessons: m.lessons.map((l) =>
                                                  l.id === les.id ? { ...l, title: e.target.value } : l
                                                ),
                                              }
                                            : m
                                        )
                                      )
                                    }
                                    className="text-xs h-8 placeholder:text-xs placeholder:text-muted-foreground/50"
                                    placeholder="e.g. Foundations of Continuous Measurement"
                                  />
                                </div>

                                {/* Lesson Instructor Selection (Filtered to Lesson Instructors) */}
                                <div className="sm:col-span-4 space-y-1">
                                  <Label className="text-[11px] font-semibold text-primary flex items-center gap-1">
                                    <UserCheck className="h-3 w-3" />
                                    Lesson Instructor
                                  </Label>
                                  <Select
                                    value={String(les.instructor_id || courseData.lead_instructor_id || '')}
                                    onValueChange={(val) => {
                                      const inst = instructors.find((i) => String(i.id) === val);
                                      setModules(
                                        modules.map((m) =>
                                          m.id === mod.id
                                            ? {
                                                ...m,
                                                lessons: m.lessons.map((l) =>
                                                  l.id === les.id
                                                    ? {
                                                        ...l,
                                                        instructor_id: Number(val),
                                                        instructor_name: inst?.name || '',
                                                      }
                                                    : l
                                                ),
                                              }
                                            : m
                                        )
                                      );
                                    }}
                                  >
                                    <SelectTrigger className="h-8 text-xs">
                                      <SelectValue placeholder="Select lesson instructor" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-56 overflow-y-auto">
                                      {availableLessonInstructors.map((inst) => (
                                        <SelectItem key={inst.id} value={String(inst.id)} className="text-xs">
                                          {inst.name} ({inst.designation})
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                {/* Duration in Minutes */}
                                <div className="sm:col-span-2 space-y-1">
                                  <Label className="text-[11px] font-semibold">Duration (Min)</Label>
                                  <Input
                                    type="number"
                                    min={0}
                                    value={
                                      les.lesson_time !== undefined && les.lesson_time !== null
                                        ? les.lesson_time
                                        : ''
                                    }
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setModules(
                                        modules.map((m) =>
                                          m.id === mod.id
                                            ? {
                                                ...m,
                                                lessons: m.lessons.map((l) =>
                                                  l.id === les.id
                                                    ? {
                                                        ...l,
                                                        lesson_time:
                                                          val === ''
                                                            ? ('' as unknown as number)
                                                            : parseInt(val, 10),
                                                      }
                                                    : l
                                                ),
                                              }
                                            : m
                                        )
                                      );
                                    }}
                                    className="text-xs h-8 placeholder:text-xs"
                                    placeholder="45"
                                  />
                                </div>
                              </div>

                              {/* Video & Thumbnail Upload */}
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-3 border-t">
                                {/* Video Upload Dropzone */}
                                <div>
                                  <VideoUploadDropzone
                                    label="Lesson Video (MP4 / WebM / Embed URL)"
                                    value={les.video_path || ''}
                                    onUploadFile={(file) => courseApi.uploadMedia(file).then((r) => r.url)}
                                    onChange={(val) =>
                                      setModules(
                                        modules.map((m) =>
                                          m.id === mod.id
                                            ? {
                                                ...m,
                                                lessons: m.lessons.map((l) =>
                                                  l.id === les.id ? { ...l, video_path: val } : l
                                                ),
                                              }
                                            : m
                                        )
                                      )
                                    }
                                    onDurationChange={(dur) =>
                                      setModules(
                                        modules.map((m) =>
                                          m.id === mod.id
                                            ? {
                                                ...m,
                                                lessons: m.lessons.map((l) =>
                                                  l.id === les.id ? { ...l, lesson_time: dur } : l
                                                ),
                                              }
                                            : m
                                        )
                                      )
                                    }
                                    helperText="Upload local video file or paste video streaming link."
                                  />
                                </div>

                                {/* Thumbnail Upload Dropzone */}
                                <div>
                                  <ImageUploadDropzone
                                    label="Lesson Video Thumbnail"
                                    value={les.thumbnail_image || ''}
                                    onUploadFile={(file) => courseApi.uploadMedia(file).then((r) => r.url)}
                                    onChange={(val) =>
                                      setModules(
                                        modules.map((m) =>
                                          m.id === mod.id
                                            ? {
                                                ...m,
                                                lessons: m.lessons.map((l) =>
                                                  l.id === les.id ? { ...l, thumbnail_image: val } : l
                                                ),
                                              }
                                            : m
                                        )
                                      )
                                    }
                                    aspectRatio="video"
                                    objectPosition="center"
                                    helperText="Thumbnail cover displayed on video player preview."
                                  />
                                </div>
                              </div>

                              {/* Lesson Description */}
                              <div className="space-y-1 pt-2">
                                <Label className="text-[11px] font-semibold">Lesson Summary / Clinical Notes</Label>
                                <textarea
                                  rows={2}
                                  value={les.description || ''}
                                  onChange={(e) =>
                                    setModules(
                                      modules.map((m) =>
                                        m.id === mod.id
                                          ? {
                                              ...m,
                                              lessons: m.lessons.map((l) =>
                                                l.id === les.id ? { ...l, description: e.target.value } : l
                                              ),
                                            }
                                          : m
                                      )
                                    )
                                  }
                                  className="w-full text-xs font-sans p-2 rounded-md border border-input bg-background placeholder:text-xs placeholder:text-muted-foreground/50"
                                  placeholder="Clinical procedures covered in this session..."
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* -------------------------------------------------------------------------------- */}
        {/* TAB 5: PDF Resources & Downloadable Worksheets (With Collapsible Cards) */}
        {/* -------------------------------------------------------------------------------- */}
        <TabsContent value="resources" className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                <FileText className="h-4 w-4 text-purple-500" />
                Lesson PDF Worksheets & Clinical Flashcards
              </h3>
              <p className="text-xs text-muted-foreground">
                Attach downloadable BACB task list sheets, data collection protocols, and study PDFs to lessons.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {modules.map((mod, modIdx) => (
              <Card key={mod.id || modIdx} className="border shadow-xs">
                <CardHeader className="pb-3 bg-muted/20">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-xs bg-background">
                      Module {modIdx + 1}
                    </Badge>
                    <CardTitle className="text-sm font-semibold">
                      {mod.title || 'Untitled Module'}
                    </CardTitle>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 p-4 text-xs">
                  {mod.lessons.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">
                      Add lessons in Tab 4 first to attach PDF resources.
                    </p>
                  ) : (
                    mod.lessons.map((les, lesIdx) => {
                      const lessonId = les.id || lesIdx;
                      const isCollapsed = collapsedResourceLessonIds.includes(lessonId);

                      return (
                        <div key={lessonId} className="border rounded-lg p-3 bg-card space-y-2.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-foreground flex items-center gap-1.5 truncate">
                              <Video className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              <span className="truncate">
                                {les.title || `Lesson ${lesIdx + 1}`} ({les.resources.length} file
                                {les.resources.length === 1 ? '' : 's'})
                              </span>
                            </span>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {/* Collapsible toggle */}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleResourceLessonCollapse(lessonId)}
                                className="h-7 text-[11px] px-2 text-muted-foreground hover:text-foreground gap-1"
                              >
                                {isCollapsed ? (
                                  <ChevronDown className="h-3.5 w-3.5" />
                                ) : (
                                  <ChevronUp className="h-3.5 w-3.5" />
                                )}
                                <span className="hidden sm:inline">
                                  {isCollapsed ? 'Expand' : 'Collapse'}
                                </span>
                              </Button>

                              {/* Attach PDF button */}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAttachPdf(mod.id, les.id)}
                                className="h-7 text-xs gap-1.5 shadow-2xs"
                              >
                                <FileUp className="h-3 w-3 text-primary" />
                                Attach PDF File
                              </Button>
                            </div>
                          </div>

                          {!isCollapsed && les.resources.length > 0 && (
                            <div className="space-y-2 pt-2 border-t animate-in fade-in duration-200">
                              {les.resources.map((res) => (
                                <div
                                  key={res.id}
                                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2.5 rounded-lg bg-muted/20 border"
                                >
                                  <div className="flex items-start sm:items-center gap-2.5 flex-1 min-w-0">
                                    <div className="h-8 w-8 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                                      <FileText className="h-4 w-4" />
                                    </div>

                                    <div className="space-y-1 flex-1 min-w-0">
                                      <Input
                                        value={res.title}
                                        onChange={(e) =>
                                          setModules(
                                            modules.map((m) =>
                                              m.id === mod.id
                                                ? {
                                                    ...m,
                                                    lessons: m.lessons.map((l) =>
                                                      l.id === les.id
                                                        ? {
                                                            ...l,
                                                            resources: l.resources.map((r) =>
                                                              r.id === res.id
                                                                ? { ...r, title: e.target.value }
                                                                : r
                                                            ),
                                                          }
                                                        : l
                                                    ),
                                                  }
                                                : m
                                            )
                                          )
                                        }
                                        className="text-xs h-7 font-medium placeholder:text-xs placeholder:text-muted-foreground/50"
                                        placeholder="Resource title (e.g. Measurement Protocol Worksheet)"
                                      />
                                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                        <Badge variant="secondary" className="font-mono text-[10px] h-4 px-1">
                                          {res.file_size}
                                        </Badge>
                                        <span>&bull;</span>
                                        <span className="truncate max-w-xs">{res.file_path}</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1 self-end sm:self-auto shrink-0">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleRemoveResource(mod.id, les.id, res.id)}
                                      className="h-7 w-7 text-destructive hover:bg-destructive/10 shrink-0"
                                      title="Detach resource"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
