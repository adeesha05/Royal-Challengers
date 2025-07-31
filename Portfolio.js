import React, { useState, useCallback, useEffect } from 'react';
import './Portfolio.css';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const baseCategories = [
  {
    key: 'batch',
    label: 'Batch Party',
    events: [
      {
        name: 'Batch 2023 Farewell',
        cover: '/GI_logo.png',
        photos: ['/GI_logo.png', '/GI_logo.png', '/GI_logo.png'],
        description: 'A memorable farewell for the 2023 batch.'
      },
      {
        name: 'Engineering Batch Bash',
        cover: '/GI_logo.png',
        photos: ['/GI_logo.png', '/GI_logo.png'],
        description: 'Celebrating the achievements of engineering graduates.'
      }
    ]
  },
  {
    key: 'social',
    label: 'Social Gatherings',
    events: [
      {
        name: 'Annual Club Meetup',
        cover: '/GI_logo.png',
        photos: ['/GI_logo.png', '/GI_logo.png', '/GI_logo.png'],
        description: 'Bringing together club members for a fun evening.'
      }
    ]
  },
  {
    key: 'birthday',
    label: 'Birthday Parties',
    events: [
      {
        name: 'Emma’s 18th Birthday',
        cover: '/GI_logo.png',
        photos: ['/GI_logo.png', '/GI_logo.png', '/GI_logo.png', '/GI_logo.png'],
        description: 'A vibrant birthday celebration for Emma.'
      }
    ]
  },
  {
    key: 'cultural',
    label: 'Cultural Events',
    events: [
      {
        name: 'Spring Festival',
        cover: '/GI_logo.png',
        photos: ['/GI_logo.png', '/GI_logo.png'],
        description: 'A colorful festival full of tradition and joy.'
      }
    ]
  },
  {
    key: 'other',
    label: 'Other Events',
    events: [
      {
        name: 'Product Launch 2024',
        cover: '/GI_logo.png',
        photos: ['/GI_logo.png', '/GI_logo.png', '/GI_logo.png'],
        description: 'Exciting new product launch event.'
      }
    ]
  }
];

// Aggregate all events for 'All Events' category
const allEvents = baseCategories.flatMap(cat => cat.events);
const eventCategories = [
  { key: 'all', label: 'All Events', events: allEvents },
  ...baseCategories
];

