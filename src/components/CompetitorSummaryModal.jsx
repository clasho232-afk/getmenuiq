import React, { useState } from 'react';
import { X, TrendingUp, TrendingDown } from 'lucide-react';

const CompetitorSummaryModal = ({ competitor, onClose, asSidebar = false }) => {
  const [activeTab, setActiveTab] = useState('Menu');

  if (!competitor) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: asSidebar ? '2rem' : 0,
        left: asSidebar ? '2rem' : 0,
        right: asSidebar ? '2rem' : 0,
        bottom: asSidebar ? '2rem' : 0,
        backgroundColor: asSidebar ? 'transparent' : 'rgba(0, 0, 0, 0.4)',
        backdropFilter: asSidebar ? 'none' : 'blur(4px)',
        zIndex: 999999,
        display: 'flex',
        alignItems: asSidebar ? 'stretch' : 'center',
        justifyContent: asSidebar ? 'flex-end' : 'center',
        padding: asSidebar ? '0' : '2rem',
        pointerEvents: asSidebar ? 'none' : 'auto'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          width: '100%',
          maxWidth: asSidebar ? '400px' : '576px', /* max-w-xl */
          backgroundColor: '#ffffff',
          borderRadius: asSidebar ? '24px' : '16px',
          boxShadow: '-10px 0 25px -5px rgba(0, 0, 0, 0.1), -4px 0 10px -5px rgba(0, 0, 0, 0.04)',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          pointerEvents: 'auto',
          height: asSidebar ? '100%' : 'auto',
          maxHeight: asSidebar ? '100%' : '90vh'
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
              </div>
            </div>
            
            {/* Overlapping items bar */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', background: 'rgba(0,0,0,0.4)', padding: '0.5rem 0.8rem', borderRadius: '12px', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#E5E7EB', marginBottom: '0.3rem' }}>
                Menu Overlap
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '80px', height: '6px', borderRadius: '9999px', background: 'rgba(255,255,255,0.2)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${competitor.score}%`, background: '#E86A58', borderRadius: '9999px' }} />
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#E86A58' }}>{competitor.score}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Segmented Control (Tab Bar) */}
        <div style={{ padding: '1rem', borderBottom: '1px solid #F3F4F6', width: '100%' }}>
          <div style={{ backgroundColor: '#F3F4F6', padding: '0.25rem', borderRadius: '0.75rem', display: 'flex', flexDirection: 'row', width: '100%' }}>
            {['Menu', 'Promos', 'Price Changes'].map(tab => {
              const isActive = activeTab === tab;
              const menuCount = (competitor.menuCategories || []).reduce((acc, cat) => acc + (cat.items?.length || 0), 0);
              const count = tab === 'Menu' ? menuCount : tab === 'Promos' ? (competitor.promos || 0) : (competitor.priceChanges || 0);
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
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                    <span>{tab}</span>
                    <span style={{ background: isActive ? '#E5E7EB' : '#E5E7EB', color: isActive ? '#111827' : '#6B7280', padding: '0.1rem 0.4rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700, transition: 'all 0.2s' }}>
                      {count}
                    </span>
                  </div>
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
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', marginTop: groupIdx === 0 ? '0' : '1rem', paddingLeft: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>{group.category}</span>
                      <span style={{ backgroundColor: '#F3F4F6', color: '#6B7280', padding: '0.1rem 0.4rem', borderRadius: '9999px', fontSize: '0.65rem', fontWeight: 800 }}>
                        {group.items.length}
                      </span>
                    </div>
                    {group.items.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', border: '1px solid #F3F4F6', borderRadius: '0.5rem', padding: '0.75rem', marginBottom: '0.5rem', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          {item.image && (
                            <img src={item.image} alt={item.name} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                          )}
                          <span style={{ fontSize: '0.95rem', fontWeight: 500, color: '#111827' }}>{item.name}</span>
                        </div>
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#ffffff', padding: '1rem', borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {competitor.menuChangeItemImage && (
                  <img src={competitor.menuChangeItemImage} alt="Menu Item" style={{ width: '64px', height: '64px', borderRadius: '8px', objectFit: 'cover' }} />
                )}
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: 600, marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                    Category: {competitor.priceChangeDetails?.category || 'Burgers'}
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827' }}>
                    {competitor.priceChangeDetails?.itemName || 'Classic Burger'}
                  </div>
                </div>
              </div>
              
              {competitor.priceChanges > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.15rem' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Price</span>
                    <span style={{ fontSize: '0.95rem', color: '#9CA3AF', fontWeight: 600, textDecoration: 'line-through', textDecorationColor: '#DC2626', textDecorationThickness: '2px' }}>
                      {competitor.priceChangeDetails?.oldPrice || '£7.50'}
                    </span>
                  </div>
                  <div style={{ fontSize: '1.2rem', color: '#111827', fontWeight: 800 }}>
                    {competitor.priceChangeDetails?.newPrice || '£8.50'}
                  </div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: competitor.priceChangeDetails?.isIncrease ? '#DC2626' : '#16A34A', marginTop: '0.2rem' }}>
                    {competitor.priceChangeDetails?.changeText || 'Price Increase: +£1.00'}
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#6B7280', paddingRight: '0.5rem' }}>
                  No recent changes
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CompetitorSummaryModal;
