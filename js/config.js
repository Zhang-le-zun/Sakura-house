(function(){
'use strict';
const Sakura = window.Sakura = window.Sakura || {};
const C = {
  version: '1.0.0',
  base: { size: 16.0, height: 0.62, top: 0.0 },
  camera: { fov: 34, near: 0.1, far: 120, target: [0, 2.9, 0], radius: 33.2, azimuth: 0.52, polar: 1.15, minRadius: 14, maxRadius: 55, minPolar: 0.68, maxPolar: 1.34 },
  house: { x: -0.5, z: -2.15, w: 8.6, d: 5.8, wallH: 3.55, floorH: 0.68, ridgeH: 7.05, edge: 1.15 },
  water: { level: -0.07, bed: -0.34, z: 3.55, width: 1.55, amplitude: 0.72 },
  quality: { desktop: { dpr: 2, shadow: 2048, reflect: 512, petals: 420, blossoms: 65000 }, mobile: { dpr: 1.5, shadow: 1024, reflect: 256, petals: 240, blossoms: 16000 } },
  colors: {
    paper: 0xf4efe3, plaster: 0xe8e1d2, roof: 0x5c7480, wood: 0x94694a,
    woodDark: 0x674735, petal: 0xefd3d5, petalDeep: 0xd9a8b7, petalPale: 0xfff6f4,
    water: 0x79ada6, moss: 0x7d8b5d, stone: 0x8c8b81, ink: 0x1b2a38,
    rose: 0xc98b93, linen: 0xd8cdbb, gold: 0xd6a76d
  }
};
Sakura.CONFIG = C;
Sakura.Util = Sakura.Util || {};
Sakura.Util.clamp = (v,a,b)=>Math.max(a,Math.min(b,v));
Sakura.Util.lerp = (a,b,t)=>a+(b-a)*t;
Sakura.Util.smooth = t=>t*t*(3-2*t);
Sakura.Util.seeded = function(seed){
  let s = seed >>> 0;
  return function(){ s = (s*1664525 + 1013904223) >>> 0; return s/4294967296; };
};
Sakura.Util.color = hex=>new THREE.Color(hex);
Sakura.Util.matColor = (hex, emissive)=>{
  const c = new THREE.Color(hex);
  if (emissive !== undefined && emissive !== null) c.offsetHSL(0,0,emissive);
  return c;
};
Sakura.Util.easeOut = t=>1-Math.pow(1-t,3);
Sakura.Util.easeInOut = t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
})();