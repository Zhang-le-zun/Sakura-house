(function(){
'use strict';
const Sakura = window.Sakura;
const C = Sakura.CONFIG, H = Sakura.Helpers, T = Sakura.Textures, U = Sakura.Util;
const S = Sakura.Stream;
function shojiTexture(){
  const w=256,h=512,c=document.createElement('canvas'); c.width=w; c.height=h; const x=c.getContext('2d');
  x.clearRect(0,0,w,h);
  x.fillStyle='rgba(248,241,226,.78)'; x.fillRect(0,0,w,h);
  const g=x.createLinearGradient(0,0,w,h); g.addColorStop(0,'rgba(255,252,240,.22)'); g.addColorStop(.55,'rgba(236,225,205,.06)'); g.addColorStop(1,'rgba(226,211,190,.12)');
  x.fillStyle=g; x.fillRect(0,0,w,h);
  for(let i=0;i<170;i++){ x.strokeStyle='rgba(156,141,117,.06)'; x.lineWidth=.6; const px=Math.random()*w,py=Math.random()*h; x.beginPath(); x.moveTo(px,py); x.lineTo(px+(Math.random()-.5)*20,py+(Math.random()-.5)*20); x.stroke(); }
  x.strokeStyle='rgba(111,79,55,.82)';
  x.lineWidth=4; x.strokeRect(5,5,w-10,h-10);
  x.lineWidth=2;
  for(let i=1;i<5;i++){ x.beginPath(); x.moveTo(i*w/5,7); x.lineTo(i*w/5,h-7); x.stroke(); }
  for(let j=1;j<9;j++){ x.beginPath(); x.moveTo(7,j*h/9); x.lineTo(w-7,j*h/9); x.stroke(); }
  const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=4; return t;
}
function eaveShadowTexture(){
  const w=64,h=256,c=document.createElement('canvas'); c.width=w; c.height=h; const x=c.getContext('2d');
  const g=x.createLinearGradient(0,0,0,h); g.addColorStop(0,'rgba(43,34,27,.42)'); g.addColorStop(.45,'rgba(43,34,27,.14)'); g.addColorStop(1,'rgba(43,34,27,0)');
  x.fillStyle=g; x.fillRect(0,0,w,h); return new THREE.CanvasTexture(c);
}
function makeShoji(mat, w, h){
  const g=new THREE.Group();
  const paper=new THREE.Mesh(new THREE.PlaneGeometry(w*.93,h*.93), mat.clone());
  paper.position.y=h/2; paper.castShadow=false; paper.receiveShadow=true; paper.userData.click='shoji';
  g.add(paper);
  const frame=H.standard(0x7c573d,{roughness:.64,map:T.wood});
  H.box(w,.055,.06,frame,0,.03,0,g,false,false);
  H.box(w,.055,.06,frame,0,h-.03,0,g,false,false);
  H.box(.055,h,.06,frame,-w/2+.03,h/2,0,g,false,false);
  H.box(.055,h,.06,frame,w/2-.03,h/2,0,g,false,false);
  // handle
  H.box(.016,.12,.026,H.standard(0x3a3027,{roughness:.45,metalness:.3}),.12,h*.52,.05,g,false,false);
  return g;
}
function trianglePlane(w,h,mat,x,y,z,rotY){
  const shape=new THREE.Shape(); shape.moveTo(-w/2,0); shape.lineTo(w/2,0); shape.lineTo(0,h); shape.closePath();
  const m=new THREE.Mesh(new THREE.ShapeGeometry(shape),mat); m.position.set(x,y,z); m.rotation.y=rotY; m.castShadow=true; m.receiveShadow=true; return m;
}
function build(){
  const root=new THREE.Group(); root.name='house'; root.position.set(C.house.x,0,C.house.z);
  const pickables=[];
  const mats={};
  const warm=[];
  const wallMat=new THREE.MeshToonMaterial({color:0xe8e1d2,map:T.plaster,gradientMap:H.gradient});
  const wallInner=new THREE.MeshToonMaterial({color:0xd8d1c1,map:T.plaster,gradientMap:H.gradient});
  const woodMat=H.standard(0xffffff,{roughness:.58,map:T.wood});
  const woodDark=H.standard(0xffffff,{roughness:.64,map:T.woodDark});
  const woodLight=H.standard(0xffffff,{roughness:.60,map:T.woodLight});
  const roofMat=H.standard(0xffffff,{roughness:.54,metalness:.03,map:T.roof});
  const shojiMat=new THREE.MeshStandardMaterial({map:shojiTexture(),transparent:true,opacity:.88,roughness:.95,side:THREE.DoubleSide,emissive:0x2b1d10,emissiveIntensity:0});
  const deckMat=H.standard(0xffffff,{roughness:.56,map:T.wood});
  const stoneBase=H.standard(0xc9c3b4,{roughness:.94,map:T.stone});
  const trimMat=H.standard(0xffffff,{roughness:.65,map:T.woodDark});
  mats.wallMat=wallMat; mats.wallInner=wallInner; mats.woodMat=woodMat; mats.woodDark=woodDark; mats.woodLight=woodLight;
  mats.roofMat=roofMat; mats.shojiMat=shojiMat; mats.deckMat=deckMat; mats.trimMat=trimMat; mats.warm=warm;
  const W=C.house.w, D=C.house.d, floorY=.78, wallTop=4.32, ridgeY=7.24, eaveY=4.46;
  const halfW=W/2, halfD=D/2;
  // foundation and floor
  H.box(W+.24,.30,D+.24,stoneBase,0,.245,0,root,true,true);
  H.box(W+.05,.14,D+.05,woodDark,0,.43,0,root,true,true);
  H.box(W-.08,.22,D-.08,woodMat,0,.68,0,root,true,true);
  // veranda deck, front
  const deckZ=halfD+.72, deckW=W+.55;
  H.box(deckW,.16,1.5,deckMat,0,.70,deckZ,root,true,true);
  for(let i=0;i<14;i++){
    H.box(.035,.012,1.46,new THREE.MeshStandardMaterial({color:0x62442f,roughness:.8}),-deckW/2+.15+i*(deckW-.3)/13,.787,deckZ,root,false,false);
  }
  // small side return deck
  H.box(1.05,.16,2.4,deckMat,-halfW-.22,.70,-.1,root,true,true);
  // veranda posts
  for(const px of [-halfW-.05, halfW+.05, -2.35, 2.35]){
    H.box(.19,3.52,.19,woodMat,px,.78+1.76,deckZ,root,true,true);
    H.box(.28,.10,.28,trimMat,px,.78,deckZ,root,false,true);
  }
  // beam along the veranda roof
  H.box(deckW+.2,.23,.22,woodDark,0,4.24,deckZ,root,true,true);
  // eave rafters, front and rear
  for(let i=0;i<25;i++){
    const x=-deckW/2+.25+i*(deckW-.5)/24;
    H.box(.105,.11,1.14,woodDark,x,4.28,deckZ-.12,root,false,false);
  }
  // main interior floor and tatami
  const roomW=W-.54, roomD=D-.38;
  H.box(roomW,.12,roomD,woodDark,0,floorY-.03,0,root,false,true);
  const tatMat=new THREE.MeshStandardMaterial({color:0xbab98e,map:T.tatami,roughness:1});
  const tatBorder=H.standard(0x4f5c48,{roughness:.95});
  const cols=4, rows=2, mw=roomW/cols, md=roomD/rows;
  for(let ix=0;ix<cols;ix++) for(let iz=0;iz<rows;iz++){
    const cx=-roomW/2+mw*(ix+.5), cz=-roomD/2+md*(iz+.5);
    H.box(mw-.035,.026,md-.035,tatBorder,cx,floorY+.014,cz,root,false,true);
    H.box(mw-.075,.030,md-.075,tatMat,cx,floorY+.042,cz,root,false,true);
  }
  // side and back walls
  H.box(W,.066,.15,woodDark,0,wallTop-.02,0,root,false,false);
  H.box(W,wallTop-floorY,.18,wallMat,0,floorY+(wallTop-floorY)/2,-halfD,root,true,true);
  H.box(.18,wallTop-floorY,D,wallMat,-halfW,floorY+(wallTop-floorY)/2,0,root,true,true);
  H.box(.18,wallTop-floorY,D,wallMat,halfW,floorY+(wallTop-floorY)/2,0,root,true,true);
  // front wall end piers, central opening left clear
  const sidePier=2.00;
  H.box(sidePier,wallTop-floorY,.18,wallMat,-halfW+sidePier/2,floorY+(wallTop-floorY)/2,halfD,root,true,true);
  H.box(sidePier,wallTop-floorY,.18,wallMat,halfW-sidePier/2,floorY+(wallTop-floorY)/2,halfD,root,true,true);
  // corner and major posts
  for(const x of [-halfW,-halfW+sidePier,halfW-sidePier,halfW]) for(const z of [-halfD,halfD]){
    H.box(.20,wallTop-floorY+.1,.20,woodMat,x,floorY+(wallTop-floorY)/2,z,root,true,true);
  }
  // opening posts
  for(const x of [-halfW+sidePier,halfW-sidePier]) H.box(.18,3.20,.19,woodMat,x,floorY+1.6,halfD+.01,root,true,true);
  // lintel and transom
  H.box(W-sidePier*2,.28,.24,woodMat,0,3.98,halfD,root,true,true);
  H.box(W-sidePier*2,.09,.14,woodDark,0,4.18,halfD+.01,root,true,true);
  for(let i=0;i<13;i++){
    const x=-(W-sidePier*2)/2+.12+i*(W-sidePier*2-.24)/12;
    H.box(.035,.34,.055,woodDark,x,3.88,halfD+.10,root,false,false);
  }
  // interior ceiling beams
  for(const z of [-2.0,-1.0,0,1.0,2.0]) H.box(W-.5,.13,.13,woodDark,0,4.17,z,root,false,false);
  for(const x of [-2.7,0,2.7]) H.box(.10,.13,D-.4,woodDark,x,4.17,0,root,false,false);
  // sliding shoji assembly, four panels
  const doorGroup=new THREE.Group(); doorGroup.position.set(0,floorY+.03,halfD-.01); root.add(doorGroup);
  const panelW=(W-sidePier*2)/4, panelH=3.10, centers=[-panelW*1.5,-panelW*.5,panelW*.5,panelW*1.5];
  const doors=[];
  for(let i=0;i<4;i++){
    const p=makeShoji(shojiMat,panelW-.055,panelH);
    p.position.set(centers[i],0,.02); doorGroup.add(p); doors.push(p);
    p.userData.click='shoji'; p.traverse(o=>{ if(o.isMesh) { o.userData.click='shoji'; pickables.push(o); } });
  }
  const hitMat=new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false,colorWrite:false});
  const hit=new THREE.Mesh(new THREE.BoxGeometry(W-sidePier*2,panelH+.2,.24),hitMat);
  hit.position.set(0,floorY+1.55,halfD-.01); hit.userData.click='shoji'; root.add(hit); pickables.push(hit);
  // tracks
  H.box(W-sidePier*2+.22,.06,.12,woodDark,0,floorY+.03,halfD+.02,root,false,false);
  H.box(W-sidePier*2+.22,.05,.10,woodDark,0,floorY+3.18,halfD+.02,root,false,false);
  // roof base slabs
  const slopeLen=Math.sqrt(4.07*4.07+2.78*2.78), ang=Math.atan2(2.78,4.07);
  const roofBaseMat=H.standard(0x4d626d,{roughness:.70});
  for(const s of [-1,1]){
    const panel=new THREE.Mesh(new THREE.BoxGeometry(10.7,.16,slopeLen),roofBaseMat);
    panel.position.set(0,(ridgeY+eaveY)/2-.07,s*2.035); panel.rotation.x=s*ang; panel.castShadow=true; panel.receiveShadow=true; root.add(panel);
    H.box(10.8,.22,.25,trimMat,0,eaveY-.10,s*4.06,root,true,true);
    for(let i=0;i<17;i++){
      const x=-5.15+.32+i*(10.2)/16;
      H.box(.10,.12,.30,woodDark,x,eaveY-.17,s*3.89,root,false,false);
    }
  }
  // roof tile instances
  const tileGeo=new THREE.CylinderGeometry(.108,.104,.58,6,1,true,0,Math.PI);
  tileGeo.rotateX(Math.PI/2);
  const tileMat=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.54,metalness:.04,map:T.roof});
  const tileRows=12, tileCols=38;
  const tiles=H.instanced(tileGeo,tileMat,tileRows*tileCols*2,root,true,false);
  const dummy=H.dummy; let ti=0; const tint=new THREE.Color();
  for(const side of [1,-1]){
    for(let r=0;r<tileRows;r++){
      const t=(r+.55)/tileRows;
      const z=side*(.18+t*3.83), y=ridgeY-t*(ridgeY-eaveY)-.01;
      for(let c=0;c<tileCols;c++){
        const x=-5.15+.14+c*(10.02/(tileCols-1));
        dummy.position.set(x+(r%2?.035:-.035),y,z);
        dummy.rotation.set(side*ang,0,0);
        dummy.scale.set(1,1,1);
        dummy.updateMatrix(); tiles.setMatrixAt(ti,dummy.matrix);
        tint.setHSL(.57,.10,.52+((c*7+r*3)%9)*.011); tiles.setColorAt(ti,tint);
        ti++;
      }
    }
  }
  tiles.instanceMatrix.needsUpdate=true; if(tiles.instanceColor) tiles.instanceColor.needsUpdate=true;
  const seamMat=H.standard(0x344a55,{roughness:.82});
  for(const side of [1,-1]){
    for(let r=0;r<tileRows;r++){
      const t=(r+.08)/tileRows;
      const z=side*(.18+t*3.83), y=ridgeY-t*(ridgeY-eaveY)+.145;
      const seam=H.box(10.34,.018,.045,seamMat,0,y,z,root,false,false);
      seam.rotation.x=side*ang;
    }
  }
  const capGeo=new THREE.CylinderGeometry(.113,.113,.075,6); capGeo.rotateX(Math.PI/2);
  const caps=H.instanced(capGeo,roofMat,tileCols*2,root,false,false);
  let ci=0;
  for(const side of [1,-1]) for(let c=0;c<tileCols;c++){
    const x=-5.15+.14+c*(10.02/(tileCols-1));
    dummy.position.set(x,eaveY+.015,side*4.01); dummy.rotation.set(side*ang,0,0); dummy.scale.set(1,1,1); dummy.updateMatrix(); caps.setMatrixAt(ci++,dummy.matrix);
  }
  caps.instanceMatrix.needsUpdate=true;
  const lipGeo=new THREE.CylinderGeometry(.105,.105,.055,6,1,false,0,Math.PI); lipGeo.rotateX(Math.PI/2);
  const lips=H.instanced(lipGeo,tileMat,tileRows*tileCols*2,root,false,false);
  let li=0;
  for(const side of [1,-1]) for(let r=0;r<tileRows;r++){
    const t=(r+.94)/tileRows, z=side*(.18+t*3.83), y=ridgeY-t*(ridgeY-eaveY)+.055;
    for(let c=0;c<tileCols;c++){
      const x=-5.15+.14+c*(10.02/(tileCols-1));
      dummy.position.set(x,y,z); dummy.rotation.set(side*ang,0,0); dummy.scale.set(1,1,1); dummy.updateMatrix(); lips.setMatrixAt(li++,dummy.matrix);
    }
  }
  lips.instanceMatrix.needsUpdate=true;
  // ridge cap
  const ridgeGeo=new THREE.CylinderGeometry(.24,.24,10.85,8,1,true,0,Math.PI);
  ridgeGeo.rotateZ(Math.PI/2);
  const ridge=new THREE.Mesh(ridgeGeo,roofMat); ridge.position.set(0,ridgeY+.05,0); ridge.castShadow=true; root.add(ridge);
  H.box(11.0,.11,.48,trimMat,0,ridgeY-.10,0,root,true,true);
  for(const x of [-5.42,5.42]){
    const end=new THREE.Mesh(new THREE.CylinderGeometry(.24,.24,.09,10),roofMat);
    end.rotation.z=Math.PI/2; end.position.set(x,ridgeY+.06,0); end.castShadow=true; root.add(end);
  }
  // gable triangles and barge boards
  for(const s of [-1,1]){
    const tri=trianglePlane(D+.2,2.9,wallMat,s*halfW,wallTop,-.02,Math.PI/2);
    tri.rotation.y=s>0?Math.PI/2:-Math.PI/2; root.add(tri);
    const barge=H.box(.12,.18,slopeLen,woodDark,s*5.19,(ridgeY+eaveY)/2,.0,root,false,false);
    barge.rotation.x=Math.PI/2-ang;
    // side horizontal fascia
    H.box(.14,.18,slopeLen,trimMat,s*5.34,(ridgeY+eaveY)/2,2.02,root,false,false).rotation.x=ang;
  }
  // under-eave soffit
  H.box(10.45,.02,.7,H.standard(0x6d513c,{roughness:.95}),0,eaveY-.20,3.76,root,false,false);
  // exterior timber framing and a small side shoji window
  for(const sx of [-1,1]){
    const wx=sx*(halfW+.026);
    for(const z of [-2.15,-.75,.65,2.05]) H.box(.075,3.35,.11,woodDark,wx,2.52,z,root,false,false);
    for(const y of [1.18,2.45,3.58]) H.box(.075,.095,D-.4,woodMat,wx,y,0,root,false,false);
  }
  const sideWin=new THREE.Group(); sideWin.position.set(halfW+.035,2.7,-.30); sideWin.rotation.y=Math.PI/2; root.add(sideWin);
  H.plane(1.55,1.02,shojiMat,0,0,0,sideWin);
  H.box(1.74,.075,.07,woodDark,0,.55,0,sideWin,false,false);
  H.box(1.74,.075,.07,woodDark,0,-.55,0,sideWin,false,false);
  H.box(.075,1.18,.07,woodDark,-.80,0,0,sideWin,false,false);
  H.box(.075,1.18,.07,woodDark,.80,0,0,sideWin,false,false);
  H.box(.055,1.0,.055,woodDark,0,0,0,sideWin,false,false);
  // low wood wainscot under the front plaster piers
  H.box(sidePier,.62,.09,woodDark,-halfW+sidePier/2,1.08,halfD+.10,root,false,false);
  H.box(sidePier,.62,.09,woodDark,halfW-sidePier/2,1.08,halfD+.10,root,false,false);
  H.box(sidePier,.10,.13,woodMat,-halfW+sidePier/2,2.18,halfD+.10,root,false,false);
  H.box(sidePier,.10,.13,woodMat,halfW-sidePier/2,2.18,halfD+.10,root,false,false);
  // soft shade under the eave, giving the facade depth
  const eaveShadeMat=new THREE.MeshBasicMaterial({map:eaveShadowTexture(),transparent:true,opacity:.72,depthWrite:false});
  const eaveShade=H.plane(W-.4,1.22,eaveShadeMat,0,3.70,halfD+.125,root); eaveShade.renderOrder=4; mats.eaveShadeMat=eaveShadeMat;
  // front posts with stone feet
  for(const x of [-3.95,3.95]){
    H.cyl(.16,.22,.34,8,stoneBase,x,.18,3.58,root,false,true);
    H.box(.24,3.60,.24,woodMat,x,2.05,3.58,root,true,true);
  }
  // steps down to the garden
  const stepMat=H.standard(0x9c7150,{roughness:.6,map:T.wood});
  H.box(1.55,.19,.48,stepMat,-.12,.66,4.20,root,true,true);
  H.box(1.70,.18,.52,stepMat,-.12,.49,4.62,root,true,true);
  H.box(1.85,.16,.55,stepMat,-.12,.34,5.03,root,true,true);
  // low railing on the right half of the engawa
  const railZ=4.16;
  for(const x of [3.88,4.43]) H.box(.11,.94,.11,woodMat,x,1.25,railZ,root,true,true);
  H.box(.64,.07,.08,woodMat,4.155,1.70,railZ,root,true,true);
  H.box(.64,.06,.075,woodMat,4.155,1.23,railZ,root,true,true);
  // TSUKUUE / desk-like reading nook
  const desk=new THREE.Group(); desk.position.set(1.12,floorY+.10,-.68); root.add(desk);
  H.box(1.55,.11,.68,woodMat,0,.48,0,desk,true,true);
  for(const x of [-.62,.62]) for(const z of [-.24,.24]) H.box(.08,.48,.08,woodDark,x,.24,z,desk,true,true);
  H.box(.80,.045,.50,new THREE.MeshStandardMaterial({color:0xded5c2,roughness:1}),.10,.565,0,desk,false,true);
  H.box(.54,.02,.38,new THREE.MeshStandardMaterial({color:0x8f3838,roughness:.9}),-.42,.565,.02,desk,false,true);
  // tansu
  const chest=new THREE.Group(); chest.position.set(1.58,floorY+.03,-2.05); root.add(chest);
  H.box(1.45,1.26,.64,woodDark,0,.63,0,chest,true,true);
  for(let r=0;r<3;r++){
    H.box(1.30,.30,.055,woodMat,0,.25+r*.37,.34,chest,false,false);
    H.box(.20,.028,.045,new THREE.MeshStandardMaterial({color:0xcdb583,roughness:.35,metalness:.4}),0,.29+r*.37,.39,chest,false,false);
  }
  H.box(1.52,.06,.72,woodDark,0,1.30,0,chest,false,false);
  // reading cushion
  const cushionMat=H.standard(0x8e7775,{roughness:1});
  H.box(1.02,.12,.94,cushionMat,.05,floorY+.10,.55,root,true,true);
  H.box(.92,.04,.84,H.standard(0xa88c89,{roughness:1}),.05,floorY+.175,.55,root,false,true);
  H.sphere(.035,H.standard(0xd0b6ad,{roughness:1}),.05,floorY+.193,.55,root,8,false);
  // books by the cushion
  for(let i=0;i<4;i++){
    const cols=[0x9c8b6f,0x6f7c6a,0xb6a78b,0x8f5f53];
    H.box(.36-i*.015,.045,.52,new THREE.MeshStandardMaterial({color:cols[i],roughness:.92}),-.62+i*.02,floorY+.085+i*.046,.32,root,false,true);
  }
  // tokonoma alcove, back left
  const toko=new THREE.Group(); toko.position.set(-.20,floorY, -2.40); root.add(toko);
  H.box(1.55,.20,.55,woodDark,0,.10,0,toko,true,true);
  H.box(1.52,2.60,.10,wallInner,0,1.42,-.58,toko,true,true);
  H.box(1.62,.12,.66,woodDark,0,2.74,-.28,toko,false,false);
  H.box(.90,1.98,.035,H.standard(0x50473c,{roughness:.9}),0,1.48,-.44,toko,false,false);
  const scrollMat=new THREE.MeshStandardMaterial({map:T.scroll,roughness:1,color:0xfbf4e3,emissive:0x2a2118,emissiveIntensity:.04});
  const scroll=H.plane(.74,1.82,scrollMat,0,1.48,-.42,toko); scroll.rotation.y=0;
  H.box(.90,.10,.08,woodDark,0,2.44,-.40,toko,false,false);
  H.box(.90,.10,.08,woodDark,0,.52,-.40,toko,false,false);
  H.box(.075,1.90,.06,woodDark,-.44,1.48,-.40,toko,false,false);
  H.box(.075,1.90,.06,woodDark,.44,1.48,-.40,toko,false,false);
  H.cyl(.085,.12,.42,10,H.standard(0x5f6b60,{roughness:.55}),0,.32,-.12,toko,true,true);
  // ikebana branch and flowers
  const ikePts=[[0,.50,-.12],[.07,.92,-.12],[-.18,1.24,-.10],[-.32,1.48,-.08]];
  H.taperedTube(ikePts,[.022,.017,.010,.006],5,H.standard(0x5e4b39,{roughness:.8}),toko,true);
  const flowerMat=H.toon(0xecc9cd,{emissive:0x2b1114,emissiveIntensity:.04});
  for(const p of [[-.33,1.48,-.08],[-.22,1.37,-.06],[-.08,1.29,-.11],[-.42,1.31,-.10]]){
    const f=new THREE.Group(); f.position.set(p[0],p[1],p[2]); toko.add(f);
    for(let k=0;k<5;k++){ const petal=H.sphere(.045,flowerMat,0,0,0,f,6,false); petal.scale.set(1,.35,.6); petal.rotation.z=k/5*Math.PI*2; petal.position.x=Math.cos(k/5*Math.PI*2)*.055; petal.position.y=Math.sin(k/5*Math.PI*2)*.055; }
    H.sphere(.028,H.standard(0xd6b878,{roughness:.7}),0,0,.03,f,6,false);
  }
  // paper lamp (andon)
  const lamp=new THREE.Group(); lamp.position.set(-.95,floorY+.02,-1.10); root.add(lamp);
  const lampWood=H.standard(0x5a3f2f,{roughness:.7});
  H.box(.58,.06,.58,lampWood,0,.03,0,lamp,true,true);
  H.box(.58,.06,.58,lampWood,0,1.50,0,lamp,false,true);
  for(const x of [-.25,.25]) for(const z of [-.25,.25]) H.box(.045,1.46,.045,lampWood,x,.76,z,lamp,true,true);
  const lampPaper=new THREE.MeshStandardMaterial({color:0xf3e3c0,roughness:.92,emissive:0xffc879,emissiveIntensity:0,transparent:true,opacity:.94,side:THREE.DoubleSide});
  for(const side of [[0,.78,-.25,.50,.92,.02,0],[0,.78,.25,.50,.92,.02,0],[-.25,.78,0,.02,.92,.50,1],[.25,.78,0,.02,.92,.50,1]]){
    const m=H.plane(side[3],side[4],lampPaper,side[0],side[1],side[2],lamp); if(side[5]) m.rotation.y=Math.PI/2;
  }
  const lampLight=new THREE.PointLight(0xffbd72,0,8,1.4); lampLight.position.set(0,1.55,0); lamp.add(lampLight);
  // interior warm light
  const interiorLight=new THREE.PointLight(0xffc47e,0,12,1.6); interiorLight.position.set(0,2.45,-1.0); root.add(interiorLight);
  const innerGlow=new THREE.PointLight(0xffd7a0,0,7,1.8); innerGlow.position.set(2.2,1.8,1.3); root.add(innerGlow);
  warm.push({mat:lampPaper,base:0,ambient:0},{light:lampLight,base:0},{light:interiorLight,base:0},{light:innerGlow,base:0});
  // interior wall glow panels (subtle warm response)
  mats.shojiMat=shojiMat;
  // base shrubs / stones around foundation added by garden
  // door state
  const state={amount:1.0,target:1.0};
  const hitAll=[];
  function toggleDoor(){
    state.target = state.target > .2 ? 0 : 1.0;
    return state.target > .2;
  }
  function update(dt){
    state.amount += (state.target-state.amount)*Math.min(1,dt*3.8);
    const off=state.amount*1.04;
    doors[0].position.x=centers[0]-off*.0;
    doors[1].position.x=centers[1]-off;
    doors[2].position.x=centers[2]+off;
    doors[3].position.x=centers[3]+off*.0;
  }
  // selective cel outlines on the largest architectural volumes
  const outlineCandidates=[];
  root.traverse(o=>{
    if(!o.isMesh||o.isInstancedMesh||!o.material||o.material.transparent||o.userData.click) return;
    if(!o.geometry.boundingBox) o.geometry.computeBoundingBox();
    const b=o.geometry.boundingBox; if(!b) return;
    const sz=b.getSize(new THREE.Vector3()); const score=sz.x*sz.y*sz.z;
    if(score>.22) outlineCandidates.push({o,score});
  });
  outlineCandidates.sort((a,b)=>b.score-a.score);
  for(const c of outlineCandidates.slice(0,14)) H.outline(c.o,1.005);
  // shadows/contact
  H.blob(12.4,9.2,.55,root,0,0.5);
  return {root, pickables, mats, warm, state, toggleDoor, update, lights:{lampLight,interiorLight,innerGlow}, doorGroup, doors};
}
Sakura.House = { build };
})();