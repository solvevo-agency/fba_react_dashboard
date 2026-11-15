import { useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { Label } from '@/components/ui/label';
import { Code, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface RichTextEditorProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  height?: number;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  className?: string;
  id?: string;
}

export function RichTextEditor({
  label,
  value,
  onChange,
  height = 165,
  placeholder = 'Write content here...',
  helperText,
  required = false,
  className = '',
  id,
}: RichTextEditorProps) {
  const [sourceMode, setSourceMode] = useState(false);

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Clean, proportionate toolbar icons that align with admin design */}
      <style>{`
        .tox-tinymce {
          border: 1px solid hsl(var(--input)) !important;
          border-radius: calc(var(--radius) - 2px) !important;
          background: hsl(var(--background)) !important;
          transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out !important;
        }
        .tox-tinymce:focus-within {
          border-color: hsl(var(--ring)) !important;
          outline: 1px solid hsl(var(--ring)) !important;
        }
        .tox .tox-toolbar, 
        .tox .tox-toolbar__primary {
          background: hsl(var(--muted) / 0.35) !important;
          border-bottom: 1px solid hsl(var(--border)) !important;
          padding: 2px 2px !important;
        }
        .tox .tox-toolbar__group {
          padding: 0 2px !important;
        }
        .tox .tox-tbtn {
          height: 28px !important;
          padding: 0 5px !important;
          margin: 1px !important;
          border-radius: 4px !important;
          cursor: pointer !important;
        }
          /* Reduce padding for list buttons */
.tox .tox-split-button .tox-tbtn {
  padding-left: 2px !important;
  padding-right: 2px !important;
}

.tox .tox-split-button {
  gap: 0 !important;
}
        .tox .tox-tbtn:hover {
          background: hsl(var(--accent)) !important;
        }
        .tox .tox-tbtn--enabled,
        .tox .tox-tbtn--enabled:hover {
          background: hsl(var(--primary) / 0.15) !important;
          color: hsl(var(--primary)) !important;
        }
        /* Scale icons cleanly centered without clipping */
        .tox .tox-tbtn svg {
          transform: scale(0.72) !important;
          transform-origin: center center !important;
          display: block !important;
        }
        .tox .tox-separator {
          height: 14px !important;
          margin: 7px 3px !important;
          background-color: hsl(var(--border)) !important;
        }
          /* Remove extra spacing below the toolbar */
.tox .tox-editor-header {
  padding-bottom: 0 !important;
  margin-bottom: 0 !important;
}

.tox .tox-toolbar-overlord {
  padding-bottom: 0 !important;
  margin-bottom: 0 !important;
}

.tox .tox-edit-area {
  margin-top: 0 !important;
  padding-top: 0 !important;
}

/* Keep the editable area aligned with the toolbar */
.tox .tox-edit-area__iframe {
  display: block !important;
  margin-top: 0 !important;
}
      `}</style>

      <div className="flex items-center justify-between">
        {label && (
          <Label htmlFor={id} className="text-xs font-semibold text-foreground flex items-center gap-1">
            {label}
            {required && <span className="text-destructive">*</span>}
          </Label>
        )}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setSourceMode(!sourceMode)}
          className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground gap-1"
          title="Toggle HTML source code"
        >
          {sourceMode ? (
            <>
              <Eye className="h-3 w-3" /> Visual Editor
            </>
          ) : (
            <>
              <Code className="h-3 w-3" /> HTML View
            </>
          )}
        </Button>
      </div>

      {sourceMode ? (
        <Textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={Math.max(4, Math.round(height / 35))}
          className="font-mono text-xs resize-none"
          placeholder="Enter HTML markup directly..."
        />
      ) : (
        <div className="overflow-hidden bg-background">
          <Editor
            tinymceScriptSrc="https://cdn.jsdelivr.net/npm/tinymce@6.8.3/tinymce.min.js"
            value={value}
            onEditorChange={(content) => onChange(content)}
            init={{
              height: height,
              menubar: false,
              statusbar: false,
              placeholder: placeholder,
              plugins: [
                'advlist',
                'autolink',
                'lists',
                'link',
                'charmap',
                'searchreplace',
                'visualblocks',
                'fullscreen',
                'table',
                'wordcount',
              ],
              toolbar:
                'undo redo | bold italic underline | bullist numlist | link table | removeformat',
              content_style: `
                body {
                  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                  font-size: 13px;
                  line-height: 1.5;
                  color: #1f2937;
                  padding: 8px 12px;
                  margin: 0;
                }
                p { margin: 0 0 8px 0; }
                p:last-child { margin-bottom: 0; }
              `,
              branding: false,
              promotion: false,
            }}
          />
        </div>
      )}

      {helperText && <p className="text-[11px] text-muted-foreground">{helperText}</p>}
    </div>
  );
}
