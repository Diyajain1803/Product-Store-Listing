/* ════════════════════════════════════════════════════════════════════════
   app.js  –  Product Listing App  (all API calls go to the backend)
   ════════════════════════════════════════════════════════════════════════ */

const API = '';   // same origin – server at localhost:3000

// ── Category fallback icons (used when a product has no image) ─────────────
const CATEGORY_META = {
  'electronics': { icon: '📱', badge: 'badge-electronics' },
  'sports':      { icon: '⚽', badge: 'badge-sports' },
  'books':       { icon: '📚', badge: 'badge-books' },
  'kitchen':     { icon: '🍳', badge: 'badge-kitchen' },
};
function getCatMeta(cat) {
  return CATEGORY_META[cat.toLowerCase()] || { icon: '📦', badge: 'badge-default' };
}

// ── Tab switching ──────────────────────────────────────────────────────────
document.querySelectorAll('.tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
  });
});

// ════════════════════════════════════════════════════════════════════════════
//  PRODUCTS TAB
// ════════════════════════════════════════════════════════════════════════════
const grid       = document.getElementById('product-grid');
const noResults  = document.getElementById('no-results');
const countEl    = document.getElementById('results-count');
const minPriceEl = document.getElementById('min-price');
const maxPriceEl = document.getElementById('max-price');
const sortEl     = document.getElementById('sort-select');
const catFilters = document.getElementById('category-filters');
const resetBtn   = document.getElementById('reset-btn');

let debounceTimer;

// ── Load categories & render checkboxes ────────────────────────────────────
async function loadCategories() {
  try {
    const res  = await fetch(`${API}/api/categories`);
    const cats = await res.json();
    catFilters.innerHTML = '';
    cats.forEach(cat => {
      const id  = `cat-${cat.toLowerCase().replace(/\s+/g,'-')}`;
      const lbl = document.createElement('label');
      lbl.setAttribute('for', id);
      lbl.innerHTML = `<input type="checkbox" id="${id}" value="${cat}" /> ${cat}`;
      catFilters.appendChild(lbl);
      lbl.querySelector('input').addEventListener('change', scheduleLoad);
    });

    // Also populate the "Add Product" category select
    const sel = document.getElementById('p-category-select');
    sel.innerHTML = '<option value="">-- Select existing --</option>';
    cats.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat; opt.textContent = cat;
      sel.appendChild(opt);
    });
  } catch (e) {
    catFilters.innerHTML = '<span class="loading-text">Failed to load.</span>';
  }
}

// ── Build query string from current filter state ───────────────────────────
function buildQuery() {
  const params = new URLSearchParams();
  const checked = [...catFilters.querySelectorAll('input:checked')].map(el => el.value);
  if (checked.length) params.set('categories', checked.join(','));
  const minVal = minPriceEl.value.trim();
  const maxVal = maxPriceEl.value.trim();
  if (minVal) params.set('minPrice', minVal);
  if (maxVal) params.set('maxPrice', maxVal);
  const sort = sortEl.value;
  if (sort) params.set('sort', sort);
  return params.toString();
}

// ── Fetch & render products ────────────────────────────────────────────────
async function loadProducts() {
  grid.innerHTML = '<p class="loading-text" style="grid-column:1/-1;text-align:center;padding:40px">Loading…</p>';
  noResults.classList.add('hidden');

  try {
    const qs  = buildQuery();
    const res = await fetch(`${API}/api/products${qs ? '?' + qs : ''}`);
    if (!res.ok) throw new Error('Server error');
    const data = await res.json();

    countEl.textContent = `${data.total} product${data.total !== 1 ? 's' : ''} found`;

    if (data.total === 0) {
      grid.innerHTML = '';
      noResults.classList.remove('hidden');
      return;
    }

    grid.innerHTML = data.products.map(renderCard).join('');
  } catch (e) {
    grid.innerHTML = `<p style="color:#ef4444;grid-column:1/-1;padding:40px">Error loading products. Is the server running?</p>`;
    countEl.textContent = '';
  }
}

// ── Render a single product card ───────────────────────────────────────────
function renderCard(p) {
  const meta = getCatMeta(p.category);

  // Image section: real image if available, otherwise emoji placeholder
  const imgSection = p.image
    ? `<div class="card-img-wrap">
         <img src="${escHtml(p.image)}" alt="${escHtml(p.name)}"
              onerror="this.parentElement.innerHTML='<div class=\'card-img-placeholder\'>${meta.icon}</div>'" />
       </div>`
    : `<div class="card-img-wrap">
         <div class="card-img-placeholder">${meta.icon}</div>
       </div>`;

  return `
    <div class="card">
      ${imgSection}
      <div class="card-body">
        <div class="card-name">${escHtml(p.name)}</div>
        <div class="card-footer">
          <span class="card-price">₹${p.price.toLocaleString('en-IN')}</span>
          <span class="card-category ${meta.badge}">${escHtml(p.category)}</span>
        </div>
      </div>
    </div>`;
}

