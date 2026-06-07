export default function DeltaIndicator({
  value,
  isPercentagePoint = false,
  inverseColors = false,
}: {
  value: number;
  isPercentagePoint?: boolean;
  inverseColors?: boolean;
}) {
  if (value === 0 || value === undefined || isNaN(value)) {
    return <span className="text-muted-foreground">—</span>;
  }

  const isPositive = value > 0;
  const displaySign = isPositive ? "+" : "−";
  const formattedValue = Math.abs(value).toFixed(1);

  // ──► INVERSE LOGIC: If true, increases are Red and decreases are Green
  const positiveColor = inverseColors ? "text-red-500" : "text-emerald-500";
  const negativeColor = inverseColors ? "text-emerald-500" : "text-red-500";

  const colorClass = isPositive ? positiveColor : negativeColor;

  return (
    <span className={`inline-flex items-center font-medium ${colorClass}`}>
      {displaySign}
      {formattedValue}%
      {!isPercentagePoint && (
        <span className="text-muted-foreground font-normal ml-1">vs prev.</span>
      )}
    </span>
  );
}
