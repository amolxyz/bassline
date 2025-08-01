import { useState } from 'react';

const EXAMPLE_PROMPTS = [
  {
    category: "Live Coding Scenarios",
    prompts: [
      "create a basic beat to start with",
      "add a melodic bassline to my drum pattern",
      "make the rhythm more complex with polyrhythms",
      "add atmospheric pads for texture",
      "create a build-up section with increasing intensity"
    ]
  },
  {
    category: "Pattern Transformations",
    prompts: [
      "apply Euclidean rhythm to my drum pattern",
      "create a pattern that changes every 4 cycles",
      "add randomization to my melody",
      "make the pattern faster and more energetic",
      "create a pattern with offset layers"
    ]
  },
  {
    category: "Musical Styles",
    prompts: [
      "create a techno rhythm with industrial sounds",
      "make a jazz piano progression",
      "generate ambient drone with long notes",
      "create a hip-hop beat with sampled drums",
      "make a classical string quartet pattern"
    ]
  },
  {
    category: "Advanced Techniques",
    prompts: [
      "create a polymetric pattern with different time signatures",
      "add voice leading to my chord progression",
      "create a pattern with conditional transformations",
      "make a generative melody that evolves over time",
      "create a pattern with multiple simultaneous transformations"
    ]
  },
  {
    category: "Sound Design",
    prompts: [
      "create a bass sound with filter modulation",
      "add delay and reverb effects to my pattern",
      "create a pad with slow filter sweeps",
      "make a percussive sound with envelope shaping",
      "create a sound with frequency modulation"
    ]
  },
  {
    category: "Interactive Elements",
    prompts: [
      "create a pattern that responds to tempo changes",
      "make a pattern that varies based on cycle position",
      "create a pattern with randomized parameters",
      "make a pattern that builds complexity over time",
      "create a pattern with multiple layers that interact"
    ]
  },
  {
    category: "Context-Aware",
    prompts: [
      "create a pattern that fits my song context",
      "add an instrument from my preferences",
      "make a pattern in my chosen genre",
      "create something that matches my mood",
      "add effects that complement my style"
    ]
  }
];

export function AIExamples({ onSelectPrompt }) {
  const [selectedCategory, setSelectedCategory] = useState(0);

  return (
    <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <h3 className="text-lg font-semibold mb-3">Example Prompts</h3>
      
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
        <p>💡 <strong>Live Coding Tips:</strong></p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Define your song context above for better AI recommendations</li>
          <li>Be specific about the style, instrument, or transformation you want</li>
          <li>Ask for modifications to existing patterns in your conversation</li>
          <li>Request patterns that can be easily modified in real-time</li>
          <li>Use terms like "add", "modify", "transform" for pattern changes</li>
        </ul>
        <p className="mt-2">🎵 The AI will generate Strudel code patterns that you can paste into the editor and modify live.</p>
      </div>
    </div>
  );
} 