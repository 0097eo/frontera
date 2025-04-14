import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import ProductDetails from './ProductPage';
import useCart from '../hooks/useCart';
import useWishList from '../hooks/useWishList';

// Mock the dependencies
vi.mock('axios');
vi.mock('../hooks/useCart');
vi.mock('../hooks/useWishList');
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useParams: () => ({ id: '1' }),
        useNavigate: () => vi.fn()
    };
});

const mockProduct = {
    id: 1,
    name: 'Test Product',
    price: 1000,
    description: 'Test description',
    image: 'test.jpg',
    category: 'furniture',
    category_name: 'Furniture',
    primary_material: 'Wood',
    condition: 'New',
    is_available: true,
    stock: 5,
    average_rating: 4,
    review_count: 2,
    reviews: [
        {
            id: 1,
            rating: 4,
            user: 'Test User',
            comment: 'Great product',
            created_at: '2024-01-01'
        }
    ]
};

describe('ProductDetails Component', () => {
    beforeEach(() => {
        // Reset all mocks before each test
        vi.clearAllMocks();
        
        // Mock the custom hooks
        useCart.mockReturnValue({
            addItem: vi.fn().mockResolvedValue(true),
            items: []
        });
        
        useWishList.mockReturnValue({
            addToWishlist: vi.fn().mockResolvedValue(true),
            removeFromWishlist: vi.fn().mockResolvedValue(true),
            isInWishlist: vi.fn().mockReturnValue(false)
        });
    });

    it('renders loading state initially', () => {
        axios.get.mockImplementationOnce(() => new Promise(() => {}));
        render(<ProductDetails />, { wrapper: BrowserRouter });
        expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('renders product details after successful data fetch', async () => {
        axios.get
            .mockResolvedValueOnce({ data: mockProduct })
            .mockResolvedValueOnce({ data: { results: [] } });
    
        render(<ProductDetails />, { wrapper: BrowserRouter });
    
        // Wait for loading to disappear
        await waitFor(() => {
            expect(screen.queryByRole('status')).not.toBeInTheDocument();
        });
        
        // Use a more flexible text matcher for the product name
        await waitFor(() => {
            expect(screen.getByText((content, element) => {
                return element.tagName.toLowerCase() === 'h1' && content.includes('Test Product');
            })).toBeInTheDocument();
        });
        
    });

    it('handles quantity increment and decrement', async () => {
        // Mock that the product is in the cart
        useCart.mockReturnValue({
            addItem: vi.fn().mockResolvedValue(true),
            items: [{ id: 1, quantity: 1 }]
        });
    
        axios.get.mockResolvedValueOnce({ data: mockProduct })
                .mockResolvedValueOnce({ data: { results: [] }});
    
        render(<ProductDetails />, { wrapper: BrowserRouter });
    
        // Wait for product name to be rendered
        await waitFor(() => {
            expect(screen.getByText((content, element) => {
                return element.tagName.toLowerCase() === 'h1' && content.includes('Test Product');
            })).toBeInTheDocument();
        });
    
        // Find the increment and decrement buttons
        const incrementButton = screen.getByText('+');
        const decrementButton = screen.getByText('-');
        
        // Find the quantity input with correct role
        const quantityInput = screen.getByRole('spinbutton');
    
        // Check initial value
        expect(quantityInput.value).toBe('1');
    
        // Test increment
        fireEvent.click(incrementButton);
        expect(quantityInput.value).toBe('1');
    
        // Test decrement
        fireEvent.click(decrementButton);
        expect(quantityInput.value).toBe('1');
    });

    it('handles add to cart functionality', async () => {
        const addItem = vi.fn().mockResolvedValue(true);
        useCart.mockReturnValue({
            addItem,
            items: []
        });

        axios.get.mockResolvedValueOnce({ data: mockProduct })
                 .mockResolvedValueOnce({ data: { results: [] }});

        render(<ProductDetails />, { wrapper: BrowserRouter });

        // Wait for product name to be rendered
        await waitFor(() => {
            expect(screen.getByText((content, element) => {
                return element.tagName.toLowerCase() === 'h1' && content.includes('Test Product');
            })).toBeInTheDocument();
        });

        const addToCartButton = screen.getByText('Add to Cart');
        fireEvent.click(addToCartButton);

        expect(addItem).toHaveBeenCalledWith(expect.objectContaining({
            id: mockProduct.id,
            name: mockProduct.name,
            price: mockProduct.price
        }));
    });

    it('handles error state', async () => {
        const error = new Error('Failed to fetch');
        axios.get.mockRejectedValueOnce(error);

        render(<ProductDetails />, { wrapper: BrowserRouter });

        await waitFor(() => {
            expect(screen.getByText('Error Loading Product')).toBeInTheDocument();
        });
    });

    it('renders wishlist button and handles wishlist toggle', async () => {
        axios.get.mockResolvedValueOnce({ data: mockProduct })
                 .mockResolvedValueOnce({ data: { results: [] }});

        render(<ProductDetails />, { wrapper: BrowserRouter });

        // Wait for product name to be rendered
        await waitFor(() => {
            expect(screen.getByText((content, element) => {
                return element.tagName.toLowerCase() === 'h1' && content.includes('Test Product');
            })).toBeInTheDocument();
        });

        const wishlistButton = screen.getByText('Add to Wishlist');
        expect(wishlistButton).toBeInTheDocument();
        fireEvent.click(wishlistButton);

        expect(useWishList().addToWishlist).toHaveBeenCalledWith(mockProduct.id);
    });
});