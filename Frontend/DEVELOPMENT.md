# Development Guide

This guide explains how to develop and run the Electro e-commerce platform.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
# Install dependencies
npm install
```

## 🏃‍♂️ Running the Application

### Default (Admin Panel)
```bash
npm run dev
```
- Runs the admin panel
- Available at: http://localhost:5173
- Includes admin authentication and store management

### Storefront Only
```bash
npm run dev:storefront
```
- Runs the customer-facing storefront
- Available at: http://localhost:5173
- Complete e-commerce experience

### Admin Panel Only
```bash
npm run dev:admin
```
- Runs the admin panel
- Available at: http://localhost:5174
- Store management interface

### Both Modules (Recommended)
```bash
npm run dev:both
```
- Runs both storefront and admin simultaneously
- Storefront: http://localhost:5173
- Admin: http://localhost:5174

## 📁 Project Structure

```
Frontend/
├── src/
│   ├── storefront/          # Customer-facing e-commerce
│   │   ├── components/      # Storefront components
│   │   ├── pages/          # Customer pages
│   │   ├── store/          # Storefront Redux store
│   │   ├── lib/            # Storefront utilities
│   │   └── routes/         # Storefront routing
│   │
│   ├── admin/              # Administrative panel
│   │   ├── components/     # Admin components
│   │   ├── pages/         # Admin pages
│   │   ├── store/         # Admin Redux store
│   │   └── theme/         # Admin theme system
│   │
│   ├── components/        # Shared components
│   ├── data/              # Shared mock data
│   ├── lib/               # Shared utilities
│   ├── store/             # Shared Redux store
│   └── routes/            # Main routing
```

## 🛍️ Storefront Development

The storefront is a complete e-commerce experience:

### Key Features
- **Product Catalog**: Browse products with filters and sorting
- **Shopping Cart**: Add/remove items with persistent storage
- **Wishlist**: Save products for later
- **Checkout**: Multi-step checkout process
- **User Accounts**: Sign in/register with order history
- **Search**: Full-text product search

### Pages
- **Home**: Hero tiles, new products, hot deals
- **Category**: Filterable product grids
- **Product Detail**: Detailed product pages
- **Cart**: Shopping cart management
- **Wishlist**: Saved products
- **Checkout**: Multi-step checkout
- **Account**: User authentication
- **Search**: Product search results

### Development
```bash
# Run storefront only
npm run dev:storefront

# Build storefront
npm run build:storefront
```

## 🔧 Admin Panel Development

The admin panel provides store management capabilities:

### Key Features
- **Product Management**: Add, edit, delete products
- **Order Processing**: View and manage orders
- **User Management**: Admin and customer accounts
- **Category Management**: Organize products
- **Analytics Dashboard**: Sales metrics
- **Settings**: Store configuration

### Pages
- **Dashboard**: Sales overview and metrics
- **Products**: Product catalog management
- **Orders**: Order processing
- **Users**: User management
- **Categories**: Category management
- **Settings**: Store configuration

### Development
```bash
# Run admin panel only
npm run dev:admin

# Build admin panel
npm run build:admin
```

## 🎨 Styling

The application uses Tailwind CSS with custom theme tokens:

### Color Palette
- **Primary**: Red (#e62e2e) - Brand color
- **Accent Dark**: Dark gray (#0f0f14) - Top bar
- **Surface**: Light gray (#f5f6f8) - Backgrounds
- **Ink**: Dark gray (#22242a) - Text
- **Muted**: Medium gray (#6b7280) - Secondary text

### Typography
- **Font**: Poppins (primary), Inter (fallback)
- **Sizes**: 16px base, 28px H1, 22px H2, 18px H3

### Responsive Design
- **Mobile**: < 768px
- **Tablet**: 768px - 1199px
- **Desktop**: ≥ 1200px

## 🔧 State Management

### Storefront Store
- **cartSlice**: Shopping cart management
- **wishlistSlice**: Wishlist functionality
- **userSlice**: User authentication
- **uiSlice**: UI state (currency, theme)
- **productsSlice**: Product catalog

### Admin Store
- **authStore**: Admin authentication
- **currencyStore**: Currency management

## 🧪 Testing

```bash
# Run linting
npm run lint

# Check for TypeScript errors
npx tsc --noEmit
```

## 📦 Building for Production

```bash
# Build all modules
npm run build

# Build specific modules
npm run build:storefront
npm run build:admin

# Build both modules
npm run build:both
```

## 🚀 Deployment

### Development
- Storefront: http://localhost:5173
- Admin: http://localhost:5174

### Production
- Build outputs go to `dist/storefront/` and `dist/admin/`
- Deploy to static hosting (Vercel, Netlify, etc.)
- Or use Docker for containerized deployment

## 🔍 Debugging

### Common Issues
1. **Import Errors**: Check file paths after reorganization
2. **Styling Issues**: Verify Tailwind classes and custom CSS
3. **State Issues**: Check Redux store configuration
4. **Routing Issues**: Verify React Router setup

### Debug Tools
- React DevTools browser extension
- Redux DevTools browser extension
- Vite dev server with HMR
- ESLint for code quality

## 📚 Additional Resources

- [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) - Detailed architecture
- [README.md](README.md) - Complete project documentation
- [src/storefront/README.md](src/storefront/README.md) - Storefront docs
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Router Docs](https://reactrouter.com/)
- [Redux Toolkit Docs](https://redux-toolkit.js.org/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For development questions:
- Check the documentation files
- Open an issue on GitHub
- Contact the development team
