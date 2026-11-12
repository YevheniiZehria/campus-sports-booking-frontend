import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export interface Crumb {
  label: string;
  to?: string;
}

interface PageHeadingProps {
  eyebrow?: string;
  crumbs?: Crumb[];
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function PageHeading({ eyebrow, crumbs, title, subtitle, action }: PageHeadingProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1">
        {crumbs && crumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            {crumbs.map((crumb, index) => (
              <span key={index} className="inline-flex items-center gap-1.5">
                {crumb.to ? (
                  <Link to={crumb.to} className="hover:text-primary transition-colors hover:underline">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="font-medium text-foreground">{crumb.label}</span>
                )}
                {index < crumbs.length - 1 && <ChevronRight className="h-3 w-3 text-muted-foreground/60" />}
              </span>
            ))}
          </nav>
        )}
        {eyebrow && <p className="text-xs font-semibold tracking-wider text-primary uppercase">{eyebrow}</p>}
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground max-w-2xl">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export default PageHeading;
