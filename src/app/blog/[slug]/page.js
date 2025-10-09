// app/blog/[slug]/page.js
import ArticleViewer from '@/components/ArticleViewer';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';

// Format date helper
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Fetch article data on server
async function getArticle(slug) {
  try {
    // Get the actual host from request headers
    const headersList = await headers();
    const host = headersList.get('host');
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const baseUrl = `${protocol}://${host}`;
    
    console.log('🔍 Fetching from:', `${baseUrl}/api/articles/${slug}`);
    
    const response = await fetch(`${baseUrl}/api/articles/${slug}`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('📊 Response status:', response.status);
    
    if (!response.ok) {
      console.error('❌ Failed to fetch article:', response.status);
      return null;
    }
    
    const data = await response.json();
    console.log('✅ Article fetched successfully:', data.article?.title);
    return data.article;
  } catch (error) {
    console.error('💥 Error fetching article:', error.message);
    return null;
  }
}

// Server Component (async)
export default async function BlogDetailPage({ params }) {
  const { slug } = await params;
  
  console.log('🎯 Rendering page for slug:', slug);
  
  const article = await getArticle(slug);

  if (!article) {
    console.log('🚫 Article not found, showing 404');
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
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

// Generate metadata untuk SEO
export async function generateMetadata({ params }) {
  const { slug } = await params;
  
  const article = await getArticle(slug);

  if (!article) {
    return {
      title: 'Article Not Found'
    };
  }

  return {
    title: article.title,
    description: article.raw_html?.substring(0, 160),
    openGraph: {
      title: article.title,
      description: article.raw_html?.substring(0, 160),
    },
  };
}