uniform float uTick;

varying vec2 vUv;

void main() {
    vUv = uv;

    vec3 pos = position;
    pos.y += cos(uTick * 0.03) * 5.;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.);
}