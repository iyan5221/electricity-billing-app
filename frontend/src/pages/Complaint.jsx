// src/pages/Complaint.jsx
import React, { useState, useEffect } from 'react';
import './Complaint.css';

function Complaint() {
  const [complaintSubject, setComplaintSubject] = useState('');
  const [complaintDescription, setComplaintDescription] = useState('');
  const [complaints, setComplaints] = useState([]);
  const [message, setMessage] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch('http:/172.31.90.56:5000/api/complaints', {
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(res => res.json())
      .then(data => setComplaints(data))
      .catch(err => console.error(err));
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://172.31.90.56:5000/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ subject: complaintSubject, description: complaintDescription })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Complaint submitted successfully.');
        setComplaintSubject('');
        setComplaintDescription('');
        // Refresh complaint list
        const refreshed = await fetch('http://172.31.90.56:5000/api/complaints', {
          headers: { 'Authorization': 'Bearer ' + token }
        });
        const refreshedData = await refreshed.json();
        setComplaints(refreshedData);
      } else {
        setMessage(data.message || 'Submission failed.');
      }
    } catch (error) {
      console.error(error);
      setMessage('Submission failed.');
    }
  };

  return (
    <div className="complaint-container">
      <h2>Register a Complaint</h2>
      {message && <p className="message">{message}</p>}
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <input 
            type="text"
            value={complaintSubject}
            onChange={e => setComplaintSubject(e.target.value)}
            placeholder="Subject" 
            required 
          />
        </div>
        <div className="input-group">
          <textarea 
            value={complaintDescription}
            onChange={e => setComplaintDescription(e.target.value)}
            placeholder="Complaint Description" 
            required
          ></textarea>
        </div>
        <button type="submit">Submit Complaint</button>
      </form>
      <h3>Your Complaints</h3>
      <ul className="complaint-list">
        {complaints.map((comp, index) => (
          <li key={index}>
            <h4>{comp.subject}</h4>
            <p>{comp.description}</p>
            <span>Status: {comp.status}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Complaint;
