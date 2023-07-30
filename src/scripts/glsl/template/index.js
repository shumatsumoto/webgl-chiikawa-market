import { Ob } from "#/glsl/Ob";
import vertexShader from "./vertex.glsl";
import fragmentShader from "./fragment.glsl";

export default class extends Ob {
    setupVertex() {
        return vertexShader;
    }
    setupFragment() {
        return fragmentShader;
    }
}