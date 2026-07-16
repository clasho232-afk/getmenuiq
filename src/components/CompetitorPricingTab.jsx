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

  const getPlatformDetails = (platform) => {
    if (platform === 'Deliveroo') return { bgColor: '#00CCBC', logoUrl: 'https://cdn.simpleicons.org/deliveroo/white' };
    if (platform === 'UberEats') return { bgColor: '#06C167', logoUrl: 'https://cdn.simpleicons.org/ubereats/white' };
    return { bgColor: '#FF8000', logoUrl: 'https://cdn.simpleicons.org/justeat/white' };
  };

  return (
    <div className="pricing-tab-container" style={{ display: 'block', paddingTop: '0px' }}>
      
      {/* Table Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '0 26px 12px 14px', borderBottom: '1px solid #E2E8F0', marginBottom: '12px', gap: '12px' }}>
        {/* Placeholder for Image */}
        <div style={{ width: '26px', flexShrink: 0 }}></div>
        
        <div style={{ display: 'flex', alignItems: 'center', flex: '1.0', minWidth: 0, justifyContent: 'flex-start' }}>
          <span style={{ fontSize: '10px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>Seller</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', flex: '1.3', minWidth: 0, justifyContent: 'flex-start' }}>
          <span style={{ fontSize: '10px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>Item</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', flex: '1.0', minWidth: 0, justifyContent: 'flex-start' }}>
          <span style={{ fontSize: '10px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>Platform</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', flex: '0.9', minWidth: 0, justifyContent: 'flex-start' }}>
          <span style={{ fontSize: '10px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>Area</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', flex: '0.8', justifyContent: 'flex-end', minWidth: 0 }}>
          <span style={{ fontSize: '10px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>Price</span>
        </div>
      </div>

      <div className="competitor-list-scroll" style={{ width: '100%', paddingRight: '8px' }}>
        {mockCompetitors.map((comp) => {
          const platformDetails = getPlatformDetails(comp.platform);
          return (
          <div key={comp.id} className="competitor-row" style={{ display: 'flex', alignItems: 'center', background: '#FFFFFF', borderRadius: '10px', padding: '10px 14px', marginBottom: '8px', boxShadow: '0px 2px 8px rgba(0,0,0,0.03)', border: '1px solid #F0F0F0', gap: '12px' }}>
            
            {/* 1. Micro Imagery */}
            <img src={comp.image} alt={comp.name} style={{ width: '26px', height: '26px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }} />

            {/* 2. Restaurant */}
            <div style={{ display: 'flex', alignItems: 'center', flex: '1.0', minWidth: 0 }}>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#1A1A1A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={comp.name}>{comp.name}</span>
            </div>

            {/* 3. Item Name */}
            <div style={{ display: 'flex', alignItems: 'center', flex: '1.3', minWidth: 0 }}>
              <span style={{ fontSize: '11px', fontWeight: '500', color: '#1A1A1A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={comp.itemName}>{comp.itemName}</span>
            </div>

            {/* 4. Platform Metric */}
            <div style={{ display: 'flex', alignItems: 'center', flex: '1.0', minWidth: 0 }}>
              <div style={{ background: platformDetails.bgColor, padding: '2px 6px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                  <img src={platformDetails.logoUrl} style={{ width: '10px', height: '10px' }} alt={comp.platform} />
                  <span style={{ fontSize: '10px', fontWeight: 800, color: '#FFFFFF', lineHeight: 1, whiteSpace: 'nowrap' }}>{comp.platform}</span>
              </div>
            </div>

            {/* 5. Area Metric */}
            <div style={{ display: 'flex', alignItems: 'center', flex: '0.9', minWidth: 0 }}>
              <span style={{ fontSize: '12px', fontWeight: '500', color: '#1A1A1A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={comp.area}>{comp.area}</span>
            </div>

            {/* 6. Price Metric */}
            <div style={{ display: 'flex', alignItems: 'center', flex: '0.8', justifyContent: 'flex-end', minWidth: 0 }}>
              <span style={{ fontSize: '14px', fontWeight: '700', color: '#1A1A1A', whiteSpace: 'nowrap', flexShrink: 0 }}>£{comp.price.toFixed(2)}</span>
            </div>

          </div>
          );
        })}
      </div>
    </div>
  );
};

export default CompetitorPricingTab;
