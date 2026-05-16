import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { MoreHorizontal } from 'lucide-react';

const donutData = [
  { name: 'Hardware', value: 400, color: '#000000' },
  { name: 'Software', value: 300, color: '#3B82F6' },
  { name: 'Network', value: 300, color: '#D1D5DB' },
];

const MetricsWidgets = () => {
  return (
    <div className="flex gap-6" style={{ marginTop: '2rem' }}>
      
      {/* Top Case Drivers - Donut Chart */}
      <div className="card" style={{ flex: 1, padding: '1.5rem' }}>
        <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
          <h2 className="font-semibold">Top Case Drivers</h2>
          <button className="btn-icon">
            <MoreHorizontal size={20} />
          </button>
        </div>
        <div style={{ height: '200px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={donutData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {donutData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-4 mt-4">
          {donutData.map(item => (
            <div key={item.name} className="flex items-center gap-2">
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: item.color }}></div>
              <span className="text-sm text-secondary">{item.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Case Metrics - Gauge Placeholder */}
      <div className="card" style={{ flex: 1, padding: '1.5rem' }}>
        <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
          <h2 className="font-semibold">SLA Compliance</h2>
          <button className="btn-icon">
            <MoreHorizontal size={20} />
          </button>
        </div>
        <div className="flex justify-center items-center" style={{ height: '200px' }}>
          {/* A simple CSS/SVG gauge placeholder */}
          <div style={{ position: 'relative', width: '160px', height: '160px' }}>
            <svg viewBox="0 0 100 100">
              <path d="M 10,90 A 40,40 0 1,1 90,90" fill="none" stroke="var(--border-subtle)" strokeWidth="8" strokeLinecap="round" />
              <path d="M 10,90 A 40,40 0 1,1 90,90" fill="none" stroke="var(--accent-black)" strokeWidth="8" strokeLinecap="round" strokeDasharray="180 250" />
            </svg>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -20%)', textAlign: 'center' }}>
              <div className="text-2xl font-bold">92%</div>
              <div className="text-xs text-secondary">Target: 95%</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default MetricsWidgets;
