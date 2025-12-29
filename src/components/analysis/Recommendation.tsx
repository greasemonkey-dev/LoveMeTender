import { TenderAnalysis } from '@/types';
import { getFitLevelLabel } from '@/utils/formatters';

interface RecommendationProps {
  analysis: TenderAnalysis;
}

export function Recommendation({ analysis }: RecommendationProps) {
  const { matchAnalysis } = analysis;

  const getRecommendationIcon = () => {
    if (matchAnalysis.fitLevel === 'high') {
      return (
        <svg className="w-6 h-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }
    if (matchAnalysis.fitLevel === 'medium') {
      return (
        <svg className="w-6 h-6 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      );
    }
    return (
      <svg className="w-6 h-6 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  };

  return (
    <div className="space-y-6">
      {/* Main recommendation */}
      <div
        className={`p-6 rounded-xl border-2 ${
          matchAnalysis.fitLevel === 'high'
            ? 'bg-success/5 border-success/20'
            : matchAnalysis.fitLevel === 'medium'
            ? 'bg-warning/5 border-warning/20'
            : 'bg-danger/5 border-danger/20'
        }`}
      >
        <div className="flex items-start gap-4">
          <div
            className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
              matchAnalysis.fitLevel === 'high'
                ? 'bg-success/10'
                : matchAnalysis.fitLevel === 'medium'
                ? 'bg-warning/10'
                : 'bg-danger/10'
            }`}
          >
            {getRecommendationIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-primary">המלצה</h3>
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
            </div>
            <p className="text-primary leading-relaxed">{matchAnalysis.recommendation}</p>
          </div>
        </div>
      </div>

      {/* Score breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-surface rounded-lg text-center">
          <div
            className={`text-3xl font-bold ${
              matchAnalysis.fitLevel === 'high'
                ? 'text-success'
                : matchAnalysis.fitLevel === 'medium'
                ? 'text-warning'
                : 'text-danger'
            }`}
          >
            {matchAnalysis.overallScore.toFixed(1)}
          </div>
          <div className="text-sm text-secondary">ציון התאמה כללי</div>
        </div>
        <div className="p-4 bg-surface rounded-lg text-center">
          <div className="text-3xl font-bold text-success">{matchAnalysis.strengths.length}</div>
          <div className="text-sm text-secondary">יתרונות</div>
        </div>
        <div className="p-4 bg-surface rounded-lg text-center">
          <div className="text-3xl font-bold text-warning">{matchAnalysis.challenges.length}</div>
          <div className="text-sm text-secondary">אתגרים</div>
        </div>
      </div>

      {/* Strengths */}
      {matchAnalysis.strengths.length > 0 && (
        <div>
          <h4 className="font-medium text-primary mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-success" />
            יתרונות
          </h4>
          <div className="space-y-2">
            {matchAnalysis.strengths.map((strength, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-success/5 rounded-lg"
              >
                <svg
                  className="w-5 h-5 text-success flex-shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-primary">{strength}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Challenges */}
      {matchAnalysis.challenges.length > 0 && (
        <div>
          <h4 className="font-medium text-primary mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-warning" />
            אתגרים
          </h4>
          <div className="space-y-2">
            {matchAnalysis.challenges.map((challenge, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-warning/5 rounded-lg"
              >
                <svg
                  className="w-5 h-5 text-warning flex-shrink-0 mt-0.5"
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
                <span className="text-sm text-primary">{challenge}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Blockers */}
      {matchAnalysis.blockers.length > 0 && (
        <div>
          <h4 className="font-medium text-primary mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-danger" />
            חוסמים
          </h4>
          <div className="space-y-2">
            {matchAnalysis.blockers.map((blocker, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-danger/5 rounded-lg border border-danger/10"
              >
                <svg
                  className="w-5 h-5 text-danger flex-shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="text-sm text-primary">{blocker}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
