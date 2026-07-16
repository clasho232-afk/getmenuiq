const fs = require('fs');

let jsxCode = fs.readFileSync('src/components/MarketNicheContent.jsx', 'utf8');

// Change selectedModalNiche default
jsxCode = jsxCode.replace(
  'const [selectedModalNiche, setSelectedModalNiche] = useState(null);',
  'const [selectedModalNiche, setSelectedModalNiche] = useState(mockNiches[0]);'
);

// We want to replace the activeSubFilter state with our new filters logic
jsxCode = jsxCode.replace(
  "const [activePrimaryTab, setActivePrimaryTab] = useState('All');\n  const [activeSubFilter, setActiveSubFilter] = useState('Mains');",
  "const [activePrimaryTab, setActivePrimaryTab] = useState('All');"
);

// We need to rewrite the filteredNiches logic
let filteredLogicOld =   const filteredNiches = useMemo(() => {
    let niches = mockNiches;
    
    // Map Filter
    if (selectedAreaId) {
      niches = niches.filter(n => n.areaId === selectedAreaId);
    }
    
    // Primary Tab Logic
    if (activePrimaryTab === 'Suggested') {
      niches = niches.filter(n => n.parentCategory === USER_CATEGORY);
    }

    // Secondary Filter Logic (only applies when "All" is selected, as per UX note)
    if (activePrimaryTab === 'All' && activeSubFilter) {
      niches = niches.filter(n => n.itemType === activeSubFilter);
    }

    return niches;
  }, [selectedAreaId, activePrimaryTab, activeSubFilter]);;

let filteredLogicNew =   const filteredNiches = useMemo(() => {
    let niches = mockNiches;
    if (selectedAreaId) niches = niches.filter(n => n.areaId === selectedAreaId);
    
    if (activePrimaryTab === 'Suggested') {
      niches = niches.filter(n => n.parentCategory === USER_CATEGORY);
    } else if (activePrimaryTab !== 'All') {
      // Mock logic for Just Eat, Uber Eats, Deliveroo
      niches = niches.filter(n => n.category.includes('Pizza') || n.score > 85); 
    }
    return niches;
  }, [selectedAreaId, activePrimaryTab]);;

jsxCode = jsxCode.replace(filteredLogicOld, filteredLogicNew);

// Replace return statement downwards
let returnIdx = jsxCode.indexOf('  return (\n    <div className="niche-terminal-root">');
if (returnIdx === -1) {
    returnIdx = jsxCode.indexOf('  return (');
}

let preReturn = jsxCode.substring(0, returnIdx);

