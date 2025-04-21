// src/pages/ConnectionRequest.jsx
import React, { useState, useEffect } from 'react';
import './ConnectionRequest.css';

function ConnectionRequest() {
  const [requestType, setRequestType] = useState('');
  const [details, setDetails] = useState('');
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch('http://localhost:5000/api/connections', {
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(res => res.json())
      .then(data => setRequests(data))
      .catch(err => console.error(err));
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ requestType, details })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Request submitted successfully.');
        setRequestType('');
        setDetails('');
        // Refresh list
        const refreshed = await fetch('http://localhost:5000/api/connections', {
          headers: { 'Authorization': 'Bearer ' + token }
        });
        const refreshedData = await refreshed.json();
        setRequests(refreshedData);
      } else {
        setMessage(data.message || 'Submission failed.');
      }
    } catch (error) {
      console.error(error);
      setMessage('Submission failed.');
    }
  };

  return (
    <div className="connection-container">
      <h2>New Connection Request</h2>
      {message && <p className="message">{message}</p>}
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <select value={requestType} onChange={e => setRequestType(e.target.value)} required>
            <option value="">Select Request Type</option>
            <option value="New Connection">New Connection</option>
            <option value="Load Upgrade">Load Upgrade</option>
          </select>
        </div>
        <div className="input-group">
          <textarea 
            value={details}
            onChange={e => setDetails(e.target.value)}
            placeholder="Enter additional details (if any)"
          ></textarea>
        </div>
        <button type="submit">Submit Request</button>
      </form>
      <h3>Your Requests</h3>
      <ul className="connection-list">
        {requests.map((req, index) => (
          <li key={index}>
            <h4>{req.requestType}</h4>
            <p>{req.details}</p>
            <span>Status: {req.status}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ConnectionRequest;
