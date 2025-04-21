// src/pages/Tariffs.jsx
import React, { useState, useEffect } from 'react';
import './Tariffs.css';

function Tariffs() {
  const [tariffs, setTariffs] = useState({});
  useEffect(() => {
    fetch('http://172.31.90.56:5000/api/tariffs')
      .then(res => res.json())
      .then(data => setTariffs(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="tariffs-container">
      <h2>Tariff & Consumption Information</h2>
      <div className="tariff-cards">
        {tariffs.residential && (
          <div className="tariff-card">
            <h3>Residential</h3>
            <p>Rate: {tariffs.residential.rate} per kWh</p>
          </div>
        )}
        {tariffs.commercial && (
          <div className="tariff-card">
            <h3>Commercial</h3>
            <p>Rate: {tariffs.commercial.rate} per kWh</p>
          </div>
        )}
        {tariffs.industrial && (
          <div className="tariff-card">
            <h3>Industrial</h3>
            <p>Rate: {tariffs.industrial.rate} per kWh</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Tariffs;