let newReturn = \  return (
    <div className="niche-terminal-root">
      
      {/* LEFT PANE: Niche Feed (List View) */}
      <div className="niche-feed-container">
        <div className="feed-header-wrapper" style={{ padding: '32px 32px 24px 32px' }}>
            <h1 className="feed-title sans-serif" style={{ fontSize: '24px', marginBottom: '24px' }}>
                Property List
            </h1>

            {/* SEARCH BAR */}
            <div className="search-bar-container" style={{ position: 'relative', marginBottom: '24px' }}>
              <Search size={20} color="#999" style={{ position: 'absolute', left: '16px', top: '12px' }} />
              <input type="text" placeholder="Search your property" style={{ width: '100%', padding: '12px 12px 12px 48px', borderRadius: '12px', border: '1px solid #E5E5E5', backgroundColor: '#F9FAFB', fontSize: '14px', outline: 'none' }} />
            </div>

            {/* FILTER CHIPS */}
            <div className="primary-tabs-group" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
                {['All', 'Suggested', 'Just Eat', 'Uber Eats', 'Deliveroo'].map(tab => (
                  <button 
                    key={tab}
                    className={\ilter-chip \\}
                    onClick={() => setActivePrimaryTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
            </div>
        </div>

        <div className="feed-list" style={{ padding: '0 32px 32px 32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredNiches.map((niche) => (
            <div 
              key={niche.id} 
              className={\
iche-list-row \\}
              onClick={() => {
                  setSelectedModalNiche(niche);
                  setAnalysisState('idle');
              }}
            >
              <img src={niche.image} alt={niche.name} className="row-image" />
              <div className="row-content">
                <div className="row-category">{niche.category}</div>
                <h3 className="row-title">{niche.name}</h3>
                
                <div className="row-metrics">
                  <span className="metric-highlight">{niche.stat1Value}</span> <span className="metric-separator">|</span> {niche.stat2Value} Sellers
                </div>

                {/* Progress bar mock */}
                <div className="row-progress-container">
                    <div className="row-progress-bar" style={{ width: niche.score + '%' }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANE: Detail View & Map */}
      <div className="niche-detail-container">
        {selectedModalNiche ? (
          <div className="detail-inner">
            
            {/* Image Gallery */}
            <div className="detail-gallery">
                <img src={selectedModalNiche.image} className="gallery-main" alt="Main" />
                <div className="gallery-side">
                    <img src={selectedModalNiche.image} className="gallery-sub" alt="Sub 1" />
                    <img src={selectedModalNiche.image} className="gallery-sub" alt="Sub 2" />
                </div>
            </div>

            {/* Header Info */}
            <div className="detail-header-row">
                <div className="detail-title-col">
                    <h2 className="detail-title">{selectedModalNiche.name}</h2>
                    <div className="detail-location">
                        <MapPin size={16} color="#E05046" /> Being sold in {selectedModalNiche.areas.length} areas
                    </div>
                </div>
                <div className="detail-price-col">
                    <div className="detail-price">{selectedModalNiche.stat1Value}</div>
                    <div className="detail-price-label">Avg Market Price</div>
                </div>
            </div>

            {/* Tabs */}
            <div className="detail-tabs">
                <div className="detail-tab active">Overview</div>
                <div className="detail-tab">Competitor Pricing</div>
                <div className="detail-tab">Local Rivals</div>
            </div>

            {/* Description */}
            <div className="detail-description">
                <strong>Description:</strong><br/>
                {selectedModalNiche.description}
            </div>

            {/* Stats Grid */}
            <div className="detail-stats-grid">
                <div className="stat-pill"><span className="stat-icon">??</span> {selectedModalNiche.stat3Value} Margin</div>
                <div className="stat-pill"><span className="stat-icon">??</span> {selectedModalNiche.stat2Value} Rivals</div>
                <div className="stat-pill"><span className="stat-icon">??</span> {selectedModalNiche.areas.length} Areas</div>
                <div className="stat-pill"><span className="stat-icon">??</span> High: {selectedModalNiche.highPrice}</div>
                <div className="stat-pill"><span className="stat-icon">??</span> Low: {selectedModalNiche.lowPrice}</div>
            </div>

            {/* Action Buttons */}
            <div className="detail-actions">
                <button className="action-btn secondary">Contact Agent</button>
                <button className="action-btn primary" onClick={handleAnalyze}>
                    {analysisState === 'analyzing' ? 'Analyzing...' : 'Analyze Opportunity'}
                </button>
            </div>

            {/* Mini Map at the bottom */}
            <div className="detail-minimap-container">
                <div className="minimap-overlay-card">
                    <img src={selectedModalNiche.image} alt="thumb" />
                    <div className="minimap-card-text">
                        <strong>{selectedModalNiche.name}</strong>
                        <span>Being sold in {selectedModalNiche.areas[0]}</span>
                    </div>
                </div>
                <Map
                  ref={mapRef}
                  initialViewState={{ longitude: -0.05, latitude: 51.52, zoom: 12, pitch: 0, bearing: 0 }}
                  mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
                  interactiveLayerIds={['areas-fill']}
                  onMouseMove={onMapHover}
                  onClick={onMapClick}
                >
                  <Source id="east-london" type="geojson" data={eastLondonGeojson}>
                    <Layer {...polygonFillStyle} />
                    <Layer {...polygonOutlineStyle} />
                  </Source>
                </Map>
            </div>

          </div>
        ) : (
            <div className="detail-empty">Select a niche to view details</div>
        )}
      </div>

    </div>
  );
};

export default MarketNicheContent;
\;

fs.writeFileSync('src/components/MarketNicheContent.jsx', preReturn + newReturn);
console.log('JSX rewritten');

// Now rewrite MarketNiche.css
let newCss = \
.niche-terminal-root {
    display: flex;
    width: 100%;
    height: 100vh;
    overflow: hidden;
    background: #F9FAFB;
}

/* LEFT PANE (Feed) */
.niche-feed-container {
    flex: 0 0 45%;
    height: 100vh;
    overflow-y: auto;
    background: #FFFFFF;
    border-right: 1px solid #E5E5E5;
}

.feed-header-wrapper {
    background: #FFFFFF;
    position: sticky;
    top: 0;
    z-index: 10;
}

.filter-chip {
    padding: 8px 16px;
    border-radius: 20px;
    border: 1px solid #E5E5E5;
    background: #FFFFFF;
    color: #666;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s;
}

.filter-chip:hover {
    background: #F3F4F6;
}

.filter-chip.active {
    background: #E05046;
    color: #FFF;
    border-color: #E05046;
}

.niche-list-row {
    display: flex;
    padding: 16px;
    background: #FFFFFF;
    border: 1px solid #E5E5E5;
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.2s;
    height: 160px;
}

.niche-list-row:hover {
    box-shadow: 0 8px 24px rgba(0,0,0,0.06);
    transform: translateY(-2px);
}

.niche-list-row.selected {
    border-color: #E05046;
    box-shadow: 0 8px 24px rgba(224, 80, 70, 0.1);
}

.row-image {
    width: 180px;
    height: 100%;
    object-fit: cover;
    border-radius: 12px;
    margin-right: 20px;
}

.row-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.row-category {
    font-size: 12px;
    color: #E05046;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
}

.row-title {
    font-size: 20px;
    font-weight: 700;
    color: #1A1A1A;
    margin: 0 0 12px 0;
}

.row-metrics {
    font-size: 14px;
    color: #666;
    margin-bottom: 16px;
}

.metric-highlight {
    color: #2E7D32; /* Green from screenshot */
    font-weight: 700;
}

.metric-separator {
    margin: 0 8px;
    color: #CCC;
}

.row-progress-container {
    width: 100%;
    height: 4px;
    background: #F0F0F0;
    border-radius: 2px;
    overflow: hidden;
}

.row-progress-bar {
    height: 100%;
    background: #E05046;
    border-radius: 2px;
}

/* RIGHT PANE (Detail View) */
.niche-detail-container {
    flex: 1;
    height: 100vh;
    overflow-y: auto;
    background: #F9FAFB;
    padding: 32px;
}

.detail-inner {
    background: #FFFFFF;
    border-radius: 24px;
    padding: 32px;
    box-shadow: 0 12px 40px rgba(0,0,0,0.04);
    max-width: 800px;
    margin: 0 auto;
}

.detail-gallery {
    display: flex;
    gap: 16px;
    height: 300px;
    margin-bottom: 32px;
}

.gallery-main {
    flex: 2;
    height: 100%;
    object-fit: cover;
    border-radius: 16px;
}

.gallery-side {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.gallery-sub {
    flex: 1;
    width: 100%;
    height: 142px; /* Approx half minus gap */
    object-fit: cover;
    border-radius: 16px;
}

.detail-header-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
}

.detail-title {
    font-size: 28px;
    font-weight: 700;
    color: #1A1A1A;
    margin: 0 0 8px 0;
}

.detail-location {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #666;
    font-size: 15px;
}

.detail-price-col {
    text-align: right;
}

.detail-price {
    font-size: 28px;
    font-weight: 800;
    color: #1A1A1A;
}

.detail-price-label {
    font-size: 13px;
    color: #999;
}

.detail-tabs {
    display: flex;
    border-bottom: 1px solid #E5E5E5;
    margin-bottom: 24px;
}

.detail-tab {
    padding: 12px 24px;
    font-size: 15px;
    font-weight: 600;
    color: #999;
    cursor: pointer;
    border-bottom: 3px solid transparent;
}

.detail-tab.active {
    color: #1A1A1A;
    border-bottom-color: #E05046;
}

.detail-description {
    font-size: 15px;
    line-height: 1.6;
    color: #444;
    margin-bottom: 32px;
}

.detail-stats-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 32px;
}

.stat-pill {
    padding: 10px 16px;
    background: #F9FAFB;
    border: 1px solid #E5E5E5;
    border-radius: 12px;
    font-size: 14px;
    color: #333;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 8px;
}

.detail-actions {
    display: flex;
    gap: 16px;
    margin-bottom: 40px;
}

.action-btn {
    flex: 1;
    padding: 16px;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
}

.action-btn.secondary {
    background: #F3F4F6;
    color: #E05046;
}

.action-btn.primary {
    background: #E05046;
    color: #FFFFFF;
}

.action-btn:hover {
    transform: translateY(-2px);
    opacity: 0.9;
}

/* MINIMAP STYLES */
.detail-minimap-container {
    width: 100%;
    height: 300px;
    border-radius: 16px;
    overflow: hidden;
    position: relative;
    border: 1px solid #E5E5E5;
}

.minimap-overlay-card {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    border-radius: 12px;
    padding: 8px;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.15);
    z-index: 10;
}

.minimap-overlay-card img {
    width: 48px;
    height: 48px;
    border-radius: 8px;
    object-fit: cover;
}

.minimap-card-text {
    display: flex;
    flex-direction: column;
}

.minimap-card-text strong {
    font-size: 14px;
    color: #1A1A1A;
}

.minimap-card-text span {
    font-size: 12px;
    color: #666;
}

.detail-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    font-size: 18px;
    color: #999;
}
\;

fs.writeFileSync('src/MarketNiche.css', newCss);
console.log('CSS rewritten');
