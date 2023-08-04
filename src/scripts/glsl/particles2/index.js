import { PlaneGeometry, Points, Vector3 } from "three";
import gsap from "gsap";

import { Ob } from "../Ob";
import vertexShader from "./vertex.glsl";
import fragmentShader from "./fragment.glsl";
import { config, utils } from "../../helper";
export default class extends Ob {
  beforeCreateMesh() {
    this.$.childMediaEls = [];
  }
  setupGeometry() {
    const width = this.rect.width,
      height = this.rect.height,
      wSeg = width / 4,
      hSeg = height / 4;

    const plane = new PlaneGeometry(width, height, wSeg, hSeg);
    return plane;
  }
  setupUniforms() {
    const uniforms = super.setupUniforms();
    uniforms.uPointSize = { value: utils.isTouchDevices ? 2 : 3 };
    uniforms.uSpeed = { value: 0.05 };
    uniforms.uCnoise = { value: new Vector3(0.005, 0, 0.01) };
    uniforms.uExpand = { value: new Vector3(1, 1, 1) };
    return uniforms;
  }
  setupMesh() {
    return new Points(this.geometry, this.material);
  }
  setupVertex() {
    return vertexShader;
  }
  setupFragment() {
    return fragmentShader;
  }
  setupTexes(uniforms) {
    uniforms.texCurrent = { value: this.texes.get(`${config.prefix.tex}1`) };
    uniforms.texNext = { value: null };
    return uniforms;
  }

  running = false;
  goTo(idx, duration = 3) {
    const _idx =
      (((idx % this.texes.size) + this.texes.size) % this.texes.size) + 1;

    if (this.running) return;
    this.running = true;

    const nextTex = this.texes.get(config.prefix.tex + _idx);
    this.uniforms.texNext.value = nextTex;

    gsap.to(this.uniforms.uProgress, {
      value: 1,
      duration,
      ease: "none",
      onStart: () => {
        this.$.childMediaEls.forEach((el) => {
          el.style.opacity = 0;
          el.pause?.();
        });
        this.mesh.visible = true;
      },
      onComplete: () => {
        this.uniforms.texCurrent.value = this.uniforms.texNext.value;
        this.uniforms.uProgress.value = 0;
        const activeEl = this.getChildMediaEl(_idx - 1);
        activeEl.style.opacity = 1;
        this.mesh.visible = false;
        this.running = false;
        this.activeSlideIdx = idx;
        if (activeEl.paused || utils.isSafari()) {
          activeEl.play?.();
        }
      },
    });
  }
  getChildMediaEl(idx) {
    return this.$.childMediaEls[idx % this.texes.size];
  }
  afterInit() {
    this.texes.forEach((tex) => {
      const mediaEl = tex.source.data.cloneNode();
      mediaEl.classList.add("particle-child");
      this.$.el.parentElement.append(mediaEl);
      this.$.childMediaEls.push(mediaEl);
      mediaEl.addEventListener("click", () => {
        mediaEl.play?.();
      });
    });
    this.goTo(0, 0.1);
  }
  debug(folder) {
    // folder.open();

    folder
      .add(this.uniforms.uSpeed, "value", 0, 0.1, 0.001)
      .name("uSpeed")
      .listen();

    folder
      .add(this.uniforms.uCnoise.value, "x", 0, 0.01, 0.001)
      .name("cnoise.x")
      .listen();
    folder
      .add(this.uniforms.uCnoise.value, "y", 0, 0.01, 0.001)
      .name("cnoise.y")
      .listen();
    folder
      .add(this.uniforms.uCnoise.value, "z", 0, 0.01, 0.001)
      .name("cnoise.z")
      .listen();

    folder
      .add(this.uniforms.uExpand.value, "x", 0, 10, 0.1)
      .name("expand.x")
      .listen();
    folder
      .add(this.uniforms.uExpand.value, "y", 0, 10, 0.1)
      .name("expand.y")
      .listen();
    folder
      .add(this.uniforms.uExpand.value, "z", 0, 10, 0.1)
      .name("expand.z")
      .listen();

    folder
      .add(this.uniforms.uProgress, "value", 0, 1, 0.1)
      .name("progress")
      .listen();
    const sliderIdx = { value: 0 };
    folder
      .add(sliderIdx, "value", -12, 12, 1)
      .name("goTo")
      .listen()
      .onChange(() => {
        this.goTo(sliderIdx.value);
      });
  }
}
