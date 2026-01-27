
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface HashChartProps {
  hashRate: number;
  isMining: boolean;
}

const HashChart: React.FC<HashChartProps> = ({ hashRate, isMining }) => {
  const [data, setData] = useState<{ time: string; value: number }[]>([]);

  useEffect(() => {
    // Initialize with some starting data points at zero
    const initialData = [];
    for (let i = 4; i >= 0; i--) {
      initialData.push({
        time: new Date(Date.now() - i * 2000).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        value: 0
      });
    }
    setData(initialData);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        let currentValue = isMining ? hashRate : 0;

        // Add realistic fluctuations when mining
        if (isMining && hashRate > 0) {
          // Create random variations: ±15% around the base hashrate
          const variation = (Math.random() - 0.5) * 0.3; // -15% to +15%
          currentValue = Math.max(0, hashRate * (1 + variation));

          // Occasionally add dips (simulate network difficulty or system load)
          if (Math.random() < 0.1) { // 10% chance of a dip
            currentValue = hashRate * (0.3 + Math.random() * 0.3); // 30-60% of normal rate
          }

          // Occasionally add spikes (simulate optimal conditions)
          if (Math.random() < 0.05) { // 5% chance of a spike
            currentValue = hashRate * (1.1 + Math.random() * 0.3); // 110-140% of normal rate
          }
        }

        const newData = [...prev, {
          time: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          value: Math.round(currentValue)
        }];
        return newData.slice(-20);
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [hashRate, isMining]);

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 text-white">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Performance Overview</h3>
          <p className="text-sm">Real-time hashrate output (H/s)</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-3 w-3 relative">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isMining ? 'bg-green-400' : 'bg-zinc-500'} opacity-75`}></span>
            <span className={`relative inline-flex rounded-full h-3 w-3 ${isMining ? 'bg-green-500' : 'bg-zinc-600'}`}></span>
          </span>
          <span className="text-xs font-medium text-white">{isMining ? 'Broadcasting Shares' : 'Idle'}</span>
        </div>
      </div>

      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorHash" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ffffff" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis
              dataKey="time"
              stroke="#52525b"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              minTickGap={30}
            />
            <YAxis
              stroke="#52525b"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}H`}
              domain={[0, 'dataMax + 100']}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px' }}
              itemStyle={{ color: '#ffffff', fontSize: '12px' }}
              labelStyle={{ color: '#a1a1aa', fontSize: '10px', marginBottom: '4px' }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#ffffff"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorHash)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HashChart;
