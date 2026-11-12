import { ReactNode } from "react";
import AppHeader, { HeaderUser } from "./AppHeader";
import AppFooter from "./AppFooter";

interface AppLayoutProps {
  children: ReactNode;
  user?: HeaderUser | null;
  onLogout?: () => void;
}

export function AppLayout({ children, user, onLogout }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
      <AppHeader user={user} onLogout={onLogout} />
      <main className="flex-1 pb-12">{children}</main>
      <AppFooter />
    </div>
  );
}

export default AppLayout;
