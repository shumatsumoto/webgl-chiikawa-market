uniform vec2 uMouse;
uniform vec4 uResolution;
uniform float uHover;
uniform sampler2D tex1;

varying vec2 vUv;
varying float vDistProgress;
varying float vScaleProgress;

#pragma glslify: coverUv = require(../shader-util/coverUv);

void main() {
    vec2 uv = coverUv(vUv, uResolution);

    uv -= 0.5;
    
    float scale = mix(0.7, 1.0, vScaleProgress);
    uv *= scale;
    
    uv += 0.5;

    vec4 t1 = texture2D(tex1, uv);

    gl_FragColor = t1;
    float alphaProgress = clamp(vDistProgress + 0.3, 0., 1.);
    gl_FragColor.a = mix(0., t1.a, alphaProgress);
}