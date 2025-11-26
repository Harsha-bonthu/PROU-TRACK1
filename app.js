const DATA_PATH = 'data.json';

async function loadData(){
  try{
    const res = await fetch(DATA_PATH);
    if(!res.ok) throw new Error('Failed to load data');
    const data = await res.json();
    return data;
  }catch(e){
    console.error(e);
    return [];
  }
}

// Currency handling: default to INR (per request). Use a configurable USD -> INR rate.
const currencyState = {
  code: 'INR',
  rate: 83.5 // 1 USD = 83.5 INR (approx). Update if you need a live rate.
};

function formatPriceUsd(price){
  return new Intl.NumberFormat('en-US', {style:'currency',currency:'USD'}).format(price);
}

function formatPrice(price){
  if(currencyState.code === 'USD') return formatPriceUsd(price);
  const converted = price * currencyState.rate;
  return new Intl.NumberFormat('en-IN', {style:'currency',currency:'INR',maximumFractionDigits:2}).format(converted);
}

// Pagination state
let pageSize = 8;
let currentPage = 1;
let _lastFiltered = [];

function renderPagination(totalPages){
  const el = document.getElementById('pagination');
  if(!el) return;
  el.innerHTML = '';
  if(totalPages <= 1) return;
  for(let p=1;p<=totalPages;p++){
    const btn = document.createElement('button');
    btn.textContent = p;
    if(p===currentPage) btn.classList.add('active');
    btn.addEventListener('click', ()=>{ currentPage = p; renderPaginated(_lastFiltered); window.scrollTo({top:220,behavior:'smooth'}); });
    el.appendChild(btn);
  }
}

function renderPaginated(items){
  _lastFiltered = items;
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if(currentPage > totalPages) currentPage = totalPages;
  const start = (currentPage - 1) * pageSize;
  const slice = items.slice(start, start + pageSize);
  renderGrid(slice);
  renderPagination(totalPages);
}

function createCard(item){
  const el = document.createElement('article');
  el.className = 'card';
  el.dataset.id = item.id;
  el.innerHTML = `
    <div class="thumb">
      <img loading="lazy" src="${item.image}" alt="${item.title}">
      <div class="quick">Quick view</div>
    </div>
    <div>
      <h3 class="title">${item.title}</h3>
      <p class="desc">${item.short}</p>
      <div class="meta-row">
        <span class="rating">★ ${item.rating ?? '—'} <span class="muted">(${item.reviews ?? 0})</span></span>
      </div>
    </div>
    <div class="meta">
      <div class="price">${formatPrice(item.price)}</div>
      <div class="actions">
        <button class="fav-btn" data-fav="${item.id}" title="Add to favorites">♡</button>
        <button class="btn add-cart" data-add="${item.id}" title="Add to cart">Add</button>
      </div>
    </div>
  `;
  return el;
}

function renderGrid(items){
  const grid = document.getElementById('grid');
  grid.innerHTML = '';
  if(items.length === 0){
    grid.innerHTML = '<p class="desc">No results found.</p>';
    return;
  }
  items.forEach(it=>{
    const card = createCard(it);
    grid.appendChild(card);
  });
}

function setupInteractions(data){
  const grid = document.getElementById('grid');
  grid.addEventListener('click', (e)=>{
    const view = e.target.closest('button[data-id]');
    if(view){
      const id = view.dataset.id;
      const item = data.find(x=>String(x.id) === id);
      if(item) openModal(item);
      return;
    }
    const fav = e.target.closest('button[data-fav]');
    if(fav){
      toggleFav(fav.dataset.fav);
      return;
    }
    const add = e.target.closest('button[data-add]');
    if(add){
      addToCart(add.dataset.add);
      return;
    }
    // image click -> quick view
    const img = e.target.closest('.thumb');
    if(img){
      const card = img.closest('.card');
      const id = card && card.dataset.id;
      const item = data.find(x=>String(x.id) === id);
      if(item) openModal(item);
      return;
    }
  });

  const search = document.getElementById('search');
  const sort = document.getElementById('sort');

  function applyFilters(){
    const q = search.value.trim().toLowerCase();
    let out = data.filter(d => d.title.toLowerCase().includes(q) || d.short.toLowerCase().includes(q) || d.tags.join(' ').includes(q));
    const s = sort.value;
    if(s === 'price-asc') out = out.slice().sort((a,b)=>a.price-b.price)
    if(s === 'price-desc') out = out.slice().sort((a,b)=>b.price-a.price)
    currentPage = 1;
    renderPaginated(out);
  }

  // tag chips
  const tagsEl = document.getElementById('tags');
  const allTags = [...new Set(data.flatMap(d=>d.tags))];
  allTags.forEach(t=>{
    const btn = document.createElement('button');
    btn.className = 'tag'; btn.textContent = t; btn.dataset.tag = t;
    btn.addEventListener('click', ()=>{
      btn.classList.toggle('active');
      const active = Array.from(tagsEl.querySelectorAll('.tag.active')).map(x=>x.dataset.tag);
      if(active.length){
        const out = data.filter(d => active.every(a=>d.tags.includes(a)));
        renderGrid(out.filter(d=> (d.title.toLowerCase().includes(search.value.toLowerCase()) || d.short.toLowerCase().includes(search.value.toLowerCase()))));
      } else applyFilters();
    });
    tagsEl.appendChild(btn);
  });

  search.addEventListener('input', debounce(applyFilters, 200));
  sort.addEventListener('change', applyFilters);

  // currency selector
  const currencyEl = document.getElementById('currency');
  if(currencyEl){
    currencyEl.value = currencyState.code;
    currencyEl.addEventListener('change', (e)=>{
      currencyState.code = e.target.value;
      // refresh UI prices
      renderGrid(data);
      renderCart();
      // update modal price if open
      const modal = document.getElementById('modal');
      if(modal && modal.getAttribute('aria-hidden') === 'false'){
        const title = document.getElementById('modal-title').textContent;
        const item = data.find(d=>d.title === title);
        if(item) document.getElementById('modal-price').textContent = formatPrice(item.price);
      }
    });
  }
}

