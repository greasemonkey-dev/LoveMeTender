import { CompanyProfile } from '@/types';

interface HeaderProps {
  currentCompany: CompanyProfile | null;
  onOpenCompanySettings: () => void;
  onOpenHistory: () => void;
  onOpenApiSettings: () => void;
  historyCount: number;
}

export function Header({
  currentCompany,
  onOpenCompanySettings,
  onOpenHistory,
  onOpenApiSettings,
  historyCount,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border">
      <div className="max-w-5xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-primary">ניתוח מכרזים</h1>
              <p className="text-xs text-secondary hidden sm:block">Tender Analyzer</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Company selector */}
            <button
              onClick={onOpenCompanySettings}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface transition-colors"
            >
              <div className="w-7 h-7 bg-surface rounded-full flex items-center justify-center border border-border">
                <svg
                  className="w-4 h-4 text-secondary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-primary truncate max-w-[120px]">
                  {currentCompany?.name || 'בחר חברה'}
                </div>
                {currentCompany && (
                  <div className="text-xs text-secondary">הגדרות</div>
                )}
              </div>
              <svg
                className="w-4 h-4 text-secondary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* History */}
            <button
              onClick={onOpenHistory}
              className="relative p-2 rounded-lg hover:bg-surface transition-colors"
              title="היסטוריית מכרזים"
            >
              <svg
                className="w-5 h-5 text-secondary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {historyCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                  {historyCount > 9 ? '9+' : historyCount}
                </span>
              )}
            </button>

            {/* API Settings */}
            <button
              onClick={onOpenApiSettings}
              className="p-2 rounded-lg hover:bg-surface transition-colors"
              title="הגדרות API"
            >
              <svg
                className="w-5 h-5 text-secondary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
