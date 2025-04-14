import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProductCard from '../src/components/ProductCard';

vi.mock('../src/hooks/useWishList', () => ({
    default: () => ({
        addToWishlist: vi.fn(),
        removeFromWishlist: vi.fn(),
        isInWishlist: () => false
    })
}));

describe('ProductCard', () => {
    const mockProduct = {
        id: 1,
        name: 'Test Product',
        image: '/test.jpg',
        price: 1000,
        category_name: 'Test Category',
        is_available: true,
        condition: 'NEW',
        on_sale: true,
        original_price: 1500
    };

    const renderProduct = (props = {}) => {
        return render(
            <BrowserRouter>
                <ProductCard product={{ ...mockProduct, ...props }} />
            </BrowserRouter>
        );
    };

    it('renders product information correctly', () => {
        renderProduct();
        expect(screen.getByText('Test Product')).toBeInTheDocument();
        expect(screen.getByText('Test Category')).toBeInTheDocument();
        expect(screen.getByText('Ksh 1,000')).toBeInTheDocument();
        expect(screen.getByText('Ksh 1,500')).toBeInTheDocument();
    });

    it('shows appropriate badges', () => {
        renderProduct();
        expect(screen.getByText('NEW')).toBeInTheDocument();
        expect(screen.getByText('SALE')).toBeInTheDocument();
    });

    it('shows SOLD badge when product is not available', () => {
        renderProduct({ is_available: false });
        expect(screen.getByText('SOLD')).toBeInTheDocument();
    });

    it('handles image error correctly', () => {
        renderProduct();
        const img = screen.getByAltText('Test Product');
        fireEvent.error(img);
        expect(img.src).toContain('/api/placeholder/300/225');
    });

    it('formats price correctly', () => {
        renderProduct({ price: 1234567 });
        expect(screen.getByText('Ksh 1,234,567')).toBeInTheDocument();
    });

    it('displays single price when no original price', () => {
        renderProduct({ original_price: null });
        expect(screen.getByText('Ksh 1,000')).toBeInTheDocument();
        expect(screen.queryByText('Ksh 1,500')).not.toBeInTheDocument();
    });
});