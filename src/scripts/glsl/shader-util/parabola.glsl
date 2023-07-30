float parabola(float x, float k) {
  return pow(4. * x * (1. - x), k);
}
#pragma glslify: export(parabola)
