import React, { useState } from 'react';
import { LayoutDashboard, UtensilsCrossed, Brain, Compass, Eye, Radar, Settings, User, Activity, Search } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const mainNavItems = [
    { id: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'My Menu', label: 'My Menu', icon: UtensilsCrossed },
    { id: 'AI Strategy', label: 'AI Strategy', icon: Brain, hasNotif: true },
    { id: 'Market Niche', label: 'Market Niche', icon: Compass },
    { id: 'Blind Spot', label: 'Blind Spot', icon: Eye },
    { id: 'Competitors', label: 'Competitors', icon: Radar },
    { id: 'Competitor Finder', label: 'Finder', icon: Search },
  ];

  const bottomNavItems = [
    { id: 'Settings', label: 'Settings', icon: Settings },
  ];

  // Determine market aggression based on time
  const hour = new Date().getHours();
  const isPeakTime = hour >= 17 && hour <= 21;
  const marketAggression = isPeakTime ? 'High' : 'Moderate';
  const peakTimeLabel = isPeakTime ? `Peak: ${hour}:00` : 'Off-Peak';

  return (
    <aside 
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      style={{ 
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: isExpanded ? '200px' : '68px',
        minWidth: isExpanded ? '200px' : '68px',
        padding: '1.25rem 0.75rem',
        background: 'linear-gradient(180deg, rgba(17,17,17,0.04) 0%, rgba(17,17,17,0.01) 40%, transparent 100%)',
        borderRight: '1px solid rgba(0,0,0,0.04)',
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        zIndex: 10,
        position: 'relative'
      }}
    >
      {/* London Skyline Shadow — fades into sidebar */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: '180px',
        backgroundImage: 'url(/bg-sketch.png)',
        backgroundSize: '600px',
        backgroundPosition: 'left -30px top -10px',
        backgroundRepeat: 'no-repeat',
        opacity: 0.06,
        mixBlendMode: 'multiply',
        pointerEvents: 'none',
        maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)'
      }} />

      {/* Main Navigation */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', position: 'relative', zIndex: 1 }}>
        {mainNavItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab && setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.6rem 0.7rem',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                background: isActive ? 'rgba(0,0,0,0.06)' : 'transparent',
                color: isActive ? '#111' : '#6B7280',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.8rem',
                transition: 'all 0.2s',
                position: 'relative',
                whiteSpace: 'nowrap',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
                {item.hasNotif && (
                  <span style={{ 
                    position: 'absolute', top: '-2px', right: '-2px',
                    width: '6px', height: '6px', borderRadius: '50%', 
                    background: '#EF4444', 
                    border: '1.5px solid #F5F3EC',
                    animation: 'pulse 2s infinite'
                  }} />
                )}
              </div>
              <span style={{ 
                opacity: isExpanded ? 1 : 0,
                transition: 'opacity 0.2s',
                letterSpacing: '-0.01em'
              }}>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Bottom Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', position: 'relative', zIndex: 1 }}>
        
        {/* Market Pulse Ticker */}
        <div style={{ 
          background: 'rgba(0,0,0,0.03)', 
          borderRadius: '8px', 
          padding: isExpanded ? '0.65rem' : '0.5rem',
          marginBottom: '0.5rem',
          transition: 'padding 0.3s',
          overflow: 'hidden'
        }}>
          {isExpanded ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.4rem' }}>
                <Activity size={12} color="#6B7280" strokeWidth={1.5} />
                <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>London Pulse</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: '#6B7280', fontWeight: 500 }}>Aggression</span>
                <span style={{ 
                  fontSize: '0.65rem', fontWeight: 700, 
                  color: marketAggression === 'High' ? '#EF4444' : '#F59E0B',
                  background: marketAggression === 'High' ? 'rgba(239,68,68,0.08)' : 'rgba(245,158,11,0.08)',
                  padding: '0.15rem 0.4rem', borderRadius: '4px'
                }}>{marketAggression}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.3rem' }}>
                <span style={{ fontSize: '0.7rem', color: '#6B7280', fontWeight: 500 }}>Status</span>
                <span style={{ 
                  fontSize: '0.65rem', fontWeight: 700, 
                  color: isPeakTime ? '#10B981' : '#6B7280',
                  background: isPeakTime ? 'rgba(16,185,129,0.08)' : 'rgba(0,0,0,0.04)',
                  padding: '0.15rem 0.4rem', borderRadius: '4px'
                }}>{peakTimeLabel}</span>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Activity size={16} color={marketAggression === 'High' ? '#EF4444' : '#F59E0B'} strokeWidth={1.5} />
            </div>
          )}
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'rgba(0,0,0,0.06)', margin: '0 0.25rem' }} />

        {/* Settings */}
        {bottomNavItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab && setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.6rem 0.7rem',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                background: isActive ? 'rgba(0,0,0,0.06)' : 'transparent',
                color: isActive ? '#111' : '#6B7280',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.8rem',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
            >
              <Icon size={18} strokeWidth={1.5} style={{ flexShrink: 0 }} />
              <span style={{ opacity: isExpanded ? 1 : 0, transition: 'opacity 0.2s' }}>{item.label}</span>
            </button>
          );
        })}

        {/* User Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.5rem 0.5rem', cursor: 'pointer', borderRadius: '10px', transition: 'background 0.2s', overflow: 'hidden' }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.03)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <img src="https://i.pravatar.cc/150?u=admin" alt="Profile" style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid rgba(0,0,0,0.08)', flexShrink: 0 }} />
          <div style={{ opacity: isExpanded ? 1 : 0, transition: 'opacity 0.2s', whiteSpace: 'nowrap' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#111', margin: 0 }}>Gordo</p>
            <p style={{ fontSize: '0.6rem', color: '#9CA3AF', margin: 0 }}>Owner</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
