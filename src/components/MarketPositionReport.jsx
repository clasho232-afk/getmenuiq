import React, { useState, useEffect } from 'react';
import { X, TrendingUp, Tag, Star, Layers, Monitor, Award, Download, RefreshCw, Share2, ChevronRight } from 'lucide-react';

const PEER_COUNT = 47;
const AREA = 'East London';

const PercentileBar = ({ value, label, color }) => {
  const [animated, setAnimated] = useState(0);
  useEffect(() => { const t = setTimeout(() => setAnimated(value), 100); return () => clearTimeout(t); }, [value]);
  return (
    <div style={{ marginTop: '0.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
        <span style={{ fontSize: '0.65rem', color: '#9CA3AF' }}>Cheapest</span>
        <span style={{ fontSize: '0.65rem', color: '#9CA3AF' }}>Most Expensive</span>
      </div>
      <div style={{ height: '8px', background: 'rgba(0,0,0,0.04)', borderRadius: '4px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${animated}%`, background: color, borderRadius: '4px', transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)' }} />
        <div style={{ position: 'absolute', left: `${animated}%`, top: '-4px', width: '3px', height: '16px', background: '#111', borderRadius: '2px', transform: 'translateX(-50%)', transition: 'left 0.8s cubic-bezier(0.4,0,0.2,1)' }} />
      </div>
      <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#111', marginTop: '0.35rem' }}>{label}</p>
    </div>
  );
};

const RankBadge = ({ rank, total, percentile }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
    <div style={{ textAlign: 'center' }}>
      <p style={{ fontSize: '2rem', fontWeight: 900, color: '#111', letterSpacing: '-0.03em', lineHeight: 1 }}>{rank}<span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#9CA3AF' }}>/{total}</span></p>
      <p style={{ fontSize: '0.65rem', color: '#9CA3AF', fontWeight: 600 }}>in your category</p>
    </div>
    <div style={{ width: '1px', height: '40px', background: 'rgba(0,0,0,0.06)' }} />
    <div style={{ textAlign: 'center' }}>
      <p style={{ fontSize: '1.6rem', fontWeight: 900, color: '#e05046', lineHeight: 1 }}>Top {percentile}%</p>
      <p style={{ fontSize: '0.65rem', color: '#9CA3AF', fontWeight: 600 }}>in your market</p>
    </div>
  </div>
);

const SectionCard = ({ icon: Icon, iconColor, title, children }) => (
  <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)', padding: '1.25rem' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
      <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: `${iconColor}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={14} color={iconColor} />
      </div>
      <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111' }}>{title}</h3>
    </div>
    {children}
  </div>
);

const StatRow = ({ label, yours, market, unit = '' }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
    <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>{label}</span>
    <div style={{ display: 'flex', gap: '1.5rem' }}>
      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#111' }}>{unit}{yours} <span style={{ fontWeight: 500, color: '#9CA3AF' }}>you</span></span>
      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#9CA3AF' }}>{unit}{market} <span style={{ fontWeight: 500 }}>avg</span></span>
    </div>
  </div>
);

const MarketPositionReport = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      const t = setTimeout(() => setLoading(false), 2800);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(5px)' }} />
      <div onClick={e => e.stopPropagation()} style={{ position: 'relative', width: '760px', maxWidth: '94%', maxHeight: '90vh', background: '#FAFAF8', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', animation: 'modalScaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
          <div style={{ height: '120px', background: 'linear-gradient(135deg, #111 0%, #1a1a2e 50%, #16213e 100%)', position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 80% 20%, rgba(224,80,70,0.15) 0%, transparent 50%)' }} />
            <button onClick={onClose} style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.7)' }}><X size={14} /></button>
            <div style={{ position: 'absolute', bottom: '1rem', left: '1.5rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>Market Position Report</h2>
              <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.55)', marginTop: '0.15rem' }}>Gordo's Pizzeria · Benchmarked against {PEER_COUNT} similar restaurants · {AREA}</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.25rem', padding: '4rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '3px solid rgba(0,0,0,0.06)', borderTopColor: '#e05046', animation: 'spin 1s linear infinite' }} />
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111' }}>Benchmarking your restaurant…</p>
              <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '0.35rem' }}>Matching against {PEER_COUNT} restaurants across {AREA}</p>
            </div>
          </div>
        ) : (
          <div style={{ overflowY: 'auto', flex: 1, padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Overall Rank */}
            <div style={{ background: 'linear-gradient(135deg, rgba(224,80,70,0.04) 0%, rgba(224,80,70,0.01) 100%)', border: '1px solid rgba(224,80,70,0.1)', borderRadius: '14px', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                  <Award size={14} color="#e05046" />
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#e05046', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Overall Position</span>
                </div>
                <RankBadge rank={14} total={PEER_COUNT} percentile={30} />
              </div>
              <img src="https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=100&q=80" alt="Restaurant" style={{ width: '72px', height: '72px', borderRadius: '14px', objectFit: 'cover', border: '2px solid rgba(224,80,70,0.15)' }} />
            </div>

            {/* Section 1 — Price Ranking by Category */}
            <SectionCard icon={TrendingUp} iconColor="#3B82F6" title="Price Ranking">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  { category: 'Burgers', position: 75, verdict: 'Your burgers are priced higher than 75% of similar restaurants — Burger King and Five Guys both undercut you here', matches: 12 },
                  { category: 'Pizzas', position: 35, verdict: 'Your pizzas are among the cheapest in your area — you may have room to raise prices without losing orders', matches: 9 },
                  { category: 'Sides', position: 82, verdict: 'Your sides are on the premium end — most competitors price sides 20% lower than you', matches: 14 },
                  { category: 'Wraps', position: 50, verdict: 'Your wraps are competitively priced — sitting right in the middle of your market', matches: 5 },
                  { category: 'Drinks', position: 68, verdict: 'Your drinks are slightly above average — Nando\'s and Pizza Express both price soft drinks under £2', matches: 11 },
                ].map((cat, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#111' }}>{cat.category}</span>
                      {cat.matches < 3 ? (
                        <span style={{ fontSize: '0.6rem', fontWeight: 600, color: '#D1D5DB', background: 'rgba(0,0,0,0.03)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>Not enough data</span>
                      ) : (
                        <span style={{ fontSize: '0.6rem', color: '#9CA3AF' }}>{cat.matches} competitors</span>
                      )}
                    </div>
                    {cat.matches >= 3 ? (
                      <>
                        <PercentileBar value={cat.position} label="" color="#3B82F6" />
                        <p style={{ fontSize: '0.7rem', color: '#374151', lineHeight: 1.5, marginTop: '0.2rem' }}>{cat.verdict}</p>
                      </>
                    ) : (
                      <div style={{ height: '8px', background: 'rgba(0,0,0,0.03)', borderRadius: '4px' }} />
                    )}
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Section 2 — Promotion Frequency */}
            <SectionCard icon={Tag} iconColor="#D97706" title="Promotion Frequency">
              <StatRow label="Promos (last 30 days)" yours="1" market="3.2" />
              <PercentileBar value={25} label="You promote less frequently than 75% of similar restaurants" color="#D97706" />
              <div style={{ background: 'rgba(217,119,6,0.04)', borderRadius: '8px', padding: '0.75rem', marginTop: '0.75rem' }}>
                <p style={{ fontSize: '0.75rem', color: '#374151', lineHeight: 1.6 }}>Burger King runs 4 promotions per month, Domino's runs 6. Your competitors are dealing more aggressively — consider at least <strong>one targeted promotion per week</strong> to stay visible during peak hours.</p>
              </div>
            </SectionCard>

            {/* Section 3 — Platform Coverage */}
            <SectionCard icon={Monitor} iconColor="#10B981" title="Platform Coverage">
              <StatRow label="Your platforms" yours="2" market="2.4" />
              <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                {[
                  { name: 'Deliveroo', yours: true, peerPct: 85, color: '#00CCBC' },
                  { name: 'Just Eat', yours: true, peerPct: 72, color: '#F36D00' },
                  { name: 'Uber Eats', yours: false, peerPct: 64, color: '#06C167' },
                ].map(p => (
                  <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.65rem', borderRadius: '8px', border: `1px solid ${p.yours ? 'rgba(0,0,0,0.06)' : 'rgba(245,158,11,0.3)'}`, background: p.yours ? 'rgba(0,0,0,0.02)' : 'rgba(245,158,11,0.06)' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.color }} />
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, color: p.yours ? '#111' : '#D97706' }}>{p.name}</span>
                    <span style={{ fontSize: '0.6rem', color: '#9CA3AF' }}>{p.peerPct}% of peers</span>
                    {!p.yours && <span style={{ fontSize: '0.55rem', fontWeight: 700, color: '#D97706', background: 'rgba(217,119,6,0.1)', padding: '0.1rem 0.3rem', borderRadius: '4px' }}>MISSING</span>}
                  </div>
                ))}
              </div>
              <div style={{ background: 'rgba(16,185,129,0.04)', borderRadius: '8px', padding: '0.75rem', marginTop: '0.75rem' }}>
                <p style={{ fontSize: '0.75rem', color: '#374151', lineHeight: 1.6 }}><strong>64% of similar restaurants</strong> are on Uber Eats — you are not. This is your biggest visibility gap. Nando's and Five Guys both list on all three platforms and capture 40% more delivery orders than single-platform restaurants.</p>
              </div>
            </SectionCard>

            {/* Section 4 — Rating */}
            <SectionCard icon={Star} iconColor="#F59E0B" title="Customer Rating">
              <StatRow label="Your rating" yours="4.3" market="3.9" />
              <PercentileBar value={80} label="Your rating is higher than 80% of similar restaurants — this is your strongest competitive asset" color="#F59E0B" />
              <div style={{ background: 'rgba(245,158,11,0.04)', borderRadius: '8px', padding: '0.75rem', marginTop: '0.75rem' }}>
                <p style={{ fontSize: '0.75rem', color: '#374151', lineHeight: 1.6 }}>Your 4.3 rating puts you in the <strong>top 20%</strong> of your peer group. Pizza Express sits at 4.2 and Five Guys at 4.5. This rating justifies your premium pricing and should be prominently displayed in all listings.</p>
              </div>
            </SectionCard>

            {/* Section 5 — Menu Variety */}
            <SectionCard icon={Layers} iconColor="#8B5CF6" title="Menu Variety">
              <StatRow label="Item count" yours="8" market="14" />
              <PercentileBar value={30} label="You offer fewer items than 70% of similar restaurants" color="#8B5CF6" />
              <div style={{ background: 'rgba(139,92,246,0.04)', borderRadius: '8px', padding: '0.75rem', marginTop: '0.75rem' }}>
                <p style={{ fontSize: '0.75rem', color: '#374151', lineHeight: 1.6 }}>Nando's offers 22 items, Wagamama 18. A smaller menu can signal <strong>quality and focus</strong>, but it limits customer choice. Consider adding 2-3 high-margin sides or desserts to capture incremental orders without overcomplicating operations.</p>
              </div>
            </SectionCard>

            {/* AI Summary */}
            <div style={{ background: 'linear-gradient(135deg, rgba(17,17,17,0.03) 0%, rgba(17,17,17,0.01) 100%)', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem' }}>
                <Award size={14} color="#111" />
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#111', textTransform: 'uppercase', letterSpacing: '0.04em' }}>AI Summary</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#374151', lineHeight: 1.7 }}>
                Overall you are a <strong>premium-priced restaurant</strong> in a mid-range market. Your 4.3 rating is your strongest asset — it justifies your prices and puts you ahead of 80% of peers. Your biggest risk is <strong>promotion frequency</strong> — competitors like Burger King and Domino's are running 3-6 deals per month you are not matching, which may be pulling price-sensitive customers away. The single highest impact action you can take this week is <strong>getting listed on Uber Eats</strong>, where 64% of your peer group already operates.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        {!loading && (
          <div style={{ padding: '1rem 1.75rem', borderTop: '1px solid rgba(0,0,0,0.05)', background: '#FAFAF8', flexShrink: 0 }}>
            <p style={{ fontSize: '0.65rem', color: '#D1D5DB', marginBottom: '0.65rem' }}>Benchmarked against {PEER_COUNT} restaurants · data last updated 2 hours ago</p>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 2800); }} style={{ flex: 1, padding: '0.55rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.08)', background: '#fff', color: '#6B7280', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}><RefreshCw size={12} /> Re-run report</button>
              <button style={{ flex: 1, padding: '0.55rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.08)', background: '#fff', color: '#6B7280', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}><Share2 size={12} /> Share</button>
              <button style={{ flex: 1, padding: '0.55rem', borderRadius: '8px', border: 'none', background: '#111', color: '#fff', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}><Download size={12} /> Download PDF</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketPositionReport;
