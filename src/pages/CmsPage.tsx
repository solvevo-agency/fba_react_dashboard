import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  HomepageCmsTab,
  AboutUsCmsTab,
  ContactUsCmsTab,
  CoursePageCmsTab,
  CommonCmsTab,
} from '@/components/cms';
import {
  Globe,
  Home,
  Info,
  Mail,
  GraduationCap,
  HelpCircle,
} from 'lucide-react';

export default function CmsPage() {
  const [activeTab, setActiveTab] = useState<string>('homepage');

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
      </div>

      {/* Main Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
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

        {/* Tab 1: Homepage CMS */}
        <TabsContent value="homepage" className="space-y-6 focus-visible:outline-hidden">
          <HomepageCmsTab />
        </TabsContent>

        {/* Tab 2: About Us CMS */}
        <TabsContent value="about" className="space-y-6 focus-visible:outline-hidden">
          <AboutUsCmsTab />
        </TabsContent>

        {/* Tab 3: Contact Us CMS */}
        <TabsContent value="contact" className="space-y-6 focus-visible:outline-hidden">
          <ContactUsCmsTab />
        </TabsContent>

        {/* Tab 4: Course Page CMS */}
        <TabsContent value="course_page" className="space-y-6 focus-visible:outline-hidden">
          <CoursePageCmsTab />
        </TabsContent>

        {/* Tab 5: Common CMS (FAQs & Legal) */}
        <TabsContent value="common" className="space-y-6 focus-visible:outline-hidden">
          <CommonCmsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
