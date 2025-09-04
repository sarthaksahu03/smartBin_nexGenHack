import React from 'react';

function getAdvisory(aqi) {
  if (aqi == null) return { 
    text: 'No data available.', 
    icon: '❓', 
    color: '#666',
    recommendations: ['Check back later for updates']
  };
  if (aqi <= 50) return { 
    text: 'Good Air Quality', 
    icon: '😊', 
    color: '#28a745',
    recommendations: ['Safe to go outside', 'Enjoy outdoor activities', 'Windows can be open']
  };
  if (aqi <= 100) return { 
    text: 'Moderate Air Quality', 
    icon: '😐', 
    color: '#ffc107',
    recommendations: ['Sensitive groups should take care', 'Limit outdoor exercise', 'Consider wearing a mask if sensitive']
  };
  if (aqi <= 150) return { 
    text: 'Unhealthy for Sensitive Groups', 
    icon: '😷', 
    color: '#fd7e14',
    recommendations: ['Sensitive groups should avoid outdoor activity', 'Wear a mask if going outside', 'Keep windows closed']
  };
  if (aqi <= 200) return { 
    text: 'Unhealthy Air Quality', 
    icon: '😷', 
    color: '#dc3545',
    recommendations: ['Everyone should avoid outdoor activity', 'Wear a mask if going outside', 'Use air purifiers indoors']
  };
  if (aqi <= 300) return { 
    text: 'Very Unhealthy', 
    icon: '😰', 
    color: '#6f42c1',
    recommendations: ['Avoid all outdoor activity', 'Stay indoors with windows closed', 'Use air purifiers', 'Consider wearing N95 mask if going outside']
  };
  return { 
    text: 'Hazardous Air Quality', 
    icon: '😱', 
    color: '#6c757d',
    recommendations: ['Stay indoors at all times', 'Keep all windows and doors closed', 'Use air purifiers', 'Avoid any outdoor activity']
  };
}

function HealthAdvisory({ aqi }) {
  const advisory = getAdvisory(aqi);

  return (
    <div className="card health-advisory">
      <h3>{advisory.icon} Health Advisory</h3>
      <div className="health-text" style={{ color: advisory.color, marginBottom: '25px' }}>
        {advisory.text}
      </div>
      <div>
        <h4 style={{ color: 'white', marginBottom: '18px', fontSize: '1.2rem' }}>💡 Recommendations:</h4>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {advisory.recommendations.map((rec, index) => (
            <li key={index} style={{ 
              marginBottom: '10px', 
              padding: '10px 15px', 
              background: 'rgba(255,255,255,0.15)', 
              borderRadius: '10px',
              fontSize: '1rem',
              fontWeight: '500'
            }}>
              ✓ {rec}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default HealthAdvisory;
