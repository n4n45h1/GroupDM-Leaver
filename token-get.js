// このスクリプトを、Discordで開発者コンソールを開いて実行すると、あなたのユーザートークンを取得できます。
function getToken() {
  let a = [];
  webpackChunkdiscord_app.push([[0],,e=>Object.keys(e.c).find(t=>(t=e(t)?.default?.getToken?.())&&a.push(t))]);
  console.log(`${a}`);
  return a[0];
}
getToken();
