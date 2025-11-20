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

  useEffect(() => {
    const parsedResume = localStorage.getItem('parsedResume');
    if (parsedResume) {
      const data = JSON.parse(parsedResume);
      setFormData(prev => ({ ...prev, ...data }));
      localStorage.removeItem('parsedResume');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.createProfile(formData);

      if (response.success) {
        localStorage.setItem('profileId', response.profileId);
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
