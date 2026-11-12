import { Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface MonthlyLimitCardProps {
  usedCount: number;
  maxLimit?: number;
}

export function MonthlyLimitCard({ usedCount, maxLimit = 3 }: MonthlyLimitCardProps) {
  const percentage = Math.min(100, Math.round((usedCount / maxLimit) * 100));
  const remaining = Math.max(0, maxLimit - usedCount);
  const isFull = usedCount >= maxLimit;

  return (
    <Card className="h-full border-border/80 shadow-xs flex flex-col justify-between">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
            Limită lunară studenți
          </CardTitle>
          <span className="text-xs font-bold text-primary">
            {usedCount}/{maxLimit} rezervări
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Progress value={percentage} className="h-2.5" />
        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <Info className="h-4 w-4 shrink-0 text-primary mt-0.5" />
          <p className="leading-relaxed">
            {isFull
              ? "Ai utilizat toate cele 3 rezervări gratuite pentru luna în curs."
              : `Mai ai dreptul la ${remaining} ${remaining === 1 ? "rezervare gratuită" : "rezervări gratuite"} luna aceasta.`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default MonthlyLimitCard;

