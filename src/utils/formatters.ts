/**
 * Format a date string to Hebrew locale
 */
export function formatDate(date: string | Date | null): string {
  if (!date) return 'לא צוין';

  const d = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(d.getTime())) return 'לא צוין';

  return d.toLocaleDateString('he-IL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format a date to short format
 */
export function formatDateShort(date: string | Date | null): string {
  if (!date) return 'לא צוין';

  const d = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(d.getTime())) return 'לא צוין';

  return d.toLocaleDateString('he-IL', {
    day: 'numeric',
    month: 'numeric',
    year: '2-digit',
  });
}

/**
 * Format currency in ILS
 */
export function formatCurrency(amount: number | null): string {
  if (amount === null || amount === undefined) return 'לא צוין';

  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a number with thousands separator
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('he-IL').format(num);
}

/**
 * Format relative time (e.g., "לפני 2 ימים")
 */
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'היום';
  if (diffDays === 1) return 'אתמול';
  if (diffDays < 7) return `לפני ${diffDays} ימים`;
  if (diffDays < 30) return `לפני ${Math.floor(diffDays / 7)} שבועות`;
  if (diffDays < 365) return `לפני ${Math.floor(diffDays / 30)} חודשים`;
  return `לפני ${Math.floor(diffDays / 365)} שנים`;
}

/**
 * Calculate days until deadline
 */
export function daysUntilDeadline(deadline: string | null): number | null {
  if (!deadline) return null;

  const d = new Date(deadline);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();

  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Get deadline urgency level
 */
export function getDeadlineUrgency(deadline: string | null): 'critical' | 'warning' | 'normal' | null {
  const days = daysUntilDeadline(deadline);

  if (days === null) return null;
  if (days < 0) return 'critical';
  if (days <= 7) return 'critical';
  if (days <= 14) return 'warning';
  return 'normal';
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return crypto.randomUUID ? crypto.randomUUID() :
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
}

/**
 * Get fit level label in Hebrew
 */
export function getFitLevelLabel(level: 'low' | 'medium' | 'high'): string {
  const labels = {
    low: 'התאמה נמוכה',
    medium: 'התאמה בינונית',
    high: 'התאמה גבוהה',
  };
  return labels[level];
}

/**
 * Get status label in Hebrew
 */
export function getStatusLabel(status: 'yes' | 'no' | 'check' | 'unknown'): string {
  const labels = {
    yes: 'עומדת בתנאי',
    no: 'לא עומדת',
    check: 'לבדוק',
    unknown: 'לא ברור',
  };
  return labels[status];
}

/**
 * Get category label in Hebrew
 */
export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    company: 'חברה',
    candidate: 'מועמד',
    financial: 'פיננסי',
    legal: 'משפטי',
    quality: 'איכות',
    price: 'מחיר',
  };
  return labels[category] || category;
}

/**
 * Get importance label in Hebrew
 */
export function getImportanceLabel(importance: 'critical' | 'high' | 'medium'): string {
  const labels = {
    critical: 'קריטי',
    high: 'גבוה',
    medium: 'בינוני',
  };
  return labels[importance];
}
