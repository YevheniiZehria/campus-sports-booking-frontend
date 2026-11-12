import { Link } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { ro } from "date-fns/locale";
import { Calendar, ChevronRight } from "lucide-react";
import type { Reservation } from "@/api/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface NextBookingCardProps {
  booking?: Reservation | null;
  isLoading?: boolean;
}

export function NextBookingCard({ booking, isLoading }: NextBookingCardProps) {
  if (isLoading) {
    return (
      <Card className="h-full border-border/80 shadow-xs">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold uppercase text-muted-foreground tracking-wider">
            Următoarea ta rezervare
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="h-5 w-3/4 bg-muted animate-pulse rounded-md" />
          <div className="h-4 w-1/2 bg-muted animate-pulse rounded-md" />
        </CardContent>
      </Card>
    );
  }

  if (!booking) {
    return (
      <Card className="h-full border-border/80 shadow-xs flex flex-col justify-between">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
            Următoarea ta rezervare
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm">Nu ai nicio rezervare viitoare confirmată.</p>
          </div>
          <Button asChild variant="outline" size="sm" className="w-full text-xs font-semibold">
            <Link to="/rezerva">Alege un teren acum</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const startDate = parseISO(booking.start);
  const endDate = parseISO(booking.end);
  const formattedDate = format(startDate, "EEEE, d MMMM yyyy", { locale: ro });
  const formattedHours = `${format(startDate, "HH:mm")} – ${format(endDate, "HH:mm")}`;

  return (
    <Card className="h-full border-border/80 shadow-xs flex flex-col justify-between">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
          Următoarea ta rezervare
        </CardTitle>
        <Link
          to="/rezervarile-mele"
          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
        >
          Toate <ChevronRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="font-bold text-foreground text-base">
              {booking.resourceName || `Teren #${booking.resourceId}`}
            </h4>
            <p className="text-xs text-muted-foreground capitalize">{formattedDate}</p>
            <p className="text-sm font-semibold text-primary mt-1">{formattedHours}</p>
          </div>
          <Badge
            variant={booking.status === "ACTIVA" ? "success" : "secondary"}
            className="text-xs font-medium"
          >
            {booking.status === "ACTIVA" ? "Confirmată" : booking.status}
          </Badge>
        </div>
        {booking.totalPrice !== undefined && booking.totalPrice !== null && (
          <div className="flex items-center justify-between border-t border-border/60 pt-2 text-xs">
            <span className="text-muted-foreground">Plată la recepție</span>
            <span className="font-bold">{booking.totalPrice} lei</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default NextBookingCard;

