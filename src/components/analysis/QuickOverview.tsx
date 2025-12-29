import { TenderAnalysis } from '@/types';
import { formatDate, formatCurrency, daysUntilDeadline, getDeadlineUrgency, getFitLevelLabel } from '@/utils/formatters';

interface QuickOverviewProps {
  analysis: TenderAnalysis;
  onViewDetails: () => void;
  onClose: () => void;
}

export function QuickOverview({ analysis, onViewDetails, onClose }: QuickOverviewProps) {
  const { basicInfo, matchAnalysis } = analysis;

  const deadlineDays = daysUntilDeadline(basicInfo.deadline);
  const deadlineUrgency = getDeadlineUrgency(basicInfo.deadline);

  const scoreColor =
    matchAnalysis.fitLevel === 'high'
      ? 'text-success'
      : matchAnalysis.fitLevel === 'medium'
      ? 'text-warning'
      : 'text-danger';

  const scoreBg =
    matchAnalysis.fitLevel === 'high'
      ? 'bg-success/10'
      : matchAnalysis.fitLevel === 'medium'
      ? 'bg-warning/10'
      : 'bg-danger/10';

  return (
    <div className="card p-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-semibold text-primary truncate">{basicInfo.name}</h2>
          <p className="text-sm text-secondary mt-1">
            מכרז #{basicInfo.number} • {basicInfo.issuer}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-surface transition-colors flex-shrink-0"
        >
          <svg
            className="w-5 h-5 text-secondary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Basic info cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="p-3 bg-surface rounded-lg">
          <div className="text-xs text-secondary mb-1">מועד הגשה</div>
          <div
            className={`font-medium ${
              deadlineUrgency === 'critical'
                ? 'text-danger'
                : deadlineUrgency === 'warning'
                ? 'text-warning'
                : 'text-primary'
            }`}
          >
            {formatDate(basicInfo.deadline)}
          </div>
          {deadlineDays !== null && deadlineDays >= 0 && (
            <div className="text-xs text-secondary mt-0.5">
              {deadlineDays === 0 ? 'היום!' : `עוד ${deadlineDays} ימים`}
            </div>
          )}
          {deadlineDays !== null && deadlineDays < 0 && (
            <div className="text-xs text-danger mt-0.5">עבר המועד</div>
          )}
        </div>

        <div className="p-3 bg-surface rounded-lg">
          <div className="text-xs text-secondary mb-1">ערבות נדרשת</div>
          <div className="font-medium text-primary">{formatCurrency(basicInfo.guarantee)}</div>
        </div>
      </div>

      {/* Score */}
      <div className={`p-4 rounded-xl ${scoreBg} mb-6`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-secondary mb-1">התאמה לחברה</div>
            <div className={`text-3xl font-bold ${scoreColor}`}>
              {matchAnalysis.overallScore.toFixed(1)}
              <span className="text-lg font-normal text-secondary">/10</span>
            </div>
          </div>
          <div
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              matchAnalysis.fitLevel === 'high'
                ? 'bg-success/20 text-success'
                : matchAnalysis.fitLevel === 'medium'
                ? 'bg-warning/20 text-warning'
                : 'bg-danger/20 text-danger'
            }`}
          >
            {getFitLevelLabel(matchAnalysis.fitLevel)}
          </div>
        </div>
      </div>

      {/* Quick insights */}
      <div className="space-y-3 mb-6">
        {matchAnalysis.strengths.length > 0 && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-success"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-success font-medium mb-0.5">יתרונות</div>
              <div className="text-sm text-primary">{matchAnalysis.strengths[0]}</div>
              {matchAnalysis.strengths.length > 1 && (
                <div className="text-xs text-secondary mt-0.5">
                  +{matchAnalysis.strengths.length - 1} נוספים
                </div>
              )}
            </div>
          </div>
        )}

        {matchAnalysis.challenges.length > 0 && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-warning"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-warning font-medium mb-0.5">אתגרים</div>
              <div className="text-sm text-primary">{matchAnalysis.challenges[0]}</div>
              {matchAnalysis.challenges.length > 1 && (
                <div className="text-xs text-secondary mt-0.5">
                  +{matchAnalysis.challenges.length - 1} נוספים
                </div>
              )}
            </div>
          </div>
        )}

        {matchAnalysis.blockers.length > 0 && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-danger/10 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-danger"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-danger font-medium mb-0.5">חוסמים</div>
              <div className="text-sm text-primary">{matchAnalysis.blockers[0]}</div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={onViewDetails} className="btn-primary flex-1">
          לניתוח המפורט
          <svg
            className="w-4 h-4 rtl:rotate-180"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
        <button onClick={onClose} className="btn-secondary">
          סגור
        </button>
      </div>
    </div>
  );
}
