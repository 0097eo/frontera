import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AuthProvider from './providers/AuthProvider.jsx'
import CartProvider from './providers/CartProvider.jsx'
import WishlistProvider from './providers/WishListProvider.jsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <CartProvider>
        <QueryClientProvider client={queryClient}>
          <WishlistProvider>
            <App />
          </WishlistProvider>
        </QueryClientProvider>
      </CartProvider>
    </AuthProvider>
  </StrictMode>,
)
