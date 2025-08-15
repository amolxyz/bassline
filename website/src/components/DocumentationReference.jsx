import { BookOpen, ExternalLink } from 'lucide-react';

export function DocumentationReference() {
  const docSections = [
    {
      title: "Getting Started",
      url: "https://strudel.cc/workshop/getting-started/",
      description: "Introduction to Strudel and live coding"
    },
    {
      title: "Workshop",
      url: "https://strudel.cc/workshop/",
      description: "Interactive tutorials for beginners"
    },
    {
      title: "Pattern Functions",
      url: "https://strudel.cc/learn/",
      description: "Reference for pattern manipulation functions"
    },
    {
      title: "Mini-Notation",
      url: "https://strudel.cc/learn/mini-notation/",
      description: "Concise syntax for rhythmic patterns"
    },
    {
      title: "Technical Manual",
      url: "https://strudel.cc/technical-manual/",
      description: "Advanced concepts and implementation details"
    },
    {
      title: "Recipes",
      url: "https://strudel.cc/recipes/",
      description: "Practical examples and common patterns"
    }
  ];

  return (
    <div className="mb-4">
      <div className="flex items-center space-x-2 p-2 text-sm text-gray-600 dark:text-gray-400">
        <BookOpen size={14} />
        <span>Documentation</span>
      </div>

      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
          Quick access to Strudel documentation and learning resources:
        </p>

        <div className="space-y-2">
          {docSections.map((section, index) => (
            <a
              key={index}
              href={section.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2 text-xs bg-white dark:bg-gray-700 rounded border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
            >
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {section.title}
                </div>
                <div className="text-gray-500 dark:text-gray-400">
                  {section.description}
                </div>
              </div>
              <ExternalLink size={12} className="text-blue-500" />
            </a>
          ))}
        </div>

        <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            <strong>Note:</strong> The AI assistant is trained on the latest Strudel documentation 
            and can help you with specific questions about patterns and functions.
          </p>
        </div>
      </div>
    </div>
  );
} 