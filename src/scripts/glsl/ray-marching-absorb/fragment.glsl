#pragma glslify: coverUv = require(../shader-util/coverUv)
#pragma glslify: rotate3d = require(glsl-rotate/rotation-3d)

uniform vec4 uResolution;
uniform vec2 uMouse;
uniform float uHover;
uniform float uTick;
// uniform int uLoop; // 2023/5/5 WebGL1.0対応 uLoopはシェーダ内で定数で定義に変更
const int uLoop = 15;
uniform float uProgress;

uniform sampler2D tex1;
varying vec2 vUv;

// 引数として受け取ったベクトル(v)を任意の回転軸(axis)に沿って回転(angle)させる関数。回転後のベクトルを返す。
vec3 rotate(vec3 v, vec3 axis, float angle) {
  // rotate3dは第一引数に回転軸ベクトル、第二引数に回転角を取る
  mat4 matR = rotate3d(axis, angle);
  return (matR * vec4(v, 1.0)).xyz;
}

// ２つの距離関数をスムーズに結合する関数。a,bは距離関数、kは係数
// ２つの関数から微分可能になるような関数を作る。（右微分係数と左微分係数が一致するような関数を作れば良い）。
float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

// 環境マップを返す関数, eyeは光線ray、normalはSDFの法線ベクトル
vec2 getmatcap(vec3 eye, vec3 normal) {
  vec3 reflected = reflect(eye, normal);
  float m = 2.8284271247461903 * sqrt(reflected.z + 1.0);
  return reflected.xy / m + 0.5;
}

// 球のSDF。半径r、中心が空間の原点
float sphereSDF(vec3 p, float r) {
  return length(p) - r;
}

// 立方体のSDF。
float boxSDF(vec3 p, vec3 b) {
  vec3 q = abs(p) - b;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

float rand(vec2 co) {
  return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

// 空間全体のSDF
float sceneSDF(vec3 p) {
  vec3 pRotated = rotate(p, vec3(1.), uTick / 50.); // 立法体の回転
  float box = boxSDF(pRotated, vec3(0.2));

  float final = box;
  // 中心のオブジェに向かってランダムに球が吸い込まれる
  for(int i = 0; i < uLoop; i++) {
    float randOffset = rand(vec2(i, 0.2));
    float progress = 1. - fract(uTick / 100. + randOffset * 3.);
    vec3 pos = vec3(sin(randOffset * 2. * PI), cos(randOffset * 2. * PI), 0.);
    float sphere = sphereSDF(p - pos * progress, 0.1 * sin(PI * progress));
    final = smin(final, sphere, 0.3);
  }

  return final;
}

// 点pにおける、SDFの等値面との法線ベクトルを求める関数。
vec3 gradSDF(vec3 p) {
  float eps = 0.001; // 微小変化量
  return normalize(vec3(sceneSDF(p + vec3(eps, 0.0, 0.0)) - sceneSDF(p - vec3(eps, 0.0, 0.0)), // x成分の偏微分
  sceneSDF(p + vec3(0.0, eps, 0.0)) - sceneSDF(p - vec3(0.0, eps, 0.0)), // y成分の偏微分
  sceneSDF(p + vec3(0.0, 0.0, eps)) - sceneSDF(p - vec3(0.0, 0.0, eps))  // z成分の偏微分
  ));
}

void main() {
  vec2 newUV = coverUv(vUv, uResolution);
  newUV = (newUV - .5) * 2.;

  // カメラ（視点）の位置
  vec3 cPos = vec3(0.0, 0.0, 1.0);

  // 光源の位置
  vec3 lPos = vec3(2.0);

  // 光線の向きのベクトルを正規化。カメラは常にZ軸マイナス方向に向ける。
  vec3 ray = normalize(vec3(newUV, -1.));
  vec3 rPos = cPos; // 初期の光線の位置はカメラの位置

  gl_FragColor = vec4(0.);
  for(int i = 0; i < uLoop; i++) {
    if(sceneSDF(rPos) > 0.001) {
      rPos += sceneSDF(rPos) * ray;
    } else {
      float amb = 0.5; // 環境光の強さ
      // 拡散光の計算。光線の位置（物体にヒットしたポイント）から光源に伸びるベクトルとSDFの法線ベクトルとの内積を計算する。
      // 内積がマイナスになる（角度が180度以上になる場合）場合は0にする。
      vec3 sdfNormal = gradSDF(rPos);
      float diff = 0.9 * max(dot(normalize(lPos - rPos), sdfNormal), 0.0);

      // スフィア環境マップ作成
      vec2 matcapUV = getmatcap(ray, sdfNormal);
      vec3 color = texture2D(tex1, matcapUV).rgb;

      color *= diff + amb;

      gl_FragColor = vec4(color, uProgress);

      break;
    }
  }
}
