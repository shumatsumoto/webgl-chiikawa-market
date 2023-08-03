import { Vector4 } from "three";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";

function initDistortionPass(world) {
  const o = world.getObjByEl(".load-pp");
  const { material, uniforms } = o;
  world.removeObj(o, false);
  uniforms.tDiffuse = { value: null };
  uniforms.uProgress.value = 0;
  uniforms.uReversal.value = 1;
  uniforms.uParam = { value: new Vector4(1, 8, 7, 2) };
  material.alphaTest = 0;
  const pass = new ShaderPass(material);
  world.addPass(pass);

  function setProgress(value) {
    uniforms.uProgress.value = value;
  }
  function removePass() {
    world.removePass(pass);
    o.geometry.dispose();
    o.material.dispose();
  }

  return {
    removePass,
    setProgress
  }
}

export { initDistortionPass };
