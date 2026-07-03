import React, { useMemo } from 'react';

const CompetitorPricingTab = ({ niche }) => {
  // Use generic mock data for demonstration
  const mockCompetitors = useMemo(() => {
    return [
      { id: 1, name: 'Gourmet Kitchen', platform: 'Deliveroo', price: 18.50, isPromo: false },
      { id: 2, name: 'The Rustic Oven', platform: 'UberEats', price: 16.00, isPromo: false },
      { id: 3, name: 'Street Food Co.', platform: 'Just Eat', price: 15.50, isPromo: true },
      { id: 4, name: 'Local Favorites', platform: 'Deliveroo', price: 14.50, isPromo: false },
      { id: 5, name: 'Bite Club', platform: 'UberEats', price: 13.00, isPromo: true },
      { id: 6, name: 'Quick Eats', platform: 'Deliveroo', price: 11.50, isPromo: false },
      { id: 7, name: 'Value Meals', platform: 'Just Eat', price: 9.50, isPromo: true },
    ].sort((a, b) => b.price - a.price); // Order from most to least expensive
  }, []);

  const { min, max, avg } = useMemo(() => {
    const prices = mockCompetitors.map(c => c.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const avg = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    return { min, max, avg };
  }, [mockCompetitors]);

  const renderPlatformLogo = (platform) => {
    let bgColor, label;
    if (platform === 'Deliveroo') { bgColor = '#00CCBC'; label = 'D'; }
    else if (platform === 'UberEats') { bgColor = '#06C167'; label = 'U'; }
    else { bgColor = '#FF8000'; label = 'J'; }

    return (
      <div style={{
        width: '24px', height: '24px', borderRadius: '6px',
        backgroundColor: bgColor, color: 'white', display: 'flex',
        alignItems: 'center', justifyContent: 'center', fontSize: '12px',
        fontWeight: 'bold', marginRight: '12px', flexShrink: 0
      }} title={platform}>
        {label}
      </div>
    );
  };

  return (
    <div className="pricing-tab-container">
      {/* Left Column (60%) */}
      <div className="pricing-left-col flush-top">
        <div className="competitor-list-scroll">
          {mockCompetitors.map((comp) => (
            <div key={comp.id} className="competitor-row">
              <div className="comp-info-left">
                {renderPlatformLogo(comp.platform)}
                <span className="comp-name">{comp.name}</span>
              </div>
              <div className="comp-info-right">
                {comp.isPromo && <span className="promo-tag">Promo</span>}
                <span className="comp-price">£{comp.price.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column (40%) - Simple Metrics */}
      <div className="pricing-right-col simple-metrics-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingTop: '20px' }}>
        <div className="simple-metric-block" style={{ background: '#FFFFFF', borderRadius: '16px', padding: '24px', boxShadow: '0px 4px 20px rgba(0,0,0,0.04)', border: '1px solid #F0F0F0' }}>
            <div className="metric-title" style={{ fontSize: '12px', fontWeight: '700', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>HIGHEST PRICE</div>
            <div className="metric-value-row" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="metric-price" style={{ fontSize: '24px', fontWeight: '800', color: '#1A1A1A' }}>£{max.toFixed(2)}</span>
                <span className="metric-restaurant" style={{ fontSize: '16px', fontWeight: '600', color: '#E63946' }}>{mockCompetitors[0]?.name}</span>
            </div>
        </div>

        <div className="simple-metric-block" style={{ background: '#FFFFFF', borderRadius: '16px', padding: '24px', boxShadow: '0px 4px 20px rgba(0,0,0,0.04)', border: '1px solid #F0F0F0' }}>
            <div className="metric-title" style={{ fontSize: '12px', fontWeight: '700', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>LOWEST PRICE</div>
            <div className="metric-value-row" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="metric-price" style={{ fontSize: '24px', fontWeight: '800', color: '#1A1A1A' }}>£{min.toFixed(2)}</span>
                <span className="metric-restaurant" style={{ fontSize: '16px', fontWeight: '600', color: '#10B981' }}>{mockCompetitors[mockCompetitors.length - 1]?.name}</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CompetitorPricingTab;
