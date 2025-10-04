
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';



const AIChatbox = () => {
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Xin chào! Tôi là trợ lý AI. Bạn muốn hỏi gì về dữ liệu xe điện?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(true);

  useEffect(() => {
    // Lấy danh sách câu hỏi gợi ý từ backend
    axios.get(`${config.backendUrl}/api/ai/suggestions`).then(res => {
      setSuggestions(res.data.suggestions || []);
    });
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = { sender: 'user', text: input };
    setMessages(msgs => [...msgs, userMsg]);
    setLoading(true);
    setInput('');
    try {
      const res = await axios.post(`${config.backendUrl}/api/ai/chat`, { message: input });
      // Nếu trả về matched=false thì là câu hỏi ngoài rule-based
      if (res.data.matched === false) {
        setMessages(msgs => [...msgs, {
          sender: 'ai',
          text: res.data.message,
          warning: true,
          suggestions: res.data.suggestions || []
        }]);
        setShowSuggestions(true);
      } else {
        setMessages(msgs => [...msgs, { sender: 'ai', text: res.data.message }]);
        setShowSuggestions(false);
      }
    } catch (err) {
      setMessages(msgs => [...msgs, { sender: 'ai', text: 'Lỗi khi kết nối AI. Vui lòng thử lại sau.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (q) => {
    setInput(q);
    setShowSuggestions(false);
  };

  return (
    <div className="ai-chatbox">
      <div className="ai-chat-messages">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`ai-msg ai-msg-${msg.sender}${msg.warning ? ' ai-msg-warning' : ''}`}
            style={msg.warning ? { background: '#fffbe6', color: '#b26a00', border: '1px solid #ffe58f' } : {}}
          >
            {msg.text}
            {msg.suggestions && msg.suggestions.length > 0 && (
              <ul className="ai-suggest-list">
                {msg.suggestions.map((q, i) => (
                  <li key={i} onClick={() => handleSuggestionClick(q)}>{q}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
        {loading && <div className="ai-msg ai-msg-ai">Đang trả lời...</div>}
      </div>
      {showSuggestions && suggestions.length > 0 && (
        <div className="ai-suggest-box">
          <div className="ai-suggest-title">Câu hỏi gợi ý:</div>
          <ul className="ai-suggest-list">
            {suggestions.map((q, i) => (
              <li key={i} onClick={() => handleSuggestionClick(q)}>{q}</li>
            ))}
          </ul>
        </div>
      )}
      <form className="ai-chat-input" onSubmit={handleSend}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Nhập câu hỏi về EV, pin, sạc..."
        />
        <button type="submit" disabled={loading || !input.trim()}>Gửi</button>
      </form>
    </div>
  );
};

export default AIChatbox;