// Add Gallery Modal Component
function AddGalleryModal({ open, onClose, onSubmit, categories }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState([]);
  const [cover, setCover] = useState(null);
  const [category, setCategory] = useState(categories[0]?.key || '');
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [coverError, setCoverError] = useState('');

  useEffect(() => {
    if (open) {
      setName('');
      setDescription('');
      setFiles([]);
      setCover(null);
      setCategory(categories[0]?.key || '');
      setError('');
      setDragActive(false);
      setCoverError('');
    }
  }, [open, categories]);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    if (selected.length + files.length > 75) {
      setError('You can upload a maximum of 75 images.');
      return;
    }
    setFiles(prev => [...prev, ...selected].slice(0, 75));
    setError('');
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setCover(null);
      setCoverError('');
      return;
    }
    // Check if image is landscape
    const img = new window.Image();
    img.onload = function () {
      if (img.width > img.height) {
        setCover(file);
        setCoverError('');
      } else {
        setCover(null);
        setCoverError('Cover photo must be landscape (width > height).');
      }
    };
    img.onerror = function () {
      setCover(null);
      setCoverError('Invalid image file.');
    };
    img.src = URL.createObjectURL(file);
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const dropped = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (dropped.length + files.length > 75) {
      setError('You can upload a maximum of 75 images.');
      return;
    }
    setFiles(prev => [...prev, ...dropped].slice(0, 75));
    setError('');
  };

  const handleRemoveFile = (idx) => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Event name is required.');
      return;
    }
    if (!description.trim()) {
      setError('Description is required.');
      return;
    }
    if (!cover) {
      setError('Cover picture is required.');
      return;
    }
    if (coverError) {
      setError(coverError);
      return;
    }
    if (files.length === 0) {
      setError('Please select at least one gallery image.');
      return;
    }
    if (!category) {
      setError('Please select a category.');
      return;
    }
    onSubmit({ name, description, cover, files, category });
  };

  if (!open) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', padding: 32, borderRadius: 8, minWidth: 320, position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer' }}>&times;</button>
        <h2>Add Gallery</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 8 }}>
            <label style={{ display: 'block', marginBottom: 4 }}>Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}>
              {categories.map(cat => (
                <option key={cat.key} value={cat.key}>{cat.label}</option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: 8 }}>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Event Name" style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
          </div>
          <div style={{ marginBottom: 8 }}>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc', minHeight: 60 }} />
          </div>
          <div style={{ marginBottom: 8 }}>
            <label style={{ display: 'block', marginBottom: 4 }}>Cover Picture</label>
            <input type="file" accept="image/*" onChange={handleCoverChange} />
            {coverError && <div style={{ color: 'red', fontSize: 13 }}>{coverError}</div>}
          </div>
          <div style={{ marginBottom: 8 }}>
            <label style={{ display: 'block', marginBottom: 4 }}>Gallery Images</label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              style={{
                border: dragActive ? '2px solid #007bff' : '2px dashed #ccc',
                borderRadius: 6,
                padding: 16,
                textAlign: 'center',
                background: dragActive ? '#f0f8ff' : '#fafbfc',
                marginBottom: 8,
                cursor: 'pointer',
                minHeight: 80
              }}
              onClick={() => document.getElementById('gallery-file-input').click()}
            >
              <div style={{ color: '#888', marginBottom: 8 }}>
                Drag and drop images here or click to browse any folder on your device (max 75 images)
              </div>
              <input
                id="gallery-file-input"
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 8, minHeight: 60 }}>
                {files.length === 0 ? (
                  <span style={{ color: '#bbb', fontSize: 13 }}>No images selected yet.</span>
                ) : (
                  files.map((file, idx) => (
                    <div key={idx} style={{ position: 'relative', display: 'inline-block' }}>
                      <img src={URL.createObjectURL(file)} alt="preview" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4, border: '1px solid #ccc' }} />
                      <button type="button" onClick={e => { e.stopPropagation(); handleRemoveFile(idx); }} style={{ position: 'absolute', top: -8, right: -8, background: '#dc3545', color: '#fff', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', fontSize: 14, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
          <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
            <button type="submit" style={{ background: '#007bff', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 20px', cursor: 'pointer' }}>Add Gallery</button>
            <button type="button" onClick={onClose} style={{ background: '#ccc', color: '#222', border: 'none', borderRadius: 4, padding: '8px 20px', cursor: 'pointer' }}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Update Gallery Modal Component
function UpdateGalleryModal({ open, onClose, onSubmit, event, categories }) {
  const [name, setName] = useState(event?.name || '');
  const [description, setDescription] = useState(event?.description || '');
  const [category, setCategory] = useState(event?.category || (categories && categories[0]?.key) || '');
  const [cover, setCover] = useState(null);
  const [files, setFiles] = useState([]);
  const [existingPhotos, setExistingPhotos] = useState(event?.photos || []);
  const [error, setError] = useState('');
  const [coverError, setCoverError] = useState('');

  useEffect(() => {
    setName(event?.name || '');
    setDescription(event?.description || '');
    setCategory(event?.category || (categories && categories[0]?.key) || '');
    setCover(null);
    setFiles([]);
    setExistingPhotos(event?.photos || []);
    setError('');
    setCoverError('');
  }, [event, open, categories]);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    if (selected.length + existingPhotos.length > 75) {
      setError('You can have a maximum of 75 images in total.');
      return;
    }
    setFiles(selected);
    setError('');
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setCover(null);
      setCoverError('');
      return;
    }
    // Check if image is landscape
    const img = new window.Image();
    img.onload = function () {
      if (img.width > img.height) {
        setCover(file);
        setCoverError('');
      } else {
        setCover(null);
        setCoverError('Cover photo must be landscape (width > height).');
      }
    };
    img.onerror = function () {
      setCover(null);
      setCoverError('Invalid image file.');
    };
    img.src = URL.createObjectURL(file);
  };

  const handleRemovePhoto = (photoUrl) => {
    setExistingPhotos(prev => prev.filter(p => p !== photoUrl));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Event name is required.');
      return;
    }
    if (!description.trim()) {
      setError('Description is required.');
      return;
    }
    if (!category) {
      setError('Please select a category.');
      return;
    }
    if (coverError) {
      setError(coverError);
      return;
    }
    if (existingPhotos.length + files.length === 0) {
      setError('At least one gallery image is required.');
      return;
    }
    onSubmit({ name, description, category, cover, files, keepPhotos: existingPhotos });
  };

  if (!open) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', padding: 32, borderRadius: 8, minWidth: 320, position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer' }}>&times;</button>
        <h2>Update Gallery</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 8 }}>
            <label style={{ display: 'block', marginBottom: 4 }}>Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}>
              {categories && categories.map(cat => (
                <option key={cat.key} value={cat.key}>{cat.label}</option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: 8 }}>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Event Name" style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
          </div>
          <div style={{ marginBottom: 8 }}>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc', minHeight: 60 }} />
          </div>
          <div style={{ marginBottom: 8 }}>
            <label style={{ display: 'block', marginBottom: 4 }}>Cover Picture (leave empty to keep current)</label>
            <input type="file" accept="image/*" onChange={handleCoverChange} />
            {coverError && <div style={{ color: 'red', fontSize: 13 }}>{coverError}</div>}
          </div>
          <div style={{ marginBottom: 8 }}>
            <label style={{ display: 'block', marginBottom: 4 }}>Gallery Images (leave empty to keep current)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
              {existingPhotos.map((photo, idx) => (
                <div key={idx} style={{ position: 'relative', display: 'inline-block' }}>
                  <img src={getImageUrl(photo)} alt="gallery" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4, border: '1px solid #ccc' }} />
                  <button type="button" onClick={() => handleRemovePhoto(photo)} style={{ position: 'absolute', top: -8, right: -8, background: '#dc3545', color: '#fff', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', fontSize: 14, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                </div>
              ))}
            </div>
            <input type="file" accept="image/*" multiple onChange={handleFileChange} />
            <div style={{ fontSize: 13, color: '#888', margin: '8px 0' }}>
              You can have up to 75 images in total.
            </div>
          </div>
          {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
          <button type="submit" style={{ background: '#ffc107', color: '#222', border: 'none', borderRadius: 4, padding: '8px 20px', marginTop: 12, cursor: 'pointer' }}>Update Gallery</button>
        </form>
      </div>
    </div>
  );
}

