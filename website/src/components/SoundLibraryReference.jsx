import { useState } from 'react';
import { Music, Zap, Settings, ChevronDown } from 'lucide-react';

export function SoundLibraryReference() {
  const [isExpanded, setIsExpanded] = useState(false);

  const soundCategories = [
    {
      name: "Synthesizers",
      description: "Built-in synthesis engines",
      sounds: [
        "piano", "guitar", "electric", "acoustic", "violin", "flute", 
        "sine", "square", "sawtooth", "triangle", "wind", "feel"
      ]
    },
    {
      name: "Drum Samples",
      description: "Rhythm and percussion sounds",
      sounds: [
        "bd (bass drum)", "hh (hi-hat)", "sd (snare drum)", "cp (clap)", 
        "rim", "lt (low tom)", "mt (mid tom)", "ht (high tom)", "oh (open hi-hat)"
      ]
    },
    {
      name: "DSP Effects",
      description: "Audio processing and effects",
      sounds: [
        "reverb", "delay", "phaser", "lpf (low-pass filter)", "hpf (high-pass filter)",
        "feedbackdelay", "fft processing", "envelope shaping"
      ]
    },
    {
      name: "Advanced Synthesis",
      description: "Complex sound generation",
      sounds: [
        "superdough synthesis", "vowel synthesis", "noise generation", 
        "frequency modulation", "granular synthesis"
      ]
    },
    {
      name: "External Inputs",
      description: "Real-time input sources",
      sounds: [
        "MIDI input", "OSC communication", "gamepad input", "motion sensors",
        "serial communication", "MQTT messaging"
      ]
    }
  ];

  const patternFunctions = [
    {
      name: "Basic Patterns",
      description: "Fundamental pattern creation",
      functions: [
        "note() - melodic patterns", "s() - sample patterns", "sequence() - sequential patterns",
        "stack() - layered patterns", "mini() - mini-notation patterns"
      ]
    },
    {
      name: "Transformations",
      description: "Pattern manipulation and variation",
      functions: [
        ".fast() / .slow() - tempo changes", ".every() - conditional transformations",
        ".off() - offset and transform", ".jux() - stereo effects", ".iter() - repetition",
        ".euclid() - Euclidean rhythms"
      ]
    },
    {
      name: "Sound Control",
      description: "Audio parameter manipulation",
      functions: [
        ".s() - sound selection", ".bank() - sample bank selection", ".gain() - volume control",
        ".room() - reverb amount", ".cutoff() - filter frequency", ".resonance() - filter resonance"
      ]
    },
    {
      name: "Tonal Functions",
      description: "Musical theory and harmony",
      functions: [
        ".scale() - musical scale", ".mode() - root and mode", ".chord() - chord creation",
        ".voicing() - voice leading", ".transpose() - pitch shifting"
      ]
    }
  ];

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center space-x-2 p-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
      >
        <Music size={14} />
        <span>Sound Library Reference</span>
        <ChevronDown size={12} className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>
      
      {isExpanded && (
        <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
          <div className="space-y-4">
            {/* Sound Categories */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center">
                <Zap size={14} className="mr-2 text-orange-500" />
                Available Sounds & Effects
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {soundCategories.map((category, index) => (
                  <div key={index} className="bg-white dark:bg-gray-700 p-2 rounded border">
                    <div className="text-xs font-medium text-gray-900 dark:text-gray-100 mb-1">
                      {category.name}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      {category.description}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {category.sounds.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pattern Functions */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center">
                <Settings size={14} className="mr-2 text-orange-500" />
                Pattern Functions & Methods
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {patternFunctions.map((category, index) => (
                  <div key={index} className="bg-white dark:bg-gray-700 p-2 rounded border">
                    <div className="text-xs font-medium text-gray-900 dark:text-gray-100 mb-1">
                      {category.name}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      {category.description}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {category.functions.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Usage Tips */}
            <div className="text-xs text-gray-600 dark:text-gray-400 bg-orange-100 dark:bg-orange-900/30 p-2 rounded">
              <p className="font-medium mb-1">💡 Usage Tips:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Use <code className="bg-orange-200 dark:bg-orange-800 px-1 rounded">.s("soundname")</code> to select sounds</li>
                <li>Combine patterns with <code className="bg-orange-200 dark:bg-orange-800 px-1 rounded">stack()</code> for layering</li>
                <li>Apply effects with <code className="bg-orange-200 dark:bg-orange-800 px-1 rounded">.room()</code>, <code className="bg-orange-200 dark:bg-orange-800 px-1 rounded">.delay()</code>, etc.</li>
                <li>Use mini-notation for concise rhythmic patterns</li>
                <li>Ask the AI for specific sound combinations and effects</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
