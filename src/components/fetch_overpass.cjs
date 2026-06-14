const https = require('https');
const fs = require('fs');

const query = `
[out:json][timeout:25];
area["name"="London"]->.searchArea;
(
  relation["name"="Whitechapel"]["boundary"="administrative"](area.searchArea);
  relation["name"="Bethnal Green"]["boundary"="administrative"](area.searchArea);
  relation["name"="Bow"]["boundary"="administrative"](area.searchArea);
  relation["name"="Stratford"]["boundary"="administrative"](area.searchArea);
  relation["name"="Hackney"]["boundary"="administrative"](area.searchArea);
  relation["name"="Poplar"]["boundary"="administrative"](area.searchArea);
  relation["name"="Ilford"](area.searchArea);
  relation["name"="East Ham"]["boundary"="administrative"](area.searchArea);
  relation["name"="Barking"](area.searchArea);
  relation["name"="Walthamstow"]["boundary"="administrative"](area.searchArea);
);
out geom;
`;

const options = {
  hostname: 'overpass-api.de',
  path: '/api/interpreter',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': 'MenuIQ-App'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      const results = [];
      let index = 0;
      
      json.elements.forEach(el => {
        if (el.type === 'relation' && el.members) {
          const coords = [];
          el.members.forEach(m => {
            if (m.type === 'way' && m.geometry) {
              m.geometry.forEach(g => {
                coords.push([g.lat, g.lon]);
              });
            }
          });
          
          if (coords.length > 0) {
            results.push({
              name: el.tags.name,
              bounds: coords,
              delivers: index % 2 === 0
            });
            index++;
          }
        }
      });
      
      fs.writeFileSync('c:/Users/rasib/Desktop/MenuIQ/sugar_crm_dashboard/src/components/east_london_areas.json', JSON.stringify(results, null, 2));
      console.log(`Saved ${results.length} boundaries to east_london_areas.json`);
    } catch (e) {
      console.error(e);
      console.log(data);
    }
  });
});

req.on('error', e => console.error(e));
req.write('data=' + encodeURIComponent(query));
req.end();
