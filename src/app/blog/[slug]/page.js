// app/blog/[slug]/page.js
import { notFound } from 'next/navigation';
import ArticleViewer from '@/components/ArticleViewer';
import Link from 'next/link';

async function getArticle(slug) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/articles/${slug}`, {
      cache: 'no-store'
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.article;
  } catch (error) {
    console.error('Error fetching article:', error);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const article = await getArticle(params.slug);

  if (!article) {
    return {
      title: 'Article Not Found',
    };
  }

  return {
    title: `${article.title} - HTML Blog`,
    description: article.title,
  };
}

export default async function BlogDetailPage({ params }) {
  const article = await getArticle(params.slug);

  if (!article) {
    notFound();
  }

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