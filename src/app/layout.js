// app/layout.js
import { Inter } from 'next/font/google';
import './globals.css';
import ThemeToggle from '@/components/ThemeToggle';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'HTML Blog - Create & Share Beautiful Articles',
  description: 'Transform your HTML into beautifully styled blog articles',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen`}>
        <nav className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-14 sm:h-16">
              <div className="flex items-center gap-4 sm:gap-8">
                <Link href="/" className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-500 hover:to-purple-500 transition">
                  HTML Blog
                </Link>
                
                <div className="hidden md:flex items-center gap-4">
                  <Link 
                    href="/" 
                    className="text-sm lg:text-base text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition font-medium"
                  >
                    Home
                  </Link>
                  <Link 
                    href="/create" 
                    className="text-sm lg:text-base text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition font-medium"
                  >
                    Create
                  </Link>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-4">
                <Link
                  href="/create"
                  className="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-xs sm:text-sm"
                >
                  <span className="hidden sm:inline">+ New Article</span>
                  <span className="sm:hidden">+ New</span>
                </Link>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 min-h-[calc(100vh-14rem)]">
          {children}
        </main>

        <footer className="mt-auto border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="text-center text-gray-600 dark:text-gray-400">
              <p className="mb-2 text-sm sm:text-base">HTML Blog - Transform your content into beautiful articles</p>
              <p className="text-xs sm:text-sm">Built with Next.js, PostgreSQL, and Tailwind CSS</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}