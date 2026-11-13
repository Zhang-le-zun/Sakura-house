(function(){
'use strict';
const Sakura = window.Sakura;
const C = Sakura.CONFIG;
const U = Sakura.Util;
class Core {
  constructor(){
    this.stage = document.getElementById('stage');
    this.clock = new THREE.Clock();
    this.tickers = [];
    this.quality = { name: 'desktop', dpr: C.quality.desktop.dpr, shadow: C.quality.desktop.shadow, reflect: C.quality.desktop.reflect };
    this.drag = { active:false, moved:false, lastX:0, lastY:0, x:0, y:0, pointerId:null, pinch:false, startDist:0, startRadius:C.camera.radius };
    this.pointers = new Set();
    this.hour = 7;
    this.targetHour = 7;
    this.hourTween = null;
    this._initRenderer();
    this._initCamera();
    this._initLights();
    this._initInteraction();
    this._initResize();
    this.resize();
  }
  _initRenderer(){
    this.renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true, powerPreference:'high-performance', preserveDrawingBuffer:false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.quality.dpr));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.02;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setClearColor(0x000000, 0);
    this.stage.appendChild(this.renderer.domElement);
    this.canvas = this.renderer.domElement;
  }
  _initCamera(){
    this.scene = new THREE.Scene();
    const cam = C.camera;
    this.camera = new THREE.PerspectiveCamera(cam.fov, 1, cam.near, cam.far);
    this.target = new THREE.Vector3(cam.target[0], cam.target[1], cam.target[2]);
    this.spherical = { radius: cam.radius, azimuth: cam.azimuth, polar: cam.polar };
    this._applyCamera();
  }
  _initLights(){
    this.lights = {};
    this.lights.hemi = new THREE.HemisphereLight(0xdfeee8, 0x6e7964, 1.05);
    this.scene.add(this.lights.hemi);
    this.lights.ambient = new THREE.AmbientLight(0xd7e4de, .42);
    this.scene.add(this.lights.ambient);
    this.lights.sun = new THREE.DirectionalLight(0xffe9c6, 2.25);
    this.lights.sun.position.set(-9, 11, 8);
    this.lights.sun.castShadow = true;
    this.lights.sun.shadow.mapSize.set(this.quality.shadow, this.quality.shadow);
    this.lights.sun.shadow.camera.near = 2;
    this.lights.sun.shadow.camera.far = 40;
    this.lights.sun.shadow.camera.left = -13;
    this.lights.sun.shadow.camera.right = 13;
    this.lights.sun.shadow.camera.top = 13;
    this.lights.sun.shadow.camera.bottom = -13;
    this.lights.sun.shadow.bias = -0.0006;
    this.lights.sun.shadow.normalBias = 0.035;
    this.scene.add(this.lights.sun);
    this.lights.fill = new THREE.DirectionalLight(0xa9cdd6, 0.55);
    this.lights.fill.position.set(8, 6, -7);
    this.scene.add(this.lights.fill);
    this.lights.rim = new THREE.DirectionalLight(0xffd5cc, 0.42);
    this.lights.rim.position.set(2, 7, -10);
    this.scene.add(this.lights.rim);
  }
  _initInteraction(){
    const c = this.canvas;
    c.addEventListener('pointerdown', e=>{
      if (e.button !== undefined && e.button !== 0) return;
      this.pointers.add(e.pointerId);
      if (e.pointerType === 'touch' && this.pointers.size > 1){ this.drag.active=false; this.drag.pinch=true; return; }
      this.drag.active = true;
      this.drag.moved = false;
      this.drag.lastX = e.clientX; this.drag.lastY = e.clientY;
      this.drag.pointerId = e.pointerId;
      this.drag.startX = e.clientX; this.drag.startY = e.clientY;
      this.drag.startDist = 0;
      this.stage.classList.add('is-dragging');
      c.setPointerCapture?.(e.pointerId);
    });
    c.addEventListener('pointermove', e=>{
      if (this.drag.pinch) return;
      if (!this.drag.active) return;
      const dx = e.clientX - this.drag.lastX;
      const dy = e.clientY - this.drag.lastY;
      if (Math.abs(e.clientX - this.drag.startX) + Math.abs(e.clientY - this.drag.startY) > 5) this.drag.moved = true;
      this.drag.lastX = e.clientX; this.drag.lastY = e.clientY;
      this.spherical.azimuth -= dx * 0.0052;
      this.spherical.polar = U.clamp(this.spherical.polar - dy * 0.0042, C.camera.minPolar, C.camera.maxPolar);
      this._applyCamera();
    });
    const end = e=>{
      this.pointers.delete(e.pointerId);
      if (this.pointers.size < 2) this.drag.pinch = false;
      if (!this.drag.active) return;
      this.drag.active = false;
      this.stage.classList.remove('is-dragging');
      if (!this.drag.moved) this._onClick?.(e);
      this.drag.pointerId = null;
    };
    c.addEventListener('pointerup', end);
    c.addEventListener('pointercancel', e=>{ this.pointers.delete(e.pointerId); if(this.pointers.size<2) this.drag.pinch=false; this.drag.active=false; this.drag.pointerId=null; this.stage.classList.remove('is-dragging'); });
    c.addEventListener('wheel', e=>{
      e.preventDefault();
      this.spherical.radius = U.clamp(this.spherical.radius + e.deltaY * 0.018, C.camera.minRadius, C.camera.maxRadius);
      this.userZoomed = true;
      this._applyCamera();
    }, { passive:false });
    c.addEventListener('contextmenu', e=>e.preventDefault());
    c.addEventListener('touchstart', e=>{
      if (e.touches.length === 2){
        this.drag.pinch = true;
        this.drag.moved = true;
        const t=e.touches;
        this.drag.startDist = Math.hypot(t[0].clientX-t[1].clientX, t[0].clientY-t[1].clientY);
        this.drag.startRadius = this.spherical.radius;
      }
    }, { passive:true });
    c.addEventListener('touchmove', e=>{
      if (e.touches.length === 2){
        e.preventDefault();
        this.drag.pinch = true; this.drag.moved = true;
        const t=e.touches;
        const d = Math.hypot(t[0].clientX-t[1].clientX, t[0].clientY-t[1].clientY);
        this.spherical.radius = U.clamp(this.drag.startRadius * (this.drag.startDist / Math.max(1,d)), C.camera.minRadius, C.camera.maxRadius);
        this.userZoomed = true;
        this._applyCamera();
      }
    }, { passive:false });
    c.addEventListener('touchend', e=>{ if (e.touches.length < 2) this.drag.pinch=false; });
    c.addEventListener('webglcontextlost', e=>{
      e.preventDefault();
      const msg = document.getElementById('fatalMsg');
      if (msg) msg.textContent = '显示上下文已丢失，请刷新页面重新展开庭院。';
      const fatal = document.getElementById('fatal'); if (fatal) fatal.hidden = false;
    });
  }
  _initResize(){
    window.addEventListener('resize', ()=>this.resize(), { passive:true });
  }
  resize(){
    const w = window.innerWidth, h = window.innerHeight;
    this.renderer.setSize(w, h);
    this.camera.aspect = w / Math.max(1,h);
    const mobile = w < 760 || h > w * 1.2;
    if (mobile !== (this.quality.name === 'mobile')){
      this.quality.name = mobile ? 'mobile' : 'desktop';
      this.quality.dpr = mobile ? C.quality.mobile.dpr : C.quality.desktop.dpr;
      this.quality.shadow = mobile ? C.quality.mobile.shadow : C.quality.desktop.shadow;
      this.quality.reflect = mobile ? C.quality.mobile.reflect : C.quality.desktop.reflect;
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.quality.dpr));
      if (this.lights.sun){
        this.lights.sun.shadow.mapSize.set(this.quality.shadow, this.quality.shadow);
        if (this.lights.sun.shadow.map) { this.lights.sun.shadow.map.dispose(); this.lights.sun.shadow.map=null; }
      }
    }
    this.camera.fov = mobile ? 48 : 34;
    this.baseRadius = mobile ? (w < 500 ? 40.0 : 33.0) : 33.2;
    if (!this.userZoomed) this.spherical.radius = this.baseRadius;
    this.camera.updateProjectionMatrix();
    this._applyCamera();
    this._onResize?.(w,h,mobile);
  }
  _applyCamera(){
    const s = this.spherical;
    const sp = Math.sin(s.polar), cp = Math.cos(s.polar);
    this.camera.position.set(
      this.target.x + s.radius * sp * Math.sin(s.azimuth),
      this.target.y + s.radius * cp,
      this.target.z + s.radius * sp * Math.cos(s.azimuth)
    );
    this.camera.lookAt(this.target);
    if (this.lights && this.lights.sun){
      const l = this.lights.sun;
      l.target.position.copy(this.target);
      this.scene.add(l.target);
    }
  }
  addTicker(fn, priority=0){ this.tickers.push({ fn, priority }); this.tickers.sort((a,b)=>a.priority-b.priority); return fn; }
  removeTicker(fn){ this.tickers = this.tickers.filter(t=>t.fn!==fn); }
  setHour(hour, immediate=false){
    this.targetHour = U.clamp(hour, 6.5, 23.5);
    if (immediate){
      this.hour = this.targetHour;
      this.hourTween = null;
      this._applyHour?.();
      return;
    }
    this.hourTween = { from: this.hour, to: this.targetHour, t: 0, duration: 1.15 };
  }
  update(dt){
    if (this.hourTween){
      const tw = this.hourTween;
      tw.t += dt / tw.duration;
      const k = U.easeInOut(Math.min(1,tw.t));
      this.hour = U.lerp(tw.from, tw.to, k);
      if (tw.t >= 1){ this.hour = tw.to; this.hourTween = null; }
      this._applyHour?.();
    }
    for (const t of this.tickers) t.fn(dt, this.hour, this);
  }
  start(){
    const clock = this.clock;
    const loop = ()=>{
      requestAnimationFrame(loop);
      const dt = Math.min(clock.getDelta(), 0.05);
      this.update(dt);
      this.renderer.render(this.scene, this.camera);
    };
    loop();
  }
}
Sakura.Core = Core;
})();