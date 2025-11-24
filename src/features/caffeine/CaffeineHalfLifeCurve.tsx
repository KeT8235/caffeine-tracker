import {
  Area,
  AreaChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

interface CaffeineHalfLifeCurveProps {
  currentAmount: number;
}

export function CaffeineHalfLifeCurve({
  currentAmount,
}: CaffeineHalfLifeCurveProps) {
  // Caffeine half-life is approximately 5 hours
  // Generate data points for 12 hours
  const generateHalfLifeData = () => {
    const data = [];
    const halfLife = 5; // hours

    for (let hour = 0; hour <= 12; hour += 0.5) {
      const amount = currentAmount * Math.pow(0.5, hour / halfLife);
      data.push({
        hour,
        // 소수점 없이 정수만 사용
        caffeine: Number(amount.toFixed(0)),
        label: hour === 0 ? "Now" : `${hour}h`,
      });
    }

    return data;
  };

  const data = generateHalfLifeData();
  const halfLifePoint = data.find((d) => d.hour === 5);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-xs text-muted-foreground">카페인 반감기</span>
        </div>
        <span className="text-xs text-muted-foreground">
          5시간 후 {halfLifePoint?.caffeine.toFixed(0)}mg
        </span>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 15, left: 0, bottom: 10 }}
        >
          <defs>
            <linearGradient id="caffeineGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8B4513" stopOpacity={0.4} />
              <stop offset="50%" stopColor="#D2691E" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#F4A460" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          
          {/* 그리드 라인 추가 */}
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#E5D8C7" 
            strokeOpacity={0.3}
            vertical={false}
          />
          
          <XAxis
            dataKey="hour"
            tick={{ fontSize: 11, fill: "#6B5744", fontWeight: 500 }}
            tickLine={false}
            axisLine={{ stroke: "#E5D8C7", strokeWidth: 1 }}
            ticks={[0, 3, 6, 9, 12]}
            tickFormatter={(value) => `${value}h`}
          />
          
          <YAxis 
            tick={{ fontSize: 10, fill: "#6B5744" }}
            tickLine={false}
            axisLine={false}
            width={35}
            tickFormatter={(value) => `${value}`}
          />
          
          <Tooltip
            cursor={{ stroke: "#8B4513", strokeWidth: 2, strokeDasharray: "5 5" }}
            formatter={(value: any) => [`${(value as number).toFixed(0)}mg`, "카페인"]}
            labelFormatter={(label: any) => `${label}시간 후`}
            contentStyle={{
              borderRadius: 12,
              border: "2px solid #8B4513",
              fontSize: 12,
              fontWeight: 600,
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          />
          
          <Area
            type="monotone"
            dataKey="caffeine"
            stroke="#8B4513"
            strokeWidth={3}
            fill="url(#caffeineGradient)"
            animationDuration={1500}
            animationEasing="ease-out"
          />
          
          {/* 데이터 포인트를 더 크고 명확하게 */}
          <Line
            type="monotone"
            dataKey="caffeine"
            stroke="#8B4513"
            strokeWidth={3}
            dot={{ 
              r: 4, 
              strokeWidth: 2, 
              stroke: "#8B4513", 
              fill: "#FFF",
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
            }}
            activeDot={{ 
              r: 6, 
              strokeWidth: 3,
              stroke: "#8B4513",
              fill: "#FFD700"
            }}
            animationDuration={1500}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