function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Debounced filter trigger ───────────────────────────────────────────────
function scheduleLoad() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(loadProducts, 280);
}

minPriceEl.addEventListener('input', scheduleLoad);
maxPriceEl.addEventListener('input', scheduleLoad);
sortEl.addEventListener('change', loadProducts);

resetBtn.addEventListener('click', () => {
  catFilters.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
  minPriceEl.value = '';
  maxPriceEl.value = '';
  sortEl.value = '';
  loadProducts();
});

// ════════════════════════════════════════════════════════════════════════════
//  ADD PRODUCT TAB
// ════════════════════════════════════════════════════════════════════════════
const form        = document.getElementById('add-product-form');
const nameEl      = document.getElementById('p-name');
const priceFormEl = document.getElementById('p-price');
const catSelEl    = document.getElementById('p-category-select');
const catNewEl    = document.getElementById('p-category-new');
const submitMsg   = document.getElementById('submit-msg');
const clearBtn    = document.getElementById('clear-form-btn');

// ── Image upload with preview ──────────────────────────────────────────────
const imageInput     = document.getElementById('p-image');
const imagePreview   = document.getElementById('image-preview');
const uploadPlaceholder = document.getElementById('upload-placeholder');
const removeImgBtn   = document.getElementById('remove-image-btn');

let selectedImageBase64 = null;

imageInput.addEventListener('change', () => {
  const file = imageInput.files[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    alert('Image is too large. Please choose a file under 5 MB.');
    imageInput.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    selectedImageBase64 = e.target.result;
    imagePreview.src = selectedImageBase64;
    imagePreview.classList.remove('hidden');
    uploadPlaceholder.classList.add('hidden');
    removeImgBtn.classList.remove('hidden');
  };
  reader.readAsDataURL(file);
});

removeImgBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  selectedImageBase64 = null;
  imageInput.value = '';
  imagePreview.classList.add('hidden');
  uploadPlaceholder.classList.remove('hidden');
  removeImgBtn.classList.add('hidden');
});

// ── Helpers ────────────────────────────────────────────────────────────────
function setError(fieldId, msg) {
  document.getElementById(fieldId).textContent = msg;
}
function clearErrors() {
  ['err-name','err-price','err-cat'].forEach(id => document.getElementById(id).textContent = '');
  nameEl.classList.remove('invalid');
  priceFormEl.classList.remove('invalid');
}
function showMsg(type, text) {
  submitMsg.className = 'submit-msg ' + type;
  submitMsg.textContent = text;
  submitMsg.classList.remove('hidden');
  setTimeout(() => submitMsg.classList.add('hidden'), 4000);
}

// When a category is selected from dropdown, clear the text field & vice versa
catSelEl.addEventListener('change', () => { if (catSelEl.value) catNewEl.value = ''; });
catNewEl.addEventListener('input', () => { if (catNewEl.value.trim()) catSelEl.value = ''; });

// ── Form submit ────────────────────────────────────────────────────────────
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearErrors();

  const name     = nameEl.value.trim();
  const price    = priceFormEl.value.trim();
  const category = (catNewEl.value.trim() || catSelEl.value).trim();

  let valid = true;

  if (!name) {
    setError('err-name', 'Product name is required.');
    nameEl.classList.add('invalid');
    valid = false;
  }
  if (!price || isNaN(parseFloat(price)) || parseFloat(price) < 0) {
    setError('err-price', 'Enter a valid price (≥ 0).');
    priceFormEl.classList.add('invalid');
    valid = false;
  }
  if (!category) {
    setError('err-cat', 'Please select or type a category.');
    valid = false;
  }

  if (!valid) return;

  try {
    const res = await fetch(`${API}/api/products`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        name,
        price: parseFloat(price),
        category,
        image: selectedImageBase64 || null,
      }),
    });
    const data = await res.json();

    if (!res.ok) {
      showMsg('error', data.error || 'Failed to add product.');
      return;
    }

    showMsg('success', `✅ "${data.name}" added successfully!`);
    form.reset();
    clearErrors();
    // reset image state
    selectedImageBase64 = null;
    imagePreview.classList.add('hidden');
    uploadPlaceholder.classList.remove('hidden');
    removeImgBtn.classList.add('hidden');

    // Refresh categories in case a new one was added
    await loadCategories();
  } catch (err) {
    showMsg('error', 'Network error – is the server running?');
  }
});

clearBtn.addEventListener('click', () => {
  form.reset();
  clearErrors();
  submitMsg.classList.add('hidden');
  // reset image
  selectedImageBase64 = null;
  imagePreview.classList.add('hidden');
  uploadPlaceholder.classList.remove('hidden');
  removeImgBtn.classList.add('hidden');
});

// ── Init ──────────────────────────────────────────────────────────────────
(async () => {
  await loadCategories();
  await loadProducts();
})();
