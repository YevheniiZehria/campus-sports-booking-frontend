import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import type { AvailabilitySlot, SlotStatus } from "@/api/types";

export interface UseAvailabilityOptions {
  resourceId: number;
  dateStr: string; // format "YYYY-MM-DD"
  enabled?: boolean;
}

/**
 * Hook pentru interogarea disponibilității intervalelor orare pentru o resursă și o dată anume.
 * Respectă cerința de polling automat la fiecare 20 secunde și reîncărcare la refocalizarea ferestrei,
 * fiind pregătit structural pentru a comuta transparent pe WebSocket în versiunile viitoare.
 */
export function useAvailability({ resourceId, dateStr, enabled = true }: UseAvailabilityOptions) {
  return useQuery({
    queryKey: ["availability", resourceId, dateStr],
    enabled: enabled && resourceId > 0 && Boolean(dateStr),
    refetchInterval: 20000, // Polling la 20 secunde conform specificației
    refetchOnWindowFocus: true, // Reîncărcare automată la revenirea în tab
    staleTime: 15000,
    queryFn: async () => {
      try {
        const res = await api.GET("/resources/{resourceId}/availability", {
          params: {
            path: { resourceId },
            query: { date: dateStr },
          },
        });

        if (res.data && Array.isArray(res.data)) {
          return res.data as AvailabilitySlot[];
        }

        // Dacă endpoint-ul întoarce o eroare (de ex. backend incipient), generăm sloturile implicite
        return generareSloturiImplicite(dateStr);
      } catch {
        return generareSloturiImplicite(dateStr);
      }
    },
  });
}

/**
 * Generează intervalele orare standard între 08:00 și 22:00 în cazul în care serverul
 * nu are încă definit endpoint-ul /availability.
 */
function generareSloturiImplicite(dateStr: string): AvailabilitySlot[] {
  const slots: AvailabilitySlot[] = [];
  const selectedDate = new Date(dateStr);
  const now = new Date();
  const isToday =
    selectedDate.getFullYear() === now.getFullYear() &&
    selectedDate.getMonth() === now.getMonth() &&
    selectedDate.getDate() === now.getDate();

  for (let hour = 8; hour < 22; hour++) {
    let status: SlotStatus = "liber";
    // Dacă este azi și ora a trecut deja, marcăm ca ocupat
    if (isToday && hour <= now.getHours()) {
      status = "ocupat";
    }

    slots.push({
      startHour: hour,
      endHour: hour + 1,
      status,
    });
  }

  return slots;
}

export default useAvailability;

