import PlayCircleIcon from '@heroicons/react/20/solid/PlayCircleIcon';
import StopCircleIcon from '@heroicons/react/20/solid/StopCircleIcon';
import cx from '@src/cx.mjs';
import { useSettings } from '../../settings.mjs';

export function ReplFooter({ context, embedded = false }) {
  const { started, pending, isDirty, activeCode, handleTogglePlay, handleEvaluate, handleShuffle, handleShare } =
    context;
  const isEmbedded = typeof window !== 'undefined' && (embedded || window.location !== window.parent.location);
  const { isZen, isButtonRowHidden, isCSSAnimationDisabled, fontFamily } = useSettings();

  if (isZen || isButtonRowHidden || isEmbedded) {
    return null;
  }

  return (
    <footer
      className="flex-none bg-lineHighlight text-foreground px-4 py-2 flex justify-between items-center"
      style={{
        fontFamily:
          'Geist, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
      }}
    >
      {/* Play/Update buttons on the left */}
      <div className="flex max-w-full overflow-auto text-foreground px-1 md:px-2">
        <button
          onClick={handleTogglePlay}
          title={started ? 'stop' : 'play'}
          className={cx(
            'p-2',
            'hover:opacity-50',
            !started && !isCSSAnimationDisabled && 'animate-pulse',
          )}
        >
          {!pending ? (
            <span className={cx('flex items-center space-x-2 font-medium')}>
              {started ? <StopCircleIcon className="w-6 h-6" /> : <PlayCircleIcon className="w-6 h-6" />}
              <span>{started ? 'stop' : 'play'}</span>
            </span>
          ) : (
            <>loading...</>
          )}
        </button>
                  <button
            onClick={handleEvaluate}
            title="update"
            className={cx(
              'flex items-center space-x-1 font-medium',
              'p-2',
              !isDirty || !activeCode ? 'opacity-50' : 'hover:opacity-50',
            )}
          >
            <span>update</span>
          </button>
          <a
            title="design"
            href="https://www.figma.com/design/T1dbKhHTW59S4VzR6Enfkk/bassline?node-id=46-2&t=iUoxe3KwOJ4gBzBH-1"
            target="_blank"
            rel="noopener noreferrer"
            className={cx('hover:opacity-50 flex items-center space-x-1 p-2 font-medium')}
          >
            <span>design</span>
          </a>
        </div>

      {/* Built on Strudel with heart and attribution on the right */}
      <div className="text-xs text-gray-400">
        Built on Strudel with{' '}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="inline-block w-4 h-4 align-[-0.32em] mx-px"
          fill="currentColor"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M11.645 20.01l-.007-.003-.022-.012a15.247 15.247 0 01-1.403-.836 25.18 25.18 0 01-4.356-3.165C3.112 13.37 1.5 11.353 1.5 9A5.25 5.25 0 016.75 3.75c1.503 0 2.905.634 3.885 1.66a5.235 5.235 0 013.615-1.66A5.25 5.25 0 0119.5 9c0 2.353-1.612 4.371-4.357 6.004a25.175 25.175 0 01-4.356 3.165 15.247 15.247 0 01-1.403.836l-.022.012-.007.003-.003.001a.75.75 0 01-.66 0l-.003-.001z" />
        </svg>
      </div>
    </footer>
  );
}
