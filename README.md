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

