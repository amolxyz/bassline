import { useState, useEffect } from 'react';
import { setAPIKey, getAIService } from '../services/aiService.js';

export function AISettings() {
  const [apiKey, setApiKeyState] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorDetails, setErrorDetails] = useState('');

  useEffect(() => {
    // Load existing API key from localStorage
    const existingKey = localStorage.getItem('openai_api_key');
    if (existingKey) {
      setApiKeyState(existingKey);
      setIsValid(true);
    }
  }, []);

  const handleSave = async () => {
    if (!apiKey.trim()) {
      setMessage('Please enter a valid API key');
      return;
    }

    setIsLoading(true);
    setMessage('');
    setErrorDetails('');

    try {
      // Test the API key by making a simple request
      const aiService = new (await import('../services/aiService.js')).AIService(apiKey);
      
      // Try a very simple test first - just check if the API key is valid
      const testResponse = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });

      if (!testResponse.ok) {
        if (testResponse.status === 401) {
          throw new Error('API key is invalid or expired');
        } else if (testResponse.status === 429) {
          throw new Error('Rate limit exceeded - please try again later');
        } else if (testResponse.status === 500) {
          throw new Error('OpenAI service error - please try again later');
        } else {
          throw new Error(`API request failed with status ${testResponse.status}`);
        }
      }

      // If the basic test passes, try to generate a simple pattern
      try {
        const testPattern = await aiService.generateMusicPattern('test', [], null, null);
        if (testPattern) {
          setAPIKey(apiKey);
          setIsValid(true);
          setMessage('API key saved successfully! AI Assistant is now enabled.');
          setTimeout(() => setMessage(''), 5000);
        }
      } catch (patternError) {
        console.warn('Pattern generation test failed, but API key is valid:', patternError);
        // If pattern generation fails but API key is valid, still save it
        setAPIKey(apiKey);
        setIsValid(true);
        setMessage('API key saved successfully! Note: Some AI features may be limited.');
        setTimeout(() => setMessage(''), 5000);
      }
      
    } catch (error) {
      console.error('API key validation failed:', error);
      
      let errorMessage = 'Failed to validate API key. ';
      let details = '';
      
      if (error.message.includes('API key is invalid')) {
        errorMessage = 'Invalid API key. ';
        details = 'Please check that you copied the key correctly from OpenAI Console.';
      } else if (error.message.includes('Rate limit')) {
        errorMessage = 'Rate limit exceeded. ';
        details = 'Please wait a moment and try again.';
      } else if (error.message.includes('OpenAI service error')) {
        errorMessage = 'OpenAI service temporarily unavailable. ';
        details = 'Please try again in a few minutes.';
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Network error. ';
        details = 'Please check your internet connection and try again.';
      } else {
        errorMessage = 'Validation failed. ';
        details = error.message || 'Unknown error occurred.';
      }
      
      setMessage(errorMessage);
      setErrorDetails(details);
      setIsValid(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = () => {
    localStorage.removeItem('openai_api_key');
    setApiKeyState('');
    setIsValid(false);
    setMessage('API key removed');
    setErrorDetails('');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div>
        <h3 className="text-lg font-semibold mb-2">AI Assistant Settings</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Add your <b>OpenAI API key</b> to enable the intelligent AI music assistant.<br />
          The AI uses <b>GPT-5</b> for maximum creative output and context-aware assistance.<br />
          Get your API key from{' '}
          <a 
            href="https://platform.openai.com/api-keys" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-600 underline"
          >
            OpenAI Console
          </a>
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="api-key" className="block text-sm font-medium">
          OpenAI API Key
        </label>
        <div className="flex space-x-2">
          <input
            id="api-key"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKeyState(e.target.value)}
            placeholder="sk-..."
            className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <button
            onClick={handleSave}
            disabled={isLoading || !apiKey.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Testing...' : 'Save'}
          </button>
          {isValid && (
            <button
              onClick={handleRemove}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Remove
            </button>
          )}
        </div>
      </div>

      {message && (
        <div className={`text-sm p-2 rounded-md ${
          message.includes('successfully') || message.includes('enabled') 
            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        }`}>
          {message}
          {errorDetails && (
            <div className="mt-2 text-xs">
              {errorDetails}
            </div>
          )}
        </div>
      )}

      {isValid && (
        <div className="space-y-3">
          <div className="text-sm text-blue-600 dark:text-blue-400">
            ✓ API key added - AI Assistant enabled
          </div>
          
          <div className="text-xs text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
            <p className="font-medium mb-2">🚀 AI Assistant Features:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Intelligent Pattern Generation:</strong> Context-aware music creation</li>
              <li><strong>Code Analysis:</strong> Understand and explain your patterns</li>
              <li><strong>Pattern Enhancement:</strong> Improve existing code with suggestions</li>
              <li><strong>Musical Education:</strong> Learn theory and techniques</li>
              <li><strong>Creative Inspiration:</strong> Discover new musical directions</li>
              <li><strong>Problem Solving:</strong> Debug and optimize your patterns</li>
            </ul>
          </div>
        </div>
      )}

      {/* Troubleshooting Tips */}
      <div className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 p-3 rounded">
        <p className="font-medium mb-2">🔧 Troubleshooting Tips:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Make sure your API key starts with "sk-" and is copied completely</li>
          <li>Check that you have sufficient credits in your OpenAI account</li>
          <li>Ensure your API key hasn't expired or been revoked</li>
          <li>Try refreshing the page if you encounter network errors</li>
          <li>Contact OpenAI support if issues persist</li>
        </ul>
      </div>
    </div>
  );
} 