const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_SECRET_KEY) {
    console.warn('Warning: STRIPE_SECRET_KEY is not set. Using test mode.');
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

// Routes
app.get('/api/get-stripe-key', (req, res) => {
    const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_DummyPublishableKeyForTesting';
    res.json({ publishableKey });
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