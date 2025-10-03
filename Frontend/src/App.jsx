import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './storefront/store';
import { RouterProvider } from 'react-router-dom';
import { router as storefrontRouter } from './storefront/routes';
import { StoreProvider } from './storefront/contexts/StoreContext';
import { ThemeProvider } from './storefront/lib/theme.jsx';

export default function App(){
  console.log('[BOOT] App component rendering...');
  
  return (
    <ThemeProvider>
      <StoreProvider>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <RouterProvider router={storefrontRouter} />
          </PersistGate>
        </Provider>
      </StoreProvider>
    </ThemeProvider>
  );
}
