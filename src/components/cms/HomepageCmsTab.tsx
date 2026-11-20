/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import {
  Save,
  Loader2,
  Sparkles,
  Workflow,
  Award,
  BookOpen,
  GraduationCap,
  MessageSquare,
  Compass,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImageUploadDropzone } from '@/components/ui/image-upload-dropzone';
import { resolveMediaUrl } from '@/components/ui/video-upload-dropzone';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { uploadImage } from './cmsUtils';

export interface HomepageCmsTabProps {
  homeHead: any;
  setHomeHead: React.Dispatch<React.SetStateAction<any>>;
  homeHero: any;
  setHomeHero: React.Dispatch<React.SetStateAction<any>>;
  homeProcess: any;
  setHomeProcess: React.Dispatch<React.SetStateAction<any>>;
  homeInfoIcons: any;
  setHomeInfoIcons: React.Dispatch<React.SetStateAction<any>>;
  homeCourseCards: any;
  setHomeCourseCards: React.Dispatch<React.SetStateAction<any>>;
  homeStarrer: any;
  setHomeStarrer: React.Dispatch<React.SetStateAction<any>>;
  homeFeedback: any;
  setHomeFeedback: React.Dispatch<React.SetStateAction<any>>;
  homeMission: any;
  setHomeMission: React.Dispatch<React.SetStateAction<any>>;
  savingSection: string | null;
  onSaveSection: (page: string, section: string, content: any, label: string) => Promise<void>;
}

