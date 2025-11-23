import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { JobApplication } from '../types/models';

export default function Dashboard() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadApplications();

    // Auto-refresh every 3 seconds to update statuses in real-time
    const interval = setInterval(() => {
      loadApplications();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const loadApplications = async () => {
    const profileId = localStorage.getItem('profileId');
    if (!profileId) {
      navigate('/');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.getApplications(profileId);
      if (response.success) {
        setApplications(response.applications || []);
      }
    } catch (err: any) {
      setError('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchAndApply = async () => {
    const profileId = localStorage.getItem('profileId');
    if (!profileId) return;

    setSearching(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await apiClient.searchAndApply(profileId);
      if (response.success) {
        setSuccess(`Found ${response.jobsFound} jobs and submitted ${response.applicationsSubmitted} applications!`);
        await loadApplications();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to search and apply for jobs');
    } finally {
      setSearching(false);
    }
  };

  const handleReachOut = async (applicationId: string) => {
    try {
      const response = await apiClient.reachOut(applicationId, 5);
      if (response.success) {
        alert(`Reached out to ${response.contactsReachedOut.length} people!`);
        await loadApplications();
      }
    } catch (err: any) {
      alert('Failed to reach out to contacts');
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p className="mt-2">Loading applications...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="flex justify-between items-center mb-4">
        <h1 style={{ fontSize: '2rem' }}>Applications Dashboard</h1>
        <button
          className="btn btn-primary"
          onClick={handleSearchAndApply}
          disabled={searching}
        >
          {searching ? 'Searching...' : '🔍 Start Job Search'}
        </button>
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      {applications.length === 0 ? (
        <div className="card text-center" style={{ padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💼</div>
          <h2 style={{ marginBottom: '0.5rem' }}>No Applications Yet</h2>
          <p style={{ color: '#666', marginBottom: '1.5rem' }}>
            Click "Start Job Search" to automatically find and apply to jobs
          </p>
        </div>
      ) : (
        <div className="grid">
          {applications.map(app => (
            <div key={app.id} className="card card-white">
              <div className="flex justify-between items-start mb-2">
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                    {app.jobTitle}
                  </h3>
                  <p style={{ fontWeight: '500', marginBottom: '0.25rem' }}>
                    {app.company}
                  </p>
                  <p style={{ color: '#666', fontSize: '0.875rem' }}>
                    {app.location}
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                  <span className={`badge badge-${app.status}`}>
                    {app.status}
                  </span>
                  {app.salary && (
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: '#16a34a',
                      padding: '0.25rem 0.5rem',
                      backgroundColor: '#f0fdf4',
                      borderRadius: '4px'
                    }}>
                      {app.salary}
                    </span>
                  )}
                </div>
              </div>

              {/* Detailed Job Info - Only show if we have it */}
              {(app.requirements || app.responsibilities || app.skills) && (
                <div style={{
                  marginTop: '1rem',
                  marginBottom: '1rem',
                  padding: '0.75rem',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '6px',
                  fontSize: '0.75rem'
                }}>
                  {app.requirements && app.requirements.length > 0 && (
                    <div style={{ marginBottom: '0.5rem' }}>
                      <strong style={{ color: '#374151' }}>Requirements:</strong>
                      <span style={{ color: '#6b7280', marginLeft: '0.5rem' }}>
                        {app.requirements.slice(0, 2).join(' • ')}
                        {app.requirements.length > 2 && ` +${app.requirements.length - 2} more`}
                      </span>
                    </div>
                  )}
                  {app.skills && app.skills.length > 0 && (
                    <div>
                      <strong style={{ color: '#374151' }}>Skills:</strong>
                      <div style={{ marginTop: '0.25rem', display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                        {app.skills.slice(0, 5).map((skill, i) => (
                          <span key={i} style={{
                            padding: '0.125rem 0.5rem',
                            backgroundColor: '#e5e7eb',
                            borderRadius: '10px',
                            fontSize: '0.7rem'
                          }}>
                            {skill}
                          </span>
                        ))}
                        {app.skills.length > 5 && (
                          <span style={{ color: '#6b7280', fontSize: '0.7rem', alignSelf: 'center' }}>
                            +{app.skills.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Cover Letter Status */}
              {app.coverLetterStatus && (
                <div style={{ marginBottom: '1rem', fontSize: '0.75rem' }}>
                  <span style={{
                    color: app.coverLetterStatus === 'approved' ? '#16a34a' : '#ea580c',
                    fontWeight: '500'
                  }}>
                    Cover Letter: {app.coverLetterStatus}
                  </span>
                </div>
              )}

              {/* Applied Date */}
              <p style={{ color: '#999', fontSize: '0.75rem', marginBottom: '1rem' }}>
                {app.status === 'applied'
                  ? `Applied: ${new Date(app.appliedAt).toLocaleDateString()}`
                  : `Created: ${new Date(app.appliedAt).toLocaleDateString()}`
                }
              </p>

              {app.networkingContacts && app.networkingContacts.length > 0 && (
                <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#f0f9ff', borderRadius: '6px' }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                    Networking: {app.networkingContacts.length} contacts
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#666' }}>
                    {app.networkingContacts.filter(c => c.status === 'responded').length} responded
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  className="btn btn-secondary"
                  onClick={() => navigate(`/application/${app.id}`)}
                  style={{ flex: 1 }}
                >
                  View Details
                </button>
                {app.status === 'applied' && (!app.networkingContacts || app.networkingContacts.length === 0) && (
                  <button
                    className="btn btn-primary"
                    onClick={() => handleReachOut(app.id)}
                  >
                    Reach Out
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
