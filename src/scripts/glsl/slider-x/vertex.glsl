
uniform float uTick;
uniform float uSlideIdx;
uniform float uActiveSlideIdx;
uniform float uDist;
varying float vScaleProgress;
varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vec3 pos = position;

  float scaleDown = 0.2;
  float scaleProgress = clamp((1. - abs(uActiveSlideIdx - uSlideIdx) * uDist), .0, 1. );
  vScaleProgress = scaleProgress;
  pos.xy *= (0.9 + scaleDown * scaleProgress);

  vUv = uv;

  // メッシュ自体を上下に揺らす
  pos.y += cos(uTick * 0.03) * 7.;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos * 1., 1.);

  vPosition = position;
}
