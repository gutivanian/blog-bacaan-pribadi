// app/create/page.js
import HTMLEditor from '@/components/HTMLEditor';

export const metadata = {
  title: 'Create Article - HTML Blog',
  description: 'Create a new beautifully styled article',
};

export default function CreatePage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Create New Article
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Paste your HTML content below and we&apos;ll transform it into a beautifully styled article
        </p>
      </div>

      <HTMLEditor />
    </div>
  );
}