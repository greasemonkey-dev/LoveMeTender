import type { CompanyProfile, TenderAnalysis } from '@/types';

const STORAGE_KEYS = {
  COMPANIES: 'tender_companies',
  TENDERS: 'tender_analyses',
  CURRENT_COMPANY: 'current_company_id',
  API_KEY: 'claude_api_key',
} as const;

const MAX_TENDERS = 50;

export const storageService = {
  // ============ Companies ============

  saveCompany(company: CompanyProfile): void {
    const companies = this.getCompanies();
    const index = companies.findIndex((c) => c.id === company.id);

    if (index >= 0) {
      companies[index] = { ...company, updatedAt: new Date().toISOString() };
    } else {
      companies.push({
        ...company,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(companies));
  },

  getCompanies(): CompanyProfile[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COMPANIES);
      return data ? JSON.parse(data) : [];
    } catch {
      console.error('Error reading companies from localStorage');
      return [];
    }
  },

  getCompany(id: string): CompanyProfile | null {
    return this.getCompanies().find((c) => c.id === id) || null;
  },

  deleteCompany(id: string): void {
    const companies = this.getCompanies().filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(companies));

    // Clear current company if it was deleted
    if (this.getCurrentCompanyId() === id) {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_COMPANY);
    }

    // Optionally delete all tenders for this company
    const tenders = this.getTenders().filter((t) => t.companyId !== id);
    localStorage.setItem(STORAGE_KEYS.TENDERS, JSON.stringify(tenders));
  },

  // ============ Current Company ============

  setCurrentCompany(id: string): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_COMPANY, id);
  },

  getCurrentCompanyId(): string | null {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_COMPANY);
  },

  getCurrentCompany(): CompanyProfile | null {
    const id = this.getCurrentCompanyId();
    if (!id) return null;
    return this.getCompany(id);
  },

  // ============ Tenders ============

  saveTender(tender: TenderAnalysis): void {
    const tenders = this.getTenders();

    // Check if tender already exists (update)
    const existingIndex = tenders.findIndex((t) => t.id === tender.id);
    if (existingIndex >= 0) {
      tenders[existingIndex] = tender;
    } else {
      // Add to beginning of list
      tenders.unshift(tender);
    }

    // Keep only the last MAX_TENDERS
    const trimmedTenders = tenders.slice(0, MAX_TENDERS);

    localStorage.setItem(STORAGE_KEYS.TENDERS, JSON.stringify(trimmedTenders));
  },

  getTenders(companyId?: string): TenderAnalysis[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TENDERS);
      const tenders: TenderAnalysis[] = data ? JSON.parse(data) : [];

      if (companyId) {
        return tenders.filter((t) => t.companyId === companyId);
      }

      return tenders;
    } catch {
      console.error('Error reading tenders from localStorage');
      return [];
    }
  },

  getTender(id: string): TenderAnalysis | null {
    return this.getTenders().find((t) => t.id === id) || null;
  },

  deleteTender(id: string): void {
    const tenders = this.getTenders().filter((t) => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.TENDERS, JSON.stringify(tenders));
  },

  updateTenderChecklist(tenderId: string, checklistItemId: string, completed: boolean): void {
    const tender = this.getTender(tenderId);
    if (!tender) return;

    tender.checklist = tender.checklist.map((item) =>
      item.id === checklistItemId ? { ...item, completed } : item
    );

    this.saveTender(tender);
  },

  // ============ API Key ============

  saveApiKey(key: string): void {
    localStorage.setItem(STORAGE_KEYS.API_KEY, key);
  },

  getApiKey(): string | null {
    return localStorage.getItem(STORAGE_KEYS.API_KEY);
  },

  clearApiKey(): void {
    localStorage.removeItem(STORAGE_KEYS.API_KEY);
  },

  // ============ Utils ============

  clearAll(): void {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  },

  getStorageUsage(): { used: number; total: number; percentage: number } {
    let used = 0;
    for (const key in localStorage) {
      if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
        used += localStorage.getItem(key)?.length || 0;
      }
    }

    // Estimated localStorage limit (usually 5MB)
    const total = 5 * 1024 * 1024;

    return {
      used,
      total,
      percentage: (used / total) * 100,
    };
  },

  exportData(): string {
    return JSON.stringify({
      companies: this.getCompanies(),
      tenders: this.getTenders(),
      currentCompanyId: this.getCurrentCompanyId(),
      exportDate: new Date().toISOString(),
    }, null, 2);
  },

  importData(jsonString: string): { success: boolean; error?: string } {
    try {
      const data = JSON.parse(jsonString);

      if (data.companies) {
        localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(data.companies));
      }

      if (data.tenders) {
        localStorage.setItem(STORAGE_KEYS.TENDERS, JSON.stringify(data.tenders));
      }

      if (data.currentCompanyId) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_COMPANY, data.currentCompanyId);
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: 'Invalid JSON format' };
    }
  },
};
