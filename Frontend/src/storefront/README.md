# Storefront

This is the customer-facing e-commerce storefront, built with React, TypeScript, and Tailwind CSS.

## Features

- **Modern E-commerce Experience**: Complete shopping experience with product browsing, cart, wishlist, and checkout
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **State Management**: Redux Toolkit with persistence for cart, wishlist, and user preferences
- **Type Safety**: Full TypeScript implementation for better development experience
- **Component Architecture**: Modular, reusable components with clear separation of concerns

## Project Structure

```
src/storefront/
├── components/          # Reusable UI components
│   ├── common/         # Basic UI components (Button, Input, etc.)
│   ├── header/         # Header components (TopBar, MainHeader, NavBar)
│   ├── footer/         # Footer components (FooterColumns, BottomBar)
│   ├── products/       # Product-related components
│   ├── hero/           # Hero section components
│   ├── promo/          # Promotional components
│   └── lists/          # List components
├── pages/              # Page components
│   ├── static/         # Static pages (About, Contact, etc.)
│   └── ...             # Main pages (Home, Category, Product, etc.)
├── layouts/            # Layout components
├── store/              # Redux store and slices
├── lib/                # Utility functions and data access
├── data/               # Mock data files
└── routes/              # React Router configuration
```

## Key Components

### Header Components
- **TopBar**: Dark utility bar with contact info and user actions
- **MainHeader**: Logo, search, category dropdown, mini cart/wishlist
- **NavBar**: Primary navigation with active states

### Product Components
- **ProductCard**: Product display with actions and badges
- **Price**: Price display with discounts and formatting
- **Stars**: Rating display component
- **ProductTabs**: Category navigation tabs

### Layout Components
- **PromoTile**: Hero section tiles with diagonal accents
- **HotDealBanner**: Promotional banner with countdown
- **CompactList**: Compact product lists for sidebars

## Pages

### Main Pages
- **Home**: Hero tiles, new products, hot deals, top selling, newsletter
- **Category**: Filterable product grids with sorting and pagination
- **Product Detail**: Gallery, specifications, tabs, add to cart/wishlist
- **Cart**: Item management, quantity controls, order summary
- **Wishlist**: Saved products with move to cart functionality
- **Checkout**: Multi-step form with address, shipping, payment, review
- **Account**: Sign in/register, profile, order history
- **Search**: Query-based product search with results

### Static Pages
- **About**: Company information and story
- **Contact**: Contact form and information
- **Privacy**: Privacy policy
- **Terms**: Terms of service
- **Help**: FAQ and help center
- **Track Order**: Order tracking functionality

## State Management

The storefront uses Redux Toolkit with the following slices:

- **cartSlice**: Shopping cart management
- **wishlistSlice**: Wishlist functionality
- **userSlice**: User authentication and profile
- **uiSlice**: UI state (currency, theme, toasts)
- **productsSlice**: Product catalog and filtering

All user data is persisted to localStorage for a seamless experience.

## Styling

The storefront uses Tailwind CSS with custom theme tokens:

- **Primary Color**: Red (#e62e2e)
- **Accent Dark**: Dark gray (#0f0f14)
- **Typography**: Poppins font family
- **Spacing**: Consistent section spacing (64px desktop, 40px mobile)

## Development

To run the storefront in development mode:

```bash
npm run dev
```

The storefront will be available at `http://localhost:5173`.

## Build

To build the storefront for production:

```bash
npm run build
```

## Features Implemented

✅ **Complete E-commerce Functionality**
- Product browsing with categories and filters
- Shopping cart with persistent storage
- Wishlist functionality
- Multi-step checkout process
- User account management
- Order tracking

✅ **Responsive Design**
- Desktop: 4-up product grids, 3 promo tiles
- Tablet: 2-up grids, 2 promo tiles
- Mobile: Single column, collapsible navigation

✅ **Modern UI/UX**
- Hover effects and transitions
- Loading states and error handling
- Accessible components with ARIA labels
- Toast notifications for user feedback

✅ **Performance Optimized**
- Lazy loading of components
- Optimized bundle size
- Efficient state management
- Persistent user preferences
