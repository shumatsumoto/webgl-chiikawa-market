import frag from "./fragment.glsl";
import vert from "./vertex.glsl";
import { Ob } from "../Ob.js";
import { Mesh, Group, VideoTexture } from "three";

import gsap from "gsap";
import { viewport, INode, utils } from "#/helper";

export default class extends Ob {
  beforeCreateMesh() {
    this.activeSlideIdx = 0;
    this.gap = 0;
    this.margin = 80;
    this.angleRadian = 0.1;
  }

  setupFragment() {
    return frag;
  }

  setupVertex() {
    return vert;
  }

  setupUniforms() {
    const uniforms = super.setupUniforms();
    uniforms.uDist = { value: 1.8 };
    uniforms.uSlideIdx = { value: 0 }; // 各スライドのメッシュの番号 0~4
    uniforms.uActiveSlideIdx = { value: this.activeSlideIdx }; // クリックされたスライドの番号
    return uniforms;
  }

  setupMesh() {
    const groupMesh = new Group();

    let i = 0;
    this.texes.forEach((tex) => {
      const mate = this.material.clone();
      mate.uniforms.tex1 = { value: tex };
      mate.uniforms.uTick = this.uniforms.uTick;
      mate.uniforms.uActiveSlideIdx = this.uniforms.uActiveSlideIdx;
      mate.uniforms.uDist = this.uniforms.uDist;
      mate.uniforms.uSlideIdx.value = i;
      const _mesh = new Mesh(this.geometry, mate);
      groupMesh.add(_mesh);
      i++;
    });

    this.slides = [...groupMesh.children];

    groupMesh.rotation.z = this.angleRadian;
    this.groupMesh = groupMesh;
    
    const scrollMesh = new Group();
    scrollMesh.add(groupMesh);

    return scrollMesh;
  }

  async resize(duration = 1) {
    this.resizing = true;

    const {
      $: { el },
      groupMesh: mesh,
      originalRect,
    } = this;

    this.setupResolution(this.uniforms);

    const nextRect = INode.getRect(el);
    let { x, y } = this.getWorldPosition(nextRect, viewport);

    this.gap = nextRect.width + this.margin;
    x -= this.gap * Math.cos(this.angleRadian) * this.activeSlideIdx;
    // console.log(-this.gap * Math.sin(this.angleRadian) * this.activeSlideIdx);
    const p1 = new Promise((onComplete) => {
      gsap.to(this.groupMesh.position, {
        x,
        y: -this.gap * Math.sin(this.angleRadian) * this.activeSlideIdx,
        overwrite: true,
        duration,
        onComplete,
      });
    });

    // 大きさの変更
    const p2 = new Promise((onComplete) => {
      gsap.to(this.scale, {
        width: nextRect.width / originalRect.width,
        height: nextRect.height / originalRect.height,
        depth: 1,
        overwrite: true,
        duration,
        onUpdate: () => {
          this.groupMesh.scale.set(
            this.scale.width,
            this.scale.height,
            this.scale.depth
          );

          this.slides.forEach((_slide, i) => {
            gsap.to(_slide.position, {
              x: (this.gap * i) / this.scale.width,
              overwrite: true,
              duration,
              onComplete,
            });
          });
        },
        onComplete,
      });
    });

    await Promise.all([p1, p2]);

    this.rect = nextRect;

    this.resizing = false;
  }

  render(tick) {
    this.uniforms.uTick.value = tick;
    const uActiveSlideIdx = this.uniforms.uActiveSlideIdx.value;
    const idx = utils.lerp(uActiveSlideIdx, this.activeSlideIdx, 0.07);

    if(this.uniforms.uActiveSlideIdx.value === idx) return;

    const { x } = this.getWorldPosition(this.rect, viewport);
    this.groupMesh.position.x = x - this.gap * Math.cos(this.angleRadian) * idx;
    this.groupMesh.position.y = -this.gap * Math.sin(this.angleRadian) * idx;
    this.uniforms.uActiveSlideIdx.value = idx;
  }

  playVideo(idx) {
    const i = idx % this.slides.length;
    const slide = this.slides.at(i);
    const tex1Value = slide.material.uniforms.tex1.value;
    this.playingVideo?.pause();
    if (tex1Value instanceof VideoTexture) {
      this.playInterval = setInterval(() => {
        if (this.uniforms.uActiveSlideIdx.value === idx) {
          this.playingVideo = tex1Value.source.data;
          this.playingVideo.play?.();
          clearInterval(this.playInterval);
        }
      }, 200);
    }
  }

  goTo(idx) {
    this.activeSlideIdx = (this.texes.size + idx) % this.texes.size;
    this.playVideo(this.activeSlideIdx);
  }

  afterInit() {
    this.goTo(this.activeSlideIdx);
  }

  debug(folder) {
    folder.add(this.uniforms.uDist, "value", -2,10, 0.01).name("uDist").listen();
    folder.add(this, "angleRadian", -Math.PI,Math.PI, 0.01).name("angleRadian").listen().onChange(() => {
      this.groupMesh.rotation.z = this.angleRadian;
    });
  }
}
