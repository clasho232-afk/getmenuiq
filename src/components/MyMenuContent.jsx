import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Edit2, Activity, Zap, TrendingDown, X, Download, RefreshCw, CheckCircle, AlertTriangle, ArrowRight, Bell, BarChart3, Target, MapPin, UtensilsCrossed, Info } from 'lucide-react';
import MarketPositionReport from './MarketPositionReport';
import { supabase } from '../supabase';
import './MyMenuContent.css';

const mockMenuItems = [
  { id: 1, name: 'Spicy Chicken Burger', category: 'Burgers', price: '£8.50', cost: '£3.20', margin: '62%', status: 'Active', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=150&q=80' },
  { id: 2, name: 'Classic Cheeseburger', category: 'Burgers', price: '£7.00', cost: '£2.80', margin: '60%', status: 'Active', image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=150&q=80' },
  { id: 3, name: 'Truffle Fries', category: 'Sides', price: '£4.50', cost: '£1.10', margin: '75%', status: 'Active', image: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=150&q=80' },
  { id: 4, name: 'Margherita Pizza', category: 'Pizzas', price: '£11.00', cost: '£2.50', margin: '77%', status: 'Active', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=150&q=80' },
  { id: 5, name: 'Vegan Wrap', category: 'Wraps', price: '£6.50', cost: '£2.10', margin: '67%', status: 'Inactive', image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=150&q=80' },
  { id: 6, name: 'Cola Zero', category: 'Drinks', price: '£2.50', cost: '£0.40', margin: '84%', status: 'Active', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=150&q=80' },
  { id: 7, name: 'Milkshake', category: 'Drinks', price: '£4.00', cost: '£1.20', margin: '70%', status: 'Active', image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=150&q=80' },
  { id: 8, name: 'Sweet Potato Fries', category: 'Sides', price: '£5.00', cost: '£1.40', margin: '72%', status: 'Active', image: 'https://images.unsplash.com/photo-1596649285097-70b1cb3b3209?auto=format&fit=crop&w=150&q=80' }
];

import AuditCommandCenterModal, { getMarketData } from './AuditCommandCenterModal';

const MyMenuContent = ({ analyzeTrigger, selectedRestaurant }) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [analyzingItem, setAnalyzingItem] = useState(null);
  const [analysisState, setAnalysisState] = useState('idle'); // 'scraping', 'rendering', 'complete'
  const [activePricePoint, setActivePricePoint] = useState(null);
  const [rangeMin, setRangeMin] = useState('');
  const [rangeMax, setRangeMax] = useState('');
  const [showFullAnalysis, setShowFullAnalysis] = useState(false);
  const [fullAnalysisState, setFullAnalysisState] = useState('idle');
  const [pricedRightOpen, setPricedRightOpen] = useState(false);
  const [showMarketReport, setShowMarketReport] = useState(false);
  const [showAnalysisSelector, setShowAnalysisSelector] = useState(false);
  const [platform, setPlatform] = useState('deliveroo');

  // Live data from Supabase
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchMenuData = async () => {
      // Wait for a valid restaurant profile ID from the app context
      if (!selectedRestaurant?.id) return;
      
      try {
        setLoadingMenu(true);
        setMenuItems([]); // Wipe previous menu container state completely
        
        console.log(`📡 Fetching schema records for restaurant_id: ${selectedRestaurant.id}`);

        // Query step matching your exact columns
        const { data: items, error: itemsError } = await supabase
          .from('menu_items')
          .select('id, name, description, price, image_url, is_available, section_name')
          .eq('restaurant_id', selectedRestaurant.id)
          .order('section_name');

        if (itemsError) throw itemsError;

        // Map to format the rest of the component expects
        const mapped = (items || []).map(item => ({
          id: item.id,
          name: item.name,
          category: item.section_name || 'Other',
          price: `£${parseFloat(item.price || 0).toFixed(2)}`,
          priceNum: parseFloat(item.price || 0),
          cost: '—',
          margin: '—',
          status: item.is_available ? 'Active' : 'Inactive',
          image: item.image_url || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=150&q=80',
          description: item.description || ''
        }));

        setMenuItems(mapped);

        // 1. Map 'section_name' directly to generate your top category filter pills row
        const uniqueCats = ['All', ...new Set(mapped.map(i => i.category))];
        setCategories(uniqueCats);
        setActiveCategory('All'); // Real-time fast client-side navigation filter toggle initialization

      } catch (err) {
        console.error("❌ Schema Data Retrieval Failure:", err.message);
      } finally {
        setLoadingMenu(false);
      }
    };

    fetchMenuData();
  }, [selectedRestaurant]);

  const handleFullAnalyze = () => {
    setShowFullAnalysis(true);
    setFullAnalysisState('loading');
    setTimeout(() => setFullAnalysisState('complete'), 2500);
  };

  const quickWins = [
    { name: 'Spicy Chicken Burger', category: 'Burgers', price: 8.50, compLow: 6.50, compHigh: 7.99, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=64&q=80', recommendation: 'Burger King prices theirs at £6.99 and Five Guys at £7.50 — lower by £0.75 to sit within your competitive set and stop losing price-sensitive customers', suggestedPrice: 7.75 },
    { name: 'Truffle Fries', category: 'Sides', price: 4.50, compLow: 2.99, compHigh: 3.99, image: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=64&q=80', recommendation: 'Five Guys charges £3.49 and Burger King £2.99 — consider dropping to £3.99 to match the top of the competitive range', suggestedPrice: 3.99 },
    { name: 'Cola Zero', category: 'Drinks', price: 2.50, compLow: 1.50, compHigh: 1.99, image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=64&q=80', recommendation: 'Pizza Express, Nando\'s and Local Diner all price soft drinks under £2 — lowering to £1.99 aligns you without noticeable margin loss', suggestedPrice: 1.99 },
  ].sort((a, b) => (b.price - b.compHigh) - (a.price - a.compHigh));

  const pricedRight = [
    { name: 'Classic Cheeseburger', price: 7.00, image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=64&q=80', note: 'Competitively priced — sitting mid-range across Burger King, Five Guys and 6 others' },
    { name: 'Margherita Pizza', price: 11.00, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=64&q=80', note: 'Well positioned — only Pizza Express prices higher at £12.95' },
    { name: 'Vegan Wrap', price: 6.50, image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=64&q=80', note: 'Fair value — matches Local Diner\'s average for plant-based wraps' },
    { name: 'Sweet Potato Fries', price: 5.00, image: 'https://images.unsplash.com/photo-1596649285097-70b1cb3b3209?auto=format&fit=crop&w=64&q=80', note: 'Sitting at the competitive median — Nando\'s charges £4.95' },
    { name: 'Milkshake', price: 4.00, image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=64&q=80', note: 'Aligned with Five Guys and 5 others in the dessert drinks category' },
  ];

  const watchList = [
    { name: 'Margherita Pizza', price: 11.00, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=64&q=80', signal: 'Pizza Express, Domino\'s and Papa John\'s have all dropped their Margherita price in the last 14 days — if the trend continues, you may be priced out by next week' },
    { name: 'Milkshake', price: 4.00, image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=64&q=80', signal: 'Local Diner just launched a 20% off milkshake promo — monitor if this becomes permanent pricing' },
  ];

  const filteredItems = (activeCategory === 'All' ? menuItems : menuItems.filter(item => item.category === activeCategory))
    .filter(item => !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleAnalyze = (id) => {
    setAnalyzingItem(id);
    setAnalysisState('scraping');
    setActivePricePoint(null);
    
    const item = menuItems.find(i => i.id === id);
    if (item) {
      const mData = getMarketData(item);
      setRangeMin(mData.lowPrice);
      setRangeMax(mData.highPrice);
    } else {
      setRangeMin('');
      setRangeMax('');
    }

    setTimeout(() => {
      setAnalysisState('rendering');
      setTimeout(() => {
        setAnalysisState('complete');
      }, 1000);
    }, 1500);
  };

  const renderAnalysis = (item) => {
    if (analysisState === 'scraping') {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem', background: '#F8FAFC', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)' }}>
          <div style={{ width: '24px', height: '24px', border: '3px solid #E2E8F0', borderTopColor: '#3B82F6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#475569' }}>Master Data Scraper: Aggregating real-time prices from 8 local competitors...</span>
        </div>
      );
    }

    if (analysisState === 'rendering') {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem', background: '#F8FAFC', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)' }}>
          <div style={{ width: '24px', height: '24px', border: '3px solid #E2E8F0', borderTopColor: '#10B981', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#475569' }}>Rendering Market Position Map...</span>
        </div>
      );
    }

    return null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', height: '100%', position: 'relative' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '1.875rem', fontWeight: 700 }}>My Menu {loadingMenu && <span style={{ fontSize: '0.875rem', color: '#9CA3AF', fontWeight: 400 }}>Loading...</span>}</div>
        </div>
        
        {/* Global Platform Lens */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {['deliveroo', 'ubereats', 'justeat'].map(p => (
            <button
              key={p}
              onClick={() => setPlatform(p)}
              className={`platform-btn ${platform === p ? `btn-${p} active` : ''}`}
              style={{ 
                padding: '0.5rem 1.25rem', 
                fontSize: '0.875rem', 
                ...(platform !== p ? { backgroundColor: '#fff', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' } : {}) 
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img 
                  src={`https://cdn.simpleicons.org/${p === 'deliveroo' ? 'deliveroo/00CCBC' : p === 'ubereats' ? 'ubereats/06C167' : 'justeat/FF5B00'}`} 
                  alt={p} 
                  style={{ height: '14px', width: '14px', objectFit: 'contain', filter: platform !== p ? 'grayscale(100%) opacity(0.5)' : 'brightness(0) invert(1)' }} 
                />
                {p === 'deliveroo' ? 'Deliveroo' : p === 'ubereats' ? 'UberEats' : 'Just Eat'}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="header-container" style={{ position: 'absolute', right: 0, top: '40px', zIndex: 10 }}>
        <div className="system-authority-wrapper">
          <span>Last analyzed: 2 hours ago.</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="live-badge"></span>
            <span style={{ fontWeight: 600, color: '#111' }}>System Live</span>
          </div>
        </div>
        <button className="analyze-menu-button" onClick={() => setShowAnalysisSelector(true)}>
          Analyze Menu
        </button>
      </div>

      <div className="glass-panel main-menu-content-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{ 
                  padding: '0.5rem 1rem', 
                  borderRadius: '9999px', 
                  fontSize: '0.875rem', 
                  fontWeight: 600, 
                  background: activeCategory === cat ? '#000' : 'rgba(255,255,255,0.6)', 
                  color: activeCategory === cat ? '#fff' : '#4B5563',
                  border: activeCategory === cat ? 'none' : '1px solid rgba(0,0,0,0.05)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                placeholder="Search items..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '9999px', padding: '0.5rem 1rem 0.5rem 2.5rem', outline: 'none', fontSize: '0.875rem', width: '200px' }} 
              />
              <Search size={16} color="#9CA3AF" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
            <button style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '9999px', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#4B5563', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#fff'} onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.8)'}>
              <Filter size={16} /> Filter
            </button>
          </div>
        </div>

        <div className="menu-card-grid">
          {filteredItems.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: '#8c8c8c' }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', color: '#4B5563' }}>No Menu Items Found</h4>
              <p style={{ fontSize: '13px', margin: 0 }}>This restaurant has no records inside the menu_items table.</p>
            </div>
          ) : filteredItems.map(item => {
            const isAnalyzing = analyzingItem === item.id;
            const isLoading = isAnalyzing && (analysisState === 'scraping' || analysisState === 'rendering');
            return (
              <div
                key={item.id}
                className={`menu-item-card${isAnalyzing ? ' analyzing' : ''}`}
                onClick={() => handleAnalyze(item.id)}
              >
                {/* Image */}
                <div className="menu-card-image-wrap">
                  <img src={item.image} alt={item.name} />
                  <div className="menu-card-overlay">
                    {isLoading ? (
                      <div className="menu-card-spinner" />
                    ) : (
                      <button className="menu-card-analyze-btn">
                        Analyze
                      </button>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="menu-card-content">
                  <p className="menu-card-name">{item.name}</p>
                  <span className="menu-card-category">{item.category}</span>
                  <div className="menu-card-footer">
                    <span className="menu-card-price">
                      <span style={{ color: '#36454F', fontSize: '0.85em', fontWeight: 600, marginRight: '4px' }}>Price:</span>
                      {(() => {
                        let p = parseFloat(item.price.replace('£', ''));
                        if (platform === 'deliveroo') p *= 1.05;
                        if (platform === 'ubereats') p *= 1.08;
                        if (platform === 'justeat') p *= 1.02;
                        return `£${p.toFixed(2)}`;
                      })()}
                    </span>
                    <span className="menu-card-status">
                      <span className={`menu-card-status-dot ${item.status === 'Active' ? 'active' : 'inactive'}`} />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Audit Command Center Modal */}
      {analysisState === 'complete' && analyzingItem && (
        <AuditCommandCenterModal 
          activeItem={menuItems.find(i => i.id === analyzingItem)} 
          initialPlatform={platform} 
          onClose={() => setAnalyzingItem(null)} 
        />
      )}

      {/* Full Menu Analysis Modal */}
      {showFullAnalysis && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => { setShowFullAnalysis(false); setFullAnalysisState('idle'); }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }} />
          <div onClick={e => e.stopPropagation()} style={{ position: 'relative', width: '680px', maxWidth: '92%', maxHeight: '88vh', background: '#FAFAF8', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', animation: 'modalScaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ padding: '1.5rem 1.75rem', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FAFAF8', flexShrink: 0 }}>
              <div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Full Menu Analysis</h2>
                <p style={{ fontSize: '0.7rem', color: '#9CA3AF', marginTop: '0.2rem' }}>{mockMenuItems.length} items analyzed against your competitive set</p>
              </div>
              <button onClick={() => { setShowFullAnalysis(false); setFullAnalysisState('idle'); }} style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid rgba(0,0,0,0.08)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={16} color="#6B7280" /></button>
            </div>

            {fullAnalysisState === 'loading' ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.25rem', padding: '4rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '3px solid rgba(0,0,0,0.06)', borderTopColor: '#e05046', animation: 'spin 1s linear infinite' }} />
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111' }}>Analyzing your full menu against competitors…</p>
                  <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '0.35rem' }}>Comparing {mockMenuItems.length} items across 8 local restaurants</p>
                </div>
              </div>
            ) : (
              <div style={{ padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto', flex: 1 }}>
                {/* Progress Summary */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {[
                    { label: `${mockMenuItems.length} analysed`, color: '#6B7280', bg: 'rgba(0,0,0,0.04)' },
                    { label: `${quickWins.length} quick wins`, color: '#10B981', bg: 'rgba(16,185,129,0.08)' },
                    { label: `${pricedRight.length} priced right`, color: '#6B7280', bg: 'rgba(0,0,0,0.04)' },
                    { label: `${watchList.length} on watch list`, color: '#D97706', bg: 'rgba(245,158,11,0.08)' },
                  ].map((s, i) => (
                    <span key={i} style={{ fontSize: '0.65rem', fontWeight: 700, color: s.color, background: s.bg, padding: '0.2rem 0.55rem', borderRadius: '6px' }}>{s.label}</span>
                  ))}
                </div>

                {/* Holistic Insight */}
                <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(139,92,246,0.04) 100%)', border: '1px solid rgba(99,102,241,0.1)', borderRadius: '12px', padding: '1.1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                    <Activity size={14} color="#6366F1" />
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#6366F1', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Menu-wide insight</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#374151', lineHeight: 1.6 }}>Your sides are underpriced relative to your mains — you have room to raise Truffle Fries and Sweet Potato Fries without affecting perceived value. Your burger range has the most pricing risk this week — 4 competitors have changed burger prices in the last 7 days. Overall your menu is priced <strong>8% above</strong> your competitive set average.</p>
                </div>

                {/* Quick Wins */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />
                    <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111' }}>Quick Wins</h3>
                    <span style={{ fontSize: '0.6rem', fontWeight: 600, color: '#10B981', background: 'rgba(16,185,129,0.08)', padding: '0.12rem 0.4rem', borderRadius: '4px' }}>{quickWins.length} items</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {quickWins.map((item, i) => (
                      <div key={i} style={{ background: '#fff', borderRadius: '10px', padding: '1rem', border: '1px solid rgba(16,185,129,0.12)', borderLeft: '3px solid #10B981', display: 'flex', gap: '0.85rem' }}>
                        <img src={item.image} alt={item.name} style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0, border: '1px solid rgba(0,0,0,0.06)' }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                            <div>
                              <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#111' }}>{item.name}</span>
                              <span style={{ fontSize: '0.6rem', color: '#9CA3AF', background: 'rgba(0,0,0,0.03)', padding: '0.1rem 0.35rem', borderRadius: '4px', marginLeft: '0.4rem' }}>{item.category}</span>
                            </div>
                            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#111' }}>£{item.price.toFixed(2)}</span>
                          </div>
                          <p style={{ fontSize: '0.65rem', color: '#9CA3AF', marginBottom: '0.5rem' }}>Competitive range: £{item.compLow.toFixed(2)} — £{item.compHigh.toFixed(2)}</p>
                          <p style={{ fontSize: '0.75rem', color: '#374151', lineHeight: 1.5, marginBottom: '0.75rem' }}>{item.recommendation}</p>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button style={{ padding: '0.4rem 0.75rem', borderRadius: '6px', border: 'none', background: '#10B981', color: '#fff', fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#059669'} onMouseLeave={e => e.currentTarget.style.background = '#10B981'}>Apply £{item.suggestedPrice.toFixed(2)}</button>
                            <button style={{ padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.08)', background: 'transparent', color: '#6B7280', fontSize: '0.65rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><ArrowRight size={11} /> Deep Dive</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Priced Right */}
                <div>
                  <button onClick={() => setPricedRightOpen(!pricedRightOpen)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', border: 'none', background: 'none', cursor: 'pointer', padding: 0, marginBottom: pricedRightOpen ? '0.75rem' : 0 }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6B7280' }} />
                    <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111' }}>Priced Right</h3>
                    <span style={{ fontSize: '0.6rem', fontWeight: 600, color: '#6B7280', background: 'rgba(0,0,0,0.04)', padding: '0.12rem 0.4rem', borderRadius: '4px' }}>Show {pricedRight.length} items</span>
                    <span style={{ fontSize: '0.7rem', color: '#9CA3AF', marginLeft: 'auto', transform: pricedRightOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>▾</span>
                  </button>
                  {pricedRightOpen && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {pricedRight.map((item, i) => (
                        <div key={i} style={{ background: '#fff', borderRadius: '8px', padding: '0.75rem 1rem', border: '1px solid rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <img src={item.image} alt={item.name} style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0, border: '1px solid rgba(0,0,0,0.06)' }} />
                          <div style={{ flex: 1 }}>
                            <span style={{ fontWeight: 600, fontSize: '0.8rem', color: '#111' }}>{item.name}</span>
                            <p style={{ fontSize: '0.65rem', color: '#9CA3AF', marginTop: '0.15rem' }}>{item.note}</p>
                          </div>
                          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#111', flexShrink: 0 }}>£{item.price.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Watch List */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B' }} />
                    <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111' }}>Watch List</h3>
                    <span style={{ fontSize: '0.6rem', fontWeight: 600, color: '#D97706', background: 'rgba(245,158,11,0.08)', padding: '0.12rem 0.4rem', borderRadius: '4px' }}>{watchList.length} items</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {watchList.map((item, i) => (
                      <div key={i} style={{ background: '#fff', borderRadius: '10px', padding: '1rem', border: '1px solid rgba(245,158,11,0.12)', borderLeft: '3px solid #F59E0B', display: 'flex', gap: '0.85rem' }}>
                        <img src={item.image} alt={item.name} style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0, border: '1px solid rgba(0,0,0,0.06)' }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#111' }}>{item.name}</span>
                            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#111' }}>£{item.price.toFixed(2)}</span>
                          </div>
                          <p style={{ fontSize: '0.75rem', color: '#374151', lineHeight: 1.5, marginBottom: '0.6rem' }}>{item.signal}</p>
                          <button style={{ padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid rgba(245,158,11,0.2)', background: 'rgba(245,158,11,0.06)', color: '#D97706', fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Bell size={11} /> Set Alert</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            {fullAnalysisState === 'complete' && (
              <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(0,0,0,0.05)', background: '#FAFAF8', position: 'sticky', bottom: 0 }}>
                <p style={{ fontSize: '0.65rem', color: '#D1D5DB', marginBottom: '0.75rem' }}>Analysis based on competitor data last updated 2 hours ago</p>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button onClick={() => { setFullAnalysisState('loading'); setTimeout(() => setFullAnalysisState('complete'), 2500); }} style={{ flex: 1, padding: '0.55rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.08)', background: '#fff', color: '#6B7280', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}><RefreshCw size={12} /> Re-analyse</button>
                  <button style={{ flex: 1, padding: '0.55rem', borderRadius: '8px', border: 'none', background: '#111', color: '#fff', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}><Download size={12} /> Download PDF</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Analysis Type Selector Popup */}
      {showAnalysisSelector && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowAnalysisSelector(false)}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }} />
          <div onClick={e => e.stopPropagation()} style={{ position: 'relative', width: '580px', maxWidth: '92%', background: '#FAFAF8', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.06)', animation: 'modalScaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ padding: '1.75rem 2rem 0.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#111' }}>What would you like to analyze against?</h2>
                <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '0.25rem' }}>Choose how you want to benchmark your menu</p>
              </div>
              <button onClick={() => setShowAnalysisSelector(false)} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid rgba(0,0,0,0.08)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}><X size={14} color="#9CA3AF" /></button>
            </div>

            {/* Cards */}
            <div style={{ padding: '1.25rem 2rem', display: 'flex', gap: '0.85rem' }}>
              {/* Card A — My Competitive Set */}
              <div style={{ flex: 1, background: '#fff', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.06)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', transition: 'border-color 0.2s, box-shadow 0.2s', cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(224,80,70,0.25)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(224,80,70,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.06)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(224,80,70,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Target size={18} color="#e05046" />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#111' }}>My Competitive Set</h3>
                  <p style={{ fontSize: '0.7rem', color: '#6B7280', lineHeight: 1.5, marginTop: '0.3rem' }}>Compare your menu against the competitors you have manually added in your Competitor Finder</p>
                </div>
                <p style={{ fontSize: '0.65rem', color: '#9CA3AF', fontWeight: 600 }}>8 competitors · last updated 2 hours ago</p>
                <button onClick={() => { setShowAnalysisSelector(false); handleFullAnalyze(); }} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: 'none', background: '#111', color: '#fff', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s', marginTop: 'auto' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#e05046'}
                  onMouseLeave={e => e.currentTarget.style.background = '#111'}
                >Analyze against my set</button>
              </div>

              {/* Card B — Full Market */}
              <div style={{ flex: 1, background: '#fff', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.06)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', transition: 'border-color 0.2s, box-shadow 0.2s', cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.25)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(99,102,241,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.06)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(99,102,241,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MapPin size={18} color="#6366F1" />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#111' }}>Full Market</h3>
                  <p style={{ fontSize: '0.7rem', color: '#6B7280', lineHeight: 1.5, marginTop: '0.3rem' }}>Compare your menu against every similar restaurant in the MenuIQ database matching your cuisine, area, and platforms</p>
                </div>
                <p style={{ fontSize: '0.65rem', color: '#9CA3AF', fontWeight: 600 }}>47 restaurants matched in East London</p>
                <button onClick={() => { setShowAnalysisSelector(false); setShowMarketReport(true); }} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)', background: 'transparent', color: '#111', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', marginTop: 'auto' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >Analyze full market</button>
              </div>
            </div>

            {/* Footer hint */}
            <div style={{ padding: '0 2rem 1.5rem', textAlign: 'center' }}>
              <p style={{ fontSize: '0.65rem', color: '#D1D5DB' }}>Not sure? Start with your competitive set — it's faster and more personal.</p>
            </div>
          </div>
        </div>
      )}

      <MarketPositionReport isOpen={showMarketReport} onClose={() => setShowMarketReport(false)} />
    </div>
  );
};

export default MyMenuContent;
