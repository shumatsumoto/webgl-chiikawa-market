precision mediump float;

#pragma glslify: easeBack = require(glsl-easings/back-in-out)

varying vec2 vUv;
varying float vDelay;
attribute float aDelay;

uniform float uHover;

void main() {
    vUv = uv;
    vDelay = aDelay;
    vec3 pos = position;
    // aDelay => 0 ~ 1
    // aDelay * 0.3=> 0 ~ 0.3
    float x = clamp(uHover * 1.3 - aDelay * 0.3, 0., 1.);
    float progress = easeBack(x);
    pos.z += progress * 250.;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}