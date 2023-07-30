/**
 * 汎用関数
 * 
 * 
 */
import { Vector4, Vector3, Quaternion } from "three";
import { detect as detectBrowser } from "detect-browser";
import { getGPUTier } from 'detect-gpu';

const browser = detectBrowser();

// タッチデバイス判定フラグ
const isTouchDevices = Boolean("ontouchstart" in window || (window.DocumentTouch && document instanceof DocumentTouch));

// 線形補間
function lerp(a, b, n, limit = 0.001) {
  let current = (1 - n) * a + n * b;
  if (Math.abs(b - current) < limit) current = b;
  return current;
}

// テクスチャのアスペクト値の算出
function getResolutionUniform(toRect, mediaRect) {
  const { width: toW, height: toH } = toRect;
  const resolution = new Vector4(toW, toH, 1, 1);

  if (!mediaRect) return resolution;

  const { width: mediaW, height: mediaH } = mediaRect;

  const mediaAspect = mediaH / mediaW;
  const toAspect = toH / toW;

  let xAspect, yAspect;
  if (toAspect > mediaAspect) {
    xAspect = (1 / toAspect) * mediaAspect;
    yAspect = 1;
  } else {
    xAspect = 1;
    yAspect = toAspect / mediaAspect;
  }

  resolution.z = xAspect;
  resolution.w = yAspect;
  return resolution;
}

// 対角線上に頂点を詰めた配列を返却
function getDiagonalVertices(hSeg, wSeg, getValue, defaultValue) {
  const hSeg1 = hSeg + 1,
    wSeg1 = wSeg + 1;
  let arry = [],
    currentValue = defaultValue;
  for (let i = 0; i < hSeg1 + wSeg1 - 1; i++) {
    for (
      let j = Math.min(hSeg1, i + 1) - 1;
      j >= Math.max(0, i - wSeg1 + 1);
      j--
    ) {
      let currentIndex = j * wSeg1 + i - j;
      currentValue = getValue(currentValue, currentIndex);
      arry[currentIndex] = currentValue;
    }
  }
  return arry;
}


// １次元の配列をテーブル形式で出力
function printMat(targetMatrix, col = 4, label = '') {
  const mat1D = targetMatrix?.elements ?? targetMatrix?.array ?? targetMatrix;
  console.log(mat1D)
  if(!mat1D instanceof Array) return;
  setTimeout(() => { // 非同期でマトリクスが更新されるため、非同期で実行
    let mat2D = mat1D.reduce((arry2D, v, i) => {
      if (i % col === 0) {
        arry2D.push([]);
      }
      const lastArry = arry2D[arry2D.length - 1];
      lastArry.push(v);
      return arry2D;
    }, []);
    console.log(`%c${label}`, 'font-size: 1.3em; color: red; background-color: #e4e4e4;')
    console.table(mat2D)
  })
}

// メッシュの向きの変更
function pointTo(_mesh, originalDir, targetDir) {
  
  // 回転軸の計算
  const _originalDir = new Vector3(originalDir.x, originalDir.y, originalDir.z).normalize();
  const _targetDir = new Vector3(targetDir.x, targetDir.y, targetDir.z).normalize();
  const dir = new Vector3().crossVectors(_originalDir, _targetDir).normalize();

  // 回転角の計算
  const dot = _originalDir.dot(_targetDir);
  const rad = Math.acos(dot);

  // クォータニオンの作成
  const q = new Quaternion();
  q.setFromAxisAngle(dir, rad);

  // メッシュを回転
  _mesh.rotation.setFromQuaternion(q);
}

function isSafari() {
  return browser.name === "safari";
}

function isIOS() {
  const userAgent = navigator.userAgent;

  if(userAgent.match(/iPhone/i) || userAgent.match(/iPad/i)) {
    return true;
  } else {
    return false;
  }
}

// GPUパフォーマンスの算出
let _isHighPerformanceMode;
async function definePerformanceMode(_tier = 2, _fps = 50) {
  const gpuTier = await getGPUTier();
  if(window.debug) {
    console.log(gpuTier);
  }
  _isHighPerformanceMode = (gpuTier.tier >= _tier && gpuTier.fps >= _fps);
}

// 低負荷モードの時にtrueを返す
function isLowPerformanceMode() {
  return !_isHighPerformanceMode;
}

// ケバブケースからキャメルケースへ文字列を変換
function toCamelCase(s) {
  return s.replace(/-./g, (x) => {
    return x[1].toUpperCase();
  });
}

const utils = {
  lerp,
  getResolutionUniform,
  getDiagonalVertices,
  printMat,
  pointTo,
  isSafari,
  isIOS,
  definePerformanceMode,
  isLowPerformanceMode,
  toCamelCase,
  isTouchDevices
};

export { utils };
