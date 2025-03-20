const MainPage = ({ userEmail, onLogout }) => {
  const handleLogout = () => {
    // Clear authentication data and call logout handler
    localStorage.removeItem('authData');
    onLogout();
  };

  return (
    <div>
      {/* Your existing main page content */}
      
      {/* Add a logout button somewhere in your navigation */}
      <button 
        onClick={handleLogout}
        style={{
          padding: '8px 16px',
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Logout
      </button>
    </div>
  );
};

export default MainPage; 