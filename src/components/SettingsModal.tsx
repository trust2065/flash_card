import type { User } from './UserSelection';

interface SettingsModalProps {
  currentUser: User;
  onClose: () => void;
  onSwitchUser: () => void;
  onShowProgress: () => void;
  selectedLesson: '1' | '2' | 'all';
  onSelectLesson: (lesson: '1' | '2' | 'all') => void;
  onCheckUpdate: () => void;
  onSyncCloud: () => void;
}

export function SettingsModal({
  currentUser,
  onClose,
  onSwitchUser,
  onShowProgress,
  selectedLesson,
  onSelectLesson,
  onCheckUpdate,
  onSyncCloud,
}: SettingsModalProps) {
  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[150] flex justify-center items-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-2xl p-6 shadow-2xl flex flex-col gap-6 animate-in zoom-in-95 duration-200">

        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">設定</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-5">
          {/* User Info */}
          <div className="bg-slate-800/50 rounded-xl p-4 flex items-center justify-between border border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-2xl shrink-0">
                {currentUser.avatar}
              </div>
              <div>
                <div className="text-sm text-slate-400">目前使用者</div>
                <div className="text-lg font-bold text-white">{currentUser.name}</div>
              </div>
            </div>
            <button
              onClick={onSwitchUser}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition-colors"
            >
              切換
            </button>
          </div>

          {/* Lesson Selection */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-slate-400">選擇範圍</div>
            <div className="flex gap-2">
              {(['1', '2', 'all'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => onSelectLesson(l)}
                  className={`flex-1 py-2.5 rounded-xl border transition-all duration-200 cursor-pointer ${selectedLesson === l
                    ? 'bg-primary/30 border-primary/50 text-white font-bold'
                    : 'bg-slate-800 border-white/5 text-slate-400 hover:bg-slate-700 hover:text-white'
                    }`}
                >
                  {l === 'all' ? '全部' : `第${l === '1' ? '一' : '二'}課`}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-white/10 w-full my-1"></div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => {
                onShowProgress();
                onClose();
              }}
              className="flex flex-col items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-white/5 p-3 rounded-xl transition-colors cursor-pointer"
            >
              <span className="text-2xl">📊</span>
              <span className="text-sm font-medium text-white">學習成果</span>
            </button>

            <button
              onClick={() => {
                onSyncCloud();
                onClose();
              }}
              className="flex flex-col items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-white/5 p-3 rounded-xl transition-colors cursor-pointer"
            >
              <span className="text-2xl">☁️</span>
              <span className="text-sm font-medium text-white">同步雲端</span>
            </button>

            <button
              onClick={onCheckUpdate}
              className="flex flex-col items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-white/5 p-3 rounded-xl transition-colors cursor-pointer"
            >
              <span className="text-2xl">🔄</span>
              <span className="text-sm font-medium text-white">檢查更新</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
