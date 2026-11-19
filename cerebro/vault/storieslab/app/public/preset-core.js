// Pure color math, shared by the browser worker and numerical checks.
(() => {
  function parseCube(text) {
    let size=0, min=[0,0,0], max=[1,1,1]; const values=[];
    for(const raw of text.split(/\r?\n/)) {
      const line=raw.split('#')[0].trim(); if(!line)continue;
      const parts=line.split(/\s+/), key=parts[0];
      if(key==='LUT_3D_SIZE')size=Number(parts[1]);
      else if(key==='DOMAIN_MIN')min=parts.slice(1).map(Number);
      else if(key==='DOMAIN_MAX')max=parts.slice(1).map(Number);
      else if(/^[+\-.\d]/.test(key)){if(parts.length!==3)throw Error('Invalid LUT row');values.push(...parts.map(Number));}
    }
    if(!Number.isInteger(size)||size<2||size>65||values.length!==size**3*3||!values.every(Number.isFinite)||min.length!==3||max.length!==3||min.some((v,i)=>!Number.isFinite(v)||!Number.isFinite(max[i])||max[i]<=v))throw Error('Invalid LUT');
    return {size,min,max,values:new Float32Array(values)};
  }
  function apply(rgba,lut,intensity) {
    const out=new Uint8ClampedArray(rgba.length), amount=Math.max(0,Math.min(1,intensity));
    if(!amount){out.set(rgba);return out;}
    const {size:n,min,max,values:v}=lut, edge=n-1, strideG=n*3, strideB=n*n*3;
    const scale=min.map((_,i)=>edge/(max[i]-min[i]));
    for(let p=0;p<rgba.length;p+=4) {
      const r=Math.max(0,Math.min(edge,(rgba[p]/255-min[0])*scale[0]));
      const g=Math.max(0,Math.min(edge,(rgba[p+1]/255-min[1])*scale[1]));
      const b=Math.max(0,Math.min(edge,(rgba[p+2]/255-min[2])*scale[2]));
      const ri=Math.min(n-2,Math.floor(r)),gi=Math.min(n-2,Math.floor(g)),bi=Math.min(n-2,Math.floor(b));
      const fr=r-ri,fg=g-gi,fb=b-bi,base=ri*3+gi*strideG+bi*strideB;
      for(let c=0;c<3;c++) {
        const q=base+c;
        const a=v[q]+(v[q+3]-v[q])*fr, d=v[q+strideG]+(v[q+strideG+3]-v[q+strideG])*fr;
        const e=v[q+strideB]+(v[q+strideB+3]-v[q+strideB])*fr, f=v[q+strideB+strideG]+(v[q+strideB+strideG+3]-v[q+strideB+strideG])*fr;
        const low=a+(d-a)*fg,high=e+(f-e)*fg;
        out[p+c]=rgba[p+c]+((low+(high-low)*fb)*255-rgba[p+c])*amount;
      }
      out[p+3]=rgba[p+3];
    }
    return out;
  }
  // Neutral settings are byte-exact. Apply after the look, identically in preview/export.
  function adjustBasic(rgba,settings={}) {
    const value=k=>Math.max(-100,Math.min(100,Number(settings[k])||0));
    const light=value('light'),contrast=value('contrast'),warmth=value('warmth'),color=value('color');
    if(!light&&!contrast&&!warmth&&!color)return rgba;
    const out=new Uint8ClampedArray(rgba.length),exposure=2**(light/100),saturation=1+color/100,c=1+contrast/125;
    for(let p=0;p<rgba.length;p+=4){
      let r=(rgba[p]*exposure-127.5)*c+127.5+warmth*.25;
      let g=(rgba[p+1]*exposure-127.5)*c+127.5;
      let b=(rgba[p+2]*exposure-127.5)*c+127.5-warmth*.25;
      const y=.2126*r+.7152*g+.0722*b;
      out[p]=y+(r-y)*saturation;out[p+1]=y+(g-y)*saturation;out[p+2]=y+(b-y)*saturation;out[p+3]=rgba[p+3];
    }
    return out;
  }
  function adjust(rgba,settings={}) {
    const base=adjustBasic(rgba,settings),v=k=>Math.max(-100,Math.min(100,Number(settings[k])||0));
    const highlights=v('highlights'),shadows=v('shadows'),tint=v('tint'),vibrance=v('vibrance');
    if(!highlights&&!shadows&&!tint&&!vibrance)return base;
    const out=new Uint8ClampedArray(base.length);
    for(let p=0;p<base.length;p+=4){
      let r=base[p]/255,g=base[p+1]/255,b=base[p+2]/255,y=.2126*r+.7152*g+.0722*b;
      const tone=highlights/100*y*y*(1-y)*.9+shadows/100*(1-y)*(1-y)*y*.9;
      r+=tone+tint/100*.04;g+=tone-tint/100*.06;b+=tone+tint/100*.04;
      y=.2126*r+.7152*g+.0722*b;
      const chroma=Math.max(r,g,b)-Math.min(r,g,b),sat=1+vibrance/100*(1-Math.min(1,chroma))*.7;
      out[p]=(y+(r-y)*sat)*255;out[p+1]=(y+(g-y)*sat)*255;out[p+2]=(y+(b-y)*sat)*255;out[p+3]=base[p+3];
    }
    return out;
  }
  globalThis.PresetCore={parseCube,apply,adjust};
})();
