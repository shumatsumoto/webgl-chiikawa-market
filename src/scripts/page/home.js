/**
 * ホーム画面（index.html）用制御ファイル
 *
 * 概要：data-page="home"をキーに実行される
 */
import { initDistortionPass } from "#/glsl/distortion-text/pass";
import {
  mountNavBtnHandler,
  mountSkillBtnHandler,
  mountScrollHandler,
} from "#/component/slide-handler";
import { INode, utils } from "#/helper";

let world = null,
  _goTo = null,
  _removePass = null,
  _setProgress = null;
export default async function ({
  world: _world,
  mouse,
  menu,
  loader,
  viewport,
  scroller,
}) {
  world = _world;

  

  // .panel__mediaのマウス情報（uMouse、uHover）を監視対象へ
  const planeEls = INode.qsAll(".panel__media");
  planeEls.forEach((planeEl) => world.addRaycastingTarget(planeEl));

  // ローディング用のパスを初期化
  const { removePass, setProgress } = initDistortionPass(world);
  _setProgress = setProgress;
  _removePass = removePass;

  // ファーストビューのナビゲーションボタンにクリックイベントを追加
  const { goTo } = mountNavBtnHandler(
    ".fv__slider",
    ".fv__btn.prev",
    ".fv__btn.next",
    ".fv__text-shader"
  );

  _goTo = goTo;

  // SKILLセクションのスライダをスクロールに連動
  mountScrollHandler(".skill__slider", ".skill", ".skill__ul");

  // 背景のモコモコのエフェクトを取得
  const fresnel = world.getObjByEl(".fresnel");
  if (fresnel) {
    // 背景のモコモコのz位置を-1000として他のエフェクトの背後に配置
    fresnel.mesh.position.z = -1000;
  }

  // ファーストビューのテキストのエフェクトを取得
  const fvText = world.getObjByEl(".fv__text-shader");
  if (fvText) {
    // ファーストビューのテキストのエフェクトのz位置を200としてスライダと被らないようにする
    fvText.mesh.position.z = 200;
  }

  // VISIONセクション内のエフェクトを取得
  const raymarching = world.getObjByEl(".vision__raymarching");
  const fallback = world.getObjByEl(".vision__fallback");

  if (utils.isLowPerformanceMode()) {
    // ローパフォーマンスモードの時、高負荷のレイマーチングを削除
    world.removeObj(raymarching);
    // .vision__fallbackのエフェクトにマウス入力を連携
    world.addRaycastingTarget(".vision__fallback");
  } else {
    // 高パフォーマンスモードの時、フォールバック用の.vision__fallbackを削除
    world.removeObj(fallback);
    // レイマーチングのエフェクトにマウス入力を連携
    world.addRaycastingTarget(".vision__raymarching");
  }

  // ローディングアニメーションを追加
  loader.addLoadingAnimation(loadAnimation);
}

// ローディングアニメーション完了時の処理
function loadAnimation(tl) {
  // ファーストビューのスライドを一回転する
  _goTo(5);

  // ディストーションのパスをアニメーション
  const distorionProgress = { value: 0 };
  tl.to(distorionProgress, {
    value: 1,
    duration: 0.3,
    onUpdate() {
      // プログレスの値を更新する
      _setProgress(distorionProgress.value);
    },
    // 処理が完了すれば不要なので、パスを削除する
    onComplete: _removePass,
  });
}
