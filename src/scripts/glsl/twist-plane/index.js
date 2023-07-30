import gsap from "gsap";
import { PlaneGeometry, Float32BufferAttribute } from "three";

import { Ob } from "../Ob";
import vertexShader from "./vertex.glsl";
import fragmentShader from "./fragment.glsl";

import { utils } from "../../helper";

export default class extends Ob {
  setupGeometry() {
    const wSeg = 30,
      hSeg = 30;
    const geometry = new PlaneGeometry(
      this.rect.width,
      this.rect.height,
      wSeg,
      hSeg
    );

    // 対角線上に詰められた遅延時間用の頂点データ
    const delayVertices = utils.getDiagonalVertices(hSeg, wSeg, getValue, 0);
    // utils.printMat(delayVertices, wSeg + 1, "遅延時間行列");

    // 0~1までの値をstep毎に返す
    function getValue(previousValue, currentIndex) {
      let step = 1 / (hSeg + 1) / (wSeg + 1);
      return previousValue + step;
    }

    geometry.setAttribute(
      "aDelay",
      new Float32BufferAttribute(delayVertices, 1)
    );

    return geometry;
  }
  setupVertex() {
    return vertexShader;
  }
  setupFragment() {
    return fragmentShader;
  }
  debug(folder) {
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
