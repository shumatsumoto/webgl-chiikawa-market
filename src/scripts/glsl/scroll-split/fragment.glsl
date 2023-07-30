varying vec2 vUv;
uniform vec2 uMouse;
uniform vec4 uResolution;
uniform vec3 uParams;
uniform float uProgress;
uniform float uTick;
uniform sampler2D tex1;
uniform sampler2D tex2;

#pragma glslify: coverUv = require(../shader-util/coverUv);
#pragma glslify: snoise = require(glsl-noise/simplex/3d.glsl);

void main() {
    vec2 uv = coverUv(vUv, uResolution);

    float n = snoise(vec3(uv.x * uParams.x, uv.y * uParams.y, uTick * 0.01));

    vec4 t1 = texture2D(tex1, uv);
    vec4 t2 = texture2D(tex2, uv);
    vec2 mouse = coverUv(uMouse, uResolution);
    
    vec2 distortUv = uv + n * (.5 - abs(uv.x - 0.5)) * uParams.z;

    float splitX = step(uProgress, distortUv.x);
    // float splitY = step(uMouse.y, uv.y);
    vec4 color = mix(t1, t2, splitX);
    // gl_FragColor = vec4(splitX, splitY, 0., 1.);
    // gl_FragColor = vec4(n, 0., 0., 1.);
    gl_FragColor = color;
}