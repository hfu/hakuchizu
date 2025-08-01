# NOTES.md

## 技術メモ / Technical Notes

このドキュメントでは、「はいから白地図」プロジェクトの技術的な詳細と実装のポイントについて説明します。

This document explains the technical details and implementation points of the "Beautiful Maps" project.

## 基本アーキテクチャ / Basic Architecture

- Viteを使用した静的サイト生成
- TypeScriptによる型安全なコード
- MapLibre GL JSによる地図表示
- LZ-stringによるスタイルJSONの圧縮
- PMTilesによるベクトルタイルの表示
- カスタムハッシュによるスタイルと地図位置の保存

## Globe投影法 / Globe Projection

MapLibre GL JS v5.6.1でGlobe投影法を使用する際の注意点：

```typescript
// 正しい実装方法 (MapLibre GL JS v5.6.1以降)
map.setProjection({type: 'globe'});

// 古い実装方法 (非推奨)
map.setProjection({name: 'globe'});
```

Globe投影法は一部の機能（point周りのアニメーション）に制限があるため、UIの設計時に考慮する必要があります。

## インタラクション設計 / Interaction Design

クリックベースの情報表示の実装：

```typescript
// 地図上の要素クリック時の処理
map.on('click', 'adm1', (e) => {
  if (e.features && e.features.length > 0) {
    // 座標を取得
    const coordinates = e.lngLat;
    
    // name_ja属性を優先的に使用し、なければname属性を使用
    const feature = e.features[0];
    const name = feature.properties?.name_ja || feature.properties?.name;
    
    // 情報ウィンドウの表示
    // ...
  }
});
```

## カスタムハッシュの実装 / Custom Hash Implementation

MapLibre GLの組み込みハッシュ機能ではなく、カスタムハッシュ処理を実装して、スタイル定義と地図位置の両方をURLハッシュに保存しています：

```typescript
// 地図の移動に応じてハッシュを更新
map.on('moveend', () => {
  const center = map.getCenter();
  const zoom = Math.round(map.getZoom() * 100) / 100;
  const newHash = styleParam ? 
    `${styleParam}&${zoom}/${center.lat.toFixed(4)}/${center.lng.toFixed(4)}` : 
    `#${zoom}/${center.lat.toFixed(4)}/${center.lng.toFixed(4)}`;
  
  window.location.hash = newHash;
});
```

## LZ-stringによるスタイル圧縮 / Style Compression with LZ-string

スタイルJSONをURLハッシュで共有するために、LZ-stringを使用して圧縮しています。

```typescript
// エンコード
const encoded = LZString.compressToEncodedURIComponent(styleJSON);

// デコード
const decoded = LZString.decompressFromEncodedURIComponent(encodedString);
```

## PMTilesのサポート / PMTiles Support

PMTilesプロトコルを使用して、ベクトルタイルを効率的に表示しています。

```typescript
const protocol = new Protocol();
maplibregl.addProtocol("pmtiles", protocol.tile);
```

## パフォーマンス最適化のポイント / Performance Optimization Points

1. イベント処理の適切な分離
2. 地図のアイドル状態検出による処理の最適化
3. スタイルとソースデータの読み込み完了イベントの活用
4. クリックイベントを使用したインタラクションの効率化

## 将来の拡張予定 / Future Extensions

1. 複数のスタイルテンプレートの追加
2. ユーザーによるスタイル編集機能
3. 地域選択時の詳細情報表示の拡張
4. モバイル対応の強化
3. 地図の共有機能の強化
4. モバイル対応の向上

## サンプルURL / Sample URLs

以下はLZ-String付きのURL例です：

1. デフォルトスタイルのみ：

   ```plaintext
   https://hfu.github.io/hakuchizu/#style=N4KABGBEBuCmBOBnAlgewHaQFxgBwBpwp0BDAW1mykHsGQEQZBpBkEiGQXzdAGdUGe1SQiSRVAV3gBjWIiqgIPAA5kALsgA2o8UUlRZATymUcMWENmp4XVZMiCFVSDPlLEWAPQOAFrNlT7T1FNkBzWKgAdL7Iss78AEaBaA4A1hoAjHGJgTaKyqYAvkSZ3FAKJBoIYjgA2qYSalDIACZWJDVkCSZV6lo6UABmipZ5arwCwh3WculifWZ8giIAtAVFxroNTS1V1iTI6LIqrTzdCgozQqgKRlYAxJ24nQAssABsq62Q+4cCsgqbsEcnZ7rnuEBTzWrxm3hIQlCGioAAZAgB2UwQbJqXIVJHVOpLRoJGYRIw1BDAniabRWT7oSgTHhTIZWNJ2YlQWmzeZE7EralQKQbLY7XaQCnfY6nRZQAFArk8IUzADutTCVASGJRklVAF08pBfAotM4SlBXO5PA5bLBAt5YOhELJ4LBYLIyCQpIEAFZSBydDCyRAOYBerY2iGxTJ++AkdD+TKpCKdVa8KTwULDI0eRwOS3oJ0+MbBULhKIxWKnWIR2T6Zx4kgoIQzHUzG0aJQORCJ5PxxOoV36eQYcTEcjDHWoCKUMDZbJAA
   ```

2. スタイルに地図位置を埋め込んだ例：

   ```plaintext
   https://hfu.github.io/hakuchizu/#style=N4KABGBEBuCmBOBnAlgewHaQFxgBwBpwp0BDAW1mykHsGQEQZBpBkEiGQXzdAGdUGe1SQiSRVAV3gBjWIiqgIPAA5kALsgA2o8UUlRZATymUcMWENmp4XVZMiCFVSDPlLEWAPQOAFrNlT7T1FNkBzWKgAdL7Iss78AEaBaA4A1hoAjHGJgTaKyqYAvkSZ3FAKJBoIYjgA2qYSalDIACZWJDVkCSZV6lo6UABmipZ5arwCwh3WculifWZ8giIAtAVFxroNTS1V1iTI6LIqrTzdCgozQqgKRlYAxJ24nQAssABsq62Q+4cCsgqbsEcnZ7rnuEBTzWrxm3hIQlCGioAAZAgB2UwQbJqXIVJHVOpLRoJGYRIw1BDAniabRWT7oSgTHhTIZWNJ2YlQWmzeZE7EralQKQbLY7XaQCnfY6nRZQAFArk8IUzADutTCVASGJRklVAF08pBfAotM4SlBXO5PA5bLBAt5YOhELJ4LBYLIyCQpIEAFZSBydDCyRAOYBerY2iGxTJ++AkdD+TKpCKdVa8KTwULDI0eRwOS3oJ0+MbBULhKIxWKnWIR2T6Zx4kgoIQzHUzG0aJQORCJ5PxxOoV36eQYcTEcjDHWoCKUMDZbJAA
   ```
