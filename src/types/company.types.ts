export interface CompanyProfile {
  id: string;
  name: string;
  description: string;
  expertise: string[];
  size: 'small' | 'medium' | 'large';
  experience: string[];
  certifications?: string[];
  yearsInBusiness?: number;
  createdAt: string;
  updatedAt: string;
}

export const EXPERTISE_OPTIONS = [
  'Frontend Development',
  'Backend Development',
  'Full Stack',
  'Mobile Development',
  'QA & Testing',
  'DevOps & Cloud',
  'Data & Analytics',
  'AI & Machine Learning',
  'Cybersecurity',
  'UI/UX Design',
  'Project Management',
  'System Integration',
  'ERP Systems',
  'CRM Systems',
] as const;

export const EXPERIENCE_OPTIONS = [
  'government',
  'defense',
  'finance',
  'healthcare',
  'retail',
  'telecom',
  'gaming',
  'education',
  'transportation',
  'energy',
  'manufacturing',
] as const;

export const SIZE_LABELS: Record<CompanyProfile['size'], string> = {
  small: '1-10 עובדים',
  medium: '11-50 עובדים',
  large: '51+ עובדים',
};

export const EXPERIENCE_LABELS: Record<string, string> = {
  government: 'מגזר ממשלתי',
  defense: 'ביטחון',
  finance: 'פיננסים',
  healthcare: 'בריאות',
  retail: 'קמעונאות',
  telecom: 'תקשורת',
  gaming: 'גיימינג',
  education: 'חינוך',
  transportation: 'תחבורה',
  energy: 'אנרגיה',
  manufacturing: 'תעשייה',
};
