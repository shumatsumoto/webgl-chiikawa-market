varying vec2 vUv;
uniform vec2 uMouse;
uniform vec4 uResolution;
uniform float uSlideTotal;
uniform float uActiveSlideIdx;
uniform float uIsReflect;
uniform sampler2D tex1;
uniform sampler2D tex2;
uniform sampler2D tex3;
uniform sampler2D tex4;
uniform sampler2D tex5;

#pragma glslify: coverUv = require(../shader-util/coverUv);
#pragma glslify: grayscale = require(../shader-util/grayscale);

float blockStep(float f, float x) {
    return step(f/uSlideTotal, x) * (1. - step((f + 1.)/uSlideTotal, x));
}

void main() {
    vec2 uv = vUv;

    float activeIdx = mod(uActiveSlideIdx, uSlideTotal) / uSlideTotal;
    vec2 fractUv = vec2(fract((fract(uv.x + activeIdx)) * uSlideTotal) , uv.y);

    fractUv = coverUv(fractUv, uResolution);
    
    vec4 t1 = texture2D(tex1, fractUv); // 0 ~ 0.2
    vec4 t2 = texture2D(tex2, fractUv); // 0.2 ~ 0.4
    vec4 t3 = texture2D(tex3, fractUv);
    vec4 t4 = texture2D(tex4, fractUv);
    vec4 t5 = texture2D(tex5, fractUv);

    float bs1 = blockStep(0., fract(uv.x + activeIdx));
    float bs2 = blockStep(1., fract(uv.x + activeIdx));
    float bs3 = blockStep(2., fract(uv.x + activeIdx));
    float bs4 = blockStep(3., fract(uv.x + activeIdx));
    float bs5 = blockStep(4., fract(uv.x + activeIdx));

    vec4 color = t1 * bs1 + t2 * bs2 + t3 * bs3 + t4 * bs4 + t5 * bs5;

    vec4 gray = grayscale(color);
    float center = floor(uSlideTotal / 2.);

    float bsActive = blockStep(center, uv.x);

    color = mix(gray, color, bsActive);
    color.a *= mix(.7, 1., bsActive);

    color.a *= mix(1., (1. - uv.y) * 0.6, uIsReflect);

    gl_FragColor = color;
}