import PlayCircleIcon from '@heroicons/react/20/solid/PlayCircleIcon';
import StopCircleIcon from '@heroicons/react/20/solid/StopCircleIcon';
import cx from '@src/cx.mjs';
import { useSettings, setIsZen, setActiveFooter as setTab, setIsPanelOpened } from '../../settings.mjs';
import '../Repl.css';

const { BASE_URL } = import.meta.env;
const baseNoTrailing = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;

export function Header({ context, embedded = false }) {
  const { started, pending, isDirty, activeCode, handleTogglePlay, handleEvaluate, handleShuffle, handleShare } =
    context;
  const isEmbedded = typeof window !== 'undefined' && (embedded || window.location !== window.parent.location);
  const { isZen, isButtonRowHidden, isCSSAnimationDisabled, fontFamily, activeFooter } = useSettings();

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
              <img src="/logo.svg" alt="Piano Keys Logo" className="w-5 h-5 flex-shrink-0" />
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
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-700 text-white hover:bg-gray-600') +
                  ' h-8 px-4 text-sm cursor-pointer flex items-center rounded-full font-bold'
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
