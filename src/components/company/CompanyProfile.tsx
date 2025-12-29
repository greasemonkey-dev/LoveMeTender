import { useState, useEffect } from 'react';
import {
  CompanyProfile as CompanyProfileType,
  EXPERTISE_OPTIONS,
  EXPERIENCE_OPTIONS,
  SIZE_LABELS,
  EXPERIENCE_LABELS,
} from '@/types';
import { generateId } from '@/utils/formatters';

interface CompanyProfileFormProps {
  company?: CompanyProfileType | null;
  onSave: (company: CompanyProfileType) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export function CompanyProfileForm({
  company,
  onSave,
  onCancel,
  onDelete,
}: CompanyProfileFormProps) {
  const [formData, setFormData] = useState<Partial<CompanyProfileType>>({
    name: '',
    description: '',
    expertise: [],
    size: 'small',
    experience: [],
    certifications: [],
    yearsInBusiness: undefined,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name,
        description: company.description,
        expertise: company.expertise,
        size: company.size,
        experience: company.experience,
        certifications: company.certifications || [],
        yearsInBusiness: company.yearsInBusiness,
      });
    }
  }, [company]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'שם החברה הוא שדה חובה';
    }

    if (!formData.description?.trim()) {
      newErrors.description = 'תיאור החברה הוא שדה חובה';
    }

    if (!formData.expertise || formData.expertise.length === 0) {
      newErrors.expertise = 'בחר לפחות תחום מומחיות אחד';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const companyData: CompanyProfileType = {
      id: company?.id || generateId(),
      name: formData.name!.trim(),
      description: formData.description!.trim(),
      expertise: formData.expertise || [],
      size: formData.size || 'small',
      experience: formData.experience || [],
      certifications: formData.certifications,
      yearsInBusiness: formData.yearsInBusiness,
      createdAt: company?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(companyData);
  };

  const toggleExpertise = (expertise: string) => {
    setFormData((prev) => ({
      ...prev,
      expertise: prev.expertise?.includes(expertise)
        ? prev.expertise.filter((e) => e !== expertise)
        : [...(prev.expertise || []), expertise],
    }));
  };

  const toggleExperience = (exp: string) => {
    setFormData((prev) => ({
      ...prev,
      experience: prev.experience?.includes(exp)
        ? prev.experience.filter((e) => e !== exp)
        : [...(prev.experience || []), exp],
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-primary mb-1.5">
          שם החברה *
        </label>
        <input
          type="text"
          value={formData.name || ''}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={`input ${errors.name ? 'input-error' : ''}`}
          placeholder="לדוגמה: רבטק בע״מ"
        />
        {errors.name && (
          <p className="text-danger text-xs mt-1">{errors.name}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-primary mb-1.5">
          תיאור החברה *
        </label>
        <textarea
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className={`input min-h-[100px] ${errors.description ? 'input-error' : ''}`}
          placeholder="תאר את החברה, ההתמחויות העיקריות, והניסיון..."
        />
        {errors.description && (
          <p className="text-danger text-xs mt-1">{errors.description}</p>
        )}
      </div>

      {/* Size */}
      <div>
        <label className="block text-sm font-medium text-primary mb-1.5">
          גודל החברה
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['small', 'medium', 'large'] as const).map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => setFormData({ ...formData, size })}
              className={`p-3 rounded-lg border text-sm transition-colors ${
                formData.size === size
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border bg-white text-secondary hover:border-secondary'
              }`}
            >
              {SIZE_LABELS[size]}
            </button>
          ))}
        </div>
      </div>

      {/* Expertise */}
      <div>
        <label className="block text-sm font-medium text-primary mb-1.5">
          תחומי מומחיות *
        </label>
        <div className="flex flex-wrap gap-2">
          {EXPERTISE_OPTIONS.map((expertise) => (
            <button
              key={expertise}
              type="button"
              onClick={() => toggleExpertise(expertise)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                formData.expertise?.includes(expertise)
                  ? 'bg-primary text-white'
                  : 'bg-surface text-secondary hover:bg-gray-100'
              }`}
            >
              {expertise}
            </button>
          ))}
        </div>
        {errors.expertise && (
          <p className="text-danger text-xs mt-1">{errors.expertise}</p>
        )}
      </div>

      {/* Experience */}
      <div>
        <label className="block text-sm font-medium text-primary mb-1.5">
          ניסיון במגזרים
        </label>
        <div className="flex flex-wrap gap-2">
          {EXPERIENCE_OPTIONS.map((exp) => (
            <button
              key={exp}
              type="button"
              onClick={() => toggleExperience(exp)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                formData.experience?.includes(exp)
                  ? 'bg-primary text-white'
                  : 'bg-surface text-secondary hover:bg-gray-100'
              }`}
            >
              {EXPERIENCE_LABELS[exp]}
            </button>
          ))}
        </div>
      </div>

      {/* Years in business */}
      <div>
        <label className="block text-sm font-medium text-primary mb-1.5">
          שנות פעילות
        </label>
        <input
          type="number"
          min="0"
          max="100"
          value={formData.yearsInBusiness || ''}
          onChange={(e) =>
            setFormData({
              ...formData,
              yearsInBusiness: e.target.value ? parseInt(e.target.value) : undefined,
            })
          }
          className="input w-32"
          placeholder="לדוגמה: 10"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        {onDelete && company ? (
          <button
            type="button"
            onClick={onDelete}
            className="text-danger text-sm hover:underline"
          >
            מחק חברה
          </button>
        ) : (
          <div />
        )}
        <div className="flex gap-3">
          <button type="button" onClick={onCancel} className="btn-secondary">
            ביטול
          </button>
          <button type="submit" className="btn-primary">
            {company ? 'שמור שינויים' : 'צור חברה'}
          </button>
        </div>
      </div>
    </form>
  );
}
