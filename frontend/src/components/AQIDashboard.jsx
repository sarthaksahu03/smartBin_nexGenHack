import React from 'react';

function AQIDashboard({ aqi, components, station, city, state, last_update, pollutant_subindices }) {
  const getAQICategory = (aqi) => {
    if (aqi <= 50) return { label: 'Good', color: '#28a745', emoji: '😊' };
    if (aqi <= 100) return { label: 'Moderate', color: '#ffc107', emoji: '😐' };
    if (aqi <= 150) return { label: 'Unhealthy for Sensitive', color: '#fd7e14', emoji: '😷' };
    if (aqi <= 200) return { label: 'Unhealthy', color: '#dc3545', emoji: '😷' };
    if (aqi <= 300) return { label: 'Very Unhealthy', color: '#6f42c1', emoji: '😰' };
    return { label: 'Hazardous', color: '#6c757d', emoji: '😱' };
  };

  const category = aqi ? getAQICategory(aqi) : { label: 'N/A', color: '#666', emoji: '❓' };

  return (
    <div className="card">
      <h2>🌡️ Current Air Quality</h2>
      
      <div className="aqi-display">
        <div className="aqi-value" style={{ color: category.color }}>
          {aqi ?? 'N/A'}
        </div>
        <div className="aqi-label">
          {category.emoji} {category.label}
        </div>
      </div>

      <div className="location-info">
        {city && city !== 'N/A' && (
          <div className="info-item">
            <div className="info-label">City</div>
            <div className="info-value">🏙️ {city}</div>
          </div>
        )}
        {state && state !== 'N/A' && (
          <div className="info-item">
            <div className="info-label">State</div>
            <div className="info-value">🗺️ {state}</div>
          </div>
        )}
        {station && (
          <div className="info-item">
            <div className="info-label">Station</div>
            <div className="info-value">📡 {station}</div>
          </div>
        )}
        {last_update && last_update !== 'N/A' && (
          <div className="info-item">
            <div className="info-label">Last Update</div>
            <div className="info-value">🕒 {new Date(last_update).toLocaleString()}</div>
          </div>
        )}
      </div>

      {pollutant_subindices && Object.keys(pollutant_subindices).length > 0 && (
        <div style={{ marginTop: '1.5rem' }}>
          <h3 style={{ 
            marginBottom: '1rem', 
            color: 'var(--text-primary)', 
            fontSize: '1.1rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span style={{ fontSize: '1.2rem' }}>🧪</span>
            Pollutant Breakdown
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
            gap: '0.75rem'
          }}>
            {Object.entries(pollutant_subindices).map(([pollutant, value]) => {
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

              const getPollutantIcon = (pollutant) => {
                const icons = {
                  'PM2.5': '🌫️',
                  'PM10': '💨',
                  'NO2': '🚗',
                  'SO2': '🏭',
                  'OZONE': '☀️',
                  'CO': '🔥',
                  'NH3': '🌾'
                };
                return icons[pollutant] || '🧪';
              };

              return (
                <div key={pollutant} style={{ 
                  background: 'var(--surface-secondary)',
                  padding: '0.875rem',
                  borderRadius: '0.75rem',
                  textAlign: 'center',
                  border: '1px solid var(--border-light)',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}>
                  {/* Subtle background accent */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: `linear-gradient(90deg, ${getPollutantColor(pollutant)}, ${getPollutantColor(pollutant)}80)`,
                    borderRadius: '0.75rem 0.75rem 0 0'
                  }}></div>
                  
                  <div style={{ 
                    fontSize: '1.5rem', 
                    marginBottom: '0.5rem',
                    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
                  }}>
                    {getPollutantIcon(pollutant)}
                  </div>
                  
                  <div style={{ 
                    fontSize: '0.75rem', 
                    color: 'var(--text-tertiary)',
                    marginBottom: '0.25rem',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {pollutant}
                  </div>
                  
                  <div style={{ 
                    fontSize: '1.25rem', 
                    fontWeight: '700', 
                    color: getPollutantColor(pollutant),
                    textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                  }}>
                    {value}
                  </div>
                  
                  <div style={{ 
                    fontSize: '0.65rem', 
                    color: 'var(--text-tertiary)',
                    marginTop: '0.25rem',
                    fontWeight: '500'
                  }}>
                    AQI
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}

export default AQIDashboard;