// Delete Gallery Confirmation Dialog
function DeleteGalleryConfirm({ open, onClose, onConfirm, eventName }) {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', padding: 32, borderRadius: 8, minWidth: 320, position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer' }}>&times;</button>
        <h2>Delete Gallery</h2>
        <p>Are you sure you want to delete <b>{eventName}</b>?</p>
        <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
          <button onClick={onConfirm} style={{ background: '#dc3545', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 20px', cursor: 'pointer' }}>Delete</button>
          <button onClick={onClose} style={{ background: '#ccc', color: '#222', border: 'none', borderRadius: 4, padding: '8px 20px', cursor: 'pointer' }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// Helper to get absolute image URL
function getImageUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('/uploads/')) return `http://localhost:5050${path}`;
  return path;
}

// Helper to get Cloudinary download URL with fl_attachment
function getCloudinaryDownloadUrl(url) {
  if (!url) return '';
  // Only handle Cloudinary URLs
  if (url.includes('res.cloudinary.com')) {
    // Insert /fl_attachment/ after /upload/
    return url.replace('/upload/', '/upload/fl_attachment/');
  }
  return url;
}

// Simple Toast component
function Toast({ message, onClose }) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(onClose, 2000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);
  if (!message) return null;
  return (
    <div style={{
      position: 'fixed',
      top: 24,
      left: '50%',
      transform: 'translateX(-50%)',
      background: '#28a745',
      color: '#fff',
      padding: '12px 32px',
      borderRadius: 8,
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      zIndex: 2000,
      fontWeight: 'bold',
      fontSize: 16
    }}>
      {message}
    </div>
  );
}

