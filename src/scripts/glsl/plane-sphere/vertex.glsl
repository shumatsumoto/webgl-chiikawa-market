
#pragma glslify: snoise = require(glsl-noise/simplex/3d)

varying vec2 vUv;
varying float vProgress;
varying vec3 vSphereNormal;
// attribute vec3 plane;
attribute vec3 sphere;
attribute vec3 sphereNormal;

uniform float uProgress;
uniform float uSphereScale;
uniform float uDelay;
uniform float uFreq;
uniform float uNoiseFreq;
uniform float uNoiseLevel;
uniform float uTick;

void main() {
    vUv = uv;
    float time = uTick * uFreq;
    float delay = distance(uv, vec2(.5)) * uDelay;

    float progress = uProgress * (1. + uDelay) - delay;

    progress = clamp(progress, 0., 1.);
    vProgress = progress;
    
    vec3 s = sphere * uSphereScale;

    // add noise
    float noise = snoise(vec3(sphereNormal.x * uNoiseFreq, sphereNormal.y * uNoiseFreq, (sphereNormal.z - time) * uNoiseFreq));

    vSphereNormal = sphereNormal * (1. + noise * uNoiseLevel);
    
    s += s * noise * uNoiseLevel;
    
    vec3 p = position;
    
    vec3 pos = mix(s, p, progress);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
}