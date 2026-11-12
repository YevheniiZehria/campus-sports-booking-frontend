export function AppFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border bg-card/60 py-6 text-sm text-muted-foreground backdrop-blur-xs">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 sm:flex-row lg:px-8">
        <p className="text-center sm:text-left">
          © {currentYear} USV Sport · Baza sportivă a Universității „Ștefan cel Mare” din Suceava
        </p>
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm">
          <a
            href="#regulament"
            onClick={(e) => {
              e.preventDefault();
              alert(
                "Regulament Baza Sportivă USV:\n1. Rezervările se fac cu maxim 14 zile în avans.\n2. Studenții au limita de 3 rezervări pe lună calendaristică.\n3. Anularea gratuită se poate face cu minim 2 ore înainte de ora de începere.\n4. La 2 neprezentări, contul este blocat automat până la deblocarea de către administrator."
              );
            }}
            className="hover:text-primary transition-colors hover:underline"
          >
            Regulament
          </a>
          <a
            href="mailto:baza.sportiva@usv.ro"
            className="hover:text-primary transition-colors hover:underline"
          >
            Contact: baza.sportiva@usv.ro
          </a>
        </div>
      </div>
    </footer>
  );
}

export default AppFooter;
