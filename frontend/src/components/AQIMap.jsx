
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Import marker images for Vite/ESM
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix for default markers in react-leaflet (Vite/ESM compatible)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function AQIMap({ hotspots = [], safezones = [], center = [28.6139, 77.2090], zoom = 12, currentAqi = null }) {
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMapLoaded(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Generate realistic map points
  const generateMapPoints = () => {
    const points = [];
    
    // Generate hotspots
    for (let i = 0; i < Math.min(hotspots.length, 4); i++) {
      const angle = (i * 90) * (Math.PI / 180);
      const distance = 0.01 + Math.random() * 0.02;
      const lat = center[0] + distance * Math.cos(angle);
      const lon = center[1] + distance * Math.sin(angle);
      points.push({
        type: 'hotspot',
        lat,
        lon,
        aqi: 120 + Math.random() * 80,
        radius: 300 + Math.random() * 200
      });
    }
    
    // Generate safezones
    for (let i = 0; i < Math.min(safezones.length, 3); i++) {
      const angle = (i * 120) * (Math.PI / 180);
      const distance = 0.015 + Math.random() * 0.025;
      const lat = center[0] + distance * Math.cos(angle);
      const lon = center[1] + distance * Math.sin(angle);
      points.push({
        type: 'safezone',
        lat,
        lon,
        aqi: 30 + Math.random() * 40,
        radius: 200 + Math.random() * 150
      });
    }
    
    return points;
  };

  const mapPoints = generateMapPoints();

  const getAQIColor = (aqi) => {
    if (aqi <= 50) return '#28a745';
    if (aqi <= 100) return '#ffc107';
    if (aqi <= 150) return '#fd7e14';
    if (aqi <= 200) return '#dc3545';
    return '#6f42c1';
  };

  const getAQICategory = (aqi) => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive';
    if (aqi <= 200) return 'Unhealthy';
    return 'Very Unhealthy';
  };

  // Custom marker icon
  const createCustomIcon = (aqi) => {
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="
        background-color: ${getAQIColor(aqi)};
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 10px;
        font-weight: bold;
      ">${Math.round(aqi)}</div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
  };

  if (!mapLoaded) {
    return (
      <div className="card">
        <h2>🗺️ Air Quality Map</h2>
        <div className="map-container" style={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f8f9fa',
          color: '#666'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🗺️</div>
            <div>Loading map...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>🗺️ Air Quality Map</h2>
      <div className="map-container">
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Current location marker */}
          <Marker position={center} icon={createCustomIcon(currentAqi || 50)}>
            <Popup>
              <div>
                <strong>Current Location</strong><br/>
                AQI: {currentAqi || 'Loading...'} ({getAQICategory(currentAqi || 50)})
              </div>
            </Popup>
          </Marker>
          
          {/* Map points */}
          {mapPoints.map((point, index) => (
            <React.Fragment key={index}>
              <Circle
                center={[point.lat, point.lon]}
                radius={point.radius}
                pathOptions={{
                  color: getAQIColor(point.aqi),
                  fillColor: getAQIColor(point.aqi),
                  fillOpacity: 0.3,
                  weight: 2
                }}
              />
              <Marker position={[point.lat, point.lon]} icon={createCustomIcon(point.aqi)}>
                <Popup>
                  <div>
                    <strong>{point.type === 'hotspot' ? 'High AQI Zone' : 'Safe Zone'}</strong><br/>
                    AQI: {Math.round(point.aqi)} ({getAQICategory(point.aqi)})
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          ))}
        </MapContainer>
      </div>
      
      <div style={{ 
        marginTop: '15px', 
        display: 'flex', 
        gap: '15px', 
        justifyContent: 'center',
        flexWrap: 'wrap',
        fontSize: '0.85rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ 
            width: '12px', 
            height: '12px', 
            backgroundColor: '#28a745', 
            borderRadius: '50%' 
          }}></div>
          <span style={{ color: '#666' }}>Good</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ 
            width: '12px', 
            height: '12px', 
            backgroundColor: '#ffc107', 
            borderRadius: '50%' 
          }}></div>
          <span style={{ color: '#666' }}>Moderate</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ 
            width: '12px', 
            height: '12px', 
            backgroundColor: '#fd7e14', 
            borderRadius: '50%' 
          }}></div>
          <span style={{ color: '#666' }}>Unhealthy</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ 
            width: '12px', 
            height: '12px', 
            backgroundColor: '#dc3545', 
            borderRadius: '50%' 
          }}></div>
          <span style={{ color: '#666' }}>Very Unhealthy</span>
        </div>
      </div>
    </div>
  );
}

export default AQIMap;
