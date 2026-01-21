import { useState } from "react";
import {AreaChart,Area,XAxis,YAxis,CartesianGrid,Tooltip,ResponsiveContainer,type TooltipProps,} from "recharts";
import { aggregateSessionsByDay } from "../utils/chartData";
import type { TrainingSession } from "../features/types";
import type { CSSProperties } from "react";

interface SessionChartProps {
  sessions: TrainingSession[];
}

export default function SessionChart({ sessions }: SessionChartProps) {
  const [visibleMetrics, setVisibleMetrics] = useState({
    feeling: true,
    performance: true,
    rating: true,
  });

  const toggleMetric = (metric: keyof typeof visibleMetrics) => {
    setVisibleMetrics((prev) => ({ ...prev, [metric]: !prev[metric] }));
  };

  const data = aggregateSessionsByDay(sessions);
  if (data.length === 0) {
    return <div style={styles.empty}>Ei tarpeeksi dataa kaaviolle</div>;}

  return (
    <section style={styles.container}>
        
      {/* <h2 style={styles.title}>Harjoitussuoritusviikko</h2> */}

      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 30 }}>
          <defs>
            <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.5} />
              <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="colorPerformance" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00D9FF" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#00D9FF" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="colorFeeling" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FFB703" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#FFB703" stopOpacity={0.1} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
          <XAxis
            dataKey="date"
            tick={<CustomTick />}
            stroke="rgba(0,0,0,0.3)"
            style={{ fontSize: 12 }}
          />
          <YAxis
            domain={[0, 10]}
            stroke="rgba(0,0,0,0.3)"
            width={35}
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />

          <Area
            type="monotone"
            dataKey="feeling"
            stroke="#FFB703"
            fillOpacity={1}
            fill="url(#colorFeeling)"
            name="Fiilis"
            hide={!visibleMetrics.feeling}
          />
          <Area
            type="monotone"
            dataKey="performance"
            stroke="#00D9FF"
            fillOpacity={1}
            fill="url(#colorPerformance)"
            name="Suoritus"
            hide={!visibleMetrics.performance}
          />
          <Area
            type="monotone"
            dataKey="rating"
            stroke="#8B5CF6"
            fillOpacity={1}
            fill="url(#colorRating)"
            name="Arvosana"
            hide={!visibleMetrics.rating}
          />
        </AreaChart>
      </ResponsiveContainer>

      <div style={styles.legend}>
        <div
          style={{ ...styles.legendItem, opacity: visibleMetrics.feeling ? 1 : 0.4 }}
          onClick={() => toggleMetric("feeling")}
        >
          <div style={{ ...styles.legendColor, backgroundColor: "#FFB703" }} />
          <span>Fiilis</span>
        </div>
        <div
          style={{ ...styles.legendItem, opacity: visibleMetrics.performance ? 1 : 0.4 }}
          onClick={() => toggleMetric("performance")}
        >
          <div style={{ ...styles.legendColor, backgroundColor: "#00D9FF" }} />
          <span>Suoritus</span>
        </div>
        <div
          style={{ ...styles.legendItem, opacity: visibleMetrics.rating ? 1 : 0.4 }}
          onClick={() => toggleMetric("rating")}
        >
          <div style={{ ...styles.legendColor, backgroundColor: "#8B5CF6" }} />
          <span>Arvosana</span>
        </div>
      </div>
    </section>
  );
}

function CustomTick(props: any) {
  const { x, y, payload } = props;
  const date = new Date(payload.value);
  const formatted = `${date.getDate()}.${date.getMonth() + 1}.`;

  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={4} textAnchor="middle" fill="rgba(0,0,0,0.6)" fontSize={11}>
        {formatted}
      </text>
    </g>
  );
}

interface CustomTooltipProps extends TooltipProps<number, string> {
  active?: boolean;
  payload?: Array<{ name: string; value: number }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload) return null;

  const date = new Date(label as string);
  const formatted = date.toLocaleDateString("fi-FI");

  return (
    <div style={styles.tooltip}>
      <p style={styles.tooltipDate}>{formatted}</p>
      {payload.map((entry, idx) => (
        <p key={idx} style={{ ...styles.tooltipValue }}>
          {entry.name}: {entry.value.toFixed(1)}
        </p>
      ))}
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  container: {
    padding: "12px",
    margin: "12px 0",
    borderRadius: 12,
    background: "rgba(0,0,0,0.02)",
  },
  title: {
    margin: "0 0 12px 0",
    fontSize: 16,
    fontWeight: 600,
    color: "#333",
  },
  empty: {
    padding: 24,
    textAlign: "center",
    color: "rgba(0,0,0,0.4)",
    fontSize: 14,
  },
  legend: {
    display: "flex",
    gap: 16,
    justifyContent: "center",
    marginTop: 12,
    flexWrap: "wrap",
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 12,
    cursor: "pointer",
    userSelect: "none",
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  tooltip: {
    background: "white",
    padding: "8px 12px",
    borderRadius: 8,
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
    fontSize: 12,
  },
  tooltipDate: {
    margin: "0 0 4px 0",
    fontWeight: 600,
    color: "#333",
  },
  tooltipValue: {
    margin: "2px 0",
  },
};
