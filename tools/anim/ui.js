/* Diálogo "Descargar animado": vista previa en vivo, animación, formato y colores. */
(function(){
  const slug=s=>s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  function dl(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000)}
  /* ritmo compartido (velocidad e intensidad) entre el diálogo, las vistas animadas y el editor; se recuerda en el navegador */
  const RH=MA.rhythm={speed:1,intensity:1,subs:[]};
  try{const sv=JSON.parse(localStorage.getItem('muralia-ritmo')||'null');if(sv&&sv.speed>0){RH.speed=+sv.speed;RH.intensity=+sv.intensity}}catch(e){}
  MA.ropts=()=>({speed:RH.speed,intensity:RH.intensity});
  function setRhythm(sp,inn,src){
    RH.speed=sp;RH.intensity=inn;try{localStorage.setItem('muralia-ritmo',JSON.stringify({speed:sp,intensity:inn}))}catch(e){}
    RH.subs.forEach(f=>f(src));
  }
  MA.setRhythm=setRhythm;
  let dlg,spec,token=0;
  function ensure(){
    if(dlg)return dlg;
    const st=document.createElement('style');
    st.textContent='#ma{position:fixed;inset:0;background:rgba(43,42,38,.75);z-index:70;display:grid;place-items:center;padding:16px}#ma[hidden]{display:none}'
     +'#ma .box{background:#FFFDF9;width:min(820px,100%);max-height:100%;overflow:auto;display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,1fr)}@media(max-width:680px){#ma .box{grid-template-columns:1fr}}'
     +'#ma .pv{background:#EFE7DA;display:grid;place-items:center;padding:16px;min-height:260px;position:relative}#ma .pv img{max-width:100%;max-height:60vh;display:block;box-shadow:0 0 0 1px #DDD5C4}'
     +'#ma .rs{position:absolute;left:12px;bottom:12px}#ma .sd{padding:20px 20px 0;display:flex;flex-direction:column;gap:14px;overflow:auto;max-height:calc(100vh - 32px)}#ma .row{position:sticky;bottom:0;background:#FFFDF9;padding:10px 0 16px;margin-top:auto;border-top:1px solid #DDD5C4}#ma h3{font:400 30px/1 "Bebas Neue",sans-serif;margin:0}#ma .sub{font-size:12.5px;color:#5a594f;margin-top:4px}'
     +'#ma fieldset{border:0;padding:0;margin:0;display:grid;gap:6px}#ma legend{font:700 12px Archivo,sans-serif;letter-spacing:1.2px;text-transform:uppercase;color:#9C4318;margin-bottom:4px;padding:0}'
     +'#ma label{display:flex;gap:8px;align-items:center;font-size:14px;cursor:pointer}#ma label small{color:#5a594f}'
     +'#ma .row{display:flex;gap:8px;flex-wrap:wrap}#ma button{appearance:none;border:1px solid #DDD5C4;background:#FFFDF9;font:600 13px Archivo,sans-serif;padding:9px 14px;cursor:pointer;color:#2B2A26}'
     +'#ma button.dark{background:#2B2A26;color:#FFFDF9;border-color:#2B2A26}#ma button:disabled{opacity:.5;cursor:wait}#ma .bar{height:6px;background:#DDD5C4}#ma .bar i{display:block;height:100%;width:0;background:#C2551F}#ma .msg{font-size:12.5px;color:#5a594f;min-height:1.2em}'
     +'.mkn{display:flex;gap:6px;align-items:center;grid-column:1/-1;font:600 12px Archivo,sans-serif;color:#5a594f}.mkn input[type=text]{width:46px;font:700 13px Archivo;padding:3px 5px;border:1px solid #DDD5C4;background:#FFFDF9;text-align:center}.mkn label{display:flex;gap:4px;align-items:center;font-weight:500}'
     +'.pv .hv{display:block}#ma .sl{display:grid;grid-template-columns:84px 1fr 48px;gap:8px;align-items:center}#ma .sl input{width:100%;accent-color:#C2551F}#ma .sl b{font-size:13px;text-align:right}#ma .sl.off{opacity:.45}';
    document.head.appendChild(st);
    dlg=document.createElement('div');dlg.id='ma';dlg.hidden=true;
    dlg.innerHTML='<div class="box" role="dialog" aria-modal="true" aria-labelledby="ma-t"><div class="pv"><img alt="Vista previa animada"><button type="button" class="rs" id="ma-rs">Reiniciar</button></div><div class="sd">'
     +'<div><h3 id="ma-t"></h3><div class="sub" id="ma-s"></div></div>'
     +'<fieldset id="ma-modes"><legend>Animación</legend></fieldset>'
     +'<fieldset id="ma-rhythm"><legend>Ritmo</legend>'
     +'<label class="sl"><span>Velocidad</span><input type="range" id="ma-sp" min="0.5" max="3" step="0.25" value="1"><b id="ma-spv">1×</b></label>'
     +'<label class="sl"><span>Intensidad</span><input type="range" id="ma-in" min="0" max="2" step="0.25" value="1"><b id="ma-inv">100%</b></label>'
     +'<div class="sub" id="ma-rn"></div><button type="button" id="ma-rr" style="justify-self:start">Restablecer ritmo</button></fieldset>'
     +'<fieldset><legend>Formato</legend><label><input type="radio" name="ma-f" value="svg" checked> SVG animado <small>vectorial, para web</small></label>'
     +'<label><input type="radio" name="ma-f" value="gif"> GIF <small>funciona en cualquier lugar</small></label>'
     +'<label><input type="radio" name="ma-f" value="vid"> Video <small>MP4 o WebM, según tu navegador</small></label></fieldset>'
     +'<fieldset><legend>Colores</legend><label><input type="radio" name="ma-c" value="cur" checked> <span>Los que elegí</span></label><label><input type="radio" name="ma-c" value="org"> <span>Originales de Muralia</span></label></fieldset>'
     +'<div class="bar" hidden><i></i></div><div class="msg" role="status"></div>'
     +'<div class="row"><button type="button" class="dark" id="ma-go">Descargar</button><button type="button" id="ma-x">Cerrar</button></div></div></div>';
    document.body.appendChild(dlg);
    dlg.addEventListener('click',e=>{if(e.target===dlg||e.target.id==='ma-x')close()});
    dlg.querySelector('#ma-rs').addEventListener('click',()=>preview());
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!dlg.hidden)close()});
    return dlg;
  }
  function close(){dlg.hidden=true;token++;const im=dlg.querySelector('.pv img');if(im.src)URL.revokeObjectURL(im.src);im.removeAttribute('src')}
  const val=n=>dlg.querySelector('input[name="'+n+'"]:checked').value;
  const svgNow=()=>val('ma-c')==='org'?spec.original():spec.current();
  const bgNow=()=>val('ma-c')==='org'?spec.bgOrg:spec.bgCur;
  const modeNow=()=>spec.modes.find(m=>m.id===val('ma-m'))||spec.modes[0];
  const spd=()=>+dlg.querySelector('#ma-sp').value,inten=()=>+dlg.querySelector('#ma-in').value;
  const aopts=()=>Object.assign({bg:spec.bg,speed:spd(),intensity:inten()},modeNow().opts);
  async function preview(){
    const my=++token,im=dlg.querySelector('.pv img');
    const base=await MA.withFonts(MA.sized(svgNow(),spec.pw,spec.ph));if(my!==token)return;
    if(im.src)URL.revokeObjectURL(im.src);
    im.src=URL.createObjectURL(new Blob([MA.animate(base,aopts())],{type:'image/svg+xml'}));
  }
  async function run(){
    const go=dlg.querySelector('#ma-go'),bar=dlg.querySelector('.bar'),fill=bar.firstChild,msg=dlg.querySelector('.msg');
    const f=val('ma-f'),m=modeNow(),base=spec.file+'-'+m.id+(val('ma-c')==='org'?'-original':'')+(spd()!==1?'-vel'+spd():'')+(inten()!==1&&m.intensity!==false?'-int'+Math.round(inten()*100):'');
    go.disabled=true;msg.textContent='';
    try{
      const svgStr=await MA.withFonts(svgNow());
      if(f==='svg'){dl(new Blob([MA.animate(MA.sized(svgStr,spec.pw,spec.ph),aopts())],{type:'image/svg+xml'}),base+'.svg');msg.textContent='Listo: SVG descargado.';return}
      bar.hidden=false;fill.style.width='0';
      if(f==='gif'){
        msg.textContent='Generando cuadros…';
        const fr=await MA.frames(svgStr,aopts(),bgNow(),spec.gw,spec.gh,15,p=>fill.style.width=(p*85)+'%',true);
        msg.textContent='Codificando GIF…';await new Promise(r=>setTimeout(r,30));
        const b=MA.gif(fr,spec.gw,spec.gh,15);fill.style.width='100%';dl(b,base+'.gif');msg.textContent='Listo: GIF descargado ('+Math.round(b.size/1024)+' KB).';
      }else{
        msg.textContent='Generando cuadros…';
        const fr=await MA.frames(svgStr,aopts(),bgNow(),spec.vw,spec.vh,20,p=>fill.style.width=(p*70)+'%',false);
        msg.textContent='Grabando video (6 s)…';
        const tm=setInterval(()=>{const w=parseFloat(fill.style.width);if(w<99)fill.style.width=(w+1.6)+'%'},100);
        const v=await MA.video(fr,spec.vw,spec.vh,20);clearInterval(tm);fill.style.width='100%';fr.forEach(b=>b.close&&b.close());
        dl(v.blob,base+'.'+v.ext);msg.textContent='Listo: video '+v.ext.toUpperCase()+' descargado.';
      }
    }catch(e){msg.textContent='No se pudo generar: '+(e&&e.message||e)}
    finally{go.disabled=false;setTimeout(()=>{bar.hidden=true},1200)}
  }
  let tmr=null;
  function rhythmUI(){
    const sp=spd(),inn=inten(),m=modeNow();
    dlg.querySelector('#ma-spv').textContent=sp+'×';dlg.querySelector('#ma-inv').textContent=Math.round(inn*100)+'%';
    const off=m.intensity===false;dlg.querySelector('#ma-in').disabled=off;dlg.querySelector('#ma-in').closest('label').classList.toggle('off',off);
    dlg.querySelector('#ma-rn').textContent='Cada vuelta dura '+(MA.P/sp).toFixed(1).replace('.0','')+' s'+(off?' · en el deslizamiento solo cambia la velocidad':'')+'.';
  }
  function rhythmChange(){rhythmUI();setRhythm(spd(),inten(),'dlg');clearTimeout(tmr);tmr=setTimeout(preview,140)}
  function open(sp){
    spec=sp;ensure();
    dlg.querySelector('#ma-t').textContent=sp.title;dlg.querySelector('#ma-s').textContent=sp.sub;
    const fs=dlg.querySelector('#ma-modes');fs.hidden=sp.modes.length<2;
    fs.innerHTML='<legend>Animación</legend>'+sp.modes.map((m,i)=>'<label><input type="radio" name="ma-m" value="'+m.id+'"'+(i===0?' checked':'')+'> '+m.label+' <small>'+m.hint+'</small></label>').join('');
    dlg.querySelector('input[name="ma-f"][value="svg"]').checked=true;
    const same=sp.current()===sp.original();const org=dlg.querySelector('input[name="ma-c"][value="org"]'),cu=dlg.querySelector('input[name="ma-c"][value="cur"]');
    cu.checked=true;org.disabled=same;org.closest('label').style.opacity=same?.5:1;
    dlg.querySelector('.msg').textContent=same?'Estás usando los colores originales.':'';dlg.querySelector('.bar').hidden=true;
    dlg.querySelectorAll('input[name="ma-c"]').forEach(r=>r.onchange=preview);
    dlg.querySelectorAll('input[name="ma-m"]').forEach(r=>r.onchange=()=>{rhythmUI();preview()});
    dlg.querySelector('#ma-sp').value=RH.speed;dlg.querySelector('#ma-in').value=RH.intensity;
    dlg.querySelector('#ma-sp').oninput=dlg.querySelector('#ma-in').oninput=rhythmChange;
    dlg.querySelector('#ma-rr').onclick=()=>{dlg.querySelector('#ma-sp').value=1;dlg.querySelector('#ma-in').value=1;rhythmChange()};
    rhythmUI();
    dlg.querySelector('#ma-go').onclick=run;
    dlg.hidden=false;dlg.querySelector('#ma-go').focus({preventScroll:true});dlg.querySelector('.sd').scrollTop=0;preview();
  }
  MA.open=open;MA.slug=slug;

  /* ---------- elementos ---------- */
  const ORG_INK='#2B2A26',ORG_TILE='#FFFDF9',MK={};   // MK: número elegido por marcador
  const FRANJA=i=>MA.FP[i]!==undefined;
  function modesFor(i){
    const m=[{id:'aparicion',label:'Aparición',hint:'se dibuja trazo a trazo',opts:{}}];
    if(FRANJA(i)){
      m.push({id:'desliza-derecha',label:'Deslizar →',hint:'sin aparecer ni desaparecer, fija en el eje y',opts:{slide:{p:MA.FP[i],dir:1}},intensity:false});
      m.push({id:'desliza-izquierda',label:'Deslizar ←',hint:'mismo movimiento en sentido contrario',opts:{slide:{p:MA.FP[i],dir:-1}},intensity:false});
    }else if(MA.ICONS[i]&&!(i>=54&&i<=76)&&!(i>=117&&i<=121)){
      m.push({id:'movimiento',label:'Movimiento propio',hint:'se mueve como lo haría el objeto',opts:{alive:i}});
    }
    m.push({id:'deformacion',label:'Deformación',hint:'el elemento se estira y se comprime como un cuerpo blando',opts:{deform:true}});
    return m;
  }
  const origSvg=i=>RAW[i].replaceAll('currentColor',ORG_INK).replaceAll('var(--bg,#FFFDF9)',ORG_TILE);
  const _el=window.elSvg;
  function fixNum(s,i){
    const n=MK[i];if(n===undefined)return s;
    const fs={1:46,2:38,3:28,4:22}[n.length]||22;
    return s.replace(/(<text\b[^>]*?)font-size="[^"]*"([^>]*>)[^<]*(<\/text>)/,'$1font-size="'+fs+'"$2'+n+'$3');
  }
  window.elSvg=function(i){return fixNum(_el(i),i)};
  document.querySelectorAll('#pane-el figure.t').forEach(f=>{
    const acts=f.querySelector('.acts');const first=acts&&acts.querySelector('.cp');if(!first)return;
    const i=+first.dataset.i;const b=document.createElement('button');
    b.type='button';b.className='cp';b.dataset.k='anim';b.textContent='Descargar animado';acts.appendChild(b);
    const nm=()=>f.querySelector('.nm').textContent,num=()=>f.querySelector('.n').textContent;
    b.addEventListener('click',()=>{
      const mk=MK[i]!==undefined?'-n'+MK[i]:'';
      MA.open({title:nm()+(MK[i]!==undefined?' '+MK[i]:''),sub:'Elemento '+num()+(FRANJA(i)?' · puede deslizarse además de aparecer':''),bg:false,pw:512,ph:(()=>{const m=window.elSvg(i).match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);return Math.round(512*m[2]/m[1])})(),
        gw:360,gh:360,vw:720,vh:720,file:'muralia-elemento-'+num()+'-'+slug(nm())+mk,modes:modesFor(i),
        current:()=>window.elSvg(i),original:()=>fixNum(origSvg(i),i),
        bgCur:getComputedStyle(document.documentElement).getPropertyValue('--tile').trim()||ORG_TILE,bgOrg:ORG_TILE});
    });
    /* vista previa al pasar el cursor: aparición o movimiento propio */
    const pv=f.querySelector('.pv');let url=null,saved=null;
    pv.addEventListener('mouseenter',async()=>{
      const svg=pv.querySelector('svg');if(!svg)return;const r=svg.getBoundingClientRect();
      const ms=modesFor(i),m=ms[ms.length>1&&!FRANJA(i)?1:(FRANJA(i)?1:0)];
      let s=await MA.withFonts(MA.sized(window.elSvg(i),Math.round(r.width*2),Math.round(r.height*2)));
      if(!pv.matches(':hover'))return;
      saved=pv.innerHTML;url=URL.createObjectURL(new Blob([MA.animate(s,Object.assign({bg:false},MA.ropts(),m.opts))],{type:'image/svg+xml'}));
      pv.innerHTML='<img class="hv" alt="" src="'+url+'" style="width:'+r.width+'px;height:'+r.height+'px">';
    });
    pv.addEventListener('mouseleave',()=>{if(saved!==null){pv.innerHTML=saved;saved=null}if(url){URL.revokeObjectURL(url);url=null}});
    /* marcadores: número editable */
    if(i===122||i===123){
      const w=document.createElement('div');w.className='mkn';
      w.innerHTML='<span>N.º</span><input type="text" inputmode="numeric" maxlength="3" value="01" aria-label="Número del marcador"><label><input type="checkbox" checked> cero inicial</label>';
      acts.parentNode.insertBefore(w,acts);
      const inp=w.querySelector('input[type=text]'),chk=w.querySelector('input[type=checkbox]');
      const upd=()=>{
        const d=inp.value.replace(/\D/g,'').slice(0,3)||'0';const t=chk.checked&&d.length<2?d.padStart(2,'0'):d;MK[i]=t;
        const tx=pv.querySelector('svg text');if(tx){tx.textContent=t;tx.setAttribute('font-size',{1:46,2:38,3:28}[t.length]||22)}
      };
      inp.addEventListener('input',()=>{inp.value=inp.value.replace(/\D/g,'').slice(0,3);upd()});chk.addEventListener('change',upd);upd();
    }
  });
  /* ---------- fondos de pantalla ---------- */
  window.openWpAnim=function(w,cur,fmt){
    const h=fmt==='h',num=String(w.n).padStart(2,'0'),org=w[fmt].replace(/§(\d+)§/g,(a,k)=>w.c[+k]);
    MA.open({title:w.name,sub:'Fondo '+num+' · '+(h?'horizontal 1920 × 1080':'vertical 1080 × 1920'),bg:true,
      pw:h?960:540,ph:h?540:960,gw:h?640:360,gh:h?360:640,vw:h?960:540,vh:h?540:960,
      file:'muralia-fondo-'+num+'-'+slug(w.name)+'-'+(h?'horizontal':'vertical'),
      modes:[{id:'segun-diseno',label:'Según su diseño',hint:'se mueve como el dibujo sugiere',opts:{recipe:w.slug}},{id:'aparicion',label:'Aparición',hint:'se dibuja o aparece',opts:{}},{id:'deformacion',label:'Deformación',hint:'las piezas y las tramas se estiran como un cuerpo blando',opts:{deformWall:true}}],
      current:()=>cur,original:()=>org,bgCur:'#FFFDF9',bgOrg:'#FFFDF9'});
  };
  const ea=document.getElementById('ed-anim');
  if(ea)ea.addEventListener('click',()=>{
    const pv=document.getElementById('ed-pv'),fmt=pv.classList.contains('h')?'h':'v';
    const t=document.getElementById('ed-t').textContent,m=t.match(/^(\d+)\s*·\s*(.*)$/)||[0,'00',t];
    const w=WP.find(x=>String(x.n).padStart(2,'0')===m[1]&&x.name===m[2]);
    if(w)openWpAnim(w,pv.innerHTML,fmt);
  });

  /* ---------- vista previa animada de fondos (sin descargar) ---------- */
  const live={
    active:new Set(),
    async start(th,slug,pin){
      if(th._saved!==undefined){if(pin)th._pin=true;return}
      const svg=th.querySelector('svg');if(!svg)return;const r=svg.getBoundingClientRect();
      th._saved=th.innerHTML;th._pin=!!pin;live.active.add(th);
      const s=await MA.withFonts(MA.sized(th._saved,Math.round(r.width*2),Math.round(r.height*2)));
      if(th._saved===undefined)return;                    // se salió antes de que terminara de preparar
      const fmtH=th.classList.contains('h')||r.width>r.height;
      th._url=URL.createObjectURL(new Blob([MA.animate(s,Object.assign({bg:true,recipe:slug},MA.ropts()))],{type:'image/svg+xml'}));
      th.innerHTML='<img alt="" src="'+th._url+'" style="display:block;width:100%;height:auto">';
    },
    stop(th){
      if(th._saved===undefined)return;
      th.innerHTML=th._saved;th._saved=undefined;th._pin=false;live.active.delete(th);
      if(th._url){URL.revokeObjectURL(th._url);th._url=null}
    },
    toggle(th,slug,btn){
      if(th._saved!==undefined&&th._pin){live.stop(th);btn.textContent='Vista animada'}
      else{live.stop(th);live.start(th,slug,true);btn.textContent='Detener vista'}
    }
  };

  /* controles de ritmo (velocidad / intensidad) para las vistas animadas de fondos */
  function rhythmBox(cls){
    const d=document.createElement('div');d.className='rit '+(cls||'');
    d.innerHTML='<b>Ritmo</b><label>Velocidad <input type="range" min="0.5" max="3" step="0.25" data-r="s"><output></output></label><label>Intensidad <input type="range" min="0" max="2" step="0.25" data-r="i"><output></output></label><button type="button" class="btn2">Restablecer</button>';
    const sI=d.querySelector('[data-r=s]'),iI=d.querySelector('[data-r=i]'),os=sI.nextElementSibling,oi=iI.nextElementSibling;
    const sync=src=>{sI.value=RH.speed;iI.value=RH.intensity;os.textContent=RH.speed+'×';oi.textContent=Math.round(RH.intensity*100)+'%'};
    sync();RH.subs.push(src=>{if(src!==d)sync()});
    const ch=()=>{setRhythm(+sI.value,+iI.value,d);sync()};
    sI.addEventListener('input',ch);iI.addEventListener('input',ch);
    d.querySelector('button').addEventListener('click',()=>{setRhythm(1,1,d);sync()});
    return d;
  }
  const rs=document.createElement('style');
  rs.textContent='.rit{display:flex;flex-wrap:wrap;gap:6px 14px;align-items:center;font:600 12px Archivo,sans-serif;color:#5a594f}.rit b{font:700 12px Archivo;letter-spacing:1.2px;text-transform:uppercase;color:#9C4318}.rit label{display:flex;gap:6px;align-items:center;font-weight:500}.rit input[type=range]{width:96px;accent-color:#C2551F}.rit output{min-width:38px;font-weight:700;color:#2B2A26}.rit.ed{grid-column:1/-1;margin-top:4px}';
  document.head.appendChild(rs);
  const pe=document.getElementById('pane-el');
  if(pe){const r=rhythmBox('el');r.style.cssText='padding:14px 0 4px';const hint=document.createElement('span');hint.textContent='Se aplica a las vistas animadas y al diálogo «Descargar animado».';r.appendChild(hint);pe.insertBefore(r,pe.firstChild)}
  const wt=document.querySelector('#fondos .wp-head');
  if(wt){const r=rhythmBox('wp');r.style.marginTop='8px';wt.appendChild(r)}
  RH.subs.push(src=>{
    if(src==='dlg')return;
    [...live.active].forEach(th=>{const f=th.closest('.w');if(!f)return;const pin=th._pin,sl=WP[+f.dataset.i].slug;live.stop(th);live.start(th,sl,pin)});
    if(window._edLiveOn)window._edLiveOn();
  });
  MA.live=live;
  const wg=document.getElementById('wgrid');
  if(wg){
    wg.addEventListener('mouseover',e=>{const th=e.target.closest('.th');if(!th||th._saved!==undefined)return;const f=th.closest('.w');if(f)live.start(th,WP[+f.dataset.i].slug,false)});
    wg.addEventListener('mouseout',e=>{const th=e.target.closest('.th');if(!th||th._pin)return;if(e.relatedTarget&&th.contains(e.relatedTarget))return;live.stop(th)});
    wg.addEventListener('focusin',e=>{const th=e.target.closest&&e.target.closest('.th');if(th&&th._saved===undefined){const f=th.closest('.w');if(f)live.start(th,WP[+f.dataset.i].slug,false)}});
    wg.addEventListener('focusout',e=>{const th=e.target.closest&&e.target.closest('.th');if(th&&!th._pin)live.stop(th)});
  }
  /* en el editor de colores: botón para ver el fondo animado con los colores que estás probando */
  const acts=document.querySelector('#ed .ed-acts:last-of-type');
  if(acts&&!document.getElementById('ed-live')){
    const b=document.createElement('button');b.type='button';b.className='btn2';b.id='ed-live';b.textContent='Vista animada';acts.insertBefore(b,acts.firstChild);
    const pv=document.getElementById('ed-pv');let on=false,url=null;
    const show=async()=>{
      const t=document.getElementById('ed-t').textContent,m=t.match(/^(\d+)\s*·\s*(.*)$/);
      const w=m&&WP.find(x=>String(x.n).padStart(2,'0')===m[1]&&x.name===m[2]);if(!w)return;
      const svg=pv.querySelector('svg');if(!svg){if(!pv._live)return}
      const r=svg?svg.getBoundingClientRect():{width:pv._w,height:pv._h};pv._w=r.width;pv._h=r.height;
      if(svg)pv._live=pv.innerHTML;
      const s2=await MA.withFonts(MA.sized(pv._live,Math.round(r.width*2),Math.round(r.height*2)));
      if(url)URL.revokeObjectURL(url);
      url=URL.createObjectURL(new Blob([MA.animate(s2,Object.assign({bg:true,recipe:w.slug},MA.ropts()))],{type:'image/svg+xml'}));
      pv.innerHTML='<img alt="" src="'+url+'" style="display:block;max-width:100%;max-height:70vh;width:auto;height:auto">';
      b.textContent='Ver estático';on=true;
    };
    window._edLiveOn=()=>{if(on)show()};
    b.addEventListener('click',()=>{
      if(on){pv.innerHTML=pv._live;pv._live=null;on=false;b.textContent='Vista animada';if(url){URL.revokeObjectURL(url);url=null}return}
      show();
    });
    const box=rhythmBox('ed');acts.parentNode.insertBefore(box,acts.nextSibling);
    /* si cambian los colores mientras está animado, el editor vuelve a la imagen fija */
    new MutationObserver(()=>{if(on&&!pv.querySelector('img')){on=false;b.textContent='Vista animada'}}).observe(pv,{childList:true});
  }
})();
