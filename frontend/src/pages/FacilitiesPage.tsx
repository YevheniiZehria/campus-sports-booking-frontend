import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  Dumbbell, 
  Clock, 
  MapPin, 
  Search, 
  LayoutDashboard, 
  LogIn, 
  LogOut, 
  RefreshCw, 
  AlertCircle, 
  Sparkles, 
  Check, 
  ShieldCheck, 
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { getSportImage } from "@/lib/sportImages";

interface Resource {
  id: number;
  name: string;
  type: string;
  sport: string;
  description: string | null;
  pricePerHour: number | null;
  openHour: string | null;
  closeHour: string | null;
}

const SPORT_CATEGORIES = [
  { id: "toate", label: "Toate sporturile", icon: "🏆" },
  { id: "fotbal", label: "Fotbal", icon: "⚽" },
  { id: "tenis", label: "Tenis", icon: "🎾" },
  { id: "inot", label: "Înot", icon: "🏊‍♂️" },
  { id: "baschet", label: "Baschet / Volei", icon: "🏀" },
];

export default function FacilitiesPage() {
  const [selectedSport, setSelectedSport] = useState("toate");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFacility, setActiveFacility] = useState<Resource | null>(null);
  const [currentUser, setCurrentUser] = useState<{ fullName: string; role: string; email: string } | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem("usv_user");
    if (saved) {
      try {
        setCurrentUser(JSON.parse(saved));
      } catch {
        setCurrentUser(null);
      }
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("usv_user");
    sessionStorage.removeItem("usv_token");
    setCurrentUser(null);
  };

  // Preluare date din backend: GET /api/v1/resources
  const {
    data: resources = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<Resource[]>({
    queryKey: ["resources"],
    queryFn: async () => {
      const res = await fetch("/api/v1/resources");
      if (!res.ok) throw new Error("Eroare la conectarea cu API-ul");
      return res.json();
    },
  });

  // Filtrare combinată (sport + căutare text)
  const filtered = useMemo(() => {
    return resources.filter((item) => {
      const matchesSport =
        selectedSport === "toate" ||
        item.sport.toLowerCase().includes(selectedSport) ||
        (selectedSport === "inot" && item.type === "bazin");

      const matchesSearch =
        !searchQuery.trim() ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sport.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesSport && matchesSearch;
    });
  }, [resources, selectedSport, searchQuery]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] flex flex-col">
      {/* ───── Bara de sus & Navigație ───── */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0b5cad] to-[#034078] text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
              <Dumbbell className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-[#0f172a]">USV Sport</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#0b5cad]">
                Baza Sportivă Universitară
              </span>
            </div>
          </Link>

          {/* Indicator backend & Acțiuni rapide */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/80 px-3 py-1 text-xs font-medium text-emerald-700">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              <span>Backend Conectat (Port 8000)</span>
            </div>

            <Button asChild variant="outline" size="sm" className="border-slate-300 text-slate-700 hover:bg-slate-100 font-medium">
              <Link to="/dashboard" className="flex items-center gap-1.5">
                <LayoutDashboard className="h-4 w-4 text-[#0b5cad]" />
                <span className="hidden sm:inline">Panou Bază de Date</span>
                <span className="sm:hidden">Tabel</span>
              </Link>
            </Button>

            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="hidden sm:block text-right">
                  <div className="text-xs font-bold text-slate-900 leading-tight">{currentUser.fullName}</div>
                  <div className="text-[10px] text-slate-500 capitalize">{currentUser.role}</div>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-500 hover:text-red-600 p-2" title="Deconectare">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button asChild size="sm" className="bg-[#0b5cad] hover:bg-[#094b8f] text-white shadow-sm font-medium">
                <Link to="/login" className="flex items-center gap-1.5">
                  <LogIn className="h-4 w-4" />
                  <span>Autentificare</span>
                </Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* ───── Hero Banner ───── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0b5cad] via-[#084887] to-[#032b53] py-12 px-4 sm:px-8 text-white">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="relative mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-sky-200 backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                <span>Universitatea „Ștefan cel Mare” din Suceava</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
                Terenuri și Bazin Olimpic la standarde moderne
              </h1>
              <p className="text-sm sm:text-base text-sky-100 font-normal leading-relaxed">
                Platforma oficială de rezervări pentru studenți, cadre didactice și comunitate. Verifică orarul și disponibilitatea în timp real direct din baza de date.
              </p>
            </div>

            {/* Casetă căutare rapidă */}
            <div className="w-full md:w-80 space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-sky-200">
                Caută facilitate:
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Caută tenis, fotbal, bazin..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl bg-white/95 py-2.5 pl-9 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-white shadow-lg"
                />
              </div>
            </div>
          </div>

          {/* Puncte forte USV */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-white/15 pt-6 text-xs text-sky-100">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Acces gratuit pt. studenți (max 3/lună)</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-sky-300 shrink-0" />
              <span>Program extins 07:00 – 22:00</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-amber-300 shrink-0" />
              <span>Campus Universitar Suceava</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Plată la recepție / vestiare incluse</span>
            </div>
          </div>
        </div>
      </section>

      {/* ───── Corp Principal ───── */}
      <main className="mx-auto max-w-7xl flex-1 px-4 py-8 sm:px-8 w-full">
        {/* Selector Sporturi tip chips */}
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4 border-b border-slate-200/80 pb-5">
          <div className="flex flex-wrap items-center gap-2">
            {SPORT_CATEGORIES.map((cat) => {
              const isSelected = selectedSport === cat.id;
              const count = cat.id === "toate"
                ? resources.length
                : resources.filter((r) => r.sport.toLowerCase().includes(cat.id) || (cat.id === "inot" && r.type === "bazin")).length;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedSport(cat.id)}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all duration-200 cursor-pointer min-h-[40px] ${
                    isSelected
                      ? "bg-[#0b5cad] text-white shadow-md shadow-[#0b5cad]/25 scale-102"
                      : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <span className="text-sm">{cat.icon}</span>
                  <span>{cat.label}</span>
                  <span className={`ml-1 rounded-full px-2 py-0.5 text-[10px] ${isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="text-xs font-medium text-slate-500">
            Afișate: <strong className="text-slate-800">{filtered.length}</strong> facilități
          </div>
        </div>

        {/* Stare Încărcare */}
        {isLoading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <Skeleton className="aspect-16/9 w-full rounded-xl" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-10 w-full mt-4" />
              </div>
            ))}
          </div>
        )}

        {/* Stare Eroare */}
        {isError && (
          <div className="rounded-2xl border border-red-200 bg-red-50/50 p-8 text-center space-y-4">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
            <h3 className="text-lg font-bold text-slate-900">Nu s-a putut încărca lista de facilități</h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Verifică dacă serverul FastAPI rulează pe portul 8000. Datele vin direct din baza de date a proiectului.
            </p>
            <Button onClick={() => refetch()} variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-100">
              <RefreshCw className="mr-2 h-4 w-4" /> Reîncearcă conexiunea
            </Button>
          </div>
        )}

        {/* Stare Gol */}
        {!isLoading && !isError && filtered.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center text-slate-500">
            <Dumbbell className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-800">Nicio facilitate găsită</h3>
            <p className="text-xs mt-1 max-w-sm mx-auto text-slate-500">
              {searchQuery ? "Niciun rezultat nu corespunde căutării tale." : "Nu există resurse în această categorie."}
            </p>
            {searchQuery && (
              <Button onClick={() => setSearchQuery("")} variant="link" size="sm" className="text-[#0b5cad] mt-2">
                Resetează căutarea
              </Button>
            )}
          </div>
        )}

        {/* Grilă Carduri Facilități */}
        {!isLoading && !isError && filtered.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item) => {
              const image = getSportImage(item.sport, item.type);

              return (
                <Card 
                  key={item.id} 
                  className="group overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col hover:-translate-y-1"
                >
                  {/* Poză & Badge-uri overlay */}
                  <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-100">
                    <img
                      src={image}
                      alt={item.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-108"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

                    {/* Badge sport stânga sus */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="rounded-lg bg-white/95 px-2.5 py-1 text-xs font-bold text-slate-800 shadow-sm backdrop-blur-md">
                        {item.sport.toUpperCase()}
                      </span>
                      <span className="rounded-lg bg-[#0b5cad]/90 px-2.5 py-1 text-xs font-medium text-white shadow-sm backdrop-blur-md">
                        {item.type === "bazin" ? "Bazin acoperit" : "Teren exterior"}
                      </span>
                    </div>

                    {/* Preț dreapta jos */}
                    <div className="absolute bottom-3 right-3 rounded-lg bg-slate-900/85 px-3 py-1.5 text-xs font-black text-white backdrop-blur-md shadow-sm">
                      {item.pricePerHour !== null ? `${item.pricePerHour} lei / oră` : "Acces Gratuit"}
                    </div>
                  </div>

                  {/* Detalii card */}
                  <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#0b5cad] transition-colors leading-snug">
                        {item.name}
                      </h3>
                      {item.description ? (
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      ) : (
                        <p className="text-xs text-slate-400 italic">
                          Facilitate sportivă oficială din complexul universitar USV.
                        </p>
                      )}
                    </div>

                    <div className="space-y-3 pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Clock className="h-3.5 w-3.5 text-[#0b5cad]" />
                          {item.openHour && item.closeHour ? `${item.openHour} – ${item.closeHour}` : "08:00 – 22:00"}
                        </span>
                        <span className="flex items-center gap-1 text-slate-400">
                          <MapPin className="h-3.5 w-3.5 text-amber-500" />
                          Campus USV
                        </span>
                      </div>

                      <Button
                        onClick={() => setActiveFacility(item)}
                        className="w-full rounded-xl bg-slate-900 hover:bg-[#0b5cad] text-white text-xs font-bold py-2.5 shadow-sm transition-all cursor-pointer"
                      >
                        <span>Vezi detalii & orar</span>
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* ───── Modal Detalii Facilitate ───── */}
      <Dialog open={activeFacility !== null} onOpenChange={(open) => !open && setActiveFacility(null)}>
        {activeFacility && (
          <DialogContent className="sm:max-w-lg rounded-2xl p-0 overflow-hidden">
            <div className="relative aspect-16/9 w-full bg-slate-100">
              <img
                src={getSportImage(activeFacility.sport, activeFacility.type)}
                alt={activeFacility.name}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="inline-block rounded-md bg-[#0b5cad] px-2 py-0.5 text-[10px] font-bold uppercase mb-1">
                  {activeFacility.sport} · {activeFacility.type}
                </span>
                <DialogTitle className="text-xl font-black">{activeFacility.name}</DialogTitle>
              </div>
            </div>

            <div className="p-6 space-y-4 text-sm text-slate-700">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Descriere</h4>
                <p className="leading-relaxed">
                  {activeFacility.description || "Teren sportiv omologat, dotat cu suprafață modernă și nocturnă profesională pentru competiții și antrenamente."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4 border border-slate-200/80 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5 font-medium">Tarif orar:</span>
                  <span className="text-base font-extrabold text-[#0b5cad]">
                    {activeFacility.pricePerHour !== null ? `${activeFacility.pricePerHour} lei / oră` : "Gratuit"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5 font-medium">Program zilnic:</span>
                  <span className="font-bold text-slate-800">
                    {activeFacility.openHour && activeFacility.closeHour ? `${activeFacility.openHour} – ${activeFacility.closeHour}` : "08:00 – 22:00"}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600" />
                  <span>Vestiare și dușuri incluse cu apă caldă</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600" />
                  <span>Parcare gratuită în campus pentru sportivi</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600" />
                  <span>Plata se realizează direct la recepție</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setActiveFacility(null)}>
                  Închide
                </Button>
                <Button asChild className="bg-[#0b5cad] hover:bg-[#094b8f]">
                  <Link to="/dashboard">
                    Modifică în baza de date
                  </Link>
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* ───── Footer ───── */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-8 text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} USV Sport · Universitatea „Ștefan cel Mare” din Suceava</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-900 cursor-pointer">Regulament bază</span>
            <span className="hover:text-slate-900 cursor-pointer">Tarife & reduceri</span>
            <span className="hover:text-slate-900">Contact: baza.sportiva@usv.ro</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
