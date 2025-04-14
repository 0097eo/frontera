import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach  } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProductList from './Shop';
import { useProducts } from '../hooks/useProducts';

// Mock the dependencies
vi.mock('../hooks/useProducts');
vi.mock('../components/ProductCard', () => ({
    default: () => <div data-testid="product-card">Product Card</div>
}));
vi.mock('./error/404', () => ({
    default: () => <div data-testid="not-found">Not Found</div>
}));
vi.mock('./error/500', () => ({
    default: () => <div data-testid="error-500">Server Error</div>
}));

describe('ProductList', () => {
    const queryClient = new QueryClient();

    const renderWithProviders = (component) => {
        return render(
            <QueryClientProvider client={queryClient}>
                <BrowserRouter>
                    {component}
                </BrowserRouter>
            </QueryClientProvider>
        );
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders loading state', () => {
        useProducts.mockReturnValue({
            isPending: true,
            data: null,
            isError: false,
            error: null
        });

        renderWithProviders(<ProductList />);
        expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('renders products in grid view', async () => {
        const mockData = {
            results: [
                { id: 1, name: 'Test Product 1' },
                { id: 2, name: 'Test Product 2' }
            ],
            count: 2
        };

        useProducts.mockReturnValue({
            isPending: false,
            data: mockData,
            isError: false,
            error: null
        });

        renderWithProviders(<ProductList />);
        
        expect(screen.getAllByTestId('product-card')).toHaveLength(2);
    });

    it('handles server error', () => {
        useProducts.mockReturnValue({
            isPending: false,
            data: null,
            isError: true,
            error: { response: { status: 500 } }
        });

        renderWithProviders(<ProductList />);
        expect(screen.getByTestId('error-500')).toBeInTheDocument();
    });

    it('handles empty results', () => {
        useProducts.mockReturnValue({
            isPending: false,
            data: { results: [], count: 0 },
            isError: false,
            error: null
        });

        renderWithProviders(<ProductList />);
        expect(screen.getByTestId('not-found')).toBeInTheDocument();
    });

    it('toggles view mode between grid and list', () => {
        const mockData = {
            results: [{ id: 1, name: 'Test Product' }],
            count: 1
        };

        useProducts.mockReturnValue({
            isPending: false,
            data: mockData,
            isError: false,
            error: null
        });

        renderWithProviders(<ProductList />);
        
        const listViewButton = screen.getByTestId('list-view-button');
        fireEvent.click(listViewButton);
        
        expect(listViewButton).toHaveClass('bg-gray-100');
    });

    it('handles filter changes', async () => {
        const mockData = {
            results: [],
            count: 0
        };

        useProducts.mockReturnValue({
            isPending: false,
            data: mockData,
            isError: false,
            error: null
        });

        renderWithProviders(<ProductList />);
        
        const filterButton = screen.getByRole('button', { name: /filter/i });
        fireEvent.click(filterButton);

        const searchInput = screen.getByPlaceholderText(/search products/i);
        fireEvent.change(searchInput, { target: { value: 'test' } });

        const applyButton = screen.getByRole('button', { name: /apply filters/i });
        fireEvent.click(applyButton);

        await waitFor(() => {
            expect(useProducts).toHaveBeenCalledWith(1, expect.objectContaining({
                search: 'test'
            }));
        });
    });

    it('resets filters', () => {
        const mockData = {
            results: [],
            count: 0
        };

        useProducts.mockReturnValue({
            isPending: false,
            data: mockData,
            isError: false,
            error: null
        });

        renderWithProviders(<ProductList />);
        
        const filterButton = screen.getByRole('button', { name: /filter/i });
        fireEvent.click(filterButton);

        const resetButton = screen.getByRole('button', { name: /reset filters/i });
        fireEvent.click(resetButton);

        expect(screen.getByPlaceholderText(/search products/i).value).toBe('');
    });
});
