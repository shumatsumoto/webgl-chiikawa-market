precision mediump float;

#pragma glslify: noise2 = require(glsl-noise/simplex/2d);
#pragma glslify: noise3 = require(glsl-noise/simplex/3d);

varying vec2 vUv;
uniform sampler2D tex1;
uniform sampler2D tex2;
uniform float uTick;
uniform float uHover;
uniform vec2 uNoiseScale;

void main() {

  // n => -1 ~ 1
  float n = noise2(vec2(vUv.x * uNoiseScale.x, vUv.y * uNoiseScale.y));
  // n => -1 ~ 0
  n = n * 0.5 - 0.5;
  // uHover => 0 ~ 1
  n = n + uHover;

  n = step(0.0, n);
  
  vec4 texCurrent = texture(tex1, vUv);
  vec4 texNext = texture(tex2, vUv);
  gl_FragColor = mix(texCurrent, texNext, n);
}