export function HomepageCmsTab({
  homeHead,
  setHomeHead,
  homeHero,
  setHomeHero,
  homeProcess,
  setHomeProcess,
  homeInfoIcons,
  setHomeInfoIcons,
  homeCourseCards,
  setHomeCourseCards,
  homeStarrer,
  setHomeStarrer,
  homeFeedback,
  setHomeFeedback,
  homeMission,
  setHomeMission,
  savingSection,
  onSaveSection,
}: HomepageCmsTabProps) {
  const [activeHomeTab, setActiveHomeTab] = useState('home_head');

  return (
    <div className="space-y-6">
      <Tabs value={activeHomeTab} onValueChange={setActiveHomeTab} className="space-y-4">
        <TabsList className="bg-muted/40 p-1 flex-wrap h-auto w-full justify-start gap-1 border">
          <TabsTrigger value="home_head" className="gap-1.5 text-xs py-1.5">
            <Sparkles className="h-3.5 w-3.5" /> 1. Head (Hero Text)
          </TabsTrigger>
          <TabsTrigger value="home_hero" className="gap-1.5 text-xs py-1.5">
            <Workflow className="h-3.5 w-3.5" /> 2. Hero Visuals & Pills
          </TabsTrigger>
          <TabsTrigger value="home_process" className="gap-1.5 text-xs py-1.5">
            <Award className="h-3.5 w-3.5" /> 3. Process Steps (4 Steps)
          </TabsTrigger>
          <TabsTrigger value="home_apart" className="gap-1.5 text-xs py-1.5">
            <Compass className="h-3.5 w-3.5" /> 4. What Sets Us Apart
          </TabsTrigger>
          <TabsTrigger value="home_courses" className="gap-1.5 text-xs py-1.5">
            <BookOpen className="h-3.5 w-3.5" /> 5. Course Catalog Cards
          </TabsTrigger>
          <TabsTrigger value="home_starrer" className="gap-1.5 text-xs py-1.5">
            <GraduationCap className="h-3.5 w-3.5" /> 6. Featured Instructor
          </TabsTrigger>
          <TabsTrigger value="home_feedback" className="gap-1.5 text-xs py-1.5">
            <MessageSquare className="h-3.5 w-3.5" /> 7. Reviews Section
          </TabsTrigger>
          <TabsTrigger value="home_mission" className="gap-1.5 text-xs py-1.5">
            <Sparkles className="h-3.5 w-3.5" /> 8. Mission Statement
          </TabsTrigger>
        </TabsList>

        {/* 1. HOME HEAD */}
        <TabsContent value="home_head">
          <Card className="border shadow-xs">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Hero Head Content
                </CardTitle>
                <CardDescription className="text-xs">
                  Main landing headline, subtitle text, and call-to-action buttons
                </CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => onSaveSection('homepage', 'home_head', homeHead, 'Hero Head')}
                disabled={savingSection === 'home_head'}
                className="gap-1.5 h-8 text-xs font-medium"
              >
                {savingSection === 'home_head' ? (
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
                  Hero Headline Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={homeHead.title}
                  onChange={(e) => setHomeHead({ ...homeHead, title: e.target.value })}
                  placeholder="e.g. Master Applied Behavior Analysis with Board-Certified Clinicians"
                  className="h-9 text-xs"
                />
              </div>

              <RichTextEditor
                label="Hero Subtitle Description (HTML / Rich Text)"
                value={homeHead.subtitle}
                onChange={(val) => setHomeHead({ ...homeHead, subtitle: val })}
                height={160}
                placeholder="Enter hero subtitle details..."
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Primary CTA Button Label</Label>
                  <Input
                    value={homeHead.btn_1}
                    onChange={(e) => setHomeHead({ ...homeHead, btn_1: e.target.value })}
                    placeholder="e.g. Start 40-Hr Training"
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Secondary CTA Button Label</Label>
                  <Input
                    value={homeHead.btn_2}
                    onChange={(e) => setHomeHead({ ...homeHead, btn_2: e.target.value })}
                    placeholder="e.g. View Curriculum"
                    className="h-9 text-xs"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. HOME HERO */}
        <TabsContent value="home_hero">
          <Card className="border shadow-xs">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <Workflow className="h-5 w-5 text-primary" />
                  Hero Showcase Gallery & Stat Pills
                </CardTitle>
                <CardDescription className="text-xs">
                  4 visual classroom and clinical images plus badge highlight pills
                </CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => onSaveSection('homepage', 'home_hero', homeHero, 'Hero Visuals')}
                disabled={savingSection === 'home_hero'}
                className="gap-1.5 h-8 text-xs font-medium"
              >
                {savingSection === 'home_hero' ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                Save Section
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-xs font-semibold block mb-2">
                  Hero Gallery Images (4 Showcase Cards)
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <ImageUploadDropzone
                      value={homeHero.image_1}
                      onChange={(url) => setHomeHero({ ...homeHero, image_1: url })}
                      onUploadFile={uploadImage}
                      aspectRatio="video"
                      label="Upload Hero Image 1"
                    />
                  </div>
                  <div className="space-y-1">
                    <ImageUploadDropzone
                      value={homeHero.image_2}
                      onChange={(url) => setHomeHero({ ...homeHero, image_2: url })}
                      onUploadFile={uploadImage}
                      aspectRatio="video"
                      label="Upload Hero Image 2"
                    />
                  </div>
                  <div className="space-y-1">
                    <ImageUploadDropzone
                      value={homeHero.image_3}
                      onChange={(url) => setHomeHero({ ...homeHero, image_3: url })}
                      onUploadFile={uploadImage}
                      aspectRatio="video"
                      label="Upload Hero Image 3"
                    />
                  </div>
                  <div className="space-y-1">
                    <ImageUploadDropzone
                      value={homeHero.image_4}
                      onChange={(url) => setHomeHero({ ...homeHero, image_4: url })}
                      onUploadFile={uploadImage}
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
                    <Label className="text-xs font-medium">Pill 1 Highlight</Label>
                    <Input
                      value={homeHero.pill_1}
                      onChange={(e) => setHomeHero({ ...homeHero, pill_1: e.target.value })}
                      placeholder="e.g. 40 Hours BACB Aligned"
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Pill 2 Highlight</Label>
                    <Input
                      value={homeHero.pill_2}
                      onChange={(e) => setHomeHero({ ...homeHero, pill_2: e.target.value })}
                      placeholder="e.g. Self-Paced 180 Days"
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Pill 3 Highlight</Label>
                    <Input
                      value={homeHero.pill_3}
                      onChange={(e) => setHomeHero({ ...homeHero, pill_3: e.target.value })}
                      placeholder="e.g. Official Certificate"
                      className="h-9 text-xs"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. HOME PROCESS */}
        <TabsContent value="home_process">
          <Card className="border shadow-xs">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Process & Milestone Journey
                </CardTitle>
                <CardDescription className="text-xs">
                  4-step sequential roadmap for aspiring RBT candidates
                </CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => onSaveSection('homepage', 'home_process', homeProcess, 'Process Steps')}
                disabled={savingSection === 'home_process'}
                className="gap-1.5 h-8 text-xs font-medium"
              >
                {savingSection === 'home_process' ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                Save Section
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <RichTextEditor
                    label="Process Section Heading (Rich Text / HTML)"
                    value={homeProcess.title}
                    onChange={(val) => setHomeProcess({ ...homeProcess, title: val })}
                    height={180}
                    placeholder="Enter process title..."
                  />
                </div>
                <div className="space-y-2">
                  <ImageUploadDropzone
                    value={homeProcess.image}
                    onChange={(url) => setHomeProcess({ ...homeProcess, image: url })}
                    onUploadFile={uploadImage}
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
                  {homeProcess.steps.map((st: any, idx: number) => (
                    <div
                      key={st.order || idx}
                      className="border rounded-lg p-3.5 bg-muted/20 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-primary">Step #{idx + 1}</span>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Step Title</Label>
                        <Input
                          value={st.title}
                          onChange={(e) => {
                            const newSteps = [...homeProcess.steps];
                            newSteps[idx].title = e.target.value;
                            setHomeProcess({ ...homeProcess, steps: newSteps });
                          }}
                          placeholder={`Enter step ${idx + 1} title...`}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Step Subtitle</Label>
                        <Input
                          value={st.subtitle}
                          onChange={(e) => {
                            const newSteps = [...homeProcess.steps];
                            newSteps[idx].subtitle = e.target.value;
                            setHomeProcess({ ...homeProcess, steps: newSteps });
                          }}
                          placeholder={`Enter step ${idx + 1} description...`}
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

        {/* 4. HOME APART */}
        <TabsContent value="home_apart">
          <Card className="border shadow-xs">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <Compass className="h-5 w-5 text-primary" />
                  What Sets Us Apart (5 Pillars)
                </CardTitle>
                <CardDescription className="text-xs">
                  Header banner and 5 distinctive institutional benefits
                </CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => onSaveSection('homepage', 'home_apart', homeInfoIcons, 'What Sets Us Apart')}
                disabled={savingSection === 'home_apart'}
                className="gap-1.5 h-8 text-xs font-medium"
              >
                {savingSection === 'home_apart' ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                Save Section
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Head Subtitle</Label>
                    <Input
                      value={homeInfoIcons.head_subtitle}
                      onChange={(e) =>
                        setHomeInfoIcons({ ...homeInfoIcons, head_subtitle: e.target.value })
                      }
                      placeholder="e.g. Built for Real Clinical Practice"
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Head Button Label</Label>
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

                <RichTextEditor
                  label="Head Title (HTML / Rich Text)"
                  value={homeInfoIcons.head_title}
                  onChange={(val) => setHomeInfoIcons({ ...homeInfoIcons, head_title: val })}
                  height={150}
                  placeholder="Enter main title..."
                />

                <div className="space-y-1.5">
                  <ImageUploadDropzone
                    value={homeInfoIcons.head_image}
                    onChange={(url) => setHomeInfoIcons({ ...homeInfoIcons, head_image: url })}
                    onUploadFile={uploadImage}
                    aspectRatio="banner"
                    label="Head Illustration Image"
                  />
                </div>
              </div>

              <div className="border-t pt-4 space-y-4">
                <Label className="text-xs font-semibold block">5 Core Pillars & Benefits</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {homeInfoIcons.items.map((item: any, idx: number) => (
                    <div
                      key={item.order || idx}
                      className="border rounded-lg p-3 space-y-3 bg-muted/20"
                    >
                      <span className="text-xs font-bold text-primary block">
                        Pillar #{idx + 1}
                      </span>
                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Title</Label>
                        <Input
                          value={item.title}
                          onChange={(e) => {
                            const newItems = [...homeInfoIcons.items];
                            newItems[idx].title = e.target.value;
                            setHomeInfoIcons({ ...homeInfoIcons, items: newItems });
                          }}
                          placeholder="Title..."
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Subtitle</Label>
                        <Input
                          value={item.subtitle}
                          onChange={(e) => {
                            const newItems = [...homeInfoIcons.items];
                            newItems[idx].subtitle = e.target.value;
                            setHomeInfoIcons({ ...homeInfoIcons, items: newItems });
                          }}
                          placeholder="Subtitle..."
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Image / Icon URL</Label>
                        <div className="flex gap-2 items-center">
                          <Input
                            value={item.image}
                            onChange={(e) => {
                              const newItems = [...homeInfoIcons.items];
                              newItems[idx].image = e.target.value;
                              setHomeInfoIcons({ ...homeInfoIcons, items: newItems });
                            }}
                            placeholder="/uploads/..."
                            className="h-8 text-xs"
                          />
                          <input
                            type="file"
                            accept="image/*"
                            id={`pillar-file-${idx}`}
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const url = await uploadImage(file);
                                const newItems = [...homeInfoIcons.items];
                                newItems[idx].image = url;
                                setHomeInfoIcons({ ...homeInfoIcons, items: newItems });
                              }
                            }}
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-8 text-[11px] shrink-0"
                            onClick={() => document.getElementById(`pillar-file-${idx}`)?.click()}
                          >
                            Upload
                          </Button>
                        </div>
                        {item.image && (
                          <div className="mt-2 h-14 w-14 rounded-md border overflow-hidden bg-background flex items-center justify-center">
                            <img
                              src={resolveMediaUrl(item.image)}
                              alt="Pillar icon"
                              className="h-full w-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 5. HOME COURSES */}
        <TabsContent value="home_courses">
          <Card className="border shadow-xs">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Homepage Course Catalog Cards
                </CardTitle>
                <CardDescription className="text-xs">
                  Header description and 3 curriculum preview cards
                </CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => onSaveSection('homepage', 'home_courses', homeCourseCards, 'Course Cards')}
                disabled={savingSection === 'home_courses'}
                className="gap-1.5 h-8 text-xs font-medium"
              >
                {savingSection === 'home_courses' ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                Save Section
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Catalog Subtitle</Label>
                  <Input
                    value={homeCourseCards.head_subtitle}
                    onChange={(e) =>
                      setHomeCourseCards({ ...homeCourseCards, head_subtitle: e.target.value })
                    }
                    placeholder="e.g. Choose Your Learning Path"
                    className="h-9 text-xs"
                  />
                </div>

                <RichTextEditor
                  label="Catalog Title & Overview (HTML / Rich Text)"
                  value={homeCourseCards.head_title}
                  onChange={(val) => setHomeCourseCards({ ...homeCourseCards, head_title: val })}
                  height={150}
                  placeholder="Enter catalog title..."
                />
              </div>

              <div className="border-t pt-4 space-y-4">
                <Label className="text-xs font-semibold block">3 Featured Course Cards</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {homeCourseCards.cards.map((card: any, idx: number) => (
                    <div
                      key={card.order || idx}
                      className="border rounded-lg p-3 space-y-3 bg-muted/20"
                    >
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
                        onUploadFile={uploadImage}
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
                          placeholder="Course name..."
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Subtitle / Duration</Label>
                        <Input
                          value={card.subtitle}
                          onChange={(e) => {
                            const newCards = [...homeCourseCards.cards];
                            newCards[idx].subtitle = e.target.value;
                            setHomeCourseCards({ ...homeCourseCards, cards: newCards });
                          }}
                          placeholder="e.g. 40 Hours Comprehensive"
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

        {/* 6. HOME STARRER */}
        <TabsContent value="home_starrer">
          <Card className="border shadow-xs">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  Featured Clinical Director / Instructor
                </CardTitle>
                <CardDescription className="text-xs">
                  Spotlight profile for the lead BCBA-D instructor
                </CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => onSaveSection('homepage', 'home_starrer', homeStarrer, 'Featured Instructor')}
                disabled={savingSection === 'home_starrer'}
                className="gap-1.5 h-8 text-xs font-medium"
              >
                {savingSection === 'home_starrer' ? (
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
                  <Label className="text-xs font-semibold">Instructor Name & Credentials</Label>
                  <Input
                    value={homeStarrer.title}
                    onChange={(e) => setHomeStarrer({ ...homeStarrer, title: e.target.value })}
                    placeholder="e.g. Jennifer, BCBA-D"
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Instructor Subtitle / Role</Label>
                  <Input
                    value={homeStarrer.subtitle}
                    onChange={(e) => setHomeStarrer({ ...homeStarrer, subtitle: e.target.value })}
                    placeholder="e.g. Lead Instructor & Board Certified Behavior Analyst"
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <RichTextEditor
                label="Full Instructor Biography & Clinical Background"
                value={homeStarrer.detail}
                onChange={(val) => setHomeStarrer({ ...homeStarrer, detail: val })}
                height={165}
                placeholder="Enter instructor bio & clinical background..."
              />

              <div className="space-y-2">
                <ImageUploadDropzone
                  value={homeStarrer.image}
                  onChange={(url) => setHomeStarrer({ ...homeStarrer, image: url })}
                  onUploadFile={uploadImage}
                  aspectRatio="square"
                  label="Upload Instructor Portrait Image"
                  className="w-full !important"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 7. HOME FEEDBACK */}
        <TabsContent value="home_feedback">
          <Card className="border shadow-xs">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Student Feedback & Testimonials Header
                </CardTitle>
                <CardDescription className="text-xs">
                  Headline and description for student testimonials section
                </CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => onSaveSection('homepage', 'home_feedback', homeFeedback, 'Feedback Section')}
                disabled={savingSection === 'home_feedback'}
                className="gap-1.5 h-8 text-xs font-medium"
              >
                {savingSection === 'home_feedback' ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                Save Section
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Section Title</Label>
                <Input
                  value={homeFeedback.title}
                  onChange={(e) => setHomeFeedback({ ...homeFeedback, title: e.target.value })}
                  placeholder="e.g. What Our Certified Students Say"
                  className="h-9 text-xs"
                />
              </div>

              <RichTextEditor
                label="Section Subtitle / Description"
                value={homeFeedback.subtitle}
                onChange={(val) => setHomeFeedback({ ...homeFeedback, subtitle: val })}
                height={150}
                placeholder="Enter feedback subtitle description..."
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* 8. HOME MISSION */}
        <TabsContent value="home_mission">
          <Card className="border shadow-xs">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Mission Statement & Institutional Purpose
                </CardTitle>
                <CardDescription className="text-xs">
                  Institutional mission, clinical ethics, and closing CTA section
                </CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => onSaveSection('homepage', 'home_mission', homeMission, 'Mission Statement')}
                disabled={savingSection === 'home_mission'}
                className="gap-1.5 h-8 text-xs font-medium"
              >
                {savingSection === 'home_mission' ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                Save Section
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Mission Headline</Label>
                <Input
                  value={homeMission.title}
                  onChange={(e) => setHomeMission({ ...homeMission, title: e.target.value })}
                  placeholder="e.g. Advancing Behavioral Health Quality Across America"
                  className="h-9 text-xs"
                />
              </div>

              <RichTextEditor
                label="Mission Statement Details & Commitment"
                value={homeMission.detail}
                onChange={(val) => setHomeMission({ ...homeMission, detail: val })}
                height={165}
                placeholder="Enter mission details..."
              />

              <div className="space-y-2">
                <ImageUploadDropzone
                  value={homeMission.image}
                  onChange={(url) => setHomeMission({ ...homeMission, image: url })}
                  onUploadFile={uploadImage}
                  aspectRatio="banner"
                  label="Upload Mission Image"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
