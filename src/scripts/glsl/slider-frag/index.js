import { Group, Mesh } from "three";
import gsap from "gsap";

import { Ob } from "#/glsl/Ob";
import vertexShader from "./vertex.glsl";
import fsBefore from "./before.glsl";
import fsAfter from "./after.glsl";

import square from "./square.glsl";
import gate from "./gate.glsl";
import diagonal from "./diagonal.glsl";
import flip from "./flip.glsl";
import book from "./book.glsl";
import collapse from "./collapse.glsl";
import swap from "./swap.glsl";

import { config, INode } from "#/helper";

// パターンを追加する際はこちらに記述
const fragType = {
  square,
  gate,
  diagonal,
  flip,
  book,
  collapse,
  swap,
};

// book
const MIN_AMOUNT = -0.16;
const MAX_AMOUNT = 1.5;

export default class extends Ob {
  beforeCreateMesh() {
    const type = INode.getDS(this.$.el, "frag") ?? "gate";
    this.fragType = type;
    this.angleRadian = -Math.PI / 4;
    this.activeSlideIdx = 0;
  }

  setupUniforms() {
    const uniforms = super.setupUniforms();
    uniforms.progress = uniforms.uProgress;

    // book用の処理
    if (this.fragType === "book") {
      uniforms.amount = {
        value: uniforms.progress.value * (MAX_AMOUNT - MIN_AMOUNT) + MIN_AMOUNT,
      };
      uniforms.cylinderCenter = { value: uniforms.amount.value };
      // 360 degrees * uniforms.amount
      uniforms.cylinderAngle = { value: 2.0 * Math.PI * uniforms.amount.value };
      uniforms.cylinderRadius = { value: 1.0 / Math.PI / 2.0 };

      uniforms.progress._value = uniforms.progress.value;
      Object.defineProperty(uniforms.progress, 'value', {
        set: function(newValue) {
          this._value = newValue;
          uniforms.amount.value = uniforms.progress.value * (MAX_AMOUNT - MIN_AMOUNT) + MIN_AMOUNT;
          uniforms.cylinderCenter.value = uniforms.amount.value;
          // 360 degrees * uniforms.amount
          uniforms.cylinderAngle.value = 2.0 * Math.PI * uniforms.amount.value;
          uniforms.cylinderRadius.value = 1.0 / Math.PI / 2.0;
        },
        get: function() {
          return this._value;
        }
      });
    }

    return uniforms;
  }

  setupVertex() {
    return vertexShader;
  }

  setupFragment() {
    const type = INode.getDS(this.$.el, "frag") ?? "gate";
    const frag = fragType[type];

    this.fragType = type;

    /* 2023/07/12 npm run build時のエラー発生対応 */
    const fs = fsBefore + '\n' + frag + '\n' + fsAfter;
    return fs;
  }

  setupTexes(uniforms) {
    uniforms.texCurrent = { value: this.texes.get(`${config.prefix.tex}1`) };
    uniforms.texNext = { value: null };
    return uniforms;
  }

  setupMesh() {
    const group = new Group;
    this.plane = super.setupMesh();
    group.add(this.plane);
    this.plane.rotation.y = this.angleRadian;
    this.plane.position.x += Math.cos(this.angleRadian);
    return group;
  }

  running = false;
  goTo(idx, duration = 1) {
    const _idx = ((idx % this.texes.size) + this.texes.size) % this.texes.size + 1;

    if (this.running) return;
    this.running = true;

    const nextTex = this.texes.get(config.prefix.tex + _idx);
    this.uniforms.texNext.value = nextTex;
    gsap.to(this.uniforms.uProgress, {
      value: 1,
      duration,
      ease: "power2.in",
      onComplete: () => {
        this.uniforms.texCurrent.value = this.uniforms.texNext.value;
        this.uniforms.uProgress.value = 0;
        this.activeSlideIdx = idx;
        this.running = false;
      },
    });
  }
  render(tick) {
    super.render(tick);

    if (this.fragType === "book") {
      this.uniforms.amount.value =
        this.uniforms.progress.value * (MAX_AMOUNT - MIN_AMOUNT) + MIN_AMOUNT;
    }
  }
  afterInit() {
    this.goTo(0, 0);
  }
  debug(folder) {
    folder.add(this, "angleRadian", -Math.PI,Math.PI, 0.01).name("angleRadian").listen().onChange(() => {
      this.plane.rotation.y = this.angleRadian;
    });
    folder
      .add(this.uniforms.uProgress, "value", 0, 1, 0.1)
      .name("progress")
      .listen();
    const sliderIdx = { value: 0 };
    folder
      .add(sliderIdx, "value", 0, 12, 1)
      .name("goTo")
      .listen()
      .onChange(() => {
        this.goTo(sliderIdx.value);
      });
  }
}
