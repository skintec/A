/* Exportación: cuadros -> GIF (codificador propio) o video (MediaRecorder: MP4 si el navegador lo permite, si no WebM). */
(function(){
  const P=MA.P;
  function loadImg(svgStr){return new Promise((res,rej)=>{const u=URL.createObjectURL(new Blob([svgStr],{type:'image/svg+xml'}));const im=new Image();im.onload=()=>{URL.revokeObjectURL(u);res(im)};im.onerror=e=>{URL.revokeObjectURL(u);rej(e)};im.src=u})}
  function sized(svgStr,W,H){return svgStr.replace(/<svg /,'<svg width="'+W+'" height="'+H+'" ')}
  async function frames(svgStr,aopts,bgColor,W,H,fps,onp,getData){
    const n=Math.round(P/(aopts.speed||1)*fps),cv=document.createElement('canvas');cv.width=W;cv.height=H;
    const ctx=cv.getContext('2d',{willReadFrequently:!!getData}),out=[];
    for(let k=0;k<n;k++){
      const im=await loadImg(sized(MA.animate(svgStr,Object.assign({},aopts,{t:k/fps})),W,H));
      ctx.fillStyle=bgColor;ctx.fillRect(0,0,W,H);ctx.drawImage(im,0,0,W,H);
      out.push(getData?ctx.getImageData(0,0,W,H).data:await createImageBitmap(cv));
      if(onp)onp((k+1)/n);
      if(k%6===0)await new Promise(r=>setTimeout(r));
    }
    return out;
  }
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
  /* fuentes: Bebas Neue y Archivo se incrustan en el SVG para que el texto se vea igual fuera de la página */
  let fontCache=null;
  async function fontCSS(){
    if(fontCache!==null)return fontCache;
    let css='';
    try{
      for(const q of ['Bebas+Neue','Archivo:wght@400;500;600;700']){
        const txt=await (await fetch('https://fonts.googleapis.com/css2?family='+q+'&display=swap')).text();
        const re=/\/\*\s*latin\s*\*\/\s*@font-face\s*\{([^}]+)\}/g;let m;
        while((m=re.exec(txt))){
          const b=m[1],fam=(b.match(/font-family:\s*([^;]+);/)||[])[1],wt=(b.match(/font-weight:\s*([^;]+);/)||[])[1],url=(b.match(/url\(([^)]+)\)/)||[])[1];
          if(!fam||!url)continue;
          const buf=await (await fetch(url)).arrayBuffer();let bin='';const u8=new Uint8Array(buf);for(let i=0;i<u8.length;i+=8192)bin+=String.fromCharCode.apply(null,u8.subarray(i,i+8192));
          css+='@font-face{font-family:'+fam+';font-weight:'+(wt||'400')+';src:url(data:font/woff2;base64,'+btoa(bin)+') format("woff2")}';
        }
      }
    }catch(e){css=''}
    return fontCache=css;
  }
  async function withFonts(svgStr){
    if(!/<text[\s>]/.test(svgStr))return svgStr;
    const css=await fontCSS();if(!css)return svgStr;
    return svgStr.replace(/(<svg\b[^>]*>)/,'$1<style>'+css+'</style>');
  }
  Object.assign(MA,{loadImg,sized,frames,gif,video,withFonts});
})();
