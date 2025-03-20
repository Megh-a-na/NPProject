import React, { useState } from 'react';
import nokiaLogo from '../assets/Nokia logo.webp';

const LoginPage = ({ onLogin, onNavigateToSignup }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user starts typing again
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset error
    setError('');
    
    // Basic validation
    if (!formData.email || !formData.password) {
      setError("Please enter both email and password");
      return;
    }
    
    // Set loading state
    setIsLoading(true);
    
    try {
      // Send login request to backend
      const response = await fetch('http://127.0.0.1:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      // If successful, log in the user
      console.log('User logged in:', data.user.email);
      
      // Navigate to main page with user info
      onLogin(data.user.email);
      
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100vw',
      height: '100vh',
      backgroundImage: 'linear-gradient(to right, #00427A, #0074D9, #015498)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      fontFamily: 'Inter, system-ui, sans-serif',
      overflow: 'hidden',
      margin: 0,
      padding: 0
    }}>
      {/* Single translucent login box */}
      <div style={{
        width: '400px',
        maxWidth: '90%',
        backgroundColor: 'rgba(32, 32, 40, 0.8)',
        backdropFilter: 'blur(10px)',
        padding: '40px',
        borderRadius: '16px',
        color: 'white',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        {/* Nokia logo at the top of the login box */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '32px'
        }}>
          <img 
            src={nokiaLogo} 
            alt="Nokia Logo" 
            style={{ 
              height: '50px', 
              width: 'auto',
              marginBottom: '20px'
            }} 
          />
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>
            <span style={{ opacity: 0.9 }}>Welcome back</span>
          </div>
        </div>

        {/* Display error message if there is one */}
        {error && (
          <div style={{ 
            backgroundColor: 'rgba(220, 53, 69, 0.1)', 
            color: '#dc3545',
            padding: '10px 15px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ 
          display: 'flex', 
          flexDirection: 'column',
          width: '100%'
        }}>
          <div style={{ marginBottom: '24px' }}>
            <label htmlFor="email" style={{ 
              display: 'block', 
              fontSize: '14px', 
              marginBottom: '10px',
              opacity: 0.9,
              fontWeight: '500'
            }}>
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email address"
              pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
              title="Please enter a valid email address"
              required
              list="email-suggestions"
              style={{
                width: 'calc(100% - 32px)',
                padding: '14px 16px',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontSize: '14px',
                outline: 'none'
              }}
            />
            <datalist id="email-suggestions">
              <option value="@gmail.com" />
              <option value="@yahoo.com" />
              <option value="@outlook.com" />
              <option value="@hotmail.com" />
              <option value="@nokia.com" />
            </datalist>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label htmlFor="password" style={{ 
              display: 'block', 
              fontSize: '14px', 
              marginBottom: '10px',
              opacity: 0.9,
              fontWeight: '500'
            }}>
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              style={{
                width: 'calc(100% - 32px)',
                padding: '14px 16px',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '28px',
            fontSize: '14px',
            width: '100%'
          }}>
            <div>
              <a href="#" style={{ 
                color: 'white', 
                opacity: 0.7, 
                textDecoration: 'none',
                padding: '4px 0'
              }}>
                Keep me signed in
              </a>
            </div>
            <div>
              <a href="#" style={{ 
                color: 'white', 
                opacity: 0.7, 
                textDecoration: 'none',
                padding: '4px 0'
              }}>
                Forgot Password?
              </a>
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: isLoading ? '#666' : '#015498',
              border: 'none',
              borderRadius: '100px',
              color: 'white',
              fontWeight: 'bold',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              marginBottom: '20px',
              transition: 'background-color 0.3s'
            }}
            onMouseOver={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#0074D9')}
            onMouseOut={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#015498')}
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
          
          <div style={{ 
            textAlign: 'center',
            fontSize: '14px',
            opacity: 0.7,
            width: '100%'
          }}>
            Don't have an account? <a href="#" 
              onClick={(e) => {
                e.preventDefault();
                onNavigateToSignup();
              }}
              style={{ 
                color: 'white', 
                textDecoration: 'underline',
                padding: '4px 0'
              }}>
                Sign up
              </a>
          </div>
        </form>
      </div>
      
      {/* Footer text */}
      <div style={{ 
        marginTop: '24px', 
        color: 'white', 
        opacity: 0.7,
        fontSize: '14px'
      }}>
        © 2023 Nokia. All rights reserved.
      </div>
    </div>
  );
};

export default LoginPage;


