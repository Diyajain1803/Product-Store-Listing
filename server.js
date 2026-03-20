const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));   // allow base64 image uploads
app.use(express.static(path.join(__dirname, 'public')));

// ─── In-memory data store ──────────────────────────────────────────────────
let products = [
  { id: 1,  name: 'Wireless Headphones',    price: 1299, category: 'Electronics', image: 'https://loremflickr.com/300/220/headphones?lock=1' },
  { id: 2,  name: 'Running Shoes',          price: 849,  category: 'Sports',      image: 'https://loremflickr.com/300/220/running,shoes?lock=2' },
  { id: 3,  name: 'Python Programming Book',price: 499,  category: 'Books',       image: 'https://loremflickr.com/300/220/programming,book?lock=3' },
  { id: 4,  name: 'Bluetooth Speaker',      price: 1099, category: 'Electronics', image: 'https://loremflickr.com/300/220/bluetooth,speaker?lock=4' },
  { id: 5,  name: 'Yoga Mat',               price: 349,  category: 'Sports',      image: 'https://loremflickr.com/300/220/yoga,mat?lock=5' },
  { id: 6,  name: 'Coffee Mug',             price: 199,  category: 'Kitchen',     image: 'https://loremflickr.com/300/220/coffee,mug?lock=6' },
  { id: 7,  name: 'USB-C Hub',              price: 749,  category: 'Electronics', image: 'https://loremflickr.com/300/220/usb,technology?lock=7' },
  { id: 8,  name: 'Mystery Novel',          price: 299,  category: 'Books',       image: 'https://loremflickr.com/300/220/novel,book?lock=8' },
  { id: 9,  name: 'Water Bottle',           price: 399,  category: 'Sports',      image: 'https://loremflickr.com/300/220/water,bottle?lock=9' },
  { id: 10, name: 'Smart Watch',            price: 2499, category: 'Electronics', image: 'https://loremflickr.com/300/220/smartwatch?lock=10' },
  { id: 11, name: 'Non-stick Pan',          price: 599,  category: 'Kitchen',     image: 'https://loremflickr.com/300/220/pan,cooking?lock=11' },
  { id: 12, name: 'Science Textbook',       price: 699,  category: 'Books',       image: 'https://loremflickr.com/300/220/science,textbook?lock=12' },
];

let nextId = products.length + 1;

// ─── Helper: get unique categories ────────────────────────────────────────
function getCategories() {
  return [...new Set(products.map(p => p.category))].sort();
}

// ─── GET /api/categories ──────────────────────────────────────────────────
app.get('/api/categories', (req, res) => {
  res.json(getCategories());
});

// ─── GET /api/products ────────────────────────────────────────────────────
app.get('/api/products', (req, res) => {
  let { categories, minPrice, maxPrice, sort } = req.query;

  let result = [...products];

  if (categories) {
    const catList = categories.split(',').map(c => c.trim().toLowerCase());
    result = result.filter(p => catList.includes(p.category.toLowerCase()));
  }
  if (minPrice !== undefined) {
    const min = parseFloat(minPrice);
    if (!isNaN(min)) result = result.filter(p => p.price >= min);
  }
  if (maxPrice !== undefined) {
    const max = parseFloat(maxPrice);
    if (!isNaN(max)) result = result.filter(p => p.price <= max);
  }
  if (sort === 'price_asc')  result.sort((a, b) => a.price - b.price);
  if (sort === 'price_desc') result.sort((a, b) => b.price - a.price);

  res.json({ total: result.length, products: result });
});

// ─── POST /api/products ───────────────────────────────────────────────────
app.post('/api/products', (req, res) => {
  const { name, price, category, image } = req.body;

  if (!name || !name.trim())
    return res.status(400).json({ error: 'Product name is required.' });

  const parsedPrice = parseFloat(price);
  if (isNaN(parsedPrice) || parsedPrice < 0)
    return res.status(400).json({ error: 'A valid price is required.' });

  if (!category || !category.trim())
    return res.status(400).json({ error: 'Category is required.' });

  const newProduct = {
    id: nextId++,
    name: name.trim(),
    price: parsedPrice,
    category: category.trim(),
    image: image || null,   // base64 data URL or null
  };

  products.push(newProduct);
  res.status(201).json(newProduct);
});

// ─── Fallback → serve index.html ──────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n  ✅  Server running at http://localhost:${PORT}\n`);
});
