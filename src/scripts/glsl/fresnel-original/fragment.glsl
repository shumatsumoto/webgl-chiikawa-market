precision lowp float;

#pragma glslify: coverUv = require(../shader-util/coverUv)

uniform vec4 uResolution;
uniform float uTick;
uniform vec2 uViewport;
uniform float uScale;

varying vec2 vUv;

// ノイズ関数
vec4 mod289(vec4 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

// ランダム値を生成する関数
float rand(vec2 co) {
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

float smin(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
}

// 変形する球のSDF
float randSphereSDF(vec3 p, float r, float randOffset) {
    // 変形の度合いと周期
    float distortionAmp = 20.0;
    float distFreq = 0.02;
    float distortionFreq = uTick * distFreq;
    float undulate = distortionAmp * sin(distortionFreq);

    // 位置の揺れの周期
    float posXFreq = 0.01 + randOffset * 0.03;
    float posYFreq = 0.01 + randOffset * 0.03;

    float radius = r + 0.01 * (sin(p.x * undulate + uTick * posXFreq) + sin(p.y * undulate + uTick * posYFreq));
    return length(p) - radius * uScale;
}

// 空間全体のSDF
float sceneSDF(vec3 p) {
    // y軸移動用の変数。viewport.heightを使ったuniformに変える
    float posYRange = 7.;
    // float progY = posYRange * fract(uTick * velocity) - posYRange / 2.0;

    // x軸移動用の変数
    float posXRange = 0.5; // viewport.widthをuniformで渡して利用する、に変える
    float posXFreq = 0.0005;

    float final = 1.0;
    int objNum = 12;
    for(int i = 0; i < objNum; i++) {
        float randOffset = rand(vec2(i, 0.0)) - 0.5; // 0~0.99 のランダムな値を生成

        float velocity = 1.2 * (0.0008 + 0.0008 * (randOffset)); // y軸上昇速度(ランダム化する)
        float progY = posYRange * fract(uTick * velocity) - posYRange / 2.0 + 0.5 * posYRange * (randOffset);

        vec3 pos = vec3((randOffset) * posXRange + 1.8 * sin(uTick * posXFreq + randOffset * 10.) * cos(uTick * (3.0 * posXFreq) + randOffset * 5.), progY, 0.0);
        float bubbleSphre = randSphereSDF(p - pos, 0.2, randOffset);

        final = smin(final, bubbleSphre, 0.3);
    }

    return final;
}

// 点pにおける、SDFの等値面との法線ベクトルを求める関数。
vec3 gradSDF(vec3 p) {
    float eps = 0.001;
    return normalize(vec3(sceneSDF(p + vec3(eps, 0.0, 0.0)) - sceneSDF(p - vec3(eps, 0.0, 0.0)), // x成分の偏微分
    sceneSDF(p + vec3(0.0, eps, 0.0)) - sceneSDF(p - vec3(0.0, eps, 0.0)), // y成分の偏微分
    sceneSDF(p + vec3(0.0, 0.0, eps)) - sceneSDF(p - vec3(0.0, 0.0, eps))  // z成分の偏微分
    ));
}

void main() {
    vec2 newUV = coverUv(vUv, uResolution);
    // newUV = (newUV - .5) * 2.;
    newUV = vec2((newUV.x - .5) * uViewport.x / uViewport.y, (newUV.y - .5));

    // カメラ（視点）の位置
    vec3 cPos = vec3(0.0, 0.0, 2.0);

    vec3 ray = normalize(vec3(newUV, -1.));
    vec3 rPos = cPos;

    // gl_FragColor = vec4(0.98, 0.98, 0.91, 0.);
    gl_FragColor = vec4(0., 1., 0., 1.);
    for(int i = 0; i < 12; i++) {
        if(sceneSDF(rPos) > 0.001) {
            rPos += sceneSDF(rPos) * ray;
        } else {
            vec3 sdfNormal = gradSDF(rPos);
            // フレネル反射ver。物体の輪郭が明るくなる。
            float fresnel = pow(1. + dot(ray, sdfNormal), 3.);
            vec3 color = vec3( fresnel);

            gl_FragColor = vec4(color, 1.0);

            break;
        }
    }
    // if(1000.0 < uTick) {
    //     gl_FragColor = vec4(0., 1., 0., 1.);
    // }
}
