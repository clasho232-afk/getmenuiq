import React, { useState, useEffect } from 'react';
import { X, Star, Truck, Utensils } from 'lucide-react';
import { supabase } from '../supabase';

const CompetitorIntelDrawer = ({ isOpen, onClose, restaurantId, activeDishId }) => {
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchIntel = async () => {
      if (!restaurantId) return;
      setLoading(true);
      
      const [restRes, menuRes] = await Promise.all([
        supabase.from('restaurants').select('*').eq('id', restaurantId).single(),
        supabase.from('menu_items').select('*').eq('restaurant_id', restaurantId).order('section_name')
      ]);

      if (restRes.data) setRestaurant(restRes.data);
      if (menuRes.data) setMenuItems(menuRes.data);
      
      setLoading(false);
    };

    if (isOpen && restaurantId) {
      fetchIntel();
    } else {
      // Reset state on close
      setTimeout(() => {
        setRestaurant(null);
        setMenuItems([]);
      }, 300); // Wait for transition
    }
  }, [isOpen, restaurantId]);

  // Group menu items by section_name
  const groupedMenu = menuItems.reduce((acc, item) => {
    const section = item.section_name || 'Other';
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {});

  const handleAdjustPrice = () => {
    window.dispatchEvent(new Event('open-menu-analysis'));
    onClose();
  };

  return (
    <>
      {/* Invisible Backdrop to block clicks and close */}
      <div 
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'transparent',
          zIndex: 40,
          pointerEvents: isOpen ? 'auto' : 'none',
          display: isOpen ? 'block' : 'none'
        }}
      />

      {/* Slide-out Drawer */}
      <div style={{
        position: 'fixed',
        top: 0, right: 0, bottom: 0,
        width: '35vw',
        minWidth: '400px',
        maxWidth: '550px',
        backgroundColor: '#FFF',
        boxShadow: '-10px 0 30px rgba(0,0,0,0.08)',
        zIndex: 50,
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Lufga', sans-serif"
      }}>
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem', right: '1.25rem',
            zIndex: 60,
            width: '36px', height: '36px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(4px)',
            border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            color: '#374151'
          }}
        >
          <X size={18} />
        </button>

        {loading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>
            Gathering competitor intel...
          </div>
        ) : !restaurant ? (
          <div style={{ flex: 1 }} />
        ) : (
          <>
            {/* Drawer Header Area */}
            <div style={{ position: 'relative', flexShrink: 0, height: '220px', backgroundColor: '#F3F1EC' }}>
              {restaurant.hero_image_url ? (
                <img 
                  src={restaurant.hero_image_url} 
                  alt={restaurant.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', color: '#D1D5DB', fontWeight: 800 }}>
                  {restaurant.name?.charAt(0)}
                </div>
              )}
              {/* Gradient Overlay */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }} />
              
              <div style={{ position: 'absolute', bottom: '1.5rem', left: '2rem', right: '2rem', color: '#FFF' }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.5rem 0', lineHeight: 1.1 }}>{restaurant.name}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.875rem', fontWeight: 600 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Star size={14} color="#FBBF24" fill="#FBBF24" />
                    {restaurant.rating || '4.8'} ({restaurant.rating_count || '120+'})
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Truck size={14} />
                    {restaurant.delivery_fee ? `£${restaurant.delivery_fee}` : '£1.49'} Avg Fee
                  </span>
                </div>
              </div>
            </div>

            {/* Cross-Sectional Menu Feed */}
            <div style={{ 
              flex: 1, 
              overflowY: 'auto', 
              padding: '2rem',
              backgroundColor: '#FAFAF9'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: '#6B7280' }}>
                <Utensils size={18} />
                <span style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Menu Analysis</span>
              </div>
              
              {Object.entries(groupedMenu).map(([section, items]) => (
                <div key={section} style={{ marginBottom: '2.5rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#111', marginBottom: '1rem', borderBottom: '2px solid #E5E7EB', paddingBottom: '0.5rem' }}>
                    {section}
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {items.map(dish => {
                      const isTarget = dish.id === activeDishId;
                      return (
                        <div key={dish.id} style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          padding: '1rem',
                          backgroundColor: isTarget ? '#FFF' : 'transparent',
                          borderRadius: '12px',
                          border: isTarget ? '1px solid #E5E7EB' : '1px solid transparent',
                          boxShadow: isTarget ? '0 4px 10px rgba(0,0,0,0.03)' : 'none',
                          transition: 'all 0.2s ease'
                        }}>
                          <span style={{ fontSize: '0.9375rem', fontWeight: isTarget ? 700 : 500, color: isTarget ? '#111' : '#4B5563' }}>
                            {dish.name}
                            {isTarget && <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', padding: '0.1rem 0.4rem', backgroundColor: '#FEF3C7', color: '#D97706', borderRadius: '4px', fontWeight: 800 }}>TARGET</span>}
                          </span>
                          <span style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#111' }}>
                            {dish.currency === 'GBP' ? '£' : ''}{dish.price}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Sticky Tactical Action Trigger */}
            <div style={{
              position: 'sticky',
              bottom: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(8px)',
              padding: '1.5rem 2rem',
              borderTop: '1px solid #E5E7EB',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#6B7280', textAlign: 'center' }}>
                Identify pricing gaps and instantly reposition your items.
              </p>
              <button 
                onClick={handleAdjustPrice}
                style={{
                  width: '100%',
                  padding: '1rem',
                  backgroundColor: '#4F46E5', // Premium Indigo
                  color: '#FFF',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '1rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 8px 20px -6px rgba(79, 70, 229, 0.4)',
                  transition: 'transform 0.2s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                Adjust My Menu Price
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default CompetitorIntelDrawer;
