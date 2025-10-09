// components/HighlightManager.js
'use client';

import { useState, useEffect, useRef } from 'react';
import HighlightFloater from './HighlightFloater';
import { 
  getXPath, 
  getTextOffset, 
  applyHighlight, 
  removeHighlight,
  getHighlightColor 
} from '@/lib/highlightUtils';

export default function HighlightManager({ articleId, userSession, containerRef }) {
  const [highlights, setHighlights] = useState([]);
  const [floaterPosition, setFloaterPosition] = useState(null);
  const [selectedRange, setSelectedRange] = useState(null);
  const [selectedText, setSelectedText] = useState('');
  const [showHighlightList, setShowHighlightList] = useState(false);

  // Load highlights on mount
  useEffect(() => {
    if (articleId && userSession) {
      loadHighlights();
    }
  }, [articleId, userSession]);

  // Apply highlights to DOM when loaded
  useEffect(() => {
    if (highlights.length > 0 && containerRef.current) {
      applyHighlightsToDOM();
    }
  }, [highlights]);

  // Handle text selection
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      const text = selection.toString().trim();
      
      if (text.length > 0 && containerRef.current?.contains(selection.anchorNode)) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        setFloaterPosition({
          top: rect.top + window.scrollY - 50,
          left: rect.left + rect.width / 2,
        });
        setSelectedRange(range);
        setSelectedText(text);
      } else {
        setFloaterPosition(null);
        setSelectedRange(null);
        setSelectedText('');
      }
    };

    document.addEventListener('mouseup', handleSelection);
    document.addEventListener('touchend', handleSelection);

    return () => {
      document.removeEventListener('mouseup', handleSelection);
      document.removeEventListener('touchend', handleSelection);
    };
  }, []);

  const loadHighlights = async () => {
    try {
      const response = await fetch(
        `/api/highlights?articleId=${articleId}&userSession=${userSession}`
      );
      const data = await response.json();
      setHighlights(data.highlights || []);
    } catch (error) {
      console.error('Error loading highlights:', error);
    }
  };

  const applyHighlightsToDOM = () => {
    if (!containerRef.current) return;
    
    // Clear existing highlights first
    const existingHighlights = containerRef.current.querySelectorAll('.highlight');
    existingHighlights.forEach(el => {
      const parent = el.parentNode;
      while (el.firstChild) {
        parent.insertBefore(el.firstChild, el);
      }
      parent.removeChild(el);
      parent.normalize();
    });
    
    // Apply each highlight
    highlights.forEach(highlight => {
      applyHighlight(highlight, containerRef.current);
    });

    // Add click handlers to highlights
    const highlightElements = containerRef.current.querySelectorAll('.highlight');
    highlightElements.forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const highlightId = el.dataset.highlightId;
        if (highlightId && confirm('Hapus highlight ini?')) {
          handleDeleteHighlight(highlightId);
        }
      });
    });
  };

  const handleSaveHighlight = async (color) => {
    if (!selectedRange || !containerRef.current) return;

    try {
      // Get container path
      const container = containerRef.current;
      const commonAncestor = selectedRange.commonAncestorContainer;
      const containerPath = getXPath(
        commonAncestor.nodeType === Node.TEXT_NODE 
          ? commonAncestor.parentNode 
          : commonAncestor
      );

      // Get text offsets
      const startOffset = getTextOffset(
        container,
        selectedRange.startContainer,
        selectedRange.startOffset
      );
      const endOffset = getTextOffset(
        container,
        selectedRange.endContainer,
        selectedRange.endOffset
      );

      const response = await fetch('/api/highlights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId,
          userSession,
          highlightedText: selectedText,
          startOffset,
          endOffset,
          containerPath,
          color,
        }),
      });

      if (response.ok) {
        await loadHighlights();
        window.getSelection().removeAllRanges();
        setFloaterPosition(null);
        setSelectedRange(null);
        setSelectedText('');
      } else {
        const error = await response.json();
        if (response.status === 409) {
          alert('Highlight ini sudah ada!');
        } else {
          alert('Gagal menyimpan highlight');
        }
      }
    } catch (error) {
      console.error('Error saving highlight:', error);
      alert('Gagal menyimpan highlight');
    }
  };

  const handleDeleteHighlight = async (highlightId) => {
    try {
      const response = await fetch(
        `/api/highlights?id=${highlightId}&userSession=${userSession}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        removeHighlight(highlightId, containerRef.current);
        setHighlights(prev => prev.filter(h => h.id != highlightId));
      }
    } catch (error) {
      console.error('Error deleting highlight:', error);
    }
  };

  return (
    <>
      {floaterPosition && (
        <HighlightFloater
          position={floaterPosition}
          selectedText={selectedText}
          onSave={handleSaveHighlight}
          onClose={() => {
            setFloaterPosition(null);
            window.getSelection().removeAllRanges();
          }}
        />
      )}

      {/* Highlight List Toggle */}
      {highlights.length > 0 && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => setShowHighlightList(!showHighlightList)}
            className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 rounded-full p-3 shadow-lg transition"
            title="Lihat semua highlights"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
              {highlights.length}
            </span>
          </button>

          {showHighlightList && (
            <div className="absolute bottom-16 right-0 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Highlights ({highlights.length})
                </h3>
                <button
                  onClick={() => setShowHighlightList(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-2">
                {highlights.map((highlight) => (
                  <div
                    key={highlight.id}
                    className="p-3 mb-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer group"
                    style={{ borderLeft: `4px solid ${getHighlightColor(highlight.color)}` }}
                  >
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      "{highlight.highlighted_text.substring(0, 100)}
                      {highlight.highlighted_text.length > 100 ? '...' : ''}"
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        {new Date(highlight.created_at).toLocaleDateString('id-ID')}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Hapus highlight ini?')) {
                            handleDeleteHighlight(highlight.id);
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}