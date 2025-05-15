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
