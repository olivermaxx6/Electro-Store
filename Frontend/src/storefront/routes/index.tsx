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
import ServiceCategoryPage from '../pages/ServiceCategoryPage';
import About from '../pages/static/About';
import Contact from '../pages/static/Contact';
import Privacy from '../pages/static/Privacy';
import Terms from '../pages/static/Terms';
import Help from '../pages/static/Help';
import TrackOrder from '../pages/static/TrackOrder';
import Careers from '../pages/static/Careers';
import FindUs from '../pages/static/FindUs';
import ShippingInfo from '../pages/static/ShippingInfo';
import Returns from '../pages/static/Returns';
import Warranty from '../pages/static/Warranty';
import Support from '../pages/static/Support';
import NotFound from '../pages/NotFound';
import SignIn from '../pages/auth/SignIn';
import SignUp from '../pages/auth/SignUp';
import Dashboard from '../pages/user/Dashboard';
import Settings from '../pages/user/Settings';
import Categories from '../pages/Categories';
import AllSubcategories from '../pages/AllSubcategories';
import OrderConfirmation from '../pages/OrderConfirmation';
import Chat from '../pages/Chat';

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
        path: 'category',
        element: <Categories />,
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
        path: 'order-confirmation',
        element: <OrderConfirmation />,
      },
      {
        path: 'order-confirmation/:slug',
        element: <OrderConfirmation />,
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
        path: 'services/subcategory/:id',
        element: <ServiceCategoryPage />,
      },
      {
        path: 'services/:categoryName',
        element: <ServiceCategoryPage />,
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
        path: 'careers',
        element: <Careers />,
      },
      {
        path: 'findus',
        element: <FindUs />,
      },
      {
        path: 'shipping',
        element: <ShippingInfo />,
      },
      {
        path: 'returns',
        element: <Returns />,
      },
      {
        path: 'warranty',
        element: <Warranty />,
      },
      {
        path: 'support',
        element: <Support />,
      },
          {
            path: 'categories',
            element: <Categories />,
          },
          {
            path: 'allsubcategories',
            element: <AllSubcategories />,
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
  {
    path: 'chat/:roomId',
    element: <Chat />,
  },
]);
