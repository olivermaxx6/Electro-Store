# Store Routes Documentation

This document contains all the storefront routes defined in the ecommerce application.

## Route Structure

Storefront routes are defined in `Frontend/src/storefront/routes/index.tsx` and are accessible at the root level (no prefix). All routes use the `Layout` component as a wrapper and are handled by React Router's `createBrowserRouter`.

## Main Store Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Home | Homepage/storefront |
| `/deals` | Category | Deals/special offers page |
| `/category/:slug` | Category | Category page with dynamic slug parameter |
| `/product/:id` | ProductDetail | Product detail page with dynamic ID parameter |
| `/cart` | Cart | Shopping cart page |
| `/wishlist` | Wishlist | User wishlist page |
| `/checkout` | Checkout | Checkout process page |
| `/account` | Account | User account page |
| `/account/orders` | Orders | User orders page |
| `/search` | Search | Product search page |

## Static Pages

| Route | Component | Description |
|-------|-----------|-------------|
| `/about` | About | About us page |
| `/contact` | Contact | Contact us page |
| `/privacy` | Privacy | Privacy policy page |
| `/terms` | Terms | Terms of service page |
| `/help` | Help | Help/support page |
| `/track-order` | TrackOrder | Order tracking page |

## Fallback Route

| Route | Component | Description |
|-------|-----------|-------------|
| `/*` | NotFound | 404 page for unmatched routes |

## Route Architecture

### Router Configuration
- **Router Type**: `createBrowserRouter` (React Router v6)
- **Layout Wrapper**: All routes use the `Layout` component
- **State Management**: Routes are wrapped with Redux Provider and PersistGate
- **Route Separation**: Storefront routes are completely separate from admin routes

### Dynamic Routes
- **Category Routes**: `/category/:slug` - Uses slug parameter for category identification
- **Product Routes**: `/product/:id` - Uses ID parameter for product identification

### Route Hierarchy
```
/ (Root)
├── / (Home - index route)
├── /deals
├── /category/:slug
├── /product/:id
├── /cart
├── /wishlist
├── /checkout
├── /account
│   └── /account/orders
├── /search
├── /about
├── /contact
├── /privacy
├── /terms
├── /help
├── /track-order
└── /* (Catch-all for 404)
```

## Component Imports

The following components are imported and used in the storefront routes:

### Page Components
- Home
- Category
- ProductDetail
- Cart
- Wishlist
- Checkout
- Account
- Orders
- Search

### Static Page Components
- About
- Contact
- Privacy
- Terms
- Help
- TrackOrder
- NotFound

### Layout Component
- Layout (wrapper for all routes)

## File Locations

**Route Definition:** `Frontend/src/storefront/routes/index.tsx`
**Layout Component:** `Frontend/src/storefront/layouts/Layout.tsx`
**Page Components:** `Frontend/src/storefront/pages/`
**Static Pages:** `Frontend/src/storefront/pages/static/`
**State Management:** `Frontend/src/storefront/store/`

## Integration with App

The storefront routes are integrated into the main app through:
- **App Component:** `Frontend/src/App.jsx`
- **Route Provider:** Uses `RouterProvider` with the storefront router
- **State Management:** Wrapped with Redux Provider and PersistGate
- **Route Separation:** Admin routes (`/admin/*`) are handled separately

## Authentication

Storefront routes do not require authentication by default, but individual pages may implement their own authentication checks as needed (e.g., account pages, checkout).

