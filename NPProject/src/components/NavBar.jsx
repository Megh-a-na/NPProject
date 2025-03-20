import React from 'react';
import nokiaLogo from '../assets/Nokia logo.webp';

const Navbar = ({ userEmail, onLogout }) => {
  return (
    <nav
      style={{
        position: 'fixed', // Makes the navbar fixed at the viewport
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#015498',
        padding: '1rem',
        zIndex: 1000, // Ensures the navbar is above other content
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <img src={nokiaLogo} alt="Nokia Logo" style={{ height: '40px', width: 'auto', marginRight: '1rem' }} />
        <h1 style={{ color: '#fff', margin: 0, fontSize: "x-large", textAlign:'left' }}>5G Site Simulation</h1>
      </div>
      
      {userEmail && (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ color: '#fff', marginRight: '1rem' }}>
            {userEmail}
          </span>
          <button
            onClick={onLogout}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid white',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'background-color 0.3s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
