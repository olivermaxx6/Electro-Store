# Electro E-commerce Platform

A modern, full-featured e-commerce platform built with React, TypeScript, and Tailwind CSS. The platform consists of a customer-facing storefront and an administrative panel, both built with modern web technologies and best practices.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd Frontend

# Install dependencies
npm install

# Start development server (default - storefront)
npm run dev

# Or start specific modules
npm run dev:storefront  # Customer storefront (port 5173)
npm run dev:admin       # Admin panel (port 5174)
```

### Build for Production
```bash
# Build all modules
npm run build

# Build specific modules
npm run build:storefront
npm run build:admin
```

## 📁 Project Structure

The project is organized into separate modules for better maintainability:

```
Frontend/
├── src/
│   ├── storefront/          # Customer-facing e-commerce storefront
│   ├── admin/               # Admin panel for store management
│   ├── components/          # Shared components
│   ├── data/                # Shared mock data
│   ├── lib/                 # Shared utilities
│   ├── store/               # Shared Redux store
│   ├── styles/              # Global styles and tokens
│   ├── types/               # Shared TypeScript types
│   └── routes/              # Main routing configuration
├── package.json             # Main package configuration
├── vite.config.js          # Default Vite configuration
├── vite.storefront.config.js # Storefront-specific config
├── vite.admin.config.js     # Admin-specific config
└── tailwind.config.js       # Tailwind CSS configuration
```

## 🛍️ Storefront Features

The customer-facing storefront provides a complete e-commerce experience:

### Core Functionality
- **Product Catalog**: Browse products by category with advanced filtering
- **Product Details**: Detailed product pages with specifications and reviews
- **Shopping Cart**: Add/remove items with quantity controls and persistent storage
- **Wishlist**: Save products for later with move-to-cart functionality
- **Checkout Flow**: Multi-step checkout process (Address → Shipping → Payment → Review)
- **User Accounts**: Sign in/register with order history and profile management
- **Search**: Full-text search across products with results page
- **Order Tracking**: Track order status and delivery information

### Pages
- **Home**: Hero tiles, new products, hot deals, top selling, newsletter signup
- **Category**: Filterable product grids with sorting and pagination
- **Product Detail**: Image gallery, specifications, tabs, add to cart/wishlist
- **Cart**: Item management, quantity controls, order summary
- **Wishlist**: Saved products with move to cart functionality
- **Checkout**: Multi-step form with address, shipping, payment, review
- **Account**: Sign in/register, profile, order history
- **Search**: Query-based product search with results
- **Static Pages**: About, Contact, Privacy, Terms, Help, Track Order
- **404**: Friendly error page with navigation options

### Design Features
- **Responsive Design**: Optimized for desktop (4-up grids), tablet (2-up), mobile (1-up)
- **Modern UI**: Tailwind CSS with custom Electro theme
- **Interactive Elements**: Hover effects, transitions, loading states
- **Accessibility**: ARIA labels, keyboard navigation, focus management
- **Performance**: Lazy loading, optimized bundles, efficient state management

## 🔧 Admin Panel Features

The administrative panel provides comprehensive store management:

### Management Capabilities
- **Product Management**: Add, edit, delete products with image uploads
- **Order Processing**: View and manage customer orders
- **User Management**: Admin user accounts and customer management
- **Category Management**: Organize products with hierarchical categories
- **Content Management**: Manage static pages and content
- **Analytics Dashboard**: Sales metrics and performance analytics
- **Settings**: Store configuration and preferences

### Pages
- **Dashboard**: Overview of sales, orders, and key metrics
- **Products**: Product catalog management with bulk operations
- **Orders**: Order processing and status management
- **Users**: Customer and admin user management
- **Categories**: Category hierarchy management
- **Reviews**: Product review moderation
- **Settings**: Store configuration and preferences
- **Sign In**: Admin authentication

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

### Frontend Technologies
- **React 18**: Modern React with hooks and concurrent features
- **TypeScript**: Type safety and better development experience
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **Redux Toolkit**: State management with persistence
- **React Router v6**: Client-side routing
- **Lucide React**: Consistent iconography

### Development Tools
- **ESLint**: Code linting and formatting
- **TypeScript**: Static type checking
- **Vite**: Hot module replacement and fast builds
- **PostCSS**: CSS processing and autoprefixing

## 📱 Responsive Design

The platform is fully responsive across all device sizes:

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1199px
- **Desktop**: ≥ 1200px

### Responsive Features
- **Navigation**: Collapsible mobile menu
- **Product Grids**: 4-up desktop, 2-up tablet, 1-up mobile
- **Layout**: Adaptive spacing and typography
- **Images**: Responsive image handling with placeholders

## 🚀 Performance Optimizations

- **Code Splitting**: Lazy loading of components and routes
- **Bundle Optimization**: Tree shaking and minification
- **State Persistence**: Efficient localStorage usage
- **Image Optimization**: Placeholder system for fast loading
- **Caching**: Redux state persistence and API caching
- **Lazy Loading**: Components loaded on demand

## 🔒 Security Features

- **Input Validation**: Client-side and server-side validation
- **XSS Protection**: Sanitized user inputs
- **CSRF Protection**: Token-based request validation
- **Secure Storage**: Encrypted localStorage for sensitive data
- **Authentication**: Secure user authentication and session management

## 📊 State Management

The application uses Redux Toolkit for state management with the following slices:

### Storefront Store
- **cartSlice**: Shopping cart management with persistence
- **wishlistSlice**: Wishlist functionality with timestamps
- **userSlice**: User authentication and profile data
- **uiSlice**: UI state (currency, theme, toasts)
- **productsSlice**: Product catalog, filtering, and search

### Admin Store
- **authStore**: Admin authentication and permissions
- **currencyStore**: Multi-currency support

## 🧪 Testing

The platform includes comprehensive testing:

- **Unit Tests**: Component and utility function testing
- **Integration Tests**: Feature and workflow testing
- **E2E Tests**: End-to-end user journey testing
- **Performance Tests**: Load and performance testing

## 📈 Analytics & Monitoring

- **User Analytics**: Track user behavior and engagement
- **Performance Monitoring**: Monitor app performance and errors
- **Sales Analytics**: Track sales metrics and trends
- **Error Tracking**: Monitor and log application errors

## 🔄 Deployment

### Development
```bash
npm run dev:storefront  # Storefront on port 5173
npm run dev:admin       # Admin on port 5174
```

### Production Build
```bash
npm run build:storefront  # Build storefront
npm run build:admin       # Build admin panel
```

### Deployment Options
- **Static Hosting**: Deploy to Vercel, Netlify, or similar
- **CDN**: Use CloudFlare or AWS CloudFront
- **Container**: Docker deployment for scalable hosting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- **Documentation**: Check the [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) file
- **Issues**: Open an issue on GitHub
- **Contact**: Reach out to the development team

## 🎯 Roadmap

### Upcoming Features
- **Multi-language Support**: Internationalization
- **Advanced Analytics**: Enhanced reporting and insights
- **Mobile App**: React Native mobile application
- **PWA Support**: Progressive Web App features
- **Advanced Search**: Elasticsearch integration
- **Payment Integration**: Multiple payment gateways
- **Inventory Management**: Real-time stock tracking

### Performance Improvements
- **Server-Side Rendering**: Next.js integration
- **Image Optimization**: Advanced image processing
- **Caching Strategy**: Redis caching layer
- **CDN Integration**: Global content delivery

---

Built with ❤️ by the Electro development team. This platform represents modern e-commerce best practices with a focus on user experience, performance, and maintainability.