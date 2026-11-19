// Photo pixels stay on this device. Only the selected LUT file is fetched.
importScripts('preset-core.js?v=pro-1');
const cache=new Map(),PASS=new URLSearchParams(self.location.search).get('p');   // app pass for the gated CDN (cdn/gate.js)
async function getLut(look) {
  if(!/^\d{2,3}-[a-z0-9-]+$/.test(look))throw Error('Invalid look');
  if(!cache.has(look)){
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),20000);
    cache.set(look,fetch(`/m/mat/presets/cube/SL-${look}.cube?v=3${PASS?'&p='+PASS:''}`,{signal:controller.signal}).then(r=>{if(!r.ok)throw Error('LUT unavailable');return r.text();}).then(PresetCore.parseCube).catch(e=>{cache.delete(look);throw e;}).finally(()=>clearTimeout(timer)));
  }
  return cache.get(look);
}
self.onmessage=async({data:m})=>{
  try {
    const lut=m.amount>0?await getLut(m.look):null;
    const pixels=PresetCore.adjust(PresetCore.apply(new Uint8ClampedArray(m.pixels),lut,m.amount),m.adjustments);
    self.postMessage({id:m.id,pixels:pixels.buffer},[pixels.buffer]);
  }catch(e){self.postMessage({id:m.id,error:e.message});}
};
