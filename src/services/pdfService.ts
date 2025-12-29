import * as pdfjsLib from 'pdfjs-dist';
import type { SmartExtractResult, ExtractedSection } from '@/types';

// Configure PDF.js worker using CDN
const PDFJS_VERSION = '3.11.174';
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.js`;

/**
 * Keywords for identifying important sections in Hebrew tenders
 */
const IMPORTANT_KEYWORDS = {
  critical: [
    'תנאי סף',
    'תנאים מקדימים',
    'דרישות סף',
    'תנאים מוקדמים',
    'מועד אחרון',
    'מועד הגשה',
    'deadline',
    'ערבות',
    'ערבות הגשה',
    'ערבות ביצוע',
    'אופן הגשה',
    'אופן ההגשה',
    'מסמכים נדרשים',
    'מסמכי חובה',
    'פסילה',
    'עילות פסילה',
  ],
  high: [
    'קריטריונים',
    'קריטריון',
    'ניקוד',
    'שקלול',
    'הערכה',
    'אמות מידה',
    'הצעה מקצועית',
    'הצעה כספית',
    'הצעת מחיר',
    'תקופת התקשרות',
    'תקופת ההתקשרות',
    'היקף',
    'היקף העבודה',
    'תכולה',
    'שירותים נדרשים',
    'דרישות טכניות',
    'ניסיון נדרש',
    'כשירות',
  ],
  medium: [
    'רקע',
    'כללי',
    'תיאור',
    'מטרה',
    'מבוא',
    'הגדרות',
    'פרשנות',
    'שאלות הבהרה',
    'הבהרות',
    'לוח זמנים',
  ],
};

/**
 * Hebrew section number patterns
 */
const SECTION_PATTERNS = [
  /^[\u0590-\u05FF]?\s*(\d+\.)+\d*\s*/,        // 1.1, 1.1.1, etc.
  /^[\u0590-\u05FF]?\s*\d+\s*[\.\-\)]/,        // 1. or 1- or 1)
  /^[\u0590-\u05FF]?\s*[א-ת][\.\-\)]/,         // א. or א- or א)
  /^פרק\s+\d+/i,                               // פרק 1
  /^סעיף\s+\d+/i,                              // סעיף 1
  /^נספח\s+[א-ת\d]/i,                          // נספח א
];

/**
 * Extract text from a PDF file
 */
export async function extractTextFromPDF(
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ text: string; pageCount: number }> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const pageCount = pdf.numPages;
  const textContent: string[] = [];

  for (let i = 1; i <= pageCount; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();

    const pageText = content.items
      .map((item) => {
        if ('str' in item) {
          return item.str;
        }
        return '';
      })
      .join(' ');

    textContent.push(pageText);

    if (onProgress) {
      onProgress((i / pageCount) * 100);
    }
  }

  return {
    text: textContent.join('\n\n--- עמוד חדש ---\n\n'),
    pageCount,
  };
}

/**
 * Smart extract - identify and extract important sections from tender text
 */
export function smartExtract(fullText: string): SmartExtractResult {
  const sections = splitIntoSections(fullText);
  const scoredSections = sections.map((section) => ({
    ...section,
    score: calculateSectionScore(section.title + ' ' + section.content),
    importance: determineSectionImportance(section.title + ' ' + section.content),
  }));

  // Sort by score (descending) and take top sections
  scoredSections.sort((a, b) => b.score - a.score);

  // Calculate how many sections to include (aim for 30-40% of content)
  const totalLength = fullText.length;
  let includedLength = 0;
  const targetPercentage = 0.4; // 40% of original

  const relevantSections: ExtractedSection[] = [];

  for (const section of scoredSections) {
    const sectionLength = section.title.length + section.content.length;

    if (includedLength + sectionLength <= totalLength * targetPercentage || relevantSections.length < 5) {
      relevantSections.push({
        title: section.title,
        content: section.content,
        importance: section.importance,
      });
      includedLength += sectionLength;
    }

    // Stop if we have enough
    if (includedLength >= totalLength * targetPercentage && relevantSections.length >= 5) {
      break;
    }
  }

  // Sort by importance for display
  const importanceOrder = { critical: 0, high: 1, medium: 2 };
  relevantSections.sort((a, b) => importanceOrder[a.importance] - importanceOrder[b.importance]);

  const pageMatches = fullText.match(/--- עמוד חדש ---/g);
  const totalPages = pageMatches ? pageMatches.length + 1 : 1;

  return {
    relevantSections,
    summary: generateSummary(relevantSections),
    totalPages,
    extractedPercentage: Math.round((includedLength / totalLength) * 100),
  };
}

/**
 * Split text into sections based on headers
 */
function splitIntoSections(text: string): { title: string; content: string }[] {
  const lines = text.split('\n');
  const sections: { title: string; content: string }[] = [];

  let currentSection: { title: string; content: string[] } | null = null;

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (isLikelySectionHeader(trimmedLine)) {
      // Save previous section if exists
      if (currentSection) {
        sections.push({
          title: currentSection.title,
          content: currentSection.content.join('\n').trim(),
        });
      }

      // Start new section
      currentSection = {
        title: trimmedLine,
        content: [],
      };
    } else if (currentSection) {
      currentSection.content.push(trimmedLine);
    } else if (trimmedLine) {
      // Text before first header - create "intro" section
      if (sections.length === 0 || sections[sections.length - 1].title !== 'מבוא') {
        sections.push({
          title: 'מבוא',
          content: trimmedLine,
        });
      } else {
        sections[sections.length - 1].content += '\n' + trimmedLine;
      }
    }
  }

  // Don't forget the last section
  if (currentSection) {
    sections.push({
      title: currentSection.title,
      content: currentSection.content.join('\n').trim(),
    });
  }

  return sections.filter((s) => s.content.length > 50); // Filter out very short sections
}

/**
 * Determine if a line is likely a section header
 */
function isLikelySectionHeader(line: string): boolean {
  if (line.length > 100 || line.length < 3) return false;

  // Check for section number patterns
  for (const pattern of SECTION_PATTERNS) {
    if (pattern.test(line)) return true;
  }

  // Check for keywords that typically indicate headers
  const headerIndicators = ['תנאי סף', 'קריטריונים', 'מסמכים נדרשים', 'ערבות', 'לוח זמנים'];
  for (const indicator of headerIndicators) {
    if (line.includes(indicator) && line.length < 60) return true;
  }

  return false;
}

/**
 * Calculate importance score for a section
 */
function calculateSectionScore(text: string): number {
  let score = 0;
  const lowerText = text.toLowerCase();

  for (const keyword of IMPORTANT_KEYWORDS.critical) {
    if (lowerText.includes(keyword.toLowerCase())) {
      score += 10;
    }
  }

  for (const keyword of IMPORTANT_KEYWORDS.high) {
    if (lowerText.includes(keyword.toLowerCase())) {
      score += 5;
    }
  }

  for (const keyword of IMPORTANT_KEYWORDS.medium) {
    if (lowerText.includes(keyword.toLowerCase())) {
      score += 2;
    }
  }

  return score;
}

/**
 * Determine the importance level of a section
 */
function determineSectionImportance(text: string): 'critical' | 'high' | 'medium' {
  const lowerText = text.toLowerCase();

  for (const keyword of IMPORTANT_KEYWORDS.critical) {
    if (lowerText.includes(keyword.toLowerCase())) {
      return 'critical';
    }
  }

  for (const keyword of IMPORTANT_KEYWORDS.high) {
    if (lowerText.includes(keyword.toLowerCase())) {
      return 'high';
    }
  }

  return 'medium';
}

/**
 * Generate a brief summary of the extracted sections
 */
function generateSummary(sections: ExtractedSection[]): string {
  const criticalCount = sections.filter((s) => s.importance === 'critical').length;
  const highCount = sections.filter((s) => s.importance === 'high').length;

  const parts: string[] = [];

  if (criticalCount > 0) {
    parts.push(`${criticalCount} סעיפים קריטיים`);
  }

  if (highCount > 0) {
    parts.push(`${highCount} סעיפים חשובים`);
  }

  parts.push(`${sections.length} סעיפים בסך הכל`);

  return `זוהו: ${parts.join(', ')}`;
}

/**
 * Validate that a file is a valid PDF
 */
export function validatePDFFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 50 * 1024 * 1024; // 50MB

  if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
    return { valid: false, error: 'הקובץ חייב להיות PDF' };
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'הקובץ גדול מדי (מקסימום 50MB)' };
  }

  if (file.size === 0) {
    return { valid: false, error: 'הקובץ ריק' };
  }

  return { valid: true };
}

/**
 * Format extracted text for Claude API (with token limits in mind)
 */
export function formatTextForAnalysis(extractResult: SmartExtractResult): string {
  const parts: string[] = [];

  for (const section of extractResult.relevantSections) {
    parts.push(`### ${section.title}\n${section.content}`);
  }

  return parts.join('\n\n---\n\n');
}
