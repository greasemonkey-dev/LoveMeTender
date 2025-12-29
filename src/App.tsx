import { useState, useEffect, useCallback } from 'react';
import { Layout } from './components/layout';
import { PDFUploader, LoadingAnalysis } from './components/upload';
import { QuickOverview, AnalysisView } from './components/analysis';
import { CompanyProfileForm, CompanySelector } from './components/company';
import { TenderHistory } from './components/history';
import { Modal, ApiSettings } from './components/common';
import { storageService, runTenderAnalysis } from './services';
import type { CompanyProfile, TenderAnalysis, AnalysisState } from './types';

type View = 'home' | 'analysis';
type ModalType = 'company' | 'history' | 'api' | 'quickOverview' | null;

function App() {
  // State
  const [view, setView] = useState<View>('home');
  const [currentCompany, setCurrentCompany] = useState<CompanyProfile | null>(null);
  const [companies, setCompanies] = useState<CompanyProfile[]>([]);
  const [tenders, setTenders] = useState<TenderAnalysis[]>([]);
  const [currentTender, setCurrentTender] = useState<TenderAnalysis | null>(null);
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    status: 'idle',
    progress: 0,
    currentStage: 0,
  });
  const [modalType, setModalType] = useState<ModalType>(null);
  const [editingCompany, setEditingCompany] = useState<CompanyProfile | null>(null);

  // Load data on mount
  useEffect(() => {
    const loadedCompanies = storageService.getCompanies();
    setCompanies(loadedCompanies);

    const current = storageService.getCurrentCompany();
    if (current) {
      setCurrentCompany(current);
    } else if (loadedCompanies.length > 0) {
      setCurrentCompany(loadedCompanies[0]);
      storageService.setCurrentCompany(loadedCompanies[0].id);
    }

    setTenders(storageService.getTenders());
  }, []);

  // Handlers
  const handleFileSelect = useCallback(
    async (file: File) => {
      if (!currentCompany) {
        setModalType('company');
        return;
      }

      setAnalysisState({
        status: 'uploading',
        progress: 0,
        currentStage: 0,
      });

      try {
        const tender = await runTenderAnalysis(file, currentCompany, setAnalysisState);

        setCurrentTender(tender);
        setTenders(storageService.getTenders());
        setModalType('quickOverview');
        setAnalysisState({
          status: 'idle',
          progress: 0,
          currentStage: 0,
        });
      } catch (error) {
        console.error('Analysis failed:', error);
        setAnalysisState({
          status: 'error',
          progress: 0,
          currentStage: 0,
          error: error instanceof Error ? error.message : 'שגיאה בניתוח המכרז',
        });
      }
    },
    [currentCompany]
  );

  const handleSaveCompany = useCallback((company: CompanyProfile) => {
    storageService.saveCompany(company);
    setCompanies(storageService.getCompanies());

    if (!currentCompany || editingCompany?.id === company.id) {
      setCurrentCompany(company);
      storageService.setCurrentCompany(company.id);
    }

    setEditingCompany(null);
    setModalType(null);
  }, [currentCompany, editingCompany]);

  const handleSelectCompany = useCallback((company: CompanyProfile) => {
    setCurrentCompany(company);
    storageService.setCurrentCompany(company.id);
    setModalType(null);
  }, []);

  const handleDeleteCompany = useCallback(() => {
    if (!editingCompany) return;

    storageService.deleteCompany(editingCompany.id);
    const remaining = storageService.getCompanies();
    setCompanies(remaining);

    if (currentCompany?.id === editingCompany.id) {
      const next = remaining[0] || null;
      setCurrentCompany(next);
      if (next) {
        storageService.setCurrentCompany(next.id);
      }
    }

    setTenders(storageService.getTenders());
    setEditingCompany(null);
    setModalType(null);
  }, [editingCompany, currentCompany]);

  const handleDeleteTender = useCallback((tenderId: string) => {
    storageService.deleteTender(tenderId);
    setTenders(storageService.getTenders());
  }, []);

  const handleSelectTender = useCallback((tender: TenderAnalysis) => {
    setCurrentTender(tender);
    setModalType(null);
    setView('analysis');
  }, []);

  const handleUpdateChecklist = useCallback(
    (itemId: string, completed: boolean) => {
      if (!currentTender) return;

      storageService.updateTenderChecklist(currentTender.id, itemId, completed);
      const updated = storageService.getTender(currentTender.id);
      if (updated) {
        setCurrentTender(updated);
        setTenders(storageService.getTenders());
      }
    },
    [currentTender]
  );

  const handleViewDetails = useCallback(() => {
    setModalType(null);
    setView('analysis');
  }, []);

  const handleBackToHome = useCallback(() => {
    setView('home');
    setCurrentTender(null);
  }, []);

  // Render analysis view
  if (view === 'analysis' && currentTender) {
    return (
      <AnalysisView
        analysis={currentTender}
        onClose={handleBackToHome}
        onUpdateChecklist={handleUpdateChecklist}
      />
    );
  }

  // Render home view
  const isAnalyzing = ['uploading', 'extracting', 'analyzing'].includes(analysisState.status);

  return (
    <Layout
      currentCompany={currentCompany}
      onOpenCompanySettings={() => {
        setEditingCompany(null);
        setModalType('company');
      }}
      onOpenHistory={() => setModalType('history')}
      onOpenApiSettings={() => setModalType('api')}
      historyCount={tenders.length}
    >
      {/* Main content */}
      <div className="py-8">
        {isAnalyzing ? (
          <LoadingAnalysis
            currentStage={analysisState.currentStage}
            fileName={undefined}
          />
        ) : analysisState.status === 'error' ? (
          <div className="max-w-md mx-auto text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-danger/10 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-danger"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-primary mb-2">שגיאה בניתוח</h2>
            <p className="text-secondary mb-6">{analysisState.error}</p>
            <button
              onClick={() =>
                setAnalysisState({ status: 'idle', progress: 0, currentStage: 0 })
              }
              className="btn-primary"
            >
              נסה שוב
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Company info banner */}
            {currentCompany && (
              <div className="flex items-center justify-between p-4 bg-surface rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-primary">{currentCompany.name}</div>
                    <div className="text-sm text-secondary">
                      {currentCompany.expertise.slice(0, 3).join(', ')}
                      {currentCompany.expertise.length > 3 && ` +${currentCompany.expertise.length - 3}`}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setEditingCompany(null);
                    setModalType('company');
                  }}
                  className="text-sm text-primary hover:underline"
                >
                  שנה
                </button>
              </div>
            )}

            {!currentCompany && (
              <div className="p-4 bg-warning/10 border border-warning/20 rounded-xl flex items-center gap-3">
                <svg
                  className="w-5 h-5 text-warning flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <div className="flex-1">
                  <div className="font-medium text-primary">לא הוגדרה חברה</div>
                  <div className="text-sm text-secondary">
                    הגדר פרופיל חברה כדי לקבל ניתוח התאמה מותאם אישית
                  </div>
                </div>
                <button
                  onClick={() => {
                    setEditingCompany(null);
                    setModalType('company');
                  }}
                  className="btn-primary"
                >
                  הגדר חברה
                </button>
              </div>
            )}

            {/* PDF Uploader */}
            <div>
              <h2 className="text-xl font-semibold text-primary mb-4">העלאת מכרז חדש</h2>
              <PDFUploader onFileSelect={handleFileSelect} disabled={!currentCompany} />
            </div>

            {/* Recent tenders */}
            {tenders.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-primary">מכרזים אחרונים</h2>
                  <button
                    onClick={() => setModalType('history')}
                    className="text-sm text-primary hover:underline"
                  >
                    ראה הכל
                  </button>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {tenders.slice(0, 4).map((tender) => (
                    <div
                      key={tender.id}
                      className="card-hover p-4 cursor-pointer"
                      onClick={() => handleSelectTender(tender)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-primary truncate">
                            {tender.basicInfo.name}
                          </h3>
                          <p className="text-sm text-secondary mt-0.5">
                            {tender.basicInfo.issuer}
                          </p>
                        </div>
                        <div
                          className={`px-2 py-1 rounded-lg ${
                            tender.matchAnalysis.fitLevel === 'high'
                              ? 'bg-success/10 text-success'
                              : tender.matchAnalysis.fitLevel === 'medium'
                              ? 'bg-warning/10 text-warning'
                              : 'bg-danger/10 text-danger'
                          }`}
                        >
                          <span className="text-lg font-bold">
                            {tender.matchAnalysis.overallScore.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Company Modal */}
      <Modal
        isOpen={modalType === 'company'}
        onClose={() => {
          setModalType(null);
          setEditingCompany(null);
        }}
        title={editingCompany ? 'עריכת חברה' : companies.length === 0 ? 'צור חברה חדשה' : 'הגדרות חברה'}
        size="lg"
      >
        {editingCompany || companies.length === 0 ? (
          <CompanyProfileForm
            company={editingCompany}
            onSave={handleSaveCompany}
            onCancel={() => {
              if (companies.length === 0) {
                setModalType(null);
              } else {
                setEditingCompany(null);
              }
            }}
            onDelete={editingCompany ? handleDeleteCompany : undefined}
          />
        ) : (
          <CompanySelector
            companies={companies}
            currentCompany={currentCompany}
            onSelect={handleSelectCompany}
            onCreateNew={() => setEditingCompany({} as CompanyProfile)}
            onEdit={(company) => setEditingCompany(company)}
          />
        )}
      </Modal>

      {/* History Modal */}
      <Modal
        isOpen={modalType === 'history'}
        onClose={() => setModalType(null)}
        title="היסטוריית מכרזים"
        size="lg"
      >
        <TenderHistory
          tenders={tenders}
          onSelectTender={handleSelectTender}
          onDeleteTender={handleDeleteTender}
        />
      </Modal>

      {/* API Settings Modal */}
      <Modal
        isOpen={modalType === 'api'}
        onClose={() => setModalType(null)}
        title="הגדרות API"
        size="md"
      >
        <ApiSettings />
      </Modal>

      {/* Quick Overview Modal */}
      <Modal
        isOpen={modalType === 'quickOverview' && currentTender !== null}
        onClose={() => setModalType(null)}
        size="lg"
      >
        {currentTender && (
          <QuickOverview
            analysis={currentTender}
            onViewDetails={handleViewDetails}
            onClose={() => setModalType(null)}
          />
        )}
      </Modal>
    </Layout>
  );
}

export default App;
