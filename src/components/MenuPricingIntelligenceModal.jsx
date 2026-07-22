import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Sparkles, X } from 'lucide-react';
import { DeliverooIcon, UberEatsIcon, JustEatIcon } from './PlatformIcons';

const PRICING_STATES = {
  'Underpriced Items': {
    title: 'Underpriced Items',
    color: '#E86A58',
    items: [
      { name: 'Vegan Wrap', category: 'Wraps', price: '£5.50', image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=120&q=80', description: 'Market Average: £6.80. (£1.30 below market)', platform: 'Uber Eats' },
      { name: 'Avocado Toast', category: 'Breakfast', price: '£6.00', image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?auto=format&fit=crop&w=120&q=80', description: 'Market Average: £7.50. (£1.50 below market)', platform: 'Uber Eats' },
      { name: 'Milkshake', category: 'Drinks', price: '£3.20', image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=120&q=80', description: 'Market Average: £4.00. (£0.80 below market)', platform: 'JustEat' },
      { name: 'Classic Burger', category: 'Mains', price: '£7.50', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=120&q=80', description: 'Market Average: £8.90. (£1.40 below market)', platform: 'Deliveroo' },
      { name: 'Chicken Wings', category: 'Starters', price: '£4.50', image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&w=120&q=80', description: 'Market Average: £5.50. (£1.00 below market)', platform: 'Uber Eats' },
      { name: 'Onion Rings', category: 'Sides', price: '£2.50', image: 'https://images.unsplash.com/photo-1639024471283-03518883512d?auto=format&fit=crop&w=120&q=80', description: 'Market Average: £3.50. (£1.00 below market)', platform: 'JustEat' },
      { name: 'Margherita Pizza', category: 'Mains', price: '£8.00', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=120&q=80', description: 'Market Average: £10.00. (£2.00 below market)', platform: 'Deliveroo' }
    ]
  },
  'Stable Items': {
    title: 'Stable Items',
    color: '#10B981',
    items: [
      { name: 'Classic Cheeseburger', category: 'Mains', price: '£9.50', image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=120&q=80', description: 'Market Average: £9.50. (Matches market perfectly)', platform: 'Uber Eats' },
      { name: 'Spicy Chicken Sandwich', category: 'Mains', price: '£8.50', image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=120&q=80', description: 'Market Average: £8.60. (Matches market perfectly)', platform: 'Deliveroo' },
      { name: 'Caesar Salad', category: 'Salads', price: '£7.00', image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&w=120&q=80', description: 'Market Average: £7.10. (Matches market perfectly)', platform: 'Uber Eats' },
      { name: 'Pepperoni Pizza', category: 'Mains', price: '£12.00', image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=120&q=80', description: 'Market Average: £11.80. (Matches market perfectly)', platform: 'JustEat' },
      { name: 'Fries', category: 'Sides', price: '£3.00', image: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=120&q=80', description: 'Market Average: £3.00. (Matches market perfectly)', platform: 'Deliveroo' },
      { name: 'Garlic Bread', category: 'Sides', price: '£3.50', image: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?auto=format&fit=crop&w=120&q=80', description: 'Market Average: £3.60. (Matches market perfectly)', platform: 'Uber Eats' },
      { name: 'Fish and Chips', category: 'Mains', price: '£11.50', image: 'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?auto=format&fit=crop&w=120&q=80', description: 'Market Average: £11.50. (Matches market perfectly)', platform: 'Deliveroo' }
    ]
  },
  'Above Market Average': {
    title: 'Above Market Average',
    color: '#FF5E3A',
    items: [
      { name: 'Margherita Pizza', category: 'Mains', price: '£15.00', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=120&q=80', description: 'Market Average: £13.50. (£1.50 above market)', platform: 'Uber Eats' },
      { name: 'Cola Zero', category: 'Drinks', price: '£2.50', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=120&q=80', description: 'Market Average: £2.00. (£0.50 above market)', platform: 'Deliveroo' },
      { name: 'Truffle Fries', category: 'Sides', price: '£6.50', image: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=120&q=80', description: 'Market Average: £4.50. (£2.00 above market)', platform: 'Uber Eats' },
      { name: 'Sweet Potato Fries', category: 'Sides', price: '£5.50', image: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?auto=format&fit=crop&w=120&q=80', description: 'Market Average: £4.00. (£1.50 above market)', platform: 'Deliveroo' },
      { name: 'Premium Beef Burger', category: 'Mains', price: '£14.50', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=120&q=80', description: 'Market Average: £11.00. (£3.50 above market)', platform: 'JustEat' },
      { name: 'BBQ Ribs', category: 'Mains', price: '£18.00', image: 'https://images.unsplash.com/photo-1544025162-8111142154ea?auto=format&fit=crop&w=120&q=80', description: 'Market Average: £15.00. (£3.00 above market)', platform: 'Uber Eats' },
      { name: 'Steak and Ale Pie', category: 'Mains', price: '£16.50', image: 'https://images.unsplash.com/photo-1513442542250-854d436a73f2?auto=format&fit=crop&w=120&q=80', description: 'Market Average: £14.00. (£2.50 above market)', platform: 'Deliveroo' }
    ]
  }
};

const PlatformIconOnly = ({ platform }) => {
  const config = {
    deliveroo: { color: '#00CCBC', Icon: DeliverooIcon },
    ubereats: { color: '#06C167', Icon: UberEatsIcon },
    justeat: { color: '#FF8000', Icon: JustEatIcon },
  }[platform.toLowerCase().replace(/\s+/g, '')];

  if (!config) return null;
  const { color, Icon } = config;

  return <Icon color={color} size={14} style={{ flexShrink: 0 }} />;
};

const MenuPricingIntelligenceModal = ({ selectedCard, onClose, setSelectedItemDetails }) => {
  const [selectedPlatformFilter, setSelectedPlatformFilter] = useState('All');
  const [activeStateTitle, setActiveStateTitle] = useState(selectedCard?.title);

  useEffect(() => {
    if (selectedCard) {
      setActiveStateTitle(selectedCard.title);
    }
  }, [selectedCard]);

  if (!selectedCard) return null;

  const currentData = PRICING_STATES[activeStateTitle] || selectedCard;

  return ReactDOM.createPortal(
    <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 99999, background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="glass-panel modal-content" style={{ width: '1200px', maxWidth: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', background: '#FAF7F2', borderRadius: '24px', border: '1px solid #E5E7EB', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden' }}>
        
        {/* HEADER (FIXED) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2.5rem', borderBottom: '1px solid #E5E7EB', flexShrink: 0, background: '#FAF7F2' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={20} color="#10B981" />
              Menu Pricing Intelligence
            </h2>
            <p style={{ margin: '0.25rem 0 0 0', color: '#6B7280', fontSize: '0.9rem' }}>Global breakdown of your pricing strategy</p>
          </div>

          <button onClick={onClose} style={{ width: '44px', height: '44px', borderRadius: '12px', border: 'none', background: 'rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s, transform 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'scale(1.05)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'scale(1)'; }}>
            <X size={20} color="#6B7280" />
          </button>
        </div>

        {/* MAIN BODY (FLEX ROW) */}
        <div style={{ flex: 1, overflow: 'hidden', padding: '1.25rem 2.5rem', display: 'flex', flexDirection: 'row', gap: '2rem' }}>
          
          {/* LEFT PANEL: MATRIX */}
          <div className="hide-scrollbar" style={{ width: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', paddingRight: '0.5rem' }}>
            {['Mains', 'Sides', 'Drinks'].map(cat => {
              // Calculate GLOBAL static stats for the matrix
              const underpricedCount = cat === 'Mains' ? 3 : cat === 'Sides' ? 1 : 0;
              const overpricedCount = cat === 'Mains' ? 2 : cat === 'Drinks' ? 1 : 0;
              const avgGap = cat === 'Mains' ? '+1%' : cat === 'Sides' ? '-5%' : '+8%';
              const gapColor = avgGap.startsWith('+') ? '#E86A58' : '#10B981';

              return (
                <div key={cat} style={{ background: '#FFFFFF', borderRadius: '12px', padding: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', border: '1px solid #F3F4F6' }}>
                  <h5 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#6B7280', margin: '0 0 1rem 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{cat} Matrix</h5>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.85rem', color: '#374151', fontWeight: 500 }}>Underpriced</span>
                    <span style={{ fontSize: '0.85rem', color: '#E86A58', fontWeight: 800 }}>{underpricedCount} items</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.85rem', color: '#374151', fontWeight: 500 }}>Overpriced</span>
                    <span style={{ fontSize: '0.85rem', color: '#E86A58', fontWeight: 800 }}>{overpricedCount} items</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid #F3F4F6' }}>
                    <span style={{ fontSize: '0.85rem', color: '#111827', fontWeight: 800 }}>Avg Gap</span>
                    <span style={{ fontSize: '0.85rem', color: gapColor, fontWeight: 800 }}>{avgGap}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT PANEL: ITEMS & FILTERS */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', gap: '1rem' }}>
            
            {/* FILTER BAR SECTION */}
            <div style={{ display: 'flex', justifyContent: 'flex-start', margin: '0 0 0.25rem 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', background: '#F3F4F6', padding: '0.25rem', borderRadius: '14px', border: '1px solid #E5E7EB', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
                
                {/* PLATFORM SELECTOR (LEFT) */}
                <div style={{ display: 'flex', gap: '0.25rem', padding: '0.125rem' }}>
                  {[
                    { id: 'All', label: 'All', color: '#111827', Icon: null },
                    { id: 'Deliveroo', label: 'Deliveroo', color: '#00CCBC', Icon: DeliverooIcon },
                    { id: 'UberEats', label: 'UberEats', color: '#06C167', Icon: UberEatsIcon },
                    { id: 'JustEat', label: 'Just Eat', color: '#F36D00', Icon: JustEatIcon }
                  ].map(platform => {
                    const isActive = selectedPlatformFilter === platform.id;
                    return (
                      <button
                        key={platform.id}
                        onClick={() => setSelectedPlatformFilter(platform.id)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          height: '36px', width: platform.id === 'All' ? 'auto' : '40px',
                          padding: platform.id === 'All' ? '0 1.25rem' : '0',
                          borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700,
                          transition: 'all 0.2s',
                          background: isActive ? '#FFFFFF' : 'transparent',
                          color: isActive ? platform.color : '#6B7280',
                          boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                          border: isActive ? '1px solid #E5E7EB' : '1px solid transparent', cursor: 'pointer'
                        }}
                      >
                        {platform.Icon && (
                          <platform.Icon 
                            color={isActive ? platform.color : '#9CA3AF'}
                            size={18} 
                            style={{ flexShrink: 0 }}
                          />
                        )}
                        {platform.id === 'All' && platform.label}
                      </button>
                    );
                  })}
                </div>

                {/* DIVIDER */}
                <div style={{ width: '1px', height: '24px', background: '#D1D5DB', margin: '0 0.5rem' }}></div>

                {/* ITEM STATUS FILTERS (RIGHT) */}
                <div style={{ display: 'inline-flex', gap: '0.25rem', padding: '0.125rem' }}>
                  {['Underpriced Items', 'Stable Items', 'Above Market Average'].map(title => {
                    const isActive = activeStateTitle === title;
                    const tabColor = PRICING_STATES[title].color;
                    return (
                      <button
                        key={title}
                        onClick={() => setActiveStateTitle(title)}
                        style={{
                          height: '36px', padding: '0 1.25rem', borderRadius: '10px',
                          background: isActive ? '#FFFFFF' : 'transparent',
                          color: isActive ? '#111827' : '#6B7280',
                          fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: '0.5rem',
                          boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                          border: isActive ? '1px solid #E5E7EB' : '1px solid transparent',
                          transition: 'all 0.2s', whiteSpace: 'nowrap'
                        }}
                      >
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: tabColor }}></span>
                        {title.replace(' Items', '')}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* SECTION 3: ITEM CARD BREAKDOWN */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '1.5rem', flex: 1, overflow: 'hidden' }}>
              {['Mains', 'Sides', 'Drinks'].map(category => {
                const categoryItems = currentData.items.filter(i => {
                  const matchCategory = i.category === category;
                  const matchPlatform = selectedPlatformFilter === 'All' ? true : (i.platform === selectedPlatformFilter || i.platform.replace(' ', '') === selectedPlatformFilter);
                  return matchCategory && matchPlatform;
                });
                
                return (
                  <div key={category} className="hide-scrollbar" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto', paddingRight: '0.5rem' }}>
                    <div style={{ position: 'sticky', top: 0, zIndex: 10, background: '#FAF7F2', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', paddingBottom: '0.5rem', paddingTop: '0.25rem', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                      <h4 className="font-sans" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#374151', margin: 0, fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}>{category}</h4>
                      <div style={{ background: 'rgba(0,0,0,0.05)', color: '#6B7280', fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px', fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}>
                        {categoryItems.length}
                      </div>
                    </div>
                    
                    {categoryItems.length === 0 ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100px', color: '#9CA3AF', fontSize: '0.9rem', opacity: 0.6, fontWeight: 500, fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}>
                        [ ∅ 0 items ]
                      </div>
                    ) : (
                      categoryItems.map((item, i) => {
                        let varianceText = item.description || '';
                        if (varianceText.includes('below market')) {
                          varianceText = varianceText.replace('Market Average: ', 'Market Avg: ').replace('. (', ' | ↓ ').replace(' below market)', '');
                        } else if (varianceText.includes('above market')) {
                          varianceText = varianceText.replace('Market Average: ', 'Market Avg: ').replace('. (', ' | ↑ ').replace(' above market)', '');
                        } else if (varianceText.includes('Matches market perfectly')) {
                          varianceText = varianceText.replace('Market Average: ', 'Market Avg: ').replace('. (Matches market perfectly)', ' | =');
                        }
                        
                        const platformKey = item.platform === 'Just Eat' || item.platform === 'JustEat' ? 'justeat' : item.platform.toLowerCase().replace(' ', '');
                        
                        return (
                          <div key={i} onClick={() => setSelectedItemDetails && setSelectedItemDetails(item)} style={{ display: 'flex', gap: '1rem', background: '#FFFFFF', borderRadius: '12px', padding: '0.75rem', border: '1px solid #F3F4F6', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', alignItems: 'center', cursor: 'pointer', transition: 'transform 0.1s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                            <img src={item.image} alt={item.name} style={{ width: '64px', height: '64px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', overflow: 'hidden' }}>
                                  <PlatformIconOnly platform={platformKey} />
                                  <h4 className="font-sans" style={{ fontSize: '0.95rem', fontWeight: 500, color: '#111', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}>{item.name}</h4>
                                </div>
                                <span className="font-sans" style={{ fontSize: '0.95rem', fontWeight: 400, color: '#374151', flexShrink: 0, marginLeft: '0.5rem', fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}>{item.price || '£--'}</span>
                              </div>
                              <p className="font-sans" style={{ color: '#6B7280', fontSize: '0.75rem', margin: '0.25rem 0 0 0', lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}>
                                {varianceText}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default MenuPricingIntelligenceModal;
