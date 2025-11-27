// Simple mock authentication for demo purposes
(function(){
  function getUser(){
    try{ return JSON.parse(localStorage.getItem('user')||'null') }catch(e){ return null }
  }
  function setUser(u){ localStorage.setItem('user', JSON.stringify(u)); }
  function logout(){ localStorage.removeItem('user'); updateAccountButton(); }
  function updateAccountButton(){
    const btn = document.getElementById('account-btn');
    if(!btn) return;
    const u = getUser();
    btn.onclick = null;
    if(u){
      btn.textContent = (u.email || 'Account').split('@')[0];
      btn.title = 'Sign out';
      btn.onclick = ()=>{ if(confirm('Sign out?')) { logout(); location.reload(); } };
    } else {
      btn.textContent = 'Login';
      btn.title = 'Sign in';
      btn.onclick = ()=>{ location.href = 'login.html' };
    }
  }

  // Expose helpers (global for admin/login pages)
  window.__mockAuth = {
    getUser, setUser, logout
  };

  document.addEventListener('DOMContentLoaded', ()=>{
    updateAccountButton();
  });
})();
