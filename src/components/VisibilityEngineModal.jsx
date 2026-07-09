import React, { useState } from 'react';
import { X, Clock, Megaphone, BadgePercent, Image as ImageIcon, AlertTriangle, CheckCircle2, Info, ChevronDown, Upload, RefreshCw, Star, FileText, Ban, Navigation } from 'lucide-react';

const VisibilityEngineModal = ({ isOpen, onClose, initialPlatform, restaurantData }) => {
  const [selectedPlatform, setSelectedPlatform] = useState(initialPlatform && initialPlatform !== 'All' ? initialPlatform : 'Deliveroo');
  const [expandedRow, setExpandedRow] = useState(null);
  
  // Manual Fix states
  const [manualChecks, setManualChecks] = useState({
    photos: false,
    descriptions: false,
    cancellations: false,
    prepTime: false,
    hours: true,
    reviews: false
  });
  
  if (!isOpen) return null;

  const toggleRow = (row) => {
    setExpandedRow(prev => prev === row ? null : row);
  };
  
  const handleCheck = (key) => {
    setManualChecks(prev => ({...prev, [key]: !prev[key]}));
  };

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

  // Define per-platform manual checks logic
  const getManualMetrics = (platform) => {
    let metrics = [];
    if (platform === 'Deliveroo') {
      metrics = [
        { id: 'prepTime', title: 'Preparation Time', research: 'Orders accepted in under 90 seconds rank higher. Consistent ETAs build trust.', icon: <Clock size={16}/> },
        { id: 'cancellations', title: 'Order Cancellations', research: 'Every rejected order directly reduces your Value Score.', icon: <Ban size={16}/> }
      ];
    } else if (platform === 'Uber Eats') {
      metrics = [
        { id: 'cancellations', title: 'Cancellation Rate', research: 'Keep below 3%. Each rejected order suppresses your ranking.', icon: <Ban size={16}/> },
        { id: 'prepTime', title: 'Preparation Time', research: 'Consistent, accurate ETAs improve experience and ranking.', icon: <Clock size={16}/> },
      ];
    } else if (platform === 'Just Eat') {
      metrics = [
        { id: 'cancellations', title: 'Cancellation Rate', research: 'Keep below 1.3%. This is the strictest factor on Just Eat.', icon: <Ban size={16}/> },
        { id: 'hours', title: 'Opening Hours Accuracy', research: 'Being listed as open when you\'re closed triggers a penalty.', icon: <Clock size={16}/> }
      ];
    }
    return metrics;
  };

  const manualMetrics = getManualMetrics(selectedPlatform);

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
      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', position: 'relative', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
        
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
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2.5rem', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem 0' }}>
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

          {/* New Sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            
            {/* Auto-Tracked Section */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <h4 style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>⚡ Auto-Tracked Metrics</h4>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }}></div>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>These are calculated directly from your live menu data on the platform.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {/* Rating */}
                <div style={{ borderBottom: '1px solid #f1f5f9', padding: '1rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#fef3c7', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Star size={16} fill="currentColor" />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' }}>Star Rating</h3>
                      <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>{data.rating} / 5.0</p>
                    </div>
                  </div>
                  <div style={{ backgroundColor: data.rating >= 4.5 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', color: data.rating >= 4.5 ? '#10b981' : '#f59e0b', padding: '4px 10px', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {data.rating >= 4.5 ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                    {data.rating >= 4.5 ? 'EXCELLENT' : 'NEEDS ACTION'}
                  </div>
                </div>

                {/* Promotions */}
                <div style={{ borderBottom: '1px solid #f1f5f9', padding: '1rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <BadgePercent size={36} fill="#dc2626" color="white" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' }}>Active Promotions</h3>
                      <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>{data.hasPromotion ? data.promotionText : 'No active campaigns'}</p>
                    </div>
                  </div>
                  <div style={{ backgroundColor: data.hasPromotion ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: data.hasPromotion ? '#10b981' : '#ef4444', padding: '4px 10px', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {data.hasPromotion ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                    {data.hasPromotion ? 'OPTIMAL' : 'CRITICAL'}
                  </div>
                </div>

                {/* Menu Photos */}
                <div>
                  <div onClick={() => toggleRow('photos')} style={{ cursor: 'pointer', borderBottom: expandedRow === 'photos' ? 'none' : '1px solid #f1f5f9', padding: '1rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src="/menu_photos_icon.png" alt="Menu Photos" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' }}>Menu Photos</h3>
                        <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>{data.photoCoverage}% coverage</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ backgroundColor: data.photoCoverage >= 80 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', color: data.photoCoverage >= 80 ? '#10b981' : '#f59e0b', padding: '4px 10px', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {data.photoCoverage >= 80 ? <CheckCircle2 size={14} /> : <Info size={14} />}
                        {data.photoCoverage >= 80 ? 'OPTIMAL' : 'NEEDS ACTION'}
                      </div>
                      <ChevronDown size={16} color="#94a3b8" style={{ transform: expandedRow === 'photos' ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                    </div>
                  </div>
                  {expandedRow === 'photos' && data.badPhotos && data.badPhotos.length > 0 && (
                    <div style={{ padding: '0 0 1rem 3rem', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ backgroundColor: '#f8fafc', borderRadius: '8px', padding: '1rem' }}>
                        <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Items Needing Photos ({data.badPhotos.length})</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          {data.badPhotos.map(item => (
                            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <img src={item.image} alt={item.name} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                                <div>
                                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>{item.name}</div>
                                  <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '2px' }}>{item.issue}</div>
                                </div>
                              </div>
                              <button style={{ backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '6px', padding: '0.4rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#334155'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0f172a'}>
                                <ImageIcon size={14} /> Generate Image
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Item Descriptions */}
                <div>
                  <div onClick={() => toggleRow('descriptions')} style={{ cursor: 'pointer', padding: '1rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ 
                        width: '36px', height: '36px', borderRadius: '50%', 
                        background: 'radial-gradient(circle at 30% 30%, #ffe600, #ffb300)', 
                        boxShadow: 'inset -2px -2px 6px rgba(0,0,0,0.1), inset 2px 2px 6px rgba(255,255,255,0.7), 0 2px 4px rgba(0,0,0,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center' 
                      }}>
                        <img src="/item_descriptions_icon.png" alt="Item Descriptions" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' }}>Item Descriptions</h3>
                        <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>{data.descriptionCoverage}% coverage</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ backgroundColor: data.descriptionCoverage >= 71 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', color: data.descriptionCoverage >= 71 ? '#10b981' : '#f59e0b', padding: '4px 10px', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {data.descriptionCoverage >= 71 ? <CheckCircle2 size={14} /> : <Info size={14} />}
                        {data.descriptionCoverage >= 71 ? 'OPTIMAL' : 'NEEDS ACTION'}
                      </div>
                      <ChevronDown size={16} color="#94a3b8" style={{ transform: expandedRow === 'descriptions' ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                    </div>
                  </div>
                  {expandedRow === 'descriptions' && data.badDescriptions && data.badDescriptions.length > 0 && (
                    <div style={{ padding: '0 0 1rem 3rem' }}>
                      <div style={{ backgroundColor: '#f8fafc', borderRadius: '8px', padding: '1rem' }}>
                        <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Items Needing Descriptions ({data.badDescriptions.length})</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          {data.badDescriptions.map(item => (
                            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <img src={item.image} alt={item.name} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                                <div>
                                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>{item.name}</div>
                                  <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '2px' }}>{item.issue}</div>
                                </div>
                              </div>
                              <button style={{ backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '6px', padding: '0.4rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#334155'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0f172a'}>
                                <FileText size={14} /> Generate Description
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Manual Fix Section */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <h4 style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, color: '#C85A17', textTransform: 'uppercase', letterSpacing: '0.05em' }}>✋ Requires Your Action</h4>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }}></div>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>We can't access these metrics automatically. Check your partner hub and mark them off.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {manualMetrics.map((metric, idx) => {
                  const isChecked = manualChecks[metric.id];
                  const isExpanded = expandedRow === metric.id;
                  
                  return (
                    <div key={metric.id} style={{ borderBottom: idx < manualMetrics.length - 1 ? '1px solid #f1f5f9' : 'none', display: 'flex', flexDirection: 'column' }}>
                      <div 
                        style={{ padding: '1rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                        onClick={() => toggleRow(metric.id)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ 
                            width: '36px', height: '36px', borderRadius: '50%', 
                            background: 'radial-gradient(circle at 30% 30%, #ffe600, #ffb300)', 
                            boxShadow: 'inset -2px -2px 6px rgba(0,0,0,0.1), inset 2px 2px 6px rgba(255,255,255,0.7), 0 2px 4px rgba(0,0,0,0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center' 
                          }}>
                            {React.cloneElement(metric.icon, { color: '#000', size: 18 })}
                          </div>
                          <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' }}>{metric.title}</h3>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ backgroundColor: isChecked ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: isChecked ? '#10b981' : '#ef4444', padding: '4px 10px', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {isChecked ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                            {isChecked ? 'DONE' : 'NEEDS ACTION'}
                          </div>
                          <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center' }}>
                            <ChevronDown size={18} style={{ transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                          </span>
                        </div>
                      </div>
                      
                      {isExpanded && (
                        <div style={{ padding: '0 0 1.5rem 0', paddingLeft: '3rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          <div style={{ fontSize: '0.875rem', color: '#64748b', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '8px', borderLeft: '3px solid #C85A17' }}>
                            <strong style={{ color: '#0f172a' }}>Why it matters:</strong> {metric.research}
                          </div>
                          
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                            <input 
                              type="checkbox" 
                              checked={isChecked}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleCheck(metric.id);
                              }}
                              style={{ width: '18px', height: '18px', accentColor: '#10b981', cursor: 'pointer' }}
                            />
                            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>
                              I have optimized this in my {selectedPlatform} Partner Hub.
                            </span>
                          </label>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default VisibilityEngineModal;
