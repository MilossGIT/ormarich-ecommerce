# Ormarich

A premium e-commerce website for children's products with Scandinavian design aesthetics.

## About Ormarich

Ormarich is a Croatian e-commerce platform specializing in high-quality children's products with minimalist Scandinavian design. The platform features a clean, modern interface that showcases products beautifully while providing an intuitive shopping experience across all devices.

## Features

- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Product Gallery**: Intuitive image browsing with swipe navigation on mobile
- **Size Selection**: User-friendly size selector with stock information
- **Shopping Cart**: Seamless cart experience with real-time updates
- **Modern UI**: Clean, minimalist aesthetic aligned with Scandinavian design principles

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript
- **Backend**: Node.js, Express.js
- **Payment Processing**: Stripe API integration
- **Responsive Design**: Mobile-first approach

## Image Assets Note

**Important**: Large image and video assets have been excluded from this repository due to GitHub file size limitations. Placeholder images are included for demonstration purposes. The full assets are available separately and should be placed in the `public/images` directory for local development.

## Local Development

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/MilossGIT/ormarich-ecommerce.git
   cd ormarich-ecommerce
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables (optional):
   Create a `.env` file in the root directory with the following variables:

   ```
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   PORT=3000
   ```

4. Start the development server:

   ```bash
   node server.js
   ```

5. Visit `http://localhost:3000` in your browser.

## Design Philosophy

Ormarich combines Croatian heritage with Scandinavian minimalism, creating a shopping experience that highlights product quality through clean, uncluttered design. The interface uses subtle animations and intuitive navigation to enhance the user experience without distracting from the products themselves.

## License

© 2025 Ormarich. All rights reserved.

# Ormarich Admin Instructions

This document contains private instructions for managing the Ormarich e-commerce store.

## Admin Access

Access the admin panel at: `https://your-site-domain.com/admin/`

**Default credentials:**

- Username: `admin`
- Password: `admin`

**IMPORTANT:** Change these default credentials as soon as possible by setting environment variables.

## Environment Variables

Set these environment variables for production:

```
STRIPE_SECRET_KEY=sk_live_your_stripe_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_key
JWT_SECRET=your_custom_secure_random_string
ADMIN_USERNAME=your_custom_username
ADMIN_PASSWORD=your_custom_password
```

## Product Management

### Adding Products

1. Log in to the admin panel
2. Click "Add new product" button
3. Fill in all required fields:
   - Product name
   - Price
   - Description
   - Main image URL
   - Gallery images (optional)
   - Features (bullet points describing the product)
   - Sizes and stock quantities

### Editing Products

1. Click the edit icon (pencil) next to a product
2. Update the product information
3. Click "Save product" to confirm changes

### Deleting Products

1. Click the delete icon (trash) next to a product
2. Confirm deletion when prompted

## Image Guidelines

For best performance:

- Use WebP format for all images (better compression than JPG)
- Keep image sizes under 500KB
- Recommended dimensions:
  - Main product images: 1000x1000px
  - Gallery images: 1200x1500px

## Deployment Notes

When deploying to Vercel or another hosting platform:

1. Set the environment variables in the hosting platform's settings
2. Ensure the build command is set to `npm run build`
3. The start command should be `npm start`

## Troubleshooting

If you encounter issues with the admin panel:

1. Check browser console for errors
2. Verify correct API endpoints in Network tab
3. Ensure JWT token is valid
4. Check server logs for backend errors

## Data Backup

The product data is stored in `/public/admin/products.json`
Regularly back up this file to prevent data loss.

## Security Considerations

- Change default admin credentials immediately
- Use a strong, unique JWT_SECRET
- Consider enabling Two-Factor Authentication in future updates
- Rotate JWT_SECRET periodically
- Store sensitive credentials only in environment variables, never in code

For support, contact the development team at developer-email@example.com
