// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import './Profile.css';

function Profile() {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', address: '' });
  const [message, setMessage] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch('http://172.31.90.56:3000/api/account', {
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setFormData({ name: data.name, email: data.email, address: data.address });
      })
      .catch(err => console.error(err));
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://172.31.90.56:3000/api/account', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Profile updated successfully.');
        setUser(data.user);
        setEditMode(false);
      } else {
        setMessage(data.message || 'Update failed.');
      }
    } catch (error) {
      console.error(error);
      setMessage('Update failed.');
    }
  };

  if (!user) return <div className="loading">Loading...</div>;

  return (
    <div className="profile-container">
      <h2>Your Profile</h2>
      {message && <p className="message">{message}</p>}
      {editMode ? (
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input 
              type="text"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="Name"
              required
            />
          </div>
          <div className="input-group">
            <input 
              type="email"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              placeholder="Email"
              required
            />
          </div>
          <div className="input-group">
            <input 
              type="text"
              value={formData.address}
              onChange={e => setFormData({...formData, address: e.target.value})}
              placeholder="Address"
              required
            />
          </div>
          <button type="submit">Save Changes</button>
        </form>
      ) : (
        <div className="profile-details">
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Address:</strong> {user.address}</p>
          <button onClick={() => setEditMode(true)}>Edit Profile</button>
        </div>
      )}
    </div>
  );
}

export default Profile;
