// backend/services/emailService.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // or your SMTP provider
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send billing email every 2 months — NO amount due included
const sendBillingEmail = async (emailData) => {
  const { name, email, consumption, month, year } = emailData;
  const htmlMessage = `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
      <h2 style="color: #2C3E50; text-align: center;">Electricity Usage Report</h2>
      <p>Dear <strong>${name}</strong>,</p>
      <p>Your electricity usage report for <strong>${month} ${year}</strong> is now available.</p>
      <p><strong>Total Consumption (2 months):</strong> ${consumption} kWh</p>
      <p>Please note that this is a usage summary. The amount due will be included in your next official billing email.</p>
      <p style="font-size: 14px; color: #777;">Best Regards,<br><strong>Electricity Board Team</strong></p>
    </div>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Usage Summary for ${month} ${year}`,
    html: htmlMessage,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Billing summary email sent:', info.response);
    return info;
  } catch (error) {
    console.error('Error sending billing summary email:', error);
    throw error;
  }
};

// Send 15-day consumption email — With advisory if usage is high
const sendConsumptionEmail = async (emailData) => {
  const { name, email, consumption, month, year } = emailData;

  let advisoryMessage = '';
  if (consumption > 150) {
    advisoryMessage = `
      <p style="color: #C0392B;"><strong>Advisory:</strong> Your consumption is relatively high. Consider switching off unused appliances, using energy-efficient lights, and monitoring your daily usage to save electricity.</p>
    `;
  }

  const htmlMessage = `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
      <h2 style="color: #2C3E50; text-align: center;">15-Day Electricity Consumption</h2>
      <p>Dear <strong>${name}</strong>,</p>
      <p>Your electricity consumption for the recent 15-day period ending in <strong>${month} ${year}</strong> is <strong>${consumption} kWh</strong>.</p>
      ${advisoryMessage}
      <p>This is an automated report for your reference.</p>
      <p style="font-size: 14px; color: #777;">Best Regards,<br><strong>Electricity Board Team</strong></p>
    </div>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `15-Day Consumption Report - ${month} ${year}`,
    html: htmlMessage,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('15-day consumption email sent:', info.response);
    return info;
  } catch (error) {
    console.error('Error sending 15-day consumption email:', error);
    throw error;
  }
};

module.exports = {
  sendBillingEmail,
  sendConsumptionEmail,
};
