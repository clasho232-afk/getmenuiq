import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Info, X, ArrowDown, ArrowUp } from 'lucide-react';

export const getMarketData = (item, platform = 'all') => {
  if (!item) return { myPrice: "0.00", avgPrice: "0.00", lowPrice: "0.00", highPrice: "0.00", intervals: [] };
  
  const rawPrice = item.price ? item.price.toString().replace('£', '') : '0';
  let myPrice = parseFloat(rawPrice) || 0;
  
  // Simulate platform differences
  if (platform === 'deliveroo') myPrice *= 1.05;
  if (platform === 'ubereats') myPrice *= 1.08;
  if (platform === 'justeat') myPrice *= 1.02;

  const avgPrice = (myPrice * 0.8).toFixed(2);
  const lowPrice = (myPrice * 0.6).toFixed(2);
  const highPrice = myPrice >= (myPrice * 0.9) ? myPrice.toFixed(2) : (myPrice * 1.1).toFixed(2);
  
  const intervals = [
    { price: lowPrice, rivals: [
        { name: 'Local Diner', price: lowPrice, image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=50&q=80' },
        { name: 'Chicken Shop', price: lowPrice, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=50&q=80' }
    ]},
    { price: avgPrice, rivals: [
        { name: 'Burger King', price: avgPrice, image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=50&q=80' },
        { name: 'Five Guys', price: avgPrice, image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=50&q=80' },
        { name: 'Pizza Express', price: avgPrice, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=50&q=80' }
    ]},
    { price: myPrice.toFixed(2), rivals: [
        { name: 'You', price: myPrice.toFixed(2), image: item.image || '' },
        { name: 'Premium Vegan', price: myPrice.toFixed(2), image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=50&q=80' }
    ]}
  ];
  
  intervals.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
  
  const platforms = ['Deliveroo', 'UberEats', 'Just Eat'];
  intervals.forEach(interval => {
    interval.rivals.forEach((rival, i) => {
      rival.platform = platforms[(rival.name.length + i) % platforms.length];
    });
  });
  
  return { myPrice: myPrice.toFixed(2), avgPrice, lowPrice, highPrice, intervals };
};


const AuditCommandCenterModal = ({ activeItem, initialPlatform, onClose }) => {
  const [platform, setPlatform] = useState('all');
  const [sortOrder, setSortOrder] = useState('asc');

  if (!activeItem) return null;

  const marketData = getMarketData(activeItem, platform);
  
  const lowestPriceRival = marketData.intervals.find(i => i.price === marketData.lowPrice)?.rivals[0]?.name || 'a local competitor';
  const highestPriceRival = marketData.intervals.find(i => i.price === marketData.highPrice)?.rivals[0]?.name || 'a local competitor';
  
  return createPortal(
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }} onClick={onClose}>
      <div className="audit-command-card" style={{ position: 'relative', background: '#FFFFFF', border: '1px solid rgba(224, 80, 70, 0.15)', borderRadius: '24px', width: '95%', maxWidth: '900px', display: 'flex', overflow: 'hidden', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)', animation: 'modalFadeIn 0.3s ease-out', height: '640px' }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: 'absolute', top: '24px', right: '24px', background: '#F3F4F6', border: 'none', cursor: 'pointer', color: '#4B5563', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s', zIndex: 10 }} onMouseEnter={e => e.currentTarget.style.background = '#E5E7EB'} onMouseLeave={e => e.currentTarget.style.background = '#F3F4F6'}><X size={18} /></button>
        
        {/* Left Column - Visual Header & Core Stats */}
        <div style={{ flex: '1.1', background: 'transparent', padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem', borderRight: '1px solid rgba(0,0,0,0.05)' }}>
          <img src={activeItem.image} alt={activeItem.name} style={{ width: '100%', height: '260px', objectFit: 'cover', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
          
          <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <h2 className="item-title" title={activeItem.name} style={{ fontSize: '1.25rem', textAlign: 'center', margin: 0 }}>{activeItem.name}</h2>
            </div>
            
            <div className="platform-selector-row" style={{ marginTop: '12px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
              {['deliveroo', 'ubereats', 'justeat'].map(p => (
                <button
                  key={p}
                  onClick={() => setPlatform(p)}
                  className={`platform-btn ${platform === p ? `btn-${p} active` : ''}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.3rem 0.6rem' }}
                >
                  <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: platform !== p ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', flexShrink: 0 }}>
                    <img 
                      src={`https://cdn.simpleicons.org/${p === 'deliveroo' ? 'deliveroo/00CCBC' : p === 'ubereats' ? 'ubereats/06C167' : 'justeat/FF5B00'}`} 
                      alt={p} 
                      style={{ height: '10px', width: '10px', objectFit: 'contain', filter: platform !== p ? 'grayscale(100%) opacity(0.6)' : 'none' }} 
                    />
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: platform === p ? 700 : 500 }}>{p === 'deliveroo' ? 'Deliveroo' : p === 'ubereats' ? 'UberEats' : 'Just Eat'}</span>
                </button>
              ))}
            </div>
            
            <div className="metrics-container" style={{ marginTop: '1.25rem' }}>
              <div className="metric-card">
                <div className="metric-label">Your Price</div>
                <div className="metric-value" style={{ color: '#FF5E3A', fontSize: '1.25rem' }}>£{marketData.myPrice}</div>
              </div>
              <div className="metric-card">
                <div className="metric-label tooltip-container" style={{ marginBottom: '6px' }}>
                  Avg Market Price <Info className="info-icon" size={14} style={{ marginLeft: '4px' }} />
                  <div className="tooltip-card" style={{ textTransform: 'none' }}>
                    <div>Ilford Avg: £1.70</div>
                    <div>Neighborhood Avg: £1.50</div>
                    <div style={{ marginTop: '4px', paddingTop: '4px', borderTop: '1px solid rgba(0,0,0,0.05)', fontWeight: 700 }}>Aggregate: £1.60</div>
                  </div>
                </div>
                <div className="metric-value" style={{ color: '#22C55E', fontSize: '1.25rem' }}>£{marketData.avgPrice}</div>
              </div>
              <div className="metric-card">
                <div className="metric-label tooltip-container" style={{ marginBottom: '6px' }}>
                  Lowest Price <Info className="info-icon" size={14} style={{ marginLeft: '4px' }} />
                  <div className="tooltip-card" style={{ textTransform: 'none' }}>Lowest Price provided by: {lowestPriceRival}</div>
                </div>
                <div className="metric-value" style={{ color: '#EAB308', fontSize: '1.25rem' }}>£{marketData.lowPrice}</div>
              </div>
              <div className="metric-card">
                <div className="metric-label tooltip-container" style={{ marginBottom: '6px' }}>
                  Highest Price <Info className="info-icon" size={14} style={{ marginLeft: '4px' }} />
                  <div className="tooltip-card" style={{ textTransform: 'none' }}>Highest Price provided by: {highestPriceRival}</div>
                </div>
                <div className="metric-value" style={{ color: '#EF4444', fontSize: '1.25rem' }}>£{marketData.highPrice}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Strategic Action Center */}
        <div style={{ flex: '1.4', padding: '2.5rem 0', display: 'flex', flexDirection: 'column', background: 'transparent' }}>
          <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'hidden' }}>
            <div style={{ padding: '0 4.5rem 1rem 2.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#E05046', boxShadow: '0 0 10px rgba(224, 80, 70, 0.4)' }} />
                  <span style={{ color: '#0F172A', fontWeight: 800, fontSize: '1.125rem', letterSpacing: '-0.02em' }}>Rival Offerings</span>
                </div>
                <button 
                  onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                  style={{ background: 'transparent', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: '#4B5563', fontSize: '0.75rem', fontWeight: 600, transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />} Price
                </button>
              </div>
            </div>
            <div style={{ overflowY: 'auto', flex: 1, padding: '0 2.5rem 1.5rem 2.5rem' }}>
              {marketData.intervals
                .flatMap(interval => interval.rivals.filter(r => r.name !== 'You'))
                .filter(rival => platform === 'all' || rival.platform.toLowerCase().replace(' ', '') === platform)
                .sort((a, b) => sortOrder === 'asc' ? parseFloat(a.price) - parseFloat(b.price) : parseFloat(b.price) - parseFloat(a.price))
                .map((rival, index, arr) => (
                <div 
                  key={index} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: '12px', 
                    background: '#ffffff', 
                    padding: '12px 16px', 
                    borderRadius: '16px', 
                    border: '1px solid rgba(0,0,0,0.03)',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.06)';
                    e.currentTarget.style.border = '1px solid rgba(0,0,0,0.06)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.03)';
                    e.currentTarget.style.border = '1px solid rgba(0,0,0,0.03)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1' }}>
                    <img src={rival.image} alt={rival.name} style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', minWidth: 0, paddingRight: '1rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '13px', color: '#0F172A', lineHeight: 1.2, marginBottom: '2px' }}>{activeItem.name}</span>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>{rival.name}</span>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'flex-end' }}>
                    <div style={{ width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <img src={`https://cdn.simpleicons.org/${rival.platform === 'Deliveroo' ? 'deliveroo/00CCBC' : rival.platform === 'UberEats' ? 'ubereats/06C167' : 'justeat/FF5B00'}`} alt={rival.platform} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <span style={{ fontSize: '15px', fontWeight: 800, color: '#E05046' }}>£{rival.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
};

export default AuditCommandCenterModal;
