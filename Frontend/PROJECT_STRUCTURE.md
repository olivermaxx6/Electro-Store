# Electro E-commerce Project Structure

This document outlines the complete project structure for the Electro e-commerce application, which is organized into separate modules for better maintainability and separation of concerns.

## 📁 Root Structure

```
Frontend/
├── src/
│   ├── storefront/          # Customer-facing e-commerce storefront
│   ├── admin/               # Admin panel for store management
│   ├── components/          # Shared components (filters, etc.)
│   ├── data/                # Shared mock data
│   ├── lib/                 # Shared utilities
│   ├── store/               # Shared Redux store
│   ├── styles/              # Global styles and tokens
│   ├── types/               # Shared TypeScript types
│   ├── routes/              # Main routing configuration
│   ├── layouts/             # Shared layouts
│   ├── pages/               # Shared pages
│   ├── hooks/               # Shared React hooks
│   ├── debug/               # Debug utilities
│   ├── main.tsx             # Main application entry point
│   ├── App.jsx              # App component
│   └── index.css            # Global CSS
├── package.json             # Main package configuration
├── vite.config.js          # Vite configuration
├── tailwind.config.js       # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
```

## 🛍️ Storefront Module (`src/storefront/`)

The customer-facing e-commerce application with complete shopping functionality.

### Structure
```
storefront/
├── components/              # Storefront-specific components
│   ├── common/             # Basic UI components
│   │   ├── Badge.tsx       # Badge component for discounts/new
│   │   ├── Breadcrumbs.tsx # Navigation breadcrumbs
│   │   ├── Button.tsx      # Reusable button component
│   │   ├── Input.tsx       # Form input component
│   │   ├── Placeholder.tsx # Image placeholder component
│   │   └── QuantityStepper.tsx # Quantity selector
│   ├── header/             # Header components
│   │   ├── TopBar.tsx      # Dark utility bar
│   │   ├── MainHeader.tsx  # Logo, search, mini cart
│   │   └── NavBar.tsx      # Primary navigation
│   ├── footer/             # Footer components
│   │   ├── FooterColumns.tsx # Footer content columns
│   │   └── BottomBar.tsx   # Footer bottom bar
│   ├── products/           # Product-related components
│   │   ├── ProductCard.tsx # Product display card
│   │   ├── Price.tsx       # Price display with discounts
│   │   ├── Stars.tsx       # Rating stars component
│   │   └── ProductTabs.tsx # Category navigation tabs
│   ├── hero/               # Hero section components
│   │   └── PromoTile.tsx   # Promotional tiles
│   ├── promo/              # Promotional components
│   │   └── HotDealBanner.tsx # Hot deals banner
│   └── lists/              # List components
│       └── CompactList.tsx  # Compact product lists
├── pages/                  # Storefront pages
│   ├── static/             # Static pages
│   │   ├── About.tsx       # About page
│   │   ├── Contact.tsx     # Contact page
│   │   ├── Privacy.tsx     # Privacy policy
│   │   ├── Terms.tsx       # Terms of service
│   │   ├── Help.tsx        # Help center
│   │   └── TrackOrder.tsx  # Order tracking
│   ├── Home.tsx            # Homepage with hero, products
│   ├── Category.tsx         # Category browsing with filters
│   ├── ProductDetail.tsx   # Product detail page
│   ├── Cart.tsx            # Shopping cart
│   ├── Wishlist.tsx        # Wishlist page
│   ├── Checkout.tsx        # Checkout flow
│   ├── Account.tsx         # User account
│   ├── Orders.tsx          # Order history
│   ├── Search.tsx          # Search results
│   └── NotFound.tsx        # 404 page
├── layouts/                # Storefront layouts
│   └── Layout.tsx          # Main storefront layout
├── store/                  # Storefront Redux store
│   ├── index.ts            # Store configuration
│   ├── cartSlice.ts        # Shopping cart state
│   ├── wishlistSlice.ts    # Wishlist state
│   ├── userSlice.ts        # User authentication
│   ├── uiSlice.ts          # UI state (currency, theme)
│   └── productsSlice.ts    # Product catalog state
├── lib/                    # Storefront utilities
│   ├── types.ts            # TypeScript type definitions
│   ├── repo.ts             # Data access layer
│   ├── format.ts           # Formatting utilities
│   └── storage.ts          # Local storage utilities
├── data/                   # Storefront mock data
│   ├── products.json       # Product catalog
│   ├── categories.json     # Product categories
│   └── brands.json         # Brand list
├── routes/                 # Storefront routing
│   └── index.tsx           # React Router configuration
├── main.tsx                # Storefront entry point
├── package.json            # Storefront dependencies
└── README.md               # Storefront documentation
```

### Key Features
- **Complete E-commerce Experience**: Product browsing, cart, wishlist, checkout
- **Responsive Design**: Optimized for all device sizes
- **State Management**: Redux Toolkit with persistence
- **Type Safety**: Full TypeScript implementation
- **Modern UI**: Tailwind CSS with custom theme

## 🔧 Admin Module (`src/admin/`)

