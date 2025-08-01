import { useState, useRef, useEffect } from 'react';
import { useSettings } from '../../../settings.mjs';
import cx from '@src/cx.mjs';
import { Send, Play, Settings, Copy } from 'lucide-react';
import { getAIService, buildOpenAIMessages } from '../../../services/aiService.js';
import { AISettings } from '../../../components/AISettings.jsx';
import { AIExamples } from '../../../components/AIExamples.jsx';
import { LiveCodingContext } from '../../../components/LiveCodingContext.jsx';
import { DocumentationReference } from '../../../components/DocumentationReference.jsx';
import { SongContext } from '../../../components/SongContext.jsx';

export function ChatTab({ context }) {
  const [output, setOutput] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [showSettings, setShowSettings] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [copiedItemId, setCopiedItemId] = useState(null);
  const [songContext, setSongContext] = useState(null);
  const outputEndRef = useRef(null);
  const { fontFamily } = useSettings();

  const scrollToBottom = () => {
    outputEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [output]);

  useEffect(() => {
    // Check if AI is enabled by checking for OpenAI API key
    const apiKey = localStorage.getItem('openai_api_key');
    setAiEnabled(!!apiKey);
  }, []);

  // Listen for storage changes to update AI enabled state
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'openai_api_key') {
        setAiEnabled(!!e.newValue);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleExecute = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userInput = {
      id: Date.now(),
      type: 'input',
      content: inputValue,
      timestamp: new Date()
    };

    setOutput(prev => [...prev, userInput]);
    setIsLoading(true);

    try {
      const aiService = getAIService();
      // Build full chat history for OpenAI with song context
      const messages = buildOpenAIMessages([...output, userInput], '', songContext);
      const response = await aiService.generateMusicPattern(inputValue, messages, songContext);
      const resultOutput = {
        id: Date.now() + 1,
        type: 'output',
        content: response,
        timestamp: new Date()
      };
      setOutput(prev => [...prev, resultOutput]);
    } catch (error) {
      console.error('AI generation error:', error);
      const errorOutput = {
        id: Date.now() + 1,
        type: 'error',
        content: 'Error: Failed to generate pattern. Please try again.',
        timestamp: new Date()
      };
      setOutput(prev => [...prev, errorOutput]);
    } finally {
      setIsLoading(false);
      setInputValue('');
    }
  };


  const handleApplyPattern = (content, itemId) => {
    if (!context?.editorRef?.current) return;
    const editor = context.editorRef.current;
    const cursorPos = editor.getCursorLocation();
    
    // Remove backticks if present and clean up the content
    let cleanContent = content.trim();
    if (cleanContent.startsWith('```') && cleanContent.endsWith('```')) {
      cleanContent = cleanContent.slice(3, -3).trim();
    }
    if (cleanContent.startsWith('`') && cleanContent.endsWith('`')) {
      cleanContent = cleanContent.slice(1, -1).trim();
    }
    
    const change = { from: cursorPos, to: cursorPos, insert: cleanContent };
    editor.editor.dispatch({ changes: change });
    editor.setCursorLocation(cursorPos + cleanContent.length);
    setCopiedItemId(itemId);
    setTimeout(() => setCopiedItemId(null), 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleExecute();
    }
  };

  const getOutputStyle = (type) => {
    switch (type) {
      case 'input':
        return 'text-blue-500 text-sm italic';
      case 'output':
        return 'text-blue-600 font-mono text-sm bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded';
      case 'error':
        return 'text-red-500 font-mono text-sm';
      case 'info':
        return 'text-gray-600 dark:text-gray-400 text-sm';
      default:
        return 'text-foreground text-sm';
    }
  };

  return (
    <div id="chat-tab" className="px-4 flex flex-col w-full h-full text-foreground" style={{ fontFamily }}>
      {/* AI Status and Settings */}
      <div className="flex items-center justify-between mb-4 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${aiEnabled ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
          <span className="text-sm">
            {aiEnabled ? 'AI Assistant Enabled' : 'AI Assistant Disabled'}
          </span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowExamples(!showExamples)}
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
            title="Show Examples"
          >
            Examples
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            title="AI Settings"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* AI Settings Panel */}
      {showSettings && (
        <div className="mb-4">
          <AISettings />
        </div>
      )}

      {/* Live Coding Context */}
      <LiveCodingContext />

      {/* Song Context */}
      <SongContext onContextChange={setSongContext} />

      {/* Documentation Reference */}
      <DocumentationReference />

      {/* AI Examples Panel */}
      {showExamples && (
        <div className="mb-4">
          <AIExamples onSelectPrompt={(prompt) => {
            setInputValue(prompt);
            setShowExamples(false);
          }} />
        </div>
      )}

      <div className="flex-1 overflow-auto mb-4">
        <div className="space-y-1">
          {output.map((item) => (
            <div key={item.id} className="flex items-start gap-2">
              <div className={cx('flex-1', getOutputStyle(item.type))}>
                {item.type === 'output' ? (
                  <>
                    {/* Remove backticks from display */}
                    {item.content.replace(/^```[\s\S]*?\n?([\s\S]*?)```$/, '$1').replace(/^`([\s\S]*?)`$/, '$1')}
                  </>
                ) : (
                  item.content
                )}
              </div>
              {item.type === 'output' && (
                <button
                  onClick={() => handleApplyPattern(item.content, item.id)}
                  className={cx(
                    "px-2 py-1 text-xs transition-colors rounded",
                    copiedItemId === item.id 
                      ? "bg-blue-500 text-white" 
                      : "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800"
                  )}
                  title="Add pattern to editor"
                >
                  Add
                </button>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          )}
        </div>
        <div ref={outputEndRef} />
      </div>
      <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-4">
        <div className="flex-1 relative">
          <input
            placeholder={aiEnabled ? "Create a new pattern" : "Explore sounds or patterns"}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            className={cx(
              'w-full p-2 bg-gray-800 text-foreground placeholder-gray-400',
              'outline-none border-none font-mono text-sm',
              'focus:outline-none focus:border-none focus:ring-0'
            )}
          />
        </div>
        <button
          onClick={handleExecute}
          disabled={!inputValue.trim() || isLoading}
          className="p-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Execute (Enter)"
        >
          <Play size={16} />
        </button>
      </div>
    </div>
  );
} 