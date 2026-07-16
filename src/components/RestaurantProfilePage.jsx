import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Utensils, Plus, ExternalLink } from 'lucide-react';
import { supabase } from '../supabase';

const RestaurantProfilePage = ({ restaurantId, onBack, onCompare }) => {
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

      if (restRes.error) {
        console.error('Restaurant query error:', restRes.error);
        setRestaurant({ _error: restRes.error.message });
      } else if (restRes.data) {
        setRestaurant(restRes.data);
      } else {
        setRestaurant({ _error: 'No data returned and no error thrown' });
      }

      if (menuRes.data) {
        setMenuItems(menuRes.data);
      }
      
      setLoading(false);
    };

    if (restaurantId) {
      fetchData();
    } else {
      setRestaurant({ _error: 'restaurantId prop is missing or undefined' });
      setLoading(false);
    }
  }, [restaurantId]);

  // Group menu items by section_name
  const groupedMenu = menuItems.reduce((acc, item) => {
    let section = item.section_name || 'Other';
    // Strip all standard emojis
    section = section.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F200}-\u{1F251}\u{1F004}-\u{1F0CF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1FA00}-\u{1FAFF}\u{2B50}\u{1F900}-\u{1F9FF}]/gu, '').trim();
    if (!section) section = 'Other';
    
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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100%', padding: '4rem', backgroundColor: '#f8fafc' }}>
        <div style={{ fontSize: '1rem', color: '#64748b', fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>Loading profile...</div>
      </div>
    );
  }

  if (restaurant && restaurant._error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100%', padding: '4rem', backgroundColor: '#f8fafc' }}>
        <div style={{ fontSize: '1rem', color: '#EF4444', fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>Error: Could not load restaurant profile.</div>
        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '1rem' }}>ID: {restaurantId}</div>
        <div style={{ fontSize: '0.8rem', color: '#EF4444', marginTop: '0.5rem', maxWidth: '400px', textAlign: 'center' }}>Details: {restaurant._error}</div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100%', padding: '4rem', backgroundColor: '#f8fafc' }}>
        <div style={{ fontSize: '1rem', color: '#EF4444', fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>Error: Could not load restaurant profile. (Null)</div>
        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '1rem' }}>ID: {restaurantId}</div>
      </div>
    );
  }

  const toTitleCase = (str) => {
    if (!str) return '';
    return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const displayRestaurantName = restaurant ? toTitleCase(restaurant.name) : '';
  const cuisineStr = Array.isArray(restaurant.cuisines) && restaurant.cuisines.length > 0 ? restaurant.cuisines[0] : 'Various';
  const locationStr = restaurant.address || (Array.isArray(restaurant.areas) && restaurant.areas.length > 0 ? restaurant.areas[0] : (restaurant.city || 'London'));
  const hasUberEats = !!restaurant.ubereats_url;
  const hasDeliveroo = !!restaurant.deliveroo_url;
  const hasJustEat = !!restaurant.justeat_url;

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
      color: '#00CCBC',
      shadow: 'rgba(0, 204, 188, 0.2)',
      icon: 'https://cdn.simpleicons.org/deliveroo/white'
    },
    { 
      id: 'Uber Eats', 
      label: 'UberEats', 
      color: '#06C167', 
      shadow: 'rgba(6, 193, 103, 0.2)',
      icon: 'https://cdn.simpleicons.org/ubereats/white'
    },
    { 
      id: 'Just Eat', 
      label: 'Just Eat', 
      color: '#FF8000', 
      shadow: 'rgba(255, 128, 0, 0.2)',
      icon: 'https://cdn.simpleicons.org/justeat/white'
    }
  ];

  return (
    <div style={{
      fontFamily: "'Inter', sans-serif",
      display: 'flex',
      flexDirection: 'column',
      color: '#0f172a'
    }}>
      
      {/* Main Content Dashboard Area */}
      <div style={{
        width: '100%',
        padding: '2rem 3rem 2rem 1%',
        flex: 1
      }}>
        
        {/* CSS Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem'
        }} className="bento-grid">
          
          <style>
            {`
              @media (min-width: 1000px) {
                .bento-grid {
                  grid-template-columns: 1.5fr 1fr !important;
                }
              }
              .menu-scroll::-webkit-scrollbar { width: 6px; }
              .menu-scroll::-webkit-scrollbar-track { background: transparent; }
              .menu-scroll::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
              .menu-scroll::-webkit-scrollbar-thumb:hover { background-color: #94a3b8; }
            `}
          </style>

          {/* LEFT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', overflow: 'hidden' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '-0.5rem', paddingLeft: '0.2rem' }}>
              {onBack ? (
                <button 
                  onClick={onBack}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.25rem', 
                    background: 'none', 
                    border: 'none', 
                    padding: 0, 
                    cursor: 'pointer',
                    fontSize: '0.75rem', 
                    fontWeight: 600, 
                    color: '#94a3b8', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.1em'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#0f172a'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                >
                  <ArrowLeft size={14} />
                  Back
                </button>
              ) : (
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Intelligence</span>
              )}
              <span style={{ color: '#cbd5e1', fontSize: '0.75rem' }}>/</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Restaurant Profile</span>
            </div>

            {/* HERO CARD */}
            <div style={{
              ...moduleStyle, 
              flexDirection: 'row', 
              padding: 0, 
              overflow: 'hidden', 
              minHeight: '180px'
            }}>
              {/* Left Image Split */}
              <div style={{ width: '260px', maxWidth: '35%', flexShrink: 0, backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {restaurant.hero_image_url ? (
                  <img src={restaurant.hero_image_url} alt={displayRestaurantName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '3rem', color: '#cbd5e1', fontWeight: 800 }}>{displayRestaurantName?.charAt(0)}</span>
                )}
              </div>
              
              {/* Right Content Split */}
              <div style={{ flex: 1, padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  top: '1.25rem',
                  right: '1.5rem',
                  display: 'flex',
                  gap: '0.5rem'
                }}>
                  <button 
                    onClick={() => {
                      if (onCompare) {
                        onCompare(restaurant);
                      } else {
                        // Fallback: global event
                        const compareList = [restaurant];
                        window.dispatchEvent(new CustomEvent('open-competitors-matrix', {
                          detail: { compareList }
                        }));
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.5rem 0.8rem',
                      backgroundColor: '#E86A58',
                      color: '#FFF',
                      borderRadius: '6px',
                      border: 'none',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
                      transition: 'transform 0.2s ease',
                      fontFamily: "'Lufga', sans-serif"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <span style={{ fontSize: '1.2em' }}>⇄</span>
                    Compare
                  </button>
                  <button style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.5rem 0.8rem',
                    backgroundColor: '#0f172a',
                    color: '#FFF',
                    borderRadius: '6px',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
                    transition: 'transform 0.2s ease',
                    fontFamily: "'Inter', sans-serif"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                  <Plus size={14} />
                  Add to Competitors
                </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.35rem' }}>
                  <span style={{ color: '#E86A58', fontWeight: 800, fontSize: '0.65rem', letterSpacing: '0.05em' }}>MenuIQ</span>
                  <span style={{ color: '#9ca3af', fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.05em' }}>INTELLIGENCE</span>
                </div>
                
                <h1 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 0.2rem 0', color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                  {displayRestaurantName}
                </h1>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, marginBottom: '1rem' }}>
                  <MapPin size={12} />
                  {locationStr}
                </div>
                
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.2rem', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 900, color: '#E86A58', letterSpacing: '-0.04em', lineHeight: 1 }}>68</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8' }}>/100</span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8' }}>Platform Coverage:</span>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {hasDeliveroo && (
                      <div style={{ backgroundColor: '#00CDBC', color: '#FFF', padding: '0.25rem 0.6rem', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.65rem', fontWeight: 800 }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 22h20L12 2zm0 6l5 10H7l5-10z" /></svg>
                        Deliveroo
                      </div>
                    )}
                    {hasUberEats && (
                      <div style={{ backgroundColor: '#06C167', color: '#FFF', padding: '0.25rem 0.6rem', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.65rem', fontWeight: 800 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1, textAlign: 'center', fontSize: '0.35rem' }}><span>Uber</span><span>Eats</span></div>
                        UberEats
                      </div>
                    )}
                    {hasJustEat && (
                      <div style={{ backgroundColor: '#FE5000', color: '#FFF', padding: '0.25rem 0.6rem', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.65rem', fontWeight: 800 }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                        Just Eat
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* FULL MENU MATRIX */}
            <div style={{...moduleStyle, padding: 0, overflow: 'hidden'}}>
              
              <div style={{...moduleHeaderStyle, padding: '1.5rem', marginBottom: 0}}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <h2 style={moduleTitleStyle}>Full Menu Matrix</h2>
                  
                  {/* Platform Pricing Filters */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {platforms.map(p => {
                      const isActive = activePricingPlatform === p.id;
                      return (
                        <button
                          key={p.id}
                          onClick={() => setActivePricingPlatform(p.id)}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                            padding: '0.4rem 0.8rem',
                            background: p.color,
                            color: '#FFFFFF',
                            border: '2px solid transparent',
                            borderRadius: '9999px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: `0 1px 2px ${p.shadow}`,
                            opacity: 1,
                            transform: isActive ? 'scale(1.05)' : 'scale(1)',
                            filter: isActive ? 'saturate(1.2) brightness(1.05)' : 'saturate(1)'
                          }}
                        >
                          <img src={p.icon} alt={p.label} style={{ height: '14px', width: '14px' }} />
                          <span style={{ fontSize: '12px', fontWeight: 800, color: '#FFFFFF', whiteSpace: 'nowrap' }}>{p.label}</span>
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
                  padding: '0.75rem 1.5rem',
                  borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                  backgroundColor: 'transparent',
                  overflowX: 'auto',
                  scrollbarWidth: 'none'
                }}>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveMenuCategory(cat)}
                      style={{
                        padding: '0.4rem 0.8rem',
                        borderRadius: '999px',
                        border: 'none',
                        backgroundColor: activeMenuCategory === cat ? '#0f172a' : 'transparent',
                        color: activeMenuCategory === cat ? '#FFF' : '#64748b',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.2s ease',
                        fontFamily: "'Inter', sans-serif"
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
              
              <div className="menu-scroll" style={{ 
                maxHeight: '600px', 
                overflowY: 'auto',
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
                        padding: '1.25rem 1.5rem',
                        borderBottom: idx !== groupedMenu[activeMenuCategory].length - 1 ? '1px solid #E5E7EB' : 'none'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flex: 1, paddingRight: '1rem' }}>
                          {/* Micro-imagery */}
                          {dish.image_url ? (
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
                              <img src={dish.image_url} alt={dish.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                          ) : (
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#F3F4F6', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path>
                                <path d="M7 2v20"></path>
                                <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path>
                              </svg>
                            </div>
                          )}
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>{dish.name}</span>
                            {dish.description && (
                              <span style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.4 }}>
                                {dish.description}
                              </span>
                            )}
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.2rem' }}>
                          <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a', flexShrink: 0, marginTop: '0.1rem' }}>
                            {dish.currency === 'GBP' ? '£' : ''}{getDynamicPrice(dish.price)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '3rem 0', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
                    No menu items indexed yet.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Actions & Modules */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '5%' }}>
            
            {/* Alignment Spacer (matches left column breadcrumb) */}
            <div style={{ minHeight: '18px', marginBottom: '-0.5rem' }} />
            
            {/* Price Gap Analysis Module */}
            <div style={moduleStyle}>
              <div style={{...moduleHeaderStyle, padding: '1.25rem', paddingBottom: '0.75rem', flexDirection: 'column', alignItems: 'flex-start', gap: '0.25rem', borderBottom: 'none' }}>
                <h2 style={{ ...moduleTitleStyle, letterSpacing: '-0.02em', fontWeight: 800 }}>Price Gap Analysis</h2>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  You share 14 direct items with {displayRestaurantName}.
                </span>
              </div>
              
              <div style={{ padding: '0 1.25rem 1.25rem 1.25rem', display: 'flex', flexDirection: 'column' }}>
                {[
                  { category: 'Pizzas', gap: 'They are 12% cheaper', gapType: 'danger', impact: 'High Vulnerability' },
                  { category: 'Beef Burgers', gap: 'Exact same price', gapType: 'warning', impact: 'Visibility Battle' },
                  { category: 'Loaded Fries', gap: 'You are 8% cheaper', gapType: 'safe', impact: 'Competitive Edge' }
                ].map((row, i, arr) => {
                  let gapColor = '#F59E0B'; // warning (orange/yellow)
                  if (row.gapType === 'danger') gapColor = '#DC2626'; // red
                  if (row.gapType === 'safe') gapColor = '#16A34A'; // green
                  
                  return (
                    <div key={i} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      padding: '0.75rem 0',
                      borderBottom: i !== arr.length - 1 ? '1px solid #E5E7EB' : 'none'
                    }}>
                      {/* Left: Category */}
                      <span style={{ flex: '0 0 30%', fontSize: '0.85rem', fontWeight: 500, color: '#0f172a' }}>{row.category}</span>
                      
                      {/* Middle: Gap */}
                      <span style={{ flex: '1', fontSize: '0.8rem', fontWeight: 700, color: gapColor }}>{row.gap}</span>
                      
                      {/* Right: Impact */}
                      <div style={{ flex: '0 0 35%', display: 'flex', justifyContent: 'flex-end' }}>
                        <span style={{ 
                          fontSize: '0.6rem', 
                          fontWeight: 800, 
                          color: '#64748b', 
                          textTransform: 'uppercase', 
                          letterSpacing: '0.05em',
                          backgroundColor: '#F3F4F6',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          whiteSpace: 'nowrap'
                        }}>
                          {row.impact}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Action Footer */}
              <div style={{ 
                padding: '0.75rem 1.25rem', 
                borderTop: '1px solid #E5E7EB', 
                display: 'flex', 
                justifyContent: 'flex-end',
                backgroundColor: '#f8fafc',
                borderBottomLeftRadius: '24px',
                borderBottomRightRadius: '24px'
              }}>
                <button style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'color 0.2s',
                  padding: 0
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#0f172a'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
                >
                  &rarr; Review Overlapping Items
                </button>
              </div>
            </div>

            {/* Active Promotions Module */}
            <div style={moduleStyle}>
              <div style={{...moduleHeaderStyle, padding: '1.25rem', marginBottom: 0}}>
                <h2 style={moduleTitleStyle}>Active Promotions</h2>
              </div>
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
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
  background: '#fcfaf8',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  borderRadius: '24px',
  border: '1px solid rgba(0, 0, 0, 0.06)',
  display: 'flex',
  flexDirection: 'column'
};

const moduleHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
};

const moduleTitleStyle = {
  fontSize: '1rem',
  fontWeight: 800,
  color: '#0f172a',
  margin: 0,
  fontFamily: "'Inter', sans-serif"
};

export default RestaurantProfilePage;
