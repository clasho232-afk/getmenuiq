import React, { useState, useEffect } from 'react';
import { Search, MapPin, ChevronDown, Filter, Zap } from 'lucide-react';
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
  const [priceRange, setPriceRange] = useState(50);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  // State: Drawer
  const [intelDrawerOpen, setIntelDrawerOpen] = useState(false);
  const [activeRestaurantId, setActiveRestaurantId] = useState(null);
  const [activeDishId, setActiveDishId] = useState(null);
  const [isAIOverlayOpen, setIsAIOverlayOpen] = useState(false);

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
            
            if (platform === 'Uber Eats' && !d.restaurants?.ubereats_url) return false;
            
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
  const getMockDistance = (idStr) => {
    let hash = 0;
    for (let i = 0; i < idStr.length; i++) hash = idStr.charCodeAt(i) + ((hash << 5) - hash);
    return ((Math.abs(hash) % 48) / 10 + 0.1).toFixed(1);
  };

  const getMockDeal = (id) => {
    const deals = ['BOGO', '20% Off £15+', 'Free Delivery', '15% Off', 'Buy 1 Get 1 Half Price'];
    return deals[id % deals.length];
  };

  return (
    <div style={{
      fontFamily: "'Lufga', sans-serif",
      minHeight: '100%',
      display: 'flex',
      flexDirection: 'column',
      padding: '1.5rem 2rem',
      backgroundColor: '#FDFBF7',
      position: 'relative'
    }}>
      
      {/* Compressed Header Section */}
      <div style={{ width: '100%', marginBottom: '1.5rem' }}>
        
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'end', justifyContent: 'space-between', width: '100%', marginBottom: '1rem' }}>
          <h1 style={{ 
            fontSize: '1.5rem', // Shrunk title
            fontWeight: 800, 
            textAlign: 'left', 
            margin: 0,
            color: '#111',
            letterSpacing: '-0.02em'
          }}>
            Market Search
          </h1>
          <AIGreeting onClick={() => setIsAIOverlayOpen(true)} />
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

            <div style={{ width: '1px', height: '24px', backgroundColor: '#E5E7EB', margin: '0 0.5rem' }} />

            {/* Radius Interactive Button */}
            <button 
              onClick={() => setIsMapModalOpen(true)}
              style={{ 
                margin: '0 0.5rem 0 0',
                padding: '0.5rem 1rem', 
                backgroundColor: '#FFF',
                color: '#374151',
                fontWeight: 500,
                fontSize: '0.9rem',
                border: '1px solid #E5E7EB',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'background-color 0.2s ease',
                whiteSpace: 'nowrap',
                fontFamily: 'inherit'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFF'}
            >
              📍 Set Radius
            </button>
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
                  fontWeight: 700,
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

        {/* Advanced Filters Panel (Menu Items Mode) */}
        {activeCategory === 'Menu Items' && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '2rem', // gap-8
            marginTop: '1rem', // mt-4
            padding: '1rem 1.5rem', // px-6 py-4
            backgroundColor: '#FFF', // bg-white
            borderRadius: '0.75rem', // rounded-xl
            border: '1px solid #F3F4F6', // border-gray-100
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' // shadow-sm
          }}>
            {/* Price Slider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>Max Price: £{priceRange}</span>
              <input 
                type="range" min="0" max="100" value={priceRange} 
                onChange={(e) => setPriceRange(Number(e.target.value))}
                style={{ width: '120px', accentColor: '#111' }}
              />
            </div>

            {/* Platform Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Filter size={16} color="#9CA3AF" />
              <select 
                value={platform} onChange={(e) => setPlatform(e.target.value)}
                style={{ border: 'none', background: 'transparent', fontWeight: 500, color: '#374151', fontFamily: 'inherit', outline: 'none', cursor: 'pointer', fontSize: '0.9rem' }}
              >
                <option>All Platforms</option>
                <option>Uber Eats</option>
                <option>Deliveroo</option>
                <option>Just Eat</option>
              </select>
            </div>

            {/* Promo Only Toggle */}
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              cursor: 'pointer', 
              fontWeight: promoOnly ? 600 : 500, 
              fontSize: '0.9rem', 
              color: promoOnly ? '#E86A58' : '#374151',
              transition: 'color 0.2s ease'
            }}>
              <Zap size={16} fill={promoOnly ? "#E86A58" : "none"} color={promoOnly ? "#E86A58" : "#9CA3AF"} />
              Promo Only
              <input 
                type="checkbox" checked={promoOnly} onChange={(e) => setPromoOnly(e.target.checked)} 
                style={{ display: 'none' }}
              />
            </label>
          </div>
        )}
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
              
              return (
                <div 
                  key={restaurant.id}
                  onClick={() => onSelectRestaurant(restaurant.id)}
                  style={{
                    backgroundColor: '#FFF',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '1px solid #E5E7EB',
                    boxShadow: '0 2px 8px -2px rgba(0,0,0,0.05)',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 16px -4px rgba(0,0,0,0.08)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px -2px rgba(0,0,0,0.05)'; }}
                >
                  <div style={{ height: '140px', width: '100%', overflow: 'hidden', backgroundColor: '#F3F1EC' }}>
                    {restaurant.hero_image_url ? (
                      <img src={restaurant.hero_image_url} alt={restaurant.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontWeight: 800, fontSize: '1.5rem' }}>
                        {restaurant.name?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#111', margin: 0 }}>{restaurant.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6B7280', fontSize: '0.75rem', fontWeight: 500 }}>
                      <span>{cuisineString}</span><span>•</span><span>{locationString}</span>
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
          <div style={{ 
            backgroundColor: '#FFF', 
            borderRadius: '12px', 
            boxShadow: '0 4px 15px -5px rgba(0,0,0,0.05)',
            border: '1px solid #E5E7EB',
            overflow: 'hidden'
          }}>
            {dishes.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                    {['Restaurant', activeCategory === 'Promos' ? 'Promo Target' : 'Dish Name', 'Platform', 'Proximity', activeCategory === 'Promos' ? 'Offer' : 'Price'].map((header, i) => (
                      <th key={header} style={{ 
                        padding: '0.8rem 1.25rem', 
                        textAlign: i === 4 ? 'right' : 'left', 
                        fontSize: '0.7rem', 
                        fontWeight: 800, 
                        color: '#6B7280', 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.05em' 
                      }}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dishes.map((dish, idx) => {
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
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
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
                            <span style={{ fontWeight: 700, color: '#111', fontSize: '0.85rem' }}>
                              {dish.restaurants?.name || 'Unknown'}
                            </span>
                          </div>
                        </td>

                        {/* Dish Name */}
                        <td style={{ padding: '0.8rem 1.25rem', fontWeight: 600, color: '#374151', fontSize: '0.85rem' }}>
                          {dish.name}
                        </td>

                        {/* Platform */}
                        <td style={{ padding: '0.8rem 1.25rem' }}>
                          {dish.restaurants?.ubereats_url ? (
                            <span style={{ padding: '0.2rem 0.4rem', backgroundColor: '#ECFDF5', color: '#059669', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 800 }}>
                              UberEats
                            </span>
                          ) : (
                            <span style={{ padding: '0.2rem 0.4rem', backgroundColor: '#F3F4F6', color: '#4B5563', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 800 }}>
                              Platform
                            </span>
                          )}
                        </td>

                        {/* Proximity */}
                        <td style={{ padding: '0.8rem 1.25rem', color: '#6B7280', fontSize: '0.8rem', fontWeight: 500 }}>
                          {distance} mi • {locationArea}
                        </td>

                        {/* Price / Offer */}
                        <td style={{ padding: '0.8rem 1.25rem', textAlign: 'right' }}>
                          {activeCategory === 'Promos' ? (
                            <span style={{ color: '#EF4444', fontWeight: 800, fontSize: '0.85rem', backgroundColor: '#FEF2F2', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                              {getMockDeal(dish.id)}
                            </span>
                          ) : isPromo ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                              <span style={{ textDecoration: 'line-through', color: '#9CA3AF', fontSize: '0.8rem', fontWeight: 500 }}>£{originalPrice}</span>
                              <span style={{ color: '#EF4444', fontWeight: 800, fontSize: '0.9rem' }}>£{dish.price}</span>
                            </div>
                          ) : (
                            <span style={{ color: '#111', fontWeight: 800, fontSize: '0.9rem' }}>£{dish.price}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: '4rem', textAlign: 'center', color: '#6B7280' }}>No tactical data matches your criteria.</div>
            )}
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
    </div>
  );
};

export default MarketSearchPage;
