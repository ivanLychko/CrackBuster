import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import './RichTextEditor.scss';

/**
 * RichTextEditor component using react-quill
 * 
 * Note: This component uses react-quill library which internally uses findDOMNode.
 * React warns about this in StrictMode, but it's a known issue with the library
 * and doesn't affect functionality. The warning can be safely ignored until
 * react-quill is updated to remove findDOMNode usage.
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
    // Only call onChange if value actually changed
    if (newValue !== lastValueRef.current) {
      lastValueRef.current = newValue;
      onChange(newValue);
    }
  }, [onChange]);

  const openHtmlModal = useCallback(() => {
    if (quillRef.current && quillRef.current.root) {
      const html = quillRef.current.root.innerHTML;
      setHtmlContent(html);
      setShowHtmlModal(true);
    } else {
      console.warn('Quill editor not ready yet');
    }
  }, []);

  const applyHtmlChanges = useCallback(() => {
    if (quillRef.current && htmlContent !== undefined) {
      // Get the Quill instance
      const quill = quillRef.current.getEditor();
      // Set the content using Quill's API
      quill.clipboard.dangerouslyPasteHTML(htmlContent);
      // Get the updated HTML and trigger onChange
      const updatedHtml = quillRef.current.root.innerHTML;
      handleChange(updatedHtml);
      setShowHtmlModal(false);
    }
  }, [htmlContent, handleChange]);

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

  // Update ref when value prop changes externally
  useEffect(() => {
    if (value !== lastValueRef.current) {
      lastValueRef.current = value;
    }
  }, [value]);

  // Register custom HTML button after component mounts
  // This must be called before any conditional returns to maintain hook order
  useEffect(() => {
    if (isClient && QuillComponent && quillRef.current) {
      // Use setTimeout to ensure Quill is fully initialized
      const timeoutId = setTimeout(() => {
        if (quillRef.current) {
          try {
            const quill = quillRef.current.getEditor();
            if (!quill) return;
            
            const toolbar = quill.getModule('toolbar');
            if (!toolbar || !toolbar.container) return;
            
            // Add custom HTML button if not already added
            if (!toolbar.container.querySelector('.ql-html')) {
              const htmlButton = document.createElement('button');
              htmlButton.className = 'ql-html';
              htmlButton.setAttribute('type', 'button');
              htmlButton.setAttribute('title', 'Edit HTML Source');
              htmlButton.onclick = (e) => {
                e.preventDefault();
                if (quillRef.current && quillRef.current.root) {
                  openHtmlModal();
                }
              };
              
              // Find the toolbar and add button after clean button
              const cleanButton = toolbar.container.querySelector('.ql-clean');
              if (cleanButton && cleanButton.parentNode) {
                // Insert after clean button
                cleanButton.parentNode.insertBefore(htmlButton, cleanButton.nextSibling);
              } else {
                // Fallback: append to toolbar
                toolbar.container.appendChild(htmlButton);
              }
            }
          } catch (error) {
            console.error('Error setting up HTML button:', error);
          }
        }
      }, 100);

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
      <QuillComponent
        ref={quillRef}
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
                className="html-modal-close" 
                onClick={() => setShowHtmlModal(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="html-modal-body">
              <textarea
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                className="html-modal-textarea"
                placeholder="Enter HTML code here..."
                spellCheck={false}
              />
            </div>
            <div className="html-modal-footer">
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowHtmlModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={applyHtmlChanges}
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

