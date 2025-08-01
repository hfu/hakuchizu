// style.json を LZ-string + URL-safe Base64 でエンコードする一時スクリプト (CommonJS)
const fs = require('fs');
const LZString = require('lz-string');

function encodeStyle(styleJson) {
  // JSONを解析してから再度最小化
  const style = JSON.parse(styleJson);
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
  
  const minifiedJson = JSON.stringify(minifiedStyle);
  const compressed = LZString.compressToBase64(minifiedJson);
  return compressed.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

const styleJson = fs.readFileSync('./public/style.json', 'utf8');
const encoded = encodeStyle(styleJson);

console.log(encoded);
