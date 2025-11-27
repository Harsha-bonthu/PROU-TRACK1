// Simple client-side auth helper (mock)
const Auth = (function(){
  const KEY = 'user';
  function getUser(){ try{ return JSON.parse(localStorage.getItem(KEY)||'null'); }catch(e){ return null; } }
  function setUser(user){ localStorage.setItem(KEY, JSON.stringify(user||null)); document.dispatchEvent(new CustomEvent('auth-changed',{detail:user})); }
  function logout(){ localStorage.removeItem(KEY); document.dispatchEvent(new CustomEvent('auth-changed',{detail:null})); }
  // update header account button text when auth changes
  document.addEventListener('auth-changed', ()=>{ updateAccountUI(); });
  function updateAccountUI(){ const btn = document.getElementById('account-btn'); const u = getUser(); if(!btn) return; if(u){ btn.textContent = u.name || u.email || 'Account'; btn.href='login.html'; } else { btn.textContent = 'Account'; btn.href='login.html'; } }
  // initialize on load
  document.addEventListener('DOMContentLoaded', updateAccountUI);

  // create an account menu when user is logged in
  function showAccountMenu(target){
    // remove existing
    const existing = document.getElementById('account-menu'); if(existing) existing.remove();
    const user = getUser();
    if(!user) { window.location.href = 'login.html'; return; }
    const menu = document.createElement('div'); menu.id = 'account-menu'; menu.className = 'account-menu';
    let inner = `<div style="font-weight:700;padding:4px 6px">Signed in as</div><div style="padding:6px 8px 12px;font-weight:600">${user.name||user.email}</div>`;
    if(user.role === 'admin') inner += `<div class="item" id="menu-admin">Open Analytics</div>`;
    inner += `<div class="item" id="menu-logout">Sign out</div>`;
    menu.innerHTML = inner;
    document.body.appendChild(menu);
    // position near target if possible
    try{
      const rect = target.getBoundingClientRect();
      menu.style.top = (rect.bottom + 8) + 'px';
      menu.style.left = Math.min(window.innerWidth - menu.offsetWidth - 12, rect.right - menu.offsetWidth + 8) + 'px';
    }catch(e){}
    // attach logout
    const logoutBtn = menu.querySelector('#menu-logout');
    if(logoutBtn) logoutBtn.addEventListener('click', ()=>{ logout(); menu.remove(); updateAccountUI(); });
    const adminBtn = menu.querySelector('#menu-admin');
    if(adminBtn) adminBtn.addEventListener('click', ()=>{ window.location.href = 'admin.html'; });
    // close on outside click
    setTimeout(()=>{ document.addEventListener('click', function onDoc(e){ if(!menu.contains(e.target) && e.target !== target){ menu.remove(); document.removeEventListener('click', onDoc); } }); }, 50);
  }

  // attach click handler for account button
  document.addEventListener('click', (e)=>{
    const btn = e.target.closest('#account-btn');
    if(!btn) return;
    e.preventDefault();
    const user = getUser();
    if(!user) window.location.href = 'login.html'; else showAccountMenu(btn);
  });

  return { getUser, setUser, logout };
})();
