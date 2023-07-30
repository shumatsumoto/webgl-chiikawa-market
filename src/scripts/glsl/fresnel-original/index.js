// ダイナミックインポートされるため拡張子あり、相対パスで指定
import frag from "./fragment.glsl";
import vert from "./vertex.glsl";
import { Ob } from "../Ob.js";
import { viewport } from "#/helper";

import { PlaneGeometry, Vector2 } from "three";

export default class extends Ob {

  setupGeometry() {
    const geometry = new PlaneGeometry(this.rect.width, this.rect.height, 1, 1);
    return geometry;
  }

  setupFragment() {
    return frag;
  }
  setupVertex() {
    return vert;
  }

  setupUniforms() {
    const uniforms = {
      uProgress: { value: 0 },
      uTick: { value: 0 },
      uViewport: { value: new Vector2(viewport.width, viewport.height) },
      uScale: { value: 1 },
    };
    return uniforms;
  }
}
