import React, { useState, useEffect } from 'react';
import { Info, X } from 'lucide-react';

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

export const DualRangeSlider = ({ minBound, maxBound, minVal, maxVal, onMinChange, onMaxChange }) => {
  const trackRef = React.useRef(null);
  const minBoundNum = parseFloat(minBound);
  const maxBoundNum = parseFloat(maxBound);
  const minValNum = parseFloat(minVal);
  const maxValNum = parseFloat(maxVal);

  const handlePointerDown = (e, type) => {
    e.preventDefault();
    const track = trackRef.current;
    if (!track) return;
    
    const handleMove = (moveEvent) => {
      const rect = track.getBoundingClientRect();
      let pct = (moveEvent.clientX - rect.left) / rect.width;
      pct = Math.max(0, Math.min(1, pct));
      let val = minBoundNum + pct * (maxBoundNum - minBoundNum);
      
      if (type === 'min') {
        val = Math.min(val, maxValNum - 0.1);
        onMinChange(val.toFixed(2));
      } else {
        val = Math.max(val, minValNum + 0.1);
        onMaxChange(val.toFixed(2));
      }
    };
    
    const handleUp = () => {
      document.removeEventListener('pointermove', handleMove);
      document.removeEventListener('pointerup', handleUp);
    };
    
    document.addEventListener('pointermove', handleMove);
    document.addEventListener('pointerup', handleUp);
  };

  const minPct = ((minValNum - minBoundNum) / (maxBoundNum - minBoundNum)) * 100;
  const maxPct = ((maxValNum - minBoundNum) / (maxBoundNum - minBoundNum)) * 100;

  return (
    <div ref={trackRef} style={{ position: 'relative', height: '16px', background: 'linear-gradient(90deg, #EAB308, #FF5E3A, #EF4444)', borderRadius: '8px', margin: '0 1rem' }}>
      <div 
        onPointerDown={e => handlePointerDown(e, 'min')}
        style={{ position: 'absolute', left: `${minPct}%`, top: '50%', transform: 'translate(-50%, -50%)', width: '24px', height: '24px', borderRadius: '50%', background: '#fff', border: '4px solid #FF5E3A', cursor: 'grab', zIndex: 10, boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}
      />
      <div style={{ position: 'absolute', left: `${minPct}%`, top: '30px', transform: 'translateX(-50%)', fontSize: '1rem', fontWeight: 700, color: '#111' }}>£{minVal}</div>
      
      <div 
        onPointerDown={e => handlePointerDown(e, 'max')}
        style={{ position: 'absolute', left: `${maxPct}%`, top: '50%', transform: 'translate(-50%, -50%)', width: '24px', height: '24px', borderRadius: '50%', background: '#fff', border: '4px solid #FF5E3A', cursor: 'grab', zIndex: 10, boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}
      />
      <div style={{ position: 'absolute', left: `${maxPct}%`, top: '30px', transform: 'translateX(-50%)', fontSize: '1rem', fontWeight: 700, color: '#111' }}>£{maxVal}</div>
    </div>
  );
};

const AuditCommandCenterModal = ({ activeItem, initialPlatform, onClose }) => {
  const [platform, setPlatform] = useState(initialPlatform || 'deliveroo');
  const [rangeMin, setRangeMin] = useState('');
  const [rangeMax, setRangeMax] = useState('');
  const [activePricePoint, setActivePricePoint] = useState(null);

  useEffect(() => {
    if (activeItem) {
      const mData = getMarketData(activeItem, platform);
      setRangeMin(mData.lowPrice);
      setRangeMax(mData.highPrice);
    }
  }, [activeItem, platform]); 

  if (!activeItem) return null;

  const marketData = getMarketData(activeItem, platform);
  const currentPricePoint = (!rangeMin && !rangeMax && !activePricePoint) ? marketData.avgPrice : activePricePoint;
  
  let displayedRivals = [];
  let panelTitle = '';
  
  if (rangeMin && rangeMax && !isNaN(parseFloat(rangeMin)) && !isNaN(parseFloat(rangeMax))) {
    const min = parseFloat(rangeMin);
    const max = parseFloat(rangeMax);
    displayedRivals = marketData.intervals.flatMap(i => i.rivals).filter(r => {
      const p = parseFloat(r.price);
      return p >= min && p <= max;
    });
    displayedRivals.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    panelTitle = `Rivals priced £${min.toFixed(2)} - £${max.toFixed(2)}`;
  } else if (rangeMin || rangeMax) {
    displayedRivals = [];
    panelTitle = `Rivals priced at £NULL`;
  } else {
    displayedRivals = marketData.intervals.find(i => i.price === currentPricePoint)?.rivals || [];
    panelTitle = `Rivals priced at £${currentPricePoint}`;
  }

  const lowestPriceRival = marketData.intervals.find(i => i.price === marketData.lowPrice)?.rivals[0]?.name || 'a local competitor';
  const highestPriceRival = marketData.intervals.find(i => i.price === marketData.highPrice)?.rivals[0]?.name || 'a local competitor';
  
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }} onClick={onClose}>
      <div className="audit-command-card" style={{ background: '#FFFFFF', backgroundImage: 'linear-gradient(180deg, rgba(224, 80, 70, 0.06) 0%, rgba(255, 255, 255, 0) 25%)', border: '1px solid rgba(224, 80, 70, 0.15)', borderRadius: '24px', width: '95%', maxWidth: '1400px', display: 'flex', gap: '32px', overflow: 'hidden', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)', animation: 'modalFadeIn 0.3s ease-out', height: '640px' }} onClick={e => e.stopPropagation()}>
        
        {/* Left Column - Visual Header & Core Stats */}
        <div style={{ flex: '1.1', background: 'transparent', padding: '3rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <img src={activeItem.image} alt={activeItem.name} style={{ width: '100%', height: '260px', objectFit: 'cover', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
          
          <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <h2 className="item-title" title={activeItem.name}>{activeItem.name}</h2>
            </div>
            
            <div className="platform-selector-row">
              {['deliveroo', 'ubereats', 'justeat'].map(p => (
                <button
                  key={p}
                  onClick={() => setPlatform(p)}
                  className={`platform-btn ${platform === p ? `btn-${p} active` : ''}`}
                >
                  {p}
                </button>
              ))}
            </div>
            
            <div className="metrics-container" style={{ marginTop: 'auto' }}>
              <div className="metric-card">
                <div className="metric-label">Your Price</div>
                <div className="metric-value" style={{ color: '#FF5E3A' }}>£{marketData.myPrice}</div>
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
                <div className="metric-value" style={{ color: '#22C55E' }}>£{marketData.avgPrice}</div>
              </div>
              <div className="metric-card">
                <div className="metric-label tooltip-container" style={{ marginBottom: '6px' }}>
                  Lowest Price <Info className="info-icon" size={14} style={{ marginLeft: '4px' }} />
                  <div className="tooltip-card" style={{ textTransform: 'none' }}>Lowest Price provided by: {lowestPriceRival}</div>
                </div>
                <div className="metric-value" style={{ color: '#EAB308' }}>£{marketData.lowPrice}</div>
              </div>
              <div className="metric-card">
                <div className="metric-label tooltip-container" style={{ marginBottom: '6px' }}>
                  Highest Price <Info className="info-icon" size={14} style={{ marginLeft: '4px' }} />
                  <div className="tooltip-card" style={{ textTransform: 'none' }}>Highest Price provided by: {highestPriceRival}</div>
                </div>
                <div className="metric-value" style={{ color: '#EF4444' }}>£{marketData.highPrice}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Center Column - Interactive Market Hub */}
        <div style={{ flex: '1.4', padding: '3rem 1rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div className="audit-title" style={{ fontSize: '1.5rem' }}>Audit Command Center</div>
                <div className="platform-logo-badge rectangular" style={{ display: 'flex', alignItems: 'center', background: '#F3F4F6', padding: '6px 12px', borderRadius: '8px' }}>
                  <img src={`https://cdn.simpleicons.org/${platform === 'deliveroo' ? 'deliveroo/00CCBC' : platform === 'ubereats' ? 'ubereats/06C167' : 'justeat/FF5B00'}`} alt={platform} style={{ height: '20px', objectFit: 'contain' }} />
                </div>
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6B7280', marginTop: '0.25rem' }}>Local Market Position Analysis</div>
            </div>
          </div>

          {/* Thermometer Section */}
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#4B5563', marginBottom: '2.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Price Bar</div>
            
            <DualRangeSlider 
              minBound={marketData.lowPrice} 
              maxBound={marketData.highPrice} 
              minVal={rangeMin || marketData.lowPrice} 
              maxVal={rangeMax || marketData.highPrice} 
              onMinChange={setRangeMin} 
              onMaxChange={setRangeMax} 
            />
            
            {/* Manual Range Input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '3.5rem', marginBottom: '1.5rem' }}>
              <span className="manual-range-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Manual Range:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.875rem', color: '#6B7280', fontWeight: 600 }}>£</span>
                <input 
                  type="number" 
                  value={rangeMin} 
                  onChange={e => { setRangeMin(e.target.value); setActivePricePoint(null); }} 
                  placeholder="Min"
                  style={{ width: '70px', padding: '0.5rem', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '0.875rem', outline: 'none', background: '#F8FAFC' }}
                />
              </div>
              <span style={{ color: '#9CA3AF' }}>—</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.875rem', color: '#6B7280', fontWeight: 600 }}>£</span>
                <input 
                  type="number" 
                  value={rangeMax} 
                  onChange={e => { setRangeMax(e.target.value); setActivePricePoint(null); }} 
                  placeholder="Max"
                  style={{ width: '70px', padding: '0.5rem', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '0.875rem', outline: 'none', background: '#F8FAFC' }}
                />
              </div>
            </div>

            {/* Rivals Panel */}
            <div style={{ background: 'rgba(255,255,255,0.4)', borderRadius: '16px', padding: '1.5rem', border: '1px solid rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '1rem', height: '240px', overflowY: 'auto' }}>
              <div style={{ width: '100%', fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>{panelTitle}</div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignContent: 'flex-start' }}>
                {displayedRivals.length > 0 ? displayedRivals.map((rival, idx) => (
                    <div key={idx} style={{ background: '#fff', padding: '0.5rem 1rem 0.5rem 0.5rem', borderRadius: '9999px', display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                      <img src={rival.image} alt={rival.name} style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111' }}>{rival.name}</span>
                      <span style={{ fontSize: '0.875rem', color: '#6B7280', fontWeight: 500 }}>£{rival.price}</span>
                    </div>
                )) : <div style={{ fontSize: '0.875rem', color: '#9CA3AF' }}>No rivals found in this range.</div>}
              </div>
            </div>
          </div>

        </div>

        {/* Right Column - Strategic Action Center */}
        <div style={{ flex: '1.4', padding: '3rem', display: 'flex', flexDirection: 'column', background: 'transparent' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <button onClick={onClose} style={{ background: '#F3F4F6', border: 'none', cursor: 'pointer', color: '#4B5563', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#E5E7EB'} onMouseLeave={e => e.currentTarget.style.background = '#F3F4F6'}><X size={20} /></button>
          </div>

          <div style={{ marginTop: 'auto', marginBottom: 'auto', background: '#FFFFFF', borderRadius: '16px', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', maxHeight: '420px', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem 1.5rem 1rem 1.5rem', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
              <div style={{ color: '#E63946', fontWeight: 700, fontSize: '1.125rem' }}>
                Rival Offerings
              </div>
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {marketData.intervals.flatMap(interval => interval.rivals.filter(r => r.name !== 'You')).sort((a, b) => parseFloat(a.price) - parseFloat(b.price)).map((rival, index, arr) => (
                <div key={index} className="rival-offering-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: index < arr.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none' }}>
                  <div className="rival-meta" style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1' }}>
                    <img src={rival.image} alt={rival.name} style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: 500, color: '#111' }}>{activeItem.name}</span>
                      <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{rival.name}</span>
                    </div>
                  </div>
                  
                  <div className="platform-tag" style={{ flex: '0.6', display: 'flex', justifyContent: 'flex-end', paddingRight: '1rem' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src={`https://cdn.simpleicons.org/${rival.platform === 'Deliveroo' ? 'deliveroo/00CCBC' : rival.platform === 'UberEats' ? 'ubereats/06C167' : 'justeat/FF5B00'}`} alt={rival.platform} style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
                    </div>
                  </div>
                  
                  <div className="rival-price" style={{ flex: '0.4', textAlign: 'right' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: '#E63946' }}>£{rival.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AuditCommandCenterModal;
