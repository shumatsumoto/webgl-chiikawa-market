varying vec2 vUv;
uniform vec2 uMouse;
uniform vec4 uResolution;
uniform float uHover;
uniform vec3 uParams;
uniform float uAlpha;
uniform float uTick;
uniform sampler2D tex1;
uniform sampler2D tex2;

// 関数をインポート
#pragma glslify: coverUv = require(../shader-util/coverUv);
#pragma glslify: snoise = require(glsl-noise/simplex/3d.glsl);

void main() {
    // テクスチャ座標（uv座標）の取得
    vec2 uv = coverUv(vUv, uResolution);

    // ノイズの取得
    float n = snoise(vec3(uv.x * uParams.x, uv.y * uParams.y, uTick * 0.01));

    // data-tex-1の画像の色情報を取得
    vec4 t1 = texture2D(tex1, uv);

    // data-tex-2の画像の色情報を取得
    vec4 t2 = texture2D(tex2, uv);

    // マウスの座標をメッシュのアスペクトに合わせる
    vec2 mouse = coverUv(uMouse, uResolution);
    
    // テクスチャ座標（uv座標）にノイズを足し合わせる
    vec2 distortUv = uv + n * (.5 - abs(uv.x - 0.5)) * uParams.z;

    // マウスの
    float splitX = step(mouse.x, distortUv.x);
    // float splitY = step(uMouse.y, uv.y);

    // data-tex-1の画像とdata-tex-2の画像をsplitXの値によって混ぜ合わせる
    vec4 color = mix(t1, t2, splitX);

    // 1. test.jsにworld.addRaycastingTarget("#particles");を加えた後のマウス座標確認
    // gl_FragColor = vec4(splitX, splitY, 0., 1.);

    // 2. uHover の値確認
    // gl_FragColor = vec4(splitX, splitY, uHover, 1.);

    // 3. ノイズの模様の確認
    // gl_FragColor = vec4(n, 0., 0., 1.);

    // 画面に表示する色を設定
    gl_FragColor = color;

    // 4. ローディングアニメーション時の透明度の変更
    gl_FragColor.a *= uAlpha;
}