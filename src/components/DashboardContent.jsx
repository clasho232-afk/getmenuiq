import React from 'react';
import { ArrowRight, AlertTriangle, Sparkles, Send, Wallet, Satellite, Megaphone, ChefHat, TrendingUp, TrendingDown, X, Eye, Clock, BarChart3, ChevronRight } from 'lucide-react';
import './DashboardContent.css';
import MarketPositionReport from './MarketPositionReport';

const PricingCard = ({ title, count, items, colorClass, onShowMore }) => {
  const displayedItems = items.slice(0, 2);

  return (
    <div className="glass-panel" style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#4B5563' }}>{title}</h3>
        <span style={{ fontSize: '2rem', fontWeight: 800 }} className={colorClass}>{count}</span>
      </div>
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
          Top 2 Urgent
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {displayedItems.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.4)', borderRadius: '12px', padding: '0.75rem', border: '1px solid rgba(255,255,255,0.5)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <img src={item.image} alt={item.name} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(0,0,0,0.1)' }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{item.name}</div>
                  <div style={{ fontSize: '0.75rem', color: item.impact > 0 ? '#10B981' : '#EF4444', fontWeight: 500 }}>
                    {item.impact > 0 ? '+' : ''}£{item.impact} {item.impact > 0 ? 'gained' : 'lost'}
                  </div>
                </div>
              </div>
              <button style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
                <ArrowRight size={16} />
              </button>
            </div>
          ))}
        </div>
        
        {items.length > 2 && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'auto', paddingTop: '1.5rem' }}>
            <button 
              onClick={onShowMore}
              style={{ background: 'transparent', border: 'none', color: '#6B7280', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
            >
              Show more
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const DashboardContent = () => {
  const [selectedCard, setSelectedCard] = React.useState(null);
  const [showPromos, setShowPromos] = React.useState(false);
  const [selectedPromoDetail, setSelectedPromoDetail] = React.useState(null);
  const [selectedMetric, setSelectedMetric] = React.useState(null);
  const [dismissedAlerts, setDismissedAlerts] = React.useState([]);
  const [priceAlertFilter, setPriceAlertFilter] = React.useState('all');
  const [showMarketReport, setShowMarketReport] = React.useState(false);

  const priceAlerts = [
    { id: 1, competitor: 'Pizza Express', logo: 'PE', logoColor: '#1D4ED8', item: 'Margherita Pizza', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=64&q=80', oldPrice: 11.50, newPrice: 12.95, direction: 'up', time: '12 min ago', isNew: true, youSellThis: true, isMine: true, platform: 'deliveroo' },
    { id: 2, competitor: 'Burger King', logo: 'BK', logoColor: '#D97706', item: 'Whopper Meal', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=64&q=80', oldPrice: 8.99, newPrice: 7.49, direction: 'down', time: '34 min ago', isNew: true, youSellThis: false, isMine: true, platform: 'ubereats' },
    { id: 3, competitor: 'Five Guys', logo: 'FG', logoColor: '#DC2626', item: 'Bacon Cheeseburger', image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=64&q=80', oldPrice: 12.50, newPrice: 13.75, direction: 'up', time: '1 hr ago', isNew: true, youSellThis: false, isMine: false, platform: 'justeat' },
    { id: 4, competitor: 'Local Diner', logo: 'LD', logoColor: '#059669', item: 'Fish & Chips', image: 'https://images.unsplash.com/photo-1579208030886-b1f5b7d4b806?auto=format&fit=crop&w=64&q=80', oldPrice: 9.95, newPrice: 8.95, direction: 'down', time: '2 hrs ago', isNew: false, youSellThis: true, isMine: true, platform: 'deliveroo' },
    { id: 5, competitor: 'Pizza Express', logo: 'PE', logoColor: '#1D4ED8', item: 'Garlic Bread', image: 'https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?auto=format&fit=crop&w=64&q=80', oldPrice: 5.50, newPrice: 6.25, direction: 'up', time: '3 hrs ago', isNew: false, youSellThis: true, isMine: true, platform: 'ubereats' },
    { id: 6, competitor: 'Nando\'s', logo: 'ND', logoColor: '#B91C1C', item: 'Half Chicken', image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=64&q=80', oldPrice: 9.25, newPrice: 8.50, direction: 'down', time: '5 hrs ago', isNew: false, youSellThis: false, isMine: false, platform: 'deliveroo' },
  ];

  const visibleAlerts = priceAlerts
    .filter(a => !dismissedAlerts.includes(a.id))
    .filter(a => priceAlertFilter === 'all' || a.isMine)
    .sort((a, b) => {
      // Float "You sell this" to top, then by recency (id ascending = newest first)
      if (a.youSellThis && !b.youSellThis) return -1;
      if (!a.youSellThis && b.youSellThis) return 1;
      return 0;
    });
  const newCount = visibleAlerts.filter(a => a.isNew).length;
  const affectsYouCount = visibleAlerts.filter(a => a.youSellThis).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ fontSize: '1.875rem', fontWeight: 700 }}>Menu Pricing Health</div>
      
      {/* Top Row: Competitive Score & AI Assistant */}
      <div style={{ display: 'flex', gap: '1.5rem' }}>
        {/* Pro-Report Split Card */}
        <div className="glass-panel breathing-glow" style={{ flex: 2, display: 'flex', overflow: 'hidden', padding: 0 }}>
          
          {/* LEFT — Brand Identity Hero */}
          <div style={{ 
            flex: 1, 
            position: 'relative', 
            backgroundImage: 'linear-gradient(to top, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.3) 60%, transparent 100%), url(/gordos-hero.png)', 
            backgroundSize: 'cover', 
            backgroundPosition: 'center',
            minHeight: '320px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '2rem'
          }}>
            {/* Brand Text */}
            <div style={{ position: 'relative', zIndex: 2 }}>
              <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)', fontWeight: 400, marginBottom: '0.25rem' }}>Good evening,</p>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', fontFamily: 'Playfair Display, serif', lineHeight: 1.2, marginBottom: '0.75rem' }}>Gordo's Pizzeria</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>Live on UberEats · Deliveroo</span>
              </div>
            </div>
          </div>

          {/* RIGHT — Score & Breakdown */}
          <div style={{ flex: 1, padding: '1.75rem 2rem', display: 'flex', flexDirection: 'column' }}>
            {/* Header with Promo Pill */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.01em' }}>Restaurant Health</h2>
                <p style={{ color: '#9CA3AF', fontSize: '0.75rem', marginTop: '0.15rem' }}>Compared to 8 local competitors</p>
              </div>
            </div>

            {/* Sub-split: Donut Left | Breakdown Right — vertically centered */}
            <div style={{ flex: 1, display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              {/* Donut Score */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
                <div style={{ position: 'relative', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                    <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="10" />
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#000" strokeWidth="10" strokeDasharray="282.7" strokeDashoffset="101.7" strokeLinecap="round" />
                  </svg>
                  <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '2.25rem', fontWeight: 800, lineHeight: 1, letterSpacing: '-0.02em' }}>64</span>
                    <span style={{ fontSize: '0.7rem', color: '#9CA3AF', fontWeight: 600 }}>/ 100</span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(239, 68, 68, 0.08)', color: '#EF4444', padding: '0.3rem 0.65rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 600 }}>
                  <AlertTriangle size={12} /> Needs Attention
                </div>
              </div>

              {/* Breakdown List */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {[
                  { name: 'Price Positioning', icon: Wallet, weight: '30%', score: 42, isWarning: true, details: 'Your combos are priced 15% higher than the local average. Burger King and Five Guys both offer competitive lunch deals that undercut your main offerings.' },
                  { name: 'Platform Coverage', icon: Satellite, weight: '20%', score: 85, isWarning: false, details: 'You are listed on UberEats and Deliveroo, capturing 85% of the delivery market. Consider adding JustEat to reach 100% coverage.' },
                  { name: 'Offer Activity', icon: Megaphone, weight: '15%', score: 60, isWarning: false, details: 'You ran 2 promotions this month compared to the local average of 4. Competitors are aggressively using BOGO offers.' },
                  { name: 'Menu Variety', icon: ChefHat, weight: '15%', score: 75, isWarning: false, details: 'Good coverage of main categories. However, you lack a dedicated vegan option which 3 of your top competitors have recently introduced.' }
                ].map((metric, i) => (
                  <div 
                    key={i}
                    onClick={() => setSelectedMetric(metric)}
                    style={{ cursor: 'pointer', padding: '0.3rem', margin: '-0.3rem', borderRadius: '6px', transition: 'background 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 500, marginBottom: '0.3rem', color: '#6B7280' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: metric.isWarning ? '#EF4444' : '#6B7280' }}>
                        <metric.icon size={13} strokeWidth={1.5} style={{ color: metric.isWarning ? '#EF4444' : '#9CA3AF' }} />
                        {metric.name} <span style={{ color: '#D1D5DB', fontSize: '0.65rem' }}>({metric.weight})</span>
                      </span>
                      <span style={{ fontWeight: 800, color: metric.isWarning ? '#EF4444' : '#111', fontSize: '0.8rem', letterSpacing: '-0.01em' }}>{metric.score}/100</span>
                    </div>
                    <div className="metric-bar-bg" style={{ height: '5px' }}><div className={`metric-bar-fill ${metric.isWarning ? 'warning' : ''}`} style={{ width: `${metric.score}%` }}></div></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ flex: 1, padding: '2rem', display: 'flex', flexDirection: 'column' }}>
          <div onClick={() => setShowPromos(true)} className="promo-pill-header" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.12)', borderRadius: '9999px', padding: '0.6rem 1.25rem', marginBottom: '1.5rem', cursor: 'pointer', transition: 'all 0.3s', alignSelf: 'flex-start' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)'; e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.25)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.06)'; e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.12)'; }}>
            <div className="pulse-dot" style={{ width: '10px', height: '10px' }}></div>
            <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#EF4444' }}>4</span>
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111' }}>Promo Tracker</span>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto', paddingRight: '0.5rem' }}>
            {[
              { restaurant: 'Burger King', promo: '2 for £5 Mix & Match', type: 'Discount', threat: 'high', platform: 'ubereats', active: 'Started today', image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=64&q=80', description: 'Offering any two signature burgers for £5 to combat our recent price increase. This is directly targeting our lunch rush.' },
              { restaurant: 'Five Guys', promo: 'Free Delivery over £15', type: 'Delivery', threat: 'low', platform: 'deliveroo', active: 'Ends in 2 hrs', image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=64&q=80', description: 'Pushing volume through delivery apps with free delivery during peak hours. High threat to our delivery metrics today.' },
              { restaurant: 'Local Diner', promo: '20% off all Milkshakes', type: 'Happy Hour', threat: 'low', platform: 'justeat', active: 'Live now', image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=64&q=80', description: 'Afternoon happy hour targeting students. Strong overlap with our newly launched dessert menu.' },
              { restaurant: 'Pizza Express', promo: 'Buy 1 Get 1 Free', type: 'BOGO', threat: 'high', platform: 'deliveroo', active: 'Ends tomorrow', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=64&q=80', description: 'Aggressive BOGO on all 12" pizzas for the weekend to drive foot traffic.' }
            ].map((promo, i) => {
              const isHighThreat = promo.threat === 'high';
              const heatGradient = isHighThreat 
                ? 'linear-gradient(to right, rgba(239,68,68,0.08) 0%, rgba(239,68,68,0.02) 40%, transparent 100%)' 
                : 'linear-gradient(to right, rgba(147,197,253,0.1) 0%, rgba(147,197,253,0.03) 40%, transparent 100%)';
              
              const platformIcons = {
                ubereats: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.5, flexShrink: 0 }}>
                    <rect width="24" height="24" rx="6" fill="#06C167"/>
                    <text x="12" y="16" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">U</text>
                  </svg>
                ),
                deliveroo: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.5, flexShrink: 0 }}>
                    <rect width="24" height="24" rx="6" fill="#00CCBC"/>
                    <text x="12" y="16" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">D</text>
                  </svg>
                ),
                justeat: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.5, flexShrink: 0 }}>
                    <rect width="24" height="24" rx="6" fill="#F36D00"/>
                    <text x="12" y="16" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">J</text>
                  </svg>
                )
              };

              return (
                <div 
                  key={i} 
                  onClick={() => setSelectedPromoDetail(promo)}
                  style={{ 
                    position: 'relative',
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    background: heatGradient,
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    borderRadius: '8px', 
                    padding: '0.7rem 0.85rem', 
                    border: `1px solid ${isHighThreat ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.6)'}`,
                    cursor: 'pointer', 
                    transition: 'transform 0.2s, border-color 0.2s' 
                  }}
                  onMouseEnter={(e) => {e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.borderColor = isHighThreat ? 'rgba(239,68,68,0.25)' : 'rgba(147,197,253,0.4)';}}
                  onMouseLeave={(e) => {e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.borderColor = isHighThreat ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.6)';}}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <img src={promo.image} alt={promo.restaurant} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(0,0,0,0.06)' }} />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.8rem', color: '#111' }}>{promo.restaurant}</span>
                        {platformIcons[promo.platform]}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#6B7280', marginTop: '0.1rem' }}>{promo.promo}</div>
                    </div>
                  </div>
                  <ArrowRight size={14} color="#9CA3AF" />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Row: Pricing Health */}
      <div style={{ display: 'flex', gap: '1.5rem' }}>
        <PricingCard 
          title="Overpriced" count="12" colorClass="text-red-500"
          gradient="linear-gradient(to bottom, rgba(226, 75, 74, 0.30) 0%, rgba(255,255,255,0) 55%)"
          items={[
            { name: 'Spicy Chicken Burger', impact: -240, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=64&q=80' },
            { name: 'Truffle Fries', impact: -120, image: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=64&q=80' },
            { name: 'Margherita Pizza', impact: -95, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=64&q=80' },
            { name: 'Cola Zero', impact: -40, image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=64&q=80' }
          ]}
          onShowMore={() => setSelectedCard({ title: 'Overpriced', items: [
            { name: 'Spicy Chicken Burger', impact: -240, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=64&q=80' },
            { name: 'Truffle Fries', impact: -120, image: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=64&q=80' },
            { name: 'Margherita Pizza', impact: -95, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=64&q=80' },
            { name: 'Cola Zero', impact: -40, image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=64&q=80' }
          ]})}
        />
        <PricingCard 
          title="Priced Right" count="45" colorClass="text-green-500"

          items={[
            { name: 'Classic Cheeseburger', impact: 850, image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=64&q=80' },
            { name: 'Onion Rings', impact: 320, image: 'https://images.unsplash.com/photo-1639024471283-03518883512d?auto=format&fit=crop&w=64&q=80' },
            { name: 'BBQ Wings', impact: 210, image: 'https://images.unsplash.com/photo-1524114664604-cd8133cd67ad?auto=format&fit=crop&w=64&q=80' }
          ]}
          onShowMore={() => setSelectedCard({ title: 'Priced Right', items: [
            { name: 'Classic Cheeseburger', impact: 850, image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=64&q=80' },
            { name: 'Onion Rings', impact: 320, image: 'https://images.unsplash.com/photo-1639024471283-03518883512d?auto=format&fit=crop&w=64&q=80' },
            { name: 'BBQ Wings', impact: 210, image: 'https://images.unsplash.com/photo-1524114664604-cd8133cd67ad?auto=format&fit=crop&w=64&q=80' }
          ]})}
        />
        <PricingCard 
          title="Underpriced" count="8" colorClass="text-yellow-500"

          items={[
            { name: 'Vegan Wrap', impact: -450, image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=64&q=80' },
            { name: 'Milkshake', impact: -180, image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=64&q=80' },
            { name: 'Sweet Potato Fries', impact: -150, image: 'https://images.unsplash.com/photo-1596649285097-70b1cb3b3209?auto=format&fit=crop&w=64&q=80' },
            { name: 'Iced Coffee', impact: -85, image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba1?auto=format&fit=crop&w=64&q=80' }
          ]}
          onShowMore={() => setSelectedCard({ title: 'Underpriced', items: [
            { name: 'Vegan Wrap', impact: -450, image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=64&q=80' },
            { name: 'Milkshake', impact: -180, image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=64&q=80' },
            { name: 'Sweet Potato Fries', impact: -150, image: 'https://images.unsplash.com/photo-1596649285097-70b1cb3b3209?auto=format&fit=crop&w=64&q=80' },
            { name: 'Iced Coffee', impact: -85, image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba1?auto=format&fit=crop&w=64&q=80' }
          ]})}
        />
      </div>

      {/* Price Change Alerts */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={16} color="#6B7280" strokeWidth={1.5} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Price Changes
                {newCount > 0 && (
                  <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#fff', background: '#EF4444', padding: '0.15rem 0.45rem', borderRadius: '9999px', animation: 'pulse 2s infinite' }}>{newCount} new</span>
                )}
              </h3>
              <p style={{ fontSize: '0.7rem', color: '#9CA3AF', marginTop: '0.1rem' }}>Last 24 hours · {visibleAlerts.length} changes detected{affectsYouCount > 0 && <span style={{ color: '#D97706', fontWeight: 600 }}> · {affectsYouCount} affect your menu</span>}</p>
            </div>
          </div>
          <button style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', background: 'transparent', border: 'none', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '2px' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#111'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}
          >View all price changes</button>
        </div>

        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '1rem', background: 'rgba(0,0,0,0.03)', borderRadius: '8px', padding: '0.25rem', alignSelf: 'flex-start' }}>
          {[
            { key: 'all', label: 'All', count: priceAlerts.filter(a => !dismissedAlerts.includes(a.id)).length },
            { key: 'mine', label: 'My Competitors', count: priceAlerts.filter(a => !dismissedAlerts.includes(a.id) && a.isMine).length }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setPriceAlertFilter(tab.key)}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: '6px',
                border: 'none',
                fontSize: '0.75rem',
                fontWeight: priceAlertFilter === tab.key ? 700 : 500,
                color: priceAlertFilter === tab.key ? '#111' : '#9CA3AF',
                background: priceAlertFilter === tab.key ? '#fff' : 'transparent',
                boxShadow: priceAlertFilter === tab.key ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              {tab.label}
              <span style={{ 
                fontSize: '0.6rem', fontWeight: 700, 
                color: priceAlertFilter === tab.key ? '#6B7280' : '#D1D5DB',
                background: priceAlertFilter === tab.key ? 'rgba(0,0,0,0.05)' : 'rgba(0,0,0,0.03)', 
                padding: '0.1rem 0.35rem', borderRadius: '4px',
                transition: 'all 0.2s'
              }}>{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Alerts Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {visibleAlerts.slice(0, 6).map((alert) => {
            const isUp = alert.direction === 'up';
            const heatBg = alert.youSellThis 
              ? (isUp ? 'linear-gradient(to right, rgba(245,158,11,0.07) 0%, transparent 50%)' : 'linear-gradient(to right, rgba(20,184,166,0.07) 0%, transparent 50%)')
              : 'transparent';
            const borderColor = alert.youSellThis 
              ? (isUp ? 'rgba(245,158,11,0.15)' : 'rgba(20,184,166,0.12)') 
              : 'rgba(0,0,0,0.04)';

            return (
              <div 
                key={alert.id}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  background: heatBg,
                  backdropFilter: 'blur(8px)',
                  borderRadius: '8px',
                  border: `1px solid ${borderColor}`,
                  transition: 'all 0.2s',
                  position: 'relative'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateX(3px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateX(0)'; }}
              >
                {/* New indicator */}
                {alert.isNew && (
                  <div style={{ position: 'absolute', left: '-1px', top: '50%', transform: 'translateY(-50%)', width: '3px', height: '60%', borderRadius: '0 4px 4px 0', background: '#EF4444' }} />
                )}

                {/* Competitor Badge + Item Image */}
                <div style={{ position: 'relative', flexShrink: 0, width: '36px', height: '36px' }}>
                  <img src={alert.image} alt={alert.item} style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover', border: '1px solid rgba(0,0,0,0.06)' }} />
                  <div style={{ position: 'absolute', bottom: '-3px', right: '-3px', width: '16px', height: '16px', borderRadius: '4px', background: alert.logoColor, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #fff' }}>
                    <span style={{ fontSize: '0.4rem', fontWeight: 800, color: '#fff', letterSpacing: '0.02em' }}>{alert.logo}</span>
                  </div>
                </div>

                {/* Item Details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.8rem', color: '#111' }}>{alert.competitor}</span>
                    {alert.youSellThis && (
                      <span style={{ fontSize: '0.55rem', fontWeight: 700, color: isUp ? '#D97706' : '#0D9488', background: isUp ? 'rgba(245,158,11,0.1)' : 'rgba(20,184,166,0.1)', padding: '0.1rem 0.35rem', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>You sell this</span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.7rem', color: '#6B7280', marginTop: '0.1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{alert.item}</p>
                </div>

                {/* Price Change */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                  <span style={{ fontSize: '0.75rem', color: '#9CA3AF', fontWeight: 500, textDecoration: 'line-through' }}>£{alert.oldPrice.toFixed(2)}</span>
                  {isUp ? <TrendingUp size={14} color="#E05046" strokeWidth={2} /> : <TrendingDown size={14} color="#0D9488" strokeWidth={2} />}
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: isUp ? '#E05046' : '#0D9488', letterSpacing: '-0.02em' }}>£{alert.newPrice.toFixed(2)}</span>
                </div>

                {/* Time */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', flexShrink: 0, minWidth: '65px' }}>
                  <Clock size={11} color="#D1D5DB" strokeWidth={1.5} />
                  <span style={{ fontSize: '0.6rem', color: '#D1D5DB', fontWeight: 500 }}>{alert.time}</span>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
                  {alert.youSellThis && (
                    <button 
                      title="Adjust my price"
                      style={{ height: '26px', borderRadius: '6px', border: 'none', background: '#111', color: '#fff', fontSize: '0.6rem', fontWeight: 700, padding: '0 0.5rem', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#e05046'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#111'; }}
                    >
                      Adjust Price
                    </button>
                  )}
                  <button 
                    title="View Item"
                    style={{ width: '26px', height: '26px', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.06)', background: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#111'; e.currentTarget.querySelector('svg').style.color = '#fff'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.6)'; e.currentTarget.querySelector('svg').style.color = '#6B7280'; }}
                  >
                    <Eye size={12} color="#6B7280" strokeWidth={1.5} />
                  </button>
                  <button 
                    title="Dismiss"
                    onClick={(e) => { e.stopPropagation(); setDismissedAlerts(prev => [...prev, alert.id]); }}
                    style={{ width: '26px', height: '26px', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.06)', background: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.6)'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.06)'; }}
                  >
                    <X size={12} color="#9CA3AF" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Overlay for "Show more" */}
      {selectedCard && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 100, background: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel modal-content" style={{ width: '480px', maxWidth: '90%', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'rgba(255,255,255,0.9)', border: '1px solid #E5E7EB' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#000' }}>All {selectedCard.title} Items</h3>
              <button onClick={() => setSelectedCard(null)} style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid #E5E7EB', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>×</span>
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '60vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {selectedCard.items.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', borderRadius: '12px', padding: '1rem', border: '1px solid #E5E7EB', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <img src={item.image} alt={item.name} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '1rem' }}>{item.name}</div>
                      <div style={{ fontSize: '0.875rem', color: item.impact > 0 ? '#10B981' : '#EF4444', fontWeight: 500 }}>
                        {item.impact > 0 ? '+' : ''}£{item.impact} {item.impact > 0 ? 'gained' : 'lost'}
                      </div>
                    </div>
                  </div>
                  <button style={{ background: '#000', color: '#fff', padding: '0.5rem 1rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                    Edit Price
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Modal Overlay for Promos */}
      {showPromos && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 100, background: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel modal-content" style={{ width: '500px', maxWidth: '90%', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'rgba(255,255,255,0.9)', border: '1px solid #E5E7EB', position: 'relative' }}>
            
            {!selectedPromoDetail ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#000' }}>Active Competitor Promotions</h3>
                  <button onClick={() => setShowPromos(false)} style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid #E5E7EB', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>×</span>
                  </button>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '60vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
                  {[
                    { restaurant: 'Burger King', promo: '2 for £5 Mix & Match', type: 'Discount', active: 'Started today', image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=64&q=80', description: 'Offering any two signature burgers for £5 to combat our recent price increase. This is directly targeting our lunch rush.' },
                    { restaurant: 'Five Guys', promo: 'Free Delivery over £15', type: 'Delivery', active: 'Ends in 2 hrs', image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=64&q=80', description: 'Pushing volume through delivery apps with free delivery during peak hours. High threat to our delivery metrics today.' },
                    { restaurant: 'Local Diner', promo: '20% off all Milkshakes', type: 'Happy Hour', active: 'Live now', image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=64&q=80', description: 'Afternoon happy hour targeting students. Strong overlap with our newly launched dessert menu.' },
                    { restaurant: 'Pizza Express', promo: 'Buy 1 Get 1 Free', type: 'BOGO', active: 'Ends tomorrow', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=64&q=80', description: 'Aggressive BOGO on all 12" pizzas for the weekend to drive foot traffic.' }
                  ].map((promo, i) => (
                    <div 
                      key={i} 
                      onClick={() => setSelectedPromoDetail(promo)}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', borderRadius: '12px', padding: '1rem', border: '1px solid #E5E7EB', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
                      onMouseEnter={(e) => {e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';}}
                      onMouseLeave={(e) => {e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)';}}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <img src={promo.image} alt={promo.restaurant} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(0,0,0,0.1)' }} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <div style={{ fontWeight: 600, fontSize: '1rem' }}>{promo.restaurant}</div>
                          <div style={{ fontSize: '0.875rem', color: '#4B5563' }}>{promo.promo}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, background: '#F3F4F6', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>{promo.type}</span>
                        <span style={{ fontSize: '0.75rem', color: '#EF4444', fontWeight: 500 }}>{promo.active}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button 
                    onClick={() => setSelectedPromoDetail(null)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: 'none', color: '#4B5563', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    <ArrowRight size={16} style={{ transform: 'rotate(180deg)' }} /> Back
                  </button>
                  <button onClick={() => {setShowPromos(false); setSelectedPromoDetail(null);}} style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid #E5E7EB', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>×</span>
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center', textAlign: 'center', marginTop: '1rem' }}>
                  <img src={selectedPromoDetail.image} alt={selectedPromoDetail.restaurant} style={{ width: '100%', height: '160px', borderRadius: '20px', objectFit: 'cover', border: '1px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                  <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>{selectedPromoDetail.restaurant}</h2>
                    <div style={{ display: 'inline-block', background: '#F3F4F6', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 600, color: '#4B5563', marginBottom: '1rem' }}>
                      {selectedPromoDetail.type}
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#EF4444', marginBottom: '1rem' }}>{selectedPromoDetail.promo}</h3>
                    <p style={{ color: '#4B5563', fontSize: '1rem', lineHeight: 1.6, background: 'rgba(255,255,255,0.6)', padding: '1.5rem', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
                      {selectedPromoDetail.description}
                    </p>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '1rem', width: '100%', marginTop: '1rem' }}>
                    <button style={{ flex: 1, padding: '0.75rem', borderRadius: '9999px', background: '#F3F4F6', color: '#4B5563', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                      Ignore
                    </button>
                    <button style={{ flex: 1, padding: '0.75rem', borderRadius: '9999px', background: '#000', color: '#fff', fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                      <Sparkles size={16} /> Auto-Match Offer
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {/* Modal Overlay for Metric Details */}
      {selectedMetric && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 100, background: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel modal-content" style={{ width: '400px', maxWidth: '90%', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'rgba(255,255,255,0.9)', border: '1px solid #E5E7EB' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#000', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {selectedMetric.name} 
                {selectedMetric.isWarning && <AlertTriangle size={18} color="#EF4444" />}
              </h3>
              <button onClick={() => setSelectedMetric(null)} style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid #E5E7EB', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>×</span>
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <span style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1, color: selectedMetric.isWarning ? '#EF4444' : '#000' }}>{selectedMetric.score}</span>
                <span style={{ fontSize: '1rem', color: '#6B7280', fontWeight: 600 }}>/ 100</span>
              </div>
              <p style={{ color: '#4B5563', fontSize: '1rem', lineHeight: 1.6, background: 'rgba(255,255,255,0.6)', padding: '1rem', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
                {selectedMetric.details}
              </p>
              
              <button style={{ width: '100%', padding: '0.75rem', borderRadius: '9999px', background: '#000', color: '#fff', fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                <Sparkles size={16} /> Analyze deeply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Market Position Prompt Card */}
      <div className="glass-panel" onClick={() => setShowMarketReport(true)} style={{ padding: '1rem 1.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.85rem', transition: 'all 0.2s', border: '1px solid rgba(224,80,70,0.08)' }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'rgba(224,80,70,0.2)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(224,80,70,0.08)'; }}
      >
        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #e05046 0%, #c44035 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <BarChart3 size={16} color="#fff" />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#111' }}>You haven't benchmarked against the full market yet</p>
          <p style={{ fontSize: '0.65rem', color: '#9CA3AF' }}>See where you rank against 47 similar restaurants →</p>
        </div>
        <ChevronRight size={16} color="#D1D5DB" />
      </div>

      <MarketPositionReport isOpen={showMarketReport} onClose={() => setShowMarketReport(false)} />
    </div>
  );
};

export default DashboardContent;
