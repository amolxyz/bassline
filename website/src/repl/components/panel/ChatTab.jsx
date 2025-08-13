import { useState, useRef, useEffect } from 'react';
import { useSettings, setAiChatHistory } from '../../../settings.mjs';
import cx from '@src/cx.mjs';
import { Play, Settings, Copy, Code, Lightbulb, HelpCircle, Music, Zap, SlidersHorizontal, X, ArrowUpCircle } from 'lucide-react';
import { getAIService, buildOpenAIMessages } from '../../../services/aiService.js';
import { AISettings } from '../../../components/AISettings.jsx';
// import { AIExamples } from '../../../components/AIExamples.jsx';
import { LiveCodingContext } from '../../../components/LiveCodingContext.jsx';
import { DocumentationReference } from '../../../components/DocumentationReference.jsx';
import { SongContext } from '../../../components/SongContext.jsx';
import { SoundLibraryReference } from '../../../components/SoundLibraryReference.jsx';
import AIResult from './AIResult.jsx';
import { sanitizeStrudelCode } from '../../../utils/aiFormat.js';

export function ChatTab({ context }) {
  const [output, setOutput] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [showSettings, setShowSettings] = useState(false);
  // const [showExamples, setShowExamples] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [copiedItemId, setCopiedItemId] = useState(null);
  const [songContext, setSongContext] = useState(null);
  const [currentCode, setCurrentCode] = useState('');
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showLiveCoding, setShowLiveCoding] = useState(false);
  const [showTrackContext, setShowTrackContext] = useState(false);
  const [showDocs, setShowDocs] = useState(false);
  const [showSoundLib, setShowSoundLib] = useState(false);

  // Chat prompt options
  const [useCodeContext, setUseCodeContext] = useState(true);
  const [useSongCtx, setUseSongCtx] = useState(true);
  const [codeOnly, setCodeOnly] = useState(false);
  const [autoAddToEditor, setAutoAddToEditor] = useState(false);
  const [showPromptOptions, setShowPromptOptions] = useState(false);

  const outputEndRef = useRef(null);
  const textareaRef = useRef(null);
  const { fontFamily } = useSettings();

  const scrollToBottom = () => {
    outputEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [output]);

  // Auto-resize textarea and keep cursor starting at the top
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [inputValue]);

  useEffect(() => {
    const apiKey = localStorage.getItem('openai_api_key');
    setAiEnabled(!!apiKey);
    // restore persisted chat
    try {
      const persisted = JSON.parse(localStorage.getItem('ai_chat_history') || '[]');
      if (Array.isArray(persisted) && persisted.length) setOutput(persisted);
    } catch {}
  }, []);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'openai_api_key') {
        setAiEnabled(!!e.newValue);
      }
      if (e.key === 'ai_chat_history' && e.newValue) {
        try { setOutput(JSON.parse(e.newValue)); } catch {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Get current code from editor
  useEffect(() => {
    const updateCurrentCode = () => {
      if (context?.editorRef?.current) {
        const editor = context.editorRef.current;
        if (editor.getCode) {
          setCurrentCode(editor.getCode());
        } else if (editor.repl && editor.repl.state) {
          setCurrentCode(editor.repl.state.code || '');
        }
      }
    };

    updateCurrentCode();
    const interval = setInterval(updateCurrentCode, 2000);

    return () => clearInterval(interval);
  }, [context]);

  const handleExecute = async () => {
    if (!inputValue.trim() || isLoading) return;

    const settingsHint = codeOnly
      ? 'Return only Strudel code. Do not include explanations.'
      : 'Return Strudel code in a fenced block followed by a short explanation.';

    const finalPrompt = `${inputValue}\n\n[assistant-settings]\n${settingsHint}`;

    const userInput = {
      id: Date.now(),
      type: 'input',
      content: inputValue,
      timestamp: new Date()
    };

    setOutput((prev) => {
      const next = [...prev, userInput];
      try {
        localStorage.setItem('ai_chat_history', JSON.stringify(next));
        setAiChatHistory(next);
      } catch {}
      return next;
    });
    setInputValue('');
    setIsLoading(true);

    try {
      const aiService = getAIService();
      const messages = buildOpenAIMessages(
        [...output, userInput],
        '',
        useSongCtx ? songContext : null,
        useCodeContext ? currentCode : null,
      );
      const response = await aiService.generateMusicPattern(finalPrompt, messages, useSongCtx ? songContext : null, useCodeContext ? currentCode : null);
      const resultOutput = {
        id: Date.now() + 1,
        type: 'output',
        content: response,
        timestamp: new Date()
      };
      setOutput((prev) => {
        const next = [...prev, resultOutput];
        try {
          localStorage.setItem('ai_chat_history', JSON.stringify(next));
          setAiChatHistory(next);
        } catch {}
        return next;
      });

      if (autoAddToEditor) {
        insertCodeIntoEditor(response, resultOutput.id);
      }
    } catch (error) {
      console.error('AI generation error:', error);
      const errorOutput = {
        id: Date.now() + 1,
        type: 'error',
        content: 'Error: Failed to generate response. Please try again.',
        timestamp: new Date()
      };
      setOutput((prev) => {
        const next = [...prev, errorOutput];
        try {
          localStorage.setItem('ai_chat_history', JSON.stringify(next));
          setAiChatHistory(next);
        } catch {}
        return next;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeCode = async () => {
    if (!currentCode.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const aiService = getAIService();
      const analysis = await aiService.analyzeCodeAndSuggest(currentCode, useSongCtx ? songContext : null);

      const analysisOutput = {
        id: Date.now(),
        type: 'output',
        content: `## Code Analysis\n\n${analysis}`,
        timestamp: new Date()
      };
      setOutput((prev) => [...prev, analysisOutput]);
    } catch (error) {
      console.error('Code analysis error:', error);
      const errorOutput = {
        id: Date.now(),
        type: 'error',
        content: 'Error: Failed to analyze code. Please try again.',
        timestamp: new Date()
      };
      setOutput((prev) => [...prev, errorOutput]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action) => {
    let prompt = '';
    switch (action) {
      case 'analyze':
        prompt = 'Analyze my current code and suggest improvements';
        break;
      case 'enhance':
        prompt = 'Enhance my current pattern with additional elements';
        break;
      case 'variation':
        prompt = 'Create a variation of my current pattern';
        break;
      case 'complement':
        prompt = 'Suggest a complementary pattern to layer with my current code';
        break;
      case 'optimize':
        prompt = 'Optimize my current code for better performance';
        break;
      default:
        prompt = action;
    }
    setInputValue(prompt);
    setShowQuickActions(false);
  };

  const insertCodeIntoEditor = (rawCode, itemId) => {
    if (!context?.editorRef?.current || !rawCode) return;
    const editor = context.editorRef.current;
    const cursorPos = editor.getCursorLocation();

    const cleanContent = sanitizeStrudelCode(rawCode);

    const change = { from: cursorPos, to: cursorPos, insert: cleanContent };
    editor.editor.dispatch({ changes: change });
    editor.setCursorLocation(cursorPos + cleanContent.length);
    setCopiedItemId(itemId);
    setTimeout(() => setCopiedItemId(null), 1000);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleExecute();
    }
  };

  const getOutputStyle = (type) => {
    switch (type) {
      case 'input':
        return 'text-gray-300 text-sm';
      case 'output':
        return 'text-sm';
      case 'error':
        return 'text-red-500 font-mono text-sm';
      case 'info':
        return 'text-gray-600 dark:text-gray-400 text-sm';
      default:
        return 'text-foreground text-sm';
    }
  };

  const renderOutput = (item) => {
    if (item.type === 'output') {
      return (
        <AIResult
          content={item.content}
          onAddToEditor={(code) => insertCodeIntoEditor(code, item.id)}
        />
      );
    }
    if (item.type === 'error') {
      return item.content;
    }
    return (
      <div className="rounded border border-gray-800 bg-transparent px-3 py-2 text-gray-300">
        {item.content}
      </div>
    );
  };

  const TogglePill = ({ active, onClick, children }) => (
    <button
      onClick={onClick}
      className={cx(
        'px-2 py-1 text-xs rounded-full border',
        active ? 'bg-blue-600 text-white border-blue-500' : 'bg-gray-800 text-gray-200 border-gray-700 hover:bg-gray-700'
      )}
    >
      {children}
    </button>
  );

  const Switch = ({ checked, onChange, label }) => (
    <label className="flex items-center justify-between py-2">
      <span className="text-sm text-gray-200">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={cx(
          'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
          checked ? 'bg-blue-600' : 'bg-gray-600'
        )}
      >
        <span
          className={cx(
            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow',
            checked ? 'translate-x-4' : 'translate-x-1'
          )}
        />
      </button>
    </label>
  );

  return (
    <div id="chat-tab" className="px-4 flex flex-col w-full h-full text-foreground" style={{ fontFamily }}>
      {/* Header Bar with inline panel toggles */}
      <div className="relative flex items-center justify-between mb-3 p-2 bg-transparent rounded-lg">
        <div className="flex items-center gap-2">
          <TogglePill active={showLiveCoding} onClick={() => setShowLiveCoding((v) => !v)}>Live Coding</TogglePill>
          <TogglePill active={showTrackContext} onClick={() => setShowTrackContext((v) => !v)}>Track</TogglePill>
          <TogglePill active={showDocs} onClick={() => setShowDocs((v) => !v)}>Docs</TogglePill>
          <TogglePill active={showSoundLib} onClick={() => setShowSoundLib((v) => !v)}>Sounds</TogglePill>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowQuickActions(!showQuickActions)}
            className={cx('px-2 py-1 text-xs rounded-full', aiEnabled ? 'bg-green-600 text-white hover:bg-green-500' : 'bg-gray-700 text-gray-300')}
            title="Quick Actions"
          >
            <Zap size={14} />
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1 text-gray-400 hover:text-gray-200 rounded-full"
            title="AI Settings"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* Quick Actions Panel */}
      {showQuickActions && (
        <div className="mb-4 p-3 bg-[#0d0f12] border border-gray-800 rounded-lg">
          <div className="text-sm font-medium text-gray-200 mb-2">Quick Actions</div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickAction('analyze')}
              className="flex items-center gap-2 p-2 text-xs bg-gray-800 text-gray-100 rounded-full border border-gray-700 hover:bg-gray-700"
            >
              <Code size={12} />
              <span>Analyze Code</span>
            </button>
            <button
              onClick={() => handleQuickAction('enhance')}
              className="flex items-center gap-2 p-2 text-xs bg-gray-800 text-gray-100 rounded-full border border-gray-700 hover:bg-gray-700"
            >
              <Music size={12} />
              <span>Enhance Pattern</span>
            </button>
            <button
              onClick={() => handleQuickAction('variation')}
              className="flex items-center gap-2 p-2 text-xs bg-gray-800 text-gray-100 rounded-full border border-gray-700 hover:bg-gray-700"
            >
              <Lightbulb size={12} />
              <span>Create Variation</span>
            </button>
            <button
              onClick={() => handleQuickAction('complement')}
              className="flex items-center gap-2 p-2 text-xs bg-gray-800 text-gray-100 rounded-full border border-gray-700 hover:bg-gray-700"
            >
              <HelpCircle size={12} />
              <span>Find Complement</span>
            </button>
          </div>
        </div>
      )}

      {showSettings && (
        <div className="mb-4">
          <AISettings />
        </div>
      )}

      {/* Conditional Panels */}
      {showLiveCoding && <LiveCodingContext />}
      {showTrackContext && <SongContext onContextChange={setSongContext} />}
      {showDocs && <DocumentationReference />}
      {showSoundLib && <SoundLibraryReference />}

      {/* Current Code Context Display */}
      {currentCode.trim() && (
        <div className="mb-4 p-3 bg-[#0d0f12] border border-gray-800 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-gray-200">Current Code Context</div>
            <button
              onClick={handleAnalyzeCode}
              disabled={isLoading}
              className="px-2 py-1 text-xs bg-purple-600 text-white rounded-full hover:bg-purple-500 disabled:opacity-50"
            >
              Analyze
            </button>
          </div>
          <div className="text-xs text-gray-400 font-mono bg-[#0d0f12] border border-gray-800 p-2 rounded max-h-20 overflow-y-auto">
            {currentCode.length > 160 ? `${currentCode.substring(0, 160)}...` : currentCode}
          </div>
        </div>
      )}

      {/* Output area */}
      <div className="flex-1 overflow-auto mb-4">
        <div className="space-y-3">
          {output.map((item) => (
            <div key={item.id} className={cx('flex-1', getOutputStyle(item.type))}>
              {renderOutput(item)}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center justify-center w-full py-2" aria-label="Loading">
              <svg width="56" height="18" viewBox="0 0 56 18" role="img" aria-hidden="true">
                <rect x="2" y="6" width="6" height="6" rx="3" fill="#60a5fa" opacity="0.9">
                  <animate attributeName="y" values="8;4;8" dur="1.2s" repeatCount="indefinite" />
                  <animate attributeName="height" values="4;10;4" dur="1.2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.6;1;0.6" dur="1.2s" repeatCount="indefinite" />
                </rect>
                <rect x="14" y="5" width="6" height="8" rx="3" fill="#60a5fa" opacity="0.9">
                  <animate attributeName="y" values="7;3;7" dur="1.2s" begin="0.15s" repeatCount="indefinite" />
                  <animate attributeName="height" values="6;12;6" dur="1.2s" begin="0.15s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.6;1;0.6" dur="1.2s" begin="0.15s" repeatCount="indefinite" />
                </rect>
                <rect x="26" y="4" width="6" height="10" rx="3" fill="#60a5fa" opacity="0.9">
                  <animate attributeName="y" values="6;2;6" dur="1.2s" begin="0.3s" repeatCount="indefinite" />
                  <animate attributeName="height" values="8;14;8" dur="1.2s" begin="0.3s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.6;1;0.6" dur="1.2s" begin="0.3s" repeatCount="indefinite" />
                </rect>
                <rect x="38" y="5" width="6" height="8" rx="3" fill="#60a5fa" opacity="0.9">
                  <animate attributeName="y" values="7;3;7" dur="1.2s" begin="0.45s" repeatCount="indefinite" />
                  <animate attributeName="height" values="6;12;6" dur="1.2s" begin="0.45s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.6;1;0.6" dur="1.2s" begin="0.45s" repeatCount="indefinite" />
                </rect>
                <rect x="50" y="6" width="6" height="6" rx="3" fill="#60a5fa" opacity="0.9">
                  <animate attributeName="y" values="8;4;8" dur="1.2s" begin="0.6s" repeatCount="indefinite" />
                  <animate attributeName="height" values="4;10;4" dur="1.2s" begin="0.6s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.6;1;0.6" dur="1.2s" begin="0.6s" repeatCount="indefinite" />
                </rect>
              </svg>
            </div>
          )}
        </div>
        <div ref={outputEndRef} />
      </div>

      {/* Input with icon-only Options */}
      <div className="p-2 bg-[#0d0f12] border border-gray-800 rounded-lg mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex gap-2">
            <div className="relative">
              <button
                onClick={() => setShowPromptOptions((v) => !v)}
                className="p-2 bg-gray-800 text-gray-100 rounded-full hover:bg-gray-700"
                title="Options"
              >
                <SlidersHorizontal size={16} />
              </button>
              {showPromptOptions && (
                <div className="absolute left-0 bottom-12 z-50 w-80 rounded-2xl bg-[#0b0d10] border border-gray-800 shadow-2xl p-4">
                  {/* Minimal floating options (no header/close) */}
                  <div className="space-y-3">
                    <Switch checked={useCodeContext} onChange={setUseCodeContext} label="Use code context" />
                    <Switch checked={useSongCtx} onChange={setUseSongCtx} label="Use track context" />
                    <Switch checked={codeOnly} onChange={setCodeOnly} label="Code only output" />
                    <Switch checked={autoAddToEditor} onChange={setAutoAddToEditor} label="Auto-add to editor" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-end gap-2">
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              rows={1}
              aria-label="AI prompt"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused?.(true)}
              onBlur={() => setIsFocused?.(false)}
              className={cx(
                'w-full resize-none px-3 py-3 bg-[#0d0f12] text-gray-100 placeholder-gray-500',
                'outline-none border-0 focus:outline-none focus:ring-0 focus:border-0 focus:shadow-none',
                'font-sans text-sm'
              )}
              style={{ overflow: 'hidden' }}
              placeholder={aiEnabled ? 'Ask for patterns, tweaks, or explanations…' : 'Explore sounds or patterns'}
            />
          </div>
          <button
            onClick={handleExecute}
            disabled={!inputValue.trim() || isLoading}
            className="p-1.5 rounded-full bg-transparent hover:bg-gray-800 text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Send (Enter)"
          >
            <ArrowUpCircle size={22} />
          </button>
        </div>
      </div>

      {/* Floating Prompt Options */}
      {/* anchored options panel handled above */}
    </div>
  );
} 