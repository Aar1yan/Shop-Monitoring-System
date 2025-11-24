const sqlite3 = require('sqlite3').verbose();

     const db = new sqlite3.Database('./database/shop.db', (err) => {
         if (err) {
             console.error('Error opening database:', err.message);
         } else {
             console.log('Connected to SQLite database.');
         }
     });

     db.serialize(() => {
         db.run(`
             CREATE TABLE IF NOT EXISTS users (
                 id INTEGER PRIMARY KEY AUTOINCREMENT,
                 username TEXT NOT NULL,
                 password TEXT NOT NULL,
                 role TEXT NOT NULL
             )
         `);

         db.run(`
             CREATE TABLE IF NOT EXISTS inventory (
                 id INTEGER PRIMARY KEY AUTOINCREMENT,
                 name TEXT NOT NULL,
                 category TEXT,
                 quantity INTEGER NOT NULL,
                 price REAL NOT NULL,
                 expiration_date TEXT
             )
         `);

         db.run(`
             CREATE TABLE IF NOT EXISTS sales (
                 id INTEGER PRIMARY KEY AUTOINCREMENT,
                 product_id INTEGER,
                 quantity INTEGER NOT NULL,
                 total REAL NOT NULL,
                 sale_date TEXT NOT NULL,
                 FOREIGN KEY (product_id) REFERENCES inventory(id)
             )
         `);

         db.run(`
             CREATE TABLE IF NOT EXISTS customers (
                 id INTEGER PRIMARY KEY AUTOINCREMENT,
                 name TEXT NOT NULL,
                 email TEXT,
                 phone TEXT,
                 purchase_history TEXT
             )
         `);

         db.run(`
             CREATE TABLE IF NOT EXISTS employees (
                 id INTEGER PRIMARY KEY AUTOINCREMENT,
                 name TEXT NOT NULL,
                 role TEXT NOT NULL,
                 performance REAL
             )
         `);

         db.run(`
             CREATE TABLE IF NOT EXISTS invoices (
                 id INTEGER PRIMARY KEY AUTOINCREMENT,
                 customer_id INTEGER,
                 total REAL NOT NULL,
                 discount REAL,
                 invoice_date TEXT NOT NULL,
                 FOREIGN KEY (customer_id) REFERENCES customers(id)
             )
         `);

         db.run(`INSERT INTO users (username, password, role) VALUES (?, ?, ?)`, ['admin', 'password123', 'admin']);
         db.run(`INSERT INTO users (username, password, role) VALUES (?, ?, ?)`, ['employee1', 'emp123', 'employee']);

         db.run(`INSERT INTO inventory (name, category, quantity, price, expiration_date) VALUES (?, ?, ?, ?, ?)`, ['iPhone 14 Pro', 'Electronics', 2, 999.99, null]);
         db.run(`INSERT INTO inventory (name, category, quantity, price, expiration_date) VALUES (?, ?, ?, ?, ?)`, ['Samsung Galaxy S22', 'Electronics', 5, 799.99, null]);
         db.run(`INSERT INTO inventory (name, category, quantity, price, expiration_date) VALUES (?, ?, ?, ?, ?)`, ['Sony WH-1000XM4', 'Audio', 0, 349.99, null]);
         db.run(`INSERT INTO inventory (name, category, quantity, price, expiration_date) VALUES (?, ?, ?, ?, ?)`, ['MacBook Pro 16"', 'Computers', 1, 2399.99, null]);
         db.run(`INSERT INTO inventory (name, category, quantity, price, expiration_date) VALUES (?, ?, ?, ?, ?)`, ['iPad Air', 'Tablets', 12, 599.99, null]);
         db.run(`INSERT INTO inventory (name, category, quantity, price, expiration_date) VALUES (?, ?, ?, ?, ?)`, ['Apple Watch Series 8', 'Wearables', 3, 399.99, null]);
         db.run(`INSERT INTO inventory (name, category, quantity, price, expiration_date) VALUES (?, ?, ?, ?, ?)`, ['AirPods Pro', 'Audio', 7, 249.99, null]);
         db.run(`INSERT INTO inventory (name, category, quantity, price, expiration_date) VALUES (?, ?, ?, ?, ?)`, ['Dell XPS 13', 'Computers', 8, 1199.99, null]);

         db.run(`INSERT INTO customers (name, email, phone, purchase_history) VALUES (?, ?, ?, ?)`, ['Alice Johnson', 'alice.j@example.com', '555-0101', 'Samsung Galaxy S23, USB-C Charger']);
         db.run(`INSERT INTO customers (name, email, phone, purchase_history) VALUES (?, ?, ?, ?)`, ['Bob Smith', 'bob.smith@example.com', '555-0102', 'Apple AirPods Pro']);
         db.run(`INSERT INTO customers (name, email, phone, purchase_history) VALUES (?, ?, ?, ?)`, ['Charlie Brown', 'charlie.b@example.com', '555-0103', 'Sony WH-1000XM5 Headphones']);
         db.run(`INSERT INTO customers (name, email, phone, purchase_history) VALUES (?, ?, ?, ?)`, ['Diana Prince', 'diana.p@example.com', '555-0104', 'iPhone 14 Case']);
         db.run(`INSERT INTO customers (name, email, phone, purchase_history) VALUES (?, ?, ?, ?)`, ['Eve Adams', 'eve.adams@example.com', '555-0105', 'USB-C Charger']);

         db.run(`INSERT INTO employees (name, role, performance) VALUES (?, ?, ?)`, ['John Doe', 'Manager', 85.5]);
         db.run(`INSERT INTO employees (name, role, performance) VALUES (?, ?, ?)`, ['Sarah Lee', 'Sales Associate', 78.0]);
         db.run(`INSERT INTO employees (name, role, performance) VALUES (?, ?, ?)`, ['Mike Brown', 'Cashier', 65.0]);

         db.run(`INSERT INTO sales (product_id, quantity, total, sale_date) VALUES (?, ?, ?, ?)`, [1, 2, 1599.98, '2025-04-20']);
         db.run(`INSERT INTO sales (product_id, quantity, total, sale_date) VALUES (?, ?, ?, ?)`, [2, 5, 1249.95, '2025-04-21']);
         db.run(`INSERT INTO sales (product_id, quantity, total, sale_date) VALUES (?, ?, ?, ?)`, [3, 1, 399.99, '2025-04-22']);
         db.run(`INSERT INTO sales (product_id, quantity, total, sale_date) VALUES (?, ?, ?, ?)`, [4, 10, 199.90, '2025-04-23']);
         db.run(`INSERT INTO sales (product_id, quantity, total, sale_date) VALUES (?, ?, ?, ?)`, [5, 3, 89.97, '2025-04-23']);

         db.run(`INSERT INTO invoices (customer_id, total, discount, invoice_date) VALUES (?, ?, ?, ?)`, [1, 1619.97, 20.00, '2025-04-20']);
         db.run(`INSERT INTO invoices (customer_id, total, discount, invoice_date) VALUES (?, ?, ?, ?)`, [2, 1249.95, 0.00, '2025-04-21']);
         db.run(`INSERT INTO invoices (customer_id, total, discount, invoice_date) VALUES (?, ?, ?, ?)`, [3, 399.99, 10.00, '2025-04-22']);
         db.run(`INSERT INTO invoices (customer_id, total, discount, invoice_date) VALUES (?, ?, ?, ?)`, [4, 29.99, 0.00, '2025-04-23']);
         db.run(`INSERT INTO invoices (customer_id, total, discount, invoice_date) VALUES (?, ?, ?, ?)`, [5, 219.89, 5.00, '2025-04-23']);

         console.log('Database initialized with sample data.');
     });

     db.close();