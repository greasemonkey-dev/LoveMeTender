export interface TenderAnalysis {
  id: string;
  uploadDate: string;
  fileName: string;
  companyId: string;

  basicInfo: {
    name: string;
    number: string;
    issuer: string;
    deadline: string | null;
    guarantee: number | null;
    type: 'two-stage' | 'regular' | 'framework';
  };

  thresholdRequirements: ThresholdRequirement[];
  scoringCriteria: ScoringCriterion[];
  checklist: ChecklistItem[];

  matchAnalysis: {
    overallScore: number;
    fitLevel: 'low' | 'medium' | 'high';
    strengths: string[];
    challenges: string[];
    blockers: string[];
    recommendation: string;
  };

  rawPdfText?: string;
}

export interface ThresholdRequirement {
  id: string;
  requirement: string;
  category: 'company' | 'candidate' | 'financial' | 'legal';
  companyStatus: 'yes' | 'no' | 'check' | 'unknown';
  importance: 'critical' | 'high' | 'medium';
  notes: string;
  documentsNeeded: string[];
}

export interface ScoringCriterion {
  id: string;
  criterion: string;
  weight: number;
  category: 'quality' | 'price';
  companyFit: 'strong' | 'medium' | 'weak' | 'unknown';
  notes: string;
}

export interface ChecklistItem {
  id: string;
  category: string;
  item: string;
  completed: boolean;
  required: boolean;
  notes?: string;
}

export interface ExtractedSection {
  title: string;
  content: string;
  importance: 'critical' | 'high' | 'medium';
}

export interface SmartExtractResult {
  relevantSections: ExtractedSection[];
  summary: string;
  totalPages: number;
  extractedPercentage: number;
}
