import jsdoc from '../../doc.json';
// import { javascriptLanguage } from '@codemirror/lang-javascript';
import { autocompletion, snippetCompletion } from '@codemirror/autocomplete';
import { h } from './html';

function plaintext(str) {
  const div = document.createElement('div');
  div.innerText = str;
  return div.innerHTML;
}

const getDocLabel = (doc) => doc.name || doc.longname;
const getInnerText = (html) => {
  var div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
};

export function Autocomplete({ doc, label }) {
  return h`<div class="prose dark:prose-invert max-h-[400px] overflow-auto p-2">
<h1 class="pt-0 mt-0">${label || getDocLabel(doc)}</h1>
${doc.description}
<ul>
  ${doc.params?.map(
    ({ name, type, description }) =>
      `<li>${name} : ${type.names?.join(' | ')} ${description ? ` - ${getInnerText(description)}` : ''}</li>`,
  )}
</ul>
<div>
  ${doc.examples?.map((example) => `<div><pre>${plaintext(example)}</pre></div>`)}
</div>
</div>`[0];
  /*
<pre
className="cursor-pointer"
onMouseDown={(e) => {
  console.log('ola!');
  navigator.clipboard.writeText(example);
  e.stopPropagation();
}}
>
{example}
</pre>
*/
}

// Build completions from generated documentation
const jsdocCompletions = jsdoc.docs
  .filter(
    (doc) =>
      getDocLabel(doc) &&
      !getDocLabel(doc).startsWith('_') &&
      !['package'].includes(doc.kind) &&
      !['superdirtOnly', 'noAutocomplete'].some((tag) => doc.tags?.find((t) => t.originalTitle === tag)),
  )
  // https://codemirror.net/docs/ref/#autocomplete.Completion
  .map((doc) /*: Completion */ => ({
    label: getDocLabel(doc),
    // detail: 'xxx', // An optional short piece of information to show (with a different style) after the label.
    info: () => Autocomplete({ doc }),
    type: 'function', // https://codemirror.net/docs/ref/#autocomplete.Completion.type
    // Prefer inserting an example snippet when one is available
    apply:
      doc.examples && doc.examples[0]
        ? String(doc.examples[0])
        : getDocLabel(doc),
  }));

// Curated snippets commonly used in Strudel patterns
const curatedSnippets = [
  snippetCompletion('s("${samples}")', {
    label: 's("…")',
    detail: 'sample pattern',
    type: 'function',
  }),
  snippetCompletion('note("${notes}")', {
    label: 'note("…")',
    detail: 'note pattern',
    type: 'function',
  }),
  snippetCompletion('stack(\n  ${p1},\n  ${p2}\n)', {
    label: 'stack(...)',
    detail: 'layer patterns',
    type: 'function',
  }),
  snippetCompletion('.gain(${0.8})', { label: '.gain()', type: 'property' }),
  snippetCompletion('.cutoff(${400})', { label: '.cutoff()', type: 'property' }),
  snippetCompletion('.slow(${2})', { label: '.slow()', type: 'property' }),
  snippetCompletion('.fast(${2})', { label: '.fast()', type: 'property' }),
  snippetCompletion('.every(${4}, ${fn})', { label: '.every()', type: 'property' }),
];

export const strudelAutocomplete = (context /* : CompletionContext */) => {
  let word = context.matchBefore(/\w*/);
  if (word.from == word.to && !context.explicit) return null;
  return {
    from: word.from,
    // Offer snippets first, followed by docs-based suggestions
    options: [...curatedSnippets, ...jsdocCompletions],
    /*     options: [
      { label: 'match', type: 'keyword' },
      { label: 'hello', type: 'variable', info: '(World)' },
      { label: 'magic', type: 'text', apply: '⠁⭒*.✩.*⭒⠁', detail: 'macro' },
    ], */
  };
};

export function isAutoCompletionEnabled(on) {
  return on
    ? [
        autocompletion({ override: [strudelAutocomplete] }),
        //javascriptLanguage.data.of({ autocomplete: strudelAutocomplete }),
      ]
    : []; // autocompletion({ override: [] })
}
