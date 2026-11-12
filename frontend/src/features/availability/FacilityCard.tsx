import { Link } from "react-router-dom";
import { Clock, MapPin } from "lucide-react";
import type { Resource } from "@/api/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getSportImage } from "@/lib/sportImages";

interface FacilityCardProps {
  facility: Resource;
  isLimitReached?: boolean;
  isBlocked?: boolean;
}

export function FacilityCard({ facility, isLimitReached = false, isBlocked = false }: FacilityCardProps) {
  const image = getSportImage(facility.sport, facility.type);
  const isBookingDisabled = isLimitReached || isBlocked;

  return (
    <Card className="overflow-hidden border border-border/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col group">
      <div className="relative aspect-16/9 w-full overflow-hidden bg-muted">
        <img
          src={image}
          alt={facility.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge variant="secondary" className="bg-white/95 text-foreground font-semibold shadow-xs backdrop-blur-xs">
            {facility.sport.toUpperCase()}
          </Badge>
          <Badge variant="success" className="bg-emerald-600/90 text-white font-medium shadow-xs">
            Disponibil
          </Badge>
        </div>
        {facility.pricePerHour !== null && facility.pricePerHour !== undefined && (
          <div className="absolute bottom-3 right-3 rounded-lg bg-black/75 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-xs">
            {facility.pricePerHour} lei / oră
          </div>
        )}
      </div>

      <CardContent className="p-5 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
            {facility.name}
          </h3>
          {facility.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {facility.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-primary" />
              {facility.openHour && facility.closeHour
                ? `${facility.openHour} – ${facility.closeHour}`
                : "08:00 – 22:00"}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              Campus USV
            </span>
          </div>
        </div>

        <div className="pt-5 mt-auto">
          {isBookingDisabled ? (
            <Button
              disabled
              className="w-full text-xs font-semibold"
              title={isBlocked ? "Contul este blocat" : "Ai atins limita de 3 rezervări pe lună"}
            >
              {isBlocked ? "Cont blocat" : "Limită atinsă (3/3)"}
            </Button>
          ) : (
            <Button asChild className="w-full font-semibold shadow-xs">
              <Link to={`/rezerva/${facility.id}`}>
                Rezervă teren
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default FacilityCard;

