import {
  Mesh,
  PlaneGeometry,
  DoubleSide,
  Vector4,
  Group,
} from "three";

import { Ob } from "#/glsl/Ob";
import vertexShader from "./vertex.glsl";
import fragmentShader from "./fragment.glsl";

import { utils } from "#/helper";

export default class extends Ob {
  beforeCreateMesh() {
    this.activeSlideIdx = 0;
  }
  setupGeometry() {
    return new PlaneGeometry(this.rect.width, this.rect.height, 70, 10);
  }
  setupUniforms() {
    const uniforms = super.setupUniforms();
    uniforms.uParam = { value: new Vector4(1, 1.5, 2, 21) };
    uniforms.uSlideIdx = { value: 0 };
    uniforms.uSlideTotal = { value: this.texes.size }
    uniforms.uActiveSlideIdx = { value: this.activeSlideIdx }
    return uniforms;
  }
  setupTexes(uniforms) {
    return uniforms;
  }
  setupMesh() {
    const group = new Group;
    let idx = 0;
    this.texes.forEach((tex) => {
      const planeMate = this.material.clone();
      planeMate.side = DoubleSide;
      planeMate.uniforms.tex1 = { value: tex };
      planeMate.uniforms.uSlideIdx.value = idx;
      planeMate.uniforms.uTick = this.uniforms.uActiveSlideIdx;
      planeMate.uniforms.uActiveSlideIdx = this.uniforms.uActiveSlideIdx;
      planeMate.uniforms.uParam = this.uniforms.uParam;
      
      const planeGeo = this.geometry;
      const plane = new Mesh(planeGeo, planeMate);

      group.add(plane);

      idx++;
    });

    this.slides = [...group.children];

    return group;
  }
  setupVertex() {
    return vertexShader;
  }
  setupFragment() {
    return fragmentShader;
  }
  goTo(idx) {
    this.activeSlideIdx = idx;
  }
  render(tick) {
    super.render(tick);

    const uActiveSlideIdx = this.uniforms.uActiveSlideIdx.value;
    const idx = utils.lerp(uActiveSlideIdx, this.activeSlideIdx, 0.07, 0.005);

    this.uniforms.uActiveSlideIdx.value = idx;
    
  }
  afterInit() {
    this.goTo(this.activeSlideIdx);
  }
  debug(folder) {
    folder
      .add(this.uniforms.uParam.value, "x", 0, 3, 0.001)
      .name("noise.x")
      .listen();
    folder
      .add(this.uniforms.uParam.value, "y", 0, 3, 0.001)
      .name("noise.y")
      .listen();
    folder
      .add(this.uniforms.uParam.value, "z", 0, 500, 1)
      .name("noise.z")
      .listen();
    folder
      .add(this.uniforms.uParam.value, "w", 0, 500, 1)
      .name("noise.w")
      .listen();

    const sliderIdx = { value: 0 };
    folder
      .add(sliderIdx, "value", 0, 12, 0.1)
      .name("goTo")
      .listen()
      .onChange(() => {
        this.goTo(sliderIdx.value);
      });
  }
}
