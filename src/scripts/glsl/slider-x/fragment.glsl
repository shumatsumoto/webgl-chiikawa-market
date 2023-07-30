
#pragma glslify: coverUv = require(../shader-util/coverUv)
#pragma glslify: grayscale = require(../shader-util/grayscale)

uniform vec4 uResolution;
uniform sampler2D tex1;

varying vec2 vUv;
varying float vScaleProgress;

void main() {
  vec2 uv = coverUv(vUv, uResolution);

  // uvの中心を原点とする
  uv -= 0.5;
  // アクティブな画像の縮小
  float scale = mix(0.7, 1.0, vScaleProgress);
  uv *= scale;

  // uv座標を戻す
  uv += 0.5;

  vec4 color = texture2D(tex1, uv);
  vec4 gray = grayscale(color);

  gl_FragColor = mix(gray, color, vScaleProgress);
}
