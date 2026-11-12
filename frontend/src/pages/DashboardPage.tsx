import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { 
  Plus, 
  Trash2, 
  Edit3, 
  RefreshCw, 
  Dumbbell, 
  ArrowLeft, 
  Clock, 
  Search,
  CheckCircle2, 
  AlertCircle,
  Loader2,
  SlidersHorizontal,
  DollarSign,
  Layers,
  Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Resource {
  id: number;
  name: string;
  type: "teren" | "bazin";
  sport: string;
  description: string | null;
  pricePerHour: number | null;
  openHour: string | null;
  closeHour: string | null;
}

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [searchTable, setSearchTable] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  const [formData, setFormData] = useState({
    name: "",
    type: "teren" as "teren" | "bazin",
    sport: "fotbal",
    description: "",
    pricePerHour: "40",
    openHour: "08:00",
    closeHour: "22:00",
  });

  // 1. GET /api/v1/resources
  const { data: resources = [], isLoading, isError, refetch, isFetching } = useQuery<Resource[]>({
    queryKey: ["admin-resources"],
    queryFn: async () => {
      const res = await fetch("/api/v1/resources");
      if (!res.ok) throw new Error("Eroare la citirea bazei de date");
      return res.json();
    },
  });

  // Calcul statistici rapide
  const stats = useMemo(() => {
    const total = resources.length;
    const terenuri = resources.filter((r) => r.type === "teren").length;
    const bazine = resources.filter((r) => r.type === "bazin").length;
    const validPrices = resources.filter((r) => r.pricePerHour !== null).map((r) => r.pricePerHour as number);
    const avgPrice = validPrices.length ? Math.round(validPrices.reduce((a, b) => a + b, 0) / validPrices.length) : 0;
    return { total, terenuri, bazine, avgPrice };
  }, [resources]);

  // Filtrare tabel
  const displayedResources = useMemo(() => {
    return resources.filter((r) => {
      const matchesType = filterType === "all" || r.type === filterType;
      const matchesSearch =
        !searchTable.trim() ||
        r.name.toLowerCase().includes(searchTable.toLowerCase()) ||
        r.sport.toLowerCase().includes(searchTable.toLowerCase()) ||
        (r.description && r.description.toLowerCase().includes(searchTable.toLowerCase()));
      return matchesType && matchesSearch;
    });
  }, [resources, filterType, searchTable]);

  // 2. POST /api/v1/resources
  const createMutation = useMutation({
    mutationFn: async (payload: typeof formData) => {
      const body = {
        name: payload.name.trim(),
        type: payload.type,
        sport: payload.sport.trim().toLowerCase(),
        description: payload.description.trim() || null,
        pricePerHour: payload.pricePerHour ? parseFloat(payload.pricePerHour) : null,
        openHour: payload.openHour || null,
        closeHour: payload.closeHour || null,
      };

      const res = await fetch("/api/v1/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ detail: "Eroare la salvare" }));
        throw new Error(errorData.detail || "Nu s-a putut crea resursa");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-resources"] });
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      setModalOpen(false);
      resetForm();
      showToast("Terenul a fost adăugat cu succes în baza de date!");
    },
    onError: (err: Error) => setFormError(err.message),
  });

  // 3. PATCH /api/v1/resources/:id
  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: typeof formData }) => {
      const body = {
        name: payload.name.trim(),
        type: payload.type,
        sport: payload.sport.trim().toLowerCase(),
        description: payload.description.trim() || null,
        pricePerHour: payload.pricePerHour ? parseFloat(payload.pricePerHour) : null,
        openHour: payload.openHour || null,
        closeHour: payload.closeHour || null,
      };

      const res = await fetch(`/api/v1/resources/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ detail: "Eroare la actualizare" }));
        throw new Error(errorData.detail || "Nu s-a putut actualiza resursa");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-resources"] });
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      setModalOpen(false);
      resetForm();
      showToast("Modificările au fost salvate în baza de date!");
    },
    onError: (err: Error) => setFormError(err.message),
  });

  // 4. DELETE /api/v1/resources/:id
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/v1/resources/${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) throw new Error("Eroare la ștergere");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-resources"] });
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      setDeleteConfirmId(null);
      showToast("Resursa a fost ștearsă din baza de date.");
    },
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const resetForm = () => {
    setEditingResource(null);
    setFormData({
      name: "",
      type: "teren",
      sport: "fotbal",
      description: "",
      pricePerHour: "40",
      openHour: "08:00",
      closeHour: "22:00",
    });
    setFormError(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleOpenEdit = (res: Resource) => {
    setEditingResource(res);
    setFormData({
      name: res.name,
      type: res.type,
      sport: res.sport,
      description: res.description || "",
      pricePerHour: res.pricePerHour !== null ? String(res.pricePerHour) : "",
      openHour: res.openHour || "08:00",
      closeHour: res.closeHour || "22:00",
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!formData.name.trim()) {
      setFormError("Numele este obligatoriu.");
      return;
    }
    if (editingResource) {
      updateMutation.mutate({ id: editingResource.id, payload: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0b5cad] text-white shadow-sm hover:scale-105 transition-transform">
              <Dumbbell className="h-5 w-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight">USV Sport</span>
                <span className="rounded-md bg-blue-100 text-[#0b5cad] px-2 py-0.5 text-[11px] font-bold">
                  Dashboard Administrare
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
              <Link to="/" className="flex items-center gap-1.5 text-xs font-semibold">
                <ArrowLeft className="h-4 w-4" /> Înapoi la site
              </Link>
            </Button>
            <Button onClick={handleOpenAdd} size="sm" className="bg-[#0b5cad] hover:bg-[#094b8f] text-white shadow-sm font-semibold">
              <Plus className="h-4 w-4 mr-1.5" /> Adaugă resursă
            </Button>
          </div>
        </div>
      </header>

      {/* Mesaj Toast Notificare */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-slate-900 text-white px-4 py-3 shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Conținut */}
      <main className="mx-auto max-w-7xl flex-1 px-4 py-8 sm:px-8 w-full space-y-6">
        {/* Titlu & Buton refresh */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Gestiune Bază de Date · Resurse Sportive
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Interfață direct conectată la API-ul FastAPI (<code className="bg-slate-200/60 px-1 py-0.5 rounded font-mono">/api/v1/resources</code>).
            </p>
          </div>
          <Button 
            onClick={() => refetch()} 
            variant="outline" 
            size="sm"
            disabled={isFetching}
            className="border-slate-300 text-slate-700 hover:bg-slate-50 font-medium"
          >
            <RefreshCw className={`h-4 w-4 mr-1.5 ${isFetching ? "animate-spin text-[#0b5cad]" : ""}`} />
            <span>Actualizează datele</span>
          </Button>
        </div>

        {/* Carduri Statistici KPI */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="rounded-2xl border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Total Resurse</span>
              <Layers className="h-4 w-4 text-[#0b5cad]" />
            </div>
            <div className="text-2xl font-black text-slate-900">{stats.total}</div>
            <p className="text-[11px] text-slate-500 mt-1">Înregistrate în sistem</p>
          </Card>

          <Card className="rounded-2xl border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Terenuri Sport</span>
              <Building2 className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">{stats.terenuri}</div>
            <p className="text-[11px] text-slate-500 mt-1">Fotbal, tenis, baschet</p>
          </Card>

          <Card className="rounded-2xl border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Bazin Olimpic</span>
              <Dumbbell className="h-4 w-4 text-sky-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">{stats.bazine}</div>
            <p className="text-[11px] text-slate-500 mt-1">Bazin acoperit încălzit</p>
          </Card>

          <Card className="rounded-2xl border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Tarif Mediu</span>
              <DollarSign className="h-4 w-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-slate-900">{stats.avgPrice} lei</div>
            <p className="text-[11px] text-slate-500 mt-1">Pe oră de rezervare</p>
          </Card>
        </div>

        {/* Tabelul Resurselor */}
        <Card className="rounded-2xl border border-slate-200/90 bg-white shadow-sm overflow-hidden">
          {/* Bara de căutare și filtrare în tabel */}
          <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Filtrează după nume, sport..."
                value={searchTable}
                onChange={(e) => setSearchTable(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#0b5cad]/30"
              />
            </div>

            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-slate-400" />
              <span className="text-xs text-slate-500 font-medium">Tip:</span>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none"
              >
                <option value="all">Toate tipurile</option>
                <option value="teren">Doar Terenuri</option>
                <option value="bazin">Doar Bazin</option>
              </select>
            </div>
          </div>

          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#0b5cad] mb-2" />
                <p className="text-sm font-medium">Se încarcă datele din baza de date...</p>
              </div>
            ) : isError ? (
              <div className="p-8 text-center text-red-600 space-y-2">
                <AlertCircle className="h-8 w-8 mx-auto" />
                <p className="font-bold">Eroare de conexiune la serverul FastAPI.</p>
                <p className="text-xs text-slate-500">Asigură-te că `uvicorn` rulează pe portul 8000.</p>
              </div>
            ) : displayedResources.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <p className="font-semibold text-slate-700">Nicio resursă găsită.</p>
                <p className="text-xs mt-1">Modifică filtrul sau adaugă o resursă nouă folosind butonul de mai sus.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider font-bold">
                      <TableHead className="w-16 pl-6">ID</TableHead>
                      <TableHead>Nume Facilitate</TableHead>
                      <TableHead>Tip</TableHead>
                      <TableHead>Sport</TableHead>
                      <TableHead>Program Zilnic</TableHead>
                      <TableHead>Tarif / Oră</TableHead>
                      <TableHead className="text-right pr-6">Acțiuni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-slate-100">
                    {displayedResources.map((item) => (
                      <TableRow key={item.id} className="hover:bg-slate-50/70 transition-colors">
                        <TableCell className="pl-6 font-mono text-xs font-bold text-slate-400">
                          #{item.id}
                        </TableCell>
                        <TableCell>
                          <div className="font-bold text-sm text-slate-900">{item.name}</div>
                          {item.description ? (
                            <div className="text-xs text-slate-500 line-clamp-1 max-w-sm mt-0.5">
                              {item.description}
                            </div>
                          ) : (
                            <div className="text-[11px] text-slate-400 italic">Fără descriere adițională</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold capitalize ${
                            item.type === "bazin" ? "bg-sky-50 text-sky-700 border border-sky-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}>
                            {item.type}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-bold text-xs uppercase text-slate-700 tracking-wide">
                            {item.sport}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs font-medium text-slate-600">
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-[#0b5cad]" />
                            {item.openHour && item.closeHour ? `${item.openHour} – ${item.closeHour}` : "Nedefinit"}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm font-black text-slate-900">
                          {item.pricePerHour !== null ? `${item.pricePerHour} lei` : "Gratuit"}
                        </TableCell>
                        <TableCell className="text-right pr-6 space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(item)}
                            className="h-8 w-8 p-0 text-slate-600 hover:text-[#0b5cad] hover:bg-blue-50 rounded-lg cursor-pointer"
                            title="Modifică resursa"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteConfirmId(item.id)}
                            className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                            title="Șterge din baza de date"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Modal Adăugare / Editare Resursă */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-slate-900">
              {editingResource ? `Modifică Terenul #${editingResource.id}` : "Adaugă Teren Nou în Baza de Date"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Datele vor fi sincronizate direct cu serverul FastAPI prin contractul oficial.
            </DialogDescription>
          </DialogHeader>

          {formError && (
            <Alert variant="destructive" className="rounded-xl">
              <AlertDescription className="text-xs">{formError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label htmlFor="res-name" className="text-xs font-bold text-slate-700">Nume Teren / Facilitate</Label>
              <Input
                id="res-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="ex: Teren Tenis 3"
                className="rounded-xl text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="res-type" className="text-xs font-bold text-slate-700">Tip</Label>
                <select
                  id="res-type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as "teren" | "bazin" })}
                  className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0b5cad]/30"
                >
                  <option value="teren">Teren exterior/interior</option>
                  <option value="bazin">Bazin olimpic</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="res-sport" className="text-xs font-bold text-slate-700">Sport</Label>
                <Input
                  id="res-sport"
                  value={formData.sport}
                  onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                  placeholder="ex: fotbal, tenis, inot"
                  className="rounded-xl text-sm"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label htmlFor="res-price" className="text-xs font-bold text-slate-700">Tarif (lei/oră)</Label>
                <Input
                  id="res-price"
                  type="number"
                  value={formData.pricePerHour}
                  onChange={(e) => setFormData({ ...formData, pricePerHour: e.target.value })}
                  placeholder="40"
                  className="rounded-xl text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="res-open" className="text-xs font-bold text-slate-700">Deschidere</Label>
                <Input
                  id="res-open"
                  type="text"
                  value={formData.openHour}
                  onChange={(e) => setFormData({ ...formData, openHour: e.target.value })}
                  placeholder="08:00"
                  className="rounded-xl text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="res-close" className="text-xs font-bold text-slate-700">Închidere</Label>
                <Input
                  id="res-close"
                  type="text"
                  value={formData.closeHour}
                  onChange={(e) => setFormData({ ...formData, closeHour: e.target.value })}
                  placeholder="22:00"
                  className="rounded-xl text-sm"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="res-desc" className="text-xs font-bold text-slate-700">Descriere & Dotări (opțional)</Label>
              <Input
                id="res-desc"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Nocturnă, vestiare, zgură, gazon sintetic..."
                className="rounded-xl text-sm"
              />
            </div>

            <DialogFooter className="pt-3 gap-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="rounded-xl">
                Anulează
              </Button>
              <Button 
                type="submit" 
                className="bg-[#0b5cad] hover:bg-[#094b8f] rounded-xl text-white font-bold"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvare...
                  </>
                ) : editingResource ? (
                  "Actualizează resursa"
                ) : (
                  "Inserează în baza de date"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Confirmare Ștergere */}
      <Dialog open={deleteConfirmId !== null} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="sm:max-w-sm rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              Ștergi înregistrarea #{deleteConfirmId}?
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Această acțiune este ireversibilă și va apela <code className="text-red-600 font-mono">DELETE /api/v1/resources/{deleteConfirmId}</code> pe backend.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)} className="rounded-xl">
              Renunță
            </Button>
            <Button
              variant="destructive"
              className="rounded-xl font-bold"
              onClick={() => deleteConfirmId && deleteMutation.mutate(deleteConfirmId)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Se șterge..." : "Șterge definitiv"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
