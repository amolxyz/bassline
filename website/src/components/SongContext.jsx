import { useState, useEffect } from 'react';
import { Music, Settings, Save, Edit3, ChevronDown } from 'lucide-react';

export function SongContext({ onContextChange }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [songContext, setSongContext] = useState({
    genre: '',
    instruments: '',
    mood: '',
    tempo: '',
    key: '',
    style: '',
    additionalNotes: ''
  });

  // Load saved context from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('strudel_song_context');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSongContext(parsed);
        onContextChange(parsed);
      } catch (e) {
        console.error('Failed to parse saved song context:', e);
      }
    }
  }, [onContextChange]);

  // Save context to localStorage and notify parent
  const saveContext = (newContext) => {
    setSongContext(newContext);
    localStorage.setItem('strudel_song_context', JSON.stringify(newContext));
    onContextChange(newContext);
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    const updated = { ...songContext, [field]: value };
    setSongContext(updated);
  };

  const clearContext = () => {
    const empty = {
      genre: '',
      instruments: '',
      mood: '',
      tempo: '',
      key: '',
      style: '',
      additionalNotes: ''
    };
    saveContext(empty);
  };

  const hasContext = Object.values(songContext).some(value => value.trim() !== '');

  const getContextSummary = () => {
    const parts = [];
    if (songContext.genre) parts.push(songContext.genre);
    if (songContext.instruments) parts.push(songContext.instruments);
    if (songContext.mood) parts.push(songContext.mood);
    if (songContext.tempo) parts.push(`${songContext.tempo} BPM`);
    if (songContext.key) parts.push(`Key: ${songContext.key}`);
    return parts.join(' • ');
  };

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center space-x-2 p-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
      >
        <Music size={14} />
        <span>Track Context</span>
        {hasContext && (
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
            Active
          </span>
        )}
        <ChevronDown size={12} className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>
      
      {isExpanded && (
        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
          {!isEditing ? (
            // Display mode
            <div className="space-y-3">
              {hasContext ? (
                <>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Current Track Context
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-700 p-2 rounded">
                    {getContextSummary()}
                  </div>
                  {songContext.additionalNotes && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                      "{songContext.additionalNotes}"
                    </div>
                  )}
                </>
              ) : (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  No track context defined. Define your preferences to get better AI recommendations.
                </div>
              )}
              
              <div className="flex space-x-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-1 px-2 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
                >
                  <Edit3 size={12} />
                  <span>{hasContext ? 'Edit' : 'Define'}</span>
                </button>
                {hasContext && (
                  <button
                    onClick={clearContext}
                    className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          ) : (
            // Edit mode
            <div className="space-y-3">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Define Your Track Context
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Genre
                  </label>
                  <input
                    type="text"
                    value={songContext.genre}
                    onChange={(e) => handleInputChange('genre', e.target.value)}
                    placeholder="e.g., House, Jazz, Ambient, Techno"
                    className="w-full p-2 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Preferred Instruments
                  </label>
                  <input
                    type="text"
                    value={songContext.instruments}
                    onChange={(e) => handleInputChange('instruments', e.target.value)}
                    placeholder="e.g., Piano, Drums, Synth, Bass"
                    className="w-full p-2 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Mood/Atmosphere
                  </label>
                  <input
                    type="text"
                    value={songContext.mood}
                    onChange={(e) => handleInputChange('mood', e.target.value)}
                    placeholder="e.g., Energetic, Melancholic, Dark, Uplifting"
                    className="w-full p-2 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tempo (BPM)
                    </label>
                    <input
                      type="text"
                      value={songContext.tempo}
                      onChange={(e) => handleInputChange('tempo', e.target.value)}
                      placeholder="e.g., 120, 140"
                      className="w-full p-2 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Key
                    </label>
                    <input
                      type="text"
                      value={songContext.key}
                      onChange={(e) => handleInputChange('key', e.target.value)}
                      placeholder="e.g., C major, D minor"
                      className="w-full p-2 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Style/Influence
                  </label>
                  <input
                    type="text"
                    value={songContext.style}
                    onChange={(e) => handleInputChange('style', e.target.value)}
                    placeholder="e.g., Minimal, Complex, Experimental"
                    className="w-full p-2 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Additional Notes
                  </label>
                  <textarea
                    value={songContext.additionalNotes}
                    onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                    placeholder="Any other preferences or ideas for your song..."
                    rows="2"
                    className="w-full p-2 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
                  />
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => saveContext(songContext)}
                  className="flex items-center space-x-1 px-3 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
                >
                  <Save size={12} />
                  <span>Save Context</span>
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          
          <div className="mt-3 pt-3 border-t border-purple-200 dark:border-purple-800">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              <strong>Tip:</strong> Define your track context to get more relevant AI pattern suggestions. 
              The AI will use this information to generate patterns that match your musical vision.
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 