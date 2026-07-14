import React from 'react';

const MarketStatusCard = () => {
  const platforms = [
    {
      name: 'Uber Eats',
      platformKey: 'ubereats',
      logoBg: '#06C167',
      iconUrl: 'https://cdn.simpleicons.org/ubereats/white',
      status: 'Quiet',
      statusColor: '#10B981', // Green
      isPulse: false
    },
    {
      name: 'Deliveroo',
      platformKey: 'deliveroo',
      logoBg: '#00CCBC',
      iconUrl: 'https://cdn.simpleicons.org/deliveroo/white',
      status: 'Busy',
      statusColor: '#F59E0B', // Amber
      isPulse: false
    },
    {
      name: 'Just Eat',
      platformKey: 'justeats',
      logoBg: '#F36D00',
      iconUrl: 'https://cdn.simpleicons.org/justeat/white',
      status: 'Hyper',
      statusColor: '#E63946', // Red
      isPulse: true
    }
  ];

  return (
    <div className="harmonized-card-bg transition-transform duration-300 hover:-translate-y-1" style={{
      width: '100%',
      height: '100%',
      borderRadius: '16px',
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '16px', marginBottom: '16px' }}>
        <h3 className="font-bold tracking-normal" style={{ fontSize: '1.15rem', color: '#111', margin: 0, fontFamily: 'Inter, sans-serif' }}>
          Live Market Status
        </h3>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981', animation: 'live-pulse 2s infinite' }} />
      </div>

      {/* Rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1, justifyContent: 'center' }}>
        {platforms.map((platform, idx) => (
          <div key={idx} style={{ position: 'relative' }}>
            <div 
              onClick={() => {
                window.dispatchEvent(new CustomEvent('open-promo-intel', { detail: { platform: platform.platformKey } }));
              }}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                cursor: 'pointer',
                padding: '0.75rem',
                margin: '-0.75rem',
                borderRadius: '12px',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                border: '1px solid transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `${platform.statusColor}15`;
                e.currentTarget.style.border = `1px solid ${platform.statusColor}30`;
                e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.border = '1px solid transparent';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              
              {/* Left: Logo + Name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  backgroundColor: platform.logoBg, 
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  <img 
                    src={platform.iconUrl} 
                    alt={`${platform.name} Logo`} 
                    style={{ width: '22px', height: '22px', objectFit: 'contain' }}
                  />
                </div>
                <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#334155', letterSpacing: '0.01em', fontFamily: 'Inter, sans-serif' }}>
                  {platform.name}
                </span>
              </div>

              {/* Right: Minimalist Dot Indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingRight: '0.5rem' }}>
                <div style={{ 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  backgroundColor: platform.statusColor, 
                  boxShadow: `0 0 8px ${platform.statusColor}80`,
                  animation: platform.isPulse ? 'live-pulse 1.5s infinite' : 'none'
                }} />
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#475569' }}>{platform.status}</span>
              </div>

            </div>

            {/* Charcoal Division Line positioned absolutely so it doesn't break flex math */}
            {idx < platforms.length - 1 && (
              <div style={{ 
                position: 'absolute',
                bottom: '-0.75rem',
                left: 0,
                right: 0,
                height: '1px', 
                backgroundColor: 'rgba(30, 41, 59, 0.08)' 
              }} />
            )}
          </div>
        ))}
      </div>
      <style>{`
        @keyframes live-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }
      `}</style>
    </div>
  );
};

export default MarketStatusCard;
