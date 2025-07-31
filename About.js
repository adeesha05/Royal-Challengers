import React, { useState, useEffect } from 'react';
import './About.css';
import { useNavigate } from 'react-router-dom';
import { staffService } from '../services/staffService';

const team = [
  {
    name: 'U.Malshika',
    title: 'Founder & Lead Photographer',
    desc: 'Over 15 years of experience in event and corporate photography. Specializes in corporate events and professional headshots.',
    photo: '/team1.jpg'
  },
  {
    name: 'D.gamage',
    title: 'Senior Photographer',
    desc: 'Specializes in concert photography and dynamic event coverage.',
    photo: '/team2.jpg'
  },
  {
    name: 'R.liyange',
    title: 'Senior Photographer',
    desc: 'Expert in graduation ceremonies and large group event coverage.',
    photo: '/team3.jpg'
  },
  {
    name: 'S.Dilki',
    title: 'Photographer & Editor',
    desc: 'Specializes in corporate events photography.',
    photo: '/team4.jpg'
  }
];

const tools = [
  {
    title: 'High-End Cameras',
    desc: 'Full-frame professional cameras from Sony, Canon, and Nikon'
  },
  {
    title: 'Premium Lenses',
    desc: 'Wide selection of prime and zoom lenses for every situation'
  },
  {
    title: 'Professional Lighting',
    desc: 'Studio and portable lighting solutions for optimal results'
  },
  {
    title: 'Editing Software',
    desc: 'Professional editing suites for post-production excellence'
  }
];

const impact = [
  { value: '10+', label: 'Years of Experience' },
  { value: '2,500+', label: 'Events Covered' },
  { value: '500+', label: 'Satisfied Clients' },
  { value: '1M+', label: 'Photos Delivered' }
];

const About = () => {
  const navigate = useNavigate();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if user is admin
    const adminStatus = localStorage.getItem('isAdmin');
    if (adminStatus === 'true') {
      setIsAdmin(true);
    }
  }, []);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoading(true);
        const activeStaff = await staffService.getActiveStaff();
        setStaff(activeStaff);
      } catch (err) {
        setError('Failed to load staff information');
        console.error('Error fetching staff:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, []);

  // Admin view - simplified layout
  if (isAdmin) {
    return (
      <div className="about-bg">
        <div className="about-container">
          <h1 className="about-title">Staff Management</h1>
          <div className="about-divider" />
          <h2 className="about-subtitle">Manage Your Team</h2>
          <p className="about-text">
            Welcome to the staff management section. Here you can view and manage your team members.
          </p>
        </div>

        <div className="about-section">
          <h2 className="about-section-title">Our People</h2>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '18px', color: '#666' }}>Loading our team...</div>
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '18px', color: '#e74c3c' }}>{error}</div>
            </div>
          ) : (
            <>
              <div className="about-team-grid">
                {staff.slice(0, 4).map(member => (
                  <div className="about-team-card" key={member._id}>
                    <img 
                      src={member.photo ? 
                        (member.photo.startsWith('/uploads/') ? 
                          `http://localhost:5050${member.photo}` : 
                          member.photo.startsWith('/') ? 
                            member.photo : 
                            `/GI_logo.png`
                        ) : '/GI_logo.png'
                      } 
                      alt={member.name} 
                      className="about-team-photo"
                      onError={(e) => {
                        e.target.src = '/GI_logo.png';
                      }}
                    />
                    <div className="about-team-name">{member.name}</div>
                    <div className="about-team-title">{member.title}</div>
                    <div className="about-team-desc">{member.description || 'Professional photographer with expertise in various event types.'}</div>
                  </div>
                ))}
              </div>
              {/* Always show View All Staff button for admin */}
              <button className="about-team-viewall-btn" onClick={() => navigate('/team')}>
                View All Staff
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // Regular user view - full content
  return (
    <div className="about-bg">
      <div className="about-container">
        <h1 className="about-title">Our Story</h1>
        <div className="about-divider" />
        <h2 className="about-subtitle">How Global Image Came to Be</h2>
        <p className="about-text">
          Founded in 2010 by a team of passionate photographers, <strong>Global Image</strong> was born out of a desire to provide exceptional photography services for events of all sizes and types.<br /><br />
          What started as a small team covering local events has grown into a full-service photography company with a reputation for excellence and attention to detail. Over the years, we've had the privilege of capturing thousands of special moments for our clients.<br /><br />
          Today, Global Image is proud to be the trusted photography partner for many corporations, universities, and event organizers across the region, bringing our expertise and passion to every project we undertake.
        </p>
      </div>

      <div className="about-section">
        <h2 className="about-section-title">Our Purpose</h2>
        <div className="about-purpose-grid">
          <div className="about-purpose-block">
            <h3>Our Mission</h3>
            <p>To capture authentic moments with creativity and precision, providing our clients with lasting memories of their most important events and milestones.</p>
          </div>
          <div className="about-purpose-block">
            <h3>Our Vision</h3>
            <p>To be the premier photography service that clients trust with their most important moments, known for our exceptional quality, reliability, and customer service.</p>
          </div>
          <div className="about-purpose-block">
            <h3>Our Values</h3>
            <p>Excellence, creativity, integrity, and client satisfaction are at the core of everything we do. We believe in building lasting relationships through exceptional service.</p>
          </div>
        </div>
      </div>

      <div className="about-section">
        <h2 className="about-section-title">Our People</h2>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '18px', color: '#666' }}>Loading our team...</div>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '18px', color: '#e74c3c' }}>{error}</div>
          </div>
        ) : (
          <>
            <div className="about-team-grid">
              {staff.slice(0, 4).map(member => (
                <div className="about-team-card" key={member._id}>
                  <img 
                    src={member.photo ? 
                      (member.photo.startsWith('/uploads/') ? 
                        `http://localhost:5050${member.photo}` : 
                        member.photo.startsWith('/') ? 
                          member.photo : 
                          `/GI_logo.png`
                      ) : '/GI_logo.png'
                    } 
                    alt={member.name} 
                    className="about-team-photo"
                    onError={(e) => {
                      e.target.src = '/GI_logo.png';
                    }}
                  />
                  <div className="about-team-name">{member.name}</div>
                  <div className="about-team-title">{member.title}</div>
                  <div className="about-team-desc">{member.description || 'Professional photographer with expertise in various event types.'}</div>
                </div>
              ))}
            </div>
            {staff.length > 0 && (
              <button className="about-team-viewall-btn" onClick={() => navigate('/team')}>View All Staff</button>
            )}
          </>
        )}
      </div>

      <div className="about-section">
        <h2 className="about-section-title">Our Tools</h2>
        <div className="about-tools-grid">
          {tools.map(tool => (
            <div className="about-tool-card" key={tool.title}>
              <div className="about-tool-title">{tool.title}</div>
              <div className="about-tool-desc">{tool.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="about-section">
        <h2 className="about-section-title">Our Impact</h2>
        <div className="about-impact-grid">
          {impact.map(item => (
            <div className="about-impact-card" key={item.label}>
              <div className="about-impact-value">{item.value}</div>
              <div className="about-impact-label">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About; 