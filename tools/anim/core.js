/* Motor de animación de la biblioteca Muralia.
   Convierte un SVG (con los colores elegidos) en un SVG animado de 6 s en bucle, solo con CSS/SMIL (sin JavaScript dentro del archivo).
   Modos: aparición (se dibuja), movimiento propio (íconos), deslizamiento (franjas) y animación según el diseño (fondos). */
window.MA=(function(){
  const P=6, NS='http://www.w3.org/2000/svg';
  const KF=[
   '@keyframes ma-draw{0%{stroke-dashoffset:1;opacity:0}3%{opacity:1}34%{stroke-dashoffset:0}86%{stroke-dashoffset:0;opacity:1}95%,100%{stroke-dashoffset:0;opacity:0}}',
   '@keyframes ma-fill{0%{stroke-dashoffset:1;fill-opacity:0;opacity:0}3%{opacity:1}34%{stroke-dashoffset:0;fill-opacity:0}46%,86%{stroke-dashoffset:0;fill-opacity:1;opacity:1}95%,100%{stroke-dashoffset:0;fill-opacity:1;opacity:0}}',
   '@keyframes ma-pop{0%{opacity:0;transform:scale(.5)}16%{opacity:1;transform:scale(1.06)}26%,86%{opacity:1;transform:scale(1)}95%,100%{opacity:0;transform:scale(1)}}',
   '@keyframes ma-fade{0%{opacity:0}22%,86%{opacity:1}95%,100%{opacity:0}}',
   /* movimiento propio */
   '@keyframes ma-flicker{0%,100%{transform:scale(1,1) skewX(0)}18%{transform:scale(.95,1.08) skewX(-3deg)}36%{transform:scale(1.04,.95) skewX(2deg)}54%{transform:scale(.97,1.06) skewX(-1.5deg)}72%{transform:scale(1.03,.97) skewX(3deg)}88%{transform:scale(.98,1.04) skewX(-2deg)}}',
   '@keyframes ma-springx{0%,100%{transform:scaleX(1)}50%{transform:scaleX(1.07)}}',
   '@keyframes ma-diag{0%,100%{transform:translate(0,0)}50%{transform:translate(2.5px,-2.5px)}}',
   '@keyframes ma-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-2px)}}',
   '@keyframes ma-rise{0%,100%{transform:scaleY(.25)}45%,70%{transform:scaleY(1)}}',
   '@keyframes ma-nr{0%,100%{transform:translateX(0)}50%{transform:translateX(3px)}}',
   '@keyframes ma-nl{0%,100%{transform:translateX(0)}50%{transform:translateX(-3px)}}',
   '@keyframes ma-nu{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}',
   '@keyframes ma-nur{0%,100%{transform:translate(0,0)}50%{transform:translate(3px,-3px)}}',
   '@keyframes ma-emit{0%{opacity:0;transform:translateX(-2px)}35%{opacity:1}100%{opacity:0;transform:translateX(5px)}}',
   '@keyframes ma-eq{0%,100%{transform:scaleY(.3)}50%{transform:scaleY(1)}}',
   '@keyframes ma-drop{0%{opacity:0;transform:translateY(-5px) scale(.7)}25%{opacity:1;transform:translateY(0) scale(1)}70%{opacity:1;transform:translateY(1px)}100%{opacity:0;transform:translateY(7px)}}',
   '@keyframes ma-screw{0%,100%{transform:translateY(-2px)}50%{transform:translateY(3px)}}',
   '@keyframes ma-unroll{0%,100%{transform:scaleX(.35)}55%{transform:scaleX(1)}}',
   '@keyframes ma-swipe{0%,100%{transform:translateX(-3px) rotate(-3deg)}50%{transform:translateX(3px) rotate(3deg)}}',
   '@keyframes ma-shine{0%,100%{opacity:1}50%{opacity:.2}}',
   '@keyframes ma-swing{0%,100%{transform:rotate(-14deg)}50%{transform:rotate(14deg)}}',
   '@keyframes ma-swings{0%,100%{transform:rotate(-8deg)}50%{transform:rotate(8deg)}}',
   '@keyframes ma-flag{0%,100%{transform:skewY(-7deg) scaleX(1)}50%{transform:skewY(7deg) scaleX(.94)}}',
   '@keyframes ma-twinkle{0%,100%{opacity:1}40%,60%{opacity:.12}}',
   '@keyframes ma-door{0%,100%{transform:scaleX(1)}45%,60%{transform:scaleX(.45)}}',
   '@keyframes ma-blink{0%,45%,100%{opacity:1}50%,90%{opacity:0}}',
   '@keyframes ma-bubble{0%,100%{transform:translateX(-6px)}50%{transform:translateX(6px)}}',
   '@keyframes ma-type{0%,100%{transform:scaleX(.05)}50%,85%{transform:scaleX(1)}}',
   '@keyframes ma-ring{0%,45%,100%{transform:rotate(0)}6%{transform:rotate(-9deg)}12%{transform:rotate(9deg)}18%{transform:rotate(-9deg)}24%{transform:rotate(9deg)}30%{transform:rotate(-6deg)}36%{transform:rotate(6deg)}}',
   '@keyframes ma-hop{0%,100%{transform:translateY(0) scale(1,1)}10%{transform:translateY(0) scale(1.06,.92)}40%{transform:translateY(-4px) scale(.96,1.05)}70%{transform:translateY(0) scale(1.08,.9)}85%{transform:translateY(0) scale(1,1)}}',
   '@keyframes ma-spin{to{transform:rotate(360deg)}}',
   '@keyframes ma-quarter{0%,25%{transform:rotate(0)}45%,100%{transform:rotate(90deg)}}',
   '@keyframes ma-pulse2{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}',
   '@keyframes ma-exu{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}',
   '@keyframes ma-exd{0%,100%{transform:translateY(0)}50%{transform:translateY(3px)}}',
   '@keyframes ma-mxl{0%,100%{transform:translateX(0)}50%{transform:translateX(-2.5px)}}',
   '@keyframes ma-mxr{0%,100%{transform:translateX(0)}50%{transform:translateX(2.5px)}}',
   '@keyframes ma-squash{0%,100%{transform:scaleY(1)}50%{transform:scaleY(.86)}}',
   '@keyframes ma-dim{0%,100%{opacity:1}50%{opacity:.25}}',
   '@keyframes ma-smoke{0%{opacity:0;transform:translateY(0) scale(.6)}25%{opacity:1}100%{opacity:0;transform:translateY(-10px) scale(1.15)}}',
   '@keyframes ma-road{to{stroke-dashoffset:-10}}',
   '@keyframes ma-bump{0%,100%{transform:translateY(0)}25%{transform:translateY(-.8px)}60%{transform:translateY(.3px)}}',
   '@keyframes ma-march{to{stroke-dashoffset:-36}}',
   '@keyframes ma-flow{0%{opacity:0;transform:translateX(-30px)}20%,75%{opacity:1}100%{opacity:0;transform:translateX(40px)}}',
   '@keyframes ma-sweep{0%,100%{transform:scaleX(0)}30%,70%{transform:scaleX(1)}}',
   '@media (prefers-reduced-motion:reduce){*{animation:none!important}}'].join('');
  /* intensidad: acerca o aleja cada fotograma de la posición de reposo (1 = original, 0 = sin movimiento, 2 = el doble) */
  const SET_T=new Set(['flicker','springx','diag','bob','rise','nr','nl','nu','nur','emit','eq','drop','screw','unroll','swipe','swing','swings','flag','door','bubble','ring','hop','pulse2','exu','exd','mxl','mxr','squash','smoke','bump','flow']);
  const SET_O=new Set(['dim','blink','twinkle','shine']);
  const f3=v=>(+v).toFixed(3).replace(/\.?0+$/,'');
  function scaleBody(b,i,tr,op){
    if(tr){
      b=b.replace(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/g,(m,x,y)=>'translate('+f3(x*i)+'px,'+f3(y*i)+'px)')
       .replace(/translate([XY])\(([-\d.]+)px\)/g,(m,a,v)=>'translate'+a+'('+f3(v*i)+'px)')
       .replace(/rotate\(([-\d.]+)deg\)/g,(m,v)=>'rotate('+f3(v*i)+'deg)')
       .replace(/skew([XY])\(([-\d.]+)deg\)/g,(m,a,v)=>'skew'+a+'('+f3(v*i)+'deg)')
       .replace(/scale([XY])\(([-\d.]+)\)/g,(m,a,v)=>'scale'+a+'('+f3(1+(v-1)*i)+')')
       .replace(/scale\(([-\d.]+)(?:,([-\d.]+))?\)/g,(m,a,c)=>'scale('+f3(1+(a-1)*i)+(c!==undefined?','+f3(1+(c-1)*i):'')+')');
    }
    if(op)b=b.replace(/opacity:([\d.]+)/g,(m,v)=>'opacity:'+Math.max(0,Math.min(1,1-(1-v)*i)).toFixed(3));
    return b;
  }
  function scaleKF(css,i){
    if(i===1)return css;
    return css.replace(/@keyframes ma-([a-z0-9]+)\{(.*?)\}(?=@|$)/g,(m,name,body)=>{
      const tr=SET_T.has(name),op=SET_O.has(name);if(!tr&&!op)return m;
      return '@keyframes ma-'+name+'{'+scaleBody(body,i,tr,op)+'}';
    });
  }
  const SEL='path,rect,circle,ellipse,line,polyline,polygon,text';
  const SKIP='defs,clipPath,mask,pattern,symbol,marker';
  function prop(el,name){
    for(let n=el;n&&n.nodeType===1;n=n.parentNode){
      const v=n.getAttribute(name); if(v!==null&&v!=='')return v;
      const st=n.getAttribute('style');
      if(st){const m=st.match(new RegExp('(?:^|;)\\s*'+name+'\\s*:\\s*([^;]+)'));if(m)return m[1].trim()}
    }
    return null;
  }
  function leaves(svg,vb,bg){
    let l=[...svg.querySelectorAll(SEL)].filter(e=>!e.closest(SKIP));
    if(bg&&l[0]&&l[0].tagName==='rect'&&l[0].parentNode===svg&&(+l[0].getAttribute('width')||0)>=vb[2]*.99)l=l.slice(1);
    return l;
  }
  function makeCtx(doc,svg,vb,opts){
    const baked=opts.t!==undefined, t=opts.t||0, css=[], kfs=new Set();
    const sp=opts.speed>0?opts.speed:1, inten=opts.intensity===undefined?1:opts.intensity;
    const c={doc,svg,vb,baked,t,css,P,sp,inten};
    c.L=leaves(svg,vb,opts.bg);
    c.patterns=[...svg.querySelectorAll('pattern')];
    c.G=[...svg.children].filter(e=>e.tagName==='g');
    c.kf=(name,body)=>{if(!kfs.has(name)){kfs.add(name);css.push('@keyframes '+name+'{'+(/^ma-sh/.test(name)?scaleBody(body,inten,true,false):body)+'}')}return name};
    c.a=(el,name,n,o)=>{
      if(!el)return;o=o||{};const dur=P/(n||1)/sp;
      let st=(el.getAttribute('style')||'').replace(/;?\s*$/,';');if(st===';')st='';
      if(o.o)st+='transform-box:fill-box;transform-origin:'+o.o+';';
      if(o.p)st+='transform-box:view-box;transform-origin:'+o.p[0]+'px '+o.p[1]+'px;';
      if(o.extra)st+=o.extra;
      st+='animation:'+name+' '+dur.toFixed(3)+'s '+(o.ease||'ease-in-out')+' '+((o.delay||0)/sp-t).toFixed(3)+'s infinite both;';
      if(baked)st+='animation-play-state:paused;';
      el.setAttribute('style',st);
    };
    c.all=(els,name,n,o)=>els.forEach((e,i)=>c.a(e,name,n,o&&o.stag?Object.assign({},o,{delay:(o.delay||0)+i*o.stag}):o));
    c.wave=(els,name,n,span,o)=>els.forEach((e,i)=>c.a(e,name,n,Object.assign({},o||{},{delay:i/Math.max(1,els.length)*span})));
    c.shift=(el,dx,dy,n,o)=>{const nm=c.kf('ma-sh'+dx+'_'+dy,'0%,100%{transform:translate('+dx+'px,'+dy+'px)}50%{transform:translate('+(-dx)+'px,'+(-dy)+'px)}');c.a(el,nm,n||1,o)};
    c.split=el=>{
      const d=el.getAttribute('d');if(!d)return [el];
      const parts=d.match(/[Mm][^Mm]*/g)||[d];if(parts.length<2)return [el];
      const out=parts.map(pd=>{const e=el.cloneNode(false);e.setAttribute('d',pd.trim());el.parentNode.insertBefore(e,el);return e});
      el.remove();return out;
    };
    c.add=(markup,parent)=>{
      const tmp=new DOMParser().parseFromString('<svg xmlns="'+NS+'">'+markup+'</svg>','image/svg+xml').documentElement;
      const host=parent||svg.querySelector(':scope>g')||svg;const out=[];
      [...tmp.children].forEach(n=>{const k=doc.importNode(n,true);host.appendChild(k);out.push(k)});
      return out;
    };
    c.scroll=(pats,dx,dy)=>{
      (Array.isArray(pats)?pats:[pats]).forEach(p=>{
        if(!p)return;
        if(baked){const f=((t*sp)%P)/P;p.setAttribute('patternTransform',(p.getAttribute('patternTransform')||'')+' translate('+(dx*f).toFixed(2)+' '+(dy*f).toFixed(2)+')');return}
        const a=doc.createElementNS(NS,'animateTransform');a.setAttribute('attributeName','patternTransform');a.setAttribute('type','translate');
        a.setAttribute('from','0 0');a.setAttribute('to',dx+' '+dy);a.setAttribute('dur',(P/sp)+'s');a.setAttribute('repeatCount','indefinite');a.setAttribute('additive','sum');p.appendChild(a);
      });
    };
    /* saltos por casillas: route=[[dx,dy],...]; cada paso dura P/route.length */
    c.hop=(el,route,o)=>{
      const n=route.length;let x=0,y=0;const parts=['0%{transform:translate(0,0)}'];
      route.forEach((r,i)=>{const s=i/n*100,m=(i+.55)/n*100;x+=r[0];y+=r[1];parts.push(m.toFixed(2)+'%{transform:translate('+x+'px,'+y+'px) scale(1.12)}');parts.push(((i+1)/n*100).toFixed(2)+'%{transform:translate('+x+'px,'+y+'px) scale(1)}')});
      const nm=c.kf('ma-hop'+route.map(r=>r.join('_')).join('-'),parts.join(''));c.a(el,nm,1,Object.assign({ease:'cubic-bezier(.3,0,.2,1)',o:'50% 50%'},o||{}));
    };
    /* rebote en los bordes: cada elemento sigue la misma ruta con un retraso (estela) */
    c.bounce=(els,b)=>{
      const N=96,tri=u=>{u=u-Math.floor(u);return 1-Math.abs(2*u-1)};
      els.forEach((el,i)=>{
        const lag=(els.length-1-i)*b.lag,x0=+el.getAttribute('x')||0,y0=+el.getAttribute('y')||0;
        const parts=[];
        for(let k=0;k<=N;k++){const tt=k/N*P-lag;
          const px=b.minx+(b.maxx-b.minx)*tri((tt+b.phx)/b.px),py=b.miny+(b.maxy-b.miny)*tri((tt+b.phy)/b.py);
          parts.push((k/N*100).toFixed(3)+'%{transform:translate('+(px-x0).toFixed(1)+'px,'+(py-y0).toFixed(1)+'px)}');}
        const nm=c.kf('ma-bn'+b.id+'_'+i,parts.join(''));c.a(el,nm,1,{ease:'linear'});
      });
    };
    c.march=(el,dash,len,n,o)=>{
      const nm=c.kf('ma-mr'+len,'to{stroke-dashoffset:-'+len+'}');
      c.a(el,nm,n||1,Object.assign({ease:'linear',extra:'stroke-dasharray:'+dash+';'},o||{}));
    };
    /* aparición: líneas se dibujan, rellenos aparecen con rebote */
    c.appear=(list,step,o)=>{
      const N=list.length||1;step=step===undefined?Math.min(opts.bg?.06:.14,(opts.bg?1.6:1.3)/N):step;
      list.forEach((el,k)=>{
        const s=prop(el,'stroke'),f=prop(el,'fill'),dash=prop(el,'stroke-dasharray');
        const hasStroke=!!s&&s!=='none',hasFill=f===null?true:f!=='none',dashed=!!dash&&dash!=='none',hasTr=el.hasAttribute('transform')||el.tagName==='text';
        let name,extra='';
        if(hasStroke&&!dashed&&el.tagName!=='text'){name=hasFill?'ma-fill':'ma-draw';el.setAttribute('pathLength','1');extra='stroke-dasharray:1 1;'}
        else if(hasTr||dashed||!hasFill){name='ma-fade'}
        else{name='ma-pop';extra='transform-box:fill-box;transform-origin:center;'}
        c.a(el,name,1,Object.assign({delay:k*step,ease:'cubic-bezier(.5,0,.2,1)',extra},o||{}));
      });
    };
    return c;
  }
  /* franjas: se desplazan a lo largo de su eje, sin aparecer ni desaparecer */
  function slide(c,s){
    const svg=c.svg,W=c.vb[2],kids=[...svg.children].filter(e=>!/^(defs|style|title|desc)$/.test(e.tagName));
    const wrap=c.doc.createElementNS(NS,'g');kids.forEach(k=>wrap.appendChild(k));
    const parts=[wrap];
    [-W,W].forEach(off=>{const g=c.doc.createElementNS(NS,'g');g.setAttribute('transform','translate('+off+' 0)');
      kids.forEach(k=>{const k2=k.cloneNode(true);k2.querySelectorAll('clipPath,defs').forEach(x=>x.remove());if(k2.tagName!=='clipPath'&&k2.tagName!=='defs')g.appendChild(k2)});wrap.appendChild(g)});
    svg.appendChild(wrap);
    const n=Math.max(1,Math.round(420/s.p)),p=s.p;
    const nm=c.kf('ma-sl'+p+(s.dir>0?'r':'l'),s.dir>0?'from{transform:translateX('+(-p)+'px)}to{transform:translateX(0)}':'from{transform:translateX(0)}to{transform:translateX('+(-p)+'px)}');
    c.a(wrap,nm,n,{ease:'linear'});
  }
  function animate(svgStr,opts){
    opts=opts||{};
    const doc=new DOMParser().parseFromString(svgStr,'image/svg+xml');const svg=doc.documentElement;
    if(!svg||svg.querySelector('parsererror'))return svgStr;
    const vb=(svg.getAttribute('viewBox')||'0 0 100 100').split(/[ ,]+/).map(Number);
    const c=makeCtx(doc,svg,vb,opts);
    let done=false;
    if(opts.slide){slide(c,opts.slide);done=true}
    else if(opts.alive!==undefined&&MA.ICONS[opts.alive]){MA.ICONS[opts.alive](c);done=true}
    else if(opts.recipe&&MA.WALL[opts.recipe]){MA.WALL[opts.recipe](c);done=true}
    if(!done){
      c.appear(c.L);
      if(opts.bg)c.scroll(c.patterns,c.patterns[0]?+c.patterns[0].getAttribute('width'):0,0);
    }
    const st=doc.createElementNS(NS,'style');st.textContent=scaleKF(KF,c.inten)+c.css.join('');svg.insertBefore(st,svg.firstChild);
    return new XMLSerializer().serializeToString(svg);
  }
  const MA={animate,P,scaleKF,ICONS:{},WALL:{},FP:{},prop};
  return MA;
})();
