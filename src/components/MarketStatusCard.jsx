import React, { useState } from 'react';
import PlatformDataModal from './PlatformDataModal';

const MarketStatusCard = () => {
  const [selectedPlatform, setSelectedPlatform] = useState(null);

  const platforms = [
    {
      name: 'UBEREATS',
      logoBg: '#000000',
      status: 'Quiet',
      statusColor: '#10B981',
      isPulse: false
    },
    {
      name: 'DELIVEROO',
      logoBg: '#00CCBC',
      status: 'Busy',
      statusColor: '#F59E0B',
      isPulse: false
    },
    {
      name: 'JUSTEATS',
      logoBg: '#F36D00',
      status: 'Hyper',
      statusColor: '#E63946',
      isPulse: true
    }
  ];

  return (
    <>
      <div style={{
        width: '100%',
      height: '100%',
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      boxShadow: '0px 4px 20px rgba(0,0,0,0.04)',
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#111', margin: 0, letterSpacing: '-0.02em', fontFamily: 'Inter, sans-serif' }}>
          Live Market Status
        </h3>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981', animation: 'live-pulse 2s infinite' }} />
      </div>

      {/* Rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1, justifyContent: 'center' }}>
        {platforms.map((platform, idx) => (
          <div 
            key={idx} 
            onClick={() => setSelectedPlatform(platform)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              cursor: 'pointer',
              padding: '0.5rem',
              margin: '-0.5rem',
              borderRadius: '12px',
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
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
                color: '#fff',
                flexShrink: 0,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                {platform.name === 'UBEREATS' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '0.55rem', fontWeight: 800, lineHeight: 1.1 }}>
                    <span>Uber</span>
                    <span>Eats</span>
                  </div>
                ) : platform.name === 'DELIVEROO' ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H8v-2h3v2zm4 0h-3v-2h3v2zm1-4H8V9h8v3z"/>
                  </svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                  </svg>
                )}
              </div>
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#111', letterSpacing: '0.02em', fontFamily: 'Inter, sans-serif' }}>
                {platform.name}
              </span>
            </div>

            {/* Right: Status Pill */}
            <div style={{ 
              backgroundColor: `${platform.statusColor}15`, 
              color: platform.statusColor,
              padding: '0.4rem 1rem',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              position: 'relative'
            }}>
              {platform.status}
              {platform.isPulse && (
                <div style={{ 
                  position: 'absolute', 
                  top: 0, left: 0, right: 0, bottom: 0, 
                  borderRadius: '9999px', 
                  border: `1px solid ${platform.statusColor}`,
                  animation: 'pill-pulse 2s cubic-bezier(0, 0, 0.2, 1) infinite',
                }} />
              )}
            </div>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes live-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }
        @keyframes pill-pulse {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.3); opacity: 0; }
        }
      `}</style>
      </div>
      
      <PlatformDataModal 
        isOpen={!!selectedPlatform} 
        onClose={() => setSelectedPlatform(null)} 
        platform={selectedPlatform} 
      />
    </>
  );
};

export default MarketStatusCard;
