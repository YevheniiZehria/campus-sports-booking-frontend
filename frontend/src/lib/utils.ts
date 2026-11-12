import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utilitar de fuzionare a claselor Tailwind CSS cu gestionarea conflictelor.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

