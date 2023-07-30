/**
 * Three.js(WebGL)制御用ファイル
 */
import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  Raycaster,
  AxesHelper,
  Color,
} from "three";
import gsap from "gsap";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import Stats from "stats-js";

import { utils, INode, config } from "#/helper";
import mouse from "#/component/mouse";
import scroller from "#/component/scroller";
import { Ob } from "#/glsl/Ob";

const world = {
  os: [],
  raycaster: new Raycaster(),
  tick: 0,
  composer: null,
  renderActions: new Set(),
  raycastingMeshes: [],
  init,
  adjustWorldPosition,
  render,
  addOrbitControlGUI,
  addObj,
  removeObj,
  getObjByEl,
  addPass,
  removePass,
  addRenderAction,
  removeRenderAction,
  raycast,
  addRaycastingTarget,
};

let stats;
// 画面ロード時の初期化関数
async function init(canvas, viewport, background = "none") {

  world.renderer = new WebGLRenderer({
    canvas,
    antialias: true,
    debug: window.debug,
    precision: utils.isTouchDevices ? "highp" : "mediump",
  });
  
  world.renderer.setSize(viewport.width, viewport.height, false);
  world.renderer.setPixelRatio(viewport.devicePixelRatio);
  world.renderer.setClearColor(0x000000, 0);
  
  world.scene = new Scene();
  world.scene.background =
    background === "none" ? "none" : new Color(background);

  world.camera = _setupPerspectiveCamera(viewport);

  world.composer = new EffectComposer(world.renderer);
  const renderPass = new RenderPass(world.scene, world.camera);
  world.composer.addPass(renderPass);

  await _initObj(viewport);

  if (window.debug) {
    stats = new Stats();
    document.body.appendChild(stats.dom);
  }

  _bindEvents();
}

// 各エフェクト（Obオブジェクト）の初期化関数
async function _initObj(viewport) {
  const els = INode.qsAll(`[data-${config.prefix.obj}]`);
  const prms = [...els].map((el) => {
    const type = INode.getDS(el, config.prefix.obj);

    return import(`./${type}/index.js`).then(({ default: Ob }) => {
      return Ob.init({ type, el });
    });
  });

  const _os = await Promise.all(prms);

  _os.forEach((o) => {
    if (!o.mesh) return;
    addObj(o);
  });

  await adjustWorldPosition(viewport);

  const afterPrms = world.os.map((o) => o.afterInit());
  await Promise.all(afterPrms);
}

// エフェクト（Obオブジェクト）をシーン内に追加
function addObj(o) {
  world.scene.add(o.mesh);
  world.os.push(o);
}

// エフェクト（Obオブジェクト）をシーンから削除
function removeObj(o, dispose = true) {
  world.scene.remove(o.mesh);
  const idx = world.os.indexOf(o);
  world.os.splice(idx, 1);

  if (dispose) {
    // マテリアルとジオメトリを削除
    o.mesh.material.dispose();
    o.mesh.geometry.dispose();
  }
}

// エフェクト（Obオブジェクト）をCSSセレクターで取得
function getObjByEl(selector) {
  if (selector instanceof Ob) return selector;
  const targetEl = INode.getElement(selector);
  return world.os.find((o) => o.$.el === targetEl);
}

// PerspectiveCameraをviewportから作成
function _setupPerspectiveCamera(viewport) {
  const { fov, aspect, near, far, cameraZ } = viewport;
  const camera = new PerspectiveCamera(fov, aspect, near, far);
  camera.position.z = cameraZ;
  return camera;
}

// 各エフェクトの位置調整
async function adjustWorldPosition(viewport) {
  // canvasサイズの変更
  world.renderer.setSize(viewport.width, viewport.height, false);

  // meshの位置とサイズの変更
  const pResize = world.os.map((o) => o.resize());

  // cameraのProjectionMatrixの変更
  const pCamera = updateCamera(viewport);

  // 更新が完了するのを待機
  await Promise.all([pCamera, ...pResize]);
}

