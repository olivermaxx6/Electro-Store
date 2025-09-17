# Admin Routes Documentation

This document contains all the admin routes defined in the ecommerce application.

## Route Structure

All admin routes are prefixed with `/admin/` and are defined in `Frontend/src/routes/AdminRoutes.jsx`.

## Public Routes (No Authentication Required)

| Route | Component | Description |
|-------|-----------|-------------|
| `/admin/sign-in` | SignIn | Admin sign-in page |
| `/admin/smoke` | Smoke | Debug/test route for router verification |

## Protected Routes (Authentication Required)

All routes below are protected by the `Private` component which checks for:
- Valid authentication token
- User object with `is_staff` property
- Redirects to sign-in if not authenticated

| Route | Component | Description |
|-------|-----------|-------------|
| `/admin/dashboard` | Dashboard | Main admin dashboard |
| `/admin/manage-categories` | ManageCategoriesPage | Category management |
| `/admin/products` | ProductsPage | Product management |
| `/admin/services` | ServicesPage | Services management |
| `/admin/inquiries` | InquiriesPage | Customer inquiries |
| `/admin/orders` | OrdersPage | Order management |
| `/admin/users` | UsersPage | User management |
| `/admin/content` | ContentPage | Content management |
| `/admin/reviews` | ReviewsPage | Review management |
| `/admin/settings` | SettingsPage | Application settings |
| `/admin/profile` | AdminProfilePage | Admin profile management |

## Default Route

| Route | Action | Description |
|-------|--------|-------------|
| `/admin/` | Navigate to `/admin/dashboard` | Default redirect to dashboard |

## Authentication Flow

1. Unauthenticated users accessing protected routes are redirected to `/admin/sign-in`
2. After successful authentication, users can access all protected routes
3. The `Private` component handles authentication state checking
4. Authentication state includes token validation and user staff status verification

## Component Imports

The following components are imported and used in the admin routes:

- SignIn
- Dashboard
- ProductsPage
- ManageCategoriesPage
- ServicesPage
- InquiriesPage
- OrdersPage
- UsersPage
- ContentPage
- ReviewsPage
- SettingsPage
- AdminProfilePage
- StorePage (referenced but not used in routes)

## File Location

**Route Definition:** `Frontend/src/routes/AdminRoutes.jsx`
**Authentication Store:** `Frontend/src/admin/store/authStore.js`
**Page Components:** `Frontend/src/admin/pages/admin/`
