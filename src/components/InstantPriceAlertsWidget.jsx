import React, { useState, useMemo } from 'react';
import './InstantPriceAlertsWidget.css';

const RESTAURANT_AREA_NAME = "Whitechapel";

const MODAL_CROSS_FILTER_DATA = [
  { id: "m1", competitor_name: "Domino's Ilford", item_name: "Large 12\" Pepperoni Feast Pizza", menu_category: "mains", old_price: 18.99, new_price: 16.99, price_delta: -2.00, platform: "Deliveroo", scope: "watchlist" },
  { id: "m2", competitor_name: "Al-Amin Pizza", item_name: "Gourmet Double Beef Burger Meal", menu_category: "mains", old_price: 10.50, new_price: 9.30, price_delta: -1.20, platform: "Uber Eats", scope: "watchlist" },
  { id: "m3", competitor_name: "Pizza Palace Barking", item_name: "Single Piri Piri Chicken Burger", menu_category: "mains", old_price: 6.49, new_price: 6.99, price_delta: 0.50, platform: "Just Eat", scope: "local" },
  { id: "m4", competitor_name: "Perfect Fried Chicken", item_name: "6pc Hot Wings Box Split", menu_category: "sides", old_price: 4.50, new_price: 3.99, price_delta: -0.51, platform: "Deliveroo", scope: "local" },
  { id: "m5", competitor_name: "Romford Grill House", item_name: "Mega Mixed Kebab Skewer Box", menu_category: "mains", old_price: 14.99, new_price: 12.99, price_delta: -2.00, platform: "Uber Eats", scope: "neighborhood" },
  { id: "m6", competitor_name: "Chigwell Pizza Kitchen", item_name: "Gorgonzola & Honey Artisan Crust", menu_category: "mains", old_price: 13.50, new_price: 14.50, price_delta: 1.00, platform: "Deliveroo", scope: "neighborhood" },
  { id: "o5", competitor_name: "Domino's Ilford", item_name: "Large French Fries / Peri Fries", menu_category: "sides", old_price: 3.50, new_price: 3.90, price_delta: 0.40, platform: "Deliveroo", scope: "watchlist" },
  { id: "o6", competitor_name: "Pizza Palace Barking", item_name: "Pepsi Cola 1.5L Bottle", menu_category: "drinks", old_price: 2.20, new_price: 2.95, price_delta: 0.75, platform: "Deliveroo", scope: "local" },
  { id: "o7", competitor_name: "Al-Amin Pizza", item_name: "Coca-Cola Zero Sugar 330ml Can", menu_category: "drinks", old_price: 1.50, new_price: 1.35, price_delta: -0.15, platform: "Uber Eats", scope: "watchlist" }
];

