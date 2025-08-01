// MapLibre GL JS のスタイル（コントロールUI用）
import 'maplibre-gl/dist/maplibre-gl.css';
import './style.css';
import maplibregl, { GlobeControl, NavigationControl, Map, ProjectionSpecification } from 'maplibre-gl';
import { PMTiles, Protocol } from 'pmtiles';
import LZString from 'lz-string';

// アプリケーションの初期化
const app = document.getElementById('app');
app!.innerHTML = `
  <div id="map" style="width:100vw;height:100vh;"></div>
  <div id="feature-info" class="feature-info"></div>
`;

// 共通ロジックのユーティリティ化
function extractStyleFromHash(hash: string): string | null {
  if (hash.startsWith('#style=')) {
    return hash.slice(7).split('&')[0];
  }
  return null;
}

function encodeStyle(style: any): string {
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

function decodeStyle(encoded: string): any | null {
  try {
    const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const padding = base64.length % 4;
    const paddedBase64 = base64 + '='.repeat(padding ? 4 - padding : 0);
    const decompressed = LZString.decompressFromBase64(paddedBase64);
    return JSON.parse(decompressed);
  } catch (e) {
    console.error('スタイルデコード失敗', e);
    return null;
  }
}

function updateStyleHash(map: Map) {
  const center = map.getCenter();
  const updatedStyle = {
    ...map.getStyle(),
    center: [center.lng, center.lat],
    zoom: map.getZoom(),
    bearing: map.getBearing(),
    pitch: map.getPitch(),
  };
  const encodedStyle = encodeStyle(updatedStyle);
  window.location.hash = `#style=${encodedStyle}`;
}

function setCursorStyle(map: Map, layer: string, cursorStyle: string) {
  map.on('mousemove', layer, () => {
    map.getCanvas().style.cursor = cursorStyle;
  });
  map.on('mouseleave', layer, () => {
    map.getCanvas().style.cursor = '';
  });
}

function updateFeatureInfo(map: Map, element: HTMLElement, name: string, properties: any, coordinates: maplibregl.LngLat) {
  element.innerHTML = `
    <h2>${name}</h2>
    <p>${properties?.name_en || ''} / ${properties?.name_ky || ''} / ${properties?.name_ru || ''}</p>
  `;
  const point = map.project(coordinates);
  element.style.left = `${point.x}px`;
  element.style.top = `${point.y}px`;
  element.style.display = 'block';
}

function setupEventListeners(map: Map) {
  const featureInfoElement = document.getElementById('feature-info');
  let activePopup = false;

  setCursorStyle(map, 'adm1', 'pointer');

  map.on('click', 'adm1', (e) => {
    if (e.features && e.features.length > 0 && featureInfoElement) {
      const coordinates = e.lngLat;
      const feature = e.features[0];
      const name = feature.properties?.name_ja || feature.properties?.name;
      console.log('Feature properties:', feature.properties);

      if (name) {
        updateFeatureInfo(map, featureInfoElement, name, feature.properties, coordinates);
        activePopup = true;
      }
    }
  });

  map.on('click', (e) => {
    if (activePopup && featureInfoElement) {
      const features = map.queryRenderedFeatures(e.point, { layers: ['adm1'] });
      if (features.length === 0) {
        featureInfoElement.style.display = 'none';
        activePopup = false;
      }
    }
  });

  map.on('movestart', () => {
    if (featureInfoElement) {
      featureInfoElement.style.display = 'none';
      activePopup = false;
    }
  });
}

function setupCustomHash(map: Map, initialStyle: any) {
  const hash = window.location.hash;
  const styleParam = extractStyleFromHash(hash);

  map.on('moveend', () => {
    updateStyleHash(map);
  });

  window.addEventListener('hashchange', () => {
    const hash = window.location.hash;
    if (!hash) return;
    const styleParam = extractStyleFromHash(hash);
  }, false);
}

async function setupMap() {
  let style = getStyleFromHash();
  if (!style) {
    style = await getDefaultStyle();
  }

  console.log('Decoded style:', style);

  const protocol = new Protocol();
  maplibregl.addProtocol("pmtiles", protocol.tile);

  const map = new Map({
    container: 'map',
    style
  });

  map.on('load', () => {
    map.setProjection({type: 'globe'});
    map.addControl(new NavigationControl(), 'top-right');
    map.addControl(new GlobeControl(), 'top-right');
    setupEventListeners(map);
  });

  setupCustomHash(map, style);

  return map;
}

async function getDefaultStyle(): Promise<any> {
  try {
    const response = await fetch('./style.lz.txt');
    if (response.ok) {
      const encodedText = await response.text();
      return decodeStyle(encodedText);
    }
  } catch (e) {
    console.warn('style.lz.txtからのデコードに失敗、組み込みデフォルトスタイルを使用します', e);
  }

  const defaultLZ = 'N4KABGBEBuCmBOBnAlgewHaQFxgBwBpwp0BDAW1mykHsGQEQZBpBkEiGQXzdAGdUGe1SQiSAY1nQAXBFQDaAdgAsAOgCsANgCcBMJIBM03FPkBdblABeqVGSqT9kAEawS8ZOgDmVAAwWADskG8AFi4uJUAFd4fkQqUAgeVDcBMhI3QWQAG1gwnAjInkEATxiqGFheQVR4LiJMyGCk_LcyRJTELAB6Ju9BQTdGlujBB1hUaQdPb0DLaTQmgGtsgEYp2ela-tTIcrAAXyJ1iySSbIQ0sFE1jIrkABN8yxJeSYd4IPRL_QqcvJwrG7uHwKeyzJ4bhI9kE4TWFWut3uj3OAFpeKgkiV8gBiABmuDRkjRzlWAI2a22J3BUAu-RI5zIM3-AMgb0oHzRyWqL0ikACwX4-WisXiyzCrJ4HJCsFhu32pQ-FKpNIqQJBYPxPCZSSS8MRyI-6OcOJxstpKrVQUESXsooRSMlUBRvFtdrxAM2mSdYB0IE2QA';
  return decodeStyle(defaultLZ);
}

function getStyleFromHash(): any {
  const hash = window.location.hash;
  if (hash.startsWith('#style=')) {
    const styleParam = hash.slice(7);
    return decodeStyle(styleParam);
  }
  return null;
}

setupMap();
