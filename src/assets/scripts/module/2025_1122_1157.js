import { DirectionalLight, PointLight, FogExp2, MeshPhongMaterial, PlaneGeometry, LinearFilter, TextureLoader, ShaderMaterial, Mesh} from 'three'
import NoiseOverlay from './VanillaEffect.js';

import { gsap, ScrollTrigger } from 'gsap/all';
gsap.registerPlugin(ScrollTrigger); 

export default class Obj_1 {
  constructor(stage) {
    this.stage = stage;
    this.effect = new NoiseOverlay();
		this.geo_pos = [1.7, 1.7];
    this.textureMap = {};
  }
  
  init() {
      this._clicks();
      this.effect.init(this.stage.scene);
      //this._setBg_base();
    }

  _clicks() {
    const buttonBox = document.querySelector('.effect_btn');
    if (!buttonBox) {
      return false;
    }
  
    let grid =  document.getElementById("gird-canvas");
    
    buttonBox.addEventListener('click', () => {
      buttonBox.classList.toggle("effect");
      
      if( buttonBox.classList.contains('effect') == true ){
        gsap.to(grid, {
          autoAlpha: 1,
          duration: .15,
          ease: 'Power2.out',
        });
        //
        gsap.to(this.plane.material.uniforms.u_saturation, {
          value: -0.75,
          duration: 1.5,
        });
        //
        gsap.to(this.plane.material.uniforms.u_thresholdMix, {
          value: 0.25, 
          duration: 2.5,
          delay: 0.1,
        });
        //
        gsap.to(this.plane.material.uniforms.u_grainMultiplier, { 
          value: 2, duration: 3.5, delay: 0.1,
            onComplete: function() {
            }          
        }); 
        } else {
          gsap.to(grid, {
            autoAlpha: 0,
            duration: .25,
            ease: 'Power2.out',
          });
          //
          gsap.to(this.plane.material.uniforms.u_saturation, {
            overwrite: true,
            value: 0.0,
            duration: 0.1,
          });
          //
          gsap.to(this.plane.material.uniforms.u_thresholdMix, {
            overwrite: true,
            value: 0.0, 
            duration: 0.5,
          });
          //
          gsap.to(this.plane.material.uniforms.u_grainMultiplier, {
            overwrite: true,
            value: 0.0,
            duration: 0.5
          });
          //        
          gsap.to(this.plane.position, {
            z: -3,
            duration: 0.05,
          });
  
          }
    });    

  }
  _setBg_base(){
    let self = this;
    
    const light = new PointLight(0xffffff, 100)
    light.position.set(10, 10, 10)
    
    this.stage.scene.add(light);
    
    this.textureMap = new TextureLoader().load('../images/2025_1122_1157.png',
    (tex) => { 
    let h = (window.innerWidth / window.innerHeight);
    let w =  tex.image.width / (tex.image.height / h);
    tex.magFilter = LinearFilter;
    tex.minFilter = LinearFilter;
    this.textureMap = tex;
    
    // 平面
    const geometry = new PlaneGeometry(3, 3);
    
    const shaderMaterial = new ShaderMaterial({
      uniforms: {
        uTexture: { value: this.textureMap },
        u_saturation: { type: "f", value: 0.0 },
        u_thresholdValue: { value: 0.5 },  
        u_thresholdMix: { value: 0.0 }, 
        u_grainMultiplier: { value: 1.2 },
      },
      vertexShader: document.querySelector('#v-shader').textContent,
      fragmentShader: document.querySelector('#f-shader').textContent,
      transparent: true,
  });
  
    self.plane = new Mesh( geometry, shaderMaterial );
    self.plane.position.set(0, 0, -3);
    self.plane.scale.set(w, h, 1);
    self.plane.renderOrder = 0;

    this.stage.scene.add( self.plane );
  
});
}

  onResize() {
    const tex = this.textureMap;
    if ( tex.image ) {
      let h = (window.innerWidth / window.innerHeight);
      let w =  tex.image.width / (tex.image.height / h);
      this.plane.scale.set(w, h, 1);
    }      
  }

  onRaf() {
        this.effect.update();
  }
}