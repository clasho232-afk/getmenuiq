import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { X, Store, Tag, UtensilsCrossed, Star } from 'lucide-react';
import { COMPETITOR_POOL, MENU_ITEMS_POOL, PROMO_FEED } from './MarketZoneModal';

const WatchlistModal = ({ isOpen, onClose }) => {
  const [watchlistIds, setWatchlistIds] = useState([]);
  const [activeTab, setActiveTab] = useState('Competitors');

  useEffect(() => {
    if (!isOpen) return;
    const fetchWatchlist = () => {
      try {
        const wl = JSON.parse(localStorage.getItem('menuiq_watchlist') || '[]');
        setWatchlistIds(wl);
      } catch {
        setWatchlistIds([]);
      }
    };
    fetchWatchlist();
    window.addEventListener('watchlist-updated', fetchWatchlist);
    window.addEventListener('storage', fetchWatchlist);
    return () => {
      window.removeEventListener('watchlist-updated', fetchWatchlist);
      window.removeEventListener('storage', fetchWatchlist);
    };
  }, [isOpen]);

  const removeStar = (id) => {
    try {
      const wl = JSON.parse(localStorage.getItem('menuiq_watchlist') || '[]');
      const newWl = wl.filter(x => x !== id);
      localStorage.setItem('menuiq_watchlist', JSON.stringify(newWl));
      setWatchlistIds(newWl);
      window.dispatchEvent(new Event('watchlist-updated'));
    } catch {}
  };

  const { competitors, promos, menuItems } = useMemo(() => {
    const comps = [];
    const proms = [];
    const items = [];

    watchlistIds.forEach(id => {
      if (typeof id === 'number') {
        const comp = COMPETITOR_POOL.find(c => c.id === id);
        if (comp) comps.push(comp);
      } else if (typeof id === 'string' && id.startsWith('promo_')) {
        const pId = parseInt(id.replace('promo_', ''), 10);
        const promo = PROMO_FEED.find(p => p.id === pId);
        if (promo) proms.push(promo);
      } else if (typeof id === 'string' && id.startsWith('menu_item_')) {
        const mId = id.replace('menu_item_', '');
        const item = MENU_ITEMS_POOL.find(m => m.id === mId);
        if (item) {
          const comp = COMPETITOR_POOL.find(c => c.id === item.restaurantId);
          items.push({ ...item, competitorName: comp?.name || 'Unknown' });
        }
      }
    });

    return { competitors: comps, promos: proms, menuItems: items };
  }, [watchlistIds]);

  if (!isOpen) return null;

  const tabs = [
    { id: 'Competitors', Icon: Store, count: competitors.length },
    { id: 'Promotions', Icon: Tag, count: promos.length },
    { id: 'Menu Items', Icon: UtensilsCrossed, count: menuItems.length },
  ];

  const getListToRender = () => {
    if (activeTab === 'Competitors') return competitors;
    if (activeTab === 'Promotions') return promos;
    return menuItems;
  };

  const list = getListToRender();

  return ReactDOM.createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Backdrop */}
      <div 
        style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }} 
        onClick={onClose}
      />

      <div style={{
        position: 'relative',
        zIndex: 1,
        width: 'min(90vw, 700px)',
        height: 'min(85vh, 650px)',
        backgroundColor: '#fff',
        borderRadius: '20px',
        boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Star size={18} fill="#F59E0B" color="#D97706" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>My Watchlist</h2>
              <p style={{ margin: 0, fontSize: '11px', fontWeight: 600, color: '#6B7280' }}>Saved Insights & Competitors</p>
            </div>
          </div>
          <button onClick={onClose} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #E5E7EB', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={16} color="#6B7280" />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid #F3F4F6', display: 'flex', gap: '8px' }}>
          {tabs.map(({ id, Icon, count }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                border: 'none',
                fontFamily: 'inherit',
                fontSize: '12px',
                fontWeight: 700,
                backgroundColor: activeTab === id ? '#F3F4F6' : 'transparent',
                color: activeTab === id ? '#111827' : '#6B7280',
                transition: 'all 0.2s',
              }}
            >
              <Icon size={14} />
              {id}
              <span style={{ backgroundColor: activeTab === id ? '#E5E7EB' : '#F3F4F6', color: activeTab === id ? '#111' : '#9CA3AF', padding: '1px 6px', borderRadius: '99px', fontSize: '10px' }}>
                {count}
              </span>
            </button>
          ))}
        </div>

        {/* Content List */}
        <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#F9FAFB', padding: '16px 20px' }}>
          {list.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '10px' }}>
              <Star size={32} color="#E5E7EB" />
              <p style={{ fontSize: '13px', color: '#9CA3AF', margin: 0, fontWeight: 500 }}>No saved {activeTab.toLowerCase()} yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {list.map((item, idx) => {
                let identifier, title, subtitle, badge;
                if (activeTab === 'Competitors') {
                  identifier = item.id;
                  title = item.name;
                  subtitle = `${item.platforms.join(', ')} • ${item.rating}★`;
                } else if (activeTab === 'Promotions') {
                  identifier = `promo_${item.id}`;
                  title = item.promo;
                  subtitle = item.restaurant;
                  badge = item.type;
                } else {
                  identifier = `menu_item_${item.id}`;
                  title = item.name;
                  subtitle = `${item.competitorName} • £${item.price.toFixed(2)}`;
                  badge = item.category;
                }

                return (
                  <div key={idx} style={{ backgroundColor: '#fff', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>{title}</span>
                      <span style={{ fontSize: '11px', color: '#6B7280', fontWeight: 500 }}>{subtitle}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {badge && (
                        <span style={{ fontSize: '9px', fontWeight: 700, color: '#6366F1', backgroundColor: '#EEF2FF', padding: '2px 6px', borderRadius: '4px' }}>
                          {badge}
                        </span>
                      )}
                      <button 
                        onClick={() => removeStar(identifier)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
                        title="Remove from Watchlist"
                      >
                        <Star size={16} fill="#F59E0B" color="#D97706" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default WatchlistModal;
