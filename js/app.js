(function(){
  var W=window.RTH_WEEKS, T=window.RTH_I18N;
  var DAY=864e5, start=Date.UTC(2026,9,19), raceD=Date.UTC(2027,5,6);
  var nowD=new Date(), today=Date.UTC(nowD.getFullYear(),nowD.getMonth(),nowD.getDate());
  var days=Math.round((raceD-today)/DAY);
  var cur=Math.floor((today-start)/DAY/7)+1;
  var inPlan=cur>=1&&cur<=33;
  var showWk=inPlan?cur:(cur<1?1:33);
  var dow=(nowD.getDay()+6)%7; // 0 = Monday
  function fmtH(h){var m=Math.round(h*60);return Math.floor(m/60)+':'+String(m%60).padStart(2,'0');}
  function dstr(d,t){return d[2]+' '+t.months[d[1]];}
  function el(tag,cls,txt){var e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e;}

  // Day-by-day sessions for a week: [[type, text], ...] per day, Monday first
  function weekDays(w,t){
    var d=t.days, n=w[0], recovery=/r$/.test(w[2]);
    if(n<=4){
      return [
        [['rest',d.rest]],
        [['run',n===4?d.runTest:d.easyRun]],
        [['other',d.strength]],
        [['run',n===4?d.hillStrides:d.easyRun]],
        [['other',d.strengthOrSpin]],
        [['run',d.longRun+' '+w[8]]],
        [['bike',d.easyRide+' '+w[7]+(n===4?' · '+d.ftpTest:'')],['run',d.offBike]]
      ];
    }
    if(n<=18){
      return [
        [['rest',d.rest]],
        [['run',recovery?d.easyRun:d.quality],['other',d.strength]],
        [['swim',d.swim45],['bike',d.optTrainer]],
        [['run',d.easyRun]],
        [['run',d.easyStrides],['swim',d.swim45]],
        [['run',d.longRun+' '+w[8]],['other',d.strength]],
        [['bike',d.longRide+' '+w[7]],['run',d.offBike20]]
      ];
    }
    return [
      [['rest',d.rest]],
      [['run',recovery?d.easyRun:d.quality],['other',d.strength]],
      [['swim',d.swimCss]],
      [['bike',d.bikeInt]],
      [['run',d.easyRun40],['swim',d.swim60]],
      [['run',d.longRun+' '+w[8]]],
      [['bike',d.longRide+' '+w[7]],['run',d.brick]]
    ];
  }

  function render(root,lang){
    var t=T[lang], q=function(c){return root.querySelector('.'+c);}, focusOf=function(w){return lang==='ru'?w[10]:w[9];};
    q('js-days').textContent = days>0 ? days : (days===0 ? t.race : t.done);

    // This week
    var w=W[showWk-1];
    q('js-weekLabel').textContent=t.planWeek+' '+w[0]+' '+t.of+' 33 · '+t.ph[w[2]]+' · '+dstr(w[1],t);
    var f1=focusOf(w);if(!/[.!]$/.test(f1))f1+='.';q('js-weekFocus').textContent=f1+(/r$/.test(w[2])?' '+t.days.easyOnly:'');
    var chips=q('js-weekChips'); chips.innerHTML='';
    [[t.total,fmtH(w[3])],[t.run,fmtH(w[6])],[t.bike,fmtH(w[5])],[t.swim,w[4]?fmtH(w[4]):t.none]].forEach(function(p){chips.appendChild(el('span','chip',p[0]+' '+p[1]));});
    var box=q('js-days7'); box.innerHTML='';
    weekDays(w,t).forEach(function(sessions,i){
      var isRest=sessions[0][0]==='rest', isToday=inPlan&&i===dow;
      var card=el('div','day'+(isRest?' rest':'')+(isToday?' today':''));
      var head=el('div','d',t.dayNames[i]); if(isToday) head.appendChild(el('span','todaytag',t.today));
      card.appendChild(head);
      sessions.forEach(function(s){ card.appendChild(isRest?el('div',null,s[1]):el('div','s '+s[0],s[1])); });
      box.appendChild(card);
    });
    var nx=q('js-weekNext');
    if(showWk<33){var w2=W[showWk];var f2=focusOf(w2);if(!/[.!]$/.test(f2))f2+='.';nx.textContent=t.nextWeek+' ('+dstr(w2[1],t)+'): '+f2+(w2[0]===4?' '+t.testsNote:'');} else nx.textContent='';

    // Chart
    var svg=q('js-chart'), NS='http://www.w3.org/2000/svg';
    var L=34,R=8,Tp=34,B=56,Wd=900,H=330,pw=Wd-L-R,ph=H-Tp-B,max=16,n=W.length,slot=pw/n,bw=slot*0.68;
    function sv(tag,a,p){var e=document.createElementNS(NS,tag);for(var k in a)e.setAttribute(k,a[k]);(p||svg).appendChild(e);return e;}
    function y(v){return Tp+ph-v/max*ph;}
    [0,4,8,12,16].forEach(function(v){sv('line',{x1:L,x2:Wd-R,y1:y(v),y2:y(v),'class':'grid'});var tx=sv('text',{x:L-6,y:y(v)+3,'text-anchor':'end'});tx.textContent=v+t.h;});
    [[1,1],[2,18],[19,19],[20,23],[24,28],[29,31],[32,33]].forEach(function(p,i){
      var x1=L+(p[0]-1)*slot,x2=L+p[1]*slot;
      sv('rect',{x:x1+1,y:H-B+22,width:x2-x1-2,height:3,fill:'var(--fg)',opacity:i%2?0.35:0.8});
      if(t.bands[i]){var tx=sv('text',{x:(x1+x2)/2,y:H-B+40,'text-anchor':'middle','class':'phase-label'});tx.textContent=t.bands[i];}
    });
    var cols=[['var(--swim)',4],['var(--bike)',5],['var(--run)',6]], tip=q('js-tip'), groups=[];
    function showTip(w){tip.innerHTML='';tip.appendChild(el('b',null,t.week+' '+w[0]+' · '+dstr(w[1],t)));
      tip.appendChild(document.createTextNode(' · '+t.ph[w[2]]+' · '+fmtH(w[3])+' '+t.h));tip.appendChild(document.createElement('br'));
      tip.appendChild(document.createTextNode(focusOf(w)));}
    function focus(i){groups.forEach(function(g,j){g.querySelectorAll('rect.bar').forEach(function(r){r.style.opacity=(j===i?1:0.4)});});showTip(W[i]);}
    W.forEach(function(w,i){
      var g=sv('g',{tabindex:0,role:'button','aria-label':t.ariaWeek(w[0],w[3],focusOf(w))});
      var x=L+i*slot+(slot-bw)/2,base=0;
      cols.forEach(function(c){var v=w[c[1]];if(v>0)sv('rect',{x:x,y:y(base+v),width:bw,height:y(base)-y(base+v),fill:c[0],'class':'bar'},g);base+=v;});
      if(w[3]-base>0.01) sv('rect',{x:x,y:y(w[3]),width:bw,height:y(base)-y(w[3]),fill:'var(--other)','class':'bar'},g);
      sv('rect',{x:L+i*slot,y:Tp,width:slot,height:ph,fill:'transparent'},g);
      if(w[0]%4===1||w[0]===33){var tx=sv('text',{x:L+i*slot+slot/2,y:H-B+14,'text-anchor':'middle'});tx.textContent=w[0];}
      ['mouseenter','focus','click'].forEach(function(ev){g.addEventListener(ev,function(){focus(i)});});
      groups.push(g);
    });
    svg.addEventListener('mouseleave',function(){groups.forEach(function(g){g.querySelectorAll('rect.bar').forEach(function(r){r.style.opacity=1})});showTip(W[showWk-1]);});
    [[18,0],[22,1],[33,2]].forEach(function(e){
      var cx=L+(e[0]-0.5)*slot,g=sv('g',{'class':'ev'});
      sv('line',{x1:cx,x2:cx,y1:Tp-12,y2:y(W[e[0]-1][3])-2},g);
      var tx=sv('text',{x:cx,y:Tp-16,'text-anchor':e[0]===33?'end':'middle'},g);tx.textContent=t.events[e[1]];
    });
    if(inPlan){
      var cx=L+(cur-1)*slot+slot/2;
      sv('path',{d:'M'+(cx-5)+' '+(H-B+3)+' L'+(cx+5)+' '+(H-B+3)+' L'+cx+' '+(H-B-4)+' Z',fill:'var(--accent)'});
      var tx=sv('text',{x:cx+8,y:H-B+3});tx.style.fill='var(--accent)';tx.textContent=t.now;
    }
    showTip(W[showWk-1]);
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
  var order=['goal','now','plan'];
  function route(){
    var h=(location.hash||'').slice(1),i=order.indexOf(h); if(i<0)i=0; var v=order[i], t=T[lang];
    document.querySelectorAll('[data-view]').forEach(function(e){e.hidden=e.dataset.view!==v;});
    document.querySelectorAll('[data-tab]').forEach(function(a){if(a.dataset.tab===v)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
    document.querySelectorAll('.js-pager').forEach(function(pg){
      pg.innerHTML='';
      function link(k,cls,dir){var a=el('a',cls);a.href='#'+k;a.appendChild(el('span','eyebrow',dir));a.appendChild(el('span','lbl',t.tabs[k]));pg.appendChild(a);}
      if(i>0)link(order[i-1],'prev',t.prev);
      if(i<order.length-1)link(order[i+1],'next',t.next);
    });
  }
  window.addEventListener('hashchange',function(){route();window.scrollTo(0,0);});
  setLang(lang);
})();
