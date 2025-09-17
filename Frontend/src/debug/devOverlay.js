(function () {
  const css=`#__dev_overlay__{position:fixed;inset:0;background:rgba(15,15,15,.85);color:#fff;z-index:999998;font-family:system-ui,Segoe UI,Roboto,Arial}
  #__dev_box__{max-width:960px;margin:4rem auto;padding:1rem 1.25rem;border-radius:14px;background:#111;border:1px solid #333}
  .btns{margin-top:.75rem;display:flex;gap:.5rem}
  button{border:1px solid #666;background:#222;color:#fff;border-radius:10px;padding:.45rem .8rem;cursor:pointer}`;
  function show(title,msg){
    if(document.getElementById('__dev_overlay__')) return;
    const s=document.createElement('style'); s.textContent=css; document.head.appendChild(s);
    const root=document.createElement('div'); root.id='__dev_overlay__';
    root.innerHTML=`<div id="__dev_box__"><h3>${title}</h3><pre>${msg}</pre><div class="btns">
      <button onclick="location.reload()">Reload</button>
      <button onclick="localStorage.removeItem('auth');location.reload()">Clear Auth & Reload</button>
    </div></div>`;
    document.body.appendChild(root);
  }
  window.addEventListener('error',e=>show('Unhandled Error',String(e?.error||e?.message||e)));
  window.addEventListener('unhandledrejection',e=>show('Unhandled Promise',String(e?.reason||e)));
  window.__DEV_OVERLAY__={show};
})();
