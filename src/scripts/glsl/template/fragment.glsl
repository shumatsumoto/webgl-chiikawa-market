varying vec2 vUv;
uniform vec2 uMouse;
uniform vec4 uResolution;
uniform float uHover;
uniform sampler2D tex1;
uniform sampler2D tex2;

#pragma glslify: coverUv = require(../shader-util/coverUv);

void main() {
    vec2 uv = coverUv(vUv, uResolution);
    vec4 t1 = texture2D(tex1, uv);
    gl_FragColor = t1;
}