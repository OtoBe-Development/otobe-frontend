# What is OtoBe?

OtoBeとは

- ブラウザとWebCamだけ(インストール不要)で
- バ美肉(バーチャル美しい肉体)が手に入る
- Webサービス

# デモページ
下記よりOtoBeをお試しいただけます

## https://otobe-development.github.io/otobe-frontend/

# 使い方
1. デモページor自分で展開したページを開き、右上の「TRY NOW」をクリック
1. 背景や表示サイズを好きなように設定し、「起動」ボタンをクリック
1. バ美肉画面用のウインドウが開きますが、「カメラとマイクの使用許可」が求められます。これを許可してください
1. カメラが自分の顔をキャプチャしてくれるまで少し待ちましょう
    - うまくキャプチャしてくれない場合、顔とカメラの距離を調整して止まるとうまくいくことが多いです
1. キャプチャしてくれたら色々、顔を動かしたり表情を変えてみましょう！

# ビルド方法

## 動作環境

- ツールは下記環境で動作確認をしています
  - nvm：Running version 1.1.7.
  - node：v14.18.1
  - npm：6.14.15
  - yarn：1.22.17
  - vue：@vue/cli 4.5.14

## ローカルでのビルド方法

1. GitHubから資産をクローンします
1. 下記コマンドで依存ライブラリを収集します
    - ```yarn install```
1. 下記コマンドでビルドします
    - ```yarn build```
1. distディレクトリ配下の資産をサーバに配備し、ブラウザから「配備した環境のURL/otobe-frontend/」にアクセスします

開発用にローカルで動かす場合、手順2の後、 ```yarn serve``` して動かしてください。