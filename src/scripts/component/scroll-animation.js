/**
 * スクロールアニメーションの制御ファイル
 * 
 * 概要：data-scroll-trigger属性によって実行される処理
 */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { INode, viewport, utils, config } from "#/helper";
import world from "#/glsl/world";
import mouse from "#/component/mouse";
import { initRipplePass } from "#/glsl/ripple";

const ACIONS = {
  progress,
  fade,
  progressParticles,
  playVideo,
  logo,
  reversal,
  ripple,
  // progressSplit
};

let startTrigger = null;
function registScrollAnimations() {
  startTrigger = viewport.isMobile() ? "top 80%" : "top 70%";

  const els = INode.qsAll(`[data-${config.prefix.scrollTrigger}]`);

  els.forEach((el) => {
    const key = utils.toCamelCase(config.prefix.scrollTrigger);
    const types = INode.getDS(el, key).split(",");
    types.forEach((type) => {
      // type アニメーション
      ACIONS?.[type]?.(el);
    });
  });
}

function progress(target) {
  ScrollTrigger.create({
    trigger: target,
    start: startTrigger,
    onEnter() {
      const o = world.getObjByEl(target);
      if (!o) return;
      gsap.to(o.uniforms.uProgress, {
        value: 1,
      });
    },
    onLeaveBack() {
      const o = world.getObjByEl(target);
      if (!o) return;
      gsap.to(o.uniforms.uProgress, {
        value: 0,
      });
    },
  });
}


// function progressSplit(target) {
//   ScrollTrigger.create({
//     trigger: target,
//     start: "center center",
//     onEnter() {
//       const o = world.getObjByEl(target);
//       if (!o) return;
//       gsap.to(o.uniforms.uProgress, {
//         value: 1,
//       });
//     },
//     onLeaveBack() {
//       const o = world.getObjByEl(target);
//       if (!o) return;
//       gsap.to(o.uniforms.uProgress, {
//         value: 0,
//       });
//     },
//   });
// }

function fade(target) {
  ScrollTrigger.create({
    trigger: target,
    start: startTrigger,
    onEnter() {
      target.classList.add("inview");
    },
    onLeaveBack() {
      target.classList.remove("inview");
    },
  });
}

function progressParticles(target) {
  ScrollTrigger.create({
    trigger: target,
    start: "center center",
    end: "center center",
    onEnter() {
      const o = world.getObjByEl(target);
      if (!o) return;
      o.goTo(1, 1);
    },
    onEnterBack() {
      const o = world.getObjByEl(target);
      if (!o) return;
      o.goTo(0, 1);
    },
  });
}

function playVideo(target) {
  const o = world.getObjByEl(target);
  if (!o) return;
  const video = o.uniforms.tex1.value.source.data;
  ScrollTrigger.create({
    trigger: target,
    start: startTrigger,
    onEnter() {
      video.paused && video?.play();
    },
    onEnterBack() {
      video.paused && video?.play();
    },
    onLeave() {
      video?.pause();
    },
    onLeaveBack() {
      video?.pause();
    },
  });
}

function logo(target) {
  ScrollTrigger.create({
    trigger: target,
    start: "center top",
    onEnter() {
      target.classList.add("inview");
    },
    onEnterBack() {
      target.classList.remove("inview");
    },
  });
}

function reversal(target) {
  const fresnel = world.getObjByEl(".fresnel");
  const skillTitle = world.getObjByEl(".skill__title-text");
  const graphicTitle = world.getObjByEl(".graphic__title-text");

  const reversal = { value: 0 };
  function onUpdate() {
    fresnel && (fresnel.uniforms.uReversal.value = reversal.value);
    skillTitle && (skillTitle.uniforms.uReversal.value = reversal.value);
    graphicTitle && (graphicTitle.uniforms.uReversal.value = reversal.value);
  }

  gsap.set(":root", {
    "--c-text": "#dadada",
    "--c-sec": "rgba(218,218,218,0.8)",
    "--c-main": "white",
    "--c-bg": "radial-gradient(#000, #191919)",
  });

  ScrollTrigger.create({
    trigger: target,
    start: startTrigger,
    onEnter() {
      gsap.to(":root", {
        "--c-text": "#333",
        "--c-sec": "rgba(51,51,51,0.8)",
        "--c-main": "black",
        "--c-bg": "radial-gradient(#fff, #e5e5e5)",
      });
      gsap.to(reversal, {
        value: 1,
        onUpdate,
      });
    },
    onLeaveBack() {
      gsap.to(":root", {
        "--c-text": "#dadada",
        "--c-sec": "rgba(218,218,218,0.8)",
        "--c-main": "white",
        "--c-bg": "radial-gradient(#000, #191919)",
      });
      gsap.to(reversal, {
        value: 0,
        onUpdate,
      });
    },
  });
}

async function ripple(target) {
  if (viewport.isMobile()) return;

  const { addPass, removePass } = await initRipplePass(world, mouse);

  ScrollTrigger.create({
    trigger: target,
    start: "center center",
    end: "center center",
    onEnter() {
      removePass();
    },
    onEnterBack() {
      addPass();
    },
  });
}

export { registScrollAnimations };
