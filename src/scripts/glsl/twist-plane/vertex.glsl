precision mediump float;

#pragma glslify: easeBack = require(glsl-easings/back-in-out)
#pragma glslify: easeCubic = require(glsl-easings/cubic-in-out)

#pragma glslify: rotate = require(glsl-rotate/rotate.glsl)

varying vec2 vUv;
varying float vDelay;
attribute float aDelay;

uniform float uProgress;

const float HALF_PI = 1.570796327;

void main() {
    vUv = uv;
    vDelay = aDelay;
    vec3 pos = position;
    // aDelay => 0 ~ 1
    // aDelay * 0.3=> 0 ~ 0.3
    float delay = clamp(uProgress * 1.2 - aDelay * 0.2, 0., 1.);
    float progress = easeCubic(delay);

    // z軸の手前方向に少しずらしておく
    pos.z += 100.;

    // 回転
    vec3 axis = vec3(1.0, 1.0, 1.0);
	pos = rotate(pos, axis, 4.0 * HALF_PI * progress);

    pos.z += progress * 300.;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}