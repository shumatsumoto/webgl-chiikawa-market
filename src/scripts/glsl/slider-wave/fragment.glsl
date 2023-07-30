uniform vec2 uMouse;
uniform vec4 uResolution;
uniform float uHover;
uniform sampler2D tex1;

varying vec2 vUv;
varying float vDistPhase;

#pragma glslify: coverUv = require(../shader-util/coverUv);

void main() {
    vec2 uv = coverUv(vUv, uResolution);

    vec4 t1 = texture2D(tex1, uv);

    gl_FragColor = t1;
    // float alphaProgress = clamp(vDistProgress + 0.3, 0., 1.);
    float alpha = smoothstep(0.4, 1.0, cos(vDistPhase));
    gl_FragColor.a *= alpha;
}