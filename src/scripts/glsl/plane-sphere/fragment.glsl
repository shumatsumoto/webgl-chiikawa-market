
varying vec2 vUv;
varying float vProgress;
varying vec3 vSphereNormal;

uniform sampler2D tex1;
uniform float uTick;
uniform float uHover;
uniform vec4 uResolution;
uniform float uReversal;

#pragma glslify: coverUv = require(../shader-util/coverUv)
#pragma glslify: grayscale = require(../shader-util/grayscale)

void main() {
  vec2 uv = coverUv(vUv, uResolution);
  
  // plane color
  vec4 tex = texture(tex1, uv);
  vec4 gray = grayscale(tex);
  vec4 planeColor = mix(gray, tex, uHover);

  // sphere color
  vec3 ray = vec3(cos(uTick * 0.01) * .3,sin(uTick * 0.01) * .3,1.);
  // ray.x * vSphereNormal.x + ray.y * vSphereNormal.y + ray.z * vSphereNormal.z
  float fresnel = dot(ray, vSphereNormal) * 0.5;
  vec3 sphereRGB = mix(vec3(fresnel), 1. - vec3(fresnel), uReversal);
  vec4 sphereColor = vec4(sphereRGB, 0.7);

  // mix plane color and sphere color
  vec4 color = mix(sphereColor, planeColor, vProgress);
  
  gl_FragColor = color;
}