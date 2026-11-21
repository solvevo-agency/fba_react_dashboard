/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import {
  Globe,
  Save,
  Home,
  Info,
  Phone,
  BookOpen,
  Layers,
  Loader2,
  GraduationCap,
  MessageSquare,
  Compass,
  Award,
  Workflow,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cmsApi } from '@/services/cmsApi';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { ImageUploadDropzone } from '@/components/ui/image-upload-dropzone';
import { resolveMediaUrl } from '@/components/ui/video-upload-dropzone';
import { AboutUsCmsTab, CommonCmsTab, ContactUsCmsTab, CoursePageCmsTab } from '@/components/cms';

interface FaqItem {
  id: number;
  question: string;
  answer: string;
}

// Reusable upload helper for icon/image files — always store a server URL, never base64.
const uploadImage = async (file: File): Promise<string> => {
  if (!file.type.startsWith('image/')) {
    toast.error('Please upload a valid image file (PNG, JPG, WebP, SVG)');
    throw new Error('Invalid file type');
  }

  const res = await cmsApi.uploadMedia(file);
  if (!res?.url) {
    throw new Error('Upload did not return a URL');
  }
  return res.url;
};

export default function CmsPage() {
  // -------------------------------------------------------------
  // 1. HOMEPAGE CMS STATE (from /admin/webpages/homepage/)
  // -------------------------------------------------------------

  // Head Section (Order 1: Title, Subtitle, Buttons)
  const [homeHead, setHomeHead] = useState({
    title: '',
    subtitle: '',
    btn_1: '',
    btn_2: '',
  });

  // Hero Section (Order 2: 4 Images + 3 Badges/Pills)
  const [homeHero, setHomeHero] = useState({
    image_1: '',
    image_2: '',
    image_3: '',
    image_4: '',
    pill_1: '',
    pill_2: '',
    pill_3: '',
  });

  // Process Section (Order 3: Title 1, Image, 4 Process steps)
  const [homeProcess, setHomeProcess] = useState({
    title: '',
    image: '',
    steps: [
      { order: 1, title: '', subtitle: '' },
      { order: 2, title: '', subtitle: '' },
      { order: 3, title: '', subtitle: '' },
      { order: 4, title: '', subtitle: '' },
    ],
  });

  // What Sets Us Apart / Info Icons (Order 4: Head left + 5 items right)
  const [homeInfoIcons, setHomeInfoIcons] = useState({
    head_subtitle: '',
    head_title: '',
    head_image: '',
    head_btn: '',
    items: [
      { order: 1, title: '', subtitle: '', image: '' },
      { order: 2, title: '', subtitle: '', image: '' },
      { order: 3, title: '', subtitle: '', image: '' },
      { order: 4, title: '', subtitle: '', image: '' },
      { order: 5, title: '', subtitle: '', image: '' },
    ],
  });

  // Course Cards (Order 5: Head + 3 Cards)
  const [homeCourseCards, setHomeCourseCards] = useState({
    head_subtitle: '',
    head_title: '',
    cards: [
      { order: 1, title: '', subtitle: '', image: '' },
      { order: 2, title: '', subtitle: '', image: '' },
      { order: 3, title: '', subtitle: '', image: '' },
    ],
  });

  // Starrer / Featured Instructor (Order 6)
  const [homeStarrer, setHomeStarrer] = useState({
    title: '',
    subtitle: '',
    detail: '',
    image: '',
  });

  // Feedback Head (Order 7)
  const [homeFeedback, setHomeFeedback] = useState({
    title: '',
    subtitle: '',
  });

  // Mission Section (Order 8)
  const [homeMission, setHomeMission] = useState({
    title: '',
    detail: '',
    image: '',
  });

  // -------------------------------------------------------------
  // 2. ABOUT US CMS STATE (from /admin/webpages/about_us)
  // -------------------------------------------------------------

  // Header Banner Section (Order in page: 1)
  const [aboutBanner, setAboutBanner] = useState({
    title: '',
    description: '',
    image: '',
    button_text: '',
  });

  // Program Overview & Counters (Order in page: 2)
  const [aboutProgram, setAboutProgram] = useState({
    subtitle: '',
    title: '',
    description: '',
    image_left: '',
    image_right: '',
    counters: [
      { number: '98%', label: 'Exam Pass Rate', order: 1 },
      { number: '40+', label: 'Hours of Training', order: 2 },
      { number: '1,500+', label: 'Certified Trainees', order: 3 },
      { number: '100%', label: 'BACB Task List Aligned', order: 4 },
    ],
  });

  // Watch and Learn (Order in page: 3)
  const [aboutWatch, setAboutWatch] = useState({
    subtitle: '',
    title: '',
    description: '',
    video_url: '',
    thumbnail: '',
  });

  // Career Steps (Order in page: 4)
  const [aboutCareer, setAboutCareer] = useState({
    subtitle: '',
    title: '',
    description: '',
    steps: [
      { order: 1, title: '', subtitle: '' },
      { order: 2, title: '', subtitle: '' },
      { order: 3, title: '', subtitle: '' },
      { order: 4, title: '', subtitle: '' },
    ],
  });

  // Commitments Section (Order in page: 5)
  const [aboutCommitment, setAboutCommitment] = useState({
    subtitle: '',
    title: '',
    description: '',
    cards: [
      { title: '', description: '', order: 1 },
      { title: '', description: '', order: 2 },
      { title: '', description: '', order: 3 },
    ],
  });

  // -------------------------------------------------------------
  // 3. CONTACT US CMS STATE (from /admin/webpages/contact)
  // -------------------------------------------------------------
  const [contactBanner, setContactBanner] = useState({
    title: '',
    description: '',
    image: '',
  });

  const [contactCms, setContactCms] = useState({
    title: '',
    subtitle: '',
    phone: '',
    email: '',
    address: '',
    business_hours: '',
    image: '',
    social_linkedin: '',
    social_facebook: '',
    social_twitter: '',
    social_youtube: '',
  });

  // -------------------------------------------------------------
  // 4. COURSE PAGE CMS STATE (from /admin/webpages/course-page/index)
  // -------------------------------------------------------------
  const [coursePageCms, setCoursePageCms] = useState({
    head_subtitle: '',
    head_title: '',
    placeholder: '',
    widgets: [
      { name: '', value: '' },
      { name: '', value: '' },
      { name: '', value: '' },
    ],
  });

  // -------------------------------------------------------------
  // 5. COMMON SECTIONS: FAQS & LEGAL POLICIES
  // -------------------------------------------------------------
  const [faqSection, setFaqSection] = useState<{
    title: string;
    description: string;
    image: string;
    items: FaqItem[];
  }>({
    title: '',
    description: '',
    image: '',
    items: [],
  });

  const [editingFaqId, setEditingFaqId] = useState<number | null>(null);

  const [legalCms, setLegalCms] = useState({
    terms: '',
    privacy: '',
    bacb_disclaimer: '',
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

      if (g.homepage?.home_head) {
        setHomeHead((prev) => ({ ...prev, ...g.homepage.home_head }));
      }
      if (g.homepage?.home_hero) {
        setHomeHero((prev) => ({ ...prev, ...g.homepage.home_hero }));
      }
      if (g.homepage?.home_process) {
        setHomeProcess((prev) => ({
          ...prev,
          ...g.homepage.home_process,
          steps:
            Array.isArray(g.homepage.home_process.steps) && g.homepage.home_process.steps.length > 0
              ? g.homepage.home_process.steps
              : prev.steps,
        }));
      }
      if (g.homepage?.home_apart) {
        setHomeInfoIcons((prev) => ({
          ...prev,
          ...g.homepage.home_apart,
          items:
            Array.isArray(g.homepage.home_apart.items) && g.homepage.home_apart.items.length > 0
              ? g.homepage.home_apart.items
              : prev.items,
        }));
      }
      if (g.homepage?.home_courses) {
        setHomeCourseCards((prev) => ({
          ...prev,
          ...g.homepage.home_courses,
          cards:
            Array.isArray(g.homepage.home_courses.cards) && g.homepage.home_courses.cards.length > 0
              ? g.homepage.home_courses.cards
              : prev.cards,
        }));
      }
      if (g.homepage?.home_starrer) {
        setHomeStarrer((prev) => ({ ...prev, ...g.homepage.home_starrer }));
      }
      if (g.homepage?.home_feedback) {
        setHomeFeedback((prev) => ({ ...prev, ...g.homepage.home_feedback }));
      }
      if (g.homepage?.home_mission) {
        setHomeMission((prev) => ({ ...prev, ...g.homepage.home_mission }));
      }

      const ab = g.about_us?.about_banner || g.about_us?.banner;
      if (ab) {
        setAboutBanner((prev) => ({
          ...prev,
          title: ab.title ?? '',
          description: ab.description ?? ab.detail ?? ab.subtitle ?? '',
          image: ab.image ?? ab.banner_image ?? '',
          button_text: ab.button_text ?? ab.button ?? ab.btn_text ?? '',
        }));
      }
      if (g.about_us?.about_program) {
        setAboutProgram((prev) => ({
          ...prev,
          ...g.about_us.about_program,
          counters:
            Array.isArray(g.about_us.about_program.counters) && g.about_us.about_program.counters.length > 0
              ? g.about_us.about_program.counters
              : prev.counters,
        }));
      }
      if (g.about_us?.about_watch) {
        setAboutWatch((prev) => ({ ...prev, ...g.about_us.about_watch }));
      }
      if (g.about_us?.about_career) {
        setAboutCareer((prev) => ({
          ...prev,
          ...g.about_us.about_career,
          steps:
            Array.isArray(g.about_us.about_career.steps) && g.about_us.about_career.steps.length > 0
              ? g.about_us.about_career.steps
              : prev.steps,
        }));
      }
      if (g.about_us?.about_commitment) {
        setAboutCommitment((prev) => ({
          ...prev,
          ...g.about_us.about_commitment,
          cards:
            Array.isArray(g.about_us.about_commitment.cards) && g.about_us.about_commitment.cards.length > 0
              ? g.about_us.about_commitment.cards
              : prev.cards,
        }));
      }

      const cb = g.contact_us?.contact_banner || g.contact_us?.banner;
      if (cb) {
        setContactBanner((prev) => ({
          ...prev,
          title: cb.title ?? '',
          description: cb.description ?? cb.detail ?? cb.subtitle ?? '',
          image: cb.image ?? cb.banner_image ?? '',
        }));
      }
      if (g.contact_us?.contact_details) {
        setContactCms((prev) => ({ ...prev, ...g.contact_us.contact_details }));
      }
      if (g.course_page?.course_page_details) {
        setCoursePageCms((prev) => ({
          ...prev,
          ...g.course_page.course_page_details,
          widgets:
            Array.isArray(g.course_page.course_page_details.widgets) && g.course_page.course_page_details.widgets.length > 0
              ? g.course_page.course_page_details.widgets
              : prev.widgets,
        }));
      }

      if (g.common?.faqs) {
        if (Array.isArray(g.common.faqs)) {
          setFaqSection((prev) => ({ ...prev, items: g.common.faqs }));
        } else {
          setFaqSection({
            title: g.common.faqs.title || '',
            description: g.common.faqs.description || '',
            image: g.common.faqs.image || '',
            items: Array.isArray(g.common.faqs.items)
              ? g.common.faqs.items
              : (Array.isArray(g.common.faqs.faqs) ? g.common.faqs.faqs : []),
          });
        }
      }
      if (g.common?.legal) {
        setLegalCms((prev) => ({ ...prev, ...g.common.legal }));
      }
    } catch (error) {
      console.error('Failed to load CMS data from server:', error);
      toast.error('Failed to load CMS content from server');
    } finally {
      setIsLoading(false);
    }
  };

  // Section-level save handler
  const handleSaveSection = async (
    page: string,
    section: string,
    content: any,
    label: string,
    options?: { silent?: boolean },
  ) => {
    try {
      setSavingSection(section);
      await cmsApi.updateSection(page, section, content);
      if (!options?.silent) {
        toast.success(`"${label}" section updated successfully!`);
      }
    } catch (error) {
      console.error(`Failed to save ${label}:`, error);
      toast.error(`Failed to save "${label}" section`);
      throw error;
    } finally {
      setSavingSection(null);
    }
  };

  /** Update local section state and immediately persist to the API (needed after image upload). */
  const patchAndSaveHomeHero = (patch: Partial<typeof homeHero>) => {
    setHomeHero((prev) => {
      const next = { ...prev, ...patch };
      void handleSaveSection('homepage', 'home_hero', next, 'Homepage Hero Media', { silent: true })
        .then(() => toast.success('Hero image saved'))
        .catch(() => undefined);
      return next;
    });
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
          about_banner: aboutBanner,
          about_program: aboutProgram,
          about_watch: aboutWatch,
          about_career: aboutCareer,
          about_commitment: aboutCommitment,
        },
        contact_us: {
          contact_banner: contactBanner,
          contact_details: contactCms,
        },
        course_page: {
          course_page_details: coursePageCms,
        },
        common: {
          faqs: faqSection,
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
        await cmsApi.updateSection('common', 'faqs', faqSection);
        toast.success('FAQ updated and saved successfully');
      } catch (e) {
        toast.error('Failed to save FAQ to server');
      }
    } else {
      setEditingFaqId(id);
    }
  };

  const handleUpdateFaq = (id: number, field: 'question' | 'answer', value: string) => {
    setFaqSection((prev) => ({
      ...prev,
      items: prev.items.map((f) => (f.id === id ? { ...f, [field]: value } : f)),
    }));
  };

  const handleAddFaq = () => {
    const newFaq: FaqItem = {
      id: Date.now(),
      question: '',
      answer: '',
    };
    setFaqSection((prev) => ({
      ...prev,
      items: [...prev.items, newFaq],
    }));
    setEditingFaqId(newFaq.id);
    toast.info('New FAQ added. You can now edit the question and answer directly.');
  };

  const handleDeleteFaq = async (id: number) => {
    const updatedItems = faqSection.items.filter((f) => f.id !== id);
    const updatedSection = { ...faqSection, items: updatedItems };
    setFaqSection(updatedSection);
    try {
      await cmsApi.updateSection('common', 'faqs', updatedSection);
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

        {/* TAB 1: HOMEPAGE CMS (/admin/webpages/homepage/) */}
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
                    placeholder="Enter main title..."
                    required
                  />

                  <RichTextEditor
                    label="Sub-Title (HTML / Rich Text)"
                    value={homeHead.subtitle}
                    onChange={(val) => setHomeHead({ ...homeHead, subtitle: val })}
                    height={150}
                    placeholder="Enter subtitle..."
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
                        placeholder="Enter button text..."
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
                        placeholder="Enter button text..."
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
                          onChange={(url) => void patchAndSaveHomeHero({ image_1: url })}
                          aspectRatio="video"
                          label="Upload Hero Image 1"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground font-medium">Hero Image 2</Label>
                        <ImageUploadDropzone
                          value={homeHero.image_2}
                          onChange={(url) => void patchAndSaveHomeHero({ image_2: url })}
                          aspectRatio="video"
                          label="Upload Hero Image 2"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground font-medium">Hero Image 3</Label>
                        <ImageUploadDropzone
                          value={homeHero.image_3}
                          onChange={(url) => void patchAndSaveHomeHero({ image_3: url })}
                          aspectRatio="video"
                          label="Upload Hero Image 3"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground font-medium">Hero Image 4</Label>
                        <ImageUploadDropzone
                          value={homeHero.image_4}
                          onChange={(url) => void patchAndSaveHomeHero({ image_4: url })}
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
                          placeholder="Enter pill text..."
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
                          placeholder="Enter pill text..."
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
                          placeholder="Enter pill text..."
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
                        placeholder="Enter process title..."
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
                              placeholder="Enter step title..."
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
                              placeholder="Enter step description..."
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
                          placeholder="Enter section subtitle..."
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
                          placeholder="Enter section title..."
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
                          placeholder="Enter button text..."
                          className="h-9 text-xs"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <ImageUploadDropzone
                        value={homeInfoIcons.head_image}
                        onChange={(url) =>
                          setHomeInfoIcons({ ...homeInfoIcons, head_image: url })
                        }
                        aspectRatio="banner"
                        label="Head Illustration Image"
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
                                         hover:border-primary transition-colors cursor-pointer group bg-muted/20"
                              style={{ width: 100, height: 50 }}
                            >
                              <input
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  try {
                                    const url = await uploadImage(file);
                                    const newItems = [...homeInfoIcons.items];
                                    newItems[idx] = { ...newItems[idx], image: url };
                                    setHomeInfoIcons({ ...homeInfoIcons, items: newItems });
                                  } catch (err) {
                                    console.warn('Icon upload cancelled or failed:', err);
                                  } finally {
                                    e.target.value = '';
                                  }
                                }}
                              />
                              {item.image ? (
                                <>
                                  <img
                                    src={resolveMediaUrl(item.image)}
                                    alt={`Icon ${idx + 1}`}
                                    className="w-full h-full object-contain p-1"
                                  />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none z-10">
                                    <span className="text-[10px] text-white font-medium">Change</span>
                                  </div>
                                </>
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
                              placeholder="Enter feature title..."
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
                              placeholder="Enter feature description..."
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
                        placeholder="Enter section subtitle..."
                        className="h-9 text-xs"
                      />
                    </div>
                 <div className="space-y-1.5">
  <Label className="text-xs font-semibold">Section Title</Label>
  <Input
    value={homeCourseCards.head_title}
    onChange={(e) =>
      setHomeCourseCards({
        ...homeCourseCards,
        head_title: e.target.value,
      })
    }
    placeholder="Enter section title..."
    required
    className="h-9 text-xs"
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
                              placeholder="Enter course title..."
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
                              placeholder="Enter course overview..."
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
                        placeholder="Enter instructor name..."
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
                        placeholder="Enter degree and certifications..."
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
                      placeholder="Enter instructor bio & clinical background..."
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
                    placeholder="Enter feedback title..."
                    required
                  />
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Feedback Subtitle</Label>
                    <Input
                      value={homeFeedback.subtitle}
                      onChange={(e) =>
                        setHomeFeedback({ ...homeFeedback, subtitle: e.target.value })
                      }
                      placeholder="Enter feedback subtitle..."
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
                    placeholder="Enter mission title..."
                    required
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <RichTextEditor
                      label="Mission Details (Rich Text)"
                      value={homeMission.detail}
                      onChange={(val) => setHomeMission({ ...homeMission, detail: val })}
                      height={165}
                      placeholder="Enter mission details..."
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

        {/* TAB 2: ABOUT US CMS (/admin/webpages/about_us) */}
        <TabsContent value="about" className="space-y-6">
          <AboutUsCmsTab
            aboutBanner={aboutBanner}
            setAboutBanner={setAboutBanner}
            aboutProgram={aboutProgram}
            setAboutProgram={setAboutProgram}
            aboutWatch={aboutWatch}
            setAboutWatch={setAboutWatch}
            aboutCareer={aboutCareer}
            setAboutCareer={setAboutCareer}
            aboutCommitment={aboutCommitment}
            setAboutCommitment={setAboutCommitment}
            savingSection={savingSection}
            handleSaveSection={handleSaveSection}
          />
        </TabsContent>

        {/* TAB 3: CONTACT US CMS (/admin/webpages/contact) */}
        <TabsContent value="contact" className="space-y-6">
          <ContactUsCmsTab
            contactBanner={contactBanner}
            setContactBanner={setContactBanner}
            contactCms={contactCms}
            setContactCms={setContactCms}
            savingSection={savingSection}
            handleSaveSection={handleSaveSection}
          />
        </TabsContent>

        {/* TAB 4: COURSE PAGE CMS (/admin/webpages/course-page/index) */}
        <TabsContent value="course_page" className="space-y-6">
          <CoursePageCmsTab
            coursePageCms={coursePageCms}
            setCoursePageCms={setCoursePageCms}
            savingSection={savingSection}
            handleSaveSection={handleSaveSection}
          />
        </TabsContent>

        {/* TAB 5: COMMON SECTIONS (FAQS & LEGAL POLICIES) */}
        <TabsContent value="common" className="space-y-6">
          <CommonCmsTab
            faqSection={faqSection}
            setFaqSection={setFaqSection}
            editingFaqId={editingFaqId}
            legalCms={legalCms}
            setLegalCms={setLegalCms}
            savingSection={savingSection}
            handleSaveSection={handleSaveSection}
            handleToggleEditFaq={handleToggleEditFaq}
            handleUpdateFaq={handleUpdateFaq}
            handleAddFaq={handleAddFaq}
            handleDeleteFaq={handleDeleteFaq}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
