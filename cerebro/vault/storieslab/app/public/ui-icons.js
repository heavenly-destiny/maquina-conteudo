/* Stories Lab icon family. Original geometry, shared by navigation and tools. */
(() => {
 const p=d=>`<path d="${d}"/>`,c=(x,y,r)=>`<circle cx="${x}" cy="${y}" r="${r}"/>`;
 const shapes={
  home:p('m3.5 10 7-6a2.3 2.3 0 0 1 3 0l7 6M5.5 9v10a1.5 1.5 0 0 0 1.5 1.5h3v-6h4v6h3a1.5 1.5 0 0 0 1.5-1.5V9'),
  book:p('M11.5 5.5C8.8 3.7 6 3.5 3.5 4.5v14c2.5-1 5.3-.8 8 1l1 .5 1-.5c2.5-1.4 4.8-1.8 7-1V4.5c-2.4-.9-4.7-.6-7 1M12 6v14M6.5 8h2M6.5 11h2'),
  camera:p('M8 5.5 9.2 3.8h5.6L16 5.5h3.5A2 2 0 0 1 21.5 7.5v11a2 2 0 0 1-2 2h-15a2 2 0 0 1-2-2v-11a2 2 0 0 1 2-2Z')+c(12,12.5,4)+p('M18 8.5h.01'),
  heart:p('M12 20s-8.7-5.3-8.7-11A4.7 4.7 0 0 1 12 6.5 4.7 4.7 0 0 1 20.7 9C20.7 14.7 12 20 12 20Z'),
  user:c(12,7.5,3.7)+p('M4.5 20v-1c0-3.5 3.1-5.5 7.5-5.5s7.5 2 7.5 5.5v1'),
  lock:p('M7.5 10V7.5a4.5 4.5 0 0 1 9 0V10M6 10h12a2 2 0 0 1 2 2v6.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V12a2 2 0 0 1 2-2ZM12 14v3'),
  gem:p('M6.5 4.5h11L21.5 10 12 21 2.5 10ZM2.5 10h19M9 4.5 7.5 10 12 21l4.5-11L15 4.5'),
  arrow:p('M4 12h15m-5-5 5 5-5 5'),back:p('m14.5 5-7 7 7 7'),next:p('m9.5 5 7 7-7 7'),
  x:p('m6.5 6.5 11 11m-11 0 11-11'),search:c(10.5,10.5,6.5)+p('m15.5 15.5 5 5'),
  chev:p('m6.5 9 5.5 5.5L17.5 9'),copy:p('M8 8h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2ZM15 4H6a2 2 0 0 0-2 2v9'),
  share:p('M12 14V3m-4 4 4-4 4 4M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7'),
  down:p('M12 3v12m-4-4 4 4 4-4M4.5 17v2a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-2'),
  check:p('m5.5 12 4 4L18.5 7'),play:p('M8 4.5 20 12 8 19.5Z'),
  moon:p('M20 14.5A8.4 8.4 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5Z'),
  bgtile:p('M7 3.5h10A3.5 3.5 0 0 1 20.5 7v10a3.5 3.5 0 0 1-3.5 3.5H7A3.5 3.5 0 0 1 3.5 17V7A3.5 3.5 0 0 1 7 3.5Zm-2 16L19.5 5'),
  gift:p('M3.5 8.5h17v4h-17ZM5 12.5v8h14v-8M12 8.5v12M12 8.5C12 3 5 2.5 6 6c.6 2 3 2.5 6 2.5Zm0 0c0-5.5 7-6 6-2.5-.6 2-3 2.5-6 2.5Z'),
  ig:p('M8 3.5h8a4.5 4.5 0 0 1 4.5 4.5v8a4.5 4.5 0 0 1-4.5 4.5H8A4.5 4.5 0 0 1 3.5 16V8A4.5 4.5 0 0 1 8 3.5Z')+c(12,12,4)+p('M17.5 6.5h.01'),
  phone:p('M8.5 2.5h7a2 2 0 0 1 2 2v15a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2v-15a2 2 0 0 1 2-2ZM10 18.5h4'),
  spark:p('M12 3c1.3 5.6 3.4 7.7 9 9-5.6 1.3-7.7 3.4-9 9-1.3-5.6-3.4-7.7-9-9 5.6-1.3 7.7-3.4 9-9Z'),
  bell:p('M5 17c2-2 1.5-4 1.5-7a5.5 5.5 0 0 1 11 0c0 3-.5 5 1.5 7ZM10 20a2.5 2.5 0 0 0 4 0'),
  sun:c(12,12,4)+p('M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5'),
  out:p('M14.5 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M4 12h12M8 8l-4 4 4 4'),
  chat:p('M5 18.5 3.5 21 9 19.5h7a5 5 0 0 0 5-5V9a5 5 0 0 0-5-5H8a5 5 0 0 0-5 5v4a6 6 0 0 0 2 5.5ZM8 9h8m-8 4h5'),
  photo:p('M6 3.5h12a2.5 2.5 0 0 1 2.5 2.5v12a2.5 2.5 0 0 1-2.5 2.5H6A2.5 2.5 0 0 1 3.5 18V6A2.5 2.5 0 0 1 6 3.5Zm-2.5 13L9 11l5 5 3-3 3.5 3.5')+c(15.5,8.5,1),
  undo:p('M8 4 3.5 8.5 8 13M4 8.5h10a6 6 0 0 1 0 12h-3'),
  redo:p('M16 4 20.5 8.5 16 13m4-4.5H10a6 6 0 0 0 0 12h3'),
  reset:p('M4.5 10a8 8 0 1 1 1 7.5M4.5 4v6h6'),
  compare:p('M12 2.5v19M8.5 5H5a1.5 1.5 0 0 0-1.5 1.5v11A1.5 1.5 0 0 0 5 19h3.5m7-14H19a1.5 1.5 0 0 1 1.5 1.5v11A1.5 1.5 0 0 1 19 19h-3.5'),
  expand:p('M8 3.5H3.5V8m12-4.5h5V8M3.5 16v4.5H8m12.5-4.5v4.5H16'),
  color:p('M12 3c-2 3.4-6.5 7.7-6.5 11.2a6.5 6.5 0 0 0 13 0C18.5 10.7 14 6.4 12 3ZM9 15a3 3 0 0 0 3 3'),
  filters:c(9,8.5,5)+c(16,13,5)+c(8.5,16,5),
  flip:p('M3 10a9 9 0 0 1 15.5-4L21 9m0-5v5h-5M21 14a9 9 0 0 1-15.5 4L3 15m0 5v-5h5'),
  grid:p('M8 3v18m8-18v18M3 8h18M3 16h18'),
  audio:p('M9 6a3 3 0 0 1 6 0v6a3 3 0 0 1-6 0ZM5 11v1a7 7 0 0 0 14 0v-1M12 19v3'),
  timer:c(12,13,8)+p('M9 2h6m-3 5v6l3 2m3.5-11 2 2'),
  flash:p('m13.5 2-8 12H11l-.5 8 8-13H13Z'),
  video:p('M5 5.5h9a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2Zm11 4 5-3v11l-5-3'),
  settings:p('M4 7h16M4 17h16M8 4v6m8 4v6'),
  frame:p('M3.5 3.5h17v17h-17ZM7 7h10v8H7Z'),
  more:c(5,12,.6)+c(12,12,.6)+c(19,12,.6)
 };
 const aliases={close:'x',save:'down',light:'sun',gallery:'photo'};
 const key=n=>aliases[n]||n;
 const wrap=shape=>`<g fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">${shape}</g>`;
 const icon=n=>`<svg class="sl-icon" data-icon="${key(n)}" viewBox="0 0 24 24" aria-hidden="true">${wrap(shapes[key(n)]||shapes.photo)}</svg>`;
 window.StoriesIcons={icon};
 document.querySelectorAll('symbol[id^="i-"]').forEach(el=>{const name=el.id.slice(2);if(shapes[name])el.innerHTML=wrap(shapes[name]);});
 const navCamera=document.querySelector('#tabbar [data-tab=camera] svg');if(navCamera){navCamera.innerHTML=wrap(shapes.camera);navCamera.classList.add('sl-icon');}
})();
