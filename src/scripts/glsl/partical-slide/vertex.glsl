#pragma glslify: exponential = require(glsl-easings/exponential-out)

attribute float aIntensity;

varying vec2 vUv;
varying float vAlpha;
varying float vProgress;

uniform float uProgress;

void main() {
    vUv = uv;
    const float cameraZ = 2000.;
    float progress = vProgress = 1. - abs(2. * uProgress - 1.);
    float speed = exponential(progress);
    vec3 pos = position;
    // uv - 0.5 => x: -0.5 ~ 0.5 y -0.5 ~ 0.5
    vec2 xyDirection = (uv - 0.5) * 2.0;
    float xyIntensity = 1000.;

    pos.z = speed * aIntensity;
    pos.xy += xyDirection * xyIntensity * pos.z / cameraZ;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = 2.2 * (cameraZ / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
    vAlpha = mix(0.1, 1.0, -mvPosition.z/cameraZ);
}