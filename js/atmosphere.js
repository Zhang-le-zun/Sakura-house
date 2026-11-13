(function(){
'use strict';
const Sakura = window.Sakura;
const C = Sakura.CONFIG, H = Sakura.Helpers, T = Sakura.Textures, U = Sakura.Util, S = Sakura.Stream;
const P = {};
function hx(n){ return new THREE.Color(n); }
const KEYS = [
  {h:6.5, top:'#f0f2e9', bottom:'#d8e6e3', ink:'#34444a', accent:'#b87878', paper:'#f1eee4', sun:'#ffe8c6', sunDir:[-.58,.56,.55], sunI:1.45, hemiSky:'#d8e8e2', hemiGround:'#697762', hemiI:.92, fill:'#b4d6dd', fillI:.65, rim:'#ffd7d0', rimI:.28, waterShallow:'#a7cec8', waterDeep:'#3e7e80', waterSun:'#ffeac4', reflect:.48, glow:.12, night:0, interior:0, lamp:0, uplight:0, wall:'#fff4e6', roof:'#dbe7e9', wood:'#fff0df', screen:'#f7f1e5', screen2:'#efe8d9', window:'#fff8e6', linen:'#d8cdbb', blossom:'#fff7f4', exposure:1.06},
  {h:7, top:'#f7f2e6', bottom:'#dce9e4', ink:'#35464c', accent:'#b87878', paper:'#f4efe3', sun:'#ffeacb', sunDir:[-.52,.64,.52], sunI:2.45, hemiSky:'#dfeee8', hemiGround:'#6f7d66', hemiI:1.14, fill:'#a9ced7', fillI:.72, rim:'#ffd8d2', rimI:.36, waterShallow:'#9fcac2', waterDeep:'#407f82', waterSun:'#ffedc8', reflect:.58, glow:.2, night:0, interior:.03, lamp:.02, uplight:0, wall:'#fff5e8', roof:'#dde9ec', wood:'#fff2e1', screen:'#f5efe2', screen2:'#eee6d6', window:'#fff9e9', linen:'#d8cdbb', blossom:'#fffaf7', exposure:1.04},
  {h:12, top:'#f4f1e7', bottom:'#d8e7e2', ink:'#35464c', accent:'#b87878', paper:'#f4f0e5', sun:'#fff4d8', sunDir:[-.30,.86,.36], sunI:2.55, hemiSky:'#e3f0ea', hemiGround:'#74816a', hemiI:1.22, fill:'#aed2d9', fillI:.68, rim:'#ffdfd4', rimI:.32, waterShallow:'#9ac8c1', waterDeep:'#3a7a80', waterSun:'#fff1d5', reflect:.56, glow:.16, night:0, interior:0, lamp:0, uplight:0, wall:'#fff7ed', roof:'#e3eef1', wood:'#fff3e3', screen:'#f6f1e4', screen2:'#f0e9db', window:'#fffbed', linen:'#d9cebc', blossom:'#fffaf7', exposure:1.01},
  {h:18, top:'#d6c2bd', bottom:'#e7c39e', ink:'#4d4444', accent:'#b36e5c', paper:'#e9dbcd', sun:'#ffb266', sunDir:[-.90,.27,.34], sunI:3.1, hemiSky:'#c5aaa0', hemiGround:'#5f5b52', hemiI:.78, fill:'#79758f', fillI:.82, rim:'#ffb69b', rimI:.55, waterShallow:'#8ab3b4', waterDeep:'#32636d', waterSun:'#ffc37f', reflect:.72, glow:.78, night:.45, interior:.58, lamp:.62, uplight:.12, wall:'#ffd9bd', roof:'#f0cfae', wood:'#ffd1a3', screen:'#edd8c2', screen2:'#e2cbb3', window:'#ffd9ad', linen:'#d3bfa9', blossom:'#fff0e9', exposure:1.05},
  {h:22, top:'#142130', bottom:'#304357', ink:'#ece6d8', accent:'#d1a17f', paper:'#1e2c39', sun:'#c8d8e6', sunDir:[.28,.72,-.42], sunI:.58, hemiSky:'#5a6e87', hemiGround:'#24282a', hemiI:.56, fill:'#526d8f', fillI:.64, rim:'#f1d9c0', rimI:.38, waterShallow:'#315a66', waterDeep:'#102b38', waterSun:'#ffc98c', reflect:.34, glow:.55, night:1, interior:1, lamp:1, uplight:1, wall:'#8b929e', roof:'#8293a4', wood:'#b7aaa5', screen:'#7a8895', screen2:'#697784', window:'#eee8d6', linen:'#8b8d91', blossom:'#d9dbe4', exposure:.98},
  {h:23.5, top:'#0e1722', bottom:'#243344', ink:'#e5dfd2', accent:'#c99a78', paper:'#182430', sun:'#b9cbdc', sunDir:[.38,.68,-.48], sunI:.46, hemiSky:'#4e6075', hemiGround:'#202325', hemiI:.48, fill:'#465c77', fillI:.58, rim:'#e6ccb4', rimI:.34, waterShallow:'#284b58', waterDeep:'#0b2330', waterSun:'#f4ba7c', reflect:.30, glow:.48, night:1, interior:1, lamp:1, uplight:.82, wall:'#788392', roof:'#6d8398', wood:'#a89b98', screen:'#71808d', screen2:'#60707d', window:'#e9e3d1', linen:'#838589', blossom:'#ced2df', exposure:.95}
];
function rgba(c,a){ return 'rgba('+Math.round(c.r*255)+','+Math.round(c.g*255)+','+Math.round(c.b*255)+','+a+')'; }
P.sample=function(hour){
  let a=KEYS[0], b=KEYS[KEYS.length-1];
  for(let i=0;i<KEYS.length-1;i++){ if(hour>=KEYS[i].h && hour<=KEYS[i+1].h){a=KEYS[i];b=KEYS[i+1];break;} }
  const t=U.smooth(U.clamp((hour-a.h)/Math.max(.001,(b.h-a.h)),0,1));
  const out={hour,label:hour<10?'清晨':hour<20?'黄昏':'夜晚'};
  for(const key of ['sun','sunI','hemiSky','hemiGround','hemiI','fill','fillI','rim','rimI','waterShallow','waterDeep','waterSun','reflect','glow','night','interior','lamp','uplight','wall','roof','wood','screen','screen2','window','linen','blossom','exposure','top','bottom','ink','accent','paper']){
    if(typeof a[key]==='number'){ out[key]=U.lerp(a[key],b[key],t); }
  }
  const colorKeys=['sun','hemiSky','hemiGround','fill','rim','waterShallow','waterDeep','waterSun','wall','roof','wood','screen','screen2','window','linen','blossom','top','bottom','ink','accent','paper'];
  for(const k of colorKeys){ const ca=new THREE.Color(a[k]), cb=new THREE.Color(b[k]); out[k]=ca.lerp(cb,t); }
  out.sunDir=new THREE.Vector3(
    U.lerp(a.sunDir[0],b.sunDir[0],t),
    U.lerp(a.sunDir[1],b.sunDir[1],t),
    U.lerp(a.sunDir[2],b.sunDir[2],t)
  ).normalize();
  out.skyReflect=out.top.clone().lerp(new THREE.Color(0xf0eee0),.28);
  return out;
};
P.palette=KEYS;
function makeGlowTexture(){
  const s=128,c=document.createElement('canvas'); c.width=c.height=s; const x=c.getContext('2d');
  const g=x.createRadialGradient(s/2,s/2,2,s/2,s/2,s/2); g.addColorStop(0,'rgba(255,210,132,.55)'); g.addColorStop(.34,'rgba(255,196,112,.22)'); g.addColorStop(1,'rgba(255,190,100,0)');
  x.fillStyle=g; x.fillRect(0,0,s,s); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; return t;
}
function makeChimeTag(){
  const w=128,h=256,c=document.createElement('canvas'); c.width=w; c.height=h; const x=c.getContext('2d');
  x.clearRect(0,0,w,h);
  const g=x.createLinearGradient(0,0,w,0); g.addColorStop(0,'rgba(246,238,220,.86)'); g.addColorStop(.5,'rgba(255,250,238,.95)'); g.addColorStop(1,'rgba(238,228,207,.86)');
  x.fillStyle=g; x.fillRect(8,8,w-16,h-16);
  x.strokeStyle='rgba(129,94,63,.40)'; x.lineWidth=2; x.strokeRect(8,8,w-16,h-16);
  x.fillStyle='rgba(79,65,50,.72)'; x.font='46px "Yu Mincho", serif'; x.textAlign='center'; x.fillText('涼',64,116);
  x.font='14px "Yu Mincho", serif'; x.fillStyle='rgba(79,65,50,.46)'; x.fillText('風',64,160);
  const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; return t;
}
function buildLantern(scene,x,z,rot,glowTex){
  const g=new THREE.Group(); g.position.set(x,.13,z); g.rotation.y=rot; scene.add(g);
  const stone=H.standard(0x8c8d81,{roughness:.95,map:T.stone});
  const warmPaper=new THREE.MeshStandardMaterial({color:0xf0dfb9,roughness:.9,emissive:0xffb55e,emissiveIntensity:0,transparent:true,opacity:.92,side:THREE.DoubleSide});
  H.cyl(.30,.36,.12,8,stone,0,.06,0,g);
  H.cyl(.15,.23,.65,8,stone,0,.44,0,g,true,true);
  H.box(.55,.12,.55,stone,0,.83,0,g);
  H.box(.44,.46,.44,warmPaper,0,1.09,0,g,false,false);
  for(const sx of [-.26,.26]) for(const sz of [-.26,.26]) H.box(.055,.52,.055,H.standard(0x5d4c3d,{roughness:.8}),sx,1.09,sz,g,false,false);
  H.box(.62,.10,.62,stone,0,1.36,0,g);
  const cap=new THREE.Mesh(new THREE.ConeGeometry(.45,.28,4),stone); cap.rotation.y=Math.PI/4; cap.position.y=1.55; cap.castShadow=true; g.add(cap);
  H.sphere(.07,stone,0,1.76,0,g,6,false);
  const light=new THREE.PointLight(0xffb86d,0,5.8,1.8); light.position.set(0,1.12,0); g.add(light);
  const glow=new THREE.Mesh(new THREE.PlaneGeometry(2.7,2.7),new THREE.MeshBasicMaterial({map:glowTex,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}));
  glow.rotation.x=-Math.PI/2; glow.position.y=.025; g.add(glow);
  return {group:g,mat:warmPaper,light,glow};
}
function buildChime(houseRoot){
  const g=new THREE.Group(); g.name='wind-chime'; g.userData.dynamic=true; g.position.set(1.68,4.11,3.84); houseRoot.add(g);
  const pivot=new THREE.Group(); g.add(pivot);
  const metal=H.standard(0xb9b4a3,{roughness:.35,metalness:.4});
  H.cyl(.012,.012,.23,4,metal,0,-.12,0,pivot,false,false);
  const glass=new THREE.Mesh(new THREE.SphereGeometry(.14,14,9,0,Math.PI*2,0,Math.PI*.58),new THREE.MeshStandardMaterial({color:0xdfeaf0,transparent:true,opacity:.32,roughness:.16,metalness:.02,side:THREE.DoubleSide,emissive:0x9cc5ce,emissiveIntensity:.03}));
  glass.position.y=-.26; glass.scale.y=1.22; pivot.add(glass);
  H.cyl(.015,.015,.24,4,metal,0,-.36,0,pivot,false,false);
  H.sphere(.035,metal,0,-.49,0,pivot,8,false);
  const tagMat=new THREE.MeshBasicMaterial({map:makeChimeTag(),transparent:true,alphaTest:.1,side:THREE.DoubleSide});
  const tag=new THREE.Mesh(new THREE.PlaneGeometry(.20,.40),tagMat); tag.position.set(0,-.73,0.01); pivot.add(tag); tag.rotation.z=.08;
  const hit=new THREE.Mesh(new THREE.SphereGeometry(.33,8,6),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false,colorWrite:false}));
  hit.position.y=-.28; hit.userData.click='chime'; g.add(hit);
  return {group:g,pivot,tag,hit,swing:.2,velocity:0};
}
function buildFallingPetals(scene,garden){
  const count=C.quality.desktop.petals;
  const geo=new THREE.PlaneGeometry(.075,.11);
  const mat=new THREE.MeshToonMaterial({map:T.petal,alphaTest:.18,transparent:true,side:THREE.DoubleSide,opacity:.96,gradientMap:H.gradient});
  const mesh=new THREE.InstancedMesh(geo,mat,count); mesh.frustumCulled=false; mesh.castShadow=false; scene.add(mesh);
  const rnd=U.seeded(1907);
  const anchors=[];
  if(garden && garden.anchorData){
    for(const a of garden.anchorData){ for(const t of a.tips){ const p=t.clone(); a.group.localToWorld(p); anchors.push(p); } }
  }
  if(!anchors.length) anchors.push(new THREE.Vector3(-4,8,-2),new THREE.Vector3(4,7,-4));
  const data=[];
  function reset(p,initial){
    const a=anchors[Math.floor(rnd()*anchors.length)];
    p.pos.set(a.x+(rnd()-.5)*2.0, a.y-(rnd()*.6), a.z+(rnd()-.5)*1.8);
    if(initial) p.pos.y-=rnd()*5;
    p.rot.set(rnd()*Math.PI,rnd()*Math.PI,rnd()*Math.PI);
    p.spin.set((rnd()-.5)*1.8,(rnd()-.5)*2.0,(rnd()-.5)*1.4);
    p.vel.set((rnd()-.5)*.16,-(.10+rnd()*.16),(rnd()-.5)*.13);
    p.life=0; p.maxLife=7+rnd()*8; p.scale=.65+rnd()*.8; p.landed=false; p.wait=0;
    return p;
  }
  for(let i=0;i<count;i++){ const p={pos:new THREE.Vector3(),rot:new THREE.Euler(),spin:new THREE.Vector3(),vel:new THREE.Vector3(),scale:1,life:0,maxLife:10,landed:false,wait:0}; reset(p,true); data.push(p); }
  function landY(x,z){
    if(z>S.back(x)&&z<S.front(x)&&Math.abs(x)<7.9) return S.waterY+.025;
    if(x> -4.6 && x<4.2 && z>.40 && z<2.15) return .796;
    return .138;
  }
  function update(dt,time){
    const d=H.dummy;
    for(let i=0;i<count;i++){
      const p=data[i];
      if(p.landed){
        p.wait+=dt;
        if(p.wait>1.5+ (i%7)*.42) reset(p,false);
      } else {
        p.life+=dt;
        p.pos.addScaledVector(p.vel,dt*60*.016);
        p.pos.x+=Math.sin(time*.9+i*1.3)*.0009;
        p.pos.z+=Math.cos(time*.7+i*.8)*.0008;
        p.rot.x+=p.spin.x*dt; p.rot.y+=p.spin.y*dt; p.rot.z+=p.spin.z*dt;
        const ly=landY(p.pos.x,p.pos.z);
        if(p.pos.y<=ly || p.life>p.maxLife){ p.pos.y=ly; p.landed=true; p.wait=0; p.rot.x=-Math.PI/2+ (i%3)*.12; p.rot.z=(i%5)*.33; }
      }
      d.position.copy(p.pos); d.rotation.copy(p.rot); d.scale.setScalar(p.scale); d.updateMatrix(); mesh.setMatrixAt(i,d.matrix);
    }
    mesh.instanceMatrix.needsUpdate=true;
  }
  return {mesh,data,update,mat};
}
function build(core, deps){
  const house=deps.house, env=deps.env, water=deps.water, garden=deps.garden;
  const glowTex=makeGlowTexture();
  const lanterns=[buildLantern(core.scene,-1.55,5.55,-.35,glowTex),buildLantern(core.scene,5.68,5.25,.55,glowTex)];
  const chime=buildChime(house.root);
  const petals=buildFallingPetals(core.scene,garden);
  const upLightA=new THREE.SpotLight(0xffb692,0,15,Math.PI*.24,.88,1.2);
  upLightA.position.set(-5.1,.30,-2.65); upLightA.target.position.set(-4.6,8.6,-2.0); core.scene.add(upLightA,upLightA.target);
  const upLightB=new THREE.SpotLight(0xffc09e,0,14,Math.PI*.22,.9,1.2);
  upLightB.position.set(5.25,.28,-4.0); upLightB.target.position.set(4.7,7.6,-3.4); core.scene.add(upLightB,upLightB.target);
  const upLights=[upLightA,upLightB];
  const state={palette:null,lastHour:-999};
  const tmpC=new THREE.Color();
  const white=new THREE.Color(0xffffff);
  function apply(p,core){
    state.palette=p; core.currentPalette=p;
    const st=document.documentElement.style;
    const hex=c=>'#'+c.getHexString();
    st.setProperty('--stage-top',hex(p.top));
    st.setProperty('--stage-bottom',hex(p.bottom));
    st.setProperty('--paper',hex(p.paper));
    st.setProperty('--ink',hex(p.ink));
    st.setProperty('--ink-soft',rgba(p.ink,.62));
    st.setProperty('--ink-faint',rgba(p.ink,.34));
    st.setProperty('--accent',hex(p.accent));
    st.setProperty('--ui-line',rgba(p.ink,.22));
    st.setProperty('--ui-bg',rgba(p.paper,p.night>.5?.82:.94));
    st.setProperty('--ui-shadow',p.night>.5?'rgba(0,0,0,.34)':'rgba(52,51,44,.12)');
    document.body.classList.toggle('is-night',p.night>.58);
    const meta=document.querySelector('meta[name=theme-color]');
    if(meta) meta.setAttribute('content',hex(p.top));
    const sun=core.lights.sun;
    sun.position.copy(core.target).addScaledVector(p.sunDir,22);
    sun.target.position.copy(core.target);
    sun.color.copy(p.sun); sun.intensity=p.sunI;
    const hemi=core.lights.hemi; hemi.color.copy(p.hemiSky); hemi.groundColor.copy(p.hemiGround); hemi.intensity=p.hemiI;
    const amb=core.lights.ambient; if(amb){ amb.color.copy(p.hemiSky); amb.intensity=p.hemiI*.48; }
    const fill=core.lights.fill; fill.color.copy(p.fill); fill.intensity=p.fillI;
    fill.position.set(-p.sunDir.x*12+3,p.sunDir.y*8+3,-p.sunDir.z*12-5);
    const rim=core.lights.rim; rim.color.copy(p.rim); rim.intensity=p.rimI;
    rim.position.set(p.sunDir.x*8,8.5,p.sunDir.z*8-7);
    core.renderer.toneMappingExposure=p.exposure;
    // house materials
    house.mats.wallMat.color.copy(p.wall);
    house.mats.wallInner.color.copy(p.wall).multiplyScalar(.91);
    house.mats.woodMat.color.copy(p.wood);
    house.mats.deckMat.color.copy(p.wood);
    house.mats.roofMat.color.copy(p.roof).lerp(white,.24);
    house.mats.shojiMat.emissive.setHex(0xffb35f);
    house.mats.shojiMat.emissiveIntensity=p.interior*.30;
    house.lights.lampLight.intensity=.55+4.8*p.lamp;
    house.lights.interiorLight.intensity=1.3+7.5*p.interior;
    house.lights.innerGlow.intensity=.45+3.2*p.interior;
    for(const w of house.warm){
      if(w.mat){ w.mat.emissiveIntensity=.10+p.lamp*1.05; }
    }
    if(house.mats.eaveShadeMat) house.mats.eaveShadeMat.opacity=.38+p.night*.20;
    // backdrop
    env.backdrop.paperBack.color.copy(p.screen);
    env.backdrop.paperMid.color.copy(p.screen2);
    env.backdrop.winMat.color.copy(p.window);
    env.backdrop.linenMat.color.copy(p.linen);
    env.backdrop.landMat.color.copy(p.screen).lerp(white,.22);
    env.backdrop.landMat.opacity=p.night>.5?.28:.74;
    env.backdrop.silMat.opacity=.44+(p.night*.04)-.06;
    env.backdrop.silMat.color.copy(p.ink).lerp(white,.4);
    env.backdrop.root.traverse(o=>{ if(o.material && o.material.map===T.silhouette){ o.material.opacity=env.backdrop.silMat.opacity; o.material.color.copy(env.backdrop.silMat.color); } });
    // trees and water
    garden.blossomMat.color.copy(p.blossom).lerp(white,.35);
    garden.blossomMat.emissiveIntensity=.015+p.night*.085;
    garden.blossomMat.emissive.setHex(0x4b2b35);
    petals.mat.color.copy(p.blossom);
    water.setPalette(p);
    // lanterns and uplights
    for(const l of lanterns){
      l.light.intensity=4.4*p.lamp;
      l.mat.emissiveIntensity=.10+p.lamp*1.2;
      l.glow.material.opacity=p.lamp*.28;
    }
    upLightA.intensity=p.uplight*18;
    upLightB.intensity=p.uplight*13;
    // page background transition helper
    core.scene.background=null;
  }
  function update(dt,time,hour,core){
    if(Math.abs(hour-state.lastHour)>.006 || !state.palette){
      state.lastHour=hour;
      const p=P.sample(hour);
      apply(p,core);
    }
    // wind chime pendulum
    const ch=chime;
    ch.velocity += (-ch.swing*3.0 - ch.velocity*1.05)*dt;
    ch.swing += ch.velocity*dt;
    ch.pivot.rotation.z = ch.swing*.34 + Math.sin(time*1.08)*.025;
    ch.pivot.rotation.x = Math.sin(time*.82+1.2)*.022 + ch.swing*.08;
    ch.tag.rotation.z = .08 + ch.swing*.12;
    // subtle time-of-day chime glint
    petals.update(dt,time);
  }
  const p0=P.sample(core.hour); apply(p0,core);
  return {group:null,lanterns,chime,petals,upLights,state,apply,update,
    clickChime(){ chime.velocity+=2.7; chime.swing+=.42; return true; },
    pickables:[chime.hit]
  };
}
Sakura.Atmosphere={build};
Sakura.Palette=P;
})();