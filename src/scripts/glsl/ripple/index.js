import * as THREE from "three";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import fragmentShader from "./fragment.glsl";
import vertexShader from "./vertex.glsl";

import { viewport } from "#/helper";

class Ripple {
  constructor(tex, vp) {
    const ripple = { width: vp.width / 10, height: vp.height / 10 };
    this.geo = new THREE.PlaneGeometry(ripple.width, ripple.height);
    this.material = new THREE.MeshBasicMaterial({ transparent: 1, map: tex });
    this.mesh = new THREE.Mesh(this.geo, this.material);
    this.mesh.visible = false;
    this.isUsed = false;
  }

  start(mouse) {
    const { material, mesh } = this;

    this.isUsed = true;
    mesh.visible = true;
    mesh.position.x = mouse.x;
    mesh.position.y = mouse.y;
    mesh.scale.x = mesh.scale.y = 0.2;
    material.opacity = 0.5;
    mesh.rotation.z = 2 * Math.PI * Math.random();
    this.animate();
  }

  animate() {
    const { mesh, material } = this;
    mesh.scale.y = mesh.scale.x = mesh.scale.x + 0.03;
    material.opacity *= 0.97;
    mesh.rotation.z += 0.001;

    if(material.opacity <= 0.01) {
      // ループ終了
      this.isUsed = false;
      mesh.visible = false;
    } else {
      requestAnimationFrame(() => {
        this.animate();
      });
    }
  }
}

async function initRipplePass(world, mouse) {
  const scene = new THREE.Scene();

  const vp = {
    width: viewport.width / 5,
    height: viewport.height / 5,
  }

  const camera = new THREE.OrthographicCamera(
    -vp.width / 2,
    vp.width / 2,
    vp.height / 2,
    -vp.height / 2,
    0,
    2
  );

  camera.position.z = 1;

  const renderer = new THREE.WebGLRenderTarget();

  renderer.setSize(vp.width, vp.height);

  const rippleCount = 50;
  const texLoader = new THREE.TextureLoader();
  const tex = await texLoader.loadAsync("/img/disps/ripple.png");
  const ripples = [];
  for (let i = 0; i < rippleCount; i++) {
    const ripple = new Ripple(tex, vp);
    scene.add(ripple.mesh);
    ripples.push(ripple);
  }

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      tDiffuse: { value: null },
      texRipple: { value: renderer.texture }
    }
  });

  const pass = new ShaderPass(material);
  world.addPass(pass);

  mouse.addMousemoveAction(onMousemove);
  function onMousemove(mouse) {
    const position = mouse.getMapPos(vp.width, vp.height);
    if (mouse.tick % 5 === 0) {
      const _ripple = ripples.find((ripple) => !ripple.isUsed);

      if (!_ripple) return;

      _ripple.start(position);
    }
  }
  
  world.addRenderAction(renderRipple);
  function renderRipple({ renderer: mainRenderer }) {
    mainRenderer.setRenderTarget(renderer);
    mainRenderer.render(scene, camera);
    mainRenderer.setRenderTarget(null);
    mouse.tick++;
  }

  function getTexture() {
    return renderer.texture;
  }

  function addPass() {
    world.addPass(pass);
  }

  function removePass() {
    world.removePass(pass);
  }

  return {
    getTexture,
    addPass,
    removePass
  }
};

export { initRipplePass }