const Portfolio = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem('isAdmin') === 'true');
  useEffect(() => {
    const syncAdmin = () => setIsAdmin(localStorage.getItem('isAdmin') === 'true');
    window.addEventListener('storage', syncAdmin);
    window.addEventListener('login', syncAdmin);
    return () => {
      window.removeEventListener('storage', syncAdmin);
      window.removeEventListener('login', syncAdmin);
    };
  }, []);

  // Gallery state
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add Gallery Modal state
  const [addModalOpen, setAddModalOpen] = useState(false);
  // Update Gallery Modal state
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [eventToUpdate, setEventToUpdate] = useState(null);
  // Delete Gallery Confirm state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [toast, setToast] = useState('');
  const [reportOpen, setReportOpen] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState(null);

  const categoryLabels = {
    batch: 'Batch Party',
    social: 'Social Gatherings',
    birthday: 'Birthday Parties',
    cultural: 'Cultural Events',
    other: 'Other Events'
  };

  const fetchReport = async () => {
    setReportLoading(true);
    setReportError(null);
    try {
      const res = await fetch('http://localhost:5050/api/gallery/report');
      if (!res.ok) throw new Error('Failed to fetch report');
      const data = await res.json();
      setReportData(data);
      setReportOpen(true);
    } catch (err) {
      setReportError('Failed to fetch report');
    }
    setReportLoading(false);
  };

  // Fetch galleries from backend
  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:5050/api/gallery')
      .then(res => res.json())
      .then(data => {
        setGalleries(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load galleries');
        setLoading(false);
      });
  }, []);

  // Group galleries by category
  const galleriesByCategory = [
    { key: 'batch', label: 'Batch Party', events: galleries.filter(g => g.category === 'batch') },
    { key: 'social', label: 'Social Gatherings', events: galleries.filter(g => g.category === 'social') },
    { key: 'birthday', label: 'Birthday Parties', events: galleries.filter(g => g.category === 'birthday') },
    { key: 'cultural', label: 'Cultural Events', events: galleries.filter(g => g.category === 'cultural') },
    { key: 'other', label: 'Other Events', events: galleries.filter(g => g.category === 'other') }
  ];
  const allEvents = galleries;

  const displayCategories = [
    { key: 'all', label: 'All Events', events: allEvents },
    ...galleriesByCategory.map(cat => ({ key: cat.key, label: cat.label, events: cat.events }))
  ];
  const displayCategory = displayCategories.find(cat => cat.key === selectedCategory);

  // Lightbox controls
  const openGallery = (event) => {
    setSelectedEvent(event);
    setLightboxIdx(0);
  };
  const closeGallery = () => {
    setSelectedEvent(null);
    setLightboxIdx(0);
  };
  const nextPhoto = useCallback(() => {
    if (!selectedEvent) return;
    setLightboxIdx(idx => (idx + 1) % selectedEvent.photos.length);
  }, [selectedEvent]);
  const prevPhoto = useCallback(() => {
    if (!selectedEvent) return;
    setLightboxIdx(idx => (idx - 1 + selectedEvent.photos.length) % selectedEvent.photos.length);
  }, [selectedEvent]);

  useEffect(() => {
    if (!selectedEvent) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') closeGallery();
      if (e.key === 'ArrowRight') nextPhoto();
      if (e.key === 'ArrowLeft') prevPhoto();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedEvent, nextPhoto, prevPhoto]);

  // For Add Gallery modal, pass only real categories (not 'all')
  const realCategories = [
    { key: 'batch', label: 'Batch Party' },
    { key: 'social', label: 'Social Gatherings' },
    { key: 'birthday', label: 'Birthday Parties' },
    { key: 'cultural', label: 'Cultural Events' },
    { key: 'other', label: 'Other Events' }
  ];

  // Handler for Add Gallery
  const handleAddGallery = async (data) => {
    setLoading(true);
    setError(null);
    setToast('Gallery added successfully');
    setAddModalOpen(false);
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('category', data.category);
      formData.append('cover', data.cover);
      data.files.forEach(file => formData.append('photos', file));
      const res = await fetch('http://localhost:5050/api/gallery', {
        method: 'POST',
        body: formData
      });
      if (!res.ok) throw new Error('Failed to add gallery');
      const newGallery = await res.json();
      setGalleries(prev => [newGallery, ...prev]);
    } catch (err) {
      setError('Failed to add gallery');
    }
    setLoading(false);
  };

  // Handler for Update Gallery
  const handleUpdateGallery = async (data) => {
    if (!eventToUpdate) return;
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('category', data.category);
      if (data.cover) formData.append('cover', data.cover);
      if (data.files && data.files.length > 0) {
        data.files.forEach(file => formData.append('photos', file));
      }
      formData.append('keepPhotos', JSON.stringify(data.keepPhotos));
      const res = await fetch(`http://localhost:5050/api/gallery/${eventToUpdate._id}`, {
        method: 'PUT',
        body: formData
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to update gallery');
      }
      const updatedGallery = await res.json();
      setGalleries(prev => prev.map(g => g._id === updatedGallery._id ? updatedGallery : g));
      setUpdateModalOpen(false);
      setEventToUpdate(null);
    } catch (err) {
      setError(err.message || 'Failed to update gallery');
    }
    setLoading(false);
  };

  // Handler for Delete Gallery
  const handleDeleteGallery = async () => {
    if (!eventToDelete) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:5050/api/gallery/${eventToDelete._id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete gallery');
      setGalleries(prev => prev.filter(g => g._id !== eventToDelete._id));
      setDeleteConfirmOpen(false);
      setEventToDelete(null);
    } catch (err) {
      setError('Failed to delete gallery');
    }
    setLoading(false);
  };

  const handleProxyDownload = async () => {
    if (!selectedEvent) return;
    const url = getImageUrl(selectedEvent.photos[lightboxIdx]);
    const proxyUrl = `http://localhost:5050/api/gallery/download?url=${encodeURIComponent(url)}`;
    try {
      const response = await fetch(proxyUrl);
      if (!response.ok) throw new Error('Failed to fetch image');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = url.split('/').pop().split('?')[0] || 'image.jpg';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      setToast('Failed to download image.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    window.location.reload();
  };

  const handleDownloadPDF = () => {
    if (!reportData.length) return;
    const doc = new jsPDF();
    const months = Array.from(new Set(reportData.map(r => `${r._id.year}-${String(r._id.month).padStart(2, '0')}`))).sort();
    const categories = Object.keys(categoryLabels);
    const lookup = {};
    reportData.forEach(r => {
      const month = `${r._id.year}-${String(r._id.month).padStart(2, '0')}`;
      if (!lookup[month]) lookup[month] = {};
      lookup[month][r._id.category] = r.count;
    });
    // Calculate totals
    const totals = {};
    let grandTotal = 0;
    categories.forEach(cat => {
      totals[cat] = months.reduce((sum, month) => sum + (lookup[month][cat] || 0), 0);
      grandTotal += totals[cat];
    });
    const tableData = months.map(month => [
      month,
      ...categories.map(cat => lookup[month][cat] || 0),
      categories.reduce((sum, cat) => sum + (lookup[month][cat] || 0), 0)
    ]);
    // Add total row
    tableData.push([
      'Total',
      ...categories.map(cat => totals[cat]),
      grandTotal
    ]);
    doc.text('Gallery Available Report', 14, 16);
    autoTable(doc, {
      head: [[
        'Month',
        ...categories.map(cat => categoryLabels[cat]),
        'Total'
      ]],
      body: tableData,
      startY: 22,
      didParseCell: function (data) {
        if (data.row.index === tableData.length - 1) {
          data.cell.styles.fontStyle = 'bold';
        }
      }
    });
    doc.save('gallery_report.pdf');
  };

  return (
    <div className="portfolio-bg">
      <Toast message={toast} onClose={() => setToast('')} />
      {isAdmin && (
        <button
          onClick={fetchReport}
          style={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            zIndex: 5000,
            background: 'linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '14px 36px',
            fontWeight: 'bold',
            fontSize: 20,
            letterSpacing: 1,
            boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
            cursor: 'pointer',
            transition: 'transform 0.15s, box-shadow 0.15s, background 0.15s',
          }}
          onMouseOver={e => {
            e.currentTarget.style.transform = 'scale(1.07)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.22)';
            e.currentTarget.style.background = 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)';
          }}
          onMouseOut={e => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.18)';
            e.currentTarget.style.background = 'linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)';
          }}
        >
          Show Report
        </button>
      )}
      {reportOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.4)', zIndex: 6000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', padding: 32, borderRadius: 8, minWidth: 400, minHeight: 200, position: 'relative' }}>
            <button onClick={() => setReportOpen(false)} style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer' }}>&times;</button>
            <h2>Gallery Available Report</h2>
            <button onClick={handleDownloadPDF} style={{ marginBottom: 12, background: '#28a745', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 20px', fontWeight: 'bold', fontSize: 15, cursor: 'pointer' }}>Download as PDF</button>
            {reportLoading ? (
              <div>Loading...</div>
            ) : reportError ? (
              <div style={{ color: 'red' }}>{reportError}</div>
            ) : (
              <ReportTable data={reportData} categoryLabels={categoryLabels} />
            )}
          </div>
        </div>
      )}
      <AddGalleryModal open={addModalOpen} onClose={() => setAddModalOpen(false)} onSubmit={handleAddGallery} categories={realCategories} />
      <UpdateGalleryModal open={updateModalOpen} onClose={() => { setUpdateModalOpen(false); setEventToUpdate(null); }} onSubmit={handleUpdateGallery} event={eventToUpdate} categories={realCategories} />
      <DeleteGalleryConfirm open={deleteConfirmOpen} onClose={() => { setDeleteConfirmOpen(false); setEventToDelete(null); }} onConfirm={handleDeleteGallery} eventName={eventToDelete?.name} />
      <div className="portfolio-header" style={{ position: 'relative', width: '100%' }}>
        <h1>Event Portfolio</h1>
        <p>Browse our work by event category. Click a category, then an event to see its full gallery.</p>
        {isAdmin && (
          <button
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: '#007bff',
              color: '#fff',
              fontSize: 18,
              border: 'none',
              borderRadius: 20,
              padding: '8px 20px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
            title="Add Gallery"
            onClick={() => setAddModalOpen(true)}
          >
            <span style={{ fontSize: 24, fontWeight: 'bold', lineHeight: 1 }}>+</span>
            <span style={{ fontWeight: 'bold' }}>Add Gallery</span>
          </button>
        )}
      </div>
      <div className="portfolio-categories">
        {displayCategories.map(cat => (
          <button
            key={cat.key}
            className={`portfolio-category-tab${cat.key === selectedCategory ? ' active' : ''}`}
            onClick={() => setSelectedCategory(cat.key)}
          >
            {cat.label}
          </button>
        ))}
      </div>
      {loading ? (
        <div style={{ textAlign: 'center', margin: 40 }}>Loading galleries...</div>
      ) : error ? (
        <div style={{ color: 'red', textAlign: 'center', margin: 40 }}>{error}</div>
      ) : (
        <div className="portfolio-event-grid">
          {displayCategory.events.map((event, idx) => (
            <div className="portfolio-event-card-pro" key={event._id || idx} onClick={() => navigate('/portfolio/event', { state: { event } })}>
              <div className="portfolio-event-card-imgwrap">
                <img src={getImageUrl(event.cover)} alt={event.name} className="portfolio-event-card-img" />
              </div>
              <div className="portfolio-event-card-info">
                <h3 className="portfolio-event-card-title">{event.name}</h3>
                <p className="portfolio-event-card-desc">{event.description}</p>
                <button className="portfolio-event-new-btn" onClick={e => e.stopPropagation()}>New</button>
                {isAdmin && (
                  <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                    <button
                      style={{ background: '#ffc107', color: '#222', border: 'none', borderRadius: 4, padding: '4px 12px', cursor: 'pointer' }}
                      onClick={e => { e.stopPropagation(); setEventToUpdate(event); setUpdateModalOpen(true); }}
                    >Update</button>
                    <button
                      style={{ background: '#dc3545', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 12px', cursor: 'pointer' }}
                      onClick={e => { e.stopPropagation(); setEventToDelete(event); setDeleteConfirmOpen(true); }}
                    >Delete</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {selectedEvent && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.8)',
          zIndex: 3000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column'
        }}>
          <button onClick={closeGallery} style={{ position: 'absolute', top: 24, right: 32, background: 'none', border: 'none', color: '#fff', fontSize: 32, cursor: 'pointer', zIndex: 3100 }}>&times;</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <button onClick={prevPhoto} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 40, cursor: 'pointer' }}>&#8592;</button>
            <div style={{ position: 'relative' }}>
              <img
                src={getImageUrl(selectedEvent.photos[lightboxIdx])}
                alt="gallery"
                style={{ maxWidth: '70vw', maxHeight: '70vh', borderRadius: 8, boxShadow: '0 2px 16px rgba(0,0,0,0.5)' }}
              />
            </div>
            <button onClick={nextPhoto} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 40, cursor: 'pointer' }}>&#8594;</button>
          </div>
          <div style={{ color: '#fff', marginTop: 16, fontSize: 18 }}>
            {selectedEvent.name} ({lightboxIdx + 1} / {selectedEvent.photos.length})
          </div>
        </div>
      )}
    </div>
  );
};