// Cart drawer behaviors
function openCart(){
  const drawer = document.getElementById('cart-drawer');
  drawer.setAttribute('aria-hidden','false');
  renderCart();
}

function closeCart(){
  const drawer = document.getElementById('cart-drawer');
  drawer.setAttribute('aria-hidden','true');
}

function renderCart(){
  const itemsEl = document.getElementById('cart-items');
  const state = loadState();
  const data = window._mockData || [];
  itemsEl.innerHTML = '';
  let total = 0;
  for(const idStr of Object.keys(state.cart)){
    const qty = state.cart[idStr];
    const id = Number(idStr);
    const item = data.find(d=>d.id===id);
    if(!item) continue;
    total += item.price * qty;
    const row = document.createElement('div'); row.className='cart-item';
    row.innerHTML = `
      <div class="thumb"><img src="${item.image}" alt="${item.title}"></div>
      <div class="details">
        <div class="title">${item.title}</div>
        <div class="muted">${formatPrice(item.price)}</div>
      </div>
      <div class="qty-controls">
        <button data-dec="${id}">−</button>
        <div class="qty">${qty}</div>
        <button data-inc="${id}">+</button>
        <button data-rem="${id}">✕</button>
      </div>
    `;
    itemsEl.appendChild(row);
  }
  document.getElementById('cart-total').textContent = formatPrice(total);
}

function attachCartHandlers(){
  document.getElementById('cart-close').addEventListener('click', closeCart);
  document.getElementById('cart-chip').addEventListener('click', openCart);
  document.getElementById('checkout').addEventListener('click', ()=>{
    localStorage.removeItem('cart'); updateChips(); renderCart(); alert('Checkout mock — thank you!'); closeCart();
  });
  document.getElementById('cart-items').addEventListener('click', (e)=>{
    const inc = e.target.closest('button[data-inc]');
    const dec = e.target.closest('button[data-dec]');
    const rem = e.target.closest('button[data-rem]');
    const state = loadState();
    if(inc){ const id=inc.dataset.inc; state.cart[id]=(state.cart[id]||0)+1; saveState(state); updateChips(); renderCart(); }
    if(dec){ const id=dec.dataset.dec; state.cart[id]=Math.max(0,(state.cart[id]||0)-1); if(state.cart[id]===0) delete state.cart[id]; saveState(state); updateChips(); renderCart(); }
    if(rem){ const id=rem.dataset.rem; delete state.cart[id]; saveState(state); updateChips(); renderCart(); }
  });
}

// Favorites drawer
function openFavorites(){
  const d = document.getElementById('favorites-drawer');
  d.setAttribute('aria-hidden','false');
  renderFavorites();
}

function closeFavorites(){
  const d = document.getElementById('favorites-drawer');
  d.setAttribute('aria-hidden','true');
}

function renderFavorites(){
  const el = document.getElementById('favorites-items');
  const state = loadState();
  const data = window._mockData || [];
  el.innerHTML = '';
  state.favs.forEach(id =>{
    const item = data.find(d=>d.id===id);
    if(!item) return;
    const row = document.createElement('div'); row.className='cart-item';
    row.innerHTML = `
      <div class="thumb"><img src="${item.image}" alt="${item.title}"></div>
      <div class="details"><div class="title">${item.title}</div><div class="muted">${formatPrice(item.price)}</div></div>
      <div class="qty-controls"><button data-remfav="${id}">Remove</button></div>
    `;
    el.appendChild(row);
  });
}

function attachFavoritesHandlers(){
  document.getElementById('favorites-chip').addEventListener('click', openFavorites);
  document.getElementById('favorites-close').addEventListener('click', closeFavorites);
  document.getElementById('fav-clear').addEventListener('click', ()=>{ localStorage.removeItem('favs'); updateChips(); renderFavorites(); });
  document.getElementById('favorites-items').addEventListener('click', (e)=>{
    const rem = e.target.closest('button[data-remfav]');
    if(rem){ const id = Number(rem.dataset.remfav); const s = loadState(); s.favs = s.favs.filter(x=>x!==id); saveState(s); updateChips(); renderFavorites(); }
  });
}

