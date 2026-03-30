import React from 'react';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChart3 } from 'lucide-react';

const data = [
  { time: '00:00', pm25: 30, no2: 40 },
  { time: '04:00', pm25: 25, no2: 35 },
  { time: '08:00', pm25: 55, no2: 80 },
  { time: '12:00', pm25: 45, no2: 60 },
  { time: '16:00', pm25: 50, no2: 75 },
  { time: '20:00', pm25: 65, no2: 120 },
];

const PollutantComparison = () => {
  return (
    <div className="analytics-card" style={{ padding: '20px', background: '#ffffff', borderRadius: '16px' }}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b', marginBottom: '20px' }}>
        <BarChart3 size={20} color="#3b82f6" /> PM2.5 vs NO₂ Correlation
      </h3>
      
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <ComposedChart data={data}>
            <CartesianGrid stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="time" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
            <YAxis tick={{fontSize: 12}} tickLine={false} axisLine={false} />
            <Tooltip 
              cursor={{fill: '#f8fafc'}}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} 
            />
            <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '20px' }} />
            <Bar dataKey="pm25" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={30} name="PM 2.5" />
            <Line type="monotone" dataKey="no2" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} name="Nitrogen Dioxide" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PollutantComparison;