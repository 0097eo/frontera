import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { toast } from 'sonner';
import OrderDetails from '../src/components/OrderDetails';

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

describe('OrderDetails', () => {
    const mockOrderData = {
        id: '123',
        status: 'PENDING',
        created_at: '2023-01-01T12:00:00Z',
        total_price: '1150.00',
        shipping_fee: '150.00',
        items: [
            {
                id: 1,
                product_name: 'Test Product',
                quantity: 2,
                product_price: '500.00',
                subtotal: '1000.00',
                product_image: 'image.jpg'
            }
        ],
        shipping_address: '123 Test St, Anytown, USA',
        billing_address: '123 Test St, Anytown, USA'
    };

    const renderComponent = (props) => {
      return render(
        <OrderDetails {...props} />, 
        { wrapper: MemoryRouter }
      );
    };

    beforeEach(() => {
        vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('fake-token');
        vi.stubGlobal('fetch', vi.fn());
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('shows loading state initially', () => {
        renderComponent({ orderId: "123", onBack: () => {} });
        expect(screen.getByText('Loading Order Details...')).toBeInTheDocument();
    });

    it('fetches and displays order details successfully', async () => {
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockOrderData)
        });

        renderComponent({ orderId: "123", onBack: () => {} });

        await waitFor(() => {
            expect(screen.getByText('Order #123')).toBeInTheDocument();
        });
        
        expect(screen.getByTestId('order-status')).toHaveTextContent('PENDING');
        expect(screen.getByText('Test Product')).toBeInTheDocument();
        expect(screen.getByText('KSh 1,150.00')).toBeInTheDocument();
    });

    it('shows an error message when the fetch request fails', async () => {
        vi.mocked(fetch).mockRejectedValueOnce(new Error('API is down'));

        renderComponent({ orderId: "123", onBack: () => {} });

        await waitFor(() => {
            expect(screen.getByText('Failed to load order details. Please try again later.')).toBeInTheDocument();
        });
    });

    it('shows error, calls toast, and attempts navigation when no auth token is found', async () => {
        Storage.prototype.getItem.mockReturnValue(null);

        renderComponent({ orderId: "123", onBack: () => {} });

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Authentication error. Please log in again.');
            expect(screen.getByText('Failed to load order details. Please try again later.')).toBeInTheDocument();
        });
    });

    it('handles "DELIVERED" order status correctly in the UI', async () => {
        const deliveredOrder = {
            ...mockOrderData,
            status: 'DELIVERED'
        };

        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true, 
            json: () => Promise.resolve(deliveredOrder)
        });

        renderComponent({ orderId: "123", onBack: () => {} });

        await waitFor(() => {
            expect(screen.getByTestId('order-status')).toHaveTextContent('DELIVERED');
        });

        const deliveredStepIcon = screen.getByText('Delivered').previousElementSibling;
        expect(deliveredStepIcon).toHaveClass('bg-amber-500');
    });

    it('handles "CANCELLED" order status correctly', async () => {
        const cancelledOrder = {
            ...mockOrderData,
            status: 'CANCELLED'
        };

        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true, 
            json: () => Promise.resolve(cancelledOrder)
        });

        renderComponent({ orderId: "123", onBack: () => {} });

        await waitFor(() => {
            expect(screen.getByText('Order Cancelled')).toBeInTheDocument();
            expect(screen.getByText('This order has been cancelled and will not be processed.')).toBeInTheDocument();
        });
    });
});