(function(){
'use strict';
const Sakura = window.Sakura;
const H = {};
H.gradient = null;
H.init = function(){
  const data = new Uint8Array([68, 108, 158, 205, 245]);
  const tex = new THREE.DataTexture(data, data.length, 1, THREE.RedFormat);
  tex.minFilter = tex.magFilter = THREE.NearestFilter;
  tex.needsUpdate = true;
  H.gradient = tex;
  const soft = new Uint8Array([150, 182, 212, 236, 252]);
  const softTex = new THREE.DataTexture(soft, soft.length, 1, THREE.RedFormat);
  softTex.minFilter = softTex.magFilter = THREE.NearestFilter; softTex.needsUpdate = true;
  H.softGradient = softTex;
  H.toonCache = new Map();
  H.outlineMat = new THREE.MeshBasicMaterial({ color:0x303a3b, side:THREE.BackSide });
};
H.toon = function(color, opts={}){
  const key = String(color)+JSON.stringify(opts);
  if (H.toonCache.has(key)) return H.toonCache.get(key);
  const m = new THREE.MeshToonMaterial({
    color: color,
    gradientMap: H.gradient,
    transparent: !!opts.transparent,
    opacity: opts.opacity === undefined ? 1 : opts.opacity,
    side: opts.side || THREE.FrontSide,
    emissive: opts.emissive || 0x000000,
    emissiveIntensity: opts.emissiveIntensity === undefined ? 0 : opts.emissiveIntensity,
    map: opts.map || null,
    alphaTest: opts.alphaTest || 0
  });
  H.toonCache.set(key,m); return m;
};
H.standardCache = new Map();
H.standard = function(color, opts={}){
  const key=[color,opts.roughness,opts.metalness,opts.map&&opts.map.uuid,!!opts.transparent,opts.opacity,opts.side,opts.emissive,opts.emissiveIntensity,opts.depthWrite].join('|');
  if(H.standardCache.has(key)) return H.standardCache.get(key);
  const m = new THREE.MeshStandardMaterial({
    color: color, roughness: opts.roughness === undefined ? .78 : opts.roughness,
    metalness: opts.metalness || 0, map: opts.map || null,
    transparent: !!opts.transparent, opacity: opts.opacity === undefined ? 1 : opts.opacity,
    side: opts.side || THREE.FrontSide, emissive: opts.emissive || 0x000000,
    emissiveIntensity: opts.emissiveIntensity || 0, depthWrite: opts.depthWrite === undefined ? true : opts.depthWrite
  });
  H.standardCache.set(key,m); return m;
};
H.mergeStatic = function(scene){
  scene.updateMatrixWorld(true);
  const groups=new Map();
  const skipped=o=>{ let p=o; while(p){ if(p.userData&&(p.userData.dynamic||p.userData.click)) return true; p=p.parent; } return false; };
  scene.traverse(o=>{
    if(!o.isMesh||o.isInstancedMesh||!o.visible) return;
    if(o.userData&&o.userData.noMerge) return;
    if(Array.isArray(o.material)||!o.material) return;
    if(o.material.transparent||o.material.isShaderMaterial||o.material.alphaTest>0) return;
    if(skipped(o)) return;
    const key=o.material.uuid+'|'+(o.castShadow?1:0)+(o.receiveShadow?1:0);
    if(!groups.has(key)) groups.set(key,{mat:o.material,cast:o.castShadow,receive:o.receiveShadow,list:[]});
    groups.get(key).list.push(o);
  });
  let mergedCount=0;
  for(const g of groups.values()){
    if(g.list.length<2) continue;
    let total=0, hasUV=true;
    const geos=[];
    for(const o of g.list){
      let geo=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();
      geo.applyMatrix4(o.matrixWorld);
      if(!geo.attributes.normal) geo.computeVertexNormals();
      if(!geo.attributes.uv) hasUV=false;
      geos.push(geo); total+=geo.attributes.position.count;
    }
    const pos=new Float32Array(total*3), nor=new Float32Array(total*3), uv=new Float32Array(total*2);
    let off=0;
    for(const geo of geos){
      const p=geo.attributes.position.array, n=geo.attributes.normal.array, u=geo.attributes.uv?geo.attributes.uv.array:null;
      pos.set(p,off*3); nor.set(n,off*3);
      if(u) uv.set(u,off*2);
      off+=geo.attributes.position.count;
      geo.dispose();
    }
    const mergedGeo=new THREE.BufferGeometry();
    mergedGeo.setAttribute('position',new THREE.BufferAttribute(pos,3));
    mergedGeo.setAttribute('normal',new THREE.BufferAttribute(nor,3));
    if(hasUV) mergedGeo.setAttribute('uv',new THREE.BufferAttribute(uv,2));
    mergedGeo.computeBoundingSphere(); mergedGeo.computeBoundingBox();
    const mesh=new THREE.Mesh(mergedGeo,g.mat); mesh.castShadow=g.cast; mesh.receiveShadow=g.receive; mesh.userData.merged=true;
    scene.add(mesh); mergedCount+=g.list.length;
    for(const o of g.list){ if(o.parent) o.parent.remove(o); }
  }
  return mergedCount;
};
H.box = function(w,h,d,mat,x,y,z,parent,cast=true,receive=true){
  const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), mat);
  m.position.set(x||0,y||0,z||0); m.castShadow=cast; m.receiveShadow=receive;
  if(parent) parent.add(m); return m;
};
H.cyl = function(rt,rb,h,seg,mat,x,y,z,parent,cast=true,receive=true){
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg,1), mat);
  m.position.set(x||0,y||0,z||0); m.castShadow=cast; m.receiveShadow=receive;
  if(parent) parent.add(m); return m;
};
H.sphere = function(r,mat,x,y,z,parent,seg=12,cast=true){
  const m = new THREE.Mesh(new THREE.SphereGeometry(r,seg,Math.max(6,seg*0.7|0)), mat);
  m.position.set(x||0,y||0,z||0); m.castShadow=cast; m.receiveShadow=true;
  if(parent) parent.add(m); return m;
};
H.plane = function(w,h,mat,x,y,z,parent){
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w,h), mat);
  m.position.set(x||0,y||0,z||0); m.castShadow=false; m.receiveShadow=true;
  if(parent) parent.add(m); return m;
};
H.outline = function(mesh, scale=1.018){
  if (!mesh || !mesh.geometry) return null;
  const o = new THREE.Mesh(mesh.geometry, H.outlineMat);
  o.scale.setScalar(scale); o.renderOrder = -1; o.castShadow=false; o.receiveShadow=false;
  mesh.add(o); return o;
};
H.bevelBoxGeometry = function(w,d,h,bevel){
  bevel = bevel === undefined ? .1 : bevel;
  const shape = new THREE.Shape();
  shape.moveTo(-w/2+bevel,-d/2);
  shape.lineTo(w/2-bevel,-d/2); shape.quadraticCurveTo(w/2,-d/2,w/2,-d/2+bevel);
  shape.lineTo(w/2,d/2-bevel); shape.quadraticCurveTo(w/2,d/2,w/2-bevel,d/2);
  shape.lineTo(-w/2+bevel,d/2); shape.quadraticCurveTo(-w/2,d/2,-w/2,d/2-bevel);
  shape.lineTo(-w/2,-d/2+bevel); shape.quadraticCurveTo(-w/2,-d/2,-w/2+bevel,-d/2);
  const g = new THREE.ExtrudeGeometry(shape, { depth:h-bevel*2, bevelEnabled:true, bevelSegments:2, steps:1, bevelSize:bevel, bevelThickness:bevel, curveSegments:4 });
  g.rotateX(-Math.PI/2); g.translate(0,h/2,0);
  return g;
};
H.taperedTube = function(pointArray, radiusArray, radial=7, mat, parent, cast=true){
  const points = pointArray.map(p=>new THREE.Vector3(p[0],p[1],p[2]));
  const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', .45);
  const segs = Math.max(10, (points.length-1)*5);
  const frames = curve.computeFrenetFrames(segs, false);
  const pos=[], norm=[], uv=[], idx=[];
  const rAt = t=>{
    const f = t*(radiusArray.length-1), i=Math.floor(f), k=f-i;
    return radiusArray[Math.min(i,radiusArray.length-1)]*(1-k) + radiusArray[Math.min(i+1,radiusArray.length-1)]*k;
  };
  for(let i=0;i<=segs;i++){
    const t=i/segs, p=curve.getPointAt(t), n=frames.normals[i], b=frames.binormals[i], r=rAt(t);
    for(let j=0;j<=radial;j++){
      const a=j/radial*Math.PI*2, sin=Math.sin(a), cos=Math.cos(a);
      const nx=cos*n.x+sin*b.x, ny=cos*n.y+sin*b.y, nz=cos*n.z+sin*b.z;
      pos.push(p.x+nx*r,p.y+ny*r,p.z+nz*r); norm.push(nx,ny,nz); uv.push(j/radial,t);
    }
  }
  for(let i=0;i<segs;i++) for(let j=0;j<radial;j++){
    const a=i*(radial+1)+j, b=a+radial+1, c=b+1, d=a+1;
    idx.push(a,b,d,b,c,d);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  g.setAttribute('normal',new THREE.Float32BufferAttribute(norm,3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  g.setIndex(idx);
  const m = new THREE.Mesh(g,mat); m.castShadow=cast; m.receiveShadow=true;
  if(parent) parent.add(m); return m;
};
H.ribbonGeometry = function(length,width,segs){
  const g = new THREE.PlaneGeometry(width,length,1,segs||12);
  g.translate(0,-length/2,0);
  return g;
};
H.blob = function(w,d,opacity,parent,x,z){
  const mat = new THREE.MeshBasicMaterial({ map:Sakura.Textures.shadow, transparent:true, opacity:opacity||.6, depthWrite:false, side:THREE.DoubleSide });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w,d),mat);
  m.rotation.x=-Math.PI/2; m.position.set(x||0,0.112,z||0); m.renderOrder=2;
  if(parent) parent.add(m); return m;
};
H.instanced = function(geo,mat,count,parent, cast=false, receive=true){
  const m = new THREE.InstancedMesh(geo,mat,count);
  m.castShadow=cast; m.receiveShadow=receive; m.frustumCulled=false;
  if(parent) parent.add(m); return m;
};
H.dummy = new THREE.Object3D();
H.color = function(hex){ return new THREE.Color(hex); };
Sakura.Helpers = H;
})();