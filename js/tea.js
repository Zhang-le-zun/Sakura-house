(function(){
'use strict';
const Sakura = window.Sakura;
const H = Sakura.Helpers, T = Sakura.Textures, U = Sakura.Util;
function steamTexture(){
  const s=128,c=document.createElement('canvas'); c.width=c.height=s; const x=c.getContext('2d');
  const g=x.createRadialGradient(s/2,s*.55,2,s/2,s*.5,s*.5);
  g.addColorStop(0,'rgba(206,221,214,.72)'); g.addColorStop(.36,'rgba(221,232,225,.34)'); g.addColorStop(1,'rgba(236,242,237,0)');
  x.fillStyle=g; x.beginPath(); x.arc(s/2,s/2,s*.5,0,Math.PI*2); x.fill();
  const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; return t;
}
function cup(mat,parent,x,y,z,scale){
  const pts=[];
  pts.push(new THREE.Vector2(0,0)); pts.push(new THREE.Vector2(.062,0)); pts.push(new THREE.Vector2(.078,.018));
  pts.push(new THREE.Vector2(.082,.12)); pts.push(new THREE.Vector2(.070,.136)); pts.push(new THREE.Vector2(.058,.13)); pts.push(new THREE.Vector2(.059,.028)); pts.push(new THREE.Vector2(0,.022));
  const g=new THREE.LatheGeometry(pts,14);
  const m=new THREE.Mesh(g,mat); m.position.set(x,y,z); m.scale.setScalar(scale||1); m.castShadow=true; m.receiveShadow=true; parent.add(m); return m;
}
function build(parent){
  const g=new THREE.Group(); g.name='tea'; parent.add(g);
  const zBase=.78;
  const lacquer=H.standard(0x4e3028,{roughness:.46,metalness:.03});
  const ceramic=H.standard(0xb7ad98,{roughness:.52});
  const ceramicDark=H.standard(0x6c7e70,{roughness:.46});
  const bamboo=H.standard(0xa98757,{roughness:.9});
  const cushionFabric=H.standard(0x8f7171,{roughness:1});
  // tray
  const tray=new THREE.Group(); tray.position.set(2.54,zBase+.06,3.57); g.add(tray);
  H.box(1.28,.055,.76,lacquer,0,.06,0,tray,true,true);
  H.box(1.17,.015,.66,H.standard(0x7d4a3d,{roughness:.38}),0,.092,0,tray,false,true);
  for(const x of [-.54,.54]) for(const z of [-.29,.29]) H.box(.055,.07,.055,lacquer,x,.015,z,tray,true,true);
  // teapot
  const pot=new THREE.Group(); pot.position.set(-.32,.12,.04); tray.add(pot);
  const body=H.sphere(.20,ceramic,0,.16,0,pot,18,true); body.scale.set(1,.82,1);
  H.cyl(.105,.14,.055,16,ceramic,0,.30,0,pot,true,true);
  H.sphere(.045,ceramicDark,0,.335,0,pot,10,false);
  // spout
  H.taperedTube([[.17,.20,.02],[.25,.25,.02],[.31,.31,.02]],[.045,.033,.018],6,ceramic,pot,false);
  // overhead handle, readable from the default angle
  const handle=new THREE.Mesh(new THREE.TorusGeometry(.135,.024,6,18,Math.PI),ceramicDark);
  handle.position.set(0,.265,0); handle.rotation.set(0,0,0); handle.castShadow=true; pot.add(handle);
  H.cyl(.018,.018,.06,8,ceramicDark,0,.315,0,pot,false,false);
  // two cups
  const c1=cup(H.standard(0xd6cbb7,{roughness:.52}),tray,.25,.095,.13,1.25);
  const c2=cup(H.standard(0xa9b9a8,{roughness:.48}),tray,.36,.095,-.18,1.25);
  // saucers
  for(const c of [c1,c2]){
    H.cyl(.095,.105,.018,18,ceramic,c.position.x,.089,c.position.z,tray,true,true);
    // tea surface
    const teaSurf=new THREE.Mesh(new THREE.CircleGeometry(.054,18),H.standard(0x8a643c,{roughness:.25,metalness:.05}));
    teaSurf.rotation.x=-Math.PI/2; teaSurf.position.set(c.position.x,.212,c.position.z); tray.add(teaSurf);
  }
  // dango plate
  const plate=H.cyl(.17,.15,.018,20,ceramic,.48,.10,-.04,tray,true,true);
  const stick=H.cyl(.008,.008,.30,5,bamboo,.48,.185,-.04,tray,false,false); stick.rotation.z=Math.PI/2; stick.rotation.y=.25;
  for(let i=0;i<3;i++){
    const cols=[0xe6a1a4,0xf2e5cc,0xb8c98b];
    H.sphere(.045,H.standard(cols[i],{roughness:.62}),.39+i*.085,.19,-.02+ i*.012,tray,10,true);
  }
  // open book
  const book=new THREE.Group(); book.position.set(-.38,.118,.24); book.rotation.y=-.34; tray.add(book);
  const pageMat=H.standard(0xf0e8d7,{roughness:1,side:THREE.DoubleSide});
  const coverMat=H.standard(0x8b4f49,{roughness:.92});
  H.box(.42,.014,.32,coverMat,0,.010,0,book,true,true);
  for(const s of [-1,1]){
    const p=new THREE.Mesh(new THREE.PlaneGeometry(.205,.30),pageMat); p.rotation.x=-Math.PI/2; p.rotation.z=s*.10; p.position.set(s*.103,.021,0); book.add(p);
    for(let i=0;i<7;i++) H.box(.17,.002,.006,new THREE.MeshBasicMaterial({color:0x8b8273,transparent:true,opacity:.36}),s*.103,.023,-.095+i*.031,book,false,false);
  }
  H.box(.015,.011,.32,coverMat,0,.025,0,book,false,false);
  // cushion for tea seat
  H.box(.84,.11,.82,cushionFabric,1.58,zBase+.10,3.62,g,true,true);
  H.box(.76,.025,.74,H.standard(0xa88986,{roughness:1}),1.58,zBase+.16,3.62,g,false,true);
  // steam sprites
  const steamTex=steamTexture();
  const steam=[];
  for(const c of [c1,c2]){
    for(let i=0;i<3;i++){
      const mat=new THREE.SpriteMaterial({map:steamTex,transparent:true,opacity:0,depthWrite:false,color:0xc8d7d0});
      const sp=new THREE.Sprite(mat); sp.position.set(c.position.x+(i?-.018:.02),.34+i*.08,c.position.z+(i? .01:-.015));
      sp.scale.set(.20,.42,1); tray.add(sp); steam.push({sp,phase:Math.random()*10,baseY:sp.position.y});
    }
  }
  // shoes beside steps
  const shoeG=new THREE.Group(); shoeG.position.set(-1.35,.20,5.38); shoeG.rotation.y=-.28; g.add(shoeG);
  const sole=H.standard(0xb08c67,{roughness:.82});
  for(const s of [-1,1]){
    H.box(.24,.055,.52,sole,s*.20,0,0,shoeG,true,true);
    H.box(.09,.035,.47,sole,s*.20,.06,0,shoeG,false,false);
    H.box(.025,.045,.16,H.standard(0x9c6f50,{roughness:.9}),s*.20,.095,-.07,shoeG,false,false);
  }
  // watering can, right veranda corner
  const can=new THREE.Group(); can.position.set(-3.62,zBase+.18,3.54); g.add(can);
  const metal=H.standard(0x6d7c76,{roughness:.44,metalness:.28});
  H.cyl(.16,.19,.32,16,metal,0,.16,0,can,true,true);
  H.cyl(.18,.18,.025,16,metal,0,.33,0,can,false,true);
  H.taperedTube([[.16,.18,.02],[.32,.26,.02],[.42,.38,.02]],[.022,.016,.010],5,metal,can,false);
  const canHandle=new THREE.Mesh(new THREE.TorusGeometry(.17,.016,5,12,Math.PI),metal);
  canHandle.rotation.z=Math.PI/2; canHandle.position.set(-.02,.29,0); can.add(canHandle);
  H.cyl(.03,.04,.20,10,metal,.10,.37,0,can,false,false).rotation.z=-.35;
  // potted plant at the same corner
  const potted=new THREE.Group(); potted.position.set(-4.05,zBase+.15,3.18); g.add(potted);
  H.cyl(.20,.15,.34,12,H.standard(0x82645a,{roughness:.9}),0,.17,0,potted,true,true);
  H.cyl(.22,.22,.035,12,H.standard(0x71574e,{roughness:.9}),0,.35,0,potted,false,false);
  const leafMat=new THREE.MeshStandardMaterial({map:T.leaf,transparent:true,alphaTest:.35,side:THREE.DoubleSide,roughness:1,color:0x9fb478});
  for(let i=0;i<9;i++){
    const pl=new THREE.Mesh(new THREE.PlaneGeometry(.18,.42),leafMat);
    const a=i/9*Math.PI*2;
    pl.position.set(Math.cos(a)*.14,.56+Math.sin(i*2.1)*.10,Math.sin(a)*.14);
    pl.rotation.set(-.4+Math.sin(i)*.25,a,-.4+Math.cos(i*1.7)*.4);
    pl.castShadow=false; potted.add(pl);
  }
  H.taperedTube([[0,.37,0],[.03,.55,0],[-.06,.78,.03],[.02,.98,.06]],[.012,.011,.008,.005],4,H.standard(0x5f4a39,{roughness:.9}),potted,true);
  // fallen petals on the deck and tray
  const petalMat=new THREE.MeshBasicMaterial({map:T.petal,transparent:true,alphaTest:.2,side:THREE.DoubleSide,color:0xf4d7da,depthWrite:false});
  const rnd=U.seeded(7451);
  for(let i=0;i<32;i++){
    const p=new THREE.Mesh(new THREE.PlaneGeometry(.075,.11),petalMat);
    const cx = i<12 ? -3.35+rnd()*.9 : 1.1+rnd()*2.6;
    const cz = 3.15+rnd()*.85;
    p.position.set(cx,zBase+.095,cz); p.rotation.set(-Math.PI/2+rnd()*.18,rnd()*Math.PI,rnd()*Math.PI);
    p.scale.setScalar(.7+rnd()*.75); p.renderOrder=4; g.add(p);
  }
  // a couple of petals on the tray
  for(let i=0;i<3;i++){
    const p=new THREE.Mesh(new THREE.PlaneGeometry(.045,.068),petalMat);
    p.position.set(-.15+rnd()*.7,.123,-.2+rnd()*.38); p.rotation.x=-Math.PI/2; p.rotation.z=rnd()*Math.PI; tray.add(p);
  }
  function update(dt,time){
    for(const s of steam){
      const t=((time*.9+s.phase)%3.4)/3.4;
      s.sp.position.y=s.baseY+t*.55;
      s.sp.position.x += Math.sin(time*.8+s.phase)*.0006;
      s.sp.material.opacity=Math.sin(t*Math.PI)*.85*(1-t*.20);
      s.sp.scale.set(.26+t*.24,.55+t*.65,1);
    }
  }
  return {root:g,steam,update};
}
Sakura.Tea={build};
})();