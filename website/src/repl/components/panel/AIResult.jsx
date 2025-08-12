import { useMemo } from 'react';
import { Copy, Plus, Check, ExternalLink } from 'lucide-react';
import { extractCodeAndExplanation, summarizeToBullets } from '../../../utils/aiFormat.js';
import { useState } from 'react';

export default function AIResult({ content, onAddToEditor }) {
  const { code, explanation } = useMemo(() => extractCodeAndExplanation(content), [content]);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  // Minimal Markdown renderer for headings, lists, bold/italics
  const renderSimpleMarkdown = (md) => {
    if (!md) return '';
    const escapeHtml = (s) =>
      String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    const renderInline = (s) => {
      let out = escapeHtml(s);
      out = out.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/__(.+?)__/g, '<strong>$1</strong>');
      out = out.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>').replace(/_(.+?)_/g, '<em>$1</em>');
      return out;
    };

    const lines = String(md).split(/\n+/);
    const html = [];
    let inList = false;
    const closeList = () => {
      if (inList) {
        html.push('</ul>');
        inList = false;
      }
    };

    for (let raw of lines) {
      const line = raw.trimEnd();
      if (!line.trim()) {
        closeList();
        continue;
      }
      const h = line.match(/^(#{1,6})\s+(.*)$/);
      if (h) {
        closeList();
        const level = h[1].length;
        html.push(`<h${level}>${renderInline(h[2])}</h${level}>`);
        continue;
      }
      if (/^[-*•–]\s+/.test(line)) {
        if (!inList) {
          html.push('<ul class="list-disc list-inside space-y-1">');
          inList = true;
        }
        const item = line.replace(/^[-*•–]\s+/, '');
        html.push(`<li>${renderInline(item)}</li>`);
        continue;
      }
      closeList();
      html.push(`<p>${renderInline(line)}</p>`);
    }
    closeList();
    return html.join('\n');
  };

  return (
    <div>
      {/* Code card */}
      <div className="rounded-xl bg-gradient-to-b from-gray-700/40 to-gray-900/60 p-[1px] shadow-[0_10px_30px_-12px_rgba(0,0,0,0.6)]">
        <div className="rounded-xl overflow-hidden bg-[#0b0d10] border border-gray-800">
          {code && (
            <div className="bg-gradient-to-r from-[#0c0f14] to-[#0f1319]">
              <div className="flex items-center justify-between px-3 py-2 border-b border-gray-800 text-xs text-gray-400 uppercase tracking-wider">
                Suggested Pattern
                <div className="flex items-center gap-2">
                  <button onClick={handleCopy} title="Copy code" className="px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-200">
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                  {onAddToEditor && (
                    <button onClick={() => onAddToEditor(code)} title="Add to editor" className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white">
                      <Plus size={14} />
                    </button>
                  )}
                </div>
              </div>
              <pre className="m-0 p-3 text-sm text-gray-200 overflow-auto leading-6">
                <code>{code}</code>
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Explanation below the component, styled with Geist */}
      {(explanation && explanation.trim().length > 0) && (
        <div
          className="mt-3 text-gray-300"
          style={{
            fontFamily:
              'Geist, ui-sans-serif, system-ui, -apple-system, \"Segoe UI\", Roboto, Helvetica, Arial, \"Apple Color Emoji\", \"Segoe UI Emoji\"'
          }}
        >
          <div
            className="text-xs leading-relaxed prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: renderSimpleMarkdown(explanation) }}
          />
          <div className="mt-3 text-xs text-blue-400 flex items-center gap-3">
            <a href="https://strudel.cc/learn" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:underline">
              <ExternalLink size={12} /> Docs
            </a>
            <a href="https://strudel.cc/learn/mininotation" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:underline">
              <ExternalLink size={12} /> Mini-notation
            </a>
            <a href="https://strudel.cc/functions" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:underline">
              <ExternalLink size={12} /> Function reference
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
