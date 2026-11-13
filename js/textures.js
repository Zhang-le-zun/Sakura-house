(function(){
'use strict';
const Sakura = window.Sakura;
const T = {};
function canvas(w,h){ const c=document.createElement('canvas'); c.width=w; c.height=h; return c; }
function finish(c, opts={}){
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = opts.repeat ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
  if (opts.repeat) t.repeat.set(opts.repeat[0], opts.repeat[1]);
  t.anisotropy = 4;
  t.needsUpdate = true;
  return t;
}
function noise(ctx,w,h,rnd,alpha=0.06,size=1){
  const img = ctx.getImageData(0,0,w,h); const d = img.data;
  for(let i=0;i<d.length;i+=4){
    const n = (rnd()-0.5) * 255 * alpha;
    d[i]=Sakura.Util.clamp(d[i]+n,0,255); d[i+1]=Sakura.Util.clamp(d[i+1]+n,0,255); d[i+2]=Sakura.Util.clamp(d[i+2]+n,0,255);
  }
  ctx.putImageData(img,0,0);
}
function wood(base, dark, seed, opts={}){
  const w=512,h=512, c=canvas(w,h), x=c.getContext('2d'), rnd=Sakura.Util.seeded(seed);
  x.fillStyle=base; x.fillRect(0,0,w,h);
  for(let i=0;i<115;i++){
    const y = rnd()*h;
    x.beginPath();
    x.strokeStyle = i%5===0 ? dark : 'rgba(92,58,40,.17)';
    x.globalAlpha = 0.10 + rnd()*0.22;
    x.lineWidth = 0.45 + rnd()*1.6;
    x.moveTo(-20,y);
    for(let j=0;j<=8;j++){
      x.lineTo(j*w/8, y + Math.sin(j*1.3+i)* (2+rnd()*3.5) + (rnd()-0.5)*2);
    }
    x.stroke();
  }
  for(let i=0;i<7;i++){
    const cx=rnd()*w, cy=rnd()*h, rx=4+rnd()*10, ry=2+rnd()*5;
    x.save(); x.translate(cx,cy); x.rotate(rnd()*Math.PI);
    x.strokeStyle='rgba(82,49,34,.24)'; x.lineWidth=1;
    for(let k=0;k<4;k++){ x.beginPath(); x.ellipse(0,0,rx+k*3,ry+k*2,0,0,Math.PI*2); x.stroke(); }
    x.restore();
  }
  noise(x,w,h,rnd,0.055);
  return finish(c, {repeat: opts.repeat||[1,1]});
}
function plaster(seed, tone='#e8e1d2'){
  const w=512,h=512,c=canvas(w,h),x=c.getContext('2d'),rnd=Sakura.Util.seeded(seed);
  x.fillStyle=tone; x.fillRect(0,0,w,h);
  for(let i=0;i<70;i++){
    x.beginPath();
    x.fillStyle = rnd()>0.5 ? 'rgba(255,252,242,.045)' : 'rgba(110,108,94,.038)';
    x.ellipse(rnd()*w,rnd()*h,20+rnd()*100,14+rnd()*75,rnd()*Math.PI,0,Math.PI*2); x.fill();
  }
  for(let i=0;i<7;i++){
    x.beginPath(); x.strokeStyle='rgba(103,99,86,.075)'; x.lineWidth=.7;
    let px=rnd()*w, py=rnd()*h; x.moveTo(px,py);
    for(let k=0;k<6;k++){ px+= (rnd()-.5)*30; py+= (rnd()-.5)*22; x.lineTo(px,py); }
    x.stroke();
  }
  noise(x,w,h,rnd,0.05);
  return finish(c, {repeat:[2,2]});
}
function tatami(){
  const w=512,h=512,c=canvas(w,h),x=c.getContext('2d'),rnd=Sakura.Util.seeded(7319);
  x.fillStyle='#b6b78e'; x.fillRect(0,0,w,h);
  for(let y=0;y<h;y+=3){
    x.strokeStyle = y%9===0 ? 'rgba(91,93,63,.24)' : 'rgba(239,236,190,.16)';
    x.lineWidth=1; x.beginPath(); x.moveTo(0,y); x.lineTo(w,y); x.stroke();
  }
  for(let x0=0;x0<w;x0+=8){
    x.strokeStyle='rgba(87,88,57,.075)'; x.lineWidth=.7; x.beginPath(); x.moveTo(x0,0); x.lineTo(x0,h); x.stroke();
  }
  for(let i=0;i<100;i++){
    x.fillStyle='rgba(255,248,206,.16)'; x.fillRect(rnd()*w,rnd()*h,2,8+rnd()*18);
  }
  noise(x,w,h,rnd,0.025);
  return finish(c, {repeat:[2,2]});
}
function roofTexture(){
  const w=512,h=512,c=canvas(w,h),x=c.getContext('2d'),rnd=Sakura.Util.seeded(1123);
  x.fillStyle='#566d79'; x.fillRect(0,0,w,h);
  for(let y=0;y<h;y+=34){
    x.fillStyle='rgba(23,38,48,.20)'; x.fillRect(0,y,w,5);
    x.fillStyle='rgba(206,220,218,.055)'; x.fillRect(0,y+7,w,2);
    for(let xx=0;xx<w;xx+=22){
      const off=(Math.floor(y/34)%2)*11;
      x.strokeStyle='rgba(25,42,53,.18)'; x.lineWidth=1.1; x.beginPath(); x.moveTo(xx+off,y+5); x.lineTo(xx+off,y+34); x.stroke();
    }
  }
  for(let i=0;i<65;i++){ x.fillStyle='rgba(186,205,204,.05)'; x.fillRect(rnd()*w,rnd()*h,2+rnd()*20,1+rnd()*3); }
  noise(x,w,h,rnd,0.035);
  return finish(c, {repeat:[3,2]});
}
function washi(seed, tint='#f5f0e4'){
  const w=512,h=512,c=canvas(w,h),x=c.getContext('2d'),rnd=Sakura.Util.seeded(seed);
  x.fillStyle=tint; x.fillRect(0,0,w,h);
  for(let i=0;i<600;i++){
    const px=rnd()*w, py=rnd()*h, len=3+rnd()*22, a=rnd()*Math.PI;
    x.strokeStyle = rnd()>0.72 ? 'rgba(136,126,109,.06)' : 'rgba(255,255,250,.12)';
    x.lineWidth=0.5+rnd()*.7; x.beginPath(); x.moveTo(px,py); x.lineTo(px+Math.cos(a)*len,py+Math.sin(a)*len); x.stroke();
  }
  for(let i=0;i<55;i++){
    x.fillStyle='rgba(151,142,124,.04)'; x.beginPath(); x.ellipse(rnd()*w,rnd()*h,1+rnd()*7,1+rnd()*2,rnd()*Math.PI,0,Math.PI*2); x.fill();
  }
  noise(x,w,h,rnd,0.045);
  return finish(c, {repeat:[2,2]});
}
function stone(){
  const w=512,h=512,c=canvas(w,h),x=c.getContext('2d'),rnd=Sakura.Util.seeded(444);
  x.fillStyle='#8e8d84'; x.fillRect(0,0,w,h);
  for(let i=0;i<450;i++){
    x.fillStyle = rnd()>.5 ? 'rgba(52,54,50,.10)' : 'rgba(235,233,218,.10)';
    x.beginPath(); x.arc(rnd()*w,rnd()*h,1+rnd()*8,0,Math.PI*2); x.fill();
  }
  for(let i=0;i<28;i++){
    x.strokeStyle='rgba(58,61,58,.13)'; x.lineWidth=.8; x.beginPath();
    let px=rnd()*w,py=rnd()*h; x.moveTo(px,py);
    for(let k=0;k<4;k++){px+=(rnd()-.5)*48;py+=(rnd()-.5)*28;x.lineTo(px,py);} x.stroke();
  }
  for(let i=0;i<24;i++){
    x.fillStyle='rgba(100,113,68,.16)'; x.beginPath(); x.ellipse(rnd()*w,rnd()*h,2+rnd()*16,1+rnd()*5,rnd()*Math.PI,0,Math.PI*2); x.fill();
  }
  noise(x,w,h,rnd,0.06);
  return finish(c,{repeat:[1,1]});
}
function moss(){
  const w=256,h=256,c=canvas(w,h),x=c.getContext('2d'),rnd=Sakura.Util.seeded(949);
  x.fillStyle='#96a577'; x.fillRect(0,0,w,h);
  for(let i=0;i<900;i++){
    x.fillStyle = rnd()>.5 ? 'rgba(193,205,145,.18)' : 'rgba(65,84,49,.14)';
    x.beginPath(); x.arc(rnd()*w,rnd()*h,0.5+rnd()*3.2,0,Math.PI*2); x.fill();
  }
  return finish(c,{repeat:[2,2]});
}
function contactShadow(){
  const s=256,c=canvas(s,s),x=c.getContext('2d');
  const g=x.createRadialGradient(s/2,s/2,5,s/2,s/2,s/2);
  g.addColorStop(0,'rgba(32,38,33,.36)'); g.addColorStop(.42,'rgba(32,38,33,.20)'); g.addColorStop(.72,'rgba(32,38,33,.06)'); g.addColorStop(1,'rgba(32,38,33,0)');
  x.fillStyle=g; x.fillRect(0,0,s,s);
  return finish(c);
}
function petal(){
  const s=128,c=canvas(s,s),x=c.getContext('2d');
  x.clearRect(0,0,s,s);
  const g=x.createLinearGradient(0,20,0,112);
  g.addColorStop(0,'rgba(255,248,247,.98)'); g.addColorStop(.58,'rgba(248,220,223,.97)'); g.addColorStop(1,'rgba(224,174,185,.94)');
  x.fillStyle=g;
  x.beginPath();
  x.moveTo(64,8);
  x.bezierCurveTo(101,24,108,67,88,99);
  x.bezierCurveTo(78,114,62,121,64,124);
  x.bezierCurveTo(64,121,46,113,38,99);
  x.bezierCurveTo(17,68,27,25,64,8);
  x.closePath(); x.fill();
  x.globalCompositeOperation='destination-out';
  x.beginPath(); x.moveTo(64,15); x.lineTo(55,104); x.lineTo(64,111); x.lineTo(73,104); x.closePath(); x.fill();
  x.globalCompositeOperation='source-over';
  x.strokeStyle='rgba(196,132,148,.16)'; x.lineWidth=1.2; x.beginPath(); x.moveTo(64,23); x.lineTo(64,101); x.stroke();
  const t=finish(c); t.premultiplyAlpha=false; return t;
}
function leaf(){
  const s=128,c=canvas(s,s),x=c.getContext('2d');
  x.clearRect(0,0,s,s);
  const g=x.createLinearGradient(34,20,94,110); g.addColorStop(0,'#9cab71'); g.addColorStop(1,'#5e7549');
  x.fillStyle=g; x.beginPath(); x.moveTo(65,8); x.bezierCurveTo(106,38,100,92,64,118); x.bezierCurveTo(28,90,24,39,65,8); x.fill();
  x.strokeStyle='rgba(233,238,200,.28)'; x.lineWidth=1.3; x.beginPath(); x.moveTo(65,14); x.lineTo(65,108); x.stroke();
  for(let i=0;i<5;i++){x.beginPath();x.moveTo(65,32+i*14);x.lineTo(43-i*1.5,22+i*15);x.stroke();x.beginPath();x.moveTo(65,32+i*14);x.lineTo(87+i*1.5,22+i*15);x.stroke();}
  return finish(c);
}
function scrollPainting(){
  const w=256,h=512,c=canvas(w,h),x=c.getContext('2d'),rnd=Sakura.Util.seeded(627);
  x.fillStyle='#e9e3d3'; x.fillRect(0,0,w,h);
  const g=x.createLinearGradient(0,130,0,410); g.addColorStop(0,'rgba(126,146,130,.42)'); g.addColorStop(.55,'rgba(142,159,143,.24)'); g.addColorStop(1,'rgba(157,172,155,0)');
  x.fillStyle=g; x.beginPath(); x.moveTo(0,390); x.bezierCurveTo(48,330,76,370,112,310); x.bezierCurveTo(156,240,196,288,256,220); x.lineTo(256,512); x.lineTo(0,512); x.closePath(); x.fill();
  x.fillStyle='rgba(83,84,72,.40)';
  for(let i=0;i<7;i++){ const bx=40+rnd()*175, by=320+rnd()*90; x.beginPath(); x.arc(bx,by,1.5+rnd()*2.5,0,Math.PI*2); x.fill(); }
  x.strokeStyle='rgba(37,48,40,.68)'; x.lineWidth=1.5;
  x.beginPath(); x.moveTo(166,430); x.bezierCurveTo(146,360,185,306,170,248); x.bezierCurveTo(163,224,181,205,200,192); x.stroke();
  x.lineWidth=.8;
  for(let i=0;i<8;i++){ x.beginPath(); x.moveTo(170+i*1.3,370-i*21); x.quadraticCurveTo(153-i*2,350-i*24,142-i*4,340-i*25); x.stroke(); }
  x.fillStyle='rgba(64,73,63,.45)';
  for(let i=0;i<9;i++){x.beginPath();x.ellipse(139-rnd()*28,330+rnd()*36,3+rnd()*4,1.2+rnd()*1.5,rnd(),0,Math.PI*2);x.fill();}
  x.fillStyle='rgba(54,57,48,.50)';
  x.font='15px "Yu Mincho", serif'; x.textAlign='right'; x.fillText('春', 42, 98);
  x.fillStyle='rgba(163,72,63,.72)'; x.fillRect(31,420,26,26);
  x.fillStyle='rgba(248,240,224,.88)'; x.font='14px "Yu Mincho", serif'; x.textAlign='center'; x.fillText('和',44,438);
  return finish(c);
}
function silhouette(){
  const w=512,h=512,c=canvas(w,h),x=c.getContext('2d'),rnd=Sakura.Util.seeded(3012);
  x.clearRect(0,0,w,h);
  x.strokeStyle='rgba(72,77,77,.34)'; x.lineCap='round';
  function branch(x0,y0,ang,len,width,depth){
    if(depth<=0 || len<7) return;
    const x1=x0+Math.cos(ang)*len, y1=y0+Math.sin(ang)*len;
    x.lineWidth=width; x.beginPath(); x.moveTo(x0,y0); x.quadraticCurveTo(x0+Math.cos(ang-.25)*len*.55,y0+Math.sin(ang-.25)*len*.55,x1,y1); x.stroke();
    if(depth<4){
      for(let k=0;k<3;k++){
        x.fillStyle='rgba(216,177,184,'+(0.10+rnd()*.13)+')';
        x.beginPath(); x.arc(x1+(rnd()-.5)*18,y1+(rnd()-.5)*14,2+rnd()*4.5,0,Math.PI*2); x.fill();
      }
    }
    branch(x1,y1,ang-.24-rnd()*.26,len*(.65+rnd()*.14),width*.69,depth-1);
    branch(x1,y1,ang+.22+rnd()*.26,len*(.62+rnd()*.16),width*.65,depth-1);
  }
  branch(470,500,-2.52,98,10,7);
  branch(500,420,-2.0,80,7,6);
  const t=finish(c); t.minFilter=THREE.LinearFilter; return t;
}
function tag(text, color='#e4c6a5'){
  const w=128,h=160,c=canvas(w,h),x=c.getContext('2d');
  x.clearRect(0,0,w,h);
  x.fillStyle=color;
  x.beginPath(); x.moveTo(20,18); x.lineTo(108,18); x.lineTo(108,128); x.lineTo(64,150); x.lineTo(20,128); x.closePath(); x.fill();
  x.strokeStyle='rgba(92,57,40,.38)'; x.lineWidth=2; x.stroke();
  x.strokeStyle='rgba(84,49,34,.5)'; x.lineWidth=1.2; x.beginPath(); x.moveTo(64,18); x.lineTo(64,0); x.stroke();
  x.fillStyle='rgba(80,56,42,.74)'; x.font='30px "Yu Mincho", serif'; x.textAlign='center'; x.fillText(text,64,91);
  return finish(c);
}
function dapple(){
  const s=256,c=canvas(s,s),x=c.getContext('2d'),rnd=Sakura.Util.seeded(812);
  x.clearRect(0,0,s,s);
  for(let i=0;i<75;i++){
    const g=x.createRadialGradient(0,0,0,0,0,9+rnd()*22);
    g.addColorStop(0,'rgba(42,50,40,'+(0.06+rnd()*.12)+')'); g.addColorStop(1,'rgba(42,50,40,0)');
    x.save(); x.translate(rnd()*s,rnd()*s); x.fillStyle=g; x.beginPath(); x.arc(0,0,30,0,Math.PI*2); x.fill(); x.restore();
  }
  return finish(c);
}
function waterCaustic(){
  const s=256,c=canvas(s,s),x=c.getContext('2d');
  x.fillStyle='rgba(255,255,255,0)'; x.fillRect(0,0,s,s);
  x.strokeStyle='rgba(230,248,236,.14)'; x.lineWidth=2;
  for(let i=0;i<16;i++){
    x.beginPath();
    for(let j=0;j<=32;j++){
      const px=j/32*s, py=i/16*s+Math.sin(j*.6+i)*8+Math.sin(j*.17+i*2)*4;
      if(j===0)x.moveTo(px,py);else x.lineTo(px,py);
    }
    x.stroke();
  }
  return finish(c,{repeat:[2,2]});
}
T.init = function(){
  T.wood = wood('#9a6e4d','#5d3e2d',72,{repeat:[1,2]});
  T.woodDark = wood('#6a4935','#3c2a20',912,{repeat:[1,1]});
  T.woodLight = wood('#b58c68','#7b593f',444,{repeat:[1,1]});
  T.plaster = plaster(821);
  T.tatami = tatami();
  T.roof = roofTexture();
  T.washi = washi(553);
  T.washiWarm = washi(912,'#f0e7d5');
  T.stone = stone();
  T.moss = moss();
  T.shadow = contactShadow();
  T.petal = petal();
  T.leaf = leaf();
  T.scroll = scrollPainting();
  T.silhouette = silhouette();
  T.dapple = dapple();
  T.caustic = waterCaustic();
  T.tag = tag('花');
  T.tag2 = tag('春','#dfbfba');
  return T;
};
Sakura.Textures = T;
})();