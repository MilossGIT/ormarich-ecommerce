const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config();

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_SECRET_KEY) {
    console.warn('Warning: STRIPE_SECRET_KEY is not set. Using test mode.');
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';

// Hash password if not already hashed
let hashedPassword = process.env.ADMIN_PASSWORD_HASH;
if (!hashedPassword && ADMIN_PASSWORD) {
    hashedPassword = bcrypt.hashSync(ADMIN_PASSWORD, 10);
}

const stripe = require('stripe')(STRIPE_SECRET_KEY || 'sk_test_51ItIsJustADummyKeyForTestingPleaseReplaceMe');
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Enhanced security headers
app.use((req, res, next) => {
    // Content Security Policy
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://cdnjs.cloudflare.com; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; " +
        "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; " +
        "img-src 'self' data: https://images.pexels.com; " +
        "connect-src 'self' https://api.stripe.com;"
    );

    // Additional security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Utility functions for product management
const getProductsFilePath = () => path.join(__dirname, 'public', 'admin', 'products.json');

const getProducts = () => {
    try {
        const filePath = getProductsFilePath();
        if (!fs.existsSync(filePath)) {
            return [];
        }
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading products file:', error);
        return [];
    }
};

const saveProducts = (products) => {
    try {
        const filePath = getProductsFilePath();
        const dirPath = path.dirname(filePath);

        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        fs.writeFileSync(filePath, JSON.stringify(products, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error('Error saving products file:', error);
        return false;
    }
};

// Middleware to verify admin JWT token
const verifyAdminToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.adminUser = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
    }
};

// Routes
app.get('/api/get-stripe-key', (req, res) => {
    const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_DummyPublishableKeyForTesting';
    res.json({ publishableKey });
});

// Admin login endpoint
app.post('/api/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Username and password are required' });
        }

        // Check username
        if (username !== ADMIN_USERNAME) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Check password
        const isPasswordValid = hashedPassword
            ? await bcrypt.compare(password, hashedPassword)
            : password === ADMIN_PASSWORD;

        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '24h' });

        res.json({
            success: true,
            token,
            message: 'Login successful'
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Admin product management endpoints
app.get('/api/admin/products', verifyAdminToken, (req, res) => {
    try {
        const products = getProducts();
        res.json(products);
    } catch (error) {
        console.error('Error getting products:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.post('/api/admin/products', verifyAdminToken, (req, res) => {
    try {
        const products = getProducts();
        const newProduct = req.body;

        // Validate required fields
        if (!newProduct.name || !newProduct.price || !newProduct.image) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        // Generate a new ID
        const maxId = products.length > 0 ? Math.max(...products.map(p => p.id)) : 0;
        newProduct.id = maxId + 1;

        // Add product
        products.push(newProduct);

        // Save to file
        if (saveProducts(products)) {
            res.status(201).json({ success: true, product: newProduct });
        } else {
            res.status(500).json({ success: false, message: 'Failed to save product' });
        }
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.get('/api/admin/products/:id', verifyAdminToken, (req, res) => {
    try {
        const products = getProducts();
        const productId = parseInt(req.params.id);
        const product = products.find(p => p.id === productId);

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        console.error('Error getting product:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.put('/api/admin/products/:id', verifyAdminToken, (req, res) => {
    try {
        const products = getProducts();
        const productId = parseInt(req.params.id);
        const updatedProduct = req.body;

        // Validate required fields
        if (!updatedProduct.name || !updatedProduct.price || !updatedProduct.image) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        // Find product index
        const index = products.findIndex(p => p.id === productId);

        if (index === -1) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Update product, preserving ID
        updatedProduct.id = productId;
        products[index] = updatedProduct;

        // Save to file
        if (saveProducts(products)) {
            res.json({ success: true, product: updatedProduct });
        } else {
            res.status(500).json({ success: false, message: 'Failed to update product' });
        }
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.delete('/api/admin/products/:id', verifyAdminToken, (req, res) => {
    try {
        const products = getProducts();
        const productId = parseInt(req.params.id);

        // Find product index
        const index = products.findIndex(p => p.id === productId);

        if (index === -1) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Remove product
        products.splice(index, 1);

        // Save to file
        if (saveProducts(products)) {
            res.json({ success: true, message: 'Product deleted successfully' });
        } else {
            res.status(500).json({ success: false, message: 'Failed to delete product' });
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Public API to get products for the frontend
app.get('/api/products', (req, res) => {
    try {
        const products = getProducts();
        res.json(products);
    } catch (error) {
        console.error('Error getting products:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.post('/api/create-payment-intent', async (req, res) => {
    try {
        const { amount, currency, items } = req.body;

        if (!amount || !currency) {
            return res.status(400).json({ error: 'Amount and currency are required' });
        }

        // Validate amount
        if (amount <= 0 || !Number.isInteger(amount)) {
            return res.status(400).json({ error: 'Amount must be a positive integer' });
        }

        // Validate currency
        const validCurrencies = ['usd', 'eur', 'gbp', 'cad', 'aud'];
        if (!validCurrencies.includes(currency.toLowerCase())) {
            return res.status(400).json({ error: 'Invalid currency' });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency,
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                items: JSON.stringify(items)
            }
        });

        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error('Error creating payment intent:', error);

        // Send appropriate error message based on type
        if (error.type === 'StripeCardError') {
            res.status(400).json({ error: error.message });
        } else if (error.type === 'StripeInvalidRequestError') {
            res.status(400).json({ error: 'Invalid request to payment processor' });
        } else {
            res.status(500).json({ error: 'An error occurred with the payment service' });
        }
    }
});

// HTML routes - serve the frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/payment-success', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'payment-success.html'));
});

// Legal pages routes
app.get('/pravila-privatnosti.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'pravila-privatnosti.html'));
});

app.get('/uvjeti-koristenja.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'uvjeti-koristenja.html'));
});

app.get('/dostava-povrat.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'dostava-povrat.html'));
});

app.get('/cesta-pitanja.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'cesta-pitanja.html'));
});

app.get('/about.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'about.html'));
});

app.get('/contact.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'contact.html'));
});

// Catch-all route for SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Server error'
    });
});

// Start server with improved error handling
const startServer = async () => {
    const PORT = process.env.PORT || 3000;
    try {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`http://localhost:${PORT}`);
        });
    } catch (error) {
        if (error.code === 'EADDRINUSE') {
            console.log(`Port ${PORT} is busy, trying ${PORT + 1}`);
            try {
                app.listen(PORT + 1, () => {
                    console.log(`Server running on port ${PORT + 1}`);
                    console.log(`http://localhost:${PORT + 1}`);
                });
            } catch (err) {
                console.error('Failed to start server on alternative port:', err);
                process.exit(1);
            }
        } else {
            console.error('Failed to start server:', error);
            process.exit(1);
        }
    }
};

startServer(); 