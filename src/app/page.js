// app/page.js
import Link from 'next/link';
import ArticleList from '@/components/ArticleList';

export default function Home() {
  return (
    <div>
      <div className="text-center mb-8 sm:mb-12 px-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Welcome to HTML Blog
        </h1>
        <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 max-w-2xl mx-auto">
          Transform your HTML content into beautifully styled articles with automatic navigation, dark mode, and last read tracking
        </p>
        <Link
          href="/create"
          className="inline-block px-6 py-2.5 sm:px-8 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition font-medium text-sm sm:text-base lg:text-lg shadow-lg hover:shadow-xl"
        >
          Create Your First Article
        </Link>
      </div>

      <div className="mb-6 sm:mb-8 flex items-center justify-between px-2">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          Recent Articles
        </h2>
      </div>

      <ArticleList />

      <div className="mt-12 sm:mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-gray-800 p-5 sm:p-6 rounded-lg shadow-md">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </div>
          <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-900 dark:text-white">
            Auto Navigation
          </h3>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Automatically generates table of contents from your headings
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 sm:p-6 rounded-lg shadow-md">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </div>
          <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-900 dark:text-white">
            Dark Mode
          </h3>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Beautiful dark theme for comfortable reading
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 sm:p-6 rounded-lg shadow-md sm:col-span-2 lg:col-span-1">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-900 dark:text-white">
            Last Read
          </h3>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Resume reading from where you left off
          </p>
        </div>
      </div>
    </div>
  );
}