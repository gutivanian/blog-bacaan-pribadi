// components/ArticleList.js
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function ArticleList() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchArticles(currentPage);
  }, [currentPage]);

  const fetchArticles = async (page) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/articles?page=${page}&limit=10`);
      const data = await response.json();
      setArticles(data.articles);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <div className="mb-4">
          <svg className="w-16 h-16 sm:w-20 sm:h-20 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg mb-4">
          No articles yet
        </p>
        <Link
          href="/create"
          className="inline-block px-4 py-2.5 sm:px-6 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm sm:text-base"
        >
          Create Your First Article
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="grid gap-4 sm:gap-6">
        {articles.map((article) => (
          <article
            key={article.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden"
          >
            <Link href={`/blog/${article.slug}`}>
              <div className="p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition line-clamp-2">
                  {article.title}
                </h2>
                
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
                  <time dateTime={article.created_at}>
                    {formatDate(article.created_at)}
                  </time>
                  {article.updated_at !== article.created_at && (
                    <span className="text-xs">
                      Updated: {formatDate(article.updated_at)}
                    </span>
                  )}
                </div>

                <div className="text-gray-700 dark:text-gray-300 line-clamp-2 sm:line-clamp-3 text-sm sm:text-base">
                  {article.preview}...
                </div>

                <div className="mt-3 sm:mt-4 inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm sm:text-base">
                  Read more 
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          </article>
        ))}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-6 sm:mt-8">
          {/* Mobile pagination - compact */}
          <div className="flex sm:hidden justify-between items-center gap-2 px-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex-1 px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm"
            >
              Previous
            </button>

            <span className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
              {currentPage} / {pagination.totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
              disabled={currentPage === pagination.totalPages}
              className="flex-1 px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm"
            >
              Next
            </button>
          </div>

          {/* Desktop pagination - full */}
          <div className="hidden sm:flex justify-center items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              Previous
            </button>

            <div className="flex gap-2 overflow-x-auto max-w-md">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 rounded-lg transition whitespace-nowrap ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
              disabled={currentPage === pagination.totalPages}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}