import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import OrderDetails from '../src/components/OrderDetails';

describe('OrderDetails', () => {
    const mockOrderData = {
        id: '123',
        status: 'PENDING',
        created_at: '2023-01-01T12:00:00Z',
        total_price: '1000.00',
        items: [
            {
                id: 1,
                product_name: 'Test Product',
                quantity: 2,
                product_price: '500.00',
                subtotal: '1000.00'
            }
        ],
        shipping_address: '123 Test St',
        billing_address: '123 Test St'
    };

    beforeEach(() => {
        vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('fake-token');
        global.fetch = vi.fn();
    });

    it('shows loading state initially', () => {
        render(<OrderDetails orderId="123" onBack={() => {}} />);
        expect(screen.getByText('Loading order details...')).toBeInTheDocument();
    });

    it('fetches and displays order details', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockOrderData)
        });

        render(<OrderDetails orderId="123" onBack={() => {}} />);

        await waitFor(() => {
            expect(screen.getByText('Order #123')).toBeInTheDocument();
            expect(screen.getByTestId('order-status')).toHaveTextContent('PENDING');
            expect(screen.getByText('Test Product')).toBeInTheDocument();
        });
    });

    it('shows error when fetch fails', async () => {
        global.fetch.mockRejectedValueOnce(new Error('Fetch failed'));

        render(<OrderDetails orderId="123" onBack={() => {}} />);

        await waitFor(() => {
            expect(screen.getByText('Failed to load order details. Please try again later.')).toBeInTheDocument();
        });
    });

    it('shows error when no auth token', async () => {
        Storage.prototype.getItem.mockReturnValueOnce(null);

        render(<OrderDetails orderId="123" onBack={() => {}} />);

        await waitFor(() => {
            expect(screen.getByText('Authentication token not found. Please log in again.')).toBeInTheDocument();
        });
    });

    it('handles different order statuses correctly', async () => {
        const orderWithStatus = {
            ...mockOrderData,
            status: 'DELIVERED'
        };

        global.fetch.mockResolvedValueOnce({
            ok: true, 
            json: () => Promise.resolve(orderWithStatus)
        });

        render(<OrderDetails orderId="123" onBack={() => {}} />);

        await waitFor(() => {
            expect(screen.getByTestId('order-status')).toHaveTextContent('DELIVERED');
            expect(screen.getByText('Your order has been delivered successfully.')).toBeInTheDocument();
        });
    });
});