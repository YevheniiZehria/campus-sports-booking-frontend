/**
 * Gestionarea centralizată a erorilor din aplicație și maparea răspunsurilor API ({ detail: string })
 * către mesaje prietenoase în limba română.
 */

export interface ApiErrorLike {
  status?: number;
  detail?: string;
  message?: string;
}

/**
 * Traduce o eroare API sau o excepție într-un mesaj clar în limba română.
 */
export function mapeazaEroareApi(err: unknown): string {
  if (!err) return "A apărut o problemă neașteptată. Te rugăm să reîncerci.";

  // În cazul în care err este un obiect cu detail
  const detail = typeof err === "object" && err !== null && "detail" in err
    ? String((err as { detail: unknown }).detail)
    : typeof err === "object" && err !== null && "message" in err
      ? String((err as { message: unknown }).message)
      : typeof err === "string"
        ? err
        : "";

  const status = typeof err === "object" && err !== null && "status" in err
    ? Number((err as { status: unknown }).status)
    : undefined;

  const detailLower = detail.toLowerCase();

  // 1. Conflict (409) - Interval deja ocupat / blocat sau nume resursă duplicat
  if (status === 409 || detailLower.includes("conflict") || detailLower.includes("ocupat") || detailLower.includes("deja")) {
    if (detailLower.includes("nume") || detailLower.includes("duplicate")) {
      return "Există deja o resursă cu acest nume.";
    }
    return "Intervalul ales nu mai este disponibil (a fost rezervat de altcineva sau blocat pentru mentenanță).";
  }

  // 2. Interzis (403) - Limitare lunară (3/lună) sau cont blocat
  if (status === 403 || detailLower.includes("limit") || detailLower.includes("blocat")) {
    if (detailLower.includes("blocat") || detailLower.includes("blocked")) {
      return "Contul tău este blocat din cauza a 2 neprezentări anterioare. Te rugăm să contactezi administratorul.";
    }
    if (detailLower.includes("limit") || detailLower.includes("3") || detailLower.includes("luna")) {
      return "Ai atins limita de 3 rezervări active permise pentru studenți în această lună.";
    }
    return "Nu ai permisiunea necesară pentru a efectua această acțiune.";
  }

  // 3. Cerere invalidă (400) - Peste 14 zile sau anulare < 2 ore
  if (status === 400 || detailLower.includes("14") || detailLower.includes("2 ore") || detailLower.includes("anul")) {
    if (detailLower.includes("14") || detailLower.includes("avans") || detailLower.includes("advance")) {
      return "Rezervările se pot efectua cu maxim 14 zile în avans.";
    }
    if (detailLower.includes("2 ore") || detailLower.includes("anul") || detailLower.includes("cancel")) {
      return "Anularea rezervării nu mai este posibilă cu mai puțin de 2 ore înainte de ora de începere.";
    }
    if (detailLower.includes("openhour") || detailLower.includes("closehour")) {
      return "Ora de deschidere trebuie să fie înainte de ora de închidere.";
    }
    return detail || "Datele trimise nu sunt valide. Te rugăm să verifici formularul.";
  }

  // 4. Neautorizat (401)
  if (status === 401 || detailLower.includes("unauthorized") || detailLower.includes("token")) {
    return "Sesiunea ta a expirat sau datele de autentificare sunt incorecte.";
  }

  // 5. Negăsit (404)
  if (status === 404 || detailLower.includes("not found") || detailLower.includes("nu exista")) {
    return detail || "Elementul solicitat nu a fost găsit.";
  }

  // Dacă avem un mesaj text returnat explicit din backend
  if (detail && detail.length < 200) {
    return detail;
  }

  return "A apărut o problemă de comunicare cu serverul. Te rugăm să reîncerci.";
}

