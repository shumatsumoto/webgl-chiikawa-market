varying vec2 vUv;
varying float vAlpha;

uniform sampler2D texCurrent;
uniform sampler2D texNext;
uniform float uProgress;
varying float vProgress;

// gl_PointCoordについての説明
// https://khronos.org/registry/OpenGL-Refpages/gl4/html/gl_PointCoord.xhtml

void main() {

  if(vProgress > 0.1 && distance(gl_PointCoord, vec2(0.5, 0.5)) > 0.5) {
    discard;
  }

  vec4 tCurrent = texture(texCurrent, vUv);
  vec4 tNext = texture(texNext, vUv);
  vec4 color = mix(tCurrent, tNext, uProgress);
  color.a = vAlpha;
  gl_FragColor = color;
}