import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import WishlistPage from '../src/pages/WishList';
import { useWishList } from '../src/hooks/useWishList';
import { useCart } from '../src/hooks/useCart';
import { toast } from 'sonner';

// Mock the hooks
vi.mock('../src/hooks/useWishList');
vi.mock('../src/hooks/useCart');
vi.mock('sonner');

// Mock image import
vi.mock('../src/assets/dresser.jpg', () => ({
    default: 'mock-image-path'
}));

describe('WishlistPage', () => {
    const mockWishlist = {
        products: [
            {
                id: 1,
                name: 'Test Product',
                price: 1000,
                description: 'Test description',
                stock: 5,
                image: 'test-image.jpg'
            }
        ]
    };

    beforeEach(() => {
        // Reset all mocks before each test
        vi.clearAllMocks();

        // Setup default mock implementations
        useWishList.mockReturnValue({
            wishlist: mockWishlist,
            loading: false,
            error: null,
            refreshWishlist: vi.fn(),
            removeFromWishlist: vi.fn(),
            clearWishlist: vi.fn()
        });

        useCart.mockReturnValue({
            addItem: vi.fn(),
            items: []
        });
    });

    it('renders loading state', () => {
        useWishList.mockReturnValue({
            wishlist: { products: [] },
            loading: true,
            error: null
        });
    
        render(
            <BrowserRouter>
                <WishlistPage />
            </BrowserRouter>
        );
    
        expect(screen.getByRole('img', { name: /furniture shop header/i })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Wishlist' })).toBeInTheDocument();
        // Check for loading spinner
        expect(screen.getByRole('status')).toBeInTheDocument(); 
    });

    it('renders error state', () => {
        const errorMessage = 'Failed to load wishlist';
        useWishList.mockReturnValue({
            wishlist: { products: [] },
            loading: false,
            error: errorMessage
        });

        render(
            <BrowserRouter>
                <WishlistPage />
            </BrowserRouter>
        );

        expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('renders empty wishlist state', () => {
        useWishList.mockReturnValue({
            wishlist: { products: [] },
            loading: false,
            error: null
        });

        render(
            <BrowserRouter>
                <WishlistPage />
            </BrowserRouter>
        );

        expect(screen.getByText('Your Wishlist is Empty')).toBeInTheDocument();
        expect(screen.getByText('Browse Products')).toBeInTheDocument();
    });

    it('renders wishlist with products', () => {
        render(
            <BrowserRouter>
                <WishlistPage />
            </BrowserRouter>
        );

        expect(screen.getByText('Test Product')).toBeInTheDocument();
        expect(screen.getByText('Ksh 1,000')).toBeInTheDocument();
        expect(screen.getByText('Test description')).toBeInTheDocument();
    });

    it('handles remove item from wishlist', async () => {
        const mockRemoveFromWishlist = vi.fn().mockResolvedValue();
        useWishList.mockReturnValue({
            wishlist: mockWishlist,
            loading: false,
            error: null,
            removeFromWishlist: mockRemoveFromWishlist
        });

        render(
            <BrowserRouter>
                <WishlistPage />
            </BrowserRouter>
        );

        const removeButton = screen.getByTestId('remove-button');
        await fireEvent.click(removeButton);

        expect(mockRemoveFromWishlist).toHaveBeenCalledWith(1);
        expect(toast.success).toHaveBeenCalled();
    });

    it('handles add to cart', () => {
        const mockAddItem = vi.fn();
        useCart.mockReturnValue({
            addItem: mockAddItem,
            items: []
        });

        render(
            <BrowserRouter>
                <WishlistPage />
            </BrowserRouter>
        );

        const addToCartButton = screen.getByRole('button', { name: /add to cart/i });
        fireEvent.click(addToCartButton);

        expect(mockAddItem).toHaveBeenCalledWith(mockWishlist.products[0]);
        expect(toast.success).toHaveBeenCalled();
    });

    it('prevents adding duplicate items to cart', () => {
        const mockAddItem = vi.fn();
        useCart.mockReturnValue({
            addItem: mockAddItem,
            items: [mockWishlist.products[0]]
        });

        render(
            <BrowserRouter>
                <WishlistPage />
            </BrowserRouter>
        );

        const addToCartButton = screen.getByRole('button', { name: /already in cart/i });
        fireEvent.click(addToCartButton);

        expect(mockAddItem).not.toHaveBeenCalled();
        expect(toast.info).toHaveBeenCalledWith('Product already in cart', expect.any(Object));
    });

    it('handles clear wishlist', async () => {
        const mockClearWishlist = vi.fn().mockResolvedValue();
        const mockRefreshWishlist = vi.fn();
        
        useWishList.mockReturnValue({
            wishlist: mockWishlist,
            loading: false,
            error: null,
            clearWishlist: mockClearWishlist,
            refreshWishlist: mockRefreshWishlist
        });

        render(
            <BrowserRouter>
                <WishlistPage />
            </BrowserRouter>
        );

        const clearButton = screen.getByRole('button', { name: /clear all/i });
        await fireEvent.click(clearButton);

        expect(mockClearWishlist).toHaveBeenCalled();
        expect(mockRefreshWishlist).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalledWith('Wishlist cleared successfully', expect.any(Object));
    });
});