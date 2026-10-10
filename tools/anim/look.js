/* Capa de diseño: botones, opciones y menús más ordenados (controles segmentados, barras de acciones compactas, íconos de acción). */
(function(){
  const ic=p=>'url("data:image/svg+xml,'+encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'>"+p+"</svg>")+'")';
  const I={
    copy:ic("<path d='M5.5 5.5h7v7h-7z M3.5 10.5v-7h7' fill='none' stroke='black' stroke-width='1.6'/>"),
    down:ic("<path d='M8 2.5v7.5M4.8 7 8 10.2 11.2 7M3 13.2h10' fill='none' stroke='black' stroke-width='1.6'/>"),
    play:ic("<path d='M4.5 3l8.5 5-8.5 5z' fill='black'/>"),
    stop:ic("<rect x='4' y='4' width='8' height='8' fill='black'/>"),
    edit:ic("<path d='M3 13l.8-3.2 6.7-6.7 2.4 2.4-6.7 6.7z' fill='none' stroke='black' stroke-width='1.5'/>"),
    reset:ic("<path d='M4 4.5A5 5 0 1 1 3.2 9' fill='none' stroke='black' stroke-width='1.6'/><path d='M2.5 2.5v3.5H6' fill='none' stroke='black' stroke-width='1.6'/>")
  };
  const css=`
  :root{--ml-h:30px}
  /* botón base */
  .mlb,#pane-el .t .acts .cp,#wgrid .w .acts .cp{appearance:none;display:inline-flex;align-items:center;justify-content:center;gap:6px;height:var(--ml-h);padding:0 10px;
    border:1px solid var(--line);background:var(--paper);color:var(--graphite);font:600 11.5px/1 'Archivo',sans-serif;letter-spacing:.2px;cursor:pointer;white-space:nowrap;
    transition:border-color .15s,background .15s,color .15s;text-decoration:none;border-radius:2px;min-width:0}
  .mlb:hover,#pane-el .t .acts .cp:hover,#wgrid .w .acts .cp:hover{border-color:var(--clay);color:var(--clay-dark)}
  .mlb:focus-visible,#pane-el .t .acts .cp:focus-visible,#wgrid .w .acts .cp:focus-visible{outline:2px solid var(--clay);outline-offset:1px}
  .ml-ico::before{content:"";width:13px;height:13px;flex:none;background:currentColor;-webkit-mask:var(--i) center/contain no-repeat;mask:var(--i) center/contain no-repeat}
  /* tarjetas de elementos */
  #pane-el .t figcaption{row-gap:8px;padding:10px 10px 12px}
  #pane-el .t .acts{display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-top:0;grid-column:1/-1}
  #pane-el .t .acts .cp{grid-column:auto;justify-self:stretch;border-bottom:1px solid var(--line);padding:0 6px;font-size:11px}
  #pane-el .t .acts .cp[data-k="anim"]{grid-column:1/-1;background:var(--graphite);color:var(--paper);border-color:var(--graphite)}
  #pane-el .t .acts .cp[data-k="anim"]:hover{background:var(--clay-dark);border-color:var(--clay-dark);color:var(--paper)}
  .t.wide .acts{grid-template-columns:repeat(3,max-content)!important}
  .t.wide .acts .cp[data-k="anim"]{grid-column:auto!important}
  #pane-el .t figcaption>.anm,#pane-el .t figcaption>.mkn,#pane-el .t figcaption>.acts{grid-column:1/-1}
  /* selector de animación: control segmentado */
  .anm{display:grid!important;grid-auto-flow:column;grid-auto-columns:1fr;gap:0!important;border:1px solid var(--line);border-radius:2px;overflow:hidden;margin:0!important;background:var(--paper)}
  .anm span{display:none}
  .anm button{border:0!important;border-left:1px solid var(--line)!important;border-radius:0!important;height:26px;padding:0 4px!important;font:600 10.5px/1 'Archivo',sans-serif!important;color:#6b6a60!important;background:transparent!important;cursor:pointer}
  .anm button:first-of-type{border-left:0!important}
  .anm button:hover{color:var(--clay-dark)!important;background:#f6f1e8!important}
  .anm button[aria-pressed="true"]{background:var(--graphite)!important;color:var(--paper)!important}
  .t.wide .anm{max-width:420px}
  /* marcador: número */
  .mkn{display:flex!important;gap:8px!important;align-items:center;font:600 11px 'Archivo',sans-serif!important}
  .mkn input[type=text]{height:26px;width:52px!important;border:1px solid var(--line)!important;border-radius:2px;font:700 13px 'Archivo'!important;text-align:center}
  .mkn input[type=text]:focus{outline:2px solid var(--clay);outline-offset:0}
  .mkn label{font-weight:500!important;color:var(--muted)}
  .mkn input[type=checkbox]{accent-color:var(--clay)}
  /* tarjetas de fondos */
  #wgrid .w figcaption{row-gap:8px;padding:10px 10px 12px}
  #wgrid .w .acts{display:grid;grid-template-columns:1fr 1fr;gap:4px;grid-column:1/-1}
  #wgrid .w .acts .cp{grid-column:auto;justify-self:stretch;padding:0 6px;font-size:11px}
  #wgrid .w .acts .cp[data-k="ed"]{order:-2;grid-column:1/-1;justify-content:flex-start;height:24px;border-color:transparent;background:transparent;padding:0;color:var(--muted)}
  #wgrid .w .acts .cp[data-k="ed"]:hover{color:var(--clay-dark)}
  #wgrid .w .acts .cp[data-k="live"]{order:1;grid-column:1/-1}
  #wgrid .w .acts .cp[data-k="anim"]{order:2}
  #wgrid .w .acts .cp[data-k="anim"]{grid-column:1/-1;background:var(--graphite);color:var(--paper);border-color:var(--graphite)}
  #wgrid .w .acts .cp[data-k="anim"]:hover{background:var(--clay-dark);border-color:var(--clay-dark);color:var(--paper)}
  #wgrid .w .acts .cp[data-k="live"][aria-pressed="true"]{border-color:var(--clay);color:var(--clay-dark)}
  .cp[data-k="png"],.cp[data-k="svg"]{--i:${I.copy}}
  .cp[data-k="anim"]{--i:${I.down}}
  .cp[data-k="live"]{--i:${I.play}}
  .cp[data-k="live"][aria-pressed="true"]{--i:${I.stop}}
  .cp[data-k="ed"]{--i:${I.edit}}
  /* barra de ritmo */
  .rit{display:flex!important;flex-wrap:wrap;align-items:center;gap:8px 18px!important;padding:10px 14px!important;background:var(--paper);border:1px solid var(--line);border-radius:2px;font:500 12px 'Archivo',sans-serif!important;color:var(--graphite)!important}
  .rit b{font:700 11px 'Archivo',sans-serif!important;letter-spacing:1.4px!important;color:var(--clay-dark)!important;margin-right:-4px}
  .rit label{gap:8px!important}
  .rit input[type=range]{width:110px!important;accent-color:var(--clay)}
  .rit output{min-width:42px;height:22px;display:inline-flex;align-items:center;justify-content:center;background:var(--plaster);font:700 11.5px 'Archivo'!important;border-radius:2px}
  .rit button{appearance:none;display:inline-flex;align-items:center;gap:6px;height:26px;padding:0 10px;border:1px solid var(--line);background:transparent;font:600 11px 'Archivo';color:var(--muted);cursor:pointer;border-radius:2px}
  .rit button:hover{border-color:var(--clay);color:var(--clay-dark)}
  .rit button::before{content:"";width:12px;height:12px;background:currentColor;-webkit-mask:${I.reset} center/contain no-repeat;mask:${I.reset} center/contain no-repeat}
  .rit span{font-size:11.5px;color:var(--muted);margin-left:auto}
  #pane-el>.rit{margin-top:22px}
  #fondos .wp-head .rit{width:100%}
  /* editor de colores de fondos */
  #ed .ed-side{gap:18px}
  #ed .edg{display:grid;gap:8px}
  #ed .edg>b{font-size:12px;letter-spacing:1.2px;text-transform:uppercase;color:var(--clay-dark)}
  #ed .ed-acts{gap:6px}
  #ed .ed-acts .btn2{height:32px;padding:0 12px;font-size:12px;display:inline-flex;align-items:center;gap:6px;border-radius:2px}
  #ed .edg.exp .ed-acts{display:grid;grid-template-columns:1fr 1fr 1.3fr}
  #ed .edg.exp .ed-acts .btn2{justify-content:center}
  #ed .rit.ed{padding:8px 12px!important}
  #ed-png,#ed-svg{--i:${I.copy}} #ed-anim{--i:${I.down}} #ed-live{--i:${I.play}}
  #ed-png::before,#ed-svg::before,#ed-anim::before,#ed-live::before{content:"";width:13px;height:13px;background:currentColor;-webkit-mask:var(--i) center/contain no-repeat;mask:var(--i) center/contain no-repeat}
  `;
  const st=document.createElement('style');st.id='ml-look';st.textContent=css;document.head.appendChild(st);
  /* textos cortos y claros en las tarjetas de elementos (con título descriptivo) */
  const L={png:['PNG','Copiar PNG'],svg:['SVG','Copiar SVG'],anim:['Descargar animado','Descargar animado (SVG, GIF o video)']};
  document.querySelectorAll('#pane-el .t .acts .cp').forEach(b=>{const k=b.dataset.k;if(!L[k])return;b.textContent=L[k][0];b.dataset.label=L[k][0];b.title=L[k][1];b.setAttribute('aria-label',L[k][1]);b.classList.add('ml-ico')});
  document.querySelectorAll('.anm button').forEach(b=>{const m=b.dataset.m;const t={aparicion:'Aparece',movimiento:'Mueve',deformacion:'Deforma','desliza-derecha':'Desliza →','desliza-izquierda':'Desliza ←'}[m];if(t){b.title=(b.title?b.title+' — ':'')+b.textContent;b.textContent=t}});
  document.querySelectorAll('.anm').forEach(g=>{if(g.querySelectorAll('button').length>3)g.querySelectorAll('button').forEach(b=>{if(/^desliza/.test(b.dataset.m))b.textContent=b.dataset.m.endsWith('derecha')?'→':'←'})});
  /* fondos: se aplica a cada tarjeta, también cuando se vuelven a dibujar */
  const WL={ed:['Editar colores','Editar colores'],png:['PNG','Copiar PNG'],svg:['SVG','Copiar SVG'],live:['Ver animado','Ver animado aquí'],anim:['Descargar animado','Descargar animado (SVG, GIF o video)']};
  function fixW(root){(root||document).querySelectorAll('#wgrid .w .acts .cp').forEach(b=>{const k=b.dataset.k;if(!WL[k]||b.dataset.ml)return;b.dataset.ml=1;
    const live=k==='live'&&/Detener/.test(b.textContent);b.textContent=live?'Detener vista':WL[k][0];b.dataset.label=b.textContent;b.title=WL[k][1];b.classList.add('ml-ico');if(k==='live')b.setAttribute('aria-pressed',live?'true':'false')})}
  fixW();
  const wg=document.getElementById('wgrid');if(wg)new MutationObserver(()=>fixW()).observe(wg,{childList:true,subtree:true});
  /* editor de colores: grupos con título */
  const side=document.querySelector('#ed .ed-side');
  if(side&&!side.querySelector('.edg')){
    const acts=side.querySelectorAll('.ed-acts');const box=side.querySelector('.rit.ed');
    const grp=(t,cls)=>{const g=document.createElement('div');g.className='edg '+(cls||'');g.innerHTML='<b>'+t+'</b>';return g};
    if(acts[0]){const g=grp('Ajustar');acts[0].parentNode.insertBefore(g,acts[0]);g.appendChild(acts[0])}
    const live=document.getElementById('ed-live');
    if(live){const g=grp('Vista animada');const row=document.createElement('div');row.className='ed-acts';row.appendChild(live);g.appendChild(row);if(box)g.appendChild(box);
      const note=side.querySelector('.ed-note');side.insertBefore(g,note||null)}
    if(acts[1]){const g=grp('Exportar','exp');acts[1].parentNode.insertBefore(g,acts[1]);g.appendChild(acts[1]);
      const note=side.querySelector('.ed-note');if(note)side.insertBefore(g,note)}
  }
  MA.lookIcons=I;
})();
