import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ArrowRight, Ban, Info, RefreshCw } from "lucide-react";
import { api } from "@/api/client";
import type { Resource, Reservation } from "@/api/types";
import { useAuth } from "@/features/auth/useAuth";
import AppLayout from "@/components/layout/AppLayout";
import PageHeading from "@/components/layout/PageHeading";
import FacilityCard from "@/features/availability/FacilityCard";
import NextBookingCard from "@/features/reservations/NextBookingCard";
import MonthlyLimitCard from "@/features/reservations/MonthlyLimitCard";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const SPORT_FILTERS = [
  { id: "toate", label: "Toate" },
  { id: "fotbal", label: "Fotbal" },
  { id: "tenis", label: "Tenis" },
  { id: "inot", label: "Înot" },
  { id: "baschet", label: "Baschet" },
];

export function FacilitiesPage() {
  const { user, isStudent, isBlocked, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSport = searchParams.get("sport") || "toate";

  // Încărcare lista de resurse din API
  const {
    data: resources = [],
    isLoading: loadingResources,
    isError: errorResources,
    refetch: refetchResources,
  } = useQuery({
    queryKey: ["resources"],
    queryFn: async () => {
      const res = await api.GET("/resources");
      if (res.data) {
        return res.data as Resource[];
      }
      return [] as Resource[];
    },
  });

  // Încărcare rezervări pentru utilizatorul logat
  const {
    data: reservations = [],
    isLoading: loadingReservations,
  } = useQuery({
    queryKey: ["reservations", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const res = await api.GET("/reservations");
      if (res.data) {
        return res.data as Reservation[];
      }
      return [] as Reservation[];
    },
  });

  // Calcul rezervări din luna calendaristică curentă
  const currentMonthKey = new Date().toISOString().slice(0, 7); // ex: "2026-11"
  const activeReservationsThisMonth = useMemo(() => {
    return reservations.filter(
      (r) => r.status === "ACTIVA" && r.start.startsWith(currentMonthKey)
    );
  }, [reservations, currentMonthKey]);

  const monthlyCount = activeReservationsThisMonth.length;
  const isLimitReached = isStudent && monthlyCount >= 3;

  // Găsire următoarea rezervare activă
  const nextBooking = useMemo(() => {
    const now = new Date();
    const upcoming = reservations
      .filter((r) => r.status === "ACTIVA" && new Date(r.start) >= now)
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
    return upcoming[0] || null;
  }, [reservations]);

  // Filtrare resurse în funcție de chip-ul activ
  const filteredResources = useMemo(() => {
    if (activeSport === "toate") return resources;
    return resources.filter((r) => {
      const sportLower = (r.sport || "").toLowerCase();
      if (activeSport === "inot") return sportLower.includes("inot") || sportLower.includes("înot") || r.type === "bazin";
      return sportLower.includes(activeSport);
    });
  }, [resources, activeSport]);

  const handleFilterClick = (sportId: string) => {
    if (sportId === "toate") {
      searchParams.delete("sport");
    } else {
      searchParams.set("sport", sportId);
    }
    setSearchParams(searchParams);
  };

  const firstName = user?.fullName ? user.fullName.split(" ")[0] : "Sportiv";

  return (
    <AppLayout user={user} onLogout={logout}>
      <div className="container mx-auto px-4 py-8 lg:px-8 max-w-7xl">
        <PageHeading
          eyebrow="Baza Sportivă Universitară"
          title={user ? `Salut, ${firstName}. Ce sport alegi azi?` : "Bun venit la USV Sport. Ce sport alegi azi?"}
          subtitle="Rezervă un teren în câteva secunde și vezi orele libere în timp real."
          action={
            user && (
              <Button asChild variant="outline" size="sm">
                <Link to="/rezervarile-mele" className="flex items-center gap-1.5 text-xs font-semibold">
                  Rezervările mele <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            )
          }
        />

        {/* Bannere speciale de stare cont */}
        {isBlocked && (
          <Alert variant="destructive" className="mb-6 shadow-xs border-destructive/40">
            <Ban className="h-4 w-4" />
            <AlertTitle className="font-bold">Cont blocat temporar</AlertTitle>
            <AlertDescription className="text-xs mt-1">
              Contul tău a fost blocat în urma a 2 neprezentări la rezervările anterioare. Nu poți efectua rezervări noi până la deblocarea contului de către administrație.
            </AlertDescription>
          </Alert>
        )}

        {isLimitReached && !isBlocked && (
          <Alert variant="warning" className="mb-6 shadow-xs">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="font-bold">Limita lunară a fost atinsă</AlertTitle>
            <AlertDescription className="text-xs mt-1">
              Ai efectuat deja 3 rezervări active în această lună calendaristică. Butoanele de rezervare sunt dezactivate temporar.
            </AlertDescription>
          </Alert>
        )}

        {/* Card informativ mod de funcționare */}
        <div className="mb-8 flex items-start gap-3.5 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-foreground">
          <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-semibold text-primary">Cum funcționează rezervarea?</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Alegi terenul, ziua și ora dorită. Intervalul rămâne blocat imediat pentru tine. Plata se efectuează la recepție înainte de meci. Anularea gratuită este permisă cu până la 2 ore înainte.
            </p>
          </div>
        </div>

        {/* Secțiune statistici utilizator conectat */}
        {user && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            <div className="sm:col-span-2">
              <NextBookingCard booking={nextBooking} isLoading={loadingReservations} />
            </div>
            {isStudent && (
              <div>
                <MonthlyLimitCard usedCount={monthlyCount} />
              </div>
            )}
          </div>
        )}

        {/* Bara de filtre tip chip */}
        <div className="flex flex-wrap items-center gap-2 pb-6 border-b border-border/70 mb-6">
          <span className="text-xs font-semibold uppercase text-muted-foreground mr-2">Sport:</span>
          {SPORT_FILTERS.map((f) => {
            const isSelected = activeSport === f.id;
            return (
              <button
                key={f.id}
                onClick={() => handleFilterClick(f.id)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-xs font-medium transition-all cursor-pointer min-h-[36px]",
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                    : "bg-card border border-border/80 text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Grilă Carduri Resurse */}
        {loadingResources ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3 rounded-xl border p-4">
                <Skeleton className="aspect-16/9 w-full rounded-lg" />
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-9 w-full mt-4" />
              </div>
            ))}
          </div>
        ) : errorResources ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center space-y-4">
            <AlertCircle className="mx-auto h-10 w-10 text-destructive" />
            <h3 className="text-lg font-bold">Nu s-a putut încărca lista facilităților</h3>
            <p className="text-sm text-muted-foreground">Verifică conexiunea la server sau reîncearcă.</p>
            <Button onClick={() => refetchResources()} variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" /> Reîncearcă
            </Button>
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
            Nu a fost găsită nicio facilitate pentru categoria selectată.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredResources.map((resursa) => (
              <FacilityCard
                key={resursa.id}
                facility={resursa}
                isLimitReached={isLimitReached}
                isBlocked={isBlocked}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default FacilitiesPage;
