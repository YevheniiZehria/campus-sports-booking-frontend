import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LogIn, LogOut, Menu, Shield, User, X } from "lucide-react";
import { Logo } from "./Logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface HeaderUser {
  id: number;
  email: string;
  fullName: string;
  role: "student" | "profesor" | "administrator";
  isBlocked?: boolean;
}

interface AppHeaderProps {
  user?: HeaderUser | null;
  onLogout?: () => void;
}

export function AppHeader({ user, onLogout }: AppHeaderProps) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Facilități", path: "/" },
    { label: "Rezervă", path: "/rezerva" },
    ...(user ? [{ label: "Rezervările mele", path: "/rezervarile-mele" }] : []),
    ...(user?.role === "administrator" ? [{ label: "Administrare", path: "/admin" }] : []),
  ];

  const getRoleBadge = () => {
    if (!user) return null;
    if (user.role === "student") {
      return (
        <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-50 text-[11px] font-normal">
          Student · max 3 rezervări / lună
        </Badge>
      );
    }
    if (user.role === "profesor") {
      return (
        <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 text-[11px] font-normal">
          Cadru didactic
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="bg-purple-50 text-purple-700 hover:bg-purple-50 text-[11px] font-normal flex items-center gap-1">
        <Shield className="h-3 w-3" /> Administrator
      </Badge>
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-card/95 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-8">
          <Logo />
          {/* Navigare Desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive =
                item.path === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "relative px-3.5 py-2 text-sm font-medium transition-colors hover:text-primary",
                    isActive
                      ? "text-primary font-semibold after:absolute after:bottom-[-13px] after:left-0 after:right-0 after:h-[2.5px] after:bg-primary after:rounded-t-full"
                      : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Partea dreaptă - Desktop */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end text-right">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{user.fullName}</span>
                  {getRoleBadge()}
                </div>
                <span className="text-xs text-muted-foreground">{user.email}</span>
              </div>
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-xs"
                title={user.fullName}
              >
                {getInitials(user.fullName)}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onLogout}
                title="Deconectare"
                className="text-muted-foreground hover:text-destructive"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" size="sm">
                <Link to="/login" className="flex items-center gap-1.5">
                  <LogIn className="h-4 w-4" />
                  <span>Intră în cont</span>
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/inregistrare">Creează cont</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Buton meniu mobil */}
        <div className="flex md:hidden items-center gap-2">
          {user && (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {getInitials(user.fullName)}
            </div>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-muted-foreground hover:text-foreground focus:outline-none"
            aria-label="Deschide meniul"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Meniu Mobil */}
      {mobileMenuOpen && (
        <div className="border-b border-border bg-card px-4 pt-2 pb-6 md:hidden">
          {user && (
            <div className="mb-4 rounded-lg bg-muted/60 p-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {getInitials(user.fullName)}
                </div>
                <div>
                  <p className="text-sm font-semibold">{user.fullName}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <div className="mt-2">{getRoleBadge()}</div>
            </div>
          )}

          <nav className="flex flex-col space-y-1">
            {navItems.map((item) => {
              const isActive =
                item.path === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center rounded-md px-3 py-2.5 text-base font-medium min-h-[44px]",
                    isActive
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-4 pt-4 border-t border-border">
            {user ? (
              <Button
                variant="outline"
                className="w-full min-h-[44px] justify-start text-destructive hover:bg-destructive/10"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLogout?.();
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Deconectare
              </Button>
            ) : (
              <div className="flex flex-col gap-2">
                <Button asChild className="w-full min-h-[44px]">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <LogIn className="mr-2 h-4 w-4" />
                    Intră în cont
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full min-h-[44px]">
                  <Link to="/inregistrare" onClick={() => setMobileMenuOpen(false)}>
                    <User className="mr-2 h-4 w-4" />
                    Creează cont nou
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default AppHeader;
