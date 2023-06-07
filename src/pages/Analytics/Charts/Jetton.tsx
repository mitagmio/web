import { Line, LineChart, ResponsiveContainer } from "recharts";

export const JettonChart = ({ index, data, height = 50, color }) => (
  <ResponsiveContainer width="100%" height={height} className="jetton-chart">
    <LineChart width={300} height={height} data={data}>
      <Line
        animationBegin={150 * index}
        name="volume"
        type="natural"
        dot={false}
        dataKey="volume"
        stroke="transparent"
        strokeWidth={1}
      />
      <Line
        animationBegin={150 * index}
        name="pv"
        type="natural"
        dot={false}
        dataKey="pv"
        stroke={color}
        strokeWidth={2}
      />
    </LineChart>
  </ResponsiveContainer>
);
