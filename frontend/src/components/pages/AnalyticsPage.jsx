import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

function AnalyticsPage({ current, latest, forecast, API_BASE }) {
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('24h');

  useEffect(() => {
    fetchHistoricalData();
  }, [timeRange]);

  async function fetchHistoricalData() {
    setLoading(true);
    try {
      // Convert time range to hours
      let hours;
      switch (timeRange) {
        case '24h':
          hours = 24;
          break;
        case '72h':
          hours = 72;
          break;
        case '7d':
          hours = 168; // 7 days * 24 hours
          break;
        default:
          hours = 24;
      }
      
      const response = await fetch(`${API_BASE}/dataset/latest?hours=${hours}&limit=200`);
      const data = await response.json();
      setHistoricalData(data.rows || []);
    } catch (error) {
      console.error('Error fetching historical data:', error);
      setHistoricalData([]);
    }
    setLoading(false);
  }

  const getAQIColor = (aqi) => {
    if (aqi <= 50) return '#22c55e';
    if (aqi <= 100) return '#f59e0b';
    if (aqi <= 150) return '#f97316';
    if (aqi <= 200) return '#ef4444';
    if (aqi <= 300) return '#8b5cf6';
    return '#6b7280';
  };

  const getAQICategory = (aqi) => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  };

  // Process data for charts
  const chartData = historicalData.map(item => {
    const date = new Date(item.datetime);
    let timeLabel;
    
    // Format time label based on time range
    if (timeRange === '24h') {
      timeLabel = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (timeRange === '72h') {
      timeLabel = date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit' });
    } else { // 7d
      timeLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    
    return {
      time: timeLabel,
      aqi: item.aqi,
      pm25: item['PM2.5'] || 0,
      pm10: item['PM10'] || 0,
      no2: item['NO2'] || 0,
      date: date.toLocaleDateString(),
      fullDateTime: item.datetime
    };
  }).sort((a, b) => new Date(a.fullDateTime) - new Date(b.fullDateTime));

  const pollutantData = [
    { name: 'PM2.5', value: current?.pollutant_avgs?.['PM2.5'] || 0, color: '#3b82f6' },
    { name: 'PM10', value: current?.pollutant_avgs?.['PM10'] || 0, color: '#8b5cf6' },
    { name: 'NO2', value: current?.pollutant_avgs?.['NO2'] || 0, color: '#f59e0b' },
    { name: 'SO2', value: current?.pollutant_avgs?.['SO2'] || 0, color: '#ef4444' },
    { name: 'OZONE', value: current?.pollutant_avgs?.['OZONE'] || 0, color: '#10b981' },
    { name: 'CO', value: current?.pollutant_avgs?.['CO'] || 0, color: '#6b7280' }
  ].filter(item => item.value > 0);

  const aqiDistribution = historicalData.reduce((acc, item) => {
    const category = getAQICategory(item.aqi);
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  const distributionData = Object.entries(aqiDistribution).map(([category, count]) => ({
    name: category,
    value: count,
    color: getAQIColor(category === 'Good' ? 25 : category === 'Moderate' ? 75 : category === 'Unhealthy for Sensitive' ? 125 : category === 'Unhealthy' ? 175 : 250)
  }));

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading analytics data...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Time Range Selector */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <h2 className="card-title">Analytics Dashboard</h2>
          <p className="card-subtitle">Air quality trends and insights</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          {['24h', '72h', '7d'].map((range) => (
            <button
              key={range}
              className={`btn ${timeRange === range ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setTimeRange(range)}
            >
              {range === '24h' ? 'Last 24 Hours' : range === '72h' ? 'Last 3 Days' : 'Last 7 Days'}
            </button>
          ))}
        </div>
      </div>

      <div className="analytics-grid">
        {/* AQI Trend Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">AQI Trend</h3>
            <p className="card-subtitle">Air Quality Index over time</p>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="time" 
                  stroke="#64748b"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#64748b"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="aqi" 
                  stroke="#0ea5e9" 
                  strokeWidth={3}
                  dot={{ fill: '#0ea5e9', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#0ea5e9', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pollutant Breakdown */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Pollutant Breakdown</h3>
            <p className="card-subtitle">Current pollutant concentrations</p>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pollutantData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  stroke="#64748b"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#64748b"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Bar dataKey="value" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AQI Distribution */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">AQI Distribution</h3>
            <p className="card-subtitle">Air quality categories over time</p>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Key Metrics</h3>
            <p className="card-subtitle">Summary statistics</p>
          </div>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div className="info-item">
              <div className="info-label">Current AQI</div>
              <div className="info-value" style={{ color: getAQIColor(latest?.aqi || current?.aqi) }}>
                {latest?.aqi || current?.aqi || 'N/A'}
              </div>
            </div>
            <div className="info-item">
              <div className="info-label">Average AQI</div>
              <div className="info-value">
                {historicalData.length > 0 
                  ? Math.round(historicalData.reduce((sum, item) => sum + item.aqi, 0) / historicalData.length)
                  : 'N/A'
                }
              </div>
            </div>
            <div className="info-item">
              <div className="info-label">Peak AQI</div>
              <div className="info-value">
                {historicalData.length > 0 
                  ? Math.max(...historicalData.map(item => item.aqi))
                  : 'N/A'
                }
              </div>
            </div>
            <div className="info-item">
              <div className="info-label">Data Points</div>
              <div className="info-value">{historicalData.length}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsPage;
