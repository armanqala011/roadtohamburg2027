(function(){
  var W=window.RTH_WEEKS;
  var T=window.RTH_I18N;
  var DAY=864e5, start=Date.UTC(2026,9,19), raceD=Date.UTC(2027,5,6);
  var nowD=new Date(), today=Date.UTC(nowD.getFullYear(),nowD.getMonth(),nowD.getDate());
  var days=Math.round((raceD-today)/DAY);
  var cur=Math.floor((today-start)/DAY/7)+1;
  var inPlan=cur>=1&&cur<=33;
  function fmtH(h){var m=Math.round(h*60);return Math.floor(m/60)+':'+String(m%60).padStart(2,'0');}
  function dstr(d,t){return d[2]+' '+t.months[d[1]]+' '+d[0];}

  function render(root,lang){
    var t=T[lang], q=function(c){return root.querySelector('.'+c);};
    q('js-days').textContent = days>0 ? days : (days===0 ? t.race : t.done);
    function setNow(w){
      q('js-nowWk').textContent=w[0];
      q('js-nowPhase').textContent=t.ph[w[2]]+' · '+t.weekOf+' '+dstr(w[1],t);
      q('js-nowFocus').textContent=lang==='ru'?w[10]:w[9];
      var c=q('js-nowChips'); c.innerHTML='';
      [[t.total,fmtH(w[3])],[t.run,fmtH(w[6])],[t.bike,fmtH(w[5])],[t.swim,w[4]?fmtH(w[4]):t.none],[t.lrun,w[8]],[t.lride,w[7]]].forEach(function(p){
        var s=document.createElement('span');s.className='chip';s.textContent=p[0]+' '+p[1];c.appendChild(s);});
    }
    if(inPlan){setNow(W[cur-1]); if(cur===3) q('js-nowNote').textContent=t.cold;}
    else if(cur<1){setNow(W[0]);}
    else {q('js-nowWk').textContent='✓';q('js-nowPhase').textContent=t.raceDone;q('js-nowFocus').textContent=t.finished;}
    root.querySelectorAll('.js-phaseBody tr').forEach(function(r){
      var a=+r.dataset.from,b=+r.dataset.to;
      if(inPlan&&cur>b) r.classList.add('past');
      if(inPlan&&cur>=a&&cur<=b) r.classList.add('cur');
    });
    // Chart
    var svg=q('js-chart'), NS='http://www.w3.org/2000/svg';
    var L=34,R=8,Tp=34,B=56,Wd=900,H=330,pw=Wd-L-R,ph=H-Tp-B,max=16,n=W.length,slot=pw/n,bw=slot*0.68;
    function el(tag,a,p){var e=document.createElementNS(NS,tag);for(var k in a)e.setAttribute(k,a[k]);(p||svg).appendChild(e);return e;}
    function y(v){return Tp+ph-v/max*ph;}
    [0,4,8,12,16].forEach(function(v){el('line',{x1:L,x2:Wd-R,y1:y(v),y2:y(v),'class':'grid'});var tx=el('text',{x:L-6,y:y(v)+3,'text-anchor':'end'});tx.textContent=v+t.h;});
    [[1,1],[2,18],[19,19],[20,23],[24,28],[29,31],[32,33]].forEach(function(p,i){
      var x1=L+(p[0]-1)*slot,x2=L+p[1]*slot;
      el('rect',{x:x1+1,y:H-B+22,width:x2-x1-2,height:3,fill:'var(--fg)',opacity:i%2?0.35:0.8});
      if(t.bands[i]){var tx=el('text',{x:(x1+x2)/2,y:H-B+40,'text-anchor':'middle','class':'phase-label'});tx.textContent=t.bands[i];}
    });
    var cols=[['var(--swim)',4],['var(--bike)',5],['var(--run)',6]], tip=q('js-tip'), groups=[];
    function showTip(w){tip.innerHTML='';var b=document.createElement('b');b.textContent=t.week+' '+w[0]+' · '+dstr(w[1],t);tip.appendChild(b);
      tip.appendChild(document.createTextNode(' · '+t.ph[w[2]]+' · '+fmtH(w[3])+' '+t.h));tip.appendChild(document.createElement('br'));
      tip.appendChild(document.createTextNode(lang==='ru'?w[10]:w[9]));}
    function focus(i){groups.forEach(function(g,j){g.querySelectorAll('rect.bar').forEach(function(r){r.style.opacity=(j===i?1:0.4)});});showTip(W[i]);}
    W.forEach(function(w,i){
      var g=el('g',{tabindex:0,role:'button','aria-label':t.ariaWeek(w[0],w[3],lang==='ru'?w[10]:w[9])});
      var x=L+i*slot+(slot-bw)/2,base=0;
      cols.forEach(function(c){var v=w[c[1]];if(v>0)el('rect',{x:x,y:y(base+v),width:bw,height:y(base)-y(base+v),fill:c[0],'class':'bar'},g);base+=v;});
      if(w[3]-base>0.01) el('rect',{x:x,y:y(w[3]),width:bw,height:y(base)-y(w[3]),fill:'var(--other)','class':'bar'},g);
      el('rect',{x:L+i*slot,y:Tp,width:slot,height:ph,fill:'transparent'},g);
      if(w[0]%4===1||w[0]===33){var tx=el('text',{x:L+i*slot+slot/2,y:H-B+14,'text-anchor':'middle'});tx.textContent=w[0];}
      ['mouseenter','focus','click'].forEach(function(ev){g.addEventListener(ev,function(){focus(i)});});
      groups.push(g);
    });
    svg.addEventListener('mouseleave',function(){groups.forEach(function(g){g.querySelectorAll('rect.bar').forEach(function(r){r.style.opacity=1})});showTip(W[inPlan?cur-1:0]);});
    [[18,0],[22,1],[33,2]].forEach(function(e){
      var cx=L+(e[0]-0.5)*slot,g=el('g',{'class':'ev'});
      el('line',{x1:cx,x2:cx,y1:Tp-12,y2:y(W[e[0]-1][3])-2},g);
      var tx=el('text',{x:cx,y:Tp-16,'text-anchor':e[0]===33?'end':'middle'},g);tx.textContent=t.events[e[1]];
    });
    if(inPlan){
      var cx=L+(cur-1)*slot+slot/2;
      el('path',{d:'M'+(cx-5)+' '+(H-B+3)+' L'+(cx+5)+' '+(H-B+3)+' L'+cx+' '+(H-B-4)+' Z',fill:'var(--accent)'});
      var tx=el('text',{x:cx+8,y:H-B+3});tx.style.fill='var(--accent)';tx.textContent=t.now;
    }
    showTip(W[inPlan?cur-1:0]);
  }
  document.querySelectorAll('.wrap[data-lang]').forEach(function(r){render(r,r.dataset.lang);});

  // Language
  var lang='en';
  try{var saved=localStorage.getItem('rth-lang');if(saved==='en'||saved==='ru')lang=saved;else if((navigator.language||'').toLowerCase().indexOf('ru')===0)lang='ru';}catch(e){}
  function setLang(l){
    lang=l; document.documentElement.lang=l;
    document.querySelectorAll('.wrap[data-lang]').forEach(function(r){r.classList.toggle('off',r.dataset.lang!==l);});
    document.querySelectorAll('[data-setlang]').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.setlang===l));});
    var t=T[l];
    document.querySelectorAll('[data-tab]').forEach(function(a){a.textContent=t.tabs[a.dataset.tab];});
    document.querySelector('.tabs').setAttribute('aria-label',t.nav);
    document.querySelector('.tabs .brand').textContent=t.brand;
    document.title=t.title;
    try{localStorage.setItem('rth-lang',l);}catch(e){}
    route();
  }
  document.querySelectorAll('[data-setlang]').forEach(function(b){b.addEventListener('click',function(){setLang(b.dataset.setlang);});});

  // Pages
  var order=['overview','season','run','week','body','race'];
  function route(){
    var h=(location.hash||'').slice(1),i=order.indexOf(h); if(i<0)i=0; var v=order[i], t=T[lang];
    document.querySelectorAll('[data-view]').forEach(function(e){e.hidden=e.dataset.view!==v;});
    document.querySelectorAll('[data-tab]').forEach(function(a){if(a.dataset.tab===v){a.setAttribute('aria-current','page');try{a.scrollIntoView({block:'nearest',inline:'nearest'})}catch(e){}}else a.removeAttribute('aria-current');});
    document.querySelectorAll('.js-pager').forEach(function(pg){
      pg.innerHTML='';
      function link(k,cls,dir){var a=document.createElement('a');a.href='#'+k;a.className=cls;var s1=document.createElement('span');s1.className='eyebrow';s1.textContent=dir;var s2=document.createElement('span');s2.className='lbl';s2.textContent=t.tabs[k];a.appendChild(s1);a.appendChild(s2);pg.appendChild(a);}
      if(i>0)link(order[i-1],'prev',t.prev);
      if(i<order.length-1)link(order[i+1],'next',t.next);
    });
  }
  window.addEventListener('hashchange',function(){route();window.scrollTo(0,0);});
  setLang(lang);
})();
