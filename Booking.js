import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Booking.css';

const locations = ['Colombo', 'Kandy', 'Other'];
const photographers = [3, 4, 5];

const stepLabels = ['Booking', 'Payment', 'OTP', 'Invoice'];

const Stepper = ({ step }) => (
  <div className="booking-stepper">
    {stepLabels.map((label, idx) => (
      <React.Fragment key={label}>
        <div className={`booking-stepper-step${step === idx + 1 ? ' active' : ''}`}>
          <div className="booking-stepper-circle">{idx + 1}</div>
          <div className="booking-stepper-label">{label}</div>
        </div>
        {idx < stepLabels.length - 1 && <div className="booking-stepper-connector" />}
      </React.Fragment>
    ))}
  </div>
);

const Booking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    fullName: '',
    contactNumber: '',
    email: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    guests: '',
    photographers: '',
    venue: '',
    // Payment fields
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
    // OTP
    otp: ''
  });
  const [paymentStatus, setPaymentStatus] = useState('pending');

  React.useEffect(() => {
    if (location.state && location.state.eventType) {
      setForm(f => ({ ...f, eventType: location.state.eventType }));
    }
  }, [location.state]);

  // Step 1: Booking Form
  const handleBookingChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleBookingSubmit = e => {
    e.preventDefault();
    setStep(2);
  };

  // Step 2: Payment
  const handlePaymentChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handlePaymentSubmit = e => {
    e.preventDefault();
    setStep(3);
  };

  // Step 3: OTP
  const handleOTPChange = e => {
    setForm({ ...form, otp: e.target.value });
  };
  const handleOTPSubmit = e => {
    e.preventDefault();
    setPaymentStatus('success');
    setStep(4);
  };

  // Step 4: Invoice
  const handleDownloadInvoice = () => {
    // Placeholder: implement PDF download
    alert('Download PDF Invoice (not implemented)');
  };
  const handleGoHome = () => {
    navigate('/');
  };

  // Mask card number for OTP step
  const maskedCard = form.cardNumber ? '**** **** **** ' + form.cardNumber.slice(-4) : '';

  return (
    <div className="booking-bg">
      <div className="booking-container">
        <Stepper step={step} />
        {step === 1 && (
          <form className="booking-form" onSubmit={handleBookingSubmit}>
            <h1 className="booking-title">Book Your Event</h1>
            <div className="booking-form-group">
              <label htmlFor="fullName">Full Name</label>
              <input type="text" id="fullName" name="fullName" value={form.fullName} onChange={handleBookingChange} required />
            </div>
            <div className="booking-form-group">
              <label htmlFor="contactNumber">Contact Number</label>
              <input type="tel" id="contactNumber" name="contactNumber" value={form.contactNumber} onChange={handleBookingChange} required pattern="[0-9]{10,15}" />
            </div>
            <div className="booking-form-group">
              <label htmlFor="email">Email Address</label>
              <input type="email" id="email" name="email" value={form.email} onChange={handleBookingChange} required />
            </div>
            <div className="booking-form-group">
              <label htmlFor="date">Date</label>
              <input type="date" id="date" name="date" value={form.date} onChange={handleBookingChange} required />
            </div>
            <div className="booking-form-row">
              <div className="booking-form-group">
                <label htmlFor="startTime">Start Time</label>
                <input type="time" id="startTime" name="startTime" value={form.startTime} onChange={handleBookingChange} required />
              </div>
              <div className="booking-form-group">
                <label htmlFor="endTime">End Time</label>
                <input type="time" id="endTime" name="endTime" value={form.endTime} onChange={handleBookingChange} required />
              </div>
            </div>
            <div className="booking-form-group">
              <label htmlFor="location">Location</label>
              <select id="location" name="location" value={form.location} onChange={handleBookingChange} required>
                <option value="">Select location</option>
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
            <div className="booking-form-row">
              <div className="booking-form-group">
                <label htmlFor="guests">Number of Guests</label>
                <input type="number" id="guests" name="guests" value={form.guests} onChange={handleBookingChange} min="1" required />
              </div>
              <div className="booking-form-group">
                <label htmlFor="photographers">Number of Photographers</label>
                <select id="photographers" name="photographers" value={form.photographers} onChange={handleBookingChange} required>
                  <option value="">Select</option>
                  {photographers.map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="booking-form-group">
              <label htmlFor="venue">Event Venue</label>
              <input type="text" id="venue" name="venue" value={form.venue} onChange={handleBookingChange} required />
            </div>
            <button className="booking-submit-btn" type="submit">Book Now</button>
          </form>
        )}
        {step === 2 && (
          <form className="booking-form" onSubmit={handlePaymentSubmit}>
            <h1 className="booking-title">Payment</h1>
            <div className="booking-form-group">
              <label htmlFor="cardName">Name on Card</label>
              <input type="text" id="cardName" name="cardName" value={form.cardName} onChange={handlePaymentChange} required />
            </div>
            <div className="booking-form-group">
              <label htmlFor="cardNumber">Card Number</label>
              <input type="text" id="cardNumber" name="cardNumber" value={form.cardNumber} onChange={handlePaymentChange} required maxLength={19} pattern="[0-9 ]{13,19}" placeholder="1234 5678 9012 3456" />
            </div>
            <div className="booking-form-row">
              <div className="booking-form-group">
                <label htmlFor="expiry">Expiry Date (MM/YY)</label>
                <input type="text" id="expiry" name="expiry" value={form.expiry} onChange={handlePaymentChange} required pattern="^(0[1-9]|1[0-2])\/\d{2}$" placeholder="MM/YY" />
              </div>
              <div className="booking-form-group">
                <label htmlFor="cvv">CVV</label>
                <input type="password" id="cvv" name="cvv" value={form.cvv} onChange={handlePaymentChange} required maxLength={4} pattern="[0-9]{3,4}" />
              </div>
            </div>
            <button className="booking-submit-btn" type="submit">Pay Now</button>
          </form>
        )}
        {step === 3 && (
          <form className="booking-form" onSubmit={handleOTPSubmit}>
            <h1 className="booking-title">OTP Confirmation</h1>
            <div className="booking-form-group">
              <label>Card</label>
              <div className="booking-masked-card">{maskedCard}</div>
            </div>
            <div className="booking-form-group">
              <label htmlFor="otp">Enter OTP</label>
              <input type="text" id="otp" name="otp" value={form.otp} onChange={handleOTPChange} required maxLength={6} pattern="[0-9]{4,6}" />
            </div>
            <button className="booking-submit-btn" type="submit">Confirm Payment</button>
          </form>
        )}
        {step === 4 && (
          <div className="booking-invoice">
            <h1 className="booking-title">Invoice</h1>
            <div className="booking-invoice-summary">
              <div><strong>Name:</strong> {form.fullName}</div>
              <div><strong>Contact:</strong> {form.contactNumber}</div>
              <div><strong>Email:</strong> {form.email}</div>
              <div><strong>Date:</strong> {form.date}</div>
              <div><strong>Time:</strong> {form.startTime} - {form.endTime}</div>
              <div><strong>Location:</strong> {form.location}</div>
              <div><strong>Guests:</strong> {form.guests}</div>
              <div><strong>Photographers:</strong> {form.photographers}</div>
              <div><strong>Venue:</strong> {form.venue}</div>
              <div><strong>Payment Status:</strong> <span className={paymentStatus === 'success' ? 'success' : 'pending'}>{paymentStatus === 'success' ? 'Paid' : 'Pending'}</span></div>
            </div>
            <div className="booking-invoice-actions">
              <button className="booking-invoice-btn" onClick={handleDownloadInvoice}>Download PDF Invoice</button>
              <button className="booking-invoice-btn" onClick={handleGoHome}>Go to Home</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Booking; 
