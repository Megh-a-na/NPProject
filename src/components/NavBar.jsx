import React from 'react';

const Navbar = () => {
  return (
    <nav
      style={{
        position: 'fixed', // Makes the navbar fixed at the viewport
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#333',
        padding: '1rem',
        zIndex: 1000, // Ensures the navbar is above other content
      }}
    >
      <h1 style={{ color: '#fff', margin: 0, fontSize: "x-large", textAlign:'left' }}>5G Site Simulation</h1>
    </nav>
  );
};

export default Navbar;
