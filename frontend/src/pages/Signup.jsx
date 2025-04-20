import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Signup.css';

function SignUp() {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress]   = useState('');
  const [error, setError]       = useState('');
  const navigate              = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, address })
      });
      const data = await res.json();
      if (res.ok) {
        navigate('/login');
      } else {
        setError(data.message || 'Sign up failed');
      }
    } catch (err) {
      console.error(err);
      setError('Sign up failed');
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-overlay" />
      <div className="signup-card">
        <h2>Create Your Account</h2>
        <p className="tagline">Join our Electricity Board Portal</p>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input 
              type="text"
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="Full Name" 
              required 
            />
          </div>
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
          <div className="input-group">
            <input 
              type="text"
              value={address} 
              onChange={e => setAddress(e.target.value)} 
              placeholder="Residential Address" 
              required 
            />
          </div>
          <button type="submit" className="signup-button">Sign Up</button>
        </form>
        <p className="login-link">
          Already have an account? <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
}

export default SignUp;
