import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Search, SlidersHorizontal, MapPin, Eye, Grid, Check, ChevronDown, X, ArrowDownRight, ArrowUpRight, ArrowUpDown, TrendingDown, TrendingUp, ArrowDown, ArrowUp } from 'lucide-react';
import './InstantPriceAlertsWidget.css';

const RESTAURANT_AREA_NAME = "Whitechapel";

const ALL_PLATFORMS = ['Uber Eats', 'Deliveroo', 'Just Eat'];

const MODAL_CROSS_FILTER_DATA = [
  { id: "m1", competitor_name: "Domino's Ilford", item_name: "Large 12\" Pepperoni Feast Pizza", menu_category: "mains", old_price: 18.99, new_price: 16.99, price_delta: -2.00, platform: "Deliveroo", scope: "watchlist", days_ago: 0, time_ago: "4h ago", image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=150&q=80" },
  { id: "m7", competitor_name: "Pizza Palace Barking", item_name: "Tango Orange 330ml Can", menu_category: "drinks", old_price: 1.40, new_price: 1.65, price_delta: 0.25, platform: "Just Eat", scope: "local", days_ago: 0, time_ago: "6h ago", image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=150&q=80" },
  { id: "m2", competitor_name: "Al-Amin Pizza", item_name: "Gourmet Double Beef Burger Meal", menu_category: "mains", old_price: 10.50, new_price: 9.30, price_delta: -1.20, platform: "Uber Eats", scope: "watchlist", days_ago: 0, time_ago: "14h ago", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=150&q=80" },
  { id: "m4", competitor_name: "Perfect Fried Chicken", item_name: "6pc Hot Wings Box Split", menu_category: "sides", old_price: 4.50, new_price: 3.99, price_delta: -0.51, platform: "Deliveroo", scope: "local", days_ago: 1, time_ago: "Yesterday", image: "https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=150&q=80" },
  { id: "m3", competitor_name: "Pizza Palace Barking", item_name: "Single Piri Piri Chicken Burger", menu_category: "mains", old_price: 6.49, new_price: 6.99, price_delta: 0.50, platform: "Just Eat", scope: "local", days_ago: 1, time_ago: "Yesterday", image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=150&q=80" },
  { id: "m8", competitor_name: "Domino's Ilford", item_name: "Garlic Pizza Bread with Cheese", menu_category: "sides", old_price: 5.20, new_price: 4.50, price_delta: -0.70, platform: "Uber Eats", scope: "watchlist", days_ago: 2, time_ago: "2d ago", image: "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=150&q=80" },
  { id: "m5", competitor_name: "Romford Grill House", item_name: "Mega Mixed Kebab Skewer Box", menu_category: "mains", old_price: 14.99, new_price: 12.99, price_delta: -2.00, platform: "Uber Eats", scope: "neighborhood", days_ago: 3, time_ago: "3d ago", image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=150&q=80" },
  { id: "m6", competitor_name: "Chigwell Pizza Kitchen", item_name: "Gorgonzola & Honey Artisan Crust", menu_category: "mains", old_price: 13.50, new_price: 14.50, price_delta: 1.00, platform: "Deliveroo", scope: "neighborhood", days_ago: 4, time_ago: "4d ago", image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=150&q=80" },
  { id: "m9", competitor_name: "Al-Amin Pizza", item_name: "Diet Coke 1.25L Sharing Bottle", menu_category: "drinks", old_price: 2.60, new_price: 2.90, price_delta: 0.30, platform: "Deliveroo", scope: "watchlist", days_ago: 5, time_ago: "5d ago", image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=150&q=80" },
  { id: "o5", competitor_name: "Domino's Ilford", item_name: "Large French Fries / Peri Fries", menu_category: "sides", old_price: 3.50, new_price: 3.90, price_delta: 0.40, platform: "Deliveroo", scope: "watchlist", days_ago: 6, time_ago: "6d ago", image: "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=150&q=80" },
  { id: "o6", competitor_name: "Pizza Palace Barking", item_name: "Pepsi Cola 1.5L Bottle", menu_category: "drinks", old_price: 2.20, new_price: 2.95, price_delta: 0.75, platform: "Deliveroo", scope: "local", days_ago: 14, time_ago: "2w ago", image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=150&q=80" },
  { id: "m10", competitor_name: "Romford Grill House", item_name: "Smash Double Cheeseburger", menu_category: "mains", old_price: 8.95, new_price: 9.50, price_delta: 0.55, platform: "Uber Eats", scope: "neighborhood", days_ago: 16, time_ago: "2w ago", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=150&q=80" },
  { id: "o7", competitor_name: "Al-Amin Pizza", item_name: "Coca-Cola Zero Sugar 330ml Can", menu_category: "drinks", old_price: 1.50, new_price: 1.35, price_delta: -0.15, platform: "Uber Eats", scope: "watchlist", days_ago: 22, time_ago: "3w ago", image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=150&q=80" }
];


const getPlatformConfig = (platformName) => {
  switch (platformName?.toLowerCase()) {
    case 'uber eats': return { bg: '#06C167', iconUrl: '/ubereats-white.svg' };
    case 'deliveroo': return { bg: '#00CCBC', iconUrl: '/deliveroo-white.svg' };
    case 'just eat': return { bg: '#F36D00', iconUrl: '/justeat-white.svg' };
    default: return { bg: '#334155', iconUrl: '' };
  }
};

const InstantPriceAlertsWidget = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeScopeFilter, setActiveScopeFilter] = useState('all');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');
  const [selectedPlatforms, setSelectedPlatforms] = useState(ALL_PLATFORMS);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [timeframe, setTimeframe] = useState('7d');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showPlatformDropdown, setShowPlatformDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const filterDropdownRef = useRef(null);
  const platformDropdownRef = useRef(null);
  const sortDropdownRef = useRef(null);

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setHasUserInteracted(false);
    setSelectedPlatforms([...ALL_PLATFORMS]);
    setSortBy('default');
  };

  // Rotating Alert Carousel
  const [currentAlertIndex, setCurrentAlertIndex] = useState(0);

  useEffect(() => {
    if (MODAL_CROSS_FILTER_DATA.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentAlertIndex(prev => (prev + 1) % MODAL_CROSS_FILTER_DATA.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setShowFilterDropdown(false);
      }
      if (platformDropdownRef.current && !platformDropdownRef.current.contains(event.target)) {
        setShowPlatformDropdown(false);
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
        setShowSortDropdown(false);
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

  // Compute modal counts scoped to the current tier 1 active filter and timeframe
  const scopedData = useMemo(() => {
    const maxDays = timeframe === '24h' ? 1 : timeframe === '7d' ? 7 : 30;
    return MODAL_CROSS_FILTER_DATA.filter(item => {
      const matchesScope = activeScopeFilter === 'all' || item.scope === activeScopeFilter;
      const matchesTime = item.days_ago <= maxDays;
      return matchesScope && matchesTime;
    });
  }, [activeScopeFilter, timeframe]);

  const modalCounts = {
    all: scopedData.length,
    mains: scopedData.filter(i => i.menu_category === 'mains').length,
    sides: scopedData.filter(i => i.menu_category === 'sides').length,
    drinks: scopedData.filter(i => i.menu_category === 'drinks').length
  };

  // Price movement breakdown (Hikes vs Cuts)
  const currentScopedByPlatform = useMemo(() => {
    if (selectedPlatforms.length < ALL_PLATFORMS.length) {
      return scopedData.filter(item => selectedPlatforms.includes(item.platform));
    }
    return scopedData;
  }, [scopedData, selectedPlatforms]);

  const priceMovementMetrics = useMemo(() => {
    const hikes = currentScopedByPlatform.filter(i => i.price_delta > 0);
    const cuts = currentScopedByPlatform.filter(i => i.price_delta < 0);
    return {
      hikeCount: hikes.length,
      cutCount: cuts.length
    };
  }, [currentScopedByPlatform]);

  // Compute filtered & sorted list for the modal
  const processedItems = useMemo(() => {
    let items = scopedData;
    if (activeCategoryFilter !== 'all') {
      items = items.filter(item => item.menu_category === activeCategoryFilter);
    }
    if (selectedPlatforms.length < ALL_PLATFORMS.length) {
      items = items.filter(item => selectedPlatforms.includes(item.platform));
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      items = items.filter(item => 
        item.item_name.toLowerCase().includes(q) || 
        item.competitor_name.toLowerCase().includes(q)
      );
    }
    
    // Sort logic
    if (sortBy === 'price_drop' || sortBy === 'largest_drop') {
      return [...items].sort((a, b) => a.price_delta - b.price_delta);
    } else if (sortBy === 'price_hike' || sortBy === 'largest_hike') {
      return [...items].sort((a, b) => b.price_delta - a.price_delta);
    } else {
      return [...items].sort((a, b) => Math.abs(b.price_delta) - Math.abs(a.price_delta));
    }
  }, [scopedData, activeCategoryFilter, selectedPlatforms, searchQuery, sortBy]);

  return (
    <>
      {/* Refined Dashboard Metric Card */}
      <div className="harmonized-card-bg market-alerts-card" onClick={(e) => { e.preventDefault(); handleOpenModal(); }}>
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
            <div className="header" style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '16px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="text-xl font-bold text-gray-900 leading-tight mb-0">Price Changes</h2>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#EF4444', backgroundColor: '#FEF2F2', padding: '4px 10px', borderRadius: '12px' }}>Live</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '20px' }}>
              {/* Left Side: Total Alerts */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto', padding: '0 10px' }}>
                <span style={{ fontSize: '48px', fontWeight: 800, color: '#EF4444', lineHeight: 1, letterSpacing: '-0.05em' }}>
                  {MODAL_CROSS_FILTER_DATA.length}
                </span>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '4px' }}>
                  Total Alerts
                </span>
              </div>

              {/* Right Side: Breakdown */}
              <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '12px', borderLeft: '1px solid rgba(0,0,0,0.05)', paddingLeft: '24px' }}>
                {[
                  { name: 'Mains', icon: '🍕', count: MODAL_CROSS_FILTER_DATA.filter(i => i.menu_category === 'mains').length },
                  { name: 'Sides', icon: '🍟', count: MODAL_CROSS_FILTER_DATA.filter(i => i.menu_category === 'sides').length },
                  { name: 'Drinks', icon: '🥤', count: MODAL_CROSS_FILTER_DATA.filter(i => i.menu_category === 'drinks').length }
                ].filter(cat => cat.count > 0).map(c => (
                  <div key={c.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px' }}>{c.icon}</span>
                      <span style={{ fontSize: '14px', fontWeight: 500, color: '#334155' }}>{c.name}</span>
                    </div>
                    <span style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>{c.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Footer Action Area with Platform Logo */}
            <div style={{ marginTop: 'auto', paddingTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', position: 'relative' }}>
              
              <div key={`fade-container-${currentAlertIndex}`} className="animate-soft-fade" style={{ display: 'flex', alignItems: 'center', gap: '14px', overflow: 'hidden', flex: 1 }}>
                {(() => {
                  const pConfig = getPlatformConfig(MODAL_CROSS_FILTER_DATA[currentAlertIndex].platform);
                  return (
                    <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: pConfig.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                      {pConfig.iconUrl ? (
                        <img src={pConfig.iconUrl} alt="Platform" style={{ width: '22px', height: '22px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
                      ) : (
                        <span style={{ color: 'white', fontWeight: 'bold' }}>{MODAL_CROSS_FILTER_DATA[currentAlertIndex].platform?.charAt(0)}</span>
                      )}
                    </div>
                  );
                })()}
                <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  <span style={{ fontSize: '13px', color: '#0F172A', fontWeight: 600, textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    <span style={{ color: '#64748B', fontWeight: 500 }}>Restaurant: </span>
                    {MODAL_CROSS_FILTER_DATA[currentAlertIndex].competitor_name}
                  </span>
                  <span style={{ fontSize: '12px', color: '#64748B', textOverflow: 'ellipsis', overflow: 'hidden', marginTop: '2px' }}>
                    {MODAL_CROSS_FILTER_DATA[currentAlertIndex].price_delta < 0 ? 'Dropped' : 'Raised'} {MODAL_CROSS_FILTER_DATA[currentAlertIndex].item_name.split(' ').slice(0, 2).join(' ')} to <strong style={{ color: MODAL_CROSS_FILTER_DATA[currentAlertIndex].price_delta < 0 ? '#EF4444' : '#10B981' }}>£{MODAL_CROSS_FILTER_DATA[currentAlertIndex].new_price.toFixed(2)}</strong>
                  </span>
                </div>
              </div>
              
              <span onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleOpenModal(); }} style={{ fontSize: '12px', fontWeight: 600, color: '#EF4444', display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0, paddingLeft: '12px', transition: 'opacity 0.2s', cursor: 'pointer', marginTop: 'auto' }} className="hover:opacity-80">
                View All <span style={{ fontSize: '14px', lineHeight: 1 }}>→</span>
              </span>
            </div>
          </>
        )}
      </div>

      {/* ========================================================
          NEW CENTERED MODAL WINDOW POP-UP COMPONENT 
          ======================================================== */}
      {createPortal(
        <div className={`alerts-center-modal-overlay ${isModalOpen ? 'active' : ''}`}>
        {/* Blur backdrop click closes popup safely */}
        <div className="modal-backdrop-blur" onClick={() => setIsModalOpen(false)}></div>
        
        <div className="modal-window-frame">
          <div className="modal-interior-scroll-wrapper" style={{ flexDirection: 'row' }}>
            {/* Left Column: Unified Sidebar Panel */}
            <div style={{ flex: '0 0 280px', display: 'flex', flexDirection: 'column', background: '#FFFFFF', borderRight: '1px solid #E5E7EB', padding: '28px 24px', boxSizing: 'border-box' }}>
              <div className="modal-title-header-block" style={{ height: '36px', display: 'flex', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>Price Change Intel</h3>
              </div>
              
              {/* Scope Switcher: All Area vs Watchlist */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                background: '#F1F5F9',
                padding: '3px',
                borderRadius: '8px',
                marginBottom: '8px',
                gap: '2px'
              }}>
                <button
                  onClick={() => setActiveScopeFilter('all')}
                  style={{
                    padding: '6px 0',
                    fontSize: '11.5px',
                    fontWeight: activeScopeFilter === 'all' ? 800 : 500,
                    color: activeScopeFilter === 'all' ? '#E05046' : '#64748B',
                    background: activeScopeFilter === 'all' ? '#FFFFFF' : 'transparent',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    boxShadow: activeScopeFilter === 'all' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  All Area
                </button>
                <button
                  onClick={() => setActiveScopeFilter('watchlist')}
                  style={{
                    padding: '6px 0',
                    fontSize: '11.5px',
                    fontWeight: activeScopeFilter === 'watchlist' ? 800 : 500,
                    color: activeScopeFilter === 'watchlist' ? '#E05046' : '#64748B',
                    background: activeScopeFilter === 'watchlist' ? '#FFFFFF' : 'transparent',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    boxShadow: activeScopeFilter === 'watchlist' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>⭐</span> Watchlist
                </button>
              </div>

              {/* Timeframe Segmented Control [ 24h | 7d | 30d ] */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                background: '#F1F5F9',
                padding: '3px',
                borderRadius: '8px',
                marginBottom: '18px',
                gap: '2px'
              }}>
                {[
                  { key: '24h', label: '24h', title: 'Last 24 Hours' },
                  { key: '7d', label: '7d', title: 'Last 7 Days' },
                  { key: '30d', label: '30d', title: 'Last 30 Days' }
                ].map(tab => {
                  const isActive = timeframe === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setTimeframe(tab.key)}
                      title={tab.title}
                      style={{
                        padding: '6px 0',
                        fontSize: '11.5px',
                        fontWeight: isActive ? 800 : 500,
                        color: isActive ? '#E05046' : '#64748B',
                        background: isActive ? '#FFFFFF' : 'transparent',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Menu Updates */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ color: '#0F172A', fontSize: '13.5px', fontWeight: 800, marginBottom: '6px' }}>Menu Updates</div>
                <div style={{ color: '#E05046', fontSize: '38px', fontWeight: 900, lineHeight: 1, marginBottom: '6px', letterSpacing: '-0.02em' }}>
                  {activeScopeFilter === 'watchlist'
                    ? (timeframe === '24h' ? 4 : timeframe === '7d' ? 16 : 48)
                    : (timeframe === '24h' ? 9 : timeframe === '7d' ? 38 : 142)
                  }
                </div>
                <div style={{ color: '#64748B', fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '4px' }}>
                  {activeScopeFilter === 'watchlist' ? 'CHANGES IN YOUR WATCHLIST' : 'CHANGES IN YOUR AREA'}
                </div>
                <div style={{ color: '#475569', fontSize: '11px', lineHeight: 1.4, fontWeight: 400 }}>
                  {activeScopeFilter === 'watchlist'
                    ? `Price movements from your saved direct competitors in the last ${timeframe === '24h' ? '24 hours' : timeframe === '7d' ? '7 days' : '30 days'}.`
                    : `Price hikes, new items, and removed dishes in the last ${timeframe === '24h' ? '24 hours' : timeframe === '7d' ? '7 days' : '30 days'}.`
                  }
                </div>
              </div>

              {/* Horizontal Divider */}
              <div style={{ height: '1px', borderTop: '1px dashed #E2E8F0', margin: '16px 0 14px 0' }}></div>

              {/* Price Changes by Category */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ height: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ color: '#0F172A', fontSize: '13px', fontWeight: 800 }}>Price Changes</div>
                  <button 
                    onClick={() => setActiveCategoryFilter('all')}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      color: '#EF4444', 
                      fontSize: '11px', 
                      fontWeight: 600, 
                      cursor: 'pointer', 
                      padding: 0,
                      visibility: activeCategoryFilter !== 'all' ? 'visible' : 'hidden'
                    }}
                  >
                    Reset filter
                  </button>
                </div>
                
                {/* Mains Button */}
                <button
                  onClick={() => setActiveCategoryFilter(prev => prev === 'mains' ? 'all' : 'mains')}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: activeCategoryFilter === 'mains' ? '#FEF2F2' : '#F8FAFC',
                    border: activeCategoryFilter === 'mains' ? '1px solid #FCA5A5' : '1px solid #F1F5F9',
                    height: '38px',
                    padding: '0 12px',
                    borderRadius: '8px',
                    marginBottom: '8px',
                    cursor: 'pointer',
                    width: '100%',
                    boxSizing: 'border-box',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img src="/pizza_color_icon.jpg" alt="Mains" style={{ width: '15px', height: '15px', transform: 'rotate(20deg)', mixBlendMode: 'multiply', filter: 'brightness(1.2) contrast(1.5)' }} />
                    <span style={{ color: activeCategoryFilter === 'mains' ? '#B91C1C' : '#0F172A', fontSize: '13px', fontWeight: 800 }}>Mains</span>
                  </div>
                  <span style={{ 
                    color: activeCategoryFilter === 'mains' ? '#FFFFFF' : '#E05046', 
                    background: activeCategoryFilter === 'mains' ? '#E05046' : 'transparent',
                    fontSize: '12px', 
                    fontWeight: 800,
                    height: '20px',
                    minWidth: '20px',
                    padding: '0 6px',
                    borderRadius: '6px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxSizing: 'border-box'
                  }}>
                    {modalCounts.mains}
                  </span>
                </button>
                
                {/* Sides Button */}
                <button
                  onClick={() => setActiveCategoryFilter(prev => prev === 'sides' ? 'all' : 'sides')}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: activeCategoryFilter === 'sides' ? '#FEF2F2' : '#F8FAFC',
                    border: activeCategoryFilter === 'sides' ? '1px solid #FCA5A5' : '1px solid #F1F5F9',
                    height: '38px',
                    padding: '0 12px',
                    borderRadius: '8px',
                    marginBottom: '8px',
                    cursor: 'pointer',
                    width: '100%',
                    boxSizing: 'border-box',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img src="/sides_icon.png" alt="Sides" style={{ width: '15px', height: '15px', mixBlendMode: 'multiply' }} />
                    <span style={{ color: activeCategoryFilter === 'sides' ? '#B91C1C' : '#0F172A', fontSize: '13px', fontWeight: 800 }}>Sides</span>
                  </div>
                  <span style={{ 
                    color: activeCategoryFilter === 'sides' ? '#FFFFFF' : '#E05046', 
                    background: activeCategoryFilter === 'sides' ? '#E05046' : 'transparent',
                    fontSize: '12px', 
                    fontWeight: 800,
                    height: '20px',
                    minWidth: '20px',
                    padding: '0 6px',
                    borderRadius: '6px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxSizing: 'border-box'
                  }}>
                    {modalCounts.sides}
                  </span>
                </button>

                {/* Drinks Button */}
                <button
                  onClick={() => setActiveCategoryFilter(prev => prev === 'drinks' ? 'all' : 'drinks')}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: activeCategoryFilter === 'drinks' ? '#FEF2F2' : '#F8FAFC',
                    border: activeCategoryFilter === 'drinks' ? '1px solid #FCA5A5' : '1px solid #F1F5F9',
                    height: '38px',
                    padding: '0 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    width: '100%',
                    boxSizing: 'border-box',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img src="/drinks_icon.avif" alt="Drinks" style={{ width: '15px', height: '15px', mixBlendMode: 'multiply', filter: 'brightness(1.2) contrast(1.5)' }} />
                    <span style={{ color: activeCategoryFilter === 'drinks' ? '#B91C1C' : '#0F172A', fontSize: '13px', fontWeight: 800 }}>Drinks</span>
                  </div>
                  <span style={{ 
                    color: activeCategoryFilter === 'drinks' ? '#FFFFFF' : '#E05046', 
                    background: activeCategoryFilter === 'drinks' ? '#E05046' : 'transparent',
                    fontSize: '12px', 
                    fontWeight: 800,
                    height: '20px',
                    minWidth: '20px',
                    padding: '0 6px',
                    borderRadius: '6px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxSizing: 'border-box'
                  }}>
                    {modalCounts.drinks}
                  </span>
                </button>
              </div>

              {/* Horizontal Divider */}
              <div style={{ height: '1px', borderTop: '1px dashed #E2E8F0', margin: '16px 0 14px 0' }}></div>

              {/* Price Movement: Hikes & Cuts (no avgs, no 30 day trend) */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ color: '#0F172A', fontSize: '13px', fontWeight: 800, marginBottom: '10px' }}>Price Movement</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button 
                    onClick={() => setSortBy(prev => (prev === 'price_hike' || prev === 'largest_hike') ? 'default' : 'price_hike')}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      background: (sortBy === 'price_hike' || sortBy === 'largest_hike') ? '#DCFCE7' : '#F0FDF4', 
                      border: (sortBy === 'price_hike' || sortBy === 'largest_hike') ? '1px solid #86EFAC' : '1px solid #DCFCE7', 
                      height: '36px',
                      padding: '0 10px', 
                      borderRadius: '8px',
                      cursor: 'pointer',
                      boxSizing: 'border-box',
                      transition: 'all 0.15s ease'
                    }}
                    title="Click to sort by price increase: Price ↑"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <TrendingUp size={13} color="#16A34A" />
                      <span style={{ color: '#16A34A', fontSize: '12px', fontWeight: 700 }}>Hikes</span>
                    </div>
                    <span style={{ color: '#15803D', fontSize: '13px', fontWeight: 800 }}>{priceMovementMetrics.hikeCount}</span>
                  </button>

                  <button 
                    onClick={() => setSortBy(prev => (prev === 'price_drop' || prev === 'largest_drop') ? 'default' : 'price_drop')}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      background: (sortBy === 'price_drop' || sortBy === 'largest_drop') ? '#FEE2E2' : '#FEF2F2', 
                      border: (sortBy === 'price_drop' || sortBy === 'largest_drop') ? '1px solid #FCA5A5' : '1px solid #FEE2E2', 
                      height: '36px',
                      padding: '0 10px', 
                      borderRadius: '8px',
                      cursor: 'pointer',
                      boxSizing: 'border-box',
                      transition: 'all 0.15s ease'
                    }}
                    title="Click to sort by price decrease: Price ↓"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <TrendingDown size={13} color="#DC2626" />
                      <span style={{ color: '#DC2626', fontSize: '12px', fontWeight: 700 }}>Cuts</span>
                    </div>
                    <span style={{ color: '#B91C1C', fontSize: '13px', fontWeight: 800 }}>{priceMovementMetrics.cutCount}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: List & Workspace */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, padding: '24px 28px', background: '#FCFAF6', boxSizing: 'border-box' }}>
            {/* Search and Filter Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', paddingBottom: '14px', borderBottom: '1px solid #F1F5F9' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '160px', height: '36px' }}>
                <Search size={14} color="#6B7280" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text" 
                  placeholder="Search items, competitors..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '100%', height: '36px', padding: '0 12px 0 32px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '13px', outline: 'none', background: '#FAFAFA', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ position: 'relative' }} ref={platformDropdownRef}>
                <button 
                  onClick={() => setShowPlatformDropdown(!showPlatformDropdown)} 
                  style={{ 
                    height: '36px',
                    padding: '0 12px', 
                    borderRadius: '8px', 
                    border: '1px solid #E5E7EB', 
                    background: '#FFF', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '6px', 
                    cursor: 'pointer', 
                    color: '#374151', 
                    fontSize: '12.5px', 
                    fontWeight: 500, 
                    transition: 'all 0.15s ease',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                    boxSizing: 'border-box',
                    flexShrink: 0
                  }}
                >
                  <span>
                    {selectedPlatforms.length === ALL_PLATFORMS.length
                      ? 'Platforms'
                      : selectedPlatforms.length === 0
                      ? 'No Platforms'
                      : `Platforms (${selectedPlatforms.length})`}
                  </span>
                  <ChevronDown size={13} color="#9CA3AF" />
                </button>

                {showPlatformDropdown && (
                  <div style={{ 
                    position: 'absolute', 
                    top: '100%', 
                    right: 0, 
                    marginTop: '8px', 
                    background: '#FFF', 
                    border: '1px solid #E5E7EB', 
                    borderRadius: '12px', 
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)', 
                    zIndex: 50, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '4px', 
                    padding: '8px', 
                    width: 'max-content', 
                    minWidth: '180px' 
                  }}>
                    <div style={{ 
                      fontSize: '11px', 
                      fontWeight: 600, 
                      color: '#9CA3AF', 
                      textTransform: 'uppercase', 
                      padding: '4px 8px', 
                      letterSpacing: '0.5px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span>Platform</span>
                      {selectedPlatforms.length < ALL_PLATFORMS.length && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setHasUserInteracted(true);
                            setSelectedPlatforms([...ALL_PLATFORMS]);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '11px',
                            fontWeight: 600,
                            color: '#E05046',
                            cursor: 'pointer',
                            padding: 0
                          }}
                        >
                          Select All
                        </button>
                      )}
                    </div>

                    {/* Master All Platforms Option */}
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation();
                        setHasUserInteracted(true);
                        if (selectedPlatforms.length === ALL_PLATFORMS.length) {
                          setSelectedPlatforms([]);
                        } else {
                          setSelectedPlatforms([...ALL_PLATFORMS]);
                        }
                      }} 
                      style={{ 
                        padding: '8px 10px', 
                        borderRadius: '8px', 
                        background: selectedPlatforms.length === ALL_PLATFORMS.length ? '#F3F4F6' : 'transparent', 
                        border: 'none', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between', 
                        gap: '12px',
                        cursor: 'pointer', 
                        width: '100%',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (selectedPlatforms.length !== ALL_PLATFORMS.length) e.currentTarget.style.background = '#F9FAFB';
                      }}
                      onMouseLeave={(e) => {
                        if (selectedPlatforms.length !== ALL_PLATFORMS.length) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <span style={{ fontSize: '12px', fontWeight: 500, color: '#111827' }}>All Platforms</span>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '4px',
                        border: selectedPlatforms.length > 0 ? '1.5px solid #0F172A' : '1.5px solid #D1D5DB',
                        backgroundColor: selectedPlatforms.length > 0 ? '#0F172A' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        transition: 'all 0.15s ease'
                      }}>
                        {selectedPlatforms.length === ALL_PLATFORMS.length && (
                          <Check size={11} color="#FFF" strokeWidth={3} />
                        )}
                        {selectedPlatforms.length > 0 && selectedPlatforms.length < ALL_PLATFORMS.length && (
                          <div style={{ width: '8px', height: '2px', backgroundColor: '#FFF', borderRadius: '1px' }} />
                        )}
                      </div>
                    </button>

                    {/* Individual Platform Options */}
                    {ALL_PLATFORMS.map((platform) => {
                      const isSelected = selectedPlatforms.includes(platform);
                      const pConfig = getPlatformConfig(platform);
                      return (
                        <button
                          key={platform}
                          onClick={(e) => {
                            e.stopPropagation();
                            setHasUserInteracted(true);
                            setSelectedPlatforms(prev => 
                              prev.includes(platform) 
                                ? prev.filter(p => p !== platform) 
                                : [...prev, platform]
                            );
                          }}
                          style={{
                            padding: '8px 10px',
                            borderRadius: '8px',
                            background: isSelected && selectedPlatforms.length < ALL_PLATFORMS.length ? '#F3F4F6' : 'transparent',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '12px',
                            cursor: 'pointer',
                            width: '100%',
                            transition: 'background 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            if (!(isSelected && selectedPlatforms.length < ALL_PLATFORMS.length)) {
                              e.currentTarget.style.background = '#F9FAFB';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!(isSelected && selectedPlatforms.length < ALL_PLATFORMS.length)) {
                              e.currentTarget.style.background = 'transparent';
                            }
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ 
                              width: '16px', 
                              height: '16px', 
                              borderRadius: '50%', 
                              background: pConfig.bg, 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              flexShrink: 0 
                            }}>
                              <img src={pConfig.iconUrl} alt={platform} style={{ width: '9px', height: '9px', filter: 'brightness(0) invert(1)' }} />
                            </span>
                            <span style={{ fontSize: '12px', fontWeight: 500, color: '#111827' }}>{platform}</span>
                          </div>
                          
                          <div style={{
                            width: '16px',
                            height: '16px',
                            borderRadius: '4px',
                            border: isSelected ? `1.5px solid ${pConfig.bg}` : '1.5px solid #D1D5DB',
                            backgroundColor: isSelected ? pConfig.bg : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            transition: 'all 0.15s ease'
                          }}>
                            {isSelected && <Check size={11} color="#FFF" strokeWidth={3} />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Sort By Dropdown */}
              <div style={{ position: 'relative' }} ref={sortDropdownRef}>
                <button 
                  onClick={() => setShowSortDropdown(!showSortDropdown)} 
                  style={{ 
                    width: '92px',
                    height: '36px',
                    padding: '0 10px', 
                    borderRadius: '8px', 
                    border: (sortBy === 'price_drop' || sortBy === 'largest_drop') 
                      ? '1px solid #FCA5A5' 
                      : (sortBy === 'price_hike' || sortBy === 'largest_hike')
                      ? '1px solid #86EFAC'
                      : '1px solid #E5E7EB', 
                    background: (sortBy === 'price_drop' || sortBy === 'largest_drop')
                      ? '#FEF2F2'
                      : (sortBy === 'price_hike' || sortBy === 'largest_hike')
                      ? '#F0FDF4'
                      : '#FFF', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    cursor: 'pointer', 
                    color: '#374151', 
                    fontSize: '12.5px', 
                    fontWeight: 500, 
                    transition: 'all 0.15s ease',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                    boxSizing: 'border-box',
                    flexShrink: 0
                  }}
                  title={
                    (sortBy === 'price_drop' || sortBy === 'largest_drop')
                      ? 'Price decrease: highest to lowest drop'
                      : (sortBy === 'price_hike' || sortBy === 'largest_hike')
                      ? 'Price increase: highest to lowest hike'
                      : 'Sort items'
                  }
                >
                  {(sortBy === 'price_drop' || sortBy === 'largest_drop') ? (
                    <>
                      <span style={{ color: '#DC2626', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        Price <ArrowDown size={13} strokeWidth={2.5} />
                      </span>
                      <ChevronDown size={13} color="#DC2626" />
                    </>
                  ) : (sortBy === 'price_hike' || sortBy === 'largest_hike') ? (
                    <>
                      <span style={{ color: '#16A34A', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        Price <ArrowUp size={13} strokeWidth={2.5} />
                      </span>
                      <ChevronDown size={13} color="#16A34A" />
                    </>
                  ) : (
                    <>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <ArrowUpDown size={13} color="#6B7280" />
                        <span style={{ color: '#374151', fontWeight: 500 }}>Sort</span>
                      </div>
                      <ChevronDown size={13} color="#9CA3AF" />
                    </>
                  )}
                </button>

                {showSortDropdown && (
                  <div style={{ 
                    position: 'absolute', 
                    top: '100%', 
                    right: 0, 
                    marginTop: '8px', 
                    background: '#FFF', 
                    border: '1px solid #E5E7EB', 
                    borderRadius: '12px', 
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)', 
                    zIndex: 50, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '4px', 
                    padding: '8px', 
                    width: 'max-content', 
                    minWidth: '185px' 
                  }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', padding: '4px 8px', letterSpacing: '0.5px' }}>
                      Sort By
                    </div>
                    <button
                      onClick={() => { setSortBy('default'); setShowSortDropdown(false); }}
                      style={{
                        padding: '8px 10px',
                        borderRadius: '8px',
                        background: sortBy === 'default' ? '#F3F4F6' : 'transparent',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        cursor: 'pointer',
                        width: '100%'
                      }}
                    >
                      <span style={{ fontSize: '12px', fontWeight: 500, color: '#111827' }}>Default (Magnitude)</span>
                      {sortBy === 'default' && <Check size={12} color="#0F172A" strokeWidth={2.5} />}
                    </button>
                    <button
                      onClick={() => { setSortBy('price_drop'); setShowSortDropdown(false); }}
                      style={{
                        padding: '8px 10px',
                        borderRadius: '8px',
                        background: (sortBy === 'price_drop' || sortBy === 'largest_drop') ? '#FEF2F2' : 'transparent',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        cursor: 'pointer',
                        width: '100%'
                      }}
                    >
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#DC2626', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ArrowDown size={13} strokeWidth={2.5} /> Price ↓ (High to Low Drop)
                      </span>
                      {(sortBy === 'price_drop' || sortBy === 'largest_drop') && <Check size={12} color="#DC2626" strokeWidth={2.5} />}
                    </button>
                    <button
                      onClick={() => { setSortBy('price_hike'); setShowSortDropdown(false); }}
                      style={{
                        padding: '8px 10px',
                        borderRadius: '8px',
                        background: (sortBy === 'price_hike' || sortBy === 'largest_hike') ? '#F0FDF4' : 'transparent',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        cursor: 'pointer',
                        width: '100%'
                      }}
                    >
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#16A34A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ArrowUp size={13} strokeWidth={2.5} /> Price ↑ (High to Low Hike)
                      </span>
                      {(sortBy === 'price_hike' || sortBy === 'largest_hike') && <Check size={12} color="#16A34A" strokeWidth={2.5} />}
                    </button>
                  </div>
                )}
              </div>

              <div style={{ position: 'relative' }} ref={filterDropdownRef}>
                  <button onClick={() => setShowFilterDropdown(!showFilterDropdown)} style={{ height: '36px', padding: '0 12px', borderRadius: '8px', border: activeCategoryFilter !== 'all' ? '1.5px solid #FCA5A5' : '1px solid #E5E7EB', background: activeCategoryFilter !== 'all' ? '#FEF2F2' : '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer', color: activeCategoryFilter !== 'all' ? '#B91C1C' : '#374151', fontSize: '12.5px', fontWeight: activeCategoryFilter !== 'all' ? 700 : 500, minWidth: '85px', boxSizing: 'border-box', flexShrink: 0 }}>
                    {activeCategoryFilter === 'all' && <><SlidersHorizontal size={13} color="#6B7280" /> Filter</>}
                    {activeCategoryFilter === 'mains' && <><img src="/pizza_color_icon.jpg" alt="Mains" style={{ width: '13px', height: '13px', transform: 'rotate(20deg)', mixBlendMode: 'multiply', filter: 'brightness(1.2) contrast(1.5)' }} /> Mains</>}
                    {activeCategoryFilter === 'sides' && <><img src="/sides_icon.png" alt="Sides" style={{ width: '13px', height: '13px', mixBlendMode: 'multiply' }} /> Sides</>}
                    {activeCategoryFilter === 'drinks' && <><img src="/drinks_icon.avif" alt="Drinks" style={{ width: '13px', height: '13px', mixBlendMode: 'multiply', filter: 'brightness(1.2) contrast(1.5)' }} /> Drinks</>}
                  </button>
                {showFilterDropdown && (
                  <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', background: '#FFF', border: '1px solid #E5E7EB', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 50, display: 'flex', flexDirection: 'column', gap: '4px', padding: '8px', width: 'max-content', minWidth: '180px' }}>
                    
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

              {/* Integrated Modal Close Button */}
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  border: '1px solid #E5E7EB',
                  background: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#F3F4F6'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                title="Close"
              >
                <X size={18} color="#6B7280" />
              </button>
            </div>
            
            <div id="modal-alerts-stream-root" className="modal-rows-vertical-stack">
              {processedItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 20px', color: '#8e8e93', fontSize: '13px', fontWeight: '500' }}>
                  {selectedPlatforms.length === 0 ? (
                    <div>
                      <div style={{ marginBottom: '8px', fontSize: '14px', color: '#111827', fontWeight: '600' }}>No platforms selected</div>
                      <div style={{ marginBottom: '16px' }}>Select at least one platform above to view price change intel.</div>
                      <button
                        onClick={() => setSelectedPlatforms([...ALL_PLATFORMS])}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '8px',
                          background: '#0F172A',
                          color: '#FFF',
                          border: 'none',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Select All Platforms
                      </button>
                    </div>
                  ) : (
                    `No price movements match the selected filters in your ${activeScopeFilter === 'watchlist' ? 'watchlist' : 'area'} in the last ${timeframe === '24h' ? '24 hours' : timeframe === '7d' ? '7 days' : '30 days'}.`
                  )}
                </div>
              ) : (
                processedItems.map(alert => {
                  const isDrop = alert.price_delta < 0;
                  const deltaDisplay = isDrop ? `-£${Math.abs(alert.price_delta).toFixed(2)}` : `+£${alert.price_delta.toFixed(2)}`;

                  // Platform Config
                  const pConfig = getPlatformConfig(alert.platform);

                  return (
                    <div key={alert.id} className="alert-capsule-row">
                      {/* Micro Image Thumbnail */}
                      <div className="item-thumbnail" style={{ overflow: 'hidden', padding: 0, border: '1px solid #E2E8F0' }}>
                        <img src={alert.image} alt={alert.item_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      
                      {/* Text Details */}
                      <div className="alert-restaurant-identity" style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'flex-start' }}>
                        <div className="alert-primary-title" title={alert.item_name}>{alert.item_name}</div>
                        <div className="alert-secondary-subtitle" title={alert.competitor_name} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>{alert.competitor_name}</span>
                          {alert.scope === 'watchlist' && (
                            <span style={{ 
                              fontSize: '9.5px', 
                              fontWeight: 700, 
                              color: '#B45309', 
                              backgroundColor: '#FEF3C7', 
                              padding: '1px 5px', 
                              borderRadius: '4px',
                              letterSpacing: '0.02em',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '2px',
                              lineHeight: 1.2
                            }}>
                              ⭐ Watchlist
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: pConfig.bg, padding: '2px 8px', borderRadius: '9999px', boxShadow: `0 2px 4px ${pConfig.bg}33` }}>
                            <img src={pConfig.iconUrl} alt={alert.platform} style={{ height: '9px', width: '9px' }} />
                            <span style={{ fontSize: '9px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '0.02em', textTransform: 'uppercase' }}>{alert.platform}</span>
                          </span>
                          {alert.time_ago && (
                            <>
                              <span style={{ fontSize: '10px', color: '#CBD5E1', lineHeight: 1 }}>•</span>
                              <span style={{ 
                                fontSize: '10.5px', 
                                fontWeight: 600, 
                                color: alert.days_ago <= 0 ? '#059669' : alert.days_ago <= 1 ? '#4F46E5' : '#64748B',
                                display: 'inline-flex',
                                alignItems: 'center'
                              }}>
                                {alert.time_ago}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* Pricing Details with Directional Indicators (No percentage change) */}
                      <div className="price-details-container">
                        <div 
                          className="price-delta" 
                          style={{ 
                            color: isDrop ? '#DC2626' : '#16A34A', 
                            fontWeight: '800',
                            fontSize: '13px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            gap: '3px',
                            backgroundColor: isDrop ? '#FEF2F2' : '#F0FDF4',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            border: isDrop ? '1px solid #FEE2E2' : '1px solid #DCFCE7'
                          }}
                        >
                          {isDrop ? (
                            <ArrowDownRight size={14} strokeWidth={2.5} />
                          ) : (
                            <ArrowUpRight size={14} strokeWidth={2.5} />
                          )}
                          <span>{deltaDisplay}</span>
                        </div>
                        <div className="price-was-now" style={{ fontWeight: '500', marginTop: '4px', fontSize: '10px', color: '#64748B' }}>
                          was £{alert.old_price.toFixed(2)} → <span style={{ fontWeight: '700', color: '#0F172A' }}>now £{alert.new_price.toFixed(2)}</span>
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
      </div>,
      document.body
    )}
    </>
  );
};

export default InstantPriceAlertsWidget;
