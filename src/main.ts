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

/**
 * URLハッシュからスタイル定義を取得する
 */
function getStyleFromHash(): any {
  const hash = window.location.hash;
  if (hash.startsWith('#style=')) {
    const styleParam = hash.slice(7);
    try {
      const decoded = LZString.decompressFromEncodedURIComponent(styleParam);
      return JSON.parse(decoded);
    } catch (e) {
      console.error('スタイルデコード失敗', e);
    }
  }
  return null;
}

/**
 * デフォルトスタイルをLZ-stringから取得する
 */
async function getDefaultStyle(): Promise<any> {
  try {
    // まずstyle.lz.txtからデコードを試みる
    const response = await fetch('./style.lz.txt');
    if (response.ok) {
      const lzText = await response.text();
      const decoded = LZString.decompressFromEncodedURIComponent(lzText);
      return JSON.parse(decoded);
    }
  } catch (e) {
    console.warn('style.lz.txtからのデコードに失敗、組み込みデフォルトスタイルを使用します', e);
  }

  // 組み込みデフォルトスタイル
  const defaultLZ = 'N4KABGBEBuCmBOBnAlgewHaQFxgBwBpwp0BDAW1mykHsGQEQZBpBkEiGQXzdAGdUGe1SQiSAY1nQAXBFQDaAdgAsAOgCsANgCcBMJIBM03FPkBdblABeqVGSqT9kAEawS8ZOgDmVAAwWADskG8AFi4uJUAFd4fkQqUAgeVDcBMhI3QWQAG1gwnAjInkEATxiqGFheQVR4LiJMyGCk-LcyRJTELAB6Ju9BQTdGlujBB1hUaQdPb0DLaTQmgGtsgEYp2ela+tTIcrAAXyJ1iySSbIQ0sFE1jIrkABN8yxJeSYd4IPRL-QqcvJwrG7uHwKeyzJ4bhI9kE4TWFWut3uj3OAFpeKgkiV8gBiABmuDRkjRzlWAI2a22J3BUAu+RI5zIM3+AMgb0oHzRyWqL0ikACwX4+WisXiyzCrJ4HJCsFhu32pQ+FKpNIqQJBYPxPCZSSS8MRyI+6OcOJxstpKrVQUESXsooRSMlUBRvFtdrxAM2mSdYB0IE2QA';
  try {
    const decoded = LZString.decompressFromEncodedURIComponent(defaultLZ);
    return JSON.parse(decoded);
  } catch (e) {
    console.error('デフォルトスタイルデコード失敗', e);
    return {};
  }
}

/**
 * メインの地図セットアップ関数
 */
async function setupMap() {
  // スタイルの取得
  let style = getStyleFromHash();
  if (!style) {
    style = await getDefaultStyle();
  }

  // デバッグ用: デコードしたスタイルをログに出力
  console.log('Decoded style:', style);

  // PMTiles プロトコルをMapLibre GL JSに登録
  const protocol = new Protocol();
  maplibregl.addProtocol("pmtiles", protocol.tile);

  // 地図インスタンス作成
  const map = new Map({
    container: 'map',
    style
  });

  // 地図のロードが完了した時の処理
  map.on('load', () => {
    // globe projection を明示的に有効化
    // @ts-ignore - MapLibre GL JSの最新バージョンでの設定方法
    map.setProjection({type: 'globe'});
    
    // コントロールの追加
    map.addControl(new NavigationControl(), 'top-right');
    map.addControl(new GlobeControl(), 'top-right');
    
    // イベントリスナーの設定
    setupEventListeners(map);
  });

  // スタイルデータがロードされた時の処理
  map.on('styledata', () => {
    // console.log('Style data loaded'); // 削除
  });

  // ソースデータがロードされた時の処理
  map.on('sourcedata', (e) => {
    if (e.isSourceLoaded && e.sourceId) {
      // console.log(`Source ${e.sourceId} loaded`); // 削除
    }
  });

  // アイドル状態（データロード完了、レンダリング待機）の時の処理
  map.on('idle', () => {
    console.log('Map is idle');
  });

  // カスタムハッシュ処理
  setupCustomHash(map, style);

  return map;
}

/**
 * 地図上のイベントリスナーをセットアップ
 */
