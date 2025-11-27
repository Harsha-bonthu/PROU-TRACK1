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
    return { getUser, setUser, logout };
  })();
