
#pragma glslify: coverUv = require(../shader-util/coverUv)
#pragma glslify: grayscale = require(../shader-util/grayscale)

uniform vec4 uResolution;
uniform float uHover;
uniform sampler2D tex1;
varying vec2 vUv;

void main() {
  vec2 uv = coverUv(vUv, uResolution);
  vec4 color = texture2D(tex1, uv);
  vec4 gray = grayscale(color);
  gl_FragColor = mix(gray, color, uHover);
}
