import { Link } from "react-router-dom";
import { Dumbbell } from "lucide-react";

interface LogoProps {
  className?: string;
}

export function Logo({ className = "" }: LogoProps) {
  return (
    <Link to="/" className={`inline-flex items-center gap-2.5 font-bold tracking-tight text-primary hover:opacity-90 transition-opacity ${className}`}>
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <Dumbbell className="h-5 w-5" />
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-base font-extrabold text-foreground">USV Sport</span>
        <span className="text-[10px] font-medium tracking-normal text-muted-foreground uppercase">Campus Sports</span>
      </span>
    </Link>
  );
}

export default Logo;

