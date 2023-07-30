uniform float uTick;
varying vec2 vUv;

void main() {
  vUv = uv;
  vec3 pos = position;

  // メッシュをたわませる
  // pos.z += sin(PI * uv.x) * 100.;
  // pos.z += sin(PI * uv.y) * 30.;

  // // メッシュ自体を上下に揺らす
  pos.y += sin(uTick * 0.03) * 7.;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.);
}
