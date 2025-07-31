import React, { useState, useEffect } from 'react';
import './About.css';
import AdminDashboard from '../components/AdminDashboard';
import { staffService } from '../services/staffService';
import { useNavigate } from 'react-router-dom';

const Team = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Admin credentials (in a real app, this would be handled server-side)
  const ADMIN_EMAIL = 'admin@globalimage.com';
  const ADMIN_PASSWORD = 'admin123';

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoading(true);
        const allStaff = await staffService.getAllStaff();
        setStaff(allStaff);
      } catch (err) {
        setError('Failed to load staff information');
        console.error('Error fetching staff:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, []);

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (loginData.email === ADMIN_EMAIL && loginData.password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setShowLogin(false);
      setLoginError('');
      localStorage.setItem('isAdmin', 'true');
      // Redirect to teams page after successful login
      navigate('/team');
    } else {
      setLoginError('Invalid admin credentials');
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('isAdmin');
    // Redirect to sign-in page after logout
    navigate('/signin');
    // Force page refresh to clear any cached admin state
    window.location.reload();
  };

  useEffect(() => {
    const adminStatus = localStorage.getItem('isAdmin');
    if (adminStatus === 'true') {
      setIsAdmin(true);
    }
  }, []);

  if (isAdmin) {
    return <AdminDashboard isAdmin={isAdmin} onLogout={handleLogout} />;
  }

  return (
    <div className="about-bg">
      <div className="about-container">
        <div className="team-header">
          <h1 className="about-title">Meet Our Team</h1>
        </div>
        <div className="about-divider" />
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '18px', color: '#666' }}>Loading our team...</div>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '18px', color: '#e74c3c' }}>{error}</div>
          </div>
        ) : (
          <div className="about-team-grid">
            {staff.map(member => (
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
                {member.specializations && member.specializations.length > 0 && (
                  <div className="about-team-specializations">
                    <strong>Specializations:</strong> {member.specializations.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Admin Login Modal */}
      {showLogin && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div className="modal" style={{
            background: 'white',
            borderRadius: '15px',
            padding: '30px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}>
            <div className="modal-header" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h2 style={{ margin: 0, color: '#333' }}>Admin Login</h2>
              <button 
                onClick={() => setShowLogin(false)} 
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAdminLogin}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: '600' }}>
                  Email *
                </label>
                <input
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: '600' }}>
                  Password *
                </label>
                <input
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
              </div>
              {loginError && (
                <div style={{
                  padding: '10px',
                  marginBottom: '20px',
                  background: '#f8d7da',
                  color: '#721c24',
                  borderRadius: '8px',
                  border: '1px solid #f5c6cb'
                }}>
                  {loginError}
                </div>
              )}
              <div style={{
                display: 'flex',
                gap: '15px',
                justifyContent: 'flex-end'
              }}>
                <button
                  type="button"
                  onClick={() => setShowLogin(false)}
                  style={{
                    background: '#95a5a6',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '600'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '600'
                  }}
                >
                  Login
                </button>
              </div>
            </form>
            <div style={{
              marginTop: '20px',
              padding: '15px',
              background: '#f8f9fa',
              borderRadius: '8px',
              fontSize: '0.9rem',
              color: '#666'
            }}>
              <strong>Admin Credentials:</strong><br />
              Email: admin@globalimage.com<br />
              Password: admin123
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Team; 