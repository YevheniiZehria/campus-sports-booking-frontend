import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Info, Loader2, UserPlus } from "lucide-react";
import { useAuth } from "./useAuth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import Logo from "@/components/layout/Logo";

const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(3, "Numele complet trebuie să aibă minim 3 caractere")
      .max(100, "Numele este prea lung"),
    email: z
      .string()
      .trim()
      .email("Formatul emailului este invalid")
      .refine(
        (val) => val.endsWith("@student.usv.ro") || val.endsWith("@usm.ro") || val.includes("@"),
        "Este recomandat un email instituțional (@student.usv.ro sau @usm.ro)"
      ),
    phone: z.string().trim().optional(),
    password: z
      .string()
      .min(6, "Parola trebuie să conțină cel puțin 6 caractere"),
    confirmPassword: z.string().min(1, "Confirmă parola introdusă"),
    agreeRegulations: z.boolean().refine((val) => val === true, {
      message: "Trebuie să fii de acord cu regulamentul bazei sportive",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Parolele introduse nu coincid",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export function Register() {
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      agreeRegulations: false,
    },
  });

  const emailValue = watch("email") || "";
  const agreeValue = watch("agreeRegulations");

  // Detectare rol estimat (informativ, serverul este autoritar)
  const detectedRole = emailValue.toLowerCase().endsWith("@student.usv.ro")
    ? "Student (limita de 3 rezervări / lună)"
    : emailValue.toLowerCase().endsWith("@usm.ro")
      ? "Cadru didactic (fără limită lunară)"
      : null;

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    const result = await registerAuth({
      email: data.email,
      password: data.password,
      fullName: data.fullName,
      phone: data.phone,
    });

    if (result.success) {
      navigate("/", { replace: true });
    } else {
      setServerError(result.error || "Înregistrarea a eșuat. Verifică datele introduse.");
    }
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center">
          <Logo />
        </div>

        <Card className="shadow-md border-border/80">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold tracking-tight">Creează cont nou</CardTitle>
            <CardDescription>
              Completează formularul cu datele tale instituționale USV.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {serverError && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Nume și prenume</Label>
                <Input
                  id="fullName"
                  placeholder="Ion Popescu"
                  autoComplete="name"
                  disabled={isSubmitting}
                  {...register("fullName")}
                  className={errors.fullName ? "border-destructive" : ""}
                />
                {errors.fullName && (
                  <p className="text-xs text-destructive">{errors.fullName.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Email instituțional</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ion.popescu@student.usv.ro"
                  autoComplete="email"
                  disabled={isSubmitting}
                  {...register("email")}
                  className={errors.email ? "border-destructive" : ""}
                />
                {detectedRole && (
                  <div className="pt-1 flex items-center gap-1.5">
                    <Badge variant="secondary" className="bg-primary/10 text-primary text-[11px] font-normal">
                      <Info className="h-3 w-3 mr-1" /> Rol estimat: {detectedRole}
                    </Badge>
                  </div>
                )}
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone">Număr de telefon (opțional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="07xxxxxxxx"
                  autoComplete="tel"
                  disabled={isSubmitting}
                  {...register("phone")}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Parolă</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Minim 6 caractere"
                  autoComplete="new-password"
                  disabled={isSubmitting}
                  {...register("password")}
                  className={errors.password ? "border-destructive" : ""}
                />
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirmă parola</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Reintrodu parola"
                  autoComplete="new-password"
                  disabled={isSubmitting}
                  {...register("confirmPassword")}
                  className={errors.confirmPassword ? "border-destructive" : ""}
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
                )}
              </div>

              <div className="pt-2">
                <div className="flex items-start space-x-2.5">
                  <Checkbox
                    id="agreeRegulations"
                    checked={agreeValue}
                    onCheckedChange={(checked) => setValue("agreeRegulations", Boolean(checked))}
                    disabled={isSubmitting}
                  />
                  <div className="grid gap-1 leading-none">
                    <Label
                      htmlFor="agreeRegulations"
                      className="text-xs text-muted-foreground font-normal cursor-pointer leading-relaxed"
                    >
                      Sunt de acord cu{" "}
                      <span className="text-primary font-medium underline">
                        Regulamentul bazei sportive USV
                      </span>{" "}
                      (anulare cu min. 2 ore înainte, max. 3 rezervări/lună pentru studenți).
                    </Label>
                  </div>
                </div>
                {errors.agreeRegulations && (
                  <p className="text-xs text-destructive mt-1.5">
                    {errors.agreeRegulations.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full mt-4" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Se creează contul...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Creează cont
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-border/50 pt-4">
            <p className="text-sm text-muted-foreground">
              Ai deja un cont creat?{" "}
              <Link to="/login" className="text-primary font-medium hover:underline">
                Intră în cont
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default Register;
