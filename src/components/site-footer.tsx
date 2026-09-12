export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="shell flex flex-col gap-1 py-6 text-xs text-foreground-muted sm:flex-row sm:items-center sm:justify-between">
        <p>CarbonLoop — GIS-powered waste-to-carbon-value chain tracker.</p>
        <p>All carbon and economic coefficients are illustrative MVP assumptions, not verified real-world values.</p>
      </div>
    </footer>
  );
}
