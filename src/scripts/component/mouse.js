/**
 * マウスカーソルの制御ファイル
 * 
 * 概要：マウスカーソルのメイン制御
 */
import { viewport, INode, utils, config } from "#/helper";
import { handlers } from "./mouse-animation";

const mousemoveActions = new Set();
const distortion = { level: 500, max: 0.4 };

const $ = {};
const current = {};
const target = {};
const delta = {};
const initial = {};
const mouse = {
  $,
  current,
  target,
  delta,
  initial,
  tick: 0,
  speed: .2,
  shouldTrackMousePos: true,
  init,
  getClipPos,
  getMapPos,
  addMousemoveAction,
  removeMousemoveAction,
  render,
  setTarget,
  startTrackMousePos,
  stopTrackMousePos,
  resize,
  makeVisible,
  isUpdate
};

function init(hideDefaultCursor = false, applyStyle = true) {
  const initial = mouse.initial = {
    x: viewport.width / 2,
    y: viewport.height / 2,
    r: 40,
    fill: "#ffffff",
    fillOpacity: 0,
    strokeWidth: 1,
    scale: 1,
    mixBlendMode: "difference"
  }

  Object.assign(current, initial);
  Object.assign(target, initial);
  Object.assign(delta, { x: 0, y: 0, scale: 1, fillOpacity: 0 });

  mouse.hideDefaultCursor = utils.isTouchDevices ? false : hideDefaultCursor;
  mouse.applyStyle = utils.isTouchDevices ? false : applyStyle;

  $.svg = _createCustomCursor();
  $.svg.style.mixBlendMode = initial.mixBlendMode;
  const circles = INode.qsAll('circle', $.svg);
  $.outerCircle = circles[0];
  $.innerCircle = circles[1];
  $.globalContainer = INode.getElement(config.$.globalContainer);

  if(mouse.applyStyle) {
    $.globalContainer.append($.svg);
  }

  if(mouse.hideDefaultCursor) {
    document.body.style.cursor = "none";
  }

  $.transforms = INode.qsAll(`[data-${config.prefix.mouse}]`);

  _bindEvents();
}

function _updateValue() {
  delta.x = target.x - current.x;
  delta.y = target.y - current.y;
  delta.scale = target.scale - current.scale;
  delta.fillOpacity = target.fillOpacity - current.fillOpacity;

  current.x += delta.x * mouse.speed;
  current.y += delta.y * mouse.speed;
  current.scale += delta.scale * mouse.speed;
  current.fillOpacity += delta.fillOpacity * mouse.speed;

  let distort = Math.sqrt(Math.pow(delta.x, 2) + Math.pow(delta.y, 2)) / distortion.level;
  distort = Math.min(distort, distortion.max);
  current.scaleX = (1 + distort) * current.scale;
  current.scaleY = (1 - distort) * current.scale;

  current.rotate = Math.atan2(delta.y, delta.x) / Math.PI * 180;
}

function _updateStyle() {
  if(!isUpdate()) return;
  $.innerCircle.setAttribute("cx", target.x);
  $.innerCircle.setAttribute("cy", target.y);

  $.outerCircle.style.transformOrigin = `${current.x}px ${current.y}px`;
  $.outerCircle.setAttribute("cx", current.x);
  $.outerCircle.setAttribute("cy", current.y);
  $.outerCircle.setAttribute("fill-opacity", current.fillOpacity);

  const rotate = `rotate(${current.rotate}deg)`;
  const scale = `scale(${current.scaleX}, ${current.scaleY})`;
  
  $.outerCircle.style.transform = `${rotate} ${scale}`;
}

function _createCustomCursor() {
  return INode.htmlToEl(`
  <svg 
    class="mouse-viewport" 
    width="${viewport.width}"
    height="${viewport.height}"
    preserveAspectRatio="none meet"
    viewBox="0 0 ${viewport.width} ${viewport.height}"
    style="opacity: 0; transition: opacity 1s;"
    >
    <g class="mouse-wrapper">
      <circle 
        class="circle outer"
        r="${current.r}"
        cx="${current.x}"
        cy="${current.y}"
        fill="${current.fill}"
        fill-opacity="${current.fillOpacity}"
        stroke="${current.fill}"
        stroke-width="${current.strokeWidth}"
        style="transform-origin: ${current.x}px ${current.y}px"
      ></circle>
      <circle 
        class="circle outer"
        r="${3}"
        cx="${current.x}"
        cy="${current.y}"
        fill="${current.fill}"
        style="transform-origin: ${current.x}px ${current.y}px"
      ></circle>
    </g>
  </svg>
  `);
}

function _updatePosition(event) {
  target.x = event.clientX;
  target.y = event.clientY;
  mouse.tick++;
}

function getClipPos() {
  return {
    x: (current.x / viewport.width) * 2 - 1,
    y: -(current.y / viewport.height) * 2 + 1,
  };
}

function getMapPos(width, height) {
  const clipPos = getClipPos();
  return {
    x: clipPos.x * width / 2, 
    y: clipPos.y * height / 2
  }
}

function render() {
  if(utils.isTouchDevices) return;

  _updateValue();

  if(!mouse.applyStyle) return;
  
  _updateStyle();
}

function _bindEvents() {
  const globalContainer = INode.getElement(config.$.globalContainer);
  globalContainer.addEventListener(config.event.mousemove, (event) => {
    mousemoveActions.forEach(action => action?.(mouse));
    if(mouse.shouldTrackMousePos) {
      _updatePosition(event);
    }
  });

  $.transforms.forEach(el => {
    const handlerType = INode.getDS(el, config.prefix.mouse);
    const handler = handlers[handlerType];
    
    if(!handler) return;

    Object.entries(handler).forEach(([mouseType, action]) => {
      el.addEventListener(`pointer${mouseType}`, (event) => {
        action(mouse, event);
      });
    });
  })
}

function setTarget(newTarget) {
  Object.assign(target, newTarget);
}

function addMousemoveAction(callback) {
  mousemoveActions.add(callback);
}

function removeMousemoveAction(callback) {
  mousemoveActions.delete(callback);
}

function startTrackMousePos() {
  mouse.shouldTrackMousePos = true;
}

function stopTrackMousePos() {
  mouse.shouldTrackMousePos = false;
}

function resize() {
  if(!mouse.applyStyle) return;
  $.svg.setAttribute('width', viewport.width);  
  $.svg.setAttribute('height', viewport.height);  
  $.svg.setAttribute('viewBox', `0 0 ${viewport.width} ${viewport.height}`);
}

function isUpdate() {
  return current.x !== target.x || current.y !== target.y;
}

function makeVisible() {
  const intervalId = setInterval(() => {
    if(!mouse.applyStyle) return clearInterval(intervalId);
    if(!isUpdate()) return;
    $.svg.style.opacity = 1;
    clearInterval(intervalId);
  }, 300);
}

export default mouse;
