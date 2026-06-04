"use client";

import { useMemo, useState } from "react";

type Point = {
  date: string;
  views: number;
  visitors: number;
  avgTime?: number;
  bounce_rate?: number;
};

type MetricType = "views" | "visitors" | "avgTime" | "bounce";

export function AreaChart({
  data,
  metric = "views",
}: {
  data: Point[];
  metric?: MetricType;
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const w = 900;
  const h = 280;
  const pad = { l: 40, r: 16, t: 16, b: 28 };

  // Detect if data is hourly (contains ISO timestamp) or daily (YYYY-MM-DD format)
  const isHourly = data.length > 0 && data[0].date.includes("T");

  // Calculate optimal interval for x-axis labels to avoid clutter
  const getLabelInterval = (dataLength: number): number => {
    if (dataLength <= 7) return 1; // Show all labels for 7 days
    if (dataLength <= 24) return Math.ceil(dataLength / 6); // Show ~6 labels for hourly
    if (dataLength <= 30) return 5; // Show every 5 days for 30 days
    return Math.ceil(dataLength / 10); // Show ~10 labels for 90 days
  };

  const labelInterval = getLabelInterval(data.length);

  const formatDateLabel = (dateString: string): string => {
    const date = new Date(dateString);
    if (isHourly) {
      return date.toLocaleTimeString(undefined, {
        hour: "numeric",
        hour12: true,
      });
    }
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

  const formatTooltipDate = (dateString: string): string => {
    const date = new Date(dateString);
    if (isHourly) {
      return date.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

  const formatMetricValue = (value: number): string => {
    switch (metric) {
      case "avgTime":
        const mins = Math.floor(value / 60);
        const secs = value % 60;
        return `${mins}m ${secs}s`;
      case "bounce":
        return `${value}%`;
      default:
        return value.toLocaleString();
    }
  };

  const { path, area, max, xs, ys, getMetricValue } = useMemo(() => {
    const getMetricValueFn = (point: Point): number => {
      switch (metric) {
        case "visitors":
          return point.visitors;
        case "avgTime":
          return point.avgTime || 0;
        case "bounce":
          return point.bounce_rate || 0;
        case "views":
        default:
          return point.views;
      }
    };

    const values = data.map(getMetricValueFn);
    const max = Math.max(...values) * 1.15;
    const stepX = (w - pad.l - pad.r) / Math.max(1, data.length - 1);
    const xs = data.map((_, i) => pad.l + i * stepX);
    const ys = (v: number) => h - pad.b - (v / max) * (h - pad.t - pad.b);

    const line = (vals: number[]) =>
      vals
        .map(
          (v, i) =>
            `${i === 0 ? "M" : "L"} ${xs[i].toFixed(1)} ${ys(v).toFixed(1)}`,
        )
        .join(" ");

    const path = line(values);
    const area =
      path +
      ` L ${xs[xs.length - 1].toFixed(1)} ${(h - pad.b).toFixed(1)} L ${xs[0].toFixed(1)} ${(h - pad.b).toFixed(1)} Z`;

    return { path, area, max, xs, ys, getMetricValue: getMetricValueFn };
  }, [data, metric, w, h, pad.b, pad.l, pad.r, pad.t]);

  const yTicks = 4;
  const yVals = Array.from({ length: yTicks + 1 }, (_, i) =>
    Math.round((max * i) / yTicks),
  );

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * w;

    // Find nearest point
    const stepX = (w - pad.l - pad.r) / Math.max(1, data.length - 1);
    const index = Math.round((x - pad.l) / stepX);

    if (index >= 0 && index < data.length) {
      setHoveredIndex(index);
    } else {
      setHoveredIndex(null);
    }
  };

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="h-72 w-full touch-none"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredIndex(null)}
      >
        <defs>
          <linearGradient id="metricGrad" x1="0" x2="0" y1="0" y2="1">
            <stop
              offset="0%"
              stopColor="var(--color-primary)"
              stopOpacity="0.35"
            />
            <stop
              offset="100%"
              stopColor="var(--color-primary)"
              stopOpacity="0"
            />
          </linearGradient>
        </defs>
        {yVals.map((v, i) => {
          const y = h - pad.b - (v / max) * (h - pad.t - pad.b);
          return (
            <g key={i}>
              <line
                x1={pad.l}
                x2={w - pad.r}
                y1={y}
                y2={y}
                stroke="var(--color-border)"
                strokeDasharray="3 3"
              />
              <text
                x={pad.l - 8}
                y={y + 4}
                textAnchor="end"
                fontSize="10"
                fill="var(--color-muted-foreground)"
              >
                {formatMetricValue(v)}
              </text>
            </g>
          );
        })}
        {data.map((d, i) => {
          // Only show label if index is divisible by interval
          if (i % labelInterval !== 0) return null;
          return (
            <text
              key={d.date}
              x={xs[i]}
              y={h - 8}
              textAnchor="middle"
              fontSize="10"
              fill="var(--color-muted-foreground)"
            >
              {formatDateLabel(d.date)}
            </text>
          );
        })}
        <path d={area} fill="url(#metricGrad)" />
        <path
          d={path}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="2"
        />
        {data.map((d, i) => (
          <circle
            key={i}
            cx={xs[i]}
            cy={ys(getMetricValue(d))}
            r={hoveredIndex === i ? "5" : "3"}
            fill="var(--color-primary)"
            className="transition-all duration-200"
          />
        ))}

        {/* Tooltip */}
        {hoveredIndex !== null && (
          <g pointerEvents="none">
            <line
              x1={xs[hoveredIndex]}
              x2={xs[hoveredIndex]}
              y1={pad.t}
              y2={h - pad.b}
              stroke="var(--color-primary)"
              strokeWidth="1"
              strokeDasharray="4 4"
              opacity="0.5"
            />
            {(() => {
              const xValue = xs[hoveredIndex];
              const yValue = ys(getMetricValue(data[hoveredIndex]));
              // Shift tooltip if too close to edges
              const rectWidth = 120;
              const rectHeight = 45;
              let rectX = xValue - rectWidth / 2;
              if (rectX < pad.l) rectX = pad.l;
              if (rectX + rectWidth > w - pad.r) rectX = w - pad.r - rectWidth;

              let rectY = yValue - rectHeight - 10;
              if (rectY < pad.t) rectY = yValue + 15; // Show below point if too high

              return (
                <g>
                  <rect
                    x={rectX}
                    y={rectY}
                    width={rectWidth}
                    height={rectHeight}
                    rx="6"
                    fill="var(--color-background)"
                    stroke="var(--color-border)"
                    strokeWidth="1"
                    className="shadow-xl"
                  />
                  <text
                    x={rectX + rectWidth / 2}
                    y={rectY + 18}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="500"
                    fill="var(--color-muted-foreground)"
                  >
                    {formatTooltipDate(data[hoveredIndex].date)}
                  </text>
                  <text
                    x={rectX + rectWidth / 2}
                    y={rectY + 36}
                    textAnchor="middle"
                    fontSize="14"
                    fontWeight="700"
                    fill="var(--color-primary)"
                  >
                    {formatMetricValue(getMetricValue(data[hoveredIndex]))}
                  </text>
                </g>
              );
            })()}
          </g>
        )}
      </svg>
    </div>
  );
}
