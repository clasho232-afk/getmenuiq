import React from 'react';

const PlatformDataModal = ({ isOpen, onClose, platform }) => {
  if (!isOpen || !platform) return null;

  // Normalize platform name to ensure exact matching
  const platformKey = platform.name.toUpperCase().replace(/[^A-Z]/g, '');

  const brandColors = {
    UBEREATS: '#000000',
    DELIVEROO: '#00CCBC',
    JUSTEATS: '#F36D00',
  };

  const brandBanners = {
    UBEREATS: { bg: '#000000', text: '#FFFFFF', name: 'Uber Eats', domain: 'ubereats.com' },
    DELIVEROO: { bg: '#00CCBC', text: '#FFFFFF', name: 'Deliveroo', domain: 'deliveroo.co.uk' },
    JUSTEATS: { bg: '#F36D00', text: '#FFFFFF', name: 'Just Eat', domain: 'justeattakeaway.com' },
  };

  const banner = brandBanners[platformKey] || { bg: '#111', text: '#FFF', name: platform.name, domain: 'uber.com' };
  const color = brandColors[platformKey] || '#111';

  // Dummy mock data
  const data = {
    totalCompetitors: 142,
    ilford: 45,
    neighborhood: 97,
    avgDiscount: '15%',
    runningPromos: 89,
    notRunningPromos: 53
  };

  const promos = [
    { name: 'Burger King', type: 'Buy 1 Get 1 Free', status: 'Active', domain: 'burgerking.co.uk' },
    { name: 'Pizza Express', type: '20% Off Orders', status: 'Active', domain: 'pizzaexpress.com' },
    { name: 'Wagamama', type: 'Free Delivery', status: 'Active', domain: 'wagamama.com' },
    { name: 'KFC', type: 'Family Bucket Deal', status: 'Active', domain: 'kfc.co.uk' },
    { name: 'Subway', type: 'Free Cookie', status: 'Active', domain: 'subway.com' },
    { name: 'Nando\'s', type: 'Free Delivery', status: 'Active', domain: 'nandos.co.uk' },
    { name: 'Five Guys', type: '10% Off Orders', status: 'Active', domain: 'fiveguys.co.uk' },
  ];

  const categories = [
    { label: 'BOGO', value: 30, color: color },
    { label: '> 10% Discount', value: 25, color: '#3b82f6' },
    { label: '10% Discount', value: 14, color: '#ec4899' },
    { label: 'Free Delivery', value: 20, color: '#10b981' },
    { label: 'No promotion', value: 53, color: '#e2e8f0' },
  ];

  const total = categories.reduce((acc, curr) => acc + curr.value, 0);
  const activePercentage = total > 0 ? ((total - 53) / total) * 100 : 0;
  const radius = 15.91549430918954;
  const circumference = 100;

  // Helper to generate reliable avatar URLs
  const getLogoUrl = (domain) => `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  const getFallbackUrl = (name) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=e2e8f0&color=475569&rounded=true&bold=true`;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.4)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '2rem',
      fontFamily: '"Plus Jakarta Sans", Inter, sans-serif'
    }} onClick={onClose}>
      
      <div style={{
        width: '100%',
        maxWidth: '920px',
        backgroundColor: '#FAF9F6',
        borderRadius: '16px',
        boxShadow: '0px 10px 40px rgba(0,0,0,0.08), 0px 2px 10px rgba(0,0,0,0.04)',
        padding: '2rem',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        maxHeight: '90vh',
        overflow: 'hidden'
      }} onClick={e => e.stopPropagation()}>
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '2rem',
            right: '2rem',
            background: 'transparent',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
            padding: '0.5rem',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Section 1: Hero Header (Official Corporate Banner) */}
        <div style={{ display: 'flex', justifyContent: 'center', flexShrink: 0, marginTop: '0.5rem' }}>
          <div style={{
            width: '100%',
            maxWidth: '560px',
            height: '140px',
            backgroundColor: banner.bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '16px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <img 
                src={getLogoUrl(banner.domain)} 
                alt={`${banner.name} logo`}
                style={{ 
                  width: '70px', 
                  height: '70px', 
                  borderRadius: '50%', 
                  backgroundColor: '#fff',
                  border: `3px solid ${banner.text === '#FFFFFF' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  objectFit: 'contain',
                  padding: '4px'
                }} 
                onError={(e) => {
                  if (e.target.src !== getFallbackUrl(banner.name)) {
                    e.target.src = getFallbackUrl(banner.name);
                  }
                }}
              />
              <span style={{ 
                color: banner.text, 
                fontSize: '2.5rem', 
                fontWeight: 900, 
                letterSpacing: '-0.02em',
                textShadow: '0 2px 10px rgba(0,0,0,0.1)'
              }}>
                {banner.name}
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Horizontal Metric Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          borderRadius: '16px',
          padding: '0.75rem 1rem',
          boxShadow: '0px 4px 20px rgba(0,0,0,0.04)',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          flexShrink: 0
        }}>
          {[
            { label: 'Total Competitors', value: data.totalCompetitors },
            { label: 'Ilford', value: data.ilford },
            { label: 'Neighborhood', value: data.neighborhood },
            { label: 'Avg. Discount', value: data.avgDiscount }
          ].map((metric, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: 600, letterSpacing: '0.02em' }}>
                {metric.label}
              </span>
              <span style={{ fontSize: '20px', fontWeight: 800, color: '#E63946', lineHeight: 1 }}>
                {metric.value}
              </span>
            </div>
          ))}
        </div>

        {/* Section 3: Split-View Data Layer */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, minHeight: 0 }}>
          <h2 style={{
            margin: 0,
            fontSize: '1.25rem',
            fontWeight: 800,
            color: '#1e293b',
            letterSpacing: '-0.01em',
            flexShrink: 0
          }}>
            Promotion Distribution
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '35% 1fr',
            gap: '2.5rem',
            borderRadius: '16px',
            flex: 1,
            minHeight: 0
          }}>
            
            {/* Left Column (Donut Chart & Legend) */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              backgroundColor: 'rgba(255, 255, 255, 0.7)', 
              borderRadius: '16px', 
              padding: '1.25rem 1.5rem', 
              boxShadow: '0px 4px 20px rgba(0,0,0,0.04)',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              minHeight: 0 
            }}>
              
              {/* Legends */}
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.4rem', flexShrink: 0 }}>
                {categories.map((cat, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: cat.color }} />
                      <span style={{ color: '#475569', fontWeight: 600 }}>{cat.label}</span>
                    </div>
                    <span style={{ fontWeight: 800, color: '#1e293b' }}>{cat.value}</span>
                  </div>
                ))}
              </div>

              {/* Donut Chart */}
              <div style={{ 
                width: '130px', 
                height: '130px', 
                position: 'relative', 
                marginTop: 'auto', 
                paddingTop: '1rem', 
                flexShrink: 0
              }}>
                <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                  {(() => {
                    let cumulativePercent = 0;
                    return categories.map((cat, idx) => {
                      const percent = (cat.value / total) * 100;
                      const dasharray = `${percent} ${circumference - percent}`;
                      const dashoffset = 100 - cumulativePercent;
                      cumulativePercent += percent;
                      return (
                        <circle 
                          key={idx}
                          cx="18" cy="18" r={radius}
                          fill="transparent"
                          stroke={cat.color}
                          strokeWidth="2.5"
                          strokeDasharray={dasharray}
                          strokeDashoffset={dashoffset}
                        />
                      );
                    });
                  })()}
                </svg>
                <div style={{
                  position: 'absolute',
                  top: '1rem', 
                  left: 0, right: 0, bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  gap: '0.1rem'
                }}>
                  <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>Active</span>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', lineHeight: 1.2 }}>{Math.round(activePercentage)}%</span>
                </div>
              </div>

            </div>

            {/* Right Column (Promo Feed) */}
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
              
              {/* Table Header */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '3fr 1.5fr 1fr', 
                paddingBottom: '0.75rem',
                borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                fontSize: '11px',
                color: '#64748b',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.02em',
                flexShrink: 0,
                paddingRight: '1rem',
                paddingLeft: '1rem'
              }}>
                <div>Promos</div>
                <div style={{ textAlign: 'center' }}>Type</div>
                <div style={{ textAlign: 'right' }}>Status</div>
              </div>

              {/* Table Body (Scrollable) */}
              <div style={{ 
                flex: 1, 
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                paddingRight: '0.5rem',
                paddingBottom: '1rem',
                paddingTop: '0.5rem',
                gap: '0.5rem'
              }}>
                {promos.map((promo, idx) => (
                  <div key={idx} style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '3fr 1.5fr 1fr', 
                    padding: '0.8rem 1rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    borderRadius: '12px',
                    boxShadow: '0px 2px 10px rgba(0,0,0,0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                    alignItems: 'center'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img 
                        src={getLogoUrl(promo.domain)} 
                        alt={promo.name}
                        style={{ 
                          width: '28px', 
                          height: '28px', 
                          borderRadius: '50%', 
                          backgroundColor: '#fff',
                          objectFit: 'contain',
                          padding: '2px',
                          border: '1px solid rgba(0,0,0,0.05)'
                        }} 
                        onError={(e) => {
                          if (e.target.src !== getFallbackUrl(promo.name)) {
                            e.target.src = getFallbackUrl(promo.name);
                          }
                        }}
                      />
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>{promo.name}</span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#475569', textAlign: 'center', fontWeight: 500 }}>
                      {promo.type}
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#E63946', textAlign: 'right' }}>
                      {promo.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default PlatformDataModal;