// Toast helper
function showToast(msg, timeout=2200){
  const wrap = document.getElementById('toast-wrap');
  if(!wrap) return;
  const t = document.createElement('div'); t.className='toast'; t.textContent = msg; wrap.appendChild(t);
  setTimeout(()=>{ t.style.opacity='0'; t.style.transform='translateY(8px)'; setTimeout(()=>t.remove(),300); }, timeout);
}

// favorites + cart (simple localStorage)
function loadState(){
  return {
    favs: JSON.parse(localStorage.getItem('favs')||'[]'),
    cart: JSON.parse(localStorage.getItem('cart')||'{}')
  }
}

function saveState(state){
  localStorage.setItem('favs', JSON.stringify(state.favs));
  localStorage.setItem('cart', JSON.stringify(state.cart));
}

function toggleFav(id){
  const state = loadState();
  const idx = state.favs.indexOf(Number(id));
  if(idx === -1) state.favs.push(Number(id)); else state.favs.splice(idx,1);
  saveState(state);
  updateChips();
  flashButton(`[data-fav="${id}"]`)
  showToast(state.favs.includes(Number(id)) ? 'Added to favorites' : 'Removed from favorites');
  // update favorites drawer if open
  const favDrawer = document.getElementById('favorites-drawer');
  if(favDrawer && favDrawer.getAttribute('aria-hidden') === 'false') renderFavorites();
}

function addToCart(id){
  const state = loadState();
  state.cart[id] = (state.cart[id]||0) + 1;
  saveState(state);
  updateChips();
  flashButton(`[data-add="${id}"]`, true)
  showToast('Added to cart');
}

function updateChips(){
  const state = loadState();
  document.getElementById('fav-count').textContent = state.favs.length;
  const count = Object.values(state.cart).reduce((s,n)=>s+n,0);
  document.getElementById('cart-count').textContent = count;
  // update fav buttons visuals
  document.querySelectorAll('.fav-btn').forEach(b=>{
    const id = Number(b.dataset.fav);
    if(state.favs.includes(id)) { b.classList.add('active'); b.textContent = '❤' } else { b.classList.remove('active'); b.textContent = '♡' }
  })
}

function flashButton(sel, pulse=false){
  const el = document.querySelector(sel);
  if(!el) return;
  el.animate([{transform:'scale(1)'},{transform:'scale(1.06)'},{transform:'scale(1)'}],{duration:280});
}

function openModal(item){
  const modal = document.getElementById('modal');
  document.getElementById('modal-title').textContent = item.title;
  document.getElementById('modal-desc').textContent = item.long;
  document.getElementById('modal-price').textContent = formatPrice(item.price);
  modal.setAttribute('aria-hidden','false');
}

function closeModal(){
  const modal = document.getElementById('modal');
  modal.setAttribute('aria-hidden','true');
}

function debounce(fn, t=150){
  let ok;
  return (...a)=>{ clearTimeout(ok); ok = setTimeout(()=>fn(...a), t)};
}

function setupModalHandlers(){
  const modal = document.getElementById('modal');
  document.getElementById('modal-close').addEventListener('click', closeModal);
  modal.addEventListener('click', (e)=>{ if(e.target === modal) closeModal(); });
  document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') closeModal(); });
}

// Theme handling
function applyTheme(code){
  if(code === 'dark'){
    document.documentElement.setAttribute('data-theme','dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  const btn = document.getElementById('theme-toggle');
  if(btn) btn.textContent = (code === 'dark') ? '☀️' : '🌙';
}

function loadTheme(){
  const t = localStorage.getItem('theme') || 'light';
  applyTheme(t === 'dark' ? 'dark' : 'light');
}

function attachExtrasHandlers(){
  // theme toggle
  const tbtn = document.getElementById('theme-toggle');
  if(tbtn){
    tbtn.addEventListener('click', ()=>{
      const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', next === 'dark' ? 'dark' : 'light');
      applyTheme(next);
    });
  }
  // favorites handlers
  attachFavoritesHandlers();
}

async function init(){
  const data = await loadData();
  // show skeletons briefly for polish
  const grid = document.getElementById('grid');
  grid.innerHTML = Array.from({length:8}).map(()=>'<div class="card skeleton" style="height:230px"></div>').join('');
  setTimeout(()=>{
    renderGrid(data);
    setupInteractions(data);
    setupModalHandlers();
    // expose data for cart rendering
    window._mockData = data;
    attachCartHandlers();
    attachExtrasHandlers();
    loadTheme();
    // initial paginated render
    currentPage = 1; _lastFiltered = data.slice(); renderPaginated(_lastFiltered);
    updateChips();
  }, 350);
}

init();
