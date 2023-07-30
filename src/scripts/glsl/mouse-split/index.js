import { Vector3, DoubleSide } from "three";
import { Ob } from "#/glsl/Ob";
import vertexShader from "./vertex.glsl";
import fragmentShader from "./fragment.glsl";
import gsap from "gsap";

export default class extends Ob {
  setupMaterial() {
    const material = super.setupMaterial();
    console.log(material);
    material.side = DoubleSide;
    return material;
  }
  setupUniforms() {
    const uniforms = super.setupUniforms();
    uniforms.uParams = { value: new Vector3(10, 5.7, 0.3) };
    return uniforms;
  }
  setupVertex() {
    return vertexShader;
  }
  setupFragment() {
    return fragmentShader;
  }
  debug(folder) {
    folder.open();

    folder
      .add(this.uniforms.uParams.value, "x", -10, 10, 0.1)
      .name("noise.x")
      .listen();

    folder
      .add(this.uniforms.uParams.value, "y", -10, 10, 0.1)
      .name("noise.y")
      .listen();
    folder
      .add(this.uniforms.uParams.value, "z", -10, 10, 0.1)
      .name("noise.z")
      .listen();
    folder
      .add(this.uniforms.uProgress, "value", 0, 1, 0.1)
      .name("progess")
      .listen();

    const datData = { next: !!this.uniforms.uProgress.value };
    folder.add(datData, "next").onChange(() => {
      gsap.to(this.uniforms.uProgress, {
        value: +datData.next,
        duration: 2,
        ease: "power2.inOut",
      });
    });
  }
}
