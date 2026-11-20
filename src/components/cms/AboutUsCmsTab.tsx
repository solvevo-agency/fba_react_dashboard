/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import {
  Save,
  Loader2,
  Sparkles,
  Award,
  Video,
  Briefcase,
  HeartHandshake,
  Plus,
  Trash2,
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
import { uploadImage } from './cmsUtils';

export interface AboutUsCmsTabProps {
  aboutBanner: any;
  setAboutBanner: React.Dispatch<React.SetStateAction<any>>;
  aboutProgram: any;
  setAboutProgram: React.Dispatch<React.SetStateAction<any>>;
  aboutWatch: any;
  setAboutWatch: React.Dispatch<React.SetStateAction<any>>;
  aboutCareer: any;
  setAboutCareer: React.Dispatch<React.SetStateAction<any>>;
  aboutCommitment: any;
  setAboutCommitment: React.Dispatch<React.SetStateAction<any>>;
  savingSection: string | null;
  onSaveSection: (page: string, section: string, content: any, label: string) => Promise<void>;
}

export function AboutUsCmsTab({
  aboutBanner,
  setAboutBanner,
  aboutProgram,
  setAboutProgram,
  aboutWatch,
  setAboutWatch,
  aboutCareer,
  setAboutCareer,
  aboutCommitment,
  setAboutCommitment,
  savingSection,
  onSaveSection,
}: AboutUsCmsTabProps) {
  const [activeAboutTab, setActiveAboutTab] = useState('about_banner');

  return (
    <div className="space-y-6">
      <Tabs value={activeAboutTab} onValueChange={setActiveAboutTab} className="space-y-4">
        <TabsList className="bg-muted/40 p-1 flex-wrap h-auto w-full justify-start gap-1 border">
          <TabsTrigger value="about_banner" className="gap-1.5 text-xs py-1.5">
            <Sparkles className="h-3.5 w-3.5" /> 1. Header Banner
          </TabsTrigger>
          <TabsTrigger value="about_program" className="gap-1.5 text-xs py-1.5">
            <Award className="h-3.5 w-3.5" /> 2. Program Details & Metrics
          </TabsTrigger>
          <TabsTrigger value="about_watch" className="gap-1.5 text-xs py-1.5">
            <Video className="h-3.5 w-3.5" /> 3. Spotlight Video
          </TabsTrigger>
          <TabsTrigger value="about_career" className="gap-1.5 text-xs py-1.5">
            <Briefcase className="h-3.5 w-3.5" /> 4. Career Roadmaps (4 Steps)
          </TabsTrigger>
          <TabsTrigger value="about_commitment" className="gap-1.5 text-xs py-1.5">
            <HeartHandshake className="h-3.5 w-3.5" /> 5. Institutional Commitments
          </TabsTrigger>
        </TabsList>

        {/* 1. ABOUT BANNER */}
        <TabsContent value="about_banner">
          <Card className="border shadow-xs">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  About Us Main Header Banner
                </CardTitle>
                <CardDescription className="text-xs">
                  Hero banner title, subtitle description, and main illustrative photo
                </CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => onSaveSection('about_us', 'about_banner', aboutBanner, 'About Header Banner')}
                disabled={savingSection === 'about_banner'}
                className="gap-1.5 h-8 text-xs font-medium"
              >
                {savingSection === 'about_banner' ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                Save Section
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  Page Headline Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={aboutBanner.title}
                  onChange={(e) => setAboutBanner({ ...aboutBanner, title: e.target.value })}
                  placeholder="e.g. Empowering ABA Professionals Through Practical, Compassionate Training"
                  className="h-9 text-xs"
                />
              </div>

              <RichTextEditor
                label="Banner Description (HTML / Rich Text)"
                value={aboutBanner.description}
                onChange={(val) => setAboutBanner({ ...aboutBanner, description: val })}
                height={165}
                placeholder="Enter about banner overview..."
              />

              <div className="space-y-2">
                <ImageUploadDropzone
                  value={aboutBanner.image}
                  onChange={(url) => setAboutBanner({ ...aboutBanner, image: url })}
                  onUploadFile={uploadImage}
                  aspectRatio="banner"
                  label="Upload Banner Image"
                />
              </div>

              <div className="space-y-1.5 border-t pt-4">
                <Label className="text-xs font-semibold">Primary CTA Button Text</Label>
                <Input
                  value={aboutBanner.button_text}
                  onChange={(e) =>
                    setAboutBanner({ ...aboutBanner, button_text: e.target.value })
                  }
                  placeholder="e.g. Explore Courses"
                  className="h-9 text-xs"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. ABOUT PROGRAM */}
        <TabsContent value="about_program">
          <Card className="border shadow-xs">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Program Overview & Performance Metrics
                </CardTitle>
                <CardDescription className="text-xs">
                  Institutional stats, side-by-side clinical photos, and program overview
                </CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => onSaveSection('about_us', 'about_program', aboutProgram, 'Program Overview')}
                disabled={savingSection === 'about_program'}
                className="gap-1.5 h-8 text-xs font-medium"
              >
                {savingSection === 'about_program' ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                Save Section
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Section Tag / Category</Label>
                  <Input
                    value={aboutProgram.subtitle}
                    onChange={(e) =>
                      setAboutProgram({ ...aboutProgram, subtitle: e.target.value })
                    }
                    placeholder="e.g. OUR TRAINING STANDARDS"
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Main Section Title</Label>
                  <Input
                    value={aboutProgram.title}
                    onChange={(e) => setAboutProgram({ ...aboutProgram, title: e.target.value })}
                    placeholder="e.g. Built for Clinical Excellence and Exam Success"
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <RichTextEditor
                label="Full Program Description"
                value={aboutProgram.description}
                onChange={(val) => setAboutProgram({ ...aboutProgram, description: val })}
                height={165}
                placeholder="Enter program overview and clinical philosophy..."
              />

              {/* Side-by-Side Images */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-4">
                <ImageUploadDropzone
                  value={aboutProgram.image_left}
                  onChange={(url) => setAboutProgram({ ...aboutProgram, image_left: url })}
                  onUploadFile={uploadImage}
                  aspectRatio="banner"
                  label="Upload Program Image Left"
                />
                <ImageUploadDropzone
                  value={aboutProgram.image_right}
                  onChange={(url) => setAboutProgram({ ...aboutProgram, image_right: url })}
                  onUploadFile={uploadImage}
                  aspectRatio="banner"
                  label="Upload Program Image Right"
                />
              </div>

              {/* Counters */}
              <div className="border-t pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                      Program Statistic Counters
                    </Label>
                    <span className="text-[11px] text-muted-foreground">
                      Add numbers (e.g. 98%, 40+, 1,500) and descriptions to highlight achievements
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const newCounters = [
                        ...aboutProgram.counters,
                        { number: '', label: '', order: aboutProgram.counters.length + 1 },
                      ];
                      setAboutProgram({ ...aboutProgram, counters: newCounters });
                    }}
                    className="gap-1.5 h-7 text-xs font-medium"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Counter
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {aboutProgram.counters.map((c: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 border rounded-lg bg-card hover:bg-muted/20 transition-colors space-y-2 relative group"
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const newCounters = aboutProgram.counters.filter((_: any, i: number) => i !== idx);
                          setAboutProgram({ ...aboutProgram, counters: newCounters });
                        }}
                        className="h-6 w-6 absolute top-2 right-2 text-muted-foreground hover:text-destructive opacity-80 group-hover:opacity-100"
                        title="Delete counter"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                      <div className="space-y-1 pr-6">
                        <Label className="text-[11px] text-muted-foreground font-semibold">
                          Metric Value
                        </Label>
                        <Input
                          value={c.number}
                          onChange={(e) => {
                            const newCounters = [...aboutProgram.counters];
                            newCounters[idx].number = e.target.value;
                            setAboutProgram({ ...aboutProgram, counters: newCounters });
                          }}
                          placeholder="e.g. 98% or 40+"
                          className="h-8 text-xs font-bold"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground font-semibold">
                          Metric Label
                        </Label>
                        <Input
                          value={c.label}
                          onChange={(e) => {
                            const newCounters = [...aboutProgram.counters];
                            newCounters[idx].label = e.target.value;
                            setAboutProgram({ ...aboutProgram, counters: newCounters });
                          }}
                          placeholder="e.g. Exam Pass Rate"
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

        {/* 3. ABOUT WATCH */}
        <TabsContent value="about_watch">
          <Card className="border shadow-xs">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <Video className="h-5 w-5 text-primary" />
                  About Us Spotlight Video Section
                </CardTitle>
                <CardDescription className="text-xs">
                  Video preview, poster graphic, and narrative explanation of our approach
                </CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => onSaveSection('about_us', 'about_watch', aboutWatch, 'Spotlight Video')}
                disabled={savingSection === 'about_watch'}
                className="gap-1.5 h-8 text-xs font-medium"
              >
                {savingSection === 'about_watch' ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                Save Section
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Subtitle / Eyebrow</Label>
                  <Input
                    value={aboutWatch.subtitle}
                    onChange={(e) => setAboutWatch({ ...aboutWatch, subtitle: e.target.value })}
                    placeholder="e.g. WATCH OUR METHODOLOGY IN ACTION"
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Main Heading</Label>
                  <Input
                    value={aboutWatch.title}
                    onChange={(e) => setAboutWatch({ ...aboutWatch, title: e.target.value })}
                    placeholder="e.g. Inside the 40-Hour Curriculum"
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <RichTextEditor
                label="Full Video Narrative & Key Insights"
                value={aboutWatch.description}
                onChange={(val) => setAboutWatch({ ...aboutWatch, description: val })}
                height={165}
                placeholder="Enter full video narrative and insights..."
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

        {/* 4. ABOUT CAREER */}
        <TabsContent value="about_career">
          <Card className="border shadow-xs">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  Candidate Career & Clinical Roadmaps
                </CardTitle>
                <CardDescription className="text-xs">
                  Headline, narrative, and 4 sequential career growth milestones
                </CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => onSaveSection('about_us', 'about_career', aboutCareer, 'Career Roadmaps')}
                disabled={savingSection === 'about_career'}
                className="gap-1.5 h-8 text-xs font-medium"
              >
                {savingSection === 'about_career' ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                Save Section
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Section Tag / Category</Label>
                  <Input
                    value={aboutCareer.subtitle}
                    onChange={(e) => setAboutCareer({ ...aboutCareer, subtitle: e.target.value })}
                    placeholder="e.g. YOUR PROFESSIONAL PATHWAY"
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Main Heading</Label>
                  <Input
                    value={aboutCareer.title}
                    onChange={(e) => setAboutCareer({ ...aboutCareer, title: e.target.value })}
                    placeholder="e.g. From Trainee to Board-Registered Behavioral Technician"
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <RichTextEditor
                label="Full Section Description"
                value={aboutCareer.description}
                onChange={(val) => setAboutCareer({ ...aboutCareer, description: val })}
                height={165}
                placeholder="Enter career roadmap narrative..."
              />

              <div className="border-t pt-4 space-y-4">
                <Label className="text-xs font-semibold block">
                  Sequential Career Milestones (4 Steps)
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {aboutCareer.steps.map((st: any, idx: number) => (
                    <div
                      key={st.order || idx}
                      className="border rounded-lg p-3.5 bg-muted/20 space-y-2.5"
                    >
                      <span className="text-xs font-bold text-primary block">
                        Milestone #{idx + 1}
                      </span>
                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Milestone Title</Label>
                        <Input
                          value={st.title}
                          onChange={(e) => {
                            const newSteps = [...aboutCareer.steps];
                            newSteps[idx].title = e.target.value;
                            setAboutCareer({ ...aboutCareer, steps: newSteps });
                          }}
                          placeholder={`Enter milestone ${idx + 1} title...`}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Milestone Description</Label>
                        <Input
                          value={st.subtitle}
                          onChange={(e) => {
                            const newSteps = [...aboutCareer.steps];
                            newSteps[idx].subtitle = e.target.value;
                            setAboutCareer({ ...aboutCareer, steps: newSteps });
                          }}
                          placeholder={`Enter milestone ${idx + 1} description...`}
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

        {/* 5. ABOUT COMMITMENT */}
        <TabsContent value="about_commitment">
          <Card className="border shadow-xs">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <HeartHandshake className="h-5 w-5 text-primary" />
                  Institutional Commitments & Values
                </CardTitle>
                <CardDescription className="text-xs">
                  Header description and core commitments to trainees, clinics, and families
                </CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => onSaveSection('about_us', 'about_commitment', aboutCommitment, 'Institutional Commitments')}
                disabled={savingSection === 'about_commitment'}
                className="gap-1.5 h-8 text-xs font-medium"
              >
                {savingSection === 'about_commitment' ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                Save Section
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Section Tag / Category</Label>
                  <Input
                    value={aboutCommitment.subtitle}
                    onChange={(e) =>
                      setAboutCommitment({ ...aboutCommitment, subtitle: e.target.value })
                    }
                    placeholder="e.g. OUR CORE COMMITMENTS"
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Main Heading</Label>
                  <Input
                    value={aboutCommitment.title}
                    onChange={(e) =>
                      setAboutCommitment({ ...aboutCommitment, title: e.target.value })
                    }
                    placeholder="e.g. Dedicated to Upholding the Highest Ethics in Behavior Analysis"
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <RichTextEditor
                label="Full Section Narrative & Philosophy"
                value={aboutCommitment.description}
                onChange={(val) =>
                  setAboutCommitment({ ...aboutCommitment, description: val })
                }
                height={165}
                placeholder="Enter commitment overview..."
              />

              <div className="border-t pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold">Core Commitment Statements</Label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const newCards = [
                        ...aboutCommitment.cards,
                        { title: '', description: '', order: aboutCommitment.cards.length + 1 },
                      ];
                      setAboutCommitment({ ...aboutCommitment, cards: newCards });
                    }}
                    className="gap-1.5 h-7 text-xs font-medium"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Commitment
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {aboutCommitment.cards.map((c: any, idx: number) => (
                    <div
                      key={c.order || idx}
                      className="border rounded-lg p-3.5 bg-muted/20 space-y-2.5 relative group"
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const newCards = aboutCommitment.cards.filter((_: any, i: number) => i !== idx);
                          setAboutCommitment({ ...aboutCommitment, cards: newCards });
                        }}
                        className="h-6 w-6 absolute top-2 right-2 text-muted-foreground hover:text-destructive opacity-80 group-hover:opacity-100"
                        title="Delete commitment"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                      <span className="text-xs font-bold text-primary block pr-6">
                        Commitment #{idx + 1}
                      </span>
                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Title</Label>
                        <Input
                          value={c.title}
                          onChange={(e) => {
                            const newCards = [...aboutCommitment.cards];
                            newCards[idx].title = e.target.value;
                            setAboutCommitment({ ...aboutCommitment, cards: newCards });
                          }}
                          placeholder="e.g. Clinical Authenticity"
                          className="h-8 text-xs font-semibold"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Description</Label>
                        <Input
                          value={c.description}
                          onChange={(e) => {
                            const newCards = [...aboutCommitment.cards];
                            newCards[idx].description = e.target.value;
                            setAboutCommitment({ ...aboutCommitment, cards: newCards });
                          }}
                          placeholder="Enter brief description..."
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
      </Tabs>
    </div>
  );
}
