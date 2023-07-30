import { Ob } from "#/glsl/Ob";
import vertexShader from "./vertex.glsl";
import fragmentShader from "./fragment.glsl";

import { utils } from "#/helper";

export default class extends Ob {
    beforeCreateMesh() {
        if(utils.isLowPerformanceMode()) {
            if(window.debug) {
                console.log(this.$.el);
            }
            throw new Error('ローパフォーマンスモードのため、メッシュの作成をスキップします。');
        }
    }
     setupUniforms() {
        const uniforms = super.setupUniforms();
        uniforms.uReversal = { value: 0 };
        return uniforms;
    }
    setupTexes(uniforms) {
        const _uniforms = super.setupTexes(uniforms);
        if(utils.isSafari()) {
            _uniforms.tex1 = _uniforms.tex2;
        }
        return _uniforms;
    }
    setupVertex() {
        return vertexShader;
    }
    setupFragment() {
        return fragmentShader;
    }
}