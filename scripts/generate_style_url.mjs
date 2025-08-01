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
  // JSONを最小化（不要なプロパティを除去し、数値を丸める）
  const minifiedStyle = JSON.parse(JSON.stringify(style, (key, value) => {
    // 数値の精度を制限（座標は小数点以下4桁、ズームは小数点以下2桁）
    if (typeof value === 'number') {
      if (key === 'zoom') {
        return Math.round(value * 100) / 100;
      } else if (key === 'bearing' || key === 'pitch') {
        return Math.round(value * 10) / 10;
      } else if (Array.isArray(style.center) && (key === '0' || key === '1')) {
        return Math.round(value * 10000) / 10000;
      }
      return Math.round(value * 1000) / 1000;
    }
    return value;
  }));
  
  const jsonString = JSON.stringify(minifiedStyle);
  const compressed = LZString.compressToBase64(jsonString);
  return compressed.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

const compressed = encodeStyle(style);
console.log(`http://localhost:5173/#style=${compressed}`);
