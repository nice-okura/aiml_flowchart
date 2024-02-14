# AIMLのフローチャートを表示させる方法

## 前準備

- Javaをインストールしておく
- PlantUMLのjarファイルをダウンロードしておく
[[https://plantuml.com/ja/download]]

## 手順

1. index.htmlをWebブラウザで開く
1. AIMLファイルをドラッグアンドドロップする
1. PlantUMLファイル(.pu)が勝手にダウンロードされる
1. コマンドラインなどで以下のコマンドを実行する

    ```shell
    java -jar <PlantUMLのjarファイル> <puファイル>
    ```

1. puファイルと同フォルダにフローチャート（.png）が生成されている

## 補足
jarファイル実行時はいろいろオプションがある。以下参照。
[[https://plantuml.com/ja-dark/command-line]]