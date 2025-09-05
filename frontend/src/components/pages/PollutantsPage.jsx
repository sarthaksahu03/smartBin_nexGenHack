import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

function PollutantsPage({ current, latest, forecast, API_BASE }) {
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('24h');
  const [viewType, setViewType] = useState('concentrations'); // 'concentrations', 'trends', 'distribution'

  useEffect(() => {
    fetchHistoricalData();
  }, [timeRange]);

  async function fetchHistoricalData() {
    setLoading(true);
    try {
      let hours;
      switch (timeRange) {
        case '24h':
          hours = 24;
          break;
        case '72h':
          hours = 72;
          break;
        case '7d':
          hours = 168;
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

  const getPollutantColor = (pollutant) => {
    const colors = {
      'PM2.5': '#3b82f6',
      'PM10': '#8b5cf6',
      'NO2': '#f59e0b',
      'SO2': '#ef4444',
      'OZONE': '#10b981',
      'CO': '#6b7280',
      'NH3': '#f97316'
    };
    return colors[pollutant] || '#64748b';
  };

  const getPollutantUnit = (pollutant) => {
    const units = {
      'PM2.5': 'μg/m³',
      'PM10': 'μg/m³',
      'NO2': 'μg/m³',
      'SO2': 'μg/m³',
      'OZONE': 'μg/m³',
      'CO': 'mg/m³',
      'NH3': 'μg/m³'
    };
    return units[pollutant] || 'μg/m³';
  };

  const getPollutantDescription = (pollutant) => {
    const descriptions = {
      'PM2.5': 'Fine particulate matter - particles smaller than 2.5 micrometers',
      'PM10': 'Coarse particulate matter - particles smaller than 10 micrometers',
      'NO2': 'Nitrogen dioxide - primarily from vehicle emissions',
      'SO2': 'Sulfur dioxide - from industrial processes and power plants',
      'OZONE': 'Ground-level ozone - formed by chemical reactions',
      'CO': 'Carbon monoxide - from incomplete combustion',
      'NH3': 'Ammonia - from agricultural activities and vehicles'
    };
    return descriptions[pollutant] || 'Air pollutant';
  };

  // Get current pollutant data
  const currentPollutants = current?.pollutant_avgs || latest?.values || {};
  const currentSubindices = current?.pollutant_subindices || {};

  // Process pollutant data for charts
  const pollutantData = Object.entries(currentPollutants)
    .filter(([key, value]) => value > 0)
    .map(([pollutant, value]) => ({
      name: pollutant,
      value: value,
      subindex: currentSubindices[pollutant] || 0,
      color: getPollutantColor(pollutant),
      unit: getPollutantUnit(pollutant),
      description: getPollutantDescription(pollutant)
    }))
    .sort((a, b) => b.value - a.value);

  // Process historical data for trends
  const trendData = historicalData.map(item => {
    const date = new Date(item.datetime);
    let timeLabel;
    
    if (timeRange === '24h') {
      timeLabel = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (timeRange === '72h') {
      timeLabel = date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit' });
    } else {
      timeLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    
    return {
      time: timeLabel,
      'PM2.5': item['PM2.5'] || 0,
      'PM10': item['PM10'] || 0,
      'NO2': item['NO2'] || 0,
      'SO2': item['SO2'] || 0,
      'OZONE': item['OZONE'] || 0,
      'CO': item['CO'] || 0,
      fullDateTime: item.datetime
    };
  }).sort((a, b) => new Date(a.fullDateTime) - new Date(b.fullDateTime));

  // Calculate statistics
  const totalPollutants = pollutantData.length;
  const dominantPollutant = pollutantData[0]?.name || 'N/A';
  const averageConcentration = pollutantData.length > 0 
    ? Math.round(pollutantData.reduce((sum, item) => sum + item.value, 0) / pollutantData.length)
    : 0;

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading pollutant data...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Controls */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <h2 className="card-title">Pollutant Analysis</h2>
          <p className="card-subtitle">Detailed breakdown of air pollutants and their concentrations</p>
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem',
          marginBottom: '1rem'
        }}>
          <div>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
              Time Range
            </label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid var(--border)',
                borderRadius: '0.5rem',
                backgroundColor: 'var(--surface)',
                color: 'var(--text-primary)'
              }}
            >
              <option value="24h">Last 24 Hours</option>
              <option value="72h">Last 3 Days</option>
              <option value="7d">Last 7 Days</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
              View Type
            </label>
            <select
              value={viewType}
              onChange={(e) => setViewType(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid var(--border)',
                borderRadius: '0.5rem',
                backgroundColor: 'var(--surface)',
                color: 'var(--text-primary)'
              }}
            >
              <option value="concentrations">Concentrations</option>
              <option value="trends">Trends</option>
              <option value="distribution">Distribution</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div className="card">
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '2rem', 
              fontWeight: '800', 
              color: 'var(--primary-500)',
              marginBottom: '0.5rem'
            }}>
              {totalPollutants}
            </div>
            <div style={{ 
              fontSize: '0.875rem', 
              color: 'var(--text-secondary)',
              fontWeight: '600'
            }}>
              Active Pollutants
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '2rem', 
              fontWeight: '800', 
              color: getPollutantColor(dominantPollutant),
              marginBottom: '0.5rem'
            }}>
              {dominantPollutant}
            </div>
            <div style={{ 
              fontSize: '0.875rem', 
              color: 'var(--text-secondary)',
              fontWeight: '600'
            }}>
              Dominant Pollutant
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '2rem', 
              fontWeight: '800', 
              color: 'var(--success-500)',
              marginBottom: '0.5rem'
            }}>
              {averageConcentration}
            </div>
            <div style={{ 
              fontSize: '0.875rem', 
              color: 'var(--text-secondary)',
              fontWeight: '600'
            }}>
              Avg Concentration
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {viewType === 'concentrations' && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          {/* Bar Chart */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Current Concentrations</h3>
              <p className="card-subtitle">Pollutant levels at your location</p>
            </div>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pollutantData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis 
                    dataKey="name" 
                    stroke="var(--text-tertiary)"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="var(--text-tertiary)"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: '0.5rem',
                      boxShadow: 'var(--shadow-md)'
                    }}
                    formatter={(value, name) => [value, name]}
                    labelFormatter={(label) => `Pollutant: ${label}`}
                  />
                  <Bar dataKey="value" fill="var(--primary-500)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Pollutant Distribution</h3>
              <p className="card-subtitle">Relative contribution of each pollutant</p>
            </div>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pollutantData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pollutantData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: '0.5rem',
                      boxShadow: 'var(--shadow-md)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {viewType === 'trends' && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header">
            <h3 className="card-title">Pollutant Trends</h3>
            <p className="card-subtitle">Concentration changes over time</p>
          </div>
          <div style={{ height: '400px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis 
                  dataKey="time" 
                  stroke="var(--text-tertiary)"
                  fontSize={12}
                />
                <YAxis 
                  stroke="var(--text-tertiary)"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '0.5rem',
                    boxShadow: 'var(--shadow-md)'
                  }}
                />
                {pollutantData.map((pollutant, index) => (
                  <Line
                    key={pollutant.name}
                    type="monotone"
                    dataKey={pollutant.name}
                    stroke={pollutant.color}
                    strokeWidth={2}
                    dot={{ fill: pollutant.color, strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: pollutant.color, strokeWidth: 2 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Detailed Pollutant Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '1rem'
      }}>
        {pollutantData.map((pollutant, index) => (
          <div key={pollutant.name} className="card">
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              marginBottom: '1rem'
            }}>
              <div>
                <h4 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '700', 
                  color: 'var(--text-primary)',
                  marginBottom: '0.25rem'
                }}>
                  {pollutant.name}
                </h4>
                <p style={{ 
                  fontSize: '0.875rem', 
                  color: 'var(--text-tertiary)',
                  margin: 0
                }}>
                  {pollutant.description}
                </p>
              </div>
              <div style={{
                width: '3rem',
                height: '3rem',
                backgroundColor: pollutant.color,
                borderRadius: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: '700',
                fontSize: '1.5rem'
              }}>
                {pollutant.name.charAt(0)}
              </div>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              <div style={{ 
                padding: '0.75rem', 
                backgroundColor: 'var(--surface-secondary)', 
                borderRadius: '0.5rem',
                textAlign: 'center'
              }}>
                <div style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: '700', 
                  color: pollutant.color,
                  marginBottom: '0.25rem'
                }}>
                  {pollutant.value.toFixed(1)}
                </div>
                <div style={{ 
                  fontSize: '0.75rem', 
                  color: 'var(--text-tertiary)',
                  fontWeight: '600'
                }}>
                  {pollutant.unit}
                </div>
              </div>

              <div style={{ 
                padding: '0.75rem', 
                backgroundColor: 'var(--surface-secondary)', 
                borderRadius: '0.5rem',
                textAlign: 'center'
              }}>
                <div style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: '700', 
                  color: 'var(--primary-500)',
                  marginBottom: '0.25rem'
                }}>
                  {pollutant.subindex}
                </div>
                <div style={{ 
                  fontSize: '0.75rem', 
                  color: 'var(--text-tertiary)',
                  fontWeight: '600'
                }}>
                  AQI Subindex
                </div>
              </div>
            </div>

            <div style={{ 
              padding: '0.75rem', 
              backgroundColor: 'var(--primary-50)', 
              borderRadius: '0.5rem',
              border: '1px solid var(--primary-200)'
            }}>
              <div style={{ 
                fontSize: '0.875rem', 
                color: 'var(--primary-700)',
                fontWeight: '600',
                marginBottom: '0.25rem'
              }}>
                Health Impact
              </div>
              <div style={{ 
                fontSize: '0.75rem', 
                color: 'var(--primary-600)'
              }}>
                {pollutant.subindex > 100 ? 
                  'High concentration - may cause health issues' :
                  pollutant.subindex > 50 ?
                  'Moderate concentration - sensitive groups should be cautious' :
                  'Low concentration - generally safe for most people'
                }
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PollutantsPage;
