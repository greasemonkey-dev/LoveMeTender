import { useState, useEffect } from 'react';
import { storageService, testApiConnection } from '@/services';

export function ApiSettings() {
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; error?: string } | null>(null);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    const storedKey = storageService.getApiKey();
    if (storedKey) {
      setApiKey(storedKey);
    }
  }, []);

  const handleSave = () => {
    if (apiKey.trim()) {
      storageService.saveApiKey(apiKey.trim());
      setTestResult({ success: true });
    }
  };

  const handleTest = async () => {
    if (!apiKey.trim()) {
      setTestResult({ success: false, error: 'הכנס מפתח API' });
      return;
    }

    setIsLoading(true);
    setTestResult(null);

    // Temporarily save for testing
    storageService.saveApiKey(apiKey.trim());

    const result = await testApiConnection();
    setTestResult(result);
    setIsLoading(false);
  };

  const handleClear = () => {
    storageService.clearApiKey();
    setApiKey('');
    setTestResult(null);
  };

  const envKey = import.meta.env.VITE_CLAUDE_API_KEY;
  const hasEnvKey = envKey && envKey !== 'your_api_key_here';

  return (
    <div className="space-y-6">
      {hasEnvKey && (
        <div className="p-4 bg-success/10 rounded-lg border border-success/20">
          <div className="flex items-center gap-2 text-success">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">מפתח API מוגדר בסביבה</span>
          </div>
          <p className="text-sm text-secondary mt-1">
            המערכת משתמשת במפתח שהוגדר ב-VITE_CLAUDE_API_KEY
          </p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-primary mb-1.5">
          מפתח Claude API
        </label>
        <div className="relative">
          <input
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="input pl-20"
            placeholder="sk-ant-api..."
            dir="ltr"
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 text-secondary hover:text-primary"
          >
            {showKey ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
        <p className="text-xs text-secondary mt-1.5">
          ניתן לקבל מפתח מ-{' '}
          <a
            href="https://console.anthropic.com/account/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            console.anthropic.com
          </a>
        </p>
      </div>

      {/* Test result */}
      {testResult && (
        <div
          className={`p-3 rounded-lg ${
            testResult.success
              ? 'bg-success/10 border border-success/20'
              : 'bg-danger/10 border border-danger/20'
          }`}
        >
          <div className="flex items-center gap-2">
            {testResult.success ? (
              <>
                <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-success font-medium">החיבור תקין!</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-danger font-medium">{testResult.error}</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <button
          onClick={handleClear}
          className="text-danger text-sm hover:underline"
          disabled={!apiKey}
        >
          נקה מפתח
        </button>
        <div className="flex gap-3">
          <button onClick={handleTest} className="btn-secondary" disabled={isLoading}>
            {isLoading ? 'בודק...' : 'בדוק חיבור'}
          </button>
          <button onClick={handleSave} className="btn-primary">
            שמור
          </button>
        </div>
      </div>
    </div>
  );
}
