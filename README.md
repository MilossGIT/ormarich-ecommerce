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
