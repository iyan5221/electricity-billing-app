import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [error, setError]         = useState('');
  const navigate                = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // clear previous errors
    console.log('Submitting login for:', email);
    try {
      const res = await fetch('http://172.31.90.56:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      console.log('Login response:', data);
      if (res.ok) {
        // Save token and navigate
        localStorage.setItem('token', data.token);
        console.log('Token saved. Redirecting to dashboard...');
        navigate('/dashboard');
      } else {
        console.error('Login failed:', data.message);
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Error during login:', err);
      setError('Login failed due to a network or server error.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-overlay" />
      <div className="login-card">
        <h2>Electricity Board Login</h2>
        <p className="tagline">Empowering Your Energy Management</p>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="Email Address" 
              required 
            />
          </div>
          <div className="input-group">
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="Password" 
              required 
            />
          </div>
          <button type="submit" className="login-button">Login</button>
        </form>
        <p className="signup-link">
          Don't have an account? <a href="/signup">Sign Up</a>
        </p>
      </div>
    </div>
  );
}

export default Login;
