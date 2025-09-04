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
        <div>
          <h3 style={{ marginBottom: '15px', color: '#333' }}>📊 Pollutant Breakdown</h3>
          <div className="pollutant-grid">
            {Object.entries(pollutant_subindices).map(([pollutant, value]) => (
              <div key={pollutant} className="pollutant-item">
                <div className="pollutant-name">{pollutant}</div>
                <div className="pollutant-value">{value}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AQIDashboard;