function setupEventListeners(map: Map) {
  // クリックした要素の情報表示用要素
  const featureInfoElement = document.getElementById('feature-info');
  let activePopup = false;
  
  // 地図上の要素へのホバー時のカーソル変更
  map.on('mousemove', 'adm1', () => {
    map.getCanvas().style.cursor = 'pointer';
  });
  
  map.on('mouseleave', 'adm1', () => {
    map.getCanvas().style.cursor = '';
  });
  
  // 地図上の要素クリック時の処理
  map.on('click', 'adm1', (e) => {
    // クリックした場所がある場合
    if (e.features && e.features.length > 0 && featureInfoElement) {
      // 座標を取得
      const coordinates = e.lngLat;
      
      // name_ja属性を優先的に使用し、なければname属性を使用
      const feature = e.features[0];
      const name = feature.properties?.name_ja || feature.properties?.name;
      
      // デバッグ用: feature.propertiesの内容をログに出力
      console.log('Feature properties:', feature.properties);
      
      if (name) {
        // 情報ウィンドウの表示
        featureInfoElement.innerHTML = `
          <h2 style="margin: 0; font-size: 1.5em; font-weight: bold;">${name}</h2>
          <p style="margin: 0; font-size: 0.8em; color: #666;">
            ${feature.properties?.name_en || ''} / 
            ${feature.properties?.name_ky || ''} / 
            ${feature.properties?.name_ru || ''}
          </p>
        `;

        // 情報ウィンドウを表示する位置を設定
        const point = map.project(coordinates);
        featureInfoElement.style.left = `${point.x}px`;
        featureInfoElement.style.top = `${point.y}px`;
        featureInfoElement.style.display = 'block';
        activePopup = true;
      }
    }
  });
  
  // 地図の他の場所をクリックした時に情報ウィンドウを閉じる
  map.on('click', (e) => {
    if (activePopup && featureInfoElement) {
      // クリックした場所が地図上の要素でない場合
      const features = map.queryRenderedFeatures(e.point, {
        layers: ['adm1']
      });
      
      if (features.length === 0) {
        featureInfoElement.style.display = 'none';
        activePopup = false;
      }
    }
  });
  
  // 地図の移動時に情報ウィンドウを閉じる
  map.on('movestart', () => {
    if (featureInfoElement) {
      featureInfoElement.style.display = 'none';
      activePopup = false;
    }
  });
}

/**
 * カスタムハッシュ処理をセットアップ
 * style=XXXXとz/lat/lngを共存させる
 */
function setupCustomHash(map: Map, initialStyle: any) {
  // 現在のハッシュからスタイル部分を抽出
  let styleParam = '';
  const hash = window.location.hash;
  if (hash.startsWith('#style=')) {
    const parts = hash.split('&');
    if (parts.length > 0 && parts[0].startsWith('#style=')) {
      styleParam = parts[0];
    }
  }

  // 地図の移動に応じてハッシュを更新
  map.on('moveend', () => {
    const center = map.getCenter();
    const zoom = map.getZoom();

    // style.json を更新
    const updatedStyle = { ...map.getStyle(), center: [center.lng, center.lat], zoom };
    console.log('Style before compression:', JSON.stringify(updatedStyle));

    // LZ-String で圧縮
    const compressedStyle = LZString.compressToEncodedURIComponent(JSON.stringify(updatedStyle));

    // ハッシュを更新（zoom/lat/lng を含めない）
    window.location.hash = `#style=${compressedStyle}`;
  });

  // ハッシュの変更を監視して地図を更新
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash;
    if (!hash) return;

    // スタイルとマップ位置を分離
    let styleParam = '';
    let mapParam = '';

    if (hash.includes('&')) {
      const parts = hash.split('&');
      styleParam = parts[0];
      mapParam = parts[1];
    } else if (hash.startsWith('#style=')) {
      styleParam = hash;
    } else {
      mapParam = hash.substring(1); // # を除去
    }

    // マップ位置パラメータの処理
    if (mapParam) {
      const parts = mapParam.split('/');
      if (parts.length >= 3) {
        const zoom = parseFloat(parts[0]);
        const lat = parseFloat(parts[1]);
        const lng = parseFloat(parts[2]);
        
        if (!isNaN(zoom) && !isNaN(lat) && !isNaN(lng)) {
          map.jumpTo({
            center: [lng, lat],
            zoom
          });
        }
      }
    }
  }, false);
}

// アプリケーション初期化
setupMap();
