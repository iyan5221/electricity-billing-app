import React, { useState } from 'react';

function PaymentForm({ onPayment }) {
  const [amount, setAmount] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onPayment(amount);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Payment Amount:
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          style={{ marginLeft: '10px' }}
        />
      </label>
      <button type="submit" style={{ marginLeft: '10px' }}>
        Submit Payment
      </button>
    </form>
  );
}

export default PaymentForm;
