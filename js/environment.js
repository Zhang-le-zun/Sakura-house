(function(){
'use strict';
const Sakura = window.Sakura;
const C = Sakura.CONFIG, H = Sakura.Helpers, T = Sakura.Textures, U = Sakura.Util;
const Stream = Sakura.Stream = {
  center(x){ return 3.55 + .60*Math.sin(x*.42+.4) + .15*Math.sin(x*.95+.2); },
  half(x){ return .86 + .30*Math.sin(x*.52+1.5) + .13*Math.sin(x*1.21+.7); },
  back(x){ return this.center(x)-this.half(x); },
  front(x){ return this.center(x)+this.half(x); },
  bedY: .042,
  waterY: .092,
  bankTop: .132
};
function bankGeometry(front){
  const xs=72, zs=14, x0=-7.9, x1=7.9;
  const pos=[], nor=[], uv=[], col=[], idx=[];
  const green1=new THREE.Color(0xe3e7ce), green2=new THREE.Color(0xc6d2ab);
  for(let i=0;i<=xs;i++){
    const x=U.lerp(x0,x1,i/xs);
    const edge = front ? Stream.front(x)+.10 : Stream.back(x)-.10;
    const outer = front ? 7.9 : -7.9;
    for(let j=0;j<=zs;j++){
      const t=j/zs;
      const z=U.lerp(edge,outer,t);
      const dist=Math.abs(z-edge);
      const slope=.132-Math.pow(Math.max(0,1-dist/.72),2.2)*.112;
      const ripple=Math.sin(x*1.7+z*.9)*.010+Math.sin(x*.43-z*1.6)*.006;
      const y=.132; // base height
      const yy=slope + (j===0?0:ripple*(.35+t*.65));
      pos.push(x,yy,z);
      nor.push(0,1,0);
      uv.push((x+8)/16, (z+8)/16);
      const mix=(Math.sin(x*1.2+z*.8)*.5+.5);
      const c=green1.clone().lerp(green2, .18+mix*.28);
      col.push(c.r,c.g,c.b);
    }
  }
  for(let i=0;i<xs;i++) for(let j=0;j<zs;j++){
    const a=i*(zs+1)+j, b=a+zs+1, c=b+1, d=a+1;
    if(front){ idx.push(a,b,d,b,c,d); } else { idx.push(a,d,b,b,d,c); }
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
  g.setIndex(idx); g.computeVertexNormals();
  return g;
}
function bedGeometry(){
  const xs=80, zs=10, pos=[], uv=[], idx=[];
  for(let i=0;i<=xs;i++){
    const x=U.lerp(-7.9,7.9,i/xs);
    const c=Stream.center(x), hw=Stream.half(x)-.10;
    for(let j=0;j<=zs;j++){
      const t=j/zs-.5, z=c+t*hw*1.95;
      const y=Stream.bedY + Math.sin(x*.9+z*1.6)*.008;
      pos.push(x,y,z); uv.push((x+8)/16,(z+8)/16);
    }
  }
  for(let i=0;i<xs;i++) for(let j=0;j<zs;j++){
    const a=i*(zs+1)+j,b=a+zs+1,c=b+1,d=a+1; idx.push(a,b,d,b,c,d);
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  g.setIndex(idx); g.computeVertexNormals(); return g;
}
function roundWindowTexture(){
  const s=512,c=document.createElement('canvas'); c.width=c.height=s; const x=c.getContext('2d');
  const g=x.createRadialGradient(s*.48,s*.43,10,s*.5,s*.5,s*.5);
  g.addColorStop(0,'rgba(255,251,237,.99)'); g.addColorStop(.52,'rgba(246,241,226,.98)');
  g.addColorStop(.78,'rgba(222,227,216,.95)'); g.addColorStop(.97,'rgba(203,211,201,.82)'); g.addColorStop(1,'rgba(203,211,201,0)');
  x.fillStyle=g; x.beginPath(); x.arc(s/2,s/2,s*.49,0,Math.PI*2); x.fill();
  x.globalAlpha=.11; x.strokeStyle='#a9a58e'; x.lineWidth=1;
  for(let i=0;i<8;i++){ x.beginPath(); x.arc(s/2,s/2,s*(.11+i*.051),0,Math.PI*2); x.stroke(); }
  x.globalAlpha=1;
  const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; return t;
}
function buildBase(core){
  const root=new THREE.Group(); root.name='base';
  const stone=H.standard(0xc9c3b4,{roughness:.92,map:T.stone});
  const wood=H.standard(0x6a4935,{roughness:.72,map:T.woodDark});
  const grassMat=H.standard(0x8a9a6f,{roughness:.96,map:T.moss});
  // shadow beneath the plinth
  const shadowMat=new THREE.MeshBasicMaterial({map:T.shadow,transparent:true,opacity:.82,depthWrite:false});
  const shadow=new THREE.Mesh(new THREE.PlaneGeometry(20,20),shadowMat);
  shadow.rotation.x=-Math.PI/2; shadow.position.y=-.703; shadow.renderOrder=1; root.add(shadow);
  // stone and timber plinth
  const g1=H.bevelBoxGeometry(16.5,16.5,.54,.13);
  const plinth=new THREE.Mesh(g1,stone); plinth.position.y=-.595; plinth.castShadow=true; plinth.receiveShadow=true; root.add(plinth);
  H.outline(plinth,1.004);
  H.box(16.06,.13,16.06,wood,0,-.305,0,root);
  H.box(15.92,.10,15.92,stone,0,-.16,0,root);
  // brass maker's plaque on the front face of the base
  const plaqueMat=new THREE.MeshStandardMaterial({map:plaqueTexture(),roughness:.42,metalness:.35,color:0xe7d7b0});
  const plaque=new THREE.Mesh(new THREE.PlaneGeometry(1.55,.29),plaqueMat); plaque.position.set(3.15,-.345,8.284); root.add(plaque);
  H.box(1.62,.35,.02,H.standard(0x645139,{roughness:.55,metalness:.2}),3.15,-.345,8.274,root,false,false);
  // thin pale edge strip
  const edgeMat=H.standard(0xc9bda7,{roughness:.74});
  H.box(16.18,.035,16.18,edgeMat,0,-.045,0,root);
  // banks
  const bankMat=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.96,metalness:0,map:T.moss,vertexColors:true});
  T.moss.wrapS=T.moss.wrapT=THREE.RepeatWrapping; T.moss.repeat.set(4,4);
  const back=new THREE.Mesh(bankGeometry(false),bankMat); back.receiveShadow=true; back.castShadow=false; root.add(back);
  const front=new THREE.Mesh(bankGeometry(true),bankMat); front.receiveShadow=true; front.castShadow=false; root.add(front);
  const bed=new THREE.Mesh(bedGeometry(),new THREE.MeshStandardMaterial({color:0x7b8175,roughness:.95,map:T.stone}));
  bed.receiveShadow=true; root.add(bed);
  // sandy water edge strips
  for(let side=0;side<2;side++){
    const pts=[]; const zs=64;
    for(let i=0;i<zs;i++){
      const x=U.lerp(-7.9,7.9,i/(zs-1));
      const z=side===0?Stream.back(x)+.10:Stream.front(x)-.10;
      pts.push([x,Stream.bankTop-.055,z]);
    }
    // small irregular pebbles instead of an obvious strip are added by garden
  }
  // square rim shadow
  const rimMat=new THREE.MeshBasicMaterial({color:0x2b3530,transparent:true,opacity:.07,depthWrite:false});
  for(let s=0;s<4;s++){
    const m=new THREE.Mesh(new THREE.PlaneGeometry(16.2,.55),rimMat);
    m.rotation.x=-Math.PI/2; m.position.y=.142;
    if(s===0)m.position.z=-7.72; if(s===1){m.position.z=7.72;m.rotation.z=Math.PI;}
    if(s===2){m.position.x=-7.72;m.rotation.z=Math.PI/2;} if(s===3){m.position.x=7.72;m.rotation.z=-Math.PI/2;}
    root.add(m);
  }
  return {root, bankMat, stone, wood};
}
function plaqueTexture(){
  const w=512,h=96,c=document.createElement('canvas'); c.width=w; c.height=h; const x=c.getContext('2d');
  x.fillStyle='#b8a57d'; x.fillRect(0,0,w,h);
  x.strokeStyle='rgba(72,58,40,.55)'; x.lineWidth=4; x.strokeRect(4,4,w-8,h-8);
  x.fillStyle='rgba(59,49,35,.78)'; x.font='34px "Yu Mincho", serif'; x.textAlign='center'; x.fillText('桜日和  ·  水岸茶庭',w/2,48);
  x.font='13px "Yu Gothic", sans-serif'; x.letterSpacing='4px'; x.fillText('SAKURA BIYORI',w/2,72);
  const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; return t;
}
function landscapeTexture(){
  const w=1024,h=512,c=document.createElement('canvas'); c.width=w; c.height=h; const x=c.getContext('2d');
  x.clearRect(0,0,w,h);
  const sky=x.createLinearGradient(0,0,0,h); sky.addColorStop(0,'rgba(173,192,189,.22)'); sky.addColorStop(.52,'rgba(203,214,201,.18)'); sky.addColorStop(1,'rgba(181,193,174,.28)'); x.fillStyle=sky; x.fillRect(0,0,w,h);
  function hill(base,amp,color,alpha){
    x.beginPath(); x.moveTo(0,h); x.lineTo(0,base);
    for(let i=0;i<=24;i++){ const px=i/24*w; const py=base-Math.sin(i*.65+1.2)*amp-Math.sin(i*.21)*amp*.7; x.lineTo(px,py); }
    x.lineTo(w,h); x.closePath(); x.fillStyle=color; x.globalAlpha=alpha; x.fill(); x.globalAlpha=1;
  }
  hill(h*.30,48,'#9fb3a7',.42);
  hill(h*.44,38,'#b4c2b2',.38);
  hill(h*.60,26,'#c9cdb9',.32);
  hill(h*.75,18,'#d8d4c0',.28);
  x.strokeStyle='rgba(126,134,120,.10)'; x.lineWidth=1.2;
  for(let i=0;i<16;i++){ const yy=70+i*20; x.beginPath(); x.moveTo(0,yy); for(let j=0;j<=12;j++) x.lineTo(j*w/12,yy+Math.sin(j*.7+i)*2.2); x.stroke(); }
  const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; return t;
}
function buildBackdrop(core){
  const root=new THREE.Group(); root.name='backdrop';
  const paperBack=H.standard(0xf4eee0,{roughness:1,map:T.washi,side:THREE.DoubleSide});
  const paperMid=H.standard(0xeee7d8,{roughness:1,map:T.washiWarm,side:THREE.DoubleSide});
  const frameMat=H.standard(0xc9b9a2,{roughness:.86});
  const screenBack=H.plane(16.2,8.3,paperBack,0,4.12,-7.72,root); screenBack.castShadow=false;
  const landMat=new THREE.MeshBasicMaterial({map:landscapeTexture(),transparent:true,opacity:.86,depthWrite:false,color:0xdfe5d8,side:THREE.DoubleSide});
  const land=H.plane(15.9,7.7,landMat,0,4.0,-7.62,root); land.castShadow=false;
  // low screen lines and frame
  const battenZ=-7.69;
  for(const x of [-7.9,-5.2,-2.6,0,2.7,5.4,7.9]) H.box(.055,8.1,.075,frameMat,x,4.1,battenZ,root,false,false);
  H.box(16.22,.075,.11,frameMat,0,.12,-7.68,root,false,false);
  H.box(16.22,.055,.10,frameMat,0,8.19,-7.68,root,false,false);
  // middle low-contrast panels
  const mid1=H.plane(6.2,5.5,paperMid,-4.55,2.82,-7.36,root); mid1.material.opacity=.83; mid1.material.transparent=true;
  const mid2=H.plane(5.4,5.1,paperMid,4.4,2.58,-7.42,root); mid2.material.opacity=.72; mid2.material.transparent=true;
  for(const x of [-7.6,-5.6,-3.5,-1.5,1.4,3.3,5.2,7.1]) H.box(.04,5.9,.045,frameMat,x,2.95,-7.34,root,false,false);
  // circular washi window
  const win=new THREE.Group(); win.position.set(4.45,4.85,-7.16); root.add(win);
  const winMat=new THREE.MeshBasicMaterial({map:roundWindowTexture(),color:0xfff9e9,transparent:true,opacity:.98});
  const disk=new THREE.Mesh(new THREE.CircleGeometry(2.68,80),winMat); win.add(disk);
  const rim=new THREE.Mesh(new THREE.TorusGeometry(2.70,.034,6,96),H.standard(0xc9b9a2,{roughness:.65}));
  rim.position.z=.012; win.add(rim);
  const rimInner=new THREE.Mesh(new THREE.TorusGeometry(2.55,.012,4,96),new THREE.MeshBasicMaterial({color:0xa9a58e,transparent:true,opacity:.35,depthWrite:false}));
  rimInner.position.z=.015; win.add(rimInner);
  // subtle radial rays inside the round window, low contrast
  const innerWash=new THREE.Mesh(new THREE.CircleGeometry(2.45,64),new THREE.MeshBasicMaterial({color:0xf2eedf,transparent:true,opacity:.14,depthWrite:false}));
  innerWash.position.z=.014; win.add(innerWash);
  // pale cherry silhouettes at the edges
  const silMat=new THREE.MeshBasicMaterial({map:T.silhouette,transparent:true,opacity:.44,depthWrite:false,color:0x8d8b7e,side:THREE.DoubleSide});
  const silL=H.plane(7.6,7.6,silMat,-6.95,5.35,-6.78,root); silL.rotation.z=-.16;
  const silR=H.plane(7.8,7.8,silMat.clone(),6.95,5.5,-6.70,root); silR.scale.x=-1; silR.rotation.z=.12;
  // linen curtain on the right
  const linenMat=new THREE.MeshStandardMaterial({color:0xd6c9b4,roughness:1,transparent:true,opacity:.72,side:THREE.DoubleSide,map:T.washiWarm});
  for(let i=0;i<3;i++){
    const g=new THREE.PlaneGeometry(1.15,4.5,10,18); const p=g.attributes.position;
    for(let k=0;k<p.count;k++){ const x=p.getX(k), y=p.getY(k); p.setZ(k, Math.sin(x*5.2+i*.8)*.075 + Math.sin(y*.65+i)*.025); }
    g.computeVertexNormals();
    const m=new THREE.Mesh(g,linenMat); m.position.set(6.62+i*1.10,4.05,-6.55-i*.04); m.castShadow=false; root.add(m);
  }
  H.cyl(.035,.035,5.2,8,frameMat,6.1,4.4,-6.5,root,false,false).rotation.z=Math.PI/2;
  // fluttery paper edge along the very top
  const edgePaper=H.standard(0xede4d3,{roughness:1,transparent:true,opacity:.82,side:THREE.DoubleSide});
  const strip=new THREE.Mesh(new THREE.PlaneGeometry(16,1.0,28,3),edgePaper);
  strip.position.set(0,7.65,-6.58); strip.rotation.z=.006; root.add(strip);
  return {root,paperBack,paperMid,winMat,linenMat,silMat,landMat};
}
Sakura.Environment = {
  Stream,
  build(core){
    const base=buildBase(core);
    const backdrop=buildBackdrop(core);
    core.scene.add(base.root);
    core.scene.add(backdrop.root);
    return { base, backdrop };
  }
};
})();