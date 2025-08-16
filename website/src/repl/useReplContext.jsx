/*
Repl.jsx - <short description TODO>
Copyright (C) 2022 Strudel contributors - see <https://codeberg.org/uzu/strudel/src/branch/main/repl/src/App.js>
This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version. This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details. You should have received a copy of the GNU Affero General Public License along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { code2hash, getPerformanceTimeSeconds, logger, silence } from '@strudel/core';
import { getDrawContext } from '@strudel/draw';
import { transpiler } from '@strudel/transpiler';
import {
  getAudioContextCurrentTime,
  webaudioOutput,
  resetGlobalEffects,
  resetLoadedSounds,
  initAudioOnFirstClick,
} from '@strudel/webaudio';
import { setVersionDefaultsFrom } from './util.mjs';
import { StrudelMirror, defaultSettings } from '@strudel/codemirror';
import { clearHydra } from '@strudel/hydra';
import { useCallback, useEffect, useRef, useState } from 'react';
import { parseBoolean, settingsMap, useSettings } from '../settings.mjs';
import {
  setActivePattern,
  setLatestCode,
  createPatternID,
  userPattern,
  getViewingPatternData,
  setViewingPatternData,
} from '../user_pattern_utils.mjs';
import { superdirtOutput } from '@strudel/osc/superdirtoutput';
import { audioEngineTargets } from '../settings.mjs';
import { useStore } from '@nanostores/react';
import { prebake } from './prebake.mjs';
import { getRandomTune, initCode, loadModules, shareCode } from './util.mjs';
import './Repl.css';
import { setInterval, clearInterval } from 'worker-timers';
import { getMetadata } from '../metadata_parser';

const { latestCode, maxPolyphony, audioDeviceName, multiChannelOrbits } = settingsMap.get();
let modulesLoading, presets, drawContext, clearCanvas, audioReady;

if (typeof window !== 'undefined') {
  audioReady = initAudioOnFirstClick({
    maxPolyphony,
    audioDeviceName,
    multiChannelOrbits: parseBoolean(multiChannelOrbits),
  });
  modulesLoading = loadModules();
  presets = prebake();
  drawContext = getDrawContext();
  clearCanvas = () => drawContext.clearRect(0, 0, drawContext.canvas.height, drawContext.canvas.width);
}

async function getModule(name) {
  if (!modulesLoading) {
    return;
  }
  const modules = await modulesLoading;
  return modules.find((m) => m.packageName === name);
}

const initialCode = `// LOADING`;

export function useReplContext() {
  const { isSyncEnabled, audioEngineTarget } = useSettings();
  const shouldUseWebaudio = audioEngineTarget !== audioEngineTargets.osc;
  const defaultOutput = shouldUseWebaudio ? webaudioOutput : superdirtOutput;
  const getTime = shouldUseWebaudio ? getAudioContextCurrentTime : getPerformanceTimeSeconds;

  // Dark mode only; theme is initialized by editor

  const init = useCallback(() => {
    const drawTime = [-2, 2];
    const drawContext = getDrawContext();
    const editor = new StrudelMirror({
      sync: isSyncEnabled,
      defaultOutput,
      getTime,
      setInterval,
      clearInterval,
      transpiler,
      autodraw: false,
      root: containerRef.current,
      initialCode,
      pattern: silence,
      drawTime,
      drawContext,
      prebake: async () => Promise.all([modulesLoading, presets]),
      onInlineAI: async () => {
        try {
          const { getAIService } = await import('../services/aiService.js');
          const ai = getAIService();
          const currentCode = editor?.getCode?.() || '';
          // Create inline floating input at cursor
          const pos = editor.getCursorLocation();
          const coords = editor.editor.coordsAtPos(pos);
          if (!coords) return;
          
          const inputEl = document.createElement('div');
          inputEl.style.cssText = `
            position: absolute;
            left: ${coords.left}px;
            top: ${coords.bottom + 5}px;
            z-index: 1000;
            background: #0b0d10;
            border: 1px solid #30333b;
            border-radius: 8px;
            padding: 8px 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
            font-family: inherit;
            min-width: 300px;
          `;
          
          const input = document.createElement('input');
          input.style.cssText = `
            background: transparent;
            border: 0;
            outline: 0;
            color: #e5e7eb;
            font-size: 14px;
            width: 100%;
            font-family: inherit;
            box-shadow: none;
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
          `;
          input.placeholder = 'Ask AI for code...';
          let isGenerating = false;
          
          const handleSubmit = async () => {
            const prompt = input.value.trim();
            if (!prompt) return;
            
            try {
              input.disabled = true;
              input.placeholder = 'Generating...';
              isGenerating = true;
              
              // Show loading state
              const loadingEl = document.createElement('div');
              loadingEl.style.cssText = `
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 8px;
                z-index: 1;
              `;
              loadingEl.innerHTML = `
                <div style="color: #60a5fa; font-size: 12px; display: flex; align-items: center; gap: 8px;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" opacity="0.25"/>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <animateTransform attributeName="transform" type="rotate" dur="1s" values="0 12 12;360 12 12" repeatCount="indefinite"/>
                    </path>
                  </svg>
                  Generating code...
                </div>
              `;
              inputEl.appendChild(loadingEl);
              
              // Get current selection and cursor position
              const selection = editor.editor.state.selection;
              const hasSelection = selection.main.from !== selection.main.to;
              const currentPos = editor.getCursorLocation();
              const currentLine = editor.editor.state.doc.lineAt(currentPos);
              const lineText = currentLine.text;
              const lineNumber = currentLine.number;
              
              // Build context-aware prompt
              const contextPrompt = `You are modifying existing Strudel code. \n\n${hasSelection ? `Selected code: ${editor.editor.state.doc.sliceString(selection.main.from, selection.main.to)}` : `Current line ${lineNumber}: ${lineText}`}\nCursor position: ${currentPos - currentLine.from}\n\nUser request: ${prompt}\n\nGuidelines:\n- If request modifies an existing value/effect, return ONLY the replacement line/chain.\n- If request adds an instrument/voice, return a COMPLETE single-line Strudel pattern (e.g., s(\"bd sd\").bank(\"tr909\").gain(0.4) or note(\"c4 e4 g4\").s(\"piano\").gain(0.3)).\n- The result must be valid Strudel code with correct syntax.\n- No explanations, no markdown, only code.`;

              const result = await ai.generateInlineCode(contextPrompt, currentCode);
              if (result) {
                // Extract only the code, removing any explanations
                let cleanCode = String(result).trim();
                
                // Remove markdown code blocks if present
                cleanCode = cleanCode.replace(/```[a-zA-Z]*\n?/g, '').replace(/```$/g, '');
                
                // Remove any explanatory text after the code
                const lines = cleanCode.split('\n');
                const codeLines = [];
                let inCode = false;
                
                for (const line of lines) {
                  const trimmed = line.trim();
                  // Skip empty lines and markdown
                  if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('//')) continue;
                  
                  // If we hit explanatory text, stop
                  if (trimmed.startsWith('This') || trimmed.startsWith('The') || 
                      trimmed.startsWith('You can') || trimmed.startsWith('Try') ||
                      trimmed.includes('explanation') || trimmed.includes('example')) {
                    break;
                  }
                  
                  // Check if this looks like Strudel code
                  if (trimmed.includes('(') || trimmed.includes('.') || 
                      trimmed.includes('"') || trimmed.includes("'") ||
                      /^[a-zA-Z_$]/.test(trimmed) || /^[0-9]/.test(trimmed)) {
                    codeLines.push(trimmed);
                    inCode = true;
                  } else if (inCode && trimmed) {
                    // Continue if we're already in code section
                    codeLines.push(trimmed);
                  }
                }
                
                const finalCode = codeLines.join('\n');
                
                if (finalCode && finalCode.trim()) {
                  if (hasSelection) {
                    // Replace selected text
                    editor.editor.dispatch({ 
                      changes: { from: selection.main.from, to: selection.main.to, insert: finalCode } 
                    });
                    editor.setCursorLocation(selection.main.from + finalCode.length);
                    editor.editor.focus();
                  } else {
                    // Determine if we should replace the current line or insert new code
                    const isModification = prompt.toLowerCase().includes('increase') || 
                                         prompt.toLowerCase().includes('decrease') || 
                                         prompt.toLowerCase().includes('change') ||
                                         prompt.toLowerCase().includes('modify');
                    
                    if (isModification && finalCode.includes('.attack(')) {
                      // Replace the current line with the modified version
                      const lineStart = currentLine.from;
                      const lineEnd = currentLine.from + currentLine.text.length;
                      editor.editor.dispatch({ 
                        changes: { from: lineStart, to: lineEnd, insert: finalCode } 
                      });
                      editor.setCursorLocation(lineStart + finalCode.length);
                      editor.editor.focus();
                    } else {
                      // Insert new code at cursor position
                      editor.editor.dispatch({ 
                        changes: { from: currentPos, to: currentPos, insert: finalCode } 
                      });
                      editor.setCursorLocation(currentPos + finalCode.length);
                      editor.editor.focus();
                    }
                  }
                  // Close immediately after successful insertion
                  isGenerating = false;
                  editor.editor.focus();
                  if (document.body.contains(inputEl)) {
                    document.body.removeChild(inputEl);
                  }
                  return; // Exit after success
                }
              }
              // If we reach here, no valid code. Reset UI but keep input open
              isGenerating = false;
              if (loadingEl.parentNode) inputEl.removeChild(loadingEl);
              input.disabled = false;
              input.placeholder = 'Ask AI for code...';
            } catch (e) {
              console.warn('Inline AI failed', e);
              // Show error state briefly
              isGenerating = false;
              input.placeholder = 'Error - try again';
              // Remove loading, keep input open for retry
              const overlay = inputEl.querySelector('div');
              if (overlay && overlay.parentNode === inputEl) inputEl.removeChild(overlay);
              input.disabled = false;
            }
          };
          
          const handleKeyDown = (e) => {
            if (e.key === 'Enter') {
              handleSubmit();
            } else if (e.key === 'Escape') {
              if (!isGenerating && document.body.contains(inputEl)) {
                document.body.removeChild(inputEl);
              }
            }
          };
          
          input.addEventListener('keydown', handleKeyDown);
          input.addEventListener('blur', () => {
            if (!isGenerating && document.body.contains(inputEl)) {
              document.body.removeChild(inputEl);
            }
          });
          
          inputEl.appendChild(input);
          document.body.appendChild(inputEl);
          input.focus();
          input.select();
        } catch (e) {
          console.warn('Inline AI failed', e);
        }
      },
      onUpdateState: (state) => {
        setReplState({ ...state });
      },
      onToggle: (playing) => {
        if (!playing) {
          clearHydra();
        }
      },
      beforeEval: () => audioReady,
      afterEval: (all) => {
        const { code } = all;
        //post to iframe parent (like Udels) if it exists...
        window.parent?.postMessage(code);

        setLatestCode(code);
        window.location.hash = '#' + code2hash(code);
        setDocumentTitle(code);
        const viewingPatternData = getViewingPatternData();
        setVersionDefaultsFrom(code);
        const data = { ...viewingPatternData, code };
        let id = data.id;
        const isExamplePattern = viewingPatternData.collection !== userPattern.collection;

        if (isExamplePattern) {
          const codeHasChanged = code !== viewingPatternData.code;
          if (codeHasChanged) {
            // fork example
            const newPattern = userPattern.duplicate(data);
            id = newPattern.id;
            setViewingPatternData(newPattern.data);
          }
        } else {
          id = userPattern.isValidID(id) ? id : createPatternID();
          setViewingPatternData(userPattern.update(id, data).data);
        }
        setActivePattern(id);
      },
      bgFill: false,
    });
    window.strudelMirror = editor;

    // init settings
    initCode().then(async (decoded) => {
      let code, msg;
      if (decoded) {
        code = decoded;
        msg = `I have loaded the code from the URL.`;
      } else if (latestCode) {
        code = latestCode;
        msg = `Your last session has been loaded!`;
      } else {
        /* const { code: randomTune, name } = await getRandomTune();
        code = randomTune; */
        code = '$: s("[bd <hh oh>]*2").bank("tr909").dec(.4)';
        msg = `Default code has been loaded`;
      }
      editor.setCode(code);
      setDocumentTitle(code);
      logger(`Welcome to Strudel! ${msg} Press play or hit ctrl+enter to run it!`, 'highlight');
    });

    editorRef.current = editor;
  }, []);

  const [replState, setReplState] = useState({});
  const { started, isDirty, error, activeCode, pending } = replState;
  const editorRef = useRef();
  const containerRef = useRef();

  // this can be simplified once SettingsTab has been refactored to change codemirrorSettings directly!
  // this will be the case when the main repl is being replaced
  const _settings = useStore(settingsMap, { keys: Object.keys(defaultSettings) });
  useEffect(() => {
    let editorSettings = {};
    Object.keys(defaultSettings).forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(_settings, key)) {
        editorSettings[key] = _settings[key];
      }
    });
    editorRef.current?.updateSettings(editorSettings);
  }, [_settings]);

  //
  // UI Actions
  //

  const setDocumentTitle = (code) => {
    const meta = getMetadata(code);
    document.title = (meta.title ? `${meta.title} - ` : '') + 'Bassline';
  };

  const handleTogglePlay = async () => {
    editorRef.current?.toggle();
  };

  const resetEditor = async () => {
    (await getModule('@strudel/tonal'))?.resetVoicings();
    resetGlobalEffects();
    clearCanvas();
    clearHydra();
    resetLoadedSounds();
    editorRef.current.repl.setCps(0.5);
    await prebake(); // declare default samples
  };

  const handleUpdate = async (patternData, reset = false) => {
    setViewingPatternData(patternData);
    editorRef.current.setCode(patternData.code);
    if (reset) {
      await resetEditor();
      handleEvaluate();
    }
  };

  const handleEvaluate = () => {
    editorRef.current.evaluate();
  };
  const handleShuffle = async () => {
    const patternData = await getRandomTune();
    const code = patternData.code;
    logger(`[repl] ✨ loading random tune "${patternData.id}"`);
    setActivePattern(patternData.id);
    setViewingPatternData(patternData);
    await resetEditor();
    editorRef.current.setCode(code);
    editorRef.current.repl.evaluate(code);
  };

  const handleShare = async () => shareCode(replState.code);
  const context = {
    started,
    pending,
    isDirty,
    activeCode,
    handleTogglePlay,
    handleUpdate,
    handleShuffle,
    handleShare,
    handleEvaluate,
    init,
    error,
    editorRef,
    containerRef,
  };
  return context;
}
