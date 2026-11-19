// Opt-in, device-only storage. No photo or recipe is sent to a server.
(() => {
  const owner=()=>ME?.email?.trim().toLowerCase()||'local';
  const recipesKey=()=>`sl_my_looks:${owner()}`;
  let database;
  function db(){
    if(database)return database;
    database=new Promise((resolve,reject)=>{
      const req=indexedDB.open('storieslab-studio',1);
      req.onupgradeneeded=()=>req.result.createObjectStore('drafts');
      req.onsuccess=()=>resolve(req.result);
      req.onerror=()=>reject(req.error);
      req.onblocked=()=>reject(Error('Storage blocked'));
    }).catch(e=>{database=null;throw e;});
    return database;
  }
  async function transaction(mode,operation){
    const connection=await db();
    return new Promise((resolve,reject)=>{
      const tx=connection.transaction('drafts',mode),request=operation(tx.objectStore('drafts'));
      tx.oncomplete=()=>resolve(request.result);
      tx.onerror=()=>reject(tx.error||request.error);
      tx.onabort=()=>reject(tx.error||Error('Storage aborted'));
    });
  }
  window.StudioLibrary={
    recipes(){try{const data=JSON.parse(SLStorage.getItem(recipesKey())||'[]');return Array.isArray(data)?data.filter(r=>r&&typeof r.id==='string'&&typeof r.name==='string'&&r.settings&&typeof r.settings==='object').slice(0,12):[];}catch{return [];}},
    saveRecipes(rows){SLStorage.setItem(recipesKey(),JSON.stringify(rows.slice(0,12)));},
    getDraft(){const key=owner();return transaction('readonly',s=>s.get(key));},
    putDraft(value){const key=owner();return transaction('readwrite',s=>s.put(value,key));},
    deleteDraft(){const key=owner();return transaction('readwrite',s=>s.delete(key));}
  };
})();
