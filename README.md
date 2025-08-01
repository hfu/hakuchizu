# はいから白地図 / Beautiful Maps

## 概要 / Overview

「はいから白地図」は、MapLibre GL JSを使用した軽量で美しい白地図表示プロジェクトです。スタイル定義をLZ-stringでエンコードしてURLのハッシュパラメータとして利用することで、サーバーを介さずに様々なスタイルの地図を簡単に共有できます。

"Beautiful Maps" is a lightweight and elegant blank map display project using MapLibre GL JS. By encoding style definitions with LZ-string as URL hash parameters, it allows easy sharing of various map styles without going through a server.

## 機能 / Features

- MapLibre GL JSを使用した地図表示
- PMTilesのサポート
- GlobeモードによるWeb Mercator以外の投影法のサポート
- スタイル定義をLZ-stringで圧縮してURLハッシュで共有可能
- クリックによる地域情報の表示
- 地図位置とスタイルを組み合わせたURLハッシュでの共有

---

- Map display using MapLibre GL JS
- PMTiles support
- Support for projections other than Web Mercator with Globe mode
- Ability to share style definitions compressed with LZ-string via URL hash
- Display of region information with click interaction
- Sharing both map position and style via URL hash

## 使い方 / Usage

基本的なURL形式: `https://hfu.github.io/hakuchizu/#style=XXXX`

XXXXには、LZ-stringでエンコードされたMapLibre GL JSのスタイル定義が入ります。このスタイルには、地図の中心座標（center）、ズームレベル（zoom）、回転角度（bearing）、および傾斜角度（pitch）が含まれており、これらの情報も共有されます。スタイルが指定されない場合は、デフォルトのスタイルが使用されます。

Basic URL format: `https://hfu.github.io/hakuchizu/#style=XXXX`

XXXX is the MapLibre GL JS style definition encoded with LZ-string. This style includes the map's center coordinates (center), zoom level (zoom), rotation angle (bearing), and tilt angle (pitch), all of which are shared. If no style is specified, the default style will be used.

## インタラクション / Interaction

- 地図上の地域をクリックすると、その地域の情報が表示されます
- 別の場所をクリックするか、地図を移動させると情報ウィンドウは閉じます
- GlobeControlを使用して、Web Mercatorと地球儀表示を切り替えることができます

---

- Click on a region to display information about that region
- Click elsewhere or move the map to close the information window
- Use the GlobeControl to switch between Web Mercator and globe display

## プロジェクト名の由来 / Origin of the Project Name

「はいから白地図」という名前は、「はいからはくち」という曲名から取っています。また、その歌詞の中で「haikara is beautiful」と歌われていることにちなんで、英語名を "Beautiful Maps" としています。

The name "Haikara Hakuchizu" (はいから白地図) is taken from the song title "Haikara Hakuchi". Also, since the lyrics contain the phrase "haikara is beautiful", we named it "Beautiful Maps" in English.

## 開発 / Development

```bash
# 依存関係のインストール / Install dependencies
npm install

# 開発サーバーの起動 / Start development server
npm run dev

# スタイルのエンコード / Encode style
npm run encode-style

# ビルド / Build
npm run build
```

## 更新内容 / Updates

### 削除されたスクリプト

以下のスクリプトは不要となったため削除されました：

- `generate_style_url.js`
- `lzstring_stylejson.js`
- `decode-style.js`

### 新しいスクリプト

現在、スタイル生成には以下の `.mjs` ファイルを使用しています：

- `generate_style_url.mjs`: MapLibre GL JS のスタイルを生成し、LZ-String で圧縮して URL を出力します。

### URL生成例

以下は最新の URL 生成例です：

```text
http://localhost:5173/#style=N4IgbgpgTgzglgewHYgFwA4A0IkEMC2EaIgtQyDXDIHUMgnQwjYDGESALtGgNoDsALAHQCsANgCcWLgCYe6bgIC62AF4IE+NB2wwEAVygMYaUAgAOjfLkNM4AGwh7UoJgE9jxSHSYIotENsvFD+C2sYVAB6EIALJiZDYLCjJgBzCAQeBLgmcM0AIx5EEIBrBwBGAuKef0CbEABfauxLXAdoWzZQOAATYizcOnyEqC0kTuxHZ1QQbt7+weGQQ1w4Zn0Jnr6BzSGAWjoESw9iAGIAMxPTmrq2zvHcdvwir1GicaOrX3UtHSeQIxMzSr13toGJsGk1PNdbvdsPNFkxli9LJZtrt9qg2CA6LgYERMOiALx42jopJw7B4QgAfQAVrgQHIQIBlhkA7QyAU4ZAI0MgHqGQCeToBSJUAQHp07DHU4ABhFRJABIlJK85Ig1Np9MAVQxM3kC+nCk5irwHOh6-WCkAIpFGHrpBxoEU8AS1GTVIA
```

## ライセンス / License

このプロジェクトはCC0 1.0 Universal（パブリックドメイン）として公開されています。

This project is released under CC0 1.0 Universal (Public Domain).
