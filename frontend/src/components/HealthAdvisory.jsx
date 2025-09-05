import React from 'react';

function getAdvisory(aqi) {
  if (aqi == null) return { 
    text: 'No data available.', 
    icon: '❓', 
    color: '#666',
    recommendations: ['Check back later for updates'],
    reductionTips: []
  };
  if (aqi <= 50) return { 
    text: 'Good Air Quality', 
    icon: '😊', 
    color: '#28a745',
    recommendations: ['Safe to go outside', 'Enjoy outdoor activities', 'Windows can be open'],
    reductionTips: [
      '🌱 Plant air-purifying plants like snake plants, spider plants, and peace lilies',
      '🚶 Walk or cycle instead of driving for short distances',
      '💡 Use energy-efficient appliances to reduce emissions',
      '🌿 Maintain existing green spaces and trees in your area'
    ]
  };
  if (aqi <= 100) return { 
    text: 'Moderate Air Quality', 
    icon: '😐', 
    color: '#ffc107',
    recommendations: ['Sensitive groups should take care', 'Limit outdoor exercise', 'Consider wearing a mask if sensitive'],
    reductionTips: [
      '🌱 Plant bamboo palm, aloe vera, or English ivy indoors to filter air',
      '🚗 Carpool or use public transport to reduce vehicle emissions',
      '🕯️ Avoid burning candles, incense, or wood indoors',
      '🌳 Support local tree planting initiatives in your community'
    ]
  };
  if (aqi <= 150) return { 
    text: 'Unhealthy for Sensitive Groups', 
    icon: '😷', 
    color: '#fd7e14',
    recommendations: ['Sensitive groups should avoid outdoor activity', 'Wear a mask if going outside', 'Keep windows closed'],
    reductionTips: [
      '🌱 Add golden pothos, rubber plants, or Boston ferns to absorb pollutants',
      '🚫 Avoid outdoor burning of leaves, trash, or wood',
      '🏠 Use natural cleaning products to reduce indoor chemical emissions',
      '🌿 Create a green wall or vertical garden to filter outdoor air'
    ]
  };
  if (aqi <= 200) return { 
    text: 'Unhealthy Air Quality', 
    icon: '😷', 
    color: '#dc3545',
    recommendations: ['Everyone should avoid outdoor activity', 'Wear a mask if going outside', 'Use air purifiers indoors'],
    reductionTips: [
      '🌱 Plant areca palm, lady palm, or dracaena to remove toxins from air',
      '🚗 Reduce car usage - work from home if possible',
      '💨 Avoid using gas stoves and switch to electric cooking',
      '🌳 Advocate for more green spaces and urban forests in your city'
    ]
  };
  if (aqi <= 300) return { 
    text: 'Very Unhealthy', 
    icon: '😰', 
    color: '#6f42c1',
    recommendations: ['Avoid all outdoor activity', 'Stay indoors with windows closed', 'Use air purifiers', 'Consider wearing N95 mask if going outside'],
    reductionTips: [
      '🌱 Place multiple air-purifying plants like peace lilies and snake plants',
      '🚫 Avoid all non-essential driving and vehicle use',
      '🏭 Support policies that reduce industrial emissions',
      '🌿 Join community efforts to plant trees and create green barriers'
    ]
  };
  return { 
    text: 'Hazardous Air Quality', 
    icon: '😱', 
    color: '#6c757d',
    recommendations: ['Stay indoors at all times', 'Keep all windows and doors closed', 'Use air purifiers', 'Avoid any outdoor activity'],
    reductionTips: [
      '🌱 Create an indoor garden with multiple air-purifying plants',
      '🚫 Avoid all outdoor activities that contribute to pollution',
      '🏛️ Contact local authorities about air quality improvement measures',
      '🌳 Support large-scale reforestation and green infrastructure projects'
    ]
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
        <ul style={{ listStyle: 'none', padding: 0, marginBottom: '25px' }}>
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
      
      {advisory.reductionTips.length > 0 && (
        <div>
          <h4 style={{ color: 'white', marginBottom: '18px', fontSize: '1.2rem' }}>🌱 Help Reduce AQI:</h4>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {advisory.reductionTips.map((tip, index) => (
              <li key={index} style={{ 
                marginBottom: '10px', 
                padding: '10px 15px', 
                background: 'rgba(40, 167, 69, 0.2)', 
                borderRadius: '10px',
                fontSize: '1rem',
                fontWeight: '500',
                border: '1px solid rgba(40, 167, 69, 0.3)'
              }}>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default HealthAdvisory;
