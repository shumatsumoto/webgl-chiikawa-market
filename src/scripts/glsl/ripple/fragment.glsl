precision mediump float;

varying vec2 vUv;
uniform sampler2D tDiffuse;
uniform sampler2D texRipple;


void main() {
    vec4 ripple = texture2D(texRipple, vUv); // 2023/5/5 WebGL1.0対応 texture -> texture2Dに変更
    vec2 rippleUv = vUv + ripple.r * .1;
    vec4 color = texture2D(tDiffuse, rippleUv); // 2023/5/5 WebGL1.0対応 texture -> texture2Dに変更
    gl_FragColor = color;
}