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
  const F={
    flame:(x,y,B,th,A)=>{const w=Math.max(0,(B.y1-y)/B.h),s=(x-B.cx)/B.w;
      return [A*B.w*(.11*Math.pow(w,1.3)*Math.sin(th)+.05*w*Math.sin(2*th+3*w+1)+.06*s*w*Math.sin(2*th-5*w)),
              -A*B.h*.07*Math.pow(w,1.2)*(.5+.5*Math.sin(th+2.2*w+.6))]},
    liquid:(x,y,B,th,A)=>[A*B.w*.06*Math.sin(th+4*(y-B.y0)/B.h),A*B.h*.05*Math.sin(th+.9+3*(x-B.cx)/B.w)],
    wave:(x,y,B,th,A)=>[0,A*Math.min(B.h*.14,B.w*.08)*Math.sin(2*Math.PI*1.5*(x-B.x0)/B.w-th)],
    strip:(x,y,B,th,A)=>[0,A*B.h*.12*Math.sin(2*Math.PI*2*(x-B.x0)/B.w-th)],
    ripple:(x,y,B,th,A)=>{const m=Math.max(B.w,B.h);return [A*m*.02*Math.sin(th+5*(y-B.y0)/m),A*m*.02*Math.sin(th+.8+5*(x-B.x0)/m)]}
  };
  /* qué se deforma y cómo (por índice de elemento); sin entrada = todo el contorno "hierve" suavemente */
  const DEF={3:[{k:'flame',l:[0],n:4}],4:[{k:'flame',l:[1],n:4}],5:[{k:'flame',l:[1],n:4}],
    11:[{k:'liquid',l:[0],n:3}],12:[{k:'liquid',l:[1],n:3}],0:[{k:'wave',l:[1],n:3}],49:[{k:'wave',l:[0],n:3}],
    8:[{k:'ripple',l:[2],n:3}],9:[{k:'ripple',l:[1],n:3}],10:[{k:'wave',l:[0],n:3}],31:[{k:'wave',l:[2],n:3,local:true}]};
  const f4=v=>(Math.round(v*100)/100).toString();
  MA.deform=c=>{
    const vbw=c.vb[2],vbh=c.vb[3],strip=vbw/vbh>4,idx=MA.curIcon;
    const spec=strip?[{k:'strip',l:null,n:2}]:(DEF[idx]||[{k:'ripple',l:null,n:3}]);
    const leaves=c.L.filter(e=>e.tagName!=='text');
    const info=leaves.map(e=>({el:e,out:outline(e,vbw)}));
    // caja global
    let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;info.forEach(o=>o.out.forEach(s=>s.pts.forEach(p=>{x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1])})));
    const G={x0,y0,x1,y1,w:Math.max(1,x1-x0),h:Math.max(1,y1-y0),cx:(x0+x1)/2};
    const K=36,u0=c.baked?((c.t*c.sp)%c.P)/c.P:0;
    info.forEach((o,li)=>{
      const sp=spec.find(s=>s.l===null||s.l.includes(li));if(!sp||!o.out.length)return;
      let B=G;if(sp.local){let a=1e9,b=1e9,cc=-1e9,d=-1e9;o.out.forEach(s=>s.pts.forEach(p=>{a=Math.min(a,p[0]);cc=Math.max(cc,p[0]);b=Math.min(b,p[1]);d=Math.max(d,p[1])}));B={x0:a,y0:b,x1:cc,y1:d,w:Math.max(1,cc-a),h:Math.max(1,d-b),cx:(a+cc)/2}}
      const field=F[sp.k],A=c.inten;
      const dAt=u=>{const th=2*Math.PI*sp.n*u;return o.out.map(s=>{
        const q=s.pts.map(p=>{const v=field(p[0],p[1],B,th,A);return f4(p[0]+v[0])+' '+f4(p[1]+v[1])});
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
