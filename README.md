# E-Commerce (Node.js + Express + MongoDB)

A simple e-commerce web app built with **Express**, **MongoDB (Mongoose)**, and **Handlebars (hbs)**.  
It supports sessions (via `express-session` + optional `connect-mongo`), user auth, products, and basic cart/ordering.

> Deployed on Render with MongoDB Atlas.

---

## ✨ Features

- Express server with `bin/www` launcher (Express Generator style)
- Handlebars view engine (layouts/partials)
- MongoDB via Mongoose, configurable using `MONGODB_URI`
- Session & auth using `express-session` (+ optional persistent sessions via `connect-mongo`)
- Basic product model and routes (e.g., `/` / `/products`), user routes (e.g., `/login`, `/signup`) *(adjust to your project)*
- Production-ready env loading & Render deployment

---

## 🧱 Tech Stack

- **Runtime:** Node.js (20.x recommended)  
- **Server:** Express  
- **Views:** Handlebars (hbs)  
- **DB:** MongoDB (Atlas recommended)  
- **Sessions:** express-session (+ connect-mongo in production)

---

## 📁 Project Structure
.
├─ bin/
│ └─ www # server launcher (listens on process.env.PORT)
├─ config/
│ └─ connection.js # Mongo connection (export function or side-effect)
├─ models/
│ ├─ products.js # Product schema/model (check exact filename/case)
│ └─ user.js # User schema/model (check exact filename/case)
├─ public/ # static assets (css/js/images)
├─ routes/
│ ├─ index.js
│ └─ user.js
├─ views/ # .hbs templates (layouts, partials)
├─ app.js # express app bootstrapping
├─ package.json
├─ .env.example
└─ README.md



> ⚠️ **Case sensitivity matters** on Linux (Render). If the file is `models/Products.js`, import it as `require('../models/Products')`, not `products`.

---

## 🔧 Prerequisites

- Node.js 20+ and npm
- MongoDB Atlas connection string (recommended)  
- A long random `SESSION_SECRET`

Generate a strong secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"



