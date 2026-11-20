/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import {
  Save,
  Loader2,
  Sparkles,
  Phone,
  Share2,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImageUploadDropzone } from '@/components/ui/image-upload-dropzone';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { cmsApi } from '@/services/cmsApi';
import { toast } from 'sonner';
import { uploadImage } from './cmsUtils';

export function ContactUsCmsTab() {
  // Header Banner Section (Order in page: 1)
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

  const [isLoading, setIsLoading] = useState(true);
  const [savingSection, setSavingSection] = useState<string | null>(null);

  useEffect(() => {
    fetchContactData();
  }, []);

  const fetchContactData = async () => {
    try {
      setIsLoading(true);
      const data = await cmsApi.getPage('contact_us');
      if (!data) return;

      const cb = data.contact_banner || data.banner;
      if (cb) {
        setContactBanner((prev) => ({
          ...prev,
          title: cb.title ?? '',
          description: cb.description ?? cb.detail ?? cb.subtitle ?? '',
          image: cb.image ?? cb.banner_image ?? '',
        }));
      }
      if (data.contact_details) {
        setContactCms((prev) => ({ ...prev, ...data.contact_details }));
      }
    } catch (err) {
      console.error('Failed to load Contact Us CMS data:', err);
      toast.error('Failed to load Contact Us CMS content');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSection = async (section: string, content: any, label: string) => {
    try {
      setSavingSection(section);
      await cmsApi.updateSection('contact_us', section, content);
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
        Loading Contact Us CMS content...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Contact Header Banner Card (Order in page: 1) */}
      <Card className="border shadow-xs">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Contact Us Header Banner (Order in page: 1)
            </CardTitle>
            <CardDescription className="text-xs">
              Header banner title, introductory description, and top background banner image
            </CardDescription>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              handleSaveSection('contact_banner', contactBanner, 'Contact Banner')
            }
            disabled={savingSection === 'contact_banner'}
            className="gap-1.5 h-8 text-xs font-medium"
          >
            {savingSection === 'contact_banner' ? (
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
              value={contactBanner.title}
              onChange={(e) => setContactBanner({ ...contactBanner, title: e.target.value })}
              placeholder="Enter contact banner title..."
              className="h-9 text-xs"
            />
          </div>

          <RichTextEditor
            label="Banner Description (HTML / Rich Text)"
            value={contactBanner.description}
            onChange={(val) => setContactBanner({ ...contactBanner, description: val })}
            height={150}
            placeholder="Enter contact banner description..."
          />

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Banner Image</Label>
            <ImageUploadDropzone
              value={contactBanner.image}
              onChange={(url) => setContactBanner({ ...contactBanner, image: url })}
              onUploadFile={uploadImage}
              aspectRatio="banner"
              label="Upload Contact Header Banner"
            />
          </div>
        </CardContent>
      </Card>

      {/* Official Contact Coordinates & Channels Card (Order in page: 2) */}
      <Card className="border shadow-xs">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              Official Contact Coordinates & Social Channels (Order in page: 2)
            </CardTitle>
            <CardDescription className="text-xs">
              Public telephone, admissions email, physical address, and social channels
            </CardDescription>
          </div>
          <Button
            size="sm"
            onClick={() =>
              handleSaveSection('contact_details', contactCms, 'Contact Settings')
            }
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
                placeholder="Enter contact section title..."
                className="h-9 text-xs"
              />
            </div>
            <RichTextEditor
              label="Section Subtitle (HTML / Rich Text)"
              value={contactCms.subtitle}
              onChange={(val) => setContactCms({ ...contactCms, subtitle: val })}
              height={150}
              placeholder="Enter contact section subtitle..."
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
                  placeholder="Enter hotline phone number..."
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Support / Admissions Email</Label>
                <Input
                  type="email"
                  value={contactCms.email}
                  onChange={(e) => setContactCms({ ...contactCms, email: e.target.value })}
                  placeholder="Enter support / admissions email..."
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
                  placeholder="Enter business / office hours..."
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Physical Institute Address</Label>
              <Input
                value={contactCms.address}
                onChange={(e) => setContactCms({ ...contactCms, address: e.target.value })}
                placeholder="Enter institute physical address..."
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
              onUploadFile={uploadImage}
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
                  placeholder="Enter LinkedIn profile URL..."
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
                  placeholder="Enter Facebook page URL..."
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
                  placeholder="Enter Twitter / X URL..."
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
                  placeholder="Enter YouTube channel URL..."
                  className="h-9 text-xs"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
