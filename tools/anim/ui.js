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
    st.textContent=`
    #ma{position:fixed;inset:0;background:rgba(43,42,38,.62);backdrop-filter:blur(2px);z-index:70;display:grid;place-items:center;padding:16px}
    #ma[hidden]{display:none}
    #ma .box{background:#FFFDF9;width:min(880px,100%);max-height:calc(100vh - 32px);display:grid;grid-template-columns:minmax(0,1fr) minmax(0,380px);box-shadow:0 18px 50px rgba(0,0,0,.28);overflow:hidden}
    @media(max-width:720px){#ma .box{grid-template-columns:1fr;overflow:auto}#ma .pv{min-height:220px}}
    #ma .pv{background:#EFE7DA;display:grid;place-items:center;padding:28px;position:relative;min-height:300px;height:auto}
    #ma .pv img{max-width:100%;max-height:calc(100vh - 120px);display:block;background:#FFFDF9;box-shadow:0 0 0 1px #DDD5C4}
    #ma .rs{position:absolute;left:12px;top:12px;height:28px;padding:0 10px;border:1px solid #DDD5C4;background:#FFFDF9;font:600 11px Archivo,sans-serif;color:#5a594f;cursor:pointer;display:inline-flex;align-items:center;gap:6px;border-radius:2px}
    #ma .rs:hover{border-color:#C2551F;color:#9C4318}
    #ma .sd{display:flex;flex-direction:column;min-height:0;max-height:calc(100vh - 32px)}
    #ma .hd{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:18px 20px 12px;border-bottom:1px solid #EFE7DA}
    #ma h3{font:400 28px/1 "Bebas Neue",sans-serif;margin:0;color:#2B2A26}
    #ma .sub{font-size:12px;color:#5a594f;margin-top:4px}
    #ma .x{appearance:none;width:30px;height:30px;flex:none;border:1px solid #DDD5C4;background:#FFFDF9;cursor:pointer;font:400 18px/1 Archivo,sans-serif;color:#5a594f;border-radius:2px}
    #ma .x:hover{border-color:#C2551F;color:#9C4318}
    #ma .bd{padding:14px 20px;display:flex;flex-direction:column;gap:16px;overflow:auto;flex:1}
    #ma fieldset{border:0;padding:0;margin:0;display:grid;gap:7px;min-width:0}
    #ma legend{font:700 11px Archivo,sans-serif;letter-spacing:1.4px;text-transform:uppercase;color:#9C4318;margin-bottom:7px;padding:0}
    #ma .seg{display:grid;grid-auto-flow:column;grid-auto-columns:1fr;border:1px solid #DDD5C4;border-radius:2px;overflow:hidden}
    #ma .seg label{position:relative;display:flex;align-items:center;justify-content:center;text-align:center;height:34px;padding:0 6px;font:600 12px/1.1 Archivo,sans-serif;color:#5a594f;cursor:pointer;border-left:1px solid #DDD5C4;background:#FFFDF9;transition:background .15s,color .15s}
    #ma .seg label:first-child{border-left:0}
    #ma .seg label:hover{background:#f6f1e8;color:#2B2A26}
    #ma .seg input{position:absolute;opacity:0;pointer-events:none}
    #ma .seg label:has(input:checked){background:#2B2A26;color:#FFFDF9}
    #ma .seg label:has(input:disabled){opacity:.4;cursor:not-allowed}
    #ma .seg label:has(input:focus-visible){outline:2px solid #C2551F;outline-offset:-2px}
    #ma .hint{font-size:11.5px;color:#5a594f;min-height:1.2em}
    #ma .sl{display:grid;grid-template-columns:76px 1fr 46px;gap:10px;align-items:center;font:500 12px Archivo,sans-serif;color:#2B2A26}
    #ma .sl input{width:100%;accent-color:#C2551F}
    #ma .sl b{height:22px;display:inline-flex;align-items:center;justify-content:center;background:#EFE7DA;font:700 11.5px Archivo,sans-serif;border-radius:2px}
    #ma .sl.off{opacity:.45}
    #ma .rrow{display:flex;justify-content:space-between;align-items:center;gap:10px}
    #ma .lnk{appearance:none;border:0;background:none;padding:0;font:600 11.5px Archivo,sans-serif;color:#5a594f;cursor:pointer;text-decoration:underline;text-underline-offset:3px}
    #ma .lnk:hover{color:#9C4318}
    #ma .ft{padding:12px 20px 16px;border-top:1px solid #EFE7DA;display:grid;gap:8px;background:#FFFDF9}
    #ma .go{appearance:none;height:40px;border:0;background:#2B2A26;color:#FFFDF9;font:700 13px Archivo,sans-serif;letter-spacing:.3px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:8px;border-radius:2px}
    #ma .go:hover{background:#9C4318}
    #ma .go:disabled{opacity:.6;cursor:wait}
    #ma .go::before{content:"";width:14px;height:14px;background:currentColor;-webkit-mask:var(--dl) center/contain no-repeat;mask:var(--dl) center/contain no-repeat}
    #ma .bar{height:4px;background:#EFE7DA;border-radius:2px;overflow:hidden}#ma .bar i{display:block;height:100%;width:0;background:#C2551F;transition:width .1s}
    #ma .msg{font-size:11.5px;color:#5a594f;min-height:1.1em}
    `;
    document.head.appendChild(st);
    dlg=document.createElement('div');dlg.id='ma';dlg.hidden=true;
    dlg.innerHTML='<div class="box" role="dialog" aria-modal="true" aria-labelledby="ma-t"><div class="pv"><img alt="Vista previa animada"><button type="button" class="rs" id="ma-rs">↻ Reiniciar</button></div><div class="sd">'
     +'<div class="hd"><div><h3 id="ma-t"></h3><div class="sub" id="ma-s"></div></div><button type="button" class="x" id="ma-x" aria-label="Cerrar">×</button></div>'
     +'<div class="bd">'
     +'<fieldset id="ma-modes"><legend>Animación</legend></fieldset>'
     +'<fieldset id="ma-rhythm"><legend>Ritmo</legend>'
     +'<label class="sl"><span>Velocidad</span><input type="range" id="ma-sp" min="0.5" max="3" step="0.25" value="1"><b id="ma-spv">1×</b></label>'
     +'<label class="sl"><span>Intensidad</span><input type="range" id="ma-in" min="0" max="2" step="0.25" value="1"><b id="ma-inv">100%</b></label>'
     +'<div class="rrow"><span class="hint" id="ma-rn"></span><button type="button" class="lnk" id="ma-rr">Restablecer</button></div></fieldset>'
     +'<fieldset><legend>Formato</legend><div class="seg"><label><input type="radio" name="ma-f" value="svg" checked>SVG</label><label><input type="radio" name="ma-f" value="gif">GIF</label><label><input type="radio" name="ma-f" value="vid">Video</label></div><div class="hint" id="ma-fh"></div></fieldset>'
     +'<fieldset><legend>Colores</legend><div class="seg"><label><input type="radio" name="ma-c" value="cur" checked>Los que elegí</label><label><input type="radio" name="ma-c" value="org">Originales</label></div></fieldset>'
     +'</div>'
     +'<div class="ft"><div class="bar" hidden><i></i></div><div class="msg" role="status"></div><button type="button" class="go" id="ma-go">Descargar</button></div>'
     +'</div></div>';
    dlg.style.setProperty('--dl',MA.lookIcons?MA.lookIcons.down:'none');
    document.body.appendChild(dlg);
    const FH={svg:'Vectorial y liviano, para la web.',gif:'Funciona en cualquier lugar (presentaciones, correo, redes).',vid:'MP4 o WebM según tu navegador, para redes sociales.'};
    const fh=()=>{dlg.querySelector('#ma-fh').textContent=FH[dlg.querySelector('input[name="ma-f"]:checked').value]};
    dlg.querySelectorAll('input[name="ma-f"]').forEach(r=>r.addEventListener('change',fh));fh();
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
    const mh=dlg.querySelector('#ma-mh');if(mh)mh.textContent=m.label+': '+m.hint+'.';
    dlg.querySelector('#ma-spv').textContent=sp+'×';dlg.querySelector('#ma-inv').textContent=Math.round(inn*100)+'%';
    const off=m.intensity===false;dlg.querySelector('#ma-in').disabled=off;dlg.querySelector('#ma-in').closest('label').classList.toggle('off',off);
    dlg.querySelector('#ma-rn').textContent='Vuelta de '+(MA.P/sp).toFixed(1).replace('.0','')+' s'+(off?' · aquí solo cambia la velocidad':'');
  }
  function rhythmChange(){rhythmUI();setRhythm(spd(),inten(),'dlg');clearTimeout(tmr);tmr=setTimeout(preview,140)}
  function open(sp){
    spec=sp;ensure();
    dlg.querySelector('#ma-t').textContent=sp.title;dlg.querySelector('#ma-s').textContent=sp.sub;
    const fs=dlg.querySelector('#ma-modes');fs.hidden=sp.modes.length<2;dlg.querySelector('.bd').scrollTop=0;
    const SH={aparicion:'Aparece',movimiento:'Movimiento','desliza-derecha':'Desliza →','desliza-izquierda':'Desliza ←',deformacion:'Deformación','segun-diseno':'Su diseño'};
    fs.innerHTML='<legend>Animación</legend><div class="seg">'+sp.modes.map((m,i)=>'<label title="'+m.hint+'"><input type="radio" name="ma-m" value="'+m.id+'"'+((sp.defaultMode&&sp.modes.some(x=>x.id===sp.defaultMode)?m.id===sp.defaultMode:i===0)?' checked':'')+'>'+(SH[m.id]||m.label)+'</label>').join('')+'</div><div class="hint" id="ma-mh"></div>';
    dlg.querySelector('input[name="ma-f"][value="svg"]').checked=true;
    const same=sp.current()===sp.original();const org=dlg.querySelector('input[name="ma-c"][value="org"]'),cu=dlg.querySelector('input[name="ma-c"][value="cur"]');
    cu.checked=true;org.disabled=same;
    dlg.querySelector('.msg').textContent=same?'Estás usando los colores originales.':'';dlg.querySelector('.bar').hidden=true;
    dlg.querySelectorAll('input[name="ma-c"]').forEach(r=>r.onchange=preview);
    dlg.querySelectorAll('input[name="ma-m"]').forEach(r=>r.onchange=()=>{rhythmUI();preview()});
    dlg.querySelector('#ma-sp').value=RH.speed;dlg.querySelector('#ma-in').value=RH.intensity;
    dlg.querySelector('#ma-sp').oninput=dlg.querySelector('#ma-in').oninput=rhythmChange;
    dlg.querySelector('#ma-rr').onclick=()=>{dlg.querySelector('#ma-sp').value=1;dlg.querySelector('#ma-in').value=1;rhythmChange()};
    rhythmUI();
    dlg.querySelector('#ma-go').onclick=run;
    dlg.hidden=false;dlg.querySelector('#ma-go').focus({preventScroll:true});preview();
  }
  MA.open=open;MA.slug=slug;

  /* ---------- elementos ---------- */
  const cst=document.createElement('style');
  cst.textContent='.anm{display:flex;gap:4px;flex-wrap:wrap;align-items:center;grid-column:1/-1;margin:2px 0 4px}.anm span{font:700 11px Archivo,sans-serif;color:#9C4318;margin-right:2px;letter-spacing:.6px;text-transform:uppercase}.anm button{appearance:none;border:1px solid #DDD5C4;background:#FFFDF9;font:700 11px Archivo,sans-serif;padding:3px 8px;cursor:pointer;color:#2B2A26}.anm button:hover{border-color:#C2551F}.anm button[aria-pressed="true"]{background:#2B2A26;color:#FFFDF9;border-color:#2B2A26}';
  document.head.appendChild(cst);
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
    m.push({id:'deformacion',label:'Deformación',hint:'el contorno cambia de forma según lo que representa',opts:{deform:true,icon:i}});
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
      MA.open({defaultMode:f._modeSel&&f._modeSel(),title:nm()+(MK[i]!==undefined?' '+MK[i]:''),sub:'Elemento '+num()+(FRANJA(i)?' · puede deslizarse además de aparecer':''),bg:false,pw:512,ph:(()=>{const m=window.elSvg(i).match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);return Math.round(512*m[2]/m[1])})(),
        gw:360,gh:360,vw:720,vh:720,file:'muralia-elemento-'+num()+'-'+slug(nm())+mk,modes:modesFor(i),
        current:()=>window.elSvg(i),original:()=>fixNum(origSvg(i),i),
        bgCur:getComputedStyle(document.documentElement).getPropertyValue('--tile').trim()||ORG_TILE,bgOrg:ORG_TILE});
    });
    /* elegir y ver cada animación directamente en la tarjeta (sin abrir el diálogo) */
    const pv=f.querySelector('.pv');let url=null,saved=null,pinned=false,sel=null;
    const ms=modesFor(i),SHORT={aparicion:'Aparición',movimiento:'Movimiento','desliza-derecha':'Deslizar →','desliza-izquierda':'Deslizar ←',deformacion:'Deformación'};
    const dflt=()=>(ms.find(m=>m.id==='movimiento')||ms.find(m=>/^desliza/.test(m.id))||ms[0]).id;
    const chips=document.createElement('div');chips.className='anm';chips.setAttribute('role','group');chips.setAttribute('aria-label','Tipo de animación');
    chips.innerHTML='<span>Ver:</span>'+ms.map(m=>'<button type="button" data-m="'+m.id+'" aria-pressed="false" title="'+m.hint+'">'+SHORT[m.id]+'</button>').join('');
    acts.parentNode.insertBefore(chips,acts);
    const stop=()=>{if(saved!==null){pv.innerHTML=saved;saved=null}if(url){URL.revokeObjectURL(url);url=null}};
    async function play(id,pin){
      const m=ms.find(x=>x.id===id)||ms[0];stop();const svg=pv.querySelector('svg');if(!svg)return;const r=svg.getBoundingClientRect();
      const s2=await MA.withFonts(MA.sized(window.elSvg(i),Math.round(r.width*2),Math.round(r.height*2)));
      if(!pin&&!pv.matches(':hover'))return;if(pin&&!pinned)return;
      saved=pv.innerHTML;url=URL.createObjectURL(new Blob([MA.animate(s2,Object.assign({bg:false},MA.ropts(),m.opts))],{type:'image/svg+xml'}));
      pv.innerHTML='<img class="hv" alt="" src="'+url+'" style="width:'+r.width+'px;height:'+r.height+'px">';
    }
    chips.querySelectorAll('button').forEach(c=>c.addEventListener('click',()=>{
      const same=c.getAttribute('aria-pressed')==='true';
      chips.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed','false'));
      if(same){sel=null;pinned=false;stop();return}
      sel=c.dataset.m;c.setAttribute('aria-pressed','true');pinned=true;play(sel,true);
    }));
    pv.addEventListener('mouseenter',()=>{if(!pinned)play(sel||dflt(),false)});
    pv.addEventListener('mouseleave',()=>{if(!pinned)stop()});
    b.addEventListener('click',()=>{/* el diálogo parte con la animación elegida en las pestañas */});
    f._modeSel=()=>sel;
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
      if(th._saved!==undefined&&th._pin){live.stop(th);btn.textContent='Ver animado';btn.setAttribute('aria-pressed','false')}
      else{live.stop(th);live.start(th,slug,true);btn.textContent='Detener vista';btn.setAttribute('aria-pressed','true')}
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
  if(wt){const r=rhythmBox('wp');r.style.marginTop='8px';wt.after(r)}
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
