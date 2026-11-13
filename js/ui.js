(function(){
'use strict';
const Sakura=window.Sakura;
const UI={};
UI.init=function(core,handlers){
  const $=s=>document.querySelector(s);
  const $$=s=>Array.from(document.querySelectorAll(s));
  const slider=$('#timeSlider'), buttons=$$('.time-btn'), timeNow=$('#timeNow'), phase=$('#timePhase'), sunDot=$('.slider-sun');
  const pureBtn=$('#pureBtn'), exitPure=$('#exitPure'), hint=$('#hint');
  let hintDismissed=false;
  function phaseFor(h){ if(h<10) return '清晨'; if(h<16) return '白昼'; if(h<20) return '黄昏'; return '夜晚'; }
  function sync(hour){
    const h=Math.round(hour*60);
    const hh=Math.floor(h/60), mm=h%60;
    timeNow.textContent=String(hh).padStart(2,'0')+':'+String(mm).padStart(2,'0');
    phase.textContent=phaseFor(hour);
    if(document.activeElement!==slider) slider.value=hour.toFixed(2);
    if(sunDot) sunDot.style.left=(((hour-6.5)/17)*100)+'%';
    let found=false;
    for(const b of buttons){
      const bh=parseFloat(b.dataset.hour);
      const active=Math.abs(hour-bh)<.12;
      b.classList.toggle('is-active',active);
      b.setAttribute('aria-pressed',active?'true':'false');
      if(active) found=true;
    }
  }
  function setHour(h,fromButton){
    core.setHour(h,false);
    sync(h);
    if(fromButton){
      const b=buttons.find(x=>Math.abs(parseFloat(x.dataset.hour)-h)<.01);
      if(b) b.focus({preventScroll:true});
    }
  }
  buttons.forEach(b=>b.addEventListener('click',()=>setHour(parseFloat(b.dataset.hour),true)));
  slider.addEventListener('input',()=>{ const h=parseFloat(slider.value); core.hourTween=null; core.hour=h; core.targetHour=h; core._applyHour?.(); sync(h); });
  function hideHint(){ if(hintDismissed)return; hintDismissed=true; hint.classList.add('is-hidden'); }
  const canvas=core.canvas;
  canvas.addEventListener('pointerdown',hideHint,{passive:true});
  canvas.addEventListener('wheel',hideHint,{passive:true});
  setTimeout(hideHint,9000);
  function setPure(on){
    document.body.classList.toggle('is-pure',on);
    pureBtn.setAttribute('aria-pressed',on?'true':'false');
    if(on) exitPure.focus({preventScroll:true});
    else pureBtn.focus({preventScroll:true});
  }
  pureBtn.addEventListener('click',()=>setPure(true));
  exitPure.addEventListener('click',()=>setPure(false));
  window.addEventListener('keydown',e=>{
    if(e.key==='Escape' && document.body.classList.contains('is-pure')) setPure(false);
  });
  sync(core.hour);
  return {
    sync,
    setPure,
    flash(text){
      if(hintDismissed){ hint.classList.remove('is-hidden'); hintDismissed=false; }
      const desk=hint.querySelector('.hint-desktop'), mob=hint.querySelector('.hint-mobile');
      if(desk) desk.textContent=text; if(mob) mob.textContent=text;
      clearTimeout(this._t); this._t=setTimeout(hideHint,1800);
    }
  };
};
Sakura.UI=UI;
})();