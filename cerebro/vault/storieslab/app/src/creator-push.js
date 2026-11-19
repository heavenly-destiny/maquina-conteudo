export const CREATOR_VAPID='BB95F2GVzvLOGhw8FrpM19iR7ZMNUtjoWNlUtfjblyDxlHmAOHHNupJXxxfCxeGFYGqEk1PHSau3gQtMQegYxSI';
export function validPushEndpoint(value){
 try{const u=new URL(value);return value.length<=1000&&u.protocol==='https:'&&!u.username&&!u.password&&!u.port&&/^(?:[a-z0-9-]+\.)*(?:fcm\.googleapis\.com|push\.services\.mozilla\.com|push\.apple\.com|notify\.windows\.com)$/.test(u.hostname)}catch{return false}
}
const b64=b=>btoa(String.fromCharCode(...new Uint8Array(b))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
export async function sendCreatorPush(env,endpoint,topic,publicKey=CREATOR_VAPID){
 if(!validPushEndpoint(endpoint))throw Error('Invalid push endpoint');
 const raw=Uint8Array.from(atob(publicKey.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
 const key=await crypto.subtle.importKey('jwk',{kty:'EC',crv:'P-256',x:b64(raw.slice(1,33)),y:b64(raw.slice(33)),d:env.VAPID_D},{name:'ECDSA',namedCurve:'P-256'},false,['sign']);
 const enc=o=>b64(new TextEncoder().encode(JSON.stringify(o)));
 const jwt=enc({typ:'JWT',alg:'ES256'})+'.'+enc({aud:new URL(endpoint).origin,exp:Math.floor(Date.now()/1000)+3600,sub:'https://storieslab.shop'});
 const sig=await crypto.subtle.sign({name:'ECDSA',hash:'SHA-256'},key,new TextEncoder().encode(jwt));
 // Empty push: the kit service worker displays fixed copy, never sales amounts or buyer data.
 return fetch(endpoint,{method:'POST',redirect:'manual',signal:AbortSignal.timeout(10000),headers:{TTL:'86400',Urgency:'normal',Topic:topic,Authorization:`vapid t=${jwt+'.'+b64(sig)}, k=${publicKey}`}});
}