export default Portfolio;

function ReportTable({ data, categoryLabels }) {
  // Build a set of all months and all categories
  const months = Array.from(new Set(data.map(r => `${r._id.year}-${String(r._id.month).padStart(2, '0')}`))).sort();
  const categories = Object.keys(categoryLabels);
  // Build a lookup: {month: {category: count}}
  const lookup = {};
  data.forEach(r => {
    const month = `${r._id.year}-${String(r._id.month).padStart(2, '0')}`;
    if (!lookup[month]) lookup[month] = {};
    lookup[month][r._id.category] = r.count;
  });
  // Calculate totals
  const totals = {};
  let grandTotal = 0;
  categories.forEach(cat => {
    totals[cat] = months.reduce((sum, month) => sum + (lookup[month][cat] || 0), 0);
    grandTotal += totals[cat];
  });
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
      <thead>
        <tr>
          <th style={{ border: '1px solid #ccc', padding: 8 }}>Month</th>
          {categories.map(cat => (
            <th key={cat} style={{ border: '1px solid #ccc', padding: 8 }}>{categoryLabels[cat]}</th>
          ))}
          <th style={{ border: '1px solid #ccc', padding: 8 }}>Total</th>
        </tr>
      </thead>
      <tbody>
        {months.map(month => (
          <tr key={month}>
            <td style={{ border: '1px solid #ccc', padding: 8 }}>{month}</td>
            {categories.map(cat => (
              <td key={cat} style={{ border: '1px solid #ccc', padding: 8, textAlign: 'center' }}>{lookup[month][cat] || 0}</td>
            ))}
            <td style={{ border: '1px solid #ccc', padding: 8, textAlign: 'center', fontWeight: 'bold' }}>{categories.reduce((sum, cat) => sum + (lookup[month][cat] || 0), 0)}</td>
          </tr>
        ))}
        <tr style={{ background: '#f7f7f7', fontWeight: 'bold' }}>
          <td style={{ border: '1px solid #ccc', padding: 8 }}>Total</td>
          {categories.map(cat => (
            <td key={cat} style={{ border: '1px solid #ccc', padding: 8, textAlign: 'center' }}>{totals[cat]}</td>
          ))}
          <td style={{ border: '1px solid #ccc', padding: 8, textAlign: 'center', fontWeight: 'bold' }}>{grandTotal}</td>
        </tr>
      </tbody>
    </table>
  );
} 