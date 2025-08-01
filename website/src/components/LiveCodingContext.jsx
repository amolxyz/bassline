import { useState } from 'react';
import { Info, Music, Code, Zap, ChevronDown } from 'lucide-react';

export function LiveCodingContext() {
  const [isExpanded, setIsExpanded] = useState(false);

  const contextItems = [
    {
      icon: <Music size={16} />,
      title: "Live Coding",
      description: "Code executes immediately as you type. Modify patterns in real-time while music plays."
    },
    {
      icon: <Code size={16} />,
      title: "Pattern-Based",
      description: "Everything is a pattern that can be transformed, combined, and manipulated algorithmically."
    },
    {
      icon: <Zap size={16} />,
      title: "Real-Time",
      description: "Visual feedback shows pattern structure. Multiple patterns can run simultaneously."
    }
  ];



  

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center space-x-2 p-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
      >
        <Info size={14} />
        <span>Live Coding</span>
        <ChevronDown size={12} className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>
      

      {isExpanded && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="space-y-3">
            {contextItems.map((item, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="text-blue-500 mt-0.5">
                  {item.icon}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {item.title}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              <strong>Tip:</strong> Ask the AI to create patterns that you can easily modify. 
              Use terms like "add", "modify", "transform" for pattern changes.
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 