precision mediump float;

#pragma glslify: noise2 = require(glsl-noise/simplex/2d);
#pragma glslify: noise3 = require(glsl-noise/simplex/3d);

varying vec2 vUv;
uniform sampler2D tex1;
uniform sampler2D tex2;
uniform sampler2D texDisp;
uniform float uTick;
uniform float uProgress;
uniform vec2 uNoiseScale;
float parabola( float x, float k ) {
  return pow( 4. * x * ( 1. - x ), k );
}
void main() {

  // // n => -1 ~ 1
  // float n = noise2(vec2(vUv.x * uNoiseScale.x, vUv.y * uNoiseScale.y));
  // // n => -1 ~ 0
  // n = n * 0.5 - 0.5;
  // // uProgress => 0 ~ 1
  // n = n + uProgress;

  // n = step(0.0, n);
  
  vec4 texDisp = texture(texDisp, vUv);
  float disp = texDisp.r;
  disp = disp * parabola(uProgress, 1.0);
  vec2 dispUv = vec2(vUv.x, vUv.y + disp);
  vec2 dispUv2 = vec2(vUv.x, vUv.y - disp);
  
  vec4 texCurrent = texture(tex1, dispUv);
  vec4 texNext = texture(tex2, dispUv2);

  gl_FragColor = mix(texCurrent, texNext, uProgress);
}