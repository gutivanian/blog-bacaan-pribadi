// components/HTMLEditor.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HTMLEditor() {
  const [rawHtml, setRawHtml] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rawHtml,
          customSlug: customSlug.trim() || undefined
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create article');
      }

      // Redirect to the new article
      router.push(`/blog/${data.article.slug}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSampleHTML = () => {
    const sample = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Sample Article - Getting Started</title>
</head>
<body>
    <h1>Welcome to HTML Blog</h1>
    
    <h2>Introduction</h2>
    <p>This is a sample article demonstrating the HTML blog system. You can write your content in HTML and it will be automatically styled with a beautiful theme.</p>
    
    <h3>Features</h3>
    <p>This blog system includes several powerful features:</p>
    <ul>
        <li>Automatic table of contents generation</li>
        <li>Dark mode support</li>
        <li>Last read position tracking</li>
        <li>Responsive design for mobile and desktop</li>
        <li>Toggle-able sections</li>
    </ul>
    
    <h3>How to Use</h3>
    <p>Simply paste your HTML content in the editor and click submit. The system will:</p>
    <ol>
        <li>Generate a unique slug from your title</li>
        <li>Apply beautiful styling</li>
        <li>Create navigation menu</li>
        <li>Add interactive features</li>
    </ol>
    
    <h2>Advanced Features</h2>
    <p>You can use various HTML elements and they will be styled appropriately.</p>
    
    <h3>Code Examples</h3>
    <p>Inline code: <code>const x = 42;</code></p>
    <pre><code>function greet(name) {
  return \`Hello, \${name}!\`;
}</code></pre>
    
    <h3>Quotes</h3>
    <blockquote>
        "The best way to predict the future is to invent it." - Alan Kay
    </blockquote>
    
    <h2>Conclusion</h2>
    <p>Start creating your own articles by replacing this sample content with your own HTML!</p>
</body>
</html>`;
    setRawHtml(sample);
    setPreview(false);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4 sm:mb-6 flex-wrap gap-3">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Create New Article
          </h2>
          <button
            type="button"
            onClick={loadSampleHTML}
            className="px-3 py-2 sm:px-4 text-xs sm:text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            Load Sample
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label 
              htmlFor="customSlug" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Custom Slug (optional)
            </label>
            <input
              type="text"
              id="customSlug"
              value={customSlug}
              onChange={(e) => setCustomSlug(e.target.value)}
              placeholder="my-custom-slug"
              className="w-full px-3 py-2 sm:px-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm sm:text-base"
            />
            <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Leave empty to auto-generate from title
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label 
                htmlFor="rawHtml" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                HTML Content
              </label>
              <button
                type="button"
                onClick={() => setPreview(!preview)}
                className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                {preview ? 'Edit' : 'Preview'}
              </button>
            </div>

            {!preview ? (
              <textarea
                id="rawHtml"
                value={rawHtml}
                onChange={(e) => setRawHtml(e.target.value)}
                required
                rows={15}
                className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-xs sm:text-sm dark:bg-gray-700 dark:text-white resize-y"
                placeholder="Paste your HTML content here..."
              />
            ) : (
              <div className="w-full min-h-[300px] sm:min-h-[500px] p-3 sm:p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 overflow-auto">
                <div 
                  className="prose prose-sm sm:prose dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: rawHtml }}
                />
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-800 dark:text-red-200 text-xs sm:text-sm">{error}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              type="submit"
              disabled={isLoading || !rawHtml.trim()}
              className="flex-1 px-4 py-2.5 sm:px-6 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium text-sm sm:text-base"
            >
              {isLoading ? 'Creating...' : 'Create Article'}
            </button>

            <button
              type="button"
              onClick={() => router.push('/')}
              className="px-4 py-2.5 sm:px-6 sm:py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition font-medium text-sm sm:text-base"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}