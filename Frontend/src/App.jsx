import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './storefront/store';
import { RouterProvider } from 'react-router-dom';
import { router as storefrontRouter } from './storefront/routes';

export default function App(){
  console.log('[BOOT] App component rendering...');
  
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <RouterProvider router={storefrontRouter} />
      </PersistGate>
    </Provider>
  );
}
