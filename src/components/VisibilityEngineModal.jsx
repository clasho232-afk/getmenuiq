import React, { useState } from 'react';
import { X, Clock, Megaphone, BadgePercent, Image as ImageIcon, AlertTriangle, CheckCircle2, Info, ChevronDown, Upload, RefreshCw, Star, FileText, Ban, Navigation } from 'lucide-react';

const VisibilityEngineModal = ({ isOpen, onClose, initialPlatform, restaurantData }) => {
  const [selectedPlatform, setSelectedPlatform] = useState(initialPlatform && initialPlatform !== 'All' ? initialPlatform : 'Deliveroo');
  
  if (!isOpen) return null;


  const platforms = [
    { id: 'Deliveroo', label: 'Deliveroo', icon: (
      <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6zm4 4h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
    ) },
    { id: 'Uber Eats', label: 'Uber Eats', icon: (
      <span style={{ fontWeight: 900, fontSize: '0.5rem', lineHeight: 1, textAlign: 'center', padding: '1px 3px', borderRadius: '3px', backgroundColor: 'rgba(6,193,103,0.1)', color: '#06C167' }}>Uber<br/>Eats</span>
    ) },
    { id: 'Just Eat', label: 'Just Eat', icon: (
      <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3L4 9v12h16V9l-8-6zm-1 14H8v-5h3v5zm5 0h-3v-5h3v5z"/></svg>
    ) }
  ];

  // Mock data if not provided
  const data = restaurantData || {
    rating: 4.6,
    hasPromotion: true,
    promotionText: 'Save 50% on £15+',
    itemCount: 45,
    deliveryFee: 'Free Delivery',
    photoCoverage: 82,
    descriptionCoverage: 75,
    badPhotos: [
      { id: 1, name: 'Spicy Chicken Wings', issue: 'Low resolution image (400x300)', image: 'https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?auto=format&fit=crop&w=64&q=80' },
      { id: 2, name: 'Vegan Burger', issue: 'Missing photo completely', image: 'https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?auto=format&fit=crop&w=64&q=80' }
    ],
    badDescriptions: [
      { id: 1, name: 'House Salad', issue: 'Description too short (under 10 words)', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=64&q=80' },
      { id: 2, name: 'Garlic Bread', issue: 'Missing ingredients list', image: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?auto=format&fit=crop&w=64&q=80' },
      { id: 3, name: 'Spicy Chicken Wings', issue: 'Missing description completely', image: 'https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?auto=format&fit=crop&w=64&q=80' }
    ]
  };

  // Compute Platform Specific Score
  const getPlatformScore = (platform, data) => {
    let score = 0;
    if (platform === 'Uber Eats') {
      if (data.rating >= 4.5) score += 50;
      else if (data.rating >= 4.3) score += 35;
      else if (data.rating >= 4.0) score += 15;
      else score += 5;

      if (data.hasPromotion) score += 30;
      
      if (data.photoCoverage >= 80) score += 10;
      else if (data.photoCoverage >= 50) score += 5;

      if (data.descriptionCoverage >= 70) score += 10;
      else if (data.descriptionCoverage >= 50) score += 5;
    } else if (platform === 'Deliveroo') {
      if (data.rating >= 4.5) score += 40;
      else if (data.rating >= 4.3) score += 30;
      else if (data.rating >= 4.0) score += 15;
      else score += 5;

      if (data.hasPromotion) score += 20;

      if (data.photoCoverage >= 80) score += 20;
      else if (data.photoCoverage >= 50) score += 10;
      
      if (data.descriptionCoverage >= 70) score += 20;
      else if (data.descriptionCoverage >= 50) score += 10;
    } else if (platform === 'Just Eat') {
      if (data.rating >= 4.3) score += 30;
      else if (data.rating >= 4.0) score += 20;
      else score += 5;

      if (data.hasPromotion) score += 10;

      if (data.photoCoverage >= 80) score += 30;
      else if (data.photoCoverage >= 50) score += 15;
      
      if (data.descriptionCoverage >= 71) score += 30;
      else if (data.descriptionCoverage >= 50) score += 15;
    }
    return score;
  };

  const autoScore = getPlatformScore(selectedPlatform, data);

  let scoreColor = '#ef4444';
  if (autoScore >= 80) scoreColor = '#10b981';
  else if (autoScore >= 60) scoreColor = '#f59e0b';
  else if (autoScore >= 40) scoreColor = '#f97316';


  const renderScoreBar = (platformId, score) => {
    let numColor = '#ef4444';
    if (score >= 80) numColor = '#10b981';
    else if (score >= 60) numColor = '#f59e0b';
    
    const platform = platforms.find(p => p.id === platformId);
    
    let barColor = '#06C167';
    if (platformId === 'Deliveroo') barColor = '#00CCBC';
    else if (platformId === 'Just Eat') barColor = '#FF8000';
    
    return (
      <div key={platformId} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', padding: '0 1rem' }}>
        <div style={{ 
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          width: '38px', height: '30px', 
          borderRadius: '9999px', 
          backgroundColor: barColor,
          boxShadow: `0 4px 12px ${barColor}40`
        }}>
           <img 
             src={`https://cdn.simpleicons.org/${platformId.toLowerCase().replace(' ', '')}`} 
             alt={platformId}
             style={{ width: '18px', height: '18px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
           />
        </div>
        <div style={{ width: '120px', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: `${score}%`, height: '100%', backgroundColor: barColor, borderRadius: '9999px', transition: 'width 0.5s ease-in-out' }} />
        </div>
        <div style={{ fontSize: '0.9rem', fontWeight: 800, color: numColor, marginTop: '2px' }}>{score}<span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>/100</span></div>
      </div>
    );
  };

  return (
    <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, zIndex: 9999, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Modal Container */}
      <div style={{ backgroundColor: '#FCFAF6', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', position: 'relative', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
        
        {/* Close Button */}
        <button onClick={onClose} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', backgroundColor: 'transparent', color: '#94a3b8', border: 'none', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#0f172a'} onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}>
          <X size={20} strokeWidth={2} />
        </button>

        {/* Header Section */}
        <div style={{ padding: '2rem 2.5rem 0' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '6px' }}>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em' }}>Visibility Engine</h1>
            {/* Score in header immediately to the right */}
            <div style={{ display: 'flex', alignItems: 'baseline', borderLeft: '1px solid #e2e8f0', paddingLeft: '1.5rem' }}>
              <span style={{ fontSize: '1.75rem', fontWeight: 800, color: scoreColor, lineHeight: 1, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>{autoScore}</span>
              <span style={{ fontSize: '1rem', fontWeight: 600, color: '#94a3b8', marginLeft: '2px' }}>/100</span>
            </div>
          </div>
          
          <p style={{ margin: '0 0 1.5rem', fontSize: '0.9rem', color: '#64748b' }}>Analyze real-time visibility and operational metrics.</p>
        </div>

        <div style={{ padding: '0 2.5rem 2.5rem', flex: 1 }}>
          
          {/* Platform Score Bars */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2.5rem', backgroundColor: '#ffffff', border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', borderRadius: '12px', padding: '1.5rem 0' }}>
            {renderScoreBar('Uber Eats', getPlatformScore('Uber Eats', data))}
            <div style={{ width: '1px', height: '40px', backgroundColor: '#e2e8f0' }} />
            {renderScoreBar('Deliveroo', getPlatformScore('Deliveroo', data))}
            <div style={{ width: '1px', height: '40px', backgroundColor: '#e2e8f0' }} />
            {renderScoreBar('Just Eat', getPlatformScore('Just Eat', data))}
          </div>

          {/* Visibility on Platforms (Line-based) */}
          <div style={{ marginTop: '0.5rem', marginBottom: '2.5rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Visibility on Platforms</h3>

            <div style={{ borderBottom: '1px solid #e2e8f0' }}>
              {/* Table Header using precise official logos and line-based styling */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px', padding: '0.75rem 0', borderBottom: '1px solid #e2e8f0', alignItems: 'center' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Keyword Target</div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#06C167' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM12 20c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/><path d="M11 7h2v6h-2zM11 15h2v2h-2z"/></svg>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Uber Eats</span>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#00CCBC' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM12 20c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/><circle cx="9" cy="10" r="1.5"/><circle cx="15" cy="10" r="1.5"/><path d="M12 16c-1.66 0-3-1.34-3-3h6c0 1.66-1.34 3-3 3z"/></svg>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Deliveroo</span>
                  </div>
                </div>
              </div>

              {[
                { keyword: '"Pizza"', ue: 10, del: 12 },
                { keyword: '"Burgers"', ue: 4, del: 6 },
                { keyword: '"Fried Chicken"', ue: 15, del: 18 }
              ].map((row, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px', padding: '1rem 0', borderBottom: idx !== 2 ? '1px solid #f1f5f9' : 'none', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' }}>{row.keyword}</div>
                  <div style={{ textAlign: 'center', fontSize: '0.9rem', fontWeight: 700, color: row.ue <= 5 ? '#10b981' : row.ue <= 15 ? '#f59e0b' : '#ef4444', fontVariantNumeric: 'tabular-nums' }}>#{row.ue}</div>
                  <div style={{ textAlign: 'center', fontSize: '0.9rem', fontWeight: 700, color: row.del <= 5 ? '#10b981' : row.del <= 15 ? '#f59e0b' : '#ef4444', fontVariantNumeric: 'tabular-nums' }}>#{row.del}</div>
                </div>
              ))}
            </div>
            
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '8px', fontStyle: 'italic' }}>
              * Keyword rankings are currently simulated until direct integration is available.
            </div>
          </div>
          
          {/* Tab Navigation moved here */}
          <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
            {platforms.map(platform => {
              const isActive = selectedPlatform === platform.id;
              const pScore = getPlatformScore(platform.id, data);
              const pColor = pScore >= 80 ? '#10b981' : pScore >= 60 ? '#f59e0b' : '#ef4444';
              return (
                <button
                  key={platform.id}
                  onClick={() => setSelectedPlatform(platform.id)}
                  style={{
                    padding: '0 0 12px 0',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    background: 'none',
                    border: 'none',
                    borderBottom: isActive ? '2px solid #C85A17' : '2px solid transparent',
                    color: isActive ? '#1e293b' : '#64748b',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    marginBottom: '-1px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {platform.icon && (
                    <span style={{ 
                      color: platform.id === 'Deliveroo' ? '#00CCBC' : platform.id === 'Just Eat' ? '#FF8000' : 'inherit',
                      display: 'flex', alignItems: 'center'
                    }}>
                      {platform.icon}
                    </span>
                  )}
                  {platform.label}
                  <span style={{ marginLeft: '4px', padding: '2px 6px', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700, backgroundColor: isActive ? `${pColor}15` : '#f1f5f9', color: isActive ? pColor : '#94a3b8' }}>
                    {pScore}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisibilityEngineModal;
