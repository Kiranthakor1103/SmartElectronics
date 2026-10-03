'use client';

import { Provider } from 'react-redux';
import { store } from './lib/redux/store';
import StoreHydration from './components/StoreHydration';
import StorePersistence from './components/StorePersistence';
import { ToastProvider } from './components/ToastProvider';

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ToastProvider>
        <StoreHydration />
        <StorePersistence />
        {children}
      </ToastProvider>
    </Provider>
  );
}
