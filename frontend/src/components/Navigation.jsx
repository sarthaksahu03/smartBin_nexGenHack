import React from 'react';

function Navigation({ currentPage, onPageChange }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'pollutants', label: 'Pollutants', icon: '🧪' },
    { id: 'map', label: 'Map', icon: '🗺️' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <a href="#" className="logo" onClick={(e) => { e.preventDefault(); onPageChange('dashboard'); }}>
          <div className="logo-icon">🌬️</div>
          <span>Safe Breath</span>
        </a>
        
        <ul className="nav-links">
          {navItems.map((item) => (
            <li key={item.id}>
              <a
                href="#"
                className={`nav-link ${currentPage === item.id ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(item.id);
                }}
              >
                <span style={{ marginRight: '0.5rem' }}>{item.icon}</span>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

export default Navigation;
