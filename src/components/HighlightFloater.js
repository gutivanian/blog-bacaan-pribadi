// components/HighlightFloater.js
'use client';

import { useState, useEffect } from 'react';

const COLORS = [
  { name: 'yellow', label: '🟡', color: 'rgba(255, 255, 0, 0.3)' },
  { name: 'green', label: '🟢', color: 'rgba(0, 255, 0, 0.3)' },
  { name: 'blue', label: '🔵', color: 'rgba(0, 191, 255, 0.3)' },
  { name: 'pink', label: '🩷', color: 'rgba(255, 192, 203, 0.3)' },
  { name: 'orange', label: '🟠', color: 'rgba(255, 165, 0, 0.3)' },
];

export default function HighlightFloater({ 
  position, 
  onSave, 
  onClose,
  selectedText 
}) {
  const [selectedColor, setSelectedColor] = useState('yellow');
  const [showColorPicker, setShowColorPicker] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.highlight-floater')) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (!position) return null;

  const handleSave = () => {
    onSave(selectedColor);
    setShowColorPicker(false);
  };

  return (
    <div
      className="highlight-floater fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translateX(-50%)',
      }}
    >
      {!showColorPicker ? (
        <div className="flex items-center gap-2 p-2">
          <button
            onClick={handleSave}
            className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-md font-medium text-sm transition flex items-center gap-1"
            title="Highlight dengan warna default"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
            Highlight
          </button>
          
          <button
            onClick={() => setShowColorPicker(true)}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition"
            title="Pilih warna"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      ) : (
        <div className="p-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Pilih Warna
            </span>
            <button
              onClick={() => setShowColorPicker(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="flex gap-2">
            {COLORS.map((color) => (
              <button
                key={color.name}
                onClick={() => setSelectedColor(color.name)}
                className={`w-10 h-10 rounded-md border-2 transition flex items-center justify-center text-xl ${
                  selectedColor === color.name
                    ? 'border-blue-500 scale-110'
                    : 'border-gray-300 dark:border-gray-600 hover:scale-105'
                }`}
                style={{ backgroundColor: color.color }}
                title={color.name}
              >
                {color.label}
              </button>
            ))}
          </div>
          
          <button
            onClick={handleSave}
            className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium text-sm transition"
          >
            Simpan Highlight
          </button>
        </div>
      )}
    </div>
  );
}