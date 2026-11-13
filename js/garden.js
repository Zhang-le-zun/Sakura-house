(function(){
'use strict';
const Sakura = window.Sakura;
const C = Sakura.CONFIG, H = Sakura.Helpers, T = Sakura.Textures, U = Sakura.Util, S = Sakura.Stream;
const V = (x,y,z)=>new THREE.Vector3(x,y,z);
function petalGeometry(){
  return new THREE.PlaneGeometry(.152,.110,1,1);
}
function buildTrees(scene){
  const root=new THREE.Group(); root.name='trees'; scene.add(root);
  const branchMat=H.standard(0xc8b09a,{roughness:.88,map:T.woodDark});
  const branchMatLight=H.standard(0xd6c0aa,{roughness:.9,map:T.wood});
  const blossomMat=new THREE.MeshToonMaterial({color:0xffffff,map:T.petal,gradientMap:H.softGradient,side:THREE.DoubleSide,alphaTest:.20,emissive:0x4a2d35,emissiveIntensity:.025});
  let flowerPts=[];
  let activeCfg=null;
  const ribbonData=[];
  const treeGroups=[];
  const tipPool=[];
  const anchors=[];
  function addFlowerCluster(center, normal, rnd, amount, main){
    const n=new THREE.Vector3(normal.x,normal.y,normal.z).normalize();
    if(!isFinite(n.x)||n.lengthSq()<.1) n.set(0,1,0);
    const xAxis=new THREE.Vector3().crossVectors(new THREE.Vector3(0,1,0),n);
    if(xAxis.lengthSq()<.001) xAxis.set(1,0,0); xAxis.normalize();
    const yAxis=new THREE.Vector3().crossVectors(n,xAxis).normalize();
    const count=Math.max(3,Math.round(amount*(1.0+rnd()*.75)));
    for(let f=0;f<count;f++){
      const a=rnd()*Math.PI*2, r=.05+rnd()*.33;
      const c=center.clone().addScaledVector(xAxis,Math.cos(a)*r).addScaledVector(yAxis,Math.sin(a)*r*.8).add(new THREE.Vector3(0,(rnd()-.5)*.24,0));
      const outward=new THREE.Vector3().addScaledVector(xAxis,Math.cos(a)*.55).addScaledVector(yAxis,Math.sin(a)*.55).addScaledVector(n,.75).normalize();
      const flowerScale=(main?1.08:.94)*(.76+rnd()*.58);
      const petalCount=5;
      for(let k=0;k<petalCount;k++){
        const kk=k/petalCount*Math.PI*2 + rnd()*.10;
        const radial=new THREE.Vector3().addScaledVector(xAxis,Math.cos(kk)).addScaledVector(yAxis,Math.sin(kk)).normalize();
        const pos=c.clone().addScaledVector(radial,.041*flowerScale*1.15);
        const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,1), new THREE.Vector3().addScaledVector(radial,.72).addScaledVector(n,.52).normalize());
        const tint=new THREE.Color();
        const roll=rnd();
        if(roll<.28) tint.setHSL(.07,.12,.96); else if(roll<.65) tint.setHSL(.98,.22,.93); else if(roll<.86) tint.setHSL(.98,.34,.845); else tint.setHSL(.92,.22,.77);
        flowerPts.push({pos,q,scale:flowerScale,color:tint,wx:(activeCfg?activeCfg.x:0)+pos.x,wy:pos.y+.132,wz:(activeCfg?activeCfg.z:0)+pos.z});
      }
      // tiny warm centers, cheap but they catch light
      if(rnd()<.34 && flowerPts.length>10){
        // centers are added as a slightly warm petal-scale instance using the same mesh, far cheaper than another draw call
      }
    }
  }
  function grow(x0,y0,z0,x1,y1,z1,rad0,rad1,parent,mat,cast){
    return H.taperedTube([[x0,y0,z0],[U.lerp(x0,x1,.38)+(x1-x0)*.05,y0+(y1-y0)*.37,z0+(z1-z0)*.34],[U.lerp(x0,x1,.72),y0+(y1-y0)*.70,z0+(z1-z0)*.70],[x1,y1,z1]],[rad0,rad0*.82,rad1*1.1,rad1],6,mat,parent,cast);
  }
  function makeTree(cfg){
    const rnd=U.seeded(cfg.seed);
    activeCfg=cfg;
    const g=new THREE.Group(); g.position.set(cfg.x,.132,cfg.z); root.add(g); treeGroups.push(g);
    const h=cfg.height, spread=cfg.spread||1;
    const leanX=(rnd()-.5)*.7, leanZ=(rnd()-.5)*.5;
    const trunkMat=cfg.main?branchMat:branchMatLight;
    const trunkPts=[[0,0,0],[leanX*.15,h*.18,leanZ*.12],[leanX*.45,h*.44,leanZ*.4],[leanX*.7,h*.68,leanZ*.7],[leanX*.8,h*.86,leanZ*.9]];
    const trunkMesh=H.taperedTube(trunkPts,[h*.055,h*.045,h*.033,h*.021,h*.010],10,trunkMat,g,true);
    // buttress roots
    for(let i=0;i<5;i++){
      const a=i/5*Math.PI*2+rnd()*.5, r=h*.035;
      H.taperedTube([[0,h*.01,0],[Math.cos(a)*r*1.7,h*.004,Math.sin(a)*r*1.7],[Math.cos(a)*r*3.2,.01,Math.sin(a)*r*3.2]],[r*.7,r*.32,.008],5,trunkMat,g,true);
    }
    // moss and small stones at base
    for(let i=0;i<4;i++){
      const a=rnd()*Math.PI*2;
      H.sphere(.10+rnd()*.16,H.toon(0x697b50),Math.cos(a)*.55,.04,Math.sin(a)*.55,g,7,false).scale.set(1.8,.32,1.3);
    }
    H.blob(2.8+spread*1.6,2.5+spread*1.5,.34,g,0,0);
    const primaryCount=cfg.main?9:(cfg.height>8?7:5);
    const treeTips=[];
    for(let i=0;i<primaryCount;i++){
      const level=.34+rnd()*.43;
      const start=V(leanX*level,h*level,leanZ*level);
      const around=i/primaryCount*Math.PI*2+(cfg.seed%7)*.17+rnd()*.36;
      const lift=.10+rnd()*.34;
      let dir=V(Math.cos(around)*spread, lift, Math.sin(around)*spread*.82).normalize();
      // keep the main tree's lower arms clear of entrance / tea seat
      if(cfg.main && dir.x>.15 && start.y<5.4) dir.x*=.55;
      const len=h*(.22+rnd()*.17)*(cfg.main?1.08:.9);
      const sx=start.x, sy=start.y, sz=start.z;
      const ex=sx+dir.x*len, ey=sy+dir.y*len, ez=sz+dir.z*len;
      grow(sx,sy,sz,ex,ey,ez,Math.max(.045,h*.018*(cfg.main?1.1:.9)),.018, g,trunkMat,true);
      const tip=V(ex,ey,ez);
      treeTips.push(tip);
      for(let q=0;q<3;q++){
        const mid=V(U.lerp(sx,ex,.36+q*.22),U.lerp(sy,ey,.36+q*.22),U.lerp(sz,ez,.36+q*.22));
        addFlowerCluster(mid,dir,rnd,cfg.main?6:5,cfg.main);
      }
      // secondary branches
      const secs=cfg.main?3:2;
      for(let j=0;j<secs;j++){
        const a2=around+(j-(secs-1)/2)*.48+(rnd()-.5)*.35;
        const dir2=V(Math.cos(a2)*spread*.9, .10+rnd()*.45, Math.sin(a2)*spread*.78).normalize();
        const len2=len*(.48+rnd()*.28);
        const s2=V(U.lerp(sx,ex,.32+rnd()*.42),U.lerp(sy,ey,.32+rnd()*.42),U.lerp(sz,ez,.32+rnd()*.42));
        const e2=s2.clone().addScaledVector(dir2,len2);
        grow(s2.x,s2.y,s2.z,e2.x,e2.y,e2.z,.028,.010,g,trunkMat,true);
        treeTips.push(e2);
        if(rnd()<.92){
          const normal=e2.clone().sub(s2).normalize();
          const clusters=cfg.main?3:2;
          for(let c=0;c<clusters;c++) addFlowerCluster(e2.clone().add(V((rnd()-.5)*.32,(rnd()-.2)*.22,(rnd()-.5)*.32)),normal,rnd,cfg.main?9:7,cfg.main);
          for(let q=0;q<6;q++){
            const mid=s2.clone().lerp(e2,.18+q*.145);
            addFlowerCluster(mid,normal,rnd,cfg.main?6:5,cfg.main);
          }
        }
        // twigs
        const twigs=cfg.main?3:2;
        for(let k=0;k<twigs;k++){
          const a3=a2+(k-(twigs-1)/2)*.42+(rnd()-.5)*.4;
          const dir3=V(Math.cos(a3)*spread, .05+rnd()*.30, Math.sin(a3)*spread*.8).normalize();
          const len3=len2*(.45+rnd()*.25);
          const s3=e2.clone().addScaledVector(dir2,-len2*(.18+rnd()*.18)).add(V((rnd()-.5)*.12,0,(rnd()-.5)*.12));
          const e3=s3.clone().addScaledVector(dir3,len3);
          grow(s3.x,s3.y,s3.z,e3.x,e3.y,e3.z,.018,.006,g,trunkMat,false);
          treeTips.push(e3);
          for(let q=0;q<3;q++){
            const mid3=V(U.lerp(s3.x,e3.x,.25+q*.24),U.lerp(s3.y,e3.y,.25+q*.24),U.lerp(s3.z,e3.z,.25+q*.24));
            addFlowerCluster(mid3,dir3,rnd,cfg.main?5:4,cfg.main);
          }
          if(rnd()<.98){
            addFlowerCluster(e3.clone().add(V((rnd()-.5)*.24,(rnd()-.2)*.16,(rnd()-.5)*.24)),dir3,rnd,cfg.main?9:6,cfg.main);
          }
        }
      }
      if(rnd()<.9) addFlowerCluster(tip.clone().add(V((rnd()-.5)*.3,(rnd()-.2)*.2,(rnd()-.5)*.3)),dir,rnd,cfg.main?9:6,cfg.main);
    }
    // crown tuft around the visible top of the trunk
    const topPt=V(leanX*.8,h*.88,leanZ*.9);
    for(let q=0;q<6;q++){
      const a=rnd()*Math.PI*2, rr=.30+rnd()*1.10;
      const p=topPt.clone().add(V(Math.cos(a)*rr,(rnd()-.2)*.55,Math.sin(a)*rr*.8));
      addFlowerCluster(p,V(Math.cos(a),1.0,Math.sin(a)),rnd,cfg.main?7:5,cfg.main);
    }
    // extra overhanging arms that let blossoms lightly cover the roof edges
    if(cfg.main || cfg.seed===714){
      const start=V(leanX*.45,h*.58,leanZ*.45);
      const toward=cfg.main?V(2.15,1.55,1.65):V(-2.05,1.15,1.05);
      const end=start.clone().add(toward);
      grow(start.x,start.y,start.z,end.x,end.y,end.z,.035,.010,g,trunkMat,true);
      for(let q=0;q<4;q++){
        const p=start.clone().lerp(end,.35+q*.19);
        addFlowerCluster(p,V(.4,.8,.5),rnd,cfg.main?8:6,true);
      }
      for(const s of [-1,1]){
        const e2=end.clone().add(V(s*.55,.25,.3));
        grow(end.x,end.y,end.z,e2.x,e2.y,e2.z,.016,.005,g,trunkMat,false);
        addFlowerCluster(e2,V(0,1,0),rnd,7,true);
      }
      treeTips.push(end);
    }
    // a few high crown clusters to round out silhouette without a solid ball
    const crowns=cfg.main?18:10;
    for(let i=0;i<crowns;i++){
      const a=rnd()*Math.PI*2, rr=(.25+rnd()*.72)*h*.22*spread;
      const p=V(leanX*.8+Math.cos(a)*rr,h*(.64+rnd()*.3),leanZ*.8+Math.sin(a)*rr*.82);
      addFlowerCluster(p,V(Math.cos(a),.7,Math.sin(a)),rnd,cfg.main?6:4,cfg.main);
    }
    // store a few curated ribbon anchors from the tips
    treeTips.sort((a,b)=>b.y-a.y);
    anchors.push({group:g,tips:treeTips.slice(0,Math.min(8,treeTips.length))});
    return {group:g,tips:treeTips};
  }
  const trees=[
    {x:-5.25,z:-2.95,height:11.9,spread:1.22,seed:142,main:true},
    {x:5.45,z:-4.20,height:9.7,spread:1.03,seed:714,main:false},
    {x:1.55,z:-6.30,height:8.6,spread:.94,seed:913,main:false},
    {x:-6.30,z:1.16,height:5.7,spread:.85,seed:511,main:false},
    {x:6.25,z:1.10,height:4.9,spread:.72,seed:335,main:false}
  ];
  trees.forEach(makeTree);
  // keep the entrance and tea seat visually open through the blossom canopy
  const keep=[];
  for(const f of flowerPts){
    const entrance=f.wx>-2.6 && f.wx<2.25 && f.wz>-.2 && f.wz<4.2 && f.wy>3.8 && f.wy<7.5;
    const tea=f.wx>1.0 && f.wx<3.5 && f.wz>.35 && f.wz<2.8 && f.wy>3.2 && f.wy<6.5;
    if(!(entrance||tea)) keep.push(f);
  }
  flowerPts=keep;
  // limit and build petal instances
  const maxPetals=(window.innerWidth<760?C.quality.mobile.blossoms:C.quality.desktop.blossoms);
  if(flowerPts.length>maxPetals){
    const flowers=Math.floor(flowerPts.length/5), wanted=Math.floor(maxPetals/5), step=flowers/wanted, sampled=[];
    for(let i=0;i<wanted;i++){ const start=Math.floor(i*step)*5; for(let k=0;k<5;k++) sampled.push(flowerPts[start+k]); }
    flowerPts=sampled;
  }
  Sakura.Garden.flowerPetalCount=flowerPts.length;
  const petalGeo=petalGeometry();
  const blossoms=new THREE.InstancedMesh(petalGeo,blossomMat,flowerPts.length);
  blossoms.castShadow=false; blossoms.receiveShadow=false; blossoms.frustumCulled=false;
  const d=H.dummy; const col=new THREE.Color();
  for(let i=0;i<flowerPts.length;i++){
    const f=flowerPts[i]; d.position.set(f.wx,f.wy,f.wz); d.quaternion.copy(f.q); d.scale.setScalar(f.scale); d.updateMatrix();
    blossoms.setMatrixAt(i,d.matrix); blossoms.setColorAt(i,f.color);
  }
  blossoms.instanceMatrix.needsUpdate=true; if(blossoms.instanceColor) blossoms.instanceColor.needsUpdate=true;
  root.add(blossoms);
  // sparse leaves beneath blossoms
  const leafPts=[];
  for(let i=0;i<420;i++){
    const f=flowerPts[(i*37)%Math.max(1,flowerPts.length)];
    if(!f) break;
    const p=new THREE.Vector3(f.wx,f.wy,f.wz).add(V((Math.random()-.5)*.22,(Math.random()-.5)*.18,(Math.random()-.5)*.22));
    leafPts.push({pos:p,q:f.q.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(.4,Math.random()*2,Math.random()))),s:.3+Math.random()*.6});
  }
  const leafGeo=new THREE.PlaneGeometry(.18,.10);
  const leafMat=new THREE.MeshToonMaterial({map:T.leaf,alphaTest:.4,side:THREE.DoubleSide,transparent:true,opacity:.86,gradientMap:H.gradient,color:0x93a16e});
  const leaves=new THREE.InstancedMesh(leafGeo,leafMat,leafPts.length);
  for(let i=0;i<leafPts.length;i++){const l=leafPts[i];d.position.copy(l.pos);d.quaternion.copy(l.q);d.scale.setScalar(l.s);d.updateMatrix();leaves.setMatrixAt(i,d.matrix);} leaves.instanceMatrix.needsUpdate=true; root.add(leaves);
  // ribbons + tags
  const ribbonMats=[];
  const ribbons=[];
  const tagData=[];
  const ribbonColors=[0xd28d9c,0xebadb9,0xc88796,0xf0c7cf];
  for(let i=0;i<5;i++){
    const anchor=anchors[i%anchors.length]; const tip=anchor.tips[(i*2+1)%anchor.tips.length]; if(!tip) continue;
    const pos=tip.clone().add(V((i%2?1:-1)*.10,.06,.06));
    const rg=new THREE.Group(); rg.position.copy(pos); anchor.group.add(rg);
    const width=.09+ (i%2)*.025, len=.72+(i%3)*.16;
    const geo=H.ribbonGeometry(len,width,10);
    const mat=new THREE.MeshStandardMaterial({color:ribbonColors[i%ribbonColors.length],roughness:.9,side:THREE.DoubleSide,transparent:true,opacity:.9,emissive:0x2a1116,emissiveIntensity:.03});
    const mesh=new THREE.Mesh(geo,mat); mesh.castShadow=false; rg.add(mesh);
    const base=geo.attributes.position.array.slice();
    ribbons.push({mesh,base,phase:i*1.7,amp:.035+i*.006,width});
    const string=H.cyl(.005,.005,.22,4,H.standard(0x8e7660,{roughness:.9}),0,-.18,0,rg,false,false);
    if(i<3){
      const tm=new THREE.MeshBasicMaterial({map:i%2?T.tag2:T.tag,transparent:true,alphaTest:.15,side:THREE.DoubleSide});
      const tag=new THREE.Mesh(new THREE.PlaneGeometry(.22,.27),tm); tag.position.set(0,-.48,.01); rg.add(tag);
      const baseRot=tag.rotation.z;
      tagData.push({tag,base:baseRot,phase:i*.9});
    }
    rg.rotation.z=(i%2?1:-1)*.22; rg.rotation.y=i*.7;
    ribbonMats.push(mat);
  }
  // shrubs and ferns
  const shrubMats=[H.toon(0x7b8d63),H.toon(0x93a173),H.toon(0x687d58)];
  const shrubs=new THREE.Group(); root.add(shrubs);
  const shrubSpots=[[-4.9,-.4,1.2],[-3.4,-3.9,.9],[4.9,-2.8,1.0],[4.4,1.7,.8],[-2.0,-4.7,.7],[3.9,-5.6,.6],[-6.6,-4.4,.9],[6.7,-5.9,.75],[-6.8,3.4,.6],[5.8,3.0,.55]];
  for(const [x,z,sc] of shrubSpots){
    const sh=new THREE.Group(); sh.position.set(x,.13,z); shrubs.add(sh);
    for(let i=0;i<6;i++){
      const a=Math.random()*Math.PI*2, r=Math.random()*.38*sc;
      const m=H.sphere((.19+Math.random()*.22)*sc,shrubMats[i%3],Math.cos(a)*r,.22+Math.random()*.22*sc,Math.sin(a)*r,sh,7,true);
      m.scale.set(1.25,.75+Math.random()*.3,1.0);
      m.rotation.y=Math.random()*Math.PI;
    }
    for(let i=0;i<3;i++){
      const f=new THREE.Mesh(new THREE.PlaneGeometry(.18,.10),leafMat);
      f.position.set((Math.random()-.5)*.6,.4+Math.random()*.25,(Math.random()-.5)*.4); f.rotation.y=Math.random()*Math.PI; sh.add(f);
    }
  }
  // ferns along the stream banks
  const fernMat=new THREE.MeshStandardMaterial({map:T.leaf,transparent:true,alphaTest:.3,side:THREE.DoubleSide,roughness:1,color:0x88a36f});
  for(let i=0;i<14;i++){
    const x=-6.8+i*.95+(Math.random()-.5)*.35;
    const side=i%2?1:-1;
    const z=S.center(x)+side*(S.half(x)+.33+Math.random()*.28);
    const fg=new THREE.Group(); fg.position.set(x,.13,z); fg.rotation.y=Math.random()*Math.PI*2; root.add(fg);
    for(let k=0;k<7;k++){
      const blade=new THREE.Mesh(new THREE.PlaneGeometry(.10,.42),fernMat);
      blade.position.set(Math.cos(k/7*Math.PI*2)*.11,.22,Math.sin(k/7*Math.PI*2)*.11);
      blade.rotation.set(-1.05+Math.random()*.35,k/7*Math.PI*2,Math.random()*.3-.15);
      blade.scale.set(.8+Math.random()*.5,.8+Math.random()*.6,1); fg.add(blade);
    }
  }
  // hanging grass at the water edge
  const grassMat=H.standard(0x8fa66e,{roughness:1,side:THREE.DoubleSide});
  for(let i=0;i<28;i++){
    const x=-7.2+Math.random()*14.4;
    const side=i%2?1:-1;
    const z=S.center(x)+side*(S.half(x)-.04);
    const blade=new THREE.Mesh(new THREE.PlaneGeometry(.035,.48+Math.random()*.4),grassMat);
    blade.position.set(x,.09,z); blade.rotation.set(Math.PI/2-.15*side,Math.random()*Math.PI,side*.38); root.add(blade);
  }
  // small ground flowers
  const flowerMat=H.toon(0xecb7bd); const yellow=H.toon(0xe5ce8c);
  for(let i=0;i<22;i++){
    const x=-6.4+Math.random()*12.8;
    const side=Math.random()>.5?1:-1;
    const z=S.center(x)+side*(S.half(x)+.55+Math.random()*.9);
    for(let k=0;k<4;k++){
      const p=H.plane(.07,.07,flowerMat,x+(Math.random()-.5)*.35,.25+Math.random()*.12,z+(Math.random()-.5)*.28,root);
      p.rotation.x=-1.1; p.rotation.z=Math.random()*Math.PI;
      p.material.side=THREE.DoubleSide;
    }
    H.sphere(.018,yellow,x,.21,z,root,5,false);
  }
  // static fallen petals on banks, deck edge and stones
  const fallenGeo=new THREE.PlaneGeometry(.07,.10);
  const fallenMat=new THREE.MeshBasicMaterial({map:T.petal,transparent:true,alphaTest:.2,side:THREE.DoubleSide,color:0xf3d2d7,depthWrite:false});
  const fallen=new THREE.InstancedMesh(fallenGeo,fallenMat,150); fallen.renderOrder=3; root.add(fallen);
  for(let i=0;i<150;i++){
    let x,z,y;
    if(i<35){ x=-3.7+Math.random()*1.4; z=1.15+Math.random()*.8; y=.793; }
    else if(i<65){ x=1.8+Math.random()*2.2; z=1.2+Math.random()*.75; y=.793; }
    else { x=-6.7+Math.random()*13.2; const side=Math.random()>.5?1:-1; z=S.center(x)+side*(S.half(x)+.16+Math.random()*.55); y=.135; }
    d.position.set(x,y,z); d.rotation.set(-Math.PI/2+Math.random()*.18,Math.random()*Math.PI,Math.random()*Math.PI); d.scale.setScalar(.6+Math.random()*.9); d.updateMatrix(); fallen.setMatrixAt(i,d.matrix);
  }
  fallen.instanceMatrix.needsUpdate=true;
  // dense, low ground cover: tufted grass and moss mounds
  function tuftGeometry(){
    const pos=[], col=[], rnd=U.seeded(6281);
    const dark=new THREE.Color(0x576b46), light=new THREE.Color(0x94a873);
    for(let k=0;k<7;k++){
      const a=k/7*Math.PI*2+rnd()*.45, h=.16+rnd()*.30, w=.022+rnd()*.014;
      const bx=Math.cos(a)*.045, bz=Math.sin(a)*.045, tx=bx+Math.cos(a)*h*.34, tz=bz+Math.sin(a)*h*.34;
      const sx=Math.cos(a+Math.PI/2)*w, sz=Math.sin(a+Math.PI/2)*w;
      pos.push(bx-sx,0,bz-sz, bx+sx,0,bz+sz, tx,.55*h,tz, tx+Math.cos(a+Math.PI/2)*w*.25,h,tz+Math.sin(a+Math.PI/2)*w*.25, tx-Math.cos(a+Math.PI/2)*w*.25,h,tz-Math.sin(a+Math.PI/2)*w*.25);
      const d=dark, l=light;
      col.push(d.r,d.g,d.b,d.r,d.g,d.b,l.r,l.g,l.b,l.r,l.g,l.b,l.r,l.g,l.b);
    }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(col,3)); g.computeVertexNormals(); return g;
  }
  const tuftMat=new THREE.MeshToonMaterial({color:0xffffff,vertexColors:true,side:THREE.DoubleSide,gradientMap:H.gradient});
  const tuftCount=180, tufts=new THREE.InstancedMesh(tuftGeometry(),tuftMat,tuftCount); tufts.castShadow=false; tufts.receiveShadow=true; tufts.frustumCulled=false; root.add(tufts);
  const trnd=U.seeded(5531); let tI=0;
  while(tI<tuftCount){
    const x=-7.3+trnd()*14.6, side=trnd()>.5?1:-1;
    const z=S.center(x)+side*(S.half(x)+.22+trnd()*1.3);
    if(x>-5.2&&x<4.5&&z>-5.5&&z<2.0) continue;
    if(z>-7.6&&z<7.6){
      d.position.set(x,.142,z); d.rotation.set(0,trnd()*Math.PI*2,0); d.scale.setScalar(.62+trnd()*.55); d.updateMatrix(); tufts.setMatrixAt(tI++,d.matrix);
    }
  }
  tufts.instanceMatrix.needsUpdate=true;
  const mossGeo=new THREE.SphereGeometry(1,7,4,0,Math.PI*2,0,Math.PI*.55);
  const mossMat=H.standard(0xffffff,{roughness:1,map:T.moss});
  const mossCount=95, mossMounds=new THREE.InstancedMesh(mossGeo,mossMat,mossCount); mossMounds.castShadow=false; mossMounds.receiveShadow=true; mossMounds.frustumCulled=false; root.add(mossMounds);
  const mrnd=U.seeded(8823); let mI=0;
  while(mI<mossCount){
    const x=-7.0+mrnd()*14, side=mrnd()>.5?1:-1;
    const z=S.center(x)+side*(S.half(x)+.18+mrnd()*.7);
    if(x>-4.8&&x<4.2&&z>-5.4&&z<2.0) continue;
    const rr=.055+mrnd()*.16;
    d.position.set(x,.138,z); d.rotation.set(0,mrnd()*Math.PI*2,0); d.scale.set(rr*1.55,rr*.25,rr*1.0); d.updateMatrix(); mossMounds.setMatrixAt(mI++,d.matrix);
  }
  mossMounds.instanceMatrix.needsUpdate=true;
  // rocks and stepping stones, built here so they share the garden context
  buildPathAndRocks(root);
  // a few deliberately placed silk ribbons and tags at the front branches
  const extraRibbons=[
    {x:4.24,y:5.35,z:-1.95,c:0xd38d9e,rot:.28,tag:T.tag,phase:2.1},
    {x:-3.26,y:6.15,z:-.66,c:0xf0bac5,rot:-.34,tag:T.tag2,phase:3.4},
    {x:2.34,y:5.78,z:-4.02,c:0xc98796,rot:.18,tag:null,phase:4.8}
  ];
  for(const er of extraRibbons){
    const rg=new THREE.Group(); rg.position.set(er.x,er.y,er.z); rg.rotation.z=er.rot; rg.rotation.y=.3; root.add(rg);
    const geo=H.ribbonGeometry(.70,.10,10);
    const mat=new THREE.MeshStandardMaterial({color:er.c,roughness:.88,side:THREE.DoubleSide,transparent:true,opacity:.92,emissive:0x2a1116,emissiveIntensity:.02});
    const mesh=new THREE.Mesh(geo,mat); rg.add(mesh);
    const base=geo.attributes.position.array.slice(); ribbons.push({mesh,base,phase:er.phase,amp:.04,width:.1});
    H.cyl(.005,.005,.23,4,H.standard(0x8e7660,{roughness:.9}),0,-.17,0,rg,false,false);
    if(er.tag){
      const tm=new THREE.MeshBasicMaterial({map:er.tag,transparent:true,alphaTest:.12,side:THREE.DoubleSide});
      const tag=new THREE.Mesh(new THREE.PlaneGeometry(.25,.31),tm); tag.position.set(0,-.43,.01); rg.add(tag);
      tagData.push({tag,base:0,phase:er.phase});
    }
  }
  function update(dt,time,hour){
    blossomMat.emissiveIntensity=.02+(hour>19? .035:0);
    for(const r of ribbons){
      const p=r.mesh.geometry.attributes.position, a=p.array;
      for(let i=0;i<a.length;i+=3){
        const bx=r.base[i], by=r.base[i+1], bz=r.base[i+2];
        const t=Math.abs(by)/.9;
        a[i+2]=bz+Math.sin(time*1.35+by*4.2+r.phase)*r.amp*t;
        a[i]=bx+Math.sin(time*.75+by*2.4+r.phase)*.014*t;
      }
      p.needsUpdate=true;
    }
    for(const t of tagData){ t.tag.rotation.z=t.base+Math.sin(time*.9+t.phase)*.12; t.tag.rotation.y=Math.sin(time*.6+t.phase)*.18; }
  }
  return {root,blossoms,blossomMat,ribbons,anchorData:anchors,update};
}
function buildPathAndRocks(parent){
  const rockMat=H.standard(0x898a81,{roughness:.96,map:T.stone});
  const rockDark=H.standard(0x74786f,{roughness:.98,map:T.stone});
  const mossMat=H.toon(0x738458);
  const rnd=U.seeded(9004);
  const rockSpots=[];
  for(let i=0;i<26;i++){
    const x=-7.0+rnd()*14;
    const side=rnd()>.5?1:-1;
    const z=S.center(x)+side*(S.half(x)+.18+rnd()*.55);
    rockSpots.push([x,z,.1+rnd()*.25]);
  }
  for(const [x,z,r] of rockSpots){
    const rk=new THREE.Mesh(new THREE.DodecahedronGeometry(r,0),rnd()>.5?rockMat:rockDark);
    rk.position.set(x,.12+r*.2,z); rk.scale.set(1.15+rnd()*.8,.55+rnd()*.35,.9+rnd()*.5); rk.rotation.set(rnd()*Math.PI,rnd()*Math.PI,rnd()*Math.PI);
    rk.castShadow=true; rk.receiveShadow=true; parent.add(rk);
    if(rnd()<.5){const m=H.sphere(r*.7,mossMat,x,.12+r*.3,z,parent,6,false);m.scale.set(1.2,.18,.9);}
  }
  // stepping stones to the bridge and the house steps
  const stones=[[-.95,4.8],[.15,5.05],[1.12,4.85],[1.72,4.35],[2.20,3.95],[2.28,3.48],[2.25,2.92],[2.08,2.48]];
  for(let i=0;i<stones.length;i++){
    const [x,z]=stones[i];
    const st=new THREE.Mesh(new THREE.CylinderGeometry(.28-rnd()*.04,.32-rnd()*.04,.07,9),rockMat);
    st.position.set(x,.13,z); st.rotation.y=rnd()*Math.PI; st.scale.set(1.2,1,.8); st.castShadow=true; st.receiveShadow=true; parent.add(st);
  }
  // bridge at x=2.3
  const bridge=new THREE.Group(); bridge.position.set(2.3,.13,3.95); parent.add(bridge);
  const bridgeWood=H.standard(0x8e6647,{roughness:.65,map:T.wood});
  const bridgeDark=H.standard(0x5e4332,{roughness:.7,map:T.woodDark});
  const z0=-1.55,z1=1.55,count=11;
  for(let i=0;i<count;i++){
    const t=i/(count-1), z=U.lerp(z0,z1,t), y=.07+Math.sin(t*Math.PI)*.22;
    const plank=H.box(1.18,.075,.34,bridgeWood,0,y,z,bridge,true,true);
    plank.rotation.x=-Math.cos(t*Math.PI)*.08;
  }
  for(const s of [-1,1]){
    H.box(.08,.30,3.22,bridgeDark,s*.52,.18,0,bridge,true,true);
    for(const z of [-1.35,1.35]){
      H.box(.12,1.05,.12,bridgeDark,s*.58,.58,z,bridge,true,true);
      H.sphere(.075,bridgeDark,s*.58,1.10,z,bridge,8,false);
    }
    H.box(.06,.07,2.88,bridgeDark,s*.58,.83,0,bridge,true,true);
    H.box(.06,.06,2.88,bridgeDark,s*.58,.48,0,bridge,true,true);
  }
  // path pebbles near the bridge
  for(let i=0;i<18;i++){
    const x=1.2+Math.random()*2.2, z=5.1+Math.random()*.9;
    const p=new THREE.Mesh(new THREE.DodecahedronGeometry(.05+Math.random()*.08,0),rockMat);
    p.position.set(x,.14,z); p.scale.set(1.2,.7,1); p.castShadow=true; p.receiveShadow=true; parent.add(p);
  }
}
Sakura.Garden={build:buildTrees,buildPathAndRocks};
})();