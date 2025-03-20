import { useState } from 'react'
import './App.css'
import Navbar from './components/NavBar'
import Towerpagefn from './views/Towerpage'
import LoginPage from './views/LoginPage'
import SignupPage from './views/SignupPage'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showSignup, setShowSignup] = useState(false);

  const handleLogin = (email) => {
    setUser(email);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
    setShowSignup(false);
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
          <Navbar userEmail={user} onLogout={handleLogout} />
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
