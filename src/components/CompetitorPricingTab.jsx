import React, { useMemo } from 'react';

const CompetitorPricingTab = ({ niche }) => {
  // Use generic mock data for demonstration
  const mockCompetitors = useMemo(() => {
    return [
      { id: 1, name: 'Gourmet Kitchen', itemName: 'Signature Double Smash', platform: 'Deliveroo', area: 'Shoreditch', price: 18.50, isPromo: false, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=64&q=80' },
      { id: 2, name: 'The Rustic Oven', itemName: 'Classic Double Smasher', platform: 'UberEats', area: 'Whitechapel', price: 16.00, isPromo: false, image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=64&q=80' },
      { id: 3, name: 'Street Food Co.', itemName: 'Big Double Stack', platform: 'Just Eat', area: 'Hackney', price: 15.50, isPromo: true, image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=64&q=80' },
      { id: 4, name: 'Local Favorites', itemName: 'Double Smash Meal', platform: 'Deliveroo', area: 'Bethnal Green', price: 14.50, isPromo: false, image: 'https://images.unsplash.com/photo-1594212691516-436fba727df1?auto=format&fit=crop&w=64&q=80' },
      { id: 5, name: 'Bite Club', itemName: 'Original Double Burger', platform: 'UberEats', area: 'Stepney', price: 13.00, isPromo: true, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=64&q=80' },
      { id: 6, name: 'Quick Eats', itemName: 'Smash Double No Cheese', platform: 'Deliveroo', area: 'Shoreditch', price: 11.50, isPromo: false, image: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&w=64&q=80' },
      { id: 7, name: 'Value Meals', itemName: 'Budget Double Smash', platform: 'Just Eat', area: 'Whitechapel', price: 9.50, isPromo: true, image: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?auto=format&fit=crop&w=64&q=80' },
    ].sort((a, b) => b.price - a.price); // Order from most to least expensive
  }, []);

  const getPlatformLogo = (platform) => {
    if (platform === 'UberEats') return "https://www.google.com/s2/favicons?domain=ubereats.com&sz=128";
    if (platform === 'Deliveroo') return "https://www.google.com/s2/favicons?domain=deliveroo.co.uk&sz=128";
    if (platform === 'Just Eat') return "https://www.google.com/s2/favicons?domain=just-eat.co.uk&sz=128";
    return "";
  };

  return (
    <div className="pricing-tab-container" style={{ display: 'block', marginTop: '16px', padding: '12px 0 0 0', overflow: 'hidden', background: 'rgba(255, 255, 255, 0.4)', borderRadius: '12px' }}>
      
      {/* Table Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px 8px 16px', borderBottom: '1px solid #E2E8F0', gap: '12px' }}>
        <div style={{ width: '32px', flexShrink: 0 }}></div>
        
        <div style={{ flex: '1.2', minWidth: 0 }}>
          <span style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>Seller</span>
        </div>
        
        <div style={{ flex: '1.5', minWidth: 0 }}>
          <span style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>Item</span>
        </div>
        
        <div style={{ flex: '0.8', minWidth: 0 }}>
          <span style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>Platform</span>
        </div>
        
        <div style={{ flex: '1.0', minWidth: 0 }}>
          <span style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>Area</span>
        </div>
        
        <div style={{ flex: '0.8', textAlign: 'right', minWidth: 0 }}>
          <span style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>Price</span>
        </div>
      </div>

      <div className="competitor-list-scroll" style={{ width: '100%' }}>
        {mockCompetitors.map((comp, idx) => {
          const isLast = idx === mockCompetitors.length - 1;
          return (
          <div key={comp.id} className="modern-competitor-row" style={{ display: 'flex', alignItems: 'center', padding: '6px 16px', borderBottom: isLast ? 'none' : '1px solid #E2E8F0', gap: '8px', transition: 'background 0.2s', cursor: 'pointer' }}>
            
            {/* 1. Micro Imagery */}
            <img src={comp.image} alt={comp.name} style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '1px solid #E2E8F0' }} />

            {/* 2. Restaurant */}
            <div style={{ flex: '1.2', minWidth: 0 }}>
              <span style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>{comp.name}</span>
            </div>

            {/* 3. Item Name */}
            <div style={{ flex: '1.5', minWidth: 0 }}>
              <span style={{ fontSize: '13px', fontWeight: '500', color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>{comp.itemName}</span>
            </div>

            {/* 4. Platform Metric */}
            <div style={{ flex: '0.8', minWidth: 0, display: 'flex', alignItems: 'center' }}>
              <img src={getPlatformLogo(comp.platform)} style={{ width: '20px', height: '20px', borderRadius: '50%', border: '1px solid #E5E7EB', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }} alt={comp.platform} title={comp.platform} />
            </div>

            {/* 5. Area Metric */}
            <div style={{ flex: '1.0', minWidth: 0 }}>
              <span style={{ fontSize: '13px', fontWeight: '500', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>{comp.area}</span>
            </div>

            {/* 6. Price Metric */}
            <div style={{ flex: '0.8', textAlign: 'right', minWidth: 0 }}>
              <span style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A', whiteSpace: 'nowrap', display: 'block' }}>£{comp.price.toFixed(2)}</span>
            </div>

          </div>
          );
        })}
      </div>
    </div>
  );
};

export default CompetitorPricingTab;
