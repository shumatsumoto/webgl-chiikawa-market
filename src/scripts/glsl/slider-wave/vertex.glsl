varying vec2 vUv;

uniform float uSlideIdx;
uniform float uActiveSlideIdx;
uniform float uTick;
uniform float uSlideTotal;
uniform vec4 uParam;

varying float vDistPhase;

#pragma glslify: snoise = require(glsl-noise/simplex/2d)
    
void main() {
    vUv = uv;
    float time = uTick * 0.001;

    vec3 pos = position;

    float distFreq = 2. * PI / uSlideTotal * (uActiveSlideIdx - uSlideIdx);
    float distPhase = mod(distFreq, PI * 2.);
    vDistPhase = distPhase;

    float n = snoise(vec2(cos(uv.x * PI * 2.) * uParam.x, uv.y * uParam.y - time));
    pos.x += uParam.z * n * sin(distFreq);
    pos.y += uParam.w * n * sin(distFreq);

    pos.x -= 300. * sin(distFreq);
    pos.y += 100. * sin(distFreq);
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.);
}