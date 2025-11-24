const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

// SQLite Database Setup
const dbPath = 'C:/shop-monitoring-system/database/shop.db';
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database at:', dbPath);
    }
});

// Simple Authentication Middleware
const authenticate = (req, res, next) => {
    const { username, password } = req.body;
    db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, row) => {
        if (err) {
            console.error('Authentication error:', err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            console.log('Invalid login attempt for:', username);
            res.status(401).json({ success: false, error: 'Invalid credentials' });
            return;
        }
        req.user = { role: row.role };
        console.log('Login successful for:', username);
        next();
    });
};

// Login Endpoint
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, row) => {
        if (err) {
            console.error('Login database error:', err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(401).json({ success: false, error: 'Invalid credentials' });
            return;
        }
        res.json({ success: true, role: row.role });
    });
});

// Inventory Endpoints
app.get('/api/inventory', (req, res) => {
    db.all('SELECT * FROM inventory', [], (err, rows) => {
        if (err) {
            console.error('Inventory fetch error:', err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/api/inventory', (req, res) => {
    const { name, quantity, price, expiration_date } = req.body;
    db.run(
        'INSERT INTO inventory (name, quantity, price, expiration_date) VALUES (?, ?, ?, ?)',
        [name, quantity, price, expiration_date],
        function (err) {
            if (err) {
                console.error('Inventory add error:', err.message);
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ id: this.lastID });
        }
    );
});

// Sales Endpoints
app.get('/api/sales', (req, res) => {
    db.all('SELECT * FROM sales', [], (err, rows) => {
        if (err) {
            console.error('Sales fetch error:', err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Customers Endpoints
app.get('/api/customers', (req, res) => {
    db.all('SELECT * FROM customers', [], (err, rows) => {
        if (err) {
            console.error('Customers fetch error:', err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Employees Endpoints
app.get('/api/employees', (req, res) => {
    db.all('SELECT * FROM employees', [], (err, rows) => {
        if (err) {
            console.error('Employees fetch error:', err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Invoices Endpoints
app.get('/api/invoices', (req, res) => {
    db.all('SELECT * FROM invoices', [], (err, rows) => {
        if (err) {
            console.error('Invoices fetch error:', err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});