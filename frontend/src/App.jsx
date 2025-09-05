import { useEffect, useState } from 'react';
import './App.css';
import AQIDashboard from './components/AQIDashboard.jsx';
import AQIForecastChart from './components/AQIForecastChart.jsx';
import AQIMap from './components/AQIMap.jsx';
import HealthAdvisory from './components/HealthAdvisory.jsx';

function App() {
  const [current, setCurrent] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState('');
  const [coords, setCoords] = useState({ lat: 28.6139, lon: 77.2090 }); // Default: Delhi

  useEffect(() => {
    fetchData(coords.lat, coords.lon);
    // eslint-disable-next-line
  }, [coords]);

  async function fetchData(lat, lon) {
    setLoading(true);
    try {
      const curRes = await fetch(`http://localhost:8000/current?lat=${lat}&lon=${lon}`);
      const curData = await curRes.json();
      setCurrent(curData);
      const forecastRes = await fetch(`http://localhost:8000/forecast?lat=${lat}&lon=${lon}`);
      const forecastData = await forecastRes.json();
      setForecast(forecastData.forecast || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Fallback data for demo
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

  function handleCityChange(e) {
    setCity(e.target.value);
  }

  async function handleCitySubmit(e) {
    e.preventDefault();
    if (!city) return;
    // Use OpenStreetMap Nominatim (free geocoding service)
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

  function handleUseMyLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        },
        () => {
          alert('Unable to retrieve your location');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser');
    }
  }

  // Generate realistic hotspots and safezones based on forecast data
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

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header" style={{background: '#e3f2fd', padding: '1rem 0', borderBottom: '1px solid #bdbdbd'}}>
        <nav style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 900, margin: '0 auto'}}>
          <div>
            <h1 style={{margin: 0}}>🌬️ Safe Breath</h1>
            <p style={{margin: 0, fontSize: '1rem'}}>Real-time air quality monitoring & 12-hour predictions</p>
          </div>
          <ul style={{listStyle: 'none', display: 'flex', gap: '1.5rem', margin: 0, padding: 0}}>
            <li><a href="#dashboard">Dashboard</a></li>
            <li><a href="#forecast">Forecast</a></li>
            <li><a href="#map">Map</a></li>
            <li><a href="#advisory">Advisory</a></li>
          </ul>
        </nav>
      </header>

      {/* Main Content */}
      <main style={{minHeight: '70vh'}}>
        <div className="search-container">
          <form onSubmit={handleCitySubmit} className="search-form">
            <input
              type="text"
              value={city}
              onChange={handleCityChange}
              placeholder="Enter city name (e.g., Delhi, Mumbai, New York)"
              className="search-input"
            />
            <button type="submit" className="btn btn-primary">Search</button>
            <button type="button" onClick={handleUseMyLocation} className="btn btn-secondary">
              📍 My Location
            </button>
          </form>
        </div>

        {loading ? (
          <div className="loading">Loading air quality data...</div>
        ) : (
          <div className="dashboard-grid">
            <section id="dashboard">
              <AQIDashboard
                aqi={current?.aqi}
                components={current?.components}
                station={current?.station}
                city={current?.city}
                state={current?.state}
                last_update={current?.last_update}
                pollutant_subindices={current?.pollutant_subindices}
              />
            </section>
            <section id="forecast">
              <AQIForecastChart forecast={forecast} />
            </section>
            <section id="advisory">
              <HealthAdvisory aqi={current?.aqi} />
            </section>
            <section id="map">
              <AQIMap 
                hotspots={hotspots} 
                safezones={safezones} 
                center={[coords.lat, coords.lon]} 
                currentAqi={current?.aqi}
              />
            </section>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{background: '#e3f2fd', padding: '1rem 0', borderTop: '1px solid #bdbdbd', textAlign: 'center'}}>
        <div style={{maxWidth: 900, margin: '0 auto', fontSize: '0.95rem'}}>
          <span>© {new Date().getFullYear()} Safe Breath | Made for NexGen Hackathon</span>
          <span style={{marginLeft: '1.5rem'}}>
            <a href="https://github.com/sarthaksahu03/smartBin_nexGenHack" target="_blank" rel="noopener noreferrer">GitHub</a>
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
