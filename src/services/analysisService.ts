import type { CompanyProfile, TenderAnalysis, AnalysisState } from '@/types';
import { extractTextFromPDF, smartExtract, validatePDFFile, formatTextForAnalysis } from './pdfService';
import { analyzeTender } from './claudeService';
import { storageService } from './storageService';

export type AnalysisProgressCallback = (state: AnalysisState) => void;

/**
 * Complete tender analysis flow
 */
export async function runTenderAnalysis(
  file: File,
  company: CompanyProfile,
  onProgress: AnalysisProgressCallback
): Promise<TenderAnalysis> {
  // Stage 0: Validation
  onProgress({
    status: 'uploading',
    progress: 0,
    currentStage: 0,
  });

  const validation = validatePDFFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Stage 1: Extract PDF text
  onProgress({
    status: 'extracting',
    progress: 10,
    currentStage: 1,
  });

  const { text, pageCount } = await extractTextFromPDF(file, (pdfProgress) => {
    onProgress({
      status: 'extracting',
      progress: 10 + (pdfProgress * 0.2), // 10-30%
      currentStage: 1,
    });
  });

  if (text.length < 100) {
    throw new Error('לא הצלחנו לחלץ טקסט מה-PDF. ייתכן שהקובץ מוגן או סרוק.');
  }

  console.log(`Extracted ${text.length} characters from ${pageCount} pages`);

  // Stage 2: Smart extract
  onProgress({
    status: 'extracting',
    progress: 35,
    currentStage: 2,
  });

  const extractResult = smartExtract(text);
  const formattedText = formatTextForAnalysis(extractResult);

  console.log(`Smart extract: ${extractResult.relevantSections.length} sections, ${extractResult.extractedPercentage}% of original`);

  onProgress({
    status: 'analyzing',
    progress: 45,
    currentStage: 2,
  });

  // Stage 3: Claude analysis
  onProgress({
    status: 'analyzing',
    progress: 50,
    currentStage: 3,
  });

  const tender = await analyzeTender(formattedText, company, file.name);

  // Stage 4: Format results
  onProgress({
    status: 'analyzing',
    progress: 90,
    currentStage: 4,
  });

  // Save to storage
  storageService.saveTender(tender);

  // Complete
  onProgress({
    status: 'complete',
    progress: 100,
    currentStage: 5,
  });

  return tender;
}

/**
 * Re-analyze an existing tender with updated company profile
 */
export async function reAnalyzeTender(
  tenderId: string,
  company: CompanyProfile,
  onProgress: AnalysisProgressCallback
): Promise<TenderAnalysis> {
  const existingTender = storageService.getTender(tenderId);

  if (!existingTender || !existingTender.rawPdfText) {
    throw new Error('לא נמצא מידע על המכרז לניתוח מחדש');
  }

  onProgress({
    status: 'analyzing',
    progress: 20,
    currentStage: 3,
  });

  const newAnalysis = await analyzeTender(
    existingTender.rawPdfText,
    company,
    existingTender.fileName
  );

  // Preserve some data from original
  newAnalysis.id = tenderId;
  newAnalysis.uploadDate = existingTender.uploadDate;

  // Preserve checklist completion status
  if (existingTender.checklist) {
    const completedItems = new Set(
      existingTender.checklist.filter((item) => item.completed).map((item) => item.item)
    );

    newAnalysis.checklist = newAnalysis.checklist.map((item) => ({
      ...item,
      completed: completedItems.has(item.item),
    }));
  }

  // Save updated tender
  storageService.saveTender(newAnalysis);

  onProgress({
    status: 'complete',
    progress: 100,
    currentStage: 5,
  });

  return newAnalysis;
}

/**
 * Get statistics for a company's tenders
 */
export function getCompanyTenderStats(companyId: string): {
  total: number;
  highFit: number;
  mediumFit: number;
  lowFit: number;
  averageScore: number;
  recentTenders: TenderAnalysis[];
} {
  const tenders = storageService.getTenders(companyId);

  const stats = {
    total: tenders.length,
    highFit: tenders.filter((t) => t.matchAnalysis.fitLevel === 'high').length,
    mediumFit: tenders.filter((t) => t.matchAnalysis.fitLevel === 'medium').length,
    lowFit: tenders.filter((t) => t.matchAnalysis.fitLevel === 'low').length,
    averageScore: 0,
    recentTenders: tenders.slice(0, 5),
  };

  if (tenders.length > 0) {
    const totalScore = tenders.reduce((sum, t) => sum + t.matchAnalysis.overallScore, 0);
    stats.averageScore = totalScore / tenders.length;
  }

  return stats;
}

/**
 * Export tender analysis as a formatted report
 */
export function exportTenderReport(tender: TenderAnalysis): string {
  const sections: string[] = [];

  // Header
  sections.push(`# דו"ח ניתוח מכרז`);
  sections.push(`**${tender.basicInfo.name}**`);
  sections.push(`מספר מכרז: ${tender.basicInfo.number}`);
  sections.push(`גוף מזמין: ${tender.basicInfo.issuer}`);
  sections.push(`תאריך ניתוח: ${new Date(tender.uploadDate).toLocaleDateString('he-IL')}`);
  sections.push('');

  // Match Analysis
  sections.push(`## סיכום התאמה`);
  sections.push(`ציון: **${tender.matchAnalysis.overallScore}/10**`);
  sections.push(`רמת התאמה: ${tender.matchAnalysis.fitLevel}`);
  sections.push('');
  sections.push(`### המלצה`);
  sections.push(tender.matchAnalysis.recommendation);
  sections.push('');

  // Threshold Requirements
  sections.push(`## תנאי סף (${tender.thresholdRequirements.length})`);
  for (const req of tender.thresholdRequirements) {
    const status = req.companyStatus === 'yes' ? '✓' : req.companyStatus === 'no' ? '✗' : '?';
    sections.push(`- [${status}] ${req.requirement}`);
    if (req.notes) sections.push(`  - ${req.notes}`);
  }
  sections.push('');

  // Scoring Criteria
  sections.push(`## קריטריוני ניקוד`);
  for (const crit of tender.scoringCriteria) {
    sections.push(`- ${crit.criterion} (${crit.weight}%) - התאמה: ${crit.companyFit}`);
  }
  sections.push('');

  // Checklist
  sections.push(`## רשימת מסמכים`);
  const byCategory = tender.checklist.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof tender.checklist>);

  for (const [category, items] of Object.entries(byCategory)) {
    sections.push(`### ${category}`);
    for (const item of items) {
      const check = item.completed ? '✓' : '☐';
      const required = item.required ? '*' : '';
      sections.push(`- [${check}] ${item.item}${required}`);
    }
  }

  return sections.join('\n');
}
