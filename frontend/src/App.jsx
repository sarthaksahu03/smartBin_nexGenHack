import { useEffect, useState } from 'react';
import './App.css';
import Navigation from './components/Navigation.jsx';
import DashboardPage from './components/pages/DashboardPage.jsx';
import AnalyticsPage from './components/pages/AnalyticsPage.jsx';
import PollutantsPage from './components/pages/PollutantsPage.jsx';
import MapPage from './components/pages/MapPage.jsx';
import BlogsPage from './components/pages/BlogsPage.jsx';
import SettingsPage from './components/pages/SettingsPage.jsx';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [current, setCurrent] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState('Delhi');
  const [coords, setCoords] = useState({ lat: 28.6139, lon: 77.2090 });
  const [latest, setLatest] = useState(null);
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchData(coords.lat, coords.lon);
    // eslint-disable-next-line
  }, [coords]);

  useEffect(() => {
    fetchLatest(city, coords);
    const id = setInterval(() => fetchLatest(city, coords), 60000);
    return () => clearInterval(id);
    // eslint-disable-next-line
  }, [city, coords]);

  async function fetchData(lat, lon) {
    setLoading(true);
    try {
      const curRes = await fetch(`${API_BASE}/current?lat=${lat}&lon=${lon}`);
      const curData = await curRes.json();
      setCurrent(curData);
      const forecastRes = await fetch(`${API_BASE}/forecast?lat=${lat}&lon=${lon}`);
      const forecastData = await forecastRes.json();
      setForecast(forecastData.forecast || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setCurrent({ 
        aqi: 75, 
        city: 'Delhi', 
        state: 'Delhi', 
        station: 'Demo Station', 
        last_update: new Date().toISOString(), 
        pollutant_subindices: { 'PM2.5': 75, 'PM10': 65, 'NO2': 45 } 
      });
      setForecast([
        { datetime: new Date(Date.now() + 3600000).toISOString(), aqi: 78 },
        { datetime: new Date(Date.now() + 7200000).toISOString(), aqi: 82 },
        { datetime: new Date(Date.now() + 10800000).toISOString(), aqi: 85 }
      ]);
    }
    setLoading(false);
  }

  async function fetchLatest(cityName, c) {
    try {
      const res = await fetch(`${API_BASE}/realtime?city=${encodeURIComponent(cityName)}&lat=${c.lat}&lon=${c.lon}&nocache=${Date.now()}`);
      const data = await res.json();
      setLatest(data || null);
    } catch (e) {
      console.error('Error fetching realtime snapshot:', e);
      setLatest(null);
    }
  }

  function handleCityChange(e) {
    setCity(e.target.value);
  }

  async function handleCitySubmit(e) {
    e.preventDefault();
    if (!city) return;
    try {
      const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`);
      const geoData = await geoRes.json();
      if (geoData && geoData[0]) {
        setCoords({ lat: parseFloat(geoData[0].lat), lon: parseFloat(geoData[0].lon) });
      } else {
        alert('City not found');
      }
    } catch (error) {
      alert('Error finding city location');
    }
  }

  const hotspots = forecast.filter(f => f.aqi > 120).map((f, i) => ({
    lat: coords.lat + (Math.random() - 0.5) * 0.02,
    lon: coords.lon + (Math.random() - 0.5) * 0.02,
    aqi: f.aqi,
    time: f.datetime
  }));

  const safezones = forecast.filter(f => f.aqi < 80).map((f, i) => ({
    lat: coords.lat + (Math.random() - 0.5) * 0.03,
    lon: coords.lon + (Math.random() - 0.5) * 0.03,
    aqi: f.aqi,
    time: f.datetime
  }));

  const latestAQI = latest?.aqi ?? current?.aqi;
  const dominant = latest?.dominant_pollutant;
  const extraSuggestions = (() => {
    if (!dominant) return [];
    if (dominant === 'PM2.5' || dominant === 'PM10') {
      return [
        'Deploy air purifying plants like Areca Palm, Money Plant, or Snake Plant in the affected zone.',
        'Introduce water sprinkling on roads (common in Delhi)'
      ];
    }
    if (dominant === 'NO2' || dominant === 'SO2') {
      return [
        'Promote carpooling, use public transport in next 12 hours.',
        'Alert city authorities: Restrict heavy-duty trucks entry during peak hours.'
      ];
    }
    if (dominant === 'OZONE') {
      return [
        'Reduce outdoor exercise during afternoon, encourage indoors.',
        'Avoid solvents & paint usage today.'
      ];
    }
    return [];
  })();

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <DashboardPage
            current={current}
            forecast={forecast}
            latest={latest}
            latestAQI={latestAQI}
            loading={loading}
          />
        );
      case 'analytics':
        return (
          <AnalyticsPage
            current={current}
            latest={latest}
            forecast={forecast}
            API_BASE={API_BASE}
          />
        );
      case 'pollutants':
        return (
          <PollutantsPage
            current={current}
            latest={latest}
            forecast={forecast}
            API_BASE={API_BASE}
          />
        );
      case 'map':
        return (
          <MapPage
            current={current}
            forecast={forecast}
            latest={latest}
            coords={coords}
            setCoords={setCoords}
            city={city}
            setCity={setCity}
            API_BASE={API_BASE}
          />
        );
      case 'blogs':
        return <BlogsPage />;
      case 'settings':
        return (
          <SettingsPage
            city={city}
            setCity={setCity}
            coords={coords}
            setCoords={setCoords}
            onCitySubmit={handleCitySubmit}
          />
        );
      default:
        return (
          <DashboardPage
            current={current}
            forecast={forecast}
            latest={latest}
            latestAQI={latestAQI}
            loading={loading}
          />
        );
    }
  };

  return (
    <div className="app-container">
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
      
      <main className="main-content">
        {/* Search Section - Only show on Dashboard */}
        {currentPage === 'dashboard' && (
          <div className="search-section">
            <form onSubmit={handleCitySubmit} className="search-form">
              <input 
                type="text" 
                value={city} 
                onChange={handleCityChange} 
                placeholder="Enter city name (e.g., Delhi, Mumbai)" 
                className="search-input" 
              />
              <button type="submit" className="btn btn-primary">Search</button>
            </form>
          </div>
        )}

        {/* Alert Banner - Only show on Dashboard */}
        {currentPage === 'dashboard' && latest?.alert && (
          <div className="alert-banner">
            <div className="alert-content">
              <div className="alert-text">
                <div className="alert-title">⚠️ Mitigation Suggestion Mode</div>
                <div className="alert-message">{latest.alert_message}</div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>Dominant pollutant:</strong> {latest.dominant_pollutant}
                </div>
                <div style={{ marginTop: '0.5rem', marginBottom: '0.5rem', fontWeight: '600' }}>
                  🌍 Suggested Actions
                </div>
                <ul className="alert-actions">
                  {(extraSuggestions.concat(latest.suggestions || [])).map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
              <div className="alert-aqi">{Math.round(latestAQI || 0)}</div>
            </div>
          </div>
        )}

        {renderPage()}
      </main>

      <footer className="footer">
        <div className="footer-content">
          <span>© {new Date().getFullYear()} Safe Breath - Air Quality Monitoring</span>
          <ul className="footer-links">
            <li><a href="#" className="footer-link">GitHub</a></li>
            <li><a href="#" className="footer-link">Documentation</a></li>
            <li><a href="#" className="footer-link">Support</a></li>
          </ul>
        </div>
      </footer>
    </div>
  );
}

export default App;