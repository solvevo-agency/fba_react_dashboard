/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import {
  Save,
  Loader2,
  Sparkles,
  Info,
  Video,
  GraduationCap,
  HeartHandshake,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImageUploadDropzone } from '@/components/ui/image-upload-dropzone';
import { VideoUploadDropzone } from '@/components/ui/video-upload-dropzone';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { cmsApi } from '@/services/cmsApi';
import { toast } from 'sonner';
import { uploadImage, fetchPageCmsData } from './cmsUtils';

export function AboutUsCmsTab() {
  // Header Banner Section (Order in page: 1)
  const [aboutBanner, setAboutBanner] = useState({
    title: '',
    description: '',
    image: '',
    button_text: '',
  });

  // Section 2: Program Info & Counters
  const [aboutProgram, setAboutProgram] = useState({
    title: '',
    detail: '',
    image_left: '',
    image_right: '',
    button: '',
    counters: [
      { order: 2, number: '', label: '' },
      { order: 3, number: '', label: '' },
      { order: 4, number: '', label: '' },
    ],
  });

  // Section 3: Watch & Learn / Demo Video + Video Thumbnail
  const [aboutWatch, setAboutWatch] = useState({
    title: '',
    detail: '',
    video_url: '',
    thumbnail: '',
  });

  // Section 4: Career Changes Lives (Header + 3 Steps)
  const [aboutCareer, setAboutCareer] = useState({
    head_title: '',
    head_detail: '',
    steps: [
      { order: 2, title: '', detail: '' },
      { order: 3, title: '', detail: '' },
      { order: 4, title: '', detail: '' },
    ],
  });

  // Section 5: Commitment Cards (Header + 3 Cards)
  const [aboutCommitment, setAboutCommitment] = useState({
    head_title: '',
    head_detail: '',
    cards: [
      { order: 2, title: '', detail: '' },
      { order: 3, title: '', detail: '' },
      { order: 4, title: '', detail: '' },
    ],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [savingSection, setSavingSection] = useState<string | null>(null);

  useEffect(() => {
    fetchAboutData();
  }, []);

  const fetchAboutData = async () => {
    try {
      setIsLoading(true);
      const data = await fetchPageCmsData('about_us');
      if (!data) return;

      const ab = data.about_banner || data.banner;
      if (ab) {
        setAboutBanner((prev) => ({
          ...prev,
          title: ab.title ?? '',
          description: ab.description ?? ab.detail ?? ab.subtitle ?? '',
          image: ab.image ?? ab.banner_image ?? '',
          button_text: ab.button_text ?? ab.button ?? ab.btn_text ?? '',
        }));
      }
      if (data.about_program) {
        setAboutProgram((prev) => ({
          ...prev,
          ...data.about_program,
          counters:
            Array.isArray(data.about_program.counters) &&
            data.about_program.counters.length > 0
              ? data.about_program.counters
              : prev.counters,
        }));
      }
      if (data.about_watch) {
        setAboutWatch((prev) => ({ ...prev, ...data.about_watch }));
      }
      if (data.about_career) {
        setAboutCareer((prev) => ({
          ...prev,
          ...data.about_career,
          steps:
            Array.isArray(data.about_career.steps) && data.about_career.steps.length > 0
              ? data.about_career.steps
              : prev.steps,
        }));
      }
      if (data.about_commitment) {
        setAboutCommitment((prev) => ({
          ...prev,
          ...data.about_commitment,
          cards:
            Array.isArray(data.about_commitment.cards) &&
            data.about_commitment.cards.length > 0
              ? data.about_commitment.cards
              : prev.cards,
        }));
      }
    } catch (err) {
      console.error('Failed to load About Us CMS data:', err);
      toast.error('Failed to load About Us CMS content');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSection = async (section: string, content: any, label: string) => {
    try {
      setSavingSection(section);
      await cmsApi.updateSection('about_us', section, content);
      toast.success(`"${label}" section updated successfully!`);
    } catch (error) {
      console.error(`Failed to save ${label}:`, error);
      toast.error(`Failed to save "${label}" section`);
    } finally {
      setSavingSection(null);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-xs text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-primary mb-2" />
        Loading About Us CMS content...
      </div>
    );
  }

  return (
    <Tabs defaultValue="about_banner" className="space-y-4">
      <div className="border-b pb-2">
        <TabsList className="bg-background border p-1 h-auto flex flex-wrap gap-1">
          <TabsTrigger value="about_banner" className="text-xs py-1 px-2.5">
            1. Header Banner
          </TabsTrigger>
          <TabsTrigger value="about_program" className="text-xs py-1 px-2.5">
            2. Program Info & Counters
          </TabsTrigger>
          <TabsTrigger value="about_video" className="text-xs py-1 px-2.5">
            3. Watch & Learn Video & Thumbnail
          </TabsTrigger>
          <TabsTrigger value="about_career" className="text-xs py-1 px-2.5">
            4. Career Steps
          </TabsTrigger>
          <TabsTrigger value="about_commitment" className="text-xs py-1 px-2.5">
            5. Commitment Cards
          </TabsTrigger>
        </TabsList>
      </div>

      {/* Sub-tab 1: Header Banner */}
      <TabsContent value="about_banner" className="space-y-6">
        <Card className="border shadow-xs">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                About Us Header Banner (Order in page: 1)
              </CardTitle>
              <CardDescription className="text-xs">
                Main page headline, introductory description, CTA button text, and background banner image
              </CardDescription>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                handleSaveSection('about_banner', aboutBanner, 'About Us Banner')
              }
              disabled={savingSection === 'about_banner'}
              className="h-8 text-xs gap-1.5"
            >
              {savingSection === 'about_banner' ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              Save Banner
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                Banner Title <span className="text-destructive">*</span>
              </Label>
              <Input
                value={aboutBanner.title}
                onChange={(e) => setAboutBanner({ ...aboutBanner, title: e.target.value })}
                placeholder="Enter banner title (e.g. Who We Are & What We Do)..."
                className="h-9 text-xs"
              />
            </div>

            <RichTextEditor
              label="Banner Description (HTML / Rich Text)"
              value={aboutBanner.description}
              onChange={(val) => setAboutBanner({ ...aboutBanner, description: val })}
              height={165}
              placeholder="Enter banner description..."
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Button Text</Label>
                <Input
                  value={aboutBanner.button_text}
                  onChange={(e) =>
                    setAboutBanner({ ...aboutBanner, button_text: e.target.value })
                  }
                  placeholder="Enter button text (e.g. Explore Our Services)..."
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <ImageUploadDropzone
                  value={aboutBanner.image}
                  onChange={(url) => setAboutBanner({ ...aboutBanner, image: url })}
                  onUploadFile={uploadImage}
                  aspectRatio="banner"
                  label="Upload Banner Image"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Sub-tab 2: Program Info & Counters */}
      <TabsContent value="about_program" className="space-y-6">
        <Card className="border shadow-xs">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                About Our Program (Order in page: 2)
              </CardTitle>
              <CardDescription className="text-xs">
                Institutional overview, dual illustration gallery, CTA, and 3 metric counters
              </CardDescription>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                handleSaveSection('about_program', aboutProgram, 'About Program')
              }
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
                onChange={(e) => setAboutProgram({ ...aboutProgram, title: e.target.value })}
                placeholder="Enter program title..."
                className="h-9 text-xs"
              />
            </div>

            <RichTextEditor
              label="Detail & Background (HTML / Rich Text)"
              value={aboutProgram.detail}
              onChange={(val) => setAboutProgram({ ...aboutProgram, detail: val })}
              height={165}
              placeholder="Enter program detail & background..."
              required
            />

            {/* Dual Image Gallery: Larger & Smaller */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border rounded-lg p-4 bg-muted/20">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Image Left (Larger)</Label>
                <ImageUploadDropzone
                  value={aboutProgram.image_left}
                  onChange={(url) => setAboutProgram({ ...aboutProgram, image_left: url })}
                  onUploadFile={uploadImage}
                  aspectRatio="banner"
                  label="Upload Program Image Left"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Image Right (Smaller)</Label>
                <ImageUploadDropzone
                  value={aboutProgram.image_right}
                  onChange={(url) => setAboutProgram({ ...aboutProgram, image_right: url })}
                  onUploadFile={uploadImage}
                  aspectRatio="banner"
                  label="Upload Program Image Right"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Info Button Text</Label>
              <Input
                value={aboutProgram.button}
                onChange={(e) => setAboutProgram({ ...aboutProgram, button: e.target.value })}
                placeholder="Enter button text..."
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
                        placeholder="Enter number or stat..."
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
                        placeholder="Enter counter label..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Sub-tab 3: Watch & Learn Video + Thumbnail */}
      <TabsContent value="about_video" className="space-y-6">
        <Card className="border shadow-xs">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Video className="h-4 w-4 text-primary" />
                Watch & Learn: Video Showcase & Thumbnail (Order in page: 3)
              </CardTitle>
              <CardDescription className="text-xs">
                Upload platform demo video with responsive player and custom poster thumbnail
              </CardDescription>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                handleSaveSection(
                  'about_watch',
                  aboutWatch,
                  'Watch & Learn Video'
                )
              }
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
                onChange={(e) => setAboutWatch({ ...aboutWatch, title: e.target.value })}
                placeholder="Enter video section title..."
                className="h-9 text-xs"
              />
            </div>

            <RichTextEditor
              label="Video Section Detail / Description"
              value={aboutWatch.detail}
              onChange={(val) => setAboutWatch({ ...aboutWatch, detail: val })}
              height={160}
              placeholder="Enter video section description..."
              required
            />

            {/* Video & Poster Upload Responsive Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 border rounded-xl p-4 bg-muted/20">
              <div className="space-y-2">
                <VideoUploadDropzone
                  value={aboutWatch.video_url}
                  onChange={(url) => setAboutWatch({ ...aboutWatch, video_url: url })}
                  onUploadFile={async (file) => {
                    const res = await cmsApi.uploadMedia(file);
                    return res.url;
                  }}
                  label="Upload Video"
                />
              </div>

              <div className="space-y-2">
                <ImageUploadDropzone
                  value={aboutWatch.thumbnail}
                  onChange={(url) => setAboutWatch({ ...aboutWatch, thumbnail: url })}
                  onUploadFile={uploadImage}
                  aspectRatio="video"
                  label="Upload Video Thumbnail"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Sub-tab 4: Career Steps */}
      <TabsContent value="about_career" className="space-y-6">
        <Card className="border shadow-xs">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-primary" />
                Career Steps: "Career Changes Lives" (Order in page: 4)
              </CardTitle>
              <CardDescription className="text-xs">
                Section header and 3 sequential milestones for behavioral career advancement
              </CardDescription>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                handleSaveSection('about_career', aboutCareer, 'Career Steps')
              }
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
                  placeholder="Enter header title..."
                  className="h-9 text-xs"
                />
              </div>
              <RichTextEditor
                label="Header Description"
                value={aboutCareer.head_detail}
                onChange={(val) => setAboutCareer({ ...aboutCareer, head_detail: val })}
                height={150}
                placeholder="Enter header description..."
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
                        placeholder="Enter step title..."
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
                      placeholder="Enter step description..."
                    />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Sub-tab 5: Commitment Cards */}
      <TabsContent value="about_commitment" className="space-y-6">
        <Card className="border shadow-xs">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <HeartHandshake className="h-4 w-4 text-primary" />
                Commitment Cards Section (Order in page: 5)
              </CardTitle>
              <CardDescription className="text-xs">
                Institutional core values, clinical ethics, and learner pledges
              </CardDescription>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                handleSaveSection(
                  'about_commitment',
                  aboutCommitment,
                  'Commitment Cards'
                )
              }
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
                placeholder="Enter header title..."
              />
              <RichTextEditor
                label="Header Description (HTML / Rich Text)"
                value={aboutCommitment.head_detail}
                onChange={(val) =>
                  setAboutCommitment({ ...aboutCommitment, head_detail: val })
                }
                height={150}
                placeholder="Enter header description..."
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
                        placeholder="Enter card title..."
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
                      placeholder="Enter card detail..."
                    />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
