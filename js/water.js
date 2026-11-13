(function(){
'use strict';
const Sakura = window.Sakura;
const C = Sakura.CONFIG, H = Sakura.Helpers, T = Sakura.Textures, U = Sakura.Util, S = Sakura.Stream;
function waterGeometry(){
  const xs=100, zs=10, pos=[], uv=[], idx=[];
  for(let i=0;i<=xs;i++){
    const x=U.lerp(-7.92,7.92,i/xs);
    const c=S.center(x), hw=S.half(x)*.99;
    for(let j=0;j<=zs;j++){
      const t=j/zs-.5, z=c+t*hw*1.95;
      const y=S.waterY;
      pos.push(x,y,z); uv.push((x+8)/16,(z+8)/16);
    }
  }
  for(let i=0;i<xs;i++) for(let j=0;j<zs;j++){
    const a=i*(zs+1)+j,b=a+zs+1,c=b+1,d=a+1; idx.push(a,b,d,b,c,d);
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2)); g.setIndex(idx); g.computeVertexNormals(); return g;
}
function fishShape(){
  const g=new THREE.SphereGeometry(1,14,10);
  const p=g.attributes.position;
  for(let i=0;i<p.count;i++){
    const z=p.getZ(i), taper=Math.pow(Math.max(0,1-Math.abs(z)*.75),.55);
    p.setX(i,p.getX(i)*taper); p.setY(i,p.getY(i)*taper);
  }
  g.computeVertexNormals(); return g;
}
function finGeometry(){
  const shape=new THREE.Shape(); shape.moveTo(0,0); shape.bezierCurveTo(.18,.14,.30,.18,.40,.05); shape.bezierCurveTo(.32,-.02,.12,-.08,0,0);
  return new THREE.ShapeGeometry(shape);
}
function koiBodyGeometry(){
  const s=new THREE.Shape();
  s.moveTo(0,.34);
  s.bezierCurveTo(.085,.29,.105,.10,.058,-.13);
  s.lineTo(.030,-.28); s.lineTo(0,-.33); s.lineTo(-.030,-.28);
  s.bezierCurveTo(-.105,.10,-.085,.29,0,.34);
  const g=new THREE.ExtrudeGeometry(s,{depth:.022,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.006,bevelThickness:.006,curveSegments:10});
  g.rotateX(Math.PI/2); g.translate(0,.022,0);
  return g;
}
function koiTailGeometry(){
  const s=new THREE.Shape();
  s.moveTo(0,0);
  s.bezierCurveTo(.05,-.08,.15,-.22,.20,-.28);
  s.lineTo(.06,-.24); s.lineTo(0,-.16); s.lineTo(-.06,-.24); s.lineTo(-.20,-.28);
  s.bezierCurveTo(-.15,-.22,-.05,-.08,0,0);
  const g=new THREE.ShapeGeometry(s); g.rotateX(Math.PI/2); return g;
}
function buildKoi(parent){
  const group=new THREE.Group(); group.name='koi'; group.userData.dynamic=true; parent.add(group);
  const fishes=[]; const rnd=U.seeded(8102);
  const colors=[[0xf0e3ce,0xbe4c3c],[0xf1d6b3,0xd77a2f],[0xd8d2c7,0x455159],[0xf4ead7,0xc96f6a],[0xead9c5,0xd86b3e]];
  for(let i=0;i<5;i++){
    const fg=new THREE.Group(); group.add(fg);
    const bodyMat=H.standard(colors[i][0],{roughness:.66,metalness:.02,emissive:colors[i][0],emissiveIntensity:.09});
    const spotMat=H.standard(colors[i][1],{roughness:.7,emissive:colors[i][1],emissiveIntensity:.02});
    const bodyGeo=koiBodyGeometry();
    const body=new THREE.Mesh(bodyGeo,bodyMat); body.castShadow=false; body.receiveShadow=false; fg.add(body);
    const rim=new THREE.Mesh(bodyGeo,new THREE.MeshBasicMaterial({color:0x5a473b,side:THREE.BackSide})); rim.scale.set(1.055,1.02,1.045); rim.position.y=-.001; fg.add(rim);
    // warm patches lie on the top of the koi so they read from the three-quarter view
    for(let k=0;k<3;k++){
      const spot=H.sphere(.05,spotMat,(rnd()-.5)*.075,.020,(rnd()-.5)*.27,fg,8,false);
      spot.scale.set(1.10,.07,.70);
    }
    H.sphere(.013,H.standard(0x2f2a24,{roughness:.9}),-.035,.020,.26,fg,5,false);
    H.sphere(.013,H.standard(0x2f2a24,{roughness:.9}),.035,.020,.26,fg,5,false);
    const tailPivot=new THREE.Group(); tailPivot.position.set(0,0,-.27); fg.add(tailPivot);
    const finMat=new THREE.MeshStandardMaterial({color:colors[i][0],roughness:.82,transparent:true,opacity:.88,side:THREE.DoubleSide,emissive:colors[i][0],emissiveIntensity:.03});
    const tail=new THREE.Mesh(koiTailGeometry(),finMat); tail.position.y=.020; tailPivot.add(tail);
    for(const s of [-1,1]){
      const pec=new THREE.Mesh(new THREE.PlaneGeometry(.16,.09),finMat); pec.rotation.x=-Math.PI/2; pec.rotation.z=s*.48; pec.position.set(s*.075,.017,.02); fg.add(pec);
    }
    const wakeMat=new THREE.MeshBasicMaterial({color:0xf2f5e8,transparent:true,opacity:.14,depthWrite:false,side:THREE.DoubleSide});
    const wake=new THREE.Mesh(new THREE.RingGeometry(.16,.20,28),wakeMat); wake.rotation.x=-Math.PI/2; wake.position.y=.026; fg.add(wake);
    fg.position.set(0,.068,0); fg.scale.setScalar(.98+rnd()*.10);
    const lane=[{start:-5.5,range:9.4,speed:.20},{start:-4.8,range:8.2,speed:.26},{start:-5.5,range:9.4,speed:.18},{start:.2,range:3.1,speed:.12},{start:-1.2,range:4.8,speed:.16}][i];
    fishes.push({group:fg,tail:tailPivot,speed:lane.speed,offset:rnd()*20,start:lane.start,range:lane.range,zig:rnd()*Math.PI*2});
  }
  return {group,fishes};
}
function buildRipples(parent){
  const pool=[]; const mat=new THREE.MeshBasicMaterial({color:0xf2f5e9,transparent:true,opacity:.32,side:THREE.DoubleSide,depthWrite:false});
  for(let i=0;i<10;i++){
    const m=new THREE.Mesh(new THREE.RingGeometry(.08,.10,40),mat.clone()); m.rotation.x=-Math.PI/2; m.visible=false; m.position.y=S.waterY+.006; m.renderOrder=8; parent.add(m); pool.push(m);
  }
  return pool;
}
function buildFloatingPetals(parent){
  const geo=new THREE.PlaneGeometry(.075,.11);
  const mat=new THREE.MeshBasicMaterial({map:T.petal,transparent:true,alphaTest:.18,side:THREE.DoubleSide,depthWrite:false,color:0xf3d8dc});
  const count=72, mesh=new THREE.InstancedMesh(geo,mat,count); mesh.renderOrder=7; mesh.frustumCulled=false; parent.add(mesh);
  const data=[]; const rnd=U.seeded(3321);
  for(let i=0;i<count;i++) data.push({x:-7.3+rnd()*14.6,speed:.12+rnd()*.24,phase:rnd()*10,scale:.55+rnd()*.85,rot:rnd()*Math.PI});
  return {mesh,data,count};
}
function build(scene){
  const group=new THREE.Group(); group.name='water'; scene.add(group);
  const geo=waterGeometry();
  const reflectRT=new THREE.WebGLRenderTarget(512,512,{minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,format:THREE.RGBAFormat});
  reflectRT.texture.colorSpace=THREE.SRGBColorSpace;
  reflectRT.texture.generateMipmaps=false;
  const reflCam=new THREE.PerspectiveCamera(32,1,.1,100);
  const textureMatrix=new THREE.Matrix4();
  const uniforms={
    uTime:{value:0}, tReflect:{value:reflectRT.texture}, textureMatrix:{value:textureMatrix},
    uShallow:{value:new THREE.Color(0x9fcac2)}, uDeep:{value:new THREE.Color(0x4c8e8d)},
    uSky:{value:new THREE.Color(0xdfeae5)}, uSun:{value:new THREE.Color(0xffedc8)},
    uSunDir:{value:new THREE.Vector3(-.6,.4,.5).normalize()}, uReflectivity:{value:.58},
    uGlow:{value:.2}, uNight:{value:0}, uLampStrength:{value:0}, uLampColor:{value:new THREE.Color(0xffc27a)}, uLampA:{value:new THREE.Vector2(-1.55,5.55)}, uLampB:{value:new THREE.Vector2(5.68,5.25)}
  };
  const vert=`
    uniform mat4 textureMatrix;
    uniform float uTime;
    varying vec3 vWorld;
    varying vec2 vUv;
    varying vec4 vReflect;
    void main(){
      vec3 p = position;
      float w = sin(p.x*2.1 + uTime*.85)*.004 + sin(p.z*4.6 - uTime*1.25)*.003;
      p.y += w;
      vec4 world = modelMatrix * vec4(p,1.0);
      vWorld = world.xyz; vUv = uv;
      vReflect = textureMatrix * world;
      gl_Position = projectionMatrix * viewMatrix * world;
    }`;
  const frag=`
    uniform sampler2D tReflect;
    uniform float uTime, uReflectivity, uGlow, uNight;
    uniform vec3 uShallow, uDeep, uSky, uSun, uSunDir, uLampColor;
    uniform vec2 uLampA, uLampB;
    uniform float uLampStrength;
    varying vec3 vWorld;
    varying vec2 vUv;
    varying vec4 vReflect;
    float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
    void main(){
      vec2 p = vWorld.xz;
      float dx = sin(p.x*2.45 + p.y*1.8 + uTime*.75)*.022 + sin(p.x*5.2 - p.y*3.1 - uTime*1.5)*.008;
      float dz = cos(p.x*1.7 - p.y*2.9 - uTime*.62)*.018 + cos(p.x*4.1 + p.y*6.0 + uTime*1.2)*.006;
      vec3 n = normalize(vec3(-dx,1.0,-dz));
      vec3 viewDir = normalize(cameraPosition - vWorld);
      float fres = pow(1.0 - max(dot(n,viewDir),0.0), 2.0);
      vec2 ruv = vReflect.xy / max(.0001,vReflect.w);
      ruv += n.xz * .055 + vec2(sin(p.x*8.0+uTime*.4), cos(p.y*7.0-uTime*.5))*.0025;
      vec3 refl = texture2D(tReflect, ruv).rgb;
      vec3 base = mix(uDeep, uShallow, .46 + .24*sin(p.x*.24+p.y*.12));
      vec3 col = mix(base, refl, clamp(.22 + fres*.58,0.0,.86)*uReflectivity);
      vec3 halfDir = normalize(uSunDir + viewDir);
      float spec = pow(max(dot(n,halfDir),0.0), 110.0);
      col += uSun * spec * (1.8 + uNight*.5);
      float fleck = pow(max(0.0, sin(p.x*7.7+uTime*.45)*sin(p.y*8.9-uTime*.7)), 18.0);
      col += uSun * fleck * uGlow * .42;
      float dl = smoothstep(2.4,.0,length(p-uLampA)) + smoothstep(2.4,.0,length(p-uLampB));
      col += uLampColor * dl * uLampStrength * (.05 + fleck*.55);
      float shore = smoothstep(.02,.11,abs(p.y - uDeep.g*.0));
      col += uSky * shore * 0.0;
      float alpha = .38 + fres*.14;
      gl_FragColor = vec4(col, alpha);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }`;
  const mat=new THREE.ShaderMaterial({uniforms,vertexShader:vert,fragmentShader:frag,transparent:true,depthWrite:false,side:THREE.DoubleSide});
  const bridgeShade=new THREE.Mesh(new THREE.PlaneGeometry(1.55,3.35),new THREE.MeshBasicMaterial({color:0x183235,transparent:true,opacity:.16,depthWrite:false}));
  bridgeShade.rotation.x=-Math.PI/2; bridgeShade.position.set(2.3,S.waterY+.004,3.95); bridgeShade.renderOrder=6; group.add(bridgeShade);
  const mesh=new THREE.Mesh(geo,mat); mesh.position.y=0; mesh.renderOrder=5; mesh.userData.click='water'; group.add(mesh);
  // riverbed pebbles
  const pebbles=new THREE.Group(); group.add(pebbles);
  const stoneMat=H.standard(0x7f887f,{roughness:.96,map:T.stone});
  const warmStone=H.standard(0x9b886d,{roughness:.96,map:T.stone});
  const rnd=U.seeded(4419);
  for(let i=0;i<62;i++){
    const x=-7.4+rnd()*14.8, c=S.center(x), hw=S.half(x);
    const z=c+(rnd()-.5)*hw*1.55;
    const rr=.045+rnd()*.16;
    const p=new THREE.Mesh(new THREE.DodecahedronGeometry(rr,0),rnd()>.8?warmStone:stoneMat);
    p.position.set(x,S.bedY+rr*.25,z); p.scale.set(1.1+rnd()*.6,.40+rnd()*.25,.8+rnd()*.6); p.rotation.set(rnd(),rnd(),rnd());
    p.castShadow=false; p.receiveShadow=true; pebbles.add(p);
  }
  // a few submerged grasses
  const wgrass=H.standard(0x6f936e,{roughness:1,side:THREE.DoubleSide});
  for(let i=0;i<16;i++){
    const x=-6.7+rnd()*13.4, c=S.center(x), z=c+(rnd()-.5)*S.half(x)*1.2;
    const b=new THREE.Mesh(new THREE.PlaneGeometry(.025,.35+rnd()*.4),wgrass); b.position.set(x,S.bedY+.20,z); b.rotation.set(.15,rnd()*Math.PI,.3); pebbles.add(b);
  }
  // caustic shimmer overlay
  const causticMat=new THREE.MeshBasicMaterial({map:T.caustic,transparent:true,opacity:.14,depthWrite:false,blending:THREE.AdditiveBlending,color:0xd5f2de});
  const caustic=new THREE.Mesh(geo.clone(),causticMat); caustic.position.y=.047; caustic.renderOrder=2; group.add(caustic);
  // koi
  const koi=buildKoi(group);
  // ripples, floating petals
  const ripplePool=buildRipples(group);
  const floating=buildFloatingPetals(group);
  const pickables=[mesh];
  let ripIdx=0, lastAmbient=0;
  function spawnRipple(x,z,strength){
    if(!isFinite(x)||!isFinite(z)) return;
    const rp=ripplePool[ripIdx++%ripplePool.length];
    rp.position.set(x,S.waterY+.012,z); rp.visible=true; rp.userData={t:0,strength:strength||1}; rp.scale.setScalar(.55); rp.material.opacity=.34;
  }
  function update(dt,time,hour,core){
    uniforms.uTime.value=time;
    causticMat.map.offset.set(time*.017, -time*.013);
    for(const rp of ripplePool){
      if(!rp.visible) continue;
      rp.userData.t+=dt;
      const t=rp.userData.t;
      rp.scale.setScalar(.55+t*(2.2+rp.userData.strength*.8));
      rp.material.opacity=Math.max(0,.32*(1-t/2.4));
      if(t>2.4){rp.visible=false;}
    }
    // ambient ripples from the current, sparse
    if(time-lastAmbient>1.15){
      lastAmbient=time;
      const x=-6.5+Math.random()*13, z=S.center(x)+(Math.random()-.5)*S.half(x)*1.1;
      spawnRipple(x,z,.35);
    }
    for(const f of koi.fishes){
      const x=f.start+((time*f.speed+f.offset)%f.range);
      const c=S.center(x), hw=S.half(x);
      const z=c+Math.sin(x*1.7+f.zig+time*.7)*hw*.35;
      const x2=x+.06, c2=S.center(x2), hw2=S.half(x2);
      const z2=c2+Math.sin(x2*1.7+f.zig+time*.7)*hw2*.35;
      const ang=Math.atan2(x2-x,z2-z);
      f.group.position.set(x,.068,z); f.group.rotation.y=ang;
      f.group.rotation.z=Math.sin(time*1.9+f.zig)*.035;
      f.tail.rotation.y=Math.sin(time*7.2+f.zig)*.55;
    }
    // floating petals
    const d=H.dummy;
    for(let i=0;i<floating.count;i++){
      const fp=floating.data[i];
      fp.x += dt*fp.speed;
      if(fp.x>7.55){fp.x=-7.55; fp.phase+=1.7;}
      const c=S.center(fp.x), hw=S.half(fp.x);
      const z=c+Math.sin(fp.x*.8+fp.phase+time*.18)*hw*.58;
      d.position.set(fp.x,S.waterY+.016,z); d.rotation.set(-Math.PI/2,Math.sin(time*.3+fp.phase)*.3,fp.rot+time*.12);
      d.scale.setScalar(fp.scale); d.updateMatrix(); floating.mesh.setMatrixAt(i,d.matrix);
    }
    floating.mesh.instanceMatrix.needsUpdate=true;
    // reflection camera and pass
    if(core && core.renderer){
      if(!core._waterReflectFrame) core._waterReflectFrame=0;
      core._waterReflectFrame++;
      const interval=(core.quality.name==='mobile')?3:2;
      if(core._waterReflectFrame%interval===0){
        const cam=core.camera, target=core.target;
        reflCam.position.set(cam.position.x, 2*S.waterY-cam.position.y, cam.position.z);
        reflCam.up.set(0,-1,0);
        reflCam.lookAt(target.x, 2*S.waterY-target.y, target.z);
        reflCam.fov=cam.fov; reflCam.aspect=cam.aspect; reflCam.near=cam.near; reflCam.far=cam.far; reflCam.updateProjectionMatrix();
        textureMatrix.set(.5,0,0,.5, 0,.5,0,.5, 0,0,.5,.5, 0,0,0,1);
        textureMatrix.multiply(reflCam.projectionMatrix);
        textureMatrix.multiply(reflCam.matrixWorldInverse);
        const rtSize=core.quality.reflect||512;
        if(reflectRT.width!==rtSize){ reflectRT.setSize(rtSize,rtSize); }
        const prevTarget=core.renderer.getRenderTarget();
        const prevClip=core.renderer.clippingPlanes;
        const prevClear=core.renderer.getClearColor(new THREE.Color());
        const prevAlpha=core.renderer.getClearAlpha();
        mesh.visible=false; caustic.visible=false; koi.group.visible=false;
        core.renderer.clippingPlanes=[new THREE.Plane(new THREE.Vector3(0,1,0),-S.waterY-.001)];
        core.renderer.setClearColor(uniforms.uSky.value,1);
        core.renderer.setRenderTarget(reflectRT);
        core.renderer.clear();
        core.renderer.render(core.scene,reflCam);
        core.renderer.setRenderTarget(prevTarget);
        core.renderer.clippingPlanes=prevClip;
        core.renderer.setClearColor(prevClear,prevAlpha);
        mesh.visible=true; caustic.visible=true; koi.group.visible=true;
      }
    }
  }
  function setPalette(p){
    uniforms.uShallow.value.set(p.waterShallow);
    uniforms.uDeep.value.set(p.waterDeep);
    uniforms.uSky.value.set(p.skyReflect);
    uniforms.uSun.value.set(p.waterSun);
    uniforms.uSunDir.value.copy(p.sunDir).normalize();
    uniforms.uReflectivity.value=p.reflect;
    uniforms.uGlow.value=p.glow;
    uniforms.uNight.value=p.night;
    uniforms.uLampStrength.value=p.lamp;
  }
  return {group,mesh,pickables,spawnRipple,setPalette,update,koi,uniforms,reflectRT,reflCam,textureMatrix,
    get stats(){return {ripples:ripplePool.length,petals:floating.count,koi:koi.fishes.length};}
  };
}
Sakura.Water={build};
})();