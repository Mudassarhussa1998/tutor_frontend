'use client';

type DashboardHeaderProps = {
  title?: string;
  subtitle?: string;
};

export function DashboardHeader({
  title = 'Dashboard',
  subtitle = "Welcome back, John. Here's what's happening today.",
}: DashboardHeaderProps) {
  return (
    <header className="bg-card border-b border-border px-8 py-4">
      <div>
        <h1 className="text-2xl font-semibold text-accent">{title}</h1>
        <p className="text-sm text-muted mt-1">{subtitle}</p>
      </div>
    </header>
  );
}