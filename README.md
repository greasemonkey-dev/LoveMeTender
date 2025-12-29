# Tender Analyzer | ניתוח מכרזים

כלי ניתוח מכרזים חכם לחברות טכנולוגיה, המופעל על ידי Claude AI.

## תכונות

- **העלאת PDF** - העלה מסמך מכרז עד 100 עמודים
- **חילוץ חכם** - אלגוריתם שמזהה את הסעיפים החשובים ביותר
- **ניתוח AI** - ניתוח מקיף באמצעות Claude AI:
  - תנאי סף + בדיקת התאמה לחברה
  - קריטריוני ניקוד ומשקלות
  - צ'קליסט מסמכים נדרשים
  - ציון התאמה והמלצה להגשה
- **פרופילי חברות** - שמירת פרופילים מרובים לניתוח מותאם אישית
- **היסטוריה** - גישה מהירה למכרזים שנותחו

## התקנה

```bash
# התקנת תלויות
npm install

# הפעלת סביבת פיתוח
npm run dev

# בניית גרסת production
npm run build
```

## הגדרת API Key

### אופציה 1: משתנה סביבה (מומלץ)

צור קובץ `.env` בתיקיית הפרויקט:

```env
VITE_CLAUDE_API_KEY=sk-ant-api-...
```

### אופציה 2: דרך הממשק

לחץ על כפתור ההגדרות (גלגל שיניים) והכנס את מפתח ה-API.

## קבלת מפתח API

1. היכנס ל-[console.anthropic.com](https://console.anthropic.com/)
2. צור חשבון או התחבר
3. לך ל-"API Keys" וצור מפתח חדש
4. העתק את המפתח והדבק באפליקציה

## שימוש

1. **הגדר פרופיל חברה** - מלא את פרטי החברה, תחומי מומחיות וניסיון
2. **העלה מכרז** - גרור קובץ PDF או לחץ לבחירה
3. **המתן לניתוח** - המערכת מעבדת ומנתחת את המכרז (15-30 שניות)
4. **צפה בתוצאות** - קבל ניתוח מפורט עם המלצה להגשה

## טכנולוגיות

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **PDF Processing**: PDF.js
- **AI**: Claude API (claude-sonnet-4-20250514)
- **Storage**: localStorage
- **Build**: Vite

## מבנה הפרויקט

```
src/
├── components/
│   ├── layout/      # Header, Footer, Layout
│   ├── upload/      # PDFUploader, LoadingAnalysis
│   ├── analysis/    # QuickOverview, ThresholdRequirements, etc.
│   ├── company/     # CompanyProfile, CompanySelector
│   ├── history/     # TenderHistory, TenderCard
│   └── common/      # Modal, ApiSettings
├── services/
│   ├── pdfService.ts      # קריאת PDF
│   ├── claudeService.ts   # קריאות API
│   ├── storageService.ts  # localStorage
│   └── analysisService.ts # זרימת הניתוח
├── types/           # TypeScript interfaces
├── utils/           # פונקציות עזר
└── App.tsx          # קומפוננטה ראשית
```

## פריסה

### GitHub Pages (מומלץ)

הפרויקט מוגדר עם GitHub Actions לפריסה אוטומטית:

1. לך להגדרות הריפו: Settings → Pages
2. תחת "Build and deployment" בחר: **GitHub Actions**
3. כל push ל-`main` יפרס אוטומטית

**חשוב:** אם שם הריפו שלך שונה מ-`LoveMeTender`, עדכן את `base` ב-`vite.config.ts`:
```ts
base: '/your-repo-name/',
```

### אפשרויות נוספות

- **Netlify**: `npm run build` → העלה את תיקיית `dist`
- **Vercel**: חבר ישירות מ-GitHub
- **Cloudflare Pages**: `npm run build` → Deploy

## רישיון

MIT
