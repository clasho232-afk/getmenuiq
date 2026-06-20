import React, { useState, useRef, useEffect } from 'react';
import {
  Paperclip, Send, Plus,
  Bot, MessageSquare, TrendingUp, AlertTriangle
} from 'lucide-react';

import './IntelligenceHub.css';

/* ================================================================
   HISTORY DATA
   ================================================================ */

const HISTORY = {
  today: [
    { id: 'h1', text: 'Deliveroo Pricing Adjustments', active: true },
    { id: 'h2', text: 'Weekend Footfall Analysis' },
  ],
  yesterday: [
    { id: 'h3', text: 'Burger Menu Audit — June' },
    { id: 'h4', text: 'Competitor Price Drop Alert' },
  ],
  previous: [
    { id: 'h5', text: 'Vegan Menu Gap Analysis' },
    { id: 'h6', text: 'Student Deal ROI Report' },
    { id: 'h7', text: 'Saturday Night Promo Sim' },
  ],
};

/* ================================================================
   CONTENT MODULES — Type 2: Competitor/Pricing Table
   ================================================================ */

const CompetitorTable = ({ data }) => (
  <div className="bubble-table-wrap">
    <table className="bubble-table">
      <thead>
        <tr>
          {data.headers.map((h, i) => <th key={i}>{h}</th>)}
        </tr>
      </thead>
      <tbody>
        {data.rows.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => (
              <td key={j}>
                {typeof cell === 'object' ? (
                  <span className={`table-badge ${cell.type}`}>{cell.text}</span>
                ) : cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/* ================================================================
   CONTENT MODULES — Type 3: Inline Bar Chart
   ================================================================ */

const InlineBarChart = ({ data }) => {
  const max = Math.max(...data.bars.map(b => b.value));
  return (
    <div className="bubble-chart-container">
      <p className="bubble-chart-title">{data.title}</p>
      <div className="bubble-chart-bars-row">
        {data.bars.map((bar, i) => {
          const heightPct = (bar.value / max) * 100;
          const isHighlight = bar.value === max || bar.highlight;
          return (
            <div
              key={i}
              className="bubble-chart-bar-item"
              style={{
                height: `${heightPct}%`,
                background: isHighlight
                  ? 'linear-gradient(180deg, #e05046 0%, #c43530 100%)'
                  : 'rgba(0,0,0,0.08)',
                animation: `bubbleSlideIn 0.5s ease-out ${i * 60}ms both`
              }}
            >
              <span className="bubble-chart-bar-tooltip">{bar.value}{data.unit || ''}</span>
            </div>
          );
        })}
      </div>
      <div className="bubble-chart-x-labels">
        {data.bars.map((bar, i) => <span key={i}>{bar.label}</span>)}
      </div>
    </div>
  );
};

/* ================================================================
   CONTENT MODULES — Type 4: Food Image Grid
   ================================================================ */

const FoodImageGrid = ({ items }) => (
  <div className="bubble-image-grid">
    {items.map((item, i) => (
      <div key={i} className="bubble-image-item">
        <img src={item.url} alt={item.caption} />
        <div className="bubble-image-caption">{item.caption}</div>
      </div>
    ))}
  </div>
);

/* ================================================================
   THE SMART CONTAINER — MessageBubble
   ================================================================ */

const MessageBubble = ({ msg }) => {
  const isUser = msg.sender === 'user';
  return (
    <div className={`message-bubble-container ${isUser ? 'user-bubble' : 'system-bubble'}`}>
      <div className="bubble-inner">
        {/* Sender row */}
        <div className="bubble-sender-row">
          <div className={`bubble-sender-icon ${isUser ? 'user' : 'system'}`}>
            {isUser ? 'U' : 'AI'}
          </div>
          <span className={`bubble-sender-pill ${isUser ? 'user' : 'system'}`}>
            {isUser ? 'You' : 'MenuIQ Intelligence'}
          </span>
        </div>

        {/* Text */}
        {msg.data.text && (
          <p className="bubble-text-content"
            dangerouslySetInnerHTML={{ __html: msg.data.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
          />
        )}

        {/* Type-based content */}
        {msg.type === 'chart'  && msg.data.chartData  && <InlineBarChart    data={msg.data.chartData}  />}
        {msg.type === 'table'  && msg.data.tableData   && <CompetitorTable   data={msg.data.tableData}  />}
        {msg.type === 'images' && msg.data.imageItems  && <FoodImageGrid     items={msg.data.imageItems} />}
      </div>
    </div>
  );
};

/* ================================================================
   TYPING INDICATOR
   ================================================================ */

const TypingIndicator = () => (
  <div className="hub-typing-bubble">
    <div className="bubble-sender-row" style={{ marginBottom: '6px' }}>
      <div className="bubble-sender-icon system">AI</div>
      <span className="bubble-sender-pill system">MenuIQ Intelligence</span>
    </div>
    <div className="hub-typing-dots">
      <div className="hub-typing-dot" />
      <div className="hub-typing-dot" />
      <div className="hub-typing-dot" />
    </div>
  </div>
);

/* ================================================================
   AI RESPONSE ENGINE
   ================================================================ */

const getAIResponse = (input) => {
  const q = input.toLowerCase();

  if (q.includes('price') || q.includes('hike') || q.includes('simulat') || q.includes('margin')) {
    return {
      type: 'chart',
      data: {
        text: "Running a **+5% price simulation** on your top-performing items. Thursday through Saturday show the strongest elasticity tolerance—projected upside is meaningful without meaningful volume loss.",
        chartData: {
          title: 'Projected Weekly Revenue Impact (£)',
          unit: '',
          bars: [
            { label: 'Mon', value: 42 }, { label: 'Tue', value: 58 },
            { label: 'Wed', value: 47 }, { label: 'Thu', value: 83, highlight: true },
            { label: 'Fri', value: 67 }, { label: 'Sat', value: 96, highlight: true },
            { label: 'Sun', value: 74 },
          ]
        }
      }
    };
  }

  if (q.includes('competit') || q.includes('competitor') || q.includes('rival')) {
    return {
      type: 'table',
      data: {
        text: "Scanned **47 competitors** within a 2-mile radius of Ilford. Here is your current standing across key price benchmarks:",
        tableData: {
          headers: ['Restaurant', 'Avg. Pizza £', 'Promo Active', 'Rating', 'vs. You'],
          rows: [
            ['Pizza Hut Ilford',    '£11.49', { text: 'BOGO', type: 'negative' }, '3.8★', { text: '-£0.71', type: 'positive' }],
            ['Domino\'s Ilford',    '£12.99', { text: 'None', type: 'neutral'  }, '4.1★', { text: '+£0.79', type: 'negative' }],
            ['Papa John\'s',        '£11.99', { text: '25% Off', type: 'negative' }, '3.9★', { text: '-£0.21', type: 'positive' }],
            ['Local Pizzeria Co.',  '£10.49', { text: 'None', type: 'neutral'  }, '4.4★', { text: '-£1.71', type: 'positive' }],
            ['**You (Gordo\'s)**',  '£12.20', { text: 'None', type: 'neutral'  }, '4.3★', '—'],
          ]
        }
      }
    };
  }

  if (q.includes('footfall') || q.includes('weekend') || q.includes('walk')) {
    return {
      type: 'chart',
      data: {
        text: "Weekend footfall analysis complete. Your **walk-in conversion peaks at 1 PM Saturdays** and drops sharply between 3–5 PM — a window where targeted promos could recover £95+/week.",
        chartData: {
          title: 'Walk-in Covers by Hour — Saturday',
          unit: '',
          bars: [
            { label: '11am', value: 24 }, { label: '12pm', value: 58 },
            { label: '1pm',  value: 91, highlight: true }, { label: '2pm', value: 76 },
            { label: '3pm',  value: 31 }, { label: '4pm',  value: 28 },
            { label: '5pm',  value: 44 }, { label: '6pm',  value: 72 },
          ]
        }
      }
    };
  }

  if (q.includes('menu') || q.includes('item') || q.includes('food') || q.includes('dish')) {
    return {
      type: 'images',
      data: {
        text: "Here are your **top 3 visual performers** based on engagement and reorder rate. Consider featuring these in your Deliveroo banner and local signage.",
        imageItems: [
          { url: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&h=400&fit=crop', caption: 'Classic Margherita · £11.50' },
          { url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=400&fit=crop', caption: 'Garlic Dough Balls · £3.99' },
          { url: 'https://images.unsplash.com/photo-1528137871618-79d2761e3fd5?w=400&h=400&fit=crop', caption: 'Pepperoni Supreme · £12.20' },
        ]
      }
    };
  }

  return {
    type: 'text',
    data: {
      text: "Understood. I'm processing your query against live market data. Try asking me to **Simulate a Price Hike**, **Check Local Competitors**, **Analyse Weekend Footfall**, or **Show My Best Menu Items** for instant visual insights."
    }
  };
};

/* ================================================================
   LEFT SIDEBAR COMPONENT
   ================================================================ */

const HubSidebar = ({ onNewChat }) => (
  <aside className="hub-sidebar">
    {/* New Chat — sits directly under the TopNav header */}
    <button className="hub-new-chat-btn" onClick={onNewChat}>
      <span style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
        <Plus size={15} strokeWidth={2.5} />
        New Chat
      </span>
      <span className="hub-new-chat-shortcut">⌘ N</span>
    </button>

    {/* History */}
    <div className="hub-history">
      <div className="hub-history-section">
        <div className="hub-history-label">Today</div>
        {HISTORY.today.map(item => (
          <div key={item.id} className={`hub-history-item ${item.active ? 'active' : ''}`}>
            <div className="hub-history-dot" />
            <span className="hub-history-text">{item.text}</span>
          </div>
        ))}
      </div>
      <div className="hub-history-section">
        <div className="hub-history-label">Yesterday</div>
        {HISTORY.yesterday.map(item => (
          <div key={item.id} className="hub-history-item">
            <div className="hub-history-dot" />
            <span className="hub-history-text">{item.text}</span>
          </div>
        ))}
      </div>
      <div className="hub-history-section">
        <div className="hub-history-label">Previous 7 Days</div>
        {HISTORY.previous.map(item => (
          <div key={item.id} className="hub-history-item">
            <div className="hub-history-dot" />
            <span className="hub-history-text">{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  </aside>
);

/* ================================================================
   ZEN EMPTY STATE
   ================================================================ */

const ZEN_PROMPTS = [
  "Simulate a Price Hike",
  "Check Local Competitors",
  "Analyse Weekend Footfall",
  "Show My Best Menu Items",
];

const ZenEmptyState = ({ onPrompt }) => (
  <div className="hub-zen-state">
    <h1 className="hub-zen-greeting">What's on your mind?</h1>
    <p className="hub-zen-sub">Ask MenuIQ anything about your restaurant's performance.</p>
    <div className="hub-zen-prompts">
      {ZEN_PROMPTS.map((p, i) => (
        <button key={i} className="hub-zen-prompt-chip" onClick={() => onPrompt(p)}>
          {p}
        </button>
      ))}
    </div>
  </div>
);

/* ================================================================
   MAIN COMPONENT
   ================================================================ */

const IntelligenceHub = () => {
  const [messages, setMessages]     = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping]     = useState(false);
  const chatEndRef                  = useRef(null);
  const inputRef                    = useRef(null);

  const hasMessages = messages.length > 0;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (overrideText) => {
    const text = (overrideText ?? inputValue).trim();
    if (!text || isTyping) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      type: 'text',
      data: { text }
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const response = getAIResponse(text);
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'system',
        ...response
      }]);
    }, 1000 + Math.random() * 400);
  };

  const handleNewChat = () => {
    setMessages([]);
    setInputValue('');
    setIsTyping(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const ACTION_CHIPS = [
    "Simulate Price Hike",
    "Check Local Competitors",
    "Analyse Weekend Footfall",
    "Show Best Menu Items",
  ];

  return (
    <div className="ai-strategy-root">

      {/* ── LEFT SIDEBAR ─────────────────────────── */}
      <HubSidebar onNewChat={handleNewChat} />

      {/* ── MAIN CANVAS ──────────────────────────── */}
      <main className="hub-main">
        <div className="hub-canvas">

          {/* ZEN vs ACTIVE STATE MACHINE */}
          {!hasMessages ? (
            <ZenEmptyState onPrompt={(p) => handleSend(p)} />
          ) : (
            <div className="hub-stream">
              {messages.map(msg => (
                <MessageBubble key={msg.id} msg={msg} />
              ))}
              {isTyping && <TypingIndicator />}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* ── FIXED INPUT DECK ─────────────────────── */}
        <div className="hub-input-deck">
          <div className="hub-input-inner">
            {/* Input box */}
            <div className="hub-input-box">
              <button className="hub-attach-btn" title="Attach CSV or Excel">
                <Paperclip size={18} />
              </button>
              <input
                ref={inputRef}
                className="hub-input-field"
                type="text"
                placeholder="Ask about food prices, margins, or competition..."
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              />
              <button
                className="hub-send-btn"
                onClick={() => handleSend()}
                disabled={!inputValue.trim() || isTyping}
                title="Send"
              >
                <Send size={15} style={{ marginLeft: '1px' }} />
              </button>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
};

export default IntelligenceHub;
