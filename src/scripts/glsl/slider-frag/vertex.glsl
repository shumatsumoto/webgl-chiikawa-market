varying vec2 vUv;
uniform float uTick;

void main() {
    vUv = uv;
    vec3 pos = position;

    pos.y += cos(uTick * 0.03) * 20.;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.);
}