import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { JobApplication, NetworkingContact } from '../types/models';

export default function ApplicationDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [application, setApplication] = useState<JobApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [showCoverLetter, setShowCoverLetter] = useState(false);
  const [startingInterview, setStartingInterview] = useState(false);

  useEffect(() => {
    loadApplication();
  }, [id]);

  const loadApplication = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const response = await apiClient.getApplication(id);
      if (response.success) {
        setApplication(response.application);
      }
    } catch (err) {
      alert('Failed to load application');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckResponses = async () => {
    if (!application?.networkingContacts) return;

    setChecking(true);
    try {
      const contactIds = application.networkingContacts.map(c => c.id);
      const response = await apiClient.checkResponses(contactIds);

      if (response.success) {
        await loadApplication();
        alert('Responses updated!');
      }
    } catch (err) {
      alert('Failed to check responses');
    } finally {
      setChecking(false);
    }
  };

  const handleInterviewPractice = async () => {
    if (!application || !id) return;

    const phoneNumber = prompt('Enter your phone number to start interview practice:\n(Format: +1234567890)');
    if (!phoneNumber) return;

    setStartingInterview(true);
    try {
      const response = await apiClient.startInterviewPractice(id, phoneNumber);
      if (response.success) {
        alert(`Interview practice call started! You will receive a call shortly for ${application.jobTitle} at ${application.company}.`);
      }
    } catch (err: any) {
      alert(`Failed to start interview practice: ${err.response?.data?.error || err.message}`);
    } finally {
      setStartingInterview(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p className="mt-2">Loading application...</p>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="container">
        <div className="card text-center">
          <p>Application not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="flex gap-2 mb-3">
        <button
          className="btn btn-secondary"
          onClick={() => navigate('/dashboard')}
        >
          ← Back to Dashboard
        </button>
        <button
          className="btn btn-primary"
          onClick={handleInterviewPractice}
          disabled={startingInterview}
        >
          {startingInterview ? '📞 Starting Call...' : '📞 Practice Interview'}
        </button>
      </div>

      <div className="card card-white">
        <div className="flex justify-between items-center mb-3">
          <h1 style={{ fontSize: '2rem' }}>{application.jobTitle}</h1>
          <span className={`badge badge-${application.status}`}>
            {application.status}
          </span>
        </div>

        <div className="mb-3">
          <p style={{ fontSize: '1.25rem', fontWeight: '500', marginBottom: '0.25rem' }}>
            {application.company}
          </p>
          <p style={{ color: '#666' }}>{application.location}</p>
        </div>

        <div className="mb-3">
          <p style={{ color: '#666', fontSize: '0.875rem' }}>
            Applied: {new Date(application.appliedAt).toLocaleDateString()}
          </p>
          <a
            href={application.jobUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#dc2626', textDecoration: 'none', fontSize: '0.875rem' }}
          >
            View Job Posting →
          </a>
        </div>

        <div className="mb-3">
          <h3 style={{ marginBottom: '0.5rem', fontSize: '1.125rem' }}>Job Description</h3>
          <p style={{ color: '#333', lineHeight: '1.6' }}>{application.jobDescription}</p>
        </div>

        {application.requirements && application.requirements.length > 0 && (
          <div className="mb-3">
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.125rem' }}>Requirements</h3>
            <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.8' }}>
              {application.requirements.map((req, idx) => (
                <li key={idx}>{req}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mb-3">
          <button
            className="btn btn-secondary"
            onClick={() => setShowCoverLetter(!showCoverLetter)}
            style={{ width: '100%', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <span>Cover Letter</span>
            <span>{showCoverLetter ? '▼' : '▶'}</span>
          </button>
          {showCoverLetter && (
            <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f8f8f8', borderRadius: '6px' }}>
              <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8' }}>
                {application.coverLetter}
              </p>
            </div>
          )}
        </div>
      </div>

      {application.networkingContacts && application.networkingContacts.length > 0 && (
        <div className="card card-white mt-3">
          <div className="flex justify-between items-center mb-3">
            <h2 style={{ fontSize: '1.5rem' }}>Networking Contacts</h2>
            <button
              className="btn btn-primary"
              onClick={handleCheckResponses}
              disabled={checking}
            >
              {checking ? 'Checking...' : 'Check Responses'}
            </button>
          </div>

          <div className="grid">
            {application.networkingContacts.map((contact: NetworkingContact) => (
              <div key={contact.id} className="card" style={{ backgroundColor: '#f8f8f8' }}>
                <div className="flex justify-between items-center mb-2">
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600' }}>
                    {contact.name}
                  </h3>
                  <div className="flex gap-1">
                    <span className={`badge badge-${contact.status}`}>
                      {contact.status.replace('_', ' ')}
                    </span>
                    <span className="badge" style={{ backgroundColor: '#e0e0e0', color: '#000' }}>
                      {contact.connectionDegree}
                    </span>
                  </div>
                </div>

                <p style={{ fontWeight: '500', marginBottom: '0.25rem' }}>
                  {contact.title}
                </p>
                {contact.description && (
                  <p style={{ color: '#666', fontSize: '0.875rem', marginBottom: '1rem' }}>
                    {contact.description}
                  </p>
                )}

                <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#ffffff', borderRadius: '6px' }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                    Message Sent:
                  </p>
                  <p style={{ fontSize: '0.875rem', color: '#333', fontStyle: 'italic' }}>
                    "{contact.messageText}"
                  </p>
                </div>

                {contact.responseText && (
                  <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#dcfce7', borderRadius: '6px' }}>
                    <p style={{ fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: '#16a34a' }}>
                      Response:
                    </p>
                    <p style={{ fontSize: '0.875rem', color: '#000' }}>
                      "{contact.responseText}"
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <a
                    href={contact.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                    style={{ flex: 1, textAlign: 'center', textDecoration: 'none' }}
                  >
                    View Profile
                  </a>
                  {contact.messagingThreadUrl && (
                    <a
                      href={contact.messagingThreadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary"
                      style={{ textDecoration: 'none' }}
                    >
                      Message
                    </a>
                  )}
                </div>

                <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.75rem' }}>
                  Sent: {new Date(contact.sentAt).toLocaleDateString()}
                  {contact.lastCheckedAt && (
                    <> • Last checked: {new Date(contact.lastCheckedAt).toLocaleDateString()}</>
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
