import React, { useMemo } from 'react';
import { Market } from '../types';

interface OddsChartProps {
  market: Market;
}

const COLORS = ['#14b8a6', '#f59e0b', '#8b5cf6', '#ec4899', '#3b82f6']; // cascade-500, amber, violet, pink, blue

const OddsChart: React.FC<OddsChartProps> = ({ market }) => {
  const height = 250;
  const width = 600;
  const padding = 20;

  const data = market.priceHistory;

  const points = useMemo(() => {
    if (data.length < 2) return [];

    const minTime = data[0].timestamp;
    const maxTime = data[data.length - 1].timestamp;
    const timeRange = maxTime - minTime;

    return market.outcomes.map((outcome, index) => {
      const linePoints = data.map((point) => {
        const x = ((point.timestamp - minTime) / timeRange) * (width - padding * 2) + padding;
        // Invert Y because SVG 0 is top
        const y = height - padding - (point.outcomeOdds[outcome.id] / 100) * (height - padding * 2);
        return `${x},${y}`;
      }).join(' ');
      
      return {
        id: outcome.id,
        name: outcome.name,
        color: COLORS[index % COLORS.length],
        svgPoints: linePoints,
        currentOdds: outcome.odds
      };
    });
  }, [data, market.outcomes]);

  if (data.length === 0) {
      return (
          <div className="h-[250px] bg-slate-900 rounded-xl flex items-center justify-center text-slate-500 border border-slate-800">
              Not enough data for chart
          </div>
      );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-inner">
      <div className="flex justify-between items-center mb-4 px-2">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Probability History</h3>
          <div className="flex gap-3">
              {points.map(p => (
                  <div key={p.id} className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }}></div>
                      <span className="text-xs text-slate-300 font-medium">{p.name}</span>
                  </div>
              ))}
          </div>
      </div>
      
      <div className="relative w-full h-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
            {/* Grid Lines */}
            {[0, 25, 50, 75, 100].map(tick => {
                const y = height - padding - (tick / 100) * (height - padding * 2);
                return (
                    <g key={tick}>
                        <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#334155" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
                        <text x={0} y={y + 3} fontSize="10" fill="#64748b" textAnchor="start">{tick}%</text>
                    </g>
                );
            })}

            {/* Lines */}
            {points.map((p) => (
                <polyline
                    key={p.id}
                    points={p.svgPoints}
                    fill="none"
                    stroke={p.color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-all duration-300 ease-in-out"
                />
            ))}
        </svg>
      </div>
    </div>
  );
};

export default OddsChart;