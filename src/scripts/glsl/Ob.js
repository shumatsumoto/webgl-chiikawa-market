/**
 * エフェクトの基底クラス
 * 
 * 概要：エフェクトを作成する際は必ずObクラスを継承すること
 */
import gsap from "gsap";
import { PlaneGeometry, ShaderMaterial, Mesh, Vector2 } from "three";
import { utils, viewport, INode, config } from "#/helper";
import loader from "#/component/loader";

class Ob {
  static async init({ el, type }) {
    const texes = await loader.getTexByElement(el);
    const o = new this({ texes, el, type });
    return o;
  }

  constructor({ texes, el, type }) {
    this.$ = { el };
    this.texes = texes ?? [];

    this.scale = { width: 1, height: 1, depth: 1 };
    this.resizing = false;

    this.rect = this.originalRect = INode.getRect(el);

    if (!this.rect.width || !this.rect.height) {
      if (window.debug) {
        console.log(
          "要素に1px x 1px以上の大きさがないため、メッシュの作成をスキップします:",
          this.$.el
        );
      }
      return {};
    }

    try {
      this.beforeCreateMesh();
      this.defines = this.setupDefines();
      this.uniforms = this.setupUniforms();
      this.uniforms = this.setupTexes(this.uniforms);
      this.uniforms = this.setupResolution(this.uniforms);
      this.vertexShader = this.setupVertex();
      this.fragmentShader = this.setupFragment();
      this.material = this.setupMaterial();
      this.geometry = this.setupGeometry();
      this.mesh = this.setupMesh();
      this.disableOriginalElem();

      this.mesh.__marker = type;
    } catch (e) {
      if (window.debug) {
        console.log(e);
      }
      return {};
    }
  }

  // メッシュの作成前に実行する処理を記載
  beforeCreateMesh() {}

  // FragmentShader、またはVertexShaderの#defineに設定される値
  setupDefines() {
    return {
      PI: Math.PI,
    };
  }

  // ShaderMaterialのuniformsに設定する値
  setupUniforms() {
    return {
      uTick: { value: 0 },
      uMouse: { value: new Vector2(0.5, 0.5) },
      uHover: { value: 0 },
      uProgress: { value: 0 },
      uAlpha: { value: 0 },
    };
  }

  // ShaderMaterialのuniformsに設定する値（テクスチャ用）
  setupTexes(uniforms) {
    this.texes?.forEach((tex, key) => {
      const lastChar = key.charAt(key.length - 1);
      uniforms["tex" + lastChar] = { value: tex };
    });
    return uniforms;
  }

  // ジオメトリを返すメソッド
  setupGeometry() {
    return new PlaneGeometry(this.rect.width, this.rect.height, 1, 1);
  }

  // マテリアルを返すメソッド
  setupMaterial() {
    return new ShaderMaterial({
      defines: this.defines,
      vertexShader: this.vertexShader,
      fragmentShader: this.fragmentShader,
      uniforms: this.uniforms,
      transparent: true,
      alphaTest: 0.5,
      onBeforeCompile: this.onBeforeCompile, // 2023/5/5 WebGL1.0対応
    });
  }

  // 2023/5/5 WebGL1.0対応 
  onBeforeCompile(shader) {
    if (shader.isWebGL2) return; // WebGL 2.0の場合、変更は不要

    // WebGL1.0の場合はtexture関数が見つからないため、texture2Dにシェーダのコードを置換
    shader.vertexShader = shader.vertexShader.replace(/texture\(/g, 'texture2D(');
    shader.fragmentShader = shader.fragmentShader.replace(/texture\(/g, 'texture2D(');
  }

  // VertexShaderのコードを返すメソッド
  setupVertex() {
    throw new Error("このメソッドはオーバーライドして使用してください。");
  }

  // FragmentShaderのコードを返すメソッド
  setupFragment() {
    throw new Error("このメソッドはオーバーライドして使用してください。");
  }

  // テクスチャのアスペクト比計算に必要なuResolutionを計算するメソッド
  setupResolution(uniforms) {
    if (!this.texes.get(config.prefix.tex + 1)) return uniforms;
    const media = this.texes.get(config.prefix.tex + 1).source.data;

    const mediaRect = {};
    if (media instanceof HTMLImageElement) {
      mediaRect.width = media.naturalWidth;
      mediaRect.height = media.naturalHeight;
    } else if (media instanceof HTMLVideoElement) {
      mediaRect.width = media.videoWidth;
      mediaRect.height = media.videoHeight;
    }
    const resolution = utils.getResolutionUniform(this.rect, mediaRect);
    uniforms.uResolution = { value: resolution };

    return uniforms;
  }

  // メッシュを返すメソッド
  setupMesh() {
    return new Mesh(this.geometry, this.material);
  }

  // 読み込んだ画像タグ等の透明度を0にするメソッド
  disableOriginalElem() {
    this.$.el.draggable = false;
    this.$.el.style.opacity = 0;
  }

  // 画面幅の変更に伴うエフェクトの位置や大きさの制御
  async resize(duration = 1) {
    this.resizing = true;

    const {
      $: { el },
      mesh,
      originalRect,
    } = this;

    this.setupResolution(this.uniforms);

    const nextRect = INode.getRect(el);
    const { x, y } = this.getWorldPosition(nextRect, viewport);

    const p1 = new Promise((onComplete) => {
      gsap.to(mesh.position, {
        x,
        y,
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
          mesh.scale.set(this.scale.width, this.scale.height, this.scale.depth);
        },
        onComplete,
      });
    });

    await Promise.all([p1, p2]);

    this.rect = nextRect;

    this.resizing = false;
  }

  // メッシュのWorldポジションをHTMLの位置情報や大きさから取得するメソッド
  getWorldPosition(rect, canvasRect) {
    const x = rect.left + rect.width / 2 - canvasRect.width / 2;
    const y = -rect.top - rect.height / 2 + canvasRect.height / 2;
    return { x, y };
  }

  // スクロールに伴うメッシュの位置情報の変更を行うメソッド
  scroll() {
    if (this.fixed) return;
    const {
      $: { el },
      mesh,
    } = this;
    const rect = INode.getRect(el);
    const { x, y } = this.getWorldPosition(rect, viewport);
    // mesh.position.x = x;
    mesh.position.y = y;
  }

  // requestAnimationFrame内で繰り返し実行されるメソッド
  render(tick) {
    this.uniforms.uTick.value = tick;
  }

  // エフェクトの作成後に実行されるメソッド
  async afterInit() {}

  // 動画テクスチャの再生用メソッド
  async playVideo(texId = `${config.prefix.tex}1`) {
    this.uniforms[texId].value.source.data.play?.();
  }

  // 動画テクスチャの停止用メソッド
  pauseVideo(texId = `${config.prefix.tex}1`) {
    this.uniforms[texId].value.source.data.pause?.();
  }

  // lil-guiにパラメータを追加するためのメソッド
  // debug(folder) {
  // }
}

export { Ob };
