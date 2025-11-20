import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { UserProfile, WorkExperience, Education } from '../types/models';

export default function ProfileForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    workExperience: [] as WorkExperience[],
    education: [] as Education[],
    skills: [] as string[],
    desiredPosition: '',
    locations: [] as string[],
    currentLocation: '',
  });

  const [skillInput, setSkillInput] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [editingExpIndex, setEditingExpIndex] = useState<number | null>(null);
  const [expForm, setExpForm] = useState({
    company: '',
    title: '',
    startDate: '',
    endDate: '',
    description: '',
    highlights: [] as string[]
  });
  const [highlightInput, setHighlightInput] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      // First check if we have an existing profile ID
      const profileId = localStorage.getItem('profileId');
      if (profileId) {
        try {
          const response = await apiClient.getProfile(profileId);
          if (response.success && response.profile) {
            setFormData({
              fullName: response.profile.fullName || '',
              email: response.profile.email || '',
              phone: response.profile.phone || '',
              workExperience: response.profile.workExperience || [],
              education: response.profile.education || [],
              skills: response.profile.skills || [],
              desiredPosition: response.profile.desiredPosition || '',
              locations: response.profile.locations || [],
              currentLocation: response.profile.currentLocation || '',
            });
            return;
          }
        } catch (err) {
          console.error('Failed to load profile:', err);
        }
      }

      // If no existing profile, check for parsed resume data
      const parsedResume = localStorage.getItem('parsedResume');
      if (parsedResume) {
        const data = JSON.parse(parsedResume);
        setFormData(prev => ({ ...prev, ...data }));
        localStorage.removeItem('parsedResume');
      }
    };

    loadProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const profileId = localStorage.getItem('profileId');
      let response;

      if (profileId) {
        // Update existing profile
        response = await apiClient.updateProfile(profileId, formData);
      } else {
        // Create new profile
        response = await apiClient.createProfile(formData);
        if (response.success && response.profileId) {
          localStorage.setItem('profileId', response.profileId);
        }
      }

      if (response.success) {
        setSuccess(true);
        setTimeout(() => navigate('/dashboard'), 1500);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const addLocation = () => {
    if (locationInput.trim() && !formData.locations.includes(locationInput.trim())) {
      setFormData(prev => ({
        ...prev,
        locations: [...prev.locations, locationInput.trim()]
      }));
      setLocationInput('');
    }
  };

  const removeLocation = (location: string) => {
    setFormData(prev => ({
      ...prev,
      locations: prev.locations.filter(l => l !== location)
    }));
  };

  const addOrUpdateExperience = () => {
    if (!expForm.company.trim() || !expForm.title.trim()) {
      return;
    }

    if (editingExpIndex !== null) {
      // Update existing experience
      setFormData(prev => ({
        ...prev,
        workExperience: prev.workExperience.map((exp, idx) =>
          idx === editingExpIndex ? { ...expForm } : exp
        )
      }));
    } else {
      // Add new experience
      setFormData(prev => ({
        ...prev,
        workExperience: [...prev.workExperience, { ...expForm }]
      }));
    }

    // Reset form
    setExpForm({
      company: '',
      title: '',
      startDate: '',
      endDate: '',
      description: '',
      highlights: []
    });
    setEditingExpIndex(null);
  };

  const editExperience = (index: number) => {
    setExpForm(formData.workExperience[index]);
    setEditingExpIndex(index);
  };

  const removeExperience = (index: number) => {
    setFormData(prev => ({
      ...prev,
      workExperience: prev.workExperience.filter((_, idx) => idx !== index)
    }));
  };

  const cancelEditExperience = () => {
    setExpForm({
      company: '',
      title: '',
      startDate: '',
      endDate: '',
      description: '',
      highlights: []
    });
    setEditingExpIndex(null);
  };

  const addHighlight = () => {
    if (highlightInput.trim() && !expForm.highlights.includes(highlightInput.trim())) {
      setExpForm(prev => ({
        ...prev,
        highlights: [...prev.highlights, highlightInput.trim()]
      }));
      setHighlightInput('');
    }
  };

  const removeHighlight = (highlight: string) => {
    setExpForm(prev => ({
      ...prev,
      highlights: prev.highlights.filter(h => h !== highlight)
    }));
  };

  return (
    <div className="container">
      <div style={{ maxWidth: '800px', margin: '2rem auto' }}>
        <h1 style={{ marginBottom: '0.5rem', fontSize: '2rem' }}>Your Profile</h1>
        <p style={{ marginBottom: '2rem', color: '#666' }}>
          Review and complete your profile information
        </p>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">Profile saved successfully! Redirecting...</div>}

        <form onSubmit={handleSubmit}>
          <div className="card">
            <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Personal Information</h2>

            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="input"
                value={formData.fullName}
                onChange={e => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                required
              />
            </div>

            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  className="input"
                  value={formData.email}
                  onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone *</label>
                <input
                  type="tel"
                  className="input"
                  value={formData.phone}
                  onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  required
                />
              </div>
            </div>
          </div>

          <div className="card">
            <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Work Experience</h2>

            {/* Add/Edit Form */}
            <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f8f8f8', borderRadius: '8px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>
                {editingExpIndex !== null ? 'Edit Experience' : 'Add New Experience'}
              </h3>

              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">Company *</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g., Google"
                    value={expForm.company}
                    onChange={e => setExpForm(prev => ({ ...prev, company: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Job Title *</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g., Software Engineer"
                    value={expForm.title}
                    onChange={e => setExpForm(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g., 2020-01"
                    value={expForm.startDate}
                    onChange={e => setExpForm(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g., 2022-05 or Present"
                    value={expForm.endDate}
                    onChange={e => setExpForm(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="input"
                  rows={3}
                  placeholder="Brief description of your role..."
                  value={expForm.description}
                  onChange={e => setExpForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Highlights/Achievements</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    className="input"
                    placeholder="Add a highlight or achievement"
                    value={highlightInput}
                    onChange={e => setHighlightInput(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addHighlight())}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={addHighlight}
                  >
                    Add
                  </button>
                </div>

                <ul style={{ paddingLeft: '1.5rem' }}>
                  {expForm.highlights.map((highlight, idx) => (
                    <li key={idx} style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{highlight}</span>
                      <button
                        type="button"
                        onClick={() => removeHighlight(highlight)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#dc2626',
                          fontWeight: 'bold',
                          fontSize: '1.2rem'
                        }}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={addOrUpdateExperience}
                >
                  {editingExpIndex !== null ? 'Update Experience' : 'Add Experience'}
                </button>
                {editingExpIndex !== null && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={cancelEditExperience}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>

            {/* List of Experiences */}
            {formData.workExperience.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {formData.workExperience.map((exp, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '1rem',
                      backgroundColor: '#f8f8f8',
                      borderRadius: '8px',
                      borderLeft: '4px solid #2563eb'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                          {exp.title}
                        </h3>
                        <p style={{ fontSize: '1rem', color: '#2563eb', marginBottom: '0.25rem' }}>
                          {exp.company}
                        </p>
                        <p style={{ fontSize: '0.9rem', color: '#666' }}>
                          {exp.startDate} - {exp.endDate}
                        </p>

                        {exp.description && (
                          <p style={{ marginTop: '0.75rem', color: '#333', lineHeight: '1.6' }}>
                            {exp.description}
                          </p>
                        )}

                        {exp.highlights && exp.highlights.length > 0 && (
                          <ul style={{
                            marginTop: '0.75rem',
                            paddingLeft: '1.5rem',
                            color: '#333',
                            lineHeight: '1.6'
                          }}>
                            {exp.highlights.map((highlight, hIndex) => (
                              <li key={hIndex} style={{ marginBottom: '0.25rem' }}>
                                {highlight}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <div className="flex gap-1" style={{ marginLeft: '1rem' }}>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => editExperience(index)}
                          style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => removeExperience(index)}
                          style={{
                            background: '#dc2626',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '0.5rem 0.75rem',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: '500'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Skills</h2>

            <div className="flex gap-2 mb-2">
              <input
                type="text"
                className="input"
                placeholder="Add a skill (e.g., Python, React)"
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={addSkill}
              >
                Add
              </button>
            </div>

            <div className="flex gap-1" style={{ flexWrap: 'wrap' }}>
              {formData.skills.map(skill => (
                <span
                  key={skill}
                  style={{
                    backgroundColor: '#f8f8f8',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#dc2626',
                      fontWeight: 'bold'
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Job Preferences</h2>

            <div className="form-group">
              <label className="form-label">Desired Position *</label>
              <input
                type="text"
                className="input"
                placeholder="e.g., Software Engineer, Product Manager"
                value={formData.desiredPosition}
                onChange={e => setFormData(prev => ({ ...prev, desiredPosition: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Current Location *</label>
              <input
                type="text"
                className="input"
                placeholder="e.g., San Francisco, CA"
                value={formData.currentLocation}
                onChange={e => setFormData(prev => ({ ...prev, currentLocation: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Preferred Job Locations *</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  className="input"
                  placeholder="Add a location (e.g., New York, Remote)"
                  value={locationInput}
                  onChange={e => setLocationInput(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addLocation())}
                />
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={addLocation}
                >
                  Add
                </button>
              </div>

              <div className="flex gap-1" style={{ flexWrap: 'wrap' }}>
                {formData.locations.map(location => (
                  <span
                    key={location}
                    style={{
                      backgroundColor: '#f8f8f8',
                      padding: '0.5rem 1rem',
                      borderRadius: '20px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    {location}
                    <button
                      type="button"
                      onClick={() => removeLocation(location)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#dc2626',
                        fontWeight: 'bold'
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? 'Saving...' : 'Save Profile & Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
