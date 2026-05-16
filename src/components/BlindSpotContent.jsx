import React, { useState } from 'react';
import { EyeOff, Target, Plus, X, TrendingUp, Search, Info, ChevronDown, Filter } from 'lucide-react';

const mockBlindSpots = [
  {
    id: 1,
    type: 'blindSpot',
    name: 'Chocolate Lava Cake',
    category: 'Desserts',
    saturation: 4,
    totalRivals: 8,
    avgPrice: '5.50',
    minPrice: '4.99',
    maxPrice: '6.25',
    isTrending: false,
    difficulty: 'Easy',
    difficultyReason: 'You already stock chocolate and baking supplies — minimal new inventory required.',
    aiSuggestion: 'Pizza Express charges £6.25 for their lava cake. You can add a locally-sourced version for £5.50 to capture dessert upsells on Friday and Saturday nights.',
    image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?auto=format&fit=crop&w=500&q=80',
    rivals: [
      { name: 'Burger King', price: '4.99', platform: 'UberEats, Deliveroo', image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=50&q=80' },
      { name: 'Five Guys', price: '5.50', platform: 'Deliveroo', image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=50&q=80' },
      { name: 'Pizza Express', price: '6.25', platform: 'UberEats, Just Eat', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=50&q=80' },
      { name: 'Local Diner', price: '5.20', platform: 'UberEats', image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=50&q=80' }
    ]
  },
  {
    id: 2,
    type: 'blindSpot',
    name: 'Sweet Potato Fries',
    category: 'Sides',
    saturation: 6,
    totalRivals: 8,
    avgPrice: '4.20',
    minPrice: '3.99',
    maxPrice: '4.50',
    isTrending: true,
    difficulty: 'Easy',
    difficultyReason: 'You already sell regular fries — adding a sweet potato option uses the same fryers and packaging.',
    aiSuggestion: 'Burger King and Five Guys both offer sweet potato fries around £4.00. This is a highly requested premium side that commands a 30% higher margin than regular fries.',
    image: 'https://images.unsplash.com/photo-1576107246282-e304918eebdf?auto=format&fit=crop&w=500&q=80',
    rivals: [
      { name: 'Premium Vegan', price: '4.50', platform: 'Deliveroo', image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=50&q=80' },
      { name: 'Burger King', price: '3.99', platform: 'UberEats, Deliveroo', image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=50&q=80' },
      { name: 'Five Guys', price: '4.20', platform: 'Deliveroo', image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=50&q=80' },
      { name: 'Chicken Shop', price: '4.00', platform: 'UberEats, Just Eat', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=50&q=80' }
    ]
  },
  {
    id: 3,
    type: 'blindSpot',
    name: 'Spicy Cheese Bites',
    category: 'Sides',
    saturation: 3,
    totalRivals: 8,
    avgPrice: '3.80',
    minPrice: '3.40',
    maxPrice: '4.50',
    isTrending: true,
    difficulty: 'Medium',
    difficultyReason: 'Requires sourcing a new frozen item, but preparation is simple.',
    aiSuggestion: 'Pizza Express charges £4.50 for their cheese bites. Adding a spicy jalapeño version at £3.99 would undercut them while offering a bold flavor profile.',
    image: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=500&q=80',
    rivals: [
      { name: 'Burger King', price: '3.50', platform: 'UberEats, Deliveroo', image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=50&q=80' },
      { name: 'Pizza Express', price: '4.50', platform: 'UberEats, Just Eat', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=50&q=80' },
      { name: 'Local Diner', price: '3.40', platform: 'UberEats', image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=50&q=80' }
    ]
  }
];

const BlindSpotContent = () => {
  const [activeItem, setActiveItem] = useState(null);
  const [addedItems, setAddedItems] = useState([]);
  const [dismissedItems, setDismissedItems] = useState([]);
  const [showDismissed, setShowDismissed] = useState(false);
  const [sortOrder, setSortOrder] = useState('rivalsDesc'); // rivalsDesc, priceDesc, trending
  const [activeCategory, setActiveCategory] = useState('All');
  
  // Base available items
  let baseSpots = mockBlindSpots.filter(item => !addedItems.includes(item.id));
  
  // Calculate score BEFORE filtering for dismissed
  const unaddressedCount = baseSpots.filter(i => !dismissedItems.includes(i.id)).length;
  const varietyScore = Math.max(0, 100 - (unaddressedCount * 5));

  // Determine categories available
  const availableCategories = ['All', 'Trending', ...Array.from(new Set(baseSpots.map(item => item.category)))];

  // Filter based on category and dismissed state
  let filteredSpots = baseSpots.filter(item => {
    if (!showDismissed && dismissedItems.includes(item.id)) return false;
    if (activeCategory === 'Trending') return item.isTrending;
    if (activeCategory !== 'All' && item.category !== activeCategory) return false;
    return true;
  });

  // Sort logic
  filteredSpots.sort((a, b) => {
    if (sortOrder === 'rivalsDesc') return b.saturation - a.saturation;
    if (sortOrder === 'priceDesc') return parseFloat(b.avgPrice) - parseFloat(a.avgPrice);
    if (sortOrder === 'trending') return (b.isTrending === a.isTrending) ? (b.saturation - a.saturation) : (b.isTrending ? 1 : -1);
    return 0;
  });

  const handleAddMenu = (item) => {
    setAddedItems([...addedItems, item.id]);
    setActiveItem(null);
  };

  const handleDismiss = (id, e) => {
    if(e) e.stopPropagation();
    if(window.confirm('Hide this item from your blind spots?')) {
      setDismissedItems([...dismissedItems, id]);
    }
  };

  return (
    <div style={{ padding: '0 1rem', width: '100%', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontFamily: 'Playfair Display, serif', fontWeight: 700, color: '#111', margin: '0 0 0.5rem 0' }}>Blind Spot</h1>
          <p style={{ color: '#6B7280', fontSize: '1.05rem', margin: 0, fontWeight: 500 }}>Market intelligence and strategic expansion opportunities.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: '9999px', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', position: 'relative' }} title="Based on blind spot items you haven't yet addressed.">
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#4B5563', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>Menu Variety Score <Info size={14} color="#9CA3AF" /></span>
            <span style={{ fontSize: '1rem', fontWeight: 700, color: '#10B981' }}>{varietyScore}/100</span>
          </div>
        </div>
      </div>

      {/* Blind Spot Card */}
      <div style={{ 
        background: 'rgba(255, 255, 255, 0.65)', 
        backdropFilter: 'blur(16px)', 
        border: '1px solid rgba(255, 255, 255, 0.4)', 
        borderRadius: '24px', 
        padding: '2.5rem', 
        boxShadow: '0 10px 40px -10px rgba(59, 130, 246, 0.15)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Icy Glow Effect */}
        <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '30%', height: '50%', background: 'radial-gradient(circle, rgba(147,197,253,0.3) 0%, rgba(255,255,255,0) 70%)', filter: 'blur(40px)', zIndex: 0, pointerEvents: 'none' }}></div>
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ background: '#EFF6FF', color: '#3B82F6', padding: '0.75rem', borderRadius: '12px' }}>
                <EyeOff size={24} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'Playfair Display, serif', margin: '0 0 0.25rem 0', color: '#111' }}>The Blind Spot</h2>
                <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>Market Consensus Discovery — Untapped Revenue Streams</div>
              </div>
            </div>

            {/* Sort Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '9999px', padding: '0.5rem 1rem' }}>
              <Filter size={14} color="#6B7280" />
              <select 
                value={sortOrder} 
                onChange={(e) => setSortOrder(e.target.value)}
                style={{ border: 'none', background: 'transparent', fontSize: '0.875rem', fontWeight: 600, color: '#111', cursor: 'pointer', outline: 'none' }}
              >
                <option value="rivalsDesc">Most rivals selling</option>
                <option value="priceDesc">Avg market price (High-Low)</option>
                <option value="trending">Recently trending</option>
              </select>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {availableCategories.map(cat => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{ 
                  padding: '0.5rem 1rem', 
                  borderRadius: '9999px', 
                  border: '1px solid',
                  borderColor: activeCategory === cat ? '#111' : 'rgba(0,0,0,0.08)',
                  background: activeCategory === cat ? '#111' : '#fff',
                  color: activeCategory === cat ? '#fff' : '#4B5563',
                  fontSize: '0.875rem', 
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                {cat === 'Trending' && <TrendingUp size={14} color={activeCategory === cat ? '#fff' : '#e05046'} />}
                {cat}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredSpots.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', background: 'rgba(255,255,255,0.5)', borderRadius: '16px' }}>
                <TrendingUp size={32} color="#10B981" style={{ margin: '0 auto 1rem auto' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111', margin: '0 0 0.5rem 0' }}>{showDismissed ? 'No dismissed items' : 'Market fully covered!'}</h3>
                <p style={{ color: '#6B7280', margin: 0 }}>{showDismissed ? 'You haven\'t dismissed any blind spot recommendations.' : 'You are offering all high-demand consensus items matching your filters.'}</p>
              </div>
            ) : filteredSpots.map(item => (
              <div key={item.id} style={{ 
                background: '#fff', 
                borderRadius: '16px', 
                padding: '1.5rem 2rem', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                border: '1px solid rgba(0,0,0,0.03)',
                boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                position: 'relative'
              }}
              className="blindspot-row"
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.05)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.02)'; }}
              >
                {/* Dismiss Button (Top Right) */}
                <button 
                  onClick={(e) => handleDismiss(item.id, e)}
                  style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: '#9CA3AF', cursor: 'pointer', padding: '0.25rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.25rem', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.background = '#FEF2F2'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#9CA3AF'; e.currentTarget.style.background = 'transparent'; }}
                  title="Not for us"
                >
                  <X size={14} /> <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>Dismiss</span>
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
                    <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '1.25rem', fontFamily: 'Playfair Display, serif', fontWeight: 700, color: '#111', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {item.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem', flexWrap: 'wrap' }}>
                      <span style={{ color: '#EF4444', fontWeight: 600, background: '#FEF2F2', padding: '0.25rem 0.5rem', borderRadius: '6px' }}>Missing from your menu</span>
                      {item.isTrending && (
                        <span style={{ color: '#e05046', fontWeight: 700, background: 'rgba(224,80,70,0.1)', padding: '0.25rem 0.5rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <TrendingUp size={12} /> Trending
                        </span>
                      )}
                      <span style={{ color: '#6B7280' }}>Sold by {item.saturation}/{item.totalRivals} local rivals</span>
                      <span style={{ 
                        color: item.difficulty === 'Easy' ? '#10B981' : item.difficulty === 'Medium' ? '#F59E0B' : '#6B7280', 
                        fontWeight: 600, 
                        background: item.difficulty === 'Easy' ? '#ECFDF5' : item.difficulty === 'Medium' ? '#FFFBEB' : '#F3F4F6', 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '6px' 
                      }}>
                        {item.difficulty}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '3rem', paddingRight: '4rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px', marginBottom: '0.25rem' }}>Avg Market Price</div>
                    <div style={{ fontSize: '1.5rem', fontFamily: 'Playfair Display, serif', fontWeight: 700, color: '#3B82F6' }}>£{item.avgPrice}</div>
                  </div>
                  <button 
                    onClick={() => setActiveItem(item)}
                    style={{ background: '#111', color: '#fff', padding: '0.875rem 1.5rem', borderRadius: '9999px', fontSize: '0.9rem', fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'background 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#333'}
                    onMouseLeave={e => e.currentTarget.style.background = '#111'}
                  >
                    <Search size={16} /> Explore Potential
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Show Dismissed Toggle */}
          {dismissedItems.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
              <button 
                onClick={() => setShowDismissed(!showDismissed)}
                style={{ background: 'transparent', border: 'none', color: '#6B7280', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
              >
                {showDismissed ? 'Hide dismissed items' : `Show dismissed items (${dismissedItems.length})`}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Explore Potential Modal */}
      {activeItem && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }} onClick={() => setActiveItem(null)}>
          <div style={{ background: '#fff', borderRadius: '24px', width: '95%', maxWidth: '1400px', height: '640px', display: 'flex', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', animation: 'modalFadeIn 0.3s ease-out' }} onClick={e => e.stopPropagation()}>
            
            <div style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem', height: '100%', overflowY: 'auto' }}>
              
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <img src={activeItem.image} alt={activeItem.name} style={{ width: '80px', height: '80px', borderRadius: '16px', objectFit: 'cover', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} />
                  <div>
                    <h2 style={{ fontSize: '2rem', fontFamily: 'Playfair Display, serif', fontWeight: 700, color: '#111', margin: '0 0 0.25rem 0' }}>{activeItem.name}</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem' }}>
                      <span style={{ color: '#EF4444', fontWeight: 600, background: '#FEF2F2', padding: '0.25rem 0.5rem', borderRadius: '6px' }}>Missing from {activeItem.category}</span>
                      <span style={{ color: '#6B7280' }}>Sold by {activeItem.saturation}/{activeItem.totalRivals} local rivals</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setActiveItem(null)} style={{ background: '#F3F4F6', border: 'none', cursor: 'pointer', color: '#4B5563', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#E5E7EB'} onMouseLeave={e => e.currentTarget.style.background = '#F3F4F6'}><X size={18} /></button>
              </div>

              <div style={{ display: 'flex', gap: '2.5rem', flex: 1 }}>
                
                {/* Left Column - Rivals */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#111', marginBottom: '1rem' }}>Who sells it</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto', paddingRight: '0.5rem' }}>
                    {activeItem.rivals.map((rival, idx) => (
                      <div key={idx} style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <img src={rival.image} alt={rival.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                          <div>
                            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#111', display: 'block' }}>{rival.name}</span>
                            <span style={{ fontSize: '0.7rem', color: '#6B7280', display: 'block', marginTop: '0.1rem' }}>{rival.platform}</span>
                            <a href="#" style={{ fontSize: '0.7rem', color: '#3B82F6', textDecoration: 'none', fontWeight: 500, display: 'block', marginTop: '0.2rem' }}>View competitor →</a>
                          </div>
                        </div>
                        <span style={{ fontSize: '1.125rem', fontFamily: 'Playfair Display, serif', color: '#111', fontWeight: 700 }}>£{rival.price}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column - Insights */}
                <div style={{ flex: 1.2, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  
                  {/* Price Range */}
                  <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#111', marginBottom: '1rem' }}>Price range</h3>
                    <div style={{ background: '#F8FAFC', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <div style={{ textAlign: 'left' }}>
                          <span style={{ fontSize: '0.7rem', color: '#6B7280', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Cheapest</span>
                          <span style={{ fontSize: '1rem', fontWeight: 700, color: '#111' }}>£{activeItem.minPrice}</span>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <span style={{ fontSize: '0.7rem', color: '#3B82F6', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Market Average</span>
                          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#3B82F6' }}>£{activeItem.avgPrice}</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.7rem', color: '#6B7280', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Most Expensive</span>
                          <span style={{ fontSize: '1rem', fontWeight: 700, color: '#111' }}>£{activeItem.maxPrice}</span>
                        </div>
                      </div>
                      
                      <div style={{ position: 'relative', height: '8px', background: 'rgba(0,0,0,0.06)', borderRadius: '4px', marginTop: '1rem' }}>
                        <div style={{ position: 'absolute', left: '0%', width: '100%', height: '100%', background: 'linear-gradient(90deg, rgba(59,130,246,0.2) 0%, rgba(59,130,246,0.6) 50%, rgba(59,130,246,0.2) 100%)', borderRadius: '4px' }}></div>
                        {/* Avg Marker */}
                        <div style={{ position: 'absolute', left: '50%', top: '-6px', width: '4px', height: '20px', background: '#3B82F6', borderRadius: '2px', transform: 'translateX(-50%)', boxShadow: '0 0 0 3px #F8FAFC' }}></div>
                      </div>
                    </div>
                  </div>

                  {/* AI Suggestion */}
                  <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#111', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Target size={16} color="#10B981" /> AI Suggestion
                    </h3>
                    <div style={{ background: 'rgba(16,185,129,0.05)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(16,185,129,0.1)' }}>
                      <p style={{ fontSize: '0.9rem', color: '#064E3B', lineHeight: 1.6, margin: 0 }}>
                        {activeItem.aiSuggestion}
                      </p>
                    </div>
                  </div>

                  {/* Difficulty */}
                  <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#111', marginBottom: '0.75rem' }}>Implementation</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                      <span style={{ 
                        color: activeItem.difficulty === 'Easy' ? '#10B981' : activeItem.difficulty === 'Medium' ? '#F59E0B' : '#6B7280', 
                        fontWeight: 700, 
                        background: activeItem.difficulty === 'Easy' ? '#ECFDF5' : activeItem.difficulty === 'Medium' ? '#FFFBEB' : '#F3F4F6', 
                        padding: '0.35rem 0.75rem', 
                        borderRadius: '6px',
                        fontSize: '0.85rem'
                      }}>
                        {activeItem.difficulty}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#6B7280', margin: 0 }}>
                      {activeItem.difficultyReason}
                    </p>
                  </div>

                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(0,0,0,0.05)', marginTop: 'auto' }}>
                <button 
                  onClick={() => setActiveItem(null)}
                  style={{ background: 'transparent', color: '#4B5563', padding: '0.75rem 1.5rem', borderRadius: '9999px', fontSize: '0.9rem', fontWeight: 600, border: 'none', cursor: 'pointer' }}
                >
                  Close
                </button>
                <button 
                  onClick={() => {
                    handleDismiss(activeItem.id);
                    setActiveItem(null);
                  }}
                  style={{ background: '#FEE2E2', color: '#EF4444', padding: '0.75rem 1.5rem', borderRadius: '9999px', fontSize: '0.9rem', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#FECACA'}
                  onMouseLeave={e => e.currentTarget.style.background = '#FEE2E2'}
                >
                  Dismiss this item
                </button>
                <button 
                  onClick={() => handleAddMenu(activeItem)}
                  style={{ background: '#111', color: '#fff', padding: '0.75rem 2rem', borderRadius: '9999px', fontSize: '0.9rem', fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#333'}
                  onMouseLeave={e => e.currentTarget.style.background = '#111'}
                >
                  <Plus size={16} /> Add to my menu
                </button>
              </div>

            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default BlindSpotContent;
