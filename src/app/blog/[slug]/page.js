'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ArticleViewer from '@/components/ArticleViewer';
import Link from 'next/link';

export default function BlogDetailPage() {
  const params = useParams();
  const slug = params.slug;
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    async function fetchArticle() {
      try {
        const baseUrl = window.location.origin;
        const response = await fetch(`${baseUrl}/api/articles/${slug}`);
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setArticle(data.article);
      } catch (err) {
        console.error('Error fetching article:', err);
        setArticle(null);
      } finally {
        setLoading(false);
      }
    }

    fetchArticle();
  }, [slug]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="max-w-5xl mx-auto p-4">Loading article...</div>;
  }

  if (!article) {
    return <div className="max-w-5xl mx-auto p-4">Article not found.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
          <time dateTime={article.created_at}>
            Published: {formatDate(article.created_at)}
          </time>
          {article.updated_at !== article.created_at && (
            <span>
              Updated: {formatDate(article.updated_at)}
            </span>
          )}
        </div>
      </div>

      <ArticleViewer article={article} />
    </div>
  );
}
