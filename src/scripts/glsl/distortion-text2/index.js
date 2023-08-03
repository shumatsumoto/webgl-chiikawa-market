import gsap from "gsap";

import { Ob } from "#/glsl/Ob";
import vertexShader from "./vertex.glsl";
import fragmentShader from "./fragment.glsl";
import { Vector4 } from "three";

export default class extends Ob {
  setupTexes(uniforms) {
    this.texes.forEach((tex, key) => {
      uniforms['tDiffuse'] = { value: tex };
    });
    return uniforms;
  }
  setupUniforms() {
    const uniforms = super.setupUniforms();
    uniforms.uSpeed = { value: 7.1 };
    uniforms.uParam = { value: new Vector4(1.23, 2.299, 0.493, 1.783) };
    uniforms.uReversal = { value: 0 };
    // uniforms.uProgress.value = 1;
    return uniforms;
  }
  setupVertex() {
    return vertexShader;
  }
  setupFragment() {
    return fragmentShader;
  }
  debug(folder) {
    // folder.open();

    folder
    .add(this.uniforms.uSpeed, "value", 0, 10, 0.1)
    .name("uSpeed")
    .listen();

    folder
      .add(this.uniforms.uParam.value, "x", 0, 10, 0.001)
      .name("noise.x")
      .listen();
    folder
      .add(this.uniforms.uParam.value, "y", 0, 10, 0.001)
      .name("noise.y")
      .listen();
    folder
      .add(this.uniforms.uParam.value, "z", 0, 10, 0.001)
      .name("noise.z")
      .listen();
    folder
      .add(this.uniforms.uParam.value, "w", 0, 10, 0.001)
      .name("noise.w")
      .listen();

    folder
      .add(this.uniforms.uReversal, "value", 0, 1, 0.1)
      .name("uReversal")
      .listen();

    folder
      .add(this.uniforms.uProgress, "value", 0, 1, 0.1)
      .name("progress")
      .listen();

    const datObj = { next: !!this.uniforms.uProgress.value };
    folder
      .add(datObj, "next")
      .name("Animate")
      .onChange(() => {
        gsap.to(this.uniforms.uProgress, {
          value: +datObj.next,
          duration: 2,
          ease: "power2.out",
        });
      });
  }
}
