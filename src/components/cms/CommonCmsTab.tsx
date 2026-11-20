/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { ImageUploadDropzone } from '@/components/ui/image-upload-dropzone';
import { uploadImage, FaqItem } from './cmsUtils';
import {
  HelpCircle,
  FileText,
  Save,
  Plus,
  Edit2,
  Trash2,
  Check,
  Loader2,
} from 'lucide-react';

export interface CommonCmsTabProps {
  faqSection: {
    title: string;
    description: string;
    image: string;
    items: FaqItem[];
  };
  setFaqSection: React.Dispatch<React.SetStateAction<{
    title: string;
    description: string;
    image: string;
    items: FaqItem[];
  }>>;
  legalCms: {
    terms: string;
    privacy: string;
    bacb_disclaimer: string;
  };
  setLegalCms: React.Dispatch<React.SetStateAction<{
    terms: string;
    privacy: string;
    bacb_disclaimer: string;
  }>>;
  savingSection: string | null;
  onSaveSection: (page: string, section: string, content: any, label: string) => Promise<void>;
}

export function CommonCmsTab({
  faqSection,
  setFaqSection,
  legalCms,
  setLegalCms,
  savingSection,
  onSaveSection,
}: CommonCmsTabProps) {
  const [editingFaqId, setEditingFaqId] = useState<number | null>(null);

  const handleToggleEditFaq = (id: number) => {
    if (editingFaqId === id) {
      setEditingFaqId(null);
      onSaveSection('common', 'faqs', faqSection, 'FAQs');
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
  };

  const handleDeleteFaq = (id: number) => {
    const updatedItems = faqSection.items.filter((f) => f.id !== id);
    const updatedSection = { ...faqSection, items: updatedItems };
    setFaqSection(updatedSection);
    onSaveSection('common', 'faqs', updatedSection, 'FAQs');
  };

  return (
    <div className="space-y-6">
      {/* FAQs Manager */}
      <Card className="border shadow-xs">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              Frequently Asked Questions (FAQs) ({faqSection.items.length})
            </CardTitle>
            <CardDescription className="text-xs">
              Header title, description, illustrative graphic, and prospective student questions
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onSaveSection('common', 'faqs', faqSection, 'FAQs')}
              disabled={savingSection === 'faqs'}
              className="h-8 text-xs gap-1.5"
            >
              {savingSection === 'faqs' ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              Save FAQs
            </Button>
            <Button
              size="sm"
              onClick={handleAddFaq}
              className="gap-1.5 h-8 text-xs font-medium"
            >
              <Plus className="h-3.5 w-3.5" /> Add FAQ
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Header Title & Description */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                FAQ Section Title <span className="text-destructive">*</span>
              </Label>
              <Input
                value={faqSection.title}
                onChange={(e) => setFaqSection({ ...faqSection, title: e.target.value })}
                placeholder="Enter FAQ section title (e.g. Have questions about our RBT training?)..."
                className="h-9 text-xs"
              />
            </div>

            <RichTextEditor
              label="FAQ Section Description (HTML / Rich Text)"
              value={faqSection.description}
              onChange={(val) => setFaqSection({ ...faqSection, description: val })}
              height={150}
              placeholder="Enter FAQ section description..."
            />

            <div className="space-y-1.5">
              <ImageUploadDropzone
                value={faqSection.image}
                onChange={(url) => setFaqSection({ ...faqSection, image: url })}
                onUploadFile={uploadImage}
                aspectRatio="wide"
                label="Upload FAQ Section Graphic"
              />
            </div>
          </div>

          {/* Questions & Answers List */}
          <div className="border-t pt-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  Questions & Answers ({faqSection.items.length})
                </Label>
                <span className="text-[11px] text-muted-foreground">
                  Click the pencil icon on any item to edit question & answer inline
                </span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleAddFaq}
                className="gap-1.5 h-7 text-xs font-medium"
              >
                <Plus className="h-3.5 w-3.5" /> Add Question
              </Button>
            </div>

            {faqSection.items.length === 0 ? (
              <div className="text-center py-8 text-xs text-muted-foreground border border-dashed rounded-lg">
                No questions added yet. Click &quot;Add FAQ&quot; above to create one.
              </div>
            ) : (
              <div className="space-y-3">
                {faqSection.items.map((faq, index) => {
                  const isEditing = editingFaqId === faq.id;
                  return (
                    <div
                      key={faq.id}
                      className="p-3.5 border rounded-xl bg-card hover:bg-muted/20 transition-colors space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        {isEditing ? (
                          <div className="flex-1 space-y-1">
                            <Label className="text-[11px] text-muted-foreground font-semibold">
                              Question #{index + 1}
                            </Label>
                            <Input
                              value={faq.question}
                              onChange={(e) =>
                                handleUpdateFaq(faq.id, 'question', e.target.value)
                              }
                              placeholder="Enter question..."
                              className="h-8 text-xs font-semibold"
                              autoFocus
                            />
                          </div>
                        ) : (
                          <p className="text-xs font-bold text-foreground pt-1">
                            {index + 1}. {faq.question || '(No question specified)'}
                          </p>
                        )}

                        <div className="flex items-center gap-1 shrink-0 pt-0.5">
                          <Button
                            variant={isEditing ? 'default' : 'ghost'}
                            size="icon"
                            onClick={() => handleToggleEditFaq(faq.id)}
                            className={`h-7 w-7 ${
                              isEditing
                                ? 'bg-primary text-primary-foreground'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                            title={
                              isEditing ? 'Save Question & Answer' : 'Edit Question & Answer'
                            }
                          >
                            {isEditing ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              <Edit2 className="h-3 w-3" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteFaq(faq.id)}
                            className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            title="Delete FAQ"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      {isEditing ? (
                        <div className="space-y-1">
                          <Label className="text-[11px] text-muted-foreground font-semibold">
                            Answer (Plain text)
                          </Label>
                          <Textarea
                            value={faq.answer}
                            onChange={(e) => handleUpdateFaq(faq.id, 'answer', e.target.value)}
                            placeholder="Enter plain text answer..."
                            rows={3}
                            className="text-xs resize-none"
                          />
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground leading-relaxed pl-3 border-l-2 border-primary/40 whitespace-pre-wrap">
                          {faq.answer || '(No answer provided)'}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Legal Policies & Compliance */}
      <Card className="border shadow-xs">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Legal, Privacy & BACB Compliance Disclaimers
            </CardTitle>
            <CardDescription className="text-xs">
              Legal terms, data protection statements, and independent curriculum accreditation
              notices
            </CardDescription>
          </div>
          <Button
            size="sm"
            onClick={() => onSaveSection('common', 'legal', legalCms, 'Legal Policies')}
            disabled={savingSection === 'legal'}
            className="gap-1.5 h-8 text-xs font-medium"
          >
            {savingSection === 'legal' ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            Save Policies
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <RichTextEditor
            label="Terms & Conditions"
            value={legalCms.terms}
            onChange={(val) => setLegalCms({ ...legalCms, terms: val })}
            height={165}
            placeholder="Enter terms & conditions..."
          />

          <RichTextEditor
            label="Privacy Policy & Trainee Data Protection"
            value={legalCms.privacy}
            onChange={(val) => setLegalCms({ ...legalCms, privacy: val })}
            height={165}
            placeholder="Enter privacy policy..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
