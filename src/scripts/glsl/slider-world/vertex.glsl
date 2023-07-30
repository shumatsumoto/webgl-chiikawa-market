varying vec2 vUv;

uniform float uRadius;
uniform float uSlideIdx;
uniform float uActiveSlideIdx;
uniform float uTick;
uniform float uDist;
uniform float uSlideTotal;

varying float vDistProgress;
varying float vScaleProgress;

void main() {
    vUv = uv;

    vec3 pos = position;

    // activeSlideIdx: 0 ~ 4.999999
    float activeSlideIdx = mod(uActiveSlideIdx, uSlideTotal);
    float dist = abs(activeSlideIdx - uSlideIdx);
    float deepest = uSlideTotal / 2.; // 5 / 2 = 2.5

    // turtle: dist -> 0, deepest -> 2.5, distProgress -> 1.
    // green image: dist -> 1, deepest -> 2.5, distProgress -> 1.5 / 2.5 = 0.6
    // blue image: dist -> 4, deepest -> 2.5, distProgress -> 1.5 / 2.5 = 0.6
    // distProgress: deepest -> 0, front -> 1
    float distProgress = abs(dist - deepest) / deepest;
    vDistProgress = distProgress;

    float scaleProgress = clamp((distProgress - uDist) * 5., 0., 1.);
    vScaleProgress = scaleProgress;

    pos.xy *= (0.9 + 0.2 * scaleProgress);
    
    float roundZ = uRadius - sqrt(pow(uRadius, 2.) - pow(pos.x, 2.));
    pos.z -= roundZ;

    pos.y += cos(uTick * 0.03) * 10.;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.);
}