import { ReactNode } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
  sidebar: ReactNode;
  topBar: ReactNode;
}

export function DashboardLayout({
  children,
  sidebar,
  topBar,
}: DashboardLayoutProps) {
  return (
    <div className="flex h-full bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex-shrink-0">
        {sidebar}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-card border-b border-border flex-shrink-0">
          {topBar}
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
