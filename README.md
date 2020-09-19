# template.user.js
My template for userscript.

## en:
When I create a new script, I copy whole this code, remove parts you don't need for it, adjust for site specifications, and so on.
It doesn't have enough comments, but the utilities on the latter of the code could be useful for you developers...?

### picked up features

"site.targets" to define the site specific target elements,
"core.getTargets" to wait seconds for all the target elements being ready on the site.
It's a commonly useful way for writing scripts with specified elements on a site.

"$" and "$$" is often used for aliases of querySelector and querySelectorAll in the world, and my version have a second parameter for an additional utility.

"log" has such a long code for an extraordinary alias of console.log, which outputs timecode, time differnce from the former log, a line number, caller function, and finally default arguments for easy debugging. Even it has various specifications for many debugging environments, it's not pretty often being maintained though, I can easily adjust logging outputs(a line number and caller function's name) on particular environment.

and, so, on!! 

## ja:
新しいスクリプトを作るときはまずこれを丸ごとコピーして、不要な部分を削って、サイトに合わせた定義を書いて、という流れでやっています。
コメントは充実していませんが、後半のユーティリティ群は個別にお役に立つこともあるんじゃないだろうか？

### 一部の機能紹介

"site.targets" でサイトに応じたターゲット要素を定義して、
"core.getTargets" でサイト上にそれらの要素が準備されるのを数秒間待ちます。
これはサイトの要素に応じたスクリプトを書くのに共通して使える便利な方法です。

"$" と "$$" は querySelector や querySelectorAll のエイリアスとしてよく使われますが、わたしのバージョンでは追加の第2引数をユーティリティ関数として用意しました。

"log" は console.log のエイリアスとしては異例の長さになっていますが、タイムコード、直前のlogからの経過時間、行番号、呼び出し元の関数、そして最後にデフォルトの引数を出力し、デバッグを助けます。さらに、あまり頻繁にメンテナンスはされていませんが、多くの開発環境に合わせて出力内容(行番号と呼び出し元関数名)を調整するための定義も備えているので、特定の環境に合わせた調整が簡単にできます。
