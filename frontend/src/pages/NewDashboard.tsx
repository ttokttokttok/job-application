import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { JobApplication } from '../types/models';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: any;
}

export default function NewDashboard() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationStage, setConversationStage] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeDashboard();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeDashboard = async () => {
    // Get or create user ID
    let uid = localStorage.getItem('userId');
    if (!uid) {
      uid = 'user_' + Date.now();
      localStorage.setItem('userId', uid);
    }
    setUserId(uid);

    // Load conversation history
    try {
      const convResponse = await apiClient.getConversation(uid);
      if (convResponse.success) {
        setMessages(convResponse.messages || []);
        if (convResponse.state) {
          setConversationStage(convResponse.state.stage);
        }
      }

      // If no conversation exists, initialize with greeting
      if (!convResponse.messages || convResponse.messages.length === 0) {
        const profileData = localStorage.getItem('profileData');
        if (profileData) {
          const initResponse = await apiClient.initializeConversation(uid, JSON.parse(profileData));
          if (initResponse.success && initResponse.greeting) {
            setMessages([{
              id: '1',
              role: 'assistant',
              content: initResponse.greeting,
              timestamp: new Date()
            }]);
            setConversationStage(initResponse.state.stage);
          }
        }
      }

      // Load applications
      await loadApplications(uid);
    } catch (error) {
      console.error('Dashboard initialization error:', error);
    }
  };

  const loadApplications = async (uid: string) => {
    try {
      const response = await apiClient.getApplications(uid);
      if (response.success) {
        setApplications(response.applications || []);
      }
    } catch (error) {
      console.error('Failed to load applications:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await apiClient.sendMessage(userId, inputMessage);

      if (response.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.response,
          timestamp: new Date(),
          metadata: response.metadata
        };

        setMessages(prev => [...prev, assistantMessage]);
        setConversationStage(response.state.stage);

        // If we're at the job_search stage, reload applications
        if (response.state.stage === 'job_review' || response.state.stage === 'application') {
          await loadApplications(userId);
        }

        // Handle pending actions automatically
        if (response.metadata?.pendingAction) {
          setTimeout(async () => {
            await handlePendingAction(response.metadata.pendingAction);
          }, 1000);
        }
      }
    } catch (error: any) {
      console.error('Send message error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handlePendingAction = async (action: string) => {
    console.log('Handling pending action:', action);

    // Send a follow-up message to trigger the pending action
    let followUpMessage = '';

    switch (action) {
      case 'job_search':
        followUpMessage = 'Please search for jobs now';
        break;
      case 'generate_cover_letters':
        followUpMessage = 'Please generate cover letters';
        break;
      case 'search_contacts':
        followUpMessage = 'Please search for contacts';
        break;
      default:
        return;
    }

    if (!followUpMessage) return;

    setLoading(true);

    try {
      const response = await apiClient.sendMessage(userId, followUpMessage);

      if (response.success) {
        const assistantMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: response.response,
          timestamp: new Date(),
          metadata: response.metadata
        };

        setMessages(prev => [...prev, assistantMessage]);
        setConversationStage(response.state.stage);

        // Reload applications if needed
        if (response.state.stage === 'job_review' || response.state.stage === 'application') {
          await loadApplications(userId);
        }
      }
    } catch (error) {
      console.error('Pending action error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#f5f5f5'
    }}>
      {/* Header */}
      <div style={{
        padding: '1rem 2rem',
        backgroundColor: 'white',
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ fontSize: '1.5rem', margin: 0 }}>JobAgent Dashboard</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/profile')}
          >
            Edit Profile
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        overflow: 'hidden'
      }}>
        {/* Chat Area */}
        <div style={{
          flex: '1',
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid #e0e0e0',
          backgroundColor: 'white'
        }}>
          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div
                  style={{
                    maxWidth: '70%',
                    padding: '1rem',
                    borderRadius: '12px',
                    backgroundColor: msg.role === 'user' ? '#dc2626' : '#f0f0f0',
                    color: msg.role === 'user' ? 'white' : 'black'
                  }}
                >
                  <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                  <div style={{
                    fontSize: '0.75rem',
                    marginTop: '0.5rem',
                    opacity: 0.7
                  }}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  padding: '1rem',
                  borderRadius: '12px',
                  backgroundColor: '#f0f0f0'
                }}>
                  <div className="spinner"></div>
                  <span style={{ marginLeft: '0.5rem' }}>Agent is thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{
            padding: '1rem',
            borderTop: '1px solid #e0e0e0',
            backgroundColor: 'white'
          }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message here..."
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0',
                  fontSize: '1rem',
                  resize: 'none',
                  fontFamily: 'inherit'
                }}
                rows={2}
              />
              <button
                onClick={handleSendMessage}
                disabled={loading || !inputMessage.trim()}
                className="btn btn-primary"
                style={{ alignSelf: 'flex-end', minWidth: '100px' }}
              >
                Send
              </button>
            </div>
            <div style={{
              marginTop: '0.5rem',
              fontSize: '0.875rem',
              color: '#666'
            }}>
              Stage: {conversationStage.replace(/_/g, ' ')}
            </div>
          </div>
        </div>

        {/* Applications Sidebar */}
        <div style={{
          width: '400px',
          overflowY: 'auto',
          padding: '1.5rem',
          backgroundColor: '#fafafa'
        }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
            Applications ({applications.length})
          </h2>

          {applications.length === 0 ? (
            <div style={{
              padding: '2rem',
              textAlign: 'center',
              color: '#666'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💼</div>
              <p>No applications yet</p>
              <p style={{ fontSize: '0.875rem' }}>
                Chat with the agent to start your job search!
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {applications.map(app => (
                <div
                  key={app.id}
                  className="card card-white"
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/application/${app.id}`)}
                >
                  <div style={{ marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                      {app.jobTitle}
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>
                      {app.company}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#999' }}>
                      {app.location}
                    </p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className={`badge badge-${app.status}`} style={{ fontSize: '0.75rem' }}>
                      {app.status}
                    </span>
                    {app.networkingContacts && app.networkingContacts.length > 0 && (
                      <span style={{ fontSize: '0.75rem', color: '#666' }}>
                        👥 {app.networkingContacts.length} contacts
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
