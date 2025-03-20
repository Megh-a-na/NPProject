import React, { useState, useEffect } from 'react'
import './App.css'
import Navbar from './components/NavBar'
import Towerpagefn from './views/Towerpage'
import LoginPage from './views/LoginPage'
import SignupPage from './views/SignupPage'
import MainPage from './views/MainPage'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  // Check for authentication on component mount
  useEffect(() => {
    const authData = localStorage.getItem('authData');
    if (authData) {
      const { email, isAuthenticated } = JSON.parse(authData);
      setIsLoggedIn(isAuthenticated);
      setUserEmail(email);
    }
  }, []);

  const handleLogin = (email) => {
    setIsLoggedIn(true);
    setUserEmail(email);
    // Store auth state in localStorage
    localStorage.setItem('authData', JSON.stringify({
      email,
      isAuthenticated: true
    }));
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserEmail('');
    // Clear auth state from localStorage
    localStorage.removeItem('authData');
  };

  const navigateToSignup = () => {
    setShowSignup(true);
  };

  const navigateToLogin = () => {
    setShowSignup(false);
  };

  // Determine what to show: login, signup, or main app
  if (isLoggedIn) {
    // Show main app
    return (
      <>
        <div>
          <Navbar userEmail={userEmail} onLogout={handleLogout} />
        </div>
        <div>
          <Towerpagefn />
        </div>
      </>
    );
  } else if (showSignup) {
    // Show signup page
    return <SignupPage onSignup={handleLogin} onBackToLogin={navigateToLogin} />;
  } else {
    // Show login page
    return <LoginPage onLogin={handleLogin} onNavigateToSignup={navigateToSignup} />;
  }
}

export default App
