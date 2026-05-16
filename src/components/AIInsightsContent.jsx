import React, { useState } from 'react';
import { Upload, Download, TrendingUp, TrendingDown, CloudRain, CheckCircle, XCircle, ArrowRight, Utensils, Smartphone, Calendar, BarChart3, ChevronRight } from 'lucide-react';
import MarketPositionReport from './MarketPositionReport';

const AIInsightsContent = () => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [showMarketReport, setShowMarketReport] = useState(false);

  const weeklyScores = [
    { week: 'Week 1', score: 52, change: null },
    { week: 'Week 2', score: 58, change: +6 },
    { week: 'Week 3', score: 61, change: +3 },
    { week: 'Week 4', score: 64, change: +3 }
  ];

  const dosItems = [
    { text: 'Increase local visibility for the "Classic Margherita"—it\'s your highest-margin walk-in item this week.', impact: '+£320/wk' },
    { text: 'Launch a "Weekday Lunch Combo" at £8.50 to undercut Burger King\'s £5 deal with higher perceived value.', impact: '+£180/wk' },
    { text: 'Push your Garlic Bread as an upsell on Deliveroo. Competitors aren\'t bundling sides effectively.', impact: '+£95/wk' },
    { text: 'Add a "Vegan Margherita" to capture the 12% of local searches for plant-based pizza.', impact: '+£210/wk' }
  ];

  const dontsItems = [
    { text: 'Don\'t raise the price of "Pepperoni Pizza" above £12.50. Three competitors are already undercutting you at £11.', risk: 'High' },
    { text: 'Don\'t remove the "Student Discount" on Tuesdays. It drives 35% of your midweek footfall.', risk: 'Critical' },
    { text: 'Avoid running BOGO deals on UberEats this month. Your margin on delivery is already at 8%.', risk: 'Medium' },
    { text: 'Don\'t ignore Just Eat listings. You\'re missing 18% of the local delivery market.', risk: 'High' }
  ];

  const digitalRevenue = 62;
  const diningRevenue = 38;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, letterSpacing: '-0.02em' }}>AI Strategy</h1>
          <p style={{ color: '#9CA3AF', fontSize: '0.85rem', marginTop: '0.25rem' }}>Weekly intelligence report · Generated 2 hours ago</p>
        </div>
        <button 
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#111', color: '#fff', border: 'none', borderRadius: '9999px', padding: '0.65rem 1.5rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'transform 0.2s' }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <Download size={15} /> Download PDF
        </button>
      </div>

      {/* Two-Column Pro-Report */}
      <div style={{ display: 'flex', gap: '1.5rem' }}>
        
        {/* LEFT — Growth Vault */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Upload Zone */}
          <div 
            className="glass-panel"
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragOver(false); }}
            style={{ 
              padding: '2.5rem 2rem', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              gap: '1rem',
              border: isDragOver ? '2px dashed #111' : '2px dashed rgba(0,0,0,0.12)',
              borderRadius: '16px',
              background: isDragOver ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.5)',
              transition: 'all 0.3s',
              cursor: 'pointer'
            }}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Upload size={22} color="#6B7280" strokeWidth={1.5} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#111', marginBottom: '0.25rem' }}>Drop your sales data here</p>
              <p style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>CSV from UberEats, Deliveroo, or Local POS</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
              {['UberEats', 'Deliveroo', 'POS'].map((platform) => (
                <span key={platform} style={{ fontSize: '0.65rem', fontWeight: 600, color: '#6B7280', background: 'rgba(0,0,0,0.04)', padding: '0.25rem 0.6rem', borderRadius: '9999px' }}>{platform}</span>
              ))}
            </div>
          </div>

          {/* Historical Pulse Timeline */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={15} strokeWidth={1.5} color="#6B7280" />
              Historical Pulse
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {weeklyScores.map((week, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 0', borderBottom: i < weeklyScores.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none' }}>
                  {/* Timeline dot + line */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '16px', flexShrink: 0 }}>
                    <div style={{ 
                      width: '10px', height: '10px', borderRadius: '50%', 
                      background: i === weeklyScores.length - 1 ? '#111' : 'rgba(0,0,0,0.15)',
                      border: i === weeklyScores.length - 1 ? '2px solid rgba(0,0,0,0.3)' : 'none'
                    }} />
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: i === weeklyScores.length - 1 ? 700 : 500, color: i === weeklyScores.length - 1 ? '#111' : '#6B7280' }}>{week.week}</span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 800, color: '#111', letterSpacing: '-0.02em' }}>{week.score}</span>
                    {week.change !== null && (
                      <span style={{ fontSize: '0.7rem', fontWeight: 600, color: week.change > 0 ? '#10B981' : '#EF4444', display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
                        {week.change > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {week.change > 0 ? '+' : ''}{week.change}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Profitability Balance Widget */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem' }}>Profitability Balance</h3>
            
            {/* Digital vs Dining Bar */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', borderRadius: '8px', overflow: 'hidden', height: '32px' }}>
                <div style={{ width: `${digitalRevenue}%`, background: 'linear-gradient(135deg, #111 0%, #333 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'width 0.8s ease' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#fff' }}>{digitalRevenue}%</span>
                </div>
                <div style={{ width: `${diningRevenue}%`, background: 'linear-gradient(135deg, #E8D5B7 0%, #D4B896 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'width 0.8s ease' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#111' }}>{diningRevenue}%</span>
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Smartphone size={13} color="#6B7280" strokeWidth={1.5} />
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280' }}>Digital</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Utensils size={13} color="#6B7280" strokeWidth={1.5} />
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280' }}>Walk-in</span>
              </div>
            </div>

            {/* Neighborhood Victory */}
            <div style={{ marginTop: '1rem', background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.12)', borderRadius: '8px', padding: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <TrendingUp size={14} color="#10B981" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10B981', marginBottom: '0.15rem' }}>Neighbourhood Victory</p>
                  <p style={{ fontSize: '0.7rem', color: '#6B7280', lineHeight: 1.4 }}>Walk-in sales up 12% this week. Your local Ilford footprint is strong—double down on window signage and loyalty cards.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — AI Action Plan */}
        <div style={{ flex: 1.2, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* DOs Card */}
          <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '3px solid rgba(16, 185, 129, 0.4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <CheckCircle size={16} color="#10B981" strokeWidth={2} />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111' }}>Strategic Moves</h3>
              <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#10B981', background: 'rgba(16,185,129,0.08)', padding: '0.2rem 0.5rem', borderRadius: '9999px', marginLeft: 'auto' }}>DO</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {dosItems.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.75rem', padding: '0.65rem', background: 'rgba(16, 185, 129, 0.03)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.06)', transition: 'background 0.2s', cursor: 'default' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.07)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.03)'}
                >
                  <ArrowRight size={14} color="#10B981" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.78rem', color: '#374151', lineHeight: 1.5 }}>{item.text}</p>
                  </div>
                  <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#10B981', whiteSpace: 'nowrap', alignSelf: 'center' }}>{item.impact}</span>
                </div>
              ))}
            </div>
          </div>

          {/* DON'Ts Card */}
          <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '3px solid rgba(239, 68, 68, 0.4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <XCircle size={16} color="#EF4444" strokeWidth={2} />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111' }}>Risk Avoidance</h3>
              <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#EF4444', background: 'rgba(239,68,68,0.08)', padding: '0.2rem 0.5rem', borderRadius: '9999px', marginLeft: 'auto' }}>DON'T</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {dontsItems.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.75rem', padding: '0.65rem', background: 'rgba(239, 68, 68, 0.02)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.06)', transition: 'background 0.2s', cursor: 'default' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.06)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.02)'}
                >
                  <XCircle size={14} color="#EF4444" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.78rem', color: '#374151', lineHeight: 1.5 }}>{item.text}</p>
                  </div>
                  <span style={{ fontSize: '0.6rem', fontWeight: 700, color: item.risk === 'Critical' ? '#DC2626' : item.risk === 'High' ? '#EF4444' : '#F59E0B', background: item.risk === 'Critical' ? 'rgba(220,38,38,0.08)' : item.risk === 'High' ? 'rgba(239,68,68,0.06)' : 'rgba(245,158,11,0.08)', padding: '0.2rem 0.45rem', borderRadius: '4px', whiteSpace: 'nowrap', alignSelf: 'center', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{item.risk}</span>
                </div>
              ))}
            </div>
          </div>

          {/* London Strategic Context */}
          <div className="glass-panel" style={{ padding: '1.25rem', background: 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(245,243,236,0.9) 100%)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(99,102,241,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <CloudRain size={18} color="#6366F1" strokeWidth={1.5} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111' }}>London Local Note</h4>
                  <span style={{ fontSize: '0.6rem', fontWeight: 600, color: '#6366F1', background: 'rgba(99,102,241,0.08)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>AI</span>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#4B5563', lineHeight: 1.6 }}>
                  Heavy rain predicted for London this weekend. Pull back on local staff for Saturday and push your <strong>"Duo Deal"</strong> on Deliveroo to capture the stay-at-home crowd. Historically, your delivery orders spike <strong>+28%</strong> during wet weekends.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Market Position Report Entry Point */}
      <div className="glass-panel" onClick={() => setShowMarketReport(true)} style={{ padding: '1.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'all 0.2s', border: '1px solid rgba(224,80,70,0.08)' }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'rgba(224,80,70,0.2)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(224,80,70,0.08)'; }}
      >
        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #e05046 0%, #c44035 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <BarChart3 size={20} color="#fff" />
        </div>
        <div style={{ flex: 1 }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#111' }}>See how you rank in your market</h4>
          <p style={{ fontSize: '0.7rem', color: '#9CA3AF', marginTop: '0.1rem' }}>Benchmark against 47 similar restaurants across East London</p>
        </div>
        <ChevronRight size={18} color="#D1D5DB" />
      </div>

      <MarketPositionReport isOpen={showMarketReport} onClose={() => setShowMarketReport(false)} />
    </div>
  );
};

export default AIInsightsContent;
