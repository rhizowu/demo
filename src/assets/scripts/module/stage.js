import { Scene, PerspectiveCamera, WebGLRenderer, Vector3, Clock } from 'three';
export default class Stage {
  constructor() {
    this.renderParam = {
      clearColor: 0x000000,
      width: window.innerWidth,
      height: window.innerHeight
    };
    this.cameraParam = {
      fov: 45,
      near: 0.1,
      far: 200,
      lookAt: new Vector3(0, 0, 0),
      x: 0,
      y: 0,
      z: 4,
    };

    this.scene = null;
    this.camera = null;
    this.renderer = null;
this.clock = null; // ★ Clockインスタンスを格納するプロパティを追加    
    this.isInitialized = false;
this._initClock(); // ★ Clockの初期化をinitに追加
    //this.orbitcontrols = null;
  }

  init() {
    this._setScene();
    this._setRender();
    this._setCamera();
    this._setDev();
  }

  _setScene() {
    this.scene = new Scene();
    //this.scene.background = new Color(0x000000);

  }
_initClock() {
      this.clock = new Clock();
  }
  _setRender() {
    const wrapper = document.querySelector("#webgl");
    this.renderer = new WebGLRenderer({
      //alpha: true
      antialias: false
    });
    
    this.renderer.physicallyCorrectLights = true;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    //this.renderer.setClearColor(this.renderParam.clearColor, 0);
    this.renderer.autoClear = true;
    this.renderer.setSize(this.renderParam.width, this.renderParam.height);
    //this.renderer.physicallyCorrectLights = true;
    
    //this.renderer.outputEncoding = sRGBEncoding;
    //this.renderer.toneMapping = ACESFilmicToneMapping;

    wrapper.appendChild(this.renderer.domElement);
  }

  _setCamera() {
    if (!this.isInitialized) {
      this.camera = new PerspectiveCamera(
        0,
        document.body.clientWidth / document.body.clientHeight,
        this.cameraParam.near,
        this.cameraParam.far
      );

      this.camera.position.set(
        this.cameraParam.x,
        this.cameraParam.y,
        this.cameraParam.z
      );
      this.camera.lookAt(this.cameraParam.lookAt);

      this.isInitialized = true;
    }

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    this.camera.aspect = windowWidth / windowHeight;
    this.camera.fov = this.cameraParam.fov;

    this.camera.updateProjectionMatrix();
    this.renderer.setSize(windowWidth, windowHeight);
  }

  _setDev() {
    //this.orbitcontrols = new OrbitControls(
    //  this.camera,
    //  this.renderer.domElement,
    //);
    this.camera,
    this.renderer.domElement,

    //this.orbitcontrols.enableDamping = true;
    this.isDev = true;
  }

  _render() {
    //this.renderer.clearDepth();
    this.renderer.render(this.scene, this.camera);
    //if (this.isDev) this.orbitcontrols.update();
  }
  
  onResize() {
    this._setCamera();
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderParam.width;
    this.renderParam.height;
  }

  onRaf() {
    this._render();
  }
}