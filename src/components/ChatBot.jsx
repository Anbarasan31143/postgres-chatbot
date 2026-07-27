import React, { useState, useRef, useEffect } from 'react';
import './ChatBot.css';

const ChatBot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "👋 Hello! I'm your Employee Assistant. Try saying:\n\n\"Add/Create/Register employee John Doe from IT department \" \n\n\"Update/Modify/Edit employee ID 4521's department to Finance \" \n\n\"Find/show/Retrive/Get employee ID 123456 \"",
      sender: 'bot',
      type: 'info'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: input,
      sender: 'user',
      type: 'normal'
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input })
      });

      const data = await response.json();

      let botResponse = {
        id: messages.length + 2,
        sender: 'bot',
        type: 'normal'
      };

      if (data.status === 'success') {
        botResponse.type = 'success';
        let text = `✅ ${data.message}`;

        if (data.data && data.data.employeeId) {
          text += `\n\n📋 Employee ID: ${data.data.employeeId}`;

          const fullName = [data.data.firstName, data.data.lastName].filter(Boolean).join(' ');
          if (fullName) {
            text += `\nName: ${fullName}`;
          }
          if (data.data.department) {
            text += `\nDepartment: ${data.data.department}`;
          }
          if (data.data.emailId) {
            text += `\nEmail: ${data.data.emailId}`;
          }
          if (data.data.phoneNumber) {
            text += `\nPhone: ${data.data.phoneNumber}`;
          }
          if (data.data.address) {
            text += `\nAddress: ${data.data.address}`;
          }
        }
        
        botResponse.text = text;
      } else if (data.status === 'error') {
        botResponse.type = 'error';
        botResponse.text = `❌ Error: ${data.message}`;
      } else {
        botResponse.type = 'info';
        botResponse.text = `ℹ️ ${data.message}`;
      }

      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        text: `❌ Connection error: ${error.message}`,
        sender: 'bot',
        type: 'error'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1>🤖 Employee Chatbot-Anbarasan</h1>
        <p>Powered by Spring Boot Backend AI</p>
      </div>

      <div className="messages-container">
        {messages.map(message => (
          <div key={message.id} className={`message message-${message.sender} message-${message.type}`}>
            <div className="message-content">
              {message.text.split('\n').map((line, idx) => (
                <span key={idx}>
                  {line}
                  {idx < message.text.split('\n').length - 1 && <br />}
                </span>
              ))}
            </div>
          </div>
        ))}
        {loading && (
          <div className="message message-bot message-loading">
            <div className="message-content">
              <div className="loading">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-container">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          disabled={loading}
          rows="3"
        />
        <button 
          onClick={sendMessage} 
          disabled={loading || !input.trim()}
          className="send-btn"
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
};

export default ChatBot;
