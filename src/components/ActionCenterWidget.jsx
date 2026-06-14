import React, { useState } from 'react';
import { Sparkles, ArrowRight, TrendingDown, TrendingUp, MapPin, AlertCircle } from 'lucide-react';

const ActionCenterWidget = () => {
  const [activeTab, setActiveTab] = useState('Pricing');

  const tabs = ['Pricing', 'Promotions', 'Platform Visibility', 'Menu Strategy'];

  const contentMap = {
    'Pricing': {
      header: '1-to-1 Menu Price Matching',
      summary: 'Your signature items are currently priced below the average of your closest competitors. Adjust your pricing strategy to match local market rates and improve your position without sacrificing volume.',
      action: 'Review Pricing',
      mockData: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem', background: '#F9FAFB', padding: '1rem', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Classic Cheeseburger</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#EF4444', fontWeight: 600, fontSize: '0.875rem' }}><TrendingDown size={14}/> -12% vs market</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Spicy Chicken Wings</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#EF4444', fontWeight: 600, fontSize: '0.875rem' }}><TrendingDown size={14}/> -8% vs market</span>
          </div>
        </div>
      )
    },
    'Promotions': {
      header: 'Promo Velocity Tracking',
      summary: 'Current promotional campaigns show a dip in weekend velocity. Reallocating your marketing spend towards high-traffic delivery windows could optimize your promotional reach.',
      action: 'Draft Promo',
      mockData: (
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <div style={{ flex: 1, background: '#F9FAFB', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase' }}>Weekday ROI</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}><TrendingUp size={16}/> 2.4x</div>
          </div>
          <div style={{ flex: 1, background: '#F9FAFB', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase' }}>Weekend ROI</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}><TrendingDown size={16}/> 0.8x</div>
          </div>
        </div>
      )
    },
    'Platform Visibility': {
      header: 'Live Visibility Radar',
      summary: 'Your restaurant disappeared from search results in Bethnal Green (E2) 30 minutes ago due to platform rider shortages. Activating Sponsored Ads now could recover lost visibility.',
      action: 'Launch Sponsored Ad',
      mockData: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem', background: '#F9FAFB', padding: '1rem', borderRadius: '8px' }}>
          <MapPin size={24} color="#EF4444" />
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#EF4444' }}>Offline in E2 Sector</div>
            <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>Competitor visibility remains high. Est. -15 orders/hour.</div>
          </div>
        </div>
      )
    },
    'Menu Strategy': {
      header: 'Menu Item Gap Analysis',
      summary: 'There is a growing trend for plant-based alternatives in your area, yet your menu currently lacks these options compared to local competitors. Introducing targeted items could capture this audience.',
      action: 'Analyze Menu Gaps',
      mockData: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem', background: '#F9FAFB', padding: '1rem', borderRadius: '8px' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Plant-based Burgers</span>
            <span style={{ background: '#FEF2F2', color: '#EF4444', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>Missing</span>
          </div>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Gluten-free Buns</span>
            <span style={{ background: '#FEF2F2', color: '#EF4444', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>Missing</span>
          </div>
        </div>
      )
    }
  };

  const activeContent = contentMap[activeTab];

  return (
    <div className="glass-panel" style={{
      padding: '2rem',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      color: '#333'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
        <Sparkles size={20} color="#8A7A60" />
        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#4A4036' }}>Action Center</h2>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '2px solid rgba(0,0,0,0.05)', paddingBottom: '0.5rem' }}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: 'transparent',
              border: 'none',
              padding: '0.5rem 1rem',
              fontSize: '0.95rem',
              fontWeight: activeTab === tab ? 700 : 500,
              color: activeTab === tab ? '#4A4036' : '#9CA3AF',
              cursor: 'pointer',
              position: 'relative',
              transition: 'color 0.2s'
            }}
          >
            {tab}
            {activeTab === tab && (
              <div style={{
                position: 'absolute',
                bottom: '-0.6rem',
                left: 0,
                right: 0,
                height: '2px',
                background: '#4A4036',
                borderRadius: '2px'
              }} />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '12px',
        padding: '1.75rem',
        border: '1px solid #E5E0D8',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
      }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#8A7A60', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Intelligence Brief
        </div>
        <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#111' }}>
          {activeContent.header}
        </h3>
        <p style={{ margin: 0, fontSize: '1rem', color: '#6B7280', lineHeight: 1.6 }}>
          {activeContent.summary}
        </p>
        
        {/* Mock Data Presentation */}
        {activeContent.mockData}
        
        <button 
          onClick={() => {
            if (activeTab === 'Pricing') {
              window.dispatchEvent(new CustomEvent('open-menu-analysis'));
            }
          }}
          style={{
          marginTop: '1rem',
          alignSelf: 'flex-start',
          background: '#4A4036',
          color: '#FFFFFF',
          border: 'none',
          padding: '0.75rem 1.5rem',
          borderRadius: '8px',
          fontSize: '0.9rem',
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          transition: 'background 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#332C25'}
        onMouseLeave={(e) => e.currentTarget.style.background = '#4A4036'}
        >
          {activeContent.action} <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default ActionCenterWidget;
