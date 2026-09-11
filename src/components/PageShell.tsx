import type { ReactNode } from "react";

export function PageShell({ children, className = "" }: { children?: ReactNode; className?: string }) {
  return <main className={`page-shell ${className}`}><div className="paper-grain" />{children}</main>;
}
