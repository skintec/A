/* Deformación del contorno: los trazos cambian de forma (no se escalan), con un movimiento propio de lo que representan:
   la llama se mece y lame hacia arriba, la gota ondula como líquido, la lana y las franjas ondulan, el resto "hierve" suavemente.
   Cada contorno se muestrea en puntos y se desplaza con un campo de deformación periódico; se anima con SMIL (atributo d). */
(function(){
  const NS='http://www.w3.org/2000/svg',cache=new Map();
  function host(){let s=document.getElementById('ma-meas');if(!s){s=document.createElementNS(NS,'svg');s.id='ma-meas';s.setAttribute('width','1');s.setAttribute('height','1');s.style.cssText='position:absolute;left:-9999px;top:0;visibility:hidden;pointer-events:none';document.body.appendChild(s)}return s}
  function toD(el){
    const g=n=>parseFloat(el.getAttribute(n))||0,t=el.tagName;
    if(t==='path')return el.getAttribute('d')||'';
    if(t==='rect'){const x=g('x'),y=g('y'),w=g('width'),h=g('height');return 'M'+x+' '+y+'H'+(x+w)+'V'+(y+h)+'H'+x+'Z'}
    if(t==='circle'||t==='ellipse'){const cx=g('cx'),cy=g('cy'),rx=t==='circle'?g('r'):g('rx'),ry=t==='circle'?g('r'):g('ry');return 'M'+(cx-rx)+' '+cy+'A'+rx+' '+ry+' 0 1 0 '+(cx+rx)+' '+cy+'A'+rx+' '+ry+' 0 1 0 '+(cx-rx)+' '+cy+'Z'}
    if(t==='line')return 'M'+g('x1')+' '+g('y1')+'L'+g('x2')+' '+g('y2');
    if(t==='polyline'||t==='polygon'){const p=(el.getAttribute('points')||'').trim().split(/[\s,]+/).map(Number);let d='';for(let i=0;i+1<p.length;i+=2)d+=(i?'L':'M')+p[i]+' '+p[i+1];return d+(t==='polygon'?'Z':'')}
    return '';
  }
  function dp(pts,tol){   // Douglas-Peucker: conserva esquinas y puntos de curva
    if(pts.length<3)return pts;
    const n=pts.length-1,keep=new Array(pts.length).fill(false);keep[0]=keep[n]=true;
    function rec(a,b){
      let m=0,k=-1;const x1=pts[a][0],y1=pts[a][1],x2=pts[b][0],y2=pts[b][1],dx=x2-x1,dy=y2-y1,L=Math.hypot(dx,dy)||1e-9;
      for(let i=a+1;i<b;i++){const d=Math.abs(dy*pts[i][0]-dx*pts[i][1]+x2*y1-y2*x1)/L;if(d>m){m=d;k=i}}
      if(m>tol&&k>0){keep[k]=true;rec(a,k);rec(k,b)}
    }
    if(Math.hypot(pts[n][0]-pts[0][0],pts[n][1]-pts[0][1])<1e-6){      // contorno cerrado: se parte en el punto más lejano
      let m=0,top=-1;for(let i=1;i<n;i++){const d=Math.hypot(pts[i][0]-pts[0][0],pts[i][1]-pts[0][1]);if(d>m){m=d;top=i}}
      if(top>0){keep[top]=true;rec(0,top);rec(top,n)}
    }else rec(0,n);
    return pts.filter((p,i)=>keep[i]);
  }
  function outline(el,vbw){
    const d=toD(el),key=d+'|'+vbw;if(cache.has(key))return cache.get(key);
    const subs=d.split(/(?=M)/).map(s=>s.trim()).filter(Boolean),out=[];
    const tmp=document.createElementNS(NS,'path');host().appendChild(tmp);
    for(const sd of subs){
      tmp.setAttribute('d',sd);let L=0;try{L=tmp.getTotalLength()}catch(e){}
      if(!(L>0))continue;
      const n=Math.min(700,Math.max(12,Math.ceil(L/(vbw/500)))),pts=[];
      for(let i=0;i<=n;i++){const p=tmp.getPointAtLength(L*i/n);pts.push([p.x,p.y])}
      let q=dp(pts,vbw/900);const closed=/[zZ]\s*$/.test(sd);
      const maxSeg=vbw/36,fine=[q[0]];
      for(let i=1;i<q.length;i++){const a=q[i-1],b=q[i],len=Math.hypot(b[0]-a[0],b[1]-a[1]),k=Math.max(1,Math.ceil(len/maxSeg));for(let j=1;j<=k;j++)fine.push([a[0]+(b[0]-a[0])*j/k,a[1]+(b[1]-a[1])*j/k])}
      out.push({pts:fine,closed});
    }
    tmp.remove();cache.set(key,out);return out;
  }
  /* ---- rig de deformación: "asas" locales que llevan el contorno por varias poses irregulares (como un dibujo cuadro a cuadro) ----
     asa = [x, y, radio, amplitud, dirección('any'|'x'|'y'|'out'), hojas opcionales]; todo en unidades del viewBox */
  function rng(seed){let a=seed>>>0||1;return()=>{a^=a<<13;a>>>=0;a^=a>>17;a^=a<<5;a>>>=0;return a/4294967296}}
  const R={
    0:{n:2,only:[1],h:[[3,14,7,3,'y'],[17.5,14,7,3,'y'],[32,14,7,3,'y'],[46,14,7,3,'y'],[10,33,6,2,'y'],[25,33,6,2,'y'],[39,33,6,2,'y']]},
    1:{n:2,h:[[24,8,14,1.6,'y'],[24,40,14,1.6,'y'],[8,24,12,1.2,'x'],[40,24,12,1.2,'x']]},
    2:{n:2,h:[[24,10,14,1.6,'y'],[24,38,14,1.6,'y']]},
    3:{n:3,h:[[24,5,12,5,'any'],[18,13,7,4,'any'],[24,21,6,2.5,'any'],[36,22,10,1.6,'x'],[12,22,10,1.6,'x']]},
    4:{n:3,only:[1],h:[[29,10,10,4,'any'],[25,17,6,3,'any'],[29,22,5,2,'any'],[37,24,8,1.3,'x']]},
    5:{n:3,only:[1],h:[[24,14,8,3,'any'],[21,18,5,2.5,'any'],[24,22,4,1.5,'any']]},
    6:{n:2,only:[0,1],h:[[24,16,6,5,'y'],[24,36,9,1.2,'any']]},
    7:{n:2,only:[1,2],h:[[15,14,5,2.5,'x'],[15,34,5,2.5,'x'],[40,14,5,2,'x'],[40,34,5,2,'x']]},
    8:{n:2,only:[1,2],h:[[31.3,24,6,1.8,'x'],[38.4,24,10,2.4,'x'],[22,10,5,1,'y'],[22,38,5,1,'y']]},
    9:{n:2,only:[1,2],h:[[11.3,24,6,2.5,'x'],[19.4,24,10,3,'x'],[40,24,3,1,'x']]},
    10:{n:2,h:[[8,28,4,5,'y'],[16,20,4,5,'y'],[24,12,4,5,'y'],[32,22,4,5,'y'],[40,32,4,5,'y']]},
    11:{n:2,h:[[24,5,10,3,'any'],[11,29,9,2,'x'],[37,29,9,2,'x'],[24,42,9,2,'y']]},
    12:{n:2,only:[1],h:[[24,12,7,2,'any'],[16,27,6,1.5,'x'],[32,27,6,1.5,'x'],[24,35,6,1.5,'y']]},
    13:{n:2,only:[1,2],h:[[24,24,7,3,'x'],[30,14,4,2,'any'],[30,34,4,2,'any']]},
    14:{n:2,h:[[19,18,9,1.6,'y'],[19,36,9,1.6,'y'],[40,10,7,1.6,'any']]},
    15:{n:2,h:[[24,8,10,2,'y'],[24,40,10,2,'y'],[24,24,6,1.2,'x']]},
    16:{n:2,h:[[14,24,10,2,'x'],[34,24,10,2,'x']]},
    17:{n:2,h:[[34,13,6,2,'y'],[34,35,6,2,'y']]},
    18:{n:2,h:[[10,12,6,2,'x'],[38,12,6,2,'x'],[24,36,9,1.5,'y']]},
    19:{n:3,h:[[24,16,5,1.6,'x'],[24,24,5,1.6,'x'],[24,32,5,1.6,'x'],[24,42,4,1.5,'y']]},
    20:{n:2,h:[[18,24,8,1.6,'x'],[30,24,8,1.6,'x']]},
    21:{n:2,h:[[16,30,10,2,'y'],[32,30,10,2,'y'],[24,8,10,1,'y']]},
    22:{n:2,h:[[40,36,8,3,'y'],[22,8,10,1,'any']]},
    23:{n:2,h:[[36,42,8,2,'any'],[30,6,6,2,'x']]},
    24:{n:2,h:[[44,42,6,2,'y'],[40,22,8,1.5,'x']]},
    25:{n:2,h:[[24,8,8,2,'y'],[14,26,6,1.5,'y'],[34,26,6,1.5,'y']]},
    26:{n:3,h:[[16,12,10,1.6,'y'],[44,27,8,2,'any'],[12,40,4,1,'y'],[36,40,4,1,'y']]},
    27:{n:2,h:[[24,20,12,1.6,'y'],[6,34,6,1.6,'y'],[42,34,6,1.6,'y']]},
    28:{n:2,h:[[6,18,8,2.5,'y'],[42,18,8,2.5,'y']]},
    29:{n:3,h:[[40,16,6,2,'any'],[14,22,5,1.5,'y'],[24,12,6,1.2,'any']]},
    30:{n:2,h:[[14,24,8,2,'x'],[34,24,8,2,'x'],[24,6,8,1.5,'y']]},
    31:{n:3,only:[2],h:[[32,6,5,2.5,'any']]},
    32:{n:2,h:[[12,4,12,2,'x'],[36,4,12,2,'x']]},
    33:{n:2,h:[[24,8,8,2,'y'],[24,30,5,1.5,'y']]},
    34:{n:2,h:[[42,8,10,3,'any'],[6,40,8,1.5,'any']]},
    35:{n:2,h:[[26,24,10,2,'any']]},
    36:{n:2,only:[1],h:[[24,24,5,5,'x']]},
    37:{n:2,h:[[34,8,8,2.5,'any'],[32,22,3,2,'x'],[32,29,3,2,'x'],[26,36,3,2,'x']]},
    38:{n:4,h:[[14,24,10,1.2,'x'],[34,24,10,1.2,'x']]},
    39:{n:2,h:[[24,26,8,3,'y']]},
    40:{n:2,h:[[24,44,10,2,'any'],[24,5,10,2,'y']]},
    41:{n:2,only:[1],h:[[24,13,4,3,'any'],[33,24,4,3,'any']]},
    42:{n:2,h:[[19,36,8,2,'any'],[40,13,8,3,'any']]},
    43:{n:2,h:[[34,36,8,1.5,'any'],[31,46,4,2,'y'],[37,46,4,2,'y']]},
    44:{n:2,h:[[24,6,10,2,'y'],[24,31,8,2,'y'],[24,40,8,2,'y']]},
    45:{n:2,h:[[14,24,12,2.5,'x'],[34,24,12,2.5,'x']]},
    46:{n:2,h:[[24,8,10,2,'y'],[24,42,10,1.5,'y']]},
    47:{n:2,h:[[8,30,6,2.5,'any'],[40,40,6,2.5,'any'],[17,6,10,1.5,'y'],[30,16,10,1.5,'y']]},
    48:{n:2,h:[[22,29,6,2,'any'],[24,4,8,1.2,'y']]},
    49:{n:2,h:[[12,14,7,2,'y'],[36,14,7,2,'y'],[12,24,7,2,'y'],[36,24,7,2,'y'],[12,34,7,2,'y'],[36,34,7,2,'y']]},
    50:{n:2,h:[[18,24,10,2,'x'],[36,22,8,1.5,'x']]},
    51:{n:2,h:[[14,16,10,2.5,'y'],[34,16,10,2.5,'y']]},
    52:{n:2,h:[[24,12,5,2,'any'],[13,31,5,2,'any'],[35,31,5,2,'any']]},
    53:{n:2,h:[[32,10,8,2,'any'],[10,38,6,2,'any']]},
    122:{n:2,h:[[32,4,20,2.5,'y'],[32,60,20,2.5,'y'],[4,32,20,2.5,'x'],[60,32,20,2.5,'x']]},
    123:{n:2,h:[[32,4,20,2.5,'y'],[32,60,20,2.5,'y'],[4,32,20,2.5,'x'],[60,32,20,2.5,'x']]}
  };
  /* rig automático: asas en los puntos que más sobresalen del contorno (puntas, esquinas, bordes) */
  function autoRig(G,pts,seed,strip){
    if(strip){const h=[];for(let x=G.x0;x<=G.x1+1;x+=G.w/8)h.push([x,G.y0+G.h/2,G.w/10,G.h*.12,'y']);return {n:2,h}}
    const cx=G.cx,cy=G.y0+G.h/2,m=Math.max(G.w,G.h),best=new Array(8).fill(null);
    pts.forEach(p=>{const a=Math.atan2(p[1]-cy,p[0]-cx),b=((Math.round(a/(Math.PI/4))%8)+8)%8,d=Math.hypot(p[0]-cx,p[1]-cy);if(!best[b]||d>best[b][2])best[b]=[p[0],p[1],d]});
    const h=best.filter(Boolean).sort((a,b)=>b[2]-a[2]).slice(0,5).map(b=>[b[0],b[1],m*.28,m*.045,'out']);
    return {n:2,h};
  }
  function poses(hd,G,rnd){
    const [x,y,r,amp,dir]=hd,K=6,P=[[0,0]],T=[0];
    const cx=G.cx,cy=G.y0+G.h/2,ox=x-cx,oy=y-cy,ol=Math.hypot(ox,oy)||1;
    for(let k=1;k<K;k++){
      const mag=amp*(.35+.65*rnd()),sg=rnd()<.5?-1:1,an=rnd()*Math.PI*2;
      if(dir==='x')P.push([sg*mag,(rnd()-.5)*mag*.3]);
      else if(dir==='y')P.push([(rnd()-.5)*mag*.3,sg*mag]);
      else if(dir==='out'){const f=(rnd()*1.4-.5)*mag;P.push([ox/ol*f+(rnd()-.5)*mag*.4,oy/ol*f+(rnd()-.5)*mag*.4])}
      else P.push([Math.cos(an)*mag,Math.sin(an)*mag]);
      T.push(T[k-1]+.5+rnd());
    }
    const tot=T[K-1]+.5+rnd();return {P,T:T.map(v=>v/tot)};
  }
  function offAt(pz,u){   // posición del asa en la fase u (0..1), con transición suave entre poses
    const {P,T}=pz,K=P.length;let k=K-1;for(let i=0;i<K;i++)if(T[i]<=u)k=i;
    const t0=T[k],t1=k+1<K?T[k+1]:1,a=P[k],b=P[(k+1)%K],f=(u-t0)/Math.max(1e-6,t1-t0),e=.5-.5*Math.cos(Math.PI*f);
    return [a[0]+(b[0]-a[0])*e,a[1]+(b[1]-a[1])*e];
  }
  const f4=v=>(Math.round(v*100)/100).toString();
  MA.deform=c=>{
    const vbw=c.vb[2],vbh=c.vb[3],strip=vbw/vbh>4,idx=MA.curIcon;
    const leaves=c.L.filter(e=>e.tagName!=='text');
    const info=leaves.map(e=>({el:e,out:outline(e,vbw)}));
    let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;const all=[];
    info.forEach(o=>o.out.forEach(s=>s.pts.forEach(p=>{all.push(p);x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1])})));
    const G={x0,y0,x1,y1,w:Math.max(1,x1-x0),h:Math.max(1,y1-y0),cx:(x0+x1)/2};
    const rig=R[idx]||autoRig(G,all,idx||7,strip),rnd=rng(1000+(idx||0)*97);
    const hs=rig.h.map(h=>({x:h[0],y:h[1],r:h[2],pz:poses(h,G,rnd)}));
    const K=48,u0=c.baked?((c.t*c.sp)%c.P)/c.P:0,A=c.inten,n=rig.n||2;
    info.forEach((o,li)=>{
      if(rig.only&&!rig.only.includes(li))return;if(!o.out.length)return;
      const near=hs.filter(h=>o.out.some(s=>s.pts.some(p=>Math.hypot(p[0]-h.x,p[1]-h.y)<h.r)));if(!near.length)return;
      const dAt=u=>{const uu=(u*n)%1,offs=near.map(h=>offAt(h.pz,uu));return o.out.map(s=>{
        const q=s.pts.map(p=>{let dx=0,dy=0;near.forEach((h,j)=>{const d=Math.hypot(p[0]-h.x,p[1]-h.y)/h.r;if(d<1){const w=(1-d*d)*(1-d*d);dx+=w*offs[j][0];dy+=w*offs[j][1]}});return f4(p[0]+dx*A)+' '+f4(p[1]+dy*A)});
        return 'M'+q.join('L')+(s.closed?'Z':'')}).join('')};
      let path=o.el;
      if(o.el.tagName!=='path'){
        path=c.doc.createElementNS(NS,'path');
        [...o.el.attributes].forEach(a=>{if(!/^(x|y|width|height|rx|ry|cx|cy|r|points|x1|y1|x2|y2)$/.test(a.name))path.setAttribute(a.name,a.value)});
        o.el.parentNode.replaceChild(path,o.el);
      }
      if(c.baked){path.setAttribute('d',dAt(u0));return}
      const vals=[];for(let k=0;k<K;k++)vals.push(dAt(k/K));vals.push(vals[0]);
      path.setAttribute('d',vals[0]);
      const an=c.doc.createElementNS(NS,'animate');an.setAttribute('attributeName','d');an.setAttribute('dur',(c.P/c.sp)+'s');an.setAttribute('repeatCount','indefinite');an.setAttribute('values',vals.join(';'));
      path.appendChild(an);
    });
  };
})();
