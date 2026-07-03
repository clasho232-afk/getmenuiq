import React, { useState } from 'react';
import { X } from 'lucide-react';

const RestaurantProfileModal = ({ isOpen, onClose, restaurant }) => {
  const [activeTab, setActiveTab] = useState('Menu');

  if (!isOpen || !restaurant) return null;

  return (
    <div 
      style={{ 
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
        zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', 
        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)' 
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ 
        width: '500px', maxWidth: '90vw', height: '650px', maxHeight: '90vh', 
        background: '#FFFFFF', borderRadius: '16px', overflow: 'hidden', 
        display: 'flex', flexDirection: 'column', position: 'relative',
        boxShadow: '0 24px 48px rgba(0,0,0,0.2)'
      }}>
        
        {/* Header Image Area */}
        <div style={{ position: 'relative', height: '240px', width: '100%' }}>
          <img 
            src={restaurant.image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80'} 
            alt={restaurant.restaurant} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
          {/* Dark gradient overlay for text legibility */}
          <div style={{ 
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.8) 100%)' 
          }} />
          
          <button 
            onClick={onClose} 
            style={{ 
              position: 'absolute', top: '16px', right: '16px', width: '32px', height: '32px', 
              borderRadius: '50%', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', 
              border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', 
              justifyContent: 'center', cursor: 'pointer', color: '#FFF', zIndex: 10 
            }}
          >
            <X size={16} />
          </button>

          <div style={{ position: 'absolute', bottom: '20px', left: '24px', right: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#FFF', margin: 0, textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
                {restaurant.restaurant}
              </h2>
              <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)', fontWeight: 500, textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
                {restaurant.overlapContext || 'Restaurant'} • —mi away
              </div>
            </div>
            
            <div style={{ 
              background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', 
              padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)',
              color: '#FFF', fontSize: '12px', fontWeight: 700, textShadow: '0 1px 2px rgba(0,0,0,0.5)'
            }}>
              Location: {restaurant.location === 'ilford' ? 'Ilford' : 'Barking, Neighborhood'}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #F3F4F6' }}>
          <div style={{ 
            display: 'flex', background: '#F3F4F6', borderRadius: '12px', padding: '4px', gap: '4px' 
          }}>
            {['Menu', 'Promos', 'Price Changes'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1, padding: '8px 0', borderRadius: '8px', border: 'none',
                  background: activeTab === tab ? '#FFFFFF' : 'transparent',
                  color: activeTab === tab ? '#111' : '#6B7280',
                  fontSize: '13px', fontWeight: activeTab === tab ? 700 : 600,
                  boxShadow: activeTab === tab ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div style={{ flex: 1, padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', overflowY: 'auto' }}>
          {activeTab === 'Menu' && (
            <div style={{ color: '#6B7280', fontSize: '14px', fontWeight: 500, marginTop: '40px' }}>
              No menu data available.
            </div>
          )}
          {activeTab === 'Promos' && (
            <div style={{ color: '#6B7280', fontSize: '14px', fontWeight: 500, marginTop: '40px' }}>
              Active Promo: <strong>{restaurant.promo}</strong>
            </div>
          )}
          {activeTab === 'Price Changes' && (
            <div style={{ color: '#6B7280', fontSize: '14px', fontWeight: 500, marginTop: '40px' }}>
              No recent price changes detected.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default RestaurantProfileModal;
