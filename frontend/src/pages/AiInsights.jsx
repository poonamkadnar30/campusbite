import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiAskAiInsights, apiGetOrders } from '../services/api';
import { Icons } from '../components/Icons';

export const AiInsights = () => {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: `Hello ${user?.name ? user.name.split(' ')[0] : 'there'}! I am your CampusBite AI Assistant. I can analyze your campus orders, calculate your food spending, track current deliveries, and highlight your favorite dishes. How can I assist you today?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ totalOrders: 0, totalSpent: 0, topDish: 'None' });
  const messagesEndRef = useRef(null);

  const samplePrompts = [
    'Summarize my last five orders.',
    'Which of my orders are still not delivered?',
    'How much did I spend this week?',
    'Which food items have I ordered most frequently?',
  ];

  useEffect(() => {
    loadUserOrderStats();
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const loadUserOrderStats = async () => {
    if (!user) return;
    try {
      const orders = await apiGetOrders({ customerId: user.id });
      const totalSpent = orders.reduce((sum, o) => sum + (o.paymentStatus === 'mock_paid' ? o.total : 0), 0);
      const dishFreq = {};
      orders.forEach((o) => {
        (o.items || []).forEach((item) => {
          dishFreq[item.name] = (dishFreq[item.name] || 0) + item.quantity;
        });
      });
      const topDishEntry = Object.entries(dishFreq).sort((a, b) => b[1] - a[1])[0];

      setStats({
        totalOrders: orders.length,
        totalSpent,
        topDish: topDishEntry ? topDishEntry[0] : 'None yet',
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async (textToSend) => {
    const text = textToSend || query;
    if (!text.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    try {
      const res = await apiAskAiInsights(text, user?.id || 1);
      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: res.reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: 'Sorry, I encountered an issue analyzing your order history. Please ensure the backend server or OpenAI key is configured.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', padding: '12px', background: 'var(--primary-light)', borderRadius: 'var(--radius-full)', marginBottom: '0.5rem' }}>
          <Icons.Sparkles size={28} color="var(--primary)" />
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--secondary)' }}>
          Applied AI Order Insights
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Ask natural language questions about your orders, expenses, and eating trends
        </p>
      </div>

      {/* Quick Stats Badges */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
            Total Orders
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--secondary)', marginTop: '2px' }}>
            {stats.totalOrders}
          </div>
        </div>

        <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
            Total Food Spending
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', marginTop: '2px' }}>
            ₹{stats.totalSpent}
          </div>
        </div>

        <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
            Most Ordered
          </div>
          <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--secondary)', marginTop: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {stats.topDish}
          </div>
        </div>
      </div>

      {/* Chat Thread Container */}
      <div
        className="card"
        style={{
          padding: '1.5rem',
          height: '460px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '0.5rem' }}>
          {messages.map((m) => (
            <div
              key={m.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: m.sender === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              <div
                style={{
                  maxWidth: '80%',
                  padding: '0.85rem 1.15rem',
                  borderRadius: 'var(--radius-lg)',
                  background: m.sender === 'user' ? 'var(--primary)' : '#f1f5f9',
                  color: m.sender === 'user' ? '#ffffff' : 'var(--text-main)',
                  borderBottomRightRadius: m.sender === 'user' ? 2 : 'var(--radius-lg)',
                  borderBottomLeftRadius: m.sender === 'ai' ? 2 : 'var(--radius-lg)',
                  fontSize: '0.92rem',
                  lineHeight: 1.5,
                  whiteSpace: 'pre-wrap',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                {m.sender === 'ai' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, fontSize: '0.78rem', color: 'var(--primary)', marginBottom: '4px' }}>
                    <Icons.Sparkles size={13} />
                    <span>CampusBite AI</span>
                  </div>
                )}
                {m.text}
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-light)', marginTop: '4px', padding: '0 4px' }}>
                {m.time}
              </span>
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <Icons.Sparkles size={16} color="var(--primary)" style={{ animation: 'spin 1.5s linear infinite' }} />
              <span>Analyzing order history with AI...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)', display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          {samplePrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              style={{
                fontSize: '0.78rem',
                fontWeight: 600,
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                whiteSpace: 'nowrap',
                border: '1px solid #ffd8a8',
              }}
            >
              💡 {prompt}
            </button>
          ))}
        </div>

        {/* Chat Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}
        >
          <input
            type="text"
            className="form-control"
            placeholder="Ask anything about your campus orders..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !query.trim()}
            style={{ padding: '0.65rem 1.25rem' }}
          >
            <Icons.Send size={16} />
            <span style={{ display: 'none' }}>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
