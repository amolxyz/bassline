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
    <footer className="flex-none bg-lineHighlight text-foreground px-4 py-2 flex justify-between items-center">
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
            <span className={cx('flex items-center space-x-2')}>
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
              'flex items-center space-x-1',
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
            className={cx('hover:opacity-50 flex items-center space-x-1 p-2')}
          >
            <span>design</span>
          </a>
        </div>

      {/* Built with Strudel on the right */}
      <div className="text-xs text-gray-400">
        Built with Strudel
      </div>
    </footer>
  );
}
