import fotbalImg from "@/assets/teren-fotbal.jpg";
import tenisImg from "@/assets/teren-tenis.jpg";
import inotImg from "@/assets/bazin-inot.jpg";
import baschetImg from "@/assets/teren-baschet.jpg";

export function getSportImage(sport?: string, type?: string): string {
  const s = (sport || "").toLowerCase();
  const t = (type || "").toLowerCase();

  if (s.includes("fotbal") || s.includes("teren fotbal")) return fotbalImg;
  if (s.includes("tenis")) return tenisImg;
  if (s.includes("inot") || s.includes("înot") || t.includes("bazin") || s.includes("bazin")) return inotImg;
  if (s.includes("baschet") || s.includes("volei")) return baschetImg;

  return fotbalImg;
}

