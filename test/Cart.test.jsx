import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CartPage from '../src/pages/Cart';
import useCart from '../src/hooks/useCart';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('../src/hooks/useCart');
vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
        promise: vi.fn()
    },
    Toaster: vi.fn()
}));

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => vi.fn()
    };
});

describe('CartPage', () => {
    const mockItems = [
        {
            id: 1,
            name: 'Test Item',
            price: 100,
            quantity: 1,
            image: 'test.jpg'
        }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        useCart.mockReturnValue({
            items: mockItems,
            total: 100,
            loading: false,
            removeItem: vi.fn(),
            updateQuantity: vi.fn(),
            clearCart: vi.fn()
        });
    });

    it('renders loading state', () => {
        useCart.mockReturnValueOnce({
            ...useCart(),
            loading: true
        });

        render(<CartPage />, { wrapper: MemoryRouter });
        expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('renders empty cart state', () => {
        useCart.mockReturnValueOnce({
            ...useCart(),
            items: []
        });

        render(<CartPage />, { wrapper: MemoryRouter });
        expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
        expect(screen.getByText('Continue Shopping')).toBeInTheDocument();
    });

    it('renders cart with items', () => {
        render(<CartPage />, { wrapper: MemoryRouter });
    
        const testItemElements = screen.getAllByText('Test Item');
        expect(testItemElements.length).toBeGreaterThan(0); 
        expect(testItemElements[0]).toBeInTheDocument(); 
        
        const testAmounts = screen.getAllByText('Ksh 100.00')
        expect(testAmounts.length).toBeGreaterThan(0)
        expect(testAmounts[0]).toBeInTheDocument();
    });

    it('handles quantity update', async () => {
        const { updateQuantity } = useCart();
        render(<CartPage />, { wrapper: MemoryRouter });

        const increaseButton = screen.getAllByText('+')[0];
        fireEvent.click(increaseButton);

        await waitFor(() => {
            expect(updateQuantity).toHaveBeenCalledWith(1, 2);
            expect(toast.success).toHaveBeenCalled();
        });
    });

    it('handles item removal', async () => {
        const { removeItem } = useCart();
        render(<CartPage />, { wrapper: MemoryRouter });

        const removeButtons = screen.getAllByRole('button', { name: /remove item/i });
        fireEvent.click(removeButtons[0]);

        await waitFor(() => {
            expect(removeItem).toHaveBeenCalledWith(1);
            expect(toast.success).toHaveBeenCalled();
        });
    });


    it('handles checkout process', async () => {
        render(<CartPage />, { wrapper: MemoryRouter });

        const checkoutButton = screen.getByText('Checkout');
        fireEvent.click(checkoutButton);

        expect(screen.getByText('Processing...')).toBeInTheDocument();
        
        await waitFor(() => {
            expect(toast.promise).toHaveBeenCalled();
        });
    });

    it('updates document title on mount', () => {
        render(<CartPage />, { wrapper: MemoryRouter });
        expect(document.title).toBe('Shopping Cart | Ideal Furniture & Decor');
    });
});