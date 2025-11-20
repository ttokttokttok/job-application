import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';

export default function ResumeUpload() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a PDF or DOCX file');
      return;
    }
    setFile(file);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.uploadResume(file);

      if (response.success) {
        // Store parsed data in localStorage to pass to profile form
        localStorage.setItem('parsedResume', JSON.stringify(response.parsedData));
        navigate('/profile');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to upload resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    navigate('/profile');
  };

  return (
    <div className="container">
      <div style={{ maxWidth: '600px', margin: '3rem auto' }}>
        <h1 style={{ marginBottom: '1rem', fontSize: '2rem' }}>Upload Your Resume</h1>
        <p style={{ marginBottom: '2rem', color: '#666' }}>
          Upload your resume and we'll extract your information automatically
        </p>

        {error && <div className="error">{error}</div>}

        <div
          className={`card ${dragActive ? 'card-white' : ''}`}
          style={{
            border: dragActive ? '2px dashed #dc2626' : '2px dashed #e0e0e0',
            padding: '3rem',
            textAlign: 'center',
            cursor: 'pointer',
          }}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById('fileInput')?.click()}
        >
          <input
            id="fileInput"
            type="file"
            accept=".pdf,.docx"
            onChange={handleChange}
            style={{ display: 'none' }}
          />

          {file ? (
            <>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
              <p style={{ fontWeight: '500', marginBottom: '0.5rem' }}>{file.name}</p>
              <p style={{ color: '#666', fontSize: '0.875rem' }}>
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </>
          ) : (
            <>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📎</div>
              <p style={{ fontWeight: '500', marginBottom: '0.5rem' }}>
                Drop your resume here or click to browse
              </p>
              <p style={{ color: '#666', fontSize: '0.875rem' }}>
                Supports PDF and DOCX files
              </p>
            </>
          )}
        </div>

        <div className="flex gap-2 mt-3">
          <button
            className="btn btn-primary"
            onClick={handleUpload}
            disabled={!file || loading}
            style={{ flex: 1 }}
          >
            {loading ? 'Uploading...' : 'Upload & Continue'}
          </button>
          <button
            className="btn btn-secondary"
            onClick={handleSkip}
            disabled={loading}
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}
