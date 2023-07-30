varying vec2 vUv;
uniform vec4 uResolution;
uniform float uReversal;
uniform sampler2D tex1;

#pragma glslify: coverUv = require(../shader-util/coverUv);

void main() {
    vec2 uv = vUv;

    vec4 color = texture2D(tex1, uv);

    if(color.a < 0.1) {
        discard;
    }

    vec3 rgb = mix(color.rgb, 1. - color.rgb, uReversal);
    gl_FragColor = vec4(rgb, color.a);
}