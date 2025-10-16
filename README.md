# 🛒 E-commerce API

A **RESTful API** for a basic e-commerce platform providing a complete backend solution for **user management**, **product catalog**, **shopping cart functionality**, and **order processing**.  
Built with **Node.js**, **Express**, and **PostgreSQL** for robust performance and data reliability.

---

## 🚀 Features

- **User Authentication:** Secure user registration and login using **JWT (JSON Web Tokens)**.  
- **Product Management:** Full CRUD operations for a product catalog, with **admin-only access** for managing products.  
- **Shopping Cart:** Add, update, and remove products dynamically.  
- **Order Processing:** Checkout endpoint converts a user’s cart into a final order using a **transaction-safe workflow**.  
- **Database:** Built on **PostgreSQL** for data integrity and consistency.

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-------------|
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL |
| **Authentication** | JSON Web Tokens (JWT), bcryptjs |
| **Middleware** | cors, dotenv |

---

## 📦 Getting Started

### ✅ Prerequisites

You must have the following installed:

- [Node.js](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/)

---

### ⚙️ Installation

#### 1. Clone the repository

```bash
git clone https://github.com/Omogbai7/E-commerce-API.git
```
```bash
cd E-commerce-API
```

#### 2. Install dependencies

```bash
npm install

```

#### 3. Set up environment variables

Create a .env file in the project root and add the following

```bash
PORT=3000
DATABASE_URL="postgres://your_username:your_password@localhost:5432/ecommerce"
JWT_SECRET="your_strong_and_long_secret_key"
```

### 🗄️ Database Setup

Connect to your PostgreSQL server and create the ecommerce database.
Then, run the following SQL commands to create the required tables:

```bash
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'customer'
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    stock_quantity INT NOT NULL
);

CREATE TABLE carts (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE cart_items (
    id SERIAL PRIMARY KEY,
    cart_id INT NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL CHECK (quantity > 0)
);

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total_amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending'
);

CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL CHECK (quantity > 0)
);
```
### ▶️ Run the Server

```bash
node index.js
```
Your API will be running on http://localhost:3000

### 💻 API Endpoints

```bash
### 👤 User Endpoints (/api/v1/users)
Method	Endpoint	Description
POST	/register	Register a new user
POST	/login	Log in a user and receive a JWT
GET	/me	Get the profile of the authenticated user (Protected)

### 🛍️ Product Endpoints (/api/v1/products)
Method	Endpoint	Description
GET	/	Get all products
GET	/:id	Get a single product by ID
POST	/	Create a new product (Admin only)
PUT	/:id	Update an existing product (Admin only)
DELETE	/:id	Delete a product (Admin only)

### 🛒 Cart & Order Endpoints (/api/v1/cart, /api/v1/orders)
Method	Endpoint	Description
GET	/api/v1/cart	Get the user’s cart (Protected)
POST	/api/v1/cart/add	Add an item to the cart (Protected)
DELETE	/api/v1/cart/:cartItemId	Remove an item from the cart (Protected)
POST	/api/v1/orders/checkout	Checkout and create an order (Protected)
```
### 🧩 Future Improvements
- Payment gateway integration (e.g., Stripe, Paystack)
- Product categories and search filters
- Admin dashboard for analytics
- Inventory management and tracking

### 🪪 License

This project is licensed under the MIT License — feel free to use and modify it
