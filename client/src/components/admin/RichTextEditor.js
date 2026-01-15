import React, { useMemo, useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import './RichTextEditor.scss';

/**
 * Wrapper component for ReactQuill that properly forwards refs
 * This helps minimize the findDOMNode deprecation warning
 */
const QuillWrapper = forwardRef((props, ref) => {
  const quillRef = useRef(null);
  
  // Expose the quill instance methods through the ref
  useImperativeHandle(ref, () => ({
    getEditor: () => quillRef.current?.getEditor(),
    root: quillRef.current?.root,
    ...quillRef.current
  }), []);

  const { QuillComponent, ...restProps } = props;
  
  if (!QuillComponent) return null;
  
  return <QuillComponent ref={quillRef} {...restProps} />;
});

QuillWrapper.displayName = 'QuillWrapper';

/**
 * RichTextEditor component using react-quill
 * 
 * Note: react-quill v2.0.0 still uses findDOMNode internally, which causes
 * a deprecation warning in React 18. This is a known issue with the library
 * and will be fixed in a future version. The warning doesn't affect functionality.
 */
const RichTextEditor = ({ value, onChange, placeholder, rows = 10, required = false }) => {
  const [isClient, setIsClient] = useState(false);
  const [QuillComponent, setQuillComponent] = useState(null);
  const [showHtmlModal, setShowHtmlModal] = useState(false);
  const [htmlContent, setHtmlContent] = useState('');
  const quillRef = useRef(null);
  const lastValueRef = useRef(value);

  // Stabilize onChange handler to prevent infinite loops
  const handleChange = useCallback((newValue) => {
    // React Quill returns HTML string, but we need to ensure we get the actual HTML
    // Get HTML from the editor root to ensure we have the actual HTML content
    let htmlValue = newValue || '';
    
    // Only try to get HTML from root if it's available
    // Sometimes React Quill calls onChange before root is ready
    try {
      if (quillRef.current && quillRef.current.root) {
        htmlValue = quillRef.current.root.innerHTML || htmlValue;
      }
    } catch (e) {
      // If root is not available yet, use the value from React Quill
      console.warn('Quill root not available yet, using provided value');
    }
    
    // Only call onChange if value actually changed and is not undefined
    if (htmlValue !== undefined && htmlValue !== null && htmlValue !== lastValueRef.current) {
      lastValueRef.current = htmlValue;
      onChange(htmlValue);
    }
  }, [onChange]);

  const openHtmlModal = useCallback(() => {
    // Try to get HTML from the editor first
    if (quillRef.current && quillRef.current.root) {
      // Get the raw HTML source code from the editor
      // This is the actual HTML that will be saved
      const html = quillRef.current.root.innerHTML;
      
      // Set the HTML content for editing in the modal
      // This shows the source code, not the rendered version
      setHtmlContent(html);
      setShowHtmlModal(true);
    } else {
      // Fallback: use the value prop if editor is not ready
      // This ensures the modal always opens, even if editor is still initializing
      const htmlToShow = value || '';
      setHtmlContent(htmlToShow);
      setShowHtmlModal(true);
    }
  }, [value]);

  const applyHtmlChanges = useCallback(() => {
    // IMPORTANT: This function ONLY applies HTML to the editor visually
    // It does NOT send any requests to the server
    // It does NOT save the post/service
    // It ONLY updates the local form state (formData) via onChange callback
    // The actual saving happens ONLY when user clicks "Update Post/Service" button
    
    // Get current HTML content from state
    const currentHtml = htmlContent || '';
    let cleanHtml = currentHtml.trim();
    
    // Only decode if HTML appears to be double-encoded
    // (contains &lt; instead of <)
    if (cleanHtml.includes('&lt;') && !cleanHtml.includes('<')) {
      try {
        const tempDiv = document.createElement('div');
        tempDiv.textContent = cleanHtml;
        const decoded = tempDiv.innerHTML;
        if (decoded !== cleanHtml && decoded.includes('<')) {
          cleanHtml = decoded;
        }
      } catch (e) {
        // If decoding fails, use original
        console.warn('Failed to decode HTML:', e);
      }
    }
    
    // Close the modal first
    setShowHtmlModal(false);
    
    // Update the form state directly via onChange callback
    // This will trigger React Quill to update the editor with the new value
    // This is the simplest and most reliable way to update the editor
    onChange(cleanHtml);
    
    // Also try to update Quill directly if it's available
    // This ensures the editor displays the content immediately
    setTimeout(() => {
      try {
        if (quillRef.current && quillRef.current.root) {
          const quill = quillRef.current.getEditor();
          if (quill) {
            // Create a temporary container to parse the HTML
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = cleanHtml;
            
            // Convert HTML to Quill's Delta format
            const delta = quill.clipboard.convert(tempDiv);
            
            // Set the content using Delta (silent mode to prevent triggering onChange again)
            quill.setContents(delta, 'silent');
            
            // Force Quill to update its display
            quill.update();
          }
        }
      } catch (error) {
        console.warn('Could not update Quill directly, but onChange was called:', error);
        // onChange was already called, so the editor should update via React Quill's value prop
      }
    }, 50);
  }, [htmlContent, onChange]);

  // Suppress findDOMNode deprecation warning from react-quill
  // This is a known issue with react-quill v2.0.0 and will be fixed in a future version
  // React's warnings may appear in console.warn or console.error, so we intercept both
  useEffect(() => {
    if (typeof window !== 'undefined' && isClient && QuillComponent) {
      const originalWarn = console.warn;
      const originalError = console.error;
      const suppressedMessages = [
        'findDOMNode is deprecated',
        'Warning: findDOMNode',
        'findDOMNode'
      ];

      const shouldSuppress = (...args) => {
        return args.some(arg => {
          if (typeof arg === 'string') {
            return suppressedMessages.some(msg => arg.includes(msg));
          }
          return false;
        });
      };

      console.warn = (...args) => {
        if (!shouldSuppress(...args)) {
          originalWarn.apply(console, args);
        }
      };

      console.error = (...args) => {
        // Only suppress if it's specifically the findDOMNode warning (contains "Warning:")
        // Don't suppress actual errors
        const isWarning = args[0] && typeof args[0] === 'string' && args[0].includes('Warning:');
        if (!shouldSuppress(...args) || !isWarning) {
          originalError.apply(console, args);
        }
      };

      return () => {
        console.warn = originalWarn;
        console.error = originalError;
      };
    }
  }, [isClient, QuillComponent]);

  useEffect(() => {
    // Only load react-quill on client side
    if (typeof window !== 'undefined') {
      // Dynamically import react-quill and its CSS
      Promise.all([
        import('react-quill'),
        import('react-quill/dist/quill.snow.css')
      ]).then(([quillModule]) => {
        setQuillComponent(() => quillModule.default);
        setIsClient(true);
      }).catch((error) => {
        console.error('Failed to load react-quill:', error);
      });
    }
  }, []);

  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      ['link', 'image'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['clean']
    ],
  }), []);

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent',
    'link', 'image',
    'color', 'background',
    'align'
  ];

  // Update editor content when value prop changes externally
  useEffect(() => {
    if (isClient && QuillComponent && quillRef.current && value !== undefined && value !== lastValueRef.current) {
      try {
        // Check if root is available
        if (!quillRef.current.root) {
          // Root not ready yet, just update the ref and return
          lastValueRef.current = value;
          return;
        }
        
        const quill = quillRef.current.getEditor();
        if (!quill || !quillRef.current.root) {
          lastValueRef.current = value;
          return;
        }
        
        const currentHtml = quillRef.current.root.innerHTML;
        // Only update if the value is actually different
        // Compare normalized HTML (remove empty paragraphs, etc.)
        const normalizedCurrent = currentHtml.replace(/<p><br><\/p>/g, '').trim();
        
        // Ensure value is not double-encoded HTML
        let htmlValue = value || '';
        // Check if HTML appears to be encoded (contains &lt; instead of <)
        if (htmlValue.includes('&lt;') && !htmlValue.includes('<')) {
          // Decode HTML entities
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = htmlValue;
          htmlValue = tempDiv.textContent || htmlValue;
          // If that didn't work, try direct decoding
          if (htmlValue === value) {
            tempDiv.textContent = htmlValue;
            htmlValue = tempDiv.innerHTML;
          }
        }
        
        const normalizedNew = htmlValue.replace(/<p><br><\/p>/g, '').trim();
        
        if (normalizedCurrent !== normalizedNew) {
          // Set content using Quill's API to ensure proper formatting
          quill.clipboard.dangerouslyPasteHTML(htmlValue);
          lastValueRef.current = value;
        }
      } catch (e) {
        // If there's an error, just update the ref to prevent infinite loops
        console.warn('Error updating Quill editor content:', e);
        lastValueRef.current = value;
      }
    } else if (value !== lastValueRef.current) {
      lastValueRef.current = value;
    }
  }, [value, isClient, QuillComponent]);

  // Register custom HTML button after component mounts
  // This must be called before any conditional returns to maintain hook order
  useEffect(() => {
    if (isClient && QuillComponent && quillRef.current) {
      // Use multiple attempts to ensure Quill is fully initialized
      let attempts = 0;
      const maxAttempts = 5;
      
      const setupHtmlButton = () => {
        if (quillRef.current) {
          try {
            const quill = quillRef.current.getEditor();
            if (!quill) {
              attempts++;
              if (attempts < maxAttempts) {
                setTimeout(setupHtmlButton, 100);
              }
              return;
            }
            
            const toolbar = quill.getModule('toolbar');
            if (!toolbar || !toolbar.container) {
              attempts++;
              if (attempts < maxAttempts) {
                setTimeout(setupHtmlButton, 100);
              }
              return;
            }
            
            // Add custom HTML button if not already added
            let htmlButton = toolbar.container.querySelector('.ql-html');
            if (!htmlButton) {
              htmlButton = document.createElement('button');
              htmlButton.className = 'ql-html';
              htmlButton.setAttribute('type', 'button');
              htmlButton.setAttribute('title', 'Edit HTML Source');
              htmlButton.style.cursor = 'pointer';
              htmlButton.style.pointerEvents = 'auto';
              htmlButton.style.position = 'relative';
              htmlButton.style.zIndex = '10';
              
              // Use addEventListener for better event handling
              const handleClick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('HTML button clicked');
                // Always call openHtmlModal - it has fallback logic if editor is not ready
                openHtmlModal();
              };
              
              htmlButton.addEventListener('click', handleClick);
              
              // Find the toolbar and add button after clean button
              const cleanButton = toolbar.container.querySelector('.ql-clean');
              if (cleanButton && cleanButton.parentNode) {
                // Insert after clean button
                cleanButton.parentNode.insertBefore(htmlButton, cleanButton.nextSibling);
              } else {
                // Fallback: append to toolbar
                toolbar.container.appendChild(htmlButton);
              }
              
              console.log('HTML button added to toolbar');
            } else {
              // Button already exists, ensure it has the click handler
              // Remove all existing event listeners by cloning
              const newButton = htmlButton.cloneNode(true);
              if (htmlButton.parentNode) {
                htmlButton.parentNode.replaceChild(newButton, htmlButton);
                
                newButton.style.cursor = 'pointer';
                newButton.style.pointerEvents = 'auto';
                newButton.style.position = 'relative';
                newButton.style.zIndex = '10';
                
                newButton.addEventListener('click', (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('HTML button clicked (replaced)');
                  // Always call openHtmlModal - it has fallback logic if editor is not ready
                  openHtmlModal();
                });
              }
            }
          } catch (error) {
            console.error('Error setting up HTML button:', error);
            attempts++;
            if (attempts < maxAttempts) {
              setTimeout(setupHtmlButton, 200);
            }
          }
        }
      };
      
      // Start setup with initial delay
      const timeoutId = setTimeout(setupHtmlButton, 200);

      return () => clearTimeout(timeoutId);
    }
  }, [isClient, QuillComponent, openHtmlModal]);

  // Show textarea on server or while loading
  if (!isClient || !QuillComponent) {
    return (
      <div className="rich-text-editor-wrapper">
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          rows={rows}
          style={{
            width: '100%',
            minHeight: `${rows * 20}px`,
            padding: '0.5rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontFamily: 'inherit',
            fontSize: 'inherit'
          }}
        />
      </div>
    );
  }

  return (
    <div className="rich-text-editor-wrapper">
      <QuillWrapper
        ref={quillRef}
        QuillComponent={QuillComponent}
        theme="snow"
        value={value || ''}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        style={{ 
          backgroundColor: '#fff',
          minHeight: `${rows * 20}px`
        }}
      />
      
      {showHtmlModal && (
        <div className="html-modal-overlay" onClick={() => setShowHtmlModal(false)}>
          <div className="html-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="html-modal-header">
              <h3>Edit HTML Source</h3>
              <button 
                type="button"
                className="html-modal-close" 
                onClick={() => setShowHtmlModal(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="html-modal-body">
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#666', fontSize: '0.875rem' }}>
                HTML Source Code:
              </label>
              <textarea
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                className="html-modal-textarea"
                placeholder="Enter HTML code here..."
                spellCheck={false}
              />
              <p style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#999' }}>
                Edit the HTML source code above. The visual preview will update in the editor when you click "Apply Changes".
              </p>
            </div>
            <div className="html-modal-footer">
              <button 
                type="button"
                className="btn btn-secondary" 
                onClick={() => setShowHtmlModal(false)}
              >
                Cancel
              </button>
              <button 
                type="button"
                className="btn btn-primary" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Apply Changes button clicked');
                  applyHtmlChanges();
                }}
              >
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;

