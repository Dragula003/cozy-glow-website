const STORAGE_KEY = 'cozyGlowCatalogue_v1';
let allProducts = [];
let activeFilter = 'all';

async function loadProducts() {
  // Try to load from CMS data file first, fall back to localStorage
  try {
    const resp = await fetch('/data/products.json');
    if (resp.ok) {
      allProducts = await resp.json();
    } else {
      throw new Error('No CMS data');
    }
  } catch(e) {
    try {
      allProducts = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch(err) {
      allProducts = [];
    }
  }
  renderProducts();
  loadTestimonials();
}

function renderProducts() {
  const grid = document.getElementById('product-grid');
  const filtered = activeFilter === 'all' ? allProducts : allProducts.filter(p => p.category === activeFilter);
  const inStock = filtered.filter(p => (p.stock === undefined || p.stock > 0) || p.price);

  if (!inStock.length) {
    grid.innerHTML = '<div class="no-products"><p>No products in this category yet.</p></div>';
    return;
  }

  grid.innerHTML = inStock.map((p, i) => `
    <div class="product-card" style="transition-delay:${i*60}ms">
      <div class="product-img" style="background:${p.color||'#F3E8DC'}">
        ${p.image ? `<img src="${p.image}" alt="${p.name}">` : `<svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg" style="width:90px;height:90px;opacity:0.6">
          ${p.category==='sachet' ? sachetSVG() : p.category==='gift' ? giftSVG() : candleSVG(p.color)}
        </svg>`}
        ${p.tag ? `<span class="product-tag tag-${p.tag}">${tagLabel(p.tag)}</span>` : ''}
      </div>
      <div class="product-info">
        <h3 class="product-name">${p.name}</h3>
        ${p.scent ? `<p class="product-scent">${p.scent}</p>` : ''}
        <div class="product-meta-row">
          ${p.burn ? `<span>🕯️ ${p.burn}</span>` : ''}
          ${p.size ? `<span>📦 ${p.size}</span>` : ''}
        </div>
        <div class="product-footer">
          <span class="product-price">₹${(p.price||0).toLocaleString('en-IN')}</span>
          <a href="${p.link||'https://www.instagram.com/thecozyglowcandles/'}" target="_blank" class="product-btn">Shop Now</a>
        </div>
      </div>
    </div>
  `).join('');

  requestAnimationFrame(() => {
    document.querySelectorAll('.product-card').forEach(c => c.classList.add('visible'));
  });
}

function tagLabel(t) { return {bestseller:'Bestseller',new:'New Arrival',limited:'Limited Edition',seasonal:'Seasonal'}[t]||t; }

function candleSVG(color) {
  return '<rect x="45" y="60" width="70" height="88" rx="10" fill="#FDF9F4" stroke="#C4A882" stroke-width="1.2"/>' +
    '<rect x="45" y="60" width="70" height="22" rx="8" fill="#F0E6D8"/>' +
    '<line x1="80" y1="46" x2="80" y2="62" stroke="#5C4A3A" stroke-width="1.8" stroke-linecap="round"/>' +
    '<ellipse cx="80" cy="40" rx="5" ry="8" fill="#F5C060" opacity="0.9"/>' +
    '<ellipse cx="80" cy="42" rx="3" ry="5" fill="#FBAD1D"/>';
}
function sachetSVG() {
  return '<rect x="45" y="40" width="70" height="96" rx="12" fill="#E8C9B5" stroke="#C4A882" stroke-width="1.2"/>' +
    '<ellipse cx="80" cy="80" rx="14" ry="20" fill="none" stroke="#8A6E50" stroke-width="0.9" opacity="0.5"/>' +
    '<line x1="80" y1="60" x2="80" y2="100" stroke="#8A6E50" stroke-width="0.9" opacity="0.5"/>' +
    '<circle cx="80" cy="32" r="5" fill="none" stroke="#C4A882" stroke-width="1"/>';
}
function giftSVG() {
  return '<rect x="20" y="70" width="50" height="78" rx="8" fill="#FDF9F4" stroke="#C4A882" stroke-width="1"/>' +
    '<rect x="78" y="65" width="50" height="83" rx="8" fill="#FDF9F4" stroke="#C4A882" stroke-width="1"/>' +
    '<line x1="45" y1="58" x2="45" y2="72" stroke="#5C4A3A" stroke-width="1.5" stroke-linecap="round"/>' +
    '<ellipse cx="45" cy="52" rx="4" ry="6" fill="#F5C060" opacity="0.9"/>' +
    '<line x1="103" y1="53" x2="103" y2="67" stroke="#5C4A3A" stroke-width="1.5" stroke-linecap="round"/>' +
    '<ellipse cx="103" cy="47" rx="4" ry="6" fill="#F5C060" opacity="0.9"/>';
}

function loadTestimonials() {
  const grid = document.getElementById('testimonials-grid');
  const defaultTestimonials = [
    { text: '"The Vanilla Amber candle has become a staple in my home. The throw is incredible and burns so cleanly. Ordered three more as gifts — everyone was obsessed!"', name: 'Priya M.', location: 'Bengaluru', initial: 'P' },
    { text: '"The botanical wax sachets are absolutely gorgeous. The fragrance lasts for weeks. The packaging alone felt like a luxury gift."', name: 'Roshni A.', location: 'Mumbai', initial: 'R' },
    { text: '"Ordered the gift box for my sister\'s birthday and she cried happy tears. Will always be my go-to gifting brand."', name: 'Sneha K.', location: 'Pune', initial: 'S' }
  ];

  grid.innerHTML = defaultTestimonials.map(t => `
    <div class="testi-card">
      <div class="testi-stars">★★★★★</div>
      <p class="testi-text">${t.text}</p>
      <div class="testi-author">
        <div class="testi-avatar">${t.initial}</div>
        <div>
          <div class="testi-name">${t.name}</div>
          <div class="testi-loc">${t.location}</div>
        </div>
      </div>
    </div>
  `).join('');
}

document.querySelectorAll('.filter-pill').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.dataset.filter;
    renderProducts();
  });
});

const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.style.opacity='1'; e.target.style.transform='translateY(0)'; } });
}, { threshold: 0.08 });
document.querySelectorAll('.why-card,.testi-card,.scent-item,.process-step,.value-item').forEach(el => {
  el.style.opacity='0'; el.style.transform='translateY(16px)'; el.style.transition='opacity 0.5s ease,transform 0.5s ease';
  obs.observe(el);
});

loadProducts();
window.addEventListener('storage', e => { if (e.key === STORAGE_KEY) loadProducts(); });
