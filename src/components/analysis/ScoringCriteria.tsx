import { ScoringCriterion } from '@/types';

interface ScoringCriteriaProps {
  criteria: ScoringCriterion[];
}

const FIT_CONFIG = {
  strong: {
    label: 'התאמה חזקה',
    color: 'text-success',
    bg: 'bg-success',
  },
  medium: {
    label: 'התאמה בינונית',
    color: 'text-warning',
    bg: 'bg-warning',
  },
  weak: {
    label: 'התאמה חלשה',
    color: 'text-danger',
    bg: 'bg-danger',
  },
  unknown: {
    label: 'לא ברור',
    color: 'text-secondary',
    bg: 'bg-secondary',
  },
};

export function ScoringCriteria({ criteria }: ScoringCriteriaProps) {
  // Separate by category
  const qualityCriteria = criteria.filter((c) => c.category === 'quality');
  const priceCriteria = criteria.filter((c) => c.category === 'price');

  const totalQualityWeight = qualityCriteria.reduce((sum, c) => sum + c.weight, 0);
  const totalPriceWeight = priceCriteria.reduce((sum, c) => sum + c.weight, 0);

  // Calculate weighted score estimate
  const calculateWeightedScore = (items: ScoringCriterion[]) => {
    const fitScores = { strong: 90, medium: 70, weak: 40, unknown: 60 };
    const totalWeight = items.reduce((sum, c) => sum + c.weight, 0);
    if (totalWeight === 0) return 0;

    const weightedSum = items.reduce((sum, c) => {
      return sum + (fitScores[c.companyFit] * c.weight);
    }, 0);

    return Math.round(weightedSum / totalWeight);
  };

  const overallEstimate = calculateWeightedScore(criteria);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 bg-surface rounded-lg text-center">
          <div className="text-2xl font-bold text-primary">{totalQualityWeight}%</div>
          <div className="text-xs text-secondary">משקל איכות</div>
        </div>
        <div className="p-4 bg-surface rounded-lg text-center">
          <div className="text-2xl font-bold text-primary">{totalPriceWeight}%</div>
          <div className="text-xs text-secondary">משקל מחיר</div>
        </div>
        <div className="p-4 bg-primary/5 rounded-lg text-center border border-primary/10">
          <div className="text-2xl font-bold text-primary">{overallEstimate}%</div>
          <div className="text-xs text-secondary">הערכת ניקוד</div>
        </div>
      </div>

      {/* Quality Criteria */}
      {qualityCriteria.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-primary">קריטריוני איכות</h3>
            <span className="text-sm text-secondary">{totalQualityWeight}%</span>
          </div>
          <div className="space-y-2">
            {qualityCriteria.map((criterion) => (
              <CriterionItem key={criterion.id} criterion={criterion} />
            ))}
          </div>
        </div>
      )}

      {/* Price Criteria */}
      {priceCriteria.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-primary">קריטריוני מחיר</h3>
            <span className="text-sm text-secondary">{totalPriceWeight}%</span>
          </div>
          <div className="space-y-2">
            {priceCriteria.map((criterion) => (
              <CriterionItem key={criterion.id} criterion={criterion} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CriterionItem({ criterion }: { criterion: ScoringCriterion }) {
  const config = FIT_CONFIG[criterion.companyFit];

  return (
    <div className="p-4 bg-surface rounded-lg">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-primary">{criterion.criterion}</div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`badge ${
            criterion.companyFit === 'strong'
              ? 'badge-success'
              : criterion.companyFit === 'medium'
              ? 'badge-warning'
              : criterion.companyFit === 'weak'
              ? 'badge-danger'
              : 'badge-neutral'
          }`}>
            {config.label}
          </span>
          <span className="text-sm font-semibold text-primary">{criterion.weight}%</span>
        </div>
      </div>

      {/* Weight bar */}
      <div className="h-2 bg-border rounded-full overflow-hidden mb-2">
        <div
          className={`h-full ${config.bg} transition-all duration-500`}
          style={{ width: `${criterion.weight}%` }}
        />
      </div>

      {/* Notes */}
      {criterion.notes && (
        <p className="text-xs text-secondary mt-2">{criterion.notes}</p>
      )}
    </div>
  );
}
