// src/pages/Notifications.jsx
import React, { useState, useEffect } from 'react';
import './Notifications.css';

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [message, setMessage] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch('http://localhost:5000/api/notifications', {
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(res => res.json())
      .then(data => setNotifications(data))
      .catch(err => console.error(err));
  }, [token]);

  const markAllRead = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token }
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('All notifications marked as read.');
        // Optionally refresh notifications:
        const refreshed = await fetch('http://localhost:5000/api/notifications', {
          headers: { 'Authorization': 'Bearer ' + token }
        });
        const refreshedData = await refreshed.json();
        setNotifications(refreshedData);
      } else {
        setMessage(data.message || 'Operation failed.');
      }
    } catch (error) {
      console.error(error);
      setMessage('Operation failed.');
    }
  };

  return (
    <div className="notifications-container">
      <h2>Notifications</h2>
      {message && <p className="message">{message}</p>}
      <button onClick={markAllRead} className="mark-read-button">Mark All as Read</button>
      <ul className="notifications-list">
        {notifications.map((notif, index) => (
          <li key={index} className={notif.read ? 'read' : 'unread'}>
            <p>{notif.message}</p>
            <span>{new Date(notif.createdAt).toLocaleDateString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Notifications;
