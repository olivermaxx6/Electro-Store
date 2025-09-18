import { createBrowserRouter } from 'react-router-dom';
import Layout from '../layouts/Layout';
import Home from '../pages/Home';
import Category from '../pages/Category';
import ProductDetail from '../pages/ProductDetail';
import Cart from '../pages/Cart';
import Wishlist from '../pages/Wishlist';
import Checkout from '../pages/Checkout';
import Account from '../pages/Account';
import Orders from '../pages/Orders';
import Search from '../pages/Search';
import Services from '../pages/Services';
import ServiceDetail from '../pages/ServiceDetail';
import About from '../pages/static/About';
import Contact from '../pages/static/Contact';
import Privacy from '../pages/static/Privacy';
import Terms from '../pages/static/Terms';
import Help from '../pages/static/Help';
import TrackOrder from '../pages/static/TrackOrder';
import NotFound from '../pages/NotFound';
import SignIn from '../pages/auth/SignIn';
import SignUp from '../pages/auth/SignUp';
import Dashboard from '../pages/user/Dashboard';
import Settings from '../pages/user/Settings';
import DebugCategories from '../pages/DebugCategories';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'shop',
        element: <Category />,
      },
      {
        path: 'deals',
        element: <Category />,
      },
      {
        path: 'category/:slug',
        element: <Category />,
      },
      {
        path: 'product/:id',
        element: <ProductDetail />,
      },
      {
        path: 'cart',
        element: <Cart />,
      },
      {
        path: 'wishlist',
        element: <Wishlist />,
      },
      {
        path: 'checkout',
        element: <Checkout />,
      },
      {
        path: 'account',
        element: <Account />,
      },
      {
        path: 'account/orders',
        element: <Orders />,
      },
      {
        path: 'search',
        element: <Search />,
      },
      {
        path: 'services',
        element: <Services />,
      },
      {
        path: 'service/:id',
        element: <ServiceDetail />,
      },
      {
        path: 'about',
        element: <About />,
      },
      {
        path: 'contact',
        element: <Contact />,
      },
      {
        path: 'privacy',
        element: <Privacy />,
      },
      {
        path: 'terms',
        element: <Terms />,
      },
      {
        path: 'help',
        element: <Help />,
      },
      {
        path: 'track-order',
        element: <TrackOrder />,
      },
      {
        path: 'debug-categories',
        element: <DebugCategories />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
  // User authentication and dashboard routes (outside main layout)
  {
    path: 'user/sign-in',
    element: <SignIn />,
  },
  {
    path: 'user/sign-up',
    element: <SignUp />,
  },
  {
    path: 'user/dashboard',
    element: <Dashboard />,
  },
  {
    path: 'user/settings',
    element: <Settings />,
  },
]);
