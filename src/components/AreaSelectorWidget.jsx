import React, { useState, useEffect } from 'react';
import { Search, MapPin, ChevronDown, Loader2, Check } from 'lucide-react';

const AreaSelectorWidget = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedAreas, setSelectedAreas] = useState(['Ilford']);
  const [pendingAreas, setPendingAreas] = useState(['Ilford']);
  const [searchQuery, setSearchQuery] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const availableAreasData = [
    { name: 'Barking', competitors: 142, promos: 56 },
    { name: 'Gants Hill', competitors: 89, promos: 34 },
    { name: 'Stratford', competitors: 310, promos: 120 },
    { name: 'Whitechapel', competitors: 245, promos: 98 },
    { name: 'Shoreditch', competitors: 412, promos: 185 },
    { name: 'Camden', competitors: 380, promos: 150 },
    { name: 'Canary Wharf', competitors: 290, promos: 110 },
    { name: 'Hackney', competitors: 210, promos: 85 },
    { name: 'Islington', competitors: 320, promos: 140 },
    { name: 'Wembley', competitors: 180, promos: 70 },
  ];

  useEffect(() => {
    const stored = localStorage.getItem('menu_iq_monitored_areas');
    if (stored) {
      setSelectedAreas(JSON.parse(stored));
      setPendingAreas(JSON.parse(stored));
    }
  }, []);

  return (
    <div style={{ position: 'relative' }}>
      <div 
        onClick={() => {
          if (!isDropdownOpen) {
            setPendingAreas([...selectedAreas]);
          }
          setIsDropdownOpen(!isDropdownOpen);
        }}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.3rem',
          background: 'transparent',
          border: 'none',
          padding: '0.3rem 0.4rem',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'background 0.2s',
          color: '#111',
          fontFamily: 'Inter, system-ui, sans-serif'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.04)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        <span style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: 700, marginRight: '0.1rem' }}>Monitoring:</span>
        <MapPin size={14} color="#E05046" strokeWidth={2.5} />
        <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>
          {selectedAreas.length === 1 ? selectedAreas[0] : `${selectedAreas.length} Areas`}
        </span>
        <ChevronDown size={12} color="#6B7280" />
      </div>

      {isDropdownOpen && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 0.25rem)', left: 0,
          background: '#fff',
          border: '1px solid #E5E7EB',
          borderRadius: '12px',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
          width: '320px',
          overflow: 'hidden',
          zIndex: 100,
          fontFamily: 'Inter, system-ui, sans-serif'
        }}>
          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #F3F4F6', background: '#FAFAFA' }}>
            <h4 style={{ margin: 0, fontSize: '0.75rem', color: '#6B7280', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Monitoring Areas
            </h4>
          </div>

          <div style={{ padding: '0.5rem 1rem', borderBottom: '1px solid #F3F4F6' }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} color="#9CA3AF" style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                placeholder="Search areas..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ 
                  width: '100%', padding: '0.4rem 0.5rem 0.4rem 24px', 
                  fontSize: '0.8rem', border: '1px solid #E5E7EB', borderRadius: '6px',
                  outline: 'none', background: '#F9FAFB',
                  fontFamily: 'Inter, system-ui, sans-serif'
                }} 
              />
            </div>
          </div>
          
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {pendingAreas.map((area, index) => (
              <div 
                key={area} 
                onClick={() => {
                  if (pendingAreas.length === 1) return;
                  const newAreas = pendingAreas.filter(a => a !== area);
                  setPendingAreas(newAreas);
                }}
                style={{ 
                  padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid #F3F4F6',
                  cursor: pendingAreas.length > 1 ? 'pointer' : 'default',
                  background: '#FAFAF8'
                }}
              >
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#059669', flexShrink: 0 }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#111' }}>{area}</span>
                {index === 0 && (
                  <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: '#9CA3AF', background: '#E5E7EB', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>Primary</span>
                )}
              </div>
            ))}

            {availableAreasData
              .filter(a => !pendingAreas.includes(a.name) && a.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .map(areaData => (
              <div 
                key={areaData.name}
                onClick={() => {
                  const newAreas = [...pendingAreas, areaData.name];
                  setPendingAreas(newAreas);
                  setSearchQuery('');
                }}
                style={{ 
                  padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid #F3F4F6',
                  cursor: 'pointer', transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#F9FAFB';
                  e.currentTarget.querySelector('.hover-add').style.opacity = '1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.querySelector('.hover-add').style.opacity = '0';
                }}
              >
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', border: '1px solid #D1D5DB', flexShrink: 0 }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                  <span style={{ fontSize: '0.85rem', color: '#4B5563' , textTransform: 'uppercase', letterSpacing: '0.05em'}}>{areaData.name}</span>
                  <span style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>{areaData.competitors} competitors • {areaData.promos} promos</span>
                </div>
                <span className="hover-add" style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#E05046', fontWeight: 800, opacity: 0, transition: 'opacity 0.2s' }}>+ Add</span>
              </div>
            ))}
          </div>

          {JSON.stringify(pendingAreas) !== JSON.stringify(selectedAreas) && (
            <div style={{ padding: '0.75rem', background: '#FAFAFA', borderTop: '1px solid #E5E7EB' }}>
              <button 
                onClick={() => {
                  setIsDropdownOpen(false);
                  setIsApplying(true);
                  setLoadingStep(0);

                  setTimeout(() => setLoadingStep(1), 1500);
                  setTimeout(() => setLoadingStep(2), 3000);
                  setTimeout(() => setLoadingStep(3), 4500);

                  setTimeout(() => {
                    setSelectedAreas(pendingAreas);
                    localStorage.setItem('menu_iq_monitored_areas', JSON.stringify(pendingAreas));
                    window.dispatchEvent(new CustomEvent('monitoring-areas-updated', { detail: pendingAreas }));
                    setIsApplying(false);
                  }, 8000);
                }}
                style={{ 
                  width: '100%', padding: '0.6rem', borderRadius: '8px', border: 'none',
                  background: '#E05046', color: '#fff',
                  fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 6px -1px rgba(224,80,70,0.3)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                Apply Changes
              </button>
            </div>
          )}
        </div>
      )}

      {isApplying && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(8px)',
          zIndex: 10000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}>
          <style>
            {`
              @keyframes menuIqSpin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
              @keyframes menuIqPulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
              }
              @keyframes popIn {
                0% { transform: scale(0.5); opacity: 0; }
                100% { transform: scale(1); opacity: 1; }
              }
            `}
          </style>
          <div style={{ animation: loadingStep < 3 ? 'menuIqPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none' }}>
            {loadingStep < 3 ? (
              <Loader2 size={64} color="#E05046" style={{ animation: 'menuIqSpin 1s linear infinite' }} />
            ) : (
              <div style={{ 
                width: '64px', height: '64px', borderRadius: '50%', background: '#059669',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: 'popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
              }}>
                <Check size={40} color="#fff" strokeWidth={3} />
              </div>
            )}
          </div>
          <h2 style={{ marginTop: '2rem', fontSize: '1.5rem', fontWeight: 800, color: '#111', fontFamily: 'Inter, system-ui, sans-serif', letterSpacing: '-0.02em' }}>
            {loadingStep === 0 && "Aggregating Market Data..."}
            {loadingStep === 1 && "Analyzing Competitor Pricing..."}
            {loadingStep === 2 && "Extracting Promo Strategies..."}
            {loadingStep === 3 && "Data Fetched Successfully"}
          </h2>
          <p style={{ marginTop: '0.5rem', color: '#6B7280', fontSize: '0.95rem', fontWeight: 400, fontFamily: 'Inter, system-ui, sans-serif' }}>
            {loadingStep < 3 ? `Fetching deep analytics for ${pendingAreas.length} territories...` : "Your dashboard is ready."}
          </p>
        </div>
      )}
    </div>
  );
};

export default AreaSelectorWidget;
