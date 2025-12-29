import { TenderAnalysis } from '@/types';
import { TenderCard } from './TenderCard';

interface TenderHistoryProps {
  tenders: TenderAnalysis[];
  onSelectTender: (tender: TenderAnalysis) => void;
  onDeleteTender: (tenderId: string) => void;
}

export function TenderHistory({
  tenders,
  onSelectTender,
  onDeleteTender,
}: TenderHistoryProps) {
  if (tenders.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface flex items-center justify-center">
          <svg
            className="w-8 h-8 text-secondary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-primary mb-2">אין היסטוריה</h3>
        <p className="text-secondary text-sm">
          מכרזים שנותחו יופיעו כאן
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-primary">היסטוריית מכרזים</h3>
        <span className="text-sm text-secondary">{tenders.length} מכרזים</span>
      </div>

      <div className="space-y-3">
        {tenders.map((tender) => (
          <TenderCard
            key={tender.id}
            tender={tender}
            onClick={() => onSelectTender(tender)}
            onDelete={() => onDeleteTender(tender.id)}
          />
        ))}
      </div>
    </div>
  );
}
