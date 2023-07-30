#pragma glslify: parabola = require(../shader-util/parabola)
#pragma glslify: cnoise = require(../shader-util/curl-noise)

varying vec2 vUv;
varying float vAlpha;
varying float vProgress;

uniform float uProgress;
uniform float uSpeed;
uniform float uTick;
uniform float uPointSize;
uniform vec3 uCnoise;
uniform vec3 uExpand;

void main() {
    vUv = uv;
    float time = uTick * uSpeed;
    const float cameraZ = 2000.;
    vec3 pos = position;
    float progress = parabola(uProgress, 0.5);
    
    vec3 expand = vec3( pos.x * uExpand.x, pos.y * uExpand.y, 1.);
    vec3 noise = cnoise( vec3(
        pos.x * uCnoise.x + time * 0.05,
        pos.y * uCnoise.y + time * 0.05,
        (pos.x + pos.y) * uCnoise.z
    )
    );
    pos += expand * noise * progress;
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = uPointSize * (cameraZ / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
    vAlpha = mix(0.1, 1.0, -mvPosition.z/cameraZ);
}