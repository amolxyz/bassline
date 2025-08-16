import PlayCircleIcon from '@heroicons/react/20/solid/PlayCircleIcon';
import StopCircleIcon from '@heroicons/react/20/solid/StopCircleIcon';
import cx from '@src/cx.mjs';
import { useSettings, setIsZen, setActiveFooter as setTab, setIsPanelOpened } from '../../settings.mjs';
import { getAIService } from '../../services/aiService.js';
import '../Repl.css';

const { BASE_URL } = import.meta.env;
const baseNoTrailing = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;

export function Header({ context, embedded = false }) {
  const { started, pending, isDirty, activeCode, handleTogglePlay, handleEvaluate, handleShuffle, handleShare } =
    context;
  const isEmbedded = typeof window !== 'undefined' && (embedded || window.location !== window.parent.location);
  const { isZen, isButtonRowHidden, isCSSAnimationDisabled, fontFamily, activeFooter } = useSettings();

  // Lightweight command palette (Cmd/Ctrl+K)
  if (typeof window !== 'undefined') {
    window.__strudelCmdPalette__ ||= (() => {
      const el = document.createElement('div');
      el.id = 'cmdk-root';
      el.style.position = 'fixed';
      el.style.inset = '0';
      el.style.display = 'none';
      el.style.alignItems = 'flex-start';
      el.style.justifyContent = 'center';
      el.style.background = 'rgba(0,0,0,0.5)';
      el.style.zIndex = '1000';
      el.innerHTML = `
        <div style="margin-top:10vh; width:680px; max-width:92vw; background:#0b0d10; border:1px solid #30333b; border-radius:12px; box-shadow:0 10px 40px rgba(0,0,0,.5); overflow:hidden; font-family: Geist, Inter, system-ui, sans-serif;">
          <div style="display:flex; align-items:center; gap:8px; padding:10px 12px; border-bottom:1px solid #20232a;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M21 21l-4.35-4.35" stroke="#9aa1ad" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="11" cy="11" r="7" stroke="#9aa1ad" stroke-width="2"/></svg>
            <input id="cmdk-input" placeholder="Search docs, run actions, or ask AI…" style="flex:1; background:transparent; border:0; outline:0; box-shadow:none; -webkit-appearance:none; -moz-appearance:none; appearance:none; color:#e5e7eb; font-size:14px;" />
          </div>
          <div id="cmdk-results" style="max-height:50vh; overflow:auto"></div>
        </div>`;
      document.body.appendChild(el);
      const input = el.querySelector('#cmdk-input');
      const results = el.querySelector('#cmdk-results');
      const hide = () => { el.style.display = 'none'; input.value = ''; results.innerHTML = ''; };
      const show = () => { el.style.display = 'flex'; setTimeout(() => input.focus(), 0); };
      const actions = [
        { id: 'play', label: 'Play (Ctrl/Cmd+Enter)', run: () => context?.handleTogglePlay?.() },
        { id: 'eval', label: 'Evaluate (Ctrl/Cmd+Enter)', run: () => context?.handleEvaluate?.() },
        { id: 'stop', label: 'Stop (Alt+.)', run: () => context?.editorRef?.current?.stop?.() },
        { id: 'docs', label: 'Open Docs – Getting Started', run: () => window.open('https://strudel.cc/learn/getting-started/', '_blank') },
      ];
      let docIndexCache = null;
      async function search(query) {
        const q = String(query || '').toLowerCase();
        results.innerHTML = '';
        // Combine local actions + simple docs suggestions
        const items = [];
        actions.forEach((a) => { if (a.label.toLowerCase().includes(q)) items.push({ type: 'action', ...a }); });
        // Minimal offline doc suggestions from known Strudel primitives
        const docHints = [
          { label: 's("bd sd hh") – samples pattern', code: 's("bd sd hh")' },
          { label: 'note("c4 e4 g4") – note pattern', code: 'note("c4 e4 g4")' },
          { label: 'stack(...) – layer patterns', code: 'stack(\n  s("bd sd"),\n  note("c4 e4 g4")\n)' },
          { label: '.slow(2) – half speed', code: '.slow(2)' },
          { label: '.every(4, rev) – transform every 4 cycles', code: '.every(4, rev)' },
        ];
        docHints.forEach((h) => { if (h.label.toLowerCase().includes(q)) items.push({ type: 'snippet', ...h }); });

        // Rich function search from Strudel reference (doc.json)
        try {
          if (!docIndexCache) {
            // dynamic import to avoid adding to initial bundle
            const mod = await import('../../../../doc.json');
            const json = mod.default || mod;
            docIndexCache = Array.isArray(json?.docs) ? json.docs : [];
          }
          if (q.length >= 2 && docIndexCache.length) {
            const clip = (s, n = 100) => (s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s);
            const strip = (html) => String(html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
            const phraseMap = [
              { phrase: 'increase speed', target: 'fast' },
              { phrase: 'speed up', target: 'fast' },
              { phrase: 'decrease speed', target: 'slow' },
              { phrase: 'slow down', target: 'slow' },
              { phrase: 'half time', target: 'slow' },
              { phrase: 'double time', target: 'fast' },
            ];
            let boosted = null;
            for (const { phrase, target } of phraseMap) {
              if (q.includes(phrase)) { boosted = target; break; }
            }
            docIndexCache.forEach((d) => {
              const name = String(d.name || '');
              if (!name) return;
              const desc = strip(d.description || '');
              const hay = [
                name.toLowerCase(),
                String(d.synonyms_text || '').toLowerCase(),
                ...(Array.isArray(d.synonyms) ? d.synonyms.map((s) => String(s).toLowerCase()) : []),
                desc.toLowerCase(),
              ].join(' ');
              if (hay.includes(q) || (boosted && name.toLowerCase() === boosted)) {
                items.push({
                  type: 'doc',
                  name,
                  label: `${name} — ${clip(desc || 'function')}`,
                });
              }
            });
          }
        } catch (err) {
          // ignore doc loading errors silently
        }
        // AI quick action (prefix with '?' or 'ai ')
        const wantsAI = q.startsWith('?') || q.startsWith('ai ');
        const aiQuery = wantsAI ? (q.startsWith('?') ? q.slice(1).trim() : q.slice(3).trim()) : '';
        if (wantsAI && aiQuery) {
          items.unshift({ type: 'ai', label: `Ask AI → ${aiQuery}`, query: aiQuery });
        }
        // Render
        if (!items.length) {
          results.innerHTML = `<div style="padding:12px; color:#9aa1ad; font-size:13px;">No matches. Try typing ‘s(”bd sd”)’ or ‘every’.</div>`;
          return;
        }
        items.slice(0, 30).forEach((it) => {
          const row = document.createElement('div');
          row.style.padding = '10px 12px';
          row.style.cursor = 'pointer';
          row.style.color = '#e5e7eb';
          row.style.fontSize = '14px';
          row.style.borderBottom = '1px solid #171a1f';
          row.addEventListener('mouseenter', () => (row.style.background = '#111318'));
          row.addEventListener('mouseleave', () => (row.style.background = 'transparent'));
          row.addEventListener('click', async () => {
            if (it.type === 'action') {
              it.run?.();
            } else if (it.type === 'snippet') {
              const ed = context?.editorRef?.current;
              if (ed) {
                const pos = ed.getCursorLocation();
                ed.editor.dispatch({ changes: { from: pos, to: pos, insert: it.code } });
                ed.setCursorLocation(pos + it.code.length);
              }
            } else if (it.type === 'doc') {
              try {
                // Open the in-app Reference panel for deeper reading
                setTab?.('reference');
                setIsPanelOpened?.(true);
              } catch {}
            } else if (it.type === 'ai') {
              const ed = context?.editorRef?.current;
              const ai = getAIService();
              try {
                const currentCode = ed?.getCode?.() || '';
                const answer = await ai.generateMusicPattern(it.query, [], null, currentCode);
                if (ed && answer) {
                  const pos = ed.getCursorLocation();
                  ed.editor.dispatch({ changes: { from: pos, to: pos, insert: answer } });
                  ed.setCursorLocation(pos + String(answer).length);
                }
              } catch (e) {
                console.warn('AI command failed', e);
                // Check if it's an API key error and show a helpful message
                if (e.message && e.message.includes('OpenAI API key not configured')) {
                  // Show a toast-like notification
                  const toast = document.createElement('div');
                  toast.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #dc2626;
                    color: white;
                    padding: 12px 16px;
                    border-radius: 8px;
                    font-size: 14px;
                    z-index: 10000;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                    max-width: 300px;
                  `;
                  toast.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span>🔑</span>
                      <div>
                        <div style="font-weight: 500;">API Key Required</div>
                        <div style="font-size: 12px; opacity: 0.9;">To use AI features for music creation, add your OpenAI API key</div>
                      </div>
                    </div>
                  `;
                  document.body.appendChild(toast);
                  
                  // Auto-remove after 5 seconds
                  setTimeout(() => {
                    if (toast.parentNode) {
                      toast.parentNode.removeChild(toast);
                    }
                  }, 5000);
                }
              }
            }
            hide();
          });
          row.textContent = it.label;
          results.appendChild(row);
        });
      }
      input.addEventListener('input', (e) => search(e.target.value));
      input.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter') {
          const val = input.value.trim();
          if (val.startsWith('?') || val.toLowerCase().startsWith('ai ')) {
            const q = val.startsWith('?') ? val.slice(1).trim() : val.slice(3).trim();
            if (q) {
              const ed = context?.editorRef?.current;
              const ai = getAIService();
              try {
                const currentCode = ed?.getCode?.() || '';
                const answer = await ai.generateMusicPattern(q, [], null, currentCode);
                if (ed && answer) {
                  const pos = ed.getCursorLocation();
                  ed.editor.dispatch({ changes: { from: pos, to: pos, insert: answer } });
                  ed.setCursorLocation(pos + String(answer).length);
                }
              } catch (err) {
                console.warn('AI error', err);
                // Check if it's an API key error and show a helpful message
                if (err.message && err.message.includes('OpenAI API key not configured')) {
                  // Show a toast-like notification
                  const toast = document.createElement('div');
                  toast.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #dc2626;
                    color: white;
                    padding: 12px 16px;
                    border-radius: 8px;
                    font-size: 14px;
                    z-index: 10000;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                    max-width: 300px;
                  `;
                  toast.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span>🔑</span>
                      <div>
                        <div style="font-weight: 500;">API Key Required</div>
                        <div style="font-size: 12px; opacity: 0.9;">To use AI features for music creation, add your OpenAI API key</div>
                      </div>
                    </div>
                  `;
                  document.body.appendChild(toast);
                  
                  // Auto-remove after 5 seconds
                  setTimeout(() => {
                    if (toast.parentNode) {
                      toast.parentNode.removeChild(toast);
                    }
                  }, 5000);
                }
              }
              hide();
            }
          }
        }
      });
      el.addEventListener('keydown', (e) => { if (e.key === 'Escape') hide(); });
      return { show, hide, search };
    })();
    // hotkey
    const onKey = (e) => {
      const isMod = e.metaKey || e.ctrlKey;
      if (isMod && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        window.__strudelCmdPalette__.show();
      }
    };
    window.removeEventListener('keydown', onKey);
    window.addEventListener('keydown', onKey);
  }

  return (
    <header
      id="header"
      className={cx(
        'flex-none text-black  z-[100] text-lg select-none h-20 md:h-14',
        !isZen && !isEmbedded && 'bg-lineHighlight',
        isZen ? 'h-12 w-8 fixed top-0 left-0' : 'sticky top-0 w-full py-1 justify-between',
        isEmbedded ? 'flex' : 'md:flex',
      )}
      style={{ fontFamily }}
    >
      <div className="px-4 flex space-x-2 md:pt-0 select-none">
        <h1
          onClick={() => {
            if (isEmbedded) window.open(window.location.href.replace('embed', ''));
          }}
          className={cx(
            isEmbedded ? 'text-l cursor-pointer' : 'text-xl',
            'text-foreground font-bold flex space-x-2 items-center',
          )}
        >
          {!isZen && (
            <div className="space-x-2 ml-2 flex items-center">
              <img src="/logo.svg" alt="Bassline Logo" className="w-5 h-5 flex-shrink-0" />
              <span className="text-[1.1rem] font-extrabold tracking-tight flex items-center" style={{ fontFamily: 'Quando, serif', color: '#F5F5F5' }}>bassline</span>
              {!isEmbedded && isButtonRowHidden && (
                <a href={`${baseNoTrailing}/learn`} className="text-sm opacity-25 font-medium">
                  DOCS
                </a>
              )}
            </div>
          )}
        </h1>
      </div>
      
      <div className="flex items-center space-x-2 px-4">
        {/* Main navigation moved to header */}
        {!isEmbedded && (
          <div className="hidden md:flex items-center space-x-2 mr-2">
            {[
              { label: 'Tracks', tab: 'patterns' },
              { label: 'Sounds', tab: 'sounds' },
              { label: 'Chat', tab: 'chat' },
              { label: 'Reference', tab: 'reference' },
              { label: 'Console', tab: 'console' },
              { label: 'Settings', tab: 'settings' },
            ].map(({ label, tab }) => (
              <button
                key={tab}
                onClick={() => { setTab(tab); setIsPanelOpened(true); }}
                className={
                  (activeFooter === tab
                    ? 'bg-[#f5f5f5] text-gray-900'
                    : 'bg-gray-700 text-white hover:bg-gray-600') +
                                      ' h-8 px-4 text-sm cursor-pointer flex items-center rounded-full font-semibold'
                }
                style={{ fontFamily: 'Geist, sans-serif' }}
              >
                {label}
              </button>
            ))}
          </div>
        )}
        {!isEmbedded && (
          <button
            title="share"
            className={cx(
              'cursor-pointer hover:opacity-50 flex items-center space-x-1 p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors',
            )}
            onClick={handleShare}
          >
            <svg className="w-5 h-5" fill="none" stroke="#F5F5F5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
          </button>
        )}
      </div>
    </header>
  );
}
