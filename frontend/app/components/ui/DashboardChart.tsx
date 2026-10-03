"use client";

import { useState } from "react";

interface DataPoint {
  label: string;
  value: number;
}

interface DashboardChartProps {
  title: string;
  data: DataPoint[];
  prefix?: string;
}

export function DashboardChart({ title, data, prefix = "₹" }: DashboardChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/10 text-slate-500">
        No sales data recorded yet.
      </div>
    );
  }

  const values = data.map((d) => d.value);
  const maxVal = Math.max(...values, 1000);
  const minVal = Math.min(...values, 0);
  const range = maxVal - minVal;

  // SVG dimensions
  const width = 600;
  const height = 240;
  const padding = 40;

  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Generate coordinates
  const points = data.map((d, index) => {
    const x = padding + (index / (data.length - 1)) * chartWidth;
    const y = padding + chartHeight - ((d.value - minVal) / range) * chartHeight;
    return { x, y, label: d.label, value: d.value };
  });

  // Generate SVG Line Path
  let pathD = "";
  if (points.length > 0) {
    pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      pathD += ` L ${points[i].x} ${points[i].y}`;
    }
  }

  // Generate SVG Area Path (closes the path at the bottom of the chart area)
  let areaD = "";
  if (points.length > 0) {
    areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-6 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">{title}</h3>
        {hoveredIdx !== null && (
          <span className="text-xs font-semibold text-indigo-400">
            {points[hoveredIdx].label}: {prefix}
            {points[hoveredIdx].value.toLocaleString("en-IN")}
          </span>
        )}
      </div>

      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
          <defs>
            {/* Area Fill Gradient */}
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
            </linearGradient>
            {/* Glow Filter */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#6366f1" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = padding + chartHeight * ratio;
            const val = maxVal - range * ratio;
            return (
              <g key={idx} className="opacity-20">
                <line
                  x1={padding}
                  y1={y}
                  x2={width - padding}
                  y2={y}
                  stroke="#475569"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding - 8}
                  y={y + 4}
                  fill="#94a3b8"
                  fontSize="10"
                  textAnchor="end"
                  className="font-mono font-medium"
                >
                  {prefix}
                  {Math.round(val).toLocaleString("en-IN")}
                </text>
              </g>
            );
          })}

          {/* Area Path */}
          {areaD && <path d={areaD} fill="url(#chartGradient)" />}

          {/* Line Path */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke="#6366f1"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glow)"
            />
          )}

          {/* Interaction Dots & Guides */}
          {points.map((pt, idx) => (
            <g
              key={idx}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="cursor-pointer"
            >
              {/* Vertical Guide Line */}
              {hoveredIdx === idx && (
                <line
                  x1={pt.x}
                  y1={padding}
                  x2={pt.x}
                  y2={height - padding}
                  stroke="#818cf8"
                  strokeWidth="1.5"
                  strokeDasharray="2 2"
                  className="opacity-40"
                />
              )}

              {/* Data points */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r={hoveredIdx === idx ? 8 : 4.5}
                fill={hoveredIdx === idx ? "#818cf8" : "#4f46e5"}
                stroke="#020617"
                strokeWidth={hoveredIdx === idx ? 3.5 : 2}
                className="transition-all duration-150"
              />

              {/* invisible target for easier hovering */}
              <circle cx={pt.x} cy={pt.y} r="20" fill="transparent" />
            </g>
          ))}

          {/* X-Axis Labels */}
          {points.map((pt, idx) => {
            // Only show labels for some intervals if too many points
            if (points.length > 8 && idx % 2 !== 0) return null;
            return (
              <text
                key={idx}
                x={pt.x}
                y={height - padding + 20}
                fill="#64748b"
                fontSize="10"
                textAnchor="middle"
                className="font-semibold"
              >
                {pt.label}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
