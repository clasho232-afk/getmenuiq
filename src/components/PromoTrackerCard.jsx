import React from 'react';
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import eastLondonAreas from './east_london_areas.json';

const PromoTrackerCard = ({ onClick, activeSession, promoCount = 8 }) => {
  // Map bounds logic
  const currentBoroughName = activeSession?.primaryArea || 'Ilford';
  
  const primarySector = eastLondonAreas.find(s => 
    s.name.toLowerCase().includes(currentBoroughName.toLowerCase()) || 
    (currentBoroughName === 'Ilford' && s.type === 'primary')
  );
  
  let bounds = null;
  let centerLat = 51.55;
  let centerLng = 0.08;
  if (primarySector && primarySector.bounds) {
    const lats = primarySector.bounds.map(b => b[0]);
    const lngs = primarySector.bounds.map(b => b[1]);
    bounds = [
      [Math.min(...lats), Math.min(...lngs)],
      [Math.max(...lats), Math.max(...lngs)]
    ];
    centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
    centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
  }

  // Generate mock active competitor locations near the center for visual
  const mockCompetitors = [
    { id: 1, lat: centerLat + 0.005, lng: centerLng + 0.005, threat: 'high' },
    { id: 2, lat: centerLat - 0.008, lng: centerLng + 0.002, threat: 'medium' },
    { id: 3, lat: centerLat + 0.002, lng: centerLng - 0.006, threat: 'high' },
    { id: 4, lat: centerLat - 0.004, lng: centerLng - 0.008, threat: 'medium' },
    { id: 5, lat: centerLat + 0.008, lng: centerLng - 0.002, threat: 'medium' },
  ];

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-[16px] p-6 flex flex-row items-stretch justify-between relative cursor-pointer group transition-transform duration-300 hover:-translate-y-1 overflow-hidden"
      style={{
        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.04)',
        minHeight: '260px',
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      {/* Left Pane: Tracker Metrics & Brand Toggles */}
      <div className="w-1/2 flex flex-col justify-between pr-6 z-10 relative">
        <div>
          <span className="uppercase mb-1 block" style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '700', letterSpacing: '0.08em' }}>
            Competitor Promos
          </span>
          <h2 className="text-xl font-bold text-gray-900 leading-tight mb-4">
            Promo Tracker
          </h2>
          <div className="flex items-end gap-2 mb-6">
            <span className="text-6xl font-black text-[#E86A58] leading-none tracking-tighter">{promoCount}</span>
            <div className="flex flex-col pb-1">
              <span className="text-sm font-bold text-gray-800 leading-tight">Active</span>
              <span className="text-xs font-semibold text-gray-400">Promotions</span>
            </div>
          </div>
        </div>
        
        <div>
          {/* Brand toggles / Pills */}
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-[#06C167]"></div> UberEats
            </div>
            <div className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-[#00CCBC]"></div> Deliveroo
            </div>
            <div className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-[#FF8000]"></div> JustEat
            </div>
          </div>
          
          <span className="text-xs font-bold text-gray-400 group-hover:text-[#E86A58] transition-colors">
            View Market Data →
          </span>
        </div>
      </div>

      {/* Right Pane: Map Interface */}
      <div 
        className="absolute top-0 right-0 bottom-0 w-[55%] z-0" 
        style={{ 
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 25%, black 100%)',
          maskImage: 'linear-gradient(to right, transparent 0%, black 25%, black 100%)',
          pointerEvents: 'none'
        }}
      >
        {bounds ? (
          <MapContainer 
            bounds={bounds}
            boundsOptions={{ padding: [20, 20] }}
            zoomControl={false}
            dragging={false}
            doubleClickZoom={false}
            scrollWheelZoom={false}
            attributionControl={false}
            style={{ width: '100%', height: '100%' }}
            key={currentBoroughName + '_tracker'}
          >
            <TileLayer url="https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}{r}.png" />
            
            {/* Pulsing Data Points overlay */}
            {mockCompetitors.map(comp => {
              const color = comp.threat === 'high' ? '#E63946' : '#F59E0B';
              return (
                <CircleMarker 
                  key={comp.id}
                  center={[comp.lat, comp.lng]}
                  radius={6}
                  pathOptions={{
                    color: color,
                    fillColor: color,
                    fillOpacity: 1,
                    weight: 2,
                    className: 'pulse-marker'
                  }}
                />
              );
            })}
          </MapContainer>
        ) : (
          <div className="flex items-center justify-center w-full h-full text-gray-400 text-sm font-medium">Map Unavailable</div>
        )}

        <style>{`
          @keyframes map-pulse {
            0% { filter: drop-shadow(0 0 0 rgba(230, 57, 70, 0.7)); }
            50% { filter: drop-shadow(0 0 10px rgba(230, 57, 70, 0.4)); }
            100% { filter: drop-shadow(0 0 0 rgba(230, 57, 70, 0)); }
          }
          .pulse-marker {
            animation: map-pulse 2s infinite;
          }
        `}</style>
      </div>
    </div>
  );
};

export default PromoTrackerCard;