const InstantPriceAlertsWidget = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeScopeFilter, setActiveScopeFilter] = useState('all');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');

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
    return items.sort((a, b) => Math.abs(b.price_delta) - Math.abs(a.price_delta));
  }, [scopedData, activeCategoryFilter]);

  return (
    <>
      {/* Refined Dashboard Metric Card */}
      <div className="market-alerts-card" onClick={(e) => { e.preventDefault(); setIsModalOpen(true); }}>
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
            <div className="header">
              <span className="card-meta-label">PRICE CHANGES</span>
              <div style={{ fontSize: '10px', color: '#8e8e93', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{RESTAURANT_AREA_NAME}, Neighborhood</div>
            </div>
            <div className="split-pane">
              <div className="left-pane">
                <h2 style={{ fontSize: '32px', margin: '0', color: '#ff5e3a' }}>{MODAL_CROSS_FILTER_DATA.length}</h2>
                <p style={{ fontSize: '11px', color: '#1c1c1e', margin: '4px 0 0 0', fontWeight: '700', textTransform: 'uppercase' }}>Total Alerts</p>
              </div>
              <div className="right-pane">
                {[
                  { name: 'Mains', count: MODAL_CROSS_FILTER_DATA.filter(i => i.menu_category === 'mains').length },
                  { name: 'Sides', count: MODAL_CROSS_FILTER_DATA.filter(i => i.menu_category === 'sides').length },
                  { name: 'Drinks', count: MODAL_CROSS_FILTER_DATA.filter(i => i.menu_category === 'drinks').length }
                ].filter(cat => cat.count > 0).map(c => (
                  <div className="metric-row" key={c.name} style={{ fontSize: '15px', fontWeight: 'bold' }}>
                    <span>{c.name}</span>
                    <span style={{ fontWeight: '800' }}>{c.count}</span>
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
              <h3>Market Pricing Intel Matrix</h3>
              <p className="modal-subtitle-text">Analyze real-time rival positioning.</p>
            </div>
            
            {/* Tier 1: Scope Navigation (Reordered) */}
            <div className="modal-scope-navigation-tabs">
              <button 
                className={`scope-nav-link ${activeScopeFilter === 'all' ? 'active' : ''}`} 
                onClick={() => setActiveScopeFilter('all')}
              >
                All
              </button>
              <button 
                className={`scope-nav-link ${activeScopeFilter === 'local' ? 'active' : ''}`} 
                onClick={() => setActiveScopeFilter('local')}
              >
                {RESTAURANT_AREA_NAME}
              </button>
              <button 
                className={`scope-nav-link ${activeScopeFilter === 'neighborhood' ? 'active' : ''}`} 
                onClick={() => setActiveScopeFilter('neighborhood')}
              >
                Neighborhood
              </button>
              <button 
                className={`scope-nav-link ${activeScopeFilter === 'watchlist' ? 'active' : ''}`} 
                onClick={() => setActiveScopeFilter('watchlist')}
              >
                Watchlist
              </button>
            </div>
            
            {/* Tier 2: Category Sub-Filters (Replaced Channels) */}
            <div className="modal-channel-subpills-row">
              <button 
                className={`modal-sub-pill ${activeCategoryFilter === 'all' ? 'active' : ''}`} 
                onClick={() => setActiveCategoryFilter('all')}
              >
                All Items <span className="count">{modalCounts.all}</span>
              </button>
              <button 
                className={`modal-sub-pill ${activeCategoryFilter === 'mains' ? 'active' : ''}`} 
                onClick={() => setActiveCategoryFilter('mains')}
              >
                Mains <span className="count">{modalCounts.mains}</span>
              </button>
              <button 
                className={`modal-sub-pill ${activeCategoryFilter === 'sides' ? 'active' : ''}`} 
                onClick={() => setActiveCategoryFilter('sides')}
              >
                Sides <span className="count">{modalCounts.sides}</span>
              </button>
              <button 
                className={`modal-sub-pill ${activeCategoryFilter === 'drinks' ? 'active' : ''}`} 
                onClick={() => setActiveCategoryFilter('drinks')}
              >
                Drinks <span className="count">{modalCounts.drinks}</span>
              </button>
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
                    'Deliveroo': '#00cdbc',
                    'Uber Eats': '#107c41',
                    'Just Eat': '#ff8000'
                  };
                  const pColor = platformColors[alert.platform] || '#636366';

                  return (
                    <div key={alert.id} className="alert-capsule-row">
                      {/* Micro Image Placeholder */}
                      <div className="item-thumbnail">IMG</div>
                      
                      {/* Text Details */}
                      <div className="alert-restaurant-identity">
                        <div className="alert-restaurant-name">{alert.competitor_name}</div>
                        <div className="alert-item-name">{alert.item_name}</div>
                        <span className="platform-pill-badge" style={{ background: `${pColor}20`, color: pColor }}>
                          {alert.platform}
                        </span>
                      </div>
                      
                      {/* New Pricing Logic */}
                      <div className="price-details-container">
                        <div className="price-delta" style={{ color: isDrop ? '#ff3b30' : '#34c759' }}>
                          {deltaDisplay}
                        </div>
                        <div className="price-was-now">
                          was £{alert.old_price.toFixed(2)} → <strong>now £{alert.new_price.toFixed(2)}</strong>
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
