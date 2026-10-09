/* Descarga animada de elementos y fondos: convierte cualquier SVG de la biblioteca (con los colores elegidos) en un SVG animado.
   Líneas -> se dibujan; rellenos -> aparecen con rebote; patrones -> avanzan en bucle. 6 s, sin JavaScript dentro del archivo. */
window.MA=(function(){
  const P=6;
  const KF='@keyframes ma-draw{0%{stroke-dashoffset:1;opacity:0}3%{opacity:1}34%{stroke-dashoffset:0}86%{stroke-dashoffset:0;opacity:1}95%,100%{stroke-dashoffset:0;opacity:0}}'
   +'@keyframes ma-fill{0%{stroke-dashoffset:1;fill-opacity:0;opacity:0}3%{opacity:1}34%{stroke-dashoffset:0;fill-opacity:0}46%,86%{stroke-dashoffset:0;fill-opacity:1;opacity:1}95%,100%{stroke-dashoffset:0;fill-opacity:1;opacity:0}}'
   +'@keyframes ma-pop{0%{opacity:0;transform:scale(.5)}16%{opacity:1;transform:scale(1.06)}26%,86%{opacity:1;transform:scale(1)}95%,100%{opacity:0;transform:scale(1)}}'
   +'@keyframes ma-fade{0%{opacity:0}22%,86%{opacity:1}95%,100%{opacity:0}}'
   +'@media (prefers-reduced-motion:reduce){*{animation:none!important}}';
  function prop(el,name){
    for(let n=el;n&&n.nodeType===1;n=n.parentNode){
      const v=n.getAttribute(name); if(v!==null&&v!=='')return v;
      const st=n.getAttribute('style');
      if(st){const m=st.match(new RegExp('(?:^|;)\\s*'+name+'\\s*:\\s*([^;]+)'));if(m)return m[1].trim()}
    }
    return null;
  }
  function animate(svgStr,opts){
    opts=opts||{};
    const doc=new DOMParser().parseFromString(svgStr,'image/svg+xml');const svg=doc.documentElement;
    if(!svg||svg.querySelector('parsererror'))return svgStr;
    const vb=(svg.getAttribute('viewBox')||'0 0 100 100').split(/[ ,]+/).map(Number);
    let list=[...svg.querySelectorAll('path,rect,circle,ellipse,line,polyline,polygon')].filter(e=>!e.closest('defs,clipPath,mask,pattern,symbol,marker'));
    if(opts.bg&&list[0]&&list[0].tagName==='rect'&&list[0].parentNode===svg&&(+list[0].getAttribute('width')||0)>=vb[2]*.99)list=list.slice(1);
    const N=list.length||1, step=Math.min(opts.bg?.06:.14,(opts.bg?1.6:1.3)/N);
    list.forEach((el,k)=>{
      const s=prop(el,'stroke'),f=prop(el,'fill'),dash=prop(el,'stroke-dasharray');
      const hasStroke=!!s&&s!=='none', hasFill=f===null?true:f!=='none', dashed=!!dash&&dash!=='none', hasTr=el.hasAttribute('transform');
      let name,extra='';
      if(hasStroke&&!dashed){ name=hasFill?'ma-fill':'ma-draw'; el.setAttribute('pathLength','1'); extra='stroke-dasharray:1 1;'; }
      else if(hasTr||dashed||!hasFill){ name='ma-fade'; }
      else { name='ma-pop'; extra='transform-box:fill-box;transform-origin:center;'; }
      const old=el.getAttribute('style');
      const dl=(k*step-(opts.t||0)).toFixed(3);
      el.setAttribute('style',(old?old.replace(/;?\s*$/,';'):'')+extra+'animation:'+name+' '+P+'s cubic-bezier(.5,0,.2,1) '+dl+'s infinite both;'+(opts.t!==undefined?'animation-play-state:paused;':''));
    });
    if(opts.bg){
      svg.querySelectorAll('pattern').forEach(p=>{
        const w=parseFloat(p.getAttribute('width'));if(!(w>0))return;
        if(opts.t!==undefined){p.setAttribute('patternTransform',(p.getAttribute('patternTransform')||'')+' translate('+((opts.t%12)/12*w).toFixed(2)+' 0)');return}
        const a=doc.createElementNS('http://www.w3.org/2000/svg','animateTransform');
        a.setAttribute('attributeName','patternTransform');a.setAttribute('type','translate');a.setAttribute('from','0 0');a.setAttribute('to',w+' 0');
        a.setAttribute('dur','12s');a.setAttribute('repeatCount','indefinite');a.setAttribute('additive','sum');p.appendChild(a);
      });
    }
    const st=doc.createElementNS('http://www.w3.org/2000/svg','style');st.textContent=KF;svg.insertBefore(st,svg.firstChild);
    return new XMLSerializer().serializeToString(svg);
  }

  function slug(s){return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}
  function dl(blob,name){
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;
    document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000);
  }
  /* ---- cuadros ---- */
  function loadImg(svgStr){return new Promise((res,rej)=>{const u=URL.createObjectURL(new Blob([svgStr],{type:'image/svg+xml'}));const im=new Image();im.onload=()=>{URL.revokeObjectURL(u);res(im)};im.onerror=e=>{URL.revokeObjectURL(u);rej(e)};im.src=u})}
  function sized(svgStr,W,H){return svgStr.replace(/<svg /,'<svg width="'+W+'" height="'+H+'" ')}
  async function frames(spec,svgStr,W,H,fps,onp,getData){
    const n=Math.round(P*fps),cv=document.createElement('canvas');cv.width=W;cv.height=H;const ctx=cv.getContext('2d',{willReadFrequently:!!getData});
    const out=[];
    for(let k=0;k<n;k++){
      const im=await loadImg(sized(animate(svgStr,{bg:spec.bg,t:k/fps}),W,H));
      ctx.fillStyle=spec.bgColor;ctx.fillRect(0,0,W,H);ctx.drawImage(im,0,0,W,H);
      out.push(getData?ctx.getImageData(0,0,W,H).data:await createImageBitmap(cv));
      if(onp)onp((k+1)/n);
      if(k%6===0)await new Promise(r=>setTimeout(r));
    }
    return out;
  }
  /* ---- GIF (codificador propio, paleta por frecuencia de colores) ---- */
  function lzw(idx,minCode,out){
    const clear=1<<minCode,eoi=clear+1;let nb=minCode+1,maxc=(1<<nb)-1,free=clear+2,dict=new Map();
    let acc=0,bits=0;const bytes=[];
    function put(code){acc|=code<<bits;bits+=nb;while(bits>=8){bytes.push(acc&255);acc>>>=8;bits-=8}
      if(free>maxc&&nb<12){nb++;maxc=(1<<nb)-1}}
    function reset(){nb=minCode+1;maxc=(1<<nb)-1;free=clear+2;dict=new Map()}
    put(clear);reset();
    let ent=idx[0];
    for(let i=1;i<idx.length;i++){
      const c=idx[i],key=(ent<<8)|c,v=dict.get(key);
      if(v!==undefined){ent=v;continue}
      put(ent);ent=c;
      if(free<4096){dict.set(key,free++)}else{put(clear);reset()}
    }
    put(ent);put(eoi);if(bits>0)bytes.push(acc&255);
    out.push(minCode);
    for(let i=0;i<bytes.length;i+=255){const ch=bytes.slice(i,i+255);out.push(ch.length);for(const b of ch)out.push(b)}
    out.push(0);
  }
  function gif(framesData,W,H,fps){
    const hist=new Map(),step=Math.max(1,Math.floor(framesData.length/8));
    for(let f=0;f<framesData.length;f+=step){const d=framesData[f];for(let p=0;p<d.length;p+=16){const k=(d[p]<<16)|(d[p+1]<<8)|d[p+2];hist.set(k,(hist.get(k)||0)+1)}}
    const pal=[...hist.entries()].sort((a,b)=>b[1]-a[1]).slice(0,256).map(e=>e[0]);
    while(pal.length<256)pal.push(0);
    const near=new Map();
    function idxOf(k){let v=near.get(k);if(v!==undefined)return v;
      const r=k>>16,g=(k>>8)&255,b=k&255;let best=0,bd=1e9;
      for(let i=0;i<pal.length;i++){const q=pal[i],dr=(q>>16)-r,dg=((q>>8)&255)-g,db=(q&255)-b,dd=dr*dr*3+dg*dg*4+db*db*2;if(dd<bd){bd=dd;best=i;if(!dd)break}}
      near.set(k,best);return best}
    const o=[];const w16=n=>{o.push(n&255,(n>>8)&255)};
    'GIF89a'.split('').forEach(c=>o.push(c.charCodeAt(0)));w16(W);w16(H);o.push(0xF7,0,0);
    pal.forEach(k=>o.push(k>>16,(k>>8)&255,k&255));
    o.push(0x21,0xFF,11);'NETSCAPE2.0'.split('').forEach(c=>o.push(c.charCodeAt(0)));o.push(3,1,0,0,0);
    const delay=Math.round(100/fps);
    for(const d of framesData){
      o.push(0x21,0xF9,4,0x04,delay&255,(delay>>8)&255,0,0);
      o.push(0x2C);w16(0);w16(0);w16(W);w16(H);o.push(0);
      const idx=new Uint8Array(W*H);for(let p=0,q=0;q<idx.length;p+=4,q++)idx[q]=idxOf((d[p]<<16)|(d[p+1]<<8)|d[p+2]);
      lzw(idx,8,o);
    }
    o.push(0x3B);return new Blob([new Uint8Array(o)],{type:'image/gif'});
  }
  /* ---- video (MediaRecorder: MP4 si el navegador lo permite; si no, WebM) ---- */
  async function video(bitmaps,W,H,fps){
    const cv=document.createElement('canvas');cv.width=W;cv.height=H;const ctx=cv.getContext('2d');
    const types=['video/mp4;codecs=avc1.42E01E','video/mp4;codecs=avc1.4D401E','video/mp4;codecs=avc1','video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'];
    const mime=types.find(t=>window.MediaRecorder&&MediaRecorder.isTypeSupported(t));
    if(!mime)throw new Error('Tu navegador no puede grabar video; usa GIF o SVG.');
    const rec=new MediaRecorder(cv.captureStream(fps),{mimeType:mime,videoBitsPerSecond:8e6});const chunks=[];
    rec.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
    const done=new Promise(r=>rec.onstop=r);
    ctx.drawImage(bitmaps[0],0,0);rec.start();
    const t0=performance.now();let last=-1;
    await new Promise(res=>{(function tick(){const f=Math.floor((performance.now()-t0)/1000*fps);
      if(f>=bitmaps.length){res();return}
      if(f!==last){ctx.drawImage(bitmaps[f],0,0);last=f}
      requestAnimationFrame(tick)})()});
    rec.stop();await done;
    return {blob:new Blob(chunks,{type:mime.split(';')[0]}),ext:mime.startsWith('video/mp4')?'mp4':'webm'};
  }
  /* ---- diálogo ---- */
  let dlg;
  function ensure(){
    if(dlg)return dlg;
    const st=document.createElement('style');
    st.textContent='#ma{position:fixed;inset:0;background:rgba(43,42,38,.75);z-index:70;display:grid;place-items:center;padding:16px}#ma[hidden]{display:none}'
     +'#ma .box{background:var(--paper,#FFFDF9);width:min(760px,100%);max-height:100%;overflow:auto;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr)}@media(max-width:640px){#ma .box{grid-template-columns:1fr}}'
     +'#ma .pv{background:var(--plaster,#EFE7DA);display:grid;place-items:center;padding:16px;min-height:240px}#ma .pv img{max-width:100%;max-height:52vh;display:block}'
     +'#ma .sd{padding:20px;display:flex;flex-direction:column;gap:14px}#ma h3{font:400 30px/1 "Bebas Neue",sans-serif;margin:0}#ma .sub{font-size:12.5px;color:#5a594f;margin-top:4px}'
     +'#ma fieldset{border:0;padding:0;margin:0;display:grid;gap:6px}#ma legend{font:700 12px Archivo,sans-serif;letter-spacing:1.2px;text-transform:uppercase;color:#9C4318;margin-bottom:4px;padding:0}'
     +'#ma label{display:flex;gap:8px;align-items:center;font-size:14px;cursor:pointer}#ma label small{color:#5a594f}'
     +'#ma .row{display:flex;gap:8px;flex-wrap:wrap}#ma button{appearance:none;border:1px solid #DDD5C4;background:#FFFDF9;font:600 13px Archivo,sans-serif;padding:9px 14px;cursor:pointer;color:#2B2A26}'
     +'#ma button.dark{background:#2B2A26;color:#FFFDF9;border-color:#2B2A26}#ma button:disabled{opacity:.5;cursor:wait}#ma .bar{height:6px;background:#DDD5C4}#ma .bar i{display:block;height:100%;width:0;background:#C2551F}#ma .msg{font-size:12.5px;color:#5a594f;min-height:1.2em}';
    document.head.appendChild(st);
    dlg=document.createElement('div');dlg.id='ma';dlg.hidden=true;
    dlg.innerHTML='<div class="box" role="dialog" aria-modal="true" aria-labelledby="ma-t"><div class="pv"><img alt="Vista previa animada"></div><div class="sd">'
     +'<div><h3 id="ma-t"></h3><div class="sub" id="ma-s"></div></div>'
     +'<fieldset><legend>Formato</legend><label><input type="radio" name="ma-f" value="svg" checked> SVG animado <small>vectorial, para web</small></label>'
     +'<label><input type="radio" name="ma-f" value="gif"> GIF <small>funciona en cualquier lugar</small></label>'
     +'<label><input type="radio" name="ma-f" value="vid"> Video <small>MP4 o WebM, según tu navegador</small></label></fieldset>'
     +'<fieldset><legend>Colores</legend><label><input type="radio" name="ma-c" value="cur" checked> <span>Los que elegí</span></label><label><input type="radio" name="ma-c" value="org"> <span>Originales de Muralia</span></label></fieldset>'
     +'<div class="bar" hidden><i></i></div><div class="msg" role="status"></div>'
     +'<div class="row"><button type="button" class="dark" id="ma-go">Descargar</button><button type="button" id="ma-x">Cerrar</button></div></div></div>';
    document.body.appendChild(dlg);
    dlg.addEventListener('click',e=>{if(e.target===dlg||e.target.id==='ma-x')close()});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!dlg.hidden)close()});
    return dlg;
  }
  let spec,cur;
  function close(){dlg.hidden=true;const im=dlg.querySelector('.pv img');if(im.src)URL.revokeObjectURL(im.src);im.removeAttribute('src')}
  function val(n){return dlg.querySelector('input[name="'+n+'"]:checked').value}
  function svgNow(){return val('ma-c')==='org'?spec.original():spec.current()}
  function bgNow(){return val('ma-c')==='org'?spec.bgOrg:spec.bgCur}
  function preview(){
    const im=dlg.querySelector('.pv img');if(im.src)URL.revokeObjectURL(im.src);
    im.src=URL.createObjectURL(new Blob([animate(sized(svgNow(),spec.pw,spec.ph),{bg:spec.bg})],{type:'image/svg+xml'}));
  }
  async function run(){
    const go=dlg.querySelector('#ma-go'),bar=dlg.querySelector('.bar'),fill=bar.firstChild,msg=dlg.querySelector('.msg');
    const f=val('ma-f'),svgStr=svgNow(),base=spec.file+'-animado'+(val('ma-c')==='org'?'-original':'');
    go.disabled=true;msg.textContent='';
    try{
      if(f==='svg'){dl(new Blob([animate(sized(svgStr,spec.pw,spec.ph),{bg:spec.bg})],{type:'image/svg+xml'}),base+'.svg');msg.textContent='Listo: SVG descargado.';return}
      bar.hidden=false;fill.style.width='0';
      const s2={bg:spec.bg,bgColor:bgNow()};
      if(f==='gif'){
        const W=spec.gw,H=spec.gh;msg.textContent='Generando cuadros…';
        const fr=await frames(s2,svgStr,W,H,15,p=>fill.style.width=(p*85)+'%',true);
        msg.textContent='Codificando GIF…';await new Promise(r=>setTimeout(r,30));
        const b=gif(fr,W,H,15);fill.style.width='100%';dl(b,base+'.gif');msg.textContent='Listo: GIF descargado ('+Math.round(b.size/1024)+' KB).';
      }else{
        const W=spec.vw,H=spec.vh;msg.textContent='Generando cuadros…';
        const fr=await frames(s2,svgStr,W,H,20,p=>fill.style.width=(p*70)+'%',false);
        msg.textContent='Grabando video (6 s)…';
        const tm=setInterval(()=>{const w=parseFloat(fill.style.width);if(w<99)fill.style.width=(w+1.6)+'%'},100);
        const v=await video(fr,W,H,20);clearInterval(tm);fill.style.width='100%';fr.forEach(b=>b.close&&b.close());
        dl(v.blob,base+'.'+v.ext);msg.textContent='Listo: video '+v.ext.toUpperCase()+' descargado.';
      }
    }catch(e){msg.textContent='No se pudo generar: '+(e&&e.message||e)}
    finally{go.disabled=false;setTimeout(()=>{bar.hidden=true},1200)}
  }
  function open(sp){
    spec=sp;ensure();
    dlg.querySelector('#ma-t').textContent=sp.title;dlg.querySelector('#ma-s').textContent=sp.sub;
    dlg.querySelector('input[name="ma-f"][value="svg"]').checked=true;
    const same=sp.current()===sp.original();const org=dlg.querySelector('input[name="ma-c"][value="org"]'),cu=dlg.querySelector('input[name="ma-c"][value="cur"]');
    cu.checked=true;org.disabled=same;org.closest('label').style.opacity=same?.5:1;
    dlg.querySelector('.msg').textContent=same?'Estás usando los colores originales.':'';dlg.querySelector('.bar').hidden=true;
    dlg.querySelectorAll('input[name="ma-c"]').forEach(r=>r.onchange=preview);
    dlg.querySelector('#ma-go').onclick=run;
    preview();dlg.hidden=false;dlg.querySelector('#ma-go').focus();
  }
  return {animate,open,gif,slug};
})();
(function(){
  const slug=MA.slug;
  const ORG_INK='#2B2A26',ORG_TILE='#FFFDF9';
  document.querySelectorAll('#pane-el figure.t').forEach(f=>{
    const acts=f.querySelector('.acts');const first=acts&&acts.querySelector('.cp');if(!first)return;
    const i=+first.dataset.i;const b=document.createElement('button');
    b.type='button';b.className='cp';b.dataset.k='anim';b.textContent='Descargar animado';acts.appendChild(b);
    b.addEventListener('click',()=>{
      const num=f.querySelector('.n').textContent,name=f.querySelector('.nm').textContent;
      MA.open({title:name,sub:'Ícono '+num+' · se dibuja trazo a trazo',bg:false,pw:512,ph:512,gw:360,gh:360,vw:720,vh:720,
        file:'muralia-icono-'+num+'-'+slug(name),
        current:()=>elSvg(i),original:()=>RAW[i].replaceAll('currentColor',ORG_INK).replaceAll('var(--bg,#FFFDF9)',ORG_TILE),
        bgCur:getComputedStyle(document.documentElement).getPropertyValue('--tile').trim()||ORG_TILE,bgOrg:ORG_TILE});
    });
  });
  window.openWpAnim=function(w,cur,fmt){
    const h=fmt==='h',num=String(w.n).padStart(2,'0'),org=w[fmt].replace(/§(\d+)§/g,(a,k)=>w.c[+k]);
    MA.open({title:w.name,sub:'Fondo '+num+' · '+(h?'horizontal 1920 × 1080':'vertical 1080 × 1920'),bg:true,
      pw:h?960:540,ph:h?540:960,gw:h?640:360,gh:h?360:640,vw:h?960:540,vh:h?540:960,
      file:'muralia-fondo-'+num+'-'+slug(w.name)+'-'+(h?'horizontal':'vertical'),
      current:()=>cur,original:()=>org,bgCur:'#FFFDF9',bgOrg:'#FFFDF9'});
  };
  const ea=document.getElementById('ed-anim');
  if(ea)ea.addEventListener('click',()=>{
    const pv=document.getElementById('ed-pv'),fmt=pv.classList.contains('h')?'h':'v';
    const t=document.getElementById('ed-t').textContent,m=t.match(/^(\d+)\s*·\s*(.*)$/)||[0,'00',t];
    const w=WP.find(x=>String(x.n).padStart(2,'0')===m[1]&&x.name===m[2]);
    if(w)openWpAnim(w,pv.innerHTML,fmt);
  });
})();
