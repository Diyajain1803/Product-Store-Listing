# 🛒 Product Store

A full-stack product listing web application built with **Node.js + Express** (backend) and **vanilla HTML/CSS/JavaScript** (frontend). Supports product browsing with real-time filtering, sorting, and product addition with image upload.

---

## 📸 Features

### Products Tab
- Displays a grid of product cards with **real photos**, name, price, and category badge
- **Category filter** – checkbox-based, multi-select
- **Price range filter** – min/max number inputs
- **Sort by price** – ascending or descending
- **Reset Filters** button to clear all active filters
- All filtering & sorting is handled **server-side** (efficient query handling, not frontend brute-force)
- Dynamic result count updates on every filter change

### Add Product Tab
- Form fields: **Product Name**, **Price (₹)**, **Category** (select existing or type new), **Product Image** (optional upload)
- Image upload with **live preview** and remove button
- Image stored as base64 and sent to backend
- **Client-side validation** with inline error messages
- Success/error feedback after submission
- Newly added product and any new category appear immediately in the Products tab

---

## 🗂️ Project Structure

```
product-store/
├── server.js           ← Express API server
├── package.json        ← Project metadata & dependencies
└── public/
    ├── index.html      ← Two-tab UI (Products + Add Product)
    ├── style.css       ← Styling (Inter font, card grid, sidebar, upload area)
    └── app.js          ← Frontend JS (API calls, rendering, image upload)
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v14 or higher
- npm (comes with Node.js)

### Installation & Run

```bash
# 1. Install dependencies
npm install

# 2. Start the server
node server.js
```

Then open your browser at **http://localhost:3000**

---

## 🔌 API Reference

All filtering and sorting is handled on the server — the frontend simply passes query parameters.

### `GET /api/categories`
Returns a sorted list of all unique product categories.

**Response:**
```json
["Books", "Electronics", "Kitchen", "Sports"]
```

---

### `GET /api/products`
Returns a filtered and sorted list of products.

**Query Parameters:**

| Parameter    | Type   | Description                                    |
|--------------|--------|------------------------------------------------|
| `categories` | string | Comma-separated list of categories to include  |
| `minPrice`   | number | Minimum price (inclusive)                      |
| `maxPrice`   | number | Maximum price (inclusive)                      |
| `sort`       | string | `price_asc` or `price_desc`                    |

**Example:**
```
GET /api/products?categories=Electronics,Books&minPrice=200&maxPrice=1500&sort=price_asc
```

**Response:**
```json
{
  "total": 4,
  "products": [
    { "id": 3, "name": "Python Programming Book", "price": 499, "category": "Books", "image": "https://..." },
    ...
  ]
}
```

---

### `POST /api/products`
Adds a new product to the store.

**Request Body (JSON):**
```json
{
  "name": "Gaming Laptop",
  "price": 54999,
  "category": "Electronics",
  "image": "data:image/jpeg;base64,..."
}
```

> `image` is optional. It accepts a base64-encoded data URL.

**Response (201 Created):**
```json
{
  "id": 13,
  "name": "Gaming Laptop",
  "price": 54999,
  "category": "Electronics",
  "image": "data:image/jpeg;base64,..."
}
```

**Validation Errors (400):**
```json
{ "error": "Product name is required." }
```

---

## 🛠️ Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Backend   | Node.js, Express.js               |
| Frontend  | HTML5, CSS3, Vanilla JavaScript   |
| Font      | Inter (Google Fonts)              |
| Images    | loremflickr.com (seed products) + user uploads (base64) |
| Storage   | In-memory (resets on server restart) |

---

## 📦 Seed Products

The app starts with 12 pre-loaded products:

| # | Name                    | Price  | Category    |
|---|-------------------------|--------|-------------|
| 1 | Wireless Headphones     | ₹1,299 | Electronics |
| 2 | Running Shoes           | ₹849   | Sports      |
| 3 | Python Programming Book | ₹499   | Books       |
| 4 | Bluetooth Speaker       | ₹1,099 | Electronics |
| 5 | Yoga Mat                | ₹349   | Sports      |
| 6 | Coffee Mug              | ₹199   | Kitchen     |
| 7 | USB-C Hub               | ₹749   | Electronics |
| 8 | Mystery Novel           | ₹299   | Books       |
| 9 | Water Bottle            | ₹399   | Sports      |
|10 | Smart Watch             | ₹2,499 | Electronics |
|11 | Non-stick Pan           | ₹599   | Kitchen     |
|12 | Science Textbook        | ₹699   | Books       |

---

## ⚠️ Notes

- **Data is in-memory** – products reset when the server restarts. For persistence, integrate a database like SQLite or MongoDB.
- **Image uploads** are stored as base64 strings in memory. For production, use disk storage (multer) or a cloud service (AWS S3, Cloudinary).
- The server accepts JSON payloads up to **10 MB** to accommodate base64-encoded images.

---

## 👩‍💻 Author

Made as a student project demonstrating full-stack CRUD with Express.js and vanilla JavaScript.
