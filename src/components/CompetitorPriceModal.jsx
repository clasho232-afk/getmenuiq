import React from 'react';
import { X, TrendingUp, TrendingDown, Clock, Tag } from 'lucide-react';
import './DashboardContent.css';

const CompetitorPriceModal = ({ isOpen, onClose, competitor, priceChanges }) => {
  if (!isOpen || !competitor) return null;

  // Group by category
  const groupedChanges = priceChanges.reduce((acc, change) => {
    const cat = change.category || 'Menu Items';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(change);
    return acc;
  }, {});

  // For each category, sort so that 'youSellThis' is at the top
  Object.keys(groupedChanges).forEach(cat => {
    groupedChanges[cat].sort((a, b) => {
      if (a.youSellThis && !b.youSellThis) return -1;
      if (!a.youSellThis && b.youSellThis) return 1;
      return 0;
    });
  });

  return (
    <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 100, background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-panel modal-content" style={{ width: '850px', maxWidth: '95%', maxHeight: '90vh', background: '#FAF8F4', borderRadius: '24px', overflow: 'hidden', display: 'flex', flexDirection: 'column', border: '1px solid #E5E0D8', boxShadow: '0 24px 48px rgba(0,0,0,0.06)' }}>
        
        {/* Header Hero */}
        <div style={{ position: 'relative', height: '220px', backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 60%, transparent 100%), url(${competitor.image || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80'})`, backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'flex-end', padding: '2rem' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.4)'} onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}>
            <X size={18} />
          </button>
          
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: competitor.logoColor || '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '24px', fontWeight: 800, border: '2px solid rgba(255,255,255,0.8)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              {competitor.logo || competitor.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', fontFamily: '"Playfair Display", serif', margin: 0, letterSpacing: '-0.01em' }}>{competitor.name}</h2>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Tag size={14} /> {priceChanges.length} recent price changes detected
              </p>
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
          {Object.entries(groupedChanges).map(([category, items], idx) => (
            <div key={idx} style={{ marginBottom: '2.5rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#111', margin: '0 0 1.25rem 0', fontFamily: '"Playfair Display", serif', borderBottom: '1px solid #E5E0D8', paddingBottom: '0.75rem' }}>
                {category}
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {items.map((item, i) => {
                  const isUp = item.direction === 'up';
                  const diff = item.newPrice - item.oldPrice;
                  const diffSign = diff > 0 ? '+' : '';
                  const diffText = `${diffSign}£${Math.abs(diff).toFixed(2)}`;
                  
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E5E0D8', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', position: 'relative', overflow: 'hidden' }}>
                      {item.youSellThis && (
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#C85A17' }}></div>
                      )}
                      
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flex: 1 }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                          <img src={item.image} alt={item.item} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '1rem', fontWeight: 600, color: '#111' }}>{item.item}</span>
                            {item.youSellThis && (
                              <span style={{ background: 'rgba(214, 90, 49, 0.08)', color: '#C85A17', fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: '9999px', textTransform: 'uppercase', letterSpacing: '0.05em', border: '1px solid rgba(214, 90, 49, 0.15)' }}>
                                You sell this
                              </span>
                            )}
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#9CA3AF' }}>
                              <Clock size={12} />
                              <span style={{ fontSize: '0.75rem' }}>{item.time}</span>
                            </div>
                            <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>via {item.platform.charAt(0).toUpperCase() + item.platform.slice(1)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '0.9rem', color: '#9CA3AF', textDecoration: 'line-through' }}>£{item.oldPrice.toFixed(2)}</span>
                            <span style={{ color: isUp ? '#C85A17' : '#5E7B82', display: 'flex', alignItems: 'center' }}>
                              {isUp ? <TrendingUp size={16} strokeWidth={2.5} /> : <TrendingDown size={16} strokeWidth={2.5} />}
                            </span>
                            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111' }}>£{item.newPrice.toFixed(2)}</span>
                          </div>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: isUp ? '#C85A17' : '#5E7B82' }}>
                            {diffText} ({((Math.abs(diff) / item.oldPrice) * 100).toFixed(1)}%)
                          </span>
                        </div>
                        
                        {item.youSellThis ? (
                          <button style={{ background: '#111', color: '#fff', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s', whiteSpace: 'nowrap' }} onMouseEnter={(e) => e.currentTarget.style.background = '#374151'} onMouseLeave={(e) => e.currentTarget.style.background = '#111'}>
                            Adjust your price
                          </button>
                        ) : (
                          <div style={{ width: '130px' }}></div> // Spacer to keep layout balanced
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompetitorPriceModal;
