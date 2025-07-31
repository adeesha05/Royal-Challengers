import React from 'react';
import logo from '../GI_logo.png';
import './Home.css';

const workPhotos = [
  '/images/home/1.jpg',
  '/images/home/2.jpg',
  '/images/home/1.jpg',
 '/images/home/2.jpg',
  '/images/home/1.jpg',
 '/images/home/2.jpg'
];

const Home = () => {
  return (
    <div className="home-bg">
      <div className="home-hero">
        <img src={logo} alt="Global Image Logo" className="home-logo-img" />
        <h1 className="home-title">Welcome to Global Image</h1>
        <p className="home-tagline">Your one-stop solution for creative photography, design, and digital experiences.</p>
        <a href="/portfolio" className="home-cta">View Portfolio</a>
      </div>
      <div className="home-features">
        <div className="feature-card">
          <h3>Professional Photography</h3>
          <p>Capture your moments with our expert photographers for any occasion.</p>
        </div>
        <div className="feature-card">
          <h3>Creative Design</h3>
          <p>From branding to digital art, our designers bring your vision to life.</p>
        </div>
        <div className="feature-card">
          <h3>Digital Solutions</h3>
          <p>Websites, social media, and more—empowering your digital presence.</p>
        </div>
      </div>
      <div className="home-work-section">
        <h2 className="home-work-title">Our Recent Works</h2>
        <div className="home-work-grid">
          {workPhotos.map((src, idx) => (
            <div className="home-work-photo-wrap" key={idx}>
              <img src={src} alt={`Our work ${idx+1}`} className="home-work-photo" />
            </div>
          ))}
        </div>
        <a href="/portfolio" className="home-work-more-btn">See More in Portfolio <span className="home-work-arrow">→</span></a>
      </div>
    </div>
  );
};

export default Home; 