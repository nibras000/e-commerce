# E‑Commerce (Node/Express)

A simple e‑commerce web application built with Node.js and Express.

## Demo
_Deployed on Render or any Node host. Update this section with your live URL._

## Features
- Node.js + Express server
- MongoDB (Mongoose)
- Server-rendered views

## Tech Stack
- Node.js
- Express
- MongoDB (Mongoose)

## Project Structure
```

```

## Getting Started (Local)

1) **Clone & install**
```bash
git clone <your-fork-url>.git
cd e-commerce
npm install
```

2) **Configure environment**
Create a `.env` file in the project root:
- `PORT=3000`
- `MONGO_URI=your_mongodb_connection_uri`
- `SESSION_SECRET=your_secret`

3) **Run the app**
```bash
# Development
node ./bin/www

# Production
node ./bin/www
```

The server defaults to `http://localhost:3000` (or the `PORT` you set).

## Seeding / Admin Setup

If your app requires an admin user, insert one into MongoDB manually or create a seed script. Example (Mongo shell):
```js
db.users.insertOne({
  name: "Admin",
  email: "admin@example.com",
  password: "<hashed-password>",
  role: "admin"
})
```
> Tip: If using bcrypt, hash the password in a Node REPL:  
```js
const bcrypt = require('bcryptjs'); bcrypt.hashSync('yourPassword', 10)
```

## Available Scripts
- `start` → `node ./bin/www`

## Environment Variables
Set the following keys in `.env`:
- `PORT`, `MONGO_URI`, `SESSION_SECRET`

## API & Routes Overview
_See routes directory for details._

## Deployment

- Create a **Web Service** on Render/Railway/Vercel (Node build & run).
- **Build command:** `npm install`
- **Start command:** `node ./bin/www`
- Add environment variables in your host dashboard.
- Configure **MongoDB connection string** securely.

## Screenshots
_Add screenshots of key pages here (Home, Product, Cart, Admin)._

## License
This project is licensed under the MIT License — feel free to use and modify.
