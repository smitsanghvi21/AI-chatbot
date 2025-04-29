import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [url, setUrl] = useState('');
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setError('');

    // Add user message to chat
    const userMessage = { type: 'user', content: question };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await axios.post('http://localhost:5001/chatbot', {
        url,
        question
      });

      if (response.data.error) {
        setError(response.data.error);
        setMessages(prev => [...prev, { type: 'error', content: response.data.error }]);
      } else {
        setMessages(prev => [...prev, { type: 'assistant', content: response.data.answer }]);
      }
    } catch (err) {
      console.error('Error:', err);
      const errorMessage = err.code === 'ERR_NETWORK' 
        ? 'Unable to connect to the server. Please make sure the backend is running.'
        : err.response?.data?.error || 'An error occurred while processing your request. Please try again.';
      setError(errorMessage);
      setMessages(prev => [...prev, { type: 'error', content: errorMessage }]);
    } finally {
      setLoading(false);
      setQuestion('');
    }
  };

  const handleFollowUp = (question) => {
    setQuestion(question);
  };

  return (
    <div className="container-fluid h-100">
      <div className="row h-100">
        {/* Sidebar */}
        <div className="col-md-3 sidebar p-3">
          <h3 className="text-center mb-4">Webpage Q&A</h3>
          <div className="mb-3">
            <label htmlFor="url" className="form-label">Website URL</label>
            <input
              type="url"
              className="form-control"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Suggested Questions</label>
            <div className="list-group">
              <button 
                className="list-group-item list-group-item-action"
                onClick={() => handleFollowUp("What is the purpose of this website?")}
              >
                What is the purpose of this website?
              </button>
              <button 
                className="list-group-item list-group-item-action"
                onClick={() => handleFollowUp("What are the contact details?")}
              >
                What are the contact details?
              </button>
              <button 
                className="list-group-item list-group-item-action"
                onClick={() => handleFollowUp("What courses or programs are offered?")}
              >
                What courses or programs are offered?
              </button>
              <button 
                className="list-group-item list-group-item-action"
                onClick={() => handleFollowUp("What are the fees and payment options?")}
              >
                What are the fees and payment options?
              </button>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="col-md-9 chat-area p-0">
          <div className="chat-messages p-3">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`message ${message.type} ${message.type === 'user' ? 'text-end' : 'text-start'}`}
              >
                <div className="message-content">
                  {message.content}
                </div>
                {message.type === 'assistant' && (
                  <div className="follow-up-questions mt-2">
                    <button 
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() => handleFollowUp("Can you provide more details about this?")}
                    >
                      More details
                    </button>
                    <button 
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() => handleFollowUp("What are the requirements?")}
                    >
                      Requirements
                    </button>
                    <button 
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => handleFollowUp("How can I apply?")}
                    >
                      How to apply
                    </button>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="chat-input p-3">
            <form onSubmit={handleSubmit} className="d-flex">
              <input
                type="text"
                className="form-control me-2"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Type your question..."
                disabled={loading}
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Processing...
                  </>
                ) : (
                  'Send'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App; 