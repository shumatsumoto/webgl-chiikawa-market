/**
 * ローディング制御ファイル
 * 
 * 概要：画像、動画のローディング、ローディングアニメーションの実行
 */
import { TextureLoader, VideoTexture, LinearFilter } from "three";

import gsap from "gsap";

import { config, INode } from "#/helper";

const textureCache = new Map();
const texLoader = new TextureLoader();

window.textureCache = textureCache;

const loader = {
  init,
  loadAllAssets,
  loadImg,
  loadVideo,
  getTexByElement,
  addProgressAction,
  letsBegin,
  addLoadingAnimation,
  isLoaded: false,
};

const $ = {};

function init() {
  $.globalContainer = INode.getElement(config.$.globalContainer);
  $.loader = INode.getElement("#loader");
}

async function loadAllAssets() {
  const els = INode.qsAll(`[data-${config.prefix.obj}]`);
  for (const el of els) {
    const data = el.dataset;
    for (let key in data) {
      if (!key.startsWith(config.prefix.tex)) continue;

      const url = data[key];
      if (!textureCache.has(url)) {
        textureCache.set(url, null);
      }
    }
  }

  const texPrms = [];

  textureCache.forEach((_, url) => {
    let prms = null;

    const loadFn = /\.(mp4|webm|mov)$/.test(url) ? loadVideo : loadImg;
    prms = loadFn(url).then((tex) => {
      textureCache.set(url, tex);
    }).catch(() => {
      console.error('Media Download Error:', url);
    });

    texPrms.push(prms);
  });

  await Promise.all(texPrms);
}

async function getTexByElement(el) {
  const texes = new Map();
  const data = el.dataset;

  let mediaLoaded = null;
  let first = true;
  for (let key in data) {
    if (!key.startsWith(config.prefix.tex)) continue;

    const url = data[key];
    const tex = textureCache.get(url);

    key = key.replace("-", "");

    texes.set(key, tex);

    if (first && el instanceof HTMLImageElement) {
      mediaLoaded = new Promise((resolve) => {
        el.onload = resolve;
      });

      el.src = url;
      first = false;
    }
    if (first && el instanceof HTMLVideoElement) {
      mediaLoaded = new Promise((resolve) => {
        el.onloadeddata = resolve;
      });

      el.src = url;
      el.load();
      first = false;
    }
  }

  await mediaLoaded;

  return texes;
}

let total = 0;
let progress = 0;
let _progressAction = null;

async function loadImg(url) {
  // 読み込み対象のトータルの数値に+1
  incrementTotal();
  try {
    const tex = await texLoader.loadAsync(url);
    tex.magFilter = LinearFilter;
    tex.minFilter = LinearFilter;
    tex.needsUpdate = false;
    return tex;
  } catch(e) {
    throw new Error;
  } finally {
    // 読み込み対象のプログレスの数値に+1
    incrementProgress();
  }
}

async function loadVideo(url) {
  // 読み込み対象のトータルの数値に+1

  const video = INode.htmlToEl("<video></video>");
  let extension = url.split(".").pop();
  if (extension === "mov") {
    extension = "quicktime";
  }
  if (!video.canPlayType(`video/${extension}`)) {
    // "maybe", "probably"
    // !"" => true
    return null;
  }
  

  incrementTotal();
  return new Promise((resolve, reject) => {
    const video = INode.htmlToEl(`<video
    autoplay
    loop
    muted
    playsinline
    defaultMuted
    ></video>`);
    video.oncanplay = () => {
      const tex = new VideoTexture(video);
      // 読み込み対象のプログレスの数値に+1
      incrementProgress();
      tex.magFilter = LinearFilter;
      tex.minFilter = LinearFilter;
      video.play();
      video.oncanplay = null;
      resolve(tex);
    };
    video.onerror = () => {
      incrementProgress();
      reject();
    }
    video.src = url;
  });
}

function incrementTotal() {
  total++;
}

function incrementProgress() {
  progress++;
  if (_progressAction) {
    _progressAction(progress, total);
  }
}

function addProgressAction(_callback) {
  _progressAction = _callback;
}

function _loadingAnimationStart() {
  const tl = gsap.timeline();
  tl.to($.loader.firstElementChild, {
    opacity: 0,
    y: 10,
    duration: 0.3,
    delay: 0.5,
  })
    .set($.globalContainer, {
      visibility: "visible",
    })
    .set($.loader, {
      display: "none",
    });

  return tl;
}

async function _loadingAnimationEnd(tl) {
  const page = INode.qsAll(`${config.$.pageContainer}, #asides`);

  return new Promise(resolve => {
    tl.to(page, {
      opacity: 1,
      duration: 1,
      onComplete() {
        loader.isLoaded = true;
        resolve();
      }
    });
  })
}

let loadingAnimation = null;
function addLoadingAnimation(_loadingAnimation) {
  loadingAnimation = _loadingAnimation;
}

async function letsBegin() {
  const tl = _loadingAnimationStart();
  loadingAnimation && loadingAnimation(tl);
  return await _loadingAnimationEnd(tl);
}

export default loader;
