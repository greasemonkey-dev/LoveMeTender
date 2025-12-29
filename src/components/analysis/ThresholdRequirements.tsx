import { ThresholdRequirement } from '@/types';
import { getStatusLabel, getCategoryLabel, getImportanceLabel } from '@/utils/formatters';

interface ThresholdRequirementsProps {
  requirements: ThresholdRequirement[];
}

const STATUS_CONFIG = {
  yes: {
    icon: 'check',
    color: 'text-success',
    bg: 'bg-success/10',
    border: 'border-success/20',
  },
  check: {
    icon: 'alert',
    color: 'text-warning',
    bg: 'bg-warning/10',
    border: 'border-warning/20',
  },
  no: {
    icon: 'x',
    color: 'text-danger',
    bg: 'bg-danger/10',
    border: 'border-danger/20',
  },
  unknown: {
    icon: 'question',
    color: 'text-secondary',
    bg: 'bg-gray-100',
    border: 'border-gray-200',
  },
};

export function ThresholdRequirements({ requirements }: ThresholdRequirementsProps) {
  const stats = {
    yes: requirements.filter((r) => r.companyStatus === 'yes').length,
    check: requirements.filter((r) => r.companyStatus === 'check').length,
    no: requirements.filter((r) => r.companyStatus === 'no').length,
    unknown: requirements.filter((r) => r.companyStatus === 'unknown').length,
  };

  const hasBlockers = stats.no > 0;

  return (
    <div className="space-y-4">
      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-2">
        {Object.entries(stats).map(([status, count]) => {
          const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
          return (
            <div
              key={status}
              className={`p-3 rounded-lg text-center ${config.bg} border ${config.border}`}
            >
              <div className={`text-2xl font-bold ${config.color}`}>{count}</div>
              <div className="text-xs text-secondary">{getStatusLabel(status as 'yes' | 'no' | 'check' | 'unknown')}</div>
            </div>
          );
        })}
      </div>

      {/* Warning if blockers exist */}
      {hasBlockers && (
        <div className="p-3 bg-danger/10 border border-danger/20 rounded-lg flex gap-3">
          <svg
            className="w-5 h-5 text-danger flex-shrink-0 mt-0.5"
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
          <div>
            <div className="font-medium text-danger">יש תנאי סף שהחברה לא עומדת בהם</div>
            <div className="text-sm text-danger/80 mt-0.5">
              נדרש לטפל בחוסמים אלו לפני הגשה
            </div>
          </div>
        </div>
      )}

      {/* Requirements list */}
      <div className="space-y-3">
        {requirements.map((req) => {
          const config = STATUS_CONFIG[req.companyStatus];

          return (
            <div
              key={req.id}
              className={`p-4 rounded-lg border ${config.border} ${config.bg} transition-all`}
            >
              {/* Header */}
              <div className="flex items-start gap-3">
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                    req.companyStatus === 'yes'
                      ? 'bg-success/20'
                      : req.companyStatus === 'no'
                      ? 'bg-danger/20'
                      : req.companyStatus === 'check'
                      ? 'bg-warning/20'
                      : 'bg-gray-200'
                  }`}
                >
                  {req.companyStatus === 'yes' && (
                    <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {req.companyStatus === 'no' && (
                    <svg className="w-4 h-4 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  {req.companyStatus === 'check' && (
                    <svg className="w-4 h-4 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01" />
                    </svg>
                  )}
                  {req.companyStatus === 'unknown' && (
                    <svg className="w-4 h-4 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-sm font-medium text-primary">{req.requirement}</div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span
                        className={`badge ${
                          req.importance === 'critical'
                            ? 'badge-danger'
                            : req.importance === 'high'
                            ? 'badge-warning'
                            : 'badge-neutral'
                        }`}
                      >
                        {getImportanceLabel(req.importance)}
                      </span>
                      <span className="badge badge-neutral">{getCategoryLabel(req.category)}</span>
                    </div>
                  </div>

                  {/* Notes */}
                  {req.notes && (
                    <p className="text-sm text-secondary mt-2">{req.notes}</p>
                  )}

                  {/* Documents needed */}
                  {req.documentsNeeded.length > 0 && (
                    <div className="mt-3">
                      <div className="text-xs text-secondary font-medium mb-1.5">
                        מסמכים נדרשים:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {req.documentsNeeded.map((doc, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-white rounded text-xs text-secondary border border-border"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            {doc}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
