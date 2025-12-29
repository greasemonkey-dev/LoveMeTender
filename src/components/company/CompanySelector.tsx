import { CompanyProfile, SIZE_LABELS } from '@/types';

interface CompanySelectorProps {
  companies: CompanyProfile[];
  currentCompany: CompanyProfile | null;
  onSelect: (company: CompanyProfile) => void;
  onCreateNew: () => void;
  onEdit: (company: CompanyProfile) => void;
}

export function CompanySelector({
  companies,
  currentCompany,
  onSelect,
  onCreateNew,
  onEdit,
}: CompanySelectorProps) {
  if (companies.length === 0) {
    return (
      <div className="text-center py-8">
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
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-primary mb-2">אין חברות מוגדרות</h3>
        <p className="text-secondary text-sm mb-4">
          הגדר פרופיל חברה כדי לקבל ניתוח התאמה מותאם
        </p>
        <button onClick={onCreateNew} className="btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          צור חברה חדשה
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-primary">בחר חברה</h3>
        <button
          onClick={onCreateNew}
          className="text-sm text-primary hover:underline flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          חדש
        </button>
      </div>

      <div className="space-y-2">
        {companies.map((company) => (
          <div
            key={company.id}
            className={`p-4 rounded-lg border transition-all cursor-pointer ${
              currentCompany?.id === company.id
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-secondary'
            }`}
            onClick={() => onSelect(company)}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-primary">{company.name}</h4>
                  {currentCompany?.id === company.id && (
                    <span className="badge badge-success">פעיל</span>
                  )}
                </div>
                <p className="text-sm text-secondary mt-1 line-clamp-2">
                  {company.description}
                </p>
                <div className="flex items-center gap-3 mt-2 text-xs text-secondary">
                  <span>{SIZE_LABELS[company.size]}</span>
                  <span>•</span>
                  <span>{company.expertise.slice(0, 3).join(', ')}</span>
                  {company.expertise.length > 3 && (
                    <span className="text-secondary">+{company.expertise.length - 3}</span>
                  )}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(company);
                }}
                className="p-2 rounded-lg hover:bg-surface transition-colors"
              >
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
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
