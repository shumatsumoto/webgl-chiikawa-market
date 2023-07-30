vec4 grayscale(vec4 tex) {
  vec3 gray = vec3(0.299, 0.587, 0.114);
  vec4 grayT = vec4(vec3(dot(tex.rbg, gray)), tex.a);
  return grayT;
}

#pragma glslify: export(grayscale)
