/**
 * 下層ページ（diverse.html）用制御ファイル
 * 
 * 概要：data-page="sub"をキーに実行される
 */
let particles;
export default async function ({
  world,
  mouse,
  menu,
  loader,
  viewport,
  scroller,
}) {
  // 背景のモコモコのエフェクトを取得
  const fresnel = world.getObjByEl(".fresnel");
  if (fresnel) {
    // 背景のモコモコのz位置を-1000として他のエフェクトの背後に配置
    fresnel.mesh.position.z = -1000;
  }

  // パーティクルのエフェクトを取得
  particles = world.getObjByEl("#particles");

  // ローディングアニメーションの追加
  loader.addLoadingAnimation(loadAnimation);
}

function loadAnimation(tl) {
  // パーティクルのアニメーション
  tl.set({}, {
    onComplete() {
        particles.uniforms.uProgress.value = 0.5;
        particles.goTo(0, .3);
    }
  });
}
