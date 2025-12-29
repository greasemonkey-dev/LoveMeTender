import { ANALYSIS_STAGES } from '@/types';

interface LoadingAnalysisProps {
  currentStage: number;
  fileName?: string;
}

export function LoadingAnalysis({ currentStage, fileName }: LoadingAnalysisProps) {
  const progress = Math.min(((currentStage + 1) / ANALYSIS_STAGES.length) * 100, 100);

  return (
    <div className="w-full max-w-md mx-auto py-12">
      <div className="text-center mb-8">
        {/* Animated logo */}
        <div className="relative w-20 h-20 mx-auto mb-4">
          {/* Outer ring - spinning */}
          <div className="absolute inset-0 rounded-full border-4 border-surface" />
          <div
            className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin"
            style={{ animationDuration: '1.5s' }}
          />

          {/* Inner icon */}
          <div className="absolute inset-3 rounded-full bg-surface flex items-center justify-center">
            <svg
              className="w-7 h-7 text-primary"
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
        </div>

        <h2 className="text-xl font-semibold text-primary mb-1">מנתח מכרז</h2>
        {fileName && (
          <p className="text-sm text-secondary truncate max-w-[250px] mx-auto">{fileName}</p>
        )}
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="h-1.5 bg-surface rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Stages */}
      <div className="space-y-3">
        {ANALYSIS_STAGES.map((stage, index) => {
          const isComplete = index < currentStage;
          const isActive = index === currentStage;
          const isPending = index > currentStage;

          return (
            <div
              key={stage.id}
              className={`
                flex items-center gap-3 p-3 rounded-lg transition-all duration-300
                ${isActive ? 'bg-surface' : ''}
              `}
            >
              {/* Status indicator */}
              <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                {isComplete && (
                  <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center animate-fadeIn">
                    <svg
                      className="w-4 h-4 text-success"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                {isActive && (
                  <div className="w-6 h-6 rounded-full border-2 border-primary flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  </div>
                )}
                {isPending && (
                  <div className="w-6 h-6 rounded-full border-2 border-border" />
                )}
              </div>

              {/* Label */}
              <span
                className={`
                  flex-1 text-sm transition-colors duration-300
                  ${isComplete ? 'text-success' : ''}
                  ${isActive ? 'text-primary font-medium' : ''}
                  ${isPending ? 'text-secondary/50' : ''}
                `}
              >
                {isActive ? stage.labelActive : stage.label}
              </span>

              {/* Active spinner */}
              {isActive && (
                <div className="flex-shrink-0">
                  <svg
                    className="w-4 h-4 text-secondary animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Estimated time */}
      <div className="mt-6 text-center">
        <p className="text-xs text-secondary">
          זמן משוער: {Math.max(5, 25 - currentStage * 5)} שניות
        </p>
      </div>
    </div>
  );
}
