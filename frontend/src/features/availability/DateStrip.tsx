import { addDays, format, isSameDay } from "date-fns";
import { ro } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface DateStripProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  maxDays?: number; // max 14 zile conform regulamentului USV
}

export function DateStrip({ selectedDate, onSelectDate, maxDays = 14 }: DateStripProps) {
  const today = new Date();
  const days = Array.from({ length: 15 }, (_, i) => addDays(today, i));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Alege data (max. 14 zile în avans):
        </label>
        <span className="text-xs font-medium text-primary">
          {format(selectedDate, "EEEE, d MMMM yyyy", { locale: ro })}
        </span>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 pt-1 scrollbar-thin">
        {days.map((day, index) => {
          const isSelected = isSameDay(day, selectedDate);
          const isBeyondLimit = index > maxDays;
          const isToday = index === 0;

          return (
            <button
              key={day.toISOString()}
              disabled={isBeyondLimit}
              onClick={() => onSelectDate(day)}
              className={cn(
                "flex min-w-[70px] flex-col items-center justify-center rounded-xl border p-2.5 transition-all min-h-[58px]",
                isSelected
                  ? "border-primary bg-primary text-primary-foreground shadow-sm font-semibold scale-102"
                  : isBeyondLimit
                    ? "border-border/40 bg-muted/40 text-muted-foreground/40 cursor-not-allowed opacity-40"
                    : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-accent cursor-pointer"
              )}
              title={isBeyondLimit ? "Regulament USV: maxim 14 zile în avans" : undefined}
            >
              <span className="text-[11px] font-medium capitalize">
                {isToday ? "Azi" : format(day, "EEE", { locale: ro })}
              </span>
              <span className="text-lg font-bold leading-tight">
                {format(day, "d")}
              </span>
              <span className="text-[10px] opacity-80">
                {format(day, "MMM", { locale: ro })}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default DateStrip;

