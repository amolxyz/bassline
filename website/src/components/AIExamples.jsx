import { useState } from 'react';

const EXAMPLE_PROMPTS = [
  {
    category: "Code Analysis & Understanding",
    prompts: [
      "What does my current code do musically?",
      "Analyze the structure of my pattern",
      "How can I improve my current code?",
      "What musical elements are present in my code?",
      "Suggest optimizations for my pattern"
    ]
  },
  {
    category: "Pattern Enhancement & Variation",
    prompts: [
      "Create a variation of my current pattern",
      "Add complexity to my existing rhythm",
      "Enhance my melody with additional notes",
      "Create a complementary pattern to layer",
      "Make my pattern more dynamic and interesting"
    ]
  },
  {
    category: "Musical Development",
    prompts: [
      "Suggest a bridge section for my song",
      "Create a build-up that leads to my current pattern",
      "Add a breakdown section with different energy",
      "Create a pattern that transitions smoothly from my current one",
      "Suggest a complete song structure based on my current pattern"
    ]
  },
  {
    category: "Sound Design & Effects",
    prompts: [
      "Add atmospheric effects to my current pattern",
      "Create a pad that complements my rhythm",
      "Suggest effects that would enhance my sound",
      "Create a bassline that works with my current pattern",
      "Add texture and depth to my existing pattern"
    ]
  },
  {
    category: "Genre & Style Adaptation",
    prompts: [
      "Transform my pattern into a different genre",
      "Make my pattern more [genre]-like",
      "Add genre-specific elements to my current code",
      "Create a pattern that bridges two different styles",
      "Suggest genre-appropriate variations of my pattern"
    ]
  },
  {
    category: "Advanced Techniques",
    prompts: [
      "Create a polymetric pattern that works with my current one",
      "Add algorithmic variations to my pattern",
      "Create a generative element that evolves over time",
      "Implement voice leading in my chord progression",
      "Create a pattern with conditional transformations based on my current code"
    ]
  },
  {
    category: "Live Coding Workflow",
    prompts: [
      "How can I make my pattern more live-coding friendly?",
      "Suggest ways to modify my pattern in real-time",
      "Create variations that are easy to switch between",
      "How can I build complexity gradually from my current pattern?",
      "Suggest a live coding performance structure using my current pattern"
    ]
  },
  {
    category: "Musical Theory & Education",
    prompts: [
      "Explain the musical theory behind my current pattern",
      "What scales or modes would work well with my melody?",
      "How can I add harmonic complexity to my pattern?",
      "Suggest chord progressions that complement my current pattern",
      "What musical concepts am I using in my code?"
    ]
  },
  {
    category: "Problem Solving",
    prompts: [
      "My pattern sounds muddy, how can I fix it?",
      "How can I make my pattern more rhythmic?",
      "My melody is too repetitive, suggest variations",
      "How can I balance the different elements in my pattern?",
      "What's causing the timing issues in my pattern?"
    ]
  },
  {
    category: "Creative Inspiration",
    prompts: [
      "Give me 3 different directions to take my current pattern",
      "What would happen if I combined my pattern with [style]?",
      "Suggest unexpected ways to transform my pattern",
      "How can I make my pattern more experimental?",
      "What musical ideas are hidden in my current code?"
    ]
  }
];

export function AIExamples({ onSelectPrompt }) {
  const [selectedCategory, setSelectedCategory] = useState(0);

  return (
    <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <h3 className="text-lg font-semibold mb-3">AI Assistant Examples</h3>
      
      {/* Category Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {EXAMPLE_PROMPTS.map((category, index) => (
          <button
            key={index}
            onClick={() => setSelectedCategory(index)}
            className={`px-3 py-1 text-sm rounded-md whitespace-nowrap transition-colors ${
              selectedCategory === index
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {category.category}
          </button>
        ))}
      </div>

      {/* Prompts for selected category */}
      <div className="space-y-2">
        {EXAMPLE_PROMPTS[selectedCategory].prompts.map((prompt, index) => (
          <button
            key={index}
            onClick={() => onSelectPrompt(prompt)}
            className="w-full text-left p-3 text-sm bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            "{prompt}"
          </button>
        ))}
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <p>🚀 <strong>AI Assistant Capabilities:</strong></p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong>Code Analysis:</strong> Understand and explain your current patterns</li>
          <li><strong>Pattern Enhancement:</strong> Improve and vary existing code</li>
          <li><strong>Musical Guidance:</strong> Get theory explanations and suggestions</li>
          <li><strong>Creative Inspiration:</strong> Discover new directions for your music</li>
          <li><strong>Problem Solving:</strong> Debug and optimize your patterns</li>
        </ul>
        
        <p className="mt-2">💡 <strong>Pro Tips:</strong></p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Set your song context above for personalized recommendations</li>
          <li>Ask follow-up questions to refine and develop ideas</li>
          <li>Use the "Analyze" button to get insights about your current code</li>
          <li>Try the Quick Actions for instant pattern analysis and enhancement</li>
          <li>The AI remembers your conversation context for better suggestions</li>
        </ul>
        
        <p className="mt-2">🎵 The AI will provide intelligent responses, code patterns, explanations, and creative suggestions to help you develop your music.</p>
      </div>
    </div>
  );
} 