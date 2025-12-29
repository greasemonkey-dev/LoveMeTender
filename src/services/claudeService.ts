import type { CompanyProfile, TenderAnalysis, ClaudeAnalysisResponse } from '@/types';
import { generateId } from '@/utils/formatters';
import { storageService } from './storageService';

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';
const MAX_TOKENS = 4096;

/**
 * Get API key from environment or storage
 */
function getApiKey(): string | null {
  // First try environment variable
  const envKey = import.meta.env.VITE_CLAUDE_API_KEY;
  if (envKey && envKey !== 'your_api_key_here') {
    return envKey;
  }

  // Fall back to stored key
  return storageService.getApiKey();
}

/**
 * Build the analysis prompt for Claude
 */
function buildAnalysisPrompt(extractedText: string, company: CompanyProfile): string {
  return `אתה מנתח מכרזים מקצועי וותיק בישראל. נתח את המכרז הבא עבור החברה המתוארת למטה.

**פרופיל החברה:**
- שם: ${company.name}
- תיאור: ${company.description}
- תחומי מומחיות: ${company.expertise.join(', ')}
- גודל: ${company.size === 'small' ? '1-10 עובדים' : company.size === 'medium' ? '11-50 עובדים' : '51+ עובדים'}
- ניסיון במגזרים: ${company.experience.join(', ')}
${company.certifications?.length ? `- הסמכות: ${company.certifications.join(', ')}` : ''}
${company.yearsInBusiness ? `- שנות פעילות: ${company.yearsInBusiness}` : ''}

**טקסט המכרז (סעיפים רלוונטיים):**
${extractedText}

---

נתח את המכרז והחזר JSON במבנה הבא בלבד (ללא markdown, ללא הסברים, רק JSON טהור):

{
  "basicInfo": {
    "name": "שם המכרז",
    "number": "מספר המכרז",
    "issuer": "הגוף המזמין",
    "deadline": "YYYY-MM-DD או null אם לא צוין",
    "guarantee": מספר (סכום ערבות בש"ח) או null,
    "type": "two-stage" | "regular" | "framework"
  },
  "thresholdRequirements": [
    {
      "requirement": "תיאור מלא של תנאי הסף",
      "category": "company" | "candidate" | "financial" | "legal",
      "companyStatus": "yes" | "no" | "check" | "unknown",
      "importance": "critical" | "high" | "medium",
      "notes": "הסבר קצר על סטטוס החברה ביחס לתנאי",
      "documentsNeeded": ["מסמך 1", "מסמך 2"]
    }
  ],
  "scoringCriteria": [
    {
      "criterion": "שם הקריטריון",
      "weight": מספר 0-100,
      "category": "quality" | "price",
      "companyFit": "strong" | "medium" | "weak" | "unknown",
      "notes": "הערות על התאמת החברה"
    }
  ],
  "checklist": [
    {
      "category": "מסמכים משפטיים" | "מסמכים טכניים" | "מסמכים פיננסיים" | "טפסי הגשה" | "אחר",
      "item": "שם המסמך או הפעולה",
      "required": true | false,
      "notes": "הערות נוספות (אופציונלי)"
    }
  ],
  "matchAnalysis": {
    "overallScore": מספר 1-10,
    "fitLevel": "low" | "medium" | "high",
    "strengths": ["יתרון 1", "יתרון 2", "יתרון 3"],
    "challenges": ["אתגר 1", "אתגר 2"],
    "blockers": ["חוסם 1"] או [] אם אין,
    "recommendation": "המלצה מפורטת בעברית - האם להגיש, מה הסיכויים, ומה צריך להתמקד בו"
  }
}

הנחיות חשובות:
1. היה ביקורתי והוגן - אל תנפח ציונים
2. אם מידע חסר במכרז, סמן "unknown" או null
3. התבסס רק על מה שכתוב במכרז
4. ב-recommendation תן תשובה ישירה: "מומלץ להגיש", "לא מומלץ", או "מותנה ב..."
5. אם יש תנאי סף שהחברה לא עומדת בו - זה חוסם (blocker)
6. הקפד על פורמט JSON תקין`;
}

/**
 * Parse Claude's response to extract JSON
 */
function parseClaudeResponse(responseText: string): ClaudeAnalysisResponse {
  // Try to extract JSON from the response
  let jsonText = responseText.trim();

  // Remove markdown code blocks if present
  jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  // Try to find JSON object boundaries
  const jsonStart = jsonText.indexOf('{');
  const jsonEnd = jsonText.lastIndexOf('}');

  if (jsonStart !== -1 && jsonEnd !== -1) {
    jsonText = jsonText.slice(jsonStart, jsonEnd + 1);
  }

  try {
    return JSON.parse(jsonText);
  } catch (err) {
    console.error('Failed to parse Claude response:', err);
    console.error('Response text:', responseText);
    throw new Error('שגיאה בפענוח תשובת הניתוח. נסה שוב.');
  }
}

/**
 * Analyze tender using Claude API
 */
export async function analyzeTender(
  extractedText: string,
  company: CompanyProfile,
  fileName: string
): Promise<TenderAnalysis> {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error('מפתח API לא הוגדר. הגדר את VITE_CLAUDE_API_KEY או הכנס מפתח בהגדרות.');
  }

  const prompt = buildAnalysisPrompt(extractedText, company);

  const response = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Claude API error:', errorData);

    if (response.status === 401) {
      throw new Error('מפתח API לא תקין. בדוק את המפתח בהגדרות.');
    }

    if (response.status === 429) {
      throw new Error('חריגה ממגבלת בקשות. נסה שוב בעוד מספר דקות.');
    }

    throw new Error(`שגיאה בקריאה ל-API: ${response.status}`);
  }

  const data = await response.json();

  if (!data.content || !data.content[0] || !data.content[0].text) {
    throw new Error('תשובה לא תקינה מהשרת');
  }

  const analysisResult = parseClaudeResponse(data.content[0].text);

  // Build the full TenderAnalysis object
  const tenderId = generateId();

  const tender: TenderAnalysis = {
    id: tenderId,
    uploadDate: new Date().toISOString(),
    fileName,
    companyId: company.id,
    basicInfo: analysisResult.basicInfo,
    thresholdRequirements: analysisResult.thresholdRequirements.map((req, index) => ({
      ...req,
      id: `req-${tenderId}-${index}`,
    })),
    scoringCriteria: analysisResult.scoringCriteria.map((crit, index) => ({
      ...crit,
      id: `crit-${tenderId}-${index}`,
    })),
    checklist: analysisResult.checklist.map((item, index) => ({
      ...item,
      id: `check-${tenderId}-${index}`,
      completed: false,
    })),
    matchAnalysis: analysisResult.matchAnalysis,
    rawPdfText: extractedText,
  };

  return tender;
}

/**
 * Test API connection
 */
export async function testApiConnection(): Promise<{ success: boolean; error?: string }> {
  const apiKey = getApiKey();

  if (!apiKey) {
    return { success: false, error: 'מפתח API לא הוגדר' };
  }

  try {
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 10,
        messages: [
          {
            role: 'user',
            content: 'בדיקה',
          },
        ],
      }),
    });

    if (response.ok) {
      return { success: true };
    }

    if (response.status === 401) {
      return { success: false, error: 'מפתח API לא תקין' };
    }

    return { success: false, error: `שגיאה: ${response.status}` };
  } catch (err) {
    return { success: false, error: 'בעיית חיבור לשרת' };
  }
}
