varying vec2 vUv;
uniform sampler2D tDiffuse;
uniform float uTick;
uniform float uProgress;
uniform float uSpeed;
uniform float uReversal;
uniform vec4 uParam;

#pragma glslify: snoise = require(glsl-noise/simplex/2d)

void main() {
    vec2 uv = vUv;
    float time = uTick * 0.001 * uSpeed;
    float n = snoise(vec2(cos(uv.x * PI * 2.) * uParam.x, uv.y * uParam.y - time));
    float d = dot(vec2(n * uParam.z, n * uParam.w), uv - .5);

    vec2 distortUv = uv + d * 0.3 * (1. - uProgress);
    vec4 t1 = texture2D(tDiffuse, distortUv);
    vec3 rgb = t1.rgb;
    rgb = mix(rgb, 1. - rgb, 1. - uReversal);
    vec4 color = vec4(rgb, t1.a * uProgress);
    gl_FragColor = color;
}