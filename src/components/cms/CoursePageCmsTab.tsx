/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import {
  Save,
  Loader2,
  BookOpen,
  Search,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { cmsApi } from '@/services/cmsApi';
import { toast } from 'sonner';

export function CoursePageCmsTab() {
  const [coursePageCms, setCoursePageCms] = useState({
    head_subtitle: '',
    head_title: '',
    head_description: '',
    placeholder: '',
    widgets: [
      { name: '', value: '' },
      { name: '', value: '' },
      { name: '', value: '' },
    ],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [savingSection, setSavingSection] = useState<string | null>(null);

  useEffect(() => {
    fetchCoursePageData();
  }, []);

  const fetchCoursePageData = async () => {
    try {
      setIsLoading(true);
      const data = await cmsApi.getPage('course_page');
      if (!data) return;

      if (data.course_page_details) {
        setCoursePageCms((prev) => ({
          ...prev,
          ...data.course_page_details,
          widgets:
            Array.isArray(data.course_page_details.widgets) &&
            data.course_page_details.widgets.length > 0
              ? data.course_page_details.widgets
              : prev.widgets,
        }));
      }
    } catch (err) {
      console.error('Failed to load Course Page CMS data:', err);
      toast.error('Failed to load Course Page CMS content');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSection = async (section: string, content: any, label: string) => {
    try {
      setSavingSection(section);
      await cmsApi.updateSection('course_page', section, content);
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
        Loading Course Page CMS content...
      </div>
    );
  }

  return (
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
          onClick={() =>
            handleSaveSection(
              'course_page_details',
              coursePageCms,
              'Course Page Details'
            )
          }
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
            placeholder="Enter course page subtitle..."
          />

          <RichTextEditor
            label="Main Title (Rich Text)"
            value={coursePageCms.head_title}
            onChange={(val) => setCoursePageCms({ ...coursePageCms, head_title: val })}
            height={150}
            placeholder="Enter course page main title..."
          />

          <RichTextEditor
            label="Curriculum Description"
            value={coursePageCms.head_description}
            onChange={(val) => setCoursePageCms({ ...coursePageCms, head_description: val })}
            height={165}
            placeholder="Enter curriculum description..."
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
              placeholder="Enter search input placeholder text..."
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
                    placeholder="Enter widget name..."
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
                    placeholder="Enter widget value..."
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
