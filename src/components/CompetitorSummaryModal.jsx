import React, { useState } from 'react';
import { X, TrendingUp, TrendingDown } from 'lucide-react';

const CompetitorSummaryModal = ({ competitor, onClose }) => {
  const [activeTab, setActiveTab] = useState('Menu');

  if (!competitor) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          width: '100%',
          maxWidth: '576px', /* max-w-xl */
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(4px)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            cursor: 'pointer',
            zIndex: 10
          }}
        >
          <X size={18} />
        </button>

        {/* Header: Hero Image with Gradient */}
        <div style={{ position: 'relative', height: '240px', width: '100%' }}>
          <img 
            src={competitor.image} 
            alt={competitor.name} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
          <div 
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '50%',
              background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)'
            }}
          />
          <div style={{ position: 'absolute', bottom: '1.5rem', left: '1.5rem', right: '1.5rem', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                {competitor.name}
              </h2>
              <div style={{ fontSize: '0.9rem', opacity: 0.9, marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>{competitor.cuisine}</span>
                <span>•</span>
                <span>{competitor.distance}mi away</span>
              </div>
            </div>
            {competitor.location && (
              <div style={{ fontSize: '0.9rem', fontWeight: 600, background: 'rgba(255,255,255,0.2)', padding: '0.4rem 0.8rem', borderRadius: '8px', backdropFilter: 'blur(4px)' }}>
                Location: {competitor.location}
              </div>
            )}
          </div>
        </div>

        {/* Segmented Control (Tab Bar) */}
        <div style={{ padding: '1rem', borderBottom: '1px solid #F3F4F6', width: '100%' }}>
          <div style={{ backgroundColor: '#F3F4F6', padding: '0.25rem', borderRadius: '0.75rem', display: 'flex', flexDirection: 'row', width: '100%' }}>
            {['Menu', 'Promos', 'Price Changes'].map(tab => {
              const isActive = activeTab === tab;
              return (
                <div
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    padding: '0.5rem 0',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    backgroundColor: isActive ? '#ffffff' : 'transparent',
                    borderRadius: '0.5rem',
                    boxShadow: isActive ? '0 1px 2px rgba(0, 0, 0, 0.05)' : 'none',
                    color: isActive ? '#111827' : '#6B7280',
                    fontWeight: isActive ? 600 : 500,
                  }}
                  onMouseOver={(e) => {
                    if (!isActive) e.currentTarget.style.color = '#374151';
                  }}
                  onMouseOut={(e) => {
                    if (!isActive) e.currentTarget.style.color = '#6B7280';
                  }}
                >
                  {tab}
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div style={{ padding: '1rem', overflowY: 'auto', height: '400px', width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {activeTab === 'Menu' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {competitor.menuCategories && competitor.menuCategories.length > 0 ? (
                competitor.menuCategories.map((group, groupIdx) => (
                  <div key={groupIdx}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', marginTop: groupIdx === 0 ? '0' : '1rem', paddingLeft: '0.25rem' }}>
                      {group.category}
                    </div>
                    {group.items.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', border: '1px solid #F3F4F6', borderRadius: '0.5rem', padding: '0.75rem', marginBottom: '0.5rem', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)' }}>
                        <span style={{ fontSize: '0.95rem', fontWeight: 500, color: '#111827' }}>{item.name}</span>
                        <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#4B5563' }}>{item.price}</span>
                      </div>
                    ))}
                  </div>
                ))
              ) : (
                <div style={{ padding: '1rem', textAlign: 'center', color: '#6B7280', fontSize: '0.9rem' }}>No menu data available.</div>
              )}
            </div>
          )}

          {activeTab === 'Promos' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
              {competitor.promoItemImage && (
                <img src={competitor.promoItemImage} alt="Promo" style={{ width: '64px', height: '64px', borderRadius: '8px', objectFit: 'cover' }} />
              )}
              <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#111827' }}>
                {competitor.promoText || 'No active promos'}
              </div>
            </div>
          )}

          {activeTab === 'Price Changes' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
              {competitor.menuChangeItemImage && (
                <img src={competitor.menuChangeItemImage} alt="Menu Item" style={{ width: '64px', height: '64px', borderRadius: '8px', objectFit: 'cover' }} />
              )}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: competitor.priceChanges > 0 ? '#DC2626' : '#16A34A', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  {competitor.priceChanges > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {competitor.priceChanges > 0 ? 'Price Increase' : 'Price Decrease'}
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#111827' }}>
                  {competitor.lastChange || 'No recent changes'}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CompetitorSummaryModal;
