// style.json を LZ-string + URL-safe Base64 でエンコードする一時スクリプト (CommonJS)
const fs = require('fs');
const LZString = require('lz-string');

function encodeStyle(styleJson) {
  const compressed = LZString.compressToBase64(styleJson);
  return compressed.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

const styleJson = fs.readFileSync('./public/style.json', 'utf8');
const encoded = encodeStyle(styleJson);

console.log(encoded);
