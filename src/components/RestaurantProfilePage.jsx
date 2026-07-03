import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Utensils, Plus, Store } from 'lucide-react';
import { supabase } from '../supabase';

const RestaurantProfilePage = ({ restaurantId, onBack }) => {
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMenuCategory, setActiveMenuCategory] = useState(null);
  
  // Platform Pricing State
  const [activePricingPlatform, setActivePricingPlatform] = useState('Deliveroo');

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

  // Group menu items by section_name
  const groupedMenu = menuItems.reduce((acc, item) => {
    const section = item.section_name || 'Other';
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {});

  const categories = Object.keys(groupedMenu);

  useEffect(() => {
    if (categories.length > 0 && !activeMenuCategory) {
      setActiveMenuCategory(categories[0]);
    }
  }, [categories, activeMenuCategory]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100%', padding: '4rem' }}>
        <div style={{ fontSize: '1.25rem', color: '#6B7280', fontWeight: 600, fontFamily: "'Lufga', sans-serif" }}>Loading profile...</div>
      </div>
    );
  }

  if (!restaurant) return null;

  const cuisineStr = Array.isArray(restaurant.cuisines) && restaurant.cuisines.length > 0 ? restaurant.cuisines[0] : 'Various';
  const locationStr = restaurant.address || (Array.isArray(restaurant.areas) && restaurant.areas.length > 0 ? restaurant.areas[0] : (restaurant.city || 'London'));
  const hasUberEats = !!restaurant.ubereats_url;

  // Pricing Engine Logic
  const getDynamicPrice = (basePrice) => {
    let multiplier = 1.0;
    if (activePricingPlatform === 'Uber Eats') multiplier = 1.25;
    if (activePricingPlatform === 'Deliveroo') multiplier = 1.20;
    if (activePricingPlatform === 'Just Eat') multiplier = 1.15;
    
    return (parseFloat(basePrice) * multiplier).toFixed(2);
  };

  const platforms = [
    { 
      id: 'Deliveroo', 
      label: 'Deliveroo', 
      color: '#00CDBC',
      icon: (isActive) => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill={isActive ? '#FFF' : '#9CA3AF'}>
          <path d="M12 2L2 22h20L12 2zm0 6l5 10H7l5-10z" />
        </svg>
      )
    },
    { 
      id: 'Uber Eats', 
      label: 'UberEats', 
      color: '#111111', 
      icon: (isActive) => (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1, textAlign: 'left', fontSize: '0.45rem', fontWeight: 800, color: isActive ? '#FFF' : '#9CA3AF' }}>
          <span>Uber</span>
          <span>Eats</span>
        </div>
      )
    },
    { 
      id: 'Just Eat', 
      label: 'Just Eat', 
      color: '#FE5000', 
      icon: (isActive) => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isActive ? '#FFF' : '#9CA3AF'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      )
    }
  ];

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
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          fontFamily: "'Lufga', sans-serif"
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
          transition: 'transform 0.2s ease',
          fontFamily: "'Lufga', sans-serif"
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

      {/* Main Content Area: Flush with the hero image */}
      <div style={{
        width: '100%',
        padding: '0 2rem',
      }}>
        
        {/* Responsive CSS Grid: Full Menu (Left) and Promos (Right) */}
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

          {/* LEFT COLUMN: Full Menu with Tabs & Pricing Engine */}
          <div style={{...moduleStyle, padding: 0, overflow: 'hidden'}}>
            
            <div style={{...moduleHeaderStyle, padding: '2.5rem 2.5rem 1.5rem', marginBottom: 0}}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <h2 style={{ ...moduleTitleStyle, color: '#E86A58' }}>Full Menu</h2>
                
                {/* Platform Pricing Filters */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {platforms.map(p => {
                    const isActive = activePricingPlatform === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => setActivePricingPlatform(p.id)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                          padding: '0.5rem 1rem',
                          backgroundColor: isActive ? p.color : '#FFFFFF',
                          color: isActive ? '#FFF' : '#6B7280',
                          border: isActive ? `1px solid ${p.color}` : '1px solid #E5E7EB',
                          borderRadius: '9999px',
                          fontSize: '0.9rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          fontFamily: "'Lufga', sans-serif",
                          boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.1)' : '0 2px 4px rgba(0,0,0,0.02)'
                        }}
                      >
                        {p.icon(isActive)}
                        {p.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
            
            {/* Category Tabs Navigation */}
            {categories.length > 0 && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem', 
                padding: '0 2.5rem 1rem 2.5rem',
                borderBottom: '1px solid #F3F4F6',
                overflowX: 'auto',
                scrollbarWidth: 'none'
              }}>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveMenuCategory(cat)}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '9999px',
                      border: 'none',
                      backgroundColor: activeMenuCategory === cat ? '#111' : '#F3F4F6',
                      color: activeMenuCategory === cat ? '#FFF' : '#4B5563',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.2s ease',
                      fontFamily: "'Lufga', sans-serif"
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
            
            <div className="menu-scroll" style={{ 
              maxHeight: '800px', 
              overflowY: 'auto',
              padding: '0 2.5rem 2.5rem',
              display: 'flex', 
              flexDirection: 'column' 
            }}>
              {categories.length > 0 && activeMenuCategory ? (
                <div style={{ animation: 'fadeIn 0.2s ease-in-out' }}>
                  {groupedMenu[activeMenuCategory]?.map((dish, idx) => (
                    <div key={dish.id} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start',
                      padding: '1.25rem 0',
                      borderBottom: idx !== groupedMenu[activeMenuCategory].length - 1 ? '1px solid #F3F4F6' : 'none'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flex: 1, paddingRight: '1rem' }}>
                        {/* Micro-imagery */}
                        {dish.image_url ? (
                          <div style={{ width: '40px', height: '40px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, backgroundColor: '#F3F4F6' }}>
                            <img src={dish.image_url} alt={dish.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        ) : (
                          <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#F9FAFB', flexShrink: 0, border: '1px dashed #E5E7EB' }} />
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1F2937' }}>{dish.name}</span>
                          {dish.description && (
                            <span style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.25rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {dish.description}
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.2rem' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#111', flexShrink: 0, marginTop: '0.1rem' }}>
                          {dish.currency === 'GBP' ? '£' : ''}{getDynamicPrice(dish.price)}
                        </span>
                        {activePricingPlatform !== 'Store' && (
                          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#9CA3AF', backgroundColor: '#F3F4F6', padding: '0.1rem 0.3rem', borderRadius: '4px' }}>
                            {activePricingPlatform}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '3rem 0', textAlign: 'center', color: '#6B7280', fontSize: '0.875rem' }}>
                  No menu items indexed yet.
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Promos */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Active Promotions Module */}
            <div style={moduleStyle}>
              {/* Removed Tag Icon */}
              <div style={moduleHeaderStyle}>
                <h2 style={moduleTitleStyle}>Active Promotions</h2>
              </div>
              <div style={{ padding: '2rem', textAlign: 'center', color: '#6B7280', fontSize: '0.875rem' }}>
                No active promotions detected across delivery networks.
              </div>
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
  letterSpacing: '-0.01em',
  fontFamily: "'Lufga', sans-serif"
};

export default RestaurantProfilePage;
