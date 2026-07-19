import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, ChevronDown, Filter, Zap, Check, X } from 'lucide-react';
import { supabase } from '../supabase';
import CompetitorIntelDrawer from './CompetitorIntelDrawer';
import RadiusMapModal from './RadiusMapModal';
import AIGreeting from './AIGreeting';
import AICommandOverlay from './AICommandOverlay';

const MarketSearchPage = ({ 
  searchWhat, setSearchWhat, 
  activeCategory, setActiveCategory, 
  onSelectRestaurant 
}) => {
  // Determine query mode
  const isDataTableMode = activeCategory === 'Menu Items' || activeCategory === 'Promos';

  // State: Data
  const [restaurants, setRestaurants] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);

  // State: Filters
  const [radiusFilter, setRadiusFilter] = useState('Within 3 Miles');
  const [platform, setPlatform] = useState('All');
  const [promoOnly, setPromoOnly] = useState(false);
  const [priceRange, setPriceRange] = useState(100);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  // Table Controls
  const [priceSortOrder, setPriceSortOrder] = useState(null); // 'asc' | 'desc' | null
  const [isPlatformMenuOpen, setIsPlatformMenuOpen] = useState(false);
  const platformDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (platformDropdownRef.current && !platformDropdownRef.current.contains(event.target)) {
        setIsPlatformMenuOpen(false);
      }
    };
    if (isPlatformMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPlatformMenuOpen]);

  // State: Drawer
  const [intelDrawerOpen, setIntelDrawerOpen] = useState(false);
  const [activeRestaurantId, setActiveRestaurantId] = useState(null);
  const [activeDishId, setActiveDishId] = useState(null);
  const [isAIOverlayOpen, setIsAIOverlayOpen] = useState(false);
  const [compareList, setCompareList] = useState([]);
  const [toastMessage, setToastMessage] = useState('');
  const [hoveredCardId, setHoveredCardId] = useState(null);

  const toggleCompetitorSelection = (e, restaurant) => {
    e.stopPropagation();
    setCompareList(prev => {
      const isSelected = prev.some(c => c.id === restaurant.id);
      if (isSelected) {
        return prev.filter(c => c.id !== restaurant.id);
      } else {
        return [...prev, restaurant];
      }
    });
  };

  // Clear selection when category changes
  useEffect(() => {
    setCompareList([]);
  }, [activeCategory]);

  // Fetch Logic
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const whatQ = searchWhat.trim();

      if (activeCategory === 'Restaurants') {
        let query = supabase.from('restaurants').select('*').order('rating_count', { ascending: false }).limit(30);
        if (whatQ) query = query.ilike('name', `%${whatQ}%`);
        
        const { data, error } = await query;
        if (!error && data) setRestaurants(data);
        
      } else {
        // Menu Items & Promos Mode
        let query = supabase.from('menu_items').select('*, restaurants(name, hero_image_url, address, areas, ubereats_url)').limit(60);
        if (whatQ) query = query.ilike('name', `%${whatQ}%`);
        
        const { data, error } = await query;
        if (!error && data) {
          // Client-side filtering
          const filtered = data.filter(d => {
            const isPromoItem = d.id % 3 === 0; // Deterministic mock promo flag
            
            // If in Promos tab, strictly only show promos
            if (activeCategory === 'Promos' && !isPromoItem) return false;
            
            // In Menu Items tab, respect the Promo Only toggle
            if (activeCategory === 'Menu Items' && promoOnly && !isPromoItem) return false;
            
            if (activeCategory === 'Menu Items' && d.price > priceRange) return false;
            
            if (platform !== 'All') {
              const mockPlatforms = getMockPlatforms(d.restaurant_id || d.id.toString());
              if (!mockPlatforms.includes(platform)) return false;
            }
            
            return true;
          });
          setDishes(filtered);
        }
      }
      setLoading(false);
    };

    const timer = setTimeout(() => fetchData(), 300);
    return () => clearTimeout(timer);
  }, [searchWhat, activeCategory, promoOnly, priceRange, platform]);

  const handleRowClick = (restaurantId, dishId) => {
    setActiveRestaurantId(restaurantId);
    setActiveDishId(dishId);
    setIntelDrawerOpen(true);
  };

  // Mock Generators
  const getMockDistance = (id) => {
    const idStr = String(id);
    let hash = 0;
    for (let i = 0; i < idStr.length; i++) hash = idStr.charCodeAt(i) + ((hash << 5) - hash);
    return ((Math.abs(hash) % 48) / 10 + 0.1).toFixed(1);
  };

  const getMockDeal = (id) => {
    const deals = ['BOGO', '20% Off £15+', 'Free Delivery', '15% Off', 'Buy 1 Get 1 Half Price'];
    return deals[id % deals.length];
  };

  // Platform Mock Helpers
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

  const getSmallPlatformLogo = (platform) => {
    switch(platform) {
      case 'Deliveroo':
        return (
          <div key="dl" style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <img src="https://cdn.simpleicons.org/deliveroo/00CCBC" alt="Deliveroo" style={{ width: '16px', height: '16px' }} />
          </div>
        );
      case 'Uber Eats':
        return (
          <div key="ue" style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <img src="https://cdn.simpleicons.org/ubereats/06C167" alt="UberEats" style={{ width: '16px', height: '16px' }} />
          </div>
        );
      case 'Just Eat':
        return (
          <div key="je" style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <img src="https://cdn.simpleicons.org/justeat/FF8000" alt="Just Eat" style={{ width: '16px', height: '16px' }} />
          </div>
        );
      default: return null;
    }
  };

  return (
    <div style={{
      fontFamily: "'Lufga', sans-serif",
      minHeight: '100%',
      display: 'flex',
      flexDirection: 'column',
      padding: '1.5rem 2rem',
      backgroundColor: 'transparent',
      position: 'relative'
    }}>
      
      {/* Compressed Header Section */}
      <div style={{ width: '100%', marginBottom: '1.5rem' }}>
        
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'end', justifyContent: 'space-between', width: '100%', marginBottom: '1rem' }}>
          <h1 style={{ 
            fontSize: '1.5rem',
            fontFamily: "'Lufga', sans-serif",
            fontWeight: 700, 
            textAlign: 'left', 
            margin: 0,
            color: '#111',
            letterSpacing: '-0.02em'
          }}>
            Market Search
          </h1>
        </div>

        {/* High-Density Command Bar */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1rem', 
          flexWrap: 'wrap' 
        }}>
          
          {/* Search & Radius Combined Input */}
          <div style={{
            display: 'flex',
            backgroundColor: '#FFF',
            borderRadius: '8px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
            alignItems: 'center',
            flex: 1,
            minWidth: '400px',
            height: '42px'
          }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 1rem' }}>
              <Search size={16} color="#9CA3AF" style={{ flexShrink: 0, marginRight: '0.75rem' }} />
              <input 
                type="text"
                placeholder={activeCategory === 'Restaurants' ? "Search competitors..." : "Search menu items or promos..."}
                value={searchWhat}
                onChange={(e) => setSearchWhat(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  width: '100%',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  fontFamily: 'inherit',
                  color: '#111',
                  background: 'transparent'
                }}
              />
            </div>

          </div>

          {/* Category Pills */}
          <div style={{ 
            display: 'flex', 
            backgroundColor: '#F3F4F6', 
            borderRadius: '8px', 
            padding: '4px',
            height: '42px'
          }}>
            {['Restaurants', 'Menu Items', 'Promos'].map(cat => (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setSearchWhat(''); }}
                style={{
                  padding: '0 1.25rem',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  transition: 'all 0.2s ease',
                  backgroundColor: activeCategory === cat ? '#FFF' : 'transparent',
                  color: activeCategory === cat ? '#111' : '#6B7280',
                  boxShadow: activeCategory === cat ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Dynamic Results Ledger */}
      <div style={{ width: '100%' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#6B7280' }}>
            Analyzing market ecosystem...
          </div>
        ) : !isDataTableMode ? (
          /* RESTAURANTS MODE: 3-Column Grid */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {restaurants.length > 0 ? restaurants.map(restaurant => {
              const hasUberEats = !!restaurant.ubereats_url;
              const cuisineString = Array.isArray(restaurant.cuisines) && restaurant.cuisines.length > 0 ? restaurant.cuisines[0] : 'Various';
              const locationString = Array.isArray(restaurant.areas) && restaurant.areas.length > 0 ? restaurant.areas[0] : (restaurant.city || 'London');
              
              // Generate the platform list for this card
              const pList = getMockPlatforms(restaurant.id?.toString() || '');
              
              // Generate Health Score
              let hash = 0;
              const idStr = restaurant.id?.toString() || '';
              for (let i = 0; i < idStr.length; i++) hash = idStr.charCodeAt(i) + ((hash << 5) - hash);
              const healthScore = Math.abs(hash) % 45 + 55; // 55 to 99 range
              const overlapScore = Math.abs(hash * 3) % 40 + 30; // 30-69 range
              
              let scoreColor = '#EF4444'; // Red
              if (healthScore >= 80) scoreColor = '#10B981'; // Green
              else if (healthScore >= 50) scoreColor = '#F59E0B'; // Orange
              
              let healthColor = '#10B981';
              if (overlapScore >= 60) healthColor = '#EF4444';
              else if (overlapScore >= 40) healthColor = '#F59E0B';

              const isSelected = compareList.some(c => c.id === restaurant.id);
              const isHovered = hoveredCardId === restaurant.id;

              return (
                <div 
                  key={restaurant.id}
                  onClick={() => onSelectRestaurant(restaurant.id)}
                  style={{
                    backgroundColor: '#FFF',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: isSelected ? '2px solid #E86A58' : '1px solid #E5E7EB',
                    boxShadow: isSelected ? '0 4px 12px rgba(232, 106, 88, 0.2)' : '0 2px 8px -2px rgba(0,0,0,0.05)',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease, border 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => { 
                    setHoveredCardId(restaurant.id);
                    e.currentTarget.style.transform = 'translateY(-2px)'; 
                    e.currentTarget.style.boxShadow = isSelected ? '0 8px 16px rgba(232, 106, 88, 0.25)' : '0 8px 16px -4px rgba(0,0,0,0.08)'; 
                  }}
                  onMouseLeave={(e) => { 
                    setHoveredCardId(null);
                    e.currentTarget.style.transform = 'translateY(0)'; 
                    e.currentTarget.style.boxShadow = isSelected ? '0 4px 12px rgba(232, 106, 88, 0.2)' : '0 2px 8px -2px rgba(0,0,0,0.05)'; 
                  }}
                >
                  {/* CHECKBOX OVERLAY */}
                  {(isSelected || isHovered) && (
                    <div 
                      onClick={(e) => toggleCompetitorSelection(e, restaurant)}
                      style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: isSelected ? '#E86A58' : 'rgba(255,255,255,0.9)',
                        border: isSelected ? '2px solid #E86A58' : '2px solid #E5E7EB',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer'
                      }}
                    >
                      {isSelected && <Check size={14} color="#FFF" strokeWidth={3} />}
                    </div>
                  )}

                  <div style={{ height: '140px', width: '100%', overflow: 'hidden', backgroundColor: '#F3F1EC' }}>
                    {restaurant.hero_image_url ? (
                      <img src={restaurant.hero_image_url} alt={restaurant.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontWeight: 800, fontSize: '1.5rem' }}>
                        {restaurant.name?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <h3 style={{ 
                        fontSize: '1rem', 
                        fontWeight: 600, 
                        color: '#111', 
                        margin: 0, 
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis' 
                      }}>
                        {restaurant.name ? restaurant.name.toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) : ''}
                      </h3>
                      
                      {/* Middle Metrics Row */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                        
                        {/* Menu Overlap Metric */}
                        <div style={{ flex: '0 0 60%', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#6B7280' }}>Menu Overlap</span>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4B5563' }}>{overlapScore}%</span>
                          </div>
                          <div style={{ width: '100%', height: '4px', backgroundColor: '#F3F4F6', borderRadius: '999px', overflow: 'hidden' }}>
                            <div style={{ width: `${overlapScore}%`, height: '100%', backgroundColor: healthColor, borderRadius: '999px' }} />
                          </div>
                        </div>

                        {/* Health Score Metric */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.1rem', marginTop: '-0.4rem', textAlign: 'right' }}>
                          <span style={{ fontSize: '0.55rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Health Score</span>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.1rem', justifyContent: 'flex-end' }}>
                            <span style={{ fontSize: '1.2rem', fontWeight: 900, color: scoreColor, letterSpacing: '-0.02em', lineHeight: 1 }}>{healthScore}</span>
                            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748B' }}>/100</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {locationString && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#8A92A6', fontSize: '0.75rem', fontWeight: 500 }}>
                            <MapPin size={12} color="#8A92A6" />
                            <span>{locationString}</span>
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {pList.map(p => getSmallPlatformLogo(p))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div style={{ gridColumn: '1 / -1', marginTop: '2rem', color: '#6B7280', textAlign: 'center' }}>No restaurants found.</div>
            )}
          </div>
        ) : (
          /* DATA TABLE LEDGER (Menu Items & Promos Mode) */
          <div style={{ width: '100%' }}>
            {/* Metadata & Action Row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1rem' }}>
              <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: 500 }}>
                Showing {dishes.length} items
              </span>
            </div>

            <div style={{ 
              backgroundColor: '#FFF', 
              borderRadius: '12px', 
              boxShadow: '0 4px 15px -5px rgba(0,0,0,0.05)',
              border: '1px solid #E5E7EB',
              overflow: 'visible'
            }}>
              {dishes.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                      <th style={{ padding: '0.8rem 1.25rem', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#8A92A6', fontFamily: "'Inter', sans-serif", textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Restaurant
                      </th>
                      <th style={{ padding: '0.8rem 1.25rem', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#8A92A6', fontFamily: "'Inter', sans-serif", textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {activeCategory === 'Promos' ? 'Promo Target' : 'Dish Name'}
                      </th>
                      <th 
                        ref={platformDropdownRef}
                        style={{ padding: '0.8rem 1.25rem', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#8A92A6', fontFamily: "'Inter', sans-serif", textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer', position: 'relative' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        onClick={() => setIsPlatformMenuOpen(!isPlatformMenuOpen)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          PLATFORM <Filter size={12} color="#8A92A6" />
                        </div>
                        {isPlatformMenuOpen && (
                          <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            marginTop: '4px',
                            backgroundColor: '#FFF',
                            border: '1px solid #E5E7EB',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            padding: '0.5rem',
                            zIndex: 100,
                            minWidth: '140px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.25rem',
                            textTransform: 'none',
                            letterSpacing: 'normal'
                          }}
                          onClick={(e) => e.stopPropagation()}
                          >
                            <button onClick={() => { setPlatform('All'); setIsPlatformMenuOpen(false); }} style={{ padding: '8px 12px', borderRadius: '8px', background: platform === 'All' ? '#F3F4F6' : 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', width: '100%', justifyContent: 'flex-start' }}>
                              <span style={{ fontSize: '13px', fontWeight: 500, color: '#111' }}>All Platforms</span>
                            </button>
                            <button onClick={() => { setPlatform('Uber Eats'); setIsPlatformMenuOpen(false); }} style={{ padding: '8px 12px', borderRadius: '8px', background: platform === 'Uber Eats' ? '#F3F4F6' : 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', width: '100%', justifyContent: 'flex-start' }}>
                              <img src="https://cdn.simpleicons.org/ubereats/06C167" alt="UberEats" style={{ width: '16px', height: '16px' }} />
                              <span style={{ fontSize: '13px', fontWeight: 500, color: '#111' }}>UberEats</span>
                            </button>
                            <button onClick={() => { setPlatform('Deliveroo'); setIsPlatformMenuOpen(false); }} style={{ padding: '8px 12px', borderRadius: '8px', background: platform === 'Deliveroo' ? '#F3F4F6' : 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', width: '100%', justifyContent: 'flex-start' }}>
                              <img src="https://cdn.simpleicons.org/deliveroo/00CCBC" alt="Deliveroo" style={{ width: '16px', height: '16px' }} />
                              <span style={{ fontSize: '13px', fontWeight: 500, color: '#111' }}>Deliveroo</span>
                            </button>
                            <button onClick={() => { setPlatform('Just Eat'); setIsPlatformMenuOpen(false); }} style={{ padding: '8px 12px', borderRadius: '8px', background: platform === 'Just Eat' ? '#F3F4F6' : 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', width: '100%', justifyContent: 'flex-start' }}>
                              <img src="https://cdn.simpleicons.org/justeat/FF8000" alt="Just Eat" style={{ width: '16px', height: '16px' }} />
                              <span style={{ fontSize: '13px', fontWeight: 500, color: '#111' }}>Just Eat</span>
                            </button>
                          </div>
                        )}
                      </th>
                      <th 
                        style={{ padding: '0.8rem 1.25rem', textAlign: 'right', fontSize: '11px', fontWeight: 600, color: '#8A92A6', fontFamily: "'Inter', sans-serif", textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        onClick={() => {
                          setPriceSortOrder(prev => {
                            if (!prev) return 'asc';
                            if (prev === 'asc') return 'desc';
                            return null;
                          });
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                          {activeCategory === 'Promos' ? 'Offer' : 'Price'} 
                          <span style={{ fontSize: '13px', fontWeight: 800 }}>{priceSortOrder === 'asc' ? '↑' : priceSortOrder === 'desc' ? '↓' : '↕'}</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const displayDishes = [...dishes].sort((a, b) => {
                        if (!priceSortOrder) return 0;
                        const aPrice = Number(a.price) || 0;
                        const bPrice = Number(b.price) || 0;
                        return priceSortOrder === 'asc' ? aPrice - bPrice : bPrice - aPrice;
                      });
                      return displayDishes.map((dish, idx) => {
                    const isPromo = dish.id % 3 === 0;
                    const originalPrice = (dish.price * 1.25).toFixed(2);
                    const distance = getMockDistance(dish.restaurant_id || dish.id.toString());
                    const locationArea = Array.isArray(dish.restaurants?.areas) && dish.restaurants?.areas.length > 0 ? dish.restaurants.areas[0] : 'London';

                    return (
                      <tr 
                        key={dish.id} 
                        onClick={() => handleRowClick(dish.restaurant_id, dish.id)}
                        style={{ 
                          borderBottom: idx !== dishes.length - 1 ? '1px solid #F3F4F6' : 'none',
                          cursor: 'pointer',
                          fontFamily: "'Inter', sans-serif",
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FAFAF9'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        {/* Restaurant */}
                        <td style={{ padding: '0.8rem 1.25rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#F3F1EC', overflow: 'hidden', flexShrink: 0 }}>
                              {dish.restaurants?.hero_image_url ? (
                                <img src={dish.restaurants.hero_image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : null}
                            </div>
                            <span style={{ fontWeight: 700, color: '#111', fontSize: '13px' }}>
                              {dish.restaurants?.name || 'Unknown'}
                            </span>
                          </div>
                        </td>

                        {/* Dish Name */}
                        <td style={{ padding: '0.8rem 1.25rem', fontWeight: 500, color: '#374151', fontSize: '13px' }}>
                          {dish.name}
                        </td>

                        {/* Platform */}
                        <td style={{ padding: '0.8rem 1.25rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {getMockPlatforms(dish.restaurant_id || dish.id.toString())
                              .filter(p => platform === 'All' || p === platform)
                              .map(p => getSmallPlatformLogo(p))}
                          </div>
                        </td>

                        {/* Price / Offer */}
                        <td style={{ padding: '0.8rem 1.25rem', textAlign: 'right' }}>
                          {activeCategory === 'Promos' ? (
                            <span style={{ color: '#EF4444', fontWeight: 700, fontSize: '13px', backgroundColor: '#FEF2F2', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                              {getMockDeal(dish.id)}
                            </span>
                          ) : isPromo ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                              <span style={{ textDecoration: 'line-through', color: '#9CA3AF', fontSize: '12px', fontWeight: 500, paddingRight: '0.25rem' }}>£{originalPrice}</span>
                              <span style={{ color: '#EF4444', fontWeight: 700, fontSize: '13px' }}>£{Number(dish.price).toFixed(2)}</span>
                            </div>
                          ) : (
                            <span style={{ color: '#111', fontWeight: 700, fontSize: '13px' }}>£{Number(dish.price).toFixed(2)}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })})()}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: '4rem', textAlign: 'center', color: '#6B7280' }}>No tactical data matches your criteria.</div>
            )}
          </div>
        </div>
      )}
    </div>

      <CompetitorIntelDrawer 
        isOpen={intelDrawerOpen} 
        onClose={() => setIntelDrawerOpen(false)} 
        restaurantId={activeRestaurantId}
        activeDishId={activeDishId}
      />

      <RadiusMapModal 
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        initialRadiusStr={radiusFilter}
        onApply={(newVal) => setRadiusFilter(newVal)}
      />

      <AICommandOverlay 
        isOpen={isAIOverlayOpen} 
        onClose={() => setIsAIOverlayOpen(false)} 
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#EF4444',
          color: '#FFF',
          padding: '0.75rem 1.5rem',
          borderRadius: '8px',
          fontWeight: 600,
          fontSize: '0.875rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 2000,
          animation: 'slideDown 0.3s ease-out',
          fontFamily: "'Lufga', sans-serif"
        }}>
          {toastMessage}
        </div>
      )}

      {/* Floating Action Bar */}
      {compareList.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#111',
          borderRadius: '999px',
          padding: '0.75rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
          zIndex: 1000,
          animation: 'slideUp 0.3s ease-out'
        }}>
          {/* TOP-RIGHT CLOSE BUTTON */}
          <button 
            onClick={() => setCompareList([])}
            style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: '#4B5563',
              border: '2px solid #111',
              color: '#FFF',
              cursor: 'pointer',
              padding: 0,
              transition: 'background-color 0.2s ease, transform 0.2s ease',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#EF4444'; e.currentTarget.style.transform = 'scale(1.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#4B5563'; e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <X size={14} strokeWidth={3} />
          </button>

          <span style={{ color: '#FFF', fontWeight: 600, fontSize: '0.85rem', fontFamily: "'Lufga', sans-serif", paddingLeft: '0.5rem' }}>
            <span style={{ color: '#E86A58' }}>{compareList.length}</span> Restaurants selected for comparison.
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => {
                setToastMessage('Added to Watchlist');
                setTimeout(() => setToastMessage(''), 3000);
              }}
              style={{
                backgroundColor: '#E86A58',
                color: '#FFF',
                border: 'none',
                borderRadius: '999px',
                padding: '0.5rem 1rem',
                fontWeight: 800,
                fontSize: '0.75rem',
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                transition: 'transform 0.2s ease',
                fontFamily: "'Lufga', sans-serif"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              + Add to Watchlist
            </button>
            <button
              disabled={compareList.length > 3}
              onClick={() => {
                window.dispatchEvent(new CustomEvent('open-comparison-modal', { detail: { competitorsList: compareList } }));
              }}
              style={{
                backgroundColor: '#E86A58',
                color: '#FFF',
                border: 'none',
                borderRadius: '999px',
                padding: '0.5rem 1rem',
                fontWeight: 800,
                fontSize: '0.75rem',
                cursor: compareList.length > 3 ? 'not-allowed' : 'pointer',
                opacity: compareList.length > 3 ? 0.5 : 1,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                transition: 'transform 0.2s ease',
                fontFamily: "'Lufga', sans-serif"
              }}
              onMouseEnter={(e) => { if (compareList.length <= 3) e.currentTarget.style.transform = 'scale(1.05)'; }}
              onMouseLeave={(e) => { if (compareList.length <= 3) e.currentTarget.style.transform = 'scale(1)'; }}
            >
              ⇄ Run Comparison
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketSearchPage;
