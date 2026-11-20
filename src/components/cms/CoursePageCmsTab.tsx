/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { GraduationCap, Save, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/ui/rich-text-editor';

export interface CoursePageCmsTabProps {
  coursePageCms: any;
  setCoursePageCms: React.Dispatch<React.SetStateAction<any>>;
  savingSection: string | null;
  onSaveSection: (page: string, section: string, content: any, label: string) => Promise<void>;
}

export function CoursePageCmsTab({
  coursePageCms,
  setCoursePageCms,
  savingSection,
  onSaveSection,
}: CoursePageCmsTabProps) {
  return (
    <div className="space-y-6">
      <Card className="border shadow-xs">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              Course Catalog Page Header & Search Banner
            </CardTitle>
            <CardDescription className="text-xs">
              Page title, search input placeholder, description, and feature highlight widgets
            </CardDescription>
          </div>
          <Button
            size="sm"
            onClick={() =>
              onSaveSection('course_page', 'course_page_details', coursePageCms, 'Course Catalog Details')
            }
            disabled={savingSection === 'course_page_details'}
            className="gap-1.5 h-8 text-xs font-medium"
          >
            {savingSection === 'course_page_details' ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            Save Catalog Page
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Page Eyebrow / Subtitle</Label>
              <Input
                value={coursePageCms.head_subtitle}
                onChange={(e) =>
                  setCoursePageCms({ ...coursePageCms, head_subtitle: e.target.value })
                }
                placeholder="e.g. ONLINE TRAINING PORTAL"
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Search Input Placeholder Text</Label>
              <Input
                value={coursePageCms.placeholder}
                onChange={(e) =>
                  setCoursePageCms({ ...coursePageCms, placeholder: e.target.value })
                }
                placeholder="e.g. Search 40-hour modules, quizzes, or training materials..."
                className="h-9 text-xs"
              />
            </div>
          </div>

          <RichTextEditor
            label="Catalog Header Title & Description (HTML / Rich Text)"
            value={coursePageCms.head_title}
            onChange={(val) => setCoursePageCms({ ...coursePageCms, head_title: val })}
            height={165}
            placeholder="Enter catalog headline..."
          />

          <div className="border-t pt-4 space-y-4">
            <Label className="text-xs font-semibold block">
              3 Feature Highlight Badges (Widgets)
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {coursePageCms.widgets.map((w: any, idx: number) => (
                <div
                  key={idx}
                  className="border rounded-lg p-3 bg-muted/20 space-y-2.5"
                >
                  <span className="text-xs font-bold text-primary block">
                    Widget #{idx + 1}
                  </span>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Widget Name / Title</Label>
                    <Input
                      value={w.name}
                      onChange={(e) => {
                        const newWidgets = [...coursePageCms.widgets];
                        newWidgets[idx].name = e.target.value;
                        setCoursePageCms({ ...coursePageCms, widgets: newWidgets });
                      }}
                      placeholder={`Widget ${idx + 1} title...`}
                      className="h-8 text-xs font-semibold"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Widget Description / Value</Label>
                    <Input
                      value={w.value}
                      onChange={(e) => {
                        const newWidgets = [...coursePageCms.widgets];
                        newWidgets[idx].value = e.target.value;
                        setCoursePageCms({ ...coursePageCms, widgets: newWidgets });
                      }}
                      placeholder={`Widget ${idx + 1} detail...`}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
