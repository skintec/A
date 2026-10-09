/* Movimiento propio de cada ícono (mismo trazo, mismos colores: solo se mueve lo que se movería).
   Índices = posición en la lista de elementos de la biblioteca. n = ciclos dentro de los 6 s. */
(function(){
  const I=MA.ICONS,F=MA.FP;
  /* deformación: el elemento se estira y se comprime como un cuerpo blando (gelatina); las franjas ondulan a lo largo */
  MA.deform=c=>{
    const w=c.vb[2],h=c.vb[3];
    if(w/h>4)c.wave(c.L,'ma-bendw',2,3,{o:'50% 50%'});
    else c.L.forEach((e,i)=>c.a(e,'ma-jelly',3,{p:[w/2,h*.62],delay:i*.09}));
  };
  const fire=(c,el,n,o)=>c.a(el,'ma-flicker',n||4,Object.assign({o:'50% 100%',ease:'ease-in-out'},o||{}));
  const smoke=(c,x,y)=>{const e=c.add('<circle cx="'+x+'" cy="'+y+'" r="2.4"/><circle cx="'+(x+3)+'" cy="'+(y-4)+'" r="1.8"/>');
    e.forEach((k,i)=>c.a(k,'ma-smoke',2,{delay:i*.7,o:'50% 50%'}))};
  I[0]=c=>c.a(c.L[1],'ma-springx',3,{o:'50% 50%'});
  I[1]=c=>c.a(c.L[1],'ma-diag',3);
  I[2]=c=>{const [a,b]=c.split(c.L[1]);c.a(a,'ma-exd',3);c.a(b,'ma-exu',3)};
  I[3]=c=>fire(c,c.L[0]);
  I[4]=c=>fire(c,c.L[1]);
  I[5]=c=>fire(c,c.L[1],4,{delay:.3});
  I[6]=c=>{c.a(c.L[1],'ma-rise',2,{o:'50% 100%'});c.a(c.L[2],'ma-dim',2)};
  I[7]=c=>{c.a(c.L[1],'ma-nr',2);c.a(c.L[2],'ma-dim',2)};
  I[8]=c=>{const [a,b]=c.split(c.L[2]);c.a(a,'ma-emit',2);c.a(b,'ma-emit',2,{delay:.3})};
  I[9]=c=>{const [a,b]=c.split(c.L[1]);c.a(a,'ma-emit',2);c.a(b,'ma-emit',2,{delay:.3});c.a(c.L[2],'ma-dim',2,{delay:.6})};
  I[10]=c=>c.split(c.L[0]).forEach((e,i)=>c.a(e,'ma-eq',[3,2,4,2,3][i],{o:'50% 100%',delay:i*.25}));
  I[11]=c=>c.a(c.L[0],'ma-drop',2,{o:'50% 100%'});
  I[12]=c=>c.a(c.L[1],'ma-drop',2,{o:'50% 100%'});
  I[13]=c=>{c.a(c.L[1],'ma-nr',3,{ease:'cubic-bezier(.2,0,.9,.4)'});c.a(c.L[2],'ma-dim',3)};
  I[14]=c=>c.a(c.L[1],'ma-diag',3);
  I[15]=c=>c.a(c.L[0],'ma-squash',3,{o:'50% 100%'});
  I[16]=c=>c.a(c.L[1],'ma-dim',3);
  I[17]=c=>c.a(c.L[0],'ma-bob',3);
  I[18]=c=>c.a(c.L[0],'ma-exd',3);
  I[19]=c=>c.a(c.L[0],'ma-screw',3);
  I[20]=c=>{const [a,b]=c.split(c.L[1]);c.a(a,'ma-dim',3);c.a(b,'ma-dim',3,{delay:.5})};
  I[21]=c=>c.a(c.L[0],'ma-bob',3);
  I[22]=c=>c.a(c.L[2],'ma-unroll',3,{o:'0% 50%'});
  I[23]=c=>c.all(c.L,'ma-swipe',3);
  I[24]=c=>{c.a(c.L[1],'ma-pulse2',3,{o:'50% 50%'});c.a(c.L[2],'ma-pulse2',3,{o:'50% 50%',delay:.3})};
  I[25]=c=>c.a(c.L[2],'ma-bob',3);
  I[26]=c=>{
    c.all([c.L[0],c.L[1],c.L[2],c.L[3]],'ma-bump',12);
    const road=c.add('<path d="M2 44H46" stroke-width="2" stroke-dasharray="5 5"/>')[0];c.a(road,'ma-road',12,{ease:'linear'});
    [[12,36],[36,36]].forEach(([x,y])=>{const w=c.add('<path d="M'+x+' '+(y-3)+'V'+(y+3)+'M'+(x-3)+' '+y+'H'+(x+3)+'" stroke-width="2"/>')[0];c.a(w,'ma-spin',6,{p:[x,y],ease:'linear'})});
  };
  I[27]=c=>c.a(c.L[1],'ma-shine',3);
  I[28]=c=>c.all(c.L,'ma-swings',3,{p:[24,44]});
  I[29]=c=>smoke(c,40,11);
  I[30]=c=>smoke(c,24,7);
  I[31]=c=>c.a(c.L[2],'ma-flag',3,{o:'0% 50%'});
  I[32]=c=>c.split(c.L[1]).forEach((e,i)=>c.a(e,'ma-twinkle',[3,2,4][i%3],{delay:(i*.43)%1.8}));
  I[33]=c=>c.a(c.L[1],'ma-door',3,{o:'0% 50%'});
  I[34]=c=>c.a(c.L[2],'ma-blink',2);
  I[35]=c=>c.all(c.L,'ma-swings',3,{p:[8,42]});
  I[36]=c=>c.a(c.L[1],'ma-bubble',3);
  I[37]=c=>c.split(c.L[2]).forEach((e,i)=>c.a(e,'ma-type',3,{o:'0% 50%',delay:i*.35}));
  I[38]=c=>c.all(c.L,'ma-ring',2,{p:[24,24]});
  I[39]=c=>c.a(c.L[1],'ma-bob',3);
  I[40]=c=>c.all(c.L,'ma-hop',2,{o:'50% 100%'});
  I[41]=c=>c.a(c.L[1],'ma-spin',1,{p:[24,24],ease:'linear'});
  I[42]=c=>c.a(c.L[0],'ma-pulse2',3,{o:'50% 50%'});
  I[43]=c=>{c.a(c.L[2],'ma-pulse2',3,{o:'50% 50%'});c.a(c.L[3],'ma-bob',3)};
  I[44]=c=>{c.a(c.L[0],'ma-exu',3);c.a(c.L[2],'ma-exd',3)};
  I[45]=c=>{const [a,b]=c.split(c.L[0]);c.a(a,'ma-mxl',3);c.a(b,'ma-mxr',3)};
  I[46]=c=>c.a(c.L[0],'ma-pulse2',3,{o:'50% 50%'});
  I[47]=c=>{c.a(c.L[0],'ma-bob',3);c.a(c.L[1],'ma-bob',3,{delay:1})};
  I[48]=c=>c.a(c.L[1],'ma-pulse2',3,{o:'50% 50%'});
  I[49]=c=>c.a(c.L[0],'ma-springx',3,{o:'50% 50%'});
  I[50]=c=>c.all(c.L,'ma-bob',3);
  I[51]=c=>c.a(c.L[0],'ma-squash',3,{o:'50% 100%'});
  I[52]=c=>{c.a(c.L[1],'ma-pulse2',3,{o:'50% 50%'});c.a(c.L[2],'ma-shine',3)};
  I[53]=c=>c.all(c.L,'ma-swings',3,{p:[10,38]});
  /* franjas y separadores: deslizan (ver FP: periodo en unidades) */
  Object.assign(F,{54:60,55:480,56:480,57:10,58:480,59:80,60:480,61:480,62:48,64:20,65:16,66:60,67:16,68:480,69:32,70:40,71:60,72:16,73:240,74:20,75:24,76:480,117:480,118:480,119:480,120:480});
  for(let i=54;i<=76;i++)I[i]=I[i]||(c=>c.a(c.L[c.L.length-1],'ma-dim',3));
  /* marcos y fichas */
  [77,78].forEach(i=>I[i]=c=>c.a(c.L[0],'ma-dim',3));
  I[79]=c=>c.a(c.L[1],'ma-pulse2',3,{o:'50% 50%'});
  I[80]=c=>c.a(c.L[1],'ma-bob',3);
  I[81]=c=>c.a(c.L[c.L.length-1],'ma-dim',2);
  I[82]=c=>c.all(c.L,'ma-swings',3,{p:[120,20]});
  I[83]=c=>c.a(c.L[c.L.length-1],'ma-pulse2',3,{o:'50% 50%'});
  I[84]=c=>c.a(c.L[c.L.length-1],'ma-pulse2',3,{o:'50% 50%'});
  I[85]=c=>c.all(c.L.slice(1),'ma-spin',1,{p:[120,80],ease:'linear'});
  [86,88].forEach(i=>I[i]=c=>c.a(c.L[c.L.length-1],'ma-dim',3));[87,89,90].forEach(i=>I[i]=c=>c.a(c.L[c.L.length-1],'ma-pulse2',3,{o:'50% 50%'}));
  /* señalética de plano */
  [91,94,99,101,102].forEach(i=>I[i]=c=>c.a(c.L[c.L.length-1],'ma-pulse2',3,{o:'50% 50%'}));
  I[92]=c=>c.a(c.L[c.L.length-1],'ma-bob',3);
  I[93]=c=>c.L.forEach((e,i)=>c.a(e,'ma-blink',2,{delay:i%2?1.5:0}));
  I[95]=c=>c.a(c.L[0],'ma-swings',2,{p:[32,32]});
  I[96]=c=>c.all(c.L,'ma-quarter',1,{p:[32,32]});
  I[97]=c=>c.a(c.L[c.L.length-1],'ma-nr',3);
  I[98]=c=>c.all(c.L,'ma-dim',2,{stag:.25});
  I[100]=c=>c.a(c.L[c.L.length-1],'ma-pulse2',3,{o:'0% 100%'});
  I[103]=c=>c.wave(c.L,'ma-dim',2,2);
  I[104]=c=>c.a(c.L[0],'ma-diag',3);
  /* viñetas y flechas */
  [105,106,107].forEach(i=>I[i]=c=>c.all(c.L,'ma-quarter',1,{p:[24,24]}));
  I[108]=c=>c.a(c.L[0],'ma-diag',3);
  I[109]=c=>c.a(c.L[0],'ma-nr',3);
  I[110]=c=>c.a(c.L[0],'ma-nu',3);
  I[111]=c=>c.a(c.L[0],'ma-nur',3);
  I[112]=c=>c.a(c.L[0],'ma-nr',3);
  I[113]=c=>c.a(c.L[0],'ma-nr',3);
  I[114]=c=>c.a(c.L[0],'ma-quarter',1,{p:[24,24]});
  I[115]=c=>c.a(c.L[0],'ma-springx',3,{o:'50% 50%'});
  I[116]=c=>c.a(c.L[0],'ma-quarter',1,{p:[24,24]});
  [117,118,119,120,121].forEach(i=>I[i]=I[i]||(c=>c.a(c.L[c.L.length-1],'ma-dim',3)));
  /* marcadores */
  [122,123].forEach(i=>I[i]=c=>c.all(c.L,'ma-pulse2',3,{o:'50% 50%'}));
})();
