import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

function AQIForecastChart({ forecast }) {
  const getAQIColor = (aqi) => {
    if (aqi <= 50) return '#28a745';
    if (aqi <= 100) return '#ffc107';
    if (aqi <= 150) return '#fd7e14';
    if (aqi <= 200) return '#dc3545';
    if (aqi <= 300) return '#6f42c1';
    return '#6c757d';
  };

  const formatTime = (datetime) => {
    return new Date(datetime).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{
          background: 'white',
          border: '1px solid #ddd',
          borderRadius: '4px',
          padding: '10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <p style={{ margin: '0 0 5px 0', fontWeight: '500', color: '#333', fontSize: '0.9rem' }}>
            {formatTime(label)}
          </p>
          <p style={{ margin: '0', color: getAQIColor(data.aqi), fontWeight: '500', fontSize: '0.9rem' }}>
            AQI: <strong>{data.aqi}</strong>
          </p>
        </div>
      );
    }
    return null;
  };

  // Only show the last 12 hours if available
  const forecast12 = forecast && forecast.length > 12 ? forecast.slice(-12) : forecast;
  return (
    <div className="card">
      <h2>📈 12-Hour Forecast</h2>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={forecast12}>
            <defs>
              <linearGradient id="aqiGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#007bff" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#007bff" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
            <XAxis 
              dataKey="datetime" 
              tick={{ fontSize: 11, fill: '#666' }}
              tickFormatter={formatTime}
            />
            <YAxis 
              tick={{ fontSize: 11, fill: '#666' }}
              domain={[0, 500]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="aqi"
              stroke="#007bff"
              strokeWidth={2}
              fill="url(#aqiGradient)"
              dot={{ fill: '#007bff', strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, stroke: '#007bff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default AQIForecastChart;
