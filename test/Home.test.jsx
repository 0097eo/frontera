import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from '../src/pages/Home';
import { useProducts } from '../src/hooks/useProducts';

// Mock the dependencies
vi.mock('react-router-dom', () => ({
    useNavigate: () => vi.fn(),
    BrowserRouter: ({ children }) => <div>{children}</div>
}));

vi.mock('../src/hooks/useProducts');
vi.mock('../components/RoomInspirationSection', () => ({
    default: () => <div data-testid="room-inspiration">Room Inspiration Mock</div>
}));
vi.mock('../components/InstagramGallerySection', () => ({
    default: () => <div data-testid="instagram-gallery">Instagram Gallery Mock</div>
}));
vi.mock('../components/ProductCard', () => ({
    default: ({ product }) => <div data-testid={`product-${product.id}`}>Product Mock</div>
}));

describe('Home Component', () => {
    beforeEach(() => {
        // Reset all mocks before each test
        vi.clearAllMocks();
    });

    test('renders hero section with shop now button', () => {
        useProducts.mockReturnValue({ data: null, isLoading: false, error: null });
        render(<Home />, { wrapper: BrowserRouter });
        
        expect(screen.getByText('New Arrivals')).toBeInTheDocument();
        expect(screen.getByText('Discover Our New Collection')).toBeInTheDocument();
        expect(screen.getByText('Shop Now')).toBeInTheDocument();
    });

    test('renders browse range section with categories', () => {
        useProducts.mockReturnValue({ data: null, isLoading: false, error: null });
        render(<Home />, { wrapper: BrowserRouter });
        
        expect(screen.getByText('Browse The Range')).toBeInTheDocument();
        expect(screen.getByText('Dining')).toBeInTheDocument();
        expect(screen.getByText('Living')).toBeInTheDocument();
        expect(screen.getByText('Bedroom')).toBeInTheDocument();
    });

    test('displays loading state when fetching products', () => {
        useProducts.mockReturnValue({ data: null, isLoading: true, error: null });
        render(<Home />, { wrapper: BrowserRouter });
        
        expect(screen.getByText('Loading products...')).toBeInTheDocument();
    });

    test('displays error message when product fetch fails', () => {
        useProducts.mockReturnValue({ data: null, isLoading: false, error: 'Error fetching products' });
        render(<Home />, { wrapper: BrowserRouter });
        
        expect(screen.getByText('Error loading products. Please try again later.')).toBeInTheDocument();
    });

    // test('renders products when data is available', () => {
    //     const mockProducts = {
    //         results: [
    //             { id: 1, name: 'Product 1' },
    //             { id: 2, name: 'Product 2' }
    //         ]
    //     };
    //     useProducts.mockReturnValue({ data: mockProducts, isLoading: false, error: null });
    //     render(<Home />, { wrapper: BrowserRouter });
        
    //     expect(screen.getByTestId('product-1')).toBeInTheDocument();
    //     expect(screen.getByTestId('product-2')).toBeInTheDocument();
    // });

    test('renders room inspiration and instagram gallery sections', () => {
        useProducts.mockReturnValue({ data: null, isLoading: false, error: null });
        render(<Home />, { wrapper: BrowserRouter });
        
        expect(screen.getByTestId('room-inspiration')).toBeInTheDocument();
        expect(screen.getByTestId('instagram-gallery')).toBeInTheDocument();
    });
});