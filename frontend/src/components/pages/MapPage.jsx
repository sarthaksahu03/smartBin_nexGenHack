import React, { useState, useEffect } from 'react';
import AQIMap from '../AQIMap.jsx';

function MapPage({ 
  current, 
  forecast, 
  latest, 
  coords, 
  setCoords,
  city,
  setCity,
  API_BASE 
}) {
  const [mapData, setMapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('current');
  const [mapType, setMapType] = useState('aqi'); // 'aqi', 'pollutants', 'trends'

  useEffect(() => {
    fetchMapData();
  }, [selectedTimeRange, coords]);

  async function fetchMapData() {
    setLoading(true);
    try {
      let hours = 24;
      if (selectedTimeRange === '3d') hours = 72;
      if (selectedTimeRange === '7d') hours = 168;

      const response = await fetch(`${API_BASE}/dataset/latest?hours=${hours}&limit=500`);
      const data = await response.json();
      setMapData(data.rows || []);
    } catch (error) {
      console.error('Error fetching map data:', error);
      setMapData([]);
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

  // Process map data for different views
  const processedMapData = mapData.map(item => ({
    lat: parseFloat(item.latitude),
    lon: parseFloat(item.longitude),
    aqi: item.aqi,
    city: item.city,
    location: item.location,
    datetime: item.datetime,
    pollutants: {
      'PM2.5': item['PM2.5'] || 0,
      'PM10': item['PM10'] || 0,
      'NO2': item['NO2'] || 0,
      'SO2': item['SO2'] || 0,
      'OZONE': item['OZONE'] || 0,
      'CO': item['CO'] || 0
    },
    category: getAQICategory(item.aqi),
    color: getAQIColor(item.aqi)
  }));

  // Generate hotspots and safezones from forecast data
  const hotspots = forecast.filter(f => f.aqi > 120).map((f, i) => ({
    lat: coords.lat + (Math.random() - 0.5) * 0.02,
    lon: coords.lon + (Math.random() - 0.5) * 0.02,
    aqi: f.aqi,
    time: f.datetime
  }));

  const safezones = forecast.filter(f => f.aqi < 80).map((f, i) => ({
    lat: coords.lat + (Math.random() - 0.5) * 0.03,
    lon: coords.lon + (Math.random() - 0.5) * 0.02,
    aqi: f.aqi,
    time: f.datetime
  }));

  const latestAQI = latest?.aqi ?? current?.aqi;

  return (
    <div className="page-container">
      {/* Map Controls */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <h2 className="card-title">Air Quality Map</h2>
          <p className="card-subtitle">Interactive air quality visualization across regions</p>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          {/* Time Range Selector */}
          <div>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
              Time Range
            </label>
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid var(--border)',
                borderRadius: '0.5rem',
                backgroundColor: 'var(--surface)',
                color: 'var(--text-primary)'
              }}
            >
              <option value="current">Current</option>
              <option value="24h">Last 24 Hours</option>
              <option value="3d">Last 3 Days</option>
              <option value="7d">Last 7 Days</option>
            </select>
          </div>

          {/* Map Type Selector */}
          <div>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
              Map View
            </label>
            <select
              value={mapType}
              onChange={(e) => setMapType(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid var(--border)',
                borderRadius: '0.5rem',
                backgroundColor: 'var(--surface)',
                color: 'var(--text-primary)'
              }}
            >
              <option value="aqi">AQI Overview</option>
              <option value="pollutants">Pollutant Breakdown</option>
              <option value="trends">Trends & Forecast</option>
            </select>
          </div>

          {/* Current Location Info */}
          <div>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
              Current Location
            </label>
            <div style={{ 
              padding: '0.75rem', 
              backgroundColor: 'var(--surface-secondary)', 
              borderRadius: '0.5rem',
              border: '1px solid var(--border-light)'
            }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                {city}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                {coords.lat.toFixed(4)}, {coords.lon.toFixed(4)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Statistics */}
      <div className="analytics-grid" style={{ marginBottom: '2rem' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Current AQI</h3>
            <p className="card-subtitle">At your location</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '2.5rem', 
              fontWeight: '800', 
              color: getAQIColor(latestAQI),
              marginBottom: '0.5rem'
            }}>
              {latestAQI || 'N/A'}
            </div>
            <div style={{ 
              fontSize: '1rem', 
              color: 'var(--text-secondary)',
              fontWeight: '600'
            }}>
              {latestAQI ? getAQICategory(latestAQI) : 'No Data'}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Data Points</h3>
            <p className="card-subtitle">Available measurements</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '2.5rem', 
              fontWeight: '800', 
              color: 'var(--primary-500)',
              marginBottom: '0.5rem'
            }}>
              {processedMapData.length}
            </div>
            <div style={{ 
              fontSize: '1rem', 
              color: 'var(--text-secondary)',
              fontWeight: '600'
            }}>
              {selectedTimeRange === 'current' ? 'Current' : 
               selectedTimeRange === '24h' ? 'Last 24h' :
               selectedTimeRange === '3d' ? 'Last 3 days' : 'Last 7 days'}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Average AQI</h3>
            <p className="card-subtitle">Regional average</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '2.5rem', 
              fontWeight: '800', 
              color: processedMapData.length > 0 ? 
                getAQIColor(processedMapData.reduce((sum, item) => sum + item.aqi, 0) / processedMapData.length) : 
                'var(--text-tertiary)',
              marginBottom: '0.5rem'
            }}>
              {processedMapData.length > 0 ? 
                Math.round(processedMapData.reduce((sum, item) => sum + item.aqi, 0) / processedMapData.length) : 
                'N/A'
              }
            </div>
            <div style={{ 
              fontSize: '1rem', 
              color: 'var(--text-secondary)',
              fontWeight: '600'
            }}>
              Regional
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Peak AQI</h3>
            <p className="card-subtitle">Highest recorded</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '2.5rem', 
              fontWeight: '800', 
              color: processedMapData.length > 0 ? 
                getAQIColor(Math.max(...processedMapData.map(item => item.aqi))) : 
                'var(--text-tertiary)',
              marginBottom: '0.5rem'
            }}>
              {processedMapData.length > 0 ? 
                Math.max(...processedMapData.map(item => item.aqi)) : 
                'N/A'
              }
            </div>
            <div style={{ 
              fontSize: '1rem', 
              color: 'var(--text-secondary)',
              fontWeight: '600'
            }}>
              Peak
            </div>
          </div>
        </div>
      </div>

      {/* Main Map */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            {mapType === 'aqi' ? 'AQI Overview Map' : 
             mapType === 'pollutants' ? 'Pollutant Distribution Map' : 
             'Trends & Forecast Map'}
          </h3>
          <p className="card-subtitle">
            {mapType === 'aqi' ? 'Air Quality Index across the region' : 
             mapType === 'pollutants' ? 'Individual pollutant concentrations' : 
             'Historical trends and future predictions'}
          </p>
        </div>
        
        {loading ? (
          <div className="loading">Loading map data...</div>
        ) : (
          <div style={{ height: '600px', borderRadius: '0.75rem', overflow: 'hidden' }}>
            <AQIMap 
              hotspots={hotspots} 
              safezones={safezones} 
              center={[coords.lat, coords.lon]} 
              currentAqi={latestAQI}
              mapData={processedMapData}
              mapType={mapType}
            />
          </div>
        )}
      </div>

      {/* Map Legend */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <div className="card-header">
          <h3 className="card-title">AQI Color Legend</h3>
          <p className="card-subtitle">Understanding air quality levels</p>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {[
            { range: '0-50', category: 'Good', color: '#22c55e', description: 'Air quality is satisfactory' },
            { range: '51-100', category: 'Moderate', color: '#f59e0b', description: 'Sensitive people may experience minor issues' },
            { range: '101-150', category: 'Unhealthy for Sensitive', color: '#f97316', description: 'Children and elderly should limit outdoor activity' },
            { range: '151-200', category: 'Unhealthy', color: '#ef4444', description: 'Everyone may experience health effects' },
            { range: '201-300', category: 'Very Unhealthy', color: '#8b5cf6', description: 'Health warnings for everyone' },
            { range: '300+', category: 'Hazardous', color: '#6b7280', description: 'Emergency conditions' }
          ].map((item, index) => (
            <div key={index} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem',
              padding: '0.75rem',
              backgroundColor: 'var(--surface-secondary)',
              borderRadius: '0.5rem',
              border: '1px solid var(--border-light)'
            }}>
              <div style={{
                width: '1rem',
                height: '1rem',
                backgroundColor: item.color,
                borderRadius: '0.25rem'
              }}></div>
              <div>
                <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>
                  {item.range} - {item.category}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                  {item.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MapPage;
