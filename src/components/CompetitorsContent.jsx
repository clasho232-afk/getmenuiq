import React, { useState } from 'react';
import { Map, Maximize2, Minimize2, Star, TrendingUp, TrendingDown, Tag, Plus, Check, Search, X } from 'lucide-react';
import { MapContainer, TileLayer, Circle, Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const LONDON_CENTER = [51.5072, -0.1276];

const MOCK_COMPETITORS = [
  { id: 1, name: 'Burger King', cuisine: 'Fast Food', lat: 51.512, lng: -0.134, distance: 2.9, threat: 'red', image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=150&q=80', platforms: ['ubereats', 'deliveroo'], health: 85, promos: 2, priceChanges: 3, lastChange: 'Raised Whopper by £0.50 · 1 day ago', promoText: '2 for £5 Mix & Match' },
  { id: 2, name: 'Five Guys', cuisine: 'Burgers', lat: 51.501, lng: -0.120, distance: 3.8, threat: 'red', image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=150&q=80', platforms: ['ubereats', 'deliveroo', 'justeat'], health: 90, promos: 1, priceChanges: 0, lastChange: 'No recent changes', promoText: 'Free Delivery over £15' },
  { id: 3, name: 'Local Diner', cuisine: 'American', lat: 51.520, lng: -0.105, distance: 4.6, threat: 'amber', image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=150&q=80', platforms: ['ubereats'], health: 60, promos: 0, priceChanges: 1, lastChange: 'Reduced Shakes by £0.30 · 3 days ago' },
  { id: 4, name: 'Pizza Express', cuisine: 'Pizza', lat: 51.495, lng: -0.145, distance: 5.8, threat: 'amber', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=150&q=80', platforms: ['deliveroo'], health: 70, promos: 3, priceChanges: 2, lastChange: 'Raised Margherita by £1.50 · 2 days ago', promoText: 'Buy 1 Get 1 Free' },
  { id: 5, name: 'Vegan Heaven', cuisine: 'Vegan', lat: 51.518, lng: -0.090, distance: 5.0, threat: 'green', image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=150&q=80', platforms: ['justeat'], health: 40, promos: 0, priceChanges: 0, lastChange: 'No recent changes' },
  { id: 6, name: 'Chicken Shop', cuisine: 'Fast Food', lat: 51.490, lng: -0.110, distance: 6.6, threat: 'red', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=150&q=80', platforms: ['ubereats', 'justeat'], health: 80, promos: 1, priceChanges: 4, lastChange: 'Raised 6pc Wings by £1.00 · 4 days ago', promoText: 'Free Wings with £20 spend' },
  { id: 7, name: 'Pasta Loco', cuisine: 'Italian', lat: 51.510, lng: -0.160, distance: 6.1, threat: 'green', image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=150&q=80', platforms: ['deliveroo'], health: 45, promos: 0, priceChanges: 0, lastChange: 'No recent changes' },
];

const customIcon = L.divIcon({
  className: 'custom-leaflet-pin',
  html: `
    <div style="position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer;">
      <div class="pin-halo" style="width: 36px; height: 36px; border-radius: 50%; background: rgba(245, 158, 11, 0.2); position: absolute;"></div>
      <div class="pin-core" style="width: 12px; height: 12px; border-radius: 50%; background: #F59E0B; box-shadow: 0 2px 4px rgba(245, 158, 11, 0.5);"></div>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 18]
});

const ownerIcon = L.divIcon({
  className: 'owner-pin',
  html: `<div style="width: 24px; height: 24px; background: #111; border-radius: 50%; border: 4px solid #fff; box-shadow: 0 4px 10px rgba(0,0,0,0.2);"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

const CompetitorsContent = () => {
  const [radius, setRadius] = useState(5); // Default to 5 miles
  const [mapExpanded, setMapExpanded] = useState(false);
  const [watchlistIds, setWatchlistIds] = useState([2]); 
  const [activeTab, setActiveTab] = useState('Directory');

  const toggleWatchlist = (id, e) => {
    if (e) e.stopPropagation();
    setWatchlistIds(prev => prev.includes(id) ? prev.filter(wId => wId !== id) : [...prev, id]);
  };

  const visibleCompetitors = MOCK_COMPETITORS.filter(c => c.distance <= radius);
  const watchlistedCompetitors = MOCK_COMPETITORS.filter(c => watchlistIds.includes(c.id));
  
  const topThreats = [...MOCK_COMPETITORS]
    .sort((a, b) => {
      const threatScore = { red: 3, amber: 2, green: 1 };
      return threatScore[b.threat] - threatScore[a.threat] || b.health - a.health;
    })
    .slice(0, 3);

  const displayCompetitors = activeTab === 'Directory' ? visibleCompetitors : watchlistedCompetitors;

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Map Widget Section */}
        <div style={{ position: 'relative', height: '200px', flexShrink: 0, borderRadius: '24px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <MapContainer center={LONDON_CENTER} zoom={13} zoomControl={false} scrollWheelZoom={true} style={{ height: '100%', width: '100%', zIndex: 0 }}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='&copy; CartoDB' />
            <Marker position={LONDON_CENTER} icon={ownerIcon} />
            <Circle center={LONDON_CENTER} radius={radius * 1609.34} pathOptions={{ color: '#F59E0B', fillColor: '#F59E0B', fillOpacity: 0.08, weight: 1, dashArray: '4' }} />
            {MOCK_COMPETITORS.map(comp => {
              if (comp.distance <= radius || watchlistIds.includes(comp.id)) {
                return (
                  <Marker key={comp.id} position={[comp.lat, comp.lng]} icon={customIcon}>
                    <Tooltip direction="top" offset={[0, -15]} opacity={1}>
                      <div style={{ background: '#111', borderRadius: '12px', padding: '0.75rem', color: '#fff', fontSize: '0.8rem' }}>{comp.name}</div>
                    </Tooltip>
                  </Marker>
                );
              }
              return null;
            })}
          </MapContainer>

          <div style={{ position: 'absolute', top: '1rem', left: '1rem', right: '1rem', display: 'flex', gap: '0.5rem', zIndex: 30, alignItems: 'center' }}>
            <div style={{ flex: 1, background: '#fff', borderRadius: '9999px', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
              <Search size={16} color="#9CA3AF" />
              <input type="text" placeholder="Search" style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.85rem' }} />
            </div>
            <select style={{ background: '#fff', borderRadius: '9999px', padding: '0.5rem 1rem', border: 'none', outline: 'none', fontSize: '0.85rem', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', cursor: 'pointer' }}><option>Platform</option></select>
            <div style={{ background: '#fff', borderRadius: '9999px', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
              <span style={{ fontSize: '0.85rem' }}>{radius}mi</span>
              <input type="range" min="1" max="10" value={radius} onChange={(e) => setRadius(parseInt(e.target.value))} style={{ width: '60px', accentColor: '#111' }} />
            </div>
            <button onClick={() => setMapExpanded(true)} style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#111', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: 'none' }}>
              <Maximize2 size={16} />
            </button>
          </div>
        </div>

        {/* Top Threats Strip */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }}></div>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Top Threats</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {topThreats.map(comp => (
              <div key={comp.id} className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0 }}>{comp.name}</h3>
                    <span style={{ fontSize: '0.7rem', color: '#6B7280' }}>{comp.distance}mi away</span>
                  </div>
                  <span style={{ fontSize: '0.6rem', fontWeight: 700, padding: '0.2rem 0.4rem', borderRadius: '4px', background: comp.threat === 'red' ? '#FEE2E2' : '#FEF3C7', color: comp.threat === 'red' ? '#B91C1C' : '#B45309' }}>
                    {comp.threat === 'red' ? 'High' : 'Medium'}
                  </span>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#4B5563', fontStyle: 'italic' }}>{comp.lastChange}</div>
                {comp.promoText && (
                  <div style={{ background: '#FEF2F2', padding: '0.3rem 0.5rem', borderRadius: '6px', fontSize: '0.65rem', color: '#B91C1C', fontWeight: 600 }}>{comp.promoText}</div>
                )}
                <button style={{ marginTop: 'auto', width: '100%', padding: '0.5rem', borderRadius: '6px', background: '#111', color: '#fff', fontSize: '0.7rem', fontWeight: 600, border: 'none' }}>View profile</button>
              </div>
            ))}
          </div>
        </div>

        {/* Directory & Watchlist */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '1rem' }}>
            <button onClick={() => setActiveTab('Directory')} style={{ background: 'transparent', border: 'none', fontSize: '1rem', fontWeight: activeTab === 'Directory' ? 700 : 500, color: activeTab === 'Directory' ? '#000' : '#6B7280', cursor: 'pointer', position: 'relative' }}>
              Directory
              {activeTab === 'Directory' && <div style={{ position: 'absolute', bottom: '-1rem', left: 0, right: 0, height: '2px', background: '#000' }}></div>}
            </button>
            <button onClick={() => setActiveTab('Watchlist')} style={{ background: 'transparent', border: 'none', fontSize: '1rem', fontWeight: activeTab === 'Watchlist' ? 700 : 500, color: activeTab === 'Watchlist' ? '#000' : '#6B7280', cursor: 'pointer', position: 'relative' }}>
              Watchlist
              {activeTab === 'Watchlist' && <div style={{ position: 'absolute', bottom: '-1rem', left: 0, right: 0, height: '2px', background: '#000' }}></div>}
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {displayCompetitors.map(comp => (
              <div key={comp.id} className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{comp.name}</h3>
                  <button onClick={(e) => toggleWatchlist(comp.id, e)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                    <Star size={18} fill={watchlistIds.includes(comp.id) ? '#F59E0B' : 'none'} color={watchlistIds.includes(comp.id) ? '#F59E0B' : '#9CA3AF'} />
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                  <div style={{ background: '#F8FAFC', padding: '0.75rem', borderRadius: '12px' }}>
                    <div style={{ fontSize: '0.65rem', color: '#6B7280' }}>Health</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{comp.health}</div>
                  </div>
                  <div style={{ background: '#F8FAFC', padding: '0.75rem', borderRadius: '12px' }}>
                    <div style={{ fontSize: '0.65rem', color: '#6B7280' }}>Price Chgs</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{comp.priceChanges}</div>
                  </div>
                  <div style={{ background: '#F8FAFC', padding: '0.75rem', borderRadius: '12px' }}>
                    <div style={{ fontSize: '0.65rem', color: '#6B7280' }}>Promos</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{comp.promos}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Map Modal */}
      {mapExpanded && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }} onClick={() => setMapExpanded(false)}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }} />
          <div onClick={(e) => e.stopPropagation()} style={{ position: 'relative', width: '90%', height: '85%', background: '#fff', borderRadius: '32px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center', borderBottom: '1px solid #eee' }}>
              <div style={{ flex: 1, background: '#F3F4F6', borderRadius: '9999px', padding: '0.6rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Search size={18} color="#9CA3AF" />
                <input type="text" placeholder="Search..." style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%' }} />
              </div>
              <button onClick={() => setMapExpanded(false)} style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#F3F4F6', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ flex: 1 }}>
              <MapContainer center={LONDON_CENTER} zoom={13} zoomControl={false} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                <Marker position={LONDON_CENTER} icon={ownerIcon} />
                {MOCK_COMPETITORS.map(comp => (
                  <Marker key={`modal-${comp.id}`} position={[comp.lat, comp.lng]} icon={customIcon}>
                    <Tooltip direction="top" offset={[0, -15]} opacity={1}><div>{comp.name}</div></Tooltip>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CompetitorsContent;
