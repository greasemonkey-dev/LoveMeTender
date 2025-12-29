import { TenderAnalysis } from '@/types';
import { formatRelativeTime, getFitLevelLabel } from '@/utils/formatters';

interface TenderCardProps {
  tender: TenderAnalysis;
  onClick: () => void;
  onDelete?: () => void;
}

export function TenderCard({ tender, onClick, onDelete }: TenderCardProps) {
  const { basicInfo, matchAnalysis, uploadDate } = tender;

  return (
    <div
      className="card-hover p-4 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-primary truncate">{basicInfo.name}</h3>
          <p className="text-sm text-secondary mt-0.5">
            {basicInfo.issuer} • #{basicInfo.number}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              matchAnalysis.fitLevel === 'high'
                ? 'bg-success/10'
                : matchAnalysis.fitLevel === 'medium'
                ? 'bg-warning/10'
                : 'bg-danger/10'
            }`}
          >
            <span
              className={`text-lg font-bold ${
                matchAnalysis.fitLevel === 'high'
                  ? 'text-success'
                  : matchAnalysis.fitLevel === 'medium'
                  ? 'text-warning'
                  : 'text-danger'
              }`}
            >
              {matchAnalysis.overallScore.toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2">
          <span
            className={`badge ${
              matchAnalysis.fitLevel === 'high'
                ? 'badge-success'
                : matchAnalysis.fitLevel === 'medium'
                ? 'badge-warning'
                : 'badge-danger'
            }`}
          >
            {getFitLevelLabel(matchAnalysis.fitLevel)}
          </span>
          <span className="text-xs text-secondary">{formatRelativeTime(uploadDate)}</span>
        </div>

        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1.5 rounded hover:bg-surface transition-colors"
            title="מחק"
          >
            <svg
              className="w-4 h-4 text-secondary hover:text-danger"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
