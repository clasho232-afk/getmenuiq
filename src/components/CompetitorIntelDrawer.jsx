import React, { useState, useEffect, useRef } from 'react';
import { X, ArrowLeft, Plus } from 'lucide-react';
import { supabase } from '../supabase';

const CompetitorIntelDrawer = ({ isOpen, onClose, restaurantId, activeDishId }) => {
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('');
  
  // Ref for scrolling to the active dish
  const activeDishRef = useRef(null);
  const drawerRef = useRef(null);

  useEffect(() => {
    const fetchIntel = async () => {
      if (!restaurantId) return;
      setLoading(true);
      
      const [restRes, menuRes] = await Promise.all([
        supabase.from('restaurants').select('*').eq('id', restaurantId).single(),
        supabase.from('menu_items').select('*').eq('restaurant_id', restaurantId).order('section_name')
      ]);

      if (restRes.data) setRestaurant(restRes.data);
      if (menuRes.data) {
        setMenuItems(menuRes.data);
        
        // Find the active dish's section and set it as the active tab
        if (activeDishId) {
          const targetDish = menuRes.data.find(d => d.id === activeDishId);
          if (targetDish && targetDish.section_name) {
            setActiveTab(targetDish.section_name);
          } else if (menuRes.data.length > 0) {
            setActiveTab(menuRes.data[0].section_name || 'Other');
          }
        } else if (menuRes.data.length > 0) {
          setActiveTab(menuRes.data[0].section_name || 'Other');
        }
      }
      
      setLoading(false);
    };

    if (isOpen && restaurantId) {
      fetchIntel();
    } else {
      setTimeout(() => {
        setRestaurant(null);
        setMenuItems([]);
        setActiveTab('');
      }, 400); 
    }
  }, [isOpen, restaurantId, activeDishId]);



  const groupedMenu = menuItems.reduce((acc, item) => {
    const section = item.section_name || 'Other';
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {});

  const tabs = Object.keys(groupedMenu);
  
  // Platform Mock Helpers (Reused from MarketSearchPage for consistency)
  const getMockPlatforms = (id) => {
    const idStr = String(id);
    let hash = 0;
    for (let i = 0; i < idStr.length; i++) hash = idStr.charCodeAt(i) + ((hash << 5) - hash);
    const num = Math.abs(hash);
    
    const p = [];
    if (num % 2 === 0 || num % 3 === 0) p.push('Uber Eats');
    if (num % 3 === 0 || num % 5 === 0) p.push('Deliveroo');
    if (num % 2 !== 0) p.push('Just Eat');
    if (p.length === 0) p.push('Uber Eats');
    return p;
  };
  
  // Platform pills for restaurant profile
  const pList = restaurant ? getMockPlatforms(restaurant.id) : [];

  // Mock Health Score
  let healthScore = 68;
  if (restaurant) {
    let hash = 0;
    const idStr = String(restaurant.id);
    for (let i = 0; i < idStr.length; i++) hash = idStr.charCodeAt(i) + ((hash << 5) - hash);
    healthScore = Math.abs(hash) % 45 + 55; // 55 to 99 range
  }
  
  let scoreColor = '#EF4444'; // Red
  if (healthScore >= 80) scoreColor = '#10B981'; // Green
  else if (healthScore >= 50) scoreColor = '#F59E0B'; // Orange

  return (
    <>
      {/* Backdrop */}
      <div 
        onClick={onClose}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(4px)',
          zIndex: 10000,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.3s ease'
        }}
      />

      {/* Drawer */}
      <div 
        ref={drawerRef}
        style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: '44vw', minWidth: '560px', maxWidth: '760px',
        backgroundColor: '#F5F4F0', // Warm beige background
        boxShadow: '-10px 0 30px rgba(0,0,0,0.1)',
        zIndex: 10010,
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex', flexDirection: 'column',
        fontFamily: "'Inter', sans-serif",
        overflowY: 'hidden'
      }}>
        
        {loading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>
            Loading intel...
          </div>
        ) : !restaurant ? (
          <div style={{ flex: 1 }} />
        ) : (
          <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, boxSizing: 'border-box' }}>
            
            {/* Header: BACK / RESTAURANT PROFILE */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
              <button 
                onClick={onClose}
                style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  background: 'transparent', border: 'none',
                  fontSize: '0.85rem', fontWeight: 700, color: '#6B7280',
                  cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em'
                }}
              >
                <ArrowLeft size={16} /> BACK
              </button>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#D1D5DB' }}>/</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#111', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Restaurant Profile
              </span>
            </div>

            {/* Top Card: Restaurant Profile */}
            <div style={{
              backgroundColor: '#FFF',
              borderRadius: '24px',
              display: 'flex',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              marginBottom: '2rem'
            }}>
              {/* Left Image */}
              <div style={{ width: '38%', height: 'auto', minHeight: '140px', flexShrink: 0 }}>
                {restaurant.hero_image_url ? (
                  <img src={restaurant.hero_image_url} alt={restaurant.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', backgroundColor: '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '3rem', fontWeight: 800, color: '#9CA3AF' }}>{restaurant.name?.charAt(0)}</span>
                  </div>
                )}
              </div>
              
              {/* Right Content */}
              <div style={{ flex: 1, padding: '1.25rem', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                      <span style={{ color: '#EF4444' }}>MenuIQ</span> Intelligence
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111', margin: '0 0 0.5rem 0' }}>{restaurant.name}</h2>
                    <div style={{ color: '#6B7280', fontSize: '0.85rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                      {Array.isArray(restaurant.areas) && restaurant.areas.length > 0 ? restaurant.areas[0] : (restaurant.city || 'London')}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button style={{
                      backgroundColor: '#EF4444', color: '#FFF',
                      border: 'none', borderRadius: '8px', padding: '0.5rem 0.85rem',
                      fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '0.4rem'
                    }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M7 16V4M7 4L3 8M7 4l4 4M17 8v12M17 20l-4-4M17 20l4-4"/></svg>
                      Compare
                    </button>
                    <button style={{
                      backgroundColor: '#111827', color: '#FFF',
                      border: 'none', borderRadius: '8px', padding: '0.5rem 0.85rem',
                      fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '0.4rem'
                    }}>
                      <Plus size={14} />
                      Add to Competitors
                    </button>
                  </div>
                </div>

                <div style={{ marginTop: '1.2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline' }}>
                    <span style={{ fontSize: '2.5rem', fontWeight: 800, color: scoreColor, lineHeight: 1 }}>{healthScore}</span>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: '#9CA3AF', marginLeft: '0.25rem' }}>/100</span>
                  </div>
                </div>

                <div style={{ marginTop: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', marginBottom: '0.5rem' }}>Platform Coverage:</div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {pList.includes('Uber Eats') && (
                      <div style={{ backgroundColor: '#06C167', color: '#FFF', padding: '0.25rem 0.6rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.75rem' }}>
                        <img src="https://cdn.simpleicons.org/ubereats/white" alt="UberEats" style={{ height: '12px' }} /> UberEats
                      </div>
                    )}
                    {pList.includes('Deliveroo') && (
                      <div style={{ backgroundColor: '#00CCBC', color: '#FFF', padding: '0.25rem 0.6rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.75rem' }}>
                        <img src="https://cdn.simpleicons.org/deliveroo/white" alt="Deliveroo" style={{ height: '12px' }} /> Deliveroo
                      </div>
                    )}
                    {pList.includes('Just Eat') && (
                      <div style={{ backgroundColor: '#FF8000', color: '#FFF', padding: '0.25rem 0.6rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.75rem' }}>
                        <img src="https://cdn.simpleicons.org/justeat/white" alt="Just Eat" style={{ height: '12px' }} /> Just Eat
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Card: Full Menu Matrix */}
            <div style={{
              backgroundColor: '#FFF',
              borderRadius: '24px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              minHeight: 0
            }}>
              {/* Header */}
              <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#111', margin: 0 }}>Full Menu Matrix</h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {pList.includes('Deliveroo') && (
                    <div style={{ backgroundColor: '#00CCBC', color: '#FFF', padding: '0.25rem 0.75rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.75rem' }}>
                      <img src="https://cdn.simpleicons.org/deliveroo/white" alt="Deliveroo" style={{ height: '12px' }} /> Deliveroo
                    </div>
                  )}
                  {pList.includes('Uber Eats') && (
                    <div style={{ backgroundColor: '#06C167', color: '#FFF', padding: '0.25rem 0.75rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.75rem' }}>
                      <img src="https://cdn.simpleicons.org/ubereats/white" alt="UberEats" style={{ height: '12px' }} /> UberEats
                    </div>
                  )}
                  {pList.includes('Just Eat') && (
                    <div style={{ backgroundColor: '#FF8000', color: '#FFF', padding: '0.25rem 0.75rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.75rem' }}>
                      <img src="https://cdn.simpleicons.org/justeat/white" alt="Just Eat" style={{ height: '12px' }} /> Just Eat
                    </div>
                  )}
                </div>
              </div>

              {/* Tabs */}
              <div style={{ 
                padding: '0.5rem 1.5rem', 
                borderBottom: '1px solid #F3F4F6', 
                display: 'flex', 
                gap: '0.5rem',
                overflowX: 'auto',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch'
              }}>
                {tabs.map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '20px',
                      border: 'none',
                      backgroundColor: activeTab === tab ? '#111827' : 'transparent',
                      color: activeTab === tab ? '#FFF' : '#6B7280',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Menu Items List */}
              <div style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto', flex: 1 }}>
                {(groupedMenu[activeTab] || []).map((dish, index) => {
                  const isTarget = dish.id === activeDishId;
                  
                  // Generate a deterministic mock thumbnail
                  const hash = dish.name.split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);
                  const imgId = Math.abs(hash) % 30 + 10;
                  const mockImage = `https://picsum.photos/id/${imgId}/120/120`;

                  return (
                    <div 
                      key={dish.id} 
                      ref={isTarget ? activeDishRef : null}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.65rem 1.5rem',
                        borderBottom: index !== groupedMenu[activeTab].length - 1 ? '1px solid #F3F4F6' : 'none',
                        backgroundColor: isTarget ? '#FEF2F2' : 'transparent', // light red highlight
                        boxShadow: isTarget ? 'inset 0 0 15px rgba(239, 68, 68, 0.2)' : 'none',
                        position: isTarget ? 'relative' : 'static',
                        zIndex: isTarget ? 10 : 1,
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                          <img src={mockImage} alt={dish.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#111' }}>
                          {dish.name}
                        </span>
                      </div>
                      <span style={{ fontSize: '1rem', fontWeight: 800, color: '#111' }}>
                        {dish.currency === 'GBP' ? '£' : ''}{dish.price}
                      </span>
                    </div>
                  );
                })}
              </div>

            </div>

          </div>
        )}
      </div>
    </>
  );
};

export default CompetitorIntelDrawer;
