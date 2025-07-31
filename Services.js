import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Services.css';

const packages = [
  {
    key: 'Batch Party',
    title: 'Batch Party',
    description: 'Celebrate your batch’s milestones with our all-inclusive party package: photography, decor, and more.',
    photo: '/service1.jpg'
  },
  {
    key: 'Social Gathering',
    title: 'Social Gatherings',
    description: 'Perfect for club meetups, reunions, and casual get-togethers. Capture every moment in style.',
    photo: '/service2.jpg'
  },
  {
    key: 'Birthday Party',
    title: 'Birthday Parties',
    description: 'Make birthdays unforgettable with creative photography, fun props, and vibrant memories.',
    photo: '/service3.jpg'
  },
  {
    key: 'Cultural Event',
    title: 'Cultural Events',
    description: 'From festivals to traditional ceremonies, we cover every detail with color and care.',
    photo: '/service4.jpg'
  },
  {
    key: 'Other Event',
    title: 'Other Events',
    description: 'Product launches, family gatherings, and more—custom packages for any occasion.',
    photo: '/service5.jpg'
  }
];

const Services = () => {
  const navigate = useNavigate();

  const handleBookNow = (pkg) => {
    navigate('/booking', { state: { eventType: pkg.key } });
  };

  return (
    <div className="services-bg">
      <div className="services-header">
        <h1>Our Service Packages</h1>
        <p>Choose the perfect package for your event. Click “Book Now” to reserve your date!</p>
      </div>
      <div className="services-grid">
        {packages.map(pkg => (
          <div className="services-card" key={pkg.key}>
            <img src={pkg.photo} alt={pkg.title} className="services-card-img" />
            <h2 className="services-card-title">{pkg.title}</h2>
            <p className="services-card-desc">{pkg.description}</p>
            <button className="services-book-btn" onClick={() => handleBookNow(pkg)}>Book Now</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Services; 