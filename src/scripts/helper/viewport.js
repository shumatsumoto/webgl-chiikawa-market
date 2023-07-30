/**
 * ビューポート（画面表示状態）の制御ファイル
 * 
 * 概要：画面の表示状態のパラメータの管理、画面のリサイズ制御、カメラの設定値の保持
 */
import { INode, config } from "#/helper";

const viewport = {
  init,
  addResizeAction,
  removeResizeAction,
  isMobile
};

const $ = {};
const actions = new Set;

let initialized = false;
function init(canvas, cameraZ = 2000, near = 1500, far = 4000) {
  $.canvas = canvas;

  const rect = INode.getRect(canvas);

  viewport.width = rect.width;
  viewport.height = rect.height;
  viewport.near = near;
  viewport.far = far;
  viewport.cameraZ = cameraZ;
  viewport.aspect = viewport.width / viewport.height;
  viewport.rad = 2 * Math.atan(viewport.height / 2 / cameraZ);
  viewport.fov = viewport.rad * (180 / Math.PI);
  viewport.devicePixelRatio = 1; // window.devicePixelRatioとするとインテルMacの場合結構重くなるため注意;

  if(!initialized) {
    _bindEvents();
    initialized = true;
  }

  return viewport;
}

function _update() {
    const { near, far, cameraZ } = viewport;
    viewport.init($.canvas, cameraZ, near, far);
}

function _bindEvents() {
  let timerId = null;

  window.addEventListener(config.event.resize, () => {
    _onResize();
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      _onResize();
    }, 500);
  });
}

function _onResize() {
    _update();
    actions.forEach(action => action(viewport));
}

function isMobile() {
  return viewport.width < config.breakpoint;
}

function addResizeAction(callback) {
  actions.add(callback);
}

function removeResizeAction(callback) {
  actions.delete(callback);
}

export { viewport };
