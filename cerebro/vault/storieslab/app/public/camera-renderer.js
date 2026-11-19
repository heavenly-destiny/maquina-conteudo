/* Live color pipeline: the same canvas feeds preview, photos and recorded video. */
(() => {
 window.CameraRenderer=class {
  constructor(canvas){
   const gl=this.gl=canvas.getContext('webgl2',{alpha:false,preserveDrawingBuffer:true});if(!gl)throw Error('Este navegador não suporta a câmera com efeitos.');
   const compile=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;};
   const p=this.program=gl.createProgram();gl.attachShader(p,compile(gl.VERTEX_SHADER,`#version 300 es
   in vec2 position;out vec2 uv;void main(){uv=(position+1.)*.5;gl_Position=vec4(position,0,1);}`));
   gl.attachShader(p,compile(gl.FRAGMENT_SHADER,`#version 300 es
   precision highp float;precision highp sampler3D;
   in vec2 uv;out vec4 outColor;uniform sampler2D frame;uniform sampler3D cube;
   uniform float size,amount,grain,vignette,warmth,fade,saturation,time,mirror,hasLut;uniform vec3 domainMin,domainMax;
   float noise(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233))+time)*43758.5453);}
   void main(){vec2 q=vec2(mirror>.5?1.-uv.x:uv.x,1.-uv.y);vec3 c=texture(frame,q).rgb;
   if(hasLut>.5){vec3 coord=clamp((c-domainMin)/(domainMax-domainMin),0.,1.);vec3 mapped=texture(cube,(coord*(size-1.)+.5)/size).rgb;c=mix(c,mapped,amount);}
   c+=vec3(warmth,0.,-warmth)*amount;float y=dot(c,vec3(.2126,.7152,.0722));c=mix(vec3(y),c,1.+saturation*amount);
   c=mix(c,vec3(.12)+c*.82,fade*amount);c*=1.-vignette*amount*smoothstep(.2,.72,length(uv-.5));
   c+=(noise(gl_FragCoord.xy)-.5)*grain*amount;outColor=vec4(clamp(c,0.,1.),1.);}`));
   gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error('Não foi possível iniciar os efeitos.');gl.useProgram(p);
   const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
   const loc=gl.getAttribLocation(p,'position');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
   this.frame=gl.createTexture();gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,this.frame);for(const k of [gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T])gl.texParameteri(gl.TEXTURE_2D,k,gl.CLAMP_TO_EDGE);for(const k of [gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER])gl.texParameteri(gl.TEXTURE_2D,k,gl.LINEAR);
   gl.uniform1i(gl.getUniformLocation(p,'frame'),0);gl.uniform1i(gl.getUniformLocation(p,'cube'),1);this.cube=gl.createTexture();this.setLut(null);
  }
  setLut(lut){const g=this.gl;g.useProgram(this.program);g.activeTexture(g.TEXTURE1);g.bindTexture(g.TEXTURE_3D,this.cube);g.pixelStorei(g.UNPACK_ALIGNMENT,1);for(const k of [g.TEXTURE_WRAP_S,g.TEXTURE_WRAP_T,g.TEXTURE_WRAP_R])g.texParameteri(g.TEXTURE_3D,k,g.CLAMP_TO_EDGE);for(const k of [g.TEXTURE_MIN_FILTER,g.TEXTURE_MAG_FILTER])g.texParameteri(g.TEXTURE_3D,k,g.LINEAR);const n=lut?.size||2;g.texImage3D(g.TEXTURE_3D,0,g.RGB8,n,n,n,0,g.RGB,g.UNSIGNED_BYTE,lut?Uint8Array.from(lut.values,v=>Math.round(Math.min(1,Math.max(0,v))*255)):new Uint8Array(24));this.uniform('size',n);this.uniform('hasLut',lut?1:0);g.uniform3fv(g.getUniformLocation(this.program,'domainMin'),lut?.min||[0,0,0]);g.uniform3fv(g.getUniformLocation(this.program,'domainMax'),lut?.max||[1,1,1]);}
  uniform(k,v){this.gl.uniform1f(this.gl.getUniformLocation(this.program,k),v);}
  draw(video,style,amount,mirror){const g=this.gl;g.useProgram(this.program);g.viewport(0,0,g.canvas.width,g.canvas.height);g.activeTexture(g.TEXTURE0);g.bindTexture(g.TEXTURE_2D,this.frame);g.texImage2D(g.TEXTURE_2D,0,g.RGB,g.RGB,g.UNSIGNED_BYTE,video);for(const k of ['grain','vignette','warmth','fade','saturation'])this.uniform(k,style[k]||0);this.uniform('amount',amount);this.uniform('mirror',mirror?1:0);this.uniform('time',performance.now()*.001);g.drawArrays(g.TRIANGLES,0,6);}
  destroy(){this.gl.getExtension('WEBGL_lose_context')?.loseContext();}
 };
})();
