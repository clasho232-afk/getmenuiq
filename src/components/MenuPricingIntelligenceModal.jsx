import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, ChevronDown, Star } from 'lucide-react';
import { DeliverooIcon, UberEatsIcon, JustEatIcon } from './PlatformIcons';

export const PRICING_STATES = {
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
  'Overpriced Items': {
    title: 'Overpriced Items',
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

const PlatformIconOnly = ({ platform, size = 14 }) => {
  const config = {
    deliveroo: { color: '#00CCBC', Icon: DeliverooIcon },
    ubereats: { color: '#06C167', Icon: UberEatsIcon },
    justeat: { color: '#FF8000', Icon: JustEatIcon },
  }[platform.toLowerCase().replace(/\s+/g, '')];

  if (!config) return null;
  const { color, Icon } = config;

  return <Icon color={color} size={size} style={{ flexShrink: 0 }} />;
};

const DropdownMenu = ({ value, options, onChange, badgeColor }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          height: '32px', padding: '0 0.75rem', borderRadius: '16px',
          background: isOpen ? '#F3F4F6' : 'transparent',
          border: 'none', color: '#374151',
          fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
          transition: 'background 0.2s', boxSizing: 'border-box', whiteSpace: 'nowrap'
        }}
        onMouseEnter={(e) => { if (!isOpen) e.currentTarget.style.background = '#F9FAFB'; }}
        onMouseLeave={(e) => { if (!isOpen) e.currentTarget.style.background = 'transparent'; }}
      >
        <span style={{ color: badgeColor || '#111827', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '85px' }}>{value}</span>
        <ChevronDown size={16} color="#9CA3AF" style={{ marginLeft: '0.1rem', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', display: 'block', flexShrink: 0 }} />
      </button>
      
      {isOpen && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setIsOpen(false)}></div>
          <div style={{
            position: 'absolute', top: 'calc(100% + 0.5rem)', right: 0,
            background: '#FFFFFF', borderRadius: '12px', padding: '0.5rem',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
            border: '1px solid #E5E7EB', zIndex: 20, minWidth: '180px',
            display: 'flex', flexDirection: 'column', gap: '0.25rem'
          }}>
            {options.map((opt, i) => (
              <button
                key={i}
                onClick={() => { onChange(opt.id); setIsOpen(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px',
                  background: 'transparent', border: 'none',
                  fontSize: '0.85rem', fontWeight: 500, color: '#374151',
                  cursor: 'pointer', textAlign: 'left'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#F3F4F6'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const FocalScrollView = ({ item, onBack, onClose, activeStateTitle, selectedPlatforms }) => {
  const basePrice = parseFloat(item.price.replace('£', '')) || 10;
  
  // Generate a large array of 15 items spread across territories, filtered by selected platforms
  const generateItems = () => {
    const arr = [];
    const activePlatforms = selectedPlatforms.map(p => p === 'UberEats' ? 'Uber Eats' : p === 'JustEat' ? 'Just Eat' : p);
    // Fallback if none selected
    if (activePlatforms.length === 0) activePlatforms.push('Deliveroo');
    
    const mockRestaurants = ['Pizza Express', 'Franco Manca', "Domino's Pizza", 'Gourmet Burger Kitchen', 'Honest Burgers', 'Nando\'s', 'Wagamama', 'Local Eatery', 'Street Food Co'];

    // Underpriced (-£4 to -£1)
    for (let i = 0; i < 5; i++) {
       const diff = -4 + (i * 0.6);
       arr.push({ id: `under_${i}`, name: item.name, restaurant: mockRestaurants[i % mockRestaurants.length], platform: activePlatforms[i % activePlatforms.length], price: '£' + (basePrice + diff).toFixed(2), image: item.image, state: 'Underpriced', diff: `${diff < 0 ? '-' : '+'}£${Math.abs(diff).toFixed(2)}` });
    }
    // Stable (-£0.5 to +£0.5)
    for (let i = 0; i < 5; i++) {
       const diff = -0.5 + (i * 0.25);
       arr.push({ id: `stable_${i}`, name: item.name, restaurant: mockRestaurants[(i+5) % mockRestaurants.length], platform: activePlatforms[i % activePlatforms.length], price: '£' + (basePrice + diff).toFixed(2), image: item.image, state: 'Stable', diff: `${diff < 0 ? '-' : '+'}£${Math.abs(diff).toFixed(2)}` });
    }
    // Overpriced (+£1 to +£4)
    for (let i = 0; i < 5; i++) {
       const diff = 1 + (i * 0.6);
       arr.push({ id: `over_${i}`, name: item.name, restaurant: mockRestaurants[(i+2) % mockRestaurants.length], platform: activePlatforms[i % activePlatforms.length], price: '£' + (basePrice + diff).toFixed(2), image: item.image, state: 'Overpriced', diff: `${diff < 0 ? '-' : '+'}£${Math.abs(diff).toFixed(2)}` });
    }
    // Sort strictly by price
    return arr.sort((a,b) => parseFloat(a.price.replace('£','')) - parseFloat(b.price.replace('£','')));
  };

  const items = React.useMemo(() => generateItems(), [item, selectedPlatforms]);
  const scrollRef = React.useRef(null);
  const [activeSegment, setActiveSegment] = useState('Stable');
  const [activeIndex, setActiveIndex] = useState(7); // Center element initially
  const [zoomLevel, setZoomLevel] = useState(100);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    
    // Find the horizontal center of the container viewport
    const centerPoint = container.scrollLeft + container.clientWidth / 2;
    
    let closestIndex = 0;
    let minDistance = Infinity;

    // Loop through all child cards to find which one is closest to the center
    Array.from(container.children).forEach((child, index) => {
      const childCenter = child.offsetLeft + child.offsetWidth / 2;
      const distance = Math.abs(childCenter - centerPoint);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    setActiveIndex(prev => {
      if (prev !== closestIndex) {
        if (items[closestIndex]) {
           setActiveSegment(items[closestIndex].state);
        }
        return closestIndex;
      }
      return prev;
    });
  };

  useEffect(() => {
    // Scroll to center initially
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = (scrollRef.current.scrollWidth - scrollRef.current.clientWidth) / 2;
      // Initialize state with center item
      handleScroll();
    }
  }, [items]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#FAF7F2' }}>
      
      {/* Unified Top Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem 2.5rem 0.75rem 2.5rem', zIndex: 100, flexShrink: 0 }}>
        
        {/* Left: Back to Grid */}
        <div style={{ width: '200px', display: 'flex', alignItems: 'center' }}>
          <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: '#6B7280', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', transition: 'color 0.2s', padding: '0' }} onMouseEnter={(e) => e.currentTarget.style.color = '#111827'} onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}>
             ← Back to Grid
          </button>
        </div>

        {/* Center: Dynamic Header */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '2.5rem', flex: 1 }}>
          {['Underpriced', 'Stable', 'Overpriced'].map(state => {
             const isActive = activeSegment === state;
             return (
               <span key={state} style={{ 
                 fontSize: isActive ? '1.25rem' : '0.85rem', 
                 fontWeight: isActive ? 800 : 600, 
                 color: isActive ? (state === 'Overpriced' ? '#FF5E3A' : state === 'Underpriced' ? '#F59E0B' : '#10B981') : '#9CA3AF', 
                 transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                 textTransform: 'uppercase',
                 letterSpacing: '0.05em'
               }}>
                 {state}
               </span>
             );
          })}
        </div>

        {/* Right: Zoom Control and Close Button */}
        <div style={{ width: '200px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#FFFFFF', padding: '0.25rem 0.75rem', borderRadius: '100px', border: '1px solid #E5E7EB', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#9CA3AF', letterSpacing: '0.05em' }}>ZOOM</span>
            <span style={{ fontSize: '1rem', fontWeight: 600, color: '#D1D5DB', marginLeft: '0.25rem' }}>-</span>
            <input 
              type="range" 
              min="75" 
              max="125" 
              value={zoomLevel} 
              onChange={(e) => setZoomLevel(e.target.value)}
              style={{ width: '70px', accentColor: '#111827', cursor: 'ew-resize' }}
            />
            <span style={{ fontSize: '1rem', fontWeight: 600, color: '#D1D5DB' }}>+</span>
          </div>

          <button onClick={onClose} style={{ width: '36px', height: '36px', borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s, transform 0.2s', flexShrink: 0, boxSizing: 'border-box' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'scale(1.05)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.05)'; e.currentTarget.style.transform = 'scale(1)'; }}>
            <X size={18} color="#6B7280" style={{ display: 'block' }} />
          </button>
        </div>

      </div>

      {/* Main Content (Cards only) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: '1.5rem' }}>
        
        {/* Custom scrollbar styling for the track */}
        <style>{`
          .focal-track-scroll::-webkit-scrollbar {
            height: 8px;
          }
          .focal-track-scroll::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.03);
            border-radius: 10px;
            margin: 0 4rem; /* Adds padding on the ends so the scrollbar doesn't hit the screen edges */
          }
          .focal-track-scroll::-webkit-scrollbar-thumb {
            background: rgba(0, 0, 0, 0.15);
            border-radius: 10px;
          }
          .focal-track-scroll::-webkit-scrollbar-thumb:hover {
            background: rgba(0, 0, 0, 0.25);
          }
        `}</style>

        {/* Free-scrolling track */}
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="focal-track-scroll"
          style={{ 
            flex: 1, /* Takes up all remaining vertical space, pinning the scrollbar to the bottom */
            display: 'flex', 
            alignItems: 'center', 
            overflowX: 'auto', 
            overflowY: 'hidden', 
            gap: '1.25rem', 
            padding: '1rem', /* Extra vertical padding to prevent transform clipping */
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {items.map((c, index) => {
            const isCritical = c.diff.startsWith('+') && parseFloat(c.diff.replace('+£', '')) >= 1.5;
            const isUnder = c.diff.startsWith('-');
            const isActiveCard = index === activeIndex;
            const territoryColor = c.state === 'Overpriced' ? '#FF5E3A' : c.state === 'Underpriced' ? '#F59E0B' : '#10B981';
            const territoryRgb = c.state === 'Overpriced' ? '255, 94, 58' : c.state === 'Underpriced' ? '245, 158, 11' : '16, 185, 129';
            
            const scale = zoomLevel / 100;

            return (
              <div 
                key={c.id} 
                style={{ 
                  minWidth: `${160 * scale}px`, 
                  height: `${280 * scale}px`,
                  fontSize: `${scale}rem`, /* Base font size scaling */
                  background: isActiveCard ? `rgba(${territoryRgb}, 0.05)` : '#FFFFFF', 
                  borderRadius: '16px', 
                  padding: `${1 * scale}rem`, 
                  boxShadow: isActiveCard ? `0 10px 15px -3px rgba(${territoryRgb}, 0.1), 0 4px 6px -2px rgba(${territoryRgb}, 0.05)` : '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)', 
                  border: isActiveCard ? `2px solid rgba(${territoryRgb}, 0.4)` : '1px solid #E5E7EB',
                  display: 'flex',
                  flexDirection: 'column',
                  flexShrink: 0,
                  position: 'relative',
                  transition: 'transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), border-color 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), background-color 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                  cursor: 'pointer',
                  transform: isActiveCard ? 'perspective(1000px) translateZ(0) scale(1.05)' : 'perspective(1000px) translateZ(0) scale(1)',
                  backfaceVisibility: 'hidden',
                  WebkitFontSmoothing: 'subpixel-antialiased',
                  willChange: 'transform',
                  zIndex: isActiveCard ? 10 : 1
                }}
                onClick={() => {
                  // Allow clicking a card to auto-scroll it to the center
                  if (scrollRef.current && scrollRef.current.children[index]) {
                     const container = scrollRef.current;
                     const child = container.children[index];
                     container.scrollTo({
                       left: child.offsetLeft - container.clientWidth / 2 + child.offsetWidth / 2,
                       behavior: 'smooth'
                     });
                  }
                }}
              >
                {isCritical && (
                  <div style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#FF5E3A', color: '#FFF', fontSize: '0.65em', fontWeight: 800, padding: '2px 8px', borderRadius: '12px', letterSpacing: '0.05em', zIndex: 10 }}>CRITICAL</div>
                )}
                <img src={c.image} style={{ width: '100%', height: `${100 * scale}px`, objectFit: 'cover', borderRadius: '8px', marginBottom: `${0.75 * scale}rem`, transition: 'all 0.3s' }} />
                
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' }}>
                  <span style={{ fontSize: '0.7em', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: '0.15em' }}>{c.restaurant}</span>
                  <h3 style={{ margin: `0 0 ${0.35 * scale}rem 0`, fontSize: '0.9em', color: '#111', fontWeight: 800, lineHeight: 1.2 }}>{c.name}</h3>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: `${0.5 * scale}rem` }}>
                     <span style={{ fontSize: '0.75em', fontWeight: 700, color: '#374151' }}>Price:</span>
                     <span style={{ fontSize: '1em', fontWeight: 800, color: territoryColor }}>{c.price}</span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: `${0.5 * scale}rem` }}>
                     <span style={{ fontSize: '0.75em', fontWeight: 700, color: '#374151' }}>Platform:</span>
                     <PlatformIconOnly platform={c.platform.replace(/\s+/g, '')} size={12 * scale} />
                     <span style={{ fontSize: '0.7em', color: '#6B7280', fontWeight: 600 }}>{c.platform}</span>
                  </div>
                  
                  <div style={{ background: isActiveCard ? '#FFF' : '#FAF7F2', borderRadius: '6px', padding: `${0.4 * scale}rem`, fontSize: '0.65em', color: '#374151', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <span>Gap:</span>
                     <strong style={{ color: isCritical ? '#FF5E3A' : isUnder ? '#10B981' : '#6B7280' }}>
                       {c.diff}
                     </strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const MenuPricingIntelligenceModal = ({ selectedCard, onClose, setSelectedItemDetails, overallStatus, statusColor, initialPlatform }) => {
  const [selectedPlatforms, setSelectedPlatforms] = useState(() => {
    if (initialPlatform && initialPlatform !== 'All') return [initialPlatform];
    return ['Deliveroo', 'UberEats', 'JustEat'];
  });
  const [activeStateTitle, setActiveStateTitle] = useState(selectedCard?.title);
  const [focalItem, setFocalItem] = useState(null);
  const [showPercentage, setShowPercentage] = useState(false);

  const [starredItems, setStarredItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('menuiq_watchlist') || '[]'); } catch { return []; }
  });

  const toggleStar = (e, id) => {
    e.stopPropagation();
    try {
      const wl = JSON.parse(localStorage.getItem('menuiq_watchlist') || '[]');
      const isStarred = wl.includes(id);
      const newWl = isStarred ? wl.filter(x => x !== id) : [...wl, id];
      localStorage.setItem('menuiq_watchlist', JSON.stringify(newWl));
      setStarredItems(newWl);
    } catch {}
  };

  const togglePlatform = (p) => {
    setSelectedPlatforms(prev => {
      if (prev.includes(p)) {
        if (prev.length === 1) return prev; // Prevent deselecting all
        return prev.filter(x => x !== p);
      }
      return [...prev, p];
    });
  };

  useEffect(() => {
    if (selectedCard) {
      setActiveStateTitle(selectedCard.title);
    }
  }, [selectedCard]);

  if (!selectedCard) return null;

  const effectiveTitle = activeStateTitle || selectedCard?.title || '';
  const currentData = PRICING_STATES[effectiveTitle] || selectedCard;

  return ReactDOM.createPortal(
    <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(17, 24, 39, 0.4)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }} onClick={onClose}>
      <div className="glass-panel modal-content" style={{ width: '1200px', maxWidth: '100%', height: '85vh', display: 'flex', flexDirection: 'column', background: '#FAF7F2', borderRadius: '24px', border: '1px solid #E5E7EB', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
        

        {/* MAIN BODY (FLEX ROW) */}
        <div style={{ flex: 1, overflow: 'hidden', padding: focalItem ? '0' : '1.5rem 2.5rem', display: 'flex', flexDirection: 'row', gap: '1.5rem' }}>
          
          {/* LEFT PANEL: MATRIX (Hidden in focal mode) */}
          {!focalItem && (
            <>
              <div className="hide-scrollbar" style={{ width: '320px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto', paddingRight: '0.5rem' }}>
                {/* Left Column Header (Title, Status, & View Toggle) */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', marginTop: '0.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#1E293B', margin: 0, lineHeight: 1 }}>
                      Menu Pricing
                    </h2>
                  </div>
                  
                  {/* View Toggle */}
                  <div
                    onClick={() => setShowPercentage(!showPercentage)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '4px', background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '3px 8px', cursor: 'pointer', transition: 'background 0.2s', userSelect: 'none'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#E2E8F0'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#F1F5F9'}
                  >
                    <span style={{ fontSize: '9px', fontWeight: showPercentage ? 500 : 800, color: showPercentage ? '#94A3B8' : '#FF5E3A', letterSpacing: '0.05em' }}>TXT</span>
                    <div style={{ width: '1px', height: '10px', background: '#CBD5E1', margin: '0 2px' }}></div>
                    <span style={{ fontSize: '10px', fontWeight: showPercentage ? 800 : 500, color: showPercentage ? '#FF5E3A' : '#94A3B8' }}>%</span>
                  </div>
                </div>
                {['Mains', 'Sides', 'Drinks'].map(cat => {
                  let stableCount = 0;
                  let underpricedCount = 0;
                  let overpricedCount = 0;

                  const isMatch = (i) => {
                     if (i.category !== cat) return false;
                     const itemPlatformKey = i.platform === 'Just Eat' || i.platform === 'JustEat' ? 'JustEat' : i.platform.replace(/\s+/g, '');
                     return selectedPlatforms.includes(itemPlatformKey);
                  };

                  PRICING_STATES['Stable Items'].items.forEach(i => { if(isMatch(i)) stableCount++; });
                  PRICING_STATES['Underpriced Items'].items.forEach(i => { if(isMatch(i)) underpricedCount++; });
                  PRICING_STATES['Overpriced Items'].items.forEach(i => { if(isMatch(i)) overpricedCount++; });
                  
                  const total = stableCount + underpricedCount + overpricedCount;
                  const mispricedRatio = total === 0 ? 0 : (underpricedCount + overpricedCount) / total;
                  const mispricedPercentage = Math.round(mispricedRatio * 100);
                  
                  let stateLabel = 'Optimal';
                  let stateColor = '#10B981';
                  if (mispricedRatio >= 0.40) {
                     stateLabel = 'Critical';
                     stateColor = '#FF5E3A';
                  } else if (mispricedRatio >= 0.20) {
                     stateLabel = 'Warning';
                     stateColor = '#F59E0B';
                  }

                  return (
                    <div key={cat} style={{ background: '#FFFFFF', borderRadius: '12px', padding: '0.65rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', border: '1px solid #F3F4F6' }}>
                      <div style={{ textAlign: 'center', borderBottom: '1px solid #E5E7EB', paddingBottom: '0.35rem', marginBottom: '0.35rem' }}>
                        <h5 style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6B7280', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{cat} Category</h5>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                        <span style={{ fontSize: '0.75rem', color: '#374151', fontWeight: 500 }}>Stable</span>
                        <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 800 }}>{stableCount} item{stableCount === 1 ? '' : 's'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                        <span style={{ fontSize: '0.75rem', color: '#374151', fontWeight: 500 }}>Underpriced</span>
                        <span style={{ fontSize: '0.75rem', color: '#F59E0B', fontWeight: 800 }}>{underpricedCount} item{underpricedCount === 1 ? '' : 's'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', color: '#374151', fontWeight: 500 }}>Overpriced</span>
                        <span style={{ fontSize: '0.75rem', color: '#FF5E3A', fontWeight: 800 }}>{overpricedCount} item{overpricedCount === 1 ? '' : 's'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.35rem', borderTop: '1px solid #F3F4F6', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: '#111827', fontWeight: 800 }}>Status</span>
                        <span style={{ fontSize: '11px', fontWeight: 500, padding: '0.15rem 0.5rem', borderRadius: '12px', background: `${stateColor}15`, color: stateColor, letterSpacing: '0.02em', transition: 'all 0.2s ease-in-out' }}>
                          {showPercentage ? `${mispricedPercentage}% Mispriced` : (stateLabel === 'CRITICAL' || stateLabel === 'Critical' ? 'Critical' : stateLabel)}
                        </span>
                      </div>
                    </div>
                  );
                })}
                
                {/* Menu Health (Moved from header) */}
                {overallStatus && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.25rem 0', marginTop: 'auto' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Menu Health:</span>
                    <div style={{ display: 'flex', alignItems: 'center', background: `${statusColor}15`, padding: '0.2rem 0.6rem', borderRadius: '8px' }}>
                       <span style={{ fontSize: '12px', fontWeight: 500, color: statusColor, letterSpacing: '0.02em' }}>{overallStatus.charAt(0).toUpperCase() + overallStatus.slice(1).toLowerCase()}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* VERTICAL DIVIDER */}
              <div style={{ width: '1px', background: '#E5E7EB', flexShrink: 0, margin: '0' }}></div>
            </>
          )}

          {/* RIGHT PANEL: ITEMS & FILTERS */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', gap: '1rem' }}>
            
            {/* Right Column Header (Filters & Close) */}
            {!focalItem && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0', marginTop: '0.25rem' }}>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px' }}>
                    {/* Platform Toggles */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748B', letterSpacing: '0.02em', textTransform: 'uppercase' }}>Platform</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        {[
                          { id: 'Deliveroo', Icon: DeliverooIcon, color: '#00CCBC' },
                          { id: 'UberEats', Icon: UberEatsIcon, color: '#06C167' },
                          { id: 'JustEat', Icon: JustEatIcon, color: '#FF8000' }
                        ].map(p => {
                          const isActive = selectedPlatforms.includes(p.id);
                          return (
                            <button
                              key={p.id}
                              onClick={() => togglePlatform(p.id)}
                              style={{
                                width: '26px', height: '26px', borderRadius: '50%', border: 'none',
                                background: isActive ? p.color : 'transparent',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', transition: 'all 0.2s',
                                opacity: isActive ? 1 : 0.4, flexShrink: 0
                              }}
                              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'rgba(0,0,0,0.05)'; }}
                              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                            >
                              <p.Icon size={14} color={isActive ? '#FFFFFF' : '#6B7280'} style={{ display: 'block' }} />
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Status Dropdown */}
                    <DropdownMenu
                      value={effectiveTitle.replace(' Items', '')}
                      badgeColor={PRICING_STATES[effectiveTitle]?.color}
                      options={[
                        { id: 'Underpriced Items', label: 'Underpriced', badgeColor: PRICING_STATES['Underpriced Items'].color },
                        { id: 'Stable Items', label: 'Stable', badgeColor: PRICING_STATES['Stable Items'].color },
                        { id: 'Overpriced Items', label: 'Overpriced', badgeColor: PRICING_STATES['Overpriced Items'].color }
                      ]}
                      onChange={setActiveStateTitle}
                    />
                  </div>

                  {/* Close Button */}
                  <button onClick={onClose} style={{ width: '36px', height: '36px', borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s, transform 0.2s', flexShrink: 0, boxSizing: 'border-box' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'scale(1.05)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.05)'; e.currentTarget.style.transform = 'scale(1)'; }}>
                    <X size={18} color="#6B7280" style={{ display: 'block' }} />
                  </button>
                </div>
              </div>
            )}

            {/* SECTION 3: CONDITIONAL CONTENT */}
            {focalItem ? (
              <FocalScrollView item={focalItem} onBack={() => setFocalItem(null)} onClose={onClose} activeStateTitle={effectiveTitle} selectedPlatforms={selectedPlatforms} />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '1.5rem', flex: 1, overflow: 'hidden' }}>
                {['Mains', 'Sides', 'Drinks'].map(category => {
                const categoryItems = currentData.items.filter(i => {
                  const matchCategory = i.category === category;
                  const itemPlatformKey = i.platform === 'Just Eat' || i.platform === 'JustEat' ? 'JustEat' : i.platform.replace(/\s+/g, '');
                  const matchPlatform = selectedPlatforms.includes(itemPlatformKey);
                  return matchCategory && matchPlatform;
                });
                
                return (
                  <div key={category} className="hide-scrollbar" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '420px', overflowY: 'auto', paddingRight: '0.5rem' }}>
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
                        let deltaPart = null;
                        if (varianceText.includes('below market')) {
                          varianceText = varianceText.replace('Market Average: ', 'Market Avg: ').replace('. (', ' | ').replace(' below market)', '');
                          const parts = varianceText.split(' | ');
                          if (parts.length > 1) {
                            varianceText = parts[0];
                            deltaPart = { text: `↓ ${parts[1]}`, color: '#F59E0B' };
                          }
                        } else if (varianceText.includes('above market')) {
                          varianceText = varianceText.replace('Market Average: ', 'Market Avg: ').replace('. (', ' | ').replace(' above market)', '');
                          const parts = varianceText.split(' | ');
                          if (parts.length > 1) {
                            varianceText = parts[0];
                            deltaPart = { text: `↑ ${parts[1]}`, color: '#FF5E3A' };
                          }
                        } else if (varianceText.includes('Matches market perfectly')) {
                          varianceText = varianceText.replace('Market Average: ', 'Market Avg: ').replace('. (Matches market perfectly)', '');
                        }
                        
                        const platformKey = item.platform === 'Just Eat' || item.platform === 'JustEat' ? 'justeat' : item.platform.toLowerCase().replace(' ', '');
                        const starId = `menu_item_${item.name.replace(/\s+/g, '_')}_${platformKey}`;
                        
                        return (
                          <div key={i} onClick={() => { setFocalItem(item); }} style={{ display: 'flex', gap: '1rem', background: '#FFFFFF', borderRadius: '12px', padding: '0.75rem', border: '1px solid #F3F4F6', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', alignItems: 'center', cursor: 'pointer', transition: 'transform 0.1s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                            <img src={item.image} alt={item.name} style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', justifyContent: 'center' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.2rem', gap: '0.25rem' }}>
                                <h4 className="font-sans" style={{ fontSize: '0.7rem', fontWeight: 700, color: '#111827', margin: 0, whiteSpace: 'normal', lineHeight: 1.2, fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}>{item.name}</h4>
                                <span className="font-sans" style={{ fontSize: '0.7rem', fontWeight: 700, color: '#111827', flexShrink: 0, fontFamily: 'ui-sans-serif, system-ui, sans-serif', marginTop: '1px' }}>{item.price || '£--'}</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', overflow: 'hidden' }}>
                                  <PlatformIconOnly platform={platformKey} size={12} />
                                  <p className="font-sans" style={{ color: '#6B7280', fontSize: '0.6rem', margin: 0, lineHeight: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '-0.02em', fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}>
                                    {varianceText}
                                    {deltaPart && (
                                      <>
                                        {' | '}
                                        <span style={{ color: deltaPart.color, fontWeight: 600 }}>{deltaPart.text}</span>
                                      </>
                                    )}
                                  </p>
                                </div>
                                <button
                                  onClick={(e) => toggleStar(e, starId)}
                                  title={starredItems.includes(starId) ? 'Remove from watchlist' : 'Add to watchlist'}
                                  style={{ background:'none', border:'none', padding:'0 2px', cursor:'pointer', flexShrink:0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                  <Star size={14} fill={starredItems.includes(starId) ? "#EAB308" : "none"} color={starredItems.includes(starId) ? "#EAB308" : "#9CA3AF"} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                );
              })}
            </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default MenuPricingIntelligenceModal;
