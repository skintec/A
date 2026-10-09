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
      el.setAttribute('style',(old?old.replace(/;?\s*$/,';'):'')+extra+'animation:'+name+' '+P+'s cubic-bezier(.5,0,.2,1) '+(k*step).toFixed(3)+'s infinite both;');
    });
    if(opts.bg){
      svg.querySelectorAll('pattern').forEach(p=>{
        const w=parseFloat(p.getAttribute('width'));if(!(w>0))return;
        const a=doc.createElementNS('http://www.w3.org/2000/svg','animateTransform');
        a.setAttribute('attributeName','patternTransform');a.setAttribute('type','translate');a.setAttribute('from','0 0');a.setAttribute('to',w+' 0');
        a.setAttribute('dur','12s');a.setAttribute('repeatCount','indefinite');a.setAttribute('additive','sum');p.appendChild(a);
      });
    }
    const st=doc.createElementNS('http://www.w3.org/2000/svg','style');st.textContent=KF;svg.insertBefore(st,svg.firstChild);
    return new XMLSerializer().serializeToString(svg);
  }
  function slug(s){return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}
  function dl(str,name){
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([str],{type:'image/svg+xml'}));a.download=name;
    document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),3000);
  }
  function flash(b){const t=b.dataset.label||(b.dataset.label=b.textContent);b.textContent='Descargado';clearTimeout(b._t);b._t=setTimeout(()=>b.textContent=t,1600)}
  return {
    animate,
    el(b,svgStr,num,name){
      const s=svgStr.replace('<svg ','<svg width="512" height="512" ');
      dl(animate(s,{}),'muralia-icono-'+num+'-'+slug(name)+'-animado.svg');flash(b);
    },
    wp(b,svgStr,num,name,fmt){
      dl(animate(svgStr,{bg:true}),'muralia-fondo-'+num+'-'+slug(name)+'-'+(fmt==='h'?'horizontal':'vertical')+'-animado.svg');flash(b);
    }
  };
})();
(function(){
  document.querySelectorAll('#pane-el figure.t').forEach(f=>{
    const acts=f.querySelector('.acts');const first=acts&&acts.querySelector('.cp');if(!first)return;
    const i=+first.dataset.i;const b=document.createElement('button');
    b.type='button';b.className='cp';b.dataset.k='anim';b.textContent='Descargar animado';acts.appendChild(b);
    b.addEventListener('click',()=>MA.el(b,elSvg(i),f.querySelector('.n').textContent,f.querySelector('.nm').textContent));
  });
  const ea=document.getElementById('ed-anim');
  if(ea)ea.addEventListener('click',()=>{
    const pv=document.getElementById('ed-pv');const t=document.getElementById('ed-t').textContent;
    const m=t.match(/^(\d+)\s*·\s*(.*)$/)||[0,'00',t];
    MA.wp(ea,pv.innerHTML,m[1],m[2],pv.classList.contains('h')?'h':'v');
  });
})();
