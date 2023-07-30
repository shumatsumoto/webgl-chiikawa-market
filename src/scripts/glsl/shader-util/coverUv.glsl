vec2 coverUv(vec2 uv, vec4 resolution) {
  return (uv - 0.5) * resolution.zw + 0.5;
}

#pragma glslify: export(coverUv)
