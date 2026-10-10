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
  /* ---- acciones de deformación por ícono: cada una cuenta lo que el elemento hace o sufre ----
     f(x,y,capa,u,A) → [x',y'] ; u = fase 0..1 (cíclica). Si x:true, la función ya aplica la intensidad A. */
  const TAU=Math.PI*2,sn=v=>Math.sin(TAU*v),cs=v=>Math.cos(TAU*v),cl=(v,a=0,b=1)=>v<a?a:v>b?b:v,
    sm=(a,b,v)=>{const t=cl((v-a)/(b-a));return t*t*(3-2*t)},ga=(v,w)=>Math.exp(-(v/w)*(v/w)),
    hop=u=>4*u*(1-u),land=(u,w=.07)=>ga(Math.min(u,1-u),w),
    rot=(x,y,cx,cy,a)=>{const c=Math.cos(a),s=Math.sin(a),dx=x-cx,dy=y-cy;return [cx+dx*c-dy*s,cy+dx*s+dy*c]},
    sc=(x,y,cx,cy,sx,sy)=>[cx+(x-cx)*sx,cy+(y-cy)*sy],
    flame=(x,y,u,base,top,k)=>{const h=cl((base-y)/(base-top)),e=Math.pow(h,1.5);
      return [x+k*e*(2.3*sn(2*u+y/18)+1.1*sn(3*u+y/9+.3)+.5*sn(5*u+x/7)),
              y-k*Math.pow(h,1.2)*(1.4*(.5+.5*sn(3*u+x/12))+.7*sn(4*u+.2))]},
    tick=(x,y,vx,vy,u,t0)=>{const r=sm(t0,t0+.1,u),a=sm(t0+.1,t0+.26,u),b=sm(t0+.22,t0+.42,u),o=.12*Math.sin(Math.PI*cl((u-t0-.4)/.12));
      const s=x<=vx?1-.55*r+.55*a:1-.75*r+.75*b+o;return [vx+(x-vx)*s,vy+(y-vy)*s]};
  const FX={
    0:{n:2,f:(x,y,l,u)=>{const s=.5-.5*cs(u);return l===0?[x,y+(24-y)/16*3.2*s]:[x+.6*s*sn(x/12),y+(24-y)*.28*s]}},              // la lana se comprime y recupera
    1:{n:2,f:(x,y,l,u)=>[x,y+2.2*sn(u)*cl(1-((x-24)/16)**2)]},                                                                    // la placa se flecta
    2:{n:2,f:(x,y,l,u)=>[x,y+2*sn(u-(l?.05:0))*cl(1-((x-24)/18)**2)]},
    3:{n:1,f:(x,y,l,u)=>flame(x,y,u,41,5,1)},                                                                                    // la llama lame hacia arriba
    4:{n:1,f:(x,y,l,u)=>{if(l!==1)return [x,y];let [nx,ny]=flame(x,y,u,37,10,.9);const h=cl((37-y)/27);nx-=h*1.6*(.5+.5*sn(2*u));
        if(nx<16)nx=16+(nx-16)*.15;return [nx,ny]}},                                                                               // la llama choca contra el muro
    5:{n:1,f:(x,y,l,u)=>l===1?flame(x,y,u,31,14,.55):[x,y]},                                                                      // el escudo contiene la llama
    6:{n:1,f:(x,y,l,u)=>{const s=.5+.5*sn(u),top=34-18*(.35+.75*s);
        if(l===1)return [x,34-(34-y)*(.35+.75*s)];
        if(l===0&&y>29)return [x+(x-24)*.09*s,y+(y-35)*.09*s];
        if(l===2){const lit=cl((y+1-top)/3);return [32+(x-32)*(1+.6*lit),y]}return [x,y]}},                                     // el mercurio sube y baja
    7:{n:2,f:(x,y,l,u)=>{if(l===1){let nx=x+4.5*(.5-.5*cs(u));if(nx>19.5)nx=19.5+(nx-19.5)*.15;return [nx,y]}
        if(l===2)return [x+.35*sn(6*u)*(.5-.5*cs(u)),y];return [x,y]}},                                                          // el calor choca y no pasa
    8:{n:1,K:96,f:(x,y,l,u)=>{if(l<2)return [x+(l?.9*cl((x-13)/9):.3)*sn(4*u),y];
        const r=Math.hypot(x-13,y-24)||1,dr=1.8*sn(2*u-r/12);return [13+(x-13)*(r+dr)/r,24+(y-24)*(r+dr)/r]}},                     // el parlante empuja y las ondas salen
    9:{n:1,f:(x,y,l,u)=>{if(l===1){let nx=x+2.2*sn(2*u-x/10);if(nx>25)nx=25+(nx-25)*.15;return [nx,y]}
        if(l===2)return [x+.3*sn(2*u-.8),y];return [x,y]}},                                                                      // las ondas se frenan en el muro
    10:{n:1,K:96,f:(x,y,l,u)=>{const i=Math.round((x-8)/8),s=1+.45*sn(2*u+i*.23)+.22*sn(3*u+i*.41)+.1*sn(5*u+i*.7);return [x,Math.max(5,40-(40-y)*s)]}}, // ecualizador
    11:{n:2,f:(x,y,l,u)=>{const sy=1+.1*sn(u),h=cl((30-y)/25);return [24+(x-24)/Math.sqrt(sy)+h*h*1.6*sn(u+.25),42-(42-y)*sy]}},  // la gota ondula como líquido
    12:{n:2,f:(x,y,l,u)=>{const h=hop(u),q=land(u);if(l===0)return [x,y>41?y+1.1*q*ga(x-24,6):y];
        const b=35+3.2-6*h;return [24+(x-24)*(1+.18*q),b-(35-y)*(1-.2*q)]}},                                                     // la gota rebota sin traspasar
    13:{n:2,f:(x,y,l,u)=>{const q=ga(u-.45,.07),d=4*(u<.45?sm(0,.45,u)**2:1-sm(.45,1,u));
        if(l===1){let nx=x+d-q*1.4*cl((x-16)/8);return [nx,y]}
        if(l===2){const s=1+.8*q;return [30+(x-30)*s,24+(y-24)*s]}
        return [x<37?x+.9*q*ga(y-24,6):x,y]}},                                                                                   // el golpe abolla y rebota
    14:{n:1,f:(x,y,l,u)=>[x,y+(y-23)/13*1.3*sn(2*u-x/14)]},                                                                       // pasa el aire y el ducto respira
    15:{n:1,f:(x,y,l,u)=>[x,y+2.6*(.5-.5*cs(u))*cl(1-((x-24)/15)**2)]},                                                           // la viga cede bajo carga
    16:{n:1,f:(x,y,l,u)=>{const B=sn(u);return [x+2.4*B*Math.sin(Math.PI*(y-6)/36),y+(42-y)/36*1.2*Math.abs(B)]}},                 // la columna se pandea
    17:{n:1,f:(x,y,l,u)=>{const s=sn(u),k=(x-14)/20;return y<14?[x,y-k*1.8*s]:y>34?[x,y+k*1.8*s]:[x,y]}},                       // las alas del perfil se abren
    18:{n:1,f:(x,y,l,u)=>{const s=sn(u);return [x+(x<24?-1:1)*(36-y)/24*1.9*s,y+.7*s*cl(1-((x-24)/14)**2)*(y>35)]}},
    19:{n:1,f:(x,y,l,u)=>{const t=sn(2*u),z=1.5*(.5-.5*cs(u));if(y<9)return [24+(x-24)*(1-.3*Math.abs(t)),y+z];
        return [x,y+z+(Math.abs(x-24)>.5?t*(x-24)/4*1.7:0)]}},                                                                    // el tornillo gira y entra
    20:{n:2,f:(x,y,l,u)=>{const w=Math.sin(Math.PI*cl((y-6)/36))*sn(u);if(l===1)return [x+(x<24?1:-1)*1.7*w,y];
        return [x<8||x>40?x+(x<24?-1:1)*.8*w:x,y]}},                                                                             // el tabique absorbe la vibración
    21:{n:1,f:(x,y,l,u)=>l===0?[x+(y-8)/22*1.6*sn(u),y]:[x+1.6*sn(u-.08),y+.6*sn(2*u-x/20)]},                                     // el cielo colgado se mece
    22:{n:1,f:(x,y,l,u)=>{const s=.5-.5*cs(u);if(l===2)return [22+(x-22)*(.55+.5*s),y+.7*sn(2*u-x/8)*(x-22)/22];
        if(l===0)return sc(x,y,22,22,1-.05*s,1-.05*s);return [x+.8*sn(2*u),y+.8*(cs(2*u)-1)]}},                                  // la cinta se desenrolla
    23:{n:1,f:(x,y,l,u)=>{let [nx,ny]=l===1?rot(x,y,26,30,.12*sn(u)):[x-(y>36?1.4*cs(u)*(y-36)/6:0),y];return [nx+4*sn(u),ny]}},  // la espátula esparce
    24:{n:1,f:(x,y,l,u)=>{if(l===3)return [x,y];const d=3*sn(u),e=[0,.8,1.6][l];return [x+d+e*sn(2*u),y+e*(cs(2*u)-1)]}},       // el rollo rueda
    25:{n:1,f:(x,y,l,u)=>{const h=hop(u),q=land(u);if(l===2)return [24+(x-24)*(1+.1*q),24-5*h-(24-y)*(1-.18*q)];
        return [x,y<30?y+1.3*q*(42-y)/16:y]}},                                                                                    // la caja cae sobre la pila
    26:{n:1,K:96,f:(x,y,l,u)=>{const b=sn(4*u);if(l<2)return [x+.8*sn(u),y+.7*sn(4*u-(l?.08:0))+(x-24)*.03*sn(2*u+.2)];
        return [x+.8*sn(u),y>38.5?y-.5*(.5+.5*b):y]}},                                                                           // el camión avanza traqueteando
    27:{n:2,f:(x,y,l,u)=>{const h=hop(u),q=land(u),hl=hop(cl(u-.04)),sy=1-.16*q+.08*h;return l===0?[24+(x-24)*(1+.08*q),34-(34-y)*sy-3*h]:[x,34-(34-y)*sy-3*hl]}}, // el casco cae y se asienta
    28:{n:1,K:96,x:true,f:(x,y,l,u,A)=>{const th=(u<.6?-.45*sm(0,.6,u):u<.7?-.45+.6*sm(.6,.7,u):.15*(1-sm(.7,1,u)))*A,q=ga(u-.7,.04);
        const [nx,ny]=rot(x,y,24,44,th);return [nx,ny+(l===0?.9*q*A*cl((Math.abs(x-24)-8)/10):0)]}},                          // la picota golpea
    29:{n:1,f:(x,y,l,u)=>{if(l===0&&y<29&&x<24)return [x,y+1.1*sn(3*u+x/10)];if(l===0&&x>=23)return [x,42-(42-y)*(1+.05*sn(2*u+.5))];
        if(l===1)return [x,42-(42-y)*(1+.06*(.5+.5*sn(2*u)))];return [x,y]}},                                                     // la industria trabaja
    30:{n:1,f:(x,y,l,u)=>l===0?[x+(x<24?1:-1)*1.2*sn(2*u)*Math.sin(Math.PI*cl((42-y)/36)),y-(y<8?.7*sn(4*u+x/6):0)]:[x,y]},       // la torre respira vapor
    31:{n:1,f:(x,y,l,u)=>l===2&&x>24.3?[x-.3*(1-cs(2*u-(x-24)/8))*(x-24)/8,y+1.4*(x-24)/8*sn(2*u-(x-24)/8)]:[x,y]},              // la bandera flamea
    32:{n:1,f:(x,y,l,u)=>l<2?[x+(42-y)/38*1.7*sn(u),y]:[x,y]},                                                                    // el edificio oscila
    33:{n:1,f:(x,y,l,u)=>{const o=sm(.1,.4,u)*(1-sm(.6,.9,u));return l===1?[20+(x-20)*(1-.6*o),y+(y-36)*.12*o*(x-20)/8]:[x,y]}},   // la puerta se abre
    34:{n:1,f:(x,y,l,u)=>{if(l===2)return [x,y];const c=3.6*(.5-.5*cs(u)),w=cl(1-Math.hypot(x-42,y-8)/14)**2;return [x-c*w,y+c*w]}}, // la esquina del plano se dobla
    35:{n:1,f:(x,y,l,u)=>rot(x,y,8,42,.1*sn(u))},                                                                                 // la escuadra mide
    36:{n:1,f:(x,y,l,u)=>{const th=.07*sn(u);let px=x,py=y;
        if(l===1){const v=Math.abs(cs(u-.06));px=24.5+(x-24.5)*(1+.3*v);py=24.5+(y-24.5)*(1-.15*v);px-=8*sn(u-.06)}
        return rot(px,py,24,24,th)}},                                                                                             // la burbuja busca el nivel
    37:{n:1,f:(x,y,l,u)=>{if(l!==2)return [x,y];const i=Math.round((y-22)/7),w=sm(.08+i*.16,.3+i*.16,u)*(1-sm(.86,.98,u));return [16+(x-16)*Math.max(.04,w),y]}}, // se escribe la cotización
    38:{n:1,K:96,f:(x,y,l,u)=>{const u2=(u*2)%1,r=sm(0,.03,u2)*(1-sm(.3,.36,u2)),v=sn(16*u);const [nx,ny]=rot(x,y,24,24,.06*r*sn(16*u+.25));return [nx+.9*r*v,ny]}}, // el teléfono vibra
    39:{n:1,f:(x,y,l,u)=>{const o=sm(.1,.4,u)*(1-sm(.65,.9,u));return l===1?[x,11+(y-11)*(1-1.6*o)]:[x,y]}},                    // el sobre se abre
    40:{n:1,f:(x,y,l,u)=>{const h=hop(u),q=land(u),sy=1-.2*q;return [24+(x-24)*(1+.12*q),44-(44-y)*sy-5*h]}},                   // el pin cae y marca
    41:{n:1,K:96,x:true,f:(x,y,l,u,A)=>{if(l!==1||y>23.6)return [x,y];const st=Math.floor(u*12),f=(u*12)%1,a=(st+sm(0,.22,f)+.06*Math.sin(Math.PI*cl((f-.22)/.2)))/12*TAU;
        return rot(x,y,24,24,a)}},                                                                                                // el minutero avanza a saltos
    42:{n:1,f:(x,y,l,u)=>tick(x,y,19,36,u,.05)},                                                                                  // se marca el check
    43:{n:1,f:(x,y,l,u)=>{const h=hop(u),q=land(u);if(l===2)return [34+(x-34)*(1+.12*q),43-(43-y)*(1-.2*q)-3*h];
        if(l===3)return [x+.8*sn(3*u)*(y-42)/4,y-3*h];return [x,y]}},                                                          // el sello timbra
    44:{n:1,f:(x,y,l,u)=>{const s=.5-.5*cs(u);return [x,y+[-2.6,-.4,1.8][l]*s]}},                                               // las capas se separan y juntan
    45:{n:1,f:(x,y,l,u)=>[x+(x-24)/10*2.6*sn(u),y]},                                                                              // el espesor crece y baja
    46:{n:2,f:(x,y,l,u)=>{const sy=1-.14*(.5-.5*cs(u));return [24+(x-24)*(1+.5*(1-sy)),42-(42-y)*sy]}},                          // el cubo se compacta
    47:{n:1,K:96,f:(x,y,l,u)=>{const p=Math.max(0,l?-sn(u):sn(u))**1.5,c=l?[31,28]:[17,15],k=1+.07*p*(1+.5*sn(8*u));let [nx,ny]=sc(x,y,c[0],c[1],k,k);
        if(l===0&&y>24)nx+=1.2*p*sn(8*u);if(l===1&&y>34)nx+=1.2*p*sn(8*u);return [nx,ny]}},                                       // la conversación va y viene
    48:{n:1,f:(x,y,l,u)=>{if(l===1)return tick(x,y,22,29,u,.1);const k=1+.05*ga(u-.48,.06);return sc(x,y,24,24,k,k)}},            // garantía: check y sello
    49:{n:1,f:(x,y,l,u)=>[x+.4*sn(2*u-x/22),y+1.6*sn(2*u-x/22+(y-14)/10*.15)]},                                                   // las fibras ondulan
    50:{n:1,f:(x,y,l,u)=>{const c=.5-.5*cs(u);return l===0?[30+(x-30)*(1-.45*c),24+(y-24)*(1+.12*c*(30-x)/24)]:[30+(x-30)*(1+.9*c),24+(y-24)*(1-.06*c*(x-30)/12)]}}, // el panel gira
    51:{n:1,f:(x,y,l,u)=>{const a=3*Math.sin(Math.PI*u),g=ga(x-(6+36*u),6);if(y<24)return [x,y+a*g*(24-y)/8];return [x,y+(l===1?.4*a*g:0)]}}, // alguien pisa la colchoneta
    52:{n:1,x:true,f:(x,y,l,u,A)=>{if(l!==2)return [x,y];const k=1+.06*A*sn(3*u);const [nx,ny]=rot(x,y,24,24,TAU*u);return sc(nx,ny,24,24,k,k)}}, // la radiación gira
    53:{n:1,f:(x,y,l,u)=>rot(x,y,35,13,.32*(sm(0,.4,u)-sm(.5,.9,u)))}                                                             // la llave aprieta
  };
  const f4=v=>(Math.round(v*100)/100).toString();
  MA.deform=c=>{
    const vbw=c.vb[2],vbh=c.vb[3],strip=vbw/vbh>4,idx=MA.curIcon;
    const leaves=c.L.filter(e=>e.tagName!=='text');
    const info=leaves.map(e=>({el:e,out:outline(e,vbw)}));
    let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;const all=[];
    info.forEach(o=>o.out.forEach(s=>s.pts.forEach(p=>{all.push(p);x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1])})));
    const G={x0,y0,x1,y1,w:Math.max(1,x1-x0),h:Math.max(1,y1-y0),cx:(x0+x1)/2};
    if(FX[idx]){const fx=FX[idx],K=fx.K||48,n=fx.n||1,A=c.inten,u0=c.baked?((c.t*c.sp)%c.P)/c.P:0;
      info.forEach((o,li)=>{if(!o.out.length)return;
        const dAt=u=>{const uu=(u*n)%1;return o.out.map(s=>'M'+s.pts.map(p=>{const q=fx.f(p[0],p[1],li,uu,A);const X=fx.x?q[0]:p[0]+(q[0]-p[0])*A,Y=fx.x?q[1]:p[1]+(q[1]-p[1])*A;return f4(X)+' '+f4(Y)}).join('L')+(s.closed?'Z':'')).join('')};
        const vals=[];for(let k=0;k<K;k++)vals.push(dAt(k/K));
        if(!c.baked&&vals.every(v=>v===vals[0]))return;
        let path=o.el;
        if(o.el.tagName!=='path'){path=c.doc.createElementNS(NS,'path');
          [...o.el.attributes].forEach(a=>{if(!/^(x|y|width|height|rx|ry|cx|cy|r|points|x1|y1|x2|y2)$/.test(a.name))path.setAttribute(a.name,a.value)});
          o.el.parentNode.replaceChild(path,o.el)}
        if(c.baked){path.setAttribute('d',dAt(u0));return}
        vals.push(vals[0]);path.setAttribute('d',vals[0]);
        const an=c.doc.createElementNS(NS,'animate');an.setAttribute('attributeName','d');an.setAttribute('dur',(c.P/c.sp)+'s');an.setAttribute('repeatCount','indefinite');an.setAttribute('values',vals.join(';'));
        path.appendChild(an)});
      return}
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
