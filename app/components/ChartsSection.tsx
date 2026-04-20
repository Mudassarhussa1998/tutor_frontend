'use client';

import { BarChart3, TrendingUp } from 'lucide-react';

export function ChartsSection() {
  const monthlyData = [
    { month: 'Jan', value: 65 },
    { month: 'Feb', value: 78 },
    { month: 'Mar', value: 82 },
    { month: 'Apr', value: 75 },
    { month: 'May', value: 88 },
    { month: 'Jun', value: 92 },
  ];

  const maxValue = Math.max(...monthlyData.map(d => d.value));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Bar Chart */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-accent">Monthly Performance</h3>
          <BarChart3 className="w-5 h-5 text-muted" />
        </div>

        <div className="space-y-4">
          {monthlyData.map((data) => (
            <div key={data.month} className="flex items-center space-x-4">
              <div className="w-12 text-sm text-muted font-medium">{data.month}</div>
              <div className="flex-1">
                <div className="w-full bg-[#F7F7F2] rounded-full h-3">
                  <div
                    className="bg-accent h-3 rounded-l-full transition-all duration-500"
                    style={{
                      width: `${(data.value / maxValue) * 100}%`,
                      borderTopRightRadius: '4px',
                      borderBottomRightRadius: '4px'
                    }}
                  />
                </div>
              </div>
              <div className="w-12 text-sm text-accent font-medium text-right">{data.value}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Circular Gauge */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-accent">Deal Conversion</h3>
          <TrendingUp className="w-5 h-5 text-muted" />
        </div>

        <div className="flex flex-col items-center">
          <div className="relative w-32 h-32 mb-4">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              {/* Background circle */}
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#F7F7F2"
                strokeWidth="2"
              />
              {/* Progress circle */}
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#1A1A1A"
                strokeWidth="2"
                strokeDasharray="68, 100"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-semibold text-accent">68%</div>
                <div className="text-xs text-muted">Conversion</div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted">Target: 75%</p>
            <p className="text-xs text-muted mt-1">7% below target</p>
          </div>
        </div>
      </div>
    </div>
  );
}