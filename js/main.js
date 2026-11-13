(function(){
'use strict';
const Sakura=window.Sakura;
function fatal(msg){
  const el=document.getElementById('fatal'), m=document.getElementById('fatalMsg');
  if(m&&msg) m.textContent=msg;
  if(el) el.hidden=false;
  document.body.classList.add('is-ready');
}
function boot(){
  try{
    if(!window.THREE) return fatal('Three.js 未能加载，请确认 vendor/three.min.js 文件存在。');
    if(!(document.createElement('canvas').getContext('webgl2')||document.createElement('canvas').getContext('webgl'))) return fatal('当前浏览器没有可用的 WebGL，请更换现代浏览器后重试。');
    Sakura.Textures.init();
    Sakura.Helpers.init();
    const core=new Sakura.Core();
    window.__sakuraCore=core;
    const env=Sakura.Environment.build(core);
    const house=Sakura.House.build();
    core.scene.add(house.root);
    const tea=Sakura.Tea.build(house.root);
    const garden=Sakura.Garden.build(core.scene);
    const water=Sakura.Water.build(core.scene);
    const atmo=Sakura.Atmosphere.build(core,{house,env,water,garden});
    core._water=water; core._house=house; core._garden=garden; core._atmo=atmo; core._env=env;
    Sakura.Helpers.mergeStatic(core.scene);
    const ui=Sakura.UI.init(core,{house,water,atmo});
    core._applyHour=()=>{ const p=Sakura.Palette.sample(core.hour); atmo.apply(p,core); };
    // picking
    const ray=new THREE.Raycaster(); const ndc=new THREE.Vector2();
    function resolveClick(obj){
      let o=obj;
      while(o){ if(o.userData && o.userData.click) return o.userData.click; o=o.parent; }
      return null;
    }
    function pickAt(clientX,clientY){
      const r=core.canvas.getBoundingClientRect();
      ndc.x=((clientX-r.left)/r.width)*2-1;
      ndc.y=-((clientY-r.top)/r.height)*2+1;
      ray.setFromCamera(ndc,core.camera);
      const hits=ray.intersectObjects(core.scene.children,true);
      for(const hit of hits){
        const type=resolveClick(hit.object);
        if(type) return {type,hit};
      }
      return null;
    }
    core._onClick=function(e){
      const picked=pickAt(e.clientX,e.clientY);
      if(!picked) return;
      if(picked.type==='shoji'){
        const opened=house.toggleDoor();
        ui.flash(opened?'障子推开了 · 风也进来':'障子合上 · 留下庭前微光');
      }else if(picked.type==='chime'){
        atmo.clickChime();
        ui.flash('风铃轻响');
      }else if(picked.type==='water'){
        water.spawnRipple(picked.hit.point.x,picked.hit.point.z,1);
        ui.flash('落下一圈水纹');
      }
    };
    core.canvas.addEventListener('pointermove',e=>{
      if(core.drag.active) return;
      const hit=pickAt(e.clientX,e.clientY);
      core.canvas.style.cursor=hit?'pointer':'grab';
    });
    // animation
    let time=0, elapsed=0, frames=0, acc=0, degraded=false;
    const reducedMotion=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(reducedMotion){ atmo.petals.mesh.visible=false; }
    core.addTicker((dt,hour)=>{
      time+=dt*(reducedMotion?.16:1); elapsed+=dt; frames++; acc+=dt;
      if(!degraded && elapsed>4.5){
        const fps=frames/Math.max(.001,acc);
        if(fps<38 && core.quality.name==='desktop'){
          degraded=true;
          core.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.25));
          core.lights.sun.shadow.mapSize.set(1024,1024);
          if(core.lights.sun.shadow.map){core.lights.sun.shadow.map.dispose();core.lights.sun.shadow.map=null;}
          core.quality.reflect=256;
        } else if(fps<26 && core.quality.name==='mobile'){
          degraded=true;
          core.renderer.setPixelRatio(1.15);
          core.lights.sun.shadow.mapSize.set(512,512);
          if(core.lights.sun.shadow.map){core.lights.sun.shadow.map.dispose();core.lights.sun.shadow.map=null;}
          core.quality.reflect=128;
        }
      }
      house.update(dt);
      tea.update(dt,time);
      garden.update(dt,time,hour,core);
      water.update(dt,time,hour,core);
      atmo.update(dt,time,hour,core);
      ui.sync(hour);
    });
    core._onResize=(w,h,mobile)=>{
      if(water && water['reflectRT']) water['reflectRT'].setSize(mobile?256:512,mobile?256:512);
    };
    core.start();
    // first frame ready
    requestAnimationFrame(()=>{
      setTimeout(()=>{
        document.body.classList.add('is-ready');
        window.__sakuraReady=true;
      },350);
    });
    const startHour=7;
    core.setHour(startHour,true);
    core._applyHour();
    window.__sakuraDebug={
      setHour(h,immediate=true){ core.setHour(h,immediate); if(immediate){core._applyHour();} ui.sync(core.hour); },
      toggleDoor(){ return house.toggleDoor(); },
      triggerChime(){ return atmo.clickChime(); },
      spawnRipple(x,z){ return water.spawnRipple(x,z,1); },
      getStats(){ return {hour:+core.hour.toFixed(2),calls:core.renderer.info.render.calls,triangles:core.renderer.info.render.triangles,geometries:core.renderer.info.memory.geometries,textures:core.renderer.info.memory.textures,quality:core.quality.name,doorTarget:house.state.target,flowers:garden.blossoms.count,petals:garden.ribbons.length,ready:!!window.__sakuraReady}; },
      setQuality(name){ core.quality.name=name; core.quality.reflect=name==='mobile'?256:512; core.renderer.setPixelRatio(name==='mobile'?1.25:Math.min(window.devicePixelRatio||1,2)); },
      scene:core.scene,camera:core.camera,renderer:core.renderer
    };
    window.addEventListener('error',e=>{ if(e.message && !window.__sakuraReady) fatal(e.message); });
  }catch(err){
    console.error(err);
    fatal('场景初始化失败：'+(err&&err.message?err.message:err));
  }
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();