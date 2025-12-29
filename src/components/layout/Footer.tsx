export function Footer() {
  return (
    <footer className="py-6 px-4 border-t border-border bg-surface/50">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-secondary">
          <div className="flex items-center gap-2">
            <span>Tender Analyzer</span>
            <span className="text-border">|</span>
            <span>v1.0.0</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs">
              מופעל באמצעות Claude AI
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
