uniform sampler2D texCurrent;
uniform sampler2D texNext;
uniform float progress;
uniform vec4 uResolution; // 2023/06/12 追加 アスペクト比を考慮する場合
varying vec2 vUv;

#pragma glslify: coverUv = require(../shader-util/coverUv); // 2023/06/12 追加 アスペクト比を考慮する場合

vec4 getFromColor(vec2 uv) {
   uv = coverUv(uv, uResolution); // 2023/06/12 追加 アスペクト比を考慮する場合
   return texture(texCurrent, uv);
}

vec4 getToColor(vec2 uv) {
   uv = coverUv(uv, uResolution); // 2023/06/12 追加 アスペクト比を考慮する場合
   return texture(texNext, uv);
}
