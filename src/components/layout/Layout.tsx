import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { CompanyProfile } from '@/types';

interface LayoutProps {
  children: ReactNode;
  currentCompany: CompanyProfile | null;
  onOpenCompanySettings: () => void;
  onOpenHistory: () => void;
  onOpenApiSettings: () => void;
  historyCount: number;
}

export function Layout({
  children,
  currentCompany,
  onOpenCompanySettings,
  onOpenHistory,
  onOpenApiSettings,
  historyCount,
}: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header
        currentCompany={currentCompany}
        onOpenCompanySettings={onOpenCompanySettings}
        onOpenHistory={onOpenHistory}
        onOpenApiSettings={onOpenApiSettings}
        historyCount={historyCount}
      />

      <main className="flex-1 py-6 px-4">
        <div className="max-w-5xl mx-auto">{children}</div>
      </main>

      <Footer />
    </div>
  );
}
