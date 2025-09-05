import React from 'react';
import AQIDashboard from '../AQIDashboard.jsx';
import AQIForecastChart from '../AQIForecastChart.jsx';
import HealthAdvisory from '../HealthAdvisory.jsx';

function DashboardPage({ 
  current, 
  forecast, 
  latest, 
  latestAQI,
  loading 
}) {
  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading air quality data...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Current Air Quality Section */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <h2 className="card-title">Current Air Quality</h2>
          <p className="card-subtitle">Real-time AQI and location data</p>
        </div>
        <AQIDashboard
          aqi={latestAQI}
          components={current?.components}
          station={current?.station}
          city={latest?.city ?? current?.city}
          state={current?.state}
          last_update={latest?.datetime_ist ?? current?.last_update}
          pollutant_subindices={null}
        />
      </div>

      {/* Pollutant Breakdown Section */}
      {current?.pollutant_subindices && Object.keys(current.pollutant_subindices).length > 0 && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <h2 className="card-title">Pollutant Breakdown</h2>
            <p className="card-subtitle">Individual pollutant concentrations and AQI subindices</p>
          </div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', 
            gap: '1rem'
          }}>
            {Object.entries(current.pollutant_subindices).map(([pollutant, value]) => {
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
                  padding: '1rem',
                  borderRadius: '0.375rem',
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
                    borderRadius: '0.375rem 0.375rem 0 0'
                  }}></div>
                  
                  <div style={{ 
                    fontSize: '1.75rem', 
                    marginBottom: '0.75rem',
                    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
                  }}>
                    {getPollutantIcon(pollutant)}
                  </div>
                  
                  <div style={{ 
                    fontSize: '0.875rem', 
                    color: 'var(--text-tertiary)',
                    marginBottom: '0.5rem',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {pollutant}
                  </div>
                  
                  <div style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: '700', 
                    color: getPollutantColor(pollutant),
                    textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                    marginBottom: '0.25rem'
                  }}>
                    {value}
                  </div>
                  
                  <div style={{ 
                    fontSize: '0.75rem', 
                    color: 'var(--text-tertiary)',
                    fontWeight: '500'
                  }}>
                    AQI Subindex
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Other Sections */}
      <div className="dashboard-grid">
        <section>
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">12-Hour Forecast</h2>
              <p className="card-subtitle">Predicted air quality trends</p>
            </div>
            <AQIForecastChart forecast={forecast} />
          </div>
        </section>

        <section>
          <div className="card health-advisory">
            <div className="card-header">
              <h2 className="card-title">Health Advisory</h2>
              <p className="card-subtitle">Recommendations and safety tips</p>
            </div>
            <HealthAdvisory aqi={latestAQI} />
          </div>
        </section>
      </div>
    </div>
  );
}

export default DashboardPage;
