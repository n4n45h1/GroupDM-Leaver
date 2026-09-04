# Discord Group DM Leaver

Discord のグループDMを一覧表示し、複数まとめて退室できるブラウザツールです。  
A browser tool to list and leave multiple Discord Group DMs in bulk.

> [!WARNING]
> ユーザートークン利用は Discord の利用規約に抵触する可能性があります。自己責任で利用してください。

## 主な機能

- グループDMの一覧取得
- 複数DMの一括選択 / 一括退室
- 退室前メッセージ送信（任意）
- ユーザー名・ユーザーID・グループ名フィルター
- 日本語 / 英語切替
- ダーク / ライトテーマ切替
- 退室結果ログと成功/失敗サマリー

## 使い方

1. https://n4n45h1.github.io/GroupDM-Leaver/ を開く
2. Discordユーザートークンを入力して接続
3. 退室対象のグループDMを選択
4. 必要なら以下を設定
   - 退室前メッセージ
   - フィルター条件
5. 「選択したグループDMを退室」を実行

## セキュリティと注意事項

- このツールはクライアントサイドのみで動作します（専用バックエンドなし）
- 入力したトークンはブラウザのローカルストレージに保存されます
- 公共PCや共有環境では利用後に必ずログアウトしてください
- Discord API の仕様変更により動作が変わる可能性があります

## ファイル構成

- `/index.html` : UI構造
- `/styles.css` : テーマとレイアウト
- `/script.js` : Discord API連携とUIロジック
- `/token-get.js` : 開発者向けトークン取得補助スニペット

## 開発者

- Nanachi ([@n4n45h1](https://github.com/n4n45h1))

## バグ報告

- Discord: [@xgwn](https://discord.com/users/xgwn)
- GitHub Issues: https://github.com/n4n45h1/GroupDM-Leaver/issues

## License

MIT
