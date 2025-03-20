import React, { useState } from 'react';
import nokiaLogo from '../assets/Nokia logo.webp';

const SignupPage = ({ onSignup, onBackToLogin }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("Please fill out all fields");
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }
    
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('http://127.0.0.1:5000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      
      setSuccess("Account created successfully! Redirecting to login...");
      
      setFormData({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
      });
      
      setTimeout(() => {
        onBackToLogin();
      }, 2000);
      
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message || 'Failed to register. Please try again.');
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
      <div style={{
        width: '360px',
        maxWidth: '90%',
        backgroundColor: 'rgba(32, 32, 40, 0.8)',
        backdropFilter: 'blur(10px)',
        padding: '30px',
        borderRadius: '16px',
        color: 'white',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '24px'
        }}>
          <img 
            src={nokiaLogo} 
            alt="Nokia Logo" 
            style={{ 
              height: '40px',
              width: 'auto',
              marginBottom: '16px'
            }} 
          />
          <div style={{ fontSize: '22px', marginBottom: '8px' }}>
            <span style={{ opacity: 0.9 }}>Create account</span>
          </div>
        </div>

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

        {success && (
          <div style={{ 
            backgroundColor: 'rgba(40, 167, 69, 0.1)', 
            color: '#28a745',
            padding: '10px 15px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="fullName" style={{ 
              display: 'block', 
              fontSize: '14px', 
              marginBottom: '8px',
              opacity: 0.9,
              fontWeight: '500'
            }}>
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              pattern="^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$"
              title="Please enter a valid name (only letters, spaces, and basic punctuation allowed)"
              required
              style={{
                width: 'calc(100% - 24px)',
                padding: '12px 12px',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="email" style={{ 
              display: 'block', 
              fontSize: '14px', 
              marginBottom: '8px',
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
              required
              style={{
                width: 'calc(100% - 24px)',
                padding: '12px 12px',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="password" style={{ 
              display: 'block', 
              fontSize: '14px', 
              marginBottom: '8px',
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
              required
              style={{
                width: 'calc(100% - 24px)',
                padding: '12px 12px',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label htmlFor="confirmPassword" style={{ 
              display: 'block', 
              fontSize: '14px', 
              marginBottom: '8px',
              opacity: 0.9,
              fontWeight: '500'
            }}>
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              required
              style={{
                width: 'calc(100% - 24px)',
                padding: '12px 12px',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: isLoading ? '#666' : '#015498',
              border: 'none',
              borderRadius: '100px',
              color: 'white',
              fontWeight: 'bold',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              marginBottom: '16px',
              transition: 'background-color 0.3s'
            }}
            onMouseOver={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#0074D9')}
            onMouseOut={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#015498')}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
          
          <div style={{ 
            textAlign: 'center',
            fontSize: '14px',
            opacity: 0.7,
            width: '100%'
          }}>
            Already have an account? <a href="#" 
              onClick={(e) => {
                e.preventDefault();
                onBackToLogin();
              }}
              style={{ 
                color: 'white', 
                textDecoration: 'underline',
                padding: '4px 0'
              }}>
                Log in
              </a>
          </div>
        </form>
      </div>
      
      <div style={{ 
        marginTop: '20px',
        color: 'white', 
        opacity: 0.7,
        fontSize: '12px'
      }}>
        © 2023 Nokia. All rights reserved.
      </div>
    </div>
  );
};

export default SignupPage; 