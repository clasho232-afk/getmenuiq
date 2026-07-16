const fs = require('fs');
let code = fs.readFileSync('src/components/MarketNicheContent.jsx', 'utf8');

const mapStartStr = '      {/* LEFT COLUMN: Map Canvas */}';
const feedStartStr = '      {/* RIGHT COLUMN: Data Feed */}';
const modalStartStr = '      {/* MODAL OVERLAY */}';

let mapStart = code.indexOf(mapStartStr);
let feedStart = code.indexOf(feedStartStr);
let modalStart = code.indexOf(modalStartStr);

let preMap = code.substring(0, mapStart);
let mapContent = code.substring(mapStart, feedStart);
let feedContent = code.substring(feedStart, modalStart);
let modalContentAndEnd = code.substring(modalStart);

let newModal = modalContentAndEnd
  .replace('      {/* MODAL OVERLAY */}', '        {/* MAP OVERLAY PANEL */}')
  .replace('<div className="niche-modal-overlay" onClick={() => setSelectedModalNiche(null)}>', '')
  .replace('<div className="niche-modal-content" onClick={e => e.stopPropagation()}>', '<div className="niche-detail-panel" onClick={e => e.stopPropagation()}>');

newModal = newModal.replace('          </div>\r\n        </div>\r\n      )}\r\n\r\n    </div>', '        </div>\r\n      )}\r\n    </div>');
newModal = newModal.replace('          </div>\n        </div>\n      )}\n\n    </div>', '        </div>\n      )}\n    </div>');

let mapContentTrimmed = mapContent.trimEnd();
let idx = mapContentTrimmed.lastIndexOf('</div>');
if (idx > -1) {
    mapContentTrimmed = mapContentTrimmed.substring(0, idx);
}

let newCode = preMap + feedContent + mapContentTrimmed + '\n' + newModal + '\n      </div>\n';

fs.writeFileSync('src/components/MarketNicheContent.jsx', newCode);
console.log('Done script');
