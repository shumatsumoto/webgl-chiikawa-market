
#pragma glslify: coverUv = require(../shader-util/coverUv)

uniform float uTick;
uniform vec4 uResolution;
uniform float uSlideIdx;
uniform float uActiveSlideIdx;
uniform float uDist;

uniform sampler2D tex1;
varying vec2 vUv;

void main() {
  vec2 uv = coverUv(vUv, uResolution);

  uv -= 0.5;
  uv.y -= sin(uTick * 0.01) * 0.01;
  uv *= 0.8;
  uv += 0.5;

  vec4 color = texture2D(tex1, uv);
  gl_FragColor = color;

  
  float alpha = clamp((1. - abs(uActiveSlideIdx - uSlideIdx) * uDist), .0, 1.);

  gl_FragColor.a *= alpha;
}
