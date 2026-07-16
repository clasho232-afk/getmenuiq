import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, SlidersHorizontal, MapPin, Eye, Grid } from 'lucide-react';
import './InstantPriceAlertsWidget.css';

const RESTAURANT_AREA_NAME = "Whitechapel";

const MODAL_CROSS_FILTER_DATA = [
  { id: "m1", competitor_name: "Domino's Ilford", item_name: "Large 12\" Pepperoni Feast Pizza", menu_category: "mains", old_price: 18.99, new_price: 16.99, price_delta: -2.00, platform: "Deliveroo", scope: "watchlist", image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=150&q=80" },
  { id: "m2", competitor_name: "Al-Amin Pizza", item_name: "Gourmet Double Beef Burger Meal", menu_category: "mains", old_price: 10.50, new_price: 9.30, price_delta: -1.20, platform: "Uber Eats", scope: "watchlist", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=150&q=80" },
  { id: "m3", competitor_name: "Pizza Palace Barking", item_name: "Single Piri Piri Chicken Burger", menu_category: "mains", old_price: 6.49, new_price: 6.99, price_delta: 0.50, platform: "Just Eat", scope: "local", image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=150&q=80" },
  { id: "m4", competitor_name: "Perfect Fried Chicken", item_name: "6pc Hot Wings Box Split", menu_category: "sides", old_price: 4.50, new_price: 3.99, price_delta: -0.51, platform: "Deliveroo", scope: "local", image: "https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=150&q=80" },
  { id: "m5", competitor_name: "Romford Grill House", item_name: "Mega Mixed Kebab Skewer Box", menu_category: "mains", old_price: 14.99, new_price: 12.99, price_delta: -2.00, platform: "Uber Eats", scope: "neighborhood", image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=150&q=80" },
  { id: "m6", competitor_name: "Chigwell Pizza Kitchen", item_name: "Gorgonzola & Honey Artisan Crust", menu_category: "mains", old_price: 13.50, new_price: 14.50, price_delta: 1.00, platform: "Deliveroo", scope: "neighborhood", image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=150&q=80" },
  { id: "o5", competitor_name: "Domino's Ilford", item_name: "Large French Fries / Peri Fries", menu_category: "sides", old_price: 3.50, new_price: 3.90, price_delta: 0.40, platform: "Deliveroo", scope: "watchlist", image: "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=150&q=80" },
  { id: "o6", competitor_name: "Pizza Palace Barking", item_name: "Pepsi Cola 1.5L Bottle", menu_category: "drinks", old_price: 2.20, new_price: 2.95, price_delta: 0.75, platform: "Deliveroo", scope: "local", image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=150&q=80" },
  { id: "o7", competitor_name: "Al-Amin Pizza", item_name: "Coca-Cola Zero Sugar 330ml Can", menu_category: "drinks", old_price: 1.50, new_price: 1.35, price_delta: -0.15, platform: "Uber Eats", scope: "watchlist", image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=150&q=80" }
];

const InstantPriceAlertsWidget = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeScopeFilter, setActiveScopeFilter] = useState('all');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const filterDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setShowFilterDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Compute metrics for the summary card
  const totalMains = MODAL_CROSS_FILTER_DATA.filter(item => item.menu_category === 'mains').length;
  const totalSides = MODAL_CROSS_FILTER_DATA.filter(item => item.menu_category === 'sides').length;
  const totalDrinks = MODAL_CROSS_FILTER_DATA.filter(item => item.menu_category === 'drinks').length;

  // Compute modal counts scoped to the current tier 1 active filter
  const scopedData = useMemo(() => {
    return MODAL_CROSS_FILTER_DATA.filter(item => activeScopeFilter === 'all' || item.scope === activeScopeFilter);
  }, [activeScopeFilter]);

  const modalCounts = {
    all: scopedData.length,
    mains: scopedData.filter(i => i.menu_category === 'mains').length,
    sides: scopedData.filter(i => i.menu_category === 'sides').length,
    drinks: scopedData.filter(i => i.menu_category === 'drinks').length
  };

  // Compute filtered & sorted list for the modal
  const processedItems = useMemo(() => {
    let items = scopedData;
    if (activeCategoryFilter !== 'all') {
      items = items.filter(item => item.menu_category === activeCategoryFilter);
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      items = items.filter(item => 
        item.item_name.toLowerCase().includes(q) || 
        item.competitor_name.toLowerCase().includes(q)
      );
    }
    return items.sort((a, b) => Math.abs(b.price_delta) - Math.abs(a.price_delta));
  }, [scopedData, activeCategoryFilter, searchQuery]);

  return (
    <>
      {/* Refined Dashboard Metric Card */}
      <div className="harmonized-card-bg market-alerts-card" onClick={(e) => { e.preventDefault(); setIsModalOpen(true); }}>
        {MODAL_CROSS_FILTER_DATA.length === 0 ? (
          <div className="all-clear-state">
            <span style={{ fontSize: '24px', marginBottom: '8px' }}>✨</span>
            <p style={{ margin: 0 }}>Market Stable<br/><small>No price changes detected.</small></p>
          </div>
        ) : MODAL_CROSS_FILTER_DATA.length === 1 ? (
          <div className="spotlight-state">
            <span className="card-super-label" style={{ color: '#ff3b30' }}>URGENT ALERT</span>
            <h4 style={{ margin: '8px 0', fontSize: '18px', color: '#1c1c1e' }}>{MODAL_CROSS_FILTER_DATA[0].competitor_name}</h4>
            <p style={{ color: '#636366', fontSize: '12px', margin: 0 }}>{MODAL_CROSS_FILTER_DATA[0].item_name}</p>
            <div className="delta-value" style={{ fontSize: '24px', fontWeight: '800', marginTop: '8px', color: MODAL_CROSS_FILTER_DATA[0].price_delta < 0 ? '#ff3b30' : '#34c759' }}>
              {MODAL_CROSS_FILTER_DATA[0].price_delta < 0 ? `-£${Math.abs(MODAL_CROSS_FILTER_DATA[0].price_delta).toFixed(2)}` : `+£${MODAL_CROSS_FILTER_DATA[0].price_delta.toFixed(2)}`}
            </div>
          </div>
        ) : (
          <>
            <div className="header" style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '16px', marginBottom: '16px' }}>
              <h2 className="text-xl font-bold text-gray-900 leading-tight mb-0">Price Changes</h2>
            </div>
            <div className="split-pane" style={{ borderTop: 'none', paddingTop: '0', marginTop: '0', alignItems: 'center' }}>
              <div className="left-pane" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <h2 style={{ fontSize: '56px', margin: '0 0 4px 0', color: '#E86A58', lineHeight: '1', fontWeight: '800' }}>{MODAL_CROSS_FILTER_DATA.length}</h2>
                <p style={{ fontSize: '11px', color: '#9CA3AF', margin: '0', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total Alerts</p>
              </div>
              <div className="right-pane" style={{ transform: 'translateX(-30%)', width: '120%' }}>
                {[
                  { name: 'Mains', count: MODAL_CROSS_FILTER_DATA.filter(i => i.menu_category === 'mains').length },
                  { name: 'Sides', count: MODAL_CROSS_FILTER_DATA.filter(i => i.menu_category === 'sides').length },
                  { name: 'Drinks', count: MODAL_CROSS_FILTER_DATA.filter(i => i.menu_category === 'drinks').length }
                ].filter(cat => cat.count > 0).map(c => (
                  <div className="metric-row" key={c.name} style={{ fontSize: '17px', color: '#5c4d44', padding: '10px 0' }}>
                    <span style={{ fontWeight: '500', display: 'flex', alignItems: 'center' }}>
                      {c.name === 'Mains' && (
                        <img src="/pizza_color_icon.jpg" alt="Mains Icon" style={{ width: '28px', height: '28px', marginRight: '8px', transform: 'rotate(20deg)', mixBlendMode: 'multiply', filter: 'brightness(1.2) contrast(1.5)' }} />
                      )}
                      {c.name === 'Sides' && (
                        <img src="/sides_icon.png" alt="Sides Icon" style={{ width: '24px', height: '24px', marginRight: '8px', mixBlendMode: 'multiply' }} />
                      )}
                      {c.name === 'Drinks' && (
                        <img src="/drinks_icon.avif" alt="Drinks Icon" style={{ width: '24px', height: '24px', marginRight: '8px', mixBlendMode: 'multiply', filter: 'brightness(1.2) contrast(1.5)' }} />
                      )}
                      {c.name}
                    </span>
                    <span style={{ fontWeight: '800', color: '#1c1c1e' }}>{c.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ========================================================
          NEW CENTERED MODAL WINDOW POP-UP COMPONENT 
          ======================================================== */}
      <div className={`alerts-center-modal-overlay ${isModalOpen ? 'active' : ''}`}>
        {/* Blur backdrop click closes popup safely */}
        <div className="modal-backdrop-blur" onClick={() => setIsModalOpen(false)}></div>
        
        <div className="modal-window-frame">
          {/* Modal Close Anchor Trigger Button */}
          <button className="modal-window-close-btn" onClick={() => setIsModalOpen(false)}>✕</button>
          
          <div className="modal-interior-scroll-wrapper">
            <div className="modal-title-header-block">
              <h3>Price Change Intel</h3>
              <p className="modal-subtitle-text">Analyze real-time rival positioning.</p>
            </div>
            
            {/* Search and Filter Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={14} color="#6B7280" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text" 
                  placeholder="Search items, competitors..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px 8px 32px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '13px', outline: 'none', background: '#FAFAFA', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ position: 'relative' }} ref={filterDropdownRef}>
                <button 
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)} 
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#FFFFFF', border: '1px solid #E5E7EB', padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, color: '#111', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                >
                  <SlidersHorizontal size={14} />
                  Filter
                </button>
                {showFilterDropdown && (
                  <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', background: '#FFF', border: '1px solid #E5E7EB', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 50, display: 'flex', flexDirection: 'column', gap: '4px', padding: '8px', width: 'max-content', minWidth: '180px' }}>
                    
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', padding: '4px 8px', letterSpacing: '0.5px' }}>Scope</div>
                    <button onClick={() => { setActiveScopeFilter('all'); setShowFilterDropdown(false); }} style={{ padding: '8px 12px', borderRadius: '8px', background: activeScopeFilter === 'all' ? '#F3F4F6' : 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', width: '100%' }}>
                      <Grid size={14} color="#4B5563" /> <span style={{ fontSize: '13px', fontWeight: 500, color: '#111' }}>All Data</span>
                    </button>
                    <button onClick={() => { setActiveScopeFilter('local'); setShowFilterDropdown(false); }} style={{ padding: '8px 12px', borderRadius: '8px', background: activeScopeFilter === 'local' ? '#F3F4F6' : 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', width: '100%' }}>
                      <MapPin size={14} color="#4B5563" /> <span style={{ fontSize: '13px', fontWeight: 500, color: '#111' }}>{RESTAURANT_AREA_NAME}</span>
                    </button>
                    <button onClick={() => { setActiveScopeFilter('neighborhood'); setShowFilterDropdown(false); }} style={{ padding: '8px 12px', borderRadius: '8px', background: activeScopeFilter === 'neighborhood' ? '#F3F4F6' : 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', width: '100%' }}>
                      <MapPin size={14} color="#4B5563" /> <span style={{ fontSize: '13px', fontWeight: 500, color: '#111' }}>Neighborhood</span>
                    </button>
                    <button onClick={() => { setActiveScopeFilter('watchlist'); setShowFilterDropdown(false); }} style={{ padding: '8px 12px', borderRadius: '8px', background: activeScopeFilter === 'watchlist' ? '#F3F4F6' : 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', width: '100%' }}>
                      <Eye size={14} color="#4B5563" /> <span style={{ fontSize: '13px', fontWeight: 500, color: '#111' }}>Watchlist</span>
                    </button>

                    <div style={{ height: '1px', background: '#E5E7EB', margin: '4px 0' }}></div>

                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', padding: '4px 8px', letterSpacing: '0.5px' }}>Category</div>
                    <button onClick={() => { setActiveCategoryFilter('all'); setShowFilterDropdown(false); }} style={{ padding: '8px 12px', borderRadius: '8px', background: activeCategoryFilter === 'all' ? '#F3F4F6' : 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', width: '100%' }}>
                      <span style={{ fontSize: '12px', fontWeight: 500, color: '#111' }}>All Categories</span>
                    </button>
                    <button onClick={() => { setActiveCategoryFilter('mains'); setShowFilterDropdown(false); }} style={{ padding: '8px 12px', borderRadius: '8px', background: activeCategoryFilter === 'mains' ? '#F3F4F6' : 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', width: '100%' }}>
                      <img src="/pizza_color_icon.jpg" alt="Mains" style={{ width: '14px', height: '14px', transform: 'rotate(20deg)', mixBlendMode: 'multiply', filter: 'brightness(1.2) contrast(1.5)' }} />
                      <span style={{ fontSize: '12px', fontWeight: 500, color: '#111' }}>Mains ({modalCounts.mains})</span>
                    </button>
                    <button onClick={() => { setActiveCategoryFilter('sides'); setShowFilterDropdown(false); }} style={{ padding: '8px 12px', borderRadius: '8px', background: activeCategoryFilter === 'sides' ? '#F3F4F6' : 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', width: '100%' }}>
                      <img src="/sides_icon.png" alt="Sides" style={{ width: '14px', height: '14px', mixBlendMode: 'multiply' }} />
                      <span style={{ fontSize: '12px', fontWeight: 500, color: '#111' }}>Sides ({modalCounts.sides})</span>
                    </button>
                    <button onClick={() => { setActiveCategoryFilter('drinks'); setShowFilterDropdown(false); }} style={{ padding: '8px 12px', borderRadius: '8px', background: activeCategoryFilter === 'drinks' ? '#F3F4F6' : 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', width: '100%' }}>
                      <img src="/drinks_icon.avif" alt="Drinks" style={{ width: '14px', height: '14px', mixBlendMode: 'multiply', filter: 'brightness(1.2) contrast(1.5)' }} />
                      <span style={{ fontSize: '12px', fontWeight: 500, color: '#111' }}>Drinks ({modalCounts.drinks})</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div id="modal-alerts-stream-root" className="modal-rows-vertical-stack">
              {processedItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 20px', color: '#8e8e93', fontSize: '13px', fontWeight: '500' }}>
                  No price movements match the selected scope criteria configuration parameters.
                </div>
              ) : (
                processedItems.map(alert => {
                  const isDrop = alert.price_delta < 0;
                  const deltaDisplay = isDrop ? `-£${Math.abs(alert.price_delta).toFixed(2)}` : `+£${alert.price_delta.toFixed(2)}`;

                  // Platform Color Coding
                  const platformColors = {
                    'Deliveroo': '#00CCBC',
                    'Uber Eats': '#06C167',
                    'Just Eat': '#FF8000'
                  };
                  const pColor = platformColors[alert.platform] || '#636366';
                  const simpleIconId = alert.platform === 'Uber Eats' ? 'ubereats' : alert.platform === 'Deliveroo' ? 'deliveroo' : 'justeat';

                  return (
                    <div key={alert.id} className="alert-capsule-row">
                      {/* Micro Image Thumbnail */}
                      <div className="item-thumbnail" style={{ overflow: 'hidden', padding: 0, border: '1px solid #E2E8F0' }}>
                        <img src={alert.image} alt={alert.item_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      
                      {/* Text Details */}
                      <div className="alert-restaurant-identity" style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'flex-start' }}>
                        <div className="alert-primary-title" title={alert.item_name}>{alert.item_name}</div>
                        <div className="alert-secondary-subtitle" title={alert.competitor_name}>{alert.competitor_name}</div>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: pColor, padding: '2px 8px', borderRadius: '9999px', marginTop: '4px', boxShadow: `0 2px 4px ${pColor}33` }}>
                          <img src={`https://cdn.simpleicons.org/${simpleIconId}/white`} alt={alert.platform} style={{ height: '10px', width: '10px' }} />
                          <span style={{ fontSize: '9px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '0.02em', textTransform: 'uppercase' }}>{alert.platform}</span>
                        </span>
                      </div>
                      
                      {/* New Pricing Logic */}
                      <div className="price-details-container">
                        <div className="price-delta" style={{ color: isDrop ? '#ff3b30' : '#34c759', fontWeight: '700' }}>
                          {deltaDisplay}
                        </div>
                        <div className="price-was-now" style={{ fontWeight: '500' }}>
                          was £{alert.old_price.toFixed(2)} → <span style={{ fontWeight: '700', color: '#111' }}>now £{alert.new_price.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InstantPriceAlertsWidget;
