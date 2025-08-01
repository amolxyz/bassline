import cx from '@src/cx.mjs';

export function ButtonGroup({ value, onChange, items }) {
  return (
    <div className="flex max-w-lg space-x-1">
      {Object.entries(items).map(([key, label], i, arr) => (
        <button
          key={key}
          id={key}
          onClick={() => onChange(key)}
          className={cx(
            'px-3 h-8 whitespace-nowrap rounded-md transition-colors',
            value === key 
              ? 'bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white' 
              : 'bg-gray-500 dark:bg-gray-700 text-white hover:bg-gray-400 dark:hover:bg-gray-600',
          )}
        >
          {label.toLowerCase()}
        </button>
      ))}
    </div>
  );
}
