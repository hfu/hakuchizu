import LZString from 'lz-string';

const style = {
  version: 8,
  name: 'キルギス',
  center: [74.5698, 42.8746],
  zoom: 7,
  sources: {
    openmaptiles: {
      type: 'vector',
      url: 'pmtiles://https://optgeo.github.io/ky1/ky1.pmtiles'
    }
  },
  layers: [
    {
      id: 'background',
      type: 'background',
      paint: {
        'background-color': '#ffffff'
      }
    },
    {
      id: 'adm1',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'adm1',
      paint: {
        'fill-color': [
          'case',
          ['==', ['get', 'name_ja'], 'ビシュケク特別市'], '#ffff00',
          ['==', ['get', 'name_ja'], 'オシ特別市'], '#ffff00',
          '#cccccc'
        ],
        'fill-opacity': 0.6
      }
    }
  ]
};

function encodeStyle(style) {
  const jsonString = JSON.stringify(style);
  const compressed = LZString.compressToBase64(jsonString);
  return compressed.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

const compressed = encodeStyle(style);
console.log(`http://localhost:5173/#style=${compressed}`);
