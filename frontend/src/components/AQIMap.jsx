
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
    // If center is Ghaziabad, add 5-6 fixed hotspot points
    if (center[0] === 28.6692 && center[1] === 77.4538) {
      const ghaziabadHotspots = [
        { lat: 28.6765, lon: 77.4321, aqi: 180 },
        { lat: 28.6700, lon: 77.4500, aqi: 210 },
        { lat: 28.6600, lon: 77.4600, aqi: 195 },
        { lat: 28.6800, lon: 77.4700, aqi: 205 },
        { lat: 28.6650, lon: 77.4400, aqi: 170 },
        { lat: 28.6750, lon: 77.4550, aqi: 220 }
      ];
      ghaziabadHotspots.forEach(h => {
        points.push({
          type: 'hotspot',
          lat: h.lat,
          lon: h.lon,
          aqi: h.aqi,
          radius: 4000
        });
      });
    } else {
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
          radius: 4000 // 4km radius for all circles, including red
        });
      }
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
        radius: 4000 // 4km radius for all circles
      });
    }
    return points;
  };

  const mapPoints = generateMapPoints();

  // Expanded AQI color ranges and fixed orange visibility
  const getAQIColor = (aqi) => {
    if (aqi <= 50) return '#28a745'; // Green
    if (aqi <= 100) return '#ffc107'; // Yellow
    if (aqi <= 200) return '#fd7e14'; // Orange (expanded to 200)
    if (aqi <= 300) return '#dc3545'; // Red
    if (aqi <= 400) return '#6f42c1'; // Purple
    return '#343a40'; // Dark for hazardous
  };

  const getAQICategory = (aqi) => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 200) return 'Unhealthy for Sensitive';
    if (aqi <= 300) return 'Unhealthy';
    if (aqi <= 400) return 'Very Unhealthy';
    return 'Hazardous';
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
          
          {/* Current location marker only, no big circles */}
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
                radius={4000}
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
          <div style={{ width: '12px', height: '12px', backgroundColor: '#28a745', borderRadius: '50%' }}></div>
          <span style={{ color: '#666' }}>Good (0-50)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: '#ffc107', borderRadius: '50%' }}></div>
          <span style={{ color: '#666' }}>Moderate (51-100)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: '#fd7e14', borderRadius: '50%' }}></div>
          <span style={{ color: '#666' }}>Unhealthy for Sensitive (101-200)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: '#dc3545', borderRadius: '50%' }}></div>
          <span style={{ color: '#666' }}>Unhealthy (201-300)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: '#6f42c1', borderRadius: '50%' }}></div>
          <span style={{ color: '#666' }}>Very Unhealthy (301-400)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: '#343a40', borderRadius: '50%' }}></div>
          <span style={{ color: '#666' }}>Hazardous (401+)</span>
        </div>
      </div>
    </div>
  );
}

export default AQIMap;
