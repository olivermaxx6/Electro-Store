import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { RouterProvider } from 'react-router-dom';
import { store, persistor } from './store';
import { router } from './routes';
import ThemeProvider from './components/common/ThemeProvider';
import { StoreProvider } from './contexts/StoreContext';
import FaviconUpdater from './components/common/FaviconUpdater';
import UserInitializer from './components/auth/UserInitializer';
import '../index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <StoreProvider>
          <UserInitializer />
          <FaviconUpdater />
          <ThemeProvider>
            <RouterProvider router={router} />
          </ThemeProvider>
        </StoreProvider>
      </PersistGate>
    </Provider>
  </React.StrictMode>
);
