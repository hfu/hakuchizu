// style.json を LZ-string + URL-safe Base64 でエンコードする一時スクリプト (CommonJS)
const fs = require('fs');
const LZString = require('lz-string');

const styleJson = fs.readFileSync('./public/style.json', 'utf8');
const compressed = LZString.compressToEncodedURIComponent(styleJson);

console.log(compressed);
