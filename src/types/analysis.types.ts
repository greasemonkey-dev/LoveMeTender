export interface AnalysisState {
  status: 'idle' | 'uploading' | 'extracting' | 'analyzing' | 'complete' | 'error';
  progress: number;
  currentStage: number;
  error?: string;
}

export interface AnalysisStage {
  id: string;
  label: string;
  labelActive: string;
  status: 'pending' | 'active' | 'complete';
}

export const ANALYSIS_STAGES: AnalysisStage[] = [
  { id: 'pdf', label: 'קריאת מסמך PDF', labelActive: 'קורא מסמך PDF', status: 'pending' },
  { id: 'extract', label: 'חילוץ סעיפים חשובים', labelActive: 'מחלץ סעיפים חשובים', status: 'pending' },
  { id: 'analyze', label: 'ניתוח תנאי סף וקריטריונים', labelActive: 'מנתח תנאי סף וקריטריונים', status: 'pending' },
  { id: 'match', label: 'הערכת התאמה לחברה', labelActive: 'מעריך התאמה לחברה', status: 'pending' },
  { id: 'format', label: 'הכנת תצוגה', labelActive: 'מכין תצוגה', status: 'pending' },
];

export interface ClaudeAnalysisResponse {
  basicInfo: {
    name: string;
    number: string;
    issuer: string;
    deadline: string | null;
    guarantee: number | null;
    type: 'two-stage' | 'regular' | 'framework';
  };
  thresholdRequirements: Array<{
    requirement: string;
    category: 'company' | 'candidate' | 'financial' | 'legal';
    companyStatus: 'yes' | 'no' | 'check' | 'unknown';
    importance: 'critical' | 'high' | 'medium';
    notes: string;
    documentsNeeded: string[];
  }>;
  scoringCriteria: Array<{
    criterion: string;
    weight: number;
    category: 'quality' | 'price';
    companyFit: 'strong' | 'medium' | 'weak' | 'unknown';
    notes: string;
  }>;
  checklist: Array<{
    category: string;
    item: string;
    required: boolean;
    notes?: string;
  }>;
  matchAnalysis: {
    overallScore: number;
    fitLevel: 'low' | 'medium' | 'high';
    strengths: string[];
    challenges: string[];
    blockers: string[];
    recommendation: string;
  };
}
