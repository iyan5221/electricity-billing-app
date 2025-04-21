// src/pages/MeterReading.jsx
import React, { useState, useEffect } from 'react';
import './MeterReading.css';

function MeterReading() {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');
  const [consumption, setConsumption] = useState(''); // new state for consumption input
  const token = localStorage.getItem('token');

  // Fetch user data (including bills) from the backend
  const fetchUserData = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/user/dashboard', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      const data = await res.json();
      setUser(data);
    } catch (error) {
      console.error("Error fetching user data", error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [token]);

  // Function to submit meter reading with a consumption value
  const submitMeterReading = async () => {
    try {
      const consumptionValue = Number(consumption);
      if (!consumption || isNaN(consumptionValue) || consumptionValue < 0) {
        setMessage("Please enter a valid consumption value.");
        return;
      }
      const res = await fetch('http://localhost:5000/api/meter-reading', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': 'Bearer ' + token 
        },
        body: JSON.stringify({ consumption: consumptionValue }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Meter reading updated successfully!");
        setConsumption(''); // clear input field
        await fetchUserData(); // refresh user data to reflect the update
      } else {
        setMessage(data.message || "Failed to update meter reading.");
      }
    } catch (error) {
      console.error("Error updating meter reading:", error);
      setMessage("Error updating meter reading.");
    }
  };
  const generateBill = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/meter-reading', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': 'Bearer ' + token 
        },
        body: JSON.stringify({ consumption: 150 }) // hardcoded for now
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Meter reading updated successfully!");
        await fetchUserData();
      } else {
        setMessage(data.message || "Failed to update meter reading.");
      }
    } catch (error) {
      console.error("Error updating meter reading:", error);
      setMessage("Error updating meter reading.");
    }
  };
  
  return (
    <div className="meter-reading-container">
      <h2>Meter Reading</h2>
      {message && <p className="message">{message}</p>}
      <div className="meter-reading-history">
        <h3>Previous Records</h3>
        {user && user.bills && user.bills.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Usage (kWh)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {user.bills
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((bill, index) => (
                  <tr key={index}>
                    <td>{new Date(bill.date).toLocaleDateString()}</td>
                    <td>{bill.amount}</td>
                    <td>{bill.status}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        ) : (
          <p>No meter reading records available.</p>
        )}
      </div>
      <div className="meter-reading-actions">
        {/* Input field for consumption value (15-day reading) */}
        <input 
          type="number" 
          value={consumption} 
          onChange={(e) => setConsumption(e.target.value)} 
          placeholder="Enter 15-day consumption (kWh)" 
        />
        <button onClick={submitMeterReading}>
          Submit 15-Day Meter Reading
        </button>
      </div>
    </div>
  );
}

export default MeterReading;
