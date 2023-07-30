import gsap from "gsap";

// ダイナミックインポートされるため拡張子あり、相対パスで指定
import frag from "./fragment.glsl";
import vert from "./vertex.glsl";
import { Ob } from "#/glsl/Ob.js";
import { viewport, utils } from "#/helper";

export default class extends Ob {
  setupMaterial() {
    const material = super.setupMaterial();
    material.precision = utils.isTouchDevices ? "highp" : "lowp";
    return material;
  }

  setupUniforms() {
    const uniforms = super.setupUniforms();
    // uniforms.uLoop = { value: 15 }; // 2023/5/5 WebGL1.0対応 uLoopはシェーダ内で定数で定義に変更
    uniforms.uProgress = { value: 1 };
    uniforms.uDPR = { value: viewport.devicePixelRatio };
    return uniforms;
  }

  setupFragment() {
    return frag;
  }
  setupVertex() {
    return vert;
  }

  debug(folder) {
    folder.add(this.uniforms.uProgress, "value", 0, 1, 0.1).name("progress").listen();
    const datObj = { next: !!this.uniforms.uProgress.value };
    folder
      .add(datObj, "next")
      .name("Animate")
      .onChange(() => {
        gsap.to(this.uniforms.uProgress, {
          value: +datObj.next,
          duration: 1.0,
          ease: "power4.inOut",
        });
      });
  }
}
