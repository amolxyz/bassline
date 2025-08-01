import { useState, useEffect } from 'react';
import { setAPIKey, getAIService } from '../services/aiService.js';

export function AISettings() {
  const [apiKey, setApiKeyState] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

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

    try {
      // Test the API key by making a simple request
      const aiService = new (await import('../services/aiService.js')).AIService(apiKey);
      
      // Try to generate a simple pattern to test the key
      const testPattern = await aiService.generateMusicPattern('create a simple drum beat');
      
      if (testPattern) {
        setAPIKey(apiKey);
        setIsValid(true);
        setMessage('API key saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('API key validation failed:', error);
      setMessage('Invalid API key. Please check your OpenAI API key and try again.');
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
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div>
        <h3 className="text-lg font-semibold mb-2">AI Assistant</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Add <b>OpenAI API key</b> to enable AI music generation.<br />
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
          message.includes('successfully') || message.includes('removed') 
            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        }`}>
          {message}
        </div>
      )}

      {isValid && (
        <div className="text-sm text-blue-600 dark:text-blue-400">
          ✓ API key added
        </div>
      )}
    </div>
  );
} 