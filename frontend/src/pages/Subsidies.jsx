// src/pages/Subsidies.jsx
import React, { useState, useEffect } from 'react';
import './Subsidies.css';

function Subsidies() {
  const [subsidies, setSubsidies] = useState([]);
  useEffect(() => {
    fetch('http://localhost:5000/api/subsidies')
      .then(res => res.json())
      .then(data => setSubsidies(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="subsidies-container">
      <h2>Subsidy & Rebate Information</h2>
      <ul className="subsidies-list">
        {subsidies.map((sub, index) => (
          <li key={index}>
            <h3>{sub.scheme}</h3>
            <p>{sub.details}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Subsidies;
