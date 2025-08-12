export function extractCodeAndExplanation(rawContent) {
  if (!rawContent) return { code: '', explanation: '' };
  const content = String(rawContent).trim();

  // Try to find fenced code block first
  const fenceMatch = content.match(/```[a-zA-Z]*\n([\s\S]*?)```/);
  if (fenceMatch) {
    const code = sanitizeStrudelCode(fenceMatch[1]);
    const explanation = content.replace(fenceMatch[0], '').trim();
    return { code, explanation };
  }

  // Try inline code
  const inlineMatch = content.match(/^`([\s\S]*?)`$/);
  if (inlineMatch) {
    return { code: sanitizeStrudelCode(inlineMatch[1]), explanation: '' };
  }

  // Heuristic: If it looks like Strudel code, treat all as code
  const looksLikeCode = /(\bs\(|\bnote\(|\bstack\(|\bsequence\(|\bchord\(|\bn\(|\bbank\(|\bscale\(|\bmode\(|\beuclid\()/m.test(content);
  if (looksLikeCode) {
    return { code: sanitizeStrudelCode(content), explanation: '' };
  }

  // Otherwise it's explanation only
  return { code: '', explanation: content };
}

export function sanitizeStrudelCode(rawCode) {
  if (!rawCode) return '';
  let code = String(rawCode)
    // strip surrounding backticks/spaces
    .replace(/^```[a-zA-Z]*\n/, '')
    .replace(/```$/, '')
    .replace(/^`|`$/g, '')
    .replace(/\r/g, '')
    .trim();

  // Trim trailing spaces on each line and collapse multiple blank lines
  code = code
    .split('\n')
    .map((line) => line.replace(/\s+$/g, ''))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n');

  // Remove accidental label prefixes like 'strudel', 'code:', etc
  code = code.replace(/^\s*(strudel|code|pattern)\s*:\s*/i, '');

  return code.trim();
}

export function summarizeToBullets(text, { maxBullets = 5, maxLen = 100 } = {}) {
  if (!text) return [];
  const raw = String(text)
    .replace(/\*\*|__/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const candidates = [];
  // Prefer lines starting with bullet markers
  raw.split(/\n+/).forEach((line) => {
    const m = line.match(/^(?:[-*•–]|\d+\.)\s*(.*)$/);
    if (m && m[1]) candidates.push(m[1].trim());
  });

  if (!candidates.length) {
    // Fallback: split by sentences
    raw.split(/(?<=[.!?])\s+/).forEach((s) => candidates.push(s.trim()));
  }

  const bullets = [];
  for (const c of candidates) {
    const item = c.replace(/^#+\s*/, '').replace(/`/g, '').replace(/\s*:\s*$/, '');
    if (!item) continue;
    const clipped = item.length > maxLen ? item.slice(0, maxLen - 1).trimEnd() + '…' : item;
    bullets.push(clipped);
    if (bullets.length >= maxBullets) break;
  }
  return bullets;
}
