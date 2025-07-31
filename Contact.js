import React, { useState } from 'react';
import './Contact.css';

const mainOffice = {
  label: 'Main Office',
  address: '171/1/1, EL Senanayake Street, Kandy, Sri Lanka, 20000',
  phone: '077-7155653',
  email: 'globalimagelanka@gmail.com',
  hours: [
    'Monday - Friday: 9am - 6pm',
    'Saturday: 10am - 4pm',
    'Sunday: Closed'
  ]
};

const faqs = [
  {
    q: 'How far in advance should I book your services?',
    a: 'We recommend booking at least 4-6 weeks in advance for corporate events and 2-3 months for graduation ceremonies. For urgent requests, please contact us directly to check our availability.'
  },
  {
    q: 'What is your payment policy?',
    a: 'We require a 50% deposit to secure your booking date, with the remaining balance due on or before the event date. We accept credit cards, bank transfers, and checks.'
  },
  {
    q: 'How long does it take to receive the photos?',
    a: 'Our standard delivery time is 7-10 business days after the event. We also offer express delivery options for an additional fee, with turnaround times as quick as 48 hours.'
  },
  {
    q: 'Do you provide raw, unedited photos?',
    a: 'Our standard packages include professionally edited photos. Raw, unedited files are available as an additional service for clients who require them for specific purposes.'
  },
  {
    q: "What happens if there's bad weather for an outdoor event?",
    a: "We monitor weather conditions closely and will work with you to develop contingency plans. If rescheduling is necessary, we'll do our best to accommodate your new date without additional fees."
  },
  {
    q: 'Do you travel for events outside your city?',
    a: 'Yes, we are available for travel nationwide and internationally. Travel fees apply based on location and are quoted on a case-by-case basis.'
  }
];

const Contact = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSubmit = e => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="contact-bg">
      <div className="contact-container">
        <h1 className="contact-title">Get In Touch</h1>
        <div className="contact-divider" />
        <p className="contact-desc">Have questions about our photography services? We're here to help!</p>
        <div className="contact-info-flex">
          <div className="contact-location-card">
            <div className="contact-location-icon">
              <span role="img" aria-label="Location">📍</span>
            </div>
            <div className="contact-location-label">Our Location</div>
            <div className="contact-location-address">{mainOffice.address}</div>
            <a href="https://maps.google.com/?q=171/1/1, EL Senanayake Street, Kandy, Sri Lanka, 20000" target="_blank" rel="noopener noreferrer" className="contact-info-btn">Get Directions</a>
          </div>
          <div className="contact-details-card">
            <div className="contact-details-row">
              <span className="contact-details-icon" role="img" aria-label="Phone">📞</span>
              <span className="contact-details-label">Phone:</span>
              <span className="contact-details-value">{mainOffice.phone}</span>
              <a href={`tel:${mainOffice.phone}`} className="contact-info-btn small">Call Us</a>
            </div>
            <div className="contact-details-row">
              <span className="contact-details-icon" role="img" aria-label="Email">✉️</span>
              <span className="contact-details-label">Email:</span>
              <span className="contact-details-value">{mainOffice.email}</span>
              <a href={`mailto:${mainOffice.email}`} className="contact-info-btn small">Send Email</a>
            </div>
            <div className="contact-details-row contact-details-hours">
              <span className="contact-details-icon" role="img" aria-label="Hours">⏰</span>
              <span className="contact-details-label">Business Hours:</span>
              <span className="contact-details-value contact-details-hours-list">
                {mainOffice.hours.map((line, i) => <div key={i}>{line}</div>)}
              </span>
            </div>
          </div>
        </div>
        <div className="contact-form-section">
          <h2 className="contact-form-title">Send Us a Message</h2>
          <p className="contact-form-desc">Have questions about our services or want to book a photography session? Fill out the form below and we'll get back to you as soon as possible.</p>
          {submitted ? (
            <div className="contact-success">Thank you for your message! We'll be in touch soon.</div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="contact-form-row">
                <div className="contact-form-group">
                  <label htmlFor="name">Your Name *</label>
                  <input type="text" id="name" name="name" value={form.name} onChange={handleChange} required />
                </div>
                <div className="contact-form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input type="email" id="email" name="email" value={form.email} onChange={handleChange} required />
                </div>
              </div>
              <div className="contact-form-row">
                <div className="contact-form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input type="tel" id="phone" name="phone" value={form.phone} onChange={handleChange} />
                </div>
                <div className="contact-form-group">
                  <label htmlFor="subject">Subject *</label>
                  <input type="text" id="subject" name="subject" value={form.subject} onChange={handleChange} required />
                </div>
              </div>
              <div className="contact-form-group">
                <label htmlFor="message">Your Message *</label>
                <textarea id="message" name="message" value={form.message} onChange={handleChange} rows={5} required placeholder="Please provide details about your inquiry or project..." />
              </div>
              <button className="contact-form-btn" type="submit">Send Message</button>
            </form>
          )}
        </div>
        <div className="contact-faq-section">
          <h2 className="contact-faq-title">Frequently Asked Questions</h2>
          <div className="contact-faq-grid">
            {faqs.map((faq, idx) => (
              <div className="contact-faq-card" key={idx}>
                <div className="contact-faq-q">{faq.q}</div>
                <div className="contact-faq-a">{faq.a}</div>
              </div>
            ))}
          </div>
          <div className="contact-faq-footer">Don't see your question here? <a href="mailto:globalimagelanka@gmail.com">Contact us directly</a> and we'll be happy to help.</div>
        </div>
      </div>
    </div>
  );
};

export default Contact; 