// 画面幅が変更した際のカメラの更新
async function updateCamera(viewport) {
  const { fov, aspect, near, far } = viewport;
  return new Promise((resolve) => {
    gsap.to(world.camera, {
      fov,
      aspect,
      near,
      far,
      overwrite: true,
      onUpdate() {
        world.camera.updateProjectionMatrix();
      },
      onComplete() {
        resolve(world.camera);
      },
    });
  });
}

// render関数
function render() {
  requestAnimationFrame(render);

  /**
   * 注意）画面が開いている際は常にループして実行される関数のため、重い処理は書かない！！
   */
  window.debug && stats.begin();

  world.tick++;
  // スクロール処理
  for (let i = world.os.length - 1; i >= 0; i--) {
    const o = world.os[i];
    o.scroll();
    o.render(world.tick);
  }

  world.renderActions.forEach((action) => action?.(world));

  world.composer.render();

  window.debug && stats.end();
}

// Raycast計算用関数
function raycast() {
  if (
    utils.isTouchDevices ||
    world.raycastingMeshes.length === 0 ||
    scroller.scrolling
  )
    return;

  const clipPos = mouse.getClipPos();
  world.raycaster.setFromCamera(clipPos, world.camera);

  const meshes = world.raycastingMeshes;

  const intersects = world.raycaster.intersectObjects(meshes);
  const intersect = intersects[0];

  for (let i = meshes.length - 1; i >= 0; i--) {
    const _mesh = meshes[i];

    if (!_mesh.material?.uniforms) continue;

    const uHover = _mesh.material.uniforms.uHover;
    if (intersect?.object === _mesh) {
      _mesh.material.uniforms.uMouse.value = intersect.uv;
      uHover.__endValue = 1;
    } else {
      uHover.__endValue = 0;
    }

    uHover.value = utils.lerp(uHover.value, uHover.__endValue, 0.1);
  }
}

// Raycast対象への追加用関数（CSS Selectorでマウスの入力を受け取りたいエフェクトを指定）
function addRaycastingTarget(selector) {
  const o = getObjByEl(selector);

  // 2023/05/05 オブジェクトが取れてこなくてもエラーとせず、ロードが完了するように変更
  if(!o) {
    console.warn("エフェクトが取得できないため、Raycastのターゲットとして登録できませんでした。 渡されたセレクター：", selector);
    return;
  }

  if(o.mesh.children.length === 0) {
    // Meshが追加されていない場合
    world.raycastingMeshes.push(o.mesh);
  } else {
    // Meshが追加された場合
    world.raycastingMeshes.push(...o.mesh.children);
  }
}


let axesHelper = null;
// lil-guiのOrbitControlチェックボックスの追加関数
function addOrbitControlGUI(gui) {
  const isActive = { value: false };

  gui
    .add(isActive, "value")
    .name("OrbitControl")
    .onChange(() => {
      if (isActive.value) {
        axesHelper = new AxesHelper(1000);
        world.scene.add(axesHelper);
        _attachOrbitControl();
      } else {
        axesHelper?.dispose();
        _detachOrbitControl();
      }
    });
}

let orbitControl = null;
// OrbitControlの追加用関数
function _attachOrbitControl() {
  import("three/examples/jsm/controls/OrbitControls").then(
    ({ OrbitControls }) => {
      orbitControl = new OrbitControls(world.camera, world.renderer.domElement);
      world.renderer.domElement.style.zIndex = 1;
    }
  );
}

// OrbitControlの削除用関数
function _detachOrbitControl() {
  orbitControl?.dispose();
  world.renderer.domElement.style.zIndex = -1;
}

// Post Processing追加用関数
function addPass(pass) {
  world.composer.addPass(pass);
}

// Post Processing削除用関数
function removePass(pass) {
  world.composer.removePass(pass);
}

// render関数内でループして実行したい関数を追加する用の関数
function addRenderAction(callback) {
  world.renderActions.add(callback);
}

// render関数内でループして実行したい関数を削除する用の関数
function removeRenderAction(callback) {
  world.renderActions.delete(callback);
}

function _bindEvents() {
  window.addEventListener("focus", () => {
    if(utils.isIOS()) {
      // iPhone、iPadの時は画面をリロード
      window.location.reload();
    }
  });
}

export default world;
