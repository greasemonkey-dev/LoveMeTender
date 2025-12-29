import { useState } from 'react';
import { TenderAnalysis } from '@/types';
import { formatDate, formatCurrency, daysUntilDeadline, getDeadlineUrgency, getFitLevelLabel } from '@/utils/formatters';
import { ThresholdRequirements } from './ThresholdRequirements';
import { ScoringCriteria } from './ScoringCriteria';
import { Checklist } from './Checklist';
import { Recommendation } from './Recommendation';
import { exportTenderReport } from '@/services/analysisService';

interface AnalysisViewProps {
  analysis: TenderAnalysis;
  onClose: () => void;
  onUpdateChecklist: (itemId: string, completed: boolean) => void;
}

type Tab = 'overview' | 'threshold' | 'scoring' | 'checklist' | 'recommendation';

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'סקירה' },
  { id: 'threshold', label: 'תנאי סף' },
  { id: 'scoring', label: 'ניקוד' },
  { id: 'checklist', label: 'מסמכים' },
  { id: 'recommendation', label: 'המלצה' },
];

export function AnalysisView({ analysis, onClose, onUpdateChecklist }: AnalysisViewProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const { basicInfo, matchAnalysis } = analysis;

  const deadlineDays = daysUntilDeadline(basicInfo.deadline);
  const deadlineUrgency = getDeadlineUrgency(basicInfo.deadline);

  const handleExport = () => {
    const report = exportTenderReport(analysis);
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tender-report-${basicInfo.number || 'export'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-surface transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-secondary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-lg font-semibold text-primary truncate">{basicInfo.name}</h1>
                  <p className="text-sm text-secondary">
                    מכרז #{basicInfo.number} • {basicInfo.issuer}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <div
                className={`px-3 py-1.5 rounded-lg ${
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
                <span className="text-secondary text-sm">/10</span>
              </div>
              <button
                onClick={handleExport}
                className="p-2 rounded-lg hover:bg-surface transition-colors"
                title="ייצוא דו״ח"
              >
                <svg
                  className="w-5 h-5 text-secondary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4 -mb-px overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-surface text-primary border-t border-x border-border'
                    : 'text-secondary hover:text-primary hover:bg-surface/50'
                }`}
              >
                {tab.label}
                {tab.id === 'threshold' && (
                  <span className="mr-1.5 px-1.5 py-0.5 rounded text-xs bg-surface">
                    {analysis.thresholdRequirements.length}
                  </span>
                )}
                {tab.id === 'checklist' && (
                  <span className="mr-1.5 px-1.5 py-0.5 rounded text-xs bg-surface">
                    {analysis.checklist.filter((i) => i.completed).length}/{analysis.checklist.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="card p-4">
                <div className="text-sm text-secondary mb-1">מועד הגשה</div>
                <div
                  className={`font-semibold ${
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
              </div>

              <div className="card p-4">
                <div className="text-sm text-secondary mb-1">ערבות</div>
                <div className="font-semibold text-primary">{formatCurrency(basicInfo.guarantee)}</div>
              </div>

              <div className="card p-4">
                <div className="text-sm text-secondary mb-1">סוג מכרז</div>
                <div className="font-semibold text-primary">
                  {basicInfo.type === 'two-stage'
                    ? 'דו שלבי'
                    : basicInfo.type === 'framework'
                    ? 'מסגרת'
                    : 'רגיל'}
                </div>
              </div>

              <div className="card p-4">
                <div className="text-sm text-secondary mb-1">רמת התאמה</div>
                <div
                  className={`font-semibold ${
                    matchAnalysis.fitLevel === 'high'
                      ? 'text-success'
                      : matchAnalysis.fitLevel === 'medium'
                      ? 'text-warning'
                      : 'text-danger'
                  }`}
                >
                  {getFitLevelLabel(matchAnalysis.fitLevel)}
                </div>
              </div>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Strengths */}
              {matchAnalysis.strengths.length > 0 && (
                <div className="card p-4">
                  <h3 className="font-medium text-primary mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-success" />
                    יתרונות ({matchAnalysis.strengths.length})
                  </h3>
                  <ul className="space-y-2">
                    {matchAnalysis.strengths.map((s, i) => (
                      <li key={i} className="text-sm text-secondary flex items-start gap-2">
                        <svg className="w-4 h-4 text-success flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Challenges */}
              {matchAnalysis.challenges.length > 0 && (
                <div className="card p-4">
                  <h3 className="font-medium text-primary mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-warning" />
                    אתגרים ({matchAnalysis.challenges.length})
                  </h3>
                  <ul className="space-y-2">
                    {matchAnalysis.challenges.map((c, i) => (
                      <li key={i} className="text-sm text-secondary flex items-start gap-2">
                        <svg className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01" />
                        </svg>
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Blockers */}
            {matchAnalysis.blockers.length > 0 && (
              <div className="card p-4 border-danger/20 bg-danger/5">
                <h3 className="font-medium text-danger mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  חוסמים ({matchAnalysis.blockers.length})
                </h3>
                <ul className="space-y-2">
                  {matchAnalysis.blockers.map((b, i) => (
                    <li key={i} className="text-sm text-danger flex items-start gap-2">
                      <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendation */}
            <div className="card p-4">
              <h3 className="font-medium text-primary mb-2">המלצה</h3>
              <p className="text-secondary">{matchAnalysis.recommendation}</p>
            </div>
          </div>
        )}

        {activeTab === 'threshold' && (
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-primary mb-4">תנאי סף</h2>
            <ThresholdRequirements requirements={analysis.thresholdRequirements} />
          </div>
        )}

        {activeTab === 'scoring' && (
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-primary mb-4">קריטריוני ניקוד</h2>
            <ScoringCriteria criteria={analysis.scoringCriteria} />
          </div>
        )}

        {activeTab === 'checklist' && (
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-primary mb-4">רשימת מסמכים</h2>
            <Checklist items={analysis.checklist} onToggleItem={onUpdateChecklist} />
          </div>
        )}

        {activeTab === 'recommendation' && (
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-primary mb-4">ניתוח התאמה</h2>
            <Recommendation analysis={analysis} />
          </div>
        )}
      </main>
    </div>
  );
}
