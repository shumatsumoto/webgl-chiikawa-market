import world from "#/glsl/world";
import { config, viewport, gui, INode, utils } from "#/helper";
import menu from "#/component/menu";
import scroller from "#/component/scroller";
import mouse from "#/component/mouse";
import loader from "#/component/loader";
import { registScrollAnimations } from "#/component/scroll-animation";

window.debug = enableDebugMode(1);

// デバッグモード：1, 非デバッグモード：0
function enableDebugMode(debug) {
  return debug && import.meta.env.DEV;
}

// サイト全体の初期化処理
export async function init() {
  try {
    const canvas = INode.getElement(config.$.canvas);
    const pageEl = INode.getElement(config.$.pageContainer);
    const pageType = INode.getDS(pageEl, config.prefix.page);
  
    if (window.debug) {
      await gui.init();
    }
  
    // ビューポート情報の初期化
    viewport.init(canvas, 2000, 1500, 4000);
  
    // パフォーマンスモードの初期化
    await utils.definePerformanceMode(3, 60);
  
    // サイトのスクローラーの初期化
    scroller.init();
  
    // ローダーの初期化
    loader.init();
  
    // ローディングの進捗情報をパーセントで表示
    const loaderPercent = INode.getElement(".loader-percent");
    loader.addProgressAction((progress, total) => {
      loaderPercent.innerHTML = Math.round((progress / total) * 100) + "%";
    });
  
    // 画像や動画（data-tex-〇としてHTMLに設定されているもの）の読み込み開始
    await loader.loadAllAssets();
  
    // Three.js（WebGL）の初期化
    const bgColor = "none";
    await world.init(canvas, viewport, bgColor);
  
    // lil-guiへのエフェクトのパラメータ追加
    addGUI(world);
  
    // ページ属性（data-page）をキーにしたページ毎の制御の初期化
    await import(`./page/${pageType}.js`).then(({ default: init }) => {
      return init({ world, mouse, menu, loader, viewport, scroller });
    });
  
    // マウス制御の初期化
    mouse.init(false, true);
  
    // 画面サイズの変更に伴う処理の追加
    viewport.addResizeAction(() => {
      world.adjustWorldPosition(viewport);
  
      mouse.resize();
    });
  
    // requestAnimationFrame毎に呼び出したい処理の追加
    world.addRenderAction(() => {
      mouse.render();
  
      // レイキャスティング
      world.raycast();
    });
  
    // スクロールに伴うアニメーションの初期化（gsap/ScrollTriggerへの登録）
    registScrollAnimations();
  
    // menuの初期化
    menu.init(world, scroller);
  
    // requestAnimationFrameによるThree.jsの描写開始
    world.render();
  
    // ローディングアニメーションの開始
    await loader.letsBegin();
  
    // ローディング完了後のアクション
    mouse.makeVisible();

  } catch (e) {
    // tryブロックでエラーが発生した際にはこちらに飛ぶ
    console.error(e);
    debugger;
  }
}

// lil-guiへの項目の追加
function addGUI(world) {
  if (window.debug) {
    gui.add(world.addOrbitControlGUI);

    gui.add((gui) => {
      gui.close();
      world.os.forEach((o) => {
        if (!o.debug) return;
        const type = INode.getDS(o.$.el, config.prefix.obj);
        const folder = gui.addFolder(type);
        folder.close();
        o.debug(folder);
      });
    });
  }
}
