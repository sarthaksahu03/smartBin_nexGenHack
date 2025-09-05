import React, { useState, useEffect } from 'react';

function SettingsPage({ city, setCity, coords, setCoords, onCitySubmit }) {
  const [settings, setSettings] = useState({
    notifications: true,
    autoRefresh: true,
    refreshInterval: 60,
    units: 'metric',
    theme: 'light',
    language: 'en'
  });

  const [tempCity, setTempCity] = useState(city);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('aqi-settings');
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      setSettings(parsedSettings);
      // Apply theme immediately
      applyTheme(parsedSettings.theme);
    }
  }, []);

  const applyTheme = (theme) => {
    // Remove existing theme classes
    document.documentElement.classList.remove('theme-light', 'theme-dark');
    
    if (theme === 'light') {
      document.documentElement.classList.add('theme-light');
    } else if (theme === 'dark') {
      document.documentElement.classList.add('theme-dark');
    } else {
      // Auto mode - use system preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('theme-dark');
      } else {
        document.documentElement.classList.add('theme-light');
      }
    }
  };

  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('aqi-settings', JSON.stringify(newSettings));
    
    // Apply theme changes immediately
    if (key === 'theme') {
      applyTheme(value);
    }
  };

  const handleCityUpdate = async (e) => {
    e.preventDefault();
    if (!tempCity) return;
    
    try {
      const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(tempCity)}&format=json&limit=1`);
      const geoData = await geoRes.json();
      if (geoData && geoData[0]) {
        setCoords({ lat: parseFloat(geoData[0].lat), lon: parseFloat(geoData[0].lon) });
        setCity(tempCity);
        setIsEditing(false);
      } else {
        alert('City not found');
      }
    } catch (error) {
      alert('Error finding city location');
    }
  };

  const resetSettings = () => {
    const defaultSettings = {
      notifications: true,
      autoRefresh: true,
      refreshInterval: 60,
      units: 'metric',
      theme: 'light',
      language: 'en'
    };
    setSettings(defaultSettings);
    localStorage.setItem('aqi-settings', JSON.stringify(defaultSettings));
  };

  return (
    <div className="page-container">
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Location Settings */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <h2 className="card-title">Location Settings</h2>
            <p className="card-subtitle">Configure your default location</p>
          </div>
          
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div className="info-item">
              <div className="info-label">Current City</div>
              <div className="info-value">{city}</div>
            </div>
            
            <div className="info-item">
              <div className="info-label">Coordinates</div>
              <div className="info-value">
                {coords.lat.toFixed(4)}, {coords.lon.toFixed(4)}
              </div>
            </div>

            {!isEditing ? (
              <button 
                className="btn btn-primary"
                onClick={() => setIsEditing(true)}
              >
                Change Location
              </button>
            ) : (
              <form onSubmit={handleCityUpdate} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <input
                  type="text"
                  value={tempCity}
                  onChange={(e) => setTempCity(e.target.value)}
                  placeholder="Enter city name"
                  className="search-input"
                  style={{ flex: 1 }}
                />
                <button type="submit" className="btn btn-primary">Update</button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    setIsEditing(false);
                    setTempCity(city);
                  }}
                >
                  Cancel
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Notification Settings */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <h2 className="card-title">Notifications</h2>
            <p className="card-subtitle">Configure alert preferences</p>
          </div>
          
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Enable Notifications</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>
                  Get alerts when air quality changes significantly
                </div>
              </div>
              <label style={{ position: 'relative', display: 'inline-block', width: '3rem', height: '1.5rem' }}>
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: settings.notifications ? 'var(--primary-500)' : '#ccc',
                  transition: '0.4s',
                  borderRadius: '1.5rem'
                }}>
                  <span style={{
                    position: 'absolute',
                    content: '""',
                    height: '1.25rem',
                    width: '1.25rem',
                    left: '0.125rem',
                    bottom: '0.125rem',
                    backgroundColor: 'white',
                    transition: '0.4s',
                    borderRadius: '50%',
                    transform: settings.notifications ? 'translateX(1.5rem)' : 'translateX(0)'
                  }}></span>
                </span>
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Auto Refresh</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>
                  Automatically update data at regular intervals
                </div>
              </div>
              <label style={{ position: 'relative', display: 'inline-block', width: '3rem', height: '1.5rem' }}>
                <input
                  type="checkbox"
                  checked={settings.autoRefresh}
                  onChange={(e) => handleSettingChange('autoRefresh', e.target.checked)}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: settings.autoRefresh ? 'var(--primary-500)' : '#ccc',
                  transition: '0.4s',
                  borderRadius: '1.5rem'
                }}>
                  <span style={{
                    position: 'absolute',
                    content: '""',
                    height: '1.25rem',
                    width: '1.25rem',
                    left: '0.125rem',
                    bottom: '0.125rem',
                    backgroundColor: 'white',
                    transition: '0.4s',
                    borderRadius: '50%',
                    transform: settings.autoRefresh ? 'translateX(1.5rem)' : 'translateX(0)'
                  }}></span>
                </span>
              </label>
            </div>

            {settings.autoRefresh && (
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Refresh Interval (seconds)
                </label>
                <select
                  value={settings.refreshInterval}
                  onChange={(e) => handleSettingChange('refreshInterval', parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border)',
                    borderRadius: '0.5rem',
                    backgroundColor: 'var(--surface)',
                    color: 'var(--text-primary)'
                  }}
                >
                  <option value={30}>30 seconds</option>
                  <option value={60}>1 minute</option>
                  <option value={300}>5 minutes</option>
                  <option value={600}>10 minutes</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Display Settings */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <h2 className="card-title">Display Settings</h2>
            <p className="card-subtitle">Customize the interface</p>
          </div>
          
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                Theme
              </label>
              <select
                value={settings.theme}
                onChange={(e) => handleSettingChange('theme', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--border)',
                  borderRadius: '0.5rem',
                  backgroundColor: 'var(--surface)',
                  color: 'var(--text-primary)'
                }}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto (System)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                Language
              </label>
              <select
                value={settings.language}
                onChange={(e) => handleSettingChange('language', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--border)',
                  borderRadius: '0.5rem',
                  backgroundColor: 'var(--surface)',
                  color: 'var(--text-primary)'
                }}
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                Units
              </label>
              <select
                value={settings.units}
                onChange={(e) => handleSettingChange('units', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--border)',
                  borderRadius: '0.5rem',
                  backgroundColor: 'var(--surface)',
                  color: 'var(--text-primary)'
                }}
              >
                <option value="metric">Metric</option>
                <option value="imperial">Imperial</option>
              </select>
            </div>
          </div>
        </div>


        {/* Reset Settings */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Reset Settings</h2>
            <p className="card-subtitle">Restore default configuration</p>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button 
              className="btn btn-secondary"
              onClick={resetSettings}
            >
              Reset to Defaults
            </button>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>
              This will reset all settings to their default values
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
