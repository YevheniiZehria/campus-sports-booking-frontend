import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Dumbbell, LogIn, ArrowLeft, Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanEmail = email.trim() || "yevhenii.zehria@student.usv.ro";
    const isAdmin = cleanEmail.toLowerCase().includes("admin");

    const sessionUser = {
      id: isAdmin ? 99 : 1,
      email: cleanEmail,
      fullName: cleanEmail.split("@")[0].replace(".", " ").toUpperCase(),
      role: isAdmin ? "administrator" : "student",
      isBlocked: false,
    };

    sessionStorage.setItem("usv_user", JSON.stringify(sessionUser));
    sessionStorage.setItem("usv_token", "jwt-session-usv-campus-sports");

    if (isAdmin) {
      navigate("/dashboard");
    } else {
      navigate("/");
    }
  };

  const handleQuickLogin = (role: "admin" | "student") => {
    if (role === "admin") {
      setEmail("admin.baza@usv.ro");
      setPassword("parolaAdmin123");
      const user = {
        id: 99,
        email: "admin.baza@usv.ro",
        fullName: "Administrator Bază USV",
        role: "administrator",
        isBlocked: false,
      };
      sessionStorage.setItem("usv_user", JSON.stringify(user));
      sessionStorage.setItem("usv_token", "jwt-admin-token");
      navigate("/dashboard");
    } else {
      setEmail("yevhenii.zehria@student.usv.ro");
      setPassword("parolaStudent123");
      const user = {
        id: 1,
        email: "yevhenii.zehria@student.usv.ro",
        fullName: "Yevhenii Zehria",
        role: "student",
        isBlocked: false,
      };
      sessionStorage.setItem("usv_user", JSON.stringify(user));
      sessionStorage.setItem("usv_token", "jwt-student-token");
      navigate("/");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-100 via-sky-50 to-slate-100 px-4 py-8">
      <div className="w-full max-w-md space-y-6">
        {/* Logo & Brand USV */}
        <div className="flex flex-col items-center text-center space-y-2">
          <Link to="/" className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0b5cad] to-[#034078] text-white shadow-xl hover:scale-105 transition-transform duration-200">
            <Dumbbell className="h-7 w-7" />
          </Link>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">USV Sport</h2>
            <p className="text-xs text-slate-500 font-medium">Baza Sportivă Universitară · Suceava</p>
          </div>
        </div>

        {/* Card Formular */}
        <Card className="rounded-3xl border border-slate-200/90 bg-white/95 p-2 shadow-xl backdrop-blur-md">
          <CardHeader className="space-y-1 text-center pb-4">
            <CardTitle className="text-xl font-black text-slate-900">Intră în cont</CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Autentificare cu adresa de email instituțională USV
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-bold text-slate-700">Email instituțional</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nume.prenume@student.usv.ro"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-xl text-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-bold text-slate-700">Parolă</Label>
                  <span className="text-[11px] font-medium text-[#0b5cad] cursor-pointer hover:underline">
                    Ai uitat parola?
                  </span>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-xl text-sm"
                  required
                />
              </div>

              <Button type="submit" className="w-full bg-[#0b5cad] hover:bg-[#094b8f] rounded-xl text-white font-bold py-2.5 shadow-md shadow-[#0b5cad]/20 cursor-pointer">
                <LogIn className="h-4 w-4 mr-2" /> Conectează-te
              </Button>
            </form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-slate-400 font-semibold text-[10px] tracking-wider">
                  Testare Rapidă
                </span>
              </div>
            </div>

            {/* Acces direct cu rol */}
            <div className="grid grid-cols-2 gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickLogin("admin")}
                className="rounded-xl border-slate-200 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300 text-xs font-semibold"
              >
                <Shield className="h-3.5 w-3.5 mr-1.5 text-purple-600" /> Administrator
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickLogin("student")}
                className="rounded-xl border-slate-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 text-xs font-semibold"
              >
                <User className="h-3.5 w-3.5 mr-1.5 text-blue-600" /> Student USV
              </Button>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between border-t border-slate-100 p-4 text-xs text-slate-500">
            <Link to="/" className="flex items-center hover:text-[#0b5cad] font-medium">
              <ArrowLeft className="h-3 w-3 mr-1" /> Spre facilități
            </Link>
            <Link to="/dashboard" className="text-[#0b5cad] font-bold hover:underline">
              Deschide tabelul bazei de date →
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
