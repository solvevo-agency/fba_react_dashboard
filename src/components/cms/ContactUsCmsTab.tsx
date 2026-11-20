/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Mail, MapPin, Save, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { ImageUploadDropzone } from '@/components/ui/image-upload-dropzone';
import { uploadImage } from './cmsUtils';

export interface ContactUsCmsTabProps {
  contactBanner: any;
  setContactBanner: React.Dispatch<React.SetStateAction<any>>;
  contactCms: any;
  setContactCms: React.Dispatch<React.SetStateAction<any>>;
  savingSection: string | null;
  onSaveSection: (page: string, section: string, content: any, label: string) => Promise<void>;
}

export function ContactUsCmsTab({
  contactBanner,
  setContactBanner,
  contactCms,
  setContactCms,
  savingSection,
  onSaveSection,
}: ContactUsCmsTabProps) {
  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <Card className="border shadow-xs">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Contact Us Header Banner
            </CardTitle>
            <CardDescription className="text-xs">
              Page headline, introductory narrative, and main header graphic
            </CardDescription>
          </div>
          <Button
            size="sm"
            onClick={() => onSaveSection('contact_us', 'contact_banner', contactBanner, 'Contact Banner')}
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
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              Page Headline Title <span className="text-destructive">*</span>
            </Label>
            <Input
              value={contactBanner.title}
              onChange={(e) =>
                setContactBanner({ ...contactBanner, title: e.target.value })
              }
              placeholder="e.g. We're Here to Support Your ABA Training Journey"
              className="h-9 text-xs"
            />
          </div>

          <RichTextEditor
            label="Banner Description (HTML / Rich Text)"
            value={contactBanner.description}
            onChange={(val) =>
              setContactBanner({ ...contactBanner, description: val })
            }
            height={165}
            placeholder="Enter contact page introductory overview..."
          />

          <div className="space-y-2">
            <ImageUploadDropzone
              value={contactBanner.image}
              onChange={(url) => setContactBanner({ ...contactBanner, image: url })}
              onUploadFile={uploadImage}
              aspectRatio="banner"
              label="Upload Contact Header Image"
            />
          </div>
        </CardContent>
      </Card>

      {/* 2. Office Information & Channels */}
      <Card className="border shadow-xs">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Direct Office Information & Channels
            </CardTitle>
            <CardDescription className="text-xs">
              Direct institutional phone, email, clinic address, business hours, and social media links
            </CardDescription>
          </div>
          <Button
            size="sm"
            onClick={() => onSaveSection('contact_us', 'contact_details', contactCms, 'Contact Details')}
            disabled={savingSection === 'contact_details'}
            className="gap-1.5 h-8 text-xs font-medium"
          >
            {savingSection === 'contact_details' ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            Save Details
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Card Title</Label>
              <Input
                value={contactCms.title}
                onChange={(e) => setContactCms({ ...contactCms, title: e.target.value })}
                placeholder="e.g. Connect With Our Clinical Admissions Team"
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Card Subtitle</Label>
              <Input
                value={contactCms.subtitle}
                onChange={(e) =>
                  setContactCms({ ...contactCms, subtitle: e.target.value })
                }
                placeholder="e.g. Available Monday through Friday, 8am - 6pm EST"
                className="h-9 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Support Phone Number</Label>
              <Input
                value={contactCms.phone}
                onChange={(e) => setContactCms({ ...contactCms, phone: e.target.value })}
                placeholder="e.g. (800) 555-0199"
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Support Email Address</Label>
              <Input
                value={contactCms.email}
                onChange={(e) => setContactCms({ ...contactCms, email: e.target.value })}
                placeholder="e.g. support@futuresbehavioranalysis.com"
                className="h-9 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Clinic / Mailing Address</Label>
              <Input
                value={contactCms.address}
                onChange={(e) =>
                  setContactCms({ ...contactCms, address: e.target.value })
                }
                placeholder="e.g. 100 Main Street, Suite 400, Miami, FL 33101"
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Business / Operating Hours</Label>
              <Input
                value={contactCms.business_hours}
                onChange={(e) =>
                  setContactCms({ ...contactCms, business_hours: e.target.value })
                }
                placeholder="e.g. Mon - Fri: 8:00 AM - 6:00 PM EST"
                className="h-9 text-xs"
              />
            </div>
          </div>

          <div className="space-y-2">
            <ImageUploadDropzone
              value={contactCms.image}
              onChange={(url) => setContactCms({ ...contactCms, image: url })}
              onUploadFile={uploadImage}
              aspectRatio="wide"
              label="Contact Detail Illustration Image"
            />
          </div>

          <div className="border-t pt-4 space-y-3">
            <Label className="text-xs font-semibold block">Social Media Links</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">LinkedIn URL</Label>
                <Input
                  value={contactCms.social_linkedin || ''}
                  onChange={(e) =>
                    setContactCms({ ...contactCms, social_linkedin: e.target.value })
                  }
                  placeholder="https://linkedin.com/company/..."
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Facebook URL</Label>
                <Input
                  value={contactCms.social_facebook || ''}
                  onChange={(e) =>
                    setContactCms({ ...contactCms, social_facebook: e.target.value })
                  }
                  placeholder="https://facebook.com/..."
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Twitter / X URL</Label>
                <Input
                  value={contactCms.social_twitter || ''}
                  onChange={(e) =>
                    setContactCms({ ...contactCms, social_twitter: e.target.value })
                  }
                  placeholder="https://twitter.com/..."
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">YouTube URL</Label>
                <Input
                  value={contactCms.social_youtube || ''}
                  onChange={(e) =>
                    setContactCms({ ...contactCms, social_youtube: e.target.value })
                  }
                  placeholder="https://youtube.com/@..."
                  className="h-8 text-xs"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
