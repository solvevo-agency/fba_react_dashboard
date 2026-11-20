/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import {
  Globe,
  Save,
  Home,
  Info,
  Mail,
  GraduationCap,
  HelpCircle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cmsApi } from '@/services/cmsApi';
import { toast } from 'sonner';
import {
  HomepageCmsTab,
  AboutUsCmsTab,
  ContactUsCmsTab,
  CoursePageCmsTab,
  CommonCmsTab,
  FaqItem,
} from '@/components/cms';

export default function CmsPage() {
  // -------------------------------------------------------------
  // 1. HOMEPAGE CMS STATE
  // -------------------------------------------------------------
  const [homeHead, setHomeHead] = useState({
    title: '',
    subtitle: '',
    btn_1: '',
    btn_2: '',
  });

  const [homeHero, setHomeHero] = useState({
    image_1: '',
    image_2: '',
    image_3: '',
    image_4: '',
    pill_1: '',
    pill_2: '',
    pill_3: '',
  });

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

  const [homeCourseCards, setHomeCourseCards] = useState({
    head_subtitle: '',
    head_title: '',
    cards: [
      { order: 1, title: '', subtitle: '', image: '' },
      { order: 2, title: '', subtitle: '', image: '' },
      { order: 3, title: '', subtitle: '', image: '' },
    ],
  });

  const [homeStarrer, setHomeStarrer] = useState({
    title: '',
    subtitle: '',
    detail: '',
    image: '',
  });

  const [homeFeedback, setHomeFeedback] = useState({
    title: '',
    subtitle: '',
  });

  const [homeMission, setHomeMission] = useState({
    title: '',
    detail: '',
    image: '',
  });

  // -------------------------------------------------------------
  // 2. ABOUT US CMS STATE
  // -------------------------------------------------------------
  const [aboutBanner, setAboutBanner] = useState({
    title: '',
    description: '',
    image: '',
    button_text: '',
  });

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

  const [aboutWatch, setAboutWatch] = useState({
    subtitle: '',
    title: '',
    description: '',
    video_url: '',
    thumbnail: '',
  });

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
  // 3. CONTACT US CMS STATE
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
  // 4. COURSE PAGE CMS STATE
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

  const [legalCms, setLegalCms] = useState({
    terms: '',
    privacy: '',
    bacb_disclaimer: '',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savingSection, setSavingSection] = useState<string | null>(null);

  // Load live data from backend CMS on mount using exact original API
  useEffect(() => {
    fetchCmsData();
  }, []);

  const fetchCmsData = async () => {
    try {
      setIsLoading(true);
      const data = await cmsApi.getAll();
      const g = data?.grouped || (data as any)?.data?.grouped || {};

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
            Array.isArray(g.homepage.home_process.steps) &&
            g.homepage.home_process.steps.length > 0
              ? g.homepage.home_process.steps
              : prev.steps,
        }));
      }
      if (g.homepage?.home_apart) {
        setHomeInfoIcons((prev) => ({
          ...prev,
          ...g.homepage.home_apart,
          items:
            Array.isArray(g.homepage.home_apart.items) &&
            g.homepage.home_apart.items.length > 0
              ? g.homepage.home_apart.items
              : prev.items,
        }));
      }
      if (g.homepage?.home_courses) {
        setHomeCourseCards((prev) => ({
          ...prev,
          ...g.homepage.home_courses,
          cards:
            Array.isArray(g.homepage.home_courses.cards) &&
            g.homepage.home_courses.cards.length > 0
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
            Array.isArray(g.about_us.about_program.counters) &&
            g.about_us.about_program.counters.length > 0
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
            Array.isArray(g.about_us.about_career.steps) &&
            g.about_us.about_career.steps.length > 0
              ? g.about_us.about_career.steps
              : prev.steps,
        }));
      }
      if (g.about_us?.about_commitment) {
        setAboutCommitment((prev) => ({
          ...prev,
          ...g.about_us.about_commitment,
          cards:
            Array.isArray(g.about_us.about_commitment.cards) &&
            g.about_us.about_commitment.cards.length > 0
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
            Array.isArray(g.course_page.course_page_details.widgets) &&
            g.course_page.course_page_details.widgets.length > 0
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
              : Array.isArray(g.common.faqs.faqs)
                ? g.common.faqs.faqs
                : [],
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
            Configure Homepage, About Us, Contact, Course Page, FAQs, and Compliance policies across
            all student portals.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleSaveAll}
            disabled={isSaving || isLoading}
            className="gap-1.5 h-9 text-xs sm:text-sm font-medium shadow-xs"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSaving ? 'Saving Everything...' : 'Save All Website Changes'}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground text-sm gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          Loading website CMS content...
        </div>
      ) : (
        /* Main Tabs Navigation */
        <Tabs defaultValue="homepage" className="space-y-6">
          <TabsList className="bg-muted/60 p-1 flex-wrap h-auto w-full justify-start gap-1 border">
            <TabsTrigger value="homepage" className="gap-1.5 text-xs sm:text-sm py-2 px-3">
              <Home className="h-4 w-4" /> Homepage CMS
            </TabsTrigger>
            <TabsTrigger value="about" className="gap-1.5 text-xs sm:text-sm py-2 px-3">
              <Info className="h-4 w-4" /> About Us CMS
            </TabsTrigger>
            <TabsTrigger value="contact" className="gap-1.5 text-xs sm:text-sm py-2 px-3">
              <Mail className="h-4 w-4" /> Contact Us CMS
            </TabsTrigger>
            <TabsTrigger value="course_page" className="gap-1.5 text-xs sm:text-sm py-2 px-3">
              <GraduationCap className="h-4 w-4" /> Course Page CMS
            </TabsTrigger>
            <TabsTrigger value="common" className="gap-1.5 text-xs sm:text-sm py-2 px-3">
              <HelpCircle className="h-4 w-4" /> FAQs & Legal Policies
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: HOMEPAGE */}
          <TabsContent value="homepage" className="space-y-6">
            <HomepageCmsTab
              homeHead={homeHead}
              setHomeHead={setHomeHead}
              homeHero={homeHero}
              setHomeHero={setHomeHero}
              homeProcess={homeProcess}
              setHomeProcess={setHomeProcess}
              homeInfoIcons={homeInfoIcons}
              setHomeInfoIcons={setHomeInfoIcons}
              homeCourseCards={homeCourseCards}
              setHomeCourseCards={setHomeCourseCards}
              homeStarrer={homeStarrer}
              setHomeStarrer={setHomeStarrer}
              homeFeedback={homeFeedback}
              setHomeFeedback={setHomeFeedback}
              homeMission={homeMission}
              setHomeMission={setHomeMission}
              savingSection={savingSection}
              onSaveSection={handleSaveSection}
            />
          </TabsContent>

          {/* TAB 2: ABOUT US */}
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
              onSaveSection={handleSaveSection}
            />
          </TabsContent>

          {/* TAB 3: CONTACT US */}
          <TabsContent value="contact" className="space-y-6">
            <ContactUsCmsTab
              contactBanner={contactBanner}
              setContactBanner={setContactBanner}
              contactCms={contactCms}
              setContactCms={setContactCms}
              savingSection={savingSection}
              onSaveSection={handleSaveSection}
            />
          </TabsContent>

          {/* TAB 4: COURSE PAGE */}
          <TabsContent value="course_page" className="space-y-6">
            <CoursePageCmsTab
              coursePageCms={coursePageCms}
              setCoursePageCms={setCoursePageCms}
              savingSection={savingSection}
              onSaveSection={handleSaveSection}
            />
          </TabsContent>

          {/* TAB 5: COMMON (FAQS & LEGAL) */}
          <TabsContent value="common" className="space-y-6">
            <CommonCmsTab
              faqSection={faqSection}
              setFaqSection={setFaqSection}
              legalCms={legalCms}
              setLegalCms={setLegalCms}
              savingSection={savingSection}
              onSaveSection={handleSaveSection}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
