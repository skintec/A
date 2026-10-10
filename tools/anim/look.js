/* Capa de diseño: botones, opciones y menús más ordenados (controles segmentados, barras de acciones compactas, íconos de acción). */
(function(){
  const ic=p=>'url("data:image/svg+xml,'+encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'>"+p+"</svg>")+'")';
  const I={
    copy:ic("<path d='M5.5 5.5h7v7h-7z M3.5 10.5v-7h7' fill='none' stroke='black' stroke-width='1.6'/>"),
    down:ic("<path d='M8 2.5v7.5M4.8 7 8 10.2 11.2 7M3 13.2h10' fill='none' stroke='black' stroke-width='1.6'/>"),
    play:ic("<path d='M4.5 3l8.5 5-8.5 5z' fill='black'/>"),
    stop:ic("<rect x='4' y='4' width='8' height='8' fill='black'/>"),
    edit:ic("<path d='M3 13l.8-3.2 6.7-6.7 2.4 2.4-6.7 6.7z' fill='none' stroke='black' stroke-width='1.5'/>"),
    find:ic("<circle cx='6.8' cy='6.8' r='4.6' fill='none' stroke='black' stroke-width='1.8'/><path d='M10.2 10.2 14 14' stroke='black' stroke-width='1.8'/>"),
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


  /* ---------- ritmo fijo al desplazarse ---------- */
  #pane-el>.rit,#fondos>.rit{position:sticky;top:calc(var(--barh,0px) + var(--tabh,0px));z-index:4;box-shadow:0 6px 18px -12px rgba(43,42,38,.35);transition:box-shadow .2s,padding .2s}
  #fondos>.rit{margin:16px 0 24px!important}
  .rit.stuck{padding-block:6px!important}
  .rit.stuck>span{display:none}
  @media (max-width:860px){
    .bar{position:static!important}
    #pane-el>.rit,#fondos>.rit{top:0;flex-wrap:nowrap!important;gap:10px!important;padding:8px 10px!important;margin-inline:-16px;border-inline:0!important}
    #pane-el>.rit>span,#fondos>.rit>span,#pane-el>.rit>b,#fondos>.rit>b{display:none}
    #pane-el>.rit label,#fondos>.rit label{flex:1 1 0;min-width:0;gap:6px!important;font-size:11px}
    #pane-el>.rit input[type=range],#fondos>.rit input[type=range]{width:auto!important;flex:1;min-width:30px}
    #pane-el>.rit output,#fondos>.rit output{min-width:36px}
    #pane-el>.rit button,#fondos>.rit button{font-size:0;width:30px;padding:0;justify-content:center;flex:none;gap:0}
  }
  
  /* ---------- pestañas fijas ---------- */
  .bar[hidden]{display:none!important}
  main>.tabrow{position:sticky;top:var(--barh,0px);z-index:5;background:var(--plaster);margin-top:12px;padding-top:8px;display:flex;align-items:flex-end;gap:16px;border-bottom:1px solid var(--line)}
  main>.tabrow>.tabs{margin:0!important;border-bottom:0!important;flex:1 1 auto;min-width:0;overflow-x:auto;overflow-y:hidden;scrollbar-width:none}
  main>.tabrow>.tabs button{margin-bottom:0!important}
  main>.tabrow>.qf{flex:none;align-self:center;margin:0 0 4px!important}
  main>.tabrow.stuck{box-shadow:0 8px 16px -14px rgba(43,42,38,.45)}
  main>.tabrow.stuck .tabs button{padding-block:8px 6px;font-size:22px}
  body:has(#pane-manual:not([hidden])) main>.tabrow>.qf{display:none}
  body:has(#pane-videos:not([hidden])) .bar{display:none}
  @media (max-width:860px){
    main>.tabrow{top:0;margin-inline:-16px;padding-inline:8px}
    main>.tabrow>.tabs{overflow-x:auto;scrollbar-width:none;flex-wrap:nowrap}
    main>.tabrow .tabs button{flex:none;white-space:nowrap;font-size:20px!important;padding:10px 10px 8px!important}
    main>.tabrow .tabs button span{font-size:10.5px}
    body:has(#pane-videos:not([hidden])) .bar{display:block}
    #pane-el>.rit,#fondos>.rit{top:var(--tabh,0px)}
  }
  /* ---------- barra de búsqueda, color y categorías ---------- */
  .bar>.wrap.mlbar{display:grid!important;grid-template-columns:minmax(0,1fr) auto;grid-template-areas:"r c" "n q";gap:0 24px!important;padding-block:0!important;align-items:stretch}
  .mlbar .bf.rslot{grid-area:r;margin:12px 0}
  .mlbar .rslot .rit{display:flex!important;flex-wrap:nowrap;gap:10px 14px!important;padding:0!important;margin:0!important;border:0!important;background:none!important;box-shadow:none!important;position:static!important}
  .mlbar .rslot .rit>b{font:700 10.5px 'Archivo',sans-serif!important;letter-spacing:1.4px!important;margin:0!important}
  .mlbar .rslot .rit>span{display:none}
  .mlbar .rslot .rit label{gap:8px!important;white-space:nowrap;font:500 12px 'Archivo',sans-serif!important;letter-spacing:0!important;text-transform:none!important;color:var(--graphite)!important}
  .bar>.wrap.mlbar:has(.sw[hidden]){grid-template-areas:"r q"}
  .bar>.wrap.mlbar:has(.sw[hidden])::after{display:none}
  .mlbar .bf.col>b{display:none}
  @media (min-width:1081px){.bar>.wrap.mlbar .bf.nav{grid-column:1/-1;grid-row:2}}
  @media (min-width:861px){.bar>.wrap.mlbar:has(.sw[hidden]){grid-template-areas:"r"}}
  .mlbar .rslot .rit input[type=range]{width:84px!important}
  .mlbar .rslot .rit button{font-size:0;width:30px;padding:0;justify-content:center;gap:0}
  .mlbar .rslot:empty,body:has(#pane-videos:not([hidden])) .mlbar .rslot{display:none}
  body:has(#pane-videos:not([hidden])) .bar>.wrap.mlbar{grid-template-areas:"n q"}
  @media (min-width:861px){#fondos>.rit{display:none!important}}
  @media (max-width:1240px) and (min-width:861px){.sw button{padding:0 8px!important;font-size:11px!important;gap:6px!important}.mlbar .rslot .rit input[type=range]{width:56px!important}.mlbar .rslot .rit label{gap:5px!important}.mlbar .rslot .rit{gap:8px 10px!important}.mlbar nav.cats a small{display:none}.qf{width:180px}}
  @media (max-width:1080px) and (min-width:861px){.bar>.wrap.mlbar{grid-template-columns:1fr;grid-template-areas:"r" "c" "n"}.mlbar .bf.col{justify-content:flex-start!important;margin-top:0}.bar>.wrap.mlbar::after{display:none}.qf{width:170px}}
  .qf{grid-area:q;display:flex;align-items:center;gap:0;height:32px;margin:4px 0;width:210px;align-self:center;border:1px solid var(--line);background:#fff;border-radius:2px;transition:border-color .15s}
  .qf:focus-within{border-color:var(--clay);box-shadow:0 0 0 3px rgba(194,85,31,.12)}
  .qf::before{content:"";width:16px;height:16px;margin:0 8px 0 12px;flex:none;background:var(--clay-dark);-webkit-mask:${I.find} center/contain no-repeat;mask:${I.find} center/contain no-repeat}
  .qf label{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
  .qf input{flex:1;min-width:0;height:100%;border:0!important;outline:0;background:transparent;font:500 14px 'Archivo',sans-serif;color:var(--graphite);padding:0 10px 0 0}
  .qf input::placeholder{color:#8a887d}
  .bf{display:flex;align-items:center;gap:12px;min-width:0}
  .bf>b{font:700 10.5px 'Archivo',sans-serif;letter-spacing:1.4px;text-transform:uppercase;color:var(--clay-dark);flex:none}
  .mlbar .bf.col{grid-area:c;justify-content:flex-end;margin:12px 0}
  .mlbar .bf.nav{grid-area:n;height:40px}
  .bar>.wrap.mlbar::after{content:"";grid-column:1/-1;grid-row:2;border-top:1px solid var(--line);pointer-events:none;height:0;align-self:start}
  .mlbar .bf:has(>[hidden]){display:none}
  .sw{display:flex!important;flex-wrap:nowrap!important;gap:0!important;border:1px solid var(--line);border-radius:2px;background:#fff;overflow-x:auto;scrollbar-width:none}
  .sw button{border:0!important;border-left:1px solid var(--line)!important;height:38px;padding:0 12px!important;gap:8px!important;font:600 12px 'Archivo',sans-serif!important;color:#55544c!important;background:transparent!important;white-space:nowrap;outline:0!important;box-shadow:none!important}
  .sw button:first-child{border-left:0!important}
  .sw button:hover{color:var(--clay-dark)!important;background:#f6f1e8!important}
  .sw button[aria-pressed="true"]{background:var(--graphite)!important;color:var(--paper)!important}
  .sw button i{width:18px!important;height:18px!important;border:1px solid rgba(43,42,38,.3)!important;background:var(--tl)!important;position:relative;flex:none}
  .sw button i::after{content:"";position:absolute;inset:4px;background:var(--ik)}
  .sw button[aria-pressed="true"] i{border-color:rgba(255,253,249,.5)!important}
  .mlbar nav.cats{display:flex!important;flex-wrap:nowrap!important;gap:0!important;margin:0!important;overflow-x:auto;scrollbar-width:none;align-self:stretch}
  .mlbar nav.cats a{display:flex;align-items:center;gap:5px;padding:0 9px;height:100%;font:600 12.5px 'Archivo',sans-serif;color:#55544c!important;border-bottom:2px solid transparent!important;white-space:nowrap}
  .mlbar nav.cats a:first-child{padding-left:0}
  .mlbar nav.cats a small{font:700 10.5px 'Archivo';color:#a29f92}
  .mlbar nav.cats a:hover,.mlbar nav.cats a.on{color:var(--graphite)!important;border-bottom-color:var(--clay)!important}
  .mlbar nav.cats a.on small{color:var(--clay-dark)}
  @media (max-width:860px){
    .bar>.wrap.mlbar,body:has(#pane-videos:not([hidden])) .bar>.wrap.mlbar{grid-template-columns:1fr;grid-template-areas:"q" "c" "n"}
    .mlbar .rslot{display:none!important}
    .qf{margin:10px 0 8px;width:auto;height:40px}
    .mlbar .bf.col{justify-content:flex-start;margin:0 0 10px}
    .mlbar .bf.col>b{display:none}
    .sw{display:grid!important;grid-template-columns:1fr 1fr;gap:4px!important;border:0;background:transparent;width:100%}
    .sw button{border:1px solid var(--line)!important;background:#fff!important;height:36px;padding:0 10px!important;justify-content:flex-start}
    .sw button:last-child:nth-child(odd){grid-column:1/-1}
  }
  #wgrid .w .nm{min-height:40px;line-height:20px}
  /* ---------- grilla modular de elementos (módulo de 8 px) ---------- */
  #pane-el .grid{--cols:6;grid-template-columns:repeat(var(--cols),minmax(0,1fr))!important;gap:0!important;background:transparent!important;border:0!important;border-top:1px solid var(--line)!important;border-left:1px solid var(--line)!important}
  #pane-el .grid>.t{border-right:1px solid var(--line);border-bottom:1px solid var(--line)}
  #pane-el .grid>.t.wide{grid-column:span 2!important}
  #pane-el .t .pv{height:136px!important;min-height:0!important;padding:24px!important;box-sizing:border-box}
  #pane-el .t .pv svg{width:72px;height:72px}
  #pane-el .t.wide .pv svg{width:100%;height:auto;max-height:88px}
  #pane-el .t figcaption{padding:12px 12px 16px!important;row-gap:8px!important;align-content:start;border-top:1px solid var(--line)}
  #pane-el .t .n,#pane-el .t .nm{line-height:20px}
  #pane-el .t .nm{min-height:40px}
  #pane-el .t.wide .nm{min-height:20px}
  #pane-el .t .acts{grid-template-columns:1fr 1fr!important}
  #pane-el .t.wide .acts{grid-template-columns:minmax(0,1fr) minmax(0,1fr) minmax(0,1.6fr)!important}
  #pane-el .t.wide .anm{max-width:none}
  #pane-el .t .anm button{height:28px}
  #pane-el .t .acts .cp{height:32px}
  @media (max-width:1180px){#pane-el .grid{--cols:4}}
  @media (max-width:700px){#pane-el .grid{--cols:2}#pane-el .t.wide .acts{grid-template-columns:1fr 1fr!important}#pane-el .t.wide .acts .cp[data-k="anim"]{grid-column:1/-1!important}}

  /* ---------- estructura común (patrón del manual) ---------- */
  .bar.gone{display:none!important}
  main>.tabrow{top:0!important}
  .phd{display:flex;flex-wrap:wrap;gap:14px 32px;align-items:flex-end;justify-content:space-between;margin:28px 0 18px!important;padding:0!important}
  .phd p{max-width:680px;margin:0;color:var(--muted)}
  .pstick{position:sticky;top:var(--tabh,0px);z-index:4;background:var(--plaster);margin-bottom:8px}
  .snav,.mm-nav{display:flex;gap:0;overflow-x:auto;scrollbar-width:none;border-bottom:1px solid var(--line);background:var(--plaster)}
  .snav a,.mm-nav a{display:flex;align-items:baseline;gap:5px;padding:12px 14px 10px;font:600 12.5px 'Archivo',sans-serif;color:#55544c;text-decoration:none;border-bottom:2px solid transparent;margin-bottom:-1px;white-space:nowrap}
  .snav a:first-child,.mm-nav a:first-child{padding-left:0}
  .snav a small{font:700 10.5px 'Archivo';color:#a29f92}
  .snav a:hover,.snav a.on,.mm-nav a:hover,.mm-nav a.on{color:var(--graphite);border-bottom-color:var(--clay)}
  .snav a.on small{color:var(--clay-dark)}
  .mm-nav{top:var(--tabh,0px)!important}
  .ptools{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px 24px;padding:8px 0;border-bottom:1px solid var(--line)}
  .ptools .rit{display:flex!important;flex-wrap:nowrap;align-items:center;gap:10px 14px!important;padding:0!important;margin:0!important;border:0!important;background:none!important;box-shadow:none!important;position:static!important;width:auto!important}
  .ptools .rit>span{display:none}
  .ptools .rit label{gap:8px!important;white-space:nowrap;font:500 12px 'Archivo',sans-serif!important;letter-spacing:0!important;text-transform:none!important;color:var(--graphite)!important}
  .ptools .rit input[type=range]{width:84px!important}
  .ptools .rit button{font-size:0;width:30px;padding:0;justify-content:center;gap:0}
  .bf>b{font:700 10.5px 'Archivo',sans-serif;letter-spacing:1.4px;text-transform:uppercase;color:var(--clay-dark);flex:none}
  .ptools .bf,.phd .bf{display:flex!important;align-items:center;gap:12px;margin:0!important}
  .ptools .bf.col>b{display:none!important}
  .ptools .rit input[type=range]{min-width:0}
  .ch .cnt{align-self:flex-start;margin-top:2px}
  .ptools .sw button,.ptools .fmt button{height:32px!important}
  .ptools .fmt{display:flex!important;gap:0!important;border:1px solid var(--line);border-radius:2px;background:#fff;overflow:hidden}
  .ptools .fmt button{appearance:none;border:0!important;border-left:1px solid var(--line)!important;padding:0 12px!important;font:600 12px 'Archivo',sans-serif!important;color:#55544c!important;background:transparent!important;cursor:pointer;border-radius:0!important}
  .ptools .fmt button:first-child{border-left:0!important}
  .ptools .fmt button:hover{color:var(--clay-dark)!important;background:#f6f1e8!important}
  .ptools .fmt button[aria-pressed="true"]{background:var(--graphite)!important;color:var(--paper)!important}
  .phd .wtools{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
  .phd .wtools .btn2{display:inline-flex;align-items:center;height:32px;padding:0 12px;border:1px solid var(--line);background:var(--paper);color:var(--graphite);font:600 12px 'Archivo',sans-serif;border-radius:2px;cursor:pointer}
  .phd .wtools .btn2:hover{border-color:var(--clay);color:var(--clay-dark)}
  .cat,.vsec{scroll-margin-top:calc(var(--tabh,0px) + var(--psth,0px) + 12px)}
  .cat{padding-block:32px 16px!important}
  .cat:first-of-type{padding-top:20px!important}
  .ch{display:flex!important;flex-wrap:wrap;align-items:baseline;gap:6px 24px!important;margin-bottom:18px}
  .ch h2,#pane-videos .wp-head h2{font:400 40px/1 'Bebas Neue','Oswald',sans-serif!important;margin:0;letter-spacing:.3px}
  .ch .cnt{order:1;font:700 13px 'Archivo',sans-serif!important;color:var(--clay-dark)!important;margin-left:-16px;line-height:1}
  .ch h2{order:0}.ch p{order:2;margin:0;max-width:720px;color:var(--muted)}
  #pane-videos .vsec .wp-head{padding-block:32px 18px!important}
  #pane-videos .vsec .wp-head>div{display:flex;flex-wrap:wrap;align-items:baseline;gap:6px 24px}
  #pane-videos .vsec .wp-head p{margin:0;max-width:720px}
  @media (max-width:860px){
    main>.qf{display:flex;margin:12px 0 0!important;width:auto!important;height:40px}
    .phd .bf.col{width:100%}.phd .bf.col>b{display:none}
    .ptools{flex-wrap:wrap;padding:6px 0}
    .ptools .rit{flex:1 1 100%;min-width:0;gap:10px!important}
    .ptools .fmtg{width:100%}.ptools .fmt{width:100%}.ptools .fmt button{flex:1}.ptools .rit>b{display:none}
    .ptools .rit label{flex:1 1 0;min-width:0;gap:6px!important;font-size:11px!important}
    .ptools .rit input[type=range]{width:auto!important;flex:1;min-width:30px}
    .ptools .fmtg>b{display:none}.ptools .fmt button{padding:0 8px!important;font-size:11px!important}
    .ch h2,#pane-videos .wp-head h2{font-size:32px!important}
  }
  @media (max-width:1240px) and (min-width:861px){.ptools .sw button{padding:0 8px!important;font-size:11px!important;gap:6px!important}.ptools .rit input[type=range]{width:64px!important}}
    `;
  const st=document.createElement('style');st.id='ml-look';st.textContent=css;document.head.appendChild(st);

  /* barra superior: búsqueda con ícono, grupo de color y navegación por categorías con conteo */
  const bw=document.querySelector('.bar>.wrap');
  if(bw&&!bw.classList.contains('mlbar')){
    bw.classList.add('mlbar');
    const lab=bw.querySelector('label[for=q]'),q=document.getElementById('q'),sw=bw.querySelector('.sw'),cats=bw.querySelector('nav.cats');
    const qf=document.createElement('div');qf.className='qf';bw.insertBefore(qf,lab);qf.append(lab,q);q.setAttribute('aria-label','Buscar elementos');
    const grp=(cls,t,el)=>{const g=document.createElement('div');g.className='bf '+cls;g.innerHTML='<b>'+t+'</b>';bw.insertBefore(g,el);g.appendChild(el);return g};
    if(sw){grp('col','Color',sw);sw.querySelectorAll('button').forEach(b=>{const i=b.querySelector('i');if(i){i.style.setProperty('--tl',b.dataset.tile);i.style.setProperty('--ik',b.dataset.ink)}})}
    if(cats){grp('nav','Ir a',cats);
      cats.querySelectorAll('a').forEach(a=>{const sec=document.getElementById(a.getAttribute('href').slice(1));const c=sec&&sec.querySelector('.cnt');if(c)a.insertAdjacentHTML('beforeend','<small>'+c.textContent.trim()+'</small>')});
      const links=[...cats.querySelectorAll('a')];
      const mark=()=>{let cur=null;const y=(document.querySelector('.bar')||{}).offsetHeight||0;
        links.forEach(a=>{const s=document.getElementById(a.getAttribute('href').slice(1));if(s&&!s.hidden&&s.getBoundingClientRect().top-y-40<=0)cur=a});
        links.forEach(a=>a.classList.toggle('on',a===cur))};
      addEventListener('scroll',mark,{passive:true});mark();
    }
  }
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

  /* ---------- estructura común de todas las pestañas (patrón del manual) ----------
     pestañas + buscador → encabezado (texto + acciones) → menú propio fijo (+ herramientas) → secciones */
  const mqD=matchMedia('(min-width:861px)'),RS=document.documentElement.style,mk=(t,c)=>{const e=document.createElement(t);e.className=c;return e};
  const bar=document.querySelector('.bar');if(bar)bar.classList.add('gone');
  const tabsRaw=document.querySelector('main>.tabs');let tabsEl=null;
  if(tabsRaw){tabsEl=mk('div','tabrow');tabsRaw.parentNode.insertBefore(tabsEl,tabsRaw);tabsEl.appendChild(tabsRaw)}
  const qf=document.querySelector('.qf');
  const placeQ=()=>{if(!qf||!tabsEl)return;if(mqD.matches){if(qf.parentNode!==tabsEl)tabsEl.appendChild(qf)}else if(qf.previousElementSibling!==tabsEl)tabsEl.after(qf)};
  placeQ();mqD.addEventListener('change',placeQ);
  const sticks=[];
  function snavFrom(links){const n=mk('nav','snav');n.setAttribute('aria-label','Secciones');links.forEach(l=>n.appendChild(l));return n}
  /* Elementos */
  const pe=document.getElementById('pane-el');let colG=document.querySelector('.bf.col');
  if(pe){const elRit=pe.querySelector('.rit'),cats=document.querySelector('nav.cats');
    const hd=mk('div','phd');hd.innerHTML='<p>Iconos, franjas, marcos, señalética de plano, viñetas y marcadores dibujados con las reglas del logo. Cambia el color, busca por nombre, copia el PNG o el SVG y descarga cada uno animado.</p>';
    const ps=mk('div','pstick');const sn=snavFrom(cats?[...cats.querySelectorAll('a')]:[]);ps.appendChild(sn);
    const tl=mk('div','ptools');if(elRit){const rb=elRit.querySelector('button');if(rb){rb.title='Restablecer ritmo';rb.setAttribute('aria-label','Restablecer ritmo')}tl.appendChild(elRit)}ps.appendChild(tl);
    pe.insertBefore(ps,pe.firstChild);pe.insertBefore(hd,ps);if(cats)cats.remove();sticks.push(ps);
    const placeC=()=>{if(!colG)return;if(mqD.matches){if(colG.parentNode!==tl)tl.appendChild(colG)}else if(colG.parentNode!==hd)hd.appendChild(colG)};placeC();mqD.addEventListener('change',placeC)}
  /* Fondos de pantalla */
  const fo=document.getElementById('fondos');
  if(fo){const wh=fo.querySelector(':scope>.wp-head'),fr=fo.querySelector('.rit'),fmt=fo.querySelector('.fmt');
    if(wh)wh.classList.add('phd');const ps=mk('div','pstick'),tl=mk('div','ptools');if(fr)tl.appendChild(fr);
    if(fmt){const g=mk('div','bf fmtg');g.innerHTML='<b>Formato</b>';g.appendChild(fmt);tl.appendChild(g)}
    ps.appendChild(tl);if(wh)wh.after(ps);else fo.insertBefore(ps,fo.firstChild);sticks.push(ps)}
  /* Videos */
  const pv=document.getElementById('pane-videos');
  if(pv){const secs=[...pv.querySelectorAll(':scope>.vsec')],short={'Logo animado':'Logo animado','Stories de Instagram':'Stories','Piezas para web y redes':'Web y redes'};
    const links=secs.map((sc,i)=>{const h=sc.querySelector('h2'),t=h?h.textContent.trim():'Sección '+(i+1);sc.id=sc.id||'v-'+t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
      const a=document.createElement('a');a.href='#'+sc.id;a.innerHTML=(short[t]||t.replace(/^Funcionamiento de los materiales · /,''))+'<small>'+sc.querySelectorAll('.vd').length+'</small>';return a});
    const hd=mk('div','phd');hd.innerHTML='<p>'+pv.querySelectorAll('.vd').length+' animaciones de la marca: el logo, stories, piezas para web y redes, y el funcionamiento de cada material. Descarga cada una en MP4, GIF o SVG; las versiones anteriores siguen disponibles en su tarjeta.</p>';
    const ps=mk('div','pstick');ps.appendChild(snavFrom(links));pv.insertBefore(ps,pv.firstChild);pv.insertBefore(hd,ps);sticks.push(ps)}
  /* alturas para fijar y anclar */
  const setT=()=>{if(tabsEl)RS.setProperty('--tabh',tabsEl.offsetHeight+'px');const v=sticks.find(x=>x.offsetParent);RS.setProperty('--psth',(v?v.offsetHeight:0)+'px')};
  setT();if(tabsEl)new ResizeObserver(setT).observe(tabsEl);sticks.forEach(x=>new ResizeObserver(setT).observe(x));addEventListener('resize',setT);
  document.querySelectorAll('[role=tab]').forEach(t=>t.addEventListener('click',()=>setTimeout(()=>{setT();markAll()},0)));
  const markAll=()=>{const y=(tabsEl?tabsEl.offsetHeight:0)+(parseFloat(RS.getPropertyValue('--psth'))||0)+40;
    document.querySelectorAll('.snav').forEach(n=>{if(!n.offsetParent)return;const ls=[...n.querySelectorAll('a')];let cur=null;
      ls.forEach(a=>{const s2=document.getElementById(a.getAttribute('href').slice(1));if(s2&&!s2.hidden&&s2.getBoundingClientRect().top-y<=0)cur=a});ls.forEach(a=>a.classList.toggle('on',a===cur))});
    if(tabsEl)tabsEl.classList.toggle('stuck',scrollY>200)};
  addEventListener('scroll',markAll,{passive:true});markAll();
  MA.lookIcons=I;
})();