The administrative panel for store management and content administration.

### Structure
```
admin/
├── components/             # Admin-specific components
│   ├── layout/            # Admin layout components
│   │   ├── AdminLayout.jsx # Main admin layout
│   │   ├── Sidebar.jsx    # Admin sidebar
│   │   ├── SidebarItem.jsx # Sidebar navigation items
│   │   ├── SidebarRail.jsx # Sidebar rail component
│   │   └── TopBar.jsx     # Admin top bar
│   ├── system/            # System components
│   │   └── ErrorBoundary.jsx # Error boundary
│   ├── ui/                # Admin UI components
│   │   ├── Card.jsx       # Admin card component
│   │   ├── FormRow.jsx    # Form row layout
│   │   └── Pager.jsx      # Pagination component
│   ├── AdminShell.jsx     # Admin shell component
│   ├── ThemeToggle.jsx    # Theme toggle
│   └── UserSettingsModal.jsx # User settings modal
├── pages/                 # Admin pages
│   └── admin/            # Admin page components
│       ├── Dashboard.jsx  # Admin dashboard
│       ├── ProductsPage.jsx # Product management
│       ├── OrdersPage.jsx # Order management
│       ├── UsersPage.jsx  # User management
│       ├── CategoriesPage.jsx # Category management
│       ├── ReviewsPage.jsx # Review management
│       ├── SettingsPage.jsx # Settings
│       ├── SignIn.jsx    # Admin sign in
│       └── ...           # Other admin pages
├── layouts/               # Admin layouts
├── store/                 # Admin Redux store
│   ├── authStore.js       # Authentication state
│   └── currencyStore.js   # Currency management
├── lib/                   # Admin utilities
│   └── api.js             # API utilities
└── theme/                 # Admin theme system
    ├── components/        # Theme components
    ├── index.js           # Theme configuration
    └── themeConfig.js     # Theme settings
```

### Key Features
- **Store Management**: Product, order, and user management
- **Content Administration**: Category and content management
- **Analytics Dashboard**: Sales and performance metrics
- **User Management**: Admin user accounts and permissions
- **Theme System**: Customizable admin interface

## 🔄 Shared Resources

### Components (`src/components/`)
- **filters/**: Shared filter components (FiltersPanel, SortBar, Pagination)
- Used by both storefront and admin modules

### Data (`src/data/`)
- **products.json**: Product catalog data
- **categories.json**: Category hierarchy
- **brands.json**: Brand information
- Shared across all modules

### Library (`src/lib/`)
- **format.ts**: Utility functions for formatting
- **storage.ts**: Local storage utilities
- **repo.ts**: Data access layer
- Shared utilities for all modules

### Store (`src/store/`)
- **index.ts**: Main Redux store configuration
- **cartSlice.ts**: Shopping cart state
- **wishlistSlice.ts**: Wishlist state
- **userSlice.ts**: User authentication
- **uiSlice.ts**: UI state management
- **productsSlice.ts**: Product catalog state

### Styles (`src/styles/`)
- **tokens.css**: CSS custom properties for theming
- Global styles and design tokens

### Types (`src/types/`)
- **index.ts**: Shared TypeScript type definitions
- Common types used across modules

## 🚀 Getting Started

### Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Module-Specific Development
```bash
# Storefront development
cd src/storefront
npm run dev

# Admin development
cd src/admin
npm run dev
```

## 📋 Features Implemented

### Storefront Features
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

### Admin Features
✅ **Store Management**
- Product catalog management
- Order processing and tracking
- User account management
- Category and brand management

✅ **Analytics & Reporting**
- Sales dashboard
- Performance metrics
- User analytics
- Inventory management

## 🎨 Design System

### Color Palette
- **Primary**: Red (#e62e2e) - Brand color for CTAs and accents
- **Accent Dark**: Dark gray (#0f0f14) - Top utility bar
- **Surface**: Light gray (#f5f6f8) - Background surfaces
- **Ink**: Dark gray (#22242a) - Primary text
- **Muted**: Medium gray (#6b7280) - Secondary text
- **Star**: Yellow (#ffcc00) - Rating stars

### Typography
- **Font Family**: Poppins (primary), Inter (fallback)
- **Base Size**: 16px
- **H1**: 28px
- **H2**: 22px
- **H3**: 18px

### Spacing
- **Desktop Sections**: 64px vertical spacing
- **Mobile Sections**: 40px vertical spacing
- **Container Max Width**: 1200px

## 🔧 Technical Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Persistence**: Redux Persist
- **Development**: ESLint + TypeScript

## 📱 Responsive Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1199px
- **Desktop**: ≥ 1200px

## 🎯 Performance Optimizations

- **Code Splitting**: Lazy loading of components
- **Bundle Optimization**: Tree shaking and minification
- **State Persistence**: Efficient localStorage usage
- **Image Optimization**: Placeholder system for fast loading
- **Caching**: Redux state persistence

This structure provides a scalable, maintainable foundation for the Electro e-commerce platform with clear separation between customer-facing and administrative functionality.
