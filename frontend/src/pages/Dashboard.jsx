// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');
  const [prediction, setPrediction] = useState(null);
  const token = localStorage.getItem('token');
  
  // Set your tariff rate (rupees per kWh)
  const tariffRate = 5.5;

  // Fetch user data from the backend on component mount
  useEffect(() => {
    fetch('http://localhost:5000/api/user/dashboard', {
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then((res) => res.json())
      .then((data) => {
        console.log('Fetched user data:', data);
        setUser(data);
      })
      .catch((err) => {
        console.error('Error fetching user data:', err);
        setMessage('Error fetching user data. Please try again later.');
      });
      
    fetchPrediction(); // fetch LSTM prediction on mount
  }, [token]);

  // Function to fetch LSTM prediction (dummy input used here)
  const fetchPrediction = async () => {
    try {
      // Create dummy input data matching expected shape (35, 24)
      const dummyInput = Array.from({ length: 35 }, () => Array(24).fill(0));
      const res = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: dummyInput }),
      });
      const data = await res.json();
      console.log("LSTM Prediction Response:", data);
      if (data.prediction !== undefined) {
        // Assume prediction is a number returned from backend
        setPrediction(data.prediction);
      } else {
        setPrediction("N/A");
      }
    } catch (err) {
      console.error("Error fetching prediction:", err);
      setPrediction("Error");
    }
  };

  // Existing function to generate a new bill
  const generateBill = async () => {
    try {
      const res = await fetch('http://172.31.90.56:5000/api/user/bill', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': 'Bearer ' + token 
        }
      });
      const data = await res.json();
      console.log('Bill generation response:', data);
      if (res.ok) {
        setMessage('Bill generated successfully!');
        // Refresh user data
        const dashboardRes = await fetch('http://172.31.90.56:5000/api/user/dashboard', {
          headers: { 'Authorization': 'Bearer ' + token }
        });
        const dashboardData = await dashboardRes.json();
        setUser(dashboardData);
      } else {
        setMessage(data.message || 'Failed to generate bill');
      }
    } catch (err) {
      console.error('Error generating bill:', err);
      setMessage('Failed to generate bill');
    }
  };

  // Existing function to send email notification
  const sendEmailNotification = async () => {
    try {
      const res = await fetch('http://172.31.90.56:5000/api/user/send-bill-email', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': 'Bearer ' + token 
        }
      });
      const data = await res.json();
      console.log('Email notification response:', data);
      if (res.ok) {
        setMessage('Email sent successfully!');
      } else {
        setMessage(data.message || 'Failed to send email');
      }
    } catch (err) {
      console.error('Error sending email notification:', err);
      setMessage('Failed to send email');
    }
  };
  

  if (!user) return <div className="loading">Loading...</div>;

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="brand">
          <h2>EB Portal</h2>
        </div>
        <nav>
          <ul>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/complaints">Complaints</Link></li>
            <li><Link to="/profile">Profile</Link></li>
            <li><Link to="/meter-reading">Meter Reading</Link></li>
            <li><Link to="/connection-request">Connection Request</Link></li>
            <li><Link to="/tariffs">Tariffs</Link></li>
            <li><Link to="/notifications">Notifications</Link></li>
            <li><Link to="/subsidies">Subsidies</Link></li>
            <li onClick={() => { localStorage.removeItem('token'); window.location.href = '/login'; }}>
              Logout
            </li>
          </ul>
        </nav>
      </aside>
      <main className="main-content">
        <header className="main-header">
          <h1>Welcome, {user.name}</h1>
          <p>Manage your electricity usage and billing effortlessly</p>
        </header>
        <section className="info-cards">
          <div className="card">
            <h3>User Details</h3>
            <p><strong>Address:</strong> {user.address || "Not Provided"}</p>
            <p>
              <strong>Usage:</strong> {user.electricityUsage} kWh
            </p>
            
            <p>
              <strong>Predicted Usage:</strong> {prediction !== null ? `${prediction} kWh` : "Loading..."}
            </p>
          </div>
          <div className="card">
            <h3>Past Bills</h3>
            {user.bills && user.bills.length > 0 ? (
              <ul>
                {user.bills.map((bill, index) => (
                  <li key={index}>
                    <span>{new Date(bill.date).toLocaleDateString()}</span>
                    <span>{bill.amount} kWh</span>
                    <span>₹{(bill.amount * tariffRate).toFixed(2)}</span>
                    <span>{bill.status}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No bills available.</p>
            )}
          </div>
        </section>
        <section className="bill-generator">
          <button className="generate-button" onClick={generateBill}>
            Generate Bill for this Month
          </button>
          <button className="send-email-button" onClick={sendEmailNotification}>
            Send Bill Email
          </button>
          
          {message && <p className="message">{message}</p>}
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
