import { lazy } from "react";
import { ResponsiveContainer, AreaChart, Area } from "recharts";

export const FJetton = ({ data, height = 50, color }) => (
  <ResponsiveContainer width="100%" height={height} className="jetton-chart">
    <AreaChart width={300} height={height} data={data}>
      <Area
        name="pv"
        type="natural"
        dot={false}
        dataKey="pv"
        stroke={color}
        fill={
          color === "#1ac964"
            ? "#107c3e"
            : color === "#f31260"
            ? "#7c1010"
            : "#727272"
        }
        strokeWidth={2}
      />
    </AreaChart>
  </ResponsiveContainer>
);
