import React, { useState, useEffect } from 'react';
import { ArrowLeft, Tag, MapPin, Utensils, Map, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { supabase } from '../supabase';

const RestaurantProfilePage = ({ restaurantId, onBack }) => {
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAreasExpanded, setIsAreasExpanded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      const [restRes, menuRes] = await Promise.all([
        supabase.from('restaurants').select('*').eq('id', restaurantId).single(),
        supabase.from('menu_items').select('*').eq('restaurant_id', restaurantId).order('section_name').order('price', { ascending: false })
      ]);

      if (restRes.data) {
        setRestaurant(restRes.data);
      }
      if (menuRes.data) {
        setMenuItems(menuRes.data);
      }
      
      setLoading(false);
    };

    if (restaurantId) {
      fetchData();
    }
  }, [restaurantId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100%', padding: '4rem' }}>
        <div style={{ fontSize: '1.25rem', color: '#6B7280', fontWeight: 600 }}>Loading profile...</div>
      </div>
    );
  }

  if (!restaurant) return null;

  const cuisineStr = Array.isArray(restaurant.cuisines) && restaurant.cuisines.length > 0 ? restaurant.cuisines[0] : 'Various';
  const locationStr = restaurant.address || (Array.isArray(restaurant.areas) && restaurant.areas.length > 0 ? restaurant.areas[0] : (restaurant.city || 'London'));
  const hasUberEats = !!restaurant.ubereats_url;

  // Group menu items by section_name
  const groupedMenu = menuItems.reduce((acc, item) => {
    const section = item.section_name || 'Other';
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {});

  return (
    <div style={{
      fontFamily: "'Lufga', sans-serif",
      position: 'relative',
      minHeight: '100%',
      display: 'flex',
      flexDirection: 'column',
      paddingBottom: '4rem',
      backgroundColor: 'transparent' 
    }}>
      {/* Back Button */}
      <button 
        onClick={onBack}
        style={{
          position: 'absolute',
          top: '2rem',
          left: '2rem',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1rem',
          backgroundColor: 'rgba(255,255,255,0.2)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.4)',
          borderRadius: '9999px',
          cursor: 'pointer',
          fontWeight: 600,
          color: '#FFF',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}
      >
        <ArrowLeft size={18} />
        Back
      </button>

      {/* The Immersive Hero Header */}
      <div style={{
        position: 'relative',
        width: '100%',
        minHeight: '400px',
        height: '400px',
        overflow: 'hidden',
        flexShrink: 0,
        borderRadius: '24px',
        marginBottom: '2rem',
        backgroundColor: '#F3F1EC'
      }}>
        {restaurant.hero_image_url ? (
          <img 
            src={restaurant.hero_image_url} 
            alt={restaurant.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', color: '#D1D5DB', fontWeight: 800 }}>
            {restaurant.name?.charAt(0)}
          </div>
        )}
        
        {/* Dark Gradient Overlay */}
        <div style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          height: '60%',
          background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)'
        }} />
        
        {/* Top Right Add to Competitors Button */}
        <button style={{
          position: 'absolute',
          top: '2rem',
          right: '2rem',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.6rem 1.25rem',
          backgroundColor: '#FFF',
          color: '#111',
          borderRadius: '9999px',
          border: 'none',
          fontWeight: 800,
          fontSize: '0.875rem',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
          transition: 'transform 0.2s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Plus size={16} />
          Add to Competitors
        </button>

        {/* Overlay Content */}
        <div style={{
          position: 'absolute',
          bottom: '2rem',
          left: '2rem',
          right: '2rem',
          maxWidth: '1200px',
          margin: '0 auto',
          color: '#FFF',
          zIndex: 2
        }}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 800, margin: '0 0 1rem 0', letterSpacing: '-0.02em', lineHeight: 1 }}>
            {restaurant.name}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <span style={{ 
              backgroundColor: '#FFF', color: '#111', 
              padding: '0.25rem 0.75rem', borderRadius: '6px', 
              fontSize: '0.875rem', fontWeight: 800,
              textTransform: 'uppercase', letterSpacing: '0.05em'
            }}>
              Restaurant
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#FFF', fontSize: '1rem', fontWeight: 600 }}>
              <Utensils size={16} />
              {cuisineStr}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.6)' }}>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#FFF', fontSize: '1rem', fontWeight: 600 }}>
              <MapPin size={16} />
              {locationStr}
            </span>
            
            <div style={{ display: 'flex', gap: '0.75rem', marginLeft: 'auto' }}>
              {hasUberEats && (
                <div 
                  title="UberEats"
                  style={{
                    padding: '0.4rem 1rem', borderRadius: '9999px',
                    backgroundColor: '#10B981', color: '#FFF',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.875rem', fontWeight: 800,
                    boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                    letterSpacing: '0.02em'
                  }}
                >
                  UberEats
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area: The Asymmetric Layout (Bento Grid) */}
      <div style={{
        maxWidth: '1200px',
        width: '100%',
        margin: '0 auto',
        padding: '0 2rem',
      }}>
        
        {/* Responsive CSS Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem'
        }} className="bento-grid">
          
          <style>
            {`
              @media (min-width: 900px) {
                .bento-grid {
                  grid-template-columns: 2fr 1fr !important;
                }
              }
              /* Custom scrollbar for menu */
              .menu-scroll::-webkit-scrollbar {
                width: 6px;
              }
              .menu-scroll::-webkit-scrollbar-track {
                background: transparent;
              }
              .menu-scroll::-webkit-scrollbar-thumb {
                background-color: #E5E7EB;
                border-radius: 10px;
              }
            `}
          </style>

          {/* LEFT COLUMN: Full Menu */}
          <div style={{...moduleStyle, padding: 0, overflow: 'hidden'}}>
            <div style={{...moduleHeaderStyle, padding: '2.5rem 2.5rem 1.5rem', marginBottom: 0}}>
              <Utensils size={20} color="#F59E0B" />
              <h2 style={moduleTitleStyle}>Full Menu</h2>
            </div>
            
            <div className="menu-scroll" style={{ 
              maxHeight: '800px', 
              overflowY: 'auto',
              padding: '0 2.5rem 2.5rem',
              display: 'flex', 
              flexDirection: 'column' 
            }}>
              {menuItems.length > 0 ? (
                Object.entries(groupedMenu).map(([section, items]) => (
                  <div key={section} style={{ marginTop: '2rem' }}>
                    <h3 style={{ 
                      fontSize: '1.125rem', 
                      fontWeight: 800, 
                      color: '#111', 
                      marginBottom: '1rem',
                      paddingBottom: '0.5rem',
                      borderBottom: '2px solid #F3F4F6',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      {section}
                    </h3>
                    {items.map((dish, idx) => (
                      <div key={dish.id} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        padding: '1.25rem 0',
                        borderBottom: idx !== items.length - 1 ? '1px solid #F3F4F6' : 'none'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, paddingRight: '1rem' }}>
                          {dish.image_url && (
                            <div style={{ width: '48px', height: '48px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                              <img src={dish.image_url} alt={dish.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                          )}
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1F2937' }}>{dish.name}</span>
                            {dish.description && (
                              <span style={{ fontSize: '0.875rem', color: '#6B7280', marginTop: '0.25rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {dish.description}
                              </span>
                            )}
                          </div>
                        </div>
                        <span style={{ fontSize: '1.125rem', fontWeight: 800, color: '#111', flexShrink: 0 }}>
                          {dish.currency === 'GBP' ? '£' : ''}{dish.price}
                        </span>
                      </div>
                    ))}
                  </div>
                ))
              ) : (
                <div style={{ padding: '3rem 0', textAlign: 'center', color: '#6B7280', fontSize: '0.875rem' }}>
                  No menu items indexed yet.
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Promos & Footprint */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Active Promotions Module */}
            <div style={moduleStyle}>
              <div style={moduleHeaderStyle}>
                <Tag size={20} color="#EF4444" />
                <h2 style={moduleTitleStyle}>Active Promotions</h2>
              </div>
              <div style={{ padding: '2rem', textAlign: 'center', color: '#6B7280', fontSize: '0.875rem' }}>
                No active promotions detected across delivery networks.
              </div>
            </div>

            {/* Delivery Areas Module (Expandable) */}
            <div 
              style={{ ...moduleStyle, cursor: 'pointer', transition: 'box-shadow 0.2s ease' }}
              onClick={() => setIsAreasExpanded(!isAreasExpanded)}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 12px 30px -5px rgba(0,0,0,0.08)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.05)'}
            >
              <div style={{ 
                ...moduleHeaderStyle, 
                marginBottom: isAreasExpanded ? '1.5rem' : 0, 
                paddingBottom: isAreasExpanded ? '1.5rem' : 0,
                borderBottom: isAreasExpanded ? '1px solid #F3F4F6' : 'none' 
              }}>
                <Map size={20} color="#3B82F6" />
                <h2 style={moduleTitleStyle}>Delivery Areas</h2>
                <div style={{ marginLeft: 'auto', color: '#9CA3AF' }}>
                  {isAreasExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>
              
              {isAreasExpanded && (
                <div style={{ animation: 'fadeIn 0.2s ease-in-out' }}>
                  <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6B7280', marginBottom: '0.75rem' }}>Serviced Areas</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {Array.isArray(restaurant.areas) && restaurant.areas.length > 0 ? restaurant.areas.map(area => (
                      <span key={area} style={{ 
                        padding: '0.4rem 0.8rem', 
                        backgroundColor: '#EFF6FF',
                        color: '#2563EB', 
                        borderRadius: '6px', 
                        fontSize: '0.875rem', 
                        fontWeight: 700 
                      }}>
                        {area}
                      </span>
                    )) : (
                      <span style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>Data unavailable</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <style>
              {`
                @keyframes fadeIn {
                  from { opacity: 0; transform: translateY(-5px); }
                  to { opacity: 1; transform: translateY(0); }
                }
              `}
            </style>

          </div>

        </div>
      </div>
    </div>
  );
};

const moduleStyle = {
  backgroundColor: '#FFF',
  borderRadius: '24px',
  padding: '2.5rem',
  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)',
  border: 'none',
  display: 'flex',
  flexDirection: 'column'
};

const moduleHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  marginBottom: '2rem',
  paddingBottom: '1.5rem',
  borderBottom: '1px solid #F3F4F6'
};

const moduleTitleStyle = {
  fontSize: '1.25rem',
  fontWeight: 800,
  color: '#111',
  margin: 0,
  letterSpacing: '-0.01em'
};

export default RestaurantProfilePage;
