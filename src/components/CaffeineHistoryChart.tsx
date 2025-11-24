import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import type { CaffeineEntry } from '@/types';

interface CaffeineHistoryChartProps {
  entries: CaffeineEntry[];
}

export function CaffeineHistoryChart({ entries }: CaffeineHistoryChartProps) {
  // 시간별 누적 카페인량 계산
  let total = 0;
  const data = entries
    .slice()
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
    .map((entry) => {
      total += entry.caffeine;
      return {
        name: entry.timestamp instanceof Date ?
          `${entry.timestamp.getHours()}:${entry.timestamp.getMinutes().toString().padStart(2, '0')}` :
          entry.timestamp,
        caffeine: total,
        drink: entry.drink,
      };
    });

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(value: any, name: any, props: any) => [`${value}mg`, '누적 카페인']} />
          <Line type="monotone" dataKey="caffeine" stroke="#8884d8" strokeWidth={2} dot />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
