import { useState, useEffect } from 'react';
import {
  Globe,
  Save,
  Home,
  Phone,
  HelpCircle,
  FileText,
  Plus,
  Trash2,
  Edit2,
  Check,
  Sparkles,
  Share2,
  BookOpen,
  Info,
  Layers,
  Award,
  Video,
  MessageSquare,
  Compass,
  GraduationCap,
  HeartHandshake,
  Workflow,
  Search,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImageUploadDropzone } from '@/components/ui/image-upload-dropzone';
import { VideoUploadDropzone } from '@/components/ui/video-upload-dropzone';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { cmsApi } from '@/services/cmsApi';
import { toast } from 'sonner';

interface FaqItem {
  id: number;
  question: string;
  answer: string;
}

// Reusable upload helper for icon/image files
const uploadImage = async (file: File): Promise<string> => {
  if (!file.type.startsWith('image/')) {
    toast.error('Please upload a valid image file (PNG, JPG, WebP, SVG)');
    throw new Error('Invalid file type');
  }

  // 1. Try backend storage upload if server endpoint is active
  try {
    const res = await cmsApi.uploadMedia(file);
    if (res?.url) {
      toast.success('Image uploaded successfully');
      return res.url;
    }
  } catch (err) {
    console.warn('Backend upload unavailable, falling back to local preview:', err);
  }

  // 2. Fallback to instant local base64 preview so admin UI stays 100% functional
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        toast.success('Image selected successfully');
        resolve(result);
      } else {
        reject(new Error('Failed to read image'));
      }
    };
    reader.onerror = () => {
      toast.error('Failed to read image file');
      reject(new Error('File read error'));
    };
    reader.readAsDataURL(file);
  });
};

