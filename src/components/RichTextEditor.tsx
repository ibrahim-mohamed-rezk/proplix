import React from "react";
import { Editor } from "@tinymce/tinymce-react";

type RichTextEditorProps = {
  value: string;
  onChange?: (content: string) => void;
  label?: string;
  readOnly?: boolean;
  height?: number;
  placeholder?: string;
};

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  label,
  readOnly = false,
  height = 400,
  placeholder = "Start typing..."
}) => {
  return (
    <div className="my-3">
      {label && (
        <label className="form-label fw-medium text-secondary small">
          {label}
        </label>
      )}
      <div className="border rounded shadow-sm overflow-hidden">
        <Editor
          apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY || "your-api-key-here"}
          value={value}
          onEditorChange={onChange}
          init={{
            height: height,
            menubar: true,
            disabled: readOnly,
            placeholder: placeholder,
            
            // Extensive plugin list for advanced features
            plugins: [
              "advlist", "autolink", "lists", "link", "image", "charmap", "preview",
              "anchor", "searchreplace", "visualblocks", "code", "fullscreen",
              "insertdatetime", "media", "table", "help", "wordcount",
              "emoticons", "template", "paste", "print", "hr", "pagebreak",
              "nonbreaking", "directionality", "visualchars", "noneditable",
              "quickbars", "save", "codesample", "importcss", "toc", "textcolor",
              "colorpicker", "contextmenu", "lineheight"
            ],
            
            // Comprehensive toolbar matching your image exactly
            toolbar: readOnly
              ? false
              : "undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | alignleft aligncenter alignright alignjustify | numlist bullist indent outdent | emoticons charmap | removeformat fullscreen | forecolor backcolor | ltr rtl | help",
            
            // Enhanced toolbar options
            toolbar_mode: "floating",
            toolbar_sticky: true,
            toolbar_sticky_offset: 0,
            
            // Icons configuration
            icons: "default",
            
            // Skin and theme
            skin: "oxide",
            theme: "silver",
            
            // Quick insert toolbar
            quickbars_selection_toolbar: "bold italic | quicklink h2 h3 blockquote",
            quickbars_insert_toolbar: "quickimage quicktable quicklink",
            
            // Context menu
            contextmenu: "link image table | cell row column deletetable | copy paste",
            
            // Menu bar configuration
            menu: {
              file: { title: "File", items: "newdocument restoredraft | preview | export print | deleteallconversations" },
              edit: { title: "Edit", items: "undo redo | cut copy paste pastetext | selectall | searchreplace" },
              view: { title: "View", items: "code | visualaid visualchars visualblocks | preview fullscreen | showcomments" },
              insert: { title: "Insert", items: "image link media addcomment pageembed template codesample inserttable | charmap emoticons hr | pagebreak nonbreaking anchor tableofcontents | insertdatetime" },
              format: { title: "Format", items: "bold italic underline strikethrough superscript subscript codeformat | styles blocks fontfamily fontsize align lineheight | forecolor backcolor | language | removeformat" },
              tools: { title: "Tools", items: "spellchecker spellcheckerlanguage | a11ycheck code wordcount" },
              table: { title: "Table", items: "inserttable | cell row column | advtablesort | tableprops deletetable" },
              help: { title: "Help", items: "help" }
            },
            
            // Style formats dropdown (Paragraph dropdown)
            block_formats: 'Paragraph=p; Heading 1=h1; Heading 2=h2; Heading 3=h3; Heading 4=h4; Heading 5=h5; Heading 6=h6; Preformatted=pre; Div=div',
            
            // Style formats dropdown
            style_formats: [
              { title: "Headings", items: [
                { title: "Heading 1", format: "h1" },
                { title: "Heading 2", format: "h2" },
                { title: "Heading 3", format: "h3" },
                { title: "Heading 4", format: "h4" },
                { title: "Heading 5", format: "h5" },
                { title: "Heading 6", format: "h6" }
              ]},
              { title: "Inline", items: [
                { title: "Bold", format: "bold" },
                { title: "Italic", format: "italic" },
                { title: "Underline", format: "underline" },
                { title: "Strikethrough", format: "strikethrough" },
                { title: "Superscript", format: "superscript" },
                { title: "Subscript", format: "subscript" },
                { title: "Code", format: "code" }
              ]},
              { title: "Blocks", items: [
                { title: "Paragraph", format: "p" },
                { title: "Blockquote", format: "blockquote" },
                { title: "Div", format: "div" },
                { title: "Pre", format: "pre" }
              ]},
              { title: "Align", items: [
                { title: "Left", format: "alignleft" },
                { title: "Center", format: "aligncenter" },
                { title: "Right", format: "alignright" },
                { title: "Justify", format: "alignjustify" }
              ]}
            ],
            
            // Font options - System Font as default
            font_family_formats: 
              "System Font=-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol'; " +
              "Arial=arial,helvetica,sans-serif; " +
              "Arial Black=arial black,sans-serif; " +
              "Book Antiqua=book antiqua,palatino,serif; " +
              "Comic Sans MS=comic sans ms,sans-serif; " +
              "Courier New=courier new,courier,monospace; " +
              "Georgia=georgia,palatino,serif; " +
              "Helvetica=helvetica,arial,sans-serif; " +
              "Impact=impact,sans-serif; " +
              "Symbol=symbol; " +
              "Tahoma=tahoma,arial,helvetica,sans-serif; " +
              "Terminal=terminal,monaco,monospace; " +
              "Times New Roman=times new roman,times,serif; " +
              "Trebuchet MS=trebuchet ms,geneva,sans-serif; " +
              "Verdana=verdana,geneva,sans-serif; " +
              "Webdings=webdings; " +
              "Wingdings=wingdings,zapf dingbats",
            
            // Font size options - matching the dropdown (8pt to 72pt)
            font_size_formats: "8pt 9pt 10pt 11pt 12pt 14pt 16pt 18pt 20pt 22pt 24pt 26pt 28pt 36pt 48pt 72pt",
            
            // Image and media configuration
            image_advtab: true,
            image_caption: true,
            image_dimensions: true,
            image_class_list: [
              { title: "None", value: "" },
              { title: "Responsive", value: "img-fluid" },
              { title: "Rounded", value: "rounded" },
              { title: "Circle", value: "rounded-circle" },
              { title: "Thumbnail", value: "img-thumbnail" },
              { title: "Shadow", value: "shadow" }
            ],
            
            // Table configuration with Bootstrap classes
            table_class_list: [
              { title: "None", value: "" },
              { title: "Bootstrap Table", value: "table" },
              { title: "Striped", value: "table table-striped" },
              { title: "Bordered", value: "table table-bordered" },
              { title: "Hover", value: "table table-hover" },
              { title: "Dark", value: "table table-dark" },
              { title: "Small", value: "table table-sm" },
              { title: "Responsive", value: "table-responsive" }
            ],
            table_default_attributes: {
              class: "table table-bordered"
            },
            table_default_styles: {
              width: "100%"
            },
            
            // Advanced paste options
            paste_data_images: true,
            paste_as_text: false,
            paste_word_valid_elements: "b,strong,i,em,h1,h2,h3,h4,h5,h6,p,div,ul,ol,li,a,table,tr,td,th,thead,tbody,tfoot",
            
            // Content styling with Bootstrap classes
            content_style: `
              @import url('https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css');
              body { 
                font-family: var(--bs-font-sans-serif);
                font-size: 1rem;
                line-height: 1.5;
                color: var(--bs-body-color);
                padding: 1rem;
              }
              p { margin-bottom: 1rem; }
              h1, .h1 { font-size: 2.5rem; font-weight: 500; margin-bottom: 0.5rem; }
              h2, .h2 { font-size: 2rem; font-weight: 500; margin-bottom: 0.5rem; }
              h3, .h3 { font-size: 1.75rem; font-weight: 500; margin-bottom: 0.5rem; }
              h4, .h4 { font-size: 1.5rem; font-weight: 500; margin-bottom: 0.5rem; }
              h5, .h5 { font-size: 1.25rem; font-weight: 500; margin-bottom: 0.5rem; }
              h6, .h6 { font-size: 1rem; font-weight: 500; margin-bottom: 0.5rem; }
              blockquote { 
                border-left: 0.25rem solid var(--bs-gray-300); 
                padding-left: 1rem; 
                margin: 1rem 0;
                font-style: italic;
                color: var(--bs-secondary);
              }
              pre {
                background-color: var(--bs-gray-100);
                border: 1px solid var(--bs-gray-300);
                border-radius: var(--bs-border-radius);
                padding: 0.75rem;
                overflow-x: auto;
              }
              code {
                background-color: var(--bs-gray-100);
                padding: 0.125rem 0.25rem;
                border-radius: 0.25rem;
                font-family: var(--bs-font-monospace);
                color: var(--bs-code-color);
              }
              table {
                margin-bottom: 1rem;
              }
              a {
                color: var(--bs-link-color);
                text-decoration: none;
              }
              a:hover {
                color: var(--bs-link-hover-color);
                text-decoration: underline;
              }
              .mce-content-body[dir="rtl"] {
                direction: rtl;
                text-align: right;
              }
              /* Bootstrap utility classes available in content */
              .text-primary { color: var(--bs-primary) !important; }
              .text-secondary { color: var(--bs-secondary) !important; }
              .text-success { color: var(--bs-success) !important; }
              .text-danger { color: var(--bs-danger) !important; }
              .text-warning { color: var(--bs-warning) !important; }
              .text-info { color: var(--bs-info) !important; }
              .text-light { color: var(--bs-light) !important; }
              .text-dark { color: var(--bs-dark) !important; }
              .bg-primary { background-color: var(--bs-primary) !important; }
              .bg-secondary { background-color: var(--bs-secondary) !important; }
              .bg-success { background-color: var(--bs-success) !important; }
              .bg-danger { background-color: var(--bs-danger) !important; }
              .bg-warning { background-color: var(--bs-warning) !important; }
              .bg-info { background-color: var(--bs-info) !important; }
              .bg-light { background-color: var(--bs-light) !important; }
              .bg-dark { background-color: var(--bs-dark) !important; }
            `,
            
            // Directionality support for RTL languages
            directionality: "ltr",
            
            // Browser spell checker
            browser_spellcheck: true,
            
            // Status bar
            statusbar: true,
            elementpath: true,
            
            // Resizing
            resize: true,
            
            // Autosave
            autosave_interval: "30s",
            autosave_retention: "30m",
            
            // Word count
            wordcount: {
              countWords: true,
              countCharacters: true
            },
            
            // File handling
            automatic_uploads: true,
            file_picker_types: "image media file",
            file_picker_callback: readOnly
              ? undefined
              : function (cb: (url: string, meta: { title: string }) => void, value: any, meta: any) {
                  // File picker implementation
                  if (meta.filetype === "file") {
                    // Handle file uploads
                    const input = document.createElement("input");
                    input.setAttribute("type", "file");
                    input.setAttribute("accept", ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx");
                    
                    input.onchange = function () {
                      const file = input.files?.[0];
                      if (!file) return;
                      
                      const reader = new FileReader();
                      reader.onload = function () {
                        const base64 = reader.result as string;
                        cb(base64, { title: file.name });
                      };
                      reader.readAsDataURL(file);
                    };
                    input.click();
                  }
                  
                  if (meta.filetype === "image") {
                    // Handle image uploads
                    const input = document.createElement("input");
                    input.setAttribute("type", "file");
                    input.setAttribute("accept", "image/*");
                    
                    input.onchange = function () {
                      const file = input.files?.[0];
                      if (!file) return;
                      
                      const reader = new FileReader();
                      reader.onload = function () {
                        const base64 = reader.result as string;
                        cb(base64, { title: file.name });
                      };
                      reader.readAsDataURL(file);
                    };
                    input.click();
                  }
                  
                  if (meta.filetype === "media") {
                    // Handle media uploads
                    const input = document.createElement("input");
                    input.setAttribute("type", "file");
                    input.setAttribute("accept", "video/*,audio/*");
                    
                    input.onchange = function () {
                      const file = input.files?.[0];
                      if (!file) return;
                      
                      const reader = new FileReader();
                      reader.onload = function () {
                        const base64 = reader.result as string;
                        cb(base64, { title: file.name });
                      };
                      reader.readAsDataURL(file);
                    };
                    input.click();
                  }
                },
                
            // Templates with Bootstrap styling
            templates: [
              {
                title: "Business Letter",
                description: "A basic business letter template",
                content: '<p class="mb-3">Dear [Name],</p><p class="mb-3"><br></p><p class="mb-3">I am writing to...</p><p class="mb-3"><br></p><p>Sincerely,<br>[Your Name]</p>'
              },
              {
                title: "Meeting Notes",
                description: "Template for meeting notes",
                content: '<h2 class="h4 mb-3">Meeting Notes</h2><p><strong>Date:</strong> [Date]</p><p><strong>Attendees:</strong> [Names]</p><h3 class="h5 mt-3 mb-2">Agenda Items</h3><ul class="list-group list-group-flush"><li>Item 1</li><li>Item 2</li></ul><h3 class="h5 mt-3 mb-2">Action Items</h3><ul class="list-group list-group-flush"><li>[ ] Action 1</li><li>[ ] Action 2</li></ul>'
              },
              {
                title: "Bootstrap Alert",
                description: "Bootstrap alert component",
                content: '<div class="alert alert-primary" role="alert">This is a primary alert—check it out!</div>'
              },
              {
                title: "Bootstrap Card",
                description: "Bootstrap card component",
                content: '<div class="card"><div class="card-header">Featured</div><div class="card-body"><h5 class="card-title">Card title</h5><p class="card-text">Some quick example text to build on the card title.</p></div></div>'
              }
            ],
            
            // Link settings
            link_default_target: "_blank",
            link_context_toolbar: true,
            
            // Valid elements (security)
            valid_elements: "*[*]",
            extended_valid_elements: "*[*]",
            
            // Setup function
            setup: function(editor: any) {
              // Add Bootstrap-specific buttons
              editor.ui.registry.addButton("bootstrapAlert", {
                text: "BS Alert",
                tooltip: "Insert Bootstrap Alert",
                onAction: function() {
                  editor.insertContent('<div class="alert alert-primary" role="alert">Alert text here</div>');
                }
              });
              
              editor.ui.registry.addButton("bootstrapBadge", {
                text: "BS Badge",
                tooltip: "Insert Bootstrap Badge",
                onAction: function() {
                  editor.insertContent('<span class="badge bg-primary">Badge</span>');
                }
              });
              
              // Add keyboard shortcuts
              editor.addShortcut("ctrl+shift+a", "Insert Bootstrap alert", function() {
                editor.insertContent('<div class="alert alert-info" role="alert">Alert content</div>');
              });
            }
          }}
        />
      </div>
      
      {/* Optional character/word count display with Bootstrap styling */}
      <div className="mt-2 text-end">
        <small className="text-muted">Press Alt+0 for help</small>
      </div>
      
      {/* Optional Bootstrap-styled toolbar info */}
      {!readOnly && (
        <div className="alert alert-info alert-dismissible fade show mt-3" role="alert">
          <small>
            <strong>Tip:</strong> Use the toolbar to format text, insert images, tables, and more. RTL support is available for Arabic text.
          </small>
          <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;