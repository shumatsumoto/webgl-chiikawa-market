// ダイナミックインポートされるため拡張子あり、相対パスで指定
import frag from "./fragment.glsl";
import vert from "./vertex.glsl";
import { Ob } from "../Ob";

export default class extends Ob {
  setupFragment() {
    return frag;
  }
  setupVertex() {
    return vert;
  }
}
