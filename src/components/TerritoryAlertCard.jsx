import React from 'react';
import { MapContainer, TileLayer, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import eastLondonAreas from './east_london_areas.json';

const TerritoryAlertCard = ({ onClick }) => {
  // 1. Identify primary sector
  const primarySector = eastLondonAreas.find(s => s.type === 'primary' || s.name === 'Ilford');
  
  // 2. AUTOMATION TRICK: Self-calculate the bounding box of the primary polygon
  let bounds = null;
  if (primarySector && primarySector.bounds) {
    const lats = primarySector.bounds.map(b => b[0]);
    const lngs = primarySector.bounds.map(b => b[1]);
    bounds = [
      [Math.min(...lats), Math.min(...lngs)],
      [Math.max(...lats), Math.max(...lngs)]
    ];
  }

  return (
    <button 
      onClick={onClick}
      className="glass-panel rounded-2xl shadow-sm border border-[rgba(0,0,0,0.05)] bg-[#FAF8F4] flex flex-row"
      style={{
        padding: '2rem 0 2rem 2rem',
        alignItems: 'stretch',
        justifyContent: 'space-between',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.2s',
        marginBottom: '0',
        width: '100%',
        boxSizing: 'border-box',
        position: 'relative',
        minHeight: '260px'
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      {/* Left Content: Clean Primary Isolated Focus */}
      <div className="w-1/2" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingRight: '1rem', zIndex: 2 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Primary Area</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#28a745' }} />
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111' }}>{primarySector ? primarySector.name : 'Ilford'}</span>
          </div>
        </div>
      </div>

      {/* Right Column: Isolated Mini-Map Component */}
      <div className="w-1/2" style={{ zIndex: 1, position: 'relative', paddingRight: '2rem' }}>
        <div 
          className="dashboard-mini-map-container"
          style={{ 
            width: '100%', 
            height: '100%', 
            pointerEvents: 'none', 
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.04)',
            background: '#FAFAFA'
          }}
        >
          {bounds && (
            <MapContainer 
              bounds={bounds}
              boundsOptions={{ padding: [15, 15] }}
              zoomControl={false}
              dragging={false}
              doubleClickZoom={false}
              scrollWheelZoom={false}
              attributionControl={false}
              style={{ width: '100%', height: '100%' }}
            >
              {/* Premium, high-end monochrome base map */}
              <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
              
              {/* Isolated Polygon Rendering */}
              <Polygon 
                positions={primarySector.bounds}
                pathOptions={{ 
                  color: '#28a745',     // Crisp, soft emerald green boundary line
                  weight: 1.5,          // Delicate stroke width
                  fillOpacity: 0.0,     // COMPLETELY TRANSPARENT FILL
                  lineCap: "round",
                  lineJoin: "round",
                  className: 'dashboard-mini-map-polygon'
                }}
              />
            </MapContainer>
          )}
        </div>
      </div>

      <style>{`
        .dashboard-mini-map-polygon {
          filter: drop-shadow(0px 1px 2px rgba(40, 167, 69, 0.15));
        }
      `}</style>
    </button>
  );
};

export default TerritoryAlertCard;