export default function CmsPage() {
  // -------------------------------------------------------------
  // 1. HOMEPAGE CMS STATE (from /admin/webpages/homepage/)
  // -------------------------------------------------------------

  // Head Section (Order 1: Title, Subtitle, Buttons)
  const [homeHead, setHomeHead] = useState({
    title: 'Accredited 40-Hour BACB Registered Behavior Technician Training',
    subtitle:
      'Master Applied Behavior Analysis (ABA) with interactive video lectures, competency quizzes, and digital verified certificates.',
    btn_1: 'Start Training',
    btn_2: 'Login',
  });

  // Hero Section (Order 2: 4 Images + 3 Badges/Pills)
  const [homeHero, setHomeHero] = useState({
    image_1:
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80',
    image_2:
      'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800&auto=format&fit=crop&q=80',
    image_3:
      'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800&auto=format&fit=crop&q=80',
    image_4:
      'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop&q=80',
    pill_1: 'BACB Aligned',
    pill_2: '100% Online',
    pill_3: 'Certificate Included',
  });

  // Process Section (Order 3: Title 1, Image, 4 Process steps)
  const [homeProcess, setHomeProcess] = useState({
    title: 'How Future Behavior Analysis Accelerates Your RBT Certification Journey',
    image:
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1000&auto=format&fit=crop&q=80',
    steps: [
      {
        order: 1,
        title: 'Step 1: 100% Online Enrollment',
        subtitle: 'Instant onboarding with modular course chapters accessible 24/7 on any device.',
      },
      {
        order: 2,
        title: 'Step 2: 40-Hour Task List Modules',
        subtitle: 'Complete video coursework covering all 2nd Edition BACB curriculum areas.',
      },
      {
        order: 3,
        title: 'Step 3: Competency & Quizzes',
        subtitle: 'Pass end-of-module interactive assessments with immediate rationale feedback.',
      },
      {
        order: 4,
        title: 'Step 4: Verified Certificate',
        subtitle: 'Download your cryptographically authenticated certificate with instant QR registry verification.',
      },
    ],
  });

  // What Sets Us Apart / Info Icons (Order 4: Head left + 5 items right)
  const [homeInfoIcons, setHomeInfoIcons] = useState({
    head_subtitle: 'Why Choose Us',
    head_title: 'What Sets Us Apart in ABA Healthcare Education',
    head_image:
      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=80',
    head_btn: 'Explore Full Curriculum',
    items: [
      {
        order: 1,
        title: 'Expert BCBA Instruction',
        subtitle: 'Created by seasoned BCBA-D doctoral clinicians with real clinical field application.',
        image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80',
      },
      {
        order: 2,
        title: 'Interactive Case Studies',
        subtitle: 'Engage with simulated behavioral scenarios and real-world intervention planning.',
        image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
      },
      {
        order: 3,
        title: 'Instant Exam Prep Tools',
        subtitle: 'Hundreds of practice questions mapped precisely to the BACB task list specifications.',
        image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&auto=format&fit=crop&q=80',
      },
      {
        order: 4,
        title: 'Self-Paced Flexible Access',
        subtitle: 'Unlimited 180-day course access to fit your work and family schedule.',
        image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&auto=format&fit=crop&q=80',
      },
      {
        order: 5,
        title: 'Digital Credential Verification',
        subtitle: 'Instant QR code verification for employers, clinics, and regulatory boards.',
        image: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=400&auto=format&fit=crop&q=80',
      },
    ],
  });

  // Course Cards (Order 5: Head + 3 Cards)
  const [homeCourseCards, setHomeCourseCards] = useState({
    head_subtitle: 'Accredited Programs',
    head_title: 'Select Your Training Pathway & Start Today',
    cards: [
      {
        order: 1,
        title: '40-Hour RBT Training Program',
        subtitle: 'Comprehensive foundational training fulfilling BACB 2.0 Task List educational requirements.',
        image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&auto=format&fit=crop&q=80',
      },
      {
        order: 2,
        title: 'RBT Competency Assessment Prep',
        subtitle: 'Intensive practice and guidance to prepare for initial and renewal competency evaluations.',
        image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80',
      },
      {
        order: 3,
        title: 'Mock Exam & Practice Test Bundle',
        subtitle: '5 full-length timed mock exams with detailed explanations to maximize your pass score.',
        image: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=600&auto=format&fit=crop&q=80',
      },
    ],
  });

  // Starrer / Featured Instructor (Order 6)
  const [homeStarrer, setHomeStarrer] = useState({
    title: 'Dr. Sarah Jenkins, BCBA-D',
    subtitle: 'Ph.D., Board Certified Behavior Analyst - Doctoral',
    detail:
      'With over 15 years of clinical practice and university instruction, Dr. Jenkins designs our curriculum to bridge theoretical behavioral principles with effective hands-on patient intervention.',
    image:
      'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&auto=format&fit=crop&q=80',
  });

  // Feedback Head (Order 7)
  const [homeFeedback, setHomeFeedback] = useState({
    title: 'Trusted by Over 2,600+ Trainees and Top Behavioral Health Agencies',
    subtitle: 'See what certified technicians and clinic directors say about our training excellence.',
  });

  // Mission Section (Order 8)
  const [homeMission, setHomeMission] = useState({
    title: 'Our Mission: Quality Autism & Behavioral Health Services for Every Community',
    detail:
      'Future Behavior Analysis is dedicated to eliminating barriers in behavioral healthcare training. By making premier BACB-aligned education accessible, engaging, and clinically rigorous, we empower trainees to transform lives.',
    image:
      'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800&auto=format&fit=crop&q=80',
  });

  // -------------------------------------------------------------
  // 2. ABOUT US CMS STATE (from /admin/webpages/about_us)
  // -------------------------------------------------------------

  // Section 1: Program Info & Counters
  const [aboutProgram, setAboutProgram] = useState({
    title: 'Empowering the Next Generation of Behavior Analysts',
    detail:
      'Founded by certified clinicians and instructional technologists, our platform provides evidence-based curriculum designed to prepare compassionate, highly qualified Registered Behavior Technicians.',
    image_left:
      'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800&auto=format&fit=crop&q=80',
    image_right:
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80',
    button: 'Learn More About Our Team',
    counters: [
      { order: 2, number: '2,600+', label: 'Successfully Trained Learners' },
      { order: 3, number: '98%', label: 'First-Time Exam Pass Rate' },
      { order: 4, number: '40 Hrs', label: 'BACB Task List Aligned Hours' },
    ],
  });

  // Section 2: Watch & Learn / Demo Video + Video Thumbnail
  const [aboutWatch, setAboutWatch] = useState({
    title: 'Watch & Learn: See How Our Learning Platform Works',
    detail:
      'Take a quick virtual tour of our interactive modules, video lectures, and student portal before enrolling.',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnail:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1000&auto=format&fit=crop&q=80',
  });

  // Section 3: Career Changes Lives (Header + 3 Steps)
  const [aboutCareer, setAboutCareer] = useState({
    head_title: 'A Rewarding Career That Transforms Lives Every Day',
    head_detail:
      'Registered Behavior Technicians are in high demand nationwide, delivering critical behavioral interventions that help individuals with ASD and developmental needs achieve independence.',
    steps: [
      {
        order: 2,
        title: 'Step 1: Build Foundational ABA Knowledge',
        detail:
          'Learn measurement, assessment, skill acquisition, and behavior reduction protocols developed by BCBA faculty.',
      },
      {
        order: 3,
        title: 'Step 2: Complete the RBT Competency Assessment',
        detail:
          'Practice clinical demonstrations with direct supervisory feedback to verify hands-on execution.',
      },
      {
        order: 4,
        title: 'Step 3: Board Examination & Certification',
        detail:
          'Apply directly to the BACB with your verified Certificate UID and start working in premier clinical settings.',
      },
    ],
  });

  // Section 4: Commitment Cards (Header + 3 Cards)
  const [aboutCommitment, setAboutCommitment] = useState({
    head_title: 'Our Uncompromising Commitment to Educational Excellence',
    head_detail:
      'Every module is continuously updated to reflect the latest BACB ethical standards and evidence-based clinical practices.',
    cards: [
      {
        order: 2,
        title: 'Clinically Verified Content',
        detail:
          'Instruction crafted by practicing doctoral-level Board Certified Behavior Analysts.',
      },
      {
        order: 3,
        title: 'Transparent Accreditation',
        detail:
          'Independent curriculum strictly adhering to the 40-hour Registered Behavior Technician 2.0 Task List.',
      },
      {
        order: 4,
        title: 'Continuous Learner Support',
        detail:
          'Dedicated support team assisting trainees from initial enrollment through certificate validation.',
      },
    ],
  });

  // -------------------------------------------------------------
  // 3. CONTACT US CMS STATE (from /admin/webpages/contact)
  // -------------------------------------------------------------
  const [contactCms, setContactCms] = useState({
    title: 'Get in Touch with Our Administrative & Admissions Office',
    subtitle:
      'Have questions about course enrollment, BACB prerequisites, or group agency billing? Reach our advisory team directly.',
    phone: '+1 (800) 555-0199',
    email: 'admissions@futurebehavioranalysis.com',
    address: '100 Behavior Analysis Way, Suite 400, Los Angeles, CA 90001',
    business_hours: 'Monday - Friday: 8:00 AM - 6:00 PM PST',
    image:
      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=80',
    social_linkedin: 'https://linkedin.com/company/future-behavior-analysis',
    social_facebook: 'https://facebook.com/futurebehavioranalysis',
    social_twitter: 'https://twitter.com/fba_training',
    social_youtube: 'https://youtube.com/@fba_institute',
  });

  // -------------------------------------------------------------
  // 4. COURSE PAGE CMS STATE (from /admin/webpages/course-page/index)
  // -------------------------------------------------------------
  const [coursePageCms, setCoursePageCms] = useState({
    head_subtitle: 'Explore Online Training Modules',
    head_title: 'BACB 2nd Edition Registered Behavior Technician Curriculum',
    head_description:
      'Access comprehensive, self-paced ABA modules, downloadable task list summaries, and interactive competency check quizzes.',
    placeholder: 'Search modules, task list competencies, or exam prep topics...',
    widgets: [
      { name: 'Accreditation Badge', value: '40-Hour BACB 2.0 Compliant' },
      { name: 'Access Period', value: '180 Days Unlimited 24/7 Access' },
      { name: 'Credential Verification', value: 'Instant Public QR Certificate Registry' },
    ],
  });

  // -------------------------------------------------------------
  // 5. COMMON SECTIONS: FAQS & LEGAL POLICIES
  // -------------------------------------------------------------
  const [faqs, setFaqs] = useState<FaqItem[]>([
    {
      id: 1,
      question: 'Does this 40-hour course satisfy the BACB educational requirement for the RBT credential?',
      answer:
        'Yes. This training program is strictly based on the Registered Behavior Technician 2nd Edition Task List and is designed to meet the 40-hour training requirement for the RBT credential. The program is offered independently of the BACB.',
    },
    {
      id: 2,
      question: 'How do employers and supervisors verify my Certificate UID?',
      answer:
        'Every course graduate receives an official certificate featuring a secure Certificate UID and an encrypted QR code that opens our real-time verification portal.',
    },
    {
      id: 3,
      question: 'Can I access the training videos on mobile and tablet devices?',
      answer:
        'Yes. Our video player supports adaptive streaming and operates seamlessly on all smartphones, tablets, laptops, and desktop browsers.',
    },
    {
      id: 4,
      question: 'How long do I have to complete the 40-hour training coursework?',
      answer:
        'Trainees have 180 days from enrollment date to complete all video lectures and competency quizzes at their own pace.',
    },
  ]);

  const [editingFaqId, setEditingFaqId] = useState<number | null>(null);

  const [legalCms, setLegalCms] = useState({
    terms:
      'All course purchases grant individual trainee licenses. BACB certification exams are scheduled and administered directly through the Behavior Analyst Certification Board. Future Behavior Analysis provides educational training.',
    privacy:
      'We respect trainee confidentiality. Trainee educational progress and personal contact records are never sold, rented, or transferred to third-party marketing brokers.',
    bacb_disclaimer:
      'This training program is based on the Registered Behavior Technician (RBT) 2.0 Task List and is designed to meet the 40-hour training requirement for the RBT credential. This program is offered independently of the BACB.',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savingSection, setSavingSection] = useState<string | null>(null);

  // Load live data from backend CMS on mount
  useEffect(() => {
    fetchCmsData();
  }, []);

  const fetchCmsData = async () => {
    try {
      setIsLoading(true);
      const data = await cmsApi.getAll();
      const g = data.grouped || {};

      if (g.homepage?.home_head) setHomeHead(g.homepage.home_head);
      if (g.homepage?.home_hero) setHomeHero(g.homepage.home_hero);
      if (g.homepage?.home_process) setHomeProcess(g.homepage.home_process);
      if (g.homepage?.home_apart) setHomeInfoIcons(g.homepage.home_apart);
      if (g.homepage?.home_courses) setHomeCourseCards(g.homepage.home_courses);
      if (g.homepage?.home_starrer) setHomeStarrer(g.homepage.home_starrer);
      if (g.homepage?.home_feedback) setHomeFeedback(g.homepage.home_feedback);
      if (g.homepage?.home_mission) setHomeMission(g.homepage.home_mission);

      if (g.about_us?.about_program) setAboutProgram(g.about_us.about_program);
      if (g.about_us?.about_watch) setAboutWatch(g.about_us.about_watch);
      if (g.about_us?.about_career) setAboutCareer(g.about_us.about_career);
      if (g.about_us?.about_commitment) setAboutCommitment(g.about_us.about_commitment);

      if (g.contact_us?.contact_details) setContactCms(g.contact_us.contact_details);
      if (g.course_page?.course_page_details) setCoursePageCms(g.course_page.course_page_details);

      if (g.common?.faqs && Array.isArray(g.common.faqs)) setFaqs(g.common.faqs);
      if (g.common?.legal) setLegalCms(g.common.legal);
    } catch (error) {
      console.error('Failed to load CMS data from server:', error);
      toast.error('Failed to load CMS content from server');
    } finally {
      setIsLoading(false);
    }
  };

  // Section-level save handler
  const handleSaveSection = async (page: string, section: string, content: any, label: string) => {
    try {
      setSavingSection(section);
      await cmsApi.updateSection(page, section, content);
      toast.success(`"${label}" section updated successfully!`);
    } catch (error) {
      console.error(`Failed to save ${label}:`, error);
      toast.error(`Failed to save "${label}" section`);
    } finally {
      setSavingSection(null);
    }
  };

  // Global save handler for all sections across all pages
  const handleSaveAll = async () => {
    try {
      setIsSaving(true);
      const allData = {
        homepage: {
          home_head: homeHead,
          home_hero: homeHero,
          home_process: homeProcess,
          home_apart: homeInfoIcons,
          home_courses: homeCourseCards,
          home_starrer: homeStarrer,
          home_feedback: homeFeedback,
          home_mission: homeMission,
        },
        about_us: {
          about_program: aboutProgram,
          about_watch: aboutWatch,
          about_career: aboutCareer,
          about_commitment: aboutCommitment,
        },
        contact_us: {
          contact_details: contactCms,
        },
        course_page: {
          course_page_details: coursePageCms,
        },
        common: {
          faqs: faqs,
          legal: legalCms,
        },
      };

      await cmsApi.updateAll(allData);
      toast.success('All CMS sections saved successfully!');
    } catch (error) {
      console.error('Failed to save all CMS sections:', error);
      toast.error('Failed to save all CMS sections');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleEditFaq = async (id: number) => {
    if (editingFaqId === id) {
      setEditingFaqId(null);
      try {
        await cmsApi.updateSection('common', 'faqs', faqs);
        toast.success('FAQ updated and saved successfully');
      } catch (e) {
        toast.error('Failed to save FAQ to server');
      }
    } else {
      setEditingFaqId(id);
    }
  };

  const handleUpdateFaq = (id: number, field: 'question' | 'answer', value: string) => {
    setFaqs((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [field]: value } : f))
    );
  };

  const handleAddFaq = () => {
    const newFaq: FaqItem = {
      id: Date.now(),
      question: '',
      answer: '',
    };
    setFaqs([...faqs, newFaq]);
    setEditingFaqId(newFaq.id);
    toast.info('New FAQ added. You can now edit the question and answer directly.');
  };

  const handleDeleteFaq = async (id: number) => {
    const updated = faqs.filter((f) => f.id !== id);
    setFaqs(updated);
    try {
      await cmsApi.updateSection('common', 'faqs', updated);
      toast.success('FAQ item removed');
    } catch (e) {
      toast.error('Failed to remove FAQ from server');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Globe className="h-6 w-6 text-primary shrink-0" />
            Website CMS & Dynamic Content Manager
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Configure Homepage, About Us, Contact, Course Page, FAQs, and Compliance policies across all student portals.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleSaveAll}
            disabled={isSaving || isLoading}
            className="gap-1.5 h-9 text-xs sm:text-sm font-medium shadow-xs"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save All CMS Sections
          </Button>
        </div>
      </div>

      {/* Main Tabs for Webpages */}
      <Tabs defaultValue="homepage" className="space-y-6">
        <TabsList className="bg-muted p-1 flex flex-wrap h-auto gap-1">
          <TabsTrigger value="homepage" className="text-xs gap-1.5 py-1.5 px-3">
            <Home className="h-3.5 w-3.5" /> Homepage CMS
          </TabsTrigger>
          <TabsTrigger value="about" className="text-xs gap-1.5 py-1.5 px-3">
            <Info className="h-3.5 w-3.5" /> About Us CMS
          </TabsTrigger>
          <TabsTrigger value="contact" className="text-xs gap-1.5 py-1.5 px-3">
            <Phone className="h-3.5 w-3.5" /> Contact Us
          </TabsTrigger>
          <TabsTrigger value="course_page" className="text-xs gap-1.5 py-1.5 px-3">
            <BookOpen className="h-3.5 w-3.5" /> Course Page CMS
          </TabsTrigger>
          <TabsTrigger value="common" className="text-xs gap-1.5 py-1.5 px-3">
            <Layers className="h-3.5 w-3.5" /> FAQs & Legal Policies
          </TabsTrigger>
        </TabsList>

        {/* ========================================================= */}
        {/* TAB 1: HOMEPAGE CMS (/admin/webpages/homepage/) */}
        {/* ========================================================= */}
        <TabsContent value="homepage" className="space-y-6">
          <Tabs defaultValue="home_head" className="space-y-4">
            <div className="border-b pb-2">
              <TabsList className="bg-background border p-1 h-auto flex flex-wrap gap-1">
                <TabsTrigger value="home_head" className="text-xs py-1 px-2.5">
                  1. Head & Hero Banner
                </TabsTrigger>
                <TabsTrigger value="home_process" className="text-xs py-1 px-2.5">
                  2. Process Section
                </TabsTrigger>
                <TabsTrigger value="home_apart" className="text-xs py-1 px-2.5">
                  3. What Sets Us Apart
                </TabsTrigger>
                <TabsTrigger value="home_courses" className="text-xs py-1 px-2.5">
                  4. Course Cards
                </TabsTrigger>
                <TabsTrigger value="home_starrer" className="text-xs py-1 px-2.5">
                  5. Featured Instructor
                </TabsTrigger>
                <TabsTrigger value="home_feedback" className="text-xs py-1 px-2.5">
                  6. Feedback & Mission
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Sub-tab 1: Head & Hero */}
            <TabsContent value="home_head" className="space-y-6">
              {/* Order 1: Title & Subtitle */}
              <Card className="border shadow-xs">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Homepage Head Section (Order in page: 1)
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Primary headline, sub-headline, and call-to-action buttons
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSaveSection('homepage', 'home_head', homeHead, 'Homepage Head')}
                    disabled={savingSection === 'home_head'}
                    className="h-8 text-xs gap-1.5"
                  >
                    {savingSection === 'home_head' ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Save className="h-3.5 w-3.5" />
                    )}
                    Save Head
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RichTextEditor
                    label="Main Title (HTML / Rich Text)"
                    value={homeHead.title}
                    onChange={(val) => setHomeHead({ ...homeHead, title: val })}
                    height={150}
                    required
                  />

                  <RichTextEditor
                    label="Sub-Title (HTML / Rich Text)"
                    value={homeHead.subtitle}
                    onChange={(val) => setHomeHead({ ...homeHead, subtitle: val })}
                    height={150}
                    required
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="btn_1" className="text-xs font-semibold">
                        Left Button Text
                      </Label>
                      <Input
                        id="btn_1"
                        value={homeHead.btn_1}
                        onChange={(e) => setHomeHead({ ...homeHead, btn_1: e.target.value })}
                        className="h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="btn_2" className="text-xs font-semibold">
                        Right Button Text
                      </Label>
                      <Input
                        id="btn_2"
                        value={homeHead.btn_2}
                        onChange={(e) => setHomeHead({ ...homeHead, btn_2: e.target.value })}
                        className="h-9 text-xs"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order 2: Hero Images & Badges */}
              <Card className="border shadow-xs">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Homepage Hero Media & Highlights (Order in page: 2)
                    </CardTitle>
                    <CardDescription className="text-xs">
                      4 hero showcase images and 3 credential badge pills
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSaveSection('homepage', 'home_hero', homeHero, 'Homepage Hero Media')}
                    disabled={savingSection === 'home_hero'}
                    className="h-8 text-xs gap-1.5"
                  >
                    {savingSection === 'home_hero' ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Save className="h-3.5 w-3.5" />
                    )}
                    Save Hero
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="text-xs font-semibold block mb-2">
                      Hero Gallery Images (4 Showcase Cards)
                    </Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground font-medium">Hero Image 1</Label>
                        <ImageUploadDropzone
                          value={homeHero.image_1}
                          onChange={(url) => setHomeHero({ ...homeHero, image_1: url })}
                          aspectRatio="video"
                          label="Upload Hero Image 1"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground font-medium">Hero Image 2</Label>
                        <ImageUploadDropzone
                          value={homeHero.image_2}
                          onChange={(url) => setHomeHero({ ...homeHero, image_2: url })}
                          aspectRatio="video"
                          label="Upload Hero Image 2"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground font-medium">Hero Image 3</Label>
                        <ImageUploadDropzone
                          value={homeHero.image_3}
                          onChange={(url) => setHomeHero({ ...homeHero, image_3: url })}
                          aspectRatio="video"
                          label="Upload Hero Image 3"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground font-medium">Hero Image 4</Label>
                        <ImageUploadDropzone
                          value={homeHero.image_4}
                          onChange={(url) => setHomeHero({ ...homeHero, image_4: url })}
                          aspectRatio="video"
                          label="Upload Hero Image 4"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <Label className="text-xs font-semibold block mb-2">
                      Hero Feature Pills (Order in section: 5)
                    </Label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="pill_1" className="text-xs font-medium">
                          Left Pill Text
                        </Label>
                        <Input
                          id="pill_1"
                          value={homeHero.pill_1}
                          onChange={(e) => setHomeHero({ ...homeHero, pill_1: e.target.value })}
                          className="h-9 text-xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="pill_2" className="text-xs font-medium">
                          Middle Pill Text
                        </Label>
                        <Input
                          id="pill_2"
                          value={homeHero.pill_2}
                          onChange={(e) => setHomeHero({ ...homeHero, pill_2: e.target.value })}
                          className="h-9 text-xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="pill_3" className="text-xs font-medium">
                          Right Pill Text
                        </Label>
                        <Input
                          id="pill_3"
                          value={homeHero.pill_3}
                          onChange={(e) => setHomeHero({ ...homeHero, pill_3: e.target.value })}
                          className="h-9 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sub-tab 2: Process Section */}
            <TabsContent value="home_process" className="space-y-6">
              <Card className="border shadow-xs">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Workflow className="h-4 w-4 text-primary" />
                      Homepage Process Section (Order in page: 3)
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Process title, featured illustration, and step-by-step onboarding sequence
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSaveSection('homepage', 'home_process', homeProcess, 'Process Section')}
                    disabled={savingSection === 'home_process'}
                    className="h-8 text-xs gap-1.5"
                  >
                    {savingSection === 'home_process' ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Save className="h-3.5 w-3.5" />
                    )}
                    Save Process
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <RichTextEditor
                        label="Process Head Title"
                        value={homeProcess.title}
                        onChange={(val) => setHomeProcess({ ...homeProcess, title: val })}
                        height={200}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <ImageUploadDropzone
                        value={homeProcess.image}
                        onChange={(url) => setHomeProcess({ ...homeProcess, image: url })}
                        aspectRatio="wide"
                        label="Process Feature Image"
                      />
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-4">
                    <Label className="text-xs font-semibold block">
                      Process Steps Sequence (4 Step Milestones)
                    </Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {homeProcess.steps.map((st, idx) => (
                        <div key={st.order} className="border rounded-lg p-3.5 bg-muted/20 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-primary">Step {idx + 1}</span>
                            <span className="text-[10px] text-muted-foreground uppercase font-mono">
                              order_in_section: {st.order + 1}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[11px] font-medium">Step Title</Label>
                            <Input
                              value={st.title}
                              onChange={(e) => {
                                const newSteps = [...homeProcess.steps];
                                newSteps[idx].title = e.target.value;
                                setHomeProcess({ ...homeProcess, steps: newSteps });
                              }}
                              className="h-8 text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[11px] font-medium">Step Subtitle / Description</Label>
                            <Input
                              value={st.subtitle}
                              onChange={(e) => {
                                const newSteps = [...homeProcess.steps];
                                newSteps[idx].subtitle = e.target.value;
                                setHomeProcess({ ...homeProcess, steps: newSteps });
                              }}
                              className="h-8 text-xs"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sub-tab 3: What Sets Us Apart (Info Icons) */}
            <TabsContent value="home_apart" className="space-y-6">
              <Card className="border shadow-xs">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Award className="h-4 w-4 text-primary" />
                      What Sets Us Apart / Info Icons (Order in page: 4)
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Left column banner and 5 right column feature cards with icon uploads
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSaveSection('homepage', 'home_apart', homeInfoIcons, 'What Sets Us Apart')}
                    disabled={savingSection === 'home_apart'}
                    className="h-8 text-xs gap-1.5"
                  >
                    {savingSection === 'home_apart' ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Save className="h-3.5 w-3.5" />
                    )}
                    Save Info Icons
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Left Head */}
                  <div className="border rounded-lg p-4 bg-muted/20 space-y-4">
                    <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                      Left Showcase Column (Head)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Section Subtitle</Label>
                        <Input
                          value={homeInfoIcons.head_subtitle}
                          onChange={(e) =>
                            setHomeInfoIcons({ ...homeInfoIcons, head_subtitle: e.target.value })
                          }
                          className="h-9 text-xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Main Title</Label>
                        <Input
                          value={homeInfoIcons.head_title}
                          onChange={(e) =>
                            setHomeInfoIcons({ ...homeInfoIcons, head_title: e.target.value })
                          }
                          className="h-9 text-xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Info Button Text</Label>
                        <Input
                          value={homeInfoIcons.head_btn}
                          onChange={(e) =>
                            setHomeInfoIcons({ ...homeInfoIcons, head_btn: e.target.value })
                          }
                          className="h-9 text-xs"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Head Illustration Image</Label>
                      <ImageUploadDropzone
                        value={homeInfoIcons.head_image}
                        onChange={(url) =>
                          setHomeInfoIcons({ ...homeInfoIcons, head_image: url })
                        }
                        aspectRatio="banner"
                        label="Upload Left Column Graphic"
                      />
                    </div>
                  </div>

                  {/* Right Body Items */}
                  <div className="space-y-3">
                    <Label className="text-xs font-semibold block">
                      Right Feature Cards (5 Items)
                    </Label>
                    <div className="space-y-3">
                      {homeInfoIcons.items.map((item, idx) => (
                        <div
                          key={item.order}
                          className="grid grid-cols-1 md:grid-cols-12 gap-3 border rounded-lg p-3 items-center bg-card"
                        >
                       <div className="md:col-span-3">
  <Label className="text-[11px] text-muted-foreground block mb-1">
    Icon #{idx + 1}
  </Label>
  <div
    className="relative border border-dashed border-muted-foreground/40 rounded-md 
               flex items-center justify-center overflow-hidden 
               hover:border-primary transition-colors cursor-pointer"
    style={{ width: 100, height: 50 }}
  >
    <input
      type="file"
      accept="image/*"
      className="absolute inset-0 opacity-0 cursor-pointer z-10"
      onChange={async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
          const url = await uploadImage(file);
          const newItems = [...homeInfoIcons.items];
          newItems[idx].image = url;
          setHomeInfoIcons({ ...homeInfoIcons, items: newItems });
        } catch (err) {
          console.warn('Icon upload cancelled or failed:', err);
        }
      }}
    />
    {item.image ? (
      <img
        src={item.image}
        alt={`Icon ${idx + 1}`}
        className="w-full h-full object-contain"
      />
    ) : (
      <span className="text-[10px] text-muted-foreground text-center px-1">
        Click to upload
      </span>
    )}
  </div>
</div>
                          <div className="md:col-span-4 space-y-1">
                            <Label className="text-xs font-medium">Feature Title</Label>
                            <Input
                              value={item.title}
                              onChange={(e) => {
                                const newItems = [...homeInfoIcons.items];
                                newItems[idx].title = e.target.value;
                                setHomeInfoIcons({ ...homeInfoIcons, items: newItems });
                              }}
                              className="h-8 text-xs"
                            />
                          </div>
                          <div className="md:col-span-5 space-y-1">
                            <Label className="text-xs font-medium">Feature Subtitle / Description</Label>
                            <Input
                              value={item.subtitle}
                              onChange={(e) => {
                                const newItems = [...homeInfoIcons.items];
                                newItems[idx].subtitle = e.target.value;
                                setHomeInfoIcons({ ...homeInfoIcons, items: newItems });
                              }}
                              className="h-8 text-xs"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sub-tab 4: Course Cards */}
            <TabsContent value="home_courses" className="space-y-6">
              <Card className="border shadow-xs">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-primary" />
                      Homepage Course Cards (Order in page: 5)
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Course catalog head text and 3 highlighted training course cards
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSaveSection('homepage', 'home_courses', homeCourseCards, 'Course Cards')}
                    disabled={savingSection === 'home_courses'}
                    className="h-8 text-xs gap-1.5"
                  >
                    {savingSection === 'home_courses' ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Save className="h-3.5 w-3.5" />
                    )}
                    Save Course Cards
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Section Subtitle</Label>
                      <Input
                        value={homeCourseCards.head_subtitle}
                        onChange={(e) =>
                          setHomeCourseCards({ ...homeCourseCards, head_subtitle: e.target.value })
                        }
                        className="h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <RichTextEditor
                        label="Section Title"
                        value={homeCourseCards.head_title}
                        onChange={(val) =>
                          setHomeCourseCards({ ...homeCourseCards, head_title: val })
                        }
                        height={150}
                        required
                      />
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <Label className="text-xs font-semibold block mb-3">
                      Course Cards (3 Featured Offerings)
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {homeCourseCards.cards.map((card, idx) => (
                        <div key={card.order} className="border rounded-lg p-3 space-y-3 bg-muted/20">
                          <span className="text-xs font-bold text-primary block">
                            Card #{idx + 1}
                          </span>
                          <ImageUploadDropzone
                            value={card.image}
                            onChange={(url) => {
                              const newCards = [...homeCourseCards.cards];
                              newCards[idx].image = url;
                              setHomeCourseCards({ ...homeCourseCards, cards: newCards });
                            }}
                            aspectRatio="video"
                            label={`Course Thumbnail ${idx + 1}`}
                          />
                          <div className="space-y-1">
                            <Label className="text-xs font-medium">Course Title</Label>
                            <Input
                              value={card.title}
                              onChange={(e) => {
                                const newCards = [...homeCourseCards.cards];
                                newCards[idx].title = e.target.value;
                                setHomeCourseCards({ ...homeCourseCards, cards: newCards });
                              }}
                              className="h-8 text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs font-medium">Subtitle / Overview</Label>
                            <Input
                              value={card.subtitle}
                              onChange={(e) => {
                                const newCards = [...homeCourseCards.cards];
                                newCards[idx].subtitle = e.target.value;
                                setHomeCourseCards({ ...homeCourseCards, cards: newCards });
                              }}
                              className="h-8 text-xs"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sub-tab 5: Starrer / Featured Keynote */}
            <TabsContent value="home_starrer" className="space-y-6">
              <Card className="border shadow-xs">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-primary" />
                      Keynote / Featured Clinical Lead (Order in page: 6)
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Spotlight lead instructor credential, bio, and portrait
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSaveSection('homepage', 'home_starrer', homeStarrer, 'Featured Instructor')}
                    disabled={savingSection === 'home_starrer'}
                    className="h-8 text-xs gap-1.5"
                  >
                    {savingSection === 'home_starrer' ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Save className="h-3.5 w-3.5" />
                    )}
                    Save Instructor
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="starrer_title" className="text-xs font-semibold">
                        Instructor Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="starrer_title"
                        value={homeStarrer.title}
                        onChange={(e) => setHomeStarrer({ ...homeStarrer, title: e.target.value })}
                        className="h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="starrer_degree" className="text-xs font-semibold">
                        Degrees & Board Certifications <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="starrer_degree"
                        value={homeStarrer.subtitle}
                        onChange={(e) =>
                          setHomeStarrer({ ...homeStarrer, subtitle: e.target.value })
                        }
                        className="h-9 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <RichTextEditor
                      label="Instructor Bio & Clinical Background"
                      value={homeStarrer.detail}
                      onChange={(val) => setHomeStarrer({ ...homeStarrer, detail: val })}
                      height={165}
                      required
                    />
                    <div className="space-y-2">
                      <ImageUploadDropzone
                        value={homeStarrer.image}
                        onChange={(url) => setHomeStarrer({ ...homeStarrer, image: url })}
                        aspectRatio="square"
                        label="Upload Instructor Portrait Image"
                        className='w-full !important'
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sub-tab 6: Feedback & Mission */}
            <TabsContent value="home_feedback" className="space-y-6">
              {/* Order 7: Feedback */}
              <Card className="border shadow-xs">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-primary" />
                      Feedback / Testimonials Head (Order in page: 7)
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Headlines introducing student testimonials and partner clinic reviews
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSaveSection('homepage', 'home_feedback', homeFeedback, 'Feedback Head')}
                    disabled={savingSection === 'home_feedback'}
                    className="h-8 text-xs gap-1.5"
                  >
                    {savingSection === 'home_feedback' ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Save className="h-3.5 w-3.5" />
                    )}
                    Save Feedback
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RichTextEditor
                    label="Feedback Main Title"
                    value={homeFeedback.title}
                    onChange={(val) => setHomeFeedback({ ...homeFeedback, title: val })}
                    height={150}
                    required
                  />
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Feedback Subtitle</Label>
                    <Input
                      value={homeFeedback.subtitle}
                      onChange={(e) =>
                        setHomeFeedback({ ...homeFeedback, subtitle: e.target.value })
                      }
                      className="h-9 text-xs"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Order 8: Mission */}
              <Card className="border shadow-xs">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Compass className="h-4 w-4 text-primary" />
                      Mission Section (Order in page: 8)
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Organizational mission statement and accompanying clinical illustration
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSaveSection('homepage', 'home_mission', homeMission, 'Mission Section')}
                    disabled={savingSection === 'home_mission'}
                    className="h-8 text-xs gap-1.5"
                  >
                    {savingSection === 'home_mission' ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Save className="h-3.5 w-3.5" />
                    )}
                    Save Mission
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RichTextEditor
                    label="Mission Title"
                    value={homeMission.title}
                    onChange={(val) => setHomeMission({ ...homeMission, title: val })}
                    height={150}
                    required
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <RichTextEditor
                      label="Mission Details (Rich Text)"
                      value={homeMission.detail}
                      onChange={(val) => setHomeMission({ ...homeMission, detail: val })}
                      height={165}
                      required
                    />
                    <div className="space-y-2">
                      <ImageUploadDropzone
                        value={homeMission.image}
                        onChange={(url) => setHomeMission({ ...homeMission, image: url })}
                        aspectRatio="banner"
                        label="Upload Mission Image"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* ========================================================= */}
        {/* TAB 2: ABOUT US CMS (/admin/webpages/about_us) */}
        {/* ========================================================= */}
        <TabsContent value="about" className="space-y-6">
          <Tabs defaultValue="about_program" className="space-y-4">
            <div className="border-b pb-2">
              <TabsList className="bg-background border p-1 h-auto flex flex-wrap gap-1">
                <TabsTrigger value="about_program" className="text-xs py-1 px-2.5">
                  1. Program Info & Counters
                </TabsTrigger>
                <TabsTrigger value="about_video" className="text-xs py-1 px-2.5">
                  2. Watch & Learn Video & Thumbnail
                </TabsTrigger>
                <TabsTrigger value="about_career" className="text-xs py-1 px-2.5">
                  3. Career Steps
                </TabsTrigger>
                <TabsTrigger value="about_commitment" className="text-xs py-1 px-2.5">
                  4. Commitment Cards
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Sub-tab 1: Program Info & Counters (Order 1) */}
            <TabsContent value="about_program" className="space-y-6">
              <Card className="border shadow-xs">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Info className="h-4 w-4 text-primary" />
                      About Our Program (Order in page: 1)
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Institutional overview, dual illustration gallery, CTA, and 3 metric counters
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSaveSection('about_us', 'about_program', aboutProgram, 'About Program')}
                    disabled={savingSection === 'about_program'}
                    className="h-8 text-xs gap-1.5"
                  >
                    {savingSection === 'about_program' ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Save className="h-3.5 w-3.5" />
                    )}
                    Save Program Info
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Title</Label>
                    <Input
                      value={aboutProgram.title}
                      onChange={(e) =>
                        setAboutProgram({ ...aboutProgram, title: e.target.value })
                      }
                      className="h-9 text-xs"
                    />
                  </div>

                  <RichTextEditor
                    label="Detail & Background (HTML / Rich Text)"
                    value={aboutProgram.detail}
                    onChange={(val) => setAboutProgram({ ...aboutProgram, detail: val })}
                    height={165}
                    required
                  />

                  {/* Dual Image Gallery: Larger & Smaller */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border rounded-lg p-4 bg-muted/20">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Image Left (Larger)</Label>
                      <ImageUploadDropzone
                        value={aboutProgram.image_left}
                        onChange={(url) =>
                          setAboutProgram({ ...aboutProgram, image_left: url })
                        }
                        aspectRatio="banner"
                        label="Upload Program Image Left"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Image Right (Smaller)</Label>
                      <ImageUploadDropzone
                        value={aboutProgram.image_right}
                        onChange={(url) =>
                          setAboutProgram({ ...aboutProgram, image_right: url })
                        }
                        aspectRatio="banner"
                        label="Upload Program Image Right"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Info Button Text</Label>
                    <Input
                      value={aboutProgram.button}
                      onChange={(e) =>
                        setAboutProgram({ ...aboutProgram, button: e.target.value })
                      }
                      className="h-9 text-xs max-w-sm"
                    />
                  </div>

                  {/* 3 Counter Widgets */}
                  <div className="border-t pt-4 space-y-3">
                    <Label className="text-xs font-semibold block">
                      Counter Widgets (3 Milestone Statistics)
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {aboutProgram.counters.map((c, idx) => (
                        <div key={c.order} className="border rounded-lg p-3 bg-card space-y-2">
                          <span className="text-[11px] font-bold text-primary block">
                            Counter #{idx + 1}
                          </span>
                          <div className="space-y-1">
                            <Label className="text-[11px] text-muted-foreground font-medium">
                              Counter Number / Stat
                            </Label>
                            <Input
                              value={c.number}
                              onChange={(e) => {
                                const newCounters = [...aboutProgram.counters];
                                newCounters[idx].number = e.target.value;
                                setAboutProgram({ ...aboutProgram, counters: newCounters });
                              }}
                              className="h-8 text-xs font-semibold"
                              placeholder="e.g. 2.6k+ / 98%"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[11px] text-muted-foreground font-medium">
                              Counter Label
                            </Label>
                            <Input
                              value={c.label}
                              onChange={(e) => {
                                const newCounters = [...aboutProgram.counters];
                                newCounters[idx].label = e.target.value;
                                setAboutProgram({ ...aboutProgram, counters: newCounters });
                              }}
                              className="h-8 text-xs"
                              placeholder="e.g. Trainees Certified"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sub-tab 2: Watch & Learn Video + Thumbnail (Order 2) */}
            <TabsContent value="about_video" className="space-y-6">
              <Card className="border shadow-xs">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Video className="h-4 w-4 text-primary" />
                      Watch & Learn: Video Showcase & Thumbnail (Order in page: 2)
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Upload platform demo video with responsive player and custom poster thumbnail
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSaveSection('about_us', 'about_watch', aboutWatch, 'Watch & Learn Video')}
                    disabled={savingSection === 'about_watch'}
                    className="h-8 text-xs gap-1.5"
                  >
                    {savingSection === 'about_watch' ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Save className="h-3.5 w-3.5" />
                    )}
                    Save Video Section
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Video Section Title</Label>
                    <Input
                      value={aboutWatch.title}
                      onChange={(e) =>
                        setAboutWatch({ ...aboutWatch, title: e.target.value })
                      }
                      className="h-9 text-xs"
                    />
                  </div>

                  <RichTextEditor
                    label="Video Section Detail / Description"
                    value={aboutWatch.detail}
                    onChange={(val) => setAboutWatch({ ...aboutWatch, detail: val })}
                    height={160}
                    required
                  />

                  {/* Video & Poster Upload Responsive Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 border rounded-xl p-4 bg-muted/20">
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold flex items-center gap-1.5">
                        <Video className="h-3.5 w-3.5 text-primary" />
                        Demo / Promo Video File (MP4, WebM, MOV)
                      </Label>
                      <VideoUploadDropzone
                        value={aboutWatch.video_url}
                        onChange={(url) => setAboutWatch({ ...aboutWatch, video_url: url })}
                        onUploadFile={async (file) => {
                          const res = await cmsApi.uploadMedia(file);
                          return res.url;
                        }}
                        label="Upload Demo Video"
                        helperText="Upload video file (MP4, WebM, MOV) or paste streaming URL"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-semibold flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                        Video Poster Thumbnail Image
                      </Label>
                      <ImageUploadDropzone
                        value={aboutWatch.thumbnail}
                        onChange={(url) => setAboutWatch({ ...aboutWatch, thumbnail: url })}
                        aspectRatio="video"
                        label="Upload Video Thumbnail (16:9 HD)"
                        helperText="Displays before playback begins on all devices"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sub-tab 3: Career Steps (Order 3) */}
            <TabsContent value="about_career" className="space-y-6">
              <Card className="border shadow-xs">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-primary" />
                      Career Steps: "Career Changes Lives" (Order in page: 3)
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Section header and 3 sequential milestones for behavioral career advancement
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSaveSection('about_us', 'about_career', aboutCareer, 'Career Steps')}
                    disabled={savingSection === 'about_career'}
                    className="h-8 text-xs gap-1.5"
                  >
                    {savingSection === 'about_career' ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Save className="h-3.5 w-3.5" />
                    )}
                    Save Career Steps
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Header */}
                  <div className="border rounded-lg p-4 bg-muted/20 space-y-4">
                    <span className="text-xs font-bold text-foreground uppercase tracking-wider block">
                      Section Header (Order in section: 1)
                    </span>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Header Title</Label>
                      <Input
                        value={aboutCareer.head_title}
                        onChange={(e) =>
                          setAboutCareer({ ...aboutCareer, head_title: e.target.value })
                        }
                        className="h-9 text-xs"
                      />
                    </div>
                    <RichTextEditor
                      label="Header Description"
                      value={aboutCareer.head_detail}
                      onChange={(val) => setAboutCareer({ ...aboutCareer, head_detail: val })}
                      height={150}
                    />
                  </div>

                  {/* 3 Steps */}
                  <div className="space-y-4">
                    <Label className="text-xs font-semibold block">
                      Career Steps Sequence (Order in section: 2, 3, 4)
                    </Label>
                    <div className="space-y-4">
                      {aboutCareer.steps.map((st, idx) => (
                        <div key={st.order} className="border rounded-lg p-4 bg-card space-y-3">
                          <div className="flex items-center justify-between border-b pb-2">
                            <span className="text-xs font-bold text-primary">
                              Career Milestone #{idx + 1}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              order_in_section: {st.order}
                            </span>
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs font-medium">Step Title</Label>
                            <Input
                              value={st.title}
                              onChange={(e) => {
                                const newSteps = [...aboutCareer.steps];
                                newSteps[idx].title = e.target.value;
                                setAboutCareer({ ...aboutCareer, steps: newSteps });
                              }}
                              className="h-8 text-xs font-medium"
                            />
                          </div>
                          <RichTextEditor
                            label="Step Description"
                            value={st.detail}
                            onChange={(val) => {
                              const newSteps = [...aboutCareer.steps];
                              newSteps[idx].detail = val;
                              setAboutCareer({ ...aboutCareer, steps: newSteps });
                            }}
                            height={150}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sub-tab 4: Commitment Cards (Order 4) */}
            <TabsContent value="about_commitment" className="space-y-6">
              <Card className="border shadow-xs">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <HeartHandshake className="h-4 w-4 text-primary" />
                      Commitment Cards Section (Order in page: 4)
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Institutional core values, clinical ethics, and learner pledges
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSaveSection('about_us', 'about_commitment', aboutCommitment, 'Commitment Cards')}
                    disabled={savingSection === 'about_commitment'}
                    className="h-8 text-xs gap-1.5"
                  >
                    {savingSection === 'about_commitment' ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Save className="h-3.5 w-3.5" />
                    )}
                    Save Commitments
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Header */}
                  <div className="border rounded-lg p-4 bg-muted/20 space-y-4">
                    <span className="text-xs font-bold text-foreground uppercase tracking-wider block">
                      Commitment Header (Order in section: 1)
                    </span>
                    <RichTextEditor
                      label="Header Title (HTML / Rich Text)"
                      value={aboutCommitment.head_title}
                      onChange={(val) =>
                        setAboutCommitment({ ...aboutCommitment, head_title: val })
                      }
                      height={150}
                    />
                    <RichTextEditor
                      label="Header Description (HTML / Rich Text)"
                      value={aboutCommitment.head_detail}
                      onChange={(val) =>
                        setAboutCommitment({ ...aboutCommitment, head_detail: val })
                      }
                      height={150}
                    />
                  </div>

                  {/* 3 Cards */}
                  <div className="space-y-4">
                    <Label className="text-xs font-semibold block">
                      Commitment Cards (3 Strategic Pillars)
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {aboutCommitment.cards.map((card, idx) => (
                        <div key={card.order} className="border rounded-lg p-3.5 bg-card space-y-3">
                          <span className="text-xs font-bold text-primary block">
                            Pillar #{idx + 1}
                          </span>
                          <div className="space-y-1">
                            <Label className="text-xs font-medium">Card Title</Label>
                            <Input
                              value={card.title}
                              onChange={(e) => {
                                const newCards = [...aboutCommitment.cards];
                                newCards[idx].title = e.target.value;
                                setAboutCommitment({ ...aboutCommitment, cards: newCards });
                              }}
                              className="h-8 text-xs font-medium"
                            />
                          </div>
                          <RichTextEditor
                            label="Card Detail"
                            value={card.detail}
                            onChange={(val) => {
                              const newCards = [...aboutCommitment.cards];
                              newCards[idx].detail = val;
                              setAboutCommitment({ ...aboutCommitment, cards: newCards });
                            }}
                            height={150}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* ========================================================= */}
        {/* TAB 3: CONTACT US CMS (/admin/webpages/contact) */}
        {/* ========================================================= */}
        <TabsContent value="contact" className="space-y-6">
          <Card className="border shadow-xs">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary" />
                  Official Contact Coordinates & Social Channels
                </CardTitle>
                <CardDescription className="text-xs">
                  Public telephone, admissions email, physical address, banner imagery, and socials
                </CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => handleSaveSection('contact_us', 'contact_details', contactCms, 'Contact Settings')}
                disabled={savingSection === 'contact_details'}
                className="gap-1.5 h-8 text-xs font-medium"
              >
                {savingSection === 'contact_details' ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                Save Contact Settings
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Section Titles */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Section Title</Label>
                  <Input
                    value={contactCms.title}
                    onChange={(e) => setContactCms({ ...contactCms, title: e.target.value })}
                    className="h-9 text-xs sm:text-sm font-medium"
                  />
                </div>
                <RichTextEditor
                  label="Section Subtitle (HTML / Rich Text)"
                  value={contactCms.subtitle}
                  onChange={(val) => setContactCms({ ...contactCms, subtitle: val })}
                  height={150}
                />
              </div>

              {/* Administrative Channels */}
              <div className="border-t pt-4 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Official Communication Channels
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Office Hotline Phone</Label>
                    <Input
                      value={contactCms.phone}
                      onChange={(e) => setContactCms({ ...contactCms, phone: e.target.value })}
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Support / Admissions Email</Label>
                    <Input
                      type="email"
                      value={contactCms.email}
                      onChange={(e) => setContactCms({ ...contactCms, email: e.target.value })}
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Office / Advisory Hours</Label>
                    <Input
                      value={contactCms.business_hours}
                      onChange={(e) =>
                        setContactCms({ ...contactCms, business_hours: e.target.value })
                      }
                      className="h-9 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Physical Institute Address</Label>
                  <Input
                    value={contactCms.address}
                    onChange={(e) => setContactCms({ ...contactCms, address: e.target.value })}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              {/* Contact Image */}
              <div className="border-t pt-4 space-y-2">
                <Label className="text-xs font-semibold">Contact Page Feature Graphic</Label>
                <ImageUploadDropzone
                  value={contactCms.image}
                  onChange={(url) => setContactCms({ ...contactCms, image: url })}
                  aspectRatio="wide"
                  label="Upload Contact Page Banner"
                />
              </div>

              {/* Social Channels */}
              <div className="border-t pt-4 space-y-4">
                <div className="flex items-center gap-1.5">
                  <Share2 className="h-3.5 w-3.5 text-muted-foreground" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Public Social Media Links
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">LinkedIn Profile URL</Label>
                    <Input
                      value={contactCms.social_linkedin}
                      onChange={(e) =>
                        setContactCms({ ...contactCms, social_linkedin: e.target.value })
                      }
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Facebook Page URL</Label>
                    <Input
                      value={contactCms.social_facebook}
                      onChange={(e) =>
                        setContactCms({ ...contactCms, social_facebook: e.target.value })
                      }
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Twitter / X URL</Label>
                    <Input
                      value={contactCms.social_twitter}
                      onChange={(e) =>
                        setContactCms({ ...contactCms, social_twitter: e.target.value })
                      }
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">YouTube Channel URL</Label>
                    <Input
                      value={contactCms.social_youtube}
                      onChange={(e) =>
                        setContactCms({ ...contactCms, social_youtube: e.target.value })
                      }
                      className="h-9 text-xs"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========================================================= */}
        {/* TAB 4: COURSE PAGE CMS (/admin/webpages/course-page/index) */}
        {/* ========================================================= */}
        <TabsContent value="course_page" className="space-y-6">
          <Card className="border shadow-xs">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Course Page CMS (Order in page: 1 & 2)
                </CardTitle>
                <CardDescription className="text-xs">
                  Course catalog landing head text, curriculum search prompt, and key feature badges
                </CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => handleSaveSection('course_page', 'course_page_details', coursePageCms, 'Course Page Details')}
                disabled={savingSection === 'course_page_details'}
                className="gap-1.5 h-8 text-xs font-medium"
              >
                {savingSection === 'course_page_details' ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                Save Course Page
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <RichTextEditor
                  label="Subtitle (Rich Text)"
                  value={coursePageCms.head_subtitle}
                  onChange={(val) => setCoursePageCms({ ...coursePageCms, head_subtitle: val })}
                  height={150}
                />

                <RichTextEditor
                  label="Main Title (Rich Text)"
                  value={coursePageCms.head_title}
                  onChange={(val) => setCoursePageCms({ ...coursePageCms, head_title: val })}
                  height={150}
                />

                <RichTextEditor
                  label="Curriculum Description"
                  value={coursePageCms.head_description}
                  onChange={(val) =>
                    setCoursePageCms({ ...coursePageCms, head_description: val })
                  }
                  height={165}
                />

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold flex items-center gap-1.5">
                    <Search className="h-3.5 w-3.5 text-muted-foreground" />
                    Search Input Placeholder
                  </Label>
                  <Input
                    value={coursePageCms.placeholder}
                    onChange={(e) =>
                      setCoursePageCms({ ...coursePageCms, placeholder: e.target.value })
                    }
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              {/* 3 Course Page Feature Widgets (Order in page: 2) */}
              <div className="border-t pt-4 space-y-4">
                <Label className="text-xs font-semibold block">
                  Course Page Widgets (Order in page: 2, 3 items)
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {coursePageCms.widgets.map((w, idx) => (
                    <div key={idx} className="border rounded-lg p-3 bg-muted/20 space-y-2">
                      <span className="text-[11px] font-bold text-primary block">
                        Widget #{idx + 1}
                      </span>
                      <div className="space-y-1">
                        <Label className="text-[11px] font-medium text-muted-foreground">
                          Widget Name
                        </Label>
                        <Input
                          value={w.name}
                          onChange={(e) => {
                            const newWidgets = [...coursePageCms.widgets];
                            newWidgets[idx].name = e.target.value;
                            setCoursePageCms({ ...coursePageCms, widgets: newWidgets });
                          }}
                          className="h-8 text-xs font-medium"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px] font-medium text-muted-foreground">
                          Widget Value / Display Text
                        </Label>
                        <Input
                          value={w.value}
                          onChange={(e) => {
                            const newWidgets = [...coursePageCms.widgets];
                            newWidgets[idx].value = e.target.value;
                            setCoursePageCms({ ...coursePageCms, widgets: newWidgets });
                          }}
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========================================================= */}
        {/* TAB 5: COMMON SECTIONS (FAQS & LEGAL POLICIES) */}
        {/* ========================================================= */}
        <TabsContent value="common" className="space-y-6">
          {/* FAQs Manager */}
          <Card className="border shadow-xs">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  Frequently Asked Questions (FAQs) ({faqs.length})
                </CardTitle>
                <CardDescription className="text-xs">
                  Prospective student questions regarding BACB task lists, exams, and verification
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSaveSection('common', 'faqs', faqs, 'FAQs')}
                  disabled={savingSection === 'faqs'}
                  className="h-8 text-xs gap-1.5"
                >
                  {savingSection === 'faqs' ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="h-3.5 w-3.5" />
                  )}
                  Save FAQs
                </Button>
                <Button
                  size="sm"
                  onClick={handleAddFaq}
                  className="gap-1.5 h-8 text-xs font-medium"
                >
                  <Plus className="h-3.5 w-3.5" /> Add FAQ
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {faqs.map((faq, index) => {
                const isEditing = editingFaqId === faq.id;
                return (
                  <div
                    key={faq.id}
                    className="p-3.5 border rounded-xl bg-card hover:bg-muted/20 transition-colors space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      {isEditing ? (
                        <div className="flex-1 space-y-1">
                          <Label className="text-[11px] text-muted-foreground font-semibold">
                            Question #{index + 1}
                          </Label>
                          <Input
                            value={faq.question}
                            onChange={(e) =>
                              handleUpdateFaq(faq.id, 'question', e.target.value)
                            }
                            placeholder="Enter question..."
                            className="h-8 text-xs font-semibold"
                            autoFocus
                          />
                        </div>
                      ) : (
                        <p className="text-xs font-bold text-foreground pt-1">
                          {index + 1}. {faq.question || '(No question specified)'}
                        </p>
                      )}

                      <div className="flex items-center gap-1 shrink-0 pt-0.5">
                        <Button
                          variant={isEditing ? 'default' : 'ghost'}
                          size="icon"
                          onClick={() => handleToggleEditFaq(faq.id)}
                          className={`h-7 w-7 ${
                            isEditing
                              ? 'bg-primary text-primary-foreground'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                          title={isEditing ? 'Save Question & Answer' : 'Edit Question & Answer'}
                        >
                          {isEditing ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <Edit2 className="h-3 w-3" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteFaq(faq.id)}
                          className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          title="Delete FAQ"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground font-semibold">
                          Answer (Plain text)
                        </Label>
                        <Textarea
                          value={faq.answer}
                          onChange={(e) =>
                            handleUpdateFaq(faq.id, 'answer', e.target.value)
                          }
                          placeholder="Enter plain text answer..."
                          rows={3}
                          className="text-xs resize-none"
                        />
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground leading-relaxed pl-3 border-l-2 border-primary/40 whitespace-pre-wrap">
                        {faq.answer || '(No answer provided)'}
                      </p>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Legal Policies & Compliance */}
          <Card className="border shadow-xs">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Legal, Privacy & BACB Compliance Disclaimers
                </CardTitle>
                <CardDescription className="text-xs">
                  Legal terms, data protection statements, and independent curriculum accreditation notices
                </CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => handleSaveSection('common', 'legal', legalCms, 'Legal Policies')}
                disabled={savingSection === 'legal'}
                className="gap-1.5 h-8 text-xs font-medium"
              >
                {savingSection === 'legal' ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                Save Policies
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <RichTextEditor
                label="Terms & Conditions"
                value={legalCms.terms}
                onChange={(val) => setLegalCms({ ...legalCms, terms: val })}
                height={165}
              />

              <RichTextEditor
                label="Privacy Policy & Trainee Data Protection"
                value={legalCms.privacy}
                onChange={(val) => setLegalCms({ ...legalCms, privacy: val })}
                height={165}
              />

              <RichTextEditor
                label="BACB Independent Curriculum Accreditation Disclaimer"
                value={legalCms.bacb_disclaimer}
                onChange={(val) => setLegalCms({ ...legalCms, bacb_disclaimer: val })}
                height={165}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

    </div>
  );